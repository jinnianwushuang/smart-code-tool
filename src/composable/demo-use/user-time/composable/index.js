import { when_mounted } from '../module/other-method/index.js'
import { onMounted, onUnmounted } from 'vue'
export const src_composable_demo_use_user_time_composable_index = (payload) => {
  const { timer1, timer2, run_every_2_minutes } = payload
  onMounted(() => {
    when_mounted(payload)
  })

  onUnmounted(() => {
    clearInterval(timer1.value)
    clearInterval(timer2.value)
  })
}
