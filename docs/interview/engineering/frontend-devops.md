---
title: "前端 DevOps 与发布体系 [P8]"
level: "architect"
tags: ["CI/CD", "Feature Flag", "金丝雀发布", "Preview Environment"]
difficulty: "hard"
updated: "2026-09-10"
target: "架构师（P8）"
---

# 前端 DevOps 与发布体系 [P8]

> 前端 DevOps 是将构建、测试、发布自动化的工程实践。2026 年，Feature Flag + 金丝雀发布 + Preview Environment 成为大型团队的标配。

## 核心概念（What）

### 前端发布体系全景

```
代码提交 → CI 检查 → 构建 → 测试 → 部署 → 灰度 → 全量
   │         │        │      │      │       │       │
   │    Lint/Test   Bundle  E2E   CDN   1%→5%  100%
   │    Type Check  Analyze Visual  OSS   →20%
   │    Security    Size    Perf   Nginx →50%
```

---

## 底层原理（Why）

### 1. CI/CD 流水线设计

```yaml
# GitHub Actions 示例
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test --coverage
      - run: pnpm build
      - run: pnpm bundlesize  # 检查包大小

  e2e:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - run: pnpm exec playwright test

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - run: pnpm deploy:preview  # 部署到 Preview 环境

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [quality, e2e]
    runs-on: ubuntu-latest
    steps:
      - run: pnpm deploy:canary  # 先部署到金丝雀
      - run: pnpm deploy:full    # 验证通过后全量
```

### 2. Feature Flag 体系

```typescript
// Feature Flag 服务集成
class FeatureFlagService {
  // 检查功能是否开启
  async isEnabled(flag: string, context: FlagContext): Promise<boolean> {
    const flags = await this.getFlags(context);
    return flags[flag]?.enabled ?? false;
  }

  // 按用户百分比灰度
  async isRolloutEnabled(flag: string, userId: string, percentage: number): Promise<boolean> {
    const hash = hashCode(userId + flag) % 100;
    return hash < percentage;
  }
}

// 使用
function NewFeature() {
  const isEnabled = useFeatureFlag('new-dashboard');
  if (!isEnabled) return null;
  return <NewDashboard />;
}
```

### 3. 金丝雀发布

```
金丝雀发布流程：
1. 构建新版本产物
2. 部署到 1% 的流量（按用户 ID 哈希分桶）
3. 监控关键指标（错误率、性能、业务指标）
4. 指标正常 → 扩大到 5% → 20% → 50% → 100%
5. 指标异常 → 自动回滚

Nginx 配置示例：
upstream canary {
  server cdn-v2.example.com weight=5;   # 5% 流量
  server cdn-v1.example.com weight=95;  # 95% 流量
}
```

### 4. Preview Environment

```
Preview Environment 流程：
1. PR 创建 → 自动触发构建
2. 部署到唯一 URL（如 pr-123.preview.example.com）
3. 自动运行 E2E 测试
4. 生成截图对比报告
5. PR 关闭 → 自动清理环境

工具：Vercel Preview / Netlify Preview / 自建方案
```

---

## 高频面试题

### Q1: 如何设计前端 CI/CD 流水线？

**参考答案要点**：
- 阶段：代码检查 → 构建 → 测试 → 部署
- 并行执行无依赖任务
- 缓存依赖和构建产物
- PR 部署 Preview 环境
- main 分支自动部署到生产

### Q2: Feature Flag 的核心价值是什么？

**参考答案要点**：
- 代码合并与功能发布解耦
- 支持灰度发布和 A/B 测试
- 快速回滚（关闭 Flag 即可）
- 支持按用户/地域/百分比灰度

### Q3: 如何实现前端灰度发布？

**参考答案要点**：
- CDN 层面：按权重分配流量到不同版本
- Nginx 层面：upstream 权重配置
- 应用层面：Feature Flag 控制功能开关
- 监控：灰度期间实时监控错误率和性能

---

## 延伸思考

1. **设计题**：设计一个支持多环境、多版本的前端发布体系。
2. **场景题**：一个版本上线后错误率飙升，如何在 5 分钟内回滚？
3. **对比题**：Vercel vs Netlify vs 自建 CI/CD，各自的 trade-off？

---

## 参考资料

- [Feature Flag 最佳实践](https://www.atlassian.com/continuous-delivery/feature-flags)
- [Canary Releases](https://martinfowler.com/bliki/CanaryRelease.html)
- [Preview Environments](https://vercel.com/docs/deployments/preview-deployments)
