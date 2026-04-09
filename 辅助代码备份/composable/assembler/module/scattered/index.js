import {
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
} from "vue";
import {
  cleanup_effect_arr,
  genarate_event_pipeline,
  genarate_singleton,
} from "./config.js";

/**
 *
 * @param {*} all_params.payload 上下文载荷对象
 * @param {*} all_params.modules vite glob 扫描的 模块对象
 * @param {*} all_params.assemble_type 装配类型
 * @param {*} all_params.extra 额外的参数，生命周期钩子
 *
 *
 *
 */
export const assemble_lifecycle_scattered = (all_params) => {
  const { payload, modules = {}, extra = {}, assemble_type } = all_params;
  const {
    onBeforeMount: onBeforeMount_cb,
    onMounted: onMounted_cb,
    onBeforeUnmount: onBeforeUnmount_cb,
    onUnmounted: onUnmounted_cb,
    onActivated: onActivated_cb,
    onDeactivated: onDeactivated_cb,
  } = extra;

  const genarate_fn = (item) => {
    const method = find_method({ modules, assemble_type, item });
    if (method) {
      return () => method(payload);
    }
    return item.default;
  };

  const event_pipeline_fn = genarate_fn(genarate_event_pipeline);
  const singleton_fn = genarate_fn(genarate_singleton);

  onBeforeMount(() => {
    // 组件生命周期开始前，先执行单例函数，生成单例对象，供组件内其他函数调用
    singleton_fn();
    // 执行传入的生命周期回调函数
    onBeforeMount_cb?.();
    // 事件管道的函数 需要在生命周期开始前就生成好，供组件内其他函数调用
    event_pipeline_fn();
  });
  onMounted(() => {
    // 执行传入的生命周期回调函数
    onMounted_cb?.();
  });
  onBeforeUnmount(() => {
    // 执行传入的生命周期回调函数
    onBeforeUnmount_cb?.();
  });
  onUnmounted(() => {
    // 执行传入的生命周期回调函数
    onUnmounted_cb?.();
    // 组件生命周期结束时，执行一次单例函数，进行清理工作
    singleton_fn();
  });
  onActivated(() => {
    // 执行传入的生命周期回调函数
    onActivated_cb?.();
  });
  onDeactivated(() => {
    // 执行传入的生命周期回调函数
    onDeactivated_cb?.();
  });
  // 根据配置项，找到需要销毁副作用的函数，并执行
  cleanup_effect_arr.forEach((item) => {
    const method = find_method({ modules, assemble_type, item });
    if (method) {
      item.handle_fn(method(payload));
    }
  });
};
/**
 * 通过配置或者模块扫描 找到对应的模块
 * @param {*} param0
 * @returns
 */
const find_method = ({ modules, assemble_type, item }) => {
  let method = null;

  if (assemble_type === "by_config") {
    method = modules[item.config_key];
  } else {
    //by_module 模式下，根据配置项的 file_path 在扫描的模块中找到对应模块，再从模块中找到对应函数

    let [find_mod] = Object.entries(modules).filter(([path, mod]) =>
      path.includes(item.file_path),
    );

    if (find_mod) {
      let [file_path, mod] = find_mod;
      method = mod[item.method_name];
    }
  }

  return method;
};
