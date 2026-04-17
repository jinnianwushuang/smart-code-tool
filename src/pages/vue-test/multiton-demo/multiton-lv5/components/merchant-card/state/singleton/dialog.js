import { ref } from 'vue'

export const all_dialog_state = ref({})

//传递给弹窗的 数据
export const current_record_to_dialog_data = ref({})
export const init_singleton = () => {
  all_dialog_state.value = {}

  current_record_to_dialog_data.value = {}
}
