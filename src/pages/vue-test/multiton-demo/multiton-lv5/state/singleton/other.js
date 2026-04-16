import { ref, reactive, onMounted, computed } from 'vue'
export const searchState = ref({
  name: '',
  category: undefined,
})

export const init_singleton = () => {
  searchState.value = {
    name: '',
    category: undefined,
  }
}
