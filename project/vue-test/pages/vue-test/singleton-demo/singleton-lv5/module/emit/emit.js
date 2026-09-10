export const create_messaging_emit = (payload) => {
  const { emit } = payload

  const btn_a_click = () => {
    emit('btn-a-click', 12121)
  }

  return {
    btn_a_click,
  }
}
