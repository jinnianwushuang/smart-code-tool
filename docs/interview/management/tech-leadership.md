---
title: '技术领导力 [TL]'
level: 'manager'
tags: ['技术决策', 'RFC 流程', '技术债务', '领导力']
difficulty: 'hard'
updated: '2026-09-10'
target: '技术主管（TL）'
---

# 技术领导力 [TL]

> 技术领导力不是「管人」，而是「做正确的技术决策并推动落地」。2026 年，RFC 流程、技术债务管理、技术影响力成为 TL 的核心能力。

## 核心概念（What）

### 技术领导力模型

```
技术领导力 = 技术判断力 + 决策能力 + 推动执行 + 影响力

四个维度：
├── 技术判断力：识别问题本质，评估方案 trade-off
├── 决策能力：在不确定中做出决策，承担后果
├── 推动执行：将决策转化为行动，跟踪落地
└── 影响力：跨团队沟通，获得认同和支持
```

---

## 底层原理（Why）

### 1. RFC 流程

```
RFC（Request For Comments）流程：

1. 提案（Draft）
   └── 作者撰写 RFC 文档（背景、方案、trade-off、风险）

2. 评审（Review）
   └── 相关方评审（技术委员会、利益相关团队）
   └── 收集反馈，迭代修改

3. 批准（Approved）
   └── 技术委员会投票或 TL 决策
   └── 记录决策和理由

4. 执行（Implementation）
   └── 指定负责人和里程碑
   └── 定期同步进度

5. 回顾（Retrospective）
   └── 实施后回顾效果
   └── 记录经验教训
```

```markdown
# RFC 模板

## 背景

- 当前问题是什么？
- 为什么需要解决？

## 目标

- 期望达到什么效果？
- 成功指标是什么？

## 方案

### 方案 A：xxx

- 描述
- 优点
- 缺点
- 工作量

### 方案 B：xxx

- 描述
- 优点
- 缺点
- 工作量

## 推荐方案

- 推荐方案 X，因为...

## 风险

- 风险 1 + 缓解措施
- 风险 2 + 缓解措施

## 时间线

- Phase 1: xxx（2 周）
- Phase 2: xxx（4 周）
```

### 2. 技术债务管理

```typescript
// 技术债务分类
interface TechDebt {
  category: 'architecture' | 'code-quality' | 'dependency' | 'documentation' | 'testing'
  severity: 'critical' | 'high' | 'medium' | 'low'
  impact: 'developer-productivity' | 'system-reliability' | 'feature-velocity' | 'security'
  effort: 'small' | 'medium' | 'large'
}

// 技术债务看板
// 策略：
// ├── 每个 Sprint 预留 20% 时间处理技术债务
// ├── 新代码不增加已知债务（Boy Scout Rule）
// ├── 债务可视化（看板 + 量化指标）
// └── 定期债务评审（季度）
```

### 3. 技术决策记录（ADR）

```markdown
# ADR-001: 选择 Zustand 作为状态管理方案

## 状态：已接受

## 背景

- 项目需要全局状态管理
- 团队 5 人，中级工程师为主
- 需要 TypeScript 强类型支持

## 决策

选择 Zustand 而非 Redux Toolkit / Jotai / Valtio

## 理由

- API 简单，学习曲线低（适合团队水平）
- TypeScript 支持优秀
- 包大小小（< 1KB）
- 社区活跃，维护良好

## 被否决的方案

- Redux Toolkit：太重，样板代码多
- Jotai：原子化模型团队不熟悉
- Valtio：Proxy 模式调试困难

## 后果

- 正面：开发效率提升
- 负面：大型状态场景可能需要额外优化
```

---

## 高频面试题

### Q1: 如何推动一个技术决策落地？

**参考答案要点**：

- 撰写 RFC/ADR 文档（背景、方案、trade-off）
- 找到关键利益相关方，提前沟通
- 在技术评审会上获得认可
- 制定执行计划和里程碑
- 定期同步进度，处理阻塞

### Q2: 如何管理技术债务？

**参考答案要点**：

- 识别和记录（债务看板）
- 分类和优先级（按影响和紧急度）
- 每个迭代预留 20% 时间
- 新代码不增加已知债务
- 季度债务评审

### Q3: TL 和高级工程师的区别？

**参考答案要点**：

- 高级工程师：解决技术问题
- TL：做正确的技术决策 + 培养团队 + 跨团队协作
- TL 需要更强的沟通能力和影响力
- TL 需要在不确定中做决策

---

## 延伸思考

1. **设计题**：为你的团队设计一个 RFC 流程。
2. **场景题**：团队成员强烈反对你的技术决策，如何处理？
3. **对比题**：自顶向下 vs 自底向上的技术决策，各自的优劣？

---

## 参考资料

- [RFC 流程最佳实践](https://github.com/joelparkerhenderson/rfc)
- [Architecture Decision Records](https://adr.github.io)
- [技术债务管理](https://www.atlassian.com/continuous-delivery/technical-debt)
