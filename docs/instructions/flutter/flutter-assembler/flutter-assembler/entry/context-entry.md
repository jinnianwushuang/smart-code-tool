# AI 上下文入口

> 本文件是 AI 助手使用本指令集的入口。请按以下顺序加载文件，建立完整上下文。

## 加载顺序

```
第 1 步：读取配置
  → config.md（项目适配配置）
  → 如有疑惑，参照 config.example.md（完整示例）

第 2 步：读取术语表
  → glossary.md（统一术语理解）

第 3 步：读取架构参照（按需）
  → architecture/widget-reference.md（Widget 装配模式）
  → architecture/controller-reference.md（GetxController 生命周期）
  → architecture/state-reference.md（状态管理模式）
  → architecture/route-reference.md（路由管理）
  → architecture/lifecycle-reference.md（生命周期约束）
  → architecture/directory-convention.md（目录与命名约定）

第 4 步：读取执行框架
  → instructions/launcher.md（启动器 — 必须首先读取）
  → instructions/constraints.md（约束规则）
  → instructions/code-standard.md（代码规范）
  → instructions/gate-check.md（门禁检查）
  → instructions/common-steps.md（通用步骤）

第 5 步：等待任务
  → 接收用户的任务指令
  → 按 launcher.md 的流程执行
```

## 快速参考

- **任务类型**：新需求开发 / 重构 / 需求迭代 / 修复 / 代码检查
- **指令文件**：`instructions/task-*.md`
- **复核清单**：`instructions/review-checklist.md`
- **约束规则**：`instructions/constraints.md`

## 核心原则

1. 存疑即问 — 信息不全就提问，禁止瞎猜
2. 单次执行 — 一次只做一类任务
3. 安全熔断 — 超出范围或卡住时停止并反馈
4. Theme 复用 — Material 3 组件 > 插件 > 全局 Theme > 自定义 Widget
5. 验证边界 — 默认只做静态分析，不主动启动项目
6. GetX 约束 — 禁止 build 内 Get.put、Obx 下沉、const 优先
