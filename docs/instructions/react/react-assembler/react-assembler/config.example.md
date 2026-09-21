# 项目适配配置 — 完整示例

> 以一个典型的 React 19 + Ant Design + Zustand 后台管理系统为蓝本。

---

## 1.1 路径配置

```yaml
pages_root_path: 'src/pages'
shared_components_path: 'src/components'
shared_hooks_path: 'src/hooks'
store_path: 'src/store'
api_client_path: 'src/lib/api.js'
code_review_report_dir: './code-review-reports/'
```

## 1.2 技术栈配置

```yaml
react_version: '19'
ui_framework: 'antd'
api_request_lib: 'axios'
state_management: 'zustand'
router_lib: 'react-router v7'
use_react_compiler: true
use_typescript: false
use_server_components: false
auto_run_verification: false
```

## 1.3 编码规范配置

```yaml
comment_language: '中文'
component_file_naming: 'PascalCase'
util_file_naming: 'kebab-case'
variable_naming: 'camelCase'
```

### 1.3.1 代码生成约束

```yaml
max_component_lines: 200
max_hook_lines: 300
min_comment_ratio: 10
max_function_lines: 50
show_config_before_exec: false
```

## 1.4 项目可用资源清单

### UI 框架常用组件映射

```yaml
ui_component_mapping:
  表格: '<Table />'
  弹窗: '<Modal />'
  表单: '<Form />'
  输入框: '<Input />'
  按钮: '<Button />'
  下拉选择: '<Select />'
  日期选择: '<DatePicker />'
  消息提示: 'message.success() / message.error()'
  确认框: 'Modal.confirm()'
```

### 项目已安装插件清单

```yaml
installed_plugins:
  - antd
  - axios
  - zustand
  - react-router-dom
  - dayjs
```

### 全局 CSS 变量清单

```yaml
css_variables:
  - '--primary-color'
  - '--bg-color'
  - '--text-color'
  - '--border-color'
```

## 1.5 可选参照源

```yaml
example_page_paths:
  - 'src/pages/user-management'

other_example_paths:
  - 'src/pages/order-list'
```
