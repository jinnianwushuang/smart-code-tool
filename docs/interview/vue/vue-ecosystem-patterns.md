---
title: 'Vue 3 生态实战模式 [P6-P7]'
level: 'senior'
tags: ['Vue 3', '组合式 API', 'Suspense', 'Teleport', 'KeepAlive', 'provide/inject']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P6+ 高级工程师'
---

# Vue 3 生态实战模式 [P6-P7]

> 组合式 API 是 Vue 3 的核心范式，配合 Suspense、Teleport、KeepAlive、provide/inject 等内置组件，可以构建高度可复用的应用架构。本文深入探讨这些模式的设计原则和实战应用。

## 核心概念（What）

### Vue 3 核心模式全景

| 模式               | 解决的问题            | 核心 API                        |
| ------------------ | --------------------- | ------------------------------- |
| **Composable**     | 逻辑复用              | setup + ref/reactive + 生命周期 |
| **Suspense**       | 异步组件加载状态      | `<Suspense>` + async setup      |
| **Teleport**       | 弹窗/Tooltip 挂载位置 | `<Teleport to="body">`          |
| **KeepAlive**      | 组件状态缓存          | `<KeepAlive>` + include/exclude |
| **provide/inject** | 跨层级依赖注入        | provide() / inject()            |

---

## 底层原理（Why）

### 1. Composable 设计原则

```typescript
// Composable：可复用的有状态逻辑
// 命名约定：以 use 开头

// 1. 基础 composable：封装响应式状态
function useMouse() {
  const x = ref(0)
  const y = ref(0)

  onMounted(() => {
    window.addEventListener('mousemove', (e) => {
      x.value = e.clientX
      y.value = e.clientY
    })
  })

  return { x, y }
}

// 2. 带清理的 composable：自动管理副作用
function useEventListener(target: EventTarget, event: string, handler: Function) {
  onMounted(() => target.addEventListener(event, handler as any))
  onUnmounted(() => target.removeEventListener(event, handler as any))
}

// 3. 异步 composable：封装数据获取
function useFetch<T>(url: MaybeRef<string>) {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<Error | null>(null)
  const loading = ref(true)

  async function execute() {
    loading.value = true
    try {
      const response = await fetch(toValue(url))
      data.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  // 响应式 URL 变化时重新获取
  watch(() => toValue(url), execute, { immediate: true })

  return { data, error, loading, refresh: execute }
}

// 4. Composable 设计原则：
// ├── 返回 ref/reactive（保持响应式）
// ├── 自动清理副作用（onUnmounted）
// ├── 接受 MaybeRef 参数（支持响应式输入）
// ├── 命名以 use 开头
// └── 单一职责（一个 composable 做一件事）
```

### 2. Suspense 异步组件

```vue
<!-- Suspense：处理异步组件的加载状态 -->
<template>
  <Suspense>
    <!-- 异步组件加载完成后显示 -->
    <template #default>
      <AsyncUserProfile :user-id="userId" />
    </template>

    <!-- 加载中显示 -->
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

<!-- AsyncUserProfile.vue（async setup） -->
<script setup lang="ts">
const props = defineProps<{ userId: string }>();

// async setup：Suspense 会等待所有异步操作完成
const { data: user } = await useFetch(`/api/users/${props.userId}`);
const { data: posts } = await useFetch(`/api/users/${props.userId}/posts`);
</script>

<!-- 嵌套 Suspense：多层异步加载 -->
<Suspense>
  <template #default>
    <Dashboard>
      <!-- 内部组件也有异步操作 -->
      <Suspense>
        <template #default>
          <UserProfile />
        </template>
        <template #fallback>
          <UserSkeleton />
        </template>
      </Suspense>
    </Dashboard>
  </template>
  <template #fallback>
    <DashboardSkeleton />
  </template>
</Suspense>

<!-- Suspense 事件 -->
<Suspense @resolve="onResolved" @pending="onPending">
  ...
</Suspense>
```

### 3. Teleport 弹窗方案

```vue
<!-- Teleport：将内容渲染到 DOM 的其他位置 -->
<!-- 解决：z-index 层级问题、CSS 继承问题 -->

<template>
  <button @click="showModal = true">打开弹窗</button>

  <!-- 弹窗内容挂载到 body -->
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <h2>弹窗标题</h2>
        <p>弹窗内容</p>
        <button @click="showModal = false">关闭</button>
      </div>
    </div>
  </Teleport>

  <!-- Tooltip 场景 -->
  <Teleport to="body">
    <div
      v-if="tooltip.visible"
      class="tooltip"
      :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
    >
      {{ tooltip.text }}
    </div>
  </Teleport>
</template>

<!-- Teleport 的 disabled 属性 -->
<Teleport to="body" :disabled="isMobile">
  <!-- 移动端不 teleport，直接在当前位置渲染 -->
  <MobileMenu />
</Teleport>
```

### 4. KeepAlive 缓存策略

```vue
<!-- KeepAlive：缓存组件状态，避免重复渲染 -->
<template>
  <RouterView v-slot="{ Component, route }">
    <KeepAlive :include="cachedViews" :max="10">
      <component :is="Component" :key="route.fullPath" />
    </KeepAlive>
  </RouterView>
</template>

<script setup lang="ts">
const cachedViews = ref(['UserList', 'ProductList'])

// 动态控制缓存
const route = useRoute()
watch(
  () => route.meta.keepAlive,
  (keepAlive) => {
    if (keepAlive && !cachedViews.value.includes(route.name as string)) {
      cachedViews.value.push(route.name as string)
    }
  },
)
</script>

<!-- 路由配置 -->
const routes = [ { path: '/users', name: 'UserList', component: UserList, meta: { keepAlive: true },
// 标记需要缓存 }, ];

<!-- KeepAlive 生命周期 -->
<script setup>
// 组件被缓存时触发（离开页面但未销毁）
onActivated(() => {
  console.log('Component activated')
  // 重新获取数据
})

// 组件从缓存中移除时触发
onDeactivated(() => {
  console.log('Component deactivated')
})
</script>

<!-- KeepAlive 注意事项 -->
<!-- ├── include/exclude：字符串数组或正则 -->
<!-- ├── max：最大缓存数量（LRU 策略） -->
<!-- ├── 组件必须有 name 属性（include/exclude 依赖 name） -->
<!-- └── 缓存的组件不会触发 onUnmounted，而是 onDeactivated -->
```

### 5. provide/inject 依赖注入

```typescript
// provide/inject：跨层级传递数据（避免 prop drilling）

// 父组件提供
const themeKey = Symbol('theme'); // 使用 Symbol 避免冲突

provide(themeKey, reactive({
  mode: 'light',
  primaryColor: '#3b82f6',
  toggle() {
    this.mode = this.mode === 'light' ? 'dark' : 'light';
  },
}));

// 深层子组件注入
const theme = inject(themeKey);
// theme.mode, theme.toggle()

// 类型安全的 provide/inject（TypeScript）
import type { InjectionKey } from 'vue';

interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  toggle: () => void;
}

const themeKey: InjectionKey<ThemeConfig> = Symbol('theme');

// 父组件
provide(themeKey, { mode: 'light', primaryColor: '#3b82f6', toggle() { ... } });

// 子组件（自动推断类型）
const theme = inject(themeKey); // ThemeConfig | undefined
const theme2 = inject(themeKey)!; // ThemeConfig（非空断言）
const theme3 = inject(themeKey, { mode: 'light', primaryColor: '#000', toggle() {} }); // 带默认值

// 最佳实践：
// ├── 使用 Symbol 作为 key（避免命名冲突）
// ├── 使用 InjectionKey<T> 保证类型安全
// ├── 封装为 composable（封装 inject 逻辑）
// └── 提供默认值（避免 undefined）
```

---

## 高频面试题

### Q1: Composable 的设计原则是什么？

**参考答案要点**：

- 命名以 `use` 开头
- 返回 ref/reactive（保持响应式）
- 自动清理副作用（onUnmounted 中移除监听器）
- 接受 MaybeRef 参数（支持响应式输入）
- 单一职责，可组合

### Q2: Suspense 的工作原理？

**参考答案要点**：

- 等待内部所有异步 setup 完成
- 期间显示 fallback 内容
- 支持嵌套（多层 Suspense）
- 提供 resolve/pending 事件
- 注意：Vue 3.5 中 Suspense 已稳定

### Q3: KeepAlive 的缓存策略如何设计？

**参考答案要点**：

- include/exclude 控制缓存哪些组件
- max 控制最大缓存数量（LRU 淘汰）
- 组件必须有 name 属性
- 使用 onActivated/onDeactivated 生命周期
- 路由级别缓存：meta.keepAlive + 动态 include

---

## 延伸思考

1. **设计题**：设计一个通用的 useFetch composable（支持缓存、重试、取消）。
2. **场景题**：KeepAlive 缓存的组件数据不更新，如何解决？
3. **对比题**：provide/inject vs Pinia，全局状态管理如何选择？

---

## 参考资料

- [Vue 3 Composable 文档](https://vuejs.org/guide/reusability/composables.html)
- [Suspense RFC](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0027-suspense.md)
- [Teleport 文档](https://vuejs.org/guide/built-ins/teleport.html)
