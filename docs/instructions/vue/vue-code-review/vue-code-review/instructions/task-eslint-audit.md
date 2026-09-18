# 任务：ESLint 配置审计

> 检查项目的 ESLint 配置完整性，给出优化建议。

## 执行步骤

### 步骤 1：确定检查范围

执行 common-steps.md 步骤 A，确定项目根目录。

### 步骤 2：检查 ESLint 是否存在

```
1. 查找项目根目录是否存在以下文件之一：
   - .eslintrc.js / .eslintrc.json / .eslintrc.yml / .eslintrc
   - eslint.config.js / eslint.config.mjs
   - package.json 中的 "eslintConfig" 字段
2. 记录结果
```

### 步骤 3：检查 Vue 3 规则集

```
1. 如 ESLint 存在，检查 extends 中是否包含：
   - plugin:vue/vue3-recommended（推荐）
   - plugin:vue/vue3-strongly-recommended（至少）
   - plugin:vue/vue3-essential（最低）
2. 如未包含任何 Vue 3 规则集，标记为 🟡 Warning
```

### 步骤 4：检查常用插件

```
1. 检查是否安装了以下常用插件：
   - eslint-plugin-vue
   - @typescript-eslint/eslint-plugin（如使用 TypeScript）
2. 记录缺失的插件
```

### 步骤 5：生成报告

执行 common-steps.md 步骤 D、E、F，生成 ESLint 审计报告。

## 完成标准

- [ ] ESLint 配置文件已检查
- [ ] Vue 3 规则集已检查
- [ ] 常用插件已检查
- [ ] 报告已生成并保存
- [ ] 总表已更新
