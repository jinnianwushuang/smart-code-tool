# 端到端完整示例

> 展示从任务提交到 AI 执行完成的完整流程，供 AI 对齐行为。

## 1. 任务提交格式

```
任务类型：新需求开发
问题描述：新增一个「用户管理」页面，包含用户列表、搜索区域、编辑弹窗
目标目录：lib/features/user_management/
报告地址：默认
附加信息：使用 Material 3 组件，API 接口为 /api/users，状态管理用 GetX
```

## 2. AI 预期执行过程

### 步骤 1：读取上下文
- 读取 config.md → 获取项目路径、UI 风格（material3）、API 库（dio）等配置
- 读取 glossary.md → 统一术语理解
- 读取 architecture/ 参照文件 → 理解 GetX 装配架构

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
lib/features/user_management/
├── bindings/
│   └── user_management_binding.dart
├── controllers/
│   └── user_management_controller.dart
├── pages/
│   └── user_management_page.dart
├── widgets/
│   ├── search_bar.dart
│   ├── data_table.dart
│   └── edit_dialog.dart
├── models/
│   └── user.dart
└── services/
    └── user_api.dart
```

### 步骤 6：执行 — Controller
- 创建 `user_management_controller.dart`
- 声明响应式状态：users（RxList）、isLoading、searchKeyword
- 声明简单状态：_currentPage
- 实现 onInit：设置搜索防抖
- 实现 onReady：首次数据加载
- 实现 onClose：清理 Rx 变量和防抖
- 实现事件处理：handleSearchChange、handlePageChange、handleEdit

### 步骤 7：执行 — Binding
- 创建 `user_management_binding.dart`
- Get.lazyPut 注册 Controller（fenix: true）

### 步骤 8：执行 — Widget
- 创建 `user_management_page.dart` — 页面入口（GetView）
- 创建 `widgets/search_bar.dart` — 搜索区域
- 创建 `widgets/data_table.dart` — 表格区域（Obx 包裹）
- 创建 `widgets/edit_dialog.dart` — 编辑弹窗

### 步骤 9：静态分析自检
- 命名规范 → 通过
- 注释比例 → 12%（≥ 10%）→ 通过
- 文件行数 → 最大 180 行（≤ 200/300）→ 通过
- GetX 约束 → build 内无 Get.put、Obx 下沉 → 通过
- 架构合规 → 通过

### 步骤 10：输出报告

```
## 执行报告

### 创建文件清单
1. controllers/user_management_controller.dart — Controller（状态 + 事件 + API）
2. bindings/user_management_binding.dart — Binding
3. pages/user_management_page.dart — 页面入口
4. widgets/search_bar.dart — 搜索区域
5. widgets/data_table.dart — 表格区域
6. widgets/edit_dialog.dart — 编辑弹窗
7. models/user.dart — 用户数据模型
8. services/user_api.dart — 用户 API 服务

### 自检结果
- 命名规范：✅ 通过
- 注释比例：✅ 12%（≥ 10%）
- 文件行数：✅ 最大 180 行（≤ 200/300）
- GetX 约束：✅ 通过
- 架构合规：✅ 通过

### 建议
- 建议手动启动项目自检，确认功能正常
```
