# 性能（performance）

> 检查 Vue 项目中的常见性能问题。

## 检查项

### 1. 跑马灯/轮播/动画性能

- **严重级别**：🟡 Warning
- **检查方式**：检查是否使用 `setInterval` 实现动画/轮播效果，而非 `requestAnimationFrame` 或 CSS 动画
- **问题示例**：

```javascript
// 使用 setInterval 做动画
setInterval(() => {
  offset.value += 1
}, 16) // 约 60fps
```

- **正确写法**：

```javascript
// 使用 requestAnimationFrame
function animate() {
  offset.value += 1
  requestAnimationFrame(animate)
}
requestAnimationFrame(animate)
```

- **处理建议**：优先使用 CSS `transition` / `animation`，JS 动画使用 `requestAnimationFrame`

### 2. 大列表未使用虚拟滚动

- **严重级别**：🟡 Warning
- **检查方式**：检查 `v-for` 渲染的列表数据量是否可能超过 100 条，是否使用了虚拟滚动
- **处理建议**：大数据量列表建议使用虚拟滚动组件（如 `vue-virtual-scroller`）

### 3. 不必要的深度 watcher

- **严重级别**：🔵 Info
- **检查方式**：检查 `watch` 中使用了 `deep: true` 但实际只需要监听浅层属性变化
- **问题示例**：

```javascript
watch(
  form,
  (newVal) => {
    // 只关心 form.name 的变化
  },
  { deep: true },
)
```

- **正确写法**：

```javascript
watch(
  () => form.name,
  (newVal) => {
    // ...
  },
)
```

### 4. 频繁触发重渲染

- **严重级别**：🟡 Warning
- **检查方式**：检查是否存在在循环或高频事件中直接修改响应式数据的模式
- **处理建议**：使用 `nextTick` 合并更新，或使用 `shallowRef` 减少响应式开销

### 5. 大体积组件未异步加载

- **严重级别**：🔵 Info
- **检查方式**：检查路由组件是否使用了 `defineAsyncComponent` 或动态 `import()` 懒加载
- **处理建议**：非首屏组件建议使用异步加载

### 6. 图片/资源未懒加载

- **严重级别**：🔵 Info
- **检查方式**：检查 `<img>` 标签是否使用了 `loading="lazy"` 或 IntersectionObserver
- **处理建议**：非首屏图片添加 `loading="lazy"` 属性
