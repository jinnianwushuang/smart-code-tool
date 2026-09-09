---
title: "Vue 组件通信方式全景 [P5-P6]"
level: "intermediate"
tags: ["Vue 3", "组件通信", "Props", "Emit", "Provide/Inject"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# Vue 组件通信方式全景 [P5-P6]

> Vue 提供多种组件通信方式。理解每种方式的适用场景，才能设计出清晰的组件关系。

## 核心概念（What）

### 组件通信方式

```
通信方式分类：

父子通信：
├── Props / Emit → 最常用
├── v-model → 双向绑定
├── $parent / $children → 直接访问（不推荐）
└── ref → 获取组件实例

跨级通信：
├── Provide / Inject → 依赖注入
├── $attrs → 透传属性
└── EventBus → 事件总线（Vue 3 移除）

全局状态：
├── Vuex → 官方状态管理
├── Pinia → 新一代状态管理（推荐）
└── 全局变量 → window（不推荐）

其他：
├── Slot → 内容分发
└── mitt → 事件库（替代 EventBus）
```

## 底层原理（Why）

### Props / Emit

```vue
<!-- 父组件 -->
<template>
  <ChildComponent 
    :title="parentTitle" 
    :count="parentCount"
    @update="handleUpdate"
  />
</template>

<script setup>
import { ref } from 'vue';
import ChildComponent from './ChildComponent.vue';

const parentTitle = ref('Hello');
const parentCount = ref(0);

function handleUpdate(newCount) {
  parentCount.value = newCount;
}
</script>

<!-- 子组件 -->
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>Count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update']);

function increment() {
  emit('update', props.count + 1);
}
</script>
```

### v-model

```vue
<!-- 父组件 -->
<template>
  <CustomInput v-model="searchText" />
  <!-- 等价于 -->
  <CustomInput 
    :modelValue="searchText" 
    @update:modelValue="searchText = $event" 
  />
</template>

<script setup>
import { ref } from 'vue';

const searchText = ref('');
</script>

<!-- 子组件 -->
<template>
  <input 
    :value="modelValue" 
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

defineEmits(['update:modelValue']);
</script>

<!-- 多个 v-model -->
<template>
  <UserName 
    v-model:firstName="first" 
    v-model:lastName="last" 
  />
</template>

<!-- 子组件 -->
<script setup>
defineProps(['firstName', 'lastName']);
defineEmits(['update:firstName', 'update:lastName']);
</script>
```

### Provide / Inject

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue';

const theme = ref('dark');
const user = ref({ name: 'Alice' });

// 提供数据
provide('theme', theme);
provide('user', user);
</script>

<!-- 后代组件（任意层级） -->
<script setup>
import { inject } from 'vue';

// 注入数据
const theme = inject('theme');
const user = inject('user');

// 带默认值
const locale = inject('locale', 'zh-CN');

// 响应式
console.log(theme.value); // 'dark'
</script>

<!-- TypeScript 支持 -->
// symbols.ts
export const themeKey = Symbol('theme');

// 祖先组件
import { provide } from 'vue';
import { themeKey } from './symbols';

provide(themeKey, ref('dark'));

// 后代组件
import { inject } from 'vue';
import { themeKey } from './symbols';

const theme = inject(themeKey);
```

### $attrs

```vue
<!-- 父组件 -->
<template>
  <ChildComponent class="parent-class" data-id="123" />
</template>

<!-- 子组件 -->
<template>
  <div class="child" v-bind="$attrs">
    <!-- $attrs 包含 class、style、data-*、事件等 -->
  </div>
</template>

<script setup>
import { useAttrs } from 'vue';

const attrs = useAttrs();
console.log(attrs); // { class: 'parent-class', 'data-id': '123' }
</script>

<!-- 禁用自动继承 -->
<script setup>
defineOptions({
  inheritAttrs: false
});
</script>
```

### Slot（内容分发）

```vue
<!-- 父组件 -->
<template>
  <CardComponent>
    <template #header>
      <h1>标题</h1>
    </template>
    
    <p>默认插槽内容</p>
    
    <template #footer>
      <button>操作</button>
    </template>
  </CardComponent>
</template>

<!-- 子组件 -->
<template>
  <div class="card">
    <div class="header">
      <slot name="header">默认标题</slot>
    </div>
    
    <div class="content">
      <slot>默认内容</slot>
    </div>
    
    <div class="footer">
      <slot name="footer">默认底部</slot>
    </div>
  </div>
</template>

<!-- 作用域插槽 -->
<!-- 父组件 -->
<template>
  <ListComponent :items="items">
    <template #default="{ item, index }">
      <div>{{ index }}: {{ item.name }}</div>
    </template>
  </ListComponent>
</template>

<!-- 子组件 -->
<template>
  <ul>
    <li v-for="(item, index) in items" :key="item.id">
      <slot :item="item" :index="index">
        {{ item.name }}
      </slot>
    </li>
  </ul>
</template>
```

## 实战应用（How）

### 通信方式选择

```
场景 → 方式：

父子组件：
├── 父→子 → Props
├── 子→父 → Emit
├── 双向绑定 → v-model
└── 访问子组件 → ref

跨级组件：
├── 祖先→后代 → Provide / Inject
├── 透传属性 → $attrs
└── 兄弟组件 → Pinia / EventBus

全局状态：
├── 小型应用 → Provide / Inject
├── 中型应用 → Pinia（推荐）
└── 大型应用 → Pinia + 模块化

推荐：
├── 简单场景 → Props / Emit
├── 跨级场景 → Provide / Inject
├── 复杂状态 → Pinia
└── 事件通信 → mitt
```

### mitt 事件总线

```javascript
// 安装：npm install mitt
import mitt from 'mitt';

const emitter = mitt();

// 监听事件
emitter.on('user-login', (user) => {
  console.log('用户登录:', user);
});

// 发送事件
emitter.emit('user-login', { name: 'Alice' });

// 监听所有事件
emitter.all.on('*', (type, value) => {
  console.log(type, value);
});

// 取消监听
emitter.off('user-login');

// Vue 中使用
// eventBus.js
import mitt from 'mitt';
export const bus = mitt();

// 组件 A
import { bus } from './eventBus';
bus.emit('update-cart', itemCount);

// 组件 B
import { bus } from './eventBus';
import { onUnmounted } from 'vue';

bus.on('update-cart', (count) => {
  console.log('购物车数量:', count);
});

onUnmounted(() => {
  bus.off('update-cart'); // 清理
});
```

## 高频面试题

### Q1: Vue 组件通信有哪些方式？

```
父子通信：
├── Props / Emit → 最常用
├── v-model → 双向绑定
└── ref → 获取实例

跨级通信：
├── Provide / Inject → 依赖注入
├── $attrs → 透传属性
└── mitt → 事件总线

全局状态：
├── Pinia → 推荐
└── Vuex → 旧版
```

### Q2: Provide / Inject 的使用场景？

```
场景：
├── 主题切换（全局主题）
├── 用户信息（登录状态）
├── 国际化（语言配置）
└── 表单验证（共享验证器）

优势：
├── 解耦组件（不需要逐层传递）
├── 响应式（自动更新）
└── TypeScript 支持

注意：
├── 不要滥用（只在必要时使用）
├── 明确数据来源
└── 配合 Symbol 使用
```

### Q3: v-model 的原理？

```
原理：
├── 语法糖
├── :modelValue + @update:modelValue
└── 支持多个 v-model

示例：
<!-- 父组件 -->
<Input v-model="text" />
<!-- 等价于 -->
<Input 
  :modelValue="text" 
  @update:modelValue="text = $event" 
/>

多个 v-model：
<UserName v-model:firstName="first" v-model:lastName="last" />
```

## 延伸思考

1. 如何设计组件的 Props API？
2. Provide / Inject 的内存泄漏问题？
3. Pinia 和 Vuex 的区别？

## 参考资料

- [Vue 3 组件通信](https://vuejs.org/guide/components/props.html)
- [Provide / Inject](https://vuejs.org/guide/components/provide-inject.html)
