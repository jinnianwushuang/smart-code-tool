# 手机 APP 启动到屏幕显示全过程与渲染原理

> **定位**: 零散思考文档  
> **最后更新**: 2026-07-26  
> **核心观点**: 从手指触碰图标到像素点亮，涉及硬件中断、进程创建、图形管线、显示刷新四大体系的协作。理解全链路是性能优化的前提。

---

## 📑 目录

- [一、全景概览：一次点击的完整旅程](#一全景概览一次点击的完整旅程)
- [二、屏幕硬件：像素如何被点亮](#二屏幕硬件像素如何被点亮)
- [三、Android 启动全链路](#三android-启动全链路)
- [四、iOS 启动全链路](#四ios-启动全链路)
- [五、图形渲染管线](#五图形渲染管线)
- [六、VSync 与帧调度](#六vsync-与帧调度)
- [七、缓冲机制与画面提交](#七缓冲机制与画面提交)
- [八、卡顿的本质与度量](#八卡顿的本质与度量)
- [九、启动优化方法论](#九启动优化方法论)
- [十、Flutter 视角的对照](#十flutter-视角的对照)

---

## 一、全景概览：一次点击的完整旅程

### 1.1 端到端时间线

```
手指触碰屏幕图标
    ↓ ~1-4ms
① 触摸硬件采样（触摸控制器中断）
    ↓ ~1-8ms
② 输入事件分发（InputDispatcher → 应用进程）
    ↓ ~50-500ms
③ 应用进程创建（如未驻留内存）
    ↓ ~100-2000ms
④ 应用初始化（Application/AppDelegate → 首帧构建）
    ↓ ~8-16ms
⑤ 首帧渲染（CPU 构建显示列表 → GPU 光栅化）
    ↓ ~8-16ms
⑥ 帧提交与显示（Buffer 交换 → 屏幕刷新）
    ↓
用户看到画面（总耗时：冷启动 1-3s，热启动 100-500ms）
```

### 1.2 参与角色一览

| 角色 | Android | iOS | 职责 |
| ---- | ------- | --- | ---- |
| 桌面/启动器 | Launcher | SpringBoard | 捕获点击，发起启动请求 |
| 进程管理器 | ActivityManagerService | launchd | 创建/管理应用进程 |
| 进程孵化器 | Zygote（fork） | posix_spawn | 快速创建进程 |
| 动态链接器 | linker64 | dyld4 | 加载 .so / dylib |
| 窗口管理器 | WindowManagerService | UIWindow + CoreAnimation | 窗口创建与合成 |
| 图形引擎 | Skia / Vulkan | CoreGraphics / Metal | 绘制与光栅化 |
| 合成器 | SurfaceFlinger | backboardd + CA | 多图层合成送显 |
| 显示驱动 | HWC (Hardware Composer) | Display Driver | 驱动面板刷新 |

---

## 二、屏幕硬件：像素如何被点亮

### 2.1 显示面板工作原理

```
LCD（液晶显示）：
┌─────────────────────────────┐
│ 背光层（LED 常亮）            │
│   ↓ 白光                     │
│ 液晶层（电压控制偏转角度）     │  ← 每个像素是一个"光阀门"
│   ↓ 过滤后的光               │
│ 彩色滤光片（RGB 子像素）       │
│   ↓                          │
│ 人眼看到颜色                  │
└─────────────────────────────┘
特点：液晶偏转需要时间 → 响应延迟 5-25ms

OLED（有机发光二极管）：
┌─────────────────────────────┐
│ 每个子像素独立发光             │  ← 无需背光，自发光
│ 电流大小 → 亮度               │
│ 关闭 = 纯黑（像素完全不发光）   │
└─────────────────────────────┘
特点：响应 <1ms，对比度无限，但低亮度可能 PWM 频闪
```

### 2.2 刷新率与帧的关系

```
刷新率（Refresh Rate）：屏幕每秒重绘画面的次数
├── 60Hz → 每 16.67ms 刷新一帧
├── 90Hz → 每 11.11ms
├── 120Hz → 每 8.33ms
└── LTPO 自适应：1-120Hz 动态调节（省电）

关键认知：
- 屏幕刷新是固定节奏的"火车"，不管 GPU 画没画完
- GPU 产出一帧 = "赶上一班火车"
- 没赶上 → 屏幕重复显示上一帧（视觉上就是卡顿）

时间预算：
60Hz:  CPU(构建) + GPU(光栅化) ≤ 16.67ms
120Hz: CPU(构建) + GPU(光栅化) ≤ 8.33ms
```

### 2.3 触摸采样链路

```
手指触碰
    ↓
触摸控制器（独立芯片/集成于面板）
    ↓ 以 120-240Hz 采样触摸坐标（高于屏幕刷新率）
中断信号 → SoC
    ↓
内核输入子系统（/dev/input/eventX）
    ↓
Android: InputReader → InputDispatcher → ViewRootImpl
iOS: IOKit → backboardd → UIApplication 事件队列
    ↓
应用主线程处理触摸事件
```

---

## 三、Android 启动全链路

### 3.1 冷启动完整流程

```
┌─ 用户点击图标 ─────────────────────────────────────────┐
│                                                         │
│ ① Launcher 捕获点击                                     │
│    → startActivity(Intent) 发送给 AMS                   │
│                                                         │
│ ② ActivityManagerService (system_server 进程)           │
│    → 检查目标进程是否存在                                 │
│    → 不存在：请求 Zygote 孵化新进程                       │
│                                                         │
│ ③ Zygote fork 子进程                                    │
│    → Zygote 预加载了 framework 类库（ART 运行时就绪）      │
│    → fork 后子进程继承预加载内容（COW 写时复制）           │
│    → 耗时 ~30-80ms（远快于从零创建）                      │
│                                                         │
│ ④ 新进程执行 ActivityThread.main()                      │
│    → 创建主线程 Looper                                   │
│    → 创建 Application 实例 → onCreate()  ← 开发者代码①   │
│    → 注册 AMS Binder 通道                                │
│                                                         │
│ ⑤ AMS 回调：启动 Activity                               │
│    → Instrumentation.newActivity() 实例化                │
│    → 创建 PhoneWindow（Window 实现类）                    │
│    → Activity.attach() 绑定 Window                       │
│    → onCreate() → setContentView()  ← 开发者代码②        │
│      └── 布局 inflate：XML → View 对象树                  │
│    → onStart() → onResume()                              │
│                                                         │
│ ⑥ ViewRootImpl 接管绘制                                  │
│    → WindowManagerService 分配 Surface                   │
│    → performTraversals(): measure → layout → draw        │
│    → 绘制指令提交 GPU → SurfaceFlinger 合成 → 上屏         │
│                                                         │
│ ⑦ AMS 收到首帧完成通知                                    │
│    → 移除启动预览窗口（Splash Screen）                     │
│    → 用户看到应用真实界面                                  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 各阶段耗时拆解（典型值）

| 阶段 | 耗时 | 开发者可控度 |
| ---- | ---- | ------------ |
| Zygote fork + 进程初始化 | 30-80ms | 低 |
| Application.onCreate() | 100-1000ms+ | **高**（重灾区） |
| Activity 创建 + inflate | 50-300ms | 高 |
| measure/layout/draw 首帧 | 16-100ms | 中 |
| GPU 光栅化 + 合成 | 8-32ms | 低 |

### 3.3 Application 初始化陷阱

```java
// ❌ 典型反模式：Application 中同步初始化一切
public class MyApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        // 每个 SDK 都在抢主线程时间片
        AnalyticsSDK.init(this);       // 200ms
        PushSDK.init(this);            // 150ms
        CrashSDK.init(this);           // 80ms
        ImageLoader.init(this);        // 120ms
        DBMigration.check(this);       // 300ms（磁盘 I/O!）
        // 累计 850ms+ 全部阻塞首帧
    }
}

// ✅ 优化策略：分级延迟初始化
// 第一级（必须同步）：崩溃监控
// 第二级（首帧后 Idle）：统计、推送
// 第三级（首次使用时）：图片库、数据库
```

### 3.4 布局 Inflate 原理

```
setContentView(R.layout.activity_main)
    ↓
LayoutInflater.inflate()
    ↓
XmlPullParser 逐标签解析 XML
    ↓
反射创建 View 实例（Constructor.newInstance）  ← 反射开销
    ↓
递归构建子 View → 生成 View 树
    ↓
addContentView → DecorView → Window

性能瓶颈：
1. XML 解析：I/O + 解析（~ms/标签）
2. 反射实例化：比直接 new 慢 3-10 倍
3. 嵌套过深：measure 阶段指数级递归

优化手段：
- ViewStub：延迟 inflate 不可见区域
- merge 标签：减少层级
- AsyncLayoutInflater：子线程 inflate
- Compose：跳过 XML，编译期生成布局代码
```

### 3.5 View 绘制三阶段

```
ViewRootImpl.performTraversals()
    ↓
① performMeasure()
    从 DecorView 向下递归 measure()
    父 View 传递 MeasureSpec（模式+尺寸）：
    ├── EXACTLY：精确值（match_parent / 100dp）
    ├── AT_MOST：上限约束（wrap_content）
    └── UNSPECIFIED：无限制（ScrollView 内部）
    子 View 计算自身尺寸 → setMeasuredDimension()
    ↓
② performLayout()
    从 DecorView 向下递归 layout()
    确定每个 View 相对于父容器的位置（left/top/right/bottom）
    ↓
③ performDraw()
    draw() 递归：
    ├── 绘制背景 drawBackground()
    ├── 绘制自身 onDraw(Canvas)  ← 开发者代码
    ├── 绘制子 View dispatchDraw()
    └── 绘制前景/滚动条
    Canvas 操作 → 记录为 DisplayList（硬件加速）
    ↓
RenderThread 异步执行 DisplayList → OpenGL/Vulkan 指令
    ↓
SurfaceFlinger 合成 → 上屏
```

### 3.6 硬件加速渲染架构（Android 5.0+）

```
UI Thread (主线程)：
├── View 树遍历（measure/layout）
├── 构建 DisplayList（绘制指令录制，不执行）
└── 标记 dirty 区域

RenderThread (独立线程，Android 5.0+)：
├── 接收 DisplayList
├── 转换为 OpenGL/Vulkan 指令
├── 提交 GPU 执行
└── 优势：UI 线程不被 GPU 阻塞

GPU：
├── 顶点处理 → 光栅化 → 片元着色
└── 输出到 Surface Buffer

SurfaceFlinger (system_server 外的独立进程)：
├── 收集所有可见 Surface（状态栏、导航栏、应用、壁纸）
├── HWC 硬件合成（overlay 直通显示器）
└── 或 GPU 合成（glCompose）→ 送显
```

---

## 四、iOS 启动全链路

### 4.1 冷启动完整流程

```
┌─ 用户点击图标 ─────────────────────────────────────────┐
│                                                         │
│ ① SpringBoard 捕获点击                                   │
│    → 显示应用启动快照（上次退出时的截图）                    │
│    → 通知 launchd 启动进程                                │
│                                                         │
│ ② launchd / posix_spawn 创建进程                         │
│    → 分配虚拟内存空间                                     │
│    → 无 Zygote 机制，每次从零开始                          │
│                                                         │
│ ③ dyld4 动态链接（pre-main 阶段①）                       │
│    → 解析 Mach-O 可执行文件                               │
│    → 递归加载依赖 dylib（UIKit, Foundation...）            │
│    → Rebase/Bind：修正 ASLR 地址偏移                      │
│    → ObjC Runtime 初始化：注册类/协议/分类  ← 类越多越慢    │
│    → +load 方法执行  ← 开发者代码（已不推荐）              │
│                                                         │
│ ④ main() 函数（pre-main 阶段②）                          │
│    → UIApplicationMain()                                 │
│    → 创建 UIApplication + AppDelegate                    │
│                                                         │
│ ⑤ AppDelegate 生命周期                                   │
│    → application:didFinishLaunchingWithOptions:  ← 开发者  │
│    → 创建 UIWindow，设置 rootViewController               │
│    → makeKeyAndVisible                                   │
│                                                         │
│ ⑥ 首帧渲染                                               │
│    → ViewController: loadView → viewDidLoad              │
│    → Auto Layout 约束求解（Cassowary 算法）                │
│    → Core Animation 构建 Layer Tree                       │
│    → 提交 render server (backboardd)                     │
│    → GPU 光栅化 → 帧缓冲 → 显示                           │
│                                                         │
│ ⑦ 首帧上屏                                               │
│    → SpringBoard 移除启动快照                              │
│    → 用户看到真实界面                                      │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Pre-main 阶段详解

```
Pre-main 耗时组成（dyld 可统计）：
┌─────────────────────────────────────────────┐
│ dylib loading      加载动态库（数量相关）      │
│   - 每个 dylib ~2-5ms                        │
│   - 优化：减少自定义 framework 数量            │
├─────────────────────────────────────────────┤
│ Rebase/Binding     地址修正与符号绑定          │
│   - ASLR 导致每次加载地址不同                  │
│   - 优化：减少 ObjC 类/方法数量               │
├─────────────────────────────────────────────┤
│ ObjC Setup         注册类、分类、协议          │
│   - 数万类的项目此阶段可达 100ms+             │
│   - Swift 无此开销（静态派发为主）             │
├─────────────────────────────────────────────┤
│ Initializers       +load / __attribute__     │
│   - 唯一开发者可直接控制的 pre-main 代码       │
│   - 优化：+load → +initialize 或启动后执行    │
└─────────────────────────────────────────────┘

测量方式：
Xcode → Edit Scheme → Run → Diagnostics → Dyld API Usage
环境变量：DYLD_PRINT_STATISTICS=1（控制台输出各阶段耗时）
```

### 4.3 iOS 渲染架构：Core Animation 管线

```
应用进程内：
┌─────────────────────────────────────────┐
│ UIView (事件响应 + 布局)                  │
│   ↓ 每个 UIView 背后有一个 CALayer        │
│ CALayer Tree (属性动画的基本单位)          │
│   ↓ commit transaction                   │
│ Render Tree (序列化后通过 Mach Port 发送)  │
└─────────────────────────────────────────┘
        ↓ IPC (Mach 消息)
┌─────────────────────────────────────────┐
│ Render Server (backboardd 进程)          │
│   ├── 接收所有应用的 Render Tree          │
│   ├── 合成完整场景                        │
│   ├── 调用 GPU (Metal) 光栅化             │
│   └── 提交帧缓冲                         │
└─────────────────────────────────────────┘
        ↓
显示器刷新

关键认知：
- iOS 的合成在独立进程（Render Server）完成
- 应用只负责"描述"图层，不负责合成
- 离屏渲染 = Render Server 额外创建缓冲区 → 性能杀手
```

### 4.4 UIKit 布局求解

```
Auto Layout 工作流程：
约束集合 (NSLayoutConstraint)
    ↓
Cassowary 线性约束求解器
    ↓ 将约束转化为线性方程组求解
计算每个 View 的 frame (x, y, w, h)
    ↓
layoutSubviews() 回调
    ↓
CALayer frame 更新 → 标记需要重新合成

性能要点：
- 约束冲突/歧义 → 求解器回溯搜索 → 指数级耗时
- 约束数量与求解时间非线性增长
- 替代方案：手动 frame 布局 / Texture(AsyncDisplayKit) 异步布局
```

---

## 五、图形渲染管线

### 5.1 CPU 阶段 vs GPU 阶段

```
一帧的完整生产流程：

CPU 阶段（应用侧）：
┌─────────────────────────────────────────┐
│ ① 处理输入事件（触摸/按键）               │
│ ② 执行业务逻辑（状态更新）                │
│ ③ 布局计算（位置与尺寸）                  │
│ ④ 构建绘制指令（DisplayList/Layer Tree）  │
└─────────────────────────────────────────┘
        ↓ 提交
GPU 阶段（图形驱动侧）：
┌─────────────────────────────────────────┐
│ ⑤ 顶点着色器（Vertex Shader）            │
│    顶点坐标变换（模型→世界→裁剪空间）      │
│ ⑥ 图元装配（三角形化）                    │
│ ⑦ 光栅化（Rasterization）                │
│    三角形 → 片元（像素候选）              │
│ ⑧ 片元着色器（Fragment Shader）          │
│    纹理采样、光照、混合 → 最终像素颜色     │
│ ⑨ 输出到帧缓冲（Frame Buffer）           │
└─────────────────────────────────────────┘
```

### 5.2 GPU 管线细节

```
顶点数据 (Vertex Buffer)
    ↓
顶点着色器（并行处理每个顶点）
    ↓ 输出：裁剪空间坐标 + 插值变量
裁剪（视锥体外剔除）
    ↓
光栅化：
    三角形覆盖哪些像素？
    ↓ 每个覆盖的像素生成一个片元(Fragment)
片元着色器（并行处理每个片元）：
    ├── 纹理采样（Texture Fetch）← 可能触发缓存未命中
    ├── 颜色混合（Alpha Blending）← 过度绘制来源
    └── 深度测试（Z-Buffer）
    ↓
帧缓冲（RGBA8888: 每像素 4 字节）
    1080×2400 屏幕单帧 ≈ 10MB

GPU 并行架构：
- 数百个 ALU 核心同时处理顶点/片元
- 瓶颈通常在带宽（纹理读取）而非算力
- 移动端 GPU 架构：Tile-Based (TBDR)
  → 分块渲染，减少显存带宽消耗
```

### 5.3 过度绘制（Overdraw）

```
同一像素被多次绘制 = 过度绘制
┌─────────────────────────┐
│ 背景色        绘制 1 次   │
│ ┌───────────┐            │
│ │ 卡片背景   │  绘制 2 次  │
│ │ ┌───────┐ │            │
│ │ │ 图片   │ │  绘制 3 次 │
│ │ └───────┘ │            │
│ └───────────┘            │
└─────────────────────────┘

Android 可视化：开发者选项 → 调试 GPU 过度绘制
颜色含义：蓝(1x) 绿(2x) 浅红(3x) 红(4x+)

常见原因与解决：
- 多层背景叠加 → 移除不可见层背景
- 复杂半透明混合 → 减少 alpha 层级
- 全屏不透明 View → 设置 opaque 跳过混合
```

### 5.4 离屏渲染（Offscreen Rendering）

```
正常渲染：直接在当前屏幕缓冲区绘制
离屏渲染：GPU 先创建额外缓冲区渲染，再合成到帧缓冲

触发条件（iOS）：
- cornerRadius + masksToBounds（圆角裁剪）
- shadow（阴影，无 shadowPath 时）
- mask / groupOpacity
- shouldRasterize

代价：
- 额外缓冲区创建与上下文切换（~2-3x 耗时）
- 离屏缓冲区大小限制（屏幕 2.5 倍）

解决：
- 圆角：贝塞尔曲线预裁切 / UIBezierPath
- 阴影：指定 shadowPath 避免实时计算
- shouldRasterize：缓存复用（适合静态内容）
```

---

## 六、VSync 与帧调度

### 6.1 VSync 信号机制

```
显示器以固定频率发出 VSync（垂直同步）信号：

60Hz: ──┬──────┬──────┬──────┬──
        0ms   16.6   33.3   50ms

每次 VSync：
├── 显示器：切换到下一个帧缓冲
└── 通知 GPU/CPU：开始生产下一帧

Android (Project Butter, 4.1+)：
VSync 信号 → SurfaceFlinger → Choreographer
    → 回调 App 的 doFrame()
    → 触发 ViewRootImpl.performTraversals()

iOS (CADisplayLink)：
VSync 信号 → RunLoop 唤醒
    → CADisplayLink 回调 / CA commit
    → 触发 layout + render
```

### 6.2 帧生产时序（60Hz 示例）

```
理想情况（16.6ms 内完成）：
VSync₀        VSync₁        VSync₂
  │             │             │
  ├─CPU─┤├GPU─┤  ├─CPU─┤├GPU─┤
  │ 构建 ││光栅 │  │ 构建 ││光栅 │
  │  8ms ││ 6ms │  │      ││     │
  ↓             ↓             ↓
显示 Frame₀   显示 Frame₁   显示 Frame₂  ✅ 流畅

掉帧情况（CPU 超时）：
VSync₀        VSync₁        VSync₂
  │             │             │
  ├───CPU───────┼──┤├GPU─┤    │
  │   构建 20ms │  ││光栅 │    │
  ↓             ↓  ↓      ↓   ↓
显示 Frame₀   重复Frame₀  显示Frame₁     ❌ 卡顿一帧
```

### 6.3 Android Choreographer 调度

```java
// Choreographer：帧调度的核心
// 每帧按固定顺序执行四类回调：
Choreographer.doFrame(vsyncTimestamp) {
    // 1. INPUT：处理输入事件
    doCallbacks(CALLBACK_INPUT);
    // 2. ANIMATION：执行动画（ValueAnimator/属性动画）
    doCallbacks(CALLBACK_ANIMATION);
    // 3. TRAVERSAL：View 树遍历（measure/layout/draw）
    doCallbacks(CALLBACK_TRAVERSAL);
    // 4. COMMIT：帧提交后回调
    doCallbacks(CALLBACK_COMMIT);
}

// 监控掉帧的经典原理（线上 APM）：
// 注册 FrameCallback，计算相邻 doFrame 间隔
// 间隔 > 16.6ms × N → 记录为 N 帧卡顿
```

### 6.4 高刷新率适配

```
120Hz 屏幕的挑战：
- 帧预算减半：16.6ms → 8.3ms
- CPU 布局耗时不变 → 更容易掉帧
- 动态刷新率（LTPO）：静止时降到 1-10Hz 省电

Android 适配：
- Surface.setFrameRate() 声明帧率偏好
- 动画使用系统 API（自动适配刷新率）
- 避免硬编码 16ms 假设

iOS 适配：
- CADisplayLink.preferredFrameRateRange
- ProMotion 机型自动调节
- Core Animation 隐式动画自动适配
```

---

## 七、缓冲机制与画面提交

### 7.1 为什么需要缓冲

```
问题：GPU 正在写入的缓冲区，显示器同时在读取
     → 画面撕裂（Tearing）：上半新画面 + 下半旧画面

解决：帧缓冲（Frame Buffer）分离读写

单缓冲：❌ 撕裂
双缓冲：前后缓冲区交换（Swap）
三缓冲：额外缓冲区减少等待（Android 默认）
```

### 7.2 双缓冲与三缓冲

```
双缓冲（Double Buffering）：
┌──────────┐    ┌──────────┐
│ Front    │    │ Back     │
│ (显示中)  │    │ (GPU绘制) │
└──────────┘    └──────────┘
VSync 到达 → Swap：Back 变 Front，原 Front 变 Back

问题：GPU 未完成时 Swap → GPU 空闲等待 → 利用率低

三缓冲（Triple Buffering）：
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Front    │  │ Back     │  │ Extra    │
│ (显示中)  │  │ (绘制中)  │  │ (已完成)  │
└──────────┘  └──────────┘  └──────────┘
Swap 时取 Extra 上屏，GPU 继续画下一帧 → 不等待

代价：增加一帧延迟（输入到显示 +8-16ms）
```

### 7.3 Android BufferQueue 模型

```
App (Producer)          BufferQueue          SurfaceFlinger (Consumer)
    │                       │                        │
    ├─ dequeueBuffer() ────→│                        │
    │←── 返回空闲 Buffer ────┤                        │
    │                       │                        │
    │  [GPU 绘制到 Buffer]   │                        │
    │                       │                        │
    ├─ queueBuffer() ──────→│                        │
    │                       ├──── acquireBuffer() ──→│
    │                       │                        │ [合成]
    │                       │←── releaseBuffer() ────┤
    │                       │                        │
Buffer 状态机：FREE → DEQUEUED → QUEUED → ACQUIRED → FREE

Buffer 数量：通常 3 个（三缓冲）
Buffer 大小：宽 × 高 × 4 字节（RGBA）
1080P 全屏 Buffer ≈ 8.3MB × 3 ≈ 25MB
```

### 7.4 iOS 帧提交路径

```
App 进程：
CATransaction commit（RunLoop 即将休眠时自动触发）
    ↓ Layer Tree 编码
Mach Port IPC → Render Server
    ↓
Render Server：
    ├── 解码 Render Tree
    ├── 与系统其他图层合成（状态栏/Dock/其他App）
    ├── Metal 光栅化
    └── 提交 IOSurface（帧缓冲，跨进程共享内存）
    ↓
Display Driver：VSync 时切换 IOSurface 显示

IOSurface：
- 内核级共享内存对象
- App/GPU/显示驱动零拷贝访问同一块内存
- 避免帧数据在进程间复制
```

---

## 八、卡顿的本质与度量

### 8.1 卡顿分类

```
① 掉帧卡顿（Jank）
   单帧超时 → 画面停顿
   度量：帧耗时分布、P95/P99 帧时间

② 主线程阻塞（Freeze/ANR）
   主线程长时间无响应
   Android: 输入事件 5s 无响应 → ANR 弹窗
   iOS: Watchdog 机制，启动/后台超时 → 强杀(0x8badf00d)

③ 启动慢（Slow Launch）
   冷启动 > 2s 用户可感知
   度量：TTFD (Time To Full Display)

④ 滑动不跟手（Input Latency）
   触摸到画面响应延迟 > 100ms
   原因：事件队列积压、帧延迟
```

### 8.2 度量指标体系

| 指标 | 定义 | 目标值 |
| ---- | ---- | ------ |
| FPS | 每秒实际渲染帧数 | ≥55 (60Hz) |
| 帧耗时 P95 | 95% 帧的耗时上限 | ≤16.6ms |
| 掉帧率 | 超时帧占比 | ≤3% |
| 大卡顿(>3帧) | 连续掉帧次数 | 趋近 0 |
| 冷启动 TTFD | 点击到完整内容显示 | ≤1.5s |
| ANR 率 | ANR 次数/启动次数 | ≤0.1% |

### 8.3 监控原理

```
线上帧监控（Android）：
Choreographer.registerFrameCommitCallback
    → 计算相邻 VSync 间隔
    → 间隔 > N × 16.6ms → 上报卡顿堆栈

线上帧监控（iOS）：
CADisplayLink 回调间隔检测
    → RunLoop Observer 监控 kCFRunLoopBeforeSources 耗时
    → 子线程信号量超时检测主线程卡死

系统工具：
Android: Perfetto / systrace（全链路 trace）
iOS: Instruments - Time Profiler / Core Animation FPS
```

---

## 九、启动优化方法论

### 9.1 启动阶段划分

```
Android 官方定义：
┌─────────────────────────────────────────────────┐
│ TTFD (Time To Full Display)                      │
│ = 点击 → 首帧完整内容渲染                          │
│ ┌──────────────┬──────────────┬───────────────┐  │
│ │ 进程创建      │ Application  │ Activity 首帧  │  │
│ │ (系统侧)      │ + ContentProvider │ (开发者侧) │  │
│ └──────────────┴──────────────┴───────────────┘  │
└─────────────────────────────────────────────────┘

iOS 定义：
Pre-main (dyld) + Post-main (didFinishLaunching → 首帧)
```

### 9.2 通用优化策略矩阵

| 策略 | 手段 | 收益 |
| ---- | ---- | ---- |
| 延迟 | 非关键 SDK 移到首帧后/使用时初始化 | 高 |
| 并行 | 多线程并行初始化无依赖 SDK | 中 |
| 异步 | I/O 密集操作移出主线程 | 高 |
| 裁剪 | 移除无用代码/资源/类 | 中 |
| 预加载 | 启动页展示期间后台准备数据 | 中 |
| 快照 | 缓存首屏 UI 结构（Android 启动主题/iOS 快照） | 低-中 |
| 懒加载 | 页面按需创建，Tab 延迟实例化 | 中 |

### 9.3 Android 专项优化

```
1. 主题优化：
   - windowBackground 设置品牌图 → 消除白屏
   - 避免 Theme.Translucent（禁用预览窗口优化）

2. ContentProvider 治理：
   - 第三方 SDK 常通过 Provider 自动初始化（反射扫描）
   - App Startup 库统一管理，合并为单个 Provider

3. 类加载优化：
   - 启动路径类重排（Class Preload / Baseline Profile）
   - Baseline Profile: 预编译启动路径 → AOT 而非解释执行
   - 实测收益：启动提速 20-40%

4. 布局优化：
   - 首屏布局层级 ≤ 5 层
   - ViewStub 延迟非首屏区域
   - Compose 项目：避免首帧大量 Composition
```

### 9.4 iOS 专项优化

```
1. Pre-main 优化：
   - 减少动态库（合并为 1-2 个 umbrella framework）
   - 减少 ObjC 类数量（删除无用类，Swift 重写）
   - +load → +initialize / dispatch_once
   - 二进制重排（Page Fault 优化：启动函数排布到连续页）

2. Post-main 优化：
   - didFinishLaunching 只做窗口创建
   - 首屏 ViewController 轻量化
   - 避免首帧触发离屏渲染

3. 二进制重排原理：
   虚拟内存按页(16KB)加载 → 启动函数分散在多页
   → 大量 Page Fault（每次 ~0.1-1ms）
   → 将启动路径函数聚集到前几页 → 减少缺页次数
   工具：Clang SanitizerCoverage 收集启动符号 → order 文件
```

---

## 十、Flutter 视角的对照

### 10.1 Flutter 启动链路映射

```
原生阶段                    Flutter 对应
─────────────────────────────────────────────
进程创建                    相同（Zygote/posix_spawn）
Application.onCreate       FlutterEngine 初始化
  └─                        ├── Dart VM 启动
  └─                        ├── Isolate 创建
  └─                        └── Dart 代码加载执行
Activity/VC 创建            FlutterActivity/FlutterViewController
首帧构建                    Widget 树 build → layout → paint
首帧上屏                    首个 Layer Tree 合成

Flutter 额外开销：
- Dart VM 初始化 (~50-100ms)
- Dart 代码执行 main()
- 首帧 Widget 树构建

Flutter 优势：
- AOT 编译：无解释执行开销
- 自绘引擎：跳过原生 View 系统（无 inflate/AutoLayout）
- 单帧管线更短：build → layout → paint 全在 UI 线程完成
```

### 10.2 Flutter 启动优化要点

```dart
// 1. main() 精简化
void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // ❌ 同步初始化一切
  // ✅ 分级：仅初始化首帧必需项
  runApp(const MyApp());
  // 首帧后异步初始化
  Future.microtask(() => initNonCriticalSDKs());
}

// 2. 首帧轻量化
// - 首页骨架屏先行，数据后填充
// - 避免首帧加载大图（cacheWidth 限制解码尺寸）
// - Tab 页面延迟构建

// 3. 引擎预热（多页面场景）
// FlutterEngine 提前创建并缓存
// FlutterEngineCache.getInstance().put("main", engine);
```

### 10.3 全链路知识对 Flutter 开发者的价值

```
理解原生启动链路后能解决的 Flutter 问题：
├── "为什么首帧前有白屏/黑屏" → 原生 Activity 主题/窗口背景
├── "为什么 Android 比 iOS 启动快" → Zygote fork vs 从零 spawn
├── "为什么 release 比 debug 快 3 倍" → JIT vs AOT 编译差异
├── "为什么低端机动画卡顿" → GPU 光栅化带宽瓶颈
├── "为什么 120Hz 设备更容易掉帧" → 帧预算减半
└── "为什么冷启动后第一次滑动卡" → Shader 编译（Skia）/ 类加载
```

---

## 📎 参考资源

- [Android 应用启动优化官方指南](https://developer.android.com/topic/performance/vitals/launch-time)
- [Android 图形架构](https://source.android.com/docs/core/graphics)
- [iOS App 启动优化 (WWDC 2016 - Optimizing App Startup Time)](https://developer.apple.com/videos/play/wwdc2016/406/)
- [Core Animation 渲染管线](https://www.objc.io/issues/12-animations/animations-explained/)
- [Flutter 渲染管线源码](https://github.com/flutter/engine/tree/main/display_list)
