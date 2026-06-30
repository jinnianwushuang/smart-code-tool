# Vue 3 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: Vue.js 开发者、前端工程师

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、响应式系统](#二响应式系统)
- [三、组件基础](#三组件基础)
- [四、组合式 API](#四组合式-api)
- [五、生命周期](#五生命周期)
- [六、计算属性和侦听器](#六计算属性和侦听器)
- [七、模板语法](#七模板语法)
- [八、指令](#八指令)
- [九、事件处理](#九事件处理)
- [十、表单输入绑定](#十表单输入绑定)
- [十一、组件通信](#十一组件通信)
- [十二、插槽](#十二插槽)
- [十三、依赖注入](#十三依赖注入)
- [十四、异步组件](#十四异步组件)
- [十五、状态管理](#十五状态管理)
- [十六、路由](#十六路由)
- [十七、最佳实践](#十七最佳实践)

---

## 一、基础概念

### 1.1 创建应用

```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

### 1.2 单文件组件 (SFC)

```vue
<template>
  <div class="hello">
    <h1>{{ message }}</h1>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello Vue 3!')
</script>

<style scoped>
.hello {
  color: red;
}
</style>
```

### 1.3 响应式数据

```javascript
import { ref, reactive } from 'vue'

// ref - 基本类型
const count = ref(0)
console.log(count.value) // 访问需要 .value

// reactive - 对象类型
const state = reactive({
  name: 'Vue',
  version: '3.x',
})
console.log(state.name) // 直接访问
```

---

## 二、响应式系统

### 2.1 ref

```javascript
import { ref } from 'vue'

const count = ref(0)
count.value++

// 自动解包（在模板中）
// {{ count }} 不需要 .value

// ref 对象对象
const obj = ref({ count: 0 })
obj.value.count++
```

### 2.2 reactive

```javascript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  name: 'Vue',
})

state.count++

// 注意：解构会丢失响应性
// const { count } = state // ❌
const { count } = toRefs(state) // ✅
```

### 2.3 toRef / toRefs

```javascript
import { reactive, toRef, toRefs } from 'vue'

const state = reactive({
  foo: 1,
  bar: 2,
})

// toRef - 单个属性
const fooRef = toRef(state, 'foo')

// toRefs - 所有属性
const { foo, bar } = toRefs(state)
```

### 2.4 shallowRef / shallowReactive

```javascript
import { shallowRef, shallowReactive } from 'vue'

// 只追踪第一层
const shallow = shallowRef({ count: 0 })
shallow.value = { count: 1 } // 触发更新
shallow.value.count++ // 不触发更新

const shallowObj = shallowReactive({ nested: { count: 0 } })
shallowObj.nested.count++ // 不触发更新
```

### 2.5 readonly

```javascript
import { reactive, readonly } from 'vue'

const original = reactive({ count: 0 })
const copy = readonly(original)

copy.count++ // 警告！只读
```

---

## 三、组件基础

### 3.1 组件定义

```vue
<!-- Child.vue -->
<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: String,
  count: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update', 'delete'])

function handleClick() {
  emit('update', props.count + 1)
}
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <p>{{ count }}</p>
    <button @click="handleClick">Increment</button>
  </div>
</template>
```

### 3.2 使用组件

```vue
<!-- Parent.vue -->
<script setup>
import Child from './Child.vue'
import { ref } from 'vue'

const count = ref(0)

function handleUpdate(newCount) {
  count.value = newCount
}
</script>

<template>
  <Child title="Counter" :count="count" @update="handleUpdate" />
</template>
```

### 3.3 组件注册

```javascript
// 全局注册
import ComponentA from './ComponentA.vue'
app.component('ComponentA', ComponentA)

// 局部注册（推荐）
import ComponentB from './ComponentB.vue'
// 在 <script setup> 中直接使用
```

---

## 四、组合式 API

### 4.1 setup 语法糖

```vue
<script setup>
import { ref, computed, watch } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

watch(count, (newVal) => {
  console.log('Count changed:', newVal)
})
</script>
```

### 4.2 setup 函数

```javascript
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup(props, context) {
    const count = ref(0)

    return {
      count,
    }
  },
})
```

### 4.3 自定义 Composable

```javascript
// useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const double = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = initialValue
  }

  return {
    count,
    double,
    increment,
    decrement,
    reset,
  }
}

// 使用
import { useCounter } from './useCounter'

const { count, double, increment } = useCounter(10)
```

### 4.4 常用 Composables

```javascript
// useFetch.js
import { ref, watch } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  async function fetchData() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(url)
      data.value = await response.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  watch(() => url, fetchData, { immediate: true })

  return {
    data,
    error,
    loading,
    refetch: fetchData,
  }
}
```

---

## 五、生命周期

### 5.1 生命周期钩子

```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
} from 'vue'

onBeforeMount(() => {
  console.log('before mount')
})

onMounted(() => {
  console.log('mounted')
})

onBeforeUpdate(() => {
  console.log('before update')
})

onUpdated(() => {
  console.log('updated')
})

onBeforeUnmount(() => {
  console.log('before unmount')
})

onUnmounted(() => {
  console.log('unmounted')
})

onErrorCaptured((error, instance, info) => {
  console.error('Error captured:', error)
})
```

### 5.2 生命周期对比

```
Options API          Composition API
beforeCreate         setup()
created              setup()
beforeMount          onBeforeMount
mounted              onMounted
beforeUpdate         onBeforeUpdate
updated              onUpdated
beforeUnmount        onBeforeUnmount
unmounted            onUnmounted
errorCaptured        onErrorCaptured
```

---

## 六、计算属性和侦听器

### 6.1 computed

```javascript
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 只读计算属性
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})

// 可写计算属性
const fullNameWritable = computed({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(value) {
    const [first, last] = value.split(' ')
    firstName.value = first
    lastName.value = last
  },
})
```

### 6.2 watch

```javascript
import { ref, watch } from 'vue'

const count = ref(0)

// 侦听单个 ref
watch(count, (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`)
})

// 侦听多个源
watch([count, otherRef], ([newCount, newOther], [oldCount, oldOther]) => {
  console.log('Multiple sources changed')
})

// 侦听 reactive 对象
const state = reactive({ count: 0 })
watch(
  () => state.count,
  (newCount) => {
    console.log('State count changed:', newCount)
  },
)

// 选项
watch(source, callback, {
  immediate: true, // 立即执行
  deep: true, // 深度侦听
  flush: 'post', // 'pre' | 'post' | 'sync'
})
```

### 6.3 watchEffect

```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)

watchEffect(() => {
  console.log('Count is:', count.value)
  // 自动追踪依赖
})

// 停止侦听
const stop = watchEffect(() => {
  console.log(count.value)
})

stop()
```

---

## 七、模板语法

### 7.1 插值

```vue
<template>
  <!-- 文本插值 -->
  <p>{{ message }}</p>

  <!-- HTML 插值（谨慎使用） -->
  <div v-html="rawHtml"></div>

  <!-- 属性绑定 -->
  <div :id="dynamicId"></div>
  <button :disabled="isDisabled">Click</button>

  <!-- 简写 -->
  <div id="static" :class="dynamicClass"></div>
</template>
```

### 7.2 条件渲染

```vue
<template>
  <!-- v-if -->
  <div v-if="type === 'A'">A</div>
  <div v-else-if="type === 'B'">B</div>
  <div v-else>C</div>

  <!-- v-show -->
  <div v-show="isVisible">Visible</div>
</template>
```

### 7.3 列表渲染

```vue
<template>
  <!-- 基本列表 -->
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </ul>

  <!-- 带索引 -->
  <ul>
    <li v-for="(item, index) in items" :key="index">{{ index }}: {{ item.name }}</li>
  </ul>

  <!-- 对象遍历 -->
  <ul>
    <li v-for="(value, key, index) in object" :key="key">{{ key }}: {{ value }}</li>
  </ul>

  <!-- 范围 -->
  <span v-for="n in 10">{{ n }}</span>
</template>
```

### 7.4 动态组件

```vue
<template>
  <component :is="currentComponent" />
</template>

<script setup>
import { ref, markRaw } from 'vue'
import ComponentA from './ComponentA.vue'
import ComponentB from './ComponentB.vue'

const currentComponent = ref(ComponentA)
</script>
```

---

## 八、指令

### 8.1 内置指令

```vue
<template>
  <!-- v-bind -->
  <div :class="className"></div>

  <!-- v-on -->
  <button @click="handleClick">Click</button>

  <!-- v-model -->
  <input v-model="message" />

  <!-- v-show -->
  <div v-show="visible">Content</div>

  <!-- v-if -->
  <div v-if="condition">Content</div>

  <!-- v-for -->
  <div v-for="item in items" :key="item.id">{{ item }}</div>

  <!-- v-text -->
  <span v-text="message"></span>

  <!-- v-html -->
  <div v-html="rawHtml"></div>

  <!-- v-pre -->
  <div v-pre>{{ this will not be compiled }}</div>

  <!-- v-once -->
  <div v-once>{{ staticContent }}</div>

  <!-- v-cloak -->
  <div v-cloak>{{ message }}</div>
</template>
```

### 8.2 自定义指令

```javascript
// 全局注册
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 局部注册
const vFocus = {
  mounted: (el) => el.focus()
}

// 使用
<input v-focus />
```

### 8.3 指令钩子

```javascript
const myDirective = {
  created(el, binding, vnode) {
    // 元素创建时
  },
  beforeMount(el, binding, vnode) {
    // 挂载前
  },
  mounted(el, binding, vnode) {
    // 挂载后
  },
  beforeUpdate(el, binding, vnode, prevVnode) {
    // 更新前
  },
  updated(el, binding, vnode, prevVnode) {
    // 更新后
  },
  beforeUnmount(el, binding, vnode) {
    // 卸载前
  },
  unmounted(el, binding, vnode) {
    // 卸载后
  },
}
```

---

## 九、事件处理

### 9.1 事件监听

```vue
<template>
  <!-- 基本用法 -->
  <button @click="handleClick">Click</button>

  <!-- 内联语句 -->
  <button @click="count++">Increment</button>

  <!-- 方法调用 -->
  <button @click="greet('Hello')">Greet</button>

  <!-- 事件对象 -->
  <button @click="handleEvent($event)">Event</button>
</template>

<script setup>
function handleClick() {
  console.log('Clicked')
}

function greet(message) {
  console.log(message)
}

function handleEvent(event) {
  console.log(event.target)
}
</script>
```

### 9.2 事件修饰符

```vue
<template>
  <!-- 阻止冒泡 -->
  <button @click.stop="handleClick">Stop Propagation</button>

  <!-- 阻止默认行为 -->
  <a @click.prevent="handleClick">Prevent Default</a>

  <!-- 串联修饰符 -->
  <a @click.stop.prevent="handleClick">Both</a>

  <!-- 仅一次 -->
  <button @click.once="handleClick">Once</button>

  <!-- 捕获模式 -->
  <div @click.capture="handleClick">Capture</div>

  <!-- 自元素 -->
  <div @click.self="handleClick">Self</div>

  <!-- 按键修饰符 -->
  <input @keyup.enter="handleSubmit" />
  <input @keyup.esc="handleCancel" />
  <input @keyup.tab="handleTab" />
  <input @keyup.delete="handleDelete" />

  <!-- 鼠标修饰符 -->
  <button @click.left="handleLeft">Left Click</button>
  <button @click.right="handleRight">Right Click</button>
  <button @click.middle="handleMiddle">Middle Click</button>
</template>
```

### 9.3 按键修饰符

```vue
<template>
  <!-- 系统修饰键 -->
  <input @keyup.alt.enter="handleAltEnter" />
  <input @keyup.ctrl.s="handleSave" />
  <input @keyup.shift.caps-lock="handleShiftCaps" />

  <!-- exact 修饰符 -->
  <button @click.exact="handleExact">Exact</button>
</template>
```

---

## 十、表单输入绑定

### 10.1 基本用法

```vue
<template>
  <!-- 文本 -->
  <input v-model="message" />

  <!-- 多行文本 -->
  <textarea v-model="multiline"></textarea>

  <!-- 复选框 -->
  <input type="checkbox" v-model="checked" />

  <!-- 多个复选框 -->
  <input type="checkbox" value="A" v-model="checkedNames" />
  <input type="checkbox" value="B" v-model="checkedNames" />

  <!-- 单选按钮 -->
  <input type="radio" value="One" v-model="picked" />
  <input type="radio" value="Two" v-model="picked" />

  <!-- 选择框 -->
  <select v-model="selected">
    <option disabled value="">Please select</option>
    <option>A</option>
    <option>B</option>
  </select>

  <!-- 多选选择框 -->
  <select v-model="multiSelected" multiple>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('')
const multiline = ref('')
const checked = ref(false)
const checkedNames = ref([])
const picked = ref('')
const selected = ref('')
const multiSelected = ref([])
</script>
```

### 10.2 修饰符

```vue
<template>
  <!-- lazy - change 事件后同步 -->
  <input v-model.lazy="message" />

  <!-- number - 自动转换为数字 -->
  <input v-model.number="age" type="number" />

  <!-- trim - 自动去除首尾空格 -->
  <input v-model.trim="message" />
</template>
```

---

## 十一、组件通信

### 11.1 Props

```vue
<!-- Child.vue -->
<script setup>
const props = defineProps({
  title: String,
  count: {
    type: Number,
    required: true,
    default: 0,
    validator(value) {
      return value >= 0
    },
  },
})
</script>
```

### 11.2 Emit

```vue
<!-- Child.vue -->
<script setup>
const emit = defineEmits(['update:modelValue', 'change'])

function updateValue(value) {
  emit('update:modelValue', value)
}

function handleChange() {
  emit('change', { status: 'changed' })
}
</script>
```

### 11.3 v-model

```vue
<!-- Parent.vue -->
<template>
  <Child v-model="value" />
  <Child v-model:title="title" v-model:count="count" />
</template>

<!-- Child.vue -->
<script setup>
defineProps(['modelValue', 'title', 'count'])
defineEmits(['update:modelValue', 'update:title', 'update:count'])
</script>
```

### 11.4 provide / inject

```vue
<!-- Parent.vue -->
<script setup>
import { provide, ref } from 'vue'

const theme = ref('dark')
provide('theme', theme)
</script>

<!-- Child.vue -->
<script setup>
import { inject } from 'vue'

const theme = inject('theme')
</script>
```

### 11.5 expose / ref

```vue
<!-- Child.vue -->
<script setup>
import { ref, defineExpose } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

defineExpose({
  count,
  increment,
})
</script>

<!-- Parent.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import Child from './Child.vue'

const childRef = ref(null)

onMounted(() => {
  childRef.value.increment()
  console.log(childRef.value.count)
})
</script>

<template>
  <Child ref="childRef" />
</template>
```

---

## 十二、插槽

### 12.1 默认插槽

```vue
<!-- Child.vue -->
<template>
  <div class="container">
    <slot></slot>
  </div>
</template>

<!-- Parent.vue -->
<Child>
  <p>Default slot content</p>
</Child>
```

### 12.2 具名插槽

```vue
<!-- Child.vue -->
<template>
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</template>

<!-- Parent.vue -->
<Child>
  <template #header>
    <h1>Header</h1>
  </template>
  
  <p>Main content</p>
  
  <template #footer>
    <p>Footer</p>
  </template>
</Child>
```

### 12.3 作用域插槽

```vue
<!-- Child.vue -->
<template>
  <ul>
    <li v-for="item in items">
      <slot :item="item"></slot>
    </li>
  </ul>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  items: Array,
})
</script>

<!-- Parent.vue -->
<Child :items="['A', 'B', 'C']">
  <template #default="{ item }">
    <span>{{ item }}</span>
  </template>
</Child>
```

---

## 十三、依赖注入

### 13.1 provide

```javascript
import { provide, ref } from 'vue'

// 提供值
provide('key', value)

// 提供响应式值
const theme = ref('dark')
provide('theme', theme)

// 提供方法
provide('addItem', (item) => {
  items.value.push(item)
})
```

### 13.2 inject

```javascript
import { inject } from 'vue'

// 注入值
const theme = inject('theme')

// 注入默认值
const user = inject('user', { name: 'Guest' })

// 注入工厂函数
const config = inject('config', () => ({
  /* default */
}))
```

---

## 十四、异步组件

### 14.1 defineAsyncComponent

```javascript
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() => {
  return import('./MyComponent.vue')
})

// 带选项
const AsyncCompWithOptions = defineAsyncComponent({
  loader: () => import('./MyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,
  timeout: 3000,
})
```

### 14.2 Suspense

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

---

## 十五、状态管理

### 15.1 Pinia

```javascript
// stores/counter.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

// 使用
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
counter.increment()
console.log(counter.count)
```

### 15.2 Vuex (Legacy)

```javascript
// store/index.js
import { createStore } from 'vuex'

export default createStore({
  state: {
    count: 0,
  },
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  mutations: {
    increment(state) {
      state.count++
    },
  },
  actions: {
    asyncIncrement({ commit }) {
      setTimeout(() => {
        commit('increment')
      }, 1000)
    },
  },
})
```

---

## 十六、路由

### 16.1 Vue Router

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  {
    path: '/user/:id',
    component: User,
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
```

### 16.2 导航

```vue
<template>
  <!-- 声明式导航 -->
  <router-link to="/">Home</router-link>
  <router-link :to="{ name: 'User', params: { id: 1 } }">User</router-link>

  <!-- 编程式导航 -->
  <button @click="goHome">Go Home</button>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

function goHome() {
  router.push('/')
  router.replace('/about')
  router.go(-1)
}

// 访问路由参数
console.log(route.params.id)
console.log(route.query.search)
</script>
```

### 16.3 路由守卫

```javascript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

// 路由独享守卫
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from) => {
      if (!isAdmin()) {
        return '/forbidden'
      }
    },
  },
]

// 组件内守卫
defineOptions({
  beforeRouteEnter(to, from, next) {
    next()
  },
  beforeRouteUpdate(to, from, next) {
    next()
  },
  beforeRouteLeave(to, from, next) {
    next()
  },
})
```

---

## 十七、最佳实践

### 17.1 项目结构

```
src/
├── components/        # 通用组件
├── views/            # 页面组件
├── composables/      # 组合式函数
├── stores/           # 状态管理
├── router/           # 路由配置
├── api/              # API 请求
├── utils/            # 工具函数
├── assets/           # 静态资源
└── styles/           # 样式文件
```

### 17.2 性能优化

```javascript
// 懒加载路由
const Home = () => import('./views/Home.vue')

// 组件缓存
<KeepAlive>
  <component :is="currentComponent" />
</KeepAlive>

// 虚拟滚动
import { RecycleScroller } from 'vue-virtual-scroller'

// 防抖和节流
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

const debouncedSearch = useDebounceFn(search, 300)
const throttledScroll = useThrottleFn(handleScroll, 100)
```

### 17.3 TypeScript 支持

```vue
<script setup lang="ts">
import { ref, Ref } from 'vue'

interface User {
  id: number
  name: string
}

const users: Ref<User[]> = ref([])

function addUser(user: User) {
  users.value.push(user)
}
</script>
```

### 17.4 代码规范

```javascript
// 使用 ESLint + Prettier
// .eslintrc.js
module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended',
    'prettier',
  ],
}

// 命名规范
// 组件: PascalCase
// Composables: useXxx
// Stores: useXxxStore
// 常量: UPPER_SNAKE_CASE
```

---

## 附录

### A. 生态系统

- **Vue Router**: 官方路由
- **Pinia**: 官方状态管理
- **VueUse**: 组合式 API 工具集
- **Vite**: 构建工具
- **Nuxt**: SSR 框架

### B. 有用的资源

- **官方文档**: https://vuejs.org/
- **Vue School**: https://vueschool.io/
- **Vue Mastery**: https://www.vuemastery.com/
- **Awesome Vue**: https://github.com/vuejs/awesome-vue

### C. 学习路线

```
HTML/CSS/JS → Vue 基础 → 组件 → 路由 → 状态管理 → 高级特性 → 工程化

1. JavaScript 基础
2. Vue 核心概念
3. 组件系统和通信
4. 组合式 API
5. Vue Router
6. Pinia/Vuex
7. TypeScript
8. 测试
9. 性能优化
10. SSR/Nuxt
```

---

**祝您 Vue 3 开发愉快！** 💚

如有问题，请查阅官方文档或社区论坛。
