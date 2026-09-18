# 端到端完整示例

> 展示从任务提交到 AI 执行完成的完整流程，供 AI 对齐行为。

## 1. 任务提交格式

```
任务类型：新需求开发
目标类型：单例模板页面
问题描述：新增一个「用户管理」页面，包含用户列表表格、搜索区域、编辑弹窗
原码入口：无（全新页面）
目标目录：src/pages/user-management/
报告地址：默认
附加信息：使用 Ant Design Vue 组件，API 接口为 /api/users
```

## 2. AI 预期执行过程

### 步骤 1：读取上下文
- 读取 config.md → 获取项目路径、UI 框架（ant-design-vue）等配置
- 读取 glossary.md → 统一术语理解
- 读取 architecture/ 参照文件 → 理解装配架构

### 步骤 2：门禁检查
- 检查 config.md 关键配置 → 通过
- 检查目标目录是否存在 → 不存在（新页面，正常）
- 检查依赖 → 通过

### 步骤 3：信息完整性检查
- 需求清晰：用户列表 + 搜索 + 编辑弹窗
- 模板类型：单例模板（需要跨组件共享状态）
- 无歧义 → 继续

### 步骤 4：锁定任务类型
- 任务类型：新需求开发
- 对应指令：task-new-feature.md

### 步骤 5：执行 — 状态设计
- 创建 `state/singleton/table.js`：table_data、table_loading、pagination
- 创建 `state/singleton/dialog.js`：all_dialog_state、edit_form
- 创建 `state/computed.js`：visible_row_count

### 步骤 6：执行 — 事件管道
- 创建 `module/event-pipeline/table.js`：on_table_change
- 创建 `module/event-pipeline/dialog.js`：handle_edit_confirm_click
- 创建 `module/event-pipeline/other.js`：handle_query_click

### 步骤 7：执行 — 组件
- 创建 `component/top-search-area/top-search-area.vue`
- 创建 `component/table-main-area/table-main-area.vue`
- 创建 `component/dialog-wrapper/component/edit-dialog/edit-dialog.vue`

### 步骤 8：执行 — 生命周期
- 更新 `module/lifecycle/lifecycle.js`：onMounted 中调用 handle_init_table_data

### 步骤 9：静态分析自检
- 命名规范 → 通过
- 注释比例 → 12%（≥ 10%）→ 通过
- 文件行数 → 最大 180 行（≤ 400）→ 通过
- 架构合规 → 通过

### 步骤 10：输出报告

```
## 执行报告

### 创建文件清单
1. state/singleton/table.js — 表格状态（table_data, pagination, table_loading）
2. state/singleton/dialog.js — 弹窗状态（all_dialog_state, edit_form）
3. state/computed.js — 计算属性（visible_row_count）
4. module/event-pipeline/table.js — 表格事件（on_table_change）
5. module/event-pipeline/dialog.js — 弹窗事件（handle_edit_confirm_click）
6. module/event-pipeline/other.js — 通用事件（handle_query_click）
7. module/lifecycle/lifecycle.js — 生命周期编排
8. component/top-search-area/top-search-area.vue — 搜索区域
9. component/table-main-area/table-main-area.vue — 表格区域
10. component/dialog-wrapper/component/edit-dialog/edit-dialog.vue — 编辑弹窗
11. index.vue — 主页面
12. assembler/assembler.js — 装配器

### 自检结果
- 命名规范：✅ 通过
- 注释比例：✅ 12%（≥ 10%）
- 文件行数：✅ 最大 180 行（≤ 400）
- 架构合规：✅ 通过

### 建议
- 建议手动启动项目自检，确认功能正常
```
