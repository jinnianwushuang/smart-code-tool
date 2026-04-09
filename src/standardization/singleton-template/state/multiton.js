import { ref } from "vue";

export const create_multiton_variable = (payload) => {
  const current_time = ref(new Date());
  return { current_time };
};
