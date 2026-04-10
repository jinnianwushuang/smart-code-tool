import { ref } from 'vue'

export const create_multiton_variable = (payload) => {
  // 定时器
  const timer1 = ref(null)
  const timer2 = ref(null)
  //页面使用时长
  const use_time = ref(0)
  //页面进入时间
  const comein_time = ref(0)
  // const income_pipeline = ['when_mounted']

  return {
    timer1,
    timer2,
    use_time,
    //。
    comein_time,
    // income_pipeline,
  }
}
