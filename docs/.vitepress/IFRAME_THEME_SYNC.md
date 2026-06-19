# Iframe 内嵌文档主题联动方案

## 📋 概述

本方案实现了主应用通过 **iframe 内嵌** VitePress 文档时的主题色切换联动。当用户在主应用中切换主题时，iframe 内的 VitePress 文档会实时同步主题状态。

## 🎯 架构说明

```
┌─────────────────────────────────────┐
│         主应用 (Quasar)              │
│  ┌───────────────────────────────┐  │
│  │     LayoutHeader               │  │
│  │  - 主题切换按钮                 │  │
│  │  - 菜单导航                     │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │     LayoutDocs (路由: /docs)   │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   iframe                │  │  │
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │  VitePress 文档    │  │  │  │
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 🔧 技术实现

### 1. **主应用端 - layout-header.vue**

#### 功能：主题切换时同步到 iframe

```javascript
const hanle_toogle = () => {
  isDarkTheme.value = !isDarkTheme.value

  // 如果当前在文档页面，同步主题到 VitePress
  if (route.path.includes('/docs')) {
    syncThemeToDocs()
  }
}

// 同步主题到文档 iframe
const syncThemeToDocs = () => {
  const currentTheme = isDarkTheme.value ? 'dark' : 'light'

  // 查找文档页面的 iframe 元素
  const iframe = document.querySelector('iframe[src*="docs"]')

  if (iframe && iframe.contentWindow) {
    // 向 iframe 发送主题变更消息
    iframe.contentWindow.postMessage({ type: 'theme-change', theme: currentTheme }, '*')
    console.log('[Header] 主题已同步到 iframe:', currentTheme)
  }
}
```

### 2. **主应用端 - layout-docs.vue**

#### 功能：iframe 加载完成后发送初始主题 + 监听主题变化

```javascript
import { isDarkTheme } from 'src/output/common/project-common.js'

onMounted(() => {
  // iframe 加载完成后发送初始主题
  const iframe = document.querySelector('iframe[src*="docs"]')
  if (iframe) {
    iframe.addEventListener('load', () => {
      syncThemeToIframe()
    })
  }
})

// 监听主题变化，同步到 iframe
watch(isDarkTheme, () => {
  syncThemeToIframe()
})

// 同步主题到 iframe
const syncThemeToIframe = () => {
  const iframe = iframe_ref.value
  const currentTheme = isDarkTheme.value ? 'dark' : 'light'

  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: 'theme-change', theme: currentTheme }, '*')
    console.log('[Docs Layout] 主题已同步到 iframe:', currentTheme)
  }
}
```

### 3. **VitePress 端 - .vitepress/theme/index.js**

#### 功能：接收父窗口消息并应用主题

```javascript
export default {
  ...DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 监听来自主应用的主题变更消息
    if (typeof window !== 'undefined') {
      window.addEventListener('message', handleThemeMessage)
    }
  },
}

/**
 * 处理来自主应用的主题变更消息
 */
function handleThemeMessage(event) {
  if (event.data && event.data.type === 'theme-change') {
    applyTheme(event.data.theme)
  }
}

/**
 * 应用主题到 VitePress
 */
function applyTheme(theme) {
  if (typeof window === 'undefined') return

  const html = document.documentElement

  if (theme === 'dark') {
    html.classList.add('dark')
    localStorage.setItem('vitepress-theme-appearance', 'dark')
  } else {
    html.classList.remove('dark')
    localStorage.setItem('vitepress-theme-appearance', 'light')
  }

  // 触发自定义事件
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }))
}
```

## 🚀 工作流程

### 场景 1：进入文档页面

```
用户点击"文档"菜单
  ↓
router.push({ name: 'docs' })
  ↓
加载 layout-docs.vue
  ↓
iframe 开始加载 ./docs/index.html
  ↓
iframe load 事件触发
  ↓
syncThemeToIframe() 发送当前主题
  ↓
postMessage({ type: 'theme-change', theme: 'dark' })
  ↓
VitePress 接收消息
  ↓
applyTheme('dark')
  ↓
HTML 添加 class="dark"
  ↓
文档显示深色主题 ✓
```

### 场景 2：切换主题

```
用户点击主题切换按钮
  ↓
hanle_toogle() 触发
  ↓
isDarkTheme.value = !isDarkTheme.value
  ↓
检测到在 /docs 路由
  ↓
syncThemeToDocs() 执行
  ↓
查找 iframe 元素
  ↓
iframe.contentWindow.postMessage(...)
  ↓
VitePress 接收消息
  ↓
handleThemeMessage(event)
  ↓
applyTheme('light')
  ↓
HTML 移除 class="dark"
  ↓
文档实时切换为浅色主题 ✓
```

## 📊 关键代码位置

| 文件                        | 功能                    | 行号      |
| --------------------------- | ----------------------- | --------- |
| `layout-header.vue`         | 主题切换按钮 + 同步函数 | L81-L102  |
| `layout-header.vue`         | 菜单点击处理            | L104-L113 |
| `layout-docs.vue`           | iframe 加载监听         | L42-L50   |
| `layout-docs.vue`           | 主题变化监听            | L52-L54   |
| `layout-docs.vue`           | 同步到 iframe 函数      | L56-L69   |
| `.vitepress/theme/index.js` | 消息监听注册            | L16       |
| `.vitepress/theme/index.js` | 消息处理函数            | L59-L63   |
| `.vitepress/theme/index.js` | 主题应用函数            | L39-L54   |

## ⚠️ 注意事项

### 1. **跨域安全**

当前使用 `'*'` 作为 targetOrigin，在生产环境中建议指定具体域名：

```javascript
iframe.contentWindow.postMessage(
  { type: 'theme-change', theme: currentTheme },
  'https://your-domain.com', // 替换为实际域名
)
```

### 2. **iframe 加载时机**

- 必须等待 iframe 的 `load` 事件后再发送消息
- 否则 `contentWindow` 可能还未就绪

### 3. **消息验证**

VitePress 端应该验证消息来源和类型：

```javascript
function handleThemeMessage(event) {
  // 可选：验证消息来源
  // if (event.origin !== 'https://your-domain.com') return

  if (event.data && event.data.type === 'theme-change') {
    applyTheme(event.data.theme)
  }
}
```

### 4. **性能优化**

- 使用 `watch` 监听主题变化，避免频繁发送消息
- iframe 只在选择"文档"菜单时加载，节省资源

### 5. **调试技巧**

在浏览器控制台查看日志：

```
[Header] 主题已同步到 iframe: dark
[Docs Layout] 主题已同步到 iframe: light
```

## 🎨 优势

✅ **无缝体验**：主题切换流畅，无闪烁  
✅ **实时同步**：无需刷新 iframe  
✅ **双向隔离**：主应用和文档样式互不影响  
✅ **持久化**：localStorage 保存主题状态  
✅ **降级方案**：即使 postMessage 失败，URL 参数仍可用

## 🔍 测试步骤

1. **启动开发服务器**

```bash
npm run dev
```

2. **测试流程**
   - ✅ 访问主页，点击顶部"文档"菜单
   - ✅ 观察 iframe 是否加载文档
   - ✅ 检查控制台是否有"[Docs Layout] 主题已同步到 iframe"日志
   - ✅ 点击主题切换按钮（太阳/月亮图标）
   - ✅ 观察 iframe 内文档是否实时切换主题
   - ✅ 检查控制台是否有"[Header] 主题已同步到 iframe"日志

3. **验证主题状态**

```javascript
// 在浏览器控制台运行
document.querySelector('iframe').contentWindow.document.documentElement.classList.contains('dark')
```

## 📝 总结

该方案通过 **postMessage** 实现了主应用与 iframe 内嵌 VitePress 文档之间的主题无缝联动，提供了流畅的用户体验，同时保持了良好的性能和安全性。
