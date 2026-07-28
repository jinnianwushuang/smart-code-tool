---
title: 逻辑切面-聚合装配-上下文载荷
order: 299
---

# 逻辑切面-聚合装配-上下文载荷

## 大型 Vue3 模块架构设计原理：基于“聚合装配”的上下文系统

该架构的设计核心在于解决**超大型组件模块** **单个代码文件庞大，逻辑碎片化、依赖追踪难、生命周期混乱、上下文混乱**的问题。

设计理念：**关注点分离、原子级要素、切面、依赖注入、模块化**

## 设计哲学

## 1. 核心设计哲学

## ① **单一上下文 (Single Payload)**

传统的 `setup` 往往会产生大量的 `ref` 和 `function` 导出，导致模板层引用混乱。

- **原理**：所有子模块不直接返回变量，而是操作同一个传入的 `payload` 引用。
- **优势**：组件模板只需要解构一个 `payload`。由于 `payload` 是 `引用类型` 的，任何子模块对它的修改填充，其他模块都能拿到。

## ② **严格的时序管控 (Strict Sequence Control)**

Vue 组件初始化最常见的 Bug 源于“变量还没初始化，方法就开始调用”或“生命周期钩子找不到变量”。

- **执行流**：`State (定义数据) ➔ Method (定义逻辑) ➔ Lifecycle (激活钩子)`。
- **原理**：无论文件扫描顺序如何，聚合引擎会强制将它们按类型存入三个数组。在 `useContextAssembler` 执行时，保证**数据层**永远在**逻辑层**之前就绪。

## ③ **无感知的递归聚合 (Recursive Assembler)**

为了实现业务逻辑复用，我们引入了 `assembler` 概念。

- **原理**：`assembler` 既是结果的**容器**，也是功能的**入口**。它允许将“文件夹 A”的扫描结果嵌套进“文件夹 B”。
- **优势**：实现“乐高式”组装。例如：`user-page-assembler` = `base-list-feature` + `user-specific-logic`。

## ④ **冲突检测与溯源机制 (Conflict Detection & Trace Mechanism)**

- **原理**：在任何对`payload`执行扩充操作时候，都进行已有键比对。
- **优势**：提取合并方法，进行冲突日志溯源，方便定位问题，优化代码设计。

---

## 2. 聚合入口函数

```javascript
import { global_log } from 'src/common/architecture-design/util/log/log.js'
import { get_file_name_cases } from 'src/common/architecture-design/util/file/file.js'

/**
 * assembler 聚合入口函数
 * @param {Object} all_params 聚合参数
 * @returns {Object} 包含状态机、方法和生命周期函数队列的对象
 * @description
 * 1. 根据传入的参数类型（modules 或 public_assembler）选择不同的聚合策略。
 * 2. 当传入 modules 时，自动扫描并分类函数到状态机、方法和生命周期队列。
 * 3. 当传入 public_assembler 时，从公共库中提取指定函数，并根据命名约定分类。
 * 4. 支持特殊约定：如果函数名包含 "assembler"，则执行该函数并解构其内部的三个函数数组进行合并。
 */
export const common_assemble_assembler = (all_params) => {
  const { modules } = all_params

  if (modules) {
    // 如果传入了 modules (通常是 import.meta.glob 的结果)，则进行目录扫描聚合
    return assemble_assembler_when_modules(all_params)
  } else {
    // 否则，处理传入的外部聚合器列表
    return assemble_assembler_when_public_assembler(all_params)
  }
}

/**
 * 场景一：基于 Vite 模块对象进行自动化扫描聚合
 */
const assemble_assembler_when_modules = (all_params) => {
  const { modules } = all_params

  const state_fn_arr = [] // 存储状态机初始化相关的生成器函数
  const method_fn_arr = [] // 存储业务方法相关的生成器函数
  const lifecycle_fn_arr = [] // 存储生命周期相关的生成器函数

  // 遍历所有模块路径进行分类
  Object.keys(modules).forEach((path) => {
    let file_name_cases = get_file_name_cases(path)
    const { original, snake } = file_name_cases

    // 过滤约定：以 "___" 结尾的文件名不参与自动聚合
    if (original.endsWith('___')) return
    const fileName = snake
    let fn = modules[path].default

    // 兼容性处理：若无默认导出，则尝试取第一个具名导出
    if (!fn) {
      fn = modules[path][Object.keys(modules[path])[0]]
    }
    if (typeof fn != 'function') {
      return
    }

    // 根据文件名命名约定进行职责分类
    if (fileName.includes('state')) {
      state_fn_arr.push(fn)
    } else if (fileName.includes('method')) {
      // method.js 存放主要的方法挂载逻辑
      method_fn_arr.push(fn)
    } else if (fileName.includes('lifecycle')) {
      lifecycle_fn_arr.push(fn)
    }
  })

  return {
    state_fn_arr,
    method_fn_arr,
    lifecycle_fn_arr,
  }
}

/**
 * 场景二：基于传入的名称列表从公共库中提取并合并聚合结果
 */
const assemble_assembler_when_public_assembler = (all_params) => {
  const { composable_common, public_assembler = [], local_assembler } = all_params

  const state_fn_arr = []
  const method_fn_arr = []
  const lifecycle_fn_arr = []

  let check = Array.isArray(public_assembler) && public_assembler.length > 0
  // 如果没有外部传入的需求，则直接返回本地扫描的结果（若有）
  if (!check) {
    return local_assembler
  }

  // 遍历需求列表，从公共 Composable 库中提取对应函数
  public_assembler.forEach((income_fn_name) => {
    const fn = composable_common[income_fn_name]
    if (typeof fn != 'function') {
      return
    }
    if (income_fn_name.includes('state')) {
      state_fn_arr.push(fn)
    } else if (income_fn_name.includes('method')) {
      method_fn_arr.push(fn)
    } else if (income_fn_name.includes('lifecycle')) {
      lifecycle_fn_arr.push(fn)
    } else if (income_fn_name.includes('assembler')) {
      // 特殊逻辑：如果本身是聚合器函数，则执行它并解构其内部的三个函数数组
      const fn_result = fn()
      if (fn_result) {
        state_fn_arr.push(...fn_result.state_fn_arr)
        method_fn_arr.push(...fn_result.method_fn_arr)
        lifecycle_fn_arr.push(...fn_result.lifecycle_fn_arr)
      }
    }
  })

  global_log('[Composable] 聚合结果：', {
    state_fn_arr,
    method_fn_arr,
    lifecycle_fn_arr,
  })
  return {
    state_fn_arr,
    method_fn_arr,
    lifecycle_fn_arr,
  }
}
```

## 3. 上下文启动器

```javascript
import { wrap_with_payload } from 'src/output/common/project-common.js'

/**
 * 上下文启动器
 * 消费生成器函数队列，扩充上下文
 */
export const useContextAssembler = (initialPayload = {}, config_obj = {}) => {
  const payload = initialPayload

  // 1. 状态机就绪 合并状态机
  config_obj.state_fn_arr?.forEach((fn) => {
    Object.assign(payload, fn(payload))
  })
  // 2. 方法挂载 合并返回的常规函数
  config_obj.method_fn_arr?.forEach((fn) => {
    Object.assign(payload, fn(payload))
  })
  // 3. 生命周期激活 合并返回的 emit 函数
  config_obj.lifecycle_fn_arr?.forEach((fn) => Object.assign(payload, fn(payload)))
  // 4. 函数包装
  const { wrap_payload } = config_obj

  // 函数包装 上下文包装
  if (wrap_payload && wrap_payload.length > 0) {
    let wrapped_payload = {}
    wrap_payload.forEach((fn_name) => {
      if (typeof payload[fn_name] !== 'function') {
        console.warn(
          `wrap_payload 配置项指定的函数 ${fn_name} 在 payload 中未找到或不是函数，跳过包装。`,
        )
        return
      }
      wrapped_payload[fn_name] = (...args) => payload[fn_name](payload, ...args)
    })

    Object.assign(payload, {
      wrapped_payload,
    })
  }

  // 最后返回生成的 payload 对象，供组件内使用

  return payload
}
```

## 4. 页面组件上下文装配 `index.vue`

```javascript
// <div>{{ user_info }}</div>
// <div>{{ compute_btn_class('a') }}</div>
// <div></div>

import { useContextAssembler } from 'src/output/common/composable-common.js'
import { assemble_assembler } from './assembler/assembler.js'
// 组件内定义的 props
const props = defineProps({})
// 组件内定义的  emit
const emit = defineEmits([])
// 下游组件调用的 income 通道 指定函数名字
const income_pipeline = ['income_public_fn_a']
// 需要包装payload 给当前组件模板内直接用的函数名字
const wrap_payload = ['handle_query_demo']
// 基础上下文
const base_payload = {
  props,
  income_pipeline,
  wrap_payload,
}
const {
  user_info,
  btn_a_click,
  wrapped_payload: { compute_btn_class },
} = useContextAssembler(base_payload, assemble_assembler())
```
