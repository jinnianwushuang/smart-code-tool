import { ref } from 'vue'

export const create_multiton_variable = (payload) => {
  const default_pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  }
  const modalVisible = ref(false)
  const loading = ref(false)
  const isEdit = ref(false)
  const merchantList = ref([])
  //传递给弹窗的 数据
  const current_record_to_dialog_data = ref({})
  const pagination = ref({ ...default_pagination })
  return { pagination, loading, merchantList, modalVisible, isEdit, current_record_to_dialog_data }
}
