# 端到端完整示例

> 展示从任务提交到 AI 执行完成的完整流程，供 AI 对齐行为。

## 1. 任务提交格式

```
任务类型：新需求开发
问题描述：新增一个「用户管理」页面，包含用户列表表格、搜索区域、编辑弹窗
目标目录：src/pages/user-management/
报告地址：默认
附加信息：使用 Ant Design 组件，API 接口为 /api/users，状态管理用 Zustand
```

## 2. AI 预期执行过程

### 步骤 1：读取上下文
- 读取 config.md → 获取项目路径、UI 框架（antd）、状态管理（zustand）等配置
- 读取 glossary.md → 统一术语理解
- 读取 architecture/ 参照文件 → 理解 Hooks + Composition 架构

### 步骤 2：门禁检查
- 检查 config.md 关键配置 → 通过
- 检查目标目录是否存在 → 不存在（新页面，正常）
- 检查依赖 → 通过

### 步骤 3：信息完整性检查
- 需求清晰：用户列表 + 搜索 + 编辑弹窗
- 无歧义 → 继续

### 步骤 4：锁定任务类型
- 任务类型：新需求开发
- 对应指令：task-new-feature.md

### 步骤 5：执行 — 创建目录结构
```
pages/user-management/
├── index.jsx
├── hooks/
│   └── use-user-management.js
├── components/
│   ├── SearchBar.jsx
│   ├── DataTable.jsx
│   └── EditDialog.jsx
├── actions/
│   └── update-user-action.js
└── styles/
    └── index.module.css
```

### 步骤 6：执行 — 页面 Hook
- 创建 `hooks/use-user-management.js`
- 声明状态：users、loading、pagination、searchParams、editForm、dialogVisible
- 实现数据获取：fetchUsers
- 实现事件处理：handleSearch、handlePageChange、handleEdit、handleDelete
- 实现初始加载：useEffect 中调用 fetchUsers

### 步骤 7：执行 — Actions（如需表单提交）
- 创建 `actions/update-user-action.js`
- 使用 useActionState 处理表单提交
- 实现服务端验证与错误处理

### 步骤 8：执行 — 组件
- 创建 `components/SearchBar.jsx` — 搜索区域
- 创建 `components/DataTable.jsx` — 表格区域
- 创建 `components/EditDialog.jsx` — 编辑弹窗
- 创建 `index.jsx` — 页面入口，调用 Hook 并组合子组件

### 步骤 9：静态分析自检
- 命名规范 → 通过
- 注释比例 → 12%（≥ 10%）→ 通过
- 文件行数 → 最大 180 行（≤ 200/300）→ 通过
- Compiler 兼容 → 无手写 useMemo/useCallback → 通过
- 架构合规 → 通过

### 步骤 10：输出报告

```
## 执行报告

### 创建文件清单
1. hooks/use-user-management.js — 页面 Hook（状态 + 事件 + 数据获取）
2. actions/update-user-action.js — 用户更新 Action
3. components/SearchBar.jsx — 搜索区域组件
4. components/DataTable.jsx — 表格组件
5. components/EditDialog.jsx — 编辑弹窗组件
6. index.jsx — 页面入口
7. styles/index.module.css — 页面样式

### 自检结果
- 命名规范：✅ 通过
- 注释比例：✅ 12%（≥ 10%）
- 文件行数：✅ 最大 180 行（≤ 200/300）
- Compiler 兼容：✅ 无手写 useMemo/useCallback
- 架构合规：✅ 通过

### 建议
- 建议手动启动项目自检，确认功能正常
```
