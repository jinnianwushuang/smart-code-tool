import { ref, reactive, onMounted, computed } from 'vue'
import { onSearch, onReset, handleTableChange, handleEdit, handleDelete } from '../module/table.js'
import { handleAdd, handleModalOk } from '../module/dialog.js'
import { loadData } from '../api-request/loadData.js'
import { wrap_with_payload } from 'src/output/common/project-common.js'
export const composable_index = (payload) => {
  // 初始化
  onMounted(() => {
    loadData(payload)
  })

  // return {
  //   // 搜索与重置
  //   onSearch: () => onSearch(payload),
  //   onReset: () => onReset(payload),
  //   // 表格分页/排序改变
  //   handleTableChange: (pag) => handleTableChange(payload, pag),
  //   // 表格编辑
  //   handleEdit: (record) => handleEdit(payload, record),
  //   // 表格删除
  //   handleDelete: (id) => handleDelete(payload, id),
  //   // 添加
  //   handleAdd: () => handleAdd(payload),
  //   // 添加弹窗确定
  //   handleModalOk: () => handleModalOk(payload),

  // }

  //  return {
  //    // 搜索与重置
  //    onSearch: (...args) => onSearch(payload, ...args),
  //    onReset: (...args) => onReset(payload, ...args),
  //    // 表格分页/排序改变
  //    handleTableChange: (...args) => handleTableChange(payload, ...args),
  //    // 表格编辑
  //    handleEdit: (...args) => handleEdit(payload, ...args),
  //    // 表格删除
  //    handleDelete: (...args) => handleDelete(payload, ...args),
  //    // 添加
  //    handleAdd: (...args) => handleAdd(payload, ...args),
  //    // 添加弹窗确定
  //    handleModalOk: (...args) => handleModalOk(payload, ...args),

  //  }

  return wrap_with_payload(payload, {
    onSearch,
    onReset,
    handleTableChange,
    handleEdit,
    handleDelete,
    handleAdd,
    handleModalOk,
  })
}
