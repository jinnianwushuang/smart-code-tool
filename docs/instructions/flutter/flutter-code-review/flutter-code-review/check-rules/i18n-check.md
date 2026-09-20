# 国际化（i18n-check）

> 检查项目中的国际化合规性。需通过 config.md 的 `i18n_check_enabled` 开启。

## 前置条件

- config.md 中 `i18n_check_enabled` 必须为 `true`
- 若未开启，跳过本维度所有检查项

## 检查项

### 1. Widget 中硬编码中文文本

- **严重级别**：🟡 Warning
- **检查方式**：扫描 `Text` / `Label` / `hintText` / `tooltip` 等，检查是否存在中文字符且未使用 `.tr`（GetX）或 `AppLocalizations.of(context)!.xxx`
- **问题示例**：

```dart
Text('提交')
TextField(decoration: InputDecoration(hintText: '请输入用户名'))
```

- **正确写法**：

```dart
Text('submit'.tr)                                  // GetX
Text(AppLocalizations.of(context)!.submit)         // flutter_localizations
TextField(decoration: InputDecoration(hintText: 'user_name_hint'.tr))
```

### 2. Dart 逻辑中硬编码用户可见中文

- **严重级别**：🟡 Warning
- **检查方式**：检查 SnackBar、Dialog、Toast 等用户可见的中文字符串是否走了国际化（排除注释、日志）
- **问题示例**：

```dart
Get.snackbar('提示', '保存成功');
```

- **正确写法**：

```dart
Get.snackbar('tip'.tr, 'save_success'.tr);
```

### 3. 多语种文件键值对比

- **严重级别**：🔴 Error
- **检查方式**：读取 config.md 中 `i18n_locale_files` 配置的所有语种文件（arb / GetX translations Map），对比各语种间的 key 是否一致
- **问题示例**：

```dart
// zh_CN.dart
final Map<String, String> zhCN = {'submit': '提交', 'cancel': '取消'};

// en_US.dart — 缺少 cancel 键
final Map<String, String> enUS = {'submit': 'Submit'};
```

- **处理建议**：补齐缺失的翻译键

### 4. 语种文件间键值一致性

- **严重级别**：🟡 Warning
- **检查方式**：与第 3 项类似，但更关注嵌套层级的 key 路径是否完全一致
- **输出格式**：

```
缺失键列表：
- en_US: cancel（zh_CN 中存在，en_US 中缺失）
- ja_JP: confirm（zh_CN 中存在，ja_JP 中缺失）
```
