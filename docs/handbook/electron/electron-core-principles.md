# Electron 核心原理

> **版本**: 1.0  
> **最后更新**: 2026-07-26  
> **适用对象**: Electron 进阶开发者、桌面应用架构研究者

---

## 📑 目录

- [一、整体架构：Chromium + Node.js](#一整体架构chromium--nodejs)
- [二、多进程模型](#二多进程模型)
- [三、IPC 进程间通信](#三ipc-进程间通信)
- [四、Preload 脚本与上下文隔离](#四preload-脚本与上下文隔离)
- [五、渲染进程与 Chromium 渲染管线](#五渲染进程与-chromium-渲染管线)
- [六、Node.js 集成与事件循环](#六nodejs-集成与事件循环)
- [七、窗口管理与生命周期](#七窗口管理与生命周期)
- [八、应用生命周期](#八应用生命周期)
- [九、原生能力与系统集成](#九原生能力与系统集成)
- [十、GPU 进程与硬件加速](#十gpu-进程与硬件加速)
- [十一、安全模型](#十一安全模型)
- [十二、打包与自动更新原理](#十二打包与自动更新原理)

---

## 一、整体架构：Chromium + Node.js

### 1.1 Electron 的本质

```
Electron = Chromium（渲染引擎）+ Node.js（系统能力）+ 原生 API

┌──────────────────────────────────────────┐
│              Electron 应用                 │
├────────────────────┬─────────────────────┤
│    Chromium         │      Node.js         │
│  - 渲染 UI          │  - 文件系统           │
│  - 浏览器引擎        │  - 操作系统 API        │
│  - DevTools         │  - 进程/网络           │
│  - V8 引擎          │  - 原生模块（C++）      │
├────────────────────┴─────────────────────┤
│         Electron Native API               │
│   窗口 / 菜单 / 托盘 / 通知 / 自动更新        │
└──────────────────────────────────────────┘

核心思想：
- 用 Web 技术（HTML/CSS/JS）构建桌面 UI
- 用 Node.js 访问操作系统底层能力
- 两者共享同一个事件循环（关键设计）
```

### 1.2 双运行时如何共存

```
渲染进程中同时存在两个 JS 运行时：

┌─ 渲染进程 ─────────────────────┐
│  Chromium 的 V8 实例            │
│  （执行页面 JS、DOM API）         │
│                                 │
│  Node.js 的 V8 实例（集成）       │
│  （执行 require、fs、path）       │
│                                 │
│  两者被 Electron 融合：           │
│  - 共享事件循环                  │
│  - 全局对象合并                  │
│  - DOM 与 Node API 共存          │
└─────────────────────────────────┘

注意：
- 主进程只有 Node.js（无 DOM）
- 渲染进程默认有 Chromium，Node 集成可选
- 新版 Electron 推荐渲染进程关闭 Node，改用 Preload
```

### 1.3 与纯 Web / 其他桌面方案的对比

| 维度 | Electron | Tauri | 原生（Qt/WPF） |
| ---- | -------- | ----- | -------------- |
| UI 技术 | Web（Chromium） | Web（系统 WebView） | 原生控件 |
| 后端语言 | Node.js | Rust | C++/C# |
| 包体积 | 大（带 Chromium） | 小（复用系统 WebView） | 中 |
| 内存占用 | 高 | 低 | 低 |
| 跨平台一致性 | 极高 | 中（WebView 差异） | 中 |
| 生态成熟度 | 极成熟 | 成长中 | 成熟 |

---

## 二、多进程模型

### 2.1 进程类型

```
Electron 继承 Chromium 的多进程架构：

┌─ 主进程（Main Process）─────────────┐
│  - 每个应用只有一个                   │
│  - 运行 Node.js                      │
│  - 创建/管理窗口（BrowserWindow）      │
│  - 访问原生 API（菜单/托盘/对话框）     │
│  - 应用生命周期控制                    │
└──────────────────────────────────────┘
        │ 创建
        ↓
┌─ 渲染进程（Renderer Process）────────┐
│  - 每个窗口一个独立进程                │
│  - 运行 Chromium 渲染页面              │
│  - 默认沙箱隔离                        │
│  - 崩溃不影响其他窗口/主进程            │
└──────────────────────────────────────┘
        │
        ↓
┌─ 其他进程 ──────────────────────────┐
│  - GPU 进程：硬件加速渲染              │
│  - Utility 进程：网络/音视频等         │
│  - Crashpad 进程：崩溃上报             │
└──────────────────────────────────────┘
```

### 2.2 为什么用多进程

```
① 稳定性隔离
   - 一个渲染进程崩溃不会拖垮整个应用
   - 主进程可检测并重启崩溃的窗口

② 安全隔离
   - 渲染进程沙箱化，限制系统访问
   - 恶意网页内容无法直接接触 Node/OS

③ 性能并行
   - 多窗口并行渲染，互不阻塞
   - GPU 进程独立处理图形合成

代价：
- 内存占用高（每个进程独立的 V8/Chromium 实例）
- 进程间通信有序列化开销
```

### 2.3 进程与窗口的关系

```javascript
// 主进程：main.js
const { app, BrowserWindow } = require('electron')

function createWindow() {
  // 每次 new BrowserWindow 都会 fork 一个渲染进程
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // 上下文隔离（推荐）
      nodeIntegration: false,   // 关闭渲染进程 Node（推荐）
    },
  })
  win.loadFile('index.html')
}

app.whenReady().then(createWindow)

// 一个 BrowserWindow 实例 ←→ 一个渲染进程
// 主进程通过 win.webContents 与渲染进程交互
```

---

## 三、IPC 进程间通信

### 3.1 IPC 通信模型

```
主进程与渲染进程内存隔离，必须通过 IPC 通信：

渲染进程                    主进程
   │                         │
   │  ipcRenderer.send       │
   │  ─────────────────→     │  ipcMain.on
   │  （异步，单向）            │
   │                         │
   │  ipcRenderer.invoke     │
   │  ─────────────────→     │  ipcMain.handle
   │  ←─────────────────     │  （双向，Promise）
   │  （返回结果）              │
   │                         │
   │  webContents.send       │
   │  ←─────────────────     │  （主进程主动推送）
   │                         │

底层：基于 Chromium 的 Mojo IPC 管道（跨进程消息传递）
```

### 3.2 三种通信模式

```javascript
// ① 渲染 → 主（单向，无需返回）
// 渲染进程
ipcRenderer.send('log', { msg: 'hello' })
// 主进程
ipcMain.on('log', (event, data) => console.log(data.msg))

// ② 渲染 → 主 → 渲染（双向，推荐，Promise）
// 渲染进程
const result = await ipcRenderer.invoke('read-file', filePath)
// 主进程
ipcMain.handle('read-file', async (event, path) => {
  return await fs.promises.readFile(path, 'utf-8')
})

// ③ 主 → 渲染（主动推送）
// 主进程
win.webContents.send('update-progress', 50)
// 渲染进程
ipcRenderer.on('update-progress', (event, percent) => updateUI(percent))
```

### 3.3 IPC 性能与序列化

```
IPC 通信的开销来源：

① 结构化克隆（Structured Clone）
   - 数据跨进程需序列化/反序列化
   - 支持：基本类型/对象/数组/Map/Set/ArrayBuffer
   - 不支持：函数/DOM 节点/类实例方法

② 大数据传输优化
   - 避免频繁传输大对象
   - 二进制数据用 ArrayBuffer/SharedArrayBuffer
   - 高频数据（如鼠标位置）做节流

③ 最佳实践
   - 优先用 invoke/handle（语义清晰，自动错误传递）
   - 避免在渲染进程直接 require('electron').ipcRenderer
     （通过 Preload 暴露，见下章）
```

---

## 四、Preload 脚本与上下文隔离

### 4.1 为什么需要 Preload

```
问题背景：
- 渲染进程加载的是 Web 内容（可能不可信）
- 若开启 nodeIntegration，网页可直接访问 fs/child_process
  → 严重安全风险（XSS 即可执行系统命令）

解决方案：Preload 脚本 + 上下文隔离

Preload 脚本的特殊地位：
- 在渲染进程的页面 JS 执行前运行
- 可以访问 Node.js API 和 electron
- 但运行在独立的 JS 上下文中
- 通过 contextBridge 安全地向页面暴露受限 API
```

### 4.2 contextBridge 安全暴露

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron')

// 只暴露白名单方法，而非整个 ipcRenderer
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  onUpdate: (callback) => {
    // 包装回调，避免暴露 event 对象
    const sub = (_event, data) => callback(data)
    ipcRenderer.on('update', sub)
    return () => ipcRenderer.removeListener('update', sub)  // 返回取消订阅
  },
})

// 页面 JS（index.html 引用的脚本）
const content = await window.electronAPI.readFile('/path')
const unsub = window.electronAPI.onUpdate((data) => render(data))
```

### 4.3 上下文隔离原理

```
contextIsolation: true 时的内存模型：

渲染进程内有两个隔离的 JS 上下文：

┌─ 隔离上下文（Isolated World）─────┐
│  Preload 脚本运行于此              │
│  可访问 Node / electron API        │
│  拥有独立的 globalThis             │
└──────────────┬────────────────────┘
               │ contextBridge（受控通道）
               │ 仅传递可序列化数据 + 函数代理
┌──────────────┴────────────────────┐
│  主世界（Main World）              │
│  页面 JS 运行于此                  │
│  只能访问 window.electronAPI       │
│  无法触及 Node / 原型链污染         │
└───────────────────────────────────┘

安全价值：
- 页面 JS 无法修改 Preload 暴露对象的原型
- 即使页面被 XSS 注入，也只能调用白名单 API
- 阻断原型链污染攻击
```

---

## 五、渲染进程与 Chromium 渲染管线

### 5.1 页面渲染流程

```
loadFile/loadURL 后的渲染链路：

① 主进程发起导航
   win.loadFile('index.html')
       ↓
② 渲染进程加载资源
   解析 HTML → 构建 DOM 树
   解析 CSS → 构建 CSSOM 树
       ↓
③ 合成渲染树
   DOM + CSSOM → Render Tree
       ↓
④ 布局（Layout）
   计算每个节点的几何信息（Blink 引擎）
       ↓
⑤ 绘制（Paint）
   生成绘制指令（Paint Records）
       ↓
⑥ 合成（Composite）
   分图层 → GPU 进程光栅化 → 屏幕呈现

与浏览器的差异：
- 资源可从 file:// 或自定义协议加载
- 可拦截请求（protocol.register）
- 无地址栏/标签栏，但渲染管线相同
```

### 5.2 自定义协议

```javascript
// 主进程：注册自定义协议加载本地资源
const { protocol } = require('electron')

app.whenReady().then(() => {
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.replace('app://', '')
    callback({ path: path.normalize(`${__dirname}/${url}`) })
  })
})

// 渲染进程
win.loadURL('app://./index.html')

// 新版推荐 protocol.handle（基于 Response）
protocol.handle('app', (request) => {
  return net.fetch('file://' + request.url.slice('app://'.length))
})

价值：
- 避免 file:// 的 CORS/路径问题
- 可拦截、缓存、加密资源加载
```

---

## 六、Node.js 集成与事件循环

### 6.1 事件循环融合

```
Electron 的关键设计：Chromium 与 Node 共享事件循环

Chromium 消息循环（Message Loop）：
- 处理 UI 事件、渲染任务、IPC 消息

Node.js 事件循环（libuv）：
- 处理 fs/net/timer 等异步 I/O

Electron 的融合：
- 将 libuv 的事件循环集成进 Chromium 消息循环
- 两者在同一线程交替执行
- 使得 setTimeout 和 requestAnimationFrame 能协同工作

┌─ 统一事件循环 ──────────────┐
│  Chromium 任务队列            │
│  ├─ UI 事件                  │
│  ├─ 渲染帧                   │
│  └─ IPC 消息                 │
│  Node/libuv 任务队列          │
│  ├─ fs 回调                  │
│  ├─ timer                    │
│  └─ 网络 I/O                 │
│  （Electron 调度两者交替执行）  │
└──────────────────────────────┘
```

### 6.2 主进程 vs 渲染进程的 Node 能力

```
主进程：
- 完整 Node.js 环境
- 可 require 任意模块、原生 C++ 插件
- 访问 fs/child_process/net 等

渲染进程（默认配置）：
- nodeIntegration: false → 无 Node
- 仅通过 Preload 间接使用
- 若开启 nodeIntegration（不推荐）→ 完整 Node

为什么渲染进程要限制 Node：
- 渲染进程加载的可能是远程/不可信内容
- Node 能力 = 系统权限，暴露给网页极危险
- 现代 Electron 安全基线：渲染进程零 Node
```

### 6.3 原生模块（Native Modules）

```
Electron 使用 Node 的 N-API/ABI 加载 C++ 原生模块：

问题：
- 原生模块针对特定 Node ABI 编译
- Electron 内置的 Node 版本可能与系统不同
- 需用 electron-rebuild 针对 Electron 的 ABI 重新编译

// 重新编译原生模块
npx electron-rebuild

// 使用
const sqlite = require('better-sqlite3')  // 原生模块

常见原生模块：
- better-sqlite3（数据库）
- node-pty（终端）
- keytar（系统密钥链）
- sharp（图像处理）
```

---

## 七、窗口管理与生命周期

### 7.1 BrowserWindow 生命周期

```
窗口从创建到销毁的状态流转：

new BrowserWindow()
    ↓
'closed' 之前的事件序列：
    ↓
win.loadFile() → 'page-title-updated'
    ↓
'did-finish-load'（页面加载完成）
    ↓
'ready-to-show'（推荐此时 show，避免白屏闪烁）
    ↓
用户交互...
    ↓
win.close() → 'close'（可阻止）→ 'closed'（已销毁）

// 避免白屏：等 ready-to-show 再显示
const win = new BrowserWindow({ show: false })
win.once('ready-to-show', () => win.show())
win.loadFile('index.html')
```

### 7.2 窗口关闭的拦截

```javascript
// 'close' 事件可阻止（如最小化到托盘）
win.on('close', (event) => {
  if (!app.isQuitting) {
    event.preventDefault()  // 阻止关闭
    win.hide()              // 改为隐藏到托盘
  }
})

// 'closed' 事件不可阻止（窗口已销毁）
win.on('closed', () => {
  win = null  // 释放引用，避免内存泄漏
})

// 多窗口管理：跟踪所有窗口
const windows = new Set()
function createWindow() {
  const win = new BrowserWindow({...})
  windows.add(win)
  win.on('closed', () => windows.delete(win))
}
```

### 7.3 webContents：渲染进程的遥控器

```javascript
// webContents 是主进程操作渲染进程的核心对象
const wc = win.webContents

wc.loadURL('https://example.com')   // 导航
wc.reload()                          // 刷新
wc.send('channel', data)             // IPC 推送
wc.executeJavaScript('document.title')  // 注入执行 JS
wc.openDevTools()                    // 打开开发者工具
wc.print()                           // 打印
wc.capturePage()                     // 截图

// 监听渲染进程事件
wc.on('did-finish-load', () => {})
wc.on('new-window', (e, url) => {})  // 拦截新窗口
wc.on('crashed', () => {})           // 渲染进程崩溃
```

---

## 八、应用生命周期

### 8.1 app 生命周期事件

```
应用启动到退出的完整流程：

app 启动
    ↓
'will-finish-launching'（macOS 早期）
    ↓
'ready'（核心：可创建窗口）★
    ↓
'activate'（macOS 点击 Dock 图标）
    ↓
应用运行中...
    ↓
'before-quit'（可阻止）
    ↓
'will-quit'（可阻止）
    ↓
'quit'（已退出）

// 标准启动模板
const { app, BrowserWindow } = require('electron')

app.whenReady().then(() => {
  createWindow()

  // macOS：激活时若无窗口则重建
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 非 macOS：所有窗口关闭时退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

### 8.2 平台差异（重点）

```
macOS vs Windows/Linux 的退出语义：

macOS（darwin）：
- 关闭所有窗口 ≠ 退出应用
- 应用常驻 Dock，点图标可重新打开窗口
- 需 Cmd+Q 或 app.quit() 才真正退出

Windows/Linux：
- 关闭所有窗口 = 退出应用
- window-all-closed 时调用 app.quit()

单例锁（防止多开）：
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()  // 已有实例，退出当前
} else {
  app.on('second-instance', () => {
    // 聚焦已有窗口
    if (win) { win.show(); win.focus() }
  })
}
```

---

## 九、原生能力与系统集成

### 9.1 核心原生 API 速览

```javascript
const {
  Menu,          // 应用菜单
  Tray,          // 系统托盘
  Notification,  // 系统通知
  dialog,        // 原生对话框
  globalShortcut,// 全局快捷键
  clipboard,     // 剪贴板
  screen,        // 屏幕信息
  powerMonitor,  // 电源/休眠监听
  shell,         // 打开外部链接/文件
  autoUpdater,   // 自动更新
} = require('electron')

// 原生对话框
const { filePaths } = await dialog.showOpenDialog({
  properties: ['openFile', 'multiSelections'],
  filters: [{ name: '图片', extensions: ['png', 'jpg'] }],
})

// 系统通知
new Notification({ title: '提示', body: '下载完成' }).show()

// 全局快捷键
globalShortcut.register('CommandOrControl+Shift+K', () => {
  win.webContents.toggleDevTools()
})

// 打开外部链接（默认浏览器）
shell.openExternal('https://example.com')
```

### 9.2 托盘与菜单

```javascript
// 系统托盘
const tray = new Tray(path.join(__dirname, 'icon.png'))
tray.setToolTip('我的应用')
tray.setContextMenu(Menu.buildFromTemplate([
  { label: '显示', click: () => win.show() },
  { label: '退出', click: () => app.quit() },
]))

// 应用菜单（macOS 顶部菜单栏）
const menu = Menu.buildFromTemplate([
  {
    label: '文件',
    submenu: [
      { label: '新建', accelerator: 'CmdOrCtrl+N', click: createWindow },
      { type: 'separator' },
      { role: 'quit' },
    ],
  },
])
Menu.setApplicationMenu(menu)
```

---

## 十、GPU 进程与硬件加速

### 10.1 GPU 进程架构

```
Electron 的图形渲染由独立 GPU 进程负责：

渲染进程                    GPU 进程
   │                         │
   │  合成帧数据               │
   │  ─────────────────→     │
   │  （通过 GPU 命令缓冲区）   │  光栅化 + 合成
   │                         │  调用系统图形 API
   │                         │  （DirectX/Metal/OpenGL）
   │                         │
   │                         ↓
   │                      显示器

硬件加速的价值：
- CSS 动画/变换在 GPU 执行，不阻塞主线程
- Canvas/WebGL 高性能渲染
- 视频解码硬件加速
```

### 10.2 硬件加速的控制

```javascript
// 禁用硬件加速（某些环境/远程桌面需要）
app.disableHardwareAcceleration()

// 必须在 app.ready 之前调用

// 查看 GPU 状态
const gpuInfo = await app.getGPUInfo('complete')

// 命令行开关精细控制
app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('disable-software-rasterizer')

常见 GPU 问题：
- 远程桌面/虚拟机下黑屏 → 禁用硬件加速
- 某些显卡驱动崩溃 → 加入 GPU 黑名单
- 白屏 → 检查 --disable-gpu-compositing
```

---

## 十一、安全模型

### 11.1 安全配置基线

```javascript
// 推荐的 BrowserWindow 安全配置
new BrowserWindow({
  webPreferences: {
    contextIsolation: true,    // ✅ 上下文隔离（默认 true）
    nodeIntegration: false,    // ✅ 关闭渲染进程 Node（默认 false）
    sandbox: true,             // ✅ 沙箱模式
    preload: path.join(__dirname, 'preload.js'),
    webSecurity: true,         // ✅ 启用同源策略
    allowRunningInsecureContent: false,  // ✅ 禁止混合内容
  },
})

// 导航安全：限制可加载的 URL
win.webContents.on('will-navigate', (event, url) => {
  if (!isAllowedURL(url)) event.preventDefault()
})

// 拦截新窗口（防止 window.open 滥用）
win.webContents.setWindowOpenHandler(({ url }) => {
  shell.openExternal(url)  // 外部链接用浏览器打开
  return { action: 'deny' }
})
```

### 11.2 威胁模型与对策

| 威胁 | 来源 | 对策 |
| ---- | ---- | ---- |
| 远程代码执行 | XSS + nodeIntegration | 关闭 nodeIntegration + 上下文隔离 |
| 原型链污染 | 恶意页面修改全局对象 | contextIsolation: true |
| 导航劫持 | 加载恶意 URL | will-navigate 拦截白名单 |
| 中间人攻击 | HTTP 内容 | 仅 HTTPS + webSecurity |
| 依赖供应链 | 恶意 npm 包 | 锁定依赖 + 审计 |
| 不安全的 IPC | 渲染进程越权调用 | Preload 白名单 + 参数校验 |

### 11.3 CSP 内容安全策略

```html
<!-- index.html 中配置 CSP -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
">

价值：
- 即使存在 XSS，也限制脚本来源
- 禁止内联脚本执行（'self'）
- 限制可连接的后端域名
```

---

## 十二、打包与自动更新原理

### 12.1 打包流程（electron-builder）

```
源码到安装包的构建链路：

① 资源准备
   - 应用代码 + node_modules
   - asar 打包（归档为单个文件，防篡改/加速读取）

② 平台打包
   - Windows：NSIS 安装器 / portable exe
   - macOS：.dmg / .app（需代码签名 + 公证）
   - Linux：AppImage / deb / rpm

③ 代码签名
   - Windows：Authenticode 签名（避免 SmartScreen 警告）
   - macOS：Developer ID 签名 + Apple 公证（notarize）

④ 产物
   - 安装包 + latest.yml（更新元数据）

// package.json 配置
{
  "build": {
    "appId": "com.example.app",
    "mac": { "category": "public.app-category.developer-tools" },
    "win": { "target": "nsis" },
    "nsis": { "oneClick": false, "allowToChangeInstallationDirectory": true }
  }
}
```

### 12.2 asar 归档原理

```
asar = Electron 的虚拟文件系统归档格式

作用：
- 将 node_modules + 源码打包为单个 app.asar 文件
- 类似 tar，但不压缩（保持随机读取性能）

优势：
① 路径长度问题：避免 Windows 长路径限制
② 加载性能：减少大量小文件的 IO
③ 轻度保护：源码不直接暴露（但可解包，非加密）

// 解包查看（说明非加密）
npx asar extract app.asar ./src

注意：
- 含原生模块的包需配置 asarUnpack 解包
- asar 不是安全措施，敏感逻辑需额外加密
```

### 12.3 自动更新原理（electron-updater）

```
自动更新的完整流程：

① 检查更新
   autoUpdater.checkForUpdates()
       ↓ 请求 latest.yml（含版本号 + 文件哈希）
② 版本对比
   对比本地版本与远端 latest 版本
       ↓ 有新版本
③ 下载差量/全量包
   下载到临时目录，校验哈希
       ↓
④ 安装
   - Windows：退出后运行安装器静默更新
   - macOS：替换 .app（需重启）
       ↓
⑤ 重启生效
   autoUpdater.quitAndInstall()

// 主进程代码
const { autoUpdater } = require('electron-updater')

autoUpdater.on('update-available', (info) => notifyUser(info))
autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})
autoUpdater.checkForUpdatesAndNotify()

更新源：
- 静态文件服务器（latest.yml + 安装包）
- GitHub Releases
- S3 / 私有 CDN
```

### 12.4 增量更新与回滚

```
增量更新（Delta Update）：
- electron-builder 生成 blockmap 文件
- 客户端只下载变化的数据块
- 大幅减少下载体积（大应用尤其明显）

回滚机制：
- 更新失败自动回退到上一版本
- 灰度发布：按用户比例放量
- 强制版本：服务端标记最低版本

注意事项：
- 更新只替换 asar/资源，原生模块变更需完整安装
- macOS 更新需正确的签名与权限
- 更新服务器需支持 HTTPS + 哈希校验（防篡改）
```

---

## 📎 参考资源

- [Electron 官方文档](https://www.electronjs.org/docs/latest/)
- [Electron 进程模型](https://www.electronjs.org/docs/latest/tutorial/process-model)
- [Electron 上下文隔离](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- [Electron 安全清单](https://www.electronjs.org/docs/latest/tutorial/security)
- [electron-builder 文档](https://www.electron.build/)
