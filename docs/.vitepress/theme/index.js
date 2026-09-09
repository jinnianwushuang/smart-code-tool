// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './custom.css'

export default {
  ...DefaultTheme,
  Layout,
  enhanceApp({ app, router, siteData }) {
    // 在应用启动时同步主题
    syncThemeFromURL()

    // 监听路由变化，确保主题同步
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', syncThemeFromURL)

      // 监听来自主应用的主题变更消息
      window.addEventListener('message', handleThemeMessage)
    }
  },
}

/**
 * 从 localStorage 或 URL 参数中读取主题状态并应用
 * 优先级：URL 参数 > localStorage > 主应用 localStorage > 系统偏好
 */
function syncThemeFromURL() {
  if (typeof window === 'undefined') return

  // 1. 优先读 URL 参数（iframe postMessage 场景）
  const urlParams = new URLSearchParams(window.location.search)
  const urlTheme = urlParams.get('theme')
  if (urlTheme === 'dark' || urlTheme === 'light') {
    applyTheme(urlTheme)
    return
  }

  // 2. 读 VitePress 自身的 localStorage
  const vpSaved = localStorage.getItem('vitepress-theme-appearance')
  if (vpSaved === 'dark' || vpSaved === 'light') {
    applyTheme(vpSaved)
    return
  }

  // 3. 读主应用的 localStorage（跨应用同步）
  const appSaved = localStorage.getItem('app-theme-mode')
  if (appSaved === 'dark' || appSaved === 'light') {
    applyTheme(appSaved)
    return
  }

  // 4. 回退到系统偏好
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(prefersDark ? 'dark' : 'light')
}

/**
 * 应用主题到 VitePress
 * @param {'light' | 'dark'} theme
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

  // 触发自定义事件，通知其他组件主题已更改
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }))
}

/**
 * 处理来自主应用的主题变更消息
 */
function handleThemeMessage(event) {
  if (event.data && event.data.type === 'theme-change') {
    applyTheme(event.data.theme)
  }
}
