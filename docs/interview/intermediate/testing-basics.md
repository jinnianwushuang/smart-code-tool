---
title: "前端测试基础：Jest/Vitest [P5-P6]"
level: "intermediate"
tags: ["测试", "Jest", "Vitest", "单元测试", "组件测试"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# 前端测试基础：Jest/Vitest [P5-P6]

> 前端测试保证代码质量。掌握单元测试、组件测试、Mock 等技术，能写出可靠的代码。

## 核心概念（What）

### 测试类型

```
测试金字塔：
├── 单元测试 → 测试单个函数/组件（最多）
├── 集成测试 → 测试模块间交互
├── E2E 测试 → 测试完整用户流程（最少）
└── 手动测试 → 人工测试

测试工具：
├── Jest → React 生态（流行）
├── Vitest → Vue 生态（推荐，Vite 原生支持）
├── Testing Library → 组件测试
├── Cypress/Playwright → E2E 测试
└── MSW → API Mock
```

## 底层原理（Why）

### Vitest 基础

```javascript
// 1. 安装
// npm install -D vitest

// 2. 配置 vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom', // 或 'node'
    globals: true
  }
});

// 3. 编写测试
// math.test.js
import { describe, it, expect } from 'vitest';
import { add, subtract } from './math';

describe('math', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3);
    expect(add(-1, 1)).toBe(0);
  });
  
  it('should subtract two numbers', () => {
    expect(subtract(5, 3)).toBe(2);
    expect(subtract(0, 5)).toBe(-5);
  });
});

// 4. 运行测试
// npx vitest
// npx vitest run（单次运行）
// npx vitest --coverage（覆盖率）
```

### 常用断言

```javascript
import { expect } from 'vitest';

// 基础断言
expect(value).toBe(expected);           // 严格相等
expect(value).toEqual(expected);        // 深度相等
expect(value).toBeTruthy();             // 真值
expect(value).toBeFalsy();              // 假值
expect(value).toBeNull();               // null
expect(value).toBeUndefined();          // undefined
expect(value).toBeDefined();            // 已定义

// 数字断言
expect(number).toBeGreaterThan(0);      // 大于
expect(number).toBeGreaterThanOrEqual(1); // 大于等于
expect(number).toBeLessThan(10);        // 小于
expect(number).toBeCloseTo(0.3, 5);     // 接近

// 字符串断言
expect(string).toContain('substring');  // 包含
expect(string).toMatch(/regex/);        // 正则匹配

// 数组断言
expect(array).toContain(item);          // 包含元素
expect(array).toHaveLength(3);          // 长度

// 对象断言
expect(object).toHaveProperty('key');   // 有属性
expect(object).toHaveProperty('key', value); // 属性值
expect(object).toMatchObject(partial);  // 部分匹配

// 异常断言
expect(() => { throw new Error() }).toThrow();
expect(() => { throw new Error('msg') }).toThrow('msg');

// 异步断言
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

### 测试函数

```javascript
// math.js
export function add(a, b) {
  return a + b;
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

// math.test.js
import { describe, it, expect } from 'vitest';
import { add, divide } from './math';

describe('add', () => {
  it('should add positive numbers', () => {
    expect(add(1, 2)).toBe(3);
    expect(add(10, 20)).toBe(30);
  });
  
  it('should add negative numbers', () => {
    expect(add(-1, -2)).toBe(-3);
    expect(add(-1, 1)).toBe(0);
  });
});

describe('divide', () => {
  it('should divide two numbers', () => {
    expect(divide(10, 2)).toBe(5);
    expect(divide(7, 2)).toBe(3.5);
  });
  
  it('should throw error when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
  });
});
```

### 测试异步代码

```javascript
// api.js
export async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

// api.test.js
import { describe, it, expect, vi } from 'vitest';
import { fetchUser } from './api';

describe('fetchUser', () => {
  it('should fetch user successfully', async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Alice' })
    });
    
    const user = await fetchUser(1);
    
    expect(user).toEqual({ id: 1, name: 'Alice' });
    expect(global.fetch).toHaveBeenCalledWith('/api/users/1');
  });
  
  it('should throw error on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false
    });
    
    await expect(fetchUser(1)).rejects.toThrow('Failed to fetch user');
  });
});
```

### Mock 函数

```javascript
import { describe, it, expect, vi } from 'vitest';

// 1. Mock 函数
const mockFn = vi.fn();
mockFn('hello');
expect(mockFn).toHaveBeenCalledWith('hello');

// 2. Mock 返回值
const mockFn = vi.fn().mockReturnValue('result');
expect(mockFn()).toBe('result');

// 3. Mock 实现
const mockFn = vi.fn((x) => x * 2);
expect(mockFn(5)).toBe(10);

// 4. Mock 模块
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Alice' })
}));

import { fetchUser } from './api';

it('should use mocked api', async () => {
  const user = await fetchUser(1);
  expect(user).toEqual({ id: 1, name: 'Alice' });
});

// 5. 清除 Mock
afterEach(() => {
  vi.clearAllMocks();
});
```

### Vue 组件测试

```vue
<!-- Counter.vue -->
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}

function decrement() {
  count.value--;
}
</script>
```

```javascript
// Counter.test.js
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Counter from './Counter.vue';

describe('Counter', () => {
  it('should render initial count', () => {
    const wrapper = mount(Counter);
    expect(wrapper.text()).toContain('Count: 0');
  });
  
  it('should increment count', async () => {
    const wrapper = mount(Counter);
    
    await wrapper.find('button').trigger('click');
    
    expect(wrapper.text()).toContain('Count: 1');
  });
  
  it('should decrement count', async () => {
    const wrapper = mount(Counter);
    
    await wrapper.findAll('button')[1].trigger('click');
    
    expect(wrapper.text()).toContain('Count: -1');
  });
  
  it('should emit event on click', async () => {
    const wrapper = mount(Counter);
    
    await wrapper.find('button').trigger('click');
    
    // 如果有 emit
    // expect(wrapper.emitted()).toHaveProperty('update');
  });
});
```

### React 组件测试

```jsx
// Button.jsx
function Button({ text, onClick, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}

export default Button;
```

```jsx
// Button.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button text="Click me" onClick={() => {}} />);
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button text="Click me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled', () => {
    render(<Button text="Click me" onClick={() => {}} disabled />);
    
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### 测试覆盖率

```bash
# 安装
npm install -D @vitest/coverage-v8

# 运行覆盖率
npx vitest --coverage

# 配置 vite.config.js
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts,vue}'],
      exclude: ['src/**/*.test.js', 'src/**/*.spec.js']
    }
  }
});

# 覆盖率指标：
# ├── Statements → 语句覆盖率
# ├── Branches → 分支覆盖率
# ├── Functions → 函数覆盖率
# └── Lines → 行覆盖率
```

## 实战应用（How）

### 测试最佳实践

```javascript
// 1. AAA 模式
it('should add item to cart', () => {
  // Arrange（准备）
  const cart = new Cart();
  const item = { id: 1, name: 'Apple' };
  
  // Act（执行）
  cart.add(item);
  
  // Assert（断言）
  expect(cart.items).toContain(item);
  expect(cart.total).toBe(1);
});

// 2. 测试边界情况
describe('divide', () => {
  it('should handle zero', () => {
    expect(() => divide(10, 0)).toThrow();
  });
  
  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });
  
  it('should handle decimals', () => {
    expect(divide(7, 2)).toBeCloseTo(3.5);
  });
});

// 3. 测试用户行为（而非实现）
it('should show error message on invalid input', async () => {
  render(<LoginForm />);
  
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'invalid-email' }
  });
  
  fireEvent.click(screen.getByText('Submit'));
  
  expect(await screen.findByText('Invalid email')).toBeInTheDocument();
});
```

## 高频面试题

### Q1: 单元测试和 E2E 测试的区别？

```
单元测试：
├── 测试单个函数/组件
├── 速度快
├── 数量最多
└── 工具：Jest/Vitest

E2E 测试：
├── 测试完整用户流程
├── 速度慢
├── 数量最少
└── 工具：Cypress/Playwright

测试金字塔：
├── 单元测试 → 70%
├── 集成测试 → 20%
└── E2E 测试 → 10%
```

### Q2: 如何 Mock API 请求？

```
方法：
├── vi.fn() → Mock 函数
├── vi.mock() → Mock 模块
├── MSW → Mock Service Worker
└── fetch mock

示例：
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: 'test' })
});
```

### Q3: 如何测试 Vue/React 组件？

```
工具：
├── Vue → @vue/test-utils
└── React → @testing-library/react

测试内容：
├── 渲染输出
├── 用户交互（点击、输入）
├── Props 传递
├── 事件触发
└── 状态变化

示例（Vue）：
const wrapper = mount(Component);
await wrapper.find('button').trigger('click');
expect(wrapper.text()).toContain('expected');
```

## 延伸思考

1. 如何设计测试用例？
2. TDD（测试驱动开发）的流程？
3. 如何提高测试覆盖率？

## 参考资料

- [Vitest 官方文档](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
