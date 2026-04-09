/**
 * 上下文执行调度器 (工厂模式)
 * @param {Object} payload - 上下文载荷 (提供给 第一个参数)
 * @param {Object} rest_params - 剩余参数 (提供给业务函数)
 * @param {Object} fn_obj - 函数定义集合
 * @returns {Object} - 包装后的函数集合
 * @description
 * 1. 遍历函数对象中的每一个键值对。
 * 2. 如果值是函数，则创建一个新的函数，自动将 payload 作为第一个参数传入，并保留 rest_params。
 * 3. 如果值不是函数，则直接保留原值。
 * 4. 最终返回一个新的对象，包含所有包装后的函数和原有非函数属性。
 */
export const wrap_with_payload_pipeline = (
  payload,
  rest_params = [],
  fn_obj,
) => {
  const dispatched_methods = {};

  // 1. 遍历函数对象中的每一个键值对
  Object.entries(fn_obj).forEach(([fn_name, raw_fn]) => {
    if (typeof raw_fn == "function") {
      dispatched_methods[fn_name] = (...args) =>
        raw_fn(payload, ...rest_params);
    } else {
      dispatched_methods[fn_name] = raw_fn;
    }
  });

  return dispatched_methods;
};
