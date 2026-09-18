export const create_messaging_emit = (payload) => {
  const { emit, btn_a_color } = payload

  const btn_a_click = () => {
    emit('btn-a-click', btn_a_color.value)
  }

  return {
    btn_a_click,
  }
}
