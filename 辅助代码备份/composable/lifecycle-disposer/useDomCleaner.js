import { onUnmounted, isRef } from "vue";

/**
 * 通用资源/引用销毁组合式函数
 * 支持： Ref对象、数组、普通对象、具有 destroy/dispose 方法的实例
 */
export function useDomCleaner(resources) {
  const clean = (target) => {
    if (!target) return;

    // 1. 处理 Ref 对象 (解包)
    if (isRef(target)) {
      clean(target.value);
      target.value = null;
      return;
    }

    // 2. 处理数组 (递归清理每一项)
    if (Array.isArray(target)) {
      target.forEach((item) => clean(item));
      target.length = 0;
      return;
    }

    // 3. 处理对象 (遍历键值对)
    if (typeof target === "object") {
      // 3.1 优先处理具有销毁方法的第三方实例 (如 ECharts, MonacoEditor, Swiper)
      if (typeof target.dispose === "function") {
        target.dispose();
        return;
      }
      if (typeof target.destroy === "function") {
        target.destroy();
        return;
      }

      // 3.2 否则视为普通键值对容器，递归清理内部属性
      Object.keys(target).forEach((key) => {
        clean(target[key]);
        delete target[key];
      });
      return;
    }
  };

  // 组件卸载时自动触发
  onUnmounted(() => {
    clean(resources);
  });
}
