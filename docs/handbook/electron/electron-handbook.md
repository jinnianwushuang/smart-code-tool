# Electron 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-07-19  
> **适用对象**: Electron 开发者、桌面应用工程师

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、项目初始化](#二项目初始化)
- [三、进程模型](#三进程模型)
- [四、窗口管理](#四窗口管理)
- [五、进程间通信 (IPC)](#五进程间通信-ipc)
- [六、菜单与托盘](#六菜单与托盘)
- [七、文件系统与数据持久化](#七文件系统与数据持久化)
- [八、网络与协议](#八网络与协议)
- [九、安全最佳实践](#九安全最佳实践)
- [十、自动更新](#十自动更新)
- [十一、打包与分发](#十一打包与分发)
- [十二、调试与性能优化](#十二调试与性能优化)
- [十三、原生功能集成](#十三原生功能集成)
- [十四、常见问题与解决方案](#十四常见问题与解决方案)

---

## 一、基础概念

### 1.1 什么是 Electron

Electron 是一个使用 JavaScript、HTML 和 CSS 构建跨平台桌面应用的框架。它基于 Chromium 和 Node.js，让你可以用 Web 技术开发原生桌面应用。

```
┌─────────────────────────────────────────┐
│              Electron App               │
├──────────────────┬──────────────────────┤
│   Main Process   │   Renderer Process   │
│   (Node.js)      │   (Chromium)         │
│                  │                      │
│  - 窗口管理       │  - UI 渲染           │
│  - 系统 API       │  - DOM 操作          │
│  - 应用生命周期    │  - 用户交互           │
│  - 原生菜单       │  - Web API           │
└──────────────────┴──────────────────────┘
```

### 1.2 核心架构

| 组件 | 说明 |
|------|------|
| **Chromium** | 提供渲染引擎，负责显示 Web 页面 |
| **Node.js** | 提供系统级 API 访问能力 |
| **Native APIs** | 提供跨平台原生 GUI 能力（菜单、对话框、通知等） |

### 1.3 版本对应关系

```
Electron 35  → Chromium 134 + Node.js 22
Electron 34  → Chromium 132 + Node.js 20
Electron 33  → Chromium 130 + Node.js 20
```

---

## 二、项目初始化

### 2.1 快速创建

```bash
# 使用官方脚手架
npx create-electron-app my-electron-app

# 使用 Vite + Electron（推荐）
npm create @quick-start/electron my-electron-app
cd my-electron-app
npm install
npm run dev
```

### 2.2 手动初始化

```bash
mkdir my-electron-app && cd my-electron-app
npm init -y
npm install electron --save-dev
```

**package.json** 核心配置：

```json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "dev": "electron .",
    "build": "electron-builder",
    "build:mac": "electron-builder --mac",
    "build:win": "electron-builder --win",
    "build:linux": "electron-builder --linux"
  }
}
```

### 2.3 最小入口文件

```javascript
// main.js
const { app, BrowserWindow } = require('electron')
const path = require('node:path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // 开发环境加载本地服务，生产环境加载打包文件
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

### 2.4 Preload 脚本

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron')

// 通过 contextBridge 安全地暴露 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 发送消息到主进程
  sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  // 接收主进程消息
  onMessage: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args))
  },
  // 双向通信（invoke/handle）
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  // 获取平台信息
  platform: process.platform,
})
```

---

## 三、进程模型

### 3.1 主进程 (Main Process)

```javascript
// 主进程可用的模块
const {
  app,              // 应用生命周期
  BrowserWindow,    // 窗口管理
  Menu,             // 原生菜单
  Tray,             // 系统托盘
  dialog,           // 原生对话框
  Notification,     // 系统通知
  globalShortcut,   // 全局快捷键
  clipboard,        // 剪贴板
  shell,            // 系统 Shell 操作
  powerMonitor,     // 电源状态监控
  session,          // 会话管理
  net,              // HTTP 请求
} = require('electron')
```

### 3.2 渲染进程 (Renderer Process)

```javascript
// 渲染进程通过 preload 暴露的 API 与主进程通信
// ❌ 不要直接 require electron 模块
// ✅ 使用 contextBridge 暴露的安全 API

window.electronAPI.invoke('get-app-version').then(version => {
  console.log('App version:', version)
})
```

### 3.3 进程间关系图

```
Main Process (Node.js)
    │
    ├── preload.js (Bridge)
    │       │
    │       ▼
    └── Renderer Process (Chromium)
            │
            ├── window 1
            ├── window 2
            └── window N
```

---

## 四、窗口管理

### 4.1 创建多窗口

```javascript
const windows = new Set()

function createWindow(url, options = {}) {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 300,
    titleBarStyle: 'hiddenInset', // macOS 隐藏标题栏
    trafficLightPosition: { x: 15, y: 18 },
    frame: process.platform === 'darwin' ? false : true,
    ...options,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.loadURL(url)
  windows.add(win)

  win.on('closed', () => windows.delete(win))
  return win
}
```

### 4.2 窗口事件

```javascript
win.on('close', (event) => {
  // 关闭前确认
  const choice = dialog.showMessageBoxSync(win, {
    type: 'question',
    buttons: ['取消', '确定关闭'],
    title: '确认',
    message: '确定要关闭窗口吗？',
  })
  if (choice === 0) event.preventDefault()
})

win.on('resize', () => {
  const [width, height] = win.getSize()
  console.log(`Window resized to ${width}x${height}`)
})

// 窗口状态保存
win.on('close', () => {
  const bounds = win.getBounds()
  // 保存到配置文件
  store.set('windowBounds', bounds)
})
```

### 4.3 无边框窗口与自定义标题栏

```javascript
// 主进程
const win = new BrowserWindow({
  frame: false, // 或 titleBarStyle: 'hiddenInset'
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
  },
})

// preload.js
contextBridge.exposeInMainWorld('windowControl', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
})

// 主进程处理
ipcMain.on('window:minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender).minimize()
})
ipcMain.on('window:maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  win.isMaximized() ? win.unmaximize() : win.maximize()
})
ipcMain.on('window:close', (event) => {
  BrowserWindow.fromWebContents(event.sender).close()
})
```

### 4.4 窗口拖拽区域

```css
/* CSS: 定义可拖拽区域 */
.titlebar {
  -webkit-app-region: drag;
  height: 38px;
  user-select: none;
}

.titlebar button {
  -webkit-app-region: no-drag; /* 按钮不可拖拽 */
}
```

---

## 五、进程间通信 (IPC)

### 5.1 单向通信 (send/on)

```javascript
// 渲染进程 → 主进程
// renderer.js
window.electronAPI.sendMessage('update-status', { status: 'active' })

// main.js
ipcMain.on('update-status', (event, data) => {
  console.log('Status:', data.status)
})

// 主进程 → 渲染进程
// main.js
win.webContents.send('app-notification', { message: '更新完成' })

// renderer.js
window.electronAPI.onMessage('app-notification', (data) => {
  showToast(data.message)
})
```

### 5.2 双向通信 (invoke/handle)

```javascript
// renderer.js - 调用并等待结果
const result = await window.electronAPI.invoke('read-file', '/path/to/file')
console.log(result)

// main.js - 处理请求并返回结果
ipcMain.handle('read-file', async (event, filePath) => {
  const content = await fs.promises.readFile(filePath, 'utf-8')
  return content
})
```

### 5.3 IPC 通道设计模式

```javascript
// 统一管理 IPC 通道
const IPC_CHANNELS = {
  // 文件操作
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_SELECT: 'file:select',
  // 窗口操作
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  // 应用操作
  APP_VERSION: 'app:version',
  APP_UPDATE: 'app:update',
}

module.exports = { IPC_CHANNELS }
```

---

## 六、菜单与托盘

### 6.1 应用菜单

```javascript
const { Menu, app } = require('electron')

const template = [
  {
    label: '文件',
    submenu: [
      {
        label: '新建文件',
        accelerator: 'CmdOrCtrl+N',
        click: () => createNewFile(),
      },
      {
        label: '打开文件',
        accelerator: 'CmdOrCtrl+O',
        click: () => openFile(),
      },
      { type: 'separator' },
      {
        label: '退出',
        accelerator: 'CmdOrCtrl+Q',
        click: () => app.quit(),
      },
    ],
  },
  {
    label: '编辑',
    submenu: [
      { role: 'undo', label: '撤销' },
      { role: 'redo', label: '重做' },
      { type: 'separator' },
      { role: 'cut', label: '剪切' },
      { role: 'copy', label: '复制' },
      { role: 'paste', label: '粘贴' },
      { role: 'selectAll', label: '全选' },
    ],
  },
  {
    label: '视图',
    submenu: [
      { role: 'reload', label: '刷新' },
      { role: 'toggleDevTools', label: '开发者工具' },
      { type: 'separator' },
      { role: 'zoomIn', label: '放大' },
      { role: 'zoomOut', label: '缩小' },
      { role: 'resetZoom', label: '重置缩放' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: '全屏' },
    ],
  },
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
```

### 6.2 右键菜单

```javascript
const contextMenu = Menu.buildFromTemplate([
  { label: '剪切', role: 'cut' },
  { label: '复制', role: 'copy' },
  { label: '粘贴', role: 'paste' },
  { type: 'separator' },
  { label: '检查元素', click: () => win.webContents.inspectElement(x, y) },
])

// 监听右键事件
win.webContents.on('context-menu', (event, params) => {
  contextMenu.popup({ window: win, x: params.x, y: params.y })
})
```

### 6.3 系统托盘

```javascript
const { Tray, Menu, nativeImage } = require('electron')

let tray = null

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/tray-icon.png'))
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示主窗口', click: () => win.show() },
    { label: '隐藏主窗口', click: () => win.hide() },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() },
  ])

  tray.setToolTip('My Electron App')
  tray.setContextMenu(contextMenu)

  // 双击托盘图标显示窗口
  tray.on('double-click', () => {
    win.isVisible() ? win.hide() : win.show()
  })
}
```

---

## 七、文件系统与数据持久化

### 7.1 文件对话框

```javascript
const { dialog } = require('electron')

// 打开文件
ipcMain.handle('file:open', async () => {
  const result = await dialog.showOpenDialog(win, {
    title: '选择文件',
    filters: [
      { name: '所有文件', extensions: ['*'] },
      { name: '图片', extensions: ['jpg', 'png', 'gif'] },
      { name: '文档', extensions: ['pdf', 'doc', 'docx'] },
    ],
    properties: ['openFile', 'multiSelections'],
  })
  return result
})

// 保存文件
ipcMain.handle('file:save', async (event, defaultName) => {
  const result = await dialog.showSaveDialog(win, {
    title: '保存文件',
    defaultPath: defaultName,
    filters: [{ name: '文本文件', extensions: ['txt'] }],
  })
  return result
})
```

### 7.2 数据持久化 (electron-store)

```javascript
const Store = require('electron-store')

const store = new Store({
  name: 'app-config',
  defaults: {
    windowBounds: { width: 1200, height: 800 },
    theme: 'light',
    language: 'zh-CN',
    recentFiles: [],
  },
})

// 读写数据
store.set('theme', 'dark')
const theme = store.get('theme')

// 监听变化
store.onDidChange('theme', (newValue, oldValue) => {
  console.log(`Theme changed: ${oldValue} → ${newValue}`)
})
```

### 7.3 应用数据路径

```javascript
const { app } = require('electron')

// 各平台数据目录
console.log(app.getPath('userData'))
// macOS: ~/Library/Application Support/my-electron-app
// Windows: %APPDATA%/my-electron-app
// Linux: ~/.config/my-electron-app

console.log(app.getPath('documents')) // 用户文档目录
console.log(app.getPath('downloads')) // 下载目录
console.log(app.getPath('temp'))      // 临时目录
```

---

## 八、网络与协议

### 8.1 HTTP 请求

```javascript
const { net } = require('electron')

ipcMain.handle('net:request', async (event, url) => {
  return new Promise((resolve, reject) => {
    const request = net.request(url)
    let body = ''

    request.on('response', (response) => {
      response.on('data', (chunk) => { body += chunk })
      response.on('end', () => {
        resolve({ status: response.statusCode, body })
      })
    })

    request.on('error', reject)
    request.end()
  })
})
```

### 8.2 自定义协议

```javascript
const { protocol } = require('electron')

// 注册自定义协议
protocol.registerFileProtocol('app', (request, callback) => {
  const url = request.url.replace('app://', '')
  callback({ path: path.join(__dirname, 'assets', url) })
})

// 使用: <img src="app://logo.png">

// 注册 stream 协议（支持大文件）
protocol.registerStreamProtocol('media', (request, callback) => {
  const url = new URL(request.url)
  const filePath = decodeURIComponent(url.pathname)
  callback({
    statusCode: 200,
    headers: { 'content-type': 'video/mp4' },
    data: fs.createReadStream(filePath),
  })
})
```

---

## 九、安全最佳实践

### 9.1 核心安全原则

```javascript
// ✅ 推荐配置
const win = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,    // 隔离上下文
    nodeIntegration: false,    // 禁用 Node.js 集成
    sandbox: true,             // 启用沙箱
    webSecurity: true,         // 启用 Web 安全策略
    allowRunningInsecureContent: false,
  },
})

// ✅ 设置 CSP
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
      ],
    },
  })
})
```

### 9.2 安全检查清单

```
✅ 始终使用 contextIsolation: true
✅ 始终使用 nodeIntegration: false
✅ 启用 sandbox: true
✅ 使用 preload 脚本暴露最小化 API
✅ 验证所有 IPC 消息的来源
✅ 设置 Content-Security-Policy
✅ 禁用导航到新窗口 (will-navigate)
✅ 限制 webview 标签使用
✅ 不在渲染进程直接引入 Node.js 模块
✅ 对远程内容进行严格校验
```

### 9.3 导航安全

```javascript
// 阻止导航到新页面
win.webContents.on('will-navigate', (event, url) => {
  if (url !== win.webContents.getURL()) {
    event.preventDefault()
    shell.openExternal(url) // 在浏览器中打开
  }
})

// 阻止新窗口打开
win.webContents.setWindowOpenHandler(({ url }) => {
  shell.openExternal(url)
  return { action: 'deny' }
})
```

---

## 十、自动更新

### 10.1 electron-updater 配置

```javascript
// main.js
const { autoUpdater } = require('electron-updater')

function setupAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify()

  autoUpdater.on('checking-for-update', () => {
    log.info('正在检查更新...')
  })

  autoUpdater.on('update-available', (info) => {
    log.info('发现新版本:', info.version)
    win.webContents.send('update-available', info)
  })

  autoUpdater.on('update-not-available', () => {
    log.info('当前已是最新版本')
  })

  autoUpdater.on('download-progress', (progress) => {
    win.webContents.send('update-progress', {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send('update-downloaded', info)
  })

  autoUpdater.on('error', (err) => {
    log.error('更新失败:', err)
  })
}

// 处理用户的安装确认
ipcMain.on('update:install', () => {
  autoUpdater.quitAndInstall()
})
```

### 10.2 electron-builder 发布配置

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "your-name",
      "repo": "your-repo"
    }
  }
}
```

---

## 十一、打包与分发

### 11.1 electron-builder 配置

```json
{
  "build": {
    "appId": "com.example.myapp",
    "productName": "My App",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "main.js",
      "preload.js"
    ],
    "mac": {
      "category": "public.app-category.developer-tools",
      "target": ["dmg", "zip"],
      "icon": "build/icon.icns",
      "hardenedRuntime": true,
      "gatekeeperAssess": false
    },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "build/icon.ico"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "build/icons"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true
    }
  }
}
```

### 11.2 打包命令

```bash
# 全平台打包
npm run build

# 指定平台
npx electron-builder --mac --x64 --arm64
npx electron-builder --win --x64
npx electron-builder --linux --x64

# 仅打包不生成安装包（调试用）
npx electron-builder --dir
```

### 11.3 代码签名

```bash
# macOS 签名
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="your-password"
npm run build

# Windows 签名（使用 EV 证书）
export CSC_LINK="path/to/certificate.pfx"
export CSC_KEY_PASSWORD="your-password"
npm run build
```

---

## 十二、调试与性能优化

### 12.1 调试配置

```javascript
// VS Code launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Electron: Main",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "args": ["${workspaceFolder}/main.js"],
      "env": { "NODE_ENV": "development" }
    },
    {
      "name": "Electron: Renderer",
      "type": "chrome",
      "request": "attach",
      "port": 9222,
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

### 12.2 性能优化策略

```javascript
// 1. 延迟加载窗口
app.whenReady().then(() => {
  // 先创建隐藏的主窗口
  const win = new BrowserWindow({ show: false })
  win.loadFile('index.html')
  win.once('ready-to-show', () => win.show())
})

// 2. 避免同步 IPC
// ❌ 使用 ipcRenderer.sendSync
// ✅ 使用 ipcRenderer.invoke (异步)

// 3. 减少窗口数量，使用 BrowserView 替代
const view = new BrowserView()
win.setBrowserView(view)
view.setBounds({ x: 0, y: 38, width: 1200, height: 762 })
view.webContents.loadURL('https://example.com')

// 4. 内存泄漏预防
win.on('closed', () => {
  // 清理事件监听器、定时器等
  clearInterval(timer)
  win.removeAllListeners()
})
```

### 12.3 性能监控

```javascript
// 监控渲染进程内存
const metrics = await win.webContents.executeJavaScript(`
  ({
    jsHeapUsed: performance.memory.usedJSHeapSize,
    jsHeapTotal: performance.memory.totalJSHeapSize,
  })
`)

// 主进程内存
console.log('Main process memory:', process.memoryUsage())
```

---

## 十三、原生功能集成

### 13.1 系统通知

```javascript
const { Notification } = require('electron')

ipcMain.handle('notification:show', async (event, { title, body }) => {
  if (!Notification.isSupported()) return false

  const notification = new Notification({
    title,
    body,
    icon: path.join(__dirname, 'assets/icon.png'),
  })
  notification.show()

  notification.on('click', () => {
    win.show()
    win.focus()
  })

  return true
})
```

### 13.2 全局快捷键

```javascript
const { globalShortcut } = require('electron')

app.whenReady().then(() => {
  // 注册全局快捷键
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    win.webContents.toggleDevTools()
  })

  globalShortcut.register('CommandOrControl+Shift+N', () => {
    createWindow('http://localhost:5173/new')
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
```

### 13.3 剪贴板操作

```javascript
const { clipboard, nativeImage } = require('electron')

// 文本操作
clipboard.writeText('Hello Electron')
const text = clipboard.readText()

// 图片操作
const image = nativeImage.createFromPath('icon.png')
clipboard.writeImage(image)

// HTML 内容
clipboard.writeHTML('<b>Bold Text</b>')
```

### 13.4 电源监控

```javascript
const { powerMonitor } = require('electron')

powerMonitor.on('suspend', () => {
  console.log('系统即将休眠')
  // 暂停任务、保存状态
})

powerMonitor.on('resume', () => {
  console.log('系统已唤醒')
  // 恢复任务、重新加载数据
})

powerMonitor.on('lock-screen', () => {
  console.log('屏幕已锁定')
})

powerMonitor.on('on-ac', () => {
  console.log('已接通电源')
})

powerMonitor.on('on-battery', () => {
  console.log('使用电池供电')
})
```

---

## 十四、常见问题与解决方案

### 14.1 常见问题速查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 白屏闪烁 | 窗口未准备好就显示 | 使用 `show: false` + `ready-to-show` |
| IPC 通信失败 | 通道名不匹配 | 统一使用常量管理通道名 |
| 打包后白屏 | 路径问题 | 使用 `__dirname` + `path.join` |
| 模块找不到 | 原生模块未重编译 | `electron-rebuild` |
| macOS 权限拒绝 | 未配置 entitlements | 添加 `entitlements.mac.plist` |
| 自动更新失败 | 签名或发布配置错误 | 检查 `publish` 配置和代码签名 |

### 14.2 打包后路径问题

```javascript
// ❌ 错误：开发环境相对路径在打包后失效
win.loadFile('dist/index.html')

// ✅ 正确：使用 path.join 处理路径
const isDev = !app.isPackaged
if (isDev) {
  win.loadURL('http://localhost:5173')
} else {
  win.loadFile(path.join(__dirname, 'dist/index.html'))
}
```

### 14.3 原生模块重编译

```bash
# 安装 electron-rebuild
npm install --save-dev @electron/rebuild

# 重新编译原生模块
npx electron-rebuild

# 或在 package.json 中添加脚本
{
  "scripts": {
    "postinstall": "electron-rebuild"
  }
}
```

---

> **提示**: 本手册基于 Electron 35.x 编写，部分 API 在不同版本间可能有差异，请参考 [Electron 官方文档](https://www.electronjs.org/docs) 获取最新信息。
