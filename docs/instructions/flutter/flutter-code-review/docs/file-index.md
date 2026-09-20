# 文件索引

> 指令集全部文件的功能索引。

## 目录结构总览

```
flutter-code-review/
├── docs/                          ← 人类文档区
├── flutter-code-review/           ← AI 指令区
│   ├── entry/
│   ├── check-rules/
│   ├── instructions/
│   ├── architecture/
│   ├── config.md
│   ├── config.example.md
│   └── glossary.md
└── VERSION.md
```

## AI 指令区文件索引

### entry/ — AI 入口

| 文件 | 功能 |
|------|------|
| `context-entry.md` | AI 入口文件，定义 5 步加载顺序 |
| `example.md` | 端到端完整示例 |

### check-rules/ — 10 大检查维度

| 文件 | 功能 |
|------|------|
| `code-quality.md` | 代码规范（行数/函数长度/注释/dart analyze/命名） |
| `flutter-widget.md` | Flutter Widget（const/key/build 体积/setState/Material 3/GetX 三件套） |
| `performance.md` | 性能（const/ListView.builder/RepaintBoundary/重建/图片缓存） |
| `memory-management.md` | 内存管理（Controller dispose/监听/Timer/StreamSubscription/GetX） |
| `concurrency.md` | 并发处理（竞态/async gap mounted/Isolate/防抖节流） |
| `i18n-check.md` | 国际化（硬编码/多语种键值对比） |
| `security.md` | 安全（敏感信息/明文存储/http/SQL 注入/正则） |
| `error-handling.md` | 错误处理（try/catch/runZonedGuarded/FlutterError/Dio 拦截器） |
| `component-design.md` | 组件设计（Widget 职责/树深/Binding/循环依赖） |
| `code-hygiene.md` | 代码卫生（print/debugPrint/死代码/魔法数字） |

### instructions/ — 执行指令

| 文件 | 功能 |
|------|------|
| `launcher.md` | 启动器（9 步标准流程） |
| `constraints.md` | 约束规则（8 条硬性约束） |
| `code-standard.md` | 报告编写规范 |
| `gate-check.md` | 门禁检查（4 类前置检查） |
| `common-steps.md` | 通用步骤（A-F） |
| `task-analyze-audit.md` | 任务：Dart 静态分析审计 |
| `task-deep-review.md` | 任务：深度代码审查 |
| `task-full-review.md` | 任务：完整检查 |
| `task-i18n-check.md` | 任务：国际化专项检查 |
| `review-checklist.md` | 复核自检清单 |

### 根级文件

| 文件 | 功能 |
|------|------|
| `config.md` | 填空式配置模板 |
| `config.example.md` | 完整配置示例 |
| `glossary.md` | 术语表 |
| `architecture/check-framework-reference.md` | 检查框架参照 |
| `VERSION.md` | 版本记录 |
