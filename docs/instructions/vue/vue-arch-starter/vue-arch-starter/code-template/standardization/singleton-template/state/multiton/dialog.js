import { ref } from 'vue'

export const create_multiton_variable = (payload) => {
  const all_dialog_state = ref({})

  //传递给弹窗的 数据
  const current_record_to_dialog_data = ref({})
  return { all_dialog_state, current_record_to_dialog_data }
}
