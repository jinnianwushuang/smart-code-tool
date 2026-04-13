import { ref, onMounted, watch, computed } from 'vue'
import { Dark } from 'quasar'

export const isDarkTheme = computed({
  get: () => Dark.isActive,
  set: (val) => {
    Dark.set(val)
  },
})
