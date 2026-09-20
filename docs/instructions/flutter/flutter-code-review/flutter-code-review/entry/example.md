# 端到端完整示例

> 展示从任务提交到 AI 检查完成的完整流程。

## 1. 任务提交格式

```
任务类型：深度代码审查
检查目录：lib/modules/user/
报告地址：默认
附加信息：重点关注 Controller 资源释放
```

## 2. AI 预期执行过程

### 步骤 1：读取上下文
- 读取 config.md → 获取状态管理（getx）、use_material_3、阈值配置等
- 读取 glossary.md → 统一术语理解
- 读取 check-framework-reference.md → 理解 10 大维度和严重级别

### 步骤 2：门禁检查
- 检查 config.md 关键配置 → 通过
- 检查 pubspec.yaml 存在 → 通过
- 检查 .gitignore 存在 → 通过
- 检查目标目录存在 → 通过

### 步骤 3：确定检查范围
- 检查目录：`lib/modules/user/`
- 读取 .gitignore → 排除 build、.dart_tool 等
- 排除生成文件 → `*.g.dart`、`*.freezed.dart`
- 扫描目标文件 → 找到 15 个 .dart 文件

### 步骤 4：锁定任务类型
- 任务类型：深度代码审查
- 对应指令：task-deep-review.md

### 步骤 5-11：逐维度检查
- 维度 1 代码规范 → 发现 2 个 Warning（文件超 400 行）
- 维度 2 Flutter Widget → 发现 2 个 Warning（build 内 Get.put、缺 const）
- 维度 3 性能 → 发现 1 个 Info（长列表未用 ListView.builder）
- 维度 4 内存管理 → 发现 2 个 Error（TextEditingController / Worker 未释放）
- 维度 5 并发 → 发现 1 个 Warning（async gap 后未判 mounted）
- 维度 6 i18n → 发现 1 个 Warning（硬编码中文）
- 维度 7 安全 → 通过
- 维度 8 错误处理 → 发现 1 个 Warning（Dio 请求无 try/catch）
- 维度 9 组件设计 → 通过
- 维度 10 代码卫生 → 发现 3 个 Info（print 残留）

### 步骤 12：生成报告

```
## 执行报告

### 检查概况
- 检查目标：lib/modules/user/
- 检查文件数：15
- 发现问题：Error: 2 / Warning: 7 / Info: 4

### 🔴 Error
1. [memory-management] user_form_controller.dart — TextEditingController 未在 onClose 中 dispose
2. [memory-management] user_list_controller.dart — Worker(ever) 未在 onClose 中 dispose

### 🟡 Warning
1. [code-quality] user_list_view.dart — 文件行数 456 行（>400）
2. [flutter-widget] user_list_view.dart — build 内调用 Get.put（应在 Binding 中注入）
3. [flutter-widget] user_card.dart — 静态 Widget 缺少 const 构造
4. [concurrency] user_controller.dart — await 后访问 context/state 未判 mounted
5. [i18n] user_list_view.dart — 硬编码中文「加载中」未走 .tr
6. [error-handling] user_api.dart — Dio 请求无 try/catch
7. [code-quality] user_service.dart — 文件行数 412 行（>400）

### 🔵 Info
1. [performance] user_list_view.dart — 长列表未使用 ListView.builder
2. [code-hygiene] user_controller.dart — 3 处 print 残留
3. [code-hygiene] user_service.dart — 2 处 TODO 注释
4. [code-quality] user_list_view.dart — 注释比例 8%（<10%）

### 建议
- 建议优先修复 2 个 Error（资源泄漏风险）
- GetX 三件套相关项建议统一到 Binding 注入
- 建议手动启动项目自检，确认功能正常
```
