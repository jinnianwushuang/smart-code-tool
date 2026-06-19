---
title: 生命周期和副作用管理
order: 80
---

# 生命周期和副作用管理

## 概述

该模板提供与 Vue 3 生命周期钩子集成的结构化生命周期管理和全面效果清理系统，同时维护干净、可组合的代码。

## 生命周期系统

### 生命周期钩子

位于 `module/lifecycle/lifecycle.js`：

```javascript
export const lifecycle_onBeforeMount = (payload) => {
  console.log('lifecycle_onBeforeMount')
  handle_xxx_demo(payload)
}

export const lifecycle_onMounted = (payload) => {
  console.log('lifecycle_onMounted')
  handle_query_demo(payload)
}

export const lifecycle_onBeforeUnmount = (payload) => {
  console.log('lifecycle_onBeforeUnmount')
}

export const lifecycle_onUnmounted = (payload) => {
  console.log('lifecycle_onUnmounted')
}

export const lifecycle_onActivated = (payload) => {
  console.log('lifecycle_onActivated')
}

export const lifecycle_onDeactivated = (payload) => {
  console.log('lifecycle_onDeactivated')
}
```

### 可用的生命周期钩子

| 钩子 | 时机 | 用例 |
|------|------|------|
| `lifecycle_onBeforeMount` | 组件挂载前 | 准备状态/验证 |
| `lifecycle_onMounted` | 组件挂载后 | 获取初始数据、启动定时器 |
| `lifecycle_onBeforeUnmount` | 组件卸载前 | 保存状态、取消待处理请求 |
| `lifecycle_onUnmounted` | 组件卸载后 | 最终清理 |
| `lifecycle_onActivated` | 组件重新激活（KeepAlive） | 恢复定时器、刷新状态 |
| `lifecycle_onDeactivated` | 组件停用（KeepAlive） | 暂停定时器、缓存状态 |

### 生命周期执行流程

```
Component Creation
组件创建
    ↓
useContextAssembler() → lifecycle_onBeforeMount(payload)
    ↓
Vue mounts component
Vue 挂载组件
    ↓
lifecycle_onMounted(payload)
    ↓
Component in view
组件在视图中
    ↓
(optional KeepAlive)
    ↓
lifecycle_onBeforeUnmount(payload)
    ↓
Vue unmounts component
Vue 卸载组件
    ↓
lifecycle_onUnmounted(payload)
    ↓
Component destroyed
组件销毁
```

### 使用生命周期钩子

在主组件中：

```javascript
import { useContextAssembler } from 'src/output/common/composable-common.js'
import { all_atoms_assembler } from './assembler/module/assembler.js'

const {
  user_info,
  lifecycle_onBeforeMount,
  lifecycle_onMounted,
} = useContextAssembler(base_payload, all_atoms_assembler())

// Hooks automatically called by useContextAssembler
// 钩子由 useContextAssembler 自动调用
```

`useContextAssembler()` 可组合函数自动在适当时间调用生命周期钩子。

## 效果清理系统

### 概述

效果是需要清理的副作用（监听器、观察器、定时器等），以防止内存泄漏。该系统提供集中式清理。

### 效果类型

位于 `module/effect/`：

```
module/effect/
├── dom.js        # DOM 引用清理
├── listener.js   # 事件监听器清理
├── watcher.js    # Vue 观察器清理
├── timer.js      # 定时器清理
├── mitter.js     # 事件发射器监听器清理
└── other.js      # 自定义观察器等
```

### 1. DOM 效果

**文件**: `module/effect/dom.js`

跟踪需要清理的 DOM 引用：

```javascript
export const cleanup_effect_dom = (payload) => {
  const { form_ref } = payload
  return [form_ref]  // References to clean up
                          // 要清理的引用
}
```

**用例**:
- 表单引用
- 组件引用
- 应使之无效的 DOM 查询

**清理**: 组件卸载时引用被无效化

### 2. 事件监听器

**文件**: `module/effect/listener.js`

注册具有清理处理程序的事件监听器：

```javascript
import { handle_resize } from '../other-method/event-listener.js'

export const cleanup_effect_listener = (payload) => {
  return [
    {
      target: window,
      type: 'resize',
      handler: (event) => handle_resize(payload, event),
    },
  ]
}
```

**生命周期**:
1. 组件挂载时注册监听器
2. 事件触发时调用处理程序
3. 组件卸载时取消注册监听器

**具有自定义处理程序的示例**:

```javascript
export const cleanup_effect_listener = (payload) => {
  const { pagination } = payload

  return [
    {
      target: window,
      type: 'scroll',
      handler: (event) => {
        if (window.scrollY > 500) {
          pagination.value.current = 1
        }
      },
    },
    {
      target: document,
      type: 'keydown',
      handler: (event) => {
        if (event.key === 'Escape') {
          // Handle escape key
          // 处理转义键
        }
      },
    },
  ]
}
```

### 3. 观察器

**文件**: `module/effect/watcher.js`

管理具有自动清理的 Vue 观察器：

```javascript
import { watch } from "vue"

export const cleanup_effect_watcher = (payload) => {
  const { current_time } = payload

  return [watch(current_time, (new_time) => {
    console.log('Time changed:', new_time)
  })]
}
```

**高级示例**:

```javascript
import { watch, computed } from "vue"

export const cleanup_effect_watcher = (payload) => {
  const { table_data, pagination, query_form } = payload

  return [
    // Watch table data changes
    // 观察表格数据更改
    watch(table_data, (newData) => {
      console.log('Table updated:', newData.length)
    }),

    // Watch pagination changes
    // 观察分页更改
    watch(() => pagination.value.current, (newPage) => {
      console.log('Page changed to:', newPage)
    }),

    // Deep watch for query form changes
    // 深度观察查询表单更改
    watch(query_form, (newForm) => {
      console.log('Query form:', newForm)
    }, { deep: true }),

    // Computed watches
    // 计算观察
    watch(
      () => table_data.value.length,
      (newLength) => {
        if (newLength === 0) {
          console.log('No data')
        }
      }
    ),
  ]
}
```

### 4. 定时器

**文件**: `module/effect/timer.js`

跟踪需要清理的定时器：

```javascript
export const cleanup_effect_timer = (payload) => {
  const { timer1, timer_obj } = payload

  return [timer1, timer_obj]  // Timer IDs/objects to clean up
                              // 要清理的定时器 ID/对象
}
```

**具有间隔和超时的示例**:

```javascript
export const cleanup_effect_timer = (payload) => {
  const timers = []

  // Create interval (cleanup by ID)
  // 创建间隔（按 ID 清理）
  const intervalId = setInterval(() => {
    console.log('Periodic task')
  }, 5000)
  timers.push(intervalId)

  // Create timeout (cleanup by ID)
  // 创建超时（按 ID 清理）
  const timeoutId = setTimeout(() => {
    console.log('Delayed task')
  }, 10000)
  timers.push(timeoutId)

  return timers
}
```

### 5. 事件发射器监听器

**文件**: `module/effect/mitter.js`

管理自定义事件发射器订阅：

```javascript
import { EMITTER } from "src/output/common/project-common.js"

export const cleanup_effect_mitter = (payload) => {
  const { current_time } = payload

  return [EMITTER.on("custom-event", () => {
    console.log("Event received at", current_time.value)
  })]
}
```

**高级示例**:

```javascript
export const cleanup_effect_mitter = (payload) => {
  const { all_dialog_state, table_data } = payload

  const subscriptions = []

  // Subscribe to dialog open events
  // 订阅对话框打开事件
  subscriptions.push(
    EMITTER.on("dialog:open", (dialogData) => {
      // Handle dialog opening
      // 处理对话框打开
      all_dialog_state.value = dialogData
    })
  )

  // Subscribe to data refresh events
  // 订阅数据刷新事件
  subscriptions.push(
    EMITTER.on("data:refresh", () => {
      // Trigger data reload
      // 触发数据重新加载
      console.log('Refreshing data')
    })
  )

  return subscriptions
}
```

### 6. 其他效果

**文件**: `module/effect/other.js`

用于自定义观察器和其他清理需求：

```javascript
export const cleanup_effect_other = (payload) => {
  const { } = payload

  // Example: ResizeObserver
  // 示例：ResizeObserver
  const containerRef = payload.container_ref
  const observer = new ResizeObserver((entries) => {
    console.log('Container resized')
  })

  if (containerRef?.value) {
    observer.observe(containerRef.value)
  }

  return [observer]  // Disconnect called on cleanup
                   // 清理时调用断开连接
}
```

## 完整生命周期示例

### 单组件生命周期

```javascript
// 1. Before mount - prepare
// 1. 挂载前 - 准备
export const lifecycle_onBeforeMount = (payload) => {
  const { init_singleton } = payload
  init_singleton()  // Reset state
                   // 重置状态
}

// 2. After mount - load data and setup effects
// 2. 挂载后 - 加载数据并设置效果
export const lifecycle_onMounted = (payload) => {
  const { handle_init_table_data } = payload
  handle_init_table_data(payload)  // Fetch initial data
                                     // 获取初始数据
}

// 3. On unmount - cleanup happens automatically via effects
// 3. 卸载时 - 通过效果自动发生清理
export const lifecycle_onBeforeUnmount = (payload) => {
  const { table_data, pagination } = payload
  // Optional: save state before unmount
  // 可选：在卸载前保存状态
  localStorage.setItem('table_state', JSON.stringify({
    data: table_data.value,
    pagination: pagination.value,
  }))
}
```

### KeepAlive 生命周期

对于使用 Vue 的 `<KeepAlive>` 的缓存组件：

```javascript
export const lifecycle_onDeactivated = (payload) => {
  // Component hidden, pause expensive operations
  // 组件隐藏，暂停昂贵的操作
  const { timer1 } = payload
  clearInterval(timer1)
}

export const lifecycle_onActivated = (payload) => {
  // Component shown again, resume operations
  // 组件再次显示，恢复操作
  const { handle_resume_timer } = payload
  handle_resume_timer(payload)
}
```

## 清理机制

### 清理如何工作

1. **注册阶段**（挂载）:
   - 效果清理函数创建处理程序
   - 处理程序注册到系统

2. **活动阶段**（组件可见）:
   - 处理程序执行（观察器触发、监听器触发）
   - 状态更新传播

3. **清理阶段**（卸载）:
   - 所有效果清理函数被调用
   - 监听器取消注册（`removeEventListener`）
   - 观察器停止（`watcherStop()`）
   - 定时器清除（`clearInterval`、`clearTimeout`）
   - 观察器断开连接（`observer.disconnect()`）
   - 事件订阅取消订阅

### 内存泄漏预防

系统通过以下方式防止泄漏：

```javascript
// ✅ Automatic cleanup pattern
// ✅ 自动清理模式
export const cleanup_effect_listener = (payload) => {
  return [
    { target, type, handler }  // Registered and cleaned up
                               // 已注册并清理
  ]
}

// ❌ Manual cleanup outside framework
// ❌ 框架外部的手动清理
window.addEventListener('resize', () => {})  // Danger! No cleanup
                                             // 危险！无清理
```

## 最佳实践

### ✅ 应该做
- 在清理模块中注册所有效果
- 保持生命周期钩子专注
- 使用适当的效果类型
- 记录每个效果的作用
- 测试清理是否发生

### ❌ 不应该做
- 在清理系统外部创建监听器
- 忘记返回清理处理程序
- 创建循环清理依赖
- 在卸载时执行昂贵的操作
- 存储防止清理的引用

## 测试生命周期和效果

```javascript
test('component initializes onMounted', () => {
  const payload = { /* mock payload */ }

  lifecycle_onMounted(payload)

  expect(payload.table_data.value.length).toBeGreaterThan(0)
})

test('watchers cleanup on unmount', () => {
  const payload = { /* mock payload */ }
  const cleanupFns = cleanup_effect_watcher(payload)

  // Call cleanup
  // 调用清理
  cleanupFns.forEach(fn => fn())

  // Verify watchers stopped
  // 验证观察器已停止
  expect(payload.current_time.value).not.toChange()
})
```
