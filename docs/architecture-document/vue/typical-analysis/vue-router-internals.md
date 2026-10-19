---
title: 'Vue Router 4 底层原理'
tags: ['Vue', 'Vue Router', '路由', '导航守卫', '底层原理']
---

# Vue Router 4 底层原理

> 本文从 Vue Router 4 的核心架构出发，拆解路由匹配算法、导航守卫执行流程、响应式路由（useRoute/useRouter）、路由懒加载、嵌套路由视图嵌套、滚动行为控制，以及与 Vue 3 响应式系统的深度集成。

---

## 一、Vue Router 4 核心架构

### 1.1 整体架构

```
Vue Router 4 架构分层：

┌──────────────────────────────────────────────────────────┐
│  应用层                                                    │
│  <router-link> / <router-view> / useRoute / useRouter    │
├──────────────────────────────────────────────────────────┤
│  路由匹配层                                                │
│  path-to-regexp → 路径匹配 + 参数提取                    │
│  路由记录（RouteRecord）→ 路由表数据结构                  │
├──────────────────────────────────────────────────────────┤
│  导航层                                                    │
│  Router 实例 → 导航触发 + 守卫执行 + 状态管理            │
│  NavigationGuard → 全局/路由独享/组件内守卫               │
├──────────────────────────────────────────────────────────┤
│  历史管理层                                                │
│  createWebHistory → HTML5 History API                     │
│  createWebHashHistory → Hash 模式                         │
│  createMemoryHistory → 内存模式（SSR / 测试）             │
├──────────────────────────────────────────────────────────┤
│  响应式集成层                                              │
│  currentRoute（ref）→ 响应式路由状态                      │
│  useRoute() / useRouter() → 组合式 API                   │
└──────────────────────────────────────────────────────────┘
```

### 1.2 Router 实例核心字段

```typescript
// Router 实例核心结构（简化）
interface Router {
  // 当前路由（响应式 ref）
  currentRoute: Ref<RouteLocationNormalizedLoaded>

  // 路由表（扁平化后的路由记录数组）
  routes: RouteRecordNormalized[]

  // 路由添加
  addRoute(route: RouteRecordRaw): () => void
  removeRoute(name: string): void

  // 导航方法
  push(to: RouteLocationRaw): Promise<NavigationFailure | void>
  replace(to: RouteLocationRaw): Promise<NavigationFailure | void>
  go(delta: number): void
  back(): void
  forward(): void

  // 守卫注册
  beforeEach(guard: NavigationGuard): () => void
  beforeResolve(guard: NavigationGuard): () => void
  afterEach(hook: AfterNavigationHook): () => void

  // 解析
  resolve(to: RouteLocationRaw): RouteLocation & { href: string }

  // 安装（Vue 插件）
  install(app: App): void
}
```

---

## 二、路由匹配算法

### 2.1 path-to-regexp

```
路由匹配核心：path-to-regexp 库

路径模式 → 正则表达式：

'/user/:id'       → /^\/user\/([^/]+?)$/
  匹配：/user/123 → { id: '123' }

'/post/:id(\\d+)' → /^\/post\/(\d+)$/
  匹配：/post/456 → { id: '456' }
  不匹配：/post/abc

'/file/*path'     → /^\/file\/(.*)$/
  匹配：/file/a/b/c → { path: 'a/b/c' }

'/user/:id?'      → /^\/user(?:\/([^/]+?))?$/
  匹配：/user → {}
  匹配：/user/123 → { id: '123' }
```

### 2.2 路由记录排序与优先级

```
路由匹配优先级（从高到低）：

① 静态路径 > 动态路径
   /user/profile > /user/:id

② 参数有正则约束 > 无约束
   /post/:id(\d+) > /post/:id

③ 参数越多 > 参数越少
   /user/:id/post/:postId > /user/:id

④ 通配符最低
   /:pathMatch(.*) 最低优先级

路由表排序算法：
  1. 按路径分段（split by '/'）
  2. 每段打分：
     - 静态段 → 高分
     - 动态段（有正则）→ 中分
     - 动态段（无正则）→ 低分
     - 通配符 → 最低分
  3. 总分高的路由排在前面
  4. 匹配时从上到下遍历，第一个匹配的路由生效
```

### 2.3 路由记录扁平化

```
// 嵌套路由配置
const routes = [
  {
    path: '/user',
    component: UserLayout,
    children: [
      { path: '', component: UserHome },
      { path: 'profile', component: UserProfile },
      {
        path: 'settings',
        component: UserSettings,
        children: [
          { path: 'security', component: SecuritySettings },
        ],
      },
    ],
  },
];

// 扁平化后的路由记录
[
  { path: '/user', components: { default: UserLayout } },
  { path: '/user/', components: { default: UserLayout, UserHome } },
  { path: '/user/profile', components: { default: UserLayout, UserProfile } },
  { path: '/user/settings', components: { default: UserLayout, UserSettings } },
  { path: '/user/settings/security', components: { default: UserLayout, UserSettings, SecuritySettings } },
]

// 每个路由记录包含完整的"匹配路径 → 组件链"映射
// 匹配时：找到匹配的路由记录 → 渲染对应的组件嵌套
```

---

## 三、导航守卫执行流程

### 3.1 完整守卫链

```
router.push('/dashboard')
│
├── ① 全局前置守卫（beforeEach）
│   ├── 注册的顺序依次执行
│   ├── 可以 next() / next(false) / next('/login') / next(error)
│   └── 典型用途：鉴权、登录重定向
│
├── ② 路由独享守卫（beforeEnter）
│   ├── 定义在路由配置中
│   └── 只在进入该路由时触发
│
├── ③ 组件内守卫（beforeRouteEnter）
│   ├── 在组件创建前调用（无法访问 this）
│   ├── 可以 next(vm => ...) 访问组件实例
│   └── 典型用途：数据预加载
│
├── ④ 全局解析守卫（beforeResolve）
│   ├── 在组件被解析后、导航被确认前
│   └── 典型用途：异步组件加载完成后的检查
│
├── ⑤ 导航确认 → 组件切换
│   ├── 复用的组件 → beforeRouteUpdate
│   ├── 离开的组件 → beforeRouteLeave
│   └── 进入的组件 → beforeRouteEnter
│
├── ⑥ DOM 更新 → 路由状态更新
│   └── currentRoute.value 更新为新路由
│
└── ⑦ 全局后置钩子（afterEach）
    ├── 不接受 next 函数，不会改变导航
    └── 典型用途：埋点、页面标题、分析
```

### 3.2 守卫执行顺序（详细）

```
从 /page-a 导航到 /page-b：

1. 导航触发
   └── router.push('/page-b')

2. 全局 beforeEach（按注册顺序）
   └── guard(to, from, next)

3. 路由独享 beforeEnter
   └── guard(to, from, next)

4. 组件内 beforeRouteLeave（离开的组件 PageA）
   └── guard(to, from, next)

5. 全局 beforeResolve
   └── guard(to, from, next)

6. 导航确认

7. 组件内 beforeRouteEnter（进入的组件 PageB）
   └── guard(to, from, next)

8. 全局 afterEach
   └── hook(to, from)

9. DOM 更新
   └── <router-view> 渲染 PageB

10. beforeRouteEnter 的 next(vm => ...) 回调执行
    └── 此时组件已创建，可以访问实例
```

---

## 四、响应式路由

### 4.1 currentRoute 响应式 ref

```typescript
// Vue Router 4 的核心创新：currentRoute 是 ref
const currentRoute = shallowRef<RouteLocationNormalizedLoaded>({
  path: '/',
  name: undefined,
  params: {},
  query: {},
  hash: '',
  fullPath: '/',
  matched: [],
  meta: {},
  redirectedFrom: undefined,
})

// 每次导航确认后更新
function finalizeNavigation(to) {
  // 更新响应式路由状态
  currentRoute.value = to

  // 触发依赖 currentRoute 的组件重新渲染
  // （因为它是 ref，所以 Vue 响应式系统自动追踪）
}
```

### 4.2 useRoute / useRouter

```typescript
// useRoute：返回当前路由的响应式引用
function useRoute(): RouteLocationNormalizedLoaded {
  // 注入当前路由（从 app 的 provide 获取）
  return inject(routeLocationKey)
  // 本质：返回 router.currentRoute.value
  // 是响应式的 → 路由变化时自动更新
}

// useRouter：返回 Router 实例
function useRouter(): Router {
  return inject(routerKey)
  // 返回 router 实例（单例）
  // 包含 push / replace / go / beforeEach 等方法
}

// 使用示例
const route = useRoute()
const router = useRouter()

// route 是响应式的
watch(
  () => route.params.id,
  (newId) => {
    // id 参数变化时触发
    fetchUser(newId)
  },
)

// 计算属性也可以使用
const userId = computed(() => route.params.id)
```

### 4.3 与 Vue 3 响应式集成

```
Vue Router 4 与 Vue 3 响应式系统的集成：

┌──────────────────────────────────────────────────────────┐
│  router.currentRoute (shallowRef)                        │
│  │                                                       │
│  ├── useRoute() → 注入 currentRoute.value                │
│  │   └── 组件模板中 {{ route.path }} → 自动追踪          │
│  │                                                       │
│  ├── watch(() => route.params.id, ...) → 自动追踪        │
│  │                                                       │
│  └── computed(() => route.query.page) → 自动追踪         │
│                                                          │
│  导航触发 → currentRoute.value = newRoute                │
│  → Vue 响应式系统检测到变化                               │
│  → 依赖 route 的组件自动重新渲染                         │
│  → watch 回调触发                                        │
│  → computed 重新计算                                     │
└──────────────────────────────────────────────────────────┘

关键：
  • currentRoute 是 shallowRef（浅响应式）
  • route.params / route.query 等属性变化不会触发更新
  • 只有整个 route 对象替换时才触发
  • 如果需要深度监听 → watch(() => route.params.id, ...)
```

---

## 五、路由懒加载

### 5.1 懒加载原理

```typescript
// 路由配置
const routes = [
  {
    path: '/dashboard',
    // 懒加载：返回 Promise 的函数
    component: () => import('./views/Dashboard.vue'),
  },
]

// 底层原理：
// ① 路由匹配时 → 调用 component 函数
// ② import() → 动态导入 → 返回 Promise
// ③ Vite/Webpack 自动代码分割 → 生成独立 chunk
// ④ Promise resolve → 获得组件定义
// ⑤ 渲染组件
```

### 5.2 加载状态控制

```typescript
// 配合 Suspense 实现加载状态
const routes = [
  {
    path: '/dashboard',
    component: defineAsyncComponent({
      loader: () => import('./views/Dashboard.vue'),
      loadingComponent: Loading,
      delay: 200, // 200ms 后显示 loading
      timeout: 10000, // 10s 超时
    }),
  },
]

// 或者使用路由元信息
const routes = [
  {
    path: '/dashboard',
    component: () => import('./views/Dashboard.vue'),
    meta: {
      // 自定义加载逻辑
      loading: true,
    },
  },
]

// 全局守卫中处理
router.beforeEach(async (to) => {
  if (to.meta.loading) {
    // 显示全局 loading
    store.setLoading(true)
  }
})

router.afterEach(() => {
  store.setLoading(false)
})
```

---

## 六、嵌套路由与视图嵌套

### 6.1 嵌套路由原理

```
路由配置：
const routes = [
  {
    path: '/user/:id',
    component: UserLayout,      // 一级视图
    children: [
      {
        path: '',               // 默认子路由
        component: UserHome,    // 二级视图
      },
      {
        path: 'profile',
        component: UserProfile, // 二级视图
      },
      {
        path: 'settings',
        component: UserSettings, // 二级视图
        children: [
          {
            path: 'security',
            component: SecuritySettings, // 三级视图
          },
        ],
      },
    ],
  },
];

模板：
<!-- App.vue -->
<router-view />  <!-- 一级视图 -->

<!-- UserLayout.vue -->
<div>
  <nav>...</nav>
  <router-view />  <!-- 二级视图 -->
</div>

<!-- UserSettings.vue -->
<div>
  <aside>...</aside>
  <router-view />  <!-- 三级视图 -->
</div>

渲染流程：
  URL: /user/123/settings/security
  │
  ├── 匹配路由记录：
  │   matched = [
  │     { path: '/user/:id', component: UserLayout },
  │     { path: 'settings', component: UserSettings },
  │     { path: 'security', component: SecuritySettings },
  │   ]
  │
  ├── <router-view> (App.vue) → 渲染 UserLayout
  │   └── <router-view> (UserLayout.vue) → 渲染 UserSettings
  │       └── <router-view> (UserSettings.vue) → 渲染 SecuritySettings
  │
  └── 每层 <router-view> 根据 depth 从 matched 中取对应组件
```

### 6.2 命名视图

```typescript
// 命名视图：一个路由对应多个视图
const routes = [
  {
    path: '/',
    components: {
      default: Home,
      sidebar: Sidebar,
      footer: Footer,
    },
  },
];

// 模板
<router-view />           <!-- 渲染 default → Home -->
<router-view name="sidebar" />  <!-- 渲染 sidebar → Sidebar -->
<router-view name="footer" />   <!-- 渲染 footer → Footer -->
```

---

## 七、滚动行为控制

### 7.1 scrollBehavior

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // savedPosition：浏览器前进/后退时可用
    if (savedPosition) {
      return savedPosition // 恢复到之前位置
    }

    // hash 锚点
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth', // 平滑滚动
      }
    }

    // 滚动到顶部
    return { top: 0, behavior: 'smooth' }
  },
})
```

### 7.2 异步滚动

```typescript
scrollBehavior(to, from, savedPosition) {
  return new Promise((resolve) => {
    // 等待页面过渡动画完成
    setTimeout(() => {
      resolve({ top: 0 });
    }, 500);
  });
}
```

---

## 八、与 Vue 2 Router 的差异

```
┌─────────────────────────────────────────────────────────────┐
│           Vue Router 3 (Vue 2) vs Vue Router 4 (Vue 3)      │
│                                                              │
│  Vue Router 3               Vue Router 4                     │
│  ──────────────             ──────────────                   │
│                                                              │
│  this.$route                useRoute()                       │
│  this.$router               useRouter()                      │
│  └── Options API            └── Composition API              │
│                                                              │
│  new Router({...})          createRouter({...})              │
│  └── 构造函数               └── 工厂函数                     │
│                                                              │
│  非响应式（需要 watch）      currentRoute 是 ref              │
│  └── route 变化不触发更新    └── 自动触发响应式更新           │
│                                                              │
│  mode: 'history'            history: createWebHistory()      │
│  └── 字符串配置              └── 函数式配置                   │
│                                                              │
│  守卫中 this 可用            守卫中无 this（函数式）          │
│  └── 组件内守卫              └── 统一为函数                   │
│                                                              │
│  路由懒加载：import()       路由懒加载：import()              │
│  └── 相同                     └── 相同                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 九、高频面试题

### 9.1 Vue Router 的路由匹配是怎么实现的？

```
核心：path-to-regexp 库

流程：
  ① 路由配置 → 扁平化为路由记录数组
  ② 按优先级排序（静态 > 动态 > 通配符）
  ③ 导航时 → 从上到下遍历路由记录
  ④ 每个路由记录的路径 → 转为正则表达式
  ⑤ 用正则匹配 URL → 提取参数
  ⑥ 第一个匹配的路由生效

优化：
  • 静态路由优先匹配（不需要正则）
  • 路由记录排序减少遍历次数
  • 正则编译缓存（避免重复编译）
```

### 9.2 导航守卫的执行顺序是什么？

```
完整顺序：
  ① 全局 beforeEach（按注册顺序）
  ② 路由独享 beforeEnter
  ③ 组件内 beforeRouteLeave（离开的组件）
  ④ 全局 beforeResolve
  ⑤ 导航确认
  ⑥ 组件内 beforeRouteEnter（进入的组件）
  ⑦ 全局 afterEach
  ⑧ DOM 更新
  ⑨ beforeRouteEnter 的 next(vm => ...) 回调
```

### 9.3 Vue Router 4 如何实现响应式路由？

```
核心：currentRoute 是 shallowRef

  • router.currentRoute 是 ref 类型
  • useRoute() 返回 currentRoute.value
  • 导航确认后 → currentRoute.value = newRoute
  • Vue 响应式系统检测到变化
  • 依赖 route 的组件/watch/computed 自动更新

与 Vue Router 3 的差异：
  • Vue Router 3：非响应式，需要 watch $route
  • Vue Router 4：原生响应式，直接使用
```

---

## 参考资料

- [Vue Router 4 源码](https://github.com/vuejs/router)
- [Vue Router 官方文档](https://router.vuejs.org/)
- [path-to-regexp](https://github.com/pillarjs/path-to-regexp)
