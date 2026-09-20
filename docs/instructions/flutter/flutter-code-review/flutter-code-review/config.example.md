# 项目适配配置（完整示例）

> 以一个典型 Flutter 3 + GetX 项目为蓝本的完整填写示例，供参照。

---

## 1.1 技术栈配置

```yaml
state_management: 'getx'
use_getx: true
use_material_3: true
```

## 1.2 代码规范阈值

```yaml
max_file_lines: 400
max_function_lines: 50
min_comment_ratio: 10
```

## 1.3 国际化检查

```yaml
i18n_check_enabled: true
i18n_locale_files:
  - 'lib/translations/zh_CN.dart'
  - 'lib/translations/en_US.dart'
```

## 1.4 检查报告配置

```yaml
code_review_report_dir: './code-review-reports/'
```

## 1.5 排除规则

```yaml
exclude_dirs:
  - 'build'
  - 'android'
  - 'ios'

exclude_files:
  - '*.g.dart'
  - '*.freezed.dart'
```

## 1.6 命名规范配置

```yaml
file_naming: 'snake_case'
variable_naming: 'camelCase'
class_naming: 'PascalCase'
```
