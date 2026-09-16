# 前端路由系统实现典型拆解

> 本文档从 Hash 路由和 History 路由两种模式出发，
> 手写实现一个完整的前端路由系统，拆解路由匹配、懒加载、导航守卫等核心机制。

---

## 一、两种路由模式对比

| 对比项     | Hash 模式                        | History 模式                |
| ---------- | -------------------------------- | --------------------------- |
| URL 格式   | `example.com/#/about`            | `example.com/about`         |
| 核心 API   | `hashchange` 事件                | `pushState` / `popstate`    |
| 服务端配置 | 不需要                           | 需要 fallback 到 index.html |
| SEO 友好   | 较差                             | 较好                        |
| 兼容性     | IE8+                             | IE10+                       |
| 刷新行为   | 不发送请求（`#` 后不发给服务端） | 发送请求（需服务端配合）    |

---

## 二、Hash 路由实现

### 2.1 核心实现

```javascript
class HashRouter {
  constructor() {
    this.routes = {} // 路由注册表：path → callback
    this.currentPath = '' // 当前路径
    this.beforeEachHook = null // 全局前置守卫

    // 监听 hash 变化
    window.addEventListener('hashchange', () => {
      this._onRouteChange()
    })
    // 页面首次加载时也需要处理
    window.addEventListener('load', () => {
      this._onRouteChange()
    })
  }

  // 注册路由
  register(path, callback) {
    this.routes[path] = callback
  }

  // 注册路由（带子路由配置）
  registerRoutes(routes) {
    routes.forEach(({ path, component }) => {
      this.routes[path] = component
    })
  }

  // 编程式导航
  push(path) {
    window.location.hash = path
  }

  // 注册全局前置守卫
  beforeEach(hook) {
    this.beforeEachHook = hook
  }

  // 路由变化处理
  async _onRouteChange() {
    const hash = window.location.hash.slice(1) || '/' // 去掉 #
    this.currentPath = hash

    // 执行前置守卫
    if (this.beforeEachHook) {
      const allowed = await this.beforeEachHook(hash)
      if (!allowed) return // 守卫拦截，不跳转
    }

    this._render(hash)
  }

  // 渲染
  _render(path) {
    const callback = this.routes[path]
    if (callback) {
      callback(document.getElementById('app'))
    } else {
      // 404 处理
      const notFound = this.routes['*']
      if (notFound) {
        notFound(document.getElementById('app'))
      }
    }
  }
}
```

### 2.2 使用示例

```javascript
const router = new HashRouter()

router.registerRoutes([
  {
    path: '/',
    component: (el) => {
      el.innerHTML = '<h1>首页</h1>'
    },
  },
  {
    path: '/about',
    component: (el) => {
      el.innerHTML = '<h1>关于</h1>'
    },
  },
  {
    path: '*',
    component: (el) => {
      el.innerHTML = '<h1>404 页面未找到</h1>'
    },
  },
])

// 前置守卫：模拟登录拦截
router.beforeEach(async (to) => {
  if (to === '/dashboard' && !isLoggedIn()) {
    router.push('/login')
    return false // 拦截跳转
  }
  return true
})
```

**Hash 路由执行流程拆解：**

| 步骤 | 触发方式                       | 事件                                | 处理               |
| ---- | ------------------------------ | ----------------------------------- | ------------------ |
| ①    | 用户点击 `<a href="#/about">`  | `hashchange`                        | `_onRouteChange()` |
| ②    | 编程式 `router.push('/about')` | 修改 `location.hash` → `hashchange` | `_onRouteChange()` |
| ③    | 页面首次加载                   | `load`                              | `_onRouteChange()` |
| ④    | 浏览器前进/后退                | `popstate` → 触发 `hashchange`      | `_onRouteChange()` |

---

## 三、History 路由实现

### 3.1 核心实现

```javascript
class HistoryRouter {
  constructor() {
    this.routes = {}
    this.currentPath = ''
    this.beforeEachHook = null

    // 监听浏览器前进/后退
    window.addEventListener('popstate', () => {
      this._onRouteChange(window.location.pathname)
    })

    // 拦截 <a> 标签的默认跳转
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-link]')
      if (link) {
        e.preventDefault()
        this.push(link.getAttribute('href'))
      }
    })

    // 首次加载
    this._onRouteChange(window.location.pathname)
  }

  register(path, callback) {
    this.routes[path] = callback
  }

  push(path) {
    // pushState 不会触发 popstate，需要手动处理
    window.history.pushState({}, '', path)
    this._onRouteChange(path)
  }

  replace(path) {
    window.history.replaceState({}, '', path)
    this._onRouteChange(path)
  }

  beforeEach(hook) {
    this.beforeEachHook = hook
  }

  async _onRouteChange(path) {
    this.currentPath = path

    if (this.beforeEachHook) {
      const allowed = await this.beforeEachHook(path)
      if (!allowed) return
    }

    this._render(path)
  }

  _render(path) {
    const callback = this.routes[path]
    if (callback) {
      callback(document.getElementById('app'))
    } else {
      const notFound = this.routes['*']
      if (notFound) notFound(document.getElementById('app'))
    }
  }
}
```

### 3.2 关键 API 拆解

| API                                       | 作用                     | 是否触发 popstate |
| ----------------------------------------- | ------------------------ | ----------------- |
| `history.pushState(state, title, url)`    | 添加历史记录，不刷新页面 | ❌ 不触发         |
| `history.replaceState(state, title, url)` | 替换当前历史记录         | ❌ 不触发         |
| `popstate` 事件                           | 浏览器前进/后退时触发    | ✅ 触发           |

> **核心要点**：`pushState` 只改变 URL，不触发任何事件。所以调用 `pushState` 后必须**手动渲染**页面内容。

**History 路由执行流程拆解：**

| 步骤 | 触发方式                               | 事件                                  | 处理                            |
| ---- | -------------------------------------- | ------------------------------------- | ------------------------------- |
| ①    | 用户点击 `<a data-link href="/about">` | `click` → `preventDefault` → `push()` | `pushState` + 手动渲染          |
| ②    | 编程式 `router.push('/about')`         | 无事件                                | `pushState` + 手动渲染          |
| ③    | 浏览器前进/后退                        | `popstate`                            | 读取 `location.pathname` + 渲染 |
| ④    | 页面刷新                               | 发送 HTTP 请求                        | 需服务端返回 index.html         |

---

## 四、动态路由匹配

```javascript
// 支持 :id 这样的动态参数
// /user/:id → /user/123

function matchRoute(pattern, path) {
  const patternParts = pattern.split('/')
  const pathParts = path.split('/')
  const params = {}

  if (patternParts.length !== pathParts.length) return null

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      // 动态参数
      params[patternParts[i].slice(1)] = pathParts[i]
    } else if (patternParts[i] !== pathParts[i]) {
      return null // 不匹配
    }
  }

  return params
}

// 拆解
matchRoute('/user/:id', '/user/123')
// → { id: '123' }

matchRoute('/user/:id/post/:postId', '/user/123/post/456')
// → { id: '123', postId: '456' }

matchRoute('/about', '/user/123')
// → null
```

**动态路由匹配拆解：**

| 步骤 | 操作                        | 结果                                           |
| ---- | --------------------------- | ---------------------------------------------- |
| ①    | 按 `/` 拆分 pattern 和 path | `['', 'user', ':id']` vs `['', 'user', '123']` |
| ②    | 逐段比较                    | `''` = `''` ✅，`'user'` = `'user'` ✅         |
| ③    | 遇到 `:id` → 提取参数       | `params.id = '123'`                            |
| ④    | 全部匹配 → 返回 params      | `{ id: '123' }`                                |

---

## 五、路由懒加载

```javascript
// 路由配置：component 改为返回 Promise 的函数
const routes = [
  {
    path: '/dashboard',
    component: () => import('./pages/dashboard.js'), // 动态导入
  },
  {
    path: '/settings',
    component: () => import('./pages/settings.js'),
  },
]

// 带缓存的路由渲染
const componentCache = new Map()

async function renderWithLazyLoad(path, routes, container) {
  const route = routes.find((r) => r.path === path)
  if (!route) return

  // 缓存已加载的组件
  if (!componentCache.has(path)) {
    container.innerHTML = '<p>加载中...</p>' // 加载状态
    const module = await route.component()
    componentCache.set(path, module.default || module)
  }

  const Component = componentCache.get(path)
  Component(container)
}
```

**懒加载执行过程拆解：**

| 步骤 | 事件                  | 说明                                |
| ---- | --------------------- | ----------------------------------- |
| ①    | 首次访问 `/dashboard` | `import()` 动态加载 JS 文件         |
| ②    | 显示加载状态          | `container.innerHTML = '加载中...'` |
| ③    | 文件加载完成          | 缓存组件到 `componentCache`         |
| ④    | 再次访问 `/dashboard` | 直接从缓存取，不重新加载            |

---

## 六、服务端配置 — History 模式必须

```nginx
# Nginx 配置：所有请求 fallback 到 index.html
server {
  listen 80;
  server_name example.com;
  root /var/www/app;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

**为什么需要？**

| 请求                    | 无配置                            | 有配置                                 |
| ----------------------- | --------------------------------- | -------------------------------------- |
| `GET /`                 | 返回 index.html ✅                | 返回 index.html ✅                     |
| `GET /about`            | 404 ❌（服务器找不到 about 文件） | 返回 index.html ✅（由前端路由处理）   |
| `GET /assets/style.css` | 返回 CSS ✅                       | 返回 CSS ✅（文件存在，不走 fallback） |

---

## 七、总结：前端路由知识图谱

```
前端路由
├── Hash 模式
│   ├── 核心：hashchange 事件
│   ├── URL 格式：/#/path
│   └── 无需服务端配置
│
├── History 模式
│   ├── 核心：pushState + popstate
│   ├── URL 格式：/path
│   ├── 需服务端 fallback 配置
│   └── 需拦截 <a> 标签点击
│
├── 路由匹配
│   ├── 静态路由：精确匹配 path
│   ├── 动态路由：:param 参数提取
│   └── 通配路由：* 处理 404
│
├── 高级功能
│   ├── 懒加载：动态 import + 缓存
│   ├── 导航守卫：beforeEach 拦截
│   └── 编程式导航：push / replace
│
└── 服务端配置
    └── try_files → index.html fallback
```
