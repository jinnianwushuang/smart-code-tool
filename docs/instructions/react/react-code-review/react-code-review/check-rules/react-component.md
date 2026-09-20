# React 组件（react-component）

> 检查 React 19 组件与 JSX 中的最佳实践与常见反模式。默认按「已启用 React Compiler」心智模型审查。

## 检查项

### 1. 列表渲染缺少 key 或 key 使用 index

- **严重级别**：🟡 Warning
- **检查方式**：扫描 `map` 渲染的 JSX，检查是否有 `key`，以及 key 是否使用了数组下标
- **问题示例**：

```tsx
// 缺少 key
{list.map((item) => <li>{item.name}</li>)}

// key 使用 index
{list.map((item, index) => <li key={index}>{item.name}</li>)}
```

- **正确写法**：

```tsx
{list.map((item) => <li key={item.id}>{item.name}</li>)}
```

### 2. dangerouslySetInnerHTML 使用

- **严重级别**：🔴 Error（XSS 风险）
- **检查方式**：扫描所有 `dangerouslySetInnerHTML`
- **处理建议**：确认内容来源是否安全，必须经过 DOMPurify 等消毒；优先使用文本渲染 `{content}`

### 3. React 19 Compiler 反模式（冗余记忆化 / 过时 API）

- **严重级别**：🟡 Warning（`react_compiler` 为 true 时）
- **检查方式**：Compiler 已接管记忆化，扫描以下反模式：

```tsx
// ❌ 手写记忆化 —— Compiler 已自动处理，多为冗余
const value = useMemo(() => compute(a, b), [a, b])
const onClick = useCallback(() => doSomething(id), [id])
export default memo(ChildComponent)

// ❌ forwardRef —— React 19 中函数组件直接接收 ref 作为 prop
const Input = forwardRef((props, ref) => <input ref={ref} />)

// ❌ defaultProps（函数组件）—— 改用参数默认值
UserCard.defaultProps = { role: 'user' }

// ❌ PropTypes —— TS 项目改用类型定义
UserCard.propTypes = { name: PropTypes.string }
```

- **正确写法**：

```tsx
// ✅ ref as prop（React 19）
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />
}

// ✅ 函数参数默认值替代 defaultProps
function UserCard({ role = 'user' }) {
  return <div>{role}</div>
}
```

- **处理建议**：如项目确未启用 Compiler（`react_compiler: false`），本项降级为 🔵 Info 并跳过记忆化冗余判断

### 4. Hooks 调用违反规则

- **严重级别**：🔴 Error
- **检查方式**：检查 Hooks 是否在条件语句、循环、嵌套函数中调用，是否在非组件/非自定义 Hook 中调用
- **问题示例**：

```tsx
function Component({ flag }) {
  if (flag) {
    const [v, setV] = useState(0) // ❌ 条件调用
  }
  for (let i = 0; i < 3; i++) {
    useEffect(() => {}) // ❌ 循环调用
  }
}
```

- **处理建议**：Hooks 必须在组件顶层无条件调用；`react-hooks/rules-of-hooks` 应设为 error

### 5. useEffect 依赖数组缺失或错误

- **严重级别**：🟡 Warning
- **检查方式**：检查 `useEffect` / `useMemo` / `useCallback` 依赖数组是否遗漏引用变量，是否用 `// eslint-disable` 屏蔽了 `exhaustive-deps`
- **处理建议**：遵循 `react-hooks/exhaustive-deps`；确需忽略时用 `useRef` 或事件模式，而非直接屏蔽规则

### 6. 组件 props 缺少类型定义（TS 项目）

- **严重级别**：🟡 Warning
- **检查方式**：检查 TS/TSX 组件的 props 是否声明了类型；JS 项目是否使用 `any` 泛滥
- **问题示例**：

```tsx
function UserCard(props: any) {
  return <div>{props.name}</div>
}
```

- **正确写法**：

```tsx
interface UserCardProps {
  name: string
  age?: number
}

function UserCard({ name, age = 0 }: UserCardProps) {
  return <div>{name}</div>
}
```

### 7. 渲染期创建内联对象/函数导致子组件失效记忆

- **严重级别**：🔵 Info
- **检查方式**：检查是否在 JSX 中直接内联创建对象/数组/函数并传给记忆化子组件（未启用 Compiler 时尤为明显）
- **问题示例**：

```tsx
<Child style={{ color: 'red' }} onClick={() => doSth(id)} />
```

- **处理建议**：启用 Compiler 时通常无需手动处理；未启用时可提取为常量或稳定引用

### 8. Server / Client 指令边界不清

- **严重级别**：🟡 Warning（`app_runtime` 为 next-app-router / remix 时）
- **检查方式**：检查使用了 Hooks、事件处理、浏览器 API 的组件是否标注 `'use client'`；Server Component 中是否误用了客户端专属能力
- **处理建议**：明确 `'use client'` / `'use server'` 边界，客户端交互下沉到叶子组件

### 9. Context 使用旧式 Provider 或可拆分未拆分

- **严重级别**：🔵 Info
- **检查方式**：
  - React 19 可直接用 `<Context>` 作为 Provider，检查是否仍用冗余的 `Context.Provider`
  - 检查单个巨型 Context 是否应拆分为多个细粒度 Context 以避免无谓重渲染
- **正确写法**：

```tsx
// ✅ React 19：Context 本身即可作为 Provider
<ThemeContext value={theme}>{children}</ThemeContext>
```
