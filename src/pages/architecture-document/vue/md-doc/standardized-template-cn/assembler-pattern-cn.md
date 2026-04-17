---
title: 装配器模式
order: 32
---

# 装配器模式

## 概述

**装配器模式**是自动发现、验证和组合所有模块成内聚上下文的中央编排机制。它是架构的"大脑"。

## 核心概念

无需手动导入和连接模块，装配器：
1. **发现**模块通过 `import.meta.glob()`
2. **验证**模块结构和导出
3. **组合**成统一的上下文对象
4. **注入**到组件通过 `useContextAssembler()` 可组合函数

## 架构

```
import.meta.glob()
  ↓ discovers all modules
  ↓ 发现所有模块
Module Files (JS imports)
模块文件（JS 导入）
  ↓ collection of unorganized imports
  ↓ 无组织导入的集合
Assembler Function (atoms_assembler)
装配器函数 (atoms_assembler)
  ↓ validates, transforms, composes
  ↓ 验证、转换、组合
Unified Context Object
统一上下文对象
  ↓ structured with clear interface
  ↓ 具有清晰接口的结构
useContextAssembler() Composable
useContextAssembler() 可组合函数
  ↓ injects into components
  ↓ 注入到组件
Component Instance
组件实例
  ↓ uses destructured context
  ↓ 使用解构的上下文
Component Logic
组件逻辑
```

## 主装配器设置

### assembler.js

位于 `/assembler/assembler.js`：

```javascript
import { atoms_assembler } from 'src/output/common/project-common.js'

// 1. Public external modules (from composable_common)
// 1. 公共外部模块（来自 composable_common）
const public_assembler = ['useGlobalState']

// 2. Manual assembler modules not in composable_common
// 2. composable_common 中没有的手动装配器模块
const manual_assembler = []

// 3. Current file path for relative imports
// 3. 当前文件路径用于相对导入
const current_file_path = import.meta.url

// 4. Module discovery via glob
// 4. 通过全局模式进行模块发现
const modules = import.meta.glob([
  '../module/**/*.js',
  '../state/*.js'
], {
  eager: true,  // Synchronous loading
               // 同步加载
})

// 5. Assemble and export
// 5. 装配并导出
export const all_atoms_assembler = () => {
  return atoms_assembler({
    public_assembler,
    manual_assembler,
    current_file_path,
    modules,
  })
}
```

## 它如何工作

### 步骤 1：模块发现

```javascript
const modules = import.meta.glob([
  '../module/**/*.js',  // Find all module JS files
                         // 查找所有模块 JS 文件
  '../state/*.js'       // Find all state files
                        // 查找所有状态文件
], {
  eager: true,          // Load synchronously
                        // 同步加载
})
```

结果为：
```javascript
{
  '/path/to/module/lifecycle/lifecycle.js': { lifecycle_onMounted, ... },
  '/path/to/module/emit/emit.js': { create_messaging_emit },
  '/path/to/state/singleton.js': { all_singleton, init_singleton },
  // ... all other modules
  // ... 所有其他模块
}
```

### 步骤 2：模块验证和转换

`atoms_assembler()` 函数：
1. 验证每个模块有适当的导出
2. 按类型分类模块（状态、副作用、生命周期等）
3. 提取函数名称和签名
4. 构建命名空间层次结构

### 步骤 3：上下文组合

创建统一上下文：
```javascript
{
  // State (from state/singleton.js)
  // 状态（来自 state/singleton.js）
  user_info,
  table_data,
  pagination,

  // Computed properties (from state/computed.js)
  // 计算属性（来自 state/computed.js）
  visible_row_count,

  // Lifecycle hooks (from module/lifecycle/lifecycle.js)
  // 生命周期钩子（来自 module/lifecycle/lifecycle.js）
  lifecycle_onBeforeMount,
  lifecycle_onMounted,

  // Emit functions (from module/emit/emit.js)
  // 发射函数（来自 module/emit/emit.js）
  btn_a_click,

  // Exposed methods
  // 公开方法
  handle_xxx_demo,
  handle_query_demo,

  // Event pipeline (dynamically created)
  // 事件管道（动态创建）
  all_event_pipeline: {
    dialog: { handle_dialog_copy_use_confirm_click, ... },
    table: { handle_table_action_confirm_click, ... },
    other: { handle_query_click, ... },
  },
}
```

### 步骤 4：依赖注入

在主组件中：
```javascript
const { user_info, btn_a_click, handle_query_demo } = useContextAssembler(
  base_payload,
  all_atoms_assembler()
)
```

`useContextAssembler()`：
1. 创建带有注入状态的有效载荷
2. 调用所有初始化函数
3. 绑定事件处理程序
4. 返回可用的上下文

## 配置参数

### public_assembler
```javascript
const public_assembler = ['useGlobalState']
```

- 列出来自 `composable_common` 的模块
- 这些在所有页面间共享
- 减少重复

### manual_assembler
```javascript
const manual_assembler = ['custom_module_path']
```

- composable_common 中没有的模块
- 明确列出
- 允许对约定的例外

### current_file_path
```javascript
const current_file_path = import.meta.url
```

- assembler.js 的位置
- 用于相对路径解析
- 确保正确的模块发现

## 模块类型

### 状态模块

**模式**: 导出 `ref()` 或状态初始化函数

```javascript
// singleton/table.js
export const table_data = ref([])
export const init_singleton = () => { ... }
```

### 生命周期模块

**模式**: 导出以 `lifecycle_*` 命名的函数

```javascript
// module/lifecycle/lifecycle.js
export const lifecycle_onMounted = (payload) => { ... }
export const lifecycle_onBeforeUnmount = (payload) => { ... }
```

### 发射模块

**模式**: 导出返回发射处理程序的创建函数

```javascript
// module/emit/emit.js
export const create_messaging_emit = (payload) => {
  return { btn_a_click: () => {...} }
}
```

### 事件管道模块

**模式**: 导出以 `handle_*` 或 `on_*` 命名的函数

```javascript
// module/event-pipeline/module/dialog.js
export const handle_dialog_copy_use_confirm_click = (payload) => { ... }
```

### 效果清理模块

**模式**: 导出返回清理处理程序的 `cleanup_effect_*` 函数

```javascript
// module/effect/watcher.js
export const cleanup_effect_watcher = (payload) => {
  return [watch(...), listener]
}
```

## 创建新模块

### 步骤 1：创建模块文件

创建 `module/custom-feature/custom-feature.js`：

```javascript
export const handle_custom_action = (payload) => {
  const { table_data } = payload
  console.log('Custom action triggered')
  return { success: true }
}
```

### 步骤 2：模块自动发现

装配器自动通过全局模式找到它。

### 步骤 3：在组件中使用

```javascript
const { handle_custom_action } = useContextAssembler(payload, all_atoms_assembler())

// Or via event pipeline if configured
// 或者如果配置了通过事件管道
all_event_pipeline.custom_feature.handle_custom_action()
```

## 高级：自定义装配器

### 包装以自定义逻辑

```javascript
const custom_assembler = () => {
  const base_context = all_atoms_assembler()

  return {
    ...base_context,

    // Add custom derived context
    // 添加自定义派生上下文
    custom_computed: computed(() => {
      return base_context.table_data.value.length > 0
    }),

    // Override behavior
    // 覆盖行为
    handle_custom_action: (payload) => {
      console.log('Custom override')
      return base_context.handle_custom_action(payload)
    },
  }
}
```

## 故障排除

### 模块未发现

1. 检查装配器中的全局模式
2. 验证文件位置匹配模式
3. 确保文件有 `.js` 扩展名
4. 检查设置了 `eager: true`

### 模块未正确导出

1. 验证导出语法：`export const functionName = ...`
2. 检查函数签名匹配模式
3. 确保生命周期函数以 `lifecycle_` 开头
4. 事件处理程序应命名为 `handle_*` 或 `on_*`

### 上下文注入不工作

1. 验证使用正确参数调用 `useContextAssembler()`
2. 检查 `base_payload` 包括所需字段
3. 确保将装配器作为第二个参数传递
4. 通过记录返回的上下文进行调试

## 最佳实践

### ✅ 应该做
- 保持模块专注于单一目的
- 遵循命名约定（lifecycle_、handle_、cleanup_ 等）
- 尽可能导出纯函数
- 使用注释记录模块接口
- 按子目录分组相关模块

### ❌ 不应该做
- 在模块间创建循环依赖
- 在事件处理程序外部变更全局状态
- 在单个模块中混合关注点
- 创建具有隐藏副作用的模块
- 跳过装配器进行手动导入

## 性能考虑

### 模块加载
- `eager: true` 同步加载所有模块
- 如果页面有许多模块，使用 `eager: false` 进行延迟加载
- 全局模式由 Vite 优化

### 上下文组合
- 装配器在组件挂载时运行一次
- 通过解构重用上下文
- 对附加模块无性能影响

## 扩展点

### 添加自定义上下文

```javascript
const all_atoms_assembler = (custom_context) => {
  const base = atoms_assembler({
    public_assembler,
    manual_assembler,
    current_file_path,
    modules,
  })

  return { ...base, ...custom_context }
}
```

### 条件模块加载

```javascript
const modules = import.meta.glob([
  '../module/**/*.js',
  '../state/*.js',
  // Load environment-specific configs
  // 加载环境特定配置
  ...(isAdminMode ? ['../admin-module/**/*.js'] : []),
], { eager: true })
```
