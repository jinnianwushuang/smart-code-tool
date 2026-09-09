---
title: "Vue 3 响应式原理入门 [P5-P6]"
level: "intermediate"
tags: ["Vue 3", "响应式", "Proxy", "reactive", "ref"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# Vue 3 响应式原理入门 [P5-P6]

> Vue 3 使用 Proxy 实现响应式系统。理解 reactive、ref、依赖收集和派发更新，才能写出高效的 Vue 应用。

## 核心概念（What）

### 响应式系统

```
响应式 = 数据变化 → 视图自动更新

核心概念：
├── 响应式数据 → reactive/ref 创建
├── 依赖收集 → 记录谁在用这个数据
├── 派发更新 → 数据变化时通知依赖
└── 视图更新 → 自动重新渲染

Vue 3 vs Vue 2：
├── Vue 2 → Object.defineProperty（对象属性）
├── Vue 3 → Proxy（整个对象）
├── Vue 3 支持数组、Map、Set
└── Vue 3 性能更好
```

## 底层原理（Why）

### reactive 实现

```javascript
// reactive = 将对象转为响应式

import { reactive } from 'vue';

const state = reactive({
  count: 0,
  user: {
    name: 'Alice',
    age: 25
  }
});

// 修改数据 → 自动触发更新
state.count++;
state.user.name = 'Bob';

// Proxy 实现原理（简化版）
function reactive(target) {
  return new Proxy(target, {
    get(obj, key) {
      // 依赖收集
      track(obj, key);
      
      const value = obj[key];
      
      // 递归处理嵌套对象
      if (typeof value === 'object' && value !== null) {
        return reactive(value);
      }
      
      return value;
    },
    
    set(obj, key, value) {
      const oldValue = obj[key];
      
      if (oldValue !== value) {
        obj[key] = value;
        // 派发更新
        trigger(obj, key);
      }
      
      return true;
    }
  });
}

// 依赖收集
const targetMap = new WeakMap();
const activeEffect = null;

function track(target, key) {
  if (!activeEffect) return;
  
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  
  dep.add(activeEffect);
}

// 派发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => {
      if (effect.scheduler) {
        effect.scheduler();
      } else {
        effect();
      }
    });
  }
}
```

### ref 实现

```javascript
// ref = 包装基本类型为响应式

import { ref } from 'vue';

const count = ref(0);

console.log(count.value); // 0
count.value++;
console.log(count.value); // 1

// ref 实现原理（简化版）
function ref(value) {
  return {
    _value: value,
    get value() {
      // 依赖收集
      track(this, 'value');
      return this._value;
    },
    set value(newValue) {
      if (this._value !== newValue) {
        this._value = newValue;
        // 派发更新
        trigger(this, 'value');
      }
    }
  };
}

// ref vs reactive：
// ├── ref → 基本类型（number、string、boolean）
// ├── reactive → 对象/数组
// └── ref 也可以包装对象（内部调用 reactive）
```

### 依赖收集与派发更新

```javascript
// 依赖收集流程：

// 1. 组件渲染时，访问响应式数据
function render() {
  return `<div>${state.count}</div>`;
}

// 2. 触发 getter → track()
// 3. 记录当前 effect（渲染函数）
// 4. 将 effect 添加到 dep 中

// 派发更新流程：

// 1. 修改响应式数据
state.count = 1;

// 2. 触发 setter → trigger()
// 3. 获取该数据的所有依赖（dep）
// 4. 执行所有 effect（重新渲染）

// 完整示例：
const state = reactive({ count: 0 });

// 模拟组件渲染
const effect = () => {
  console.log(`Count: ${state.count}`);
};

// 首次执行 → 依赖收集
effect();

// 修改数据 → 派发更新
state.count = 1; // 自动触发 effect

// 输出：
// Count: 0
// Count: 1
```

### computed 实现

```javascript
// computed = 计算属性（缓存 + 响应式）

import { computed, reactive } from 'vue';

const state = reactive({ count: 0 });

const double = computed(() => state.count * 2);

console.log(double.value); // 0
state.count = 5;
console.log(double.value); // 10

// computed 实现原理（简化版）
function computed(getter) {
  let value;
  let dirty = true;
  
  const effect = new ReactiveEffect(getter, () => {
    dirty = true; // 依赖变化时标记为脏
  });
  
  return {
    get value() {
      if (dirty) {
        value = effect.run(); // 重新计算
        dirty = false;
      }
      // 依赖收集（computed 也可以被依赖）
      track(this, 'value');
      return value;
    }
  };
}

// 特点：
// ├── 缓存：依赖不变 → 不重新计算
// ├── 惰性：访问时才计算
// └── 响应式：依赖变化 → 自动更新
```

### watch 实现

```javascript
// watch = 监听数据变化

import { watch, reactive, ref } from 'vue';

const state = reactive({ count: 0 });
const countRef = ref(0);

// 监听 reactive
watch(
  () => state.count,
  (newVal, oldVal) => {
    console.log(`count 从 ${oldVal} 变为 ${newVal}`);
  }
);

// 监听 ref
watch(countRef, (newVal, oldVal) => {
  console.log(`countRef 从 ${oldVal} 变为 ${newVal}`);
});

// watch 实现原理（简化版）
function watch(source, callback) {
  let oldValue;
  
  const getter = () => {
    if (isReactive(source)) {
      return traverse(source); // 深度遍历
    } else {
      return source.value;
    }
  };
  
  const effect = new ReactiveEffect(getter, () => {
    const newValue = effect.run();
    callback(newValue, oldValue);
    oldValue = newValue;
  });
  
  oldValue = effect.run();
}

// 特点：
// ├── 惰性：数据变化才执行
// ├── 可访问新旧值
// └── 支持深度监听
```

## 实战应用（How）

### 响应式最佳实践

```vue
<script setup>
import { ref, reactive, computed } from 'vue';

// ✅ 基本类型用 ref
const count = ref(0);
const name = ref('Alice');

// ✅ 对象用 reactive
const user = reactive({
  name: 'Alice',
  age: 25
});

// ✅ 复杂逻辑用 computed
const doubleCount = computed(() => count.value * 2);

// ✅ 副作用用 watch
watch(count, (newVal) => {
  console.log('count changed:', newVal);
});

// ❌ 避免：解构 reactive
const { name, age } = user; // 失去响应性

// ✅ 正确：使用 toRefs
import { toRefs } from 'vue';
const { name, age } = toRefs(user);

// ❌ 避免：直接替换 reactive 对象
let state = reactive({ count: 0 });
state = reactive({ count: 1 }); // 新对象，失去响应性

// ✅ 正确：修改属性
state.count = 1;
</script>
```

### 响应式丢失问题

```vue
<script setup>
import { reactive, toRefs } from 'vue';

const user = reactive({
  name: 'Alice',
  age: 25
});

// ❌ 解构后失去响应性
function useUser() {
  const { name, age } = user;
  return { name, age };
}

// ✅ 使用 toRefs 保持响应性
function useUser() {
  return toRefs(user);
}

const { name, age } = useUser();
name.value = 'Bob'; // 响应式
</script>
```

## 高频面试题

### Q1: Vue 3 响应式原理？

```
原理：
├── 使用 Proxy 代理对象
├── getter → 依赖收集（track）
├── setter → 派发更新（trigger）
├── 依赖 → Set 存储 effect
└── 更新 → 执行所有 effect

优势（vs Vue 2）：
├── 支持数组、Map、Set
├── 支持新增/删除属性
├── 性能更好
└── 代码更简洁
```

### Q2: reactive 和 ref 的区别？

```
┌──────────────┬──────────────┬──────────────┐
│              │   reactive   │     ref      │
├──────────────┼──────────────┼──────────────┤
│ 适用类型     │ 对象/数组    │ 基本类型     │
│ 访问方式     │ 直接访问     │ .value       │
│ 解构         │ 失去响应性   │ 保持响应性   │
│ 嵌套         │ 自动递归     │ 内部调用     │
└──────────────┴──────────────┴──────────────┘

推荐：
├── 基本类型 → ref
├── 对象/数组 → reactive
└── 不确定 → ref（更安全）
```

### Q3: computed 和 watch 的区别？

```
computed：
├── 有缓存（依赖不变不计算）
├── 同步（必须有返回值）
├── 用于派生状态
└── 示例：计算总数、格式化

watch：
├── 无缓存
├── 可异步
├── 用于副作用
└── 示例：请求数据、操作 DOM

选择：
├── 需要缓存 → computed
├── 需要异步 → watch
└── 派生状态 → computed
```

## 延伸思考

1. 如何避免响应式丢失？
2. shallowReactive 和 shallowRef 的使用场景？
3. 响应式的性能问题？

## 参考资料

- [Vue 3 响应式原理](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [Vue 3 源码](https://github.com/vuejs/core)
