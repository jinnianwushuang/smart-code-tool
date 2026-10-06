import { ref } from 'vue'
import { stripBase } from '../shared/useDocIdMapper'

/**
 * 当前页面信息（URL + 标题）
 * 在每次操作时调用 refresh 实时读取，避免 computed 无法追踪浏览器原生 API 的问题
 *
 * URL 统一使用 stripBase 规范化（如 /interview/react/xxx）
 * 与 doc-list.json 格式一致，不使用 href 避免存入域名
 */
export function useCurrentPage() {
  const currentUrl = ref('')
  const currentTitle = ref('')

  const refresh = () => {
    if (typeof window === 'undefined') return
    currentUrl.value = stripBase(window.location.pathname)
    currentTitle.value = document.title || ''
  }

  return { currentUrl, currentTitle, refresh }
}
