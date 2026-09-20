# 组件设计（component-design）

> 检查 React 组件的设计合理性，确保可维护性和架构健康。

## 检查项

### 1. 组件职责过多（JSX 过长 / 逻辑混杂）

- **严重级别**：🟡 Warning
- **检查方式**：检查组件返回的 JSX 是否过长（如单组件 return 超 200 行），是否混杂了数据获取、业务逻辑与渲染
- **处理建议**：拆分为多个子组件，逻辑抽取为自定义 Hook
- **拆分策略**：
  - 容器组件负责数据与状态协调
  - 展示子组件封装特定 UI（如卡片、表格、弹窗）
  - 自定义 Hook（`use*.ts`）存放可复用逻辑
  - 工具函数文件存放纯逻辑处理（解析、格式化等）

### 2. Props 透传超过 3 层（Prop Drilling）

- **严重级别**：🟡 Warning
- **检查方式**：检查某个 prop 是否从祖先组件逐层传递超过 3 级才到达使用它的组件
- **问题示例**：

```
App → Layout → Page → Section → Card
                      ↑ data 从 App 传到 Card 经过 4 层
```

- **处理建议**：使用 Context、状态管理（Zustand / Redux Toolkit）或组合（children / 组件插槽）替代逐层传递

### 3. 直接修改 props 或 state

- **严重级别**：🔴 Error
- **检查方式**：检查组件内是否存在直接修改 props、或直接对 state 对象赋值/变异（未通过 setter）的操作
- **问题示例**：

```tsx
function Counter({ count }) {
  count++ // ❌ 直接修改 props
}

function List() {
  const [items, setItems] = useState([])
  items.push(newItem) // ❌ 直接变异 state
}
```

- **正确写法**：

```tsx
function List() {
  const [items, setItems] = useState([])
  setItems((prev) => [...prev, newItem]) // ✅ 不可变更新
}
```

### 4. 过度使用 ref 操作 DOM

- **严重级别**：🔵 Info
- **检查方式**：检查是否频繁使用 `ref` 手动操作 DOM（`style`、`classList`、`innerHTML`）而非声明式渲染
- **问题示例**：

```tsx
useEffect(() => {
  ref.current.style.display = 'block'
  ref.current.innerHTML = '<span>text</span>'
})
```

- **处理建议**：优先使用声明式渲染（条件渲染、`className`、状态驱动）；`ref` 仅用于焦点管理、测量、集成第三方 DOM 库

### 5. 循环依赖 / Server-Client 边界错乱

- **严重级别**：🔴 Error
- **检查方式**：
  - 检查模块间是否存在循环导入关系（A 导入 B，B 导入 A）
  - RSC 项目中，检查 Server Component 是否导入了仅客户端可用的模块，或 `'use client'` 边界处传递了不可序列化的 props（函数、类实例）
- **处理建议**：
  - 抽取公共逻辑到第三个模块
  - 使用 Context / 状态管理解耦组件关系
  - 延迟导入（动态 `import()`）
  - 跨 Server/Client 边界只传递可序列化数据，回调通过 Server Actions 实现
