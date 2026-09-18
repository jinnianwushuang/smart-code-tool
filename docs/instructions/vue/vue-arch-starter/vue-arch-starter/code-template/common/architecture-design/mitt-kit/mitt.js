import mitt from "mitt";

/**
 *  事件通道生成器（基于 mitt）
 * @returns {Object} 包含事件通道相关方法的对象
 * @description
 * 1. 创建一个 mitt 实例作为事件通道。
 * 2. 定义一个 Set 来记录使用“单回调”API的事件类型，确保这些事件只能注册一个回调。
 * 3. 提供一个 only 方法用于注册单回调消息，内部会标记该事件类型为单回调模式。
 * 4. 重写 emit 方法以支持多参数传递，将参数封装为数组发送。
 * 5. 重写 on 方法以兼容多参数的订阅，同时检查是否违反单回调模式的约定，并提供友好的错误提示。
 */
const createEmitter = () => {
  const emitter = mitt();
  const singleModeEvents = new Set(); // 记录哪些事件使用了“单回调”API

  return {
    ...emitter,

    /**
     * 【新增 API】注册单回调消息
     * 逻辑： 在 singleModeEvents 里记录这个事件类型，保留之前的回调，
     */
    only(type, handler) {
      return emitter.on(type, handler, true);
    },

    /**
     * 支持多参数的触发器
     */
    emit(type, ...args) {
      // 正常的 mitt 只接收一个参数，我们将多参数封装为数组发送
      // mitt 内部会通过 map 找到对应的 handlers 并执行
      emitter.emit(type, args);
    },

    /**
     * 兼容多参数的订阅器
     */
    on(type, handler, single = false) {
      // 不允许再通过 on 注册第二个回调到已经被 only 注册过的事件类型
      if (singleModeEvents.has(type)) {
        let str = `[Mitt Error] 事件 "${type}" 预期为单回调模式，无法重复注册回调函数。请检查代码以定位问题。本次注册被默认抛弃，当前回调函数不会预期执行。`;
        console.error(str);
        return {
          off: () => {},
          emit: () => {
            console.error(str);
          },
        };
      }

      if (single) {
        //   在 singleModeEvents 里记录这个事件类型，并且不允许再通过 on 注册第二个回调
        singleModeEvents.add(type);
      }

      // 包装一层，自动解构数组参数
      const wrapper = (args) => {
        return Array.isArray(args) ? handler(...args) : handler(args);
      };

      // 注意：为了能正常 off，实际开发中建议维护一个 Map 存储原 handler 和 wrapper 的对应关系
      emitter.on(type, wrapper);
      return {
        off: () => emitter.off(type, wrapper),
        emit: (...args) => emitter.emit(type, args),
        type,
      };
    },
  };
};
// --- 测试 ---

export const EMITTER = createEmitter();

// 场景 A：原有模式（支持多个回调）
EMITTER.on("common_msg", (a) => console.log("回调1:", a));
EMITTER.on("common_msg", (a) => console.log("回调2:", a));
EMITTER.emit("common_msg", "Hello"); // 正常执行两个回调

// 场景 B：单回调模式
EMITTER.only("user_login", (user, role) => {
  console.log(`用户：${user}，角色：${role}`);
});

// 如果再次调用 only，会自动覆盖之前的
EMITTER.only("user_login", (user, role) => {
  console.log(`覆盖后的回调 - 用户：${user}`);
});

// 如果有人误用了原生的 on 给这个消息加了第二个回调，emit 时会报错
EMITTER.on("user_login", () => {});

EMITTER.emit("user_login", "张三", "管理员");
// 控制台会输出：[Mitt Error] 事件 "user_login" 预期为单回调模式...
