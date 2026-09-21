# 目录结构与文件命名约定

## 标准页面目录结构

```
pages/
└── user-management/
    ├── index.jsx                    # 页面入口组件
    ├── hooks/                       # 页面级 Hooks
    │   └── use-user-management.js   # 页面状态与逻辑
    ├── components/                  # 页面级组件
    │   ├── SearchBar.jsx
    │   ├── DataTable.jsx
    │   └── ActionDialog.jsx
    ├── actions/                     # 页面级 Actions（React 19）
    │   └── create-user-action.js
    └── styles/
        └── index.module.css         # CSS Modules 样式
```

## 全局共享目录结构

```
src/
├── app/                             # 应用入口与路由布局
│   ├── layout.jsx                   # 根布局
│   └── providers.jsx                # 全局 Provider 聚合
├── pages/                           # 页面目录（按路由组织）
│   ├── dashboard/
│   ├── user-management/
│   └── settings/
├── components/                      # 全局共享组件
│   ├── ui/                          # 基础 UI 组件
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   └── Table.jsx
│   └── layout/                      # 布局组件
│       ├── Header.jsx
│       └── Sidebar.jsx
├── hooks/                           # 全局共享 Hooks
│   ├── use-api.js
│   ├── use-debounce.js
│   └── use-auth.js
├── store/                           # 全局状态管理
│   ├── use-auth-store.js
│   └── use-theme-store.js
├── lib/                             # 工具库
│   ├── api.js                       # API 客户端
│   ├── utils.js                     # 通用工具函数
│   └── constants.js                 # 常量定义
└── styles/                          # 全局样式
    ├── globals.css
    └── variables.css
```

## 文件命名规则

| 类型        | 命名规则                           | 示例                                        |
| ----------- | ---------------------------------- | ------------------------------------------- |
| 组件文件    | `PascalCase.jsx`                   | `SearchBar.jsx`、`DataTable.jsx`            |
| Hook 文件   | `kebab-case.js`，`use-` 前缀       | `use-user-management.js`、`use-debounce.js` |
| Action 文件 | `kebab-case.js`，`-action` 后缀    | `create-user-action.js`                     |
| Store 文件  | `kebab-case.js`，`use-` 前缀       | `use-auth-store.js`                         |
| 工具文件    | `kebab-case.js`                    | `utils.js`、`api.js`                        |
| 样式文件    | `index.module.css` 或 `index.scss` | 与组件同名或 `index`                        |
| 目录名      | `kebab-case`                       | `user-management/`、`action-dialog/`        |

## 变量命名规则

| 类型        | 命名规则                | 示例                               |
| ----------- | ----------------------- | ---------------------------------- |
| 组件名      | `PascalCase`            | `SearchBar`、`DataTable`           |
| Hook 名     | `camelCase`，`use` 前缀 | `useUserManagement`、`useDebounce` |
| 函数名      | `camelCase`             | `handleQuery`、`loadTableData`     |
| 事件处理    | `handle` 前缀           | `handleQuery`、`handleTableChange` |
| 状态变量    | `camelCase`             | `tableData`、`isLoading`           |
| 常量        | `UPPER_SNAKE_CASE`      | `API_BASE_URL`、`MAX_RETRY_COUNT`  |
| Action type | `UPPER_SNAKE_CASE`      | `'FETCH_START'`、`'ADD_ITEM'`      |

## 新增模块的放置规则

| 需求类型      | 放置位置                       | 说明                             |
| ------------- | ------------------------------ | -------------------------------- |
| 新页面        | `pages/<页面名>/index.jsx`     | 含 hooks/、components/、actions/ |
| 页面级 Hook   | `pages/<页面名>/hooks/`        | 只在该页面内使用                 |
| 页面级组件    | `pages/<页面名>/components/`   | 只在该页面内使用                 |
| 全局共享 Hook | `src/hooks/`                   | 多个页面使用                     |
| 全局共享组件  | `src/components/ui/`           | 多个页面使用                     |
| 全局状态      | `src/store/`                   | 跨页面共享状态                   |
| API 函数      | `src/lib/api.js` 或 `src/api/` | 按模块拆分                       |

## 关键约束

- 组件文件必须使用 `.jsx` 扩展名（含 JSX 语法）
- 纯逻辑文件使用 `.js` 扩展名（Hook、工具函数等）
- 页面级资源放在页面目录内，全局资源放在 `src/` 对应目录
- 禁止在 `src/components/` 中放置页面级业务逻辑
- 禁止在 `pages/` 中放置跨页面共享的组件或 Hook
