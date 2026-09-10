import { ref, reactive, onMounted, computed } from 'vue'
export const searchState = ref({
  username: '',
  status: undefined,
})

export const init_singleton = () => {
 searchState.value = {
   username: '',
   status: undefined,
 }
}
