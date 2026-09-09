---
title: 'Testing Library + MSW 测试体系 [P6-P7]'
level: 'senior'
tags: ['Testing Library', 'MSW', 'React', '测试', '用户视角']
difficulty: 'hard'
updated: '2026-09-10'
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

### 1. 核心 API

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// render：渲染组件
render(<Counter />);

// screen：查询 DOM
screen.getByText('Count: 0');          // 精确匹配文本
screen.getByRole('button', { name: 'Increment' }); // 角色 + 名称
screen.queryByText('Error');           // 不存在返回 null（不抛错）
screen.findByText('Loading...');       // 异步等待（返回 Promise）

// userEvent：模拟用户交互（推荐）
const user = userEvent.setup();
await user.click(screen.getByRole('button'));
await user.type(screen.getByLabelText('Email'), 'test@example.com');
await user.keyboard('{Enter}');

// fireEvent：低级事件触发（不推荐，但某些场景需要）
fireEvent.click(screen.getByRole('button'));
```

### 2. 异步测试

```typescript
// 异步组件测试
import { render, screen, waitFor } from '@testing-library/react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => { setUser(data); setLoading(false); });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return <div data-testid="profile">{user.name}</div>;
}

test('shows user profile after loading', async () => {
  render(<UserProfile userId="1" />);

  // 初始显示 loading
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // 等待异步完成
  const profile = await screen.findByTestId('profile');
  expect(profile).toHaveTextContent('Alice');
});

// waitFor：等待条件满足
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
}, { timeout: 3000 });

// findBy*：自动等待（等同于 waitFor + getBy*）
const button = await screen.findByRole('button', { name: 'Submit' });
```

### 3. MSW 网络 Mock

```typescript
// MSW（Mock Service Worker）：拦截网络请求
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // GET 请求 mock
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]);
  }),

  // 动态路由 mock
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({ id, name: 'Alice' });
  }),

  // POST 请求 mock
  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 3, ...body }, { status: 201 });
  }),

  // 错误响应 mock
  http.get('/api/error', () => {
    return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
  }),
];

// tests/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers()); // 每个测试后重置
afterAll(() => server.close());

// 测试中覆盖特定请求
test('handles server error', async () => {
  server.use(
    http.get('/api/users', () => {
      return HttpResponse.json({ message: 'Error' }, { status: 500 });
    })
  );

  render(<UserList />);
  expect(await screen.findByText('Error loading users')).toBeInTheDocument();
});
```

### 4. 自定义 render

```typescript
// 封装 render（自动提供 Provider）
// tests/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

function AllProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }, // 测试中禁用重试
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// 重新导出所有 RTL API
export * from '@testing-library/react';
export { customRender as render };

// 使用
import { render, screen } from '../tests/test-utils';

test('renders with providers', () => {
  render(<UserPage />); // 自动包裹 Provider
  expect(screen.getByText('Users')).toBeInTheDocument();
});
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
