---
title: AI 代码检查 — CI/CD 集成方案
order: 5
---

# AI 代码检查 — CI/CD 集成方案

> AI 代码检查如果不集成到 CI/CD 流程中，就只是一个"开发者想起来才跑一下"的脚本。只有嵌入到 PR 流程和发布管线中，它才能真正发挥作用——在代码合入之前自动发现问题，在问题扩散之前拦截。

---

## 一、触发时机与执行模式

### 1.1 三种触发模式

```
┌─────────────────────────────────────────────────────────────────┐
│                    触发模式对比                                    │
│                                                                  │
│   模式 A：PR 触发（推荐首选）                                     │
│   ├── 触发：PR 创建 / 更新时                                      │
│   ├── 范围：只检查 diff 涉及的文件                                │
│   ├── 反馈：PR Review Comment / Check Status                     │
│   ├── 延迟：3-10 分钟                                            │
│   └── 定位：日常开发的"安全网"                                    │
│                                                                  │
│   模式 B：定时扫描                                                │
│   ├── 触发：每日凌晨 / 每周一                                     │
│   ├── 范围：全量扫描（有缓存优化）                                │
│   ├── 反馈：报告邮件 / 看板 / 通知群                              │
│   ├── 延迟：数十分钟到数小时                                      │
│   └── 定位：存量问题发现 + 质量趋势跟踪                           │
│                                                                  │
│   模式 C：发布前门禁                                              │
│   ├── 触发：版本发布前 / Tag 创建时                               │
│   ├── 范围：全量扫描 + 严格模式（降低置信度阈值）                 │
│   ├── 反馈：阻断发布 / 生成质量报告                               │
│   ├── 延迟：可能较长，但发布前可以接受                            │
│   └── 定位：最终质量把关                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 推荐策略

```
日常开发：  PR 触发（增量）     → 快速反馈，不阻塞开发
每周一次：  定时扫描（全量）    → 发现存量问题，生成趋势报告
版本发布：  发布门禁（全量严格） → 阻断发布，确保质量基线
```

---

## 二、GitHub Actions 集成

### 2.1 PR 增量检查

```yaml
# .github/workflows/ai-inspect.yml
name: AI Code Inspection

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  inspect:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 需要完整历史来计算 diff

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run AI Inspection
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          node scripts/runner.js \
            --mode diff \
            --base ${{ github.event.pull_request.base.sha }} \
            --head ${{ github.event.pull_request.head.sha }} \
            --output results.json \
            --format sarif

      - name: Upload SARIF results
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif

      - name: Post PR Comment
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs')
            const results = JSON.parse(fs.readFileSync('results.json', 'utf8'))
            const body = formatResults(results)

            // 查找已有的 AI 检查评论（更新而非重复发）
            const comments = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            })
            const existing = comments.data.find(c =>
              c.body.includes('<!-- ai-inspection-report -->')
            )

            if (existing) {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: existing.id,
                body,
              })
            } else {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body,
              })
            }

      - name: Fail on errors
        if: always()
        run: |
          node -e "
            const r = require('./results.json');
            if (r.summary.errors > 0) {
              console.error('发现 ' + r.summary.errors + ' 个 error 级别问题');
              process.exit(1);
            }
          "
```

### 2.2 PR 评论格式

```markdown
<!-- ai-inspection-report -->
## 🤖 AI 代码检查报告

**检查范围**：本次 PR 变更的 12 个文件
**检查耗时**：2 分 34 秒 | **模型**：GPT-4o | **Token 消耗**：45,230

### 📊 结果摘要

| 级别 | 数量 |
|------|------|
| 🔴 Error | 1 |
| 🟡 Warning | 3 |
| 🔵 Info | 2 |

### 🔴 Error

**[arch-layer-violation]** `src/components/UserTable.vue:42`
> 组件直接 import 了 `@/api/user-api` 的 `fetchUsers`，违反分层架构。
> 建议：通过 `composables/useUserList.js` 间接调用。

### 🟡 Warning

**[func-too-long]** `src/composables/useOrderList.js:15-78`
> 函数 `loadAndProcessOrders` 共 63 行，建议拆分为更小的函数。

**[poor-naming]** `src/utils/helpers.js:23`
> 变量名 `data` 不够明确，建议改为 `userProfileData`。

---
<sub>由 AI Code Inspection 自动检查 | [误报？点击反馈](https://xxx) | [查看规则说明](https://xxx)</sub>
```

---

## 三、成本控制策略

### 3.1 成本构成

```
AI 检查成本 = 检查文件数 × 每文件平均 Token × 每 Token 单价

示例计算（GPT-4o，$2.5/1M input tokens）：
├── 日均 PR 数量：20
├── 每个 PR 平均变更文件：8
├── 每个文件平均 Token：3000（代码 + 上下文 + 系统指令）
├── 日均 Token 消耗：20 × 8 × 3000 = 480,000 tokens
├── 日均成本：480,000 × $2.5 / 1,000,000 = $1.2/天
└── 月均成本：~$36/月

这个成本对于中大型团队来说完全可以接受。
```

### 3.2 成本控制手段

| 手段 | 节省比例 | 说明 |
|------|---------|------|
| **只检查 diff** | 节省 80%+ | 相比全量扫描，PR 模式只检查变更文件 |
| **文件级缓存** | 节省 30-50% | 未修改文件跳过检查 |
| **模型分级** | 节省 40-60% | 简单规则用小模型（GPT-4o-mini 便宜 15 倍） |
| **规则合并** | 节省 50-70% | 3-5 条规则合一个 Prompt，减少重复的系统指令 |
| **排除策略** | 节省 10-20% | 排除生成代码、测试文件、legacy 目录 |
| **置信度阈值** | 间接节省 | 低置信度结果不报告，减少人工审核成本 |

### 3.3 成本监控

```javascript
// 每次检查后记录成本数据
function recordCost(ruleId, model, inputTokens, outputTokens) {
  const cost = COST_TABLE[model] || { input: 0, output: 0 }
  const expense = (inputTokens * cost.input + outputTokens * cost.output) / 1000000

  costLog.push({
    date: new Date().toISOString(),
    ruleId,
    model,
    inputTokens,
    outputTokens,
    expense,  // 美元
  })
}

// 每日汇总
// {
//   "2026-09-15": {
//     "totalRequests": 156,
//     "totalTokens": 478000,
//     "totalExpense": 1.19,
//     "byModel": { "gpt-4o-mini": 0.05, "gpt-4o": 0.89, "claude-sonnet": 0.25 }
//   }
// }
```

---

## 四、结果输出格式

### 4.1 多格式输出

```javascript
// scripts/reporter.js

/**
 * 生成多种格式的检查报告
 */
class Reporter {
  constructor(results) {
    this.results = results
  }

  // JSON 格式（程序消费）
  toJSON() {
    return JSON.stringify(this.results, null, 2)
  }

  // SARIF 格式（GitHub Code Scanning 标准）
  toSARIF() {
    return {
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: [{
        tool: {
          driver: {
            name: 'AI Code Inspection',
            version: '1.0.0',
            rules: this.results.rules.map(r => ({
              id: r.id,
              shortDescription: { text: r.description },
              defaultConfiguration: { level: r.severity },
            })),
          },
        },
        results: this.results.issues.map(issue => ({
          ruleId: issue.ruleId,
          level: issue.severity === 'error' ? 'error' : 'warning',
          message: { text: issue.message },
          locations: [{
            physicalLocation: {
              artifactLocation: { uri: issue.file },
              region: {
                startLine: issue.line,
                startColumn: issue.column,
              },
            },
          }],
        })),
      }],
    }
  }

  // Markdown 格式（PR 评论 / 文档）
  toMarkdown() {
    const { summary, issues } = this.results
    let md = `## AI 代码检查报告\n\n`
    md += `| 级别 | 数量 |\n|------|------|\n`
    md += `| 🔴 Error | ${summary.errors} |\n`
    md += `| 🟡 Warning | ${summary.warnings} |\n`
    md += `| 🔵 Info | ${summary.infos} |\n\n`

    if (issues.length === 0) {
      md += '✅ 未发现任何问题。\n'
      return md
    }

    // 按严重级别分组输出
    for (const severity of ['error', 'warning', 'info']) {
      const group = issues.filter(i => i.severity === severity)
      if (group.length === 0) continue
      const icon = { error: '🔴', warning: '🟡', info: '🔵' }[severity]
      md += `### ${icon} ${severity.toUpperCase()}\n\n`
      for (const issue of group) {
        md += `**[${issue.ruleId}]** \`${issue.file}:${issue.line}\`\n`
        md += `> ${issue.message}\n`
        if (issue.suggestion) md += `> 建议：${issue.suggestion}\n`
        md += '\n'
      }
    }

    return md
  }
}
```

### 4.2 SARIF 格式的价值

```
SARIF（Static Analysis Results Interchange Format）是微软主导的静态分析结果标准格式。

使用 SARIF 的好处：
├── GitHub Code Scanning 原生支持 → 检查结果直接显示在 Security 面板
├── VS Code 支持 SARIF 查看器 → 开发者在 IDE 中直接看到问题
├── 跨工具互通 → 不同检查工具的结果可以统一展示
└── 标准化 → 不依赖特定 CI 平台的格式
```

---

## 五、渐进式引入策略

### 5.1 三阶段引入

```
┌─────────────────────────────────────────────────────────────────┐
│                    渐进式引入路线                                  │
│                                                                  │
│   Phase 1：只报告，不阻断（1-2 周）                               │
│   ├── 只开启 info 级别规则                                        │
│   ├── 结果以 PR 评论形式展示                                      │
│   ├── 不阻断合并，让团队熟悉 AI 检查的输出风格                    │
│   ├── 收集误报反馈，调优 Prompt                                   │
│   └── 目标：团队接受 AI 检查的存在                                │
│                                                                  │
│   Phase 2：Warning 级别生效（2-4 周）                             │
│   ├── 开启 warning + info 级别规则                                │
│   ├── Warning 级别问题在 PR 中高亮提醒                            │
│   ├── 仍然不阻断合并，但统计 warning 数量                         │
│   ├── 持续收集误报，优化规则                                      │
│   └── 目标：误报率降到 10% 以下                                   │
│                                                                  │
│   Phase 3：Error 级别阻断（持续）                                 │
│   ├── 开启全部规则                                                  │
│   ├── Error 级别问题阻断 PR 合并                                  │
│   ├── 保留完善的误报抑制机制                                      │
│   ├── 定期 Review 规则有效性                                      │
│   └── 目标：Error 级别问题零容忍                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 团队沟通模板

```markdown
## 关于引入 AI 代码检查的说明

### 是什么
在 CI 流程中新增一个 AI 代码检查步骤，自动审查 PR 中的代码变更。

### 不是什么
- 不是替代人工 Code Review
- 不是替代 ESLint / TypeScript
- 是在人工 Review 之前先做一轮自动化预检

### 检查什么
- 架构分层是否合规（组件是否直接调了 API）
- 是否有安全隐患（硬编码密钥、XSS 风险）
- 代码质量问题（函数过长、命名不清）

### 不会做什么
- 不会阻断你的 PR（初期只报告不阻断）
- 不会检查测试文件和生成代码
- 不会发送大量误报骚扰你

### 如何反馈误报
在 PR 评论中回复 "误报" 或在检查结果下方点击反馈链接。
```

---

## 六、总结

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   CI/CD 集成核心要点：                                            │
│                                                                  │
│   1. 三种触发模式：PR 增量（日常）+ 定时全量（周）+ 发布门禁      │
│   2. GitHub Actions 集成：SARIF 输出 + PR 评论 + Check Status    │
│   3. 成本控制：diff 采集 + 缓存 + 模型分级 + 规则合并            │
│   4. 多格式输出：JSON（程序）+ SARIF（GitHub）+ Markdown（人）   │
│   5. 渐进式引入：只报告 → Warning 生效 → Error 阻断              │
│   6. 团队沟通：明确"是什么"和"不是什么"，降低抵触情绪            │
│                                                                  │
│   AI 代码检查只有集成到 CI/CD 中才有价值。                        │
│   不集成的 AI 检查 = 一个没人记得跑的脚本                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
