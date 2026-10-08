---
title: '前端测试金字塔实战 [P6-P7]'
level: 'senior'
tags: ['测试', 'E2E', '视觉回归', 'Vitest', 'Vue Test Utils', 'Playwright']
difficulty: 'medium'
target: 'P6+ 高级工程师'
---

# 前端测试金字塔实战 [P6-P7]

> 测试是工程化的基石。2026 年，前端测试从"单元测试为主"转向"测试金字塔均衡分布"，Playwright 成为 E2E 测试的事实标准，视觉回归测试成为设计系统的质量门禁。本文覆盖通用测试策略与 Vue 生态测试体系。

## 核心概念（What）

### 测试金字塔

```
          ╱╲
         ╱ E2E ╲          少量：关键用户流程
        ╱────────╲
       ╱ 集成测试  ╲       适量：组件交互、API 集成
      ╱────────────╲
     ╱   单元测试    ╲     大量：纯函数、工具、Hooks
    ╱────────────────╲
```

### 2026 测试工具生态

| 层级              | 工具              | 用途                          |
| ----------------- | ----------------- | ----------------------------- |
| 单元测试          | Vitest            | 快速、原生 ESM、兼容 Jest API |
| 组件测试（React） | Testing Library   | 以用户视角测试组件            |
| 组件测试（Vue）   | Vue Test Utils    | mount/shallowMount、行为测试  |
| E2E 测试          | Playwright        | 跨浏览器、自动等待、Codegen   |
| 视觉回归          | Chromatic / Percy | 截图对比，检测 UI 变化        |
| 性能测试          | Lighthouse CI     | 自动化性能检测                |

### Vue 测试金字塔

```
            ┌─────────┐
            │  E2E    │  Playwright / Cypress
            │  (少量) │  关键用户流程
           ┌┴─────────┴┐
           │ 集成测试   │  Vue Test Utils + Vitest
           │  (适量)   │  组件交互、状态管理
          ┌┴───────────┴┐
          │  单元测试    │  Vitest
          │  (大量)     │  函数、composable、store
          └─────────────┘
```

---

## 底层原理（Why）

### 1. Vitest 单元测试

```typescript
// 测试纯函数
import { describe, it, expect } from 'vitest'
import { formatCurrency, calculateDiscount } from './utils'

describe('formatCurrency', () => {
  it('formats positive numbers', () => {
    expect(formatCurrency(1234.5)).toBe('¥1,234.50')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('¥0.00')
  })

  it('handles negative numbers', () => {
    expect(formatCurrency(-100)).toBe('-¥100.00')
  })
})

// 常用断言速查
expect(value).toBe(expected) // 严格相等
expect(value).toEqual(expected) // 深度相等
expect(value).toBeTruthy() / toBeFalsy() // 真值/假值
expect(value).toBeNull() / toBeUndefined() / toBeDefined()
expect(number).toBeGreaterThan(0) // 大于
expect(number).toBeCloseTo(0.3, 5) // 接近
expect(string).toContain('substring') // 包含
expect(string).toMatch(/regex/) // 正则匹配
expect(array).toContain(item) // 包含元素
expect(object).toHaveProperty('key') // 有属性
expect(() => {
  throw new Error()
}).toThrow() // 异常
await expect(promise).resolves.toBe(value) // 异步
await expect(promise).rejects.toThrow() // 异步拒绝

// 测试异步代码
import { describe, it, expect, vi } from 'vitest'

describe('fetchUser', () => {
  it('should fetch user successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Alice' }),
    })
    const user = await fetchUser(1)
    expect(user).toEqual({ id: 1, name: 'Alice' })
    expect(global.fetch).toHaveBeenCalledWith('/api/users/1')
  })

  it('should throw error on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false })
    await expect(fetchUser(1)).rejects.toThrow('Failed to fetch user')
  })
})
```

### 2. Testing Library 组件测试（React）

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Counter } from './Counter'

describe('Counter', () => {
  it('increments count on button click', async () => {
    render(<Counter initialCount={0} />)

    // 以用户视角查找元素
    const button = screen.getByRole('button', { name: /increment/i })
    expect(screen.getByText('Count: 0')).toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })

  it('calls onChange callback', () => {
    const onChange = vi.fn()
    render(<Counter initialCount={0} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onChange).toHaveBeenCalledWith(1)
  })
})
```

### 3. Vue Test Utils 组件测试（Vue）

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Counter from '../components/Counter.vue'

describe('Counter', () => {
  it('renders initial count', () => {
    const wrapper = mount(Counter, {
      props: { initialCount: 5 },
    })
    expect(wrapper.text()).toContain('5')
  })

  it('increments on button click', async () => {
    const wrapper = mount(Counter)
    await wrapper.find('button.increment').trigger('click')
    expect(wrapper.find('.count').text()).toBe('1')
  })

  it('emits update event', async () => {
    const wrapper = mount(Counter)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update')).toHaveLength(1)
    expect(wrapper.emitted('update')[0]).toEqual([1])
  })
})

// 测试 composable
import { useCounter } from '../composables/useCounter'

describe('useCounter', () => {
  it('increments correctly', () => {
    const { count, increment } = useCounter()
    expect(count.value).toBe(0)
    increment()
    expect(count.value).toBe(1)
  })
})

// 测试 Pinia store
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../stores/user'

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('login sets user', async () => {
    const store = useUserStore()
    await store.login('test@example.com', 'password')
    expect(store.user).toBeDefined()
    expect(store.isAuthenticated).toBe(true)
  })
})
```

### 4. Playwright E2E 测试

```typescript
import { test, expect } from '@playwright/test'

test('user can login and view dashboard', async ({ page }) => {
  // 导航到登录页
  await page.goto('/login')

  // 填写表单
  await page.getByLabel('Email').fill('user@example.com')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Login' }).click()

  // 等待导航到仪表盘
  await expect(page).toHaveURL('/dashboard')

  // 验证仪表盘内容
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible()
  await expect(page.getByTestId('stats-card')).toHaveCount(3)
})

// 视觉回归测试
test('homepage looks correct', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixelRatio: 0.01,
  })
})
```

### 5. Mock 策略

```typescript
// 1. 函数 Mock
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Alice' }),
}))

// 2. 定时器 Mock
vi.useFakeTimers()
setTimeout(callback, 1000)
vi.advanceTimersByTime(1000)
expect(callback).toHaveBeenCalled()

// 3. vi.spyOn：部分 mock
const spy = vi.spyOn(console, 'log')
console.log('test')
expect(spy).toHaveBeenCalledWith('test')
spy.mockRestore()

// 4. 网络请求 Mock（MSW）
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/user', () => {
    return HttpResponse.json({ id: 1, name: 'Alice' })
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### 6. Vitest 配置（Vite 项目）

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom', // 或 'happy-dom'（更快）
    globals: true, // 全局 describe/it/expect
    coverage: {
      provider: 'v8', // 或 'istanbul'
      reporter: ['text', 'html', 'lcov'],
    },
    setupFiles: ['./tests/setup.ts'],
  },
})

// Vitest 核心优势：
// ├── 与 Vite 共享 transform pipeline（无需重复配置）
// ├── 原生 ESM 支持
// ├── HMR 感知（测试文件修改自动重跑）
// ├── 兼容 Jest API（迁移成本低）
// └── 内置覆盖率（V8 / Istanbul）
```

### 7. 测试最佳实践

```typescript
// AAA 模式（Arrange-Act-Assert）
it('should add item to cart', () => {
  // Arrange（准备）
  const cart = new Cart()
  const item = { id: 1, name: 'Apple' }

  // Act（执行）
  cart.add(item)

  // Assert（断言）
  expect(cart.items).toContain(item)
  expect(cart.total).toBe(1)
})

// 测试边界情况
describe('divide', () => {
  it('should handle zero', () => {
    expect(() => divide(10, 0)).toThrow()
  })
  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5)
  })
  it('should handle decimals', () => {
    expect(divide(7, 2)).toBeCloseTo(3.5)
  })
})

// 测试用户行为（而非实现）
// 使用 data-testid 选择元素（不依赖 CSS 类名）
// 测试 emits 和 DOM 更新，而非内部状态

// 覆盖率目标建议：
// ├── 核心业务逻辑 > 80%
// ├── UI 组件 > 60%
// └── 工具函数 > 90%
```

---

## 高频面试题

### Q1: 前端测试金字塔应该如何分布？

**参考答案要点**：

- 单元测试：大量，覆盖纯函数、工具、Hooks
- 集成测试：适量，覆盖组件交互、API 集成
- E2E 测试：少量，覆盖关键用户流程
- 比例建议：70% 单元 / 20% 集成 / 10% E2E

### Q2: Playwright 相比 Cypress 有什么优势？

**参考答案要点**：

- 原生支持多浏览器（Chromium、Firefox、WebKit）
- 原生支持多标签页、多窗口
- 自动等待机制更可靠
- 并行执行更快
- Codegen 工具录制测试

### Q3: 如何处理测试中的异步操作？

**参考答案要点**：

- Playwright 自动等待元素可见/可操作
- Testing Library 提供 findBy* 异步查询
- MSW 拦截网络请求
- vi.useFakeTimers() 控制定时器

### Q4: Vitest 相比 Jest 有什么优势？

**参考答案要点**：

- 与 Vite 共享 transform pipeline（无需 babel/esbuild 重复配置）
- 原生 ESM 支持（Jest 的 ESM 支持一直有坑）
- HMR 感知（测试文件修改自动重跑）
- 内置覆盖率（V8 provider）
- 兼容 Jest API（迁移成本低）

### Q5: Vue 组件测试的核心策略？

**参考答案要点**：

- 使用 Vue Test Utils 的 mount/shallowMount
- 测试行为而非实现（用户视角）
- 使用 data-testid 选择元素（不依赖 CSS 类名）
- Mock 外部依赖（API、store）
- 测试 emits 和 DOM 更新

### Q6: 测试金字塔在 Vue 项目中如何落地？

**参考答案要点**：

- 单元测试（大量）：composable、store、工具函数
- 集成测试（适量）：组件交互、页面流程
- E2E 测试（少量）：关键用户流程（登录、支付）
- 覆盖率目标：核心业务逻辑 > 80%，UI 组件 > 60%

---

## 延伸思考

1. **设计题**：为一个电商应用设计完整的测试策略。
2. **场景题**：如何在不增加太多 CI 时间的情况下提高测试覆盖率？
3. **对比题**：Vitest vs Jest vs Bun test，各自的 trade-off？
4. **场景题**：组件测试中异步操作（setTimeout/fetch）如何处理？
5. **对比题**：Vitest + Vue Test Utils vs Cypress Component Testing，如何选择？

---

## 参考资料

- [Vitest 文档](https://vitest.dev)
- [Playwright 文档](https://playwright.dev)
- [Testing Library 文档](https://testing-library.com)
- [Vue Test Utils 文档](https://test-utils.vuejs.org)
- [MSW 文档](https://mswjs.io)
