# 定制指南

> 基于代码模板进行定制化修改的完整指南。

## UI 框架替换

模板默认基于 **Quasar + Ant Design Vue**，可以替换为其他 UI 框架。

### 替换 Checklist

按以下顺序逐步替换，每步完成后建议编译确认：

| 步骤 | 操作 | 涉及文件 |
|------|------|---------|
| 1 | 替换 CSS 变量文件 | `src/css/quasar-variables.scss` → 目标框架变量文件 |
| 2 | 替换 Vue 模板标签 | `src/standardization/**/*.vue` 中的 `<q-*>` 标签 |
| 3 | 替换 JS 框架 API | `src/composable/**/useGlobalVariable.js` 中的 `useQuasar()` |
| 4 | 更新 Vite 配置 | `vite.config.js` 中的插件配置 |

### 常见框架组件映射

| Quasar | Element Plus | 说明 |
|--------|-------------|------|
| `<q-btn>` | `<el-button>` | 按钮 |
| `<q-dialog>` | `<el-dialog>` | 弹窗 |
| `<q-input>` | `<el-input>` | 输入框 |
| `<q-table>` | `<el-table>` | 表格 |
| `<q-select>` | `<el-select>` | 下拉选择 |
| `<q-card>` | `<el-card>` | 卡片 |
| `<q-tabs>` | `<el-tabs>` | 标签页 |
| `useQuasar()` | `useElementPlus()` | JS API |

| Quasar | Naive UI | 说明 |
|--------|----------|------|
| `<q-btn>` | `<n-button>` | 按钮 |
| `<q-dialog>` | `<n-dialog>` / `<n-modal>` | 弹窗 |
| `<q-input>` | `<n-input>` | 输入框 |
| `<q-table>` | `<n-data-table>` | 表格 |

### 联动修改范围

更换 UI 框架后，以下文件会受影响：

```
src/css/quasar-variables.scss          ← 替换为框架变量文件
src/standardization/**/*.vue           ← 替换组件标签
src/composable/**/useGlobalVariable.js ← 替换框架 API
vite.config.js                         ← 替换插件配置
```

---

## 修改模板创建业务组件

以多例模板为基础创建新组件：

1. 复制 `standardization/multiton-template/` 整个目录
2. 重命名为你的业务组件名（如 `user-management/`）
3. 修改 `assembler/assembler.js` 中的 `public_assembler` 列表
4. 在 `state/` 下定义你的状态
5. 在 `module/` 下添加你的功能模块
6. 在 `component/` 下添加你的子组件

## 添加新的 Effect 模块

在 `module/effect/` 下新增文件：

| 文件名 | 用途 | 自动清理 |
|--------|------|---------|
| `timer.js` | 定时器（setInterval / setTimeout） | ✅ onUnmounted 自动清理 |
| `listener.js` | 原生事件监听（addEventListener） | ✅ 自动清理 |
| `watcher.js` | Vue 监听器（watch / watchEffect） | ✅ 自动清理 |
| `dom.js` | DOM 操作 | 需手动管理 |
| `mitter.js` | 事件总线通信（mitt） | 需手动管理 |
| `other.js` | 其他副作用 | 需手动管理 |

## 扩展状态管理

在 `state/` 下新增文件即可，装配器通过 `import.meta.glob` 自动扫描：

```javascript
// state/my-new-state.js
export const create_my_new_state = (payload) => {
  const { ref, computed } = payload
  return {
    MY_STATE: ref(null),
    MY_COMPUTED: computed(() => /* ... */),
  }
}
```

## 自定义事件通道

在 `module/event-pipeline/` 下新增文件：

```javascript
// module/event-pipeline/my-pipeline.js
export const create_event_pipeline_my_pipeline = (payload) => {
  const { EMITTER } = payload
  return (income_data) => {
    EMITTER.emit('my-event', income_data)
  }
}
```

## 调整模块扫描规则

修改 `assembler/assembler.js` 中的 glob 模式：

```javascript
// 默认扫描
const modules = import.meta.glob(['../module/**/*.js', '../state/*.js'], { eager: true })

// 自定义：增加扫描目录
const modules = import.meta.glob(['../module/**/*.js', '../state/*.js', '../shared/*.js'], { eager: true })
```

**注意**：文件名以 `___` 结尾的文件会被自动排除（约定：不参与聚合的辅助文件）。

---

## 模板维护策略

### 版本追踪

本模板基于源项目 Vue 3 装配架构，`VERSION.md` 记录每次代码同步的变更内容。

### 更新流程

如需获取最新架构代码：

1. 重新下载 `vue-arch-starter.zip`
2. 对比 `VERSION.md` 中的变更说明
3. 将变更手动合并到你的项目中

### 安全覆盖区 vs 手动合并区

| 区域 | 更新策略 | 说明 |
|------|---------|------|
| `common/architecture-design/` | **安全覆盖** | 装配引擎核心，一般不修改，可直接覆盖 |
| `composable/architecture-design/` | **安全覆盖** | 组合函数核心，可直接覆盖 |
| `css/` | **安全覆盖** | 全局样式变量，可直接覆盖 |
| `standardization/` | **需手动合并** | 你可能已基于模板创建了业务组件 |
| `composable/index.js` | **需手动合并** | 你可能已添加了自定义 composable |
