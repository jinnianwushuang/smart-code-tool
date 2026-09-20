# 项目适配配置

> 拷贝到新项目后，按以下分类修改配置项。标记 `<!-- 需配置 -->` 的为必填项，其余为可选。

---

## 1.1 技术栈配置

```yaml
# <!-- 需配置 --> UI 框架（antd / mui / shadcn-ui / 其他）
ui_framework: ''

# 是否启用 React Compiler（默认 true；设为 false 则关闭 Compiler 反模式检查）
react_compiler: true

# 运行环境（spa / next-app-router / next-pages / remix）
app_runtime: 'spa'
```

## 1.2 代码规范阈值（未配置则走指令集默认值）

```yaml
# 单文件最大行数（默认 400 行）
max_file_lines:

# 单函数体最大行数（默认 50 行）
max_function_lines:

# 注释比例下限（默认 10%）
min_comment_ratio:
```

## 1.3 国际化检查

```yaml
# 国际化检查开关（默认 false，设为 true 则启用 i18n 相关检查）
i18n_check_enabled: false

# 语种文件路径列表（开启 i18n 检查后填写，用于多语种键值对比）
i18n_locale_files: []
```

## 1.4 检查报告配置

```yaml
# 检查报告存放目录（默认 ./code-review-reports/）
code_review_report_dir: './code-review-reports/'
```

## 1.5 排除规则

> `.gitignore` 中的规则**默认生效**，无需在此重复。以下配置为**额外追加**排除。

```yaml
# 额外排除的目录（在 .gitignore 基础上追加）
exclude_dirs: []

# 额外排除的文件（在 .gitignore 基础上追加）
exclude_files: []
```

## 1.6 命名规范配置

```yaml
# 文件命名规则
file_naming: 'kebab-case'

# 变量命名规则
variable_naming: 'camelCase'

# 组件命名规则
component_naming: 'PascalCase'
```
