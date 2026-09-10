import { ref, reactive, onMounted, computed } from 'vue'
import {
  onSearch,
  onReset,
  handleEdit,
  handleDelete,
  handleAdd,
  handleModalOk,
} from '../module/index.js'
import { loadData } from '../api-request/loadData.js'
import { wrap_with_payload } from 'src/output/common/project-common.js'
export const composable_index = (payload) => {
  // 初始化
  onMounted(() => {
    loadData(payload)
  })

  return wrap_with_payload(payload, {
    onSearch,
    onReset,
    handleEdit,
    handleDelete,
    handleAdd,
    handleModalOk,
  })
}
