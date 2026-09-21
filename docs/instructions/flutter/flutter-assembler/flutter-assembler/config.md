# 项目适配配置

> 拷贝到新项目后，按以下分类修改配置项。标记 `<!-- 需配置 -->` 的为必填项，其余为可选。

---

## 1.1 路径配置

```yaml
# <!-- 需配置 --> 功能模块目录根路径
features_root_path: ''

# <!-- 需配置 --> 全局共享组件目录路径
shared_widgets_path: ''

# <!-- 需配置 --> 全局共享 Controller 目录路径
shared_controllers_path: ''

# <!-- 需配置 --> 路由配置文件路径
routes_config_path: ''

# <!-- 需配置 --> 主题配置文件路径
theme_config_path: ''

# <!-- 需配置 --> API 客户端文件路径
api_client_path: ''

# 代码检查报告存放目录
code_review_report_dir: './code-review-reports/'
```

## 1.2 技术栈配置

```yaml
# <!-- 需配置 --> Flutter SDK 版本（3.x）
flutter_version: ''

# <!-- 需配置 --> GetX 版本（4.x / 5.x）
getx_version: ''

# <!-- 需配置 --> UI 框架风格（material3 / material2 / cupertino）
ui_style: ''

# <!-- 需配置 --> API 请求库（dio / http / fetch）
api_request_lib: ''

# <!-- 需配置 --> 本地存储方案（get_storage / shared_preferences / hive）
local_storage_lib: ''

# 是否使用 Material 3（true / false）
use_material3: true

# 是否使用 TypeScript 风格的类型注解（true / false，Dart 默认有类型）
use_null_safety: true

# 任务完成后是否自动启动运行验证（true / false，默认 false 仅做静态分析）
auto_run_verification: false
```

## 1.3 编码规范配置

```yaml
# 注释语言
comment_language: '中文'

# 文件命名规则
file_naming: 'snake_case'

# 类命名规则
class_naming: 'PascalCase'

# 变量/方法命名规则
variable_naming: 'camelCase'

# 常量命名规则
constant_naming: 'camelCase'
```

### 1.3.1 代码生成约束（未配置则走指令集默认值）

```yaml
# 单 Widget 文件最大行数（默认 200 行）
max_widget_lines:

# 单 Controller 文件最大行数（默认 300 行）
max_controller_lines:

# 注释比例下限（默认 10%）
min_comment_ratio:

# 单函数最大行数（默认 50 行）
max_function_lines:

# 执行前是否输出完整配置供确认（默认 false）
show_config_before_exec:
```

## 1.4 项目可用资源清单

> AI 生成样式时遵循优先级链：**Material 3 组件 > 项目已安装插件 > 全局 Theme > 自定义 Widget**

### Material 3 常用组件映射

```yaml
material_component_mapping:
  # 示例：
  # 表格: "DataTable / PaginatedDataTable"
  # 弹窗: "showDialog / AlertDialog"
  # 表单: "Form + TextFormField"
  # 列表: "ListView.builder"
  # 导航栏: "NavigationBar (Material 3)"
```

### 项目已安装插件清单

```yaml
installed_plugins: []
```

### 全局 Theme 变量清单

```yaml
theme_variables: []
```

## 1.5 可选参照源

> 次要、可选。新项目中可能不存在成熟的已验证实现，此时留空即可。

```yaml
# 已有页面实现目录路径（可选，留空亦可）
example_page_paths: []

# 其他已验证的模块路径（可配置多个）
other_example_paths: []
```
