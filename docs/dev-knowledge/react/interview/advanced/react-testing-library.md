---
title: 'Testing Library + MSW 测试体系 [P6-P7]'
level: 'senior'
tags: ['Testing Library', 'MSW', 'React', '测试', '用户视角']
difficulty: 'hard'
target: 'P6+ 高级工程师'
---

# Testing Library + MSW 测试体系 [P6-P7]

> React Testing Library（RTL）是 2026 年 React 组件测试的事实标准。它遵循"用户视角测试"哲学，配合 MSW（Mock Service Worker）实现网络请求 mock，形成完整的测试方案。

## 核心概念（What）

### 测试哲学：像用户一样测试

```
Testing Library 核心原则：
├── 测试用户看到的内容（而非实现细节）
├── 查询优先级：
│   1. getByRole（最推荐，模拟用户感知）
│   2. getByLabelText（表单场景）
│   3. getByPlaceholderText
│   4. getByText
│   5. getByTestId（最后手段）
├── 避免：
│   ├── 查询组件实例（wrapper.instance()）
│   ├── 查询 CSS 类名
│   └── 查询 DOM 结构（parent/child）
└── 目标：测试代码不因实现重构而失败
```

---

## 底层原理（Why）

### 1. RTL 的渲染管线

RTL 不是“模拟”渲染，而是在**真实的 DOM 环境**（jsdom/happy-dom）中执行完整的 React 渲染。

```
RTL 渲染链路：

render(<Counter />)
  │
  ├── 创建容器：<div> 挂载到 document.body
  ├── 调用 ReactDOM.createRoot(container).render(ui)
  │   └── 触发完整的 React 渲染管线（Reconciler → Renderer）
  │
  ├── 包裹 act() 确保所有副作用刷新完成
  │   └── act() 内部：
  │       ├── 微任务队列清空（Promise.then）
  │       ├── useEffect/useLayoutEffect 执行
  │       └── 状态更新批量处理
  │
  └── 返回 { container, baseElement, rerender, unmount }

为什么用真实 DOM 而不是快照：
  ├── Enzyme（旧方案）：解析 React 内部 Fiber 树，直接检查组件实例
  │   └── 问题：测试了实现细节，React 内部变化会导致测试崩溃
  └── RTL（新方案）：只检查用户看到的 DOM
      └── 优势：测试行为而非实现，React 内部变化不影响测试
```

### 2. Query 优先级系统

RTL 的查询 API 不是随机的，而是按**可访问性（Accessibility）**排序的。

```
Query 优先级（从高到低）：

1. getByRole         ← 最推荐（检查 ARIA 角色）
   └── 查询逻辑：遍历 DOM，检查每个元素的 role 属性
       隐式 role 由元素类型决定（button → role="button"）

2. getByLabelText    ← 表单元素推荐
   └── 查询逻辑：查找 <label for="id"> → 找到对应 id 的输入框

3. getByPlaceholderText ← 可用但不推荐
   └── placeholder 会随状态变化消失

4. getByText         ← 通用文本查询
   └── 查询逻辑：遍历所有文本节点，正则匹配

5. getByDisplayValue ← 输入框当前值

6. getByAltText      ← 图片 alt 属性

7. getByTitle        ← title 属性

8. getByTestId       ← 最后手段（data-testid）
   └── 查询逻辑：查找 data-testid 属性

优先级设计原则：
  越接近用户视角的查询方式，优先级越高
  用户看到的是角色和文本，不是 class 名或 testid
```

### 3. 异步等待机制：MutationObserver + 轮询

`findBy*` 和 `waitFor` 的底层不是简单的 `setTimeout`，而是基于 **MutationObserver** 的响应式等待。

```
异步查询执行链路：

findByText('Success')
  │
  ├── 立即执行一次查询（getByText）
  │   ├── 找到 → 返回元素
  │   └── 未找到 → 进入等待循环
  │
  ├── 创建 MutationObserver
  │   └── 监听 document.body 的 DOM 变化
  │       （子节点增删、文本变化、属性修改）
  │
  ├── 每次 DOM 变化触发回调
  │   └── 重新执行查询（getByText）
  │       ├── 找到 → resolve Promise，返回元素
  │       └── 未找到 → 继续等待
  │
  └── 超时保护（默认 1000ms）
      └── 超时 → reject Promise，抛出 TestingLibraryElementError

waitFor 的实现：
  async function waitFor(callback, options) {
    const startTime = Date.now();
    while (true) {
      try {
        // 每次循环都执行回调
        const result = callback();
        return result; // 成功则返回
      } catch (error) {
        if (Date.now() - startTime > options.timeout) throw error;
        // 等待 DOM 变化或固定间隔（50ms）
        await waitForMutationOrInterval();
      }
    }
  }

act() 的作用：
  ├── 包裹状态更新，确保 React 批量处理
  ├── 刷新所有 useEffect/useLayoutEffect
  └── 确保所有微任务队列清空

  不包裹 act() 的后果：
    状态更新在“React 工作”之外发生
    → 警告：“An update to Component inside a test was not wrapped in act(...)”
    → 副作用可能未执行，断言失败
```

---

## 高频面试题

### Q1: Testing Library 的查询优先级是什么？

**参考答案要点**：

1. `getByRole`（最推荐）：模拟用户感知（按钮、标题、链接）
2. `getByLabelText`：表单场景
3. `getByPlaceholderText`：输入框
4. `getByText`：文本内容
5. `getByTestId`：最后手段（data-testid）

- 原则：优先使用用户能感知到的查询方式

### Q2: MSW 相比 jest.mock 有什么优势？

**参考答案要点**：

- MSW 拦截真实网络请求（不 mock 模块）
- 测试代码更接近真实场景
- 同一套 handler 可用于单元测试和 E2E 测试
- 支持动态覆盖（server.use()）
- 不会因模块路径变化而失败

### Q3: 如何测试异步组件？

**参考答案要点**：

- `findBy*`：自动等待元素出现
- `waitFor`：等待条件满足
- MSW mock 网络请求
- 避免使用 `setTimeout` 等待
- 使用 `act()` 包裹状态更新

---

## 延伸思考

1. **设计题**：为一个电商应用设计完整的测试方案（组件测试 + 集成测试 + E2E）。
2. **场景题**：组件使用了大量第三方库（图表、地图），如何测试？
3. **对比题**：Testing Library + MSW vs Cypress Component Testing，如何选择？

---

## 参考资料

- [Testing Library 文档](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW 文档](https://mswjs.io)
- [Testing Library 查询优先级](https://testing-library.com/docs/queries/about#priority)
