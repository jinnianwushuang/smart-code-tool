import { computed } from "vue";
export const create_computed_variable = (payload) => {
  const demo_computed = computed(() => {
    return "demo_computed";
  });
  return {
    demo_computed,
  };
};
