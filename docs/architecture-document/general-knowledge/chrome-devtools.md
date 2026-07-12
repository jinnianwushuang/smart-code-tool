# Chrome 开发者工具全解

## 概述

Chrome DevTools 是 Google Chrome 浏览器内置的一套 Web 开发与调试工具集。它可以帮助开发者检查页面元素、调试 JavaScript、分析网络请求、审查性能瓶颈、查看存储数据等，是前端开发工作中不可或缺的生产力工具。

打开方式：`F12` 或 `Cmd + Option + I`（macOS）/ `Ctrl + Shift + I`（Windows/Linux）

---

## Elements — 元素面板

### 功能

查看和编辑页面的 DOM 结构与 CSS 样式，是最常用的面板之一。

### 核心能力

| 能力           | 说明                                                        |
| -------------- | ----------------------------------------------------------- |
| DOM 树查看     | 以树形结构展示页面所有 DOM 节点，支持搜索（`Ctrl/Cmd + F`） |
| 实时编辑       | 双击节点可直接修改标签名、属性、文本内容                    |
| 样式查看与编辑 | 查看元素的 Computed 样式、匹配的规则，实时修改 CSS 属性     |
| 盒模型可视化   | 以图形方式展示 content、padding、border、margin 的尺寸      |
| 拖拽重排       | 拖拽 DOM 节点可以改变其在树中的位置                         |
| 断点调试       | 可在 DOM 节点上设置 subtree / attribute / removal 断点      |

### 实用技巧

- **选中节点后按 `H`**：隐藏该节点（`visibility: hidden`）
- **选中节点后按 `F2`**：进入编辑模式，可批量编辑 HTML
- **右键 → Copy**：复制 outerHTML、selector、XPath、full XPath
- **`$0`**：在 Console 中引用当前选中的 DOM 节点
- **强制状态**：右键元素 → Force state，可强制 `:hover`、`:active`、`:focus`、`:visited` 状态

---

## Console — 控制台面板

### 功能

执行 JavaScript 代码、查看日志输出、调试警告和错误信息。

### 常用 Console API

```javascript
// 基础输出
console.log('普通信息')
console.warn('警告信息')
console.error('错误信息')
console.info('提示信息')

// 格式化输出
console.table([
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
])
console.group('分组标题')
console.log('组内内容')
console.groupEnd()

// 计时
console.time('操作耗时')
// ... 一些操作
console.timeEnd('操作耗时')

// 计数
console.count('计数器名') // 每次调用自动递增

// 断言
console.assert(1 === 2, '断言失败时输出此信息')

// 追踪调用栈
console.trace('追踪函数调用链')

// 清除控制台
console.clear()
```

### 实用技巧

- **`$_`**：引用上一条表达式的返回值
- **`copy(value)`**：将任意值复制到剪贴板
- **`dir(obj)`**：以可展开的对象树形式输出（等同于 `console.dir`）
- **`keys(obj)` / `values(obj)`**：快速查看对象的键或值
- **`$(selector)`**：等同于 `document.querySelector(selector)`
- **`$$(selector)`**：等同于 `document.querySelectorAll(selector)`
- **`monitor(fn)`**：监控函数调用，自动打印参数

---

## Sources — 源代码面板

### 功能

查看和调试页面加载的所有源代码文件，支持设置断点进行逐行调试。

### 核心能力

| 能力                | 说明                                               |
| ------------------- | -------------------------------------------------- |
| 文件树浏览          | 查看所有加载的 JS、CSS、HTML、图片等资源文件       |
| 断点调试            | 点击行号设置断点，支持条件断点、日志断点、DOM 断点 |
| 单步执行            | Step Over / Step Into / Step Out 控制代码执行流程  |
| Watch 表达式        | 添加变量或表达式到 Watch 列表，实时观察值的变化    |
| Call Stack 查看     | 查看当前暂停点的函数调用栈                         |
| Scope 变量查看      | 查看当前作用域、闭包、全局作用域中的变量值         |
| Snippets 代码片段   | 创建和运行自定义 JS 代码片段，可持久保存           |
| Local Modifications | 右键文件 → Local modifications，查看本地修改历史   |

### 断点类型

```
普通断点     → 点击行号，执行到该行时暂停
条件断点     → 右键行号 → Add conditional breakpoint，满足条件时暂停
日志断点     → 右键行号 → Add logpoint，打印日志但不暂停
DOM 断点     → 在 Elements 面板设置，DOM 变化时暂停
XHR 断点     → 在 Sources 面板 XHR/fetch Breakpoints 添加，匹配 URL 时暂停
事件监听断点 → 在 Event Listener Breakpoints 勾选，事件触发时暂停
异常断点     → 点击暂停图标，在捕获/未捕获异常时暂停
```

### 调试控制按钮

| 按钮         | 快捷键      | 说明                     |
| ------------ | ----------- | ------------------------ |
| Resume/Pause | `F8`        | 继续执行或暂停           |
| Step Over    | `F10`       | 跳过函数调用，执行下一行 |
| Step Into    | `F11`       | 进入函数内部             |
| Step Out     | `Shift+F11` | 跳出当前函数             |

---

## Network — 网络面板

### 功能

监控页面发出的所有网络请求（XHR、Fetch、JS、CSS、图片、字体、WebSocket 等），分析请求性能和状态。

### 核心能力

| 能力         | 说明                                                     |
| ------------ | -------------------------------------------------------- |
| 请求列表     | 展示所有请求的名称、状态码、类型、发起方、耗时、大小     |
| 请求详情     | 点击请求查看 Headers、Payload、Preview、Response、Timing |
| 过滤与搜索   | 按类型过滤（Fetch/XHR、JS、CSS、Img 等），支持搜索关键词 |
| 节流模拟     | 模拟慢速 3G、快速 3G、离线等网络条件                     |
| 阻断请求     | 在 Request blocking 标签中阻断特定 URL 的请求            |
| HAR 导出     | 右键 → Save all as HAR with content，导出请求记录供分析  |
| 重放 XHR     | 右键请求 → Replay XHR，重新发送该请求                    |
| Copy as cURL | 右键请求 → Copy → Copy as cURL，可直接在终端复用         |

### Timing 阶段详解

```
Queueing       → 请求排队等待（浏览器并发限制，最多 6 个同域 TCP 连接）
Stalled        → 请求停滞（代理协商、DNS 查找等前置操作）
DNS Lookup     → DNS 域名解析耗时
Initial Conn.  → TCP 连接建立耗时（含 TLS/SSL 握手）
Request sent   → 请求数据发送耗时（通常极短）
Waiting (TTFB) → 等待服务器首字节响应（最重要的指标之一）
Content Download→ 下载响应内容耗时
```

### 实用技巧

- **Disable cache**：勾选后每次请求都跳过缓存，开发时非常有用
- **Preserve log**：页面跳转后保留网络日志，适合分析重定向链
- **右键 → Copy as fetch**：将请求转为 `fetch` 代码，方便在 Console 中调试

---

## Performance — 性能面板

### 功能

录制页面运行时的性能数据，分析 JavaScript 执行、渲染、绘制等各环节的耗时，定位性能瓶颈。

### 核心指标

| 指标 | 全称                      | 说明                              |
| ---- | ------------------------- | --------------------------------- |
| FCP  | First Contentful Paint    | 首次内容绘制时间                  |
| LCP  | Largest Contentful Paint  | 最大内容绘制时间（核心 Web 指标） |
| CLS  | Cumulative Layout Shift   | 累积布局偏移（核心 Web 指标）     |
| TBT  | Total Blocking Time       | 总阻塞时间                        |
| INP  | Interaction to Next Paint | 交互到下次绘制（核心 Web 指标）   |

### 使用步骤

1. 点击录制按钮（或使用 `Cmd/Ctrl + E` 快捷录制）
2. 执行要分析的操作（页面加载、滚动、点击等）
3. 停止录制，查看火焰图
4. 在 Main 线程中寻找长任务（Long Task，标红 > 50ms）
5. 查看 Bottom-Up / Call Tree / Event Log 标签分析耗时分布

### 实用技巧

- **Screenshots 勾选**：录制时勾选，可以在时间轴上看到页面截图变化
- **Web Vitals 勾选**：在时间轴上标注 Core Web Vitals 指标
- **CPU throttling**：设置 CPU 减速（4x / 6x），模拟低端设备性能

---

## Memory — 内存面板

### 功能

分析页面的内存使用情况，检测内存泄漏，查看对象分配和回收情况。

### 三种分析模式

| 模式                | 说明                                       |
| ------------------- | ------------------------------------------ |
| Heap snapshot       | 拍摄堆内存快照，查看所有对象及其引用关系   |
| Allocation timeline | 时间线记录，观察内存随时间的分配和回收趋势 |
| Allocation sampling | 采样分析，以较低性能开销观察内存分配热点   |

### Heap Snapshot 使用步骤

1. 点击 Take snapshot 拍摄初始快照
2. 执行可能泄漏的操作（打开弹窗、添加监听器等）
3. 再次 Take snapshot
4. 选择 Comparison 视图，对比两次快照的对象数量差异
5. 关注 Detached DOM 节点（已脱离 DOM 树但仍被 JS 引用的节点）

---

## Application — 应用面板

### 功能

查看和管理页面存储的各种数据，包括 Storage、Cache、Service Workers 等。

### 存储类型一览

| 存储类型            | 说明                                          |
| ------------------- | --------------------------------------------- |
| Local Storage       | 键值存储，持久化，约 5-10MB                   |
| Session Storage     | 键值存储，会话级，关闭标签页后清除            |
| IndexedDB           | 结构化存储，支持大容量，支持事务              |
| Web SQL             | 已废弃的 SQL 数据库存储                       |
| Cookies             | HTTP Cookie，可设置过期时间，随请求发送       |
| Cache Storage       | Service Worker 管理的缓存，用于离线和性能优化 |
| Service Workers     | 查看和调试已注册的 Service Worker             |
| Manifest            | 查看 Web App Manifest（PWA 配置）             |
| Background Services | 查看后台同步、推送等后台服务事件              |

### 实用技巧

- **Clear storage**：一键清除所有站点数据，包含 localStorage、cookies、indexedDB 等
- **Service Workers → Unregister**：取消注册 SW，解决缓存导致的更新问题
- **Cookies**：可以直接查看、编辑、删除 Cookie 的值和属性

---

## Lighthouse — 审计面板

### 功能

对页面进行自动化审计，生成关于性能、可访问性、最佳实践、SEO 和 PWA 的综合报告。

### 审计类别

| 类别           | 说明                                        |
| -------------- | ------------------------------------------- |
| Performance    | 页面加载性能评分及优化建议                  |
| Accessibility  | 可访问性检查（ARIA、对比度、语义化等）      |
| Best Practices | 最佳实践检查（HTTPS、图片比例、控制台错误） |
| SEO            | SEO 基础检查（meta 标签、链接可爬取等）     |
| PWA            | 渐进式 Web 应用检查（Service Worker 等）    |

### 使用方式

1. 选择要审计的类别和设备类型（Mobile / Desktop）
2. 点击 Analyze page load
3. 等待审计完成，查看各项得分和优化建议
4. 根据建议逐项优化

---

## Security — 安全面板

### 功能

检查页面的安全状态，包括证书信息、安全连接、混合内容等。

### 核心检查项

- **证书有效性**：查看 SSL/TLS 证书是否有效、是否过期
- **协议版本**：确认使用的 TLS 版本（推荐 TLS 1.2+）
- **混合内容**：检测 HTTPS 页面中是否加载了 HTTP 资源
- **安全策略**：查看 CSP（内容安全策略）等安全头信息

---

## Device Toolbar — 设备模拟工具栏

### 功能

模拟不同移动设备的屏幕尺寸、像素比、用户代理和网络条件。

### 开启方式

`Cmd + Shift + M`（macOS）/ `Ctrl + Shift + M`（Windows/Linux），或点击 DevTools 左上角的设备图标。

### 核心能力

- **预设设备**：iPhone、Pixel、iPad 等主流设备预设
- **自定义尺寸**：自由设定宽高和缩放比例
- **DPR 模拟**：设置设备像素比（Device Pixel Ratio）
- **用户代理覆盖**：模拟不同浏览器的 User-Agent
- **节流**：模拟慢速网络条件
- **传感器模拟**：模拟 GPS 位置、加速度计、陀螺仪数据

---

## 全局快捷键速查

### 打开 DevTools

| 操作               | macOS                       | Windows / Linux             |
| ------------------ | --------------------------- | --------------------------- |
| 打开/关闭 DevTools | `Cmd + Option + I` 或 `F12` | `Ctrl + Shift + I` 或 `F12` |
| 直接打开 Console   | `Cmd + Option + J`          | `Ctrl + Shift + J`          |
| 直接审查元素       | `Cmd + Shift + C`           | `Ctrl + Shift + C`          |

### DevTools 内部快捷键

| 操作                | macOS                 | Windows / Linux       |
| ------------------- | --------------------- | --------------------- |
| 切换面板            | `Cmd + [ ]`           | `Ctrl + [ ]`          |
| 打开命令面板        | `Cmd + Shift + P`     | `Ctrl + Shift + P`    |
| 快速打开文件        | `Cmd + P`             | `Ctrl + P`            |
| 运行代码片段        | 命令面板输入 `!`      | 命令面板输入 `!`      |
| 切换深色/浅色主题   | 命令面板 → theme      | 命令面板 → theme      |
| 截图（截全页/区域） | 命令面板 → screenshot | 命令面板 → screenshot |

---

## 命令面板（Command Menu）

按 `Cmd/Ctrl + Shift + P` 打开命令面板，可以快速执行各种操作：

| 命令                                   | 说明                    |
| -------------------------------------- | ----------------------- |
| `>full` → Capture full size screenshot | 截取完整页面长图        |
| `>area` → Capture area screenshot      | 截取选定区域截图        |
| `>node` → Capture node screenshot      | 截取当前选中节点的截图  |
| `>theme` → Switch theme                | 切换深色/浅色主题       |
| `>timeline` → Show Timeline            | 显示 Performance 时间轴 |
| `>disable` → Disable JavaScript        | 禁用 JavaScript 执行    |
| `>clear` → Clear console               | 清空控制台              |
| `>coverage` → Show Coverage            | 显示代码覆盖率面板      |

---

## More tools — 更多工具

点击 DevTools 右上角的 `⋮` → **More tools**，可以打开大量内置辅助工具。以下是各工具的详细说明。

---

### Animations — 动画面板

#### 功能

可视化查看和控制页面中的 CSS 动画、CSS Transition 以及 Web Animations API 动画。

#### 开启方式

More tools → Animations，或命令面板输入 `animations`。

#### 核心能力

| 能力           | 说明                                                 |
| -------------- | ---------------------------------------------------- |
| 动画时间轴     | 以时间轴形式展示所有动画的持续时间、延迟和迭代次数   |
| 实时调速       | 拖动滑块将动画播放速度降低至 10% / 25%，便于观察细节 |
| 重播动画       | 点击重播按钮，重新触发所有动画                       |
| 贝塞尔曲线编辑 | 点击缓动曲线图标，可视化编辑 `cubic-bezier` 参数     |
| 关键帧编辑     | 直接在时间轴上拖动关键帧节点，调整动画属性           |
| 录制动画       | 点击录制按钮，捕获页面交互触发的动画                 |

#### 适用场景

- 调试复杂的 CSS `@keyframes` 动画序列
- 验证 `animation-delay` 和 `animation-iteration-count` 是否符合预期
- 检查多个动画之间的时序配合

---

### Changes — 代码变更面板

#### 功能

实时追踪你在 DevTools 中对 CSS 和 JavaScript 做出的所有本地修改，类似一个内置的 diff 工具。

#### 开启方式

More tools → Changes，或命令面板输入 `changes`。

#### 核心能力

- **自动记录变更**：在 Elements 面板修改 CSS 或在 Sources 面板编辑 JS 时，Changes 面板自动记录所有 diff
- **行级对比**：以红色（删除）和绿色（新增）展示代码变化
- **一键复制**：右键变更内容 → Copy，方便将修改粘贴回源代码文件
- **文件分组**：按文件路径分组展示所有变更

#### 适用场景

- 在 DevTools 中调试完样式后，快速提取所有修改并同步到项目源码
- 对比调试前后的 JS 代码差异

---

### Code Coverage — 代码覆盖率面板

#### 功能

分析页面实际加载和执行的 JS / CSS 代码比例，找出未使用的死代码。

#### 开启方式

More tools → Coverage，或命令面板输入 `coverage`。

#### 核心能力

| 能力         | 说明                                                  |
| ------------ | ----------------------------------------------------- |
| 覆盖率录制   | 点击录制按钮，记录页面加载和交互过程中实际执行的代码  |
| 使用率百分比 | 每个文件显示已使用代码占比（如 45.3% used）           |
| 可视化标记   | 在 Sources 面板中，已执行代码为绿色，未执行代码为红色 |
| 按类型过滤   | 可过滤只查看 JS 或 CSS 的覆盖率                       |
| 导出报告     | 点击导出按钮，下载 JSON 格式的覆盖率报告              |

#### 适用场景

- 分析 Bundle 中有多少代码实际未被使用，指导代码拆分
- 发现可以 Tree-shaking 或懒加载的模块
- 评估 CSS 清理（PurgeCSS）的效果

---

### CSS Overview — CSS 概览面板

#### 功能

对页面中所有 CSS 进行全面扫描，列出不规范的用法、冗余样式和潜在问题。

#### 开启方式

More tools → CSS overview。

#### 检测内容

| 检测项                 | 说明                                                     |
| ---------------------- | -------------------------------------------------------- |
| 未使用的 CSS           | 当前页面未匹配的样式规则                                 |
| 媒体查询使用           | 统计各 `@media` 查询的命中情况                           |
| 非合成动画属性         | 列出触发布局/重绘而非走 GPU 合成的动画属性（如 `width`） |
| 强制同步布局           | 检测 JS 读取几何属性后触发强制 reflow 的位置             |
| CSS 变量（自定义属性） | 列出所有使用的 CSS 自定义属性                            |
| 颜色格式               | 统计 `hex`、`rgb`、`hsl`、命名色等格式的使用情况         |

#### 适用场景

- 项目样式重构前的审计，了解 CSS 的规模和复杂度
- 发现可以优化的动画属性，提升动画流畅度

---

### Issues — 问题面板

#### 功能

集中展示 Chrome 在当前页面检测到的各种问题、警告和最佳实践违规，并提供修复建议。

#### 开启方式

More tools → Issues，或 Console 面板顶部的问题提示条。

#### 问题类型

| 类型          | 说明                                            |
| ------------- | ----------------------------------------------- |
| Deprecation   | 使用了即将废弃的 API（如 `document.domain`）    |
| Intervention  | Chrome 主动干预的行为（如自动阻止大型同步 XHR） |
| Mixed Content | HTTPS 页面中加载了 HTTP 资源                    |
| Cookie        | Cookie 属性问题（缺少 `SameSite`、`Secure` 等） |
| Compatibility | 跨浏览器兼容性问题                              |
| Security      | 安全相关警告（如不安全的跨源配置）              |
| Performance   | 性能问题（如强制同步布局、大型布局转移）        |

#### 适用场景

- 定期检查，及时修复即将废弃的 API 用法
- 排查 Cookie 跨域问题（尤其是 `SameSite` 策略变更后）

---

### JavaScript Profiler — JS 性能分析器

#### 功能

对 JavaScript 执行进行 CPU Profiling，生成火焰图，找出最耗时的函数调用。

#### 开启方式

More tools → JavaScript profiler。

#### 使用步骤

1. 点击 **Start** 开始录制
2. 执行要分析的操作
3. 点击 **Stop** 停止录制
4. 查看火焰图（Heavy (Bottom Up) / Chart / Tree 视图）

#### 三种视图

| 视图              | 说明                                             |
| ----------------- | ------------------------------------------------ |
| Heavy (Bottom Up) | 从最耗时的函数开始，向上展示调用者，快速定位瓶颈 |
| Chart             | 以时间轴形式展示各函数占用的 CPU 时间比例        |
| Tree              | 以树形结构展示完整调用链，从根节点开始向下展开   |

#### 与 Performance 面板的区别

- **Performance 面板**：全局视角，包含渲染、绘制、GC、事件处理等所有活动
- **JS Profiler**：专注 JS 函数调用栈，粒度更细，适合定位纯计算瓶颈

---

### Media — 媒体面板

#### 功能

查看页面中所有音视频播放器实例的详细信息，包括播放状态、编解码器、缓冲区、帧率等。

#### 开启方式

More tools → Media。

#### 核心能力

| 能力         | 说明                                              |
| ------------ | ------------------------------------------------- |
| 播放器列表   | 列出页面中所有 `<video>` / `<audio>` 实例         |
| 播放属性     | 查看当前播放状态、当前时间、时长、音量、播放速率  |
| 编解码器信息 | 查看视频/音频使用的编解码器（如 H.264、VP9、AV1） |
| 缓冲区状态   | 查看已缓冲的数据量和缓冲时间                      |
| 帧率统计     | 查看实际渲染帧率、丢帧数量                        |
| MSE 日志     | 查看 Media Source Extensions 的操作日志           |
| WebRTC       | 查看 WebRTC 连接和媒体流信息                      |

#### 适用场景

- 调试视频播放卡顿（观察缓冲区和丢帧）
- 确认浏览器实际选择的编解码器
- 排查 MSE（如 HLS.js、Shaka Player）的问题

---

### Network conditions — 网络条件模拟

#### 功能

自定义网络节流配置和用户代理字符串，模拟各种网络环境和设备。

#### 开启方式

More tools → Network conditions，或 Network 面板底部工具栏。

#### 核心能力

| 能力           | 说明                                          |
| -------------- | --------------------------------------------- |
| 自定义节流配置 | 手动设置下载速度、上传速度、延迟（ms）        |
| 预设网络条件   | Offline、Slow 3G、Fast 3G、Slow 4G、4G 等预设 |
| 用户代理覆盖   | 自定义 User-Agent 字符串，或选择预设设备      |
| 接受语言覆盖   | 自定义 `Accept-Language` 请求头               |

#### 常用自定义配置示例

```
慢速电梯网络：下行 500 kb/s，上行 200 kb/s，延迟 400ms
印度 4G：     下行 4 Mb/s，上行 2 Mb/s，延迟 200ms
高速 WiFi：   下行 100 Mb/s，上行 50 Mb/s，延迟 5ms
```

---

### Network request blocking — 请求阻断

#### 功能

阻止特定 URL 模式的网络请求发出，用于测试页面在某个资源不可用时的表现。

#### 开启方式

More tools → Network request blocking，或 Network 面板底部工具栏。

#### 核心能力

- **按 URL 模式阻断**：支持精确匹配和通配符（如 `*.png`、`*analytics*`）
- **按域名阻断**：输入完整域名阻断该域名下所有请求
- **启用/禁用**：勾选/取消勾选快速切换阻断状态
- **结合 Network 面板**：被阻断的请求在 Network 面板中显示为 `(blocked)` 状态

#### 适用场景

- 测试 CDN 挂掉时页面的降级表现
- 屏蔽第三方脚本（如广告、追踪器）观察页面影响
- 模拟某个 API 接口不可用，验证前端错误处理逻辑

---

### Performance monitor — 性能监视器

#### 功能

以实时图表的形式监控页面的各项运行时指标，类似任务管理器但更细致。

#### 开启方式

More tools → Performance monitor。

#### 监控指标

| 指标               | 说明                                     |
| ------------------ | ---------------------------------------- |
| CPU usage          | CPU 使用率实时曲线                       |
| JS heap size       | JavaScript 堆内存大小变化曲线            |
| DOM Nodes          | DOM 节点总数变化（持续增长可能存在泄漏） |
| JS Event Listeners | JS 事件监听器数量变化（持续增长需关注）  |

#### 适用场景

- 长时间运行页面，观察 DOM 节点数是否持续增长（内存泄漏初步判断）
- 监控交互操作时的 CPU 峰值
- 对比优化前后的内存和监听器变化趋势

---

### Recorder — 录制器面板

#### 功能

录制用户在页面上的操作流程（点击、输入、导航等），生成可回放的用户流程脚本，并支持导出为 Puppeteer / Cypress 测试脚本。

#### 开启方式

More tools → Recorder。

#### 核心能力

| 能力           | 说明                                                   |
| -------------- | ------------------------------------------------------ |
| 录制用户流程   | 点击录制，自动捕获点击、输入、导航、滚动等操作         |
| 可视化回放     | 在 DevTools 内直接回放录制的流程，无需外部工具         |
| 步骤编辑       | 手动添加、删除、修改录制步骤（如修改选择器、添加等待） |
| 导出 Puppeteer | 导出为 Puppeteer Node.js 脚本，用于自动化测试          |
| 导出 Cypress   | 导出为 Cypress 测试代码                                |
| 导出 JSON      | 导出为 JSON 格式，供自定义工具解析                     |
| 导入流程       | 导入之前导出的 JSON 流程文件                           |
| 性能分析       | 录制流程的同时进行 Performance 录制                    |

#### 适用场景

- 快速录制 Bug 复现步骤，分享给团队成员
- 生成 E2E 测试脚本的初始骨架，减少手动编写工作量
- 录制并分析关键用户路径的性能表现

---

### Rendering — 渲染面板

#### 功能

可视化浏览器渲染过程中的各种调试信息，帮助排查绘制、布局和合成问题。

#### 开启方式

More tools → Rendering，或命令面板输入 `rendering`。

#### 核心可视化选项

| 选项                              | 说明                                                                     |
| --------------------------------- | ------------------------------------------------------------------------ |
| Paint flashing                    | 绿色闪烁标记重绘区域，频繁闪烁说明重绘过多                               |
| Layer borders                     | 显示合成层边框和瓦片网格，帮助分析层爆炸问题                             |
| FPS meter                         | 左上角显示实时帧率、帧时间分布                                           |
| GPU rasterization                 | 标记由 GPU 光栅化的图层（蓝色）                                          |
| Layout shift regions              | 标红发生布局偏移（CLS）的区域                                            |
| Frame rendering stats             | 显示每帧的渲染统计信息                                                   |
| Highlight ad frames               | 标记被 Chrome 识别为广告的 iframe                                        |
| Highlight debug borders on layers | 显示合成层的调试边框                                                     |
| Prefer CSS transforms             | 将动画属性优先使用 CSS transform 而非位置属性                            |
| Disable local file restrictions   | 禁用本地文件访问限制                                                     |
| Emulate CSS media feature         | 模拟 CSS 媒体特性（如 `prefers-color-scheme`、`prefers-reduced-motion`） |
| Emulate CSS media type            | 模拟媒体类型（`print`、`screen` 等）                                     |
| Emulate vision deficiencies       | 模拟色觉缺陷（色盲、色弱）查看页面效果                                   |

#### 适用场景

- **Paint flashing**：排查滚动卡顿，找出频繁重绘的元素
- **Layer borders**：分析合成层数量，避免层爆炸（过多合成层占用大量 GPU 内存）
- **Layout shift regions**：定位导致 CLS 的元素
- **Emulate vision deficiencies**：进行无障碍设计验证

---

### Search — 全局搜索面板

#### 功能

跨所有已加载的资源文件搜索文本或正则表达式，范围包括 JS、CSS、HTML 等。

#### 开启方式

More tools → Search，或快捷键 `Cmd + Option + F`（macOS）/ `Ctrl + Shift + F`（Windows/Linux）。

#### 核心能力

- **正则表达式支持**：点击 `.*` 按钮启用正则搜索
- **大小写敏感**：点击 `Aa` 按钮启用大小写敏感
- **全词匹配**：点击 `\b` 按钮只匹配完整单词
- **跨文件结果**：结果按文件分组展示，点击跳转对应位置
- **批量替换**：在搜索框旁的替换框中输入替换内容，支持批量替换

---

### Sensors — 传感器模拟面板

#### 功能

模拟设备的各种传感器数据，用于测试依赖传感器的 Web 应用（如地图、AR、游戏）。

#### 开启方式

More tools → Sensors。

#### 可模拟的传感器

| 传感器     | 说明                                               |
| ---------- | -------------------------------------------------- |
| 地理位置   | 模拟 GPS 坐标（纬度、经度、海拔），支持预设城市    |
| 加速度计   | 模拟设备的三轴加速度数据（用于摇一摇、体感控制等） |
| 陀螺仪     | 模拟设备的旋转角速度                               |
| 方向传感器 | 模拟设备的 alpha / beta / gamma 朝向角度           |
| 时区       | 模拟不同时区，测试时间相关逻辑                     |
| 区域设置   | 模拟不同语言和区域设置（影响 `Intl` API 等）       |

---

### WebAuthn — Web 身份认证面板

#### 功能

模拟 WebAuthn（FIDO2 / Passkey）认证器，无需物理安全密钥即可测试 Web 身份认证流程。

#### 开启方式

More tools → WebAuthn。

#### 核心能力

- **创建虚拟认证器**：添加一个软件模拟的 FIDO2 认证器
- **配置协议**：选择 CTAP2 / U2F 协议版本
- **管理凭据**：查看和删除已注册的凭据
- **支持 Resident Key**：模拟支持 Discoverable Credential（可发现凭据）
- **用户验证**：模拟用户存在（user presence）和用户验证（user verification）

#### 适用场景

- 开发 Passkey 登录功能时，无需真实硬件即可调试
- 测试 WebAuthn 注册和认证流程

---

### What's new — 更新日志面板

#### 功能

展示当前 Chrome 版本中 DevTools 的新功能、变更和已知问题。

#### 开启方式

More tools → What's new，或命令面板输入 `what's new`。

---

### Task Manager — 任务管理器

#### 功能

查看浏览器中每个标签页、扩展程序、Service Worker 的资源占用情况（CPU、内存、网络、JS 内存）。

#### 开启方式

浏览器菜单 → 更多工具 → 任务管理器，或 `Shift + Esc`。

#### 核心能力

- **按进程查看**：每个标签页、扩展、GPU 进程、Service Worker 独立列出
- **资源占用排序**：点击列标题按 CPU、内存、网络等排序
- **终止进程**：选中异常进程后点击「结束进程」，强制关闭高资源占用的标签页

#### 适用场景

- 定位占用资源过高的标签页或扩展
- 排查 Service Worker 卡死问题

---

### Elements 侧边栏工具

在 Elements 面板的右侧边栏（点击 `>>` 展开）中还有多个实用子工具：

#### Accessibility — 无障碍树

以无障碍树（Accessibility Tree）形式展示 DOM，查看每个元素的 ARIA 角色、名称、状态，用于验证屏幕阅读器体验。

#### Event Listeners — 事件监听器

查看当前选中元素上绑定的所有事件监听器，支持跳转到源代码位置，可按事件类型过滤。

#### DOM Breakpoints — DOM 断点

查看当前页面所有已设置的 DOM 断点列表，统一管理。

#### Style — 样式子面板

- **Filter**：过滤样式规则（按属性名搜索）
- **Computed**：查看元素的最终计算样式
- **Layout**：Flexbox / Grid 布局调试工具
- **Animations**：当前元素相关的动画信息

---

## 总结

### 主面板

| 面板           | 核心用途                           |
| -------------- | ---------------------------------- |
| Elements       | DOM 结构查看与 CSS 样式调试        |
| Console        | JS 执行、日志输出与快速调试        |
| Sources        | 源代码查看与断点调试               |
| Network        | 网络请求监控与性能分析             |
| Performance    | 运行时性能分析与瓶颈定位           |
| Memory         | 内存泄漏检测与堆分析               |
| Application    | 存储数据管理与 Service Worker 调试 |
| Lighthouse     | 页面质量自动化审计                 |
| Security       | 安全状态与证书检查                 |
| Device Toolbar | 移动设备响应式模拟                 |

### More tools 工具

| 工具                | 核心用途                                  |
| ------------------- | ----------------------------------------- |
| Animations          | 动画时间轴可视化与编辑                    |
| Changes             | CSS/JS 本地变更 diff 追踪                 |
| Code Coverage       | 代码使用率分析，找出死代码                |
| CSS Overview        | CSS 全局审计，检测冗余与不规范用法        |
| Issues              | 问题汇总与修复建议                        |
| JS Profiler         | JS 函数级 CPU 火焰图分析                  |
| Media               | 音视频播放器状态与编解码器信息            |
| Network conditions  | 网络节流与用户代理自定义模拟              |
| Request blocking    | 按 URL 模式阻断网络请求                   |
| Performance monitor | 实时性能指标监控（CPU、内存、DOM 节点）   |
| Recorder            | 用户流程录制与 E2E 脚本导出               |
| Rendering           | 渲染可视化调试（重绘、合成层、CLS、色盲） |
| Search              | 跨资源全局搜索与批量替换                  |
| Sensors             | 地理位置、加速度计、陀螺仪等传感器模拟    |
| WebAuthn            | FIDO2/Passkey 虚拟认证器模拟              |
| Task Manager        | 浏览器进程级资源占用查看                  |
| Accessibility       | 无障碍树查看与屏幕阅读器验证              |

熟练使用 Chrome DevTools 可以大幅提升开发和调试效率，建议在日常开发中多探索 More tools 中的隐藏工具，形成自己的调试工作流。
