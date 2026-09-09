import { ref, onMounted, watch, computed } from 'vue'
import { Dark } from 'quasar'

import { theme } from 'ant-design-vue'
export const antTheme = ref({})

const THEME_STORAGE_KEY = 'app-theme-mode'

export const isDarkTheme = computed({
  get: () => Dark.isActive,
  set: (val) => {
    Dark.set(val)
    set_root_css_variable(val ? 'dark' : 'light')
    localStorage.setItem(THEME_STORAGE_KEY, val ? 'dark' : 'light')

    antTheme.value = {
      algorithm: isDarkTheme.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        // 你可以在这里统一配置 Ant Design 的品牌色
        // colorPrimary: '#1976d2',
      },
    }
  },
})

/**
 * 初始化主题：从 localStorage 读取，若无则默认 dark
 */
export const initTheme = () => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  isDarkTheme.value = saved === 'light' ? false : true
}

const markdown_themes = {
  light: {},
  dark: {},
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
