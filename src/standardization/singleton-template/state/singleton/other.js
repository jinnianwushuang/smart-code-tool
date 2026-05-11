import { ref } from "vue";

export const user_info = ref({ name: "Guest" });
export const query_form = ref({})
export const init_singleton = () => {
  user_info.value = { name: "Guest" };
  query_form.value = {}
};
