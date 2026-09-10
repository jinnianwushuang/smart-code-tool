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

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', syncThemeFromURL)

      // 监听来自主应用的主题变更消息
      window.addEventListener('message', handleThemeMessage)

      // 监听 VitePress 自身主题变化，广播给 iframe 子应用
      const observer = new MutationObserver(() => {
        const isDark = document.documentElement.classList.contains('dark')
        const themeMsg = { type: 'theme-change', theme: isDark ? 'dark' : 'light' }
        document.querySelectorAll('iframe').forEach((iframe) => {
          iframe.contentWindow?.postMessage(themeMsg, '*')
        })
      })
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      })
    }
  },
}

/**
 * 从 localStorage 或 URL 参数中读取主题状态并应用
 * 优先级：URL 参数 > 统一 localStorage > 系统偏好
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

  // 2. 读统一的主题存储键
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark' || saved === 'light') {
    applyTheme(saved)
    return
  }

  // 3. 回退到系统偏好
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(prefersDark ? 'dark' : 'light')
}

// 统一主题存储键，所有应用共用
const THEME_KEY = 'app-theme-mode'

/**
 * 应用主题到 VitePress
 * @param {'light' | 'dark'} theme
 */
function applyTheme(theme) {
  if (typeof window === 'undefined') return

  const html = document.documentElement

  if (theme === 'dark') {
    html.classList.add('dark')
    localStorage.setItem(THEME_KEY, 'dark')
  } else {
    html.classList.remove('dark')
    localStorage.setItem(THEME_KEY, 'light')
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
