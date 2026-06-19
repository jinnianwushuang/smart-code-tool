---
title: 减法
order: 64
---

对于资深开发者来说，减少 React 样板代码（Boilerplate）的关键在于**“减少手动同步状态”**和**“利用工业级封装”**。

以下是能显著让 React 代码行数“瘦身”至接近 Vue 水平的 4 类神级库：

## 1. 表单处理：React Hook Form (必装)

这是减少代码量效果最明显的库。它解决了 React “受控组件”需要写大量 `onChange` 的痛点。

- **收益：** 减少约 50% 的表单逻辑代码。
- **对比：**
  - **普通 React：** 每个 Input 都要写 `value` 和 `onChange`。
  - **RHF：** 使用 `register` 或 `Controller` 统一接管，支持原生的非受控模式，性能极高。
- **核心命令：** `pnpm add react-hook-form`

## 2. 状态管理：Zustand (首选)

Vue 开发者习惯了 Pinia 的简洁，React 生态里的 Redux 太重，而 Zustand 几乎就是“React 版的 Pinia”。

- **收益：** 消除 Redux 中繁琐的 Actions、Reducers 和 Types。

- **代码风格：** 像定义普通对象一样定义状态和 Actions。

- **对比：**

  ```tsx
  // 极简定义
  const useStore = create((set) => ({
    count: 0,
    inc: () => set((state) => ({ count: state.count + 1 })),
  }))
  ```

## 3. 数据请求：TanStack Query (原 React Query)

这个库能删掉你组件里 80% 的 `useEffect` 和 `useState(loading/data/error)`。

- **收益：** 自动处理缓存、Loading 状态、错误处理、断线重连。

- **核心逻辑：** 它把异步数据变成了“声明式”的。

- **对比：**

  ```tsx
  // 这一行代码替代了原本 15 行的 useEffect 请求逻辑
  const { data, isLoading } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
  ```

## 4. 组件与布局：shadcn/ui + Tailwind CSS

后台项目最耗时的是写 CSS 和封装基础组件（弹窗、下拉、表格）。

- **收益：** 告别传统的 `xxx.module.css` 文件，所有样式直接写在 HTML 里（类似 Vue 的 Scoped 但更强大）。
- **shadcn/ui 特色：** 它不是一个 NPM 包，而是直接把组件源码“复制”到你的项目里。你可以自由修改逻辑，没有任何黑盒。

---

## 总结：资深开发者的“减法”配置清单

如果你想让 React 项目开发起来像 Vue 一样爽快，请按这个组合初始化：

1. **逻辑减法**：`React Hook Form` (表单) + `Zustand` (状态)
2. **异步减法**：`TanStack Query` (接口)
3. **UI 减法**：`Tailwind CSS` + `Lucide React` (图标)
4. **架构减法**：`Next.js` 或 `Vite`
