# React Native 核心原理

> **版本**: 1.0  
> **最后更新**: 2026-07-26  
> **适用对象**: React Native 进阶开发者、跨平台框架研究者

---

## 📑 目录

- [一、整体架构与线程模型](#一整体架构与线程模型)
- [二、旧架构：Bridge 机制](#二旧架构bridge-机制)
- [三、新架构：JSI](#三新架构jsi)
- [四、TurboModules](#四turbomodules)
- [五、Fabric 渲染器](#五fabric-渲染器)
- [六、Yoga 布局引擎](#六yoga-布局引擎)
- [七、渲染管线全流程](#七渲染管线全流程)
- [八、事件与手势系统](#八事件与手势系统)
- [九、Hermes 引擎](#九hermes-引擎)
- [十、Fast Refresh 热更新原理](#十fast-refresh-热更新原理)
- [十一、Bundle 与 CodePush 原理](#十一bundle-与-codepush-原理)
- [十二、帧预算与性能模型](#十二帧预算与性能模型)

---

## 一、整体架构与线程模型

### 1.1 三大核心线程

```
React Native 应用运行时由三个线程协作：

┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  JS Thread  │   │ Shadow/     │   │  UI Thread  │
│  (JS 线程)   │   │ Layout 线程  │   │  (主线程)    │
├─────────────┤   ├─────────────┤   ├─────────────┤
│ React 逻辑   │   │ Yoga 布局计算 │   │ 原生视图渲染  │
│ 业务代码     │   │ (Flexbox)    │   │ 手势/动画    │
│ Hermes/JSC  │   │ 独立后台线程  │   │ 屏幕合成     │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                 │
       └─────────────────┴─────────────────┘
              通过 Bridge / JSI 通信

关键认知：
- JS 线程运行业务逻辑（React 组件、状态）
- UI 线程（主线程）负责原生视图的绘制与交互
- 布局计算在独立的 Shadow 线程，避免阻塞 UI
- 三线程分离是 RN 性能与卡顿问题的根源
```

### 1.2 一次渲染的完整数据流

```
setState 触发
    ↓
[JS 线程] React Reconciler 协调，产出变更描述
    ↓
[JS 线程] 序列化为指令（旧架构 JSON / 新架构直接引用）
    ↓
[Shadow 线程] Yoga 根据 Flexbox 计算布局（x/y/w/h）
    ↓
[UI 线程] 创建/更新原生视图，应用布局与属性
    ↓
屏幕呈现

性能要点：
- 跨线程通信是最大开销（旧架构尤甚）
- 布局计算异步化，不阻塞 JS
- 原生动画在 UI 线程执行，不受 JS 卡顿影响
```

### 1.3 与 Flutter / Web 的架构对比

| 维度 | React Native | Flutter | Web React |
| ---- | ------------ | ------- | --------- |
| 渲染目标 | 原生控件 | 自绘（Skia） | DOM |
| 布局引擎 | Yoga（Flexbox） | 自研约束传递 | 浏览器排版 |
| JS/逻辑层 | Hermes + React | Dart VM | V8 + React |
| 跨层通信 | Bridge/JSI | 无（单语言） | 无 |
| UI 一致性 | 依赖原生控件 | 完全一致 | 依赖浏览器 |

---

## 二、旧架构：Bridge 机制

### 2.1 Bridge 工作原理

```
旧架构（0.68 之前默认）的通信模型：

JS 线程                     Native 端
   │                          │
   │  ① 调用原生方法            │
   │  ─────────────────→      │
   │  JSON 序列化              │
   │  [moduleID, methodID,    │
   │   params, callID]        │
   │                          │
   │     ② 放入异步队列          │
   │        (批量发送)          │
   │  ←─────────────────      │
   │  JSON 反序列化             │
   │                          │

特点：
├── 异步：所有通信都是异步的，无法同步获取结果
├── 序列化：数据需 JSON 序列化/反序列化（CPU 开销）
├── 批量：消息攒批后一次性过桥（减少通信次数）
└── 单向队列：消息排队处理，高峰期阻塞
```

### 2.2 Bridge 的性能瓶颈

```
瓶颈一：启动慢
- 启动时需初始化 Bridge + 加载全部原生模块
- 大量模块的注册信息要过桥传递

瓶颈二：序列化开销
- 大数据（如长列表、图片元数据）过桥需完整序列化
- JSON 解析消耗 CPU，产生内存抖动

瓶颈三：异步阻塞
- 无法同步调用原生（如读取设备信息要等回调）
- 高频通信（滚动事件）易造成队列积压

瓶颈四：内存占用
- 消息队列缓冲 + 序列化副本
- 长列表场景内存峰值高
```

### 2.3 为什么长列表在旧架构下卡顿

```
滚动事件流（旧架构）：

[UI 线程] 用户滚动
    ↓ 滚动事件序列化过桥（异步）
[JS 线程] 处理滚动逻辑，计算可见区域
    ↓ 渲染指令序列化过桥（异步）
[UI 线程] 创建新的 Cell 视图

问题：
- 一个来回至少两次跨线程 + 两次序列化
- 快速滚动时 JS 处理不过来 → 掉帧/白屏
- 这就是 FlatList 需要大量调优参数的原因
```

---

## 三、新架构：JSI

### 3.1 JSI 是什么

```
JSI（JavaScript Interface）是新架构的基石：

本质：
- 一套 C++ 编写的 API 层
- 让 JS 引擎直接持有 C++ 对象的引用
- 替代 JSON 序列化的 Bridge

┌──────────────┐
│  JS 代码      │
│  (Hermes)    │
└──────┬───────┘
       │ 直接持有 HostObject 引用（无序列化）
┌──────┴───────┐
│     JSI      │  ← C++ 接口层
└──────┬───────┘
       │
┌──────┴───────┐
│  Native 模块  │
│  (ObjC/Java) │
└──────────────┘

核心能力：
① 引擎无关：可对接 Hermes/JSC/V8（抽象 JS 引擎 API）
② 直接引用：JS 持有 C++ 对象引用，调用即执行
③ 同步调用：支持同步获取原生结果
④ 共享内存：大数据可共享内存，零拷贝
```

### 3.2 HostObject 与 HostFunction

```cpp
// JSI 核心抽象（C++ 侧）
class HostObject {
  // JS 读取属性时调用
  Value get(Runtime& rt, const PropNameID& name);
  // JS 设置属性时调用
  void set(Runtime& rt, const PropNameID& name, const Value& value);
};

// JS 侧使用（对开发者透明）
// global.__turboModuleProxy 就是一个 HostObject
const module = global.__turboModuleProxy('BatteryModule')
module.getLevel()  // 直接调用 C++ 方法，无序列化
```

### 3.3 JSI 带来的根本变化

| 维度 | 旧架构（Bridge） | 新架构（JSI） |
| ---- | ---------------- | ------------- |
| 通信方式 | JSON 序列化 | 直接引用 |
| 调用模式 | 仅异步 | 同步 + 异步 |
| 数据传递 | 拷贝 | 可共享内存 |
| 引擎绑定 | JSC/Hermes 各写一套 | 统一抽象层 |
| 启动性能 | 全量初始化 | 模块懒加载 |
| 内存效率 | 序列化副本多 | 显著降低 |

---

## 四、TurboModules

### 4.1 TurboModules 原理

```
TurboModules = 基于 JSI 的原生模块系统

旧架构模块加载：
应用启动 → 初始化所有原生模块 → 注册信息过桥
（无论是否使用，全部加载 → 启动慢）

新架构模块加载：
应用启动 → 仅注册代理（Proxy）
首次调用某模块 → 懒加载实例化该模块
（按需加载 → 启动快）

┌─────────────────────────────┐
│ JS: global.__turboModuleProxy │
└──────────┬──────────────────┘
           │ 首次访问时
┌──────────┴──────────────────┐
│  Module Registry（懒加载）     │
│  用到才实例化对应 Native 模块    │
└─────────────────────────────┘
```

### 4.2 Codegen 类型安全

```
新架构引入 Codegen（代码生成）保证类型安全：

① 开发者用 TypeScript/Flow 定义模块 Spec
② Codegen 在构建时生成 C++/ObjC/Java 胶水代码
③ 编译期校验 JS 与 Native 的接口一致性

// Spec 定义（TypeScript）
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport'
import * as TurboModuleRegistry from 'react-native/Libraries/TurboModule/TurboModuleRegistry'

export interface Spec extends TurboModule {
  getLevel(): Promise<number>
  multiply(a: number, b: number): number  // 支持同步方法
}

export default TurboModuleRegistry.getEnforcing<Spec>('BatteryModule')

价值：
- 接口不匹配在编译期暴露（旧架构是运行时崩溃）
- 自动生成桥接代码，减少手写错误
```

### 4.3 并发执行

```
TurboModules 支持在独立线程池执行：

旧架构：原生方法在特定模块队列串行执行
新架构：可配置并发执行，互不阻塞

// ObjC 侧声明并发
- (dispatch_queue_t)methodQueue {
  return dispatch_get_global_queue(QOS_CLASS_DEFAULT, 0);
}

效果：耗时原生操作（如文件 IO）不阻塞其他模块调用
```

---

## 五、Fabric 渲染器

### 5.1 Fabric 是什么

```
Fabric = 新架构的渲染系统（替代旧的 UIManager）

旧渲染流程（异步、单向）：
JS 创建 Shadow Tree → 序列化过桥 → Native 构建视图树
（JS 无法感知 Native 渲染结果，无法同步读取布局）

Fabric 渲染流程（同步、双向）：
JS 通过 JSI 直接操作 C++ Shadow Tree
    ↓
布局计算（Yoga，可同步）
    ↓
Diff 后提交到 Native 渲染
    ↓
Native 事件/布局可同步回传 JS

核心改进：
① 渲染指令直接通过 JSI 传递（无序列化）
② 支持同步布局查询（measure 即时返回）
③ 渲染事务原子化（减少中间态闪烁）
④ 与 React 并发特性（Concurrent）深度集成
```

### 5.2 Shadow Tree 与 Mounting

```
Fabric 的双树模型：

[JS 侧]                    [C++ 层]                [Native 侧]
React Fiber Tree    →     Shadow Tree      →      Mount Tree
(虚拟 DOM)                (Yoga 节点)             (原生视图)
                          布局计算在此             实际渲染在此

渲染事务（Transaction）：
① React 协调产出变更
② 在 Shadow Tree 上应用变更 + Yoga 布局
③ 计算 Mount 指令（create/update/delete）
④ 原子化提交到 Native（一帧内完成）

优势：
- 布局在 C++ 层完成，跨平台一致
- Mount 指令批量原子提交，避免半渲染状态
```

### 5.3 并发渲染集成

```
Fabric 支持 React 的并发特性：

- 渲染可中断：长列表渲染可分片（Time Slicing）
- 优先级调度：用户交互优先于后台更新
- 与 useTransition / Suspense 协同

实际效果：
- 复杂页面首屏渲染不卡死 UI 线程
- 滚动时低优先级更新自动让路
```

---

## 六、Yoga 布局引擎

### 6.1 Yoga 是什么

```
Yoga = Facebook 开源的跨平台 Flexbox 布局引擎（C++ 实现）

职责：
- 将 RN 的 Flexbox 样式计算为具体的 x/y/width/height
- 运行在 Shadow 线程，独立于 UI 渲染

为什么需要 Yoga：
- iOS（AutoLayout）和 Android（View 系统）布局模型不同
- Yoga 提供统一的 Flexbox 语义，两端结果一致
- C++ 实现，两端共享同一套计算逻辑
```

### 6.2 RN Flexbox 与 Web CSS 的差异

```
差异一：默认主轴方向
- Web CSS：flex-direction 默认 row
- RN Yoga：flex-direction 默认 column ⚠️

差异二：flex 语义
- Web：flex: 1 1 0%（可伸可缩）
- RN：flex: 1 等价于 flexGrow:1 + flexShrink:1 + flexBasis:0

差异三：不支持的特性
- 无 CSS 级联/继承（样式必须显式声明）
- 无 display: inline / grid
- 无百分比 margin/padding 的部分场景
- position 仅 relative / absolute

差异四：绝对定位
- RN 的 absolute 必须配合 top/left/right/bottom
- 不支持 Web 的复杂定位组合
```

### 6.3 布局计算流程

```
① JS 侧样式（StyleSheet）序列化为 Yoga 节点属性
② Shadow 线程调用 Yoga 递归计算
③ 产出每个节点的布局结果：
   { left, top, width, height }
④ 布局结果传递给 UI 线程应用

性能注意：
- 布局计算复杂度与节点数相关
- 深层嵌套 / 大量 flex 计算会拖慢 Shadow 线程
- 固定尺寸 > 弹性计算（提供 getItemLayout 的意义）
```

---

## 七、渲染管线全流程

### 7.1 首帧渲染全链路

```
应用启动到首帧呈现：

① Native 启动
   - Android：Activity 创建 → 加载 ReactInstanceManager
   - iOS：AppDelegate → 加载 RCTBridge/JSI Runtime

② JS Bundle 加载
   - 读取 bundle（磁盘/内存）
   - Hermes 执行字节码（预编译，快）

③ React 首次渲染
   - 执行 App 组件树
   - Reconciler 构建 Fiber Tree

④ 布局计算
   - Shadow 线程 Yoga 计算

⑤ 原生视图挂载
   - UI 线程创建原生视图
   - 应用布局/样式/属性

⑥ 屏幕合成
   - 系统合成器（SurfaceFlinger/Core Animation）
   - 首帧上屏

优化点：
- Hermes 预编译字节码（减少解析时间）
- 减少首屏组件数量
- 延迟加载非首屏模块
```

### 7.2 更新渲染流程

```
setState 后的更新链路（新架构）：

[JS 线程]
  setState → React 协调 → 产出变更
      ↓ (JSI 直接传递，无序列化)
[C++ Shadow 层]
  更新 Shadow Tree → Yoga 重新布局 → 生成 Mount 指令
      ↓
[UI 线程]
  应用 Mount 指令 → 原生视图更新
      ↓
  下一帧上屏

关键：整个链路要在一帧（16.6ms）内完成才不掉帧
```

---

## 八、事件与手势系统

### 8.1 触摸事件流转

```
触摸事件传递（自底向上）：

[UI 线程] 用户触摸屏幕
    ↓ 原生手势系统捕获（iOS UIGestureRecognizer / Android MotionEvent）
[UI 线程] 命中测试（Hit Testing）找到目标视图
    ↓ 事件序列化，通过 Bridge/JSI 传递
[JS 线程] 转换为 React 合成事件
    ↓ 触发 onPress / onTouchStart 等回调
[JS 线程] 执行业务逻辑

问题：
- 事件过桥有延迟（旧架构明显）
- JS 线程繁忙时事件响应滞后
- 这就是为什么复杂手势要用原生驱动
```

### 8.2 手势冲突与协商

```
RN 事件系统与原生手势的协商：

iOS：
- RN 事件通过自定义 Responder 系统分发
- 与 ScrollView 的原生手势存在竞争
- gesture-handler 库通过重写手势协商逻辑解决

Android：
- 触摸事件经 ViewGroup 分发链
- RN 拦截并转换为 JS 事件

Responder 系统（RN 内置）：
- onStartShouldSetResponder：是否成为响应者
- onResponderGrant/Move/Release：手势生命周期
- 多个视图通过"协商"确定唯一响应者
```

### 8.3 为什么手势库要用原生驱动

```
react-native-gesture-handler 的原理：

普通 RN 手势：
触摸 → 过桥到 JS → JS 计算 → 过桥回 Native 更新
（两次过桥，延迟高，JS 卡顿时手势冻结）

gesture-handler + Reanimated：
触摸 → 原生层直接处理 → 直接更新视图 transform
（手势逻辑在 UI 线程执行，零过桥）

实现方式：
- 手势状态用 SharedValue 存储在原生层
- useAnimatedGestureHandler 编译为原生执行的工作单元
- 视图更新不经过 JS 线程

效果：即使 JS 线程完全卡死，手势动画依然流畅
```

---

## 九、Hermes 引擎

### 9.1 Hermes 是什么

```
Hermes = Meta 为 React Native 定制的 JavaScript 引擎

设计目标：
- 优化移动端场景（而非通用 Web）
- 重点优化：启动时间、内存占用、包体积

工作流程：
开发时：
  JS 源码 → Hermes 编译器 → 字节码（.hbc）
  （构建期预编译，随 App 打包）

运行时：
  直接执行字节码（跳过解析+编译步骤）
  → 启动显著加快

对比 JSC（JavaScriptCore）：
- JSC：运行时解析 + JIT 编译（启动慢，峰值性能高）
- Hermes：预编译字节码 + 解释执行（启动快，内存低）
```

### 9.2 Hermes 的性能优势

| 指标 | JSC | Hermes | 改善 |
| ---- | --- | ------ | ---- |
| 启动时间（TTI） | 基准 | -30%~50% | 显著 |
| 内存占用 | 基准 | -20%~30% | 明显 |
| 包体积 | 基准 | 略增（字节码） | - |
| 峰值吞吐 | 高（JIT） | 中 | 移动场景够用 |

```
为什么移动端不需要激进 JIT：
- 移动 App 代码路径相对固定（不像 Web 页面多变）
- JIT 编译本身消耗内存和电量
- 启动速度对移动体验更重要
- Hermes 用"预编译"换"运行时开销"，符合移动场景
```

### 9.3 Hermes 调试

```
Hermes 支持 Chrome DevTools Protocol：

① 应用连接 Metro
② 打开 chrome://inspect
③ 通过 CDP 协议调试 Hermes 中的 JS

特性：
- 断点、单步、变量查看
- 性能 Profiler（采样式，低开销）
- 内存快照

注意：
- Hermes 的 Profiler 是采样式，不影响性能
- 可精确分析 JS 线程热点函数
```

---

## 十、Fast Refresh 热更新原理

### 10.1 Fast Refresh 工作流

```
Fast Refresh = RN 的模块热替换（HMR 演进版）

开发时修改代码：
① Metro 监听文件变化
② 增量编译变更模块
③ 通过 WebSocket 推送更新到设备
④ RN 运行时替换变更模块
⑤ 保留组件状态（若可保留）

状态保留规则：
- 函数组件 + Hooks：状态保留 ✅
- 类组件：状态保留 ✅
- 修改了组件外的模块级变量：可能重置
- 语法错误：回退到全量刷新

与 Web HMR 的差异：
- RN 没有 DOM，替换的是组件注册表
- 通过 React Refresh 算法保留 Hooks 状态
```

### 10.2 React Refresh 状态保留原理

```
React Refresh（Fast Refresh 的 React 层实现）：

① 为每个组件生成稳定的"签名"（基于 Hooks 调用序列）
② 模块更新时，比对新旧组件签名
③ 签名一致 → 复用 Fiber 节点 → 状态保留
④ 签名变化（Hooks 顺序变了）→ 重新挂载

示例：
// 修改前
function Counter() {
  const [count, setCount] = useState(0)  // Hook #1
  ...
}
// 修改后（仅改 JSX，Hooks 不变）→ 状态保留 ✅

// 若增加/删除 Hook → 签名变化 → 状态重置
```

---

## 十一、Bundle 与 CodePush 原理

### 11.1 Bundle 构建流程

```
Metro 打包器工作流程：

① 依赖图构建
   从 index.js 出发，递归解析 import/require
   构建完整的模块依赖图

② 转换
   每个模块经 Babel 转换（JSX/TS/新语法）
   Hermes 预编译为字节码（可选）

③ 打包
   所有模块合并为单个 bundle.js
   附带模块注册表（moduleId → 代码）

④ 优化
   - 内联 require
   - 移除开发代码（__DEV__ 判断）
   - 压缩（生产环境）

产物：
- index.android.bundle / main.jsbundle
- 随 App 一起打包进安装包
```

### 11.2 CodePush 热更新原理

```
CodePush = 绕过应用商店的 JS Bundle 动态下发

更新流程：
① 开发者发布新 bundle 到 CodePush 服务器
② App 启动时检查更新（对比 bundle 版本哈希）
③ 下载差量包（diff patch，非全量）
④ 解压并替换本地 bundle
⑤ 按策略生效：
   - IMMEDIATE：立即重启生效
   - ON_NEXT_RESTART：下次启动生效
   - ON_NEXT_RESUME：下次回前台生效

为什么能绕过审核：
- 只更新 JS Bundle（逻辑层），不动原生代码
- 平台政策允许"不改变原生功能"的动态更新
- ⚠️ 不能通过热更新引入新的原生模块/权限

差量更新原理：
- 服务端对比新旧 bundle 生成 diff
- 客户端下载 diff 后本地合并
- 大幅减少下载体积
```

### 11.3 热更新的边界与风险

```
能做：
✅ 修复 JS 逻辑 Bug
✅ 更新 UI 布局/样式
✅ 调整业务流程

不能做：
❌ 新增/修改原生模块
❌ 修改权限声明
❌ 更新需要 Codegen 的接口

风险与对策：
- 更新包损坏 → 回滚机制（标记失败自动回退）
- 版本不兼容 → 严格绑定原生版本号
- 灰度发布 → 先小流量验证再全量
```

---

## 十二、帧预算与性能模型

### 12.1 帧预算分配

```
60 FPS 下每帧预算 16.6ms，需在三个线程间分配：

[JS 线程]     [Shadow 线程]    [UI 线程]
React 协调 →   Yoga 布局   →   渲染合成
~6-8ms         ~2-4ms          ~6-8ms

掉帧原因：
① JS 线程超时：复杂计算/大量 setState/序列化
② Shadow 线程超时：深层布局/大量节点
③ UI 线程超时：过度绘制/复杂原生视图

诊断方法：
- Performance Monitor 区分 JS FPS 和 UI FPS
- JS FPS 低 → JS 线程问题
- UI FPS 低 → 渲染/布局问题
```

### 12.2 常见性能问题归因

| 现象 | 根因 | 解法 |
| ---- | ---- | ---- |
| 滚动卡顿 | 列表未虚拟化/JS 繁忙 | FlatList 调优 + memo |
| 启动慢 | 全量模块加载/Bundle 大 | Hermes + 懒加载 + 分包 |
| 动画掉帧 | 动画过 JS 线程 | useNativeDriver / Reanimated |
| 内存飙升 | 图片未压缩/列表未回收 | FastImage + 虚拟化 |
| 交互延迟 | 事件过桥延迟 | 新架构 / 原生手势 |
| 首屏白屏 | Bundle 加载慢 | Hermes 字节码 + 骨架屏 |

### 12.3 性能优化决策树

```
性能问题定位流程：

① 开启 Performance Monitor
   ├─ JS FPS 低 → JS 线程瓶颈
   │   ├─ Profiler 找热点组件 → memo/useMemo
   │   ├─ 减少 setState 频率 → 合并更新
   │   └─ 重计算移出渲染 → 异步/缓存
   │
   ├─ UI FPS 低 → 渲染瓶颈
   │   ├─ 动画 → useNativeDriver
   │   ├─ 过度绘制 → 减少层级/不透明背景
   │   └─ 布局 → 简化嵌套/固定尺寸
   │
   └─ 两者都低 → 架构问题
       ├─ 升级新架构（JSI/Fabric）
       └─ 启用 Hermes
```

---

## 📎 参考资源

- [React Native 新架构官方文档](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [JSI 官方说明](https://reactnative.dev/architecture/glossary#javascript-interfaces-jsi)
- [Yoga 布局引擎](https://www.yogalayout.dev/)
- [Hermes 引擎](https://hermesengine.dev/)
- [React Native 渲染流程详解（官方架构图）](https://reactnative.dev/architecture/render-pipeline)
