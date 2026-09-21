# 项目适配配置

> 拷贝到新项目后，按以下分类修改配置项。标记 `<!-- 需配置 -->` 的为必填项，其余为可选。

---

## 1.1 路径配置

```yaml
# <!-- 需配置 --> 页面目录根路径（相对于项目根目录）
pages_root_path: ''

# <!-- 需配置 --> 全局共享组件目录路径
shared_components_path: ''

# <!-- 需配置 --> 全局共享 Hooks 目录路径
shared_hooks_path: ''

# <!-- 需配置 --> 全局状态管理目录路径
store_path: ''

# <!-- 需配置 --> API 客户端文件路径
api_client_path: ''

# 代码检查报告存放目录
code_review_report_dir: './code-review-reports/'
```

## 1.2 技术栈配置

```yaml
# <!-- 需配置 --> React 版本（19 / 18）
react_version: '19'

# <!-- 需配置 --> UI 框架（antd / shadcn-ui / MUI / 其他）
ui_framework: ''

# <!-- 需配置 --> API 请求库（axios / fetch / 其他）
api_request_lib: ''

# <!-- 需配置 --> 状态管理方案（zustand / jotai / redux-toolkit / context）
state_management: ''

# <!-- 需配置 --> 路由方案（react-router v7 / next.js / tanstack-router）
router_lib: ''

# 是否启用 React Compiler（true / false，React 19 默认 true）
use_react_compiler: true

# 是否使用 TypeScript（true / false）
use_typescript: false

# 是否使用 Server Components（true / false，Next.js 默认 true）
use_server_components: false

# 任务完成后是否自动启动运行验证（true / false，默认 false 仅做静态分析）
auto_run_verification: false
```

## 1.3 编码规范配置

```yaml
# 注释语言
comment_language: '中文'

# 组件文件命名规则
component_file_naming: 'PascalCase'

# Hook/工具文件命名规则
util_file_naming: 'kebab-case'

# 变量命名规则
variable_naming: 'camelCase'
```

### 1.3.1 代码生成约束（未配置则走指令集默认值）

```yaml
# 单组件文件最大行数（默认 200 行）
max_component_lines:

# 单 Hook 文件最大行数（默认 300 行）
max_hook_lines:

# 注释比例下限（默认 10%）
min_comment_ratio:

# 单函数最大行数（默认 50 行）
max_function_lines:

# 执行前是否输出完整配置供确认（默认 false）
show_config_before_exec:
```

## 1.4 项目可用资源清单

> AI 生成样式时遵循优先级链：**UI 框架组件 > 项目已安装插件 > 全局 CSS / CSS 变量 > CSS Modules**

### UI 框架常用组件映射

```yaml
ui_component_mapping:
  # 示例：
  # 表格: "<Table />"
  # 弹窗: "<Modal />"
  # 表单: "<Form />"
```

### 项目已安装插件清单

```yaml
installed_plugins: []
```

### 全局 CSS 变量清单

```yaml
css_variables: []
```

## 1.5 可选参照源

> 次要、可选。新项目中可能不存在成熟的已验证实现，此时留空即可。

```yaml
# 已有页面实现目录路径（可选，留空亦可）
example_page_paths: []

# 其他已验证的模块路径（可配置多个）
other_example_paths: []
```
