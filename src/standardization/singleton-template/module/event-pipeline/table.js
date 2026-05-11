export const handle_table_action_confirm_click = (payload, str) => {
  console.log("handle_table_action_confirm_click", payload, str);
};

export const on_table_change = (
  payload,
  { pagination: pag, filters, sorter },
) => {
  console.log("触发分页/排序请求:", pag);
    // 此处执行加载数据的逻辑
    const { pagination }= payload;
};
