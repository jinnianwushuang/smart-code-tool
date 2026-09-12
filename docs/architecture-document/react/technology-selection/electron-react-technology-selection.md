# Electron + React 技术选型指南

> **版本**: 1.0  
> **最后更新**: 2026-07-19  
> **适用场景**: 使用 React 构建现代化 Electron 桌面应用

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

### 1.1 为什么选择 Electron + React

| 优势 | 说明 |
|------|------|
| **生态最丰富** | React 拥有最大的社区和 npm 生态 |
| **人才储备** | React 开发者数量最多，招聘容易 |
| **组件复用** | 可复用的 Web 端组件库直接用于桌面应用 |
| **并发渲染** | React 19 并发特性提升 UI 响应性 |
| **跨平台** | 一套代码运行 macOS / Windows / Linux |

### 1.2 技术栈全景

```
┌───────────────────────────────────────────────────┐
│              Electron + React 技术栈               │
├───────────────────────────────────────────────────┤
│  框架层    Electron 35+ / React 19 / TypeScript   │
│  构建层    Vite 6+ / electron-vite / esbuild      │
│  UI 层     shadcn/ui / Ant Design / Mantine        │
│  状态层    Zustand / TanStack Query / Jotai        │
│  通信层    electron-trpc / 自定义 IPC Bridge       │
│  样式层    Tailwind CSS / CSS Modules              │
│  测试层    Vitest / Playwright                     │
│  打包层    electron-builder / electron-forge       │
└───────────────────────────────────────────────────┘
```

---

## 二、核心框架选型

### 2.1 脚手架选择

| 方案 | 特点 | 推荐场景 |
|------|------|----------|
| **[electron-vite](https://electron-vite.org)** | 专为 Electron 设计的 Vite 构建工具，内置多入口构建 | **首选推荐**，开箱即用 |
| **[electron-forge + Vite](https://www.electronforge.io)** | Electron 官方推荐的打包工具，内置 Vite 插件 | 需要 Forge 生态的项目 |
| [Create React App + Electron](https://create-react-app.dev) | 已不推荐，CRA 进入维护模式 | 不推荐 |

**推荐方案: electron-vite**

```bash
# 创建项目（支持 React + TypeScript）
npm create @quick-start/electron my-app -- --template react-ts

# 或手动选择
npm create @quick-start/electron my-app
# 选择: react + TypeScript
```

### 2.2 核心依赖

```json
{
  "dependencies": {
    "react": "^19.0",
    "react-dom": "^19.0",
    "react-router-dom": "^7.0",
    "zustand": "^5.0",
    "@tanstack/react-query": "^5.0"
  },
  "devDependencies": {
    "electron": "^35.0",
    "electron-vite": "^3.0",
    "vite": "^6.0",
    "typescript": "^5.7",
    "@vitejs/plugin-react": "^4.0",
    "@types/react": "^19.0",
    "@types/react-dom": "^19.0",
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
import react from '@vitejs/plugin-react'
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
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
      },
    },
  },
})
```

### 3.2 React 19 编译器

```typescript
// React 19 内置编译器（React Compiler）
// electron.vite.config.ts
import react from '@vitejs/plugin-react'

export default defineConfig({
  renderer: {
    plugins: [
      react({
        babel: {
          plugins: [
            ['babel-plugin-react-compiler', {}],
          ],
        },
      }),
    ],
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

// 主进程中使用
const isDev = import.meta.env.DEV
```

---

## 四、UI 框架与组件库

### 4.1 组件库对比

| 组件库 | 特点 | 推荐场景 |
|--------|------|----------|
| **[shadcn/ui](https://ui.shadcn.com)** | 代码拷贝模式，高度定制化，基于 Radix UI + Tailwind | **首选推荐**，现代桌面应用 |
| **[Ant Design](https://ant.design)** | 企业级设计规范，组件丰富完善 | 复杂中后台桌面应用 |
| **[Mantine](https://mantine.dev)** | 内置 100+ 组件和 Hooks，TypeScript 优先 | 注重开发效率的应用 |
| **[Chakra UI](https://chakra-ui.com)** | 简洁 API，主题定制简单 | 轻量级桌面应用 |
| **[Radix UI Themes](https://www.radix-ui.com/themes)** | 官方主题系统，高质量原语 | 需要自定义设计系统 |

### 4.2 推荐配置 (shadcn/ui)

```bash
# 初始化 shadcn/ui
npx shadcn@latest init

# 安装常用组件
npx shadcn@latest add button dialog input select toast table tabs
```

```typescript
// 自动导入配置（可选）
// components.json 由 shadcn/ui 自动生成
// 组件直接复制到 src/components/ui/ 目录
```

### 4.3 桌面应用专用组件

```tsx
// components/Titlebar.tsx
import { useState, useCallback } from 'react'

export function Titlebar({ title }: { title: string }) {
  const [isMaximized, setIsMaximized] = useState(false)

  const handleMinimize = useCallback(() => {
    window.electronAPI.windowControl.minimize()
  }, [])

  const handleToggleMaximize = useCallback(async () => {
    const maximized = await window.electronAPI.windowControl.toggleMaximize()
    setIsMaximized(maximized)
  }, [])

  const handleClose = useCallback(() => {
    window.electronAPI.windowControl.close()
  }, [])

  return (
    <div className="flex h-[38px] items-center bg-[var(--titlebar-bg)] select-none drag">
      <div className="flex-1 pl-4 text-sm text-gray-600">{title}</div>
      <div className="flex no-drag">
        <button
          onClick={handleMinimize}
          className="w-[46px] h-[38px] border-none bg-transparent hover:bg-black/10 cursor-pointer"
        >
          ─
        </button>
        <button
          onClick={handleToggleMaximize}
          className="w-[46px] h-[38px] border-none bg-transparent hover:bg-black/10 cursor-pointer"
        >
          {isMaximized ? '❐' : '□'}
        </button>
        <button
          onClick={handleClose}
          className="w-[46px] h-[38px] border-none bg-transparent hover:bg-[#e81123] hover:text-white cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
```

---

## 五、状态管理

### 5.1 Zustand（推荐）

```typescript
// stores/useAppStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AppState {
  theme: 'light' | 'dark'
  language: string
  sidebarCollapsed: boolean
  recentFiles: string[]
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  addRecentFile: (path: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'zh-CN',
      sidebarCollapsed: false,
      recentFiles: [],

      setTheme: (theme) => {
        set({ theme })
        // 通知主进程更新原生主题
        window.electronAPI?.send('theme:changed', { dark: theme === 'dark' })
      },
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      addRecentFile: (path) =>
        set((s) => ({
          recentFiles: [path, ...s.recentFiles.filter((f) => f !== path)].slice(0, 10),
        })),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

### 5.2 TanStack Query（服务端状态）

```typescript
// providers/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

// hooks/useFiles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useFiles() {
  const queryClient = useQueryClient()

  const files = useQuery({
    queryKey: ['files'],
    queryFn: () => window.electronAPI.invoke('file:list'),
  })

  const readFile = useMutation({
    mutationFn: (path: string) => window.electronAPI.invoke('file:read', { path }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files'] }),
  })

  const saveFile = useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) =>
      window.electronAPI.invoke('file:write', { path, content }),
  })

  return { files, readFile, saveFile }
}
```

### 5.3 Jotai（原子化状态）

```typescript
// 适合细粒度状态更新的场景
import { atom, useAtom } from 'jotai'

const themeAtom = atom<'light' | 'dark'>('light')
const fontSizeAtom = atom(14)
const activeFileAtom = atom<string | null>(null)

// 派生原子
const isDarkAtom = atom((get) => get(themeAtom) === 'dark')

function ThemeToggle() {
  const [theme, setTheme] = useAtom(themeAtom)
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

---

## 六、路由方案

### 6.1 React Router 配置

```tsx
// router/index.tsx
import { createHashRouter, Navigate } from 'react-router-dom'

// ⚠️ Electron 中必须使用 Hash 路由（file:// 协议不支持 BrowserRouter）
export const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'settings', element: <Settings /> },
      {
        path: 'files',
        children: [
          { index: true, element: <FileList /> },
          { path: ':id', element: <FileEditor /> },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/splash',
    element: <SplashScreen />,
  },
])

// main.tsx
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

createRoot(document.getElementById('root')!).render(
  <QueryProvider>
    <RouterProvider router={router} />
  </QueryProvider>
)
```

### 6.2 路由守卫

```tsx
// components/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

// 使用
{
  path: '/',
  element: (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  ),
}
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
  'file:list': { args: void; result: FileInfo[] }
  'app:getVersion': { args: void; result: string }
  'app:getPlatform': { args: void; result: NodeJS.Platform }
  'store:get': { args: { key: string }; result: unknown }
  'store:set': { args: { key: string; value: unknown }; result: boolean }
  'dialog:confirm': { args: { message: string; title: string }; result: boolean }
  'window:minimize': { args: void; result: void }
  'window:maximize': { args: void; result: boolean }
  'window:close': { args: void; result: void }
}

export type IPCChannel = keyof IPCMap

interface FileInfo {
  name: string
  path: string
  size: number
  modified: Date
}
```

### 7.2 Preload 安全桥接

```typescript
// preload/index.ts
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type { IPCMap } from '../shared/ipc-channels'

const electronAPI = {
  invoke: <C extends keyof IPCMap>(
    channel: C,
    ...args: IPCMap[C]['args'] extends void ? [] : [IPCMap[C]['args']]
  ): Promise<IPCMap[C]['result']> => ipcRenderer.invoke(channel, ...args),

  send: <C extends keyof IPCMap>(
    channel: C,
    ...args: IPCMap[C]['args'] extends void ? [] : [IPCMap[C]['args']]
  ): void => ipcRenderer.send(channel, ...args),

  on: <C extends keyof IPCMap>(
    channel: C,
    callback: (data: IPCMap[C]['result']) => void
  ): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: IPCMap[C]['result']) => callback(data)
    ipcRenderer.on(channel, handler)
    return () => ipcRenderer.removeListener(channel, handler)
  },

  windowControl: {
    minimize: () => ipcRenderer.send('window:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}
```

### 7.3 自定义 Hook 封装

```typescript
// hooks/useElectron.ts
import { useEffect, useCallback } from 'react'

export function useElectronListener<C extends keyof IPCMap>(
  channel: C,
  callback: (data: IPCMap[C]['result']) => void
) {
  useEffect(() => {
    const cleanup = window.electronAPI.on(channel, callback)
    return cleanup
  }, [channel, callback])
}

export function useElectronInvoke<C extends keyof IPCMap>(channel: C) {
  return useCallback(
    (...args: IPCMap[C]['args'] extends void ? [] : [IPCMap[C]['args']]) =>
      window.electronAPI.invoke(channel, ...args),
    [channel]
  )
}

// 使用示例
function AppVersion() {
  const [version, setVersion] = useState('')
  const getVersion = useElectronInvoke('app:getVersion')

  useEffect(() => {
    getVersion().then(setVersion)
  }, [getVersion])

  return <span>v{version}</span>
}
```

---

## 八、数据持久化

### 8.1 electron-store 集成

```typescript
// main/store.ts
import Store from 'electron-store'
import { ipcMain } from 'electron'

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
    settings: { autoSave: true, fontSize: 14, tabSize: 2 },
  },
})

// 注册 IPC
ipcMain.handle('store:get', (_, { key }) => store.get(key))
ipcMain.handle('store:set', (_, { key, value }) => {
  store.set(key, value)
  return true
})
```

### 8.2 SQLite 方案 (大型数据)

```typescript
// main/database.ts
import Database from 'better-sqlite3'
import { app, ipcMain } from 'electron'
import path from 'node:path'

const dbPath = path.join(app.getPath('userData'), 'app.db')
export const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    content TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );
`)

ipcMain.handle('db:query', (_, sql, params) => db.prepare(sql).all(...(params || [])))
ipcMain.handle('db:execute', (_, sql, params) => db.prepare(sql).run(...(params || [])))
```

### 8.3 IndexedDB 方案 (渲染进程本地存储)

```typescript
// hooks/useLocalDB.ts
import { useEffect, useRef } from 'react'
import { openDB, type IDBPDatabase } from 'idb'

export function useLocalDB() {
  const dbRef = useRef<IDBPDatabase>()

  useEffect(() => {
    openDB('app-db', 1, {
      upgrade(db) {
        db.createObjectStore('cache', { keyPath: 'key' })
        db.createObjectStore('drafts', { keyPath: 'id', autoIncrement: true })
      },
    }).then((db) => {
      dbRef.current = db
    })
  }, [])

  const getCache = async (key: string) => {
    return dbRef.current?.get('cache', key)
  }

  const setCache = async (key: string, value: unknown) => {
    return dbRef.current?.put('cache', { key, value })
  }

  return { getCache, setCache }
}
```

---

## 九、样式方案

### 9.1 样式方案对比

| 方案 | 特点 | 推荐场景 |
|------|------|----------|
| **Tailwind CSS** | 最流行的原子化 CSS 框架 | **首选推荐**，与 shadcn/ui 完美搭配 |
| **CSS Modules** | 传统方案，样式隔离好 | 已有项目迁移 |
| **Styled Components** | CSS-in-JS，动态样式 | 高度动态的 UI |
| **Vanilla Extract** | 类型安全的 CSS-in-JS | 注重类型安全的项目 |

### 9.2 Tailwind CSS 配置

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        titlebar: '#2c2c2c',
        sidebar: { DEFAULT: '#f5f5f5', dark: '#1e1e1e' },
      },
      // 桌面应用专用
      drag: { '-webkit-app-region': 'drag' },
      noDrag: { '-webkit-app-region': 'no-drag' },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.drag': { '-webkit-app-region': 'drag' },
        '.no-drag': { '-webkit-app-region': 'no-drag' },
      })
    },
  ],
} satisfies Config
```

### 9.3 暗色模式

```tsx
// hooks/useTheme.ts
import { useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'

export function useTheme() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  useEffect(() => {
    // 应用主题到 HTML 元素
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    // 监听系统主题变化
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setTheme])

  return { theme, setTheme }
}
```

---

## 十、测试策略

### 10.1 单元测试 (Vitest)

```typescript
// __tests__/stores/useAppStore.test.ts
import { describe, it, expect, vi } from 'vitest'
import { useAppStore } from '@/stores/useAppStore'

// Mock electronAPI
vi.stubGlobal('electronAPI', {
  invoke: vi.fn().mockResolvedValue(undefined),
  send: vi.fn(),
  on: vi.fn().mockReturnValue(() => {}),
})

describe('useAppStore', () => {
  it('should toggle sidebar', () => {
    const store = useAppStore.getState()
    expect(store.sidebarCollapsed).toBe(false)
    store.toggleSidebar()
    expect(useAppStore.getState().sidebarCollapsed).toBe(true)
  })

  it('should add recent files', () => {
    const store = useAppStore.getState()
    store.addRecentFile('/path/to/file.ts')
    expect(useAppStore.getState().recentFiles).toContain('/path/to/file.ts')
  })
})
```

### 10.2 组件测试 (Testing Library)

```tsx
// __tests__/components/Titlebar.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Titlebar } from '@/components/Titlebar'

vi.stubGlobal('electronAPI', {
  windowControl: {
    minimize: vi.fn(),
    toggleMaximize: vi.fn().mockResolvedValue(false),
    close: vi.fn(),
  },
})

describe('Titlebar', () => {
  it('should render title', () => {
    render(<Titlebar title="Test App" />)
    expect(screen.getByText('Test App')).toBeInTheDocument()
  })

  it('should call minimize on click', () => {
    render(<Titlebar title="Test" />)
    fireEvent.click(screen.getByText('─'))
    expect(window.electronAPI.windowControl.minimize).toHaveBeenCalled()
  })
})
```

### 10.3 E2E 测试 (Playwright)

```typescript
// e2e/app.spec.ts
import { test, expect, _electron } from '@playwright/test'

test('application launches with correct title', async () => {
  const app = await _electron.launch({ args: ['.'] })
  const window = await app.firstWindow()

  await expect(window.locator('.titlebar')).toBeVisible()

  // 测试窗口交互
  await window.locator('button:has-text("□")').click()
  // 验证最大化状态...

  await app.close()
})

test('file operations work', async () => {
  const app = await _electron.launch({ args: ['.'] })
  const window = await app.firstWindow()

  await window.locator('[data-testid="open-file"]').click()
  // 验证文件对话框...

  await app.close()
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
    "files": ["out/**/*", "!node_modules/**/*"],
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
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true
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
my-electron-react-app/
├── src/
│   ├── main/                    # 主进程
│   │   ├── index.ts             # 主进程入口
│   │   ├── ipc-handlers.ts      # IPC 处理器注册
│   │   ├── store.ts             # electron-store
│   │   ├── database.ts          # SQLite 数据库
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
│   │       ├── main.tsx         # React 入口
│   │       ├── App.tsx          # 根组件
│   │       ├── assets/          # 静态资源
│   │       ├── components/      # 公共组件
│   │       │   ├── Titlebar.tsx
│   │       │   └── ui/          # shadcn/ui 组件
│   │       ├── hooks/           # 自定义 Hooks
│   │       │   ├── useTheme.ts
│   │       │   ├── useElectron.ts
│   │       │   └── useLocalDB.ts
│   │       ├── layouts/         # 布局组件
│   │       ├── pages/           # 页面组件
│   │       ├── router/          # 路由配置
│   │       ├── stores/          # Zustand 状态
│   │       ├── providers/       # Context Providers
│   │       └── styles/          # 全局样式
│   └── shared/                  # 主进程/渲染进程共享
│       ├── ipc-channels.ts      # IPC 通道定义
│       ├── constants.ts         # 常量
│       └── types.ts             # 共享类型
├── resources/                   # 打包资源（图标等）
├── electron.vite.config.ts      # 构建配置
├── electron-builder.yml         # 打包配置
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.web.json
└── package.json
```

---

## 十三、性能优化策略

### 13.1 启动优化

```tsx
// 1. 闪屏窗口
// main/window.ts
const splash = new BrowserWindow({
  width: 400, height: 300,
  frame: false, transparent: true,
})
splash.loadFile('resources/splash.html')

const mainWin = new BrowserWindow({ show: false })
mainWin.loadURL(url)
mainWin.once('ready-to-show', () => {
  splash.close()
  mainWin.show()
})

// 2. React.lazy 懒加载页面
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Settings = lazy(() => import('@/pages/Settings'))
const FileEditor = lazy(() => import('@/pages/FileEditor'))

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/files/:id" element={<FileEditor />} />
      </Routes>
    </Suspense>
  )
}
```

### 13.2 渲染优化

```tsx
// 1. React.memo 避免不必要的重渲染
const FileList = memo(function FileList({ files }: { files: FileInfo[] }) {
  return (
    <ul>
      {files.map((file) => (
        <FileItem key={file.path} file={file} />
      ))}
    </ul>
  )
})

// 2. 虚拟列表（大量数据）
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualFileList({ files }: { files: FileInfo[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
  })

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={item.key}
            style={{ position: 'absolute', top: item.start, height: item.size }}
          >
            <FileItem file={files[item.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}

// 3. useTransition 处理耗时更新
import { useTransition } from 'react'

function SearchBar() {
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')

  const handleSearch = (value: string) => {
    setQuery(value)
    startTransition(() => {
      // 耗时搜索操作
      performSearch(value)
    })
  }

  return <Input value={query} onChange={(e) => handleSearch(e.target.value)} />
}
```

### 13.3 内存优化

```typescript
// 1. 及时清理副作用
function FileManager() {
  useEffect(() => {
    const cleanup = window.electronAPI.on('file:changed', handleFileChange)
    return cleanup // 清理监听器
  }, [])

  useEffect(() => {
    const timer = setInterval(checkAutoSave, 30000)
    return () => clearInterval(timer) // 清理定时器
  }, [])
}

// 2. Web Worker 处理 CPU 密集任务
// workers/search.ts
self.onmessage = async (event) => {
  const { files, query } = event.data
  const results = files.filter((f: FileInfo) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  )
  self.postMessage(results)
}

// 主线程使用
function useWebWorkerSearch(files: FileInfo[], query: string) {
  const [results, setResults] = useState<FileInfo[]>([])

  useEffect(() => {
    const worker = new Worker(new URL('../workers/search.ts', import.meta.url))
    worker.postMessage({ files, query })
    worker.onmessage = (e) => setResults(e.data)
    return () => worker.terminate()
  }, [files, query])

  return results
}
```

---

## 十四、常见场景解决方案

### 14.1 文件拖放

```tsx
// components/FileDropZone.tsx
import { useState, useCallback, type DragEvent, type ReactNode } from 'react'

interface Props {
  onFiles: (files: File[]) => void
  children: ReactNode
}

export function FileDropZone({ onFiles, children }: Props) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files)
      onFiles(files)
    },
    [onFiles]
  )

  return (
    <div
      className={`relative ${isDragging ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
    >
      {children}
    </div>
  )
}
```

### 14.2 Toast 通知系统

```tsx
// 使用 shadcn/ui Toast
import { toast } from '@/components/ui/use-toast'

// IPC 通知 Hook
function useElectronNotifications() {
  useElectronListener('app:notification', (data) => {
    toast({
      title: data.title,
      description: data.message,
      variant: data.type === 'error' ? 'destructive' : 'default',
    })
  })
}
```

### 14.3 键盘快捷键

```tsx
// hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react'

type ShortcutHandler = () => void
type ShortcutMap = Record<string, ShortcutHandler>

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey || e.metaKey ? 'mod' : '',
        e.shiftKey ? 'shift' : '',
        e.altKey ? 'alt' : '',
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+')

      if (shortcuts[key]) {
        e.preventDefault()
        shortcuts[key]()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts])
}

// 使用
function App() {
  useKeyboardShortcuts({
    'mod+s': handleSave,
    'mod+n': handleNew,
    'mod+shift+p': handleCommandPalette,
    'mod+,': handleSettings,
  })
}
```

---

> **提示**: 本选型指南基于 Electron 35 + React 19 + Vite 6 + electron-vite 3 编写。技术栈会持续演进，建议定期关注各框架的更新日志。
