import { ref } from "vue";

export const all_dialog_state = ref({});
export const query_form = ref({});


// --- 弹窗逻辑 ---



export const init_singleton = () => {
  all_dialog_state.value = {};
  query_form.value = {};



};
