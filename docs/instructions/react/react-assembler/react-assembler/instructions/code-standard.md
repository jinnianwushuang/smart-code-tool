# 代码规范

> AI 生成的所有代码必须符合以下规范。

## 1. 命名规范

- **组件文件名**：`PascalCase.jsx`（如 `SearchBar.jsx`、`DataTable.jsx`）
- **Hook/工具文件名**：`kebab-case.js`（如 `use-user-management.js`）
- **组件名**：`PascalCase`（如 `SearchBar`、`DataTable`）
- **Hook 名**：`camelCase`，`use` 前缀（如 `useUserManagement`）
- **函数名**：`camelCase`（如 `handleQuery`、`loadTableData`）
- **事件处理函数**：`handle` 前缀（如 `handleQuery`、`handleSubmit`）
- **状态变量**：`camelCase`（如 `tableData`、`isLoading`）
- **常量**：`UPPER_SNAKE_CASE`（如 `API_BASE_URL`）

## 2. 注释规范

- 所有代码注释使用**中文**（或按 config.md 中的 `comment_language` 配置）
- 注释比例不低于 **10%**
- 每个导出函数/Hook 必须有 JSDoc 或功能说明注释
- 复杂逻辑必须有行内注释

## 3. 组件规范

- 仅使用函数组件，禁止 class 组件
- 禁止手写 `useMemo`/`useCallback`/`forwardRef`（React Compiler 自动处理）
- 禁止使用 `defaultProps`/`propTypes`（使用函数参数默认值 + JSDoc）
- 组件保持单一职责，复杂逻辑抽取到 Hook
- 禁止在组件内部定义子组件
- 单个组件文件不超过 200 行

## 4. Hook 规范

- Hook 必须以 `use` 开头
- 禁止在条件/循环/嵌套函数中调用 Hook
- 副作用（useEffect）必须有清理函数
- 状态更新使用函数式更新避免闭包陷阱：`setState((prev) => ...)`
- 单个 Hook 文件不超过 300 行

## 5. Server/Client 边界

- `'use client'` 必须放在文件第一行
- Server Component 不能使用 Hook 和事件处理
- 敏感信息只能出现在 Server Component 中

## 6. CSS 编写优先级

```
1. UI 框架组件内置样式（如 <Table />、<Modal /> 等）
2. 项目已安装插件提供的样式
3. 全局 CSS / CSS 变量（参照 config.md 中的资源清单）
4. CSS Modules（最后手段）
```

**禁止产生不通用的 CSS。** 写样式前必须先查阅 config.md 中的项目可用资源清单。

## 7. 代码量约束

- 单组件文件不超过 **200 行**，超出必须拆分组件或抽取 Hook
- 单 Hook 文件不超过 **300 行**，超出必须拆分
- 单函数不超过 **50 行**，超出必须拆分或抽取子函数
- 注释比例不低于 **10%**
