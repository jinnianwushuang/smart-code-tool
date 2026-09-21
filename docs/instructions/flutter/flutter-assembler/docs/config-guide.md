# 配置指南

> `config.md` 各配置项详细说明，帮助你快速完成项目适配。

## 配置流程

1. 打开 `config.md`
2. 找到标记 `<!-- 需配置 -->` 的必填项，逐一填写
3. 参考 `config.example.md` 查看完整填写示例
4. 可选配置项根据项目情况填写，留空则使用指令集默认值

## 配置项详解

### 1.1 路径配置

| 配置项 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `features_root_path` | string | ✅ | 功能模块目录根路径 |
| `shared_widgets_path` | string | ✅ | 全局共享组件目录路径 |
| `shared_controllers_path` | string | ✅ | 全局共享 Controller 目录路径 |
| `routes_config_path` | string | ✅ | 路由配置文件路径 |
| `theme_config_path` | string | ✅ | 主题配置文件路径 |
| `api_client_path` | string | ✅ | API 客户端文件路径 |
| `code_review_report_dir` | string | — | 代码检查报告存放目录 |

### 1.2 技术栈配置

| 配置项 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `flutter_version` | string | ✅ | — | Flutter SDK 版本 |
| `getx_version` | string | ✅ | — | GetX 版本（4.x / 5.x） |
| `ui_style` | string | ✅ | — | UI 风格（material3 / material2 / cupertino） |
| `api_request_lib` | string | ✅ | — | API 请求库（dio / http） |
| `local_storage_lib` | string | ✅ | — | 本地存储方案 |
| `use_material3` | boolean | — | `true` | 是否使用 Material 3 |
| `use_null_safety` | boolean | — | `true` | 是否使用 null safety |
| `auto_run_verification` | boolean | — | `false` | 是否自动启动运行验证 |

### 1.3 编码规范配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `comment_language` | string | `中文` | 代码注释语言 |
| `file_naming` | string | `snake_case` | 文件命名规则 |
| `class_naming` | string | `PascalCase` | 类命名规则 |
| `variable_naming` | string | `camelCase` | 变量/方法命名规则 |

### 1.3.1 代码生成约束

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `max_widget_lines` | number | `200` | 单 Widget 文件最大行数 |
| `max_controller_lines` | number | `300` | 单 Controller 文件最大行数 |
| `min_comment_ratio` | number | `10` | 注释比例下限（百分比） |
| `max_function_lines` | number | `50` | 单函数最大行数 |
| `show_config_before_exec` | boolean | `false` | 执行前是否输出完整配置供确认 |

### 1.4 项目可用资源清单

| 配置项 | 说明 |
|--------|------|
| `material_component_mapping` | Material 3 常用组件映射 |
| `installed_plugins` | 项目已安装插件清单 |
| `theme_variables` | 全局 Theme 变量清单 |

### 1.5 可选参照源

| 配置项 | 说明 |
|--------|------|
| `example_page_paths` | 已有页面实现目录路径列表 |
| `other_example_paths` | 其他已验证的模块路径 |

## 配置最小化示例

至少填写以下 6 项：

```yaml
features_root_path: "lib/features/"
shared_widgets_path: "lib/shared/widgets/"
routes_config_path: "lib/app/routes/"
ui_style: "material3"
api_request_lib: "dio"
getx_version: "5.x"
```

## 常见问题

### 新项目中没有成熟的 GetX 实现怎么办？

`example_page_paths` 是可选的，留空即可。架构参照文件已内嵌标准代码片段。

### GetX 版本选择 4.x 还是 5.x？

推荐 5.x，API 更稳定且支持更多特性。如果项目已有 4.x 代码，配置 `getx_version: '4.x'` 即可。

### 如何让 AI 执行前确认配置？

将 `show_config_before_exec` 设置为 `true`。
