---
title: React Ref 完全指南
tags: ['React', 'Ref']
---

# React Ref 完全指南

Ref 是 React 中绕过声明式渲染、直接访问 DOM 节点或持有可变值的机制。它不触发重渲染，却在命令式操作、动画、第三方库集成、性能优化等场景中不可替代。本文系统梳理 Ref 的全部用法与最佳实践。

---

## 一、useRef — 两种用途

### 1.1 访问 DOM 节点

```tsx
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFocus = () => {
    // 直接操作 DOM，不触发渲染
    inputRef.current?.focus()
  }

  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={handleFocus}>聚焦输入框</button>
    </>
  )
}
```

**关键时序**：

- `ref.current` 在 **Commit 阶段**（DOM 挂载后）被赋值
- `useEffect` 中可以安全访问 `ref.current`
- Render 阶段 / `useLayoutEffect` 中 `ref.current` 可能为 `null`

```tsx
function Example() {
  const ref = useRef<HTMLDivElement>(null)

  // ❌ Render 阶段：DOM 还没挂载
  console.log(ref.current) // null（首次渲染）

  // ✅ Commit 后：DOM 已挂载
  useLayoutEffect(() => {
    console.log(ref.current) // <div> 元素
  }, [])

  useEffect(() => {
    console.log(ref.current) // <div> 元素
  }, [])
}
```

### 1.2 持有可变值（不触发渲染）

```tsx
function Timer() {
  const intervalRef = useRef<number | null>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setCount((c) => c + 1)
    }, 1000)

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const stop = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  return (
    <div>
      Count: {count} <button onClick={stop}>Stop</button>
    </div>
  )
}
```

**Ref vs State 对比**：

| 特性           | `useRef`                                  | `useState`             |
| -------------- | ----------------------------------------- | ---------------------- |
| 修改后触发渲染 | ❌ 不触发                                 | ✅ 触发                |
| 值在渲染间保持 | ✅ 保持                                   | ✅ 保持                |
| 适合场景       | 定时器 ID、DOM 引用、上一次的 props/state | 需要反映在 UI 上的数据 |
| 读写方式       | `ref.current = value`                     | `setState(newValue)`   |

---

## 二、forwardRef — Ref 转发

### 2.1 为什么需要 Ref 转发

默认情况下，`ref` 无法作为普通 prop 传递给函数组件。`forwardRef` 解决了这个问题：

```tsx
// ❌ 直接传 ref 给函数组件 — 不生效
function Input({ label }: { label: string }) {
  return <input aria-label={label} />
}
// <Input ref={inputRef} label="Name" /> — ref 被吞掉

// ✅ forwardRef 转发 ref
const Input = forwardRef<HTMLInputElement, { label: string }>(function Input({ label }, ref) {
  return <input ref={ref} aria-label={label} />
})

// 父组件
function Form() {
  const inputRef = useRef<HTMLInputElement>(null)
  return <Input ref={inputRef} label="Name" />
}
```

### 2.2 Ref 转发链 — 多层嵌套

```tsx
// 底层：实际 DOM 节点
const FancyInput = forwardRef<HTMLInputElement, Props>(function FancyInput(props, ref) {
  return <input ref={ref} className="fancy" {...props} />
})

// 中间层：继续向上转发
const FormField = forwardRef<HTMLInputElement, { label: string }>(function FormField(
  { label, ...rest },
  ref,
) {
  return (
    <div className="field">
      <label>{label}</label>
      <FancyInput ref={ref} {...rest} />
    </div>
  )
})

// 顶层：获取 DOM 引用
function Form() {
  const inputRef = useRef<HTMLInputElement>(null)
  return <FormField ref={inputRef} label="Email" />
}
```

### 2.3 React 19 变更：ref 作为普通 prop

React 19 中 `ref` 可以作为普通 prop 传递，不再需要 `forwardRef`：

```tsx
// React 19：ref 直接作为 prop
function Input({ label, ref }: { label: string; ref: Ref<HTMLInputElement> }) {
  return <input ref={ref} aria-label={label} />
}

// 父组件
function Form() {
  const inputRef = useRef<HTMLInputElement>(null)
  return <Input ref={inputRef} label="Name" />
}
```

> 注意：`forwardRef` 在 React 19 中**不废弃**，仍然兼容旧代码。新代码可以逐步迁移到 prop 形式。

---

## 三、useImperativeHandle — 暴露命令式 API

### 3.1 基本用法

`useImperativeHandle` 配合 `forwardRef`，可以自定义暴露给父组件的 API：

```tsx
const TextInput = forwardRef(function TextInput(props: {}, ref: React.Ref<TextInputHandle>) {
  const inputRef = useRef<HTMLInputElement>(null)

  // 自定义暴露的方法
  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => {
        if (inputRef.current) inputRef.current.value = ''
      },
      getValue: () => inputRef.current?.value ?? '',
    }),
    [],
  )

  return <input ref={inputRef} {...props} />
})

// 父组件调用
function Form() {
  const inputRef = useRef<TextInputHandle>(null)

  return (
    <>
      <TextInput ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>聚焦</button>
      <button onClick={() => inputRef.current?.clear()}>清空</button>
    </>
  )
}

interface TextInputHandle {
  focus: () => void
  blur: () => void
  clear: () => void
  getValue: () => string
}
```

### 3.2 设计原则

| 原则       | 说明                                       |
| ---------- | ------------------------------------------ |
| 最小暴露   | 只暴露必要的方法，不要暴露整个 DOM 节点    |
| 声明式优先 | 能用 props 控制的不要用 imperative handle  |
| 类型安全   | 始终定义 Handle 接口                       |
| 依赖声明   | `useImperativeHandle` 的依赖数组要正确填写 |

---

## 四、Callback Ref — 回调式引用

### 4.1 基本模式

除了 `useRef` 对象形式，React 还支持**函数形式**的 ref：

```tsx
function MeasuredList() {
  const [height, setHeight] = useState(0)

  // 回调 ref：DOM 挂载/卸载时自动调用
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const { height } = node.getBoundingClientRect()
      setHeight(height)
    }
  }, [])

  return (
    <>
      <div ref={measureRef}>
        <ul>...</ul>
      </div>
      <div>列表高度：{height}px</div>
    </>
  )
}
```

### 4.2 Callback Ref vs Object Ref

| 特性     | `useRef` 对象          | Callback ref                           |
| -------- | ---------------------- | -------------------------------------- |
| 赋值时机 | Commit 阶段自动赋值    | DOM 挂载/卸载时调用                    |
| 卸载时   | `current` 不会自动清空 | 以 `null` 参数再次调用                 |
| 适合场景 | 简单 DOM 访问          | 需要在挂载/卸载时执行副作用            |
| 性能     | 无额外成本             | 每次渲染创建新函数（需 `useCallback`） |

---

## 五、Ref 常见陷阱

### 5.1 陷阱一：渲染期间读取 ref.current

```tsx
function Counter() {
  const renderCount = useRef(0)

  // ❌ 不要在 render 中修改 ref（违反纯函数原则）
  renderCount.current++

  return <div>Render #{renderCount.current}</div>
}

// ✅ 在 useEffect 中追踪渲染次数
function Counter() {
  const renderCount = useRef(0)

  useEffect(() => {
    renderCount.current++
    console.log(`Render #${renderCount.current}`)
  })

  return <div>Counter</div>
}
```

### 5.2 陷阱二：闭包中引用旧 ref

```tsx
function DelayedButton() {
  const [value, setValue] = useState('')
  const valueRef = useRef(value)
  valueRef.current = value // 保持同步

  const handleClick = () => {
    // ✅ ref.current 始终是最新值
    setTimeout(() => {
      alert(`Latest: ${valueRef.current}`)
    }, 3000)
  }

  return (
    <>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={handleClick}>延迟 3 秒弹窗</button>
    </>
  )
}
```

### 5.3 陷阱三：ref.current 是 null

```tsx
function MyComponent() {
  const ref = useRef<HTMLDivElement>(null)

  // ❌ 条件渲染时 ref 可能为 null
  const [show, setShow] = useState(false)

  useEffect(() => {
    // show 为 false 时，ref.current 是 null
    ref.current?.scrollIntoView()
  }, [show])

  return (
    <>
      <button onClick={() => setShow(!show)}>Toggle</button>
      {show && <div ref={ref}>Content</div>}
    </>
  )
}
```

---

## 六、Ref 模式速查表

| 场景               | 方案                  | 示例                       |
| ------------------ | --------------------- | -------------------------- |
| 访问 DOM 节点      | `useRef` + `ref` 属性 | `<input ref={inputRef} />` |
| 持有不触发渲染的值 | `useRef`              | 定时器 ID、上一次的 state  |
| 转发 ref 给子组件  | `forwardRef`          | 封装基础组件               |
| 暴露命令式 API     | `useImperativeHandle` | focus/clear/scroll 方法    |
| 挂载时执行副作用   | Callback ref          | 测量尺寸、注册 Observer    |
| 访问上一个 state   | `useRef` 同步赋值     | `prevRef.current = value`  |
| React 19 新写法    | ref 作为 prop         | 不再需要 `forwardRef`      |

---

## 七、Ref 与 Vue 的对比

| 维度                   | React `useRef`                | Vue `ref`                       |
| ---------------------- | ----------------------------- | ------------------------------- |
| 响应式                 | ❌ 非响应式，修改不触发渲染   | ✅ 响应式，修改触发更新         |
| DOM 访问               | `ref.current`                 | `templateRef.value`             |
| 模板中访问             | 不支持（必须通过 `.current`） | 模板中自动解包（`{{ count }}`） |
| 在 `<script setup>` 中 | N/A                           | `const count = ref(0)`          |
| 设计哲学               | 逃生舱口，尽量不用            | 核心响应式原语                  |

React 的 `useRef` 是「逃生舱口」——绕过声明式系统的后门。Vue 的 `ref` 是「响应式核心」——整个数据驱动模型的基础。两者同名但定位完全不同。
