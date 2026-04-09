import { onUnmounted, isRef } from "vue";

/**
 * 通用 Vue Watch 停止监听组合式函数
 * @param {any} resources - 支持单个 stopHandle、数组、Ref 或普通对象容器
 */
export function useWatcherCleaner(resources) {
  const clean = (item) => {
    if (!item) return;

    // 1. 处理 Ref (自动解包)
    if (isRef(item)) {
      clean(item.value);
      item.value = null;
      return;
    }

    // 2. 处理数组 (递归清理，如 [stop1, stop2])
    if (Array.isArray(item)) {
      item.forEach((i) => clean(i));
      item.length = 0;
      return;
    }

    // 3. 核心逻辑：执行停止监听函数
    // Vue 的 watch 返回的是一个函数，直接执行即可停止监听
    if (typeof item === "function") {
      item();
      return;
    }

    // 4. 处理普通对象容器 (递归清理内部属性)
    if (typeof item === "object") {
      Object.keys(item).forEach((key) => {
        clean(item[key]);
        delete item[key];
      });
    }
  };

  // 组件卸载时自动停止所有监听
  onUnmounted(() => {
    clean(resources);
  });
}
