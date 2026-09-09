---
title: "Vue 3 入门：模板、组件、生命周期 [P4-P5]"
level: "junior"
tags: ["Vue 3", "模板语法", "组件", "生命周期"]
difficulty: "medium"
updated: "2026-09-10"
target: "P4-P5 初级工程师"
---

# Vue 3 入门：模板、组件、生命周期 [P4-P5]

> Vue 3 是渐进式 JavaScript 框架，通过声明式模板和组件化开发，让构建用户界面变得简单。

## 核心概念（What）

### 模板语法

```vue
<!-- 文本插值 -->
<p>{{ message }}</p>

<!-- 属性绑定 -->
<img :src="imageUrl">
<div :class="{ active: isActive }">

<!-- 事件绑定 -->
<button @click="handleClick">点击</button>
<input @input="handleInput">

<!-- 双向绑定 -->
<input v-model="text">

<!-- 条件渲染 -->
<p v-if="score >= 90">优秀</p>
<p v-else-if="score >= 60">及格</p>
<p v-else>不及格</p>

<!-- 列表渲染 -->
<li v-for="item in items" :key="item.id">
  {{ item.name }}
</li>
```

### 组合式 API（推荐）

```vue
<script setup>
import { ref, computed, watch } from 'vue';

// 响应式数据
const count = ref(0);
const name = ref('Alice');

// 计算属性
const doubleCount = computed(() => count.value * 2);

// 方法
function increment() {
  count.value++;
}

// 侦听器
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} → ${newVal}`);
});
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
  count: { type: Number, default: 0 }
});

const emit = defineEmits(['update', 'delete']);
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
import ChildComponent from './ChildComponent.vue';
const msg = ref('Hello');
</script>

<template>
  <ChildComponent
    title="我的组件"
    :count="5"
    @update="handleUpdate"
  />
</template>
```

### 生命周期

```vue
<script setup>
import { onMounted, onUpdated, onUnmounted } from 'vue';

// 组件挂载后（DOM 可用）
onMounted(() => {
  console.log('组件已挂载');
  // 获取 DOM、发起网络请求
});

// 响应式数据变化后
onUpdated(() => {
  console.log('组件已更新');
});

// 组件卸载前（清理）
onUnmounted(() => {
  console.log('组件即将卸载');
  // 清除定时器、取消事件监听
});
</script>

<!-- 生命周期顺序：
  创建 → onBeforeMount → onMounted
  更新 → onBeforeUpdate → onUpdated
  销毁 → onBeforeUnmount → onUnmounted
-->
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
