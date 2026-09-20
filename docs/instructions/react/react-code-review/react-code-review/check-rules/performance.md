# 性能（performance）

> 检查 React 19 项目中的常见性能问题。

## 检查项

### 1. 不必要的重渲染

- **严重级别**：🟡 Warning
- **检查方式**：检查是否存在以下导致无谓重渲染的模式：
  - 父组件状态更新波及大量无关子组件
  - 在渲染期创建新对象/数组/函数并传给子组件（未启用 Compiler 时）
  - 状态提升到过高的层级
- **处理建议**：状态下沉、拆分组件；启用 Compiler 后由编译器自动记忆化，无需手动 memo

### 2. Compiler 记忆化冗余或失效

- **严重级别**：🔵 Info
- **检查方式**：
  - `react_compiler: true` 时，检查是否仍手写大量 `useMemo` / `useCallback` / `memo`（冗余）
  - 检查是否存在破坏 Compiler 优化的写法（如在渲染中修改外部可变值、违反 Hooks 规则）
- **处理建议**：交由 Compiler 处理记忆化，聚焦保持组件纯函数特性

### 3. 大列表未使用虚拟滚动

- **严重级别**：🟡 Warning
- **检查方式**：检查 `map` 渲染的列表数据量是否可能超过 100 条，是否使用了虚拟滚动
- **处理建议**：大数据量列表建议使用虚拟滚动（如 `@tanstack/react-virtual`、`react-window`）

### 4. 大体积组件/路由未懒加载

- **严重级别**：🔵 Info
- **检查方式**：检查路由级组件是否使用 `React.lazy` + `Suspense` 或框架级动态导入
- **问题示例**：

```tsx
import HeavyPage from './HeavyPage' // 全量打入首屏 bundle
```

- **正确写法**：

```tsx
import { lazy, Suspense } from 'react'
const HeavyPage = lazy(() => import('./HeavyPage'))

<Suspense fallback={<Loading />}>
  <HeavyPage />
</Suspense>
```

### 5. 未利用 Suspense / use() 优化数据加载

- **严重级别**：🔵 Info
- **检查方式**：检查数据请求是否可用 React 19 的 `use()` + `Suspense` 替代手动 `loading` 状态样板
- **处理建议**：配合框架数据层，使用 Suspense 声明式加载，减少 loading 分支散落

### 6. 图片/资源未优化加载

- **严重级别**：🔵 Info
- **检查方式**：检查 `<img>` 是否使用了 `loading="lazy"`、`srcset`、合适的尺寸；Next.js 项目是否使用 `<Image>`
- **处理建议**：非首屏图片添加 `loading="lazy"`，大图提供多分辨率
