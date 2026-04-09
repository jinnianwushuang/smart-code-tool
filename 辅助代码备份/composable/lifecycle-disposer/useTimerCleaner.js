import { onUnmounted, isRef } from "vue";

/**
 * 通用定时器销毁组合式函数 cancelAnimationFrame、clearTimeout、clearInterval
 * @param {any} timers - 支持单值、Ref、数组、普通对象
 */
export function useTimerCleaner(timers) {
  const clean = (target) => {
    // 1. 处理 Ref 对象
    if (isRef(target)) {
      clean(target.value);
      target.value = null;
      return;
    }

    // 2. 处理数组 (批量定时器)
    if (Array.isArray(target)) {
      target.forEach((t) => clean(t));
      target.length = 0;
      return;
    }

    // 3. 处理普通对象 (键值对存储的定时器)
    if (target && typeof target === "object") {
      Object.keys(target).forEach((key) => {
        clean(target[key]);
        delete target[key];
      });
      return;
    }

    // 4. 执行真正的清理 (数值或 ID)
    if (target) {
      clearTimeout(target);
      clearInterval(target);
      clearImmediate(target);
      if (typeof window !== "undefined" && window.cancelAnimationFrame) {
        window.cancelAnimationFrame(target);
      }
    }
  };

  // 自动在组件卸载时清理
  onUnmounted(() => {
    clean(timers);
  });

  // 同时返回清理方法，支持手动提前清理
  return { clean };
}
