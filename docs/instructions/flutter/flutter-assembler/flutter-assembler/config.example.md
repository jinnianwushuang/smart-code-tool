# 完整配置示例

> 以一个 Flutter 3 + GetX + Material 3 后台管理 App 为蓝本的完整配置。

---

## 1.1 路径配置

```yaml
# 功能模块目录根路径
features_root_path: 'lib/features/'

# 全局共享组件目录路径
shared_widgets_path: 'lib/shared/widgets/'

# 全局共享 Controller 目录路径
shared_controllers_path: 'lib/shared/controllers/'

# 路由配置文件路径
routes_config_path: 'lib/app/routes/'

# 主题配置文件路径
theme_config_path: 'lib/app/theme/'

# API 客户端文件路径
api_client_path: 'lib/core/network/api_client.dart'

# 代码检查报告存放目录
code_review_report_dir: './code-review-reports/'
```

## 1.2 技术栈配置

```yaml
# Flutter SDK 版本
flutter_version: '3.24'

# GetX 版本
getx_version: '5.x'

# UI 框架风格
ui_style: 'material3'

# API 请求库
api_request_lib: 'dio'

# 本地存储方案
local_storage_lib: 'get_storage'

# 是否使用 Material 3
use_material3: true

# 是否使用 null safety
use_null_safety: true

# 任务完成后是否自动启动运行验证
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

### 1.3.1 代码生成约束

```yaml
# 单 Widget 文件最大行数
max_widget_lines: 200

# 单 Controller 文件最大行数
max_controller_lines: 300

# 注释比例下限
min_comment_ratio: 10

# 单函数最大行数
max_function_lines: 50

# 执行前是否输出完整配置供确认
show_config_before_exec: false
```

## 1.4 项目可用资源清单

### Material 3 常用组件映射

```yaml
material_component_mapping:
  表格: "PaginatedDataTable"
  弹窗: "showDialog + AlertDialog"
  表单: "Form + TextFormField"
  列表: "ListView.builder"
  导航栏: "NavigationBar"
  抽屉: "NavigationDrawer"
  搜索: "SearchBar"
  卡片: "Card + ListTile"
  加载: "CircularProgressIndicator / LinearProgressIndicator"
  空状态: "自定义 EmptyState Widget"
  下拉刷新: "RefreshIndicator"
```

### 项目已安装插件清单

```yaml
installed_plugins:
  - cached_network_image      # 图片缓存
  - flutter_screenutil        # 屏幕适配
  - pull_to_refresh_flutter   # 下拉刷新
  - flutter_staggered_animations # 列表动画
```

### 全局 Theme 变量清单

```yaml
theme_variables:
  - colorScheme.primary
  - colorScheme.onPrimary
  - colorScheme.surface
  - colorScheme.onSurface
  - textTheme.titleLarge
  - textTheme.bodyMedium
  - textTheme.labelSmall
```

## 1.5 可选参照源

```yaml
# 已有页面实现目录路径
example_page_paths:
  - 'lib/features/order_management/'

# 其他已验证的模块路径
other_example_paths:
  - 'lib/features/product_management/'
```
