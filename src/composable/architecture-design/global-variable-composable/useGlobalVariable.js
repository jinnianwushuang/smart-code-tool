import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

export function useGlobalState() {
  // 必须在 setup() 顶层执行，不能在异步函数或回调中执行
  const router = useRouter()
  const route = useRoute()
  const $q = useQuasar()

  return {
    router,
    route,
    $q,
  }
}
