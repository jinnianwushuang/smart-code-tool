---
title: "Vue 组件模式：Props、Emit、Slots [P4-P5]"
level: "junior"
tags: ["Vue 3", "Props", "Emit", "Slots", "组件通信"]
difficulty: "medium"
updated: "2026-09-10"
target: "P4-P5 初级工程师"
---

# Vue 组件模式：Props、Emit、Slots [P4-P5]

> 组件通信是 Vue 开发的核心技能。Props 向下传数据，Emit 向上发事件，Slots 分发内容。

## 核心概念（What）

### Props（父→子）

```vue
<!-- 子组件 -->
<script setup>
const props = defineProps({
  title: String,                    // 简单声明
  count: { type: Number, default: 0 }, // 带默认值
  status: {
    type: String,
    required: true,                 // 必填
    validator: (v) => ['active', 'inactive'].includes(v) // 自定义验证
  }
});
</script>

<!-- 父组件 -->
<MyComponent title="Hello" :count="5" status="active" />
```

### Emit（子→父）

```vue
<!-- 子组件 -->
<script setup>
const emit = defineEmits(['update', 'delete']);

function handleSave() {
  emit('update', { id: 1, name: 'updated' });
}
</script>

<template>
  <button @click="handleSave">保存</button>
</template>

<!-- 父组件 -->
<MyComponent @update="handleUpdate" @delete="handleDelete" />
```

### Slots（内容分发）

```vue
<!-- 子组件 Card.vue -->
<template>
  <div class="card">
    <header><slot name="header">默认标题</slot></header>
    <main><slot>默认内容</slot></main>
    <footer><slot name="footer" :data="cardData">默认底部</slot></footer>
  </div>
</template>

<!-- 父组件 -->
<Card>
  <template #header>
    <h2>自定义标题</h2>
  </template>
  <p>卡片内容</p>
  <template #footer="{ data }">
    <span>{{ data.title }}</span>
  </template>
</Card>
```

---

## 常见面试题

### Q1: Props 是单向数据流吗？

**答**：是。子组件不能直接修改 Props，应该通过 Emit 通知父组件修改。

### Q2: 什么是作用域插槽？

**答**：子组件通过 slot 向父组件传递数据，父组件在模板中访问。用于自定义子组件内部渲染。

### Q3: v-model 在组件上怎么用？

**答**：`v-model` 等价 `:modelValue` + `@update:modelValue`。子组件用 `defineModel()` 或 `defineProps(['modelValue'])` + `defineEmits(['update:modelValue'])`。

---

## 延伸练习

1. 创建一个 Button 组件，支持 type/size Props
2. 创建一个 Dialog 组件，用 Emit 通知关闭
3. 创建一个 Card 组件，用 Slot 分发标题和内容

---

## 参考资料

- [Vue 组件基础](https://cn.vuejs.org/guide/essentials/component-basics.html)
- [事件](https://cn.vuejs.org/guide/components/events.html)
