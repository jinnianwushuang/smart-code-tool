---
title: 'React 生态架构模式 [P8]'
level: 'architect'
tags: ['React', '架构', '项目结构', '状态分层', '代码分割']
difficulty: 'expert'
updated: '2026-09-10'
target: '架构师（P8）'
---

# React 生态架构模式 [P8]

> 大型 React 应用的架构设计是架构师的核心技能。本文探讨项目分层、状态分层、错误边界、代码分割、Monorepo 组织等架构模式。

## 核心概念（What）

### React 架构设计维度

| 维度         | 问题               | 解决方案                       |
| ------------ | ------------------ | ------------------------------ |
| **项目结构** | 如何组织代码？     | Feature-based / Feature-Sliced |
| **状态分层** | 什么状态放哪里？   | Server state vs Client state   |
| **错误边界** | 局部错误不崩溃全局 | ErrorBoundary + Suspense       |
| **代码分割** | 首屏加载优化       | React.lazy + Route-based       |
| **Monorepo** | 多包管理           | Turborepo + 共享包             |

---

## 底层原理（Why）

### 1. Feature-based 项目结构

```
src/
├── features/                    # 业务功能模块
│   ├── auth/                    # 认证功能
│   │   ├── components/          # 功能专属组件
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── hooks/               # 功能专属 hooks
│   │   │   └── useAuth.ts
│   │   ├── api/                 # 功能专属 API
│   │   │   └── auth.api.ts
│   │   ├── types/               # 功能专属类型
│   │   │   └── auth.types.ts
│   │   └── index.ts             # 公共 API
│   │
│   ├── dashboard/               # 仪表盘功能
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   └── products/                # 商品功能
│       ├── components/
│       ├── hooks/
│       └── index.ts
│
├── shared/                      # 共享资源
│   ├── components/              # 通用 UI 组件
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── Input.tsx
│   ├── hooks/                   # 通用 hooks
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   ├── utils/                   # 工具函数
│   ├── api/                     # 共享 API 层
│   │   └── client.ts            # Axios/Fetch 实例
│   └── types/                   # 共享类型
│
├── app/                         # 应用入口
│   ├── App.tsx                  # 根组件
│   ├── router.tsx               # 路由配置
│   └── providers.tsx            # Provider 组合
│
└── pages/                       # 页面组件（组合 features）
    ├── HomePage.tsx
    ├── DashboardPage.tsx
    └── ProductPage.tsx
```

### 2. 状态分层策略

```typescript
// 状态分类：
// 1. Server State：服务端数据（TanStack Query 管理）
// 2. Client State：客户端 UI 状态（Zustand/Jotai 管理）
// 3. URL State：路由参数（React Router 管理）
// 4. Form State：表单状态（React Hook Form 管理）

// Server State（TanStack Query）
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
  });
}

// Client State（Zustand）
const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'light',
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));

// URL State（React Router）
function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const sort = searchParams.get('sort') || 'name';

  return (
    <div>
      <select value={sort} onChange={e => setSearchParams({ sort: e.target.value })}>
        <option value="name">按名称</option>
        <option value="price">按价格</option>
      </select>
    </div>
  );
}

// Form State（React Hook Form）
function ProductForm() {
  const { register, handleSubmit } = useForm();
  // 表单状态由 RHF 内部管理
}

// 分层原则：
// ├── 服务端数据 → TanStack Query（缓存 + 同步）
// ├── UI 状态 → Zustand/Jotai（全局）或 useState（局部）
// ├── URL 参数 → React Router（可分享、可书签）
// └── 表单数据 → React Hook Form（验证 + 提交）
```

### 3. 错误边界与 Suspense

```typescript
// Error Boundary：捕获子组件错误
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // 上报错误日志
    logError(error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// 函数式 Error Boundary（react-error-boundary）
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<GlobalError />} onError={logError}>
      <ErrorBoundary fallback={<DashboardError />}>
        <Dashboard />
      </ErrorBoundary>
      <ErrorBoundary fallback={<ProfileError />}>
        <Profile />
      </ErrorBoundary>
    </ErrorBoundary>
  );
}

// Suspense + Error Boundary 组合
function ProductPage() {
  return (
    <ErrorBoundary fallback={<ProductError />}>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 4. 代码分割策略

```typescript
// 1. Route-based 分割（最常用）
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// 2. Component-based 分割（大型组件）
const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard() {
  return (
    <div>
      <DashboardHeader />
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart data={data} />
      </Suspense>
    </div>
  );
}

// 3. 预加载（hover 时预加载）
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const preload = () => {
    if (to === '/dashboard') import('./pages/Dashboard');
    if (to === '/settings') import('./pages/Settings');
  };

  return (
    <Link to={to} onMouseEnter={preload} onFocus={preload}>
      {children}
    </Link>
  );
}
```

---

## 高频面试题

### Q1: 大型 React 项目如何组织代码结构？

**参考答案要点**：

- Feature-based（按功能分）：每个 feature 独立（components/hooks/api/types）
- shared/ 存放通用资源
- Feature 之间通过 index.ts 暴露公共 API
- 避免 feature 之间直接引用内部实现

### Q2: React 项目中如何分层管理状态？

**参考答案要点**：

- Server State → TanStack Query（缓存 + 后台更新）
- Client State → Zustand/Jotai（全局 UI 状态）
- URL State → React Router（可分享的参数）
- Form State → React Hook Form（表单内部状态）
- 原则：能不放全局就不放全局

### Q3: 如何实现 React 应用的代码分割？

**参考答案要点**：

- Route-based：React.lazy + Suspense（最常用）
- Component-based：大型组件懒加载
- 预加载：hover/focus 时预加载
- Webpack magic comment：`/* webpackChunkName: "xxx" */`
- 目标：首屏 bundle < 200KB

---

## 延伸思考

1. **设计题**：为一个大型 SaaS 平台设计 React 架构（多团队、多模块、共享组件库）。
2. **场景题**：React 应用首屏加载时间 > 3 秒，如何从架构层面优化？
3. **对比题**：Feature-based vs Feature-Sliced vs Clean Architecture，哪种更适合大型项目？

---

## 参考资料

- [React 架构模式](https://www.patterns.dev/react)
- [Feature-Sliced Design](https://feature-sliced.design)
- [State Management Best Practices](https://redux.js.org/usage/migrating-to-modern-redux)
