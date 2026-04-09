export const compute_use_time = (payload) => {
  const { use_time, comein_time } = payload
  use_time.value = Date.now() - comein_time.value
}

export const when_mounted = (payload) => {
  console.error('when_mounted')
  const { timer1, timer2, run_every_2_minutes, comein_time } = payload
  comein_time.value = Date.now()
  timer1.value = setInterval(() => {
    compute_use_time(payload)
  }, 1000)

  timer2.value = setInterval(
    () => {
      run_every_2_minutes?.(payload)
    },
    1000 * 60 * 2,
  )
}
