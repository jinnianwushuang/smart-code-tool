# 版本记录

## v1.0.0（2026-09-20）

### 初始版本

- 面向 Flutter 3.24+ / Dart 3.5+ / GetX 4.6+，默认启用 Material 3、null safety、Impeller 渲染引擎
- 建立 10 大检查维度（代码规范、Flutter Widget、性能、内存管理、并发处理、国际化、安全、错误处理、组件设计、代码卫生）
- 共 57 个检查项（i18n 开启时）
- 4 种任务类型：Dart 静态分析审计、深度代码审查、完整检查、国际化专项检查
- Flutter 3 专项：MaterialStateProperty→WidgetStateProperty、WillPopScope→PopScope、primarySwatch→themeMode、Dart 3 Records/Patterns/sealed class
- GetX 专项：View/Controller/Binding 三件套、build 内禁止 Get.put、Obx 粒度下沉、全局 Controller permanent、Worker 生命周期
- 检查报告支持时间戳命名、上次报告对比、总表记录
- 支持指定检查目录，默认遵循 .gitignore 排除规则
- 国际化检查可配置开关，支持多语种键值对比
