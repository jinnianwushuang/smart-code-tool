import { onUnmounted, onMounted } from "vue";

/**
 * 通用 MITT 监听销毁组合式函数
 * 注意传入的时候以自动注册监听，实际拿到的是返回的对象，内部有off 方法
 * 支持结构:
 * 1.  数组: [  EMITTER.on("custom-event",()=>{})]
 * 2.  对象  EMITTER.on("custom-event",()=>{})
 *
 *
 *
 */
export function useEmitterCleaner(options) {
  const resources = Array.isArray(options) ? options : [options];

  let off_list = [];

  onMounted(() => {
    off_list = resources.map(({ off }) => off);
  });

  // 组件销毁时自动执行
  onUnmounted(() => {
    off_list.map((x) => x?.());
    off_list = null;
  });
}
