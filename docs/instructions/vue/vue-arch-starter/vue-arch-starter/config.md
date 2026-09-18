# 配置模板

> 在开始集成前，请先完成以下配置。标记 `<!-- 需配置 -->` 的为必填项。

## 1. 项目基础信息

```yaml
# 项目名称 <!-- 需配置 -->
project_name: ""

# 项目根目录的绝对路径 <!-- 需配置 -->
project_root: ""
```

## 2. 路径别名

```yaml
# src/ 别名指向的实际目录（默认：项目根目录下的 src/） <!-- 需配置 -->
src_alias_path: "src"

# 如果项目使用了自定义别名前缀（非 src/），在此填写
custom_alias_prefix: ""
```

## 3. UI 框架

```yaml
# 使用的 UI 框架：quasar / element-plus / naive-ui / ant-design-vue <!-- 需配置 -->
ui_framework: "quasar"

# Quasar SCSS 变量文件路径（仅 quasar 需要）
quasar_sass_variables: "src/css/quasar-variables.scss"
```

## 4. 依赖安装

```yaml
# 是否安装可选依赖（lodash、dayjs）
install_optional_deps: true

# 第三方依赖包管理器：pnpm / npm / yarn
package_manager: "pnpm"
```

## 5. 模板参照

```yaml
# 多例模板参照目录（相对于 src/）
multiton_template_ref: "src/standardization/multiton-template"

# 单例模板参照目录（相对于 src/）
singleton_template_ref: "src/standardization/singleton-template"
```

## 6. 模块扫描

```yaml
# 模块扫描使用的 glob 模式（一般无需修改）
module_glob_pattern: "../module/**/*.js"
state_glob_pattern: "../state/*.js"
```
