# 代码卫生（code-hygiene）

> 检查代码中的遗留调试语句、死代码、技术债务标记和重复代码。

## 检查项

### 1. 残留 `print` / `debugPrint`

- **严重级别**：🟡 Warning
- **检查方式**：扫描所有 `.dart` 文件中的 `print`、`debugPrint` 语句（`avoid_print`）
- **排除范围**：
  - 封装在统一 Logger 中的日志输出不在此检查范围
  - 注释中的 `print` 不计入
- **处理建议**：移除调试输出，生产环境使用统一日志工具（如 `logger`），并按环境级别控制输出

### 2. 死代码 / 未使用的定义

- **严重级别**：🔵 Info
- **检查方式**：检查是否存在定义了但从未被引用的函数、变量、类、导入（`unused_element` / `unused_import`）
- **问题示例**：

```dart
// 已定义但从未被引用
String legacyHelper() => '...';

// 类内定义但未使用的字段
final _unusedCtrl = TextEditingController();
```

- **处理建议**：移除死代码，`dart fix --apply` 可自动清理部分问题

### 3. `TODO` / `FIXME` / `HACK` 堆积

- **严重级别**：🔵 Info
- **检查方式**：统计代码中 `TODO`、`FIXME`、`HACK`、`XXX` 注释的数量
- **阈值建议**：
  - 单文件超过 5 个 → 🟡 Warning
  - 全项目超过 50 个 → 🟡 Warning
- **处理建议**：定期清理技术债务，将 TODO 转化为任务跟踪

### 4. 重复代码块

- **严重级别**：🟡 Warning
- **检查方式**：检查是否存在相似逻辑在多处出现但未抽取为公共函数/Widget/mixin
- **判断标准**：
  - 连续 10 行以上高度相似的代码
  - 相同业务逻辑在不同 Controller 中重复实现
- **处理建议**：
  - 重复 UI 抽取为公共 Widget
  - 重复逻辑抽取为 mixin / 工具类 / Service
  - 重复配置抽取为常量文件

### 5. 魔法数字 / 硬编码字符串

- **严重级别**：🔵 Info
- **检查方式**：检查代码中是否直接使用未经定义的数字或字符串字面量（排除 0、1、-1 等常见值）
- **问题示例**：

```dart
if (status == 3) { /* 3 是什么？ */ }
const timeout = 30000; // 30 秒？30 毫秒？
if (type == 'admin_user') { /* 硬编码字符串 */ }
```

- **正确写法**：

```dart
const statusCompleted = 3;
const requestTimeout = Duration(seconds: 30);
const userTypeAdmin = 'admin_user';

if (status == statusCompleted) { /* ... */ }
if (type == userTypeAdmin) { /* ... */ }
```

- **处理建议**：抽取为命名清晰的常量；状态类建议用 Dart 3 `enum` / `sealed class` 建模
