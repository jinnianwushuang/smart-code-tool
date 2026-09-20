# 任务：国际化专项检查

> 仅检查国际化相关项。需要 config.md 中 `i18n_check_enabled` 为 `true`。

## 前置条件

- config.md 中 `i18n_check_enabled` 必须为 `true`
- 如未开启，**停止执行**并告知使用者需要在 config.md 中开启

## 执行步骤

### 步骤 1：确定检查范围

执行 common-steps.md 步骤 A-B。

### 步骤 2：检查 JSX 硬编码

参照 `check-rules/i18n-check.md` 第 1 项，扫描 JSX 中的中文文本节点与属性（如 `placeholder`、`title`）。

### 步骤 3：检查 JS/TS 硬编码

参照 `check-rules/i18n-check.md` 第 2 项，扫描 JS/TS 中的用户可见中文字符串（如 message、notification）。

### 步骤 4：多语种键值对比

如 config.md 中 `i18n_locale_files` 已填写：

1. 读取所有语种文件（JSON / TS）
2. 递归对比各语种的 key 结构
3. 输出缺失键列表

参照 `check-rules/i18n-check.md` 第 3-4 项。

### 步骤 5：生成报告

执行 common-steps.md 步骤 D-E-F，生成国际化专项检查报告。

## 完成标准

- [ ] JSX 硬编码检查完成
- [ ] JS/TS 硬编码检查完成
- [ ] 多语种键值对比完成（如配置了语种文件）
- [ ] 报告已生成并保存
- [ ] 总表已更新
