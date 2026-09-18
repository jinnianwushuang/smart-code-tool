import { ref } from "vue";

export const create_multiton_variable = (payload) => {
  const current_card_data = ref({});
  return { current_card_data }
};
