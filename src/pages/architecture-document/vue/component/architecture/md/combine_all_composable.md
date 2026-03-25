---
title: 基于“管道聚合”的上下文系统
order: 2
---

## 大型 Vue3 模块架构设计原理：基于“管道聚合”的上下文系统

该架构的设计核心在于解决**超大型组件（2000行+）**逻辑碎片化、依赖追踪难、生命周期混乱的问题。它借鉴了**依赖注入（DI）**与**函数式管道（Pipeline）**的思想。

---

## 1. 核心设计哲学

## ① **单一响应式上下文 (Single Reactive Payload)**

传统的 `setup` 往往会产生大量的 `ref` 和 `function` 导出，导致模板层引用混乱。

- **原理**：所有子模块不直接返回变量，而是操作同一个传入的 `payload` 引用。
- **优势**：组件模板只需要解构一个 `payload`。由于 `payload` 是 `reactive` 的，任何子模块对它的修改，全组件实时感随。

## ② **严格的时序管控 (Strict Sequence Control)**

Vue 组件初始化最常见的 Bug 源于“变量还没初始化，方法就开始调用”或“生命周期钩子找不到变量”。

- **执行流**：`Variable (定义数据) ➔ Method (定义逻辑) ➔ Lifecycle (激活钩子)`。
- **原理**：无论文件扫描顺序如何，聚合引擎会强制将它们按类型存入三个数组。在 `useModuleContext` 执行时，保证**数据层**永远在**逻辑层**之前就绪。

## ③ **无感知的递归聚合 (Recursive Assembler)**

为了实现业务逻辑复用，我们引入了 `assembler` 概念。

- **原理**：`assembler` 既是结果的**容器**，也是功能的**入口**。它允许将“文件夹 A”的扫描结果嵌套进“文件夹 B”。
- **优势**：实现“乐高式”组装。例如：`user-page-assembler` = `base-list-feature` + `user-specific-logic`。

---

## 2. 冲突检测与溯源机制

## ① **虚拟执行与 Proxy 拦截**

- **原理**：在真正的 Vue 生命周期开始前，聚合引擎会先创建一个“影子对象（Shadow Payload）”。
- **检测**：当每个 `.variable` 或 `.index` 文件运行时，Proxy 会拦截其 `set` 操作。
- **溯源**：如果同一个 Key 被设置了两次，引擎立即捕获当前文件的 `path` 并对比 `Map` 中记录的旧 `path`，输出**冲突红字日志**。

---

## 3. 完整版本代码（含深度优化与详细注释）

## 📂 核心引擎：`engine.js`

```javascript
import { reactive, onMounted, onUnmounted } from 'vue'

/**
 * 聚合引擎：负责扫描与冲突溯源
 */
export const combine_all_composable = (modulesRaw = {}) => {
  const result = {
    variable_fn_arr: [],
    method_fn_arr: [],
    lifecycle_fn_arr: [],
    _source_map: new Map(), // 追踪：{ key: filePath }
    __is_std_composable: true,
  }

  const track = (fn, path) => {
    // 使用 Proxy 模拟挂载，检测重复定义的 Key
    const proxy = new Proxy(
      {},
      {
        set(target, key) {
          if (result._source_map.has(key)) {
            console.error(
              `%c[Conflict Found] %c变量 "${key}" 被覆盖！\n%c原来源: ${result._source_map.get(key)}\n%c新来源: ${path}`,
              'color:white;background:red;padding:2px 4px;border-radius:3px',
              'color:red;font-weight:bold',
              'color:gray',
              'color:blue',
            )
          }
          result._source_map.set(key, path)
          return true
        },
      },
    )
    try {
      fn(proxy)
    } catch (e) {
      /* 忽略执行期间的业务报错 */
    }
  }

  const merge = (source) => {
    if (!source?.__is_std_composable) return
    ;['variable_fn_arr', 'method_fn_arr', 'lifecycle_fn_arr'].forEach((k) =>
      result[k].push(...source[k]),
    )
    // 合并来源图
    source._source_map.forEach((path, key) => {
      if (result._source_map.has(key)) console.warn(`[Nested Conflict] 深度嵌套冲突: ${key}`)
      result._source_map.set(key, path)
    })
  }

  // 扫描逻辑
  Object.keys(modulesRaw).forEach((path) => {
    const fileName = path
      .split('/')
      .pop()
      .replace(/\.\w+$/, '')
    if (fileName.startsWith('_')) return
    const fn = modulesRaw[path].default || modulesRaw[path]
    if (typeof fn !== 'function') return

    if (fileName.includes('variable')) {
      track(fn, path)
      result.variable_fn_arr.push(fn)
    } else if (fileName.includes('index')) {
      track(fn, path)
      result.method_fn_arr.push(fn)
    } else if (fileName.includes('lifecycle')) {
      result.lifecycle_fn_arr.push(fn)
    } else if (fileName.includes('assembler')) {
      merge(fn()) // 递归触发
    }
  })

  return (...extras) => {
    extras.forEach(merge)
    return result
  }
}

/**
 * 上下文启动器
 */
export const useModuleContext = (initialPayload = {}, stdObj) => {
  const payload = reactive({ ...initialPayload })

  // 1. 变量就绪
  stdObj.variable_fn_arr.forEach((fn) => fn(payload))
  // 2. 方法挂载
  stdObj.method_fn_arr.forEach((fn) => fn(payload))
  // 3. 生命周期激活
  stdObj.lifecycle_fn_arr.forEach((fn) => fn(payload))

  if (import.meta.env.DEV) {
    console.log('%c[Context Ready] 聚合完毕，来源分布如下：', 'color:green;font-weight:bold')
    console.table(Object.fromEntries(stdObj._source_map))
  }

  return payload
}
```

---

## 4. 最佳实践示例

## 业务模块：`UserCenter/module/user-variable.js`

```javascript
export default (payload) => {
  // 定义状态
  payload.userInfo = { name: 'Unset' }
  payload.loading = false
}
```

## 业务模块：`UserCenter/module/user-index.js`

```javascript
export default (payload) => {
  // 定义逻辑
  payload.updateName = (name) => {
    payload.userInfo.name = name
  }
}
```

## 页面组件：`UserPage.vue`

```javascript
import { combine_all_composable, useModuleContext } from '@/engine'

// 1. 自动扫描当前模块下的子文件
const modules = import.meta.glob('./module/*.js', { eager: true })

// 2. 聚合并生成上下文
const stdObj = combine_all_composable(modules)()
const payload = useModuleContext({ isAdmin: true }, stdObj)

// 直接在 JS 中解构使用或在 Template 中使用 payload.xxx

// <q-page>
//   <q-input v-model="payload.userInfo.name" label="姓名" />
//   <q-btn @click="payload.updateName('New Name')">更新</q-btn>
// </q-page>
```

## 💡 架构建议

1. **平铺 vs 命名空间**：该架构坚持**平铺**是为了模板层书写最简，但一定要依赖 `combiner` 的**冲突日志**来规避命名风险。
2. **异步处理**：如果 `variable` 需要异步获取初始值，建议在 `payload` 中先定义 `null`，再在 `lifecycle` 中触发 `async` 请求。
