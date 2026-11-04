---
title: 'React 19 vs Vue 3 vs Flutter 3.x 常用 API 与易混点速查'
tags: ['Vue', 'React', 'Flutter', '速查', 'API', '对比', '思维']
---

# React 19 vs Vue 3 vs Flutter 3.x：常用 API 与易混点速查（纯罗列版）

> 本文只做**罗列**，方便「一眼回忆」，不展开原理——深度内容见 [生命周期与钩子对比](/dev-knowledge/cross-domain/architecture-and-system/framework-lifecycle-hooks-comparison)、[研发思维对比](/dev-knowledge/cross-domain/architecture-and-system/cross-framework-thinking-comparison)、[性能对决](/dev-knowledge/cross-domain/architecture-and-system/framework-performance-comparison)。前端知识点分散、命名相近易混，本文按「能力」把三者常用 API 并排对齐，并补充**生态常用库对照**；三者命名相近易混，重点看文末**易混点对照**。

---

## 一、渲染机制 / 更新调度

| 维度      | Vue 3          | React 19             | Flutter 3.x          |
| --------- | -------------- | -------------------- | -------------------- |
| 更新驱动  | 响应式依赖触发 | `setState` → 重渲染  | `setState` → rebuild |
| diff 对象 | VNode          | React Element        | Widget/Element       |
| 调度粒度  | 组件级精确     | Fiber 可中断         | 帧级                 |
| 批处理    | 微任务队列     | 自动批处理           | 帧内合并             |
| 优先级    | —              | 并发 `useTransition` | 帧预算 Choreographer |
| 首帧优化  | —              | SSR/hydration        | 预热 Warm-up         |

---

## 二、节点模型设计（虚拟 DOM / Fiber / Widget 树）

> 三者都把「描述 UI 的轻量对象」与「实际渲染/布局的重对象」分层，差异在于中间层的数量与是否可中断。

| 概念         | Vue 3                   | React 19                | Flutter                          |
| ------------ | ----------------------- | ----------------------- | -------------------------------- |
| 虚拟节点     | VNode                   | ReactElement            | Widget                           |
| 运行时中间层 | 无独立层（effect 直更） | Fiber 节点              | Element                          |
| 渲染层       | 真实 DOM                | DOM / 宿主视图          | RenderObject                     |
| 树的数量     | 2（VNode + DOM）        | 3（Element+Fiber+宿主） | 3（Widget+Element+RenderObject） |
| 节点性质     | 不可变、用完即弃        | Fiber 可变、可复用      | Widget 不可变 / Element 可复用   |
| diff 策略    | 编译优化 + patchFlag    | 单链表遍历 + key        | 同类型 Element 就地复用          |
| 可中断渲染   | ❌（同步 patch）        | ✅（时间切片）          | ❌（单帧内完成）                 |
| key 复用     | `:key`                  | `key`                   | `ValueKey`/`GlobalKey`           |

```
React   ：ReactElement(虚拟DOM) → Fiber(调度/可中断) → 真实 DOM
Vue 3   ：VNode(编译优化 + patchFlag) ─────────────→ 真实 DOM
Flutter ：Widget(配置·轻量不可变) → Element(生命周期) → RenderObject(布局·绘制)
```

---

## 三、响应式 / 状态声明

| 能力              | Vue 3                            | React 19                  | Flutter 3.x                               |
| ----------------- | -------------------------------- | ------------------------- | ----------------------------------------- |
| 基本可变状态      | `ref` / `reactive`               | `useState`                | `setState` + State 字段 / `ValueNotifier` |
| 复杂状态归约      | composable 手写                  | `useReducer`              | `Notifier` / 手写                         |
| 只读派生值        | `computed`                       | `useMemo`                 | getter / 手动缓存字段                     |
| 回调稳定引用      | 无需（模板直接绑）               | `useCallback`             | 无需（方法即引用）                        |
| 浅层响应/跳过代理 | `shallowRef` / `shallowReactive` | 无（默认不可变）          | `const` Widget                            |
| 标记非响应式      | `markRaw` / `toRaw`              | 无需                      | `final` 字段                              |
| 只读包装          | `readonly`                       | 约定不修改                | `final` / 不暴露 setter                   |
| 全局状态          | Pinia (`defineStore`)            | Redux / Zustand / Context | Provider / Riverpod / Bloc / GetX         |
| 唯一 ID           | 手写 / `useId`(库)               | `useId`                   | `UniqueKey` / `ValueKey`                  |

---

## 四、状态机 / 数据流范式

| 维度         | Vue 3                    | React 19                          | Flutter 3.x                 |
| ------------ | ------------------------ | --------------------------------- | --------------------------- |
| 核心范式     | 响应式（Proxy 自动追踪） | 单向数据流（setState 触发重渲染） | 显式通知（setState/notify） |
| 数据→视图    | 依赖收集精确更新         | 重新执行组件 + Fiber diff         | 重新 build + Element 复用   |
| 单向流约束   | Pinia action             | Redux / XState                    | Bloc / Riverpod             |
| 状态机库     | XState（通用）           | XState（常用）                    | bloc / flutter_bloc         |
| 不可变要求   | 可选                     | 强制（新对象）                    | 强制（Provider/Bloc）       |
| 时间旅行调试 | Pinia devtools           | Redux DevTools                    | bloc observer / DevTools    |

---

## 五、模板语法 vs JSX vs Widget（常用对照）

| 意图     | Vue 3 模板    | React 19 JSX       | Flutter 3.x Widget                  |
| -------- | ------------- | ------------------ | ----------------------------------- |
| 绑定属性 | `:attr="x"`   | `attr={x}`         | 构造参数 `attr: x`                  |
| 绑定事件 | `@click="fn"` | `onClick={fn}`     | `onPressed: fn` / `GestureDetector` |
| 类名     | `:class`      | `className`        | 无（样式走 Widget 属性）            |
| 内联样式 | `:style`      | `style={{}}`       | `Container(decoration/style)`       |
| 双向输入 | `v-model`     | `value`+`onChange` | `TextEditingController`             |
| 循环     | `v-for`       | `.map()`           | `builder` / 展开 `for`              |
| 条件     | `v-if`        | `&&` / 三元        | `if` / 三元                         |
| 注释     | `<!-- -->`    | `{/* */}`          | `//`                                |

---

## 六、组件定义与逻辑复用

| 能力         | Vue 3                                     | React 19                        | Flutter 3.x                             |
| ------------ | ----------------------------------------- | ------------------------------- | --------------------------------------- |
| 组件写法     | SFC `.vue`（template+script setup+style） | 函数组件（返回 JSX）            | `StatelessWidget` / `StatefulWidget` 类 |
| 有状态组件   | `script setup` + `ref`/`reactive`         | 函数 + Hooks                    | `StatefulWidget` + `State`              |
| 逻辑复用     | Composable（`useXxx`）                    | 自定义 Hook（`useXxx`）         | `mixin` / `Notifier` / `flutter_hooks`  |
| 旧式复用     | Mixin（不推荐）                           | HOC（少用）                     | `mixin` / `extends`                     |
| 根挂载       | `createApp(App).mount('#app')`            | `createRoot(el).render(<App/>)` | `runApp(const App())`                   |
| props 默认值 | `withDefaults(defineProps)`               | 函数参数默认值                  | 构造参数默认值                          |
| 类型约束     | `defineProps<T>()`                        | TS 接口（PropTypes 已废弃）     | Dart 类型（编译期检查）                 |

---

## 七、内置基础组件 / 标签对照

| 用途     | Vue 3 / Web         | React 19 / Web      | Flutter 3.x                            |
| -------- | ------------------- | ------------------- | -------------------------------------- |
| 容器     | `<div>`             | `<div>`             | `Container`/`SizedBox`                 |
| 文本     | `<span>`/`<p>`      | `<span>`/`<p>`      | `Text`                                 |
| 图片     | `<img>`             | `<img>`             | `Image.asset/network/file`             |
| 图标     | 图标库 / `<svg>`    | 图标库 / `<svg>`    | `Icon` + `Icons`                       |
| 按钮     | `<button>`          | `<button>`          | `ElevatedButton/TextButton/IconButton` |
| 输入框   | `<input>`           | `<input>`           | `TextField`                            |
| 滚动容器 | CSS `overflow`      | CSS `overflow`      | `SingleChildScrollView`/`ListView`     |
| 页面骨架 | `<div>` + flex/grid | `<div>` + flex/grid | `Scaffold`+`AppBar`+`Row/Column/Stack` |
| 弹窗     | `<dialog>` / 库     | `<dialog>` / 库     | `showDialog`/`AlertDialog`             |
| 列表项   | `<li>`              | `<li>`              | `ListTile`                             |

---

## 八、组件通信

| 方向           | Vue 3                          | React 19                       | Flutter 3.x                      |
| -------------- | ------------------------------ | ------------------------------ | -------------------------------- |
| 父 → 子        | `props`（`defineProps`）       | `props`                        | 构造函数参数                     |
| 子 → 父        | `emit`（`defineEmits`）        | 回调函数 prop（`onXxx`）       | 回调函数参数（`onXxx`）          |
| 跨层传递       | `provide` / `inject`           | `createContext` / `useContext` | `InheritedWidget` / `Provider`   |
| 引用子组件/DOM | `useTemplateRef`(3.5+) / `ref` | `useRef`（ref 可直接作 prop）  | `GlobalKey`                      |
| 内容插槽       | `<slot>` / `v-slot`            | `children` / props             | 构造参数传 `Widget`（slot 模式） |
| 双向绑定       | `v-model`                      | 受控 `value` + `onChange`      | `TextEditingController`          |
| 暴露方法       | `defineExpose`                 | `useImperativeHandle`          | `GlobalKey<State>` 访问          |

---

## 九、跨层级全局事件 / 总线

| 能力     | Vue 3                 | React 19           | Flutter                     |
| -------- | --------------------- | ------------------ | --------------------------- |
| 事件总线 | mitt（已移除 `$bus`） | 自建 EventEmitter  | `event_bus` 包              |
| 全局单例 | Pinia store           | Context/全局 store | GetX/Riverpod               |
| DOM 事件 | addEventListener      | addEventListener   | 无（Widget 层）             |
| 广播通道 | BroadcastChannel      | BroadcastChannel   | SystemChannels/EventChannel |
| 解耦通信 | emit/provide          | Context            | 回调/InheritedWidget        |

---

## 十、事件处理

| 能力     | Vue 3                                 | React 19                  | Flutter 3.x                                 |
| -------- | ------------------------------------- | ------------------------- | ------------------------------------------- |
| 点击     | `@click`                              | `onClick`                 | `onPressed` / `GestureDetector.onTap`       |
| 事件对象 | 原生 `event`                          | 合成事件 `SyntheticEvent` | 无（手势回调）                              |
| 阻止默认 | `.prevent` / `e.preventDefault()`     | `e.preventDefault()`      | 无（手势竞争机制）                          |
| 阻止冒泡 | `.stop` / `e.stopPropagation()`       | `e.stopPropagation()`     | 无冒泡（GestureArena 竞争）                 |
| 修饰符   | `.prevent/.stop/.once/.self/.passive` | 无（手动调用）            | 无                                          |
| 手势     | 原生 / 库                             | 原生 / 库                 | `onTap/onDoubleTap/onLongPress/onPanUpdate` |
| 键盘     | `@keyup.enter`                        | `onKeyDown/onKeyUp`       | `Shortcuts`/`Focus`/`RawKeyboard`           |

---

## 十一、列表与条件渲染

| 能力     | Vue 3                           | React 19                        | Flutter 3.x                                |
| -------- | ------------------------------- | ------------------------------- | ------------------------------------------ |
| 列表渲染 | `v-for` + `:key`                | `arr.map()` + `key`             | `ListView.builder` / `for` + `ValueKey`    |
| 条件渲染 | `v-if` / `v-else-if` / `v-else` | 三元 `? :` / `&&` / 提前 return | `if` / 三元 / `switch`                     |
| 显示隐藏 | `v-show`（保留 DOM）            | 条件渲染 / `style` 控制         | `Visibility` / `Offstage`                  |
| 模板片段 | `<template>`                    | `<>...</>`（Fragment）          | 无（直接返回 Widget 树 / `Column`）        |
| 键的作用 | diff 复用标识                   | diff 复用标识                   | Element 复用标识（`ValueKey`/`GlobalKey`） |

---

## 十二、表单处理

| 能力     | Vue 3                             | React 19                      | Flutter 3.x                                      |
| -------- | --------------------------------- | ----------------------------- | ------------------------------------------------ |
| 输入绑定 | `v-model`                         | 受控 `value`+`onChange`       | `TextEditingController`                          |
| 非受控   | `ref` 读 DOM 值                   | `defaultValue`+`useRef`       | Controller 初值                                  |
| 表单容器 | `<form>` / VeeValidate / FormKit  | `<form>` / react-hook-form    | `Form` + `GlobalKey<FormState>`                  |
| 校验     | 库 / 手写                         | react-hook-form / 手写        | `validator` 回调                                 |
| 提交     | `@submit.prevent`                 | `onSubmit` / `useActionState` | `onPressed` 里 `_formKey.validate()`             |
| 常用控件 | `<input>`/`<select>`/`<textarea>` | 同 Web                        | `TextField`/`DropdownButton`/`Checkbox`/`Switch` |

---

## 十三、拖拽 / 手势

| 能力     | Vue 3           | React 19          | Flutter                 |
| -------- | --------------- | ----------------- | ----------------------- |
| 拖拽库   | vuedraggable    | dnd-kit/react-dnd | Draggable               |
| 排序列表 | vuedraggable    | dnd-kit sortable  | ReorderableListView     |
| 原生 DnD | HTML5 draggable | 同                | 桌面端支持              |
| 手势     | pointer 事件    | pointer 事件      | GestureDetector         |
| 长按双击 | 手动            | 手动              | onLongPress/onDoubleTap |

---

## 十四、反馈浮层（命令式 API）

| 能力     | Vue 3              | React 19       | Flutter                  |
| -------- | ------------------ | -------------- | ------------------------ |
| Toast    | ElMessage          | message()      | SnackBar/Get.rawSnackbar |
| 确认框   | ElMessageBox       | Modal.confirm  | showDialog               |
| 全局加载 | ElLoading          | 自建           | 命令式 overlay           |
| 通知     | Notification       | notification() | 自定义 Overlay           |
| 命令挂载 | createVNode+render | createRoot     | Overlay/Entry            |

---

## 十五、副作用 / 数据请求

| 能力         | Vue 3                               | React 19                             | Flutter 3.x                         |
| ------------ | ----------------------------------- | ------------------------------------ | ----------------------------------- |
| 副作用       | `watch` / `watchEffect`             | `useEffect`                          | `initState` 订阅 + `dispose` 释放   |
| 立即执行     | `watchEffect` / `watch {immediate}` | `useEffect` 首次即执行               | `initState`                         |
| 依赖声明     | 自动追踪                            | 依赖数组 `[deps]`（手动）            | 手动 `setState` / `notifyListeners` |
| 清理         | `onWatcherCleanup` / `onUnmounted`  | `useEffect` 的 `return`              | `dispose` / `cancel`                |
| 异步资源读取 | `async setup` + `<Suspense>`        | `use()` + `<Suspense>`               | `FutureBuilder`                     |
| 流式数据     | `watch` 一个 ref                    | `use()` / SWR / 库                   | `StreamBuilder`                     |
| 乐观更新     | 手写                                | `useOptimistic`                      | 手写                                |
| 表单提交状态 | 手写 / 库                           | `useActionState` / `useFormStatus`   | `Form` + `GlobalKey<FormState>`     |
| 过渡/延迟    | —                                   | `useTransition` / `useDeferredValue` | —                                   |

---

## 十六、异步 / 定时 / 数据流

| 能力       | Vue 3                    | React 19                      | Flutter 3.x                  |
| ---------- | ------------------------ | ----------------------------- | ---------------------------- |
| 异步值     | `Promise`                | `Promise`                     | `Future`                     |
| 语法       | `async/await`            | `async/await`                 | `async/await`                |
| 定时器     | `setTimeout/setInterval` | 同左                          | `Timer`/`Timer.periodic`     |
| 数据流     | RxJS / 手写              | RxJS / 手写                   | `Stream`（`async*`/`yield`） |
| 渲染后时机 | `nextTick`               | `useLayoutEffect`/`flushSync` | `addPostFrameCallback`       |
| 竞态处理   | `AbortController`        | `AbortController`/`use` 清理  | `mounted` 守卫 / `cancel`    |
| 并发聚合   | `Promise.all`            | `Promise.all`                 | `Future.wait`                |

---

## 十七、数据获取与缓存策略

| 能力       | Vue 3                     | React 19            | Flutter 3.x      |
| ---------- | ------------------------- | ------------------- | ---------------- |
| 声明式请求 | TanStack Query(vue-query) | TanStack Query/SWR  | 手动/Notifier    |
| 缓存失效   | `invalidateQueries`       | `invalidate`/mutate | 手动刷新         |
| 预取       | `queryOptions` prefetch   | prefetch/Loader     | `initState` 预取 |
| 竞态/去重  | 库内置                    | 库内置/`use` 清理   | 手动 `cancel`    |

---

## 十八、服务端组件 / 全栈能力

| 维度       | Vue（Nuxt）    | React（Next）       | Flutter               |
| ---------- | -------------- | ------------------- | --------------------- |
| 服务端组件 | —              | Server Components   | —                     |
| 数据获取   | `useAsyncData` | Server/客户端 fetch | 后端 API              |
| 流式 SSR   | 异步 `v-slot`  | Streaming/resume    | —                     |
| 边缘部署   | Nitro          | Vercel Edge         | Cloud Functions(后端) |
| 元框架     | Nuxt           | Next.js/Remix       | —                     |

---

## 十九、实时数据 / 长连接

| 方式      | Web（Vue/React）    | Flutter                               |
| --------- | ------------------- | ------------------------------------- |
| WebSocket | 原生 / socket.io    | web_socket_channel / socket_io_client |
| SSE       | `EventSource`       | http 解析 / 库                        |
| 长轮询    | fetch 循环          | Timer + 请求                          |
| 实时后端  | Firebase / Supabase | firebase / Supabase realtime          |
| 订阅模型  | RxJS / 手写         | `Stream`                              |

---

## 二十、网络重试 / 超时 / 拦截

| 能力       | Web（Vue/React）   | Flutter                         |
| ---------- | ------------------ | ------------------------------- |
| 请求库     | axios / fetch      | dio / http                      |
| 拦截器     | axios interceptors | dio `Interceptor`               |
| 超时       | `timeout` 配置     | `connectTimeout/receiveTimeout` |
| 自动重试   | axios-retry / 手写 | dio `RetryInterceptor` / 手写   |
| 取消请求   | `AbortController`  | `CancelToken`                   |
| 统一错误码 | 响应拦截器         | 响应拦截器                      |

---

## 二十一、鉴权与令牌刷新流

| 环节         | Web（Vue/React）      | Flutter                   |
| ------------ | --------------------- | ------------------------- |
| Token 存储   | localStorage / cookie | `flutter_secure_storage`  |
| 附带方式     | `Authorization` 头    | dio 拦截器注入            |
| 401 拦截刷新 | axios 拦截器 + 队列   | `AuthInterceptor` + retry |
| 双 Token     | access + refresh      | access + refresh          |
| 路由守卫     | `beforeEach` / loader | `redirect` / guard        |
| 无感续期     | 并发队列去重          | 锁 / 队列                 |

---

## 二十二、本地存储与缓存

| 能力       | Vue 3                           | React 19        | Flutter 3.x            |
| ---------- | ------------------------------- | --------------- | ---------------------- |
| 键值存储   | `localStorage`/`sessionStorage` | 同左            | `SharedPreferences`    |
| 高性能存储 | IndexedDB                       | IndexedDB       | `Hive`/`Isar`          |
| 关系型     | —（走远程/IndexedDB）           | —               | `sqflite`/`drift`      |
| 状态持久化 | Pinia + persistedstate          | Zustand persist | Hive/SharedPreferences |
| Cookie     | `document.cookie`               | 同左            | 无（用本地存储）       |

---

## 二十三、状态持久化与派生

| 能力     | Vue 3                       | React 19               | Flutter                      |
| -------- | --------------------------- | ---------------------- | ---------------------------- |
| 持久化   | pinia-plugin-persistedstate | redux-persist/zustand  | shared_preferences + 序列化  |
| 写入时机 | 订阅自动落盘                | persist 中间件         | 显式 `await setXxx`          |
| 派生选择 | getter/computed             | selector/useSelector   | Provider `select`/`selector` |
| 结构化   | localStorage JSON           | localStorage/IndexedDB | Hive/Isar                    |
| 增量持久 | `partialize` 思维           | persist `partialize`   | 自定义 encoder               |

---

## 二十四、路由

| 能力         | Vue 3（vue-router）          | React 19（react-router）        | Flutter（Navigator / GoRouter）   |
| ------------ | ---------------------------- | ------------------------------- | --------------------------------- |
| 路由表       | `routes` 配置                | `<Routes>` / `<Route>`          | `GoRoute` / `routes`              |
| 编程式跳转   | `router.push` / `replace`    | `useNavigate()`                 | `Navigator.push` / `GoRouter.go`  |
| 返回         | `router.back()`              | `navigate(-1)`                  | `Navigator.pop()`                 |
| 读取参数     | `useRoute().params/query`    | `useParams` / `useSearchParams` | `ModalRoute.of` / `GoRouterState` |
| 守卫/拦截    | `beforeEach` / `beforeEnter` | `loader` / 包裹组件             | `redirect` / `onGenerateRoute`    |
| 当前路由信息 | `useRoute()`                 | `useLocation()`                 | `GoRouterState` / `ModalRoute`    |

---

## 二十五、路由守卫与懒加载细节

| 维度       | Vue 3                      | React 19               | Flutter 3.x        |
| ---------- | -------------------------- | ---------------------- | ------------------ |
| 守卫钩子   | `beforeEach`/`beforeEnter` | loader / middleware    | `redirect`/guard   |
| 组件懒加载 | `defineAsyncComponent`     | `React.lazy`           | 路由按需 build     |
| 路由级分割 | 动态 `import()`            | `next/dynamic`         | deferred imports   |
| 滚动恢复   | `scrollBehavior`           | `useScrollRestoration` | `ScrollController` |
| 权限路由   | 动态 addRoute              | 守卫组件               | redirect + 状态    |

---

## 二十六、懒加载与代码分割

| 能力       | Vue 3                  | React 19                    | Flutter 3.x                   |
| ---------- | ---------------------- | --------------------------- | ----------------------------- |
| 组件懒加载 | `defineAsyncComponent` | `React.lazy`                | `deferred as`（库级延迟）     |
| 路由懒加载 | `() => import('...')`  | `lazy(() => import('...'))` | GoRouter 异步 builder         |
| 挂起占位   | `<Suspense>`           | `<Suspense>`                | 手动 loading 态               |
| 资源预载   | 手动 `import`          | 手动 `import`               | `precacheImage`/deferred load |

---

## 二十七、样式与布局

| 能力       | Vue 3               | React 19                        | Flutter 3.x                          |
| ---------- | ------------------- | ------------------------------- | ------------------------------------ |
| 局部样式   | `<style scoped>`    | CSS Modules / styled-components | Widget 内 `style`/`decoration`       |
| 原子化 CSS | Tailwind / UnoCSS   | Tailwind / CSS-in-JS            | 无（Widget 即样式）                  |
| 主题       | CSS 变量 / 主题包   | `ThemeProvider` + Context       | `Theme` / `ThemeData`                |
| 弹性布局   | Flex（CSS）         | Flex（CSS）                     | `Row` / `Column` / `Flex`            |
| 网格布局   | Grid（CSS）         | Grid（CSS）                     | `GridView` / `Wrap`                  |
| 响应式断点 | 媒体查询 / 容器查询 | 媒体查询 / `matchMedia`         | `LayoutBuilder` / `MediaQuery`       |
| 尺寸单位   | px / rem / %        | px / rem / %                    | 逻辑像素(dp) / `MediaQuery` 比例     |
| 滚动       | CSS `overflow`      | CSS `overflow`                  | `SingleChildScrollView` / `ListView` |

---

## 二十八、字体与排版

| 维度      | Web（Vue/React）           | Flutter                  |
| --------- | -------------------------- | ------------------------ |
| 字体加载  | `@font-face` / fontsource  | `google_fonts`           |
| 单位      | px/rem/em                  | 逻辑像素 + textScaler    |
| 行高/字距 | line-height/letter-spacing | `height`/`letterSpacing` |
| 变量字体  | font-variation-settings    | `FontVariation`          |
| 缩放适配  | rem + 媒体查询             | `MediaQuery.textScaler`  |
| 富文本    | HTML/内容渲染              | `RichText`/`TextSpan`    |

---

## 二十九、设计 Token 与跨端一致性

| 维度     | Vue 3          | React 19               | Flutter 3.x           |
| -------- | -------------- | ---------------------- | --------------------- |
| 颜色     | CSS 变量       | CSS 变量/ThemeProvider | `Color`/`ThemeData`   |
| 间距尺寸 | rem/自定义属性 | rem/自定义属性         | `EdgeInsets`/命名常量 |
| 字体标度 | CSS 变量       | CSS 变量               | `TextTheme`           |
| 圆角阴影 | CSS 变量       | CSS 变量               | `BoxDecoration`       |
| 主题切换 | class/CSS 变量 | Provider 切换          | `ThemeMode`/Provider  |

---

## 三十、图片 / 资源加载与优化

| 能力     | Web（Vue/React）                        | Flutter                               |
| -------- | --------------------------------------- | ------------------------------------- |
| 懒加载   | `loading="lazy"` / IntersectionObserver | `ListView.builder` 懒建               |
| 渐进占位 | LQIP / blur-up                          | `fadeIn` / 占位图                     |
| 现代格式 | WebP / AVIF                             | 视平台支持                            |
| 尺寸适配 | `srcset` / `sizes`                      | `cachedNetworkImage(width)`           |
| 缓存     | HTTP 缓存 + SW                          | `cached_network_image` / `ImageCache` |
| 预加载   | `<link rel=preload>`                    | `precacheImage`                       |
| 裁剪     | URL 参数（OSS/imgix）                   | 同（后端生成 URL）                    |

---

## 三十一、富文本 / Markdown / 高亮

| 能力       | Vue 3              | React 19           | Flutter          |
| ---------- | ------------------ | ------------------ | ---------------- |
| MD 渲染    | markdown-it/marked | react-markdown     | flutter_markdown |
| 富文本编辑 | TipTap/Quill       | TipTap/Slate       | flutter_quill    |
| 代码高亮   | shiki/highlight.js | shiki/rehype-prism | highlight.dart   |
| XSS 防护   | DOMPurify          | DOMPurify          | 内置 sanitizer   |
| SSR 预览   | Nuxt               | Next.js MDX        | 无               |

---

## 三十二、状态占位（空/骨架/错误）

| 能力   | Vue 3            | React 19               | Flutter                   |
| ------ | ---------------- | ---------------------- | ------------------------- |
| 空态   | Empty            | Empty                  | 自定义 widget             |
| 骨架屏 | Skeleton         | react-loading-skeleton | shimmer                   |
| 加载   | Spin             | Spin/Suspense          | CircularProgressIndicator |
| 错误态 | errorCaptured    | ErrorBoundary          | ErrorWidget               |
| 下拉   | van-pull-refresh | react-use              | RefreshIndicator          |

---

## 三十三、可访问性（a11y）

| 维度     | Vue 3                             | React 19               | Flutter 3.x                  |
| -------- | --------------------------------- | ---------------------- | ---------------------------- |
| 语义标签 | 模板直写 HTML                     | JSX 直写 HTML          | 无 DOM（用 Semantics）       |
| 辅助技术 | 原生 ARIA                         | 原生 ARIA              | Semantics widget             |
| 焦点管理 | 原生 / 库                         | 原生 / 库              | Focus / FocusNode            |
| 读屏标签 | `aria-label`                      | `aria-label`           | `Semantics(label:)`          |
| 键盘导航 | 原生                              | 原生                   | `FocusTraversal` / Shortcuts |
| 检查工具 | eslint-plugin-vuejs-accessibility | eslint-plugin-jsx-a11y | 语义调试(DevTools)           |

---

## 三十四、动画与过渡

| 能力      | Vue 3                       | React 19             | Flutter 3.x                       |
| --------- | --------------------------- | -------------------- | --------------------------------- |
| 进入/离开 | `<Transition>`              | CSS / Framer Motion  | `AnimatedSwitcher`                |
| 列表动画  | `<TransitionGroup>`         | Framer Motion        | `AnimatedList`                    |
| 状态驱动  | CSS transition/`@keyframes` | CSS / Framer Motion  | `AnimationController`+`Tween`     |
| 隐式动画  | —（用 CSS）                 | —（用 CSS）          | `AnimatedContainer/Opacity/Align` |
| 共享元素  | 库                          | View Transitions API | `Hero`                            |
| 缓动曲线  | CSS `cubic-bezier`          | CSS / 库             | `Curves`                          |

---

## 三十五、动效降级 / 系统偏好适配

| 偏好     | Web（Vue/React）         | Flutter                        |
| -------- | ------------------------ | ------------------------------ |
| 减少动画 | `prefers-reduced-motion` | `MediaQuery.disableAnimations` |
| 高对比   | `prefers-contrast`       | 自定义 Theme                   |
| 深色模式 | `prefers-color-scheme`   | `platformBrightness`           |
| 文本缩放 | 跟随浏览器 / 根字号      | `textScaler`                   |
| 省电     | 降帧 / 停动画            | `reduceMotion` / 降帧          |

---

## 三十六、移动端原生能力（设备能力）

| 能力      | Vue（H5）             | React Native                     | Flutter                                  |
| --------- | --------------------- | -------------------------------- | ---------------------------------------- |
| 混合方案  | Capacitor / Cordova   | 原生 + 社区模块                  | 平台通道 MethodChannel                   |
| 相机/相册 | camera 插件           | expo-image-picker / image-picker | image_picker / camera                    |
| 定位      | geolocation / 插件    | expo-location                    | geolocator                               |
| 推送      | FCM 插件              | firebase-messaging / expo        | firebase_messaging / local_notifications |
| 传感器    | DeviceMotion API      | expo-sensors                     | sensors                                  |
| 蓝牙      | Web Bluetooth（受限） | react-native-ble-plx             | flutter_blue_plus                        |
| 扫码      | html5-qrcode 等       | expo-barcode-scanner             | mobile_scanner                           |
| 生物识别  | WebAuthn（受限）      | expo-local-authentication        | local_auth                               |
| 权限申请  | 浏览器托管            | expo-permissions                 | permission_handler                       |

---

## 三十七、浏览器 / 平台 API 接入

| API                 | Web（Vue/React）          | Flutter Web          | Flutter 移动       |
| ------------------- | ------------------------- | -------------------- | ------------------ |
| PWA / ServiceWorker | Workbox / vite-plugin-pwa | 有限（pwa_manifest） | 不适用             |
| Web Worker          | Worker / Comlink          | 有限                 | Isolate            |
| WebSocket           | 原生 WebSocket            | dart:io / ws         | web_socket_channel |
| Canvas / WebGL      | 原生 DOM                  | CanvasKit 渲染       | CustomPainter      |
| WebRTC              | 库                        | 受限                 | flutter_webrtc     |
| 剪贴板              | navigator.clipboard       | Clipboard.setData    | Clipboard          |
| 渲染引擎            | 浏览器 DOM                | CanvasKit / Html     | Skia / Impeller    |

---

## 三十八、SEO / 元信息 / 预渲染

| 维度           | Vue(Nuxt)       | React(Next)             | Flutter Web      |
| -------------- | --------------- | ----------------------- | ---------------- |
| meta/标题      | `useHead`       | Metadata API / `<Head>` | 有限(index.html) |
| SSR 利于 SEO   | 是              | 是                      | 弱(CanvasKit)    |
| 预渲染 / SSG   | Nitro prerender | `generate`              | —                |
| 结构化数据     | 手写 JSON-LD    | 手写 JSON-LD            | —                |
| sitemap/robots | 模块            | 模块/生成               | —                |
| OG/canonical   | useHead         | Metadata                | index.html       |

---

## 三十九、文件上传 / 下载

| 能力     | Web（Vue/React）                | Flutter                  |
| -------- | ------------------------------- | ------------------------ |
| 选文件   | `<input type=file>`             | `file_picker`            |
| 上传     | `FormData` / fetch              | `MultipartRequest` / dio |
| 分片     | 手动切 `Blob`                   | 手动 / 库                |
| 断点续传 | tus / 手动                      | tus 客户端               |
| 进度     | `xhr.upload.onprogress` / axios | dio `onSendProgress`     |
| 拖拽上传 | drag & drop API                 | 桌面 drop                |
| 下载     | `a[download]` / Blob            | `url_launcher` / 写文件  |

---

## 四十、跨标签页 / 后台通信

| 机制       | Web（Vue/React）              | Flutter                    |
| ---------- | ----------------------------- | -------------------------- |
| 同域标签页 | `BroadcastChannel`            | —（不适用）                |
| 存储事件   | `storage` event               | —                          |
| 后台线程   | SharedWorker / Web Worker     | `Isolate`                  |
| 跨线程消息 | `postMessage`                 | `sendPort` / `ReceivePort` |
| 共享内存   | `SharedArrayBuffer` + Atomics | 受限                       |

---

## 四十一、Web Components / 互操作

| 能力       | Vue 3                 | React 19          | Flutter              |
| ---------- | --------------------- | ----------------- | -------------------- |
| 自定义元素 | `defineCustomElement` | 手动封装          | 无（平台视图）       |
| 嵌入 WC    | 原生支持              | 原生支持          | PlatformView/WebView |
| iframe     | postMessage           | postMessage       | webview channel      |
| 微前端     | qiankun/wujie         | module federation | 无                   |
| 原生桥     | JSBridge              | JSBridge          | MethodChannel        |

---

## 四十二、依赖注入 / 国际化 / 平台适配

| 能力     | Vue 3                 | React 19                        | Flutter 3.x                        |
| -------- | --------------------- | ------------------------------- | ---------------------------------- |
| 依赖注入 | `provide`/`inject`    | Context / inversify             | `get_it`/`Provider`/`Riverpod`     |
| 国际化   | `vue-i18n`            | `react-i18next`/`react-intl`    | `flutter_localizations`/`intl`     |
| 平台判断 | `navigator.userAgent` | 同左                            | `Platform` / `Theme.of().platform` |
| 环境变量 | `import.meta.env`     | `import.meta.env`/`process.env` | `--dart-define` / `.env`           |
| 深色模式 | CSS 变量 / class 切换 | class / `ThemeProvider`         | `ThemeMode`/`darkTheme`            |

---

## 四十三、国际化细节（复数/日期/货币/RTL）

| 能力     | Web（Vue/React）              | Flutter                            |
| -------- | ----------------------------- | ---------------------------------- |
| 复数     | ICU / pluralize               | `Intl.PluralRules` / slang         |
| 日期时间 | `Intl.DateTimeFormat` / dayjs | `intl` DateFormat                  |
| 货币     | `Intl.NumberFormat`           | `intl` NumberFormat                |
| 时区     | `toLocaleString` / 库         | intl + 后端 UTC                    |
| RTL      | CSS `dir` / 逻辑属性          | `Directionality` / `textDirection` |
| 插值翻译 | vue-i18n / i18next            | slang / intl                       |

---

## 四十四、依赖注入 / 容器模式

| 维度     | Vue 3              | React 19         | Flutter 3.x                |
| -------- | ------------------ | ---------------- | -------------------------- |
| 原生机制 | `provide`/`inject` | Context          | 无内置                     |
| DI 库    | （少用）           | InversifyJS/rxjs | get_it/injectable/riverpod |
| 服务定位 | 组合式函数         | Hook/Context     | `GetIt.instance`           |
| 作用域   | App/组件           | Provider 层级    | 全局/懒加载                |
| 可测试性 | mock composable    | mock Hook        | mock 注册接口              |

---

## 四十五、构建 / 部署目标 / CI

| 维度     | Vue 3                    | React 19               | Flutter 3.x                 |
| -------- | ------------------------ | ---------------------- | --------------------------- |
| 静态产物 | SPA dist                 | SPA dist / export      | Web（build web）            |
| SSR      | Nuxt / vite-ssr          | Next.js / SSR          | —                           |
| 目标平台 | Web                      | Web / RN               | iOS/Android/Web/桌面        |
| CI 产物  | `pnpm build` → dist      | 构建 → 静态/server     | `flutter build apk/ipa/web` |
| 包体分析 | rollup-plugin-visualizer | source-map-explorer    | `--analyze-size`            |
| OTA/热更 | —                        | CodePush / Expo Update | 受限（审核，无 JS 热更）    |

---

## 四十六、Monorepo / 构建工具

| 维度     | Vue 3          | React 19            | Flutter 3.x                |
| -------- | -------------- | ------------------- | -------------------------- |
| 构建器   | Vite           | Vite/Next/Turbopack | Flutter tool(Gradle/Xcode) |
| 包管理   | pnpm workspace | pnpm workspace      | pub + melos                |
| 任务编排 | Turborepo/Nx   | Turborepo/Nx        | melos run                  |
| 版本发布 | changesets     | changesets          | melos version              |
| 共享包   | `workspace:*`  | `workspace:*`       | path 依赖                  |

---

## 四十七、包体积策略

| 手段         | Web（Vue/React）           | Flutter              |
| ------------ | -------------------------- | -------------------- |
| Tree-shaking | Vite/Rollup 天然           | Dart 编译器          |
| 按需引入     | 组件库插件/手动            | 未用即剔除           |
| 代码分割     | `manualChunks`/动态 import | 延迟加载             |
| 资源优化     | 图片压缩/字体子集          | `--tree-shake-icons` |
| 体积分析     | visualizer                 | `--analyze-size`     |
| 产物瘦身     | minify/gzip/brotli         | `--split-debug-info` |

---

## 四十八、测试与工具链

| 能力     | Vue 3                | React 19              | Flutter 3.x        |
| -------- | -------------------- | --------------------- | ------------------ |
| 单元测试 | Vitest               | Jest / Vitest         | `flutter_test`     |
| 组件测试 | Vue Test Utils       | React Testing Library | `testWidgets`      |
| E2E      | Cypress / Playwright | Playwright / Cypress  | `integration_test` |
| Mock     | `vi.mock`            | `jest.mock`           | `mockito`          |

---

## 四十九、调试 / 性能 / 安全工具

| 维度       | Vue 3                      | React 19                                 | Flutter 3.x            |
| ---------- | -------------------------- | ---------------------------------------- | ---------------------- |
| 官方调试器 | Vue DevTools               | React DevTools                           | Flutter DevTools       |
| 性能面板   | Performance / Vue DevTools | Profiler                                 | Performance overlay    |
| 状态检查   | Pinia DevTools             | Redux DevTools                           | BlocObserver / debug   |
| XSS 防护   | 默认转义（`v-html` 危）    | 默认转义（`dangerouslySetInnerHTML` 危） | 无 HTML 注入面         |
| CSRF       | 需后端配合                 | 需后端配合                               | 同（请求层令牌）       |
| 敏感存储   | 避免 localStorage          | 避免明文存储                             | flutter_secure_storage |

---

## 五十、性能优化 API

| 手段         | Vue 3                  | React 19                           | Flutter 3.x                |
| ------------ | ---------------------- | ---------------------------------- | -------------------------- |
| 跳过组件更新 | `v-memo`               | `React.memo`                       | `const` Widget             |
| 值缓存       | `computed`             | `useMemo`                          | getter / 缓存字段          |
| 回调缓存     | 无需                   | `useCallback`                      | 无需                       |
| 长列表       | 虚拟滚动库             | 虚拟滚动库                         | `ListView.builder`（懒建） |
| 局部重绘隔离 | 响应式精确更新         | Fiber 协调                         | `RepaintBoundary`          |
| 降响应式开销 | `shallowRef`/`markRaw` | 不可变更新                         | `const`/`final`            |
| 渲染优先级   | —                      | `useTransition`/`useDeferredValue` | —                          |

---

## 五十一、监控埋点与性能指标

| 能力       | Web（Vue/React）          | Flutter               |
| ---------- | ------------------------- | --------------------- |
| Web Vitals | LCP/CLS/INP（web-vitals） | —（不适用）           |
| 错误监控   | Sentry                    | Sentry/Crashlytics    |
| 埋点分析   | GA/自研 SDK               | firebase_analytics/GA |
| 性能采集   | Performance API           | `PerformanceOverlay`  |
| 帧率       | requestAnimationFrame     | 帧回调统计            |

---

## 五十二、日志与埋点脱敏

| 能力       | Web（Vue/React）       | Flutter                     |
| ---------- | ---------------------- | --------------------------- |
| 开发日志   | console / consola      | `debugPrint` / `logger`     |
| 结构化日志 | loglevel / pino SDK    | `logging` / talker          |
| 生产脱敏   | 拦截敏感字段           | 自定义 `LogFilter`          |
| 埋点上报   | GA / 自研 SDK          | firebase / 自研             |
| 采样/节流  | 手动 / SDK             | 手动 / SDK                  |
| 本地持久化 | localStorage/IndexedDB | 文件 / `shared_preferences` |

---

## 五十三、错误监控与 Sourcemap

| 能力     | Web（Vue/React）               | Flutter                                  |
| -------- | ------------------------------ | ---------------------------------------- |
| 崩溃捕获 | `onerror`/`unhandledrejection` | `runZonedGuarded`/`FlutterError.onError` |
| 上报平台 | Sentry                         | Sentry/Crashlytics                       |
| 源码映射 | 上传 sourcemap                 | symbol maps + `--split-debug-info`       |
| 面包屑   | breadcrumb 埋点                | 自定义日志流                             |
| 错误边界 | ErrorBoundary                  | `ErrorWidget.builder`                    |
| 聚合去重 | fingerprint/grouping           | 同                                       |

---

## 五十四、错误处理与边界

| 能力       | Vue 3                               | React 19                              | Flutter 3.x                                |
| ---------- | ----------------------------------- | ------------------------------------- | ------------------------------------------ |
| 组件级捕获 | `errorCaptured` / `onErrorCaptured` | `<ErrorBoundary>`（class 组件）       | `ErrorWidget.builder`                      |
| 全局捕获   | `app.config.errorHandler`           | `window.onerror` / 自行包裹           | `FlutterError.onError` / `runZonedGuarded` |
| 降级 UI    | 手动切换                            | ErrorBoundary `fallback`              | `ErrorWidget`                              |
| 注意       | —                                   | ErrorBoundary **不**捕获事件/异步错误 | Debug 红屏、Release 灰屏                   |

---

## 五十五、生态与常用库对照

> 同一能力在三个生态里的主流选择，选型时一眼对照（列代表性库，非全部；生态更新快，以官方为准）。

### 55.1 脚手架 / 元框架 / 构建

| 能力             | Vue 3               | React 19                       | Flutter 3.x                  |
| ---------------- | ------------------- | ------------------------------ | ---------------------------- |
| 创建工具         | `create-vue` / Vite | Vite / Next.js（CRA 已停维护） | `flutter create`             |
| 元框架(SSR/全栈) | Nuxt                | Next.js / Remix                | —（`flutter build web`）     |
| 构建打包         | Vite / Rollup       | Vite / Webpack / Turbopack     | Flutter CLI / Gradle / Xcode |
| 跨端             | Capacitor / Ionic   | React Native / Capacitor       | Flutter 原生多端             |

### 55.2 状态管理 / 路由 / 数据请求

| 能力     | Vue 3                   | React 19                               | Flutter 3.x                       |
| -------- | ----------------------- | -------------------------------------- | --------------------------------- |
| 状态管理 | Pinia（官方）/ Vuex(旧) | Redux Toolkit / Zustand / Jotai / MobX | Provider / Riverpod / Bloc / GetX |
| 路由     | vue-router              | react-router / TanStack Router         | go_router / auto_route            |
| 数据请求 | axios + TanStack Query  | axios/fetch + TanStack Query / SWR     | dio / http + retrofit             |
| 实时通信 | socket.io-client        | socket.io-client                       | web_socket_channel                |

### 55.3 UI 组件库 / 样式 / 动画 / 图表

| 能力      | Vue 3                                              | React 19                                        | Flutter 3.x                                               |
| --------- | -------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| UI 组件库 | Element Plus / Ant Design Vue / Naive UI / Vuetify | Ant Design / MUI / shadcn/ui / Chakra / Mantine | Material·Cupertino(内置) / Ant Design Flutter / fluent_ui |
| 样式方案  | Tailwind / UnoCSS / Sass                           | Tailwind / styled-components / Emotion          | 内置（Widget 属性）                                       |
| 动画      | `<Transition>` / GSAP / motion.dev                 | Framer Motion / GSAP / React Spring             | Animated / Rive / Lottie / flutter_animate                |
| 图表      | ECharts(vue-echarts) / Chart.js                    | Recharts / ECharts / visx                       | fl_chart / syncfusion_charts                              |

### 55.4 工具库 / 表单 / i18n

| 能力       | Vue 3                 | React 19                              | Flutter 3.x                      |
| ---------- | --------------------- | ------------------------------------- | -------------------------------- |
| 工具 Hooks | VueUse                | ahooks / usehooks-ts / lodash         | Dart 内置 + package              |
| 表单       | VeeValidate / FormKit | react-hook-form / Formik              | 内置 `Form` + validator          |
| 国际化     | vue-i18n              | react-i18next / react-intl / LinguiJS | intl / slang / easy_localization |

### 55.5 测试 / 代码生成 / 本地存储

| 能力     | Vue 3                                          | React 19                       | Flutter 3.x                                       |
| -------- | ---------------------------------------------- | ------------------------------ | ------------------------------------------------- |
| 测试     | Vitest + Vue Test Utils + Cypress              | Jest/Vitest + RTL + Playwright | flutter_test + integration_test + mockito         |
| 代码生成 | unplugin-auto-import / unplugin-vue-components | —（Babel/SWC 插件）            | build_runner(json_serializable/freezed/retrofit)  |
| 本地存储 | localStorage / IndexedDB                       | localStorage / IndexedDB       | SharedPreferences / Hive / Isar / sqflite / drift |

---

## 五十六、常用术语与缩写对照

| 术语       | Vue 3            | React 19            | Flutter 3.x                |
| ---------- | ---------------- | ------------------- | -------------------------- |
| 组件文件   | SFC（`.vue`）    | JSX/TSX 组件        | Widget 类（`.dart`）       |
| 可复用逻辑 | Composable       | Custom Hook         | mixin / Notifier           |
| 响应式单元 | `ref`/`reactive` | state（Hooks）      | State / Notifier           |
| 派生值     | `computed`       | `useMemo` 结果      | getter                     |
| 渲染描述   | `template`       | JSX                 | `build()` 返回 Widget      |
| 虚拟节点   | VNode            | React Element       | Widget(配置)/Element(实例) |
| 状态容器   | Pinia store      | Redux/Zustand store | Provider/Riverpod/Bloc     |

---

## 五十七、易混点对照（重点）

> 三者命名相近但语义不同，最容易记混，这里单独拉平对齐。

### 57.1 「ref」三兄弟——同名不同命

| 名字        | 属于     | 真实语义                                  | 会不会触发重渲染 |
| ----------- | -------- | ----------------------------------------- | ---------------- |
| `ref()`     | Vue 3    | 响应式包装器，读改写要 `.value`           | ✅ 会            |
| `useRef()`  | React 19 | 可变盒子（存 DOM/值），跨渲染保持         | ❌ 不会          |
| `GlobalKey` | Flutter  | Widget/State 的全局唯一标识，可访问 State | ❌ 本身不触发    |

### 57.2 其它高频混淆对

| 场景           | Vue 3                  | React 19                      | Flutter 3.x             | 关键区别                       |
| -------------- | ---------------------- | ----------------------------- | ----------------------- | ------------------------------ |
| 缓存派生值     | `computed`             | `useMemo`                     | getter                  | Vue 自动追踪；React 靠依赖数组 |
| 监听变化       | `watch`                | `useEffect`                   | `addListener`           | 自动 vs 手动依赖 vs 显式订阅   |
| 对象状态       | `reactive`（可变）     | `useState`（不可变）          | State 字段 + `setState` | React 必须换新对象             |
| DOM 更新后时机 | `nextTick`             | `useLayoutEffect`/`flushSync` | `addPostFrameCallback`  | 微任务 vs 绘制前同步 vs 帧后   |
| 列表 key       | `:key`                 | `key`                         | `ValueKey`              | 都是 diff 复用标识             |
| 跨层数据       | `provide/inject`       | `Context`                     | `InheritedWidget`       | 都避免逐层透传 props           |
| 阻止更新       | `shallowRef`/`markRaw` | `memo`/`useMemo`              | `const` Widget          | 减少不必要渲染                 |
| 属性只读       | `props` 只读           | `props` 只读                  | `final` 字段            | 都不能直接改入参               |
| 子传父         | `emit` 事件            | 回调 prop                     | 回调参数                | 事件 vs 函数调用               |
| 全局状态容器   | Pinia store            | Redux/Zustand store           | Provider/Riverpod/Bloc  | 单一数据源思路一致             |

### 57.3 概念错位提醒

```
Vue 的 ref ≈ React 的 useState（都触发更新），而不是 React 的 useRef！
React 的 useRef ≈ Vue 里「不触发更新的普通变量/模板引用」，Flutter 的 GlobalKey 才偏「引用标识」。
Vue computed / React useMemo / Flutter getter 三者对齐（派生缓存）。
Vue watch / React useEffect / Flutter listener 三者对齐（响应变化做副作用）。
「响应式」：Vue 自动追踪、React 手动声明依赖、Flutter 显式 setState——同一目标三种范式。
```

---

## 五十八、速记卡（一眼记忆版）

```
状态        Vue ref/reactive      React useState           Flutter setState/ValueNotifier
派生        Vue computed          React useMemo            Flutter getter
副作用      Vue watch/watchEffect React useEffect          Flutter initState+dispose
请求        Vue async+Suspense    React use()+Suspense     Flutter FutureBuilder/StreamBuilder
通信父→子   Vue props             React props              Flutter 构造参数
通信子→父   Vue emit              React 回调 prop          Flutter 回调参数
跨层        Vue provide/inject    React useContext         Flutter InheritedWidget/Provider
引用        Vue useTemplateRef    React useRef             Flutter GlobalKey
列表        Vue v-for :key        React map key            Flutter ListView.builder+ValueKey
条件        Vue v-if/v-show       React &&/三元            Flutter if/Visibility
双向绑定    Vue v-model           React value+onChange     Flutter TextEditingController
路由跳转    Vue router.push       React useNavigate        Flutter Navigator.push
布局        Vue Flex/Grid(CSS)    React Flex/Grid(CSS)     Flutter Row/Column/Flex
主题        Vue CSS 变量          React ThemeProvider      Flutter ThemeData
组件定义    Vue SFC(.vue)         React 函数组件           Flutter Stateless/StatefulWidget
逻辑复用    Vue composable        React custom Hook        Flutter mixin/Notifier
表单        Vue v-model           React value+onChange     Flutter Form+Controller
动画        Vue <Transition>      React Framer Motion      Flutter Animated/Hero
存储        Vue localStorage      React localStorage       Flutter SharedPreferences/Hive
错误边界    Vue errorCaptured     React ErrorBoundary      Flutter ErrorWidget/onError
状态管理    Vue Pinia             React Redux/Zustand      Flutter Provider/Riverpod/Bloc
测试        Vue Vitest+VTU        React RTL/Jest           Flutter flutter_test
持久化      Vue persistedstate     React redux-persist      Flutter shared_preferences/Hive
事件总线    Vue mitt               React 自建 EventEmitter  Flutter event_bus
富文本      Vue markdown-it        React react-markdown     Flutter flutter_markdown
拖拽        Vue vuedraggable       React dnd-kit            Flutter ReorderableListView
反馈浮层    Vue ElMessage          React message()          Flutter SnackBar
节点模型    VNode→DOM             Element→Fiber→DOM       Widget→Element→RenderObject
```

---

## 相关链接

- [React 19 vs Vue 3 vs Flutter 生命周期与钩子对比](/dev-knowledge/cross-domain/architecture-and-system/framework-lifecycle-hooks-comparison)（**生命周期维度**，本文姊妹篇）
- [React 19 vs Vue 3 vs Flutter 性能对决](/dev-knowledge/cross-domain/architecture-and-system/framework-performance-comparison)（**性能维度**）
- [React 19 vs Vue 3 vs Flutter 研发思维对比](/dev-knowledge/cross-domain/architecture-and-system/cross-framework-thinking-comparison)（**思维模型维度**）
- [JS · Dart · Python 三大语言 API 对比](/dev-knowledge/cross-domain/architecture-and-system/js-dart-python-api-comparison)（**语言层**对比）
- [JS · Dart · Python 常用 API 与易混点速查](/dev-knowledge/cross-domain/architecture-and-system/js-dart-python-common-api-cheatsheet)（**语言层速查**，本文姊妹篇）
- [Vue 官方 API 参考](https://vuejs.org/api/) · [React 官方 Hooks 参考](https://react.dev/reference/react) · [Flutter Widget 目录](https://docs.flutter.dev/ui/widgets)
