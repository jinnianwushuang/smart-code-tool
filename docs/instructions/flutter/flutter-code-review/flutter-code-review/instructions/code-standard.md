# 检查报告编写规范

> 规范检查报告的格式、严重级别和输出内容。

## 报告文件格式

```markdown
# 代码检查报告

## 基本信息

| 项目       | 值                               |
| ---------- | -------------------------------- |
| 任务类型   | 深度代码审查                     |
| 检查目标   | lib/modules/user/                |
| 检查时间   | 2026-09-20 14:30:22              |
| 检查文件数 | 15                               |
| 发现问题数 | Error: 3 / Warning: 8 / Info: 12 |

## 检查结果

### 🔴 Error（必须修复）

#### 1. [memory-management] user_form_controller.dart — Controller 未 dispose

- **文件**：`lib/modules/user/controller/user_form_controller.dart`
- **行号**：L45-L50
- **问题描述**：`TextEditingController` 未在 `onClose` 中调用 `dispose()`
- **修复建议**：在 `onClose()` 中调用 `textController.dispose()`

### 🟡 Warning（建议修复）

...

### 🔵 Info（建议优化）

...

## 与上次检查对比（如有）

...

## 总结

...
```

## 严重级别定义

| 级别       | 含义                                    | 处理要求 |
| ---------- | --------------------------------------- | -------- |
| 🔴 Error   | 必须修复（资源泄漏、明文密钥、注入风险） | 立即处理 |
| 🟡 Warning | 建议修复（性能隐患、可维护性问题）      | 尽快处理 |
| 🔵 Info    | 建议优化（代码风格、最佳实践）          | 酌情处理 |

## 问题编号规则

- 每个维度内独立编号
- 格式：`[维度名] 文件名 — 问题简述`
- 示例：`[memory-management] user_form_controller.dart — 未 dispose Controller`

## 报告总表 `_index.md` 格式

```markdown
| 序号 | 执行时间            | 任务类型     | 检查目标    | Error | Warning | Info | 报告链接                                                 |
| ---- | ------------------- | ------------ | ----------- | ----- | ------- | ---- | -------------------------------------------------------- |
| 1    | 2026-09-20 14:30:22 | 深度代码审查 | user-module | 3     | 8       | 12   | [查看](./deep-review_user-module_2026-09-20_14-30-22.md) |
```
