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
| `pages_root_path` | string | ✅ | 页面目录根路径（相对于项目根目录） |
| `shared_components_path` | string | ✅ | 全局共享组件目录路径 |
| `shared_hooks_path` | string | ✅ | 全局共享 Hooks 目录路径 |
| `store_path` | string | ✅ | 全局状态管理目录路径 |
| `api_client_path` | string | ✅ | API 客户端文件路径 |
| `code_review_report_dir` | string | — | 代码检查报告存放目录，默认 `./code-review-reports/` |

### 1.2 技术栈配置

| 配置项 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `react_version` | string | ✅ | — | React 版本（`19` / `18`） |
| `ui_framework` | string | ✅ | — | UI 框架，如 `antd`、`shadcn-ui`、`MUI` |
| `api_request_lib` | string | ✅ | — | API 请求库，如 `axios`、`fetch` |
| `state_management` | string | ✅ | — | 状态管理方案，如 `zustand`、`jotai`、`redux-toolkit`、`context` |
| `router_lib` | string | ✅ | — | 路由方案，如 `react-router v7`、`next.js`、`tanstack-router` |
| `use_react_compiler` | boolean | — | `true` | 是否启用 React Compiler |
| `use_typescript` | boolean | — | `false` | 是否使用 TypeScript |
| `use_server_components` | boolean | — | `false` | 是否使用 Server Components |
| `auto_run_verification` | boolean | — | `false` | 任务完成后是否自动启动运行验证 |

### 1.3 编码规范配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `comment_language` | string | `中文` | 代码注释语言 |
| `component_file_naming` | string | `PascalCase` | 组件文件命名规则 |
| `util_file_naming` | string | `kebab-case` | Hook/工具文件命名规则 |
| `variable_naming` | string | `camelCase` | 变量命名规则 |

### 1.3.1 代码生成约束

未配置则使用指令集默认值。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `max_component_lines` | number | `200` | 单组件文件最大行数 |
| `max_hook_lines` | number | `300` | 单 Hook 文件最大行数 |
| `min_comment_ratio` | number | `10` | 注释比例下限（百分比） |
| `max_function_lines` | number | `50` | 单函数最大行数 |
| `show_config_before_exec` | boolean | `false` | 执行前是否输出完整配置供确认 |

### 1.4 项目可用资源清单

> AI 生成样式时遵循优先级链：**UI 框架组件 > 项目已安装插件 > 全局 CSS / CSS 变量 > CSS Modules**

填写这些清单可以让 AI 在生成代码时尽量复用已有资源，避免产生不通用的 CSS。

| 配置项 | 说明 |
|--------|------|
| `ui_component_mapping` | 列出 UI 框架提供的常用组件及对应场景（如 表格: `<Table />`） |
| `installed_plugins` | 列出与 UI/样式相关的项目已安装插件 |
| `css_variables` | 列出项目全局 CSS 变量清单 |

### 1.5 可选参照源

> 次要、可选。新项目中可能不存在成熟的已验证实现，此时留空即可。

| 配置项 | 说明 |
|--------|------|
| `example_page_paths` | 已有页面实现目录路径列表（可选，留空亦可） |
| `other_example_paths` | 其他已验证的模块路径（可配置多个） |

## 配置最小化示例

如果你只想最快完成配置，至少填写以下 6 项：

```yaml
pages_root_path: "src/pages/"
shared_components_path: "src/components/"
shared_hooks_path: "src/hooks/"
ui_framework: "antd"
api_request_lib: "axios"
state_management: "zustand"
```

## 常见问题

### 新项目中没有成熟的 React 架构实现怎么办？

`example_page_paths` 是可选，留空即可。指令集的架构参照文件（`architecture/` 目录）已经内嵌了标准代码片段，足以指导 AI 完成开发。

### 配置填错了会怎样？

AI 在执行步骤 2（门禁检查）时会检测关键配置项的完整性。如果必填项为空，AI 会停止执行并告知缺失项。

### React Compiler 约束意味着什么？

启用 React Compiler 后，AI 不会手写 `useMemo`、`useCallback`、`forwardRef` 等优化代码，因为 Compiler 会在编译阶段自动处理。这减少了人为优化错误的可能性，同时保持代码简洁。

### 如何让 AI 执行前确认配置？

将 `show_config_before_exec` 设置为 `true`，AI 在执行任务前会输出合并后的完整配置清单供你确认，避免黑盒操作。
