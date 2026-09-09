---
title: 'Vue Router 4 路由系统深度 [P6-P7]'
level: 'senior'
tags: ['Vue Router', '路由', '导航守卫', '动态路由', 'History 模式']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P6+ 高级工程师'
---

# Vue Router 4 路由系统深度 [P6-P7]

> Vue Router 4 是 Vue 3 的官方路由，基于 Radix Tree 实现高效路由匹配，支持导航守卫、动态路由、嵌套路由等高级特性。理解其内部机制是排查路由问题和性能优化的关键。

## 核心概念（What）

### Vue Router 4 核心架构

```
URL 变化
    │
    ▼
┌──────────────────────────────────┐
│  History 实现（HTML5 / Hash）     │
│  监听 popstate / hashchange      │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  Router 匹配引擎                 │
│  Radix Tree 路由匹配             │
│  生成 RouteRecord + params       │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  导航守卫链                       │
│  beforeEach → beforeRouteEnter   │
│  → beforeRouteUpdate → resolve   │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  <RouterView> 渲染               │
│  组件匹配 + KeepAlive 缓存       │
└──────────────────────────────────┘
```

---

## 底层原理（Why）

### 1. Radix Tree 路由匹配

```
Radix Tree（基数树）路由匹配：

路由定义：
/              → Home
/users         → UserList
/users/:id     → UserDetail
/users/:id/posts → UserPosts
/settings/*    → NotFound

构建的 Radix Tree：
           /
          / \
    (root)  users
            / | \
      (list) :id settings
              |      \
           posts    (catch-all)

匹配过程：
1. /users → O(1) 静态匹配
2. /users/123 → 动态参数匹配 :id = 123
3. /users/123/posts → 嵌套匹配
4. /settings/anything → 通配符匹配

优势：
├── 静态路由 O(1) 匹配（精确查找）
├── 动态路由高效匹配（无需遍历所有路由）
├── 优先级：静态 > 动态 > 通配符
└── 比线性遍历快 10-100x（路由多时差异显著）
```

### 2. 导航守卫执行顺序

```
完整导航解析流程：

1. 导航触发（router.push / 浏览器前进后退）
   │
2. beforeRouteLeave（离开组件的守卫）
   │
3. beforeEach（全局前置守卫）
   │  └── 可调用 next() / next(false) / next('/login')
   │
4. beforeRouteUpdate（复用组件的守卫）
   │
5. beforeEnter（路由独享守卫）
   │
6. beforeRouteEnter（进入组件的守卫）
   │  └── 此时组件实例还未创建，无法访问 this
   │  └── 可通过 next(vm => {}) 访问实例
   │
7. beforeResolve（全局解析守卫）
   │  └── 在导航确认之前、组件内守卫之后
   │
8. 导航确认
   │
9. afterEach（全局后置钩子）
   │  └── 不接受 next，不能改变导航

关键区别：
├── beforeEach：导航开始前（可拦截）
├── beforeResolve：导航确认前（异步组件已解析）
├── afterEach：导航完成后（不能改变导航）
└── beforeRouteEnter：组件实例创建前（无法访问 this）
```

### 3. History 模式实现

```typescript
// HTML5 History 模式原理
class HTML5History {
  // 监听浏览器前进/后退
  setup() {
    window.addEventListener('popstate', (event) => {
      // 获取当前 URL
      const url = window.location.pathname + window.location.search
      // 触发路由匹配
      this.transitionTo(url)
    })
  }

  // 编程式导航
  push(to: string) {
    // 使用 history.pushState（不刷新页面）
    window.history.pushState({}, '', to)
    this.transitionTo(to)
  }

  replace(to: string) {
    window.history.replaceState({}, '', to)
    this.transitionTo(to)
  }
}

// Hash 模式原理
class HashHistory {
  setup() {
    window.addEventListener('hashchange', () => {
      const url = window.location.hash.slice(1)
      this.transitionTo(url)
    })
  }

  push(to: string) {
    window.location.hash = to // 触发 hashchange
  }
}

// 区别：
// History 模式：URL 美观（/users），需要服务端配置 fallback
// Hash 模式：URL 带 #（/#/users），不需要服务端配置
```

### 4. 动态路由与权限控制

```typescript
// 动态路由：根据用户权限动态添加路由
const asyncRoutes = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { roles: ['admin'] },
    children: [
      { path: 'users', component: () => import('./AdminUsers.vue') },
      { path: 'settings', component: () => import('./AdminSettings.vue') },
    ],
  },
]

// 路由权限过滤
router.beforeEach(async (to, from) => {
  const userStore = useUserStore()

  // 未登录 → 重定向到登录页
  if (!userStore.token && to.meta.requiresAuth) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 已登录但未加载动态路由
  if (userStore.token && !userStore.routesLoaded) {
    const userRoutes = filterRoutesByRole(asyncRoutes, userStore.roles)

    // 动态添加路由
    userRoutes.forEach((route) => {
      router.addRoute(route)
    })

    userStore.routesLoaded = true

    // 重新导航（因为原目标路由可能还未注册）
    return { ...to, replace: true }
  }
})

function filterRoutesByRole(routes: RouteRecord[], roles: string[]) {
  return routes.filter((route) => {
    if (route.meta?.roles) {
      return roles.some((role) => route.meta.roles.includes(role))
    }
    return true
  })
}
```

---

## 高频面试题

### Q1: Vue Router 的路由匹配算法是什么？

**参考答案要点**：

- 使用 Radix Tree（基数树）进行路由匹配
- 静态路由 O(1) 精确匹配
- 动态参数（:id）和通配符（\*）通过树的分支匹配
- 优先级：静态路由 > 动态路由 > 通配符
- 比线性遍历快得多（路由数量多时差异显著）

### Q2: 导航守卫的完整执行顺序？

**参考答案要点**：

- beforeRouteLeave（离开组件）→ beforeEach（全局前置）→ beforeRouteUpdate（复用组件）→ beforeEnter（路由独享）→ beforeRouteEnter（进入组件）→ beforeResolve（全局解析）→ afterEach（全局后置）
- 关键区别：beforeEach 可拦截、beforeResolve 在异步组件解析后、afterEach 不可改变导航

### Q3: History 模式刷新 404 如何解决？

**参考答案要点**：

- 原因：刷新时浏览器向服务端请求该路径，服务端没有对应文件
- 解决：服务端配置 fallback，所有未匹配的路径返回 index.html
- Nginx：`try_files $uri $uri/ /index.html`
- Vercel/Netlify：配置 rewrites 规则
- 本质：让 SPA 的入口 HTML 始终返回，路由由客户端 JS 处理

---

## 延伸思考

1. **设计题**：设计一个支持多角色权限的前端路由系统。
2. **场景题**：动态路由添加后，首次导航不生效（需要二次跳转），如何修复？
3. **对比题**：Vue Router vs React Router vs GoRouter（Flutter），路由设计对比？

---

## 参考资料

- [Vue Router 文档](https://router.vuejs.org)
- [Vue Router 源码](https://github.com/vuejs/router)
- [Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html)
