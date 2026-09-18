# 生命周期与副作用参照

## 生命周期钩子（module/lifecycle/lifecycle.js）

```javascript
// 挂载前 — 准备状态、重置单例
export const lifecycle_onBeforeMount = (payload) => {
  const { init_singleton } = payload
  init_singleton() // 重置所有单例状态
}

// 挂载后 — 获取初始数据、启动定时器
export const lifecycle_onMounted = (payload) => {
  const { handle_init_table_data } = payload
  handle_init_table_data(payload) // 获取初始数据
}

// 卸载前 — 保存状态、取消待处理请求
export const lifecycle_onBeforeUnmount = (payload) => {
  // 可选：在卸载前保存状态
}

// 卸载后 — 最终清理
export const lifecycle_onUnmounted = (payload) => {}

// KeepAlive 重新激活 — 恢复定时器、刷新状态
export const lifecycle_onActivated = (payload) => {}

// KeepAlive 停用 — 暂停定时器、缓存状态
export const lifecycle_onDeactivated = (payload) => {}
```

## 生命周期执行顺序

```
组件创建 → useContextAssembler() 自动调用:
  1. lifecycle_onBeforeMount(payload)
  2. Vue 挂载组件
  3. lifecycle_onMounted(payload)
  ...
组件销毁:
  4. lifecycle_onBeforeUnmount(payload)
  5. Vue 卸载组件
  6. lifecycle_onUnmounted(payload)
  7. 副作用自动清理
```

> **注意**：生命周期钩子由 `useContextAssembler()` 自动在对应时机调用，无需手动触发。

## 6 种副作用清理（module/effect/）

### 1. DOM 引用清理（dom.js）

```javascript
// 跟踪需要在组件卸载时清理的 DOM 引用
export const cleanup_effect_dom = (payload) => {
  const { form_ref } = payload
  return [form_ref] // 返回需要清理的引用列表
}
```

### 2. 事件监听器清理（listener.js）

```javascript
// 注册事件监听器，组件卸载时自动移除
export const cleanup_effect_listener = (payload) => {
  return [
    {
      target: window,
      type: 'resize',
      handler: (event) => handle_resize(payload, event),
    },
    {
      target: document,
      type: 'keydown',
      handler: (event) => {
        if (event.key === 'Escape') {
          /* 处理 ESC 键 */
        }
      },
    },
  ]
}
```

### 3. Vue 观察器清理（watcher.js）

```javascript
import { watch } from 'vue'

// 注册 Vue watcher，组件卸载时自动停止
export const cleanup_effect_watcher = (payload) => {
  const { table_data, pagination } = payload
  return [
    watch(table_data, (new_data) => {
      console.log('表格数据更新:', new_data.length)
    }),
    watch(
      () => pagination.value.current,
      (new_page) => {
        console.log('页码变更:', new_page)
      },
    ),
  ]
}
```

### 4. 定时器清理（timer.js）

```javascript
// 返回需要清理的定时器 ID 列表
export const cleanup_effect_timer = (payload) => {
  const timers = []
  const interval_id = setInterval(() => {
    /* 定时任务 */
  }, 5000)
  timers.push(interval_id)
  return timers
}
```

### 5. 事件发射器监听清理（mitter.js）

```javascript
import { EMITTER } from '<!-- 需配置 -->'

// 订阅自定义事件，组件卸载时自动取消订阅
export const cleanup_effect_mitter = (payload) => {
  return [
    EMITTER.on('dialog:open', (data) => {
      // 处理对话框打开事件
    }),
    EMITTER.on('data:refresh', () => {
      // 处理数据刷新事件
    }),
  ]
}
```

### 6. 其他效果清理（other.js）

```javascript
// 用于 ResizeObserver 等自定义观察器
export const cleanup_effect_other = (payload) => {
  const container_ref = payload.container_ref
  const observer = new ResizeObserver((entries) => {
    console.log('容器尺寸变化')
  })
  if (container_ref?.value) {
    observer.observe(container_ref.value)
  }
  return [observer] // 清理时调用 disconnect()
}
```

## 清理机制工作流程

1. **注册阶段**（挂载时）：各 `cleanup_effect_*` 函数返回清理对象列表
2. **活动阶段**（组件可见时）：监听器、观察器、定时器正常工作
3. **清理阶段**（卸载时）：系统自动调用对应的清理方法
   - 监听器 → `removeEventListener`
   - 观察器 → `watcher stop`
   - 定时器 → `clearInterval` / `clearTimeout`
   - DOM 引用 → 置空
   - 事件订阅 → 取消订阅

## 关键约束

- 所有副作用必须通过 `cleanup_effect_*` 注册，禁止在框架外部手动创建监听器
- 每个 `cleanup_effect_*` 函数必须返回数组（即使为空）
- 生命周期钩子保持专注，不在其中写复杂业务逻辑
- 卸载时禁止执行昂贵操作
