---
title: "Vue 响应式系统底层 [P6-P7]"
level: "senior"
tags: ["Vue", "Proxy", "依赖收集", "调度器"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# Vue 响应式系统底层 [P6-P7]

> Vue 3 的响应式系统是整个框架的核心引擎。深入理解 Proxy 依赖收集、Effect 调度器和批量更新机制，是掌握 Vue 原理的第一步。

## 核心概念（What）

### 响应式系统架构

```
┌─────────────────────────────────────────────────┐
│                  Vue 3 响应式系统                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐    ┌───────────────────────┐   │
│  │  reactive()  │    │  effect()              │   │
│  │  ref()       │    │  computed()            │   │
│  │  shallowReactive│  │  watch()              │   │
│  └──────┬───────┘    └───────────┬───────────┘   │
│         │                        │               │
│         ▼                        ▼               │
│  ┌──────────────┐    ┌───────────────────────┐   │
│  │  依赖收集     │    │  副作用执行            │   │
│  │  track()     │←──→│  trigger()             │   │
│  └──────┬───────┘    └───────────┬───────────┘   │
│         │                        │               │
│         ▼                        ▼               │
│  ┌──────────────────────────────────────────┐    │
│  │           targetMap (WeakMap)             │    │
│  │  target → depsMap → dep → Set<effect>    │    │
│  └──────────────────────────────────────────┘    │
│         │                                        │
│         ▼                                        │
│  ┌──────────────────────────────────────────┐    │
│  │           Scheduler（调度器）              │    │
│  │  queueJob → 去重 → 排序 → flush          │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 底层原理（Why）

### 1. reactive() 的 Proxy 实现

```javascript
// Vue 3 的 reactive() 核心实现（简化版）
function reactive(target) {
  // 1. 检查是否已经是响应式对象
  if (target[ReactiveFlags.IS_REACTIVE]) return target;

  // 2. 查找缓存（避免重复创建 Proxy）
  const existingProxy = proxyMap.get(target);
  if (existingProxy) return existingProxy;

  // 3. 创建 Proxy
  const proxy = new Proxy(target, mutableHandlers);
  proxyMap.set(target, proxy);
  return proxy;
}

const mutableHandlers = {
  get(target, key, receiver) {
    // 特殊标记处理
    if (key === ReactiveFlags.IS_REACTIVE) return true;
    if (key === ReactiveFlags.RAW) return target;

    const result = Reflect.get(target, key, receiver);

    // 依赖收集
    track(target, key);

    // 嵌套响应式：访问到的对象属性也自动代理
    if (isObject(result)) {
      return reactive(result);
    }
    return result;
  },

  set(target, key, value, receiver) {
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);

    // 触发更新（仅当值真正变化时）
    if (!hasChanged(oldValue, value)) {
      return result;
    }

    // 判断是新增还是修改
    const hasKey = hasOwn(target, key);
    trigger(target, key, hasKey ? 'set' : 'add', value);

    return result;
  },

  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const result = Reflect.deleteProperty(target, key);

    if (hadKey && result) {
      trigger(target, key, 'delete');
    }
    return result;
  }
};
```

### 2. 依赖收集（track）与触发（trigger）

```javascript
// 核心数据结构
// targetMap: WeakMap<object, Map<string|symbol, Set<ReactiveEffect>>>
const targetMap = new WeakMap();
let activeEffect = null; // 当前正在执行的 effect

function track(target, key) {
  if (!activeEffect) return; // 没有正在执行的 effect，不收集

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  // 避免重复收集
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep); // 反向引用，用于清理
  }
}

function trigger(target, key, type, newValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const effectsToRun = new Set();

  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => {
      // 避免无限循环（effect 触发自身）
      if (effect !== activeEffect || !effect.allowRecurse) {
        effectsToRun.add(effect);
      }
    });
  }

  // 数组特殊处理
  if (type === 'add' && Array.isArray(target)) {
    // 新增元素时，触发 length 相关的依赖
    const lengthDep = depsMap.get('length');
    if (lengthDep) {
      lengthDep.forEach(effect => effectsToRun.add(effect));
    }
  }

  // 调度执行
  effectsToRun.forEach(effect => {
    if (effect.scheduler) {
      effect.scheduler(effect); // computed/watch 有自定义调度器
    } else {
      effect(); // 普通 effect 直接执行
    }
  });
}
```

### 3. Effect 与调度器

```javascript
class ReactiveEffect {
  constructor(fn, scheduler = null) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.deps = []; // 反向依赖，用于清理
    this.active = true;
    this.allowRecurse = false;
  }

  run() {
    if (!this.active) return this.fn();

    // 清理旧依赖（每次重新收集）
    cleanupEffect(this);

    // 设置当前活跃 effect
    const prevActiveEffect = activeEffect;
    activeEffect = this;

    try {
      return this.fn();
    } finally {
      activeEffect = prevActiveEffect;
    }
  }

  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
    }
  }
}

function cleanupEffect(effect) {
  const { deps } = effect;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
    deps.length = 0;
  }
}
```

### 4. computed 的实现

```javascript
function computed(getterOrOptions) {
  const getter = typeof getterOrOptions === 'function'
    ? getterOrOptions
    : getterOrOptions.get;

  let dirty = true;
  let cachedValue;

  const effect = new ReactiveEffect(getter, () => {
    // 调度器：标记为 dirty，不立即执行
    if (!dirty) {
      dirty = true;
      trigger(computedRef, 'value', 'set');
    }
  });

  const computedRef = {
    get value() {
      // 访问时收集依赖
      track(computedRef, 'value');

      // dirty 时重新计算
      if (dirty) {
        cachedValue = effect.run();
        dirty = false;
      }
      return cachedValue;
    }
  };

  return computedRef;
}

// 关键设计：
// 1. 惰性求值：只有访问 .value 时才计算
// 2. 缓存：依赖不变时返回缓存值
// 3. 调度器只标记 dirty，不立即执行 getter
// 4. 访问 value 时触发 track，实现依赖传递
```

### 5. watch 的实现

```javascript
function watch(source, cb, options = {}) {
  let getter;
  if (isReactive(source)) {
    getter = () => traverse(source); // 深度遍历收集依赖
  } else if (isRef(source)) {
    getter = () => source.value;
  } else if (isFunction(source)) {
    getter = source;
  }

  let oldValue = options.immediate ? undefined : effect.run();

  const effect = new ReactiveEffect(getter, () => {
    // 调度器：异步执行回调
    if (options.flush === 'post') {
      queuePostFlushCb(() => {
        const newValue = effect.run();
        cb(newValue, oldValue);
        oldValue = newValue;
      });
    } else {
      const newValue = effect.run();
      cb(newValue, oldValue);
      oldValue = newValue;
    }
  });

  if (options.immediate) {
    cb(undefined, oldValue);
  }
}

// traverse：深度遍历对象，确保所有嵌套属性都被收集
function traverse(value, seen = new Set()) {
  if (!isObject(value) || seen.has(value)) return value;
  seen.add(value);
  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}
```

### 6. 批量更新与 nextTick

```javascript
// Vue 的更新是异步批量的
const queue = [];
let isFlushing = false;

function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  if (!isFlushing) {
    isFlushing = true;
    Promise.resolve().then(() => {
      // 排序：确保父组件先于子组件更新
      queue.sort((a, b) => getId(a) - getId(b));
      try {
        for (let i = 0; i < queue.length; i++) {
          queue[i]();
        }
      } finally {
        queue.length = 0;
        isFlushing = false;
      }
    });
  }
}

// nextTick 等待批量更新完成
function nextTick(fn) {
  return fn ? Promise.resolve().then(fn) : new Promise(r => Promise.resolve().then(r));
}
```

---

## 实战应用（How）

### ref vs reactive 的选择

```javascript
// ref：适合原始值和需要整体替换的场景
const count = ref(0);
count.value++; // 需要 .value

// reactive：适合对象且不需要整体替换的场景
const state = reactive({ count: 0, name: 'test' });
state.count++; // 不需要 .value

// 注意：reactive 解构会丢失响应式
const { count } = state; // count 不是响应式的！
const { count } = toRefs(state); // 正确：toRefs 将每个属性转为 ref
```

### 性能优化

```javascript
// 1. shallowRef / shallowReactive：只代理第一层
const data = shallowRef({ nested: { value: 1 } });
data.value.nested.value = 2; // 不会触发更新（只有 data.value 整体赋值才触发）
data.value = { nested: { value: 2 } }; // 触发更新

// 2. 避免不必要的深度响应式
// 大型只读数据（如配置、字典）不需要响应式
const config = markRaw({ /* 大量配置数据 */ });

// 3. computed 缓存避免重复计算
const filteredList = computed(() => {
  return list.value.filter(item => item.active);
});
```

---

## 高频面试题

### Q1: Vue 3 响应式系统的核心原理是什么？

**参考答案要点**：
- 基于 Proxy 实现依赖收集和触发更新
- `reactive()` 创建 Proxy，get 时 `track()` 收集依赖，set 时 `trigger()` 触发更新
- 依赖关系存储在 `targetMap → depsMap → dep → Set<effect>` 结构中
- `effect()` 执行时设置 `activeEffect`，访问响应式属性时自动收集
- computed 使用惰性求值 + 缓存，watch 使用调度器异步执行

### Q2: Vue 3 相比 Vue 2 的响应式有什么改进？

**参考答案要点**：
- Proxy 替代 defineProperty：支持新增/删除属性、数组索引
- 不再需要 `$set`/`$delete`
- 惰性代理：嵌套对象访问时才代理（性能优化）
- 支持 Map/Set/WeakMap 等集合类型
- 新增 `shallowRef`/`shallowReactive`/`markRaw` 等精细控制
- 独立的 `@vue/reactivity` 包，可脱离组件使用

### Q3: computed 和 watch 的区别和实现差异？

**参考答案要点**：
- computed：惰性求值，有缓存，依赖不变不重新计算，同步
- watch：监听变化执行回调，无缓存，异步执行
- computed 的调度器只标记 dirty，不触发计算
- watch 的调度器将回调推入微任务队列（批量执行）

---

## 延伸思考

1. **设计题**：如果不用 Proxy，能否用其他方案实现 Vue 3 级别的响应式？
2. **场景题**：一个包含 10000 条数据的列表，如何实现高效的分页渲染和响应式更新？
3. **对比题**：Vue 的响应式 vs React 的不可变数据 vs SolidJS 的 Signals，各自的 trade-off？

---

## 参考资料

- [Vue 3 源码 - @vue/reactivity](https://github.com/vuejs/core/tree/main/packages/reactivity)
- [Vue 3 响应式原理](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [Vue 3 设计文档 - Reactivity API](https://vuejs.org/api/reactivity-core.html)
