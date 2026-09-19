# 编排文件示例 — 新功能完整流程

> 本示例展示如何通过编排文件串联多条指令

---

## 文件位置

```
pipelines/feature-complete.md
```

---

## 编排文件内容

```markdown
<!--
@pipeline: 新功能完整流程
@mode: parameterized
@params:
  - name: module
    type: path
    required: true
    description: 目标模块路径
  - name: feature
    type: string
    required: true
    description: 功能描述
-->

# 新功能完整流程

## 概述

本编排文件串联以下指令，完成从开发到检查的完整流程：

1. 加载基础上下文
2. 开发新功能
3. 代码检查
4. 模块自检

## 执行步骤

### 步骤 1：加载基础上下文

执行 `layer-2-context/entry.md`

- 参数：无（fixed 模式）
- 产出：项目上下文已加载

### 步骤 2：开发新功能

执行 `layer-3-dev/new-feature.md`

- 参数：
  - module: {module}
  - component: {feature}
- 产出：新功能的代码文件
- 传递：修改的文件列表 → 步骤 3 的 scope

### 步骤 3：代码检查

执行 `layer-4-code-review/entry.md`

- 参数：
  - scope: 步骤 2 修改的文件列表
- 产出：检查报告
- 传递：发现的问题 → 步骤 4 的检查重点

### 步骤 4：模块自检

执行 `layer-3-dev/self-check.md`

- 参数：
  - module: {module}
- 重点关注：步骤 3 发现的问题是否已修复

## 步骤间传递

| 上游   | 下游   | 传递内容                     |
| ------ | ------ | ---------------------------- |
| 步骤 2 | 步骤 3 | 修改的文件列表（作为 scope） |
| 步骤 3 | 步骤 4 | 发现的问题（作为检查重点）   |

## 最终输出
```

## 新功能完成报告

### 功能描述

{feature}

### 变更文件

- 新增：...
- 修改：...

### 代码检查结果

- 通过：N 项
- 警告：N 项
- 建议：N 项

### 自检结果

- 通过：N 项
- 警告：N 项

### 遗留问题

- ...

```

```

---

## 使用说明

本示例展示了编排文件的核心特征：

- **调度器角色**：不重复实现指令逻辑，只负责按顺序调用
- **参数传递**：上游指令的输出作为下游指令的输入
- **可复用**：同一编排文件可用于不同模块和功能
- **最终报告**：汇总所有步骤的输出，生成完整报告

---

## 临时编排 vs 正式编排

| 类型     | 说明                 | 存放位置             |
| -------- | -------------------- | -------------------- |
| 正式编排 | 反复使用的标准流程   | `pipelines/` 目录    |
| 临时编排 | 一次性流程，用完即弃 | 项目根目录或临时目录 |

临时编排示例：

```markdown
# 临时：紧急修复流程

1. 执行 `layer-3-dev/fix.md`，module=pages/payment，issue=支付金额计算错误
2. 执行 `layer-3-dev/self-check.md`，module=pages/payment
3. 执行 `layer-5-release/entry.md`（确认核心功能未受影响）
```
