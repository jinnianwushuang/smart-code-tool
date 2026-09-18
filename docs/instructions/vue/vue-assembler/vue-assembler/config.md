# 项目适配配置

> 拷贝到新项目后，按以下分类修改配置项。标记 `<!-- 需配置 -->` 的为必填项，其余为可选。

---

## 1.1 路径配置

```yaml
# <!-- 需配置 --> 装配架构核心文件放置位置（相对于项目根目录）
template_core_path: ''

# <!-- 需配置 --> atoms_assembler 的导入路径
atoms_assembler_import_path: ''

# <!-- 需配置 --> useContextAssembler 的导入路径
use_context_assembler_import_path: ''

# import.meta.glob 的模块扫描路径模式
glob_patterns:
  - '../module/**/*.js'
  - '../state/*.js'

# <!-- 需配置 --> 项目全局 CSS 变量定义文件的相对路径
css_variables_entry: ''

# 代码检查报告存放目录
code_review_report_dir: './code-review-reports/'
```

## 1.2 技术栈配置

```yaml
# <!-- 需配置 --> UI 框架（ant-design-vue / element-plus / 其他）
ui_framework: ''

# <!-- 需配置 --> API 请求库（axios / fetch / 其他）
api_request_lib: ''

# 路由模式（hash / history）
router_mode: 'hash'

# 是否使用 TypeScript（true / false）
use_typescript: false

# 任务完成后是否自动启动运行验证（true / false，默认 false 仅做静态分析）
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

### 1.3.1 代码生成约束（未配置则走指令集默认值）

```yaml
# 单文件最大行数（默认 400 行）
max_file_lines:

# 注释比例下限（默认 10%）
min_comment_ratio:

# 单函数最大行数（默认 50 行）
max_function_lines:

# 执行前是否输出完整配置供确认（默认 false）
show_config_before_exec:
```

## 1.4 项目可用资源清单

> AI 生成样式时遵循优先级链：**框架组件 > 项目已安装插件 > 全局 CSS / CSS 变量 > 自定义 scoped CSS**

### 全局 CSS 变量清单

<!-- 列出项目 CSS 变量入口文件中已定义的所有变量 -->

```yaml
css_variables: []
```

### 全局 CSS 工具类清单

<!-- 列出项目中已有的通用样式类 -->

```yaml
css_utility_classes: []
```

### UI 框架常用组件映射

<!-- 列出框架提供的组件及对应场景 -->

```yaml
ui_component_mapping:
  # 示例：
  # 表格: "<a-table>"
  # 弹窗: "<a-modal>"
  # 表单: "<a-form>"
```

### 项目已安装插件清单

<!-- 与 UI/样式相关的依赖 -->

```yaml
installed_plugins: []
```

## 1.5 模块扫描配置

```yaml
# 公共装配器模块列表（来自 composable_common）
public_assembler:
  - 'useGlobalState'

# 手动引入模块列表（不在 composable_common 中的模块）
manual_assembler: []
```

## 1.6 可选参照源

> 次要、可选。新项目中可能不存在成熟的已验证实现，此时留空即可。
> 若项目内已有符合装配架构的实际业务代码，可配置其路径，AI 会将其作为本地参照。

```yaml
# 多例模式实际应用目录路径（可选，留空亦可）
multiton_example_path: ''

# 单例模式实际应用目录路径（可选，留空亦可）
singleton_example_path: ''

# 其他已验证的页面实现目录路径（可配置多个）
other_example_paths: []
```
