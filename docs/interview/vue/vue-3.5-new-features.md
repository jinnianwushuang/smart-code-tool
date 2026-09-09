---
title: 'Vue 3.5+ 新特性与响应式重构 [P6-P7]'
level: 'senior'
tags: ['Vue 3.5', 'useTemplateRef', 'useId', 'defineModel', '响应式重构']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P6+ 高级工程师'
---

# Vue 3.5+ 新特性与响应式重构 [P6-P7]

> Vue 3.5（2025）带来了响应式系统的重大重构、多个新 Composition API 和编译器改进。这些变更让 Vue 在开发体验和性能上进一步领先。

## 核心概念（What）

### Vue 3.5+ 核心变更

| 特性                      | 版本 | 解决的问题            |
| ------------------------- | ---- | --------------------- |
| **响应式系统重构**        | 3.5  | 性能提升、内存优化    |
| **`useTemplateRef()`**    | 3.5  | 类型安全的模板 ref    |
| **`useId()`**             | 3.5  | SSR 安全的唯一 ID     |
| **`defineModel()`**       | 3.4  | 简化 v-model 双向绑定 |
| **`useAttrs()` 改进**     | 3.5  | 更好的 attrs 访问     |
| **SSR 改进**              | 3.5  | 流式 SSR 性能优化     |
| **`onScopeDispose` 改进** | 3.5  | 更精确的清理时机      |

---

## 底层原理（Why）

### 1. 响应式系统重构（3.5）

```typescript
// Vue 3.5 响应式系统重构
// 核心变更：从 class-based 到 function-based 实现

// 旧实现（Vue 3.0-3.4）：基于 class
class ReactiveEffect {
  private _fn: () => void
  private _deps: Set<Dep>[] = []

  run() {
    /* ... */
  }
  stop() {
    /* ... */
  }
}

// 新实现（Vue 3.5+）：基于函数
function createEffect(fn: () => void) {
  const effect: ReactiveEffect = {
    fn,
    deps: [],
    flags: 0, // 位运算标记（性能优化）
    run() {
      /* ... */
    },
    stop() {
      /* ... */
    },
  }
  return effect
}

// 重构收益：
// ├── 内存减少 ~30%（去掉 class 实例开销）
// ├── 依赖收集速度提升（位运算替代 Set 操作）
// ├── 更好的 tree-shaking（函数式更易优化）
// └── 为 Vapor Mode 提供更底层的支持

// 性能对比（Vue 3.5 vs 3.4）：
// ├── 大型响应式数组（10000 项）：更新速度提升 ~40%
// ├── 深层嵌套对象监听：内存减少 ~25%
// └── computed 链式依赖：缓存命中率提升
```

### 2. `useTemplateRef()`

```vue
<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'

// Vue 3.4 及之前：模板 ref 类型推断不够精确
const inputRef = ref<HTMLInputElement | null>(null)

// Vue 3.5+：useTemplateRef 提供精确类型
const inputRef = useTemplateRef<HTMLInputElement>('inputRef')
//                                                  ↑ 模板中的 ref 名称

onMounted(() => {
  // 类型安全：inputRef 自动推断为 HTMLInputElement | null
  inputRef.value?.focus()
})
</script>

<template>
  <!-- ref 名称必须与 useTemplateRef 参数匹配 -->
  <input ref="inputRef" />
</template>
```

### 3. `useId()`

```vue
<script setup lang="ts">
import { useId } from 'vue'

// SSR 安全的唯一 ID 生成
// 服务端和客户端生成相同的 ID（避免 hydration mismatch）
const id = useId() // 例如 "v-0-0"

// 使用场景：表单标签关联、ARIA 属性
</script>

<template>
  <label :for="id">邮箱</label>
  <input :id="id" type="email" />

  <!-- ARIA 无障碍 -->
  <button :aria-describedby="`${id}-hint`">提交</button>
  <div :id="`${id}-hint`">请输入有效的邮箱地址</div>
</template>

// 与 React 19 的 useId() 类似，但 Vue 的实现更轻量 // 每个组件实例获得递增的 ID 序列 // SSR
时服务端和客户端使用相同的计数器
```

### 4. `defineModel()` 改进

```vue
<!-- 子组件：MyInput.vue -->
<script setup lang="ts">
import { defineModel } from 'vue'

// Vue 3.4+：简化 v-model 双向绑定
// 旧方式（Vue 3.0-3.3）
// const props = defineProps<{ modelValue: string }>();
// const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
// const value = computed({
//   get: () => props.modelValue,
//   set: (v) => emit('update:modelValue', v),
// });

// 新方式：defineModel 一行搞定
const model = defineModel<string>({ required: true })
// model 是一个 ref，读写自动同步到父组件

// 多个 v-model
const title = defineModel<string>('title')
const count = defineModel<number>('count', { default: 0 })
</script>

<template>
  <input v-model="model" />
</template>

<!-- 父组件 -->
<template>
  <MyInput v-model="name" v-model:title="title" v-model:count="count" />
</template>
```

### 5. 编译器改进

```
Vue 3.5 编译器优化：

1. 更好的静态分析
   ├── 识别更多可提升为静态的内容
   ├── 更精确的补丁标记（PatchFlags）
   └── 改进的树摇支持

2. Vapor Mode 编译器（实验性）
   ├── 模板编译为直接 DOM 操作（无 VDOM）
   ├── 响应式追踪在编译时确定
   └── 性能接近 SolidJS

3. CSS v-bind 改进
   ├── 支持更复杂的表达式
   ├── 性能优化（减少 CSS 变量更新次数）
   └── 支持 JS 函数调用
```

```vue
<script setup>
import { ref } from 'vue'

const color = ref('red')
const size = ref(16)

// CSS v-bind：响应式绑定到 CSS
// Vue 3.5 支持更复杂的表达式
const fontSize = computed(() => `${size.value}px`)
</script>

<style scoped>
.text {
  color: v-bind(color);
  font-size: v-bind(fontSize);
}
</style>
```

### 6. SSR 流式渲染改进

```typescript
// Vue 3.5 SSR 流式渲染
import { createSSRApp, defineAsyncComponent } from 'vue'
import { renderToStream } from 'vue/server'

const app = createSSRApp({
  components: {
    // 异步组件 + Suspense = 流式 SSR
    SlowComponent: defineAsyncComponent(() => import('./SlowComponent.vue')),
  },
  template: `
    <div>
      <Header />
      <Suspense>
        <SlowComponent />
      </Suspense>
    </div>
  `,
})

// renderToStream：HTML 分块发送
// Header 立即发送，SlowComponent 数据就绪后流式追加
const stream = renderToStream(app)
stream.pipe(res)

// Vue 3.5 改进：
// ├── 流式 SSR 性能提升 ~30%
// ├── 更好的 hydration 错误提示
// └── 支持选择性 hydration（按需激活交互）
```

---

## 高频面试题

### Q1: Vue 3.5 响应式重构的核心变化是什么？

**参考答案要点**：

- 从 class-based 改为 function-based 实现
- 使用位运算标记替代 Set 操作（依赖收集更快）
- 内存减少 ~30%，大型响应式数组更新速度提升 ~40%
- 为 Vapor Mode 提供更底层的支持
- API 完全向后兼容

### Q2: `useTemplateRef()` 比 `ref()` 好在哪里？

**参考答案要点**：

- 精确的类型推断（基于模板中的元素类型）
- 与模板 ref 名称绑定（编译时检查）
- 避免手动类型断言
- SSR 安全的 ref 管理

### Q3: `defineModel()` 的实现原理？

**参考答案要点**：

- 编译宏（编译时转换为 props + emit）
- 返回一个 ref，读写自动同步
- 内部通过 `computed` getter/setter 实现
- 支持多个 v-model（通过参数名区分）
- 支持 `required` 和 `default` 选项

---

## 延伸思考

1. **设计题**：如何将 Vue 3.3 项目迁移到 3.5+（defineModel、useTemplateRef）？
2. **场景题**：Vapor Mode 和传统 Vue 3 可以混合使用吗？如何渐进迁移？
3. **对比题**：Vue 的 `useId()` vs React 的 `useId()`，实现差异？

---

## 参考资料

- [Vue 3.5 Release Notes](https://github.com/vuejs/core/releases)
- [Vue 3.5 响应式重构 RFC](https://github.com/vuejs/rfcs/pull/432)
- [defineModel RFC](https://github.com/vuejs/rfcs/pull/503)
- [Vapor Mode](https://github.com/vuejs/core-vapor)
