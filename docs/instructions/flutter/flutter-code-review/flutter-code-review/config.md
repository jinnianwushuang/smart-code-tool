# 项目适配配置

> 拷贝到新项目后，按以下分类修改配置项。标记 `<!-- 需配置 -->` 的为必填项，其余为可选。

---

## 1.1 技术栈配置

```yaml
# <!-- 需配置 --> 状态管理方案（getx / riverpod / bloc / provider / 其他）
state_management: 'getx'

# 是否启用 GetX 专项检查（默认 true；非 GetX 项目设为 false，GetX 专项降级为提示）
use_getx: true

# 是否启用 Material 3（默认 true）
use_material_3: true
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

# 语种文件路径列表（开启 i18n 检查后填写；arb 文件或 GetX translations Map）
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

# 额外排除的文件（在 .gitignore 基础上追加，建议排除生成文件）
exclude_files:
  - '*.g.dart'
  - '*.freezed.dart'
```

## 1.6 命名规范配置

```yaml
# 文件命名规则（Dart 官方约定 snake_case）
file_naming: 'snake_case'

# 变量命名规则
variable_naming: 'camelCase'

# 类/Widget 命名规则
class_naming: 'PascalCase'
```
