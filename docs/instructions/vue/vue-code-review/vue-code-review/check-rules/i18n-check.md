# 国际化（i18n-check）

> 检查项目中的国际化合规性。需通过 config.md 的 `i18n_check_enabled` 开启。

## 前置条件

- config.md 中 `i18n_check_enabled` 必须为 `true`
- 若未开启，跳过本维度所有检查项

## 检查项

### 1. 模板中硬编码中文文本

- **严重级别**：🟡 Warning
- **检查方式**：扫描 `<template>` 中的文本节点，检查是否存在中文字符且未使用 `$t()` / `t()` 包裹
- **问题示例**：

```html
<button>提交</button> <span>用户名</span>
```

- **正确写法**：

```html
<button>{{ $t('common.submit') }}</button> <span>{{ t('user.name') }}</span>
```

### 2. JS 中硬编码用户可见中文

- **严重级别**：🟡 Warning
- **检查方式**：检查 JS/TS 代码中的中文字符串是否为用户可见的文本（排除注释、日志、错误消息）
- **问题示例**：

```javascript
const message = '操作成功'
ElMessage.success('保存成功')
```

- **正确写法**：

```javascript
const message = t('common.operation_success')
ElMessage.success(t('common.save_success'))
```

### 3. 多语种文件键值对比

- **严重级别**：🔴 Error
- **检查方式**：读取 config.md 中 `i18n_locale_files` 配置的所有语种文件，对比各语种间的 key 是否一致
- **问题示例**：

```javascript
// zh-CN.js
export default {
  common: {
    submit: '提交',
    cancel: '取消',
  },
}

// en-US.js — 缺少 cancel 键
export default {
  common: {
    submit: 'Submit',
  },
}
```

- **处理建议**：补齐缺失的翻译键

### 4. 语种文件间键值一致性

- **严重级别**：🟡 Warning
- **检查方式**：与第 3 项类似，但更关注嵌套层级的 key 路径是否完全一致
- **输出格式**：

```
缺失键列表：
- en-US: common.cancel（zh-CN 中存在，en-US 中缺失）
- ja-JP: common.confirm（zh-CN 中存在，ja-JP 中缺失）
```
