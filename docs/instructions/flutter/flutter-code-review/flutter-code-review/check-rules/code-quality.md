# 代码规范（code-quality）

> 检查代码的基本质量指标，包括文件行数、函数长度、注释比例、dart analyze 配置和命名规范。

## 检查项

### 1. 单文件最大行数

- **默认阈值**：400 行（可通过 config.md 的 `max_file_lines` 配置）
- **严重级别**：🟡 Warning
- **检查方式**：统计每个 `.dart` 文件的总行数（排除生成文件）
- **处理建议**：超过阈值则建议拆分为子 Widget、Controller 或工具类

### 2. 单函数/方法体最大行数

- **默认阈值**：50 行（可通过 config.md 的 `max_function_lines` 配置）
- **严重级别**：🟡 Warning
- **检查方式**：检查每个函数/方法（含 `build`）定义体的行数
- **处理建议**：超过阈值则建议拆分为多个私有方法或子 Widget

### 3. 注释比例下限

- **默认阈值**：10%（可通过 config.md 的 `min_comment_ratio` 配置）
- **严重级别**：🔵 Info
- **检查方式**：统计 `//` 与 `///` 注释行数占总行数的比例
- **处理建议**：低于阈值则建议为公共 API 补充 `///` 文档注释

### 4. analysis_options.yaml 是否存在

- **严重级别**：🟡 Warning
- **检查方式**：检查项目根目录是否存在 `analysis_options.yaml`
- **处理建议**：不存在则建议创建并引入 `flutter_lints`

### 5. 是否引入 flutter_lints 规则集

- **严重级别**：🔵 Info
- **检查方式**：检查 `analysis_options.yaml` 的 `include` 是否包含 `package:flutter_lints/flutter.yaml`
- **处理建议**：未包含则建议安装并配置

```yaml
# pubspec.yaml
dev_dependencies:
  flutter_lints: ^4.0.0
```

```yaml
# analysis_options.yaml
include: package:flutter_lints/flutter.yaml
analyzer:
  language:
    strict-casts: true
    strict-raw-types: true
linter:
  rules:
    - prefer_const_constructors
    - use_build_context_synchronously
    - avoid_print
```

### 6. 命名规范一致性

- **严重级别**：🔵 Info
- **检查方式**：检查文件名、变量名、类名是否遵循统一规范
- **命名规则**（可通过 config.md 配置）：
  - 文件名：`snake_case`（如 `user_list_view.dart`，Dart 官方约定）
  - 变量名：`camelCase`（如 `userList`）
  - 类/Widget 名：`PascalCase`（如 `UserListView`）
