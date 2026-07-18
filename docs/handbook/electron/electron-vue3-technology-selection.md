# Electron + Vue 3 技术选型指南

> **版本**: 1.0  
> **最后更新**: 2026-07-19  
> **适用场景**: 使用 Vue 3 构建现代化 Electron 桌面应用

---

## 📑 目录

- [一、方案概述](#一方案概述)
- [二、核心框架选型](#二核心框架选型)
- [三、构建工具链](#三构建工具链)
- [四、UI 框架与组件库](#四ui-框架与组件库)
- [五、状态管理](#五状态管理)
- [六、路由方案](#六路由方案)
- [七、IPC 通信架构](#七ipc-通信架构)
- [八、数据持久化](#八数据持久化)
- [九、样式方案](#九样式方案)
- [十、测试策略](#十测试策略)
- [十一、打包与发布](#十一打包与发布)
- [十二、项目结构推荐](#十二项目结构推荐)
- [十三、性能优化策略](#十三性能优化策略)
- [十四、常见场景解决方案](#十四常见场景解决方案)

---

## 一、方案概述

### 1.1 为什么选择 Electron + Vue 3

| 优势 | 说明 |
|------|------|
| **生态成熟** | Vue 3 + Vite 生态完善，开发体验优秀 |
| **类型安全** | TypeScript + Composition API 提供完整的类型推导 |
| **开发效率** | HMR 热更新、组合式 API 复用逻辑 |
| **团队友好** | Vue 学习曲线平缓，团队上手快 |
| **跨平台** | 一套代码运行 macOS / Windows / Linux |

### 1.2 技术栈全景

```
┌─────────────────────────────────────────────────┐
│                Electron + Vue 3 技术栈            │
├─────────────────────────────────────────────────┤
│  框架层    Electron 35+ / Vue 3.5+ / TypeScript  │
│  构建层    Vite 6+ / electron-vite / esbuild     │
│  UI 层     Element Plus / Ant Design Vue / Naive │
│  状态层    Pinia / VueUse                         │
│  通信层    electron-trpc / 自定义 IPC Bridge      │
│  样式层    UnoCSS / Tailwind CSS / SCSS           │
│  测试层    Vitest / Playwright                    │
│  打包层    electron-builder / electron-forge      │
└─────────────────────────────────────────────────┘
```

---

## 二、核心框架选型

### 2.1 脚手架选择

| 方案 | 特点 | 推荐场景 |
|------|------|----------|
| **[electron-vite](https://electron-vite.org)** | 专为 Electron 设计的 Vite 构建工具，内置主进程/渲染进程/preload 多入口构建 | **首选推荐**，开箱即用 |
| [Vite + Electron 手动配置](https://vitejs.dev) | 灵活度高，但需要自行配置多进程构建 | 需要深度定制的场景 |
| [electron-vue](https://github.com/SimulatedGREG/electron-vue) | 老牌方案，社区维护 | 维护频率低，不推荐新项目 |

**推荐方案: electron-vite**

```bash
# 创建项目（支持 Vue + TypeScript）
npm create @quick-start/electron my-app -- --template vue-ts

# 或手动初始化
npm create @quick-start/electron my-app
# 选择: vue + TypeScript
```

### 2.2 核心依赖

```json
{
  "dependencies": {
    "vue": "^3.5",
    "vue-router": "^4.5",
    "pinia": "^3.0",
    "@vueuse/core": "^13.0"
  },
  "devDependencies": {
    "electron": "^35.0",
    "electron-vite": "^3.0",
    "vite": "^6.0",
    "typescript": "^5.7",
    "@vitejs/plugin-vue": "^5.0",
    "electron-builder": "^25.0"
  }
}
```

---

## 三、构建工具链

### 3.1 electron-vite 配置

```typescript
// electron.vite.config.ts
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'),
        },
      },
    },
  },
  renderer: {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
      },
    },
  },
})
```

### 3.2 开发环境 HMR

```typescript
// electron-vite 内置 HMR 支持
// 渲染进程修改 → 自动热更新
// 主进程/preload 修改 → 自动重启

// electron.vite.config.ts
export default defineConfig({
  renderer: {
    server: {
      port: 5173,
      host: '0.0.0.0',
    },
  },
})
```

### 3.3 环境变量

```typescript
// .env.development
VITE_API_BASE=http://localhost:3000
VITE_APP_TITLE=My App (Dev)

// .env.production
VITE_API_BASE=https://api.example.com
VITE_APP_TITLE=My App

// 渲染进程中使用
const apiBase = import.meta.env.VITE_API_BASE

// 主进程中使用 (electron-vite 自动注入)
const isDev = import.meta.env.DEV
```

---

## 四、UI 框架与组件库

### 4.1 组件库对比

| 组件库 | 特点 | 推荐场景 |
|--------|------|----------|
| **[Element Plus](https://element-plus.org)** | 功能全面、中文文档友好、企业级组件 | 后台管理类桌面应用 |
| **[Naive UI](https://www.naiveui.com)** | TypeScript 优先、主题定制灵活、Tree Shaking | 注重设计感的应用 |
| **[Ant Design Vue](https://antdv.com)** | 设计规范完善、组件丰富 | 复杂业务系统 |
| **[Arco Design Vue](https://arco.design)** | 字节出品、设计现代 | 中后台应用 |
| **[PrimeVue](https://primevue.org)** | 组件数量最多、主题丰富 | 需要大量组件的项目 |

### 4.2 推荐配置 (Element Plus)

```typescript
// 按需引入（推荐）
import { ElButton, ElInput, ElDialog, ElMessage } from 'element-plus'
import 'element-plus/es/components/button/style/css'

// 或使用自动导入
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default {
  plugins: [
    AutoImport({ resolvers: [ElementPlusResolver()] }),
    Components({ resolvers: [ElementPlusResolver()] }),
  ],
}
```

### 4.3 桌面应用特殊组件

```vue
<!-- 自定义标题栏组件 -->
<template>
  <div class="titlebar">
    <div class="titlebar-drag">{{ title }}</div>
    <div class="titlebar-controls">
      <button @click="minimize" class="control-btn">─</button>
      <button @click="toggleMaximize" class="control-btn">
        {{ isMaximized ? '❐' : '□' }}
      </button>
      <button @click="close" class="control-btn close-btn">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref(import.meta.env.VITE_APP_TITLE)
const isMaximized = ref(false)

const minimize = () => window.electronAPI.windowControl.minimize()
const toggleMaximize = async () => {
  isMaximized.value = await window.electronAPI.windowControl.toggleMaximize()
}
const close = () => window.electronAPI.windowControl.close()
</script>

<style scoped>
.titlebar {
  display: flex;
  align-items: center;
  height: 38px;
  -webkit-app-region: drag;
  user-select: none;
  background: var(--titlebar-bg);
}
.titlebar-drag { flex: 1; padding-left: 16px; }
.titlebar-controls {
  display: flex;
  -webkit-app-region: no-drag;
}
.control-btn {
  width: 46px;
  height: 38px;
  border: none;
  background: transparent;
  cursor: pointer;
}
.control-btn:hover { background: rgba(0, 0, 0, 0.1); }
.close-btn:hover { background: #e81123; color: white; }
</style>
```

---

## 五、状态管理

### 5.1 Pinia（推荐）

```typescript
// stores/app.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const theme = ref<'light' | 'dark'>('light')
  const language = ref('zh-CN')
  const sidebarCollapsed = ref(false)
  const recentFiles = ref<string[]>([])

  // Getters
  const isDarkMode = computed(() => theme.value === 'dark')

  // Actions
  async function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    // 持久化到 electron-store
    await window.electronAPI.store.set('theme', theme.value)
  }

  async function initFromStore() {
    const savedTheme = await window.electronAPI.store.get('theme')
    if (savedTheme) theme.value = savedTheme
  }

  return { theme, language, sidebarCollapsed, recentFiles, isDarkMode, toggleTheme, initFromStore }
})
```

### 5.2 跨窗口状态同步

```typescript
// composables/useSharedState.ts
import { ref, watch } from 'vue'

export function useSharedState<T>(key: string, defaultValue: T) {
  const value = ref<T>(defaultValue)

  // 监听主进程广播的状态变化
  window.electronAPI.onMessage(`store:changed:${key}`, (newValue: T) => {
    value.value = newValue
  })

  // 本地修改时通知主进程
  watch(value, async (newVal) => {
    await window.electronAPI.invoke('store:set', { key, value: newVal })
  })

  return value
}
```

---

## 六、路由方案

### 6.1 Vue Router 配置

```typescript
// router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'

// ⚠️ Electron 中必须使用 Hash 模式（file:// 协议不支持 History 模式）
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', component: () => import('@/views/Dashboard.vue') },
        { path: 'settings', component: () => import('@/views/Settings.vue') },
        { path: 'files/:id', component: () => import('@/views/FileEditor.vue') },
      ],
    },
    {
      path: '/login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/splash',
      component: () => import('@/views/SplashScreen.vue'),
    },
  ],
})
```

### 6.2 多窗口路由策略

```typescript
// 每个窗口使用独立的 Vue 实例 + 独立路由
// main.ts (窗口入口)
import { createApp } from 'vue'

// 根据 URL 参数决定加载哪个页面
const params = new URLSearchParams(window.location.search)
const page = params.get('page') || 'main'

const app = createApp(() => import(`@/pages/${page}/App.vue`))
app.use(createPinia())
// 每个窗口可以有独立的路由实例
if (page === 'main') {
  app.use(router)
}
app.mount('#app')
```

---

## 七、IPC 通信架构

### 7.1 类型安全的 IPC 设计

```typescript
// shared/ipc-channels.ts - 主进程和渲染进程共享
export interface IPCMap {
  'file:read': { args: { path: string }; result: string }
  'file:write': { args: { path: string; content: string }; result: boolean }
  'file:select': { args: void; result: string[] }
  'app:getVersion': { args: void; result: string }
  'app:getPlatform': { args: void; result: NodeJS.Platform }
  'store:get': { args: { key: string }; result: unknown }
  'store:set': { args: { key: string; value: unknown }; result: boolean }
  'window:minimize': { args: void; result: void }
  'window:maximize': { args: void; result: boolean }
  'window:close': { args: void; result: void }
}

export type IPCChannel = keyof IPCMap
```

### 7.2 Preload 类型安全暴露

```typescript
// preload/index.ts
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type { IPCMap } from '../shared/ipc-channels'

const electronAPI = {
  invoke: <C extends keyof IPCMap>(
    channel: C,
    ...args: IPCMap[C]['args'] extends void ? [] : [IPCMap[C]['args']]
  ): Promise<IPCMap[C]['result']> => {
    return ipcRenderer.invoke(channel, ...args)
  },
  send: <C extends keyof IPCMap>(
    channel: C,
    ...args: IPCMap[C]['args'] extends void ? [] : [IPCMap[C]['args']]
  ): void => {
    ipcRenderer.send(channel, ...args)
  },
  on: <C extends keyof IPCMap>(
    channel: C,
    callback: (data: IPCMap[C]['result']) => void
  ): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: IPCMap[C]['result']) => callback(data)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// 类型声明
declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}
```

### 7.3 主进程处理器注册

```typescript
// main/ipc-handlers.ts
import { ipcMain, dialog, app } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import Store from 'electron-store'

const store = new Store()

export function registerIpcHandlers() {
  ipcMain.handle('file:read', async (_, { path }) => {
    return await readFile(path, 'utf-8')
  })

  ipcMain.handle('file:write', async (_, { path, content }) => {
    await writeFile(path, content, 'utf-8')
    return true
  })

  ipcMain.handle('file:select', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openFile'] })
    return result.filePaths
  })

  ipcMain.handle('app:getVersion', () => app.getVersion())
  ipcMain.handle('store:get', (_, { key }) => store.get(key))
  ipcMain.handle('store:set', (_, { key, value }) => {
    store.set(key, value)
    return true
  })
}
```

---

## 八、数据持久化

### 8.1 electron-store 集成

```typescript
// main/store.ts
import Store from 'electron-store'

interface StoreSchema {
  theme: 'light' | 'dark'
  language: string
  windowBounds: { x: number; y: number; width: number; height: number }
  recentFiles: string[]
  settings: {
    autoSave: boolean
    fontSize: number
    tabSize: number
  }
}

export const store = new Store<StoreSchema>({
  defaults: {
    theme: 'light',
    language: 'zh-CN',
    windowBounds: { x: 100, y: 100, width: 1200, height: 800 },
    recentFiles: [],
    settings: {
      autoSave: true,
      fontSize: 14,
      tabSize: 2,
    },
  },
})
```

### 8.2 SQLite 方案 (大型数据)

```typescript
// main/database.ts
import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'node:path'

const dbPath = path.join(app.getPath('userData'), 'app.db')
export const db = new Database(dbPath)

// 初始化表结构
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// 注册 IPC 处理器
ipcMain.handle('db:query', (_, sql, params) => {
  return db.prepare(sql).all(...(params || []))
})

ipcMain.handle('db:execute', (_, sql, params) => {
  return db.prepare(sql).run(...(params || []))
})
```

---

## 九、样式方案

### 9.1 样式方案对比

| 方案 | 特点 | 推荐场景 |
|------|------|----------|
| **UnoCSS** | 原子化 CSS 引擎，极快的构建速度 | **首选推荐**，灵活高效 |
| **Tailwind CSS** | 最流行的原子化 CSS 框架 | 生态成熟，社区庞大 |
| **SCSS Modules** | 传统方案，样式隔离好 | 已有项目迁移 |

### 9.2 UnoCSS 配置

```typescript
// uno.config.ts
import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),           // 基础预设（类似 Tailwind）
    presetAttributify(),   // 属性化模式
    presetIcons({          // 图标即类名
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
  ],
  theme: {
    colors: {
      primary: '#409eff',
      titlebar: '#2c2c2c',
    },
  },
})
```

### 9.3 暗色模式适配

```typescript
// composables/useTheme.ts
import { useDark, useToggle } from '@vueuse/core'
import { watch } from 'vue'

export function useElectronTheme() {
  const isDark = useDark()
  const toggleDark = useToggle(isDark)

  // 同步系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    isDark.value = e.matches
  })

  // 通知主进程更新原生菜单/窗口主题
  watch(isDark, (dark) => {
    window.electronAPI.send('theme:changed', { dark })
  })

  return { isDark, toggleDark }
}
```

---

## 十、测试策略

### 10.1 单元测试 (Vitest)

```typescript
// __tests__/stores/app.test.ts
import { describe, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/stores/app'

// Mock electronAPI
vi.stubGlobal('electronAPI', {
  invoke: vi.fn().mockResolvedValue('light'),
  store: { get: vi.fn(), set: vi.fn() },
})

describe('App Store', () => {
  it('should toggle theme', async () => {
    setActivePinia(createPinia())
    const store = useAppStore()
    expect(store.theme).toBe('light')
    await store.toggleTheme()
    expect(store.theme).toBe('dark')
  })
})
```

### 10.2 E2E 测试 (Playwright)

```typescript
// e2e/app.spec.ts
import { test, expect, _electron } from '@playwright/test'

test('application launches', async () => {
  const electronApp = await _electron.launch({
    args: ['.'],
  })

  const window = await electronApp.firstWindow()
  await expect(window).toHaveTitle(/My App/)

  // 测试窗口操作
  const titlebar = window.locator('.titlebar')
  await expect(titlebar).toBeVisible()

  await electronApp.close()
})
```

---

## 十一、打包与发布

### 11.1 electron-builder 配置

```json
{
  "build": {
    "appId": "com.yourcompany.yourapp",
    "productName": "Your App",
    "directories": { "output": "release" },
    "files": [
      "out/**/*",
      "!node_modules/**/*"
    ],
    "mac": {
      "category": "public.app-category.developer-tools",
      "target": [
        { "target": "dmg", "arch": ["x64", "arm64"] },
        { "target": "zip", "arch": ["x64", "arm64"] }
      ]
    },
    "win": {
      "target": [
        { "target": "nsis", "arch": ["x64"] },
        { "target": "portable", "arch": ["x64"] }
      ]
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Development"
    },
    "publish": {
      "provider": "github",
      "owner": "your-org",
      "repo": "your-repo"
    }
  }
}
```

### 11.2 CI/CD 多平台构建

```yaml
# .github/workflows/build.yml
name: Build & Release
on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run build
      - uses: softprops/action-gh-release@v2
        with:
          files: |
            release/*.dmg
            release/*.exe
            release/*.AppImage
            release/*.deb
```

---

## 十二、项目结构推荐

```
my-electron-vue-app/
├── src/
│   ├── main/                    # 主进程
│   │   ├── index.ts             # 主进程入口
│   │   ├── ipc-handlers.ts      # IPC 处理器注册
│   │   ├── store.ts             # electron-store
│   │   ├── window.ts            # 窗口管理
│   │   ├── menu.ts              # 菜单配置
│   │   ├── tray.ts              # 系统托盘
│   │   └── updater.ts           # 自动更新
│   ├── preload/                 # Preload 脚本
│   │   ├── index.ts             # Preload 入口
│   │   └── index.d.ts           # 类型声明
│   ├── renderer/                # 渲染进程
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.ts          # Vue 入口
│   │       ├── App.vue
│   │       ├── assets/          # 静态资源
│   │       ├── components/      # 公共组件
│   │       │   └── Titlebar.vue
│   │       ├── composables/     # 组合式函数
│   │       │   ├── useTheme.ts
│   │       │   └── useElectron.ts
│   │       ├── layouts/         # 布局组件
│   │       ├── router/          # 路由配置
│   │       ├── stores/          # Pinia 状态
│   │       ├── views/           # 页面视图
│   │       └── styles/          # 全局样式
│   └── shared/                  # 主进程/渲染进程共享
│       ├── ipc-channels.ts      # IPC 通道定义
│       ├── constants.ts         # 常量
│       └── types.ts             # 共享类型
├── resources/                   # 打包资源（图标等）
├── electron.vite.config.ts      # 构建配置
├── electron-builder.yml         # 打包配置
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.web.json
└── package.json
```

---

## 十三、性能优化策略

### 13.1 启动优化

```typescript
// 1. 使用闪屏窗口减少白屏感知
const splash = new BrowserWindow({
  width: 400, height: 300,
  frame: false, transparent: true,
  alwaysOnTop: true,
})
splash.loadFile('resources/splash.html')

const mainWin = new BrowserWindow({ show: false, /* ... */ })
mainWin.loadURL(url)
mainWin.once('ready-to-show', () => {
  splash.close()
  mainWin.show()
})

// 2. 延迟加载非必要窗口
// 设置窗口、关于窗口等按需创建

// 3. 预加载优化
app.whenReady().then(async () => {
  createWindow()
  // 后台预热
  setTimeout(() => {
    loadNativeModules()
    checkForUpdates()
  }, 3000)
})
```

### 13.2 内存优化

```typescript
// 1. 使用 BrowserView 隔离独立页面
const settingsView = new BrowserView({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
  },
})

// 2. 限制 webContents 数量
const MAX_WINDOWS = 5
function createWindow() {
  if (BrowserWindow.getAllWindows().length >= MAX_WINDOWS) {
    const oldest = BrowserWindow.getAllWindows()[0]
    oldest.focus()
    return oldest
  }
  // 创建新窗口
}

// 3. 及时清理 IPC 监听器
function cleanup() {
  ipcMain.removeHandler('file:read')
  ipcMain.removeAllListeners('update-status')
}
```

---

## 十四、常见场景解决方案

### 14.1 文件拖放

```vue
<!-- FileDropZone.vue -->
<template>
  <div
    class="drop-zone"
    @drop.prevent="handleDrop"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    :class="{ dragging: isDragging }"
  >
    <slot>将文件拖放到此处</slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ files: [files: File[]] }>()
const isDragging = ref(false)

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  emit('files', files)
}
</script>
```

### 14.2 原生对话框封装

```typescript
// composables/useDialog.ts
export function useDialog() {
  const openFile = async (filters?: FileFilter[]) => {
    return await window.electronAPI.invoke('file:select', { filters })
  }

  const saveFile = async (defaultName: string) => {
    return await window.electronAPI.invoke('file:save', { defaultName })
  }

  const confirm = async (message: string, title = '确认') => {
    return await window.electronAPI.invoke('dialog:confirm', { message, title })
  }

  return { openFile, saveFile, confirm }
}
```

### 14.3 系统通知封装

```typescript
// composables/useNotification.ts
import { ref } from 'vue'

export function useNotification() {
  const permission = ref(Notification.permission)

  async function requestPermission() {
    permission.value = await Notification.requestPermission()
  }

  function notify(title: string, body: string, onClick?: () => void) {
    if (permission.value !== 'granted') return

    const notification = new Notification(title, {
      body,
      icon: '/icon.png',
      silent: false,
    })

    notification.onclick = () => {
      window.focus()
      onClick?.()
    }
  }

  return { permission, requestPermission, notify }
}
```

---

> **提示**: 本选型指南基于 Electron 35 + Vue 3.5 + Vite 6 + electron-vite 3 编写。技术栈会持续演进，建议定期关注各框架的更新日志。
