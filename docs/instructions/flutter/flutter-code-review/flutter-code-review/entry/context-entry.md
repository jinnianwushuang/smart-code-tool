# AI 上下文入口

> 本文件是 AI 助手使用本指令集的入口。请按以下顺序加载文件，建立完整上下文。

## 加载顺序

```
第 1 步：读取配置
  → config.md（项目适配配置）
  → 如有疑惑，参照 config.example.md（完整示例）

第 2 步：读取术语表
  → glossary.md（统一术语理解）

第 3 步：读取检查框架参照
  → architecture/check-framework-reference.md（维度总览、严重级别、报告格式）

第 4 步：读取执行框架
  → instructions/launcher.md（启动器 — 必须首先读取）
  → instructions/constraints.md（约束规则）
  → instructions/code-standard.md（报告编写规范）
  → instructions/gate-check.md（门禁检查）
  → instructions/common-steps.md（通用步骤）

第 5 步：等待任务
  → 接收用户的检查任务
  → 按 launcher.md 的流程执行
```

## 快速参考

- **任务类型**：Dart 静态分析审计 / 深度代码审查 / 完整检查 / 国际化专项检查
- **指令文件**：`instructions/task-*.md`
- **检查维度**：`check-rules/*.md`（10 个维度）
- **复核清单**：`instructions/review-checklist.md`

## 核心原则

1. 存疑即问 — 信息不全就提问，禁止瞎猜
2. 单次执行 — 一次只做一类检查
3. 安全熔断 — 超出范围或卡住时停止并反馈
4. 只检不改 — 默认只输出报告，不修改源代码
5. 遵循排除 — `.gitignore` + 配置排除规则必须遵守
