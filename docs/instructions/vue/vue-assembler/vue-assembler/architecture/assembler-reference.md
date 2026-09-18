# 装配器模式参照

## 核心机制

装配器是架构的「大脑」，负责自动发现、验证和组合所有模块，注入到组件中。

**流程**：`import.meta.glob()` 扫描 → `atoms_assembler()` 验证分类 → `useContextAssembler()` 注入组件

## 主装配器标准写法（assembler.js）

```javascript
import { atoms_assembler } from '<!-- 需配置：公共模块导入路径 -->'

// 公共的外部模块（来自 composable_common）
const public_assembler = ['useGlobalState']
// 手动引入的外部模块，不在 composable_common 中的模块
const manual_assembler = []
// 当前文件路径（用于模块扫描的相对路径解析）
const current_file_path = import.meta.url

// 模块扫描 — Vite import.meta.glob 自动发现
const modules = import.meta.glob(['../module/**/*.js', '../state/*.js'], {
  eager: true,
})

// 聚合装配并导出
export const all_atoms_assembler = () => {
  return atoms_assembler({
    public_assembler,
    manual_assembler,
    current_file_path,
    modules,
  })
}
```

## 单例模板额外文件（expose.js）

单例模板比多例模板多一个 `expose.js`，用于声明对外提供的状态和事件通道：

```javascript
// assembler/expose.js — 仅单例模板需要
export const ALL_CONTEXT_STATE = {}
export const ALL_EVENT_PIPELINE = {}
```

## 主组件标准写法（index.vue）

### 多例模板

```vue
<template>
  <div>{{ user_info }}</div>
  <ComponentDemo :parent_payload="payload" />
</template>

<script setup>
import { useContextAssembler } from '<!-- 需配置：useContextAssembler 导入路径 -->'
import { all_atoms_assembler } from './assembler/assembler.js'
import ComponentDemo from './component/component-demo/component-demo.vue'

// 定义当前组件对下游组件提供的状态机挂载点
const ALL_CONTEXT_STATE = {}
// 定义当前组件对下游组件提供的事件通道挂载点
const ALL_EVENT_PIPELINE = {}
// 记录当前文件路径
const VUE_FILE_PATH = import.meta.url

// 组件内定义的 props
const props = defineProps({})
// 组件内定义的 emit
const emit = defineEmits([])
// 下游组件调用的 income 通道，指定函数名字
const income_pipeline = []
// 需要包装 payload 给当前组件模板内直接用的函数名字
const wrap_payload = []

// 基础上下文
const base_payload = {
  props,
  emit,
  income_pipeline,
  wrap_payload,
  ALL_CONTEXT_STATE,
  ALL_EVENT_PIPELINE,
  VUE_FILE_PATH,
}

const payload = useContextAssembler(base_payload, all_atoms_assembler())
const { user_info, btn_a_click } = payload
</script>
```

### 单例模板（差异部分）

```vue
<script setup>
import { useContextAssembler } from '<!-- 需配置 -->'
import { all_atoms_assembler } from './assembler/assembler.js'
// 单例模板从 expose.js 导入挂载点
import { ALL_CONTEXT_STATE, ALL_EVENT_PIPELINE } from './assembler/expose.js'

const base_payload = {
  props,
  emit,
  income_pipeline,
  wrap_payload,
  ALL_CONTEXT_STATE, // 来自 expose.js
  ALL_EVENT_PIPELINE, // 来自 expose.js
  VUE_FILE_PATH,
}

const { user_info, btn_a_click } = useContextAssembler(base_payload, all_atoms_assembler())

// 单例模板通常需要 provide 给更深层级的子组件
import { provide } from 'vue'
provide('ALL_EVENT_PIPELINE', ALL_EVENT_PIPELINE)
provide('ALL_CONTEXT_STATE', ALL_CONTEXT_STATE)
</script>
```

## 模块命名规则

| 模块类型   | 文件位置                        | 导出函数命名规则            | 示例                                                    |
| ---------- | ------------------------------- | --------------------------- | ------------------------------------------------------- |
| 状态模块   | `state/*.js`                    | 直接导出 `ref()` 或状态函数 | `export const table_data = ref([])`                     |
| 生命周期   | `module/lifecycle/lifecycle.js` | `lifecycle_*`               | `export const lifecycle_onMounted = (payload) => {}`    |
| 事件发射   | `module/emit/emit.js`           | `create_messaging_emit`     | 返回发射处理程序对象                                    |
| 事件管道   | `module/event-pipeline/*.js`    | `handle_*` 或 `on_*`        | `export const handle_query_click = (payload) => {}`     |
| 副作用清理 | `module/effect/*.js`            | `cleanup_effect_*`          | `export const cleanup_effect_watcher = (payload) => {}` |
| 暴露方法   | `module/exposed-method/*.js`    | 直接导出函数                | `export const handle_xxx = (payload) => {}`             |
| 工具方法   | `module/other-method/*.js`      | 直接导出函数                | `export const handle_query_demo = (payload) => {}`      |

## 新增模块的标准步骤

1. 在 `module/` 对应子目录下创建 `.js` 文件
2. 按命名规则导出函数（`handle_*`、`cleanup_effect_*` 等）
3. **无需手动注册** — `import.meta.glob` 自动发现
4. 函数第一个参数统一为 `payload`（统一上下文对象）

## 关键约束

- 模块文件必须使用 `.js` 扩展名（或 `.ts`，取决于配置）
- `import.meta.glob` 的扫描路径可在 config.md 中配置
- 每个模块保持单一职责，禁止跨关注点混合
- 禁止在模块间创建循环依赖
- 禁止跳过装配器进行手动导入
