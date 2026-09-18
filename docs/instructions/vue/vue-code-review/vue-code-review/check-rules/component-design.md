# 组件设计（component-design）

> 检查 Vue 组件的设计合理性，确保可维护性和架构健康。

## 检查项

### 1. 组件职责过多（>500 行 template）

- **严重级别**：🟡 Warning
- **检查方式**：检查 `<template>` 部分的行数是否超过 500 行
- **处理建议**：拆分为多个子组件，每个子组件负责一个独立的功能区域
- **拆分策略**：
  - 主组件负责布局与状态协调
  - 独立子组件封装特定 UI 交互（如弹窗、表格）
  - 工具函数文件存放纯逻辑处理（解析、统计、格式化等）

### 2. Props 透传超过 3 层（Prop Drilling）

- **严重级别**：🟡 Warning
- **检查方式**：检查某个 prop 是否从祖先组件逐层传递超过 3 级才到达使用它的组件
- **问题示例**：

```
App.vue → Layout.vue → Page.vue → Section.vue → Card.vue
                                    ↑ data 从 App 传到 Card 经过 4 层
```

- **处理建议**：使用 `provide/inject` 或状态管理（Pinia/Vuex）替代逐层传递

### 3. 组件直接修改 props

- **严重级别**：🔴 Error
- **检查方式**：检查组件内是否存在直接修改 props 值的操作
- **问题示例**：

```javascript
const props = defineProps({ count: Number })

function increment() {
  props.count++ // 直接修改 prop
}
```

- **正确写法**：

```javascript
const props = defineProps({ count: Number })
const emit = defineEmits(['update:count'])

function increment() {
  emit('update:count', props.count + 1)
}
```

### 4. 过度使用 `ref` 操作 DOM

- **严重级别**：🔵 Info
- **检查方式**：检查是否频繁使用 `ref` 获取 DOM 引用并手动操作 DOM（如 `style`、`classList`、`innerHTML`）
- **问题示例**：

```javascript
const inputRef = ref(null)

onMounted(() => {
  inputRef.value.style.display = 'block'
  inputRef.value.classList.add('active')
  inputRef.value.innerHTML = '<span>text</span>'
})
```

- **处理建议**：优先使用声明式模板（`v-show`、`:class`、`v-html`）替代手动 DOM 操作

### 5. 循环依赖（A 导入 B，B 导入 A）

- **严重级别**：🔴 Error
- **检查方式**：检查模块间是否存在循环导入关系
- **问题示例**：

```javascript
// a.js
import { funcB } from './b.js'

// b.js
import { funcA } from './a.js'
```

- **处理建议**：
  - 抽取公共逻辑到第三个模块
  - 使用 `defineEmits` / `provide/inject` 解耦组件关系
  - 延迟导入（动态 `import()`）
