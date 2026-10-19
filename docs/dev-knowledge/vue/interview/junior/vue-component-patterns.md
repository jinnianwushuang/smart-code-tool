---
title: 'Vue 组件模式：Props、Emit、Slots [P4-P5]'
level: 'junior'
tags: ['Vue 3', 'Props', 'Emit', 'Slots', '组件通信']
difficulty: 'medium'
target: 'P4-P5 初级工程师'
---

# Vue 组件模式：Props、Emit、Slots [P4-P5]

> 组件通信是 Vue 开发的核心技能。Props 向下传数据，Emit 向上发事件，Slots 分发内容。

## 核心概念（What）

### Props（父→子）

```vue
<!-- 子组件 -->
<script setup>
const props = defineProps({
  title: String, // 简单声明
  count: { type: Number, default: 0 }, // 带默认值
  status: {
    type: String,
    required: true, // 必填
    validator: (v) => ['active', 'inactive'].includes(v), // 自定义验证
  },
})
</script>

<!-- 父组件 -->
<MyComponent title="Hello" :count="5" status="active" />
```

### Emit（子→父）

```vue
<!-- 子组件 -->
<script setup>
const emit = defineEmits(['update', 'delete'])

function handleSave() {
  emit('update', { id: 1, name: 'updated' })
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

## 底层原理（Why）

### Vue 组件通信与插槽底层机制

```
Vue 组件模式的底层原理：

  1. Props 单向数据流的底层实现：
     ├── 父组件更新 props → 子组件自动接收新值
     ├── 子组件不能直接修改 props（Vue 会警告）
     ├── 原因：保证数据流向可预测（父 → 子）
     └── 解决方案：
         ├── 子组件需要修改时，用 emit 通知父组件
         └── 或者用 computed 基于 props 计算新值

  2. 事件发射（emit）的底层机制：
     ├── 子组件通过 $emit() 触发自定义事件
     ├── 父组件通过 v-on 监听事件
     ├── 底层实现：
     │   ├── 组件实例维护一个事件监听器映射
     │   └── $emit 时查找并执行对应的回调
     └── 可以传递参数：$emit('update', newValue)

  3. 插槽（Slots）的编译原理：
     ├── 默认插槽：<slot></slot> 作为占位符
     ├── 具名插槽：<slot name="header"></slot>
     ├── 作用域插槽：
     │   ├── 插槽内容可以访问子组件的数据
     │   └── <slot :user="user"></slot>
     └── 编译过程：
         ├── 父组件模板中的插槽内容被编译为函数
         └── 子组件调用插槽函数渲染内容

  4. 组件生命周期的底层触发时机：
     ├── setup()：组件实例创建后，响应式初始化前
     ├── onMounted：组件挂载到 DOM 后
     ├── onUpdated：响应式数据变化导致重渲染后
     ├── onUnmounted：组件从 DOM 卸载后
     └── 关键：生命周期钩子按组件树顺序触发
         ├── 挂载：父 → 子
         └── 卸载：子 → 父
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
