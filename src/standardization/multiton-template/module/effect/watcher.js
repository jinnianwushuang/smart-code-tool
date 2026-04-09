import { watch } from "vue"

//已核对
export const cleanup_effect_watcher = (payload) => {
  const { current_time } = payload;

  return [watch(current_time, (new_time) => {})];
};
