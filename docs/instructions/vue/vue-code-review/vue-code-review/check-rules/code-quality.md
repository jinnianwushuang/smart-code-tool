# 代码规范（code-quality）

> 检查代码的基本质量指标，包括文件行数、函数长度、注释比例、ESLint 配置和命名规范。

## 检查项

### 1. 单文件最大行数

- **默认阈值**：400 行（可通过 config.md 的 `max_file_lines` 配置）
- **严重级别**：🟡 Warning
- **检查方式**：统计每个 `.vue` / `.js` / `.ts` 文件的总行数
- **处理建议**：超过阈值则建议拆分为子组件或抽取工具函数

### 2. 单函数体最大行数

- **默认阈值**：50 行（可通过 config.md 的 `max_function_lines` 配置）
- **严重级别**：🟡 Warning
- **检查方式**：检查每个函数定义体的行数
- **处理建议**：超过阈值则建议拆分为多个子函数

### 3. 注释比例下限

- **默认阈值**：10%（可通过 config.md 的 `min_comment_ratio` 配置）
- **严重级别**：🔵 Info
- **检查方式**：统计注释行数占总行数的比例
- **处理建议**：低于阈值则建议补充关键逻辑的注释

### 4. ESLint 配置是否存在

- **严重级别**：🟡 Warning
- **检查方式**：检查项目根目录是否存在 `.eslintrc.*` 或 `eslint.config.*`
- **处理建议**：不存在则建议创建 ESLint 配置

### 5. ESLint 是否包含 Vue 3 推荐规则

- **严重级别**：🔵 Info
- **检查方式**：检查 ESLint 配置中是否包含 `plugin:vue/vue3-recommended`
- **处理建议**：未包含则建议安装并配置

```bash
pnpm add -D eslint-plugin-vue
```

```javascript
// .eslintrc.js
module.exports = {
  extends: ['plugin:vue/vue3-recommended'],
}
```

### 6. 命名规范一致性

- **严重级别**：🔵 Info
- **检查方式**：检查文件名、变量名、组件名是否遵循统一规范
- **命名规则**（可通过 config.md 配置）：
  - 文件名：`kebab-case`（如 `merchant-search.vue`）
  - 变量名：`snake_case`（如 `table_data`）
  - 组件名：`PascalCase`（如 `MerchantSearch`）
