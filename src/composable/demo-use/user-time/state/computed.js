import { computed } from 'vue'
export const create_computed_variable = (payload) => {
  const { use_time } = payload

  // 2. 核心：根据时长返回不同鼓励语
  const encouragement = computed(() => {
    if (use_time.value < 10 * 1000) return '刚刚开始，保持专注哦！'
    if (use_time.value < 300 * 1000) return '状态渐入佳境，继续加油！'
    if (use_time.value < 900 * 1000)
      return `你已经坚持 ${Math.floor(use_time.value / 1000 / 60)} 分钟了，真棒！`
    return '你是时间管理大师！专注力惊人 🚀'
  })

  const use_time_str = computed(() => {
    const seconds = Math.floor(use_time.value / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds % 60}秒`
    } else {
      return `${seconds}秒`
    }
  })

  return {
    encouragement,
    use_time_str,
  }
}
