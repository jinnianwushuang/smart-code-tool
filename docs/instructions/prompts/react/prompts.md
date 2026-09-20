---
title: React 提示词集
---

# React 提示词集

面向 React 19 开发场景的 AI 提示词集合。每个 Prompt 用代码块包裹，**复制后替换 `[方括号]` 内容即可直接使用**。

> 版本基线：**React 19 + TypeScript 5.5+**。默认启用 React Compiler（`babel-plugin-react-compiler`）与 Actions 新范式，不再手动写 `useMemo` / `useCallback` / `forwardRef` / `propTypes`。

---

## B. React 组件开发（日常高频）

## RB1. 新建基础组件

> 适用：创建一个标准 React 19 组件，含完整 TS 类型定义

```text
请使用 React 19 + TypeScript 编写 [组件名] 组件。
技术栈：[UI 库，如 Ant Design / shadcn/ui / MUI / 无] + [样式方案，如 CSS Modules / Tailwind / styled-components]
功能：
1. [功能点1，如：受控与非受控双模式输入]
2. [功能点2，如：点击外部自动关闭]

要求（React 19 语法基线）：
- 使用函数组件 + Hooks，禁止 class 组件
- Props 使用 `interface Props {}` 定义；默认值使用**解构默认参数**（不再写 defaultProps）
- 需要暴露 ref 时，**ref 作为普通 prop**（React 19 已内置，无需 forwardRef）
- 需要透传原生属性时使用 `React.ComponentProps<'div'>` 或 `HTMLAttributes<T>`
- 组件默认 export，配套 `types.ts` 独立声明导出类型
- 若启用 React Compiler，禁止手动写 useMemo/useCallback（编译器自动处理）
- 提供基础使用示例（受控 / 非受控 / 带 ref）
```

---

## RB2. 新建表单组件（Actions 范式）

> 适用：React 19 表单，使用 Actions + useActionState + useOptimistic

```text
请使用 React 19 + [react-hook-form / Formik / 原生 FormData] 编写 [表单名，如：用户注册] 表单组件。
字段：
1. [字段1，如：用户名] - [校验规则，如：必填 + 最少 3 字符]
2. [字段2，如：手机号] - [校验规则，如：正则校验]
3. [字段3，如：邮箱] - [异步校验是否已注册]
联动逻辑：当 [条件字段] 值为 [某值] 时，显示/隐藏 [目标字段]

要求（React 19 表单新范式）：
- 使用 `<form action={formAction}>` 而非 onSubmit，天然支持 pending/error/optimistic
- 使用 `useActionState(formAction, initialState)` 管理提交结果与错误
- 使用 `useFormStatus()` 在子组件读取 pending 状态，禁用提交按钮防重复
- 需要乐观更新时使用 `useOptimistic` 立即反馈 UI
- 服务端校验使用 Server Action（`'use server'`），错误通过 useActionState 回传
- 客户端校验使用 [组件库 rules / react-hook-form resolver + zod]
- 通过 useId 生成 label 与 input 关联的 SSR 安全 id
```

---

## RB3. 新建列表/表格组件

> 适用：带分页、搜索、排序的数据列表

```text
请使用 React 19 + [Ant Design Table / TanStack Table / MUI DataGrid] 封装 [业务名，如：订单管理] 高级搜索列表组件。
搜索栏：[输入框、下拉选择、日期范围] 等 [N] 个筛选条件，支持展开/收起
表格列：序号、[字段1]、[字段2]、状态标签（不同状态不同颜色）、操作列（编辑/删除）

要求：
- 使用自定义 Hook `useTable(apiFn)` 封装分页 / 请求 / 搜索 / 重置逻辑
- 请求触发使用 `useTransition` 标记为非紧急，避免搜索输入卡顿
- 大数据量列表使用 `useDeferredValue` 延迟渲染表格数据
- 首次加载与骨架屏使用 `<Suspense fallback={...}>` 包裹
- 数据请求使用 [TanStack Query / SWR] 管理缓存、重试与失效
- 空态、错误态、加载态三分支清晰；错误态使用 ErrorBoundary 兜底
- 提供列排序、行选择、批量操作 API
- 表格高度自适应，支持内部滚动（避免整页滚动条抖动）
```

---

## RB4. 新建弹窗/对话框组件

> 适用：可复用弹窗，支持 Portal、焦点管理、Esc 关闭

```text
请使用 React 19 + [Radix Dialog / shadcn Dialog / Ant Design Modal] 封装通用 [弹窗类型，如：确认删除/表单编辑/详情预览] 弹窗组件。

要求：
- 显隐使用**受控 + 非受控双模式**：`open` / `defaultOpen` / `onOpenChange`
- 通过 `createPortal` 渲染到 `document.body`，避免父级 overflow 裁剪
- 焦点管理：打开时聚焦首个可交互元素，关闭后焦点还原到触发元素
- 支持 Esc 关闭、点击遮罩关闭、锁滚动（body overflow: hidden）
- 内容通过 `children` 或组合式子组件（Dialog.Title / Dialog.Body / Dialog.Footer）传入
- 确认按钮支持 loading 状态（配合 useActionState 或 useFormStatus）
- 弹窗关闭时自动重置内部表单状态（useEffect cleanup 或 key 重置）
- React 19 ref as prop：直接接受 ref 暴露 open/close/focus 方法（配合 useImperativeHandle）
- [可选] 支持 fullscreen 属性切换全屏模式
- 无障碍：role="dialog" / aria-modal / aria-labelledby
```

---

## RB5. 组件大文件拆解

> 适用：将超过 300 行的大组件拆分为模块化架构（React Compiler 友好）

```text
我有一个 React 组件文件超过 [N] 行，需要按模块化最佳实践进行拆解。
组件职责：[描述组件功能]
当前问题：[如：JSX 太长 / 逻辑和视图耦合 / 多处重复代码 / useEffect 依赖地狱]

请按以下架构拆解：
1. **容器组件（Container）**：只负责数据获取与状态协调，输出 props 给展示组件
2. **展示组件（Presentational）**：纯 UI，接收 props 渲染，尽量无状态
3. **Custom Hooks**：业务逻辑抽取为 `useXxx`（如 useTableData / useForm / useSubscription）
4. **子组件目录**：独立 UI 片段（弹窗、面板、列表项）各自成文件
5. **utils**：纯函数（格式化、计算、校验）单独文件；不依赖 React
6. **types.ts**：所有 Props / State / API Response 类型集中定义

React 19 特殊要求：
- 拆分后组件避免深层 props 透传，使用 Context 或组合模式（Compound Components）
- 若使用 React Compiler，拆分粒度以「一个组件 = 一个语义单元」为准，无需手动 memo
- useEffect 拆分为「一个 effect = 一个副作用意图」，避免大杂烩
- 组件间通信优先 props/state 提升，跨层级用 Context，全局状态用 [Zustand / Jotai / Redux Toolkit]

请给出：拆解后的目录结构、每个文件的职责说明、容器组件的编排代码、Custom Hook 的接口签名。
```

---

## RB6. 组件性能优化

> 适用：解决渲染卡顿、瀑布请求、大列表性能问题

```text
我的 React 19 组件存在性能问题，请帮我分析和优化。
问题现象：[如：大列表渲染卡顿 / 输入框打字延迟 / 父组件更新导致所有子组件重渲染 / 首屏白屏时间长]
当前代码：
[粘贴相关代码片段]
是否启用 React Compiler：[是 / 否]

请从以下角度排查并给出优化方案：
1. **React Compiler**：是否已启用？启用后禁止再手动写 useMemo/useCallback（会冲突）
2. **紧急 vs 非紧急更新**：搜索、输入联想是否用 `useTransition` / `useDeferredValue` 降级？
3. **列表渲染**：`key` 是否稳定？大列表（>200 项）是否需要虚拟滚动（@tanstack/react-virtual）？
4. **状态下沉**：高频变化的 state 是否放在了太高的组件层？能否下沉到叶子组件？
5. **Context 拆分**：单一 Context 是否导致所有消费者重渲染？可否拆成 State / Dispatch 双 Context？
6. **子组件隔离**：昂贵子组件是否用 `<Memo>`（Compiler 关闭时）或独立文件包裹？
7. **useSyncExternalStore**：外部 store（Zustand / Redux / 事件总线）订阅是否使用了正确的 selector 避免全量订阅？
8. **Suspense 边界**：数据请求是否用 `<Suspense>` 声明式处理，替代 useEffect + loading state？
9. **Server Components**：能否把纯展示、数据获取部分下沉到 RSC（'use server' 边界之外）减少客户端 JS 体积？

请给出：优化前后代码对比、性能提升说明、React DevTools Profiler 排查建议。
```

---

## RB7. Custom Hook 提取

> 适用：从组件中提取可复用逻辑为 useXxx 函数

```text
请将以下 React 组件中的业务逻辑提取为独立的 Custom Hook。
组件功能：[描述功能]
需要提取的逻辑：[如：数据请求和分页 / 表单校验 / 拖拽排序 / 定时器管理 / WebSocket 订阅]

要求：
- 函数命名 `use[功能名]`，如 useTableData / useFormValidation / useWebSocket
- 返回值使用**对象解构友好**格式：`return { data, loading, error, refresh, mutate }`
- 内部状态使用 useState / useReducer，对外暴露稳定引用（React 19 Compiler 会自动 memo）
- 未启用 Compiler 时，返回的对象和函数必须用 useMemo / useCallback 稳定引用
- 副作用（订阅、定时器）必须在 useEffect cleanup 中释放，避免内存泄漏
- 异步操作包含 loading 状态、错误捕获、AbortController 竞态取消
- 参数支持 options 对象扩展（`useXxx(params, { debounce: 300, enabled: true })`）
- 严格模式（StrictMode）下 effect 会执行两次，Hook 需保证幂等
- 提供完整 TS 类型定义与在组件中的使用示例
- 若可服务端复用，标注 `'use client'` 边界
```

---

## RB8. 样式与主题适配

> 适用：CSS Modules / Tailwind / 组件库样式覆盖 + 亮暗主题

```text
我需要为 React 19 组件配置样式方案，并适配亮暗主题切换。
目标：[描述期望的样式，如：修改表格行高、按钮圆角、卡片阴影]
样式方案：[CSS Modules / Tailwind / styled-components / 组件库覆盖]
当前问题：[如：全局样式污染 / 暗色模式下文字看不清 / 组件库样式难以覆盖]

请给出：
1. **样式隔离**：CSS Modules 命名规范，或 Tailwind 配置（content / theme.extend / darkMode: 'class'）
2. **主题切换**：
   - CSS 变量方案：`:root[data-theme="dark"]` + 语义化 token（--color-bg-primary）
   - React 侧使用 [next-themes / 自建 ThemeProvider + Context] 管理主题状态
   - 主题持久化到 localStorage，SSR 阶段防闪烁（首屏内联 script 读取存储）
3. **组件库覆盖**：
   - Ant Design v5：使用 `ConfigProvider` + `theme.algorithm` (defaultAlgorithm / darkAlgorithm) + token 定制
   - MUI：使用 `createTheme` + `ThemeProvider`
   - shadcn/ui：直接改 `globals.css` 中的 CSS 变量
4. **React 19 新特性**：
   - 使用 `<link rel="stylesheet" precedence="high" href="...">` 声明样式优先级，避免瀑布加载
   - 组件内直接渲染 `<style href="..." precedence="...">{css}</style>`，React 自动去重与提升
5. 样式优先级冲突时的解决建议（避免 !important 滥用）
```

---

## C. React 生态与架构

## RC1. 状态管理（Zustand / Redux Toolkit / Jotai）

> 适用：设计全局状态管理模块

```text
请设计一个 [Zustand / Redux Toolkit / Jotai] store 管理 [业务模块，如：用户信息/购物车/权限]。

要求（以 Zustand 为例）：
- 使用 `create<StoreState>()(devtools(persist((set, get) => ({ ... }))))` 组合中间件
- State：包含 [字段1, 字段2, 字段3]
- Actions：包含异步请求（login / fetchList），处理 loading 和 error
- Selectors：拆分为细粒度 selector 函数（`selectUserInfo`, `selectIsAdmin`）避免全量订阅
- 组件消费使用 `useStore(selector)` + `useShallow`（对象/数组场景）避免引用变化重渲染
- 持久化：`persist` 中间件持久化 [指定字段]，配置 `partialize` 精确挑选
- DevTools：接入 Redux DevTools 便于调试
- SSR 兼容：Next.js 场景使用 `createStore` + Context Provider 避免跨请求污染

若使用 Redux Toolkit：
- 使用 `createSlice` + `createAsyncThunk` 或 RTK Query
- Reducer 内使用 Immer 语法直接"修改"state

若使用 Jotai：
- 使用 atom + derived atom + atomFamily
- 组件消费用 useAtom / useAtomValue / useSetAtom

请给出：Store 定义、Selector 定义、组件消费示例、持久化配置。
```

---

## RC2. 路由与权限

> 适用：动态路由 + 按钮权限 + 面包屑（React Router v7 / Next.js App Router）

```text
请帮我实现 React 19 + [React Router v7 / Next.js App Router / TanStack Router] 的 RBAC 权限控制方案。

需求：
1. **动态路由挂载**：登录后根据后端返回的 menus 树动态渲染路由表
2. **按钮级权限**：编写 `<Permission code="user:create">` 组件或 `usePermission` Hook 控制显隐
3. **面包屑**：配合路由 handle / meta 自动生成当前页面面包屑
4. **路由守卫**：
   - React Router v7：使用 `loader` + `redirect` 拦截未登录 / 无权限
   - Next.js App Router：使用 `middleware.ts` 拦截 + `layout.tsx` 兜底
5. **懒加载**：所有路由组件使用 `React.lazy` + `<Suspense>` 或框架原生动态 import
6. **404 / 403 / 500** 页面统一处理

React 19 特殊要求：
- 使用 `use()` 在 Suspense 边界内消费 loader 返回的 Promise（React Router v7 framework mode）
- Server Components 场景下权限校验前置到服务端（避免客户端闪烁）

请给出：完整目录结构、核心逻辑代码、路由 meta / handle 的 TS 类型定义、错误边界与 Loading 边界配置。
```

---

## RC3. ECharts 可视化封装

> 适用：封装通用图表组件

```text
请封装一个通用的 React 19 ECharts 图表组件 `<BaseChart />`。

要求：
- Props：`option: EChartsOption`、`theme?: 'light' | 'dark'`、`loading?: boolean`、`className`、`style`、`onClick?: (params) => void`
- **ref as prop（React 19）**：直接接收 `ref` 暴露 `getEchartsInstance()` / `resize()` / `dispatchAction()` 方法（配合 useImperativeHandle）
- ECharts 实例存储在 `useRef` 中，**避免放入 state**（Proxy 无关但会触发额外渲染）
- 初始化：`useEffect` 内 `echarts.init(dom, theme)`；卸载时 `dispose()` 防内存泄漏
- 尺寸自适应：使用 `ResizeObserver` 观察容器尺寸变化，触发 `chart.resize()`；窗口 resize 加节流
- option 更新：使用 `chart.setOption(option, { notMerge: false, lazyUpdate: true })`，避免整图重绘
- 主题切换：theme 变化时 dispose 后重新 init（ECharts 主题不支持热切换）
- 事件绑定：`chart.on('click', handler)`，注意在 cleanup 中 `chart.off`
- SSR 兼容：Next.js 场景使用 `dynamic(() => import('./BaseChart'), { ssr: false })`
- 提供柱状图、折线图、饼图的使用示例（配合 useDeferredValue 处理高频 option 变化）
```

---

## RC4. H5 移动端适配

> 适用：移动端列表、下拉刷新、图片懒加载

```text
请使用 React 19 + [Vant / Ant Design Mobile / 无] 开发 H5 端 [业务名，如：商品推荐] 滚动列表。

要求：
1. **无限滚动**：使用 IntersectionObserver 监听哨兵元素触底，自动加载下一页；显示「加载中」「没有更多了」「加载失败点击重试」三态
2. **下拉刷新**：手写 touchstart/touchmove/touchend 或使用 [react-pull-to-refresh]，重置时保持滚动位置
3. **图片懒加载**：IntersectionObserver + 占位骨架图，避免布局抖动（CLS）
4. **虚拟滚动**：数据量 >200 使用 `@tanstack/react-virtual` 只渲染可视区域
5. **适配方案**：`postcss-px-to-viewport` 转 vw，或 `amfe-flexible` + rem；确保 iPhone SE ~ iPhone 15 Pro Max 一致
6. **iOS 兼容**：
   - `-webkit-overflow-scrolling: touch` 平滑滚动
   - 处理橡皮筋效果导致的下拉刷新误触
   - 100vh 问题使用 `dvh` / `svh` 或 JS 计算 `--vh` 变量
7. **手势**：使用 `@use-gesture/react` 处理滑动、长按、双击
8. **性能**：滚动事件加节流；React Compiler 启用后无需手动 memo 列表项

请给出：完整组件代码、Custom Hook（useInfiniteScroll / usePullToRefresh）、性能优化说明。
```

---

## D. React 19 新特性专属

## RD1. Server Components（RSC）设计

> 适用：Next.js App Router / React Router v7 framework mode 下的服务端组件

```text
请使用 React 19 Server Components 设计 [功能名，如：文章详情页 / 数据看板] 模块。

要求：
1. **组件边界划分**：
   - 默认 Server Component（无 'use client' 指令）
   - 需要交互（useState / useEffect / event handler / browser API）时才加 `'use client'`
   - Client 组件应尽量下沉到叶子，最大化 Server 组件占比
2. **数据获取**：直接在 Server Component 内 `async/await` fetch，无需 useEffect
3. **Props 序列化**：Server → Client 的 props 必须可 JSON 序列化（禁止传递函数、Date 需转字符串或用 FormData/Map 特殊支持类型）
4. **Server Actions**：使用 `'use server'` 声明；表单提交直接 `<form action={serverAction}>`；配合 `revalidatePath` / `revalidateTag` 刷新数据
5. **流式渲染**：慢数据用 `<Suspense fallback={...}>` 包裹，配合 `loading.tsx` 提供渐进式加载
6. **SEO**：使用 `generateMetadata` / `<title>` / `<meta>` 组件（React 19 原生支持文档元数据）
7. **错误处理**：`error.tsx` / `not-found.tsx` / `global-error.tsx` 分层
8. **缓存策略**：`fetch` 的 `next: { revalidate }` / `cache: 'force-cache' | 'no-store'`

请给出：目录结构、Server / Client 组件划分说明、数据流转示意、Server Action 示例代码。
```

---

## RD2. `use()` API 与 Suspense 数据流

> 适用：以声明式方式消费 Promise 和 Context

```text
请使用 React 19 的 `use()` API 重构以下数据消费代码：
[粘贴当前使用 useEffect + useState + loading 的组件代码]

要求：
1. **消费 Promise**：使用 `use(promise)` 在 `<Suspense>` 边界内声明式读取异步数据
   - Promise 必须由**父组件创建并缓存**（避免每次渲染新建导致无限挂起）
   - Server Component 传递 Promise 给 Client Component 是典型场景
2. **消费 Context**：使用 `use(MyContext)` 替代 `useContext(MyContext)`
   - `use()` 可在条件语句、循环中调用（不受 Hook 规则限制）
3. **错误处理**：Promise reject 时自动冒泡到最近的 ErrorBoundary
4. **缓存策略**：Promise 建议使用 [TanStack Query / SWR / React Cache (`cache()`)] 缓存，避免每次 render 新建
5. **Suspense 边界**：合理设置 fallback 骨架屏，避免整页 loading 闪烁
6. **Streaming**：Next.js / React Router 场景下配合流式渲染实现渐进加载

请给出：重构后的组件代码、Suspense 边界布局、Promise 缓存方案、错误边界配置。
```

---

## RD3. Actions + useActionState + useOptimistic

> 适用：React 19 表单与异步交互新范式

```text
请使用 React 19 Actions 范式实现 [场景，如：评论提交 / 待办增删改 / 点赞] 功能。

要求：
1. **Action 定义**：
   - 客户端 Action：`async function formAction(prevState, formData) { ... }`
   - 服务端 Action：文件顶部 `'use server'`，函数直接接受 FormData
2. **状态管理**：使用 `useActionState(formAction, initialState)` 返回 `[state, formAction, isPending]`
   - state 结构建议 `{ success: boolean, message: string, errors?: Record<string, string> }`
3. **子组件读取 pending**：使用 `useFormStatus()` 在提交按钮子组件读取 `pending`、`data`、`method`、`action`
4. **乐观更新**：使用 `useOptimistic` 立即反馈 UI
   - 例：点赞后立即显示 +1，失败时自动回滚
   - `const [optimisticList, addOptimistic] = useOptimistic(realList, reducer)`
5. **表单元素**：使用 `<form action={formAction}>` 替代 onSubmit + preventDefault
6. **按钮 pending**：使用 `<button formAction={fn}>` 或 `disabled={isPending}` 防重复提交
7. **无障碍**：错误消息通过 `aria-describedby` 关联到对应 input
8. **Progressive Enhancement**：禁用 JS 时表单仍可原生提交（Server Action 天然支持）

请给出：完整代码（Action 定义 / 组件 / 乐观更新逻辑）、状态类型定义、错误处理策略、与传统 useState + onSubmit 方案对比说明。
```

---

## RD4. Document Metadata 与资源预加载

> 适用：SEO 元数据、字体、样式表、脚本预加载

```text
请使用 React 19 原生的文档元数据与资源管理能力实现 [场景，如：文章页 SEO / 首屏字体优化 / 关键 CSS 加载]。

要求：
1. **文档元数据**（无需 react-helmet）：
   - 组件内直接渲染 `<title>`、`<meta>`、`<link rel="canonical">`
   - React 19 会自动 hoist 到 `<head>` 并去重
   - Next.js 场景优先使用 `generateMetadata` 导出
2. **样式表优先级**：
   - `<link rel="stylesheet" href="..." precedence="high|medium|low">`
   - React 自动按 precedence 排序插入 `<head>`，避免样式瀑布
3. **组件内联样式**：
   - `<style href="unique-id" precedence="high">{cssText}</style>`
   - 相同 href 自动去重，SSR 流式渲染时提前发送
4. **资源预加载 API**（`react-dom` 导出）：
   - `preload(url, { as: 'image' | 'font' | 'script' })` — 关键资源提前加载
   - `preloadModule(url, { as: 'script' })` — ESM 模块预加载
   - `preconnect(origin)` / `prefetchDNS(origin)` — 提前建立连接
   - `prefetchDNS` 用于即将访问的第三方域名
5. **异步脚本**：
   - `<script async src="..." />` React 自动去重，多个组件引用同一脚本只加载一次
6. **字体优化**：
   - `<link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" href="...">`
   - 配合 `next/font` 或 `@font-face` font-display: swap

请给出：具体代码示例、加载时序说明、与传统手写 `<head>` / react-helmet 的对比。
```

---

## RD5. Ref 清理函数与 useImperativeHandle

> 适用：React 19 ref callback 新语义 + 暴露组件方法

```text
请使用 React 19 的 ref 新特性实现 [场景，如：DOM 测量 / 焦点管理 / 第三方库集成 / 暴露子组件方法]。

要求：
1. ref as prop（React 19）：函数组件直接接收 ref prop，无需 forwardRef。
   - Props 类型包含：ref?: React.Ref<HTMLDivElement>
   - 函数签名：function MyComponent({ ref, ...props }: Props)
   - JSX：<div ref={ref} {...props} />
2. ref callback 清理函数（React 19 新语义）：
   - ref 回调 return 一个函数作为 cleanup（替代旧的 ref={null} 回调约定）
   - 示例场景：挂载时 new ResizeObserver(...).observe(node)，cleanup 时 observer.disconnect()
   - 不再推荐 return 一个非清理函数（React 19 会警告）
3. useImperativeHandle：暴露子组件方法给父组件 ref。
   - 调用形式：useImperativeHandle(ref, () => ({ focus, reset, scrollTo }), [deps])
   - 典型暴露方法：focus() / reset() / scrollTo(top) / getData() / open() / close()
4. useRef 初值必填：React 19 TS 类型要求 useRef<T | null>(null) 或 useRef<T>(initialValue)。
5. 避免滥用：优先使用 state / props，ref 仅用于命令式 DOM 交互、聚焦、动画、第三方库桥接。

请给出：完整代码、TS 类型定义、常见陷阱（StrictMode 双调用、卸载时机、闭包捕获旧值）说明。
```

---

## RD6. ErrorBoundary 与错误报告

> 适用：React 19 新错误处理机制

```text
请使用 React 19 的错误处理机制搭建 [项目名] 的错误边界与上报体系。

要求：
1. **ErrorBoundary 组件**：使用 class 组件实现（React 19 仍未提供 Hook 版）或使用 [react-error-boundary] 库
2. **分层边界**：
   - 全局边界：`root.render(<ErrorBoundary onError={report}><App /></ErrorBoundary>)`
   - 路由级边界：每个路由独立 ErrorBoundary，避免整站崩溃
   - 组件级边界：昂贵/易错模块（图表、富文本编辑器）单独包裹
3. **React 19 新错误回调**：`createRoot(container, { onCaughtError, onUncaughtError, onRecoverableError })`
   - `onCaughtError`：被 ErrorBoundary 捕获的错误
   - `onUncaughtError`：未被任何边界捕获的错误
   - `onRecoverableError`：可恢复错误（如 hydration 失败）
4. **Fallback UI**：提供重试按钮（`resetErrorBoundary()`）、返回首页、上报日志入口
5. **错误上报**：接入 [Sentry / Bugsnag / 自建]，携带 componentStack、面包屑、用户信息
6. **Server Components 错误**：Next.js 使用 `error.tsx` / `global-error.tsx`
7. **开发环境**：保留详细堆栈；生产环境展示友好文案，隐藏敏感信息
8. **异步错误**：Action / useEffect 内 try-catch + 上报，ErrorBoundary 无法捕获事件处理器错误

请给出：完整代码、分层策略、上报字段清单、开发/生产差异化配置。
```

---

## E. JavaScript 通用

## RE1. 复杂数据结构处理

> 适用：数组/对象转换、统计、过滤、树结构

```text
我有一组复杂 JSON 数据如下：
[粘贴数据或描述结构]

请帮我编写一个纯函数实现以下转换：
1. 过滤：剔除 [条件，如：状态为已取消] 的数据
2. 转换：[如：列表转树状结构 / 数组平铺 / 分组统计]
3. 计算：统计 [字段名] 的总和/平均值/分布

要求：优先使用 ES6+ 数组方法（reduce/map/filter/Object.groupBy），代码简洁高可读，包含边界处理（空数据、字段缺失）。
```

---

## RE2. 异步流程控制

> 适用：并发请求、串行请求、超时、竞态处理

```text
我需要处理一组异步请求，场景如下：
[如：并发请求 5 个接口全部完成后合并数据 / 依次串行请求 / 搜索框防竞态]

要求：
1. 使用 async/await 语法
2. 错误处理：[如：某个失败则忽略继续 / 立即退出 / Promise.allSettled]
3. 超时机制：使用 `AbortSignal.timeout(N)` 或手写 Promise.race
4. 竞态处理：使用 AbortController 取消过期请求，只处理最后一次结果
5. 并发限制：如需限流，实现 `pLimit(concurrency)` 工具
请给出完整实现代码和调用示例。
```

---

## RE3. 工具函数封装

> 适用：防抖节流、深拷贝、日期格式化等通用工具

```text
请封装一个 [功能名，如：深拷贝 / 防抖函数 / 日期格式化] 工具函数。
要求：
1. 性能：考虑大数据量处理效率
2. 健壮性：[如：处理循环引用 / 处理 Symbol / 处理 BigInt]
3. 环境：同时兼容浏览器和 Node.js
4. TypeScript：包含完整的类型定义（泛型、条件类型、infer）
5. 优先使用现代 API：`structuredClone` / `Intl.DateTimeFormat` / `Object.groupBy`
6. 提供调用示例和边界测试用例（Vitest / Jest）
```

---

## RE4. DOM 操作与原生交互

> 适用：不依赖框架的原生 JS 实现

```text
请使用原生 JavaScript 实现 [功能名，如：自定义弹窗插件 / 图片瀑布流 / 拖拽排序]。
要求：
1. 使用最新 DOM API（IntersectionObserver / ResizeObserver / MutationObserver），不依赖 jQuery
2. 频繁操作（滚动/缩放）集成 [防抖/节流]
3. 样式隔离：Shadow DOM 或 CSS Modules，不污染全局
4. 交互：[如：点击外部自动关闭 / 拖拽边界限制 / 键盘导航]
5. 提供 `init()` / `destroy()` 方法，destroy 中移除所有事件监听、Observer、定时器，确保无内存泄漏
6. 支持在 React/Vue 中通过 ref 桥接使用
```

---

## F. Web/H5 应用

## RF1. H5 无限滚动列表

> 适用：移动端商品列表、信息流

```text
请使用 React 19 + [Vant / Ant Design Mobile] 开发 H5 端 [业务名] 无限滚动列表。
要求：
1. 触底自动加载分页，显示「加载中」和「没有更多了」
2. 下拉刷新，数据重置时保持滚动位置
3. 图片懒加载 + 占位图防布局抖动（CLS）
4. 使用 IntersectionObserver 优化长列表性能
5. 大数据量启用 @tanstack/react-virtual 虚拟滚动
6. iOS 滑动流畅无白屏，处理橡皮筋效果
7. 使用 React Compiler 后无需手动 memo 列表项
```

---

## RF2. PC 官网响应式页面

> 适用：产品介绍、特性展示等官网页面

```text
请使用 React 19 + Next.js 15 + [Tailwind CSS / UnoCSS] 开发 [模块名，如：产品特性介绍] 页面。
要求：
1. 响应式：适配 1920px / 1440px / 平板端，间距字体比例协调（Tailwind container queries）
2. 入场动画：滚动到区域时卡片 [渐显上浮]（Framer Motion `whileInView` 或 CSS `animation-timeline: view()`）
3. 悬浮交互：卡片 hover 轻微放大或阴影加深
4. 语义化标签：使用 section/article/h2，SEO 友好
5. Server Component 优先，仅动画/交互部分 `'use client'`
6. 使用 React 19 `<title>` / `<meta>` 组件配置 SEO 元数据
7. 图片使用 `next/image` 自动 WebP + 懒加载 + srcset
```

---

## RF3. H5 营销活动页

> 适用：倒计时、抢购、报名表等活动页面

```text
请编写 React 19 H5 活动页面的 [倒计时/报名表] 组件。
场景：[如：距离活动结束还有 X 小时 X 分]
要求：
1. 精度：使用 `requestAnimationFrame` 解决 setTimeout 计时偏差；页面隐藏时暂停（`document.visibilitychange`）
2. 状态控制：结束时自动 [按钮置灰/触发事件/跳转]
3. 报名提交：使用 Action + useActionState + useOptimistic（乐观显示"提交中"）
4. 埋点：预留数据埋点调用位置（进入页面/点击/成功），使用 useEffect + AbortController 防竞态
5. 适配：px 转 vw，iPhone SE ~ 15 Pro Max 位置不偏移
6. SSR 兼容：倒计时初值来自服务端时间戳，客户端 hydrate 后接管，避免时间漂移
```

---

## RF4. 多端适配方案

> 适用：一套代码兼容 H5 和 PC

```text
我需要 [功能名] 模块同时兼容移动端 H5 和 PC 端。
请给出（React 19 场景）：
1. Media Queries 编写思路（Tailwind breakpoints / CSS container queries）
2. 封装 `useDevice` / `useMediaQuery` Custom Hook（基于 matchMedia + useSyncExternalStore）
3. SSR 阶段设备检测：读取 `User-Agent` 或使用 Client Hints，避免 hydration mismatch
4. 触摸事件与点击事件的合并/区分处理建议（Pointer Events 优先）
5. 复杂 UI 差异的组件拆分策略：`<MobileLayout>` / `<DesktopLayout>` 动态导入
6. 使用 `useDeferredValue` 处理 resize 时的高频布局切换
```

---

## React 19 迁移速查表

从 React 18 及以下迁移到 React 19 时，以下写法需要更新（可作为 Prompt 补充指令）：

```text
请按 React 19 迁移规范检查并改写以下代码：
[粘贴旧代码]

迁移清单：
1. ❌ `forwardRef((props, ref) => ...)` → ✅ `function C({ ref, ...props }) { ... }`
2. ❌ `<MyContext.Provider value={...}>` → ✅ `<MyContext value={...}>`
3. ❌ `propTypes` / `defaultProps`（函数组件） → ✅ TS 类型 + 解构默认参数
4. ❌ `useContext(Ctx)` → ✅ `use(Ctx)`（可在条件语句中）
5. ❌ `useEffect + fetch + setState + loading` → ✅ `use(promise)` + `<Suspense>`
6. ❌ `onSubmit={e => { e.preventDefault(); ... }}` → ✅ `<form action={fn}>` + `useActionState`
7. ❌ 手写乐观更新 setState 回滚 → ✅ `useOptimistic`
8. ❌ `react-helmet` → ✅ 原生 `<title>` / `<meta>` 组件
9. ❌ ref callback `return () => {}` 无意义写法 → ✅ 明确 setup/cleanup 语义
10. ❌ `useRef()` 无初值 → ✅ `useRef<T | null>(null)`
11. ❌ 手动 `useMemo` / `useCallback` → ✅ 启用 React Compiler 后删除
12. ❌ `ReactDOM.render` → ✅ `createRoot(...).render(...)`
13. ❌ `unstable_ConcurrentMode` → ✅ `createRoot` 默认并发
14. ❌ 字符串 ref / legacy context / findDOMNode → ✅ 全部移除
```

---

## 提问技巧（React 19 专属）

1. **强制版本**：开头声明「基于 React 19 + TypeScript 5.5+」，避免 AI 输出 forwardRef / defaultProps 等过时写法
2. **说明 Compiler 状态**：明确「已启用 / 未启用 React Compiler」，直接影响是否需要手写 memo
3. **框架上下文**：说明是 [Vite SPA / Next.js App Router / Next.js Pages Router / React Router v7 framework / Remix]，决定是否可用 RSC 与 Server Actions
4. **赋予角色**：「你是一名精通 React 19 与 Server Components 的资深前端工程师」
5. **给例子（Few-Shot）**：贴上项目现有组件风格，让 AI 保持一致
6. **分步思考**：复杂逻辑前加「请先分析实现思路（含 Hook 调用链、状态提升、副作用边界），再生成代码」
