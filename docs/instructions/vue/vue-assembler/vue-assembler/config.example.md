# 项目适配配置 — 完整示例

> 本文件以当前项目（smart-code-tool）为蓝本，展示填好后的完整配置。新项目可对照此文件修改 config.md。

---

## 1.1 路径配置

```yaml
# 装配架构核心文件放置位置
template_core_path: 'src/standardization'

# atoms_assembler 的导入路径
atoms_assembler_import_path: 'src/output/common/project-common.js'

# useContextAssembler 的导入路径
use_context_assembler_import_path: 'src/output/common/composable-common.js'

# import.meta.glob 的模块扫描路径模式
glob_patterns:
  - '../module/**/*.js'
  - '../state/*.js'

# 项目全局 CSS 变量定义文件的相对路径
css_variables_entry: 'src/css/dark-variables.scss'

# 代码检查报告存放目录
code_review_report_dir: './code-review-reports/'
```

## 1.2 技术栈配置

```yaml
# UI 框架
ui_framework: 'ant-design-vue'

# API 请求库
api_request_lib: 'axios'

# 路由模式
router_mode: 'hash'

# 是否使用 TypeScript
use_typescript: false

# 任务完成后是否自动启动运行验证
auto_run_verification: false
```

## 1.3 编码规范配置

```yaml
# 注释语言
comment_language: '中文'

# 文件命名规则
file_naming: 'kebab-case'

# 变量命名规则
variable_naming: 'snake_case'

# 项目前缀
project_prefix: ''
```

### 1.3.1 代码生成约束

```yaml
# 全部使用默认值（留空即走默认）
max_file_lines: # 默认 400 行
min_comment_ratio: # 默认 10%
max_function_lines: # 默认 50 行
show_config_before_exec: # 默认 false
```

## 1.4 项目可用资源清单

### 全局 CSS 变量清单

```yaml
css_variables:
  - '--bg-color'
  - '--text-color'
  - '--border-color'
  - '--primary-color'
  # ... 实际变量请参照 src/css/dark-variables.scss 和 src/css/light-variables.scss
```

### 全局 CSS 工具类清单

```yaml
css_utility_classes:
  - '.scroll' # 自定义滚动条样式
  - '.text-ellipsis' # 文本溢出省略
  # ... 实际工具类请参照 src/css/utils.scss
```

### UI 框架常用组件映射

```yaml
ui_component_mapping:
  表格: '<a-table>'
  弹窗: '<a-modal>'
  表单: '<a-form>'
  输入框: '<a-input>'
  按钮: '<a-button>'
  下拉选择: '<a-select>'
  日期选择: '<a-date-picker>'
```

### 项目已安装插件清单

```yaml
installed_plugins:
  - 'ant-design-vue'
  - 'mitt'
  - 'dayjs'
  - 'quasar'
```

## 1.5 模块扫描配置

```yaml
# 公共装配器模块列表
public_assembler:
  - 'useGlobalState'

# 手动引入模块列表
manual_assembler: []
```

## 1.6 可选参照源

```yaml
# 多例模式实际应用目录路径
multiton_example_path: 'project/vue-test-app/pages/vue-test/multiton-demo/multiton-lv5/'

# 单例模式实际应用目录路径
singleton_example_path: 'project/vue-test-app/pages/vue-test/singleton-demo/singleton-lv5/'

# 其他已验证的页面实现目录路径
other_example_paths: []
```
