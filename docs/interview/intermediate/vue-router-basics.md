---
title: "Vue Router 路由实战 [P5-P6]"
level: "intermediate"
tags: ["Vue 3", "Vue Router", "路由", "导航守卫", "懒加载"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# Vue Router 路由实战 [P5-P6]

> Vue Router 是 Vue 的官方路由。掌握路由配置、导航守卫、路由懒加载，才能构建完整的单页应用。

## 核心概念（What）

### 路由基础

```
路由 = URL → 组件的映射关系

核心功能：
├── 路由配置 → URL 对应组件
├── 路由跳转 → 编程式导航
├── 参数传递 → 动态路由
├── 导航守卫 → 权限控制
├── 路由懒加载 → 按需加载
└── 嵌套路由 → 子路由
```

## 底层原理（Why）

### 基础配置

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('../views/User.vue'),
    props: true // 将 id 作为 prop 传递
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(), // History 模式
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition; // 返回原位
    } else {
      return { top: 0 }; // 滚动到顶部
    }
  }
});

export default router;

// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
```

### 路由跳转

```vue
<template>
  <div>
    <!-- 声明式导航 -->
    <router-link to="/">首页</router-link>
    <router-link :to="{ name: 'User', params: { id: 123 } }">
      用户详情
    </router-link>
    
    <!-- 编程式导航 -->
    <button @click="goHome">首页</button>
    <button @click="goUser(123)">用户详情</button>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// 跳转方式
function goHome() {
  router.push('/');
  // 或
  router.push({ name: 'Home' });
  // 或
  router.push({ path: '/' });
}

function goUser(id) {
  router.push({ name: 'User', params: { id } });
  // 或
  router.push(`/user/${id}`);
}

// 替换（不添加历史记录）
router.replace('/');

// 前进/后退
router.go(-1); // 后退
router.go(1);  // 前进
router.back(); // 后退
router.forward(); // 前进

// 获取路由信息
console.log(route.params); // { id: '123' }
console.log(route.query);  // { search: 'keyword' }
console.log(route.path);   // '/user/123'
console.log(route.name);   // 'User'
</script>
```

### 动态路由

```javascript
const routes = [
  // 1. 路径参数
  {
    path: '/user/:id',
    component: User,
    props: true // id 作为 prop
  },
  
  // 2. 多个参数
  {
    path: '/post/:postId/comment/:commentId',
    component: Comment
  },
  
  // 3. 可选参数
  {
    path: '/search/:keyword?',
    component: Search
  },
  
  // 4. 正则参数
  {
    path: '/user/:id(\\d+)',
    component: User
  },
  
  // 5. 嵌套路由
  {
    path: '/dashboard',
    component: Dashboard,
    children: [
      {
        path: '', // 默认子路由
        component: DashboardHome
      },
      {
        path: 'analytics',
        component: DashboardAnalytics
      },
      {
        path: 'settings',
        component: DashboardSettings
      }
    ]
  }
];

// 组件中使用
<template>
  <div>
    <h1>用户 {{ id }}</h1>
    
    <!-- 嵌套路由出口 -->
    <router-view />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
const id = route.params.id;
</script>
```

### 导航守卫

```javascript
// 1. 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('从', from.path, '到', to.path);
  
  // 权限检查
  const isLoggedIn = localStorage.getItem('token');
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

// 2. 全局后置守卫
router.afterEach((to, from) => {
  // 修改页面标题
  document.title = to.meta.title || '默认标题';
  
  // 发送统计
  analytics.pageView(to.path);
});

// 3. 路由独享守卫
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      const isAdmin = checkAdmin();
      if (!isAdmin) {
        next({ name: 'Forbidden' });
      } else {
        next();
      }
    }
  }
];

// 4. 组件内守卫
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';

// 离开前确认
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges()) {
    const answer = window.confirm('有未保存的修改，确定离开吗？');
    if (answer) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

// 路由参数变化
onBeforeRouteUpdate((to, from, next) => {
  // /user/1 → /user/2
  fetchUserData(to.params.id);
  next();
});
</script>

// 路由元信息
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      title: '管理后台',
      roles: ['admin', 'editor']
    }
  }
];
```

### 路由懒加载

```javascript
// 1. 动态导入（推荐）
const routes = [
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
];

// 2. Webpack 魔法注释
const routes = [
  {
    path: '/about',
    component: () => import(
      /* webpackChunkName: "about" */
      /* webpackPrefetch: true */
      './views/About.vue'
    )
  }
];

// 3. 分组打包
const routes = [
  {
    path: '/dashboard',
    component: () => import(
      /* webpackChunkName: "dashboard" */
      './views/Dashboard.vue'
    ),
    children: [
      {
        path: 'analytics',
        component: () => import(
          /* webpackChunkName: "dashboard" */
          './views/DashboardAnalytics.vue'
        )
      }
    ]
  }
];
```

## 实战应用（How）

### 权限控制

```javascript
// 路由配置
const routes = [
  {
    path: '/login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'admin',
        component: Admin,
        meta: { requiresAuth: true, roles: ['admin'] }
      }
    ]
  }
];

// 全局守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  
  // 需要登录
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  }
  
  // 需要特定角色
  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    next({ name: 'Forbidden' });
    return;
  }
  
  // 已登录不能访问登录页
  if (to.meta.requiresGuest && token) {
    next({ name: 'Dashboard' });
    return;
  }
  
  next();
});
```

### 路由过渡动画

```vue
<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## 高频面试题

### Q1: Vue Router 的导航守卫有哪些？

```
全局守卫：
├── beforeEach → 路由跳转前
├── afterEach → 路由跳转后
└── beforeResolve → 解析前

路由独享：
└── beforeEnter → 进入路由前

组件内守卫：
├── onBeforeRouteUpdate → 路由参数变化
├── onBeforeRouteLeave → 离开路由前
└── beforeRouteEnter → 进入路由前（选项式）

执行顺序：
├── beforeEach
├── beforeEnter（如果有）
├── beforeRouteUpdate（如果有）
├── beforeResolve
├── afterEach
└── 组件内守卫
```

### Q2: 如何实现路由懒加载？

```
方法：
├── 动态 import()
├── Webpack 魔法注释
└── 路由分组

优势：
├── 减少首屏 JS 体积
├── 按需加载
└── 提升加载速度

示例：
component: () => import('./views/About.vue')
```

### Q3: History 模式和 Hash 模式的区别？

```
┌──────────────┬──────────────┬──────────────┐
│              │   History    │    Hash      │
├──────────────┼──────────────┼──────────────┤
│ URL          │ /user/123    │ /#/user/123  │
│ 美观         │ 美观         │ 不美观       │
│ SEO          │ 友好         │ 不友好       │
│ 配置         │ 需要服务器   │ 无需配置     │
│ 兼容性       │ HTML5        │ 所有浏览器   │
└──────────────┴──────────────┴──────────────┘

推荐：生产环境用 History 模式
```

## 延伸思考

1. 如何实现路由权限控制？
2. 路由过渡动画的实现？
3. 如何处理 404 页面？

## 参考资料

- [Vue Router 官方文档](https://router.vuejs.org/zh/)
- [导航守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html)
