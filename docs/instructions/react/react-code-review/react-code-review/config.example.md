# 项目适配配置（完整示例）

> 以一个典型 React 19 + antd + Vite 项目为蓝本的完整填写示例，供参照。

---

## 1.1 技术栈配置

```yaml
ui_framework: 'antd'
react_compiler: true
app_runtime: 'spa'
```

## 1.2 代码规范阈值

```yaml
max_file_lines: 400
max_function_lines: 50
min_comment_ratio: 10
```

## 1.3 国际化检查

```yaml
i18n_check_enabled: false
i18n_locale_files: []
```

## 1.4 检查报告配置

```yaml
code_review_report_dir: './code-review-reports/'
```

## 1.5 排除规则

```yaml
exclude_dirs:
  - 'docs'
  - 'public'

exclude_files: []
```

## 1.6 命名规范配置

```yaml
file_naming: 'kebab-case'
variable_naming: 'camelCase'
component_naming: 'PascalCase'
```
