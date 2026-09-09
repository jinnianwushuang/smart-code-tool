---
title: "跨团队协作 [TL]"
level: "manager"
tags: ["接口契约", "联调流程", "SLA", "跨团队"]
difficulty: "hard"
updated: "2026-09-10"
target: "技术主管（TL）"
---

# 跨团队协作 [TL]

> TL 的 50% 时间在跨团队协作。2026 年，接口契约、联调流程、SLA 约定是跨团队协作的基础设施。

## 核心概念（What）

### 跨团队协作模型

```
├── 产品团队：需求对齐、优先级协商
├── 设计团队：设计评审、Design Token
├── 后端团队：接口契约、联调流程
├── 测试团队：测试策略、质量门禁
├── 运维团队：发布流程、监控告警
└── 安全团队：安全评审、合规检查
```

---

## 底层原理（Why）

### 1. 接口契约流程

```
接口契约流程（Contract-First）：

1. 需求评审
   └── 前后端 + 产品一起评审需求
   └── 明确数据需求和业务规则

2. 接口设计
   └── 后端先写 OpenAPI Spec（或 Protobuf）
   └── 前端评审接口设计（字段命名、分页、错误码）

3. 契约冻结
   └── 双方确认后冻结
   └── 变更需要走 RFC 流程

4. 并行开发
   └── 后端：按 Spec 实现 API
   └── 前端：基于 Mock Server 开发
   └── Mock Server 从 Spec 自动生成

5. 联调
   └── 切换到真实 API
   └── 按接口逐个验证
   └── 问题记录到看板
```

### 2. SLA 约定

```typescript
// SLA（Service Level Agreement）模板
interface SLA {
  // 可用性
  availability: {
    target: 99.9;          // 99.9% 可用性
    measurementWindow: 'monthly';
  };

  // 性能
  performance: {
    p50Latency: '100ms';   // 50% 请求 < 100ms
    p99Latency: '500ms';   // 99% 请求 < 500ms
    errorRate: '< 0.1%';   // 错误率 < 0.1%
  };

  // 响应时间
  response: {
    p0Incident: '15min';   // P0 故障 15 分钟响应
    p1Incident: '1hour';   // P1 故障 1 小时响应
    apiChange: '2weeks';   // API 变更提前 2 周通知
  };

  // 兼容性
  compatibility: {
    deprecationPeriod: '6months';  // 废弃 API 保留 6 个月
    breakingChangeNotice: '1month'; // 破坏性变更提前 1 个月
  };
}
```

### 3. 联调流程

```
联调流程：
├── 准备阶段
│   ├── 前端：完成页面开发（Mock 数据）
│   ├── 后端：API 开发完成 + 自测
│   └── 测试：准备测试用例
├── 联调阶段
│   ├── 前端切换到测试环境 API
│   ├── 按接口逐个验证
│   ├── 记录问题（字段不匹配、数据格式错误）
│   └── 每日联调进度同步
├── 集成测试
│   ├── 端到端流程验证
│   ├── 异常场景测试
│   └── 性能测试
└── 验收阶段
    ├── 产品验收
    ├── 设计走查
    └── 修复问题
```

### 4. 沟通机制

```
跨团队沟通机制：
├── 定期同步
│   ├── 周会：进度同步、问题暴露
│   ├── 站会：每日 15 分钟（关键项目）
│   └── 月度回顾：合作复盘
├── 文档驱动
│   ├── 需求文档（PRD）
│   ├── 技术方案（RFC/ADR）
│   ├── 接口文档（OpenAPI）
│   └── 会议纪要（决策记录）
├── 工具支持
│   ├── 项目管理（Jira/Linear）
│   ├── 即时通讯（Slack/飞书）
│   └── 文档协作（Notion/飞书文档）
└── 升级机制
    ├── 技术问题 → TL 协商
    ├── 优先级冲突 → 产品总监决策
    └── 资源冲突 → 部门经理协调
```

---

## 高频面试题

### Q1: 如何保证前后端高效协作？

**参考答案要点**：
- 契约优先（先定义接口，再并行开发）
- Mock Server 自动化（从 Spec 生成）
- 联调流程标准化（按接口逐个验证）
- 问题跟踪看板（透明化）
- 定期同步（减少信息差）

### Q2: 如何处理跨团队的优先级冲突？

**参考答案要点**：
- 提前沟通依赖关系和时间线
- 用数据说明影响（延迟导致的业务损失）
- 升级到共同上级决策
- 寻找替代方案（临时方案、分期交付）
- 建立跨团队协作 SLA

### Q3: 如何设计跨团队的接口变更流程？

**参考答案要点**：
- 变更方提前通知（SLA 约定时间）
- 影响评估（下游团队评估工作量）
- 向后兼容（新增字段而非修改）
- 废弃期（旧版本保留一段时间）
- 迁移支持（提供迁移指南和工具）

---

## 延伸思考

1. **设计题**：设计一个前后端分离项目的完整协作流程。
2. **场景题**：后端 API 突然改了字段，导致线上故障，如何处理？
3. **对比题**：契约优先 vs 代码优先的 API 开发模式？

---

## 参考资料

- [Contract-First Development](https://swagger.io/resources/articles/adopt-a-contract-first-approach/)
- [SLA Best Practices](https://www.atlassian.com/it-unplugged/it-service-level-management)
- [跨团队协作指南](https://www.atlassian.com/team-collaboration)
