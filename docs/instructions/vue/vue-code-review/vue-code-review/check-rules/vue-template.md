# Vue 模板（vue-template）

> 检查 Vue 模板和组件中的最佳实践与常见反模式。

## 检查项

### 1. v-for 缺少 key 或 key 使用 index

- **严重级别**：🟡 Warning
- **检查方式**：扫描所有 `v-for` 指令，检查是否有 `:key` 绑定，以及 key 是否使用了 `index`
- **问题示例**：

```html
<!-- 缺少 key -->
<li v-for="item in list">{{ item.name }}</li>

<!-- key 使用 index -->
<li v-for="(item, index) in list" :key="index">{{ item.name }}</li>
```

- **正确写法**：

```html
<li v-for="item in list" :key="item.id">{{ item.name }}</li>
```

### 2. v-html 使用

- **严重级别**：🔴 Error（XSS 风险）
- **检查方式**：扫描所有 `v-html` 指令
- **处理建议**：确认内容来源是否安全，优先使用文本插值 `{{ }}`

### 3. 组件 props 缺少类型验证

- **严重级别**：🟡 Warning
- **检查方式**：检查 `defineProps` 或 `props` 选项是否声明了类型
- **问题示例**：

```javascript
// 未声明类型
const props = defineProps(['title', 'count'])
```

- **正确写法**：

```javascript
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
})
```

### 4. 模板内嵌套过深（>3 层 v-if/v-for）

- **严重级别**：🔵 Info
- **检查方式**：检查模板中 `v-if` / `v-for` / `v-else` 的嵌套层级
- **处理建议**：超过 3 层则建议拆分为子组件或使用 computed 预处理数据

### 5. 未使用的组件/导入

- **严重级别**：🔵 Info
- **检查方式**：检查 `<script>` 中导入但未在 `<template>` 或逻辑中使用的变量、组件
- **处理建议**：移除未使用的导入

### 6. computed 可替代 watch 的场景

- **严重级别**：🔵 Info
- **检查方式**：检查 `watch` 中是否存在「监听一个值 → 修改另一个值」的模式
- **处理建议**：此类场景应使用 `computed` 替代

### 7. 模板中复杂表达式未抽取为 computed

- **严重级别**：🔵 Info
- **检查方式**：检查模板中是否存在复杂的 JavaScript 表达式（如链式调用、三元嵌套、filter/map）
- **处理建议**：抽取为 `computed` 属性

### 8. CSS deep 选择器不合规

- **严重级别**：🟡 Warning
- **检查方式**：扫描 `<style>` 中是否使用了 Vue 2 的 deep 选择器语法
- **不合规写法**：

```css
/* Vue 2 语法，Vue 3 不支持 */
::v-deep .child-class {
  color: red;
}
/deep/ .child-class {
  color: red;
}
>>> .child-class {
  color: red;
}
```

- **正确写法**：

```css
:deep(.child-class) {
  color: red;
}
```

### 9. 组件内写全局 CSS 样式

- **严重级别**：🟡 Warning
- **检查方式**：检查 `<style>` 标签是否缺少 `scoped` 属性，或是否滥用 `:global()`
- **问题示例**：

```html
<!-- 未加 scoped，样式全局生效 -->
<style>
  .header {
    background: red;
  }
</style>
```

- **处理建议**：全局样式应统一放在项目全局样式文件中，组件内使用 `<style scoped>`
