import { ref, reactive, onMounted, onUnmounted, onBeforeMount } from 'vue'

import { loadData } from '../api-request/loadData.js'

import { init_singleton, pagination } from '../variable/singleton.js'
import { mitt_register } from '../mitt/mitt-register.js'
import { wrap_with_payload } from 'src/output/common/project-common.js'
export const composable_index = (payload) => {
  let off = null
  onBeforeMount(() => {
    // 初始化单例对象
    init_singleton()
    pagination.value.pageSize = 200
    off = mitt_register(payload).off
  })
  // 初始化
  onMounted(() => {
    loadData(payload)
  })

  onUnmounted(() => {
    off?.()
    // 销毁
    init_singleton(payload)
  })

  return wrap_with_payload(payload, {
    loadData,
  })
}
