import { ref } from "vue";

export const user_info = ref({ name: "Guest" });

export const init_singleton = () => {
  user_info.value = { name: "Guest" };
};
