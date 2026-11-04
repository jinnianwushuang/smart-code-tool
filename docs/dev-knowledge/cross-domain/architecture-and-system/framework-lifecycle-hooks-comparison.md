---
title: 'Vue 3 · React 19 · Flutter 3.x 生命周期与组合式 API 钩子对比'
tags: ['Vue', 'React', 'Flutter', '生命周期', 'Hooks', '组合式 API', '思维']
---

# Vue 3 · React 19 · Flutter 3.x：生命周期钩子与组合式 API 钩子全景对比

> 本文与 [React 19 vs Vue 3 vs Flutter 3.x 复杂业务性能对决](/dev-knowledge/cross-domain/architecture-and-system/framework-performance-comparison) 是**不同维度**：那篇比「性能结构性差异」，这篇比「**生命周期模型 + 组合式/Hooks API 的映射与心智差异**」。三大框架对「组件的一生」有根本不同的抽象：**Vue 是「组件实例的生命周期节点」，React 是「渲染即快照 + 与外部系统同步」（刻意没有生命周期钩子），Flutter 是「Widget/Element/State 三棵树 + State 生命周期」**。理解这套映射，才能在一个框架里学到的经验无损迁移到另一个。

---

## 一、三种「生命周期」心智模型（What）

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Vue 3 — 「实例生命周期」模型                                                 │
│  组件是一个有状态的实例，框架在实例的关键节点主动调用你的钩子                  │
│  setup() → onBeforeMount → onMounted → onBeforeUpdate → onUpdated            │
│         → onBeforeUnmount → onUnmounted                                       │
│  心智：我有一系列「时机」，框架在这些时机叫我                                  │
├────────────────────────────────────────────────────────────────────────────┤
│  React 19 — 「渲染快照 + 副作用同步」模型（无生命周期钩子）                    │
│  函数组件每次执行 = 一次渲染 = 一份 props/state 的快照                         │
│  useEffect 不是「挂载后」，而是「渲染提交后，与外部系统同步」                  │
│  心智：我不关心「第几次、哪个阶段」，我只声明「渲染后要让什么与什么保持同步」   │
├────────────────────────────────────────────────────────────────────────────┤
│  Flutter 3.x — 「三棵树 + State 生命周期」模型                                │
│  Widget(不可变配置) → Element(生命周期载体) → RenderObject(布局绘制)          │
│  State 承载可变状态：createState → initState → didChangeDependencies → build  │
│                    → didUpdateWidget → deactivate → dispose                  │
│  心智：Widget 会被频繁重建（廉价），真正「活着」的是 Element/State             │
└────────────────────────────────────────────────────────────────────────────┘
```

一句话概括差异：

| 框架         | 生命周期的本质              | 「挂载完成」怎么表达                 | 谁触发更新              |
| ------------ | --------------------------- | ------------------------------------ | ----------------------- |
| **Vue 3**    | 实例的时间轴节点            | `onMounted`                          | 响应式数据变更自动      |
| **React 19** | 渲染快照 + 提交后同步副作用 | `useEffect(fn, [])`（空依赖）        | `setState` 触发重渲染   |
| **Flutter**  | State 对象的方法回调        | `initState` + `addPostFrameCallback` | `setState` 触发 rebuild |

---

## 二、完整生命周期钩子映射表（核心）

按「组件一生的阶段」把三者对齐。React 同时给出**类组件**（有显式生命周期）与**函数组件**（用 Hooks 表达）两种写法，因为 React 19 里函数组件是主流，但类组件生命周期仍是理解心智的钥匙。

| 阶段               | Vue 3 Options API           | Vue 3 组合式 API                | React 19 类组件                                   | React 19 函数组件                | Flutter 3.x State                                            |
| ------------------ | --------------------------- | ------------------------------- | ------------------------------------------------- | -------------------------------- | ------------------------------------------------------------ |
| **创建/初始化**    | `beforeCreate`→`created`    | `setup()`（合并了这两者）       | `constructor`                                     | 函数体首次执行                   | `createState()`→`initState()`                                |
| **首次挂载前**     | `beforeMount`               | `onBeforeMount`                 | `render`                                          | 渲染阶段（return JSX）           | `initState()` 后首次 `build()`                               |
| **首次挂载后**     | `mounted`                   | `onMounted`                     | `componentDidMount`                               | `useEffect(fn, [])`              | `addPostFrameCallback` / 首帧后                              |
| **依赖变化**       | —（用 `watch`）             | —（用 `watch`）                 | `getDerivedStateFromProps`                        | 渲染期派生 / `useMemo`           | `didChangeDependencies()`                                    |
| **更新前**         | `beforeUpdate`              | `onBeforeUpdate`                | `shouldComponentUpdate`/`getSnapshotBeforeUpdate` | 渲染阶段（无显式钩子）           | `build()` 之前                                               |
| **更新后**         | `updated`                   | `onUpdated`                     | `componentDidUpdate`                              | `useEffect(fn, [deps])`          | `didUpdateWidget(oldWidget)`                                 |
| **卸载/销毁**      | `beforeUnmount`→`unmounted` | `onBeforeUnmount`→`onUnmounted` | `componentWillUnmount`                            | `useEffect` 的 `return` 清理函数 | `deactivate()`→`dispose()`                                   |
| **错误捕获**       | `errorCaptured`             | `onErrorCaptured`               | `componentDidCatch`/`getDerivedStateFromError`    | `<ErrorBoundary>` 包裹           | `FlutterError.onError` / Zone                                |
| **缓存激活**       | `activated`/`deactivated`   | `onActivated`/`onDeactivated`   | —（手动实现）                                     | —（手动实现）                    | `AutomaticKeepAliveClientMixin`                              |
| **应用级生命周期** | —（浏览器事件）             | —                               | —                                                 | —                                | `WidgetsBindingObserver`（resumed/inactive/paused/detached） |

> ⚠️ 版本要点：
>
> - **Vue 3** 把 Vue 2 的 `beforeDestroy`/`destroyed` 改名为 `onBeforeUnmount`/`onUnmounted`；`setup()` 取代了 `beforeCreate`/`created`。
> - **React 19** 移除了 `componentWillMount`/`componentWillReceiveProps`/`componentWillUpdate` 这些遗留（UNSAFE\_）生命周期；类组件保留但不再是推荐写法。
> - **Flutter** 的 `build()` 会被**高频调用**，它不是「生命周期节点」而是「描述 UI 的纯函数」，副作用绝不能写在 `build` 里。

---

## 三、组合式 API / Hooks 能力钩子对比

生命周期只是「时机」，日常开发更多是按「能力」选钩子。下面按能力维度横向对比——这才是真正每天要用的映射表。

| 能力               | Vue 3 组合式 API                       | React 19 Hooks                               | Flutter 3.x                               |
| ------------------ | -------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| **局部状态**       | `ref` / `reactive`                     | `useState` / `useReducer`                    | `setState` + State 字段 / `ValueNotifier` |
| **派生计算**       | `computed`                             | `useMemo`                                    | getter / 手动缓存字段                     |
| **副作用+清理**    | `watch`/`watchEffect` + `onUnmounted`  | `useEffect` + `return` 清理                  | `initState` 里订阅 + `dispose` 里释放     |
| **同步布局副作用** | （无独立 API，`nextTick`）             | `useLayoutEffect`（绘制前同步）              | `addPostFrameCallback`（帧后）            |
| **DOM/实例引用**   | `useTemplateRef`(3.5+) / `ref`         | `useRef`                                     | `GlobalKey`                               |
| **跨层注入**       | `provide` / `inject`                   | `useContext` + `createContext`               | `InheritedWidget` / `Provider`            |
| **逻辑复用**       | Composable（`useXxx`）                 | 自定义 Hook（`useXxx`）                      | `mixin` / `Notifier` / `flutter_hooks`    |
| **性能控制**       | `shallowRef`/`markRaw`/`computed` 缓存 | `memo`/`useMemo`/`useCallback`               | `const` Widget / `RepaintBoundary`        |
| **并发/过渡**      | —（无 startTransition 等价）           | `useTransition`/`useDeferredValue`           | —                                         |
| **资源读取**       | `async setup` + `<Suspense>`           | `use()` + `<Suspense>`（React 19）           | `FutureBuilder` / `StreamBuilder`         |
| **乐观更新**       | 手动                                   | `useOptimistic`（React 19）                  | 手动                                      |
| **表单/Action**    | 手动 / 库                              | `useActionState`/`useFormStatus`（React 19） | `Form` + `GlobalKey<FormState>`           |

### React 19 新增/变化的钩子（版本敏感，面试常问）

```
use(resource)          读取 Promise 或 Context，可在条件/循环中调用（唯一破例的 Hook）
useActionState         管理 Action 的表单提交状态（pending/result/error）
useFormStatus          子组件读取父 <form> 的提交状态
useOptimistic          乐观 UI：先显示预期结果，失败再回滚
ref 作为普通 prop       函数组件直接收 ref，不再需要 forwardRef
ref 清理函数           ref 回调可 return 一个清理函数（React 19）
```

### Vue 3.5+ 相关增强

```
useTemplateRef()       显式模板引用（替代字符串 ref 的隐式匹配）
props 解构保持响应式    3.5 起 reactive props destructure 稳定
onWatcherCleanup()     watch/watchEffect 中注册清理逻辑
```

---

## 四、关键差异深挖（Why）

### 4.1 React 为什么「没有」onMounted / 生命周期钩子？

React 官方立场：`useEffect` 不是生命周期钩子，而是**「让组件与某个外部系统保持同步」的声明**。

```
Vue/Flutter 心智（命令式时机）：       React 心智（声明式同步）：
"挂载完成后，去请求数据"              "当 postId 变化时，UI 应与该帖子的数据保持同步"
onMounted(() => fetch(id))           useEffect(() => { sync(postId) }, [postId])

差异后果：
- Vue/Flutter：钩子按「次数/阶段」触发，天然区分「首次」和「更新」
- React：useEffect 不区分挂载/更新，用「依赖数组」表达同步条件
         空数组 [] ≈ 只在提交后同步一次（≈ onMounted），但这只是巧合而非语义
```

### 4.2 清理时机对比（资源释放是面试高频）

```javascript
// Vue 3：watch 自动收集 + onUnmounted 手动清理
onMounted(() => { ws = new WebSocket(url) })
onUnmounted(() => ws?.close())
// 或 watchEffect 返回 onWatcherCleanup 注册的清理函数

// React 19：useEffect 返回清理函数，下次执行前 & 卸载时都会调用
useEffect(() => {
  const ws = new WebSocket(url)
  return () => ws.close()   // 清理：依赖变化前 + 卸载时
}, [url])

// Flutter：initState 建立、dispose 释放，成对出现
@override
void initState() { super.initState(); _sub = stream.listen(...) }
@override
void dispose() { _sub.cancel(); _controller.dispose(); super.dispose() }
```

**关键差异**：React 的清理**每次依赖变化都会先执行**（适合「重新订阅」语义）；Vue 的 `onUnmounted` 只在卸载时执行一次，若要在依赖变化时清理需借助 `watch` 的返回或 `onWatcherCleanup`；Flutter 的 `dispose` 只在 State 销毁时执行一次。

### 4.3 依赖追踪方式：自动 vs 手动 vs 显式通知

```
Vue 3     —— 自动追踪：computed/watchEffect 运行时收集依赖，改哪个属性就更新谁
React 19  —— 手动声明：useEffect/useMemo 的依赖数组由你写，写漏 = 过期闭包(stale closure)
Flutter   —— 显式通知：改了状态必须 setState()/notifyListeners() 才触发 rebuild
```

这直接决定了各自的「坑」：React 的**依赖数组遗漏 / stale closure**、Flutter 的**忘记 setState 或 setState 后直接读旧值**、Vue 的**解构 reactive 丢失响应性 / ref 忘记 .value**。

### 4.4 执行次数与「首次」判断

```
Vue 3     onMounted 只执行一次；watch 默认懒执行（首次不触发），要立即跑加 { immediate: true }
React 19  useEffect(fn,[]) 提交后执行；开发环境 StrictMode 会「挂载→卸载→再挂载」双调用，
          生产环境一次；不能用「第几次渲染」判断首次，要用 ref 标记
Flutter   initState 一次；build 多次（不保证次数）；didUpdateWidget 在父级重建传入新 Widget 时触发
```

### 4.5 副作用与「首帧/绘制」的时序

```
浏览器绘制时间轴（Web）：
  React: render → commit(改 DOM) → useLayoutEffect(同步) → 浏览器绘制 → useEffect(异步)
  Vue:   render → patch(DOM) → onMounted(微任务后) → 浏览器绘制
Flutter 时间轴：
  build → layout → paint → 帧回调 addPostFrameCallback（此时才有真实尺寸/上下文）
```

需要在「拿到真实尺寸后」做事：Web 用 `useLayoutEffect`（同步、绘制前）或 Vue 的 `nextTick`；Flutter 用 `addPostFrameCallback`。

### 4.6 同场景三写：挂载请求数据 + 卸载取消

```vue
<!-- Vue 3 -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const data = ref(null)
const ctrl = new AbortController()
onMounted(async () => {
  data.value = await fetch('/api/user', { signal: ctrl.signal }).then((r) => r.json())
})
onUnmounted(() => ctrl.abort())
</script>
```

```jsx
// React 19
function User() {
  const [data, setData] = useState(null)
  useEffect(() => {
    const ctrl = new AbortController()
    fetch('/api/user', { signal: ctrl.signal })
      .then((r) => r.json())
      .then(setData)
    return () => ctrl.abort() // 清理即取消，天然防竞态
  }, [])
  return <div>{data?.name}</div>
}
```

```dart
// Flutter 3.x
class _UserState extends State<User> {
  Map? _data; final _client = HttpClient();
  @override
  void initState() {
    super.initState();
    _load();
  }
  Future<void> _load() async {
    final res = await http.get(Uri.parse('/api/user'));
    if (mounted) setState(() => _data = jsonDecode(res.body)); // mounted 防止卸载后 setState
  }
  @override
  void dispose() { _client.close(); super.dispose(); }
  @override
  Widget build(BuildContext context) => Text(_data?['name'] ?? '');
}
```

> 注意 Flutter 特有的 **`if (mounted)`** 守卫：异步回来后 State 可能已 dispose，直接 `setState` 会抛异常——这是 Web 两端没有的显式约束。

---

## 五、速查（一眼记忆版）

```
初始化      Vue setup()          React useState 初值/函数体      Flutter initState()
挂载后      Vue onMounted        React useEffect([])            Flutter addPostFrameCallback
更新        Vue watch/updated    React useEffect([deps])        Flutter didUpdateWidget
卸载清理    Vue onUnmounted      React useEffect return         Flutter dispose()
派生值      Vue computed         React useMemo                  Flutter getter
引用DOM     Vue useTemplateRef   React useRef                   Flutter GlobalKey
跨层数据    Vue provide/inject   React useContext               Flutter InheritedWidget
逻辑复用    Vue composable       React custom Hook              Flutter mixin/Notifier/hooks
```

---

## 六、高频面试题

### Q1：React 的 useEffect 等价于 Vue 的哪个钩子？

**要点**：不能简单等价。`useEffect(fn,[])` 行为上近似 `onMounted`，但语义不同——它是「渲染提交后与外部系统同步」。React 无「更新前/后」的显式钩子，靠依赖数组表达同步条件；清理函数每次依赖变化和卸载时都执行，这点比 Vue `onUnmounted`（只卸载执行一次）更主动。

### Q2：Flutter 的 build 和 Vue/React 的渲染有什么本质区别？

**要点**：Flutter `build` 是**纯函数**，会被高频调用且**不保证次数**，副作用绝不能放里面；Widget 是不可变配置，重建廉价，真正的生命周期载体是 Element/State。React 函数组件体也是每次渲染执行，但通过 Hooks 顺序约束 + Fiber 复用；Vue 的更新由响应式依赖精确驱动，粒度更细。

### Q3：三大框架各自的「状态更新陷阱」是什么？

**要点**：React——依赖数组遗漏导致 stale closure、setState 异步批处理；Vue——解构 reactive/props 丢失响应性、ref 忘写 `.value`；Flutter——忘调 setState、setState 后立即读旧值、异步后未判 `mounted`、在 build 里做副作用。

### Q4：React 19 的 use() 钩子和传统 Hook 有什么不同？

**要点**：`use()` 是唯一可以在条件语句/循环中调用的 Hook；用于读取 Promise（配合 Suspense）或 Context；让「资源读取」从 useEffect+useState 的手写模式变成声明式。

### Q5：如何在三端都实现「组件卸载时取消未完成的请求」？

**要点**：见 4.6。React 用 useEffect 返回清理函数 + AbortController；Vue 用 onUnmounted + AbortController；Flutter 用 dispose 关闭 client + `mounted` 守卫。核心都是「建立与释放成对出现」。

---

## 七、延伸思考

1. **设计题**：把 Vue 的 `onMounted/onUnmounted/watch` 用 React Hooks 封装成一套「生命周期兼容层」，会遇到哪些语义鸿沟？（提示：watch 的 immediate/deep、清理时机差异）
2. **对比题**：为什么 React 坚持「无生命周期」而 Vue/Flutter 保留？这与各自的更新驱动方式（手动依赖 vs 自动追踪 vs 显式通知）有何关系？
3. **迁移题**：一个 Vue composable 迁移成 Flutter，用 `flutter_hooks` 还是 `Notifier`？各自的取舍是什么？

---

## 相关链接

- [React 19 vs Vue 3 vs Flutter 3.x 复杂业务性能对决](/dev-knowledge/cross-domain/architecture-and-system/framework-performance-comparison)（**性能维度**对比，与本文互补）
- [跨框架研发思维对比](/dev-knowledge/cross-domain/architecture-and-system/cross-framework-thinking-comparison)（**思维模型维度**对比）
- [React 19 vs Vue 3 vs Flutter 常用 API 速查](/dev-knowledge/cross-domain/architecture-and-system/framework-common-api-cheatsheet)（**API 罗列 / 易混点速查**，纯罗列一眼回忆版）
- [Vue 官方：生命周期钩子](https://vuejs.org/guide/essentials/lifecycle.html)
- [React 官方：You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React 19 新特性](https://react.dev/blog/2024/12/05/react-19)
- [Flutter 官方：StatefulWidget 生命周期](https://api.flutter.dev/flutter/widgets/StatefulWidget-class.html)
