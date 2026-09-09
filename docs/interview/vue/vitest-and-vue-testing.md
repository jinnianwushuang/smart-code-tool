---
title: 'Vitest + Vue 测试体系 [P6-P7]'
level: 'senior'
tags: ['Vitest', 'Vue Test Utils', '测试', '快照测试', 'Playwright']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P6+ 高级工程师'
---

# Vitest + Vue 测试体系 [P6-P7]

> Vitest 是 Vite 原生的测试框架，与 Vue 3 生态深度集成。配合 Vue Test Utils 实现组件测试，Playwright 实现 E2E 测试，形成完整的测试金字塔。

## 核心概念（What）

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

### 1. Vitest 原理

```typescript
// Vitest 与 Vite 共享配置
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

### 2. Vue Test Utils 组件测试

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

### 3. Mock 策略

```typescript
// 1. vi.mock：模块级 mock
vi.mock('../api/user', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Test' }),
}))

// 2. vi.fn：函数 mock
const mockFn = vi.fn()
mockFn.mockReturnValue(42)
mockFn.mockImplementation((x) => x * 2)

// 3. vi.spyOn：部分 mock
const spy = vi.spyOn(console, 'log')
console.log('test')
expect(spy).toHaveBeenCalledWith('test')
spy.mockRestore()

// 4. MSW（Mock Service Worker）：网络请求 mock
// tests/setup.ts
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([{ id: 1, name: 'Alice' }])
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### 4. E2E 测试（Playwright）

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="submit"]')

    // 等待导航完成
    await page.waitForURL('/dashboard')
    expect(page.url()).toContain('/dashboard')

    // 检查用户信息显示
    await expect(page.locator('.user-name')).toHaveText('Test User')
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'wrong@example.com')
    await page.click('[data-testid="submit"]')

    await expect(page.locator('.error-message')).toBeVisible()
  })
})
```

---

## 高频面试题

### Q1: Vitest 相比 Jest 有什么优势？

**参考答案要点**：

- 与 Vite 共享 transform pipeline（无需 babel/esbuild 重复配置）
- 原生 ESM 支持（Jest 的 ESM 支持一直有坑）
- HMR 感知（测试文件修改自动重跑）
- 内置覆盖率（V8 provider）
- 兼容 Jest API（迁移成本低）

### Q2: Vue 组件测试的核心策略？

**参考答案要点**：

- 使用 Vue Test Utils 的 mount/shallowMount
- 测试行为而非实现（用户视角）
- 使用 data-testid 选择元素（不依赖 CSS 类名）
- Mock 外部依赖（API、store）
- 测试 emits 和 DOM 更新

### Q3: 测试金字塔在 Vue 项目中如何落地？

**参考答案要点**：

- 单元测试（大量）：composable、store、工具函数
- 集成测试（适量）：组件交互、页面流程
- E2E 测试（少量）：关键用户流程（登录、支付）
- 覆盖率目标：核心业务逻辑 > 80%，UI 组件 > 60%

---

## 延伸思考

1. **设计题**：为一个电商项目设计完整的测试策略。
2. **场景题**：组件测试中异步操作（setTimeout/fetch）如何处理？
3. **对比题**：Vitest + Vue Test Utils vs Cypress Component Testing，如何选择？

---

## 参考资料

- [Vitest 文档](https://vitest.dev)
- [Vue Test Utils 文档](https://test-utils.vuejs.org)
- [Playwright 文档](https://playwright.dev)
