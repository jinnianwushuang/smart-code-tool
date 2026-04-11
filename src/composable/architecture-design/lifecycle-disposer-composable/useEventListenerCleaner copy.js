import { onMounted, onUnmounted, isRef, watch, nextTick } from "vue";

/**
 * 通用事件监听注册与自动销毁 useEventListener
 * 这里的漏洞 需要代码内 事件监听 先注册 先销毁 需要在DOM 副作用组合逻辑之前使用
 * 支持结构:
 * 1. 单个对象: { target: window, type: 'resize', handler: fn }
 * 2. 以上对象的数组: [ { target, type, handler }, ... ]
 * 3. 包含以上对象的 Ref 或普通对象容器
 */
export function useEventListenerCleaner(options) {
  const configs = Array.isArray(options) ? options : [options];

  // 统一的注册方法
  const register = (el, type, handler, opt) => {
    if (el && el.addEventListener) {
      el.addEventListener(type, handler, opt);
    }
  };

  // 统一的销毁方法
  const unregister = (el, type, handler, opt) => {
    if (el && el.removeEventListener) {
      el.removeEventListener(type, handler, opt);
    }
  };

  configs.forEach((config) => {
    const { target, type, handler, options: eventOptions } = config;

    // 情况 A：静态目标 (window, document, 普通 DOM)
    if (!isRef(target)) {
      onMounted(() => register(target, type, handler, eventOptions));
      onUnmounted(() => unregister(target, type, handler, eventOptions));
      return;
    }

    // 情况 B：动态目标 (Ref / useTemplateRef)
    // 使用 watch 监听 ref 的变化，利用 onCleanup 自动处理新旧更替和卸载
    watch(
      target,
      (newEl, oldEl, onCleanup) => {
        // 1. 如果有新值，注册事件
        if (newEl) {
          register(newEl, type, handler, eventOptions);
        }

        // 2. 核心：定义清理逻辑
        // 当 target 发生改变（newEl 变 oldEl）或者组件【卸载】时，会自动执行
        //
        onCleanup(() => {
          if (oldEl) {
            unregister(oldEl, type, handler, eventOptions);
          }
        });
      },
      { immediate: true, flush: "post" },
      // flush: 'post' 确保在 DOM 更新后（即 ref 已被赋值）执行
    );
  });
}
