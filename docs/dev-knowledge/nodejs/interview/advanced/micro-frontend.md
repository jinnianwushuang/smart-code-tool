---
title: '微前端方案对比 [P8]'
level: 'architect'
tags: ['微前端', 'Module Federation', 'qiankun', 'WASM']
difficulty: 'hard'
target: '架构师（P8）'
---

# 微前端方案对比 [P8]

> 微前端是将多个前端应用组合成一个统一用户体验的架构模式。2026 年，Module Federation V2 稳定版发布，解耦了对 Webpack 的依赖，成为大型组织微前端的事实标准。

## 核心概念（What）

### 微前端方案全景

```
微前端方案演进：
├── iframe（最原始，完全隔离）
├── Web Components（浏览器原生）
├── qiankun / single-spa（JS 沙箱隔离）
├── Module Federation（构建时集成）
└── Module Federation V2（去中心化，支持 Vite/Rspack 等多打包器）
```

---

## 底层原理（Why）

### 1. Module Federation 的运行时模块解析协议

Module Federation 的底层不是「配置 remote」，而是一个**运行时模块联邦解析协议**，实现跨应用的模块懒加载和依赖共享。

```
Module Federation 运行时解析流程：

  加载阶段：
    1. 宿主应用启动时加载 remoteEntry.js
       ├── remoteEntry.js 是远程应用的入口文件（构建时生成）
       ├── 它注册一个全局变量：window.app1（模块容器）
       └── 容器包含：get(module) 和 init(shared) 两个方法

    2. 依赖协商（init 阶段）：
       ├── 宿主调用 remote.init(sharedScope)
       ├── sharedScope 包含宿主已有的共享依赖及版本
       ├── 远程应用检查版本是否满足 requiredVersion
       │   ├── 满足 → 使用宿主的共享实例（单例）
       │   └── 不满足 → 加载自己的副本（回退）
       └── 版本匹配算法：语义化版本范围匹配（^19.0.0）

    3. 模块获取（get 阶段）：
       ├── 宿主 import('./Button') → 解析为 remote.get('./Button')
       ├── remote.get 返回一个 Promise<Factory>
       ├── 调用 Factory() 得到模块导出
       └── 底层实现：远程 chunk 通过 <script> 标签动态加载

  共享依赖的单例保证：
    ├── 共享依赖（如 React）必须全局只有一个实例
    ├── 如果多个应用使用不同版本的 React → Hooks 崩溃
    ├── 通过 singleton: true 强制单例
    └── 版本不兼容时回退到独立副本（警告但不崩溃）
```

### 2. JS 沙箱的三层隔离模型

微前端的 JS 沙箱不是「Proxy 拦截 window」，而是**三层递进的隔离模型**，每层解决不同的污染问题。

```
JS 沙箱三层隔离模型：

  Layer 1: 快照沙箱（SnapshotSandbox）
    ├── 原理：应用激活时记录 window 快照，停用后恢复
    ├── 实现：
    │   ├── 激活：遍历 window 属性，存入 Map
    │   ├── 停用：对比当前 window 和快照，还原差异
    │   └── 新属性：删除子应用添加的全局变量
    ├── 优点：简单，兼容性好
    └── 缺点：不支持多实例（同一时刻只能一个子应用）

  Layer 2: Proxy 沙箱（ProxySandbox）
    ├── 原理：用 Proxy 创建 fakeWindow，拦截所有全局变量访问
    ├── 实现：
    │   ├── get: 先查 fakeWindow，没有则查真实 window
    │   ├── set: 写入 fakeWindow（不污染真实 window）
    │   └── has: 拦截 'in' 操作符（让子应用以为全局变量存在）
    ├── 支持多实例（每个子应用独立的 fakeWindow）
    └── 逃逸问题：
        ├── 直接访问 globalThis 仍指向真实 window
        ├── eval / new Function 可绕过 Proxy
        └── 解决方案：严格模式 + 禁用 eval

  Layer 3: 模块沙箱（ESM Sandbox）
    ├── 原理：利用 ES Module 的严格作用域
    ├── 每个子应用打包为 ESM 模块，变量不会泄漏到全局
    ├── 通过 importmap 控制模块解析路径
    └── 最安全但限制最多（需要子应用配合改造）
```

### 3. 样式隔离的四种策略与性能对比

微前端的样式隔离不是「加 Shadow DOM」，而是**四种不同级别的策略**，各有性能和兼容性取舍。

```
样式隔离策略：

  策略 1: Shadow DOM（浏览器原生）
    ├── 原理：Web Components 的 Shadow Root 完全隔离外部 CSS
    ├── 优点：完全隔离，零运行时开销
    ├── 缺点：
    │   ├── 弹窗/Tooltip 无法超出 Shadow Root（定位问题）
    │   ├── 全局样式（如 Ant Design 主题）无法注入
    │   └── 部分 CSS 选择器无法穿透
    └── 适用：iframe 替代方案，独立组件

  策略 2: CSS Modules / Scoped CSS（构建时）
    ├── 原理：类名哈希化（.btn → .btn_abc123）
    ├── 优点：零运行时开销，构建时完成
    ├── 缺点：只能隔离类名，不能隔离全局样式和标签选择器
    └── 适用：同技术栈微前端

  策略 3: CSS 命名空间（运行时前缀）
    ├── 原理：子应用所有类名自动加前缀（.app1-btn）
    ├── 实现：PostCSS 插件自动添加命名空间前缀
    ├── 优点：简单，兼容性好
    └── 缺点：运行时开销（样式转换）

  策略 4: 运行时 CSS 隔离（qiankun 的 experimentalStyleIsolation）
    ├── 原理：子应用挂载时，给所有 CSS 规则加选择器前缀
    ├── 实现：
    │   ├── 解析子应用的 <style> 和 <link>
    │   ├── 给每条规则加 [data-qiankun="app1"] 前缀
    │   └── 插入到主文档的 <head> 中
    └── 缺点：运行时解析开销，动态插入的样式可能遗漏
```

---

## 高频面试题

### Q1: 微前端的核心挑战是什么？

**参考答案要点**：

- JS 沙箱隔离：防止全局变量污染
- CSS 隔离：防止样式冲突
- 应用间通信：状态共享和事件传递
- 依赖管理：共享依赖避免重复加载
- 路由协调：主应用和子应用的路由同步

### Q2: Module Federation 和 qiankun 如何选择？

**参考答案要点**：

- Module Federation：同技术栈、追求性能、构建时集成
- qiankun：跨技术栈、需要隔离、运行时集成
- Module Federation 性能更好但隔离性弱
- qiankun 隔离性更好但性能开销大

### Q3: 如何设计微前端的通信机制？

**参考答案要点**：

- 全局事件总线（EventBus）
- 共享状态（Redux/Zustand 实例）
- URL 参数传递
- CustomEvent + window
- Module Federation 的 shared 机制

---

## 延伸思考

1. **设计题**：设计一个支持 10+ 子应用的微前端架构。
2. **场景题**：微前端应用中如何处理共享状态和登录态？
3. **对比题**：Module Federation V2 vs single-spa vs iframe，各自的适用场景？

---

## 参考资料

- [Module Federation 文档](https://module-federation.io)
- [qiankun 文档](https://qiankun.umijs.org)
- [微前端架构设计](https://micro-frontends.org)
