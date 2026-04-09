import { onUnmounted, isRef } from "vue";

/**
 * 副作用清理器 :Observer, WebSocket,AbortController
 * 核心原理：特征识别 (Feature Detection) + 深度递归逻辑 + 容错执行
 */
export function useOtherCleaner(resources, options = { debug: false }) {
  const isDev = import.meta.env?.DEV || options.debug;

  const log = (type, detail) => {
    if (isDev) console.log(`[SuperCleaner] 🟢 已清理 ${type}:`, detail);
  };

  const clean = (item) => {
    if (!item) return;

    try {
      // --- 1. 容器类递归 (Ref / Array / Set / Map) ---
      if (isRef(item)) {
        clean(item.value);
        item.value = null;
        return;
      }
      if (Array.isArray(item)) {
        item.forEach((i) => clean(i));
        item.length = 0;
        return;
      }
      if (item instanceof Set || item instanceof Map) {
        item.forEach((i) => clean(i));
        item.clear();
        return;
      }

      // --- 4. 复杂对象与 Web API 实例 ---
      if (typeof item === "object") {
        if (typeof item.terminate === "function") {
          item.terminate();
          log("Worker (terminate)", item);
          return;
        }

        // 4.2 原生 Web API 识别
        if (item instanceof AbortController) {
          item.abort();
          log("请求 (Abort)", "HTTP Request");
          return;
        }
        if (item instanceof WebSocket) {
          item.close();
          log("Socket (Close)", item.url);
          return;
        }
        if (
          item instanceof IntersectionObserver ||
          item instanceof ResizeObserver ||
          item instanceof MutationObserver
        ) {
          item.disconnect();
          log("观察者 (Disconnect)", item.constructor.name);
          return;
        }

        // 4.5 普通对象容器：递归清理所有 Key
        Object.keys(item).forEach((key) => {
          clean(item[key]);
          delete item[key];
        });
      }
    } catch (error) {
      console.error(`[SuperCleaner] 🔴 清理资源时发生异常:`, error, item);
    }
  };

  onUnmounted(() => {
    if (isDev) console.group("📦 SuperCleaner: 开始执行全局清理...");
    clean(resources);
    if (isDev) console.groupEnd();
  });

  return {
    manualClean: () => clean(resources),
  };
}
