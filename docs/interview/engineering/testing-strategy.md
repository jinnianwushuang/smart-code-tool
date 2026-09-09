---
title: "测试金字塔实战 [P6-P7]"
level: "senior"
tags: ["测试", "E2E", "视觉回归", "性能测试"]
difficulty: "medium"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# 测试金字塔实战 [P6-P7]

> 测试是工程化的基石。2026 年，前端测试从"单元测试为主"转向"测试金字塔均衡分布"，Playwright 成为 E2E 测试的事实标准，视觉回归测试成为设计系统的质量门禁。

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

| 层级 | 工具 | 用途 |
|------|------|------|
| 单元测试 | Vitest | 快速、原生 ESM、兼容 Jest API |
| 组件测试 | Testing Library | 以用户视角测试组件 |
| E2E 测试 | Playwright | 跨浏览器、自动等待、Codegen |
| 视觉回归 | Chromatic / Percy | 截图对比，检测 UI 变化 |
| 性能测试 | Lighthouse CI | 自动化性能检测 |

---

## 底层原理（Why）

### 1. Vitest 单元测试

```typescript
// 测试纯函数
import { describe, it, expect } from 'vitest';
import { formatCurrency, calculateDiscount } from './utils';

describe('formatCurrency', () => {
  it('formats positive numbers', () => {
    expect(formatCurrency(1234.5)).toBe('¥1,234.50');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('¥0.00');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-100)).toBe('-¥100.00');
  });
});
```

### 2. Testing Library 组件测试

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from './Counter';

describe('Counter', () => {
  it('increments count on button click', async () => {
    render(<Counter initialCount={0} />);

    // 以用户视角查找元素
    const button = screen.getByRole('button', { name: /increment/i });
    expect(screen.getByText('Count: 0')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  it('calls onChange callback', () => {
    const onChange = vi.fn();
    render(<Counter initialCount={0} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
```

### 3. Playwright E2E 测试

```typescript
import { test, expect } from '@playwright/test';

test('user can login and view dashboard', async ({ page }) => {
  // 导航到登录页
  await page.goto('/login');

  // 填写表单
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();

  // 等待导航到仪表盘
  await expect(page).toHaveURL('/dashboard');

  // 验证仪表盘内容
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  await expect(page.getByTestId('stats-card')).toHaveCount(3);
});

// 视觉回归测试
test('homepage looks correct', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixelRatio: 0.01,
  });
});
```

### 4. Mock 策略

```typescript
// 1. 函数 Mock
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Alice' }),
}));

// 2. 定时器 Mock
vi.useFakeTimers();
setTimeout(callback, 1000);
vi.advanceTimersByTime(1000);
expect(callback).toHaveBeenCalled();

// 3. 网络请求 Mock（MSW）
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/user', () => {
    return HttpResponse.json({ id: 1, name: 'Alice' });
  })
);
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

---

## 延伸思考

1. **设计题**：为一个电商应用设计完整的测试策略。
2. **场景题**：如何在不增加太多 CI 时间的情况下提高测试覆盖率？
3. **对比题**：Vitest vs Jest vs Bun test，各自的 trade-off？

---

## 参考资料

- [Vitest 文档](https://vitest.dev)
- [Playwright 文档](https://playwright.dev)
- [Testing Library 文档](https://testing-library.com)
- [MSW 文档](https://mswjs.io)
