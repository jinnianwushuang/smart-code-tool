import { ref, onMounted, watch, computed } from 'vue'
import { Dark } from 'quasar'

export const isDarkTheme = computed({
  get: () => Dark.isActive,
  set: (val) => {
    Dark.set(val)
    set_root_css_variable(val ? 'dark' : 'light')
  },
})

const markdown_themes = {
  light: {
    '--markdown-bg': '#ffffff',
    '--markdown-text': '#24292f',
    '--markdown-border': '#d0d7de',
    '--markdown-zebra': '#f6f8fa',
  },
  dark: {
    '--markdown-bg': '#0d1117',
    '--markdown-text': '#c9d1d9',
    '--markdown-border': '#30363d',
    '--markdown-zebra': '#161b22',
  },
}

/**
 * 切换 Markdown 主题
 * @param { 'light' | 'dark' } mode
 */

const set_root_css_variable = (mode) => {
  const root = document.documentElement
  const themeVars = markdown_themes[mode]

  Object.entries(themeVars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
// 使用示例
//   set_root_css_variable('dark')
