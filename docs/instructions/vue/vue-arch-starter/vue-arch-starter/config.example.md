# 完整配置示例

> 以一个使用 Quasar + Ant Design Vue 的新项目为例，展示所有配置项的填写方式。

## 1. 项目基础信息

```yaml
project_name: "my-admin-app"
project_root: "/Users/dev/my-admin-app"
```

## 2. 路径别名

```yaml
src_alias_path: "src"
custom_alias_prefix: ""
```

对应 vite.config.js 中的配置：

```javascript
resolve: {
  alias: {
    src: '/Users/dev/my-admin-app/src',
  },
},
```

## 3. UI 框架

```yaml
ui_framework: "quasar"
quasar_sass_variables: "src/css/quasar-variables.scss"
```

## 4. 依赖安装

```yaml
install_optional_deps: true
package_manager: "pnpm"
```

## 5. 模板参照

```yaml
multiton_template_ref: "src/standardization/multiton-template"
singleton_template_ref: "src/standardization/singleton-template"
```

## 6. 模块扫描

```yaml
module_glob_pattern: "../module/**/*.js"
state_glob_pattern: "../state/*.js"
```

---

## Element Plus 方案示例

如果选择 Element Plus 替代 Quasar：

```yaml
ui_framework: "element-plus"
quasar_sass_variables: ""  # 不需要
```

此时需要：
1. 将 `src/css/quasar-variables.scss` 替换为 Element Plus 的变量文件
2. 将模板中的 `<q-btn>` 等 Quasar 组件替换为 `<el-button>` 等 Element Plus 组件
3. 将 `useQuasar()` 调用替换为 `useElementPlus()` 或对应 API
