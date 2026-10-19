---
title: 'Vue 3 入门：模板、组件、生命周期 [P4-P5]'
level: 'junior'
tags: ['Vue 3', '模板语法', '组件', '生命周期']
difficulty: 'medium'
target: 'P4-P5 初级工程师'
---

# Vue 3 入门：模板、组件、生命周期 [P4-P5]

> Vue 3 是渐进式 JavaScript 框架，通过声明式模板和组件化开发，让构建用户界面变得简单。

## 核心概念（What）

### 模板语法

```vue
<!-- 文本插值 -->
<p>{{ message }}</p>

<!-- 属性绑定 -->
<img :src="imageUrl" />
```

### 组合式 API（推荐）

```vue
<script setup>
import { ref, computed, watch } from 'vue'

// 响应式数据
const count = ref(0)
const name = ref('Alice')

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}

// 侦听器
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} → ${newVal}`)
})
</script>

<template>
  <p>Count: {{ count }} (double: {{ doubleCount }})</p>
  <button @click="increment">+1</button>
</template>
```

### 组件基础

```vue
<!-- ChildComponent.vue -->
<script setup>
const props = defineProps({
  title: String,
  count: { type: Number, default: 0 },
})

const emit = defineEmits(['update', 'delete'])
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <p>Count: {{ count }}</p>
    <button @click="emit('update')">更新</button>
  </div>
</template>

<!-- 使用组件 -->
<script setup>
import ChildComponent from './ChildComponent.vue'
const msg = ref('Hello')
</script>

<template>
  <ChildComponent title="我的组件" :count="5" @update="handleUpdate" />
</template>
```

### 生命周期

```vue
<script setup>
import { onMounted, onUpdated, onUnmounted } from 'vue'

// 组件挂载后（DOM 可用）
onMounted(() => {
  console.log('组件已挂载')
  // 获取 DOM、发起网络请求
})

// 响应式数据变化后
onUpdated(() => {
  console.log('组件已更新')
})

// 组件卸载前（清理）
onUnmounted(() => {
  console.log('组件即将卸载')
  // 清除定时器、取消事件监听
})
</script>

<!-- 生命周期顺序：
  创建 → onBeforeMount → onMounted
  更新 → onBeforeUpdate → onUpdated
  销毁 → onBeforeUnmount → onUnmounted
-->
```

---

## 底层原理（Why）

### Vue 响应式系统底层机制

```
Vue 3 的底层原理：

  1. 响应式系统（Reactivity System）的本质：
     ├── Vue 2：Object.defineProperty()
     │   ├── 劫持对象属性的 getter/setter
     │   ├── 缺点：无法检测新增/删除属性
     │   └── 需要 Vue.set() 手动触发
     ├── Vue 3：Proxy
     │   ├── 代理整个对象（可以拦截所有操作）
     │   ├── 支持新增/删除属性的检测
     │   ├── 支持数组索引和长度变化
     │   └── 性能更好（懒代理，只在访问时创建）
     └── 核心概念：
         ├── reactive()：创建响应式对象
         ├── ref()：创建响应式基本类型
         ├── effect()：注册副作用函数
         └── track/trigger：依赖收集与触发更新

  2. 虚拟 DOM（Virtual DOM）的原理：
     ├── 什么是虚拟 DOM：
     │   └── 用 JavaScript 对象描述真实 DOM 结构
     ├── 为什么需要虚拟 DOM：
     │   ├── 真实 DOM 操作很慢（触发重排/重绘）
     │   ├── 虚拟 DOM 操作很快（纯 JavaScript 对象）
     │   └── 通过 Diff 算法最小化真实 DOM 操作
     └── Diff 算法：
         ├── 同层比较（不跨层）
         ├── 通过 key 优化列表 Diff
         └── 时间复杂度 O(n)

  3. 组件更新机制：
     ├── 响应式依赖追踪：
     │   ├── 组件渲染时收集用到的响应式数据
     │   └── 数据变化时只重新渲染依赖它的组件
     ├── 异步更新队列：
     │   ├── 数据变化不会立即更新 DOM
     │   ├── 而是放入微任务队列
     │   └── 下一个“事件循环”批量更新
     └── nextTick()：
         └── 在 DOM 更新完成后执行回调

  4. 模板编译原理：
     ├── 模板 → 渲染函数 → 虚拟 DOM → 真实 DOM
     ├── 编译时优化：
     │   ├── 静态提升（Static Hoisting）：静态节点只创建一次
     │   ├── 补丁标记（Patch Flags）：标记动态节点类型
     │   └── 树摇（Tree Shaking）：移除未使用的代码
     └── 运行时优化：
         └── 根据补丁标记快速定位需要更新的节点
```

---

## 常见面试题

### Q1: Vue 的 v-if 和 v-show 的区别？

**答**：

- `v-if`：真正销毁/创建元素（切换开销大）
- `v-show`：切换 CSS display（初始开销大）
- 频繁切换用 `v-show`，条件很少变化用 `v-if`

### Q2: ref 和 reactive 的区别？

**答**：

- `ref`：包装任意值，通过 `.value` 访问
- `reactive`：包装对象/数组，直接访问属性
- 简单值用 `ref`，对象用 `reactive` 或 `ref` 都可以

### Q3: 组件之间如何传递数据？

**答**：

- 父→子：Props
- 子→父：Emit 事件
- 跨层级：provide/inject
- 全局：Pinia

---

## 延伸练习

1. 创建一个计数器组件（ref + 按钮）
2. 用 v-for 渲染一个列表
3. 创建父子组件，实现 Props 传递和 Emit 通信

---

## 参考资料

- [Vue 3 官方文档](https://cn.vuejs.org)
- [组合式 API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
