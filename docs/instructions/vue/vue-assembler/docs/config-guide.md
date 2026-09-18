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
| `template_core_path` | string | ✅ | 装配架构核心文件（`multiton-template/` 或 `singleton-template/`）相对于项目根目录的路径 |
| `atoms_assembler_import_path` | string | ✅ | 公共装配器函数 `atoms_assembler` 的导入路径 |
| `use_context_assembler_import_path` | string | ✅ | 上下文注入函数 `useContextAssembler` 的导入路径 |
| `glob_patterns` | string[] | — | `import.meta.glob` 的模块扫描路径模式，通常无需修改 |
| `css_variables_entry` | string | ✅ | 项目全局 CSS 变量定义文件的相对路径（如 `src/css/variables.css`） |
| `code_review_report_dir` | string | — | 代码检查报告存放目录，默认 `./code-review-reports/` |

### 1.2 技术栈配置

| 配置项 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `ui_framework` | string | ✅ | — | UI 框架名称，如 `ant-design-vue`、`element-plus` |
| `api_request_lib` | string | ✅ | — | API 请求库，如 `axios`、`fetch` |
| `router_mode` | string | — | `hash` | 路由模式：`hash` 或 `history` |
| `use_typescript` | boolean | — | `false` | 是否使用 TypeScript |
| `auto_run_verification` | boolean | — | `false` | 任务完成后是否自动启动运行验证（默认仅做静态分析） |

### 1.3 编码规范配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `comment_language` | string | `中文` | 代码注释语言 |
| `file_naming` | string | `kebab-case` | 文件命名规则 |
| `variable_naming` | string | `snake_case` | 变量命名规则 |
| `project_prefix` | string | — | 项目前缀 |

### 1.3.1 代码生成约束

未配置则使用指令集默认值。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `max_file_lines` | number | `400` | 生成的单文件最大行数 |
| `min_comment_ratio` | number | `10` | 注释比例下限（百分比） |
| `max_function_lines` | number | `50` | 单函数最大行数 |
| `show_config_before_exec` | boolean | `false` | 执行前是否输出完整配置供确认（配置透明化） |

### 1.4 项目可用资源清单

> AI 生成样式时遵循优先级链：**框架组件 > 项目已安装插件 > 全局 CSS / CSS 变量 > 自定义 scoped CSS**

填写这些清单可以让 AI 在生成代码时尽量复用已有资源，避免产生不通用的 CSS。

| 配置项 | 说明 |
|--------|------|
| `css_variables` | 列出项目 CSS 变量入口文件中已定义的所有变量名 |
| `css_utility_classes` | 列出项目中已有的通用样式类名 |
| `ui_component_mapping` | 列出 UI 框架提供的常用组件及对应场景（如 表格: `<a-table>`） |
| `installed_plugins` | 列出与 UI/样式相关的项目已安装插件 |

### 1.5 模块扫描配置

| 配置项 | 说明 |
|--------|------|
| `public_assembler` | 公共装配器模块列表（来自 composable_common），如 `useGlobalState` |
| `manual_assembler` | 手动引入模块列表（不在 composable_common 中的模块） |

### 1.6 可选参照源

> 次要、可选配置。若项目内已有符合装配架构的实际业务代码，可配置其路径作为 AI 的本地参照。

| 配置项 | 说明 |
|--------|------|
| `multiton_example_path` | 多例模式实际应用目录路径（可选，留空亦可） |
| `singleton_example_path` | 单例模式实际应用目录路径（可选，留空亦可） |
| `other_example_paths` | 其他已验证的页面实现目录路径（可配置多个） |

## 配置最小化示例

如果你只想最快完成配置，至少填写以下 6 项：

```yaml
template_core_path: "src/standardization/"
atoms_assembler_import_path: "@/composable/architecture/assembler/atoms-assembler"
use_context_assembler_import_path: "@/composable/architecture/assembler/use-context-assembler"
css_variables_entry: "src/css/variables.css"
ui_framework: "ant-design-vue"
api_request_lib: "axios"
```

## 常见问题

### 新项目中没有成熟的装配架构实现怎么办？

`multiton_example_path` 和 `singleton_example_path` 是可选的，留空即可。指令集的架构参照文件（`architecture/` 目录）已经内嵌了标准代码片段，足以指导 AI 完成开发。

### 配置填错了会怎样？

AI 在执行步骤 2（门禁检查）时会检测关键配置项的完整性。如果必填项为空，AI 会停止执行并告知缺失项。

### 如何让 AI 执行前确认配置？

将 `show_config_before_exec` 设置为 `true`，AI 在执行任务前会输出合并后的完整配置清单供你确认，避免黑盒操作。
