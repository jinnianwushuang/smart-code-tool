# 响应式系统核心原理典型拆解

> 本文档以 Vue 3 的 `Proxy + effect + track/trigger` 为主线，
> 从零实现一个最小响应式系统，拆解依赖收集、触发更新、计算属性的底层原理。

---

## 一、响应式系统三要素

```
响应式系统
├── reactive()    → 将普通对象变成响应式的（Proxy 拦截读写）
├── effect()      → 注册副作用函数（读取响应式数据时自动收集依赖）
└── trigger/track → 数据变化时通知所有依赖的副作用函数重新执行
```

**核心流程：**

```
effect(() => {
  console.log(state.count)  // 读取 → track 收集依赖
})

state.count++               // 写入 → trigger 触发更新
```

---

## 二、最小响应式系统实现

### 2.1 依赖收集与触发

```javascript
// 全局变量：当前正在执行的 effect
let activeEffect = null

// 依赖存储：WeakMap<target, Map<key, Set<effect>>>
const targetMap = new WeakMap()

// track：读取属性时收集依赖
function track(target, key) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }

  deps.add(activeEffect)
}

// trigger：修改属性时触发依赖
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const deps = depsMap.get(key)
  if (!deps) return

  // 拷贝一份再遍历，防止执行过程中 deps 被修改
  const effectsToRun = new Set(deps)
  effectsToRun.forEach((effect) => {
    if (effect.scheduler) {
      effect.scheduler(effect) // 有调度器则走调度器
    } else {
      effect.run() // 否则直接执行
    }
  })
}
```

### 2.2 effect 注册

```javascript
function effect(fn, options = {}) {
  const _effect = {
    run() {
      activeEffect = _effect
      try {
        fn() // 执行副作用函数，期间读取响应式数据会触发 track
      } finally {
        activeEffect = null // 执行完毕，清空
      }
    },
    scheduler: options.scheduler,
  }
  _effect.run() // 立即执行一次
  return _effect
}
```

### 2.3 reactive 代理

```javascript
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)
      track(target, key) // 读取时收集依赖
      // 嵌套对象也要递归代理
      if (result !== null && typeof result === 'object') {
        return reactive(result)
      }
      return result
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      if (oldValue !== value) {
        trigger(target, key) // 值变化时触发依赖
      }
      return result
    },
  })
}
```

### 2.4 使用示例与执行过程

```javascript
const state = reactive({ count: 0, name: 'Alice' })

// 注册副作用
effect(() => {
  document.title = `count: ${state.count}`
})
// 执行过程：
// ① effect.run() → activeEffect = 当前 effect
// ② 读取 state.count → Proxy get → track(state, 'count')
// ③ 依赖收集完成

state.count = 1
// 执行过程：
// ① Proxy set → 旧值 0 ≠ 新值 1
// ② trigger(state, 'count')
// ③ 找到 'count' 对应的 effect Set
// ④ 执行 effect.run() → 重新读取 → document.title 更新
```

**依赖收集数据结构拆解：**

```
targetMap (WeakMap):
  └── state 对象 → Map:
        ├── 'count' → Set: [effect1, effect2]
        └── 'name'  → Set: [effect3]
```

| 层级   | 数据结构  | 说明                                  |
| ------ | --------- | ------------------------------------- |
| 第一层 | `WeakMap` | key 是原始对象，弱引用不阻止 GC       |
| 第二层 | `Map`     | key 是属性名，value 是依赖集合        |
| 第三层 | `Set`     | 存储所有依赖该属性的 effect，自动去重 |

---

## 三、computed 计算属性

```javascript
function computed(getter) {
  let value
  let dirty = true // 标记是否需要重新计算

  const effectObj = effect(getter, {
    scheduler() {
      dirty = true // 依赖变化时标记为脏
      trigger(computedRef, 'value') // 通知依赖 computed 的 effect
    },
  })

  const computedRef = reactive({
    get value() {
      if (dirty) {
        value = effectObj.run() // 重新计算
        dirty = false
      }
      track(computedRef, 'value') // 收集外部依赖
      return value
    },
  })

  return computedRef
}
```

**执行过程拆解：**

```javascript
const state = reactive({ price: 10, quantity: 2 })
const total = computed(() => state.price * state.quantity)

// ① 读取 total.value → dirty=true → 执行 getter → 返回 20
// ② state.price = 20 → trigger → scheduler 标记 dirty=true
// ③ 再次读取 total.value → dirty=true → 重新计算 → 返回 40

// 关键：如果 price 没变，dirty 不会被标记，不会重复计算
```

| 特性     | 实现方式                                        |
| -------- | ----------------------------------------------- |
| 惰性计算 | `dirty` 标记，只在需要时重新计算                |
| 缓存     | 依赖不变时直接返回缓存值                        |
| 嵌套响应 | computed 本身也是响应式的，可被其他 effect 依赖 |

---

## 四、watch 侦听器

```javascript
function watch(source, cb, options = {}) {
  const getter = typeof source === 'function' ? source : () => traverse(source) // 对象则递归读取所有属性（深度收集依赖）

  let oldValue

  const effectObj = effect(getter, {
    scheduler() {
      const newValue = effectObj.run()
      if (options.deep || hasChanged(newValue, oldValue)) {
        cb(newValue, oldValue)
        oldValue = newValue
      }
    },
  })

  if (options.immediate) {
    cb(effectObj.run()) // 立即执行一次回调
  } else {
    oldValue = effectObj.run() // 先执行一次，保存旧值
  }
}

// 递归读取对象所有属性，实现深度依赖收集
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return value
  seen.add(value)
  for (const key in value) {
    traverse(value[key], seen)
  }
  return value
}
```

**watch vs computed 对比：**

| 对比     | computed         | watch                  |
| -------- | ---------------- | ---------------------- |
| 用途     | 派生值（A → B）  | 副作用（A → 执行操作） |
| 返回值   | 有（计算结果）   | 无                     |
| 缓存     | 有（dirty 标记） | 无                     |
| 执行时机 | 读取时惰性计算   | 依赖变化时主动执行     |

---

## 五、总结：响应式系统知识图谱

```
响应式系统
├── 核心三件套
│   ├── reactive()    → Proxy 拦截 get/set
│   ├── track()       → 读取时收集依赖（WeakMap → Map → Set）
│   └── trigger()     → 写入时触发更新
│
├── effect
│   ├── 注册副作用函数
│   ├── 执行时自动 track
│   └── scheduler 调度器
│
├── computed
│   ├── dirty 标记 + 惰性计算
│   ├── 缓存机制
│   └── 自身也是响应式的
│
├── watch
│   ├── 侦听 getter 或 reactive 对象
│   ├── traverse 深度依赖收集
│   └── immediate / deep 选项
│
└── 数据结构
    ├── WeakMap → 对象级索引
    ├── Map     → 属性级索引
    └── Set     → effect 去重
```
