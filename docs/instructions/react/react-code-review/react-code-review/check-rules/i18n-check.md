# 国际化（i18n-check）

> 检查项目中的国际化合规性。需通过 config.md 的 `i18n_check_enabled` 开启。

## 前置条件

- config.md 中 `i18n_check_enabled` 必须为 `true`
- 若未开启，跳过本维度所有检查项

## 检查项

### 1. JSX 中硬编码中文文本

- **严重级别**：🟡 Warning
- **检查方式**：扫描 JSX 文本节点与属性（`placeholder`、`title`、`aria-label` 等），检查是否存在中文字符且未使用 `t()` 包裹
- **问题示例**：

```tsx
<button>提交</button>
<input placeholder="请输入用户名" />
```

- **正确写法**：

```tsx
<button>{t('common.submit')}</button>
<input placeholder={t('user.namePlaceholder')} />
```

### 2. JS/TS 中硬编码用户可见中文

- **严重级别**：🟡 Warning
- **检查方式**：检查 JS/TS 代码中的中文字符串是否为用户可见文本（排除注释、日志、错误消息）
- **问题示例**：

```tsx
message.success('保存成功')
const title = '操作确认'
```

- **正确写法**：

```tsx
message.success(t('common.saveSuccess'))
const title = t('common.confirmTitle')
```

### 3. 多语种文件键值对比

- **严重级别**：🔴 Error
- **检查方式**：读取 config.md 中 `i18n_locale_files` 配置的所有语种文件，对比各语种间的 key 是否一致
- **问题示例**：

```json
// zh-CN.json
{ "common": { "submit": "提交", "cancel": "取消" } }

// en-US.json — 缺少 cancel 键
{ "common": { "submit": "Submit" } }
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
