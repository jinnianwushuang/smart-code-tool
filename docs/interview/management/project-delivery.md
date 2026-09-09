---
title: "项目交付管理 [TL]"
level: "manager"
tags: ["估时", "风险管理", "质量门禁", "敏捷"]
difficulty: "hard"
updated: "2026-09-10"
target: "技术主管（TL）"
---

# 项目交付管理 [TL]

> 项目交付是 TL 的核心 KPI。2026 年，前端项目交付从「拍脑袋估时」走向「数据驱动 + 风险管理 + 质量门禁」。

## 核心概念（What）

### 项目交付四要素

```
├── 估时：科学估算，减少偏差
├── 风险：提前识别，主动管理
├── 质量：门禁机制，持续保障
└── 交付：可视化进度，高效协同
```

---

## 底层原理（Why）

### 1. 估时方法

```
估时方法对比：
├── 专家判断：基于经验的估算（快但不准）
├── 三点估算：(乐观 + 4×最可能 + 悲观) / 6
├── 故事点：相对大小估算（Fibonacci 序列）
├── T-Shirt Size：S/M/L/XL（粗粒度）
└── 数据驱动：基于历史 velocity 预测

估时注意事项：
├── 加入 buffer（通常 20-30%）
├── 考虑非编码时间（评审、联调、测试、部署）
├── 拆分任务到 1-3 天粒度
└── 让执行者参与估时
```

### 2. 风险管理

```typescript
// 风险登记册
interface Risk {
  id: string;
  description: string;
  probability: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation: string;     // 缓解措施
  contingency: string;    // 应急方案
  owner: string;          // 负责人
}

// 前端常见风险
const commonRisks: Risk[] = [
  {
    id: 'R1',
    description: '第三方 API 延迟交付',
    probability: 'medium',
    impact: 'high',
    mitigation: '提前约定接口契约，使用 Mock Server',
    contingency: '先用 Mock 数据开发，API 就绪后联调',
    owner: 'TL',
  },
  {
    id: 'R2',
    description: '设计稿反复修改',
    probability: 'high',
    impact: 'medium',
    mitigation: '设计评审冻结机制',
    contingency: '组件化设计，减少修改影响范围',
    owner: '产品经理',
  },
];
```

### 3. 质量门禁

```
质量门禁（Quality Gate）：
├── 代码提交门禁
│   ├── Lint 检查通过
│   ├── 类型检查通过
│   ├── 单元测试通过
│   └── 包大小检查（不超标）
├── PR 合并门禁
│   ├── Code Review 通过（至少 1 人）
│   ├── CI 全绿
│   ├── 覆盖率不下降
│   └── 安全扫描通过
├── 发布门禁
│   ├── E2E 测试通过
│   ├── 性能测试通过（Lighthouse 分数）
│   ├── 视觉回归测试通过
│   └── 灰度验证通过
└── 全量发布门禁
    ├── 金丝雀指标正常
    ├── 无 P0/P1 错误
    └── 回滚方案就绪
```

### 4. 敏捷实践

```
前端团队敏捷实践：
├── Sprint 周期：2 周
├── 仪式：
│   ├── Sprint Planning（2 小时）
│   ├── Daily Standup（15 分钟）
│   ├── Sprint Review（1 小时）
│   └── Retrospective（1 小时）
├── 度量：
│   ├── Velocity（故事点/Sprint）
│   ├── Lead Time（需求到上线时间）
│   ├── Cycle Time（开发到完成时间）
│   └── 缺陷逃逸率
└── 改进：
    ├── 每个 Sprint 回顾改进项
    └── 跟踪改进项落地
```

---

## 高频面试题

### Q1: 如何提高项目估时的准确性？

**参考答案要点**：
- 让执行者参与估时（不是 TL 单方面决定）
- 拆分为小任务（1-3 天粒度）
- 使用三点估算（考虑不确定性）
- 加入 buffer（20-30%）
- 基于历史数据校准（velocity）

### Q2: 质量门禁应该包含哪些检查？

**参考答案要点**：
- 代码提交：lint + type-check + test
- PR 合并：review + CI + 覆盖率
- 发布：E2E + 性能 + 视觉回归
- 全量：金丝雀指标 + 回滚方案

### Q3: 项目延期了怎么办？

**参考答案要点**：
- 尽早预警（不要等到 deadline）
- 分析原因（估时不准？需求变更？技术障碍？）
- 调整范围（砍功能而非加时间）
- 增加资源（谨慎，可能更慢）
- 沟通预期（与产品/业务方坦诚沟通）

---

## 延伸思考

1. **设计题**：为一个 3 个月的前端项目设计完整的交付计划。
2. **场景题**：开发到一半，产品加了大需求，如何处理？
3. **对比题**：Scrum vs Kanban 在前端团队的适用性？

---

## 参考资料

- [Scrum Guide](https://scrumguides.org)
- [项目估时](https://www.atlassian.com/agile/project-management/estimation)
- [质量门禁](https://www.sonarsource.com/solutions/quality-gates/)
