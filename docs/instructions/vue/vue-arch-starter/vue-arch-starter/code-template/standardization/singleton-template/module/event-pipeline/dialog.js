

export const handle_dialog_copy_use_confirm_click = (payload) => {
  const { all_dialog_state } = payload;
  all_dialog_state.value.dialog_copy_use = true;
}
