# 术语表

> 统一术语定义，确保 AI 与使用者理解一致。

## 检查维度

| 术语 | 含义 |
|------|------|
| **代码规范（code-quality）** | 文件行数、函数长度、注释比例、dart analyze 配置、命名规范等基本质量指标 |
| **Flutter Widget（flutter-widget）** | Widget 构建中的最佳实践与反模式检查（const、key、build 体积、setState、Material 3、GetX 三件套） |
| **性能（performance）** | 重建开销、const、ListView.builder、RepaintBoundary、图片缓存等性能相关检查 |
| **内存管理（memory-management）** | Controller dispose、监听、Timer、StreamSubscription、GetX 资源的生命周期管理 |
| **并发处理（concurrency）** | 竞态条件、async gap mounted、Isolate、防抖节流等异步安全检查 |
| **国际化（i18n）** | 硬编码文本检测、多语种文件键值一致性检查 |
| **安全（security）** | 敏感信息、明文存储、http 明文传输、SQL 注入、正则安全等检查 |
| **错误处理（error-handling）** | 异常捕获、runZonedGuarded、FlutterError.onError、Dio 拦截器等检查 |
| **组件设计（component-design）** | Widget 职责、树深、Binding、循环依赖等架构健康检查 |
| **代码卫生（code-hygiene）** | 调试语句残留、死代码、技术债务、重复代码等检查 |

## Flutter 3 / GetX 专项术语

| 术语 | 含义 |
|------|------|
| **Material 3** | Flutter 3 默认设计系统，`useMaterial3: true`，替代旧 Material 2 主题写法 |
| **WidgetStateProperty** | Flutter 3 新 API，替代已废弃的 `MaterialStateProperty` |
| **PopScope** | Flutter 3 新 API，替代已废弃的 `WillPopScope`，用于返回拦截 |
| **三件套** | GetX 的 View（GetView）+ Controller（GetxController）+ Binding（Bindings） |
| **Obx / GetBuilder** | GetX 响应式重建组件；Obx 基于 Rx，GetBuilder 基于手动 update |
| **Worker** | GetX 的 ever/once/debounce/interval 监听器，须在 onClose 中 dispose |
| **Impeller** | Flutter 3 默认渲染引擎，替代 Skia |
| **sealed class / Records / Patterns** | Dart 3 新特性，用于建模与解构 |

## 严重级别

| 术语 | 含义 |
|------|------|
| **🔴 Error** | 必须修复的问题，如资源泄漏、明文存储密钥、数据丢失风险 |
| **🟡 Warning** | 建议修复的问题，如性能隐患、可维护性问题、旧 API 使用 |
| **🔵 Info** | 建议优化的问题，如代码风格、最佳实践 |

## 任务类型

| 术语 | 含义 |
|------|------|
| **Dart 静态分析审计** | 检查 analysis_options.yaml 与 flutter_lints 配置的完整性和合理性 |
| **深度代码审查** | 按 10 大维度逐项审查代码 |
| **完整检查** | 静态分析审计 + 深度审查的组合任务 |
| **国际化专项检查** | 仅检查国际化相关项 |

## 报告相关

| 术语 | 含义 |
|------|------|
| **检查报告** | 单次检查的输出文件，包含所有发现的问题及修复建议 |
| **报告总表（_index.md）** | 记录所有历史检查记录的汇总表 |
| **对比章节** | 新报告与上次报告的差异对比（数量变化、新增/已解决问题） |

## 范围相关

| 术语 | 含义 |
|------|------|
| **检查目录** | 任务命令中指定的检查目标目录，未指定则全项目（默认聚焦 `lib/`） |
| **排除规则** | `.gitignore` + `exclude_dirs` + `exclude_files` 的合并结果 |
