---
title: AI 代码检查 — 扩展性与自定义机制
order: 6
---

# AI 代码检查 — 扩展性与自定义机制

> 一个无法扩展的 AI 检查系统，只能解决"昨天的问题"。真正的架构价值在于：让团队能自己添加规则、适配新项目、接入新模型，而不需要修改核心代码。本文阐述如何让 AI 代码检查系统具备插件化、可配置、可演进的能力。

---

## 一、插件化架构

### 1.1 检查器接口

```javascript
// scripts/inspector-interface.js

/**
 * 所有检查器必须实现的标准接口
 */
class InspectorInterface {
  /**
   * @returns {string} 检查器唯一 ID
   */
  get id() { throw new Error('必须实现 id getter') }

  /**
   * @returns {string} 检查器名称
   */
  get name() { throw new Error('必须实现 name getter') }

  /**
   * @returns {string} 检查器版本
   */
  get version() { return '1.0.0' }

  /**
   * 判断是否应该检查该文件
   * @param {string} filePath
   * @returns {boolean}
   */
  shouldInspect(filePath) { throw new Error('必须实现 shouldInspect') }

  /**
   * 执行检查
   * @param {Object} context - 检查上下文
   * @param {string} context.filePath - 文件路径
   * @param {string} context.content - 文件内容
   * @param {Object[]} context.importContext - 依赖上下文
   * @param {Object} context.config - 规则配置
   * @returns {Promise<Object[]>} 检查结果数组
   */
  async inspect(context) { throw new Error('必须实现 inspect') }
}
```

### 1.2 内置检查器实现

```javascript
// scripts/inspectors/ai-inspector.js

class AIInspector extends InspectorInterface {
  get id() { return 'ai-inspector' }
  get name() { return 'AI 语义检查器' }

  shouldInspect(filePath) {
    return /\.(vue|ts|tsx|js|jsx|dart|py)$/.test(filePath)
  }

  async inspect(context) {
    const { filePath, content, importContext, config } = context

    // 1. 加载 Prompt 模板
    const promptTemplate = loadPrompt(config.promptTemplate)

    // 2. 组装上下文
    const prompt = assemblePrompt(promptTemplate, {
      code: content,
      filePath,
      importContext,
      rules: config.rules,
    })

    // 3. 调用 AI
    const result = await callLLM(config.model, prompt)

    // 4. 解析并返回结果
    return parseAIResult(result, { filePath })
  }
}

module.exports = AIInspector
```

### 1.3 自定义检查器示例

```javascript
// 团队可以编写自己的检查器

// custom-inspectors/business-rule-checker.js
class BusinessRuleInspector extends InspectorInterface {
  get id() { return 'business-rule' }
  get name() { return '业务规则检查器' }

  shouldInspect(filePath) {
    // 只检查业务模块
    return filePath.includes('/modules/')
  }

  async inspect(context) {
    const { content, filePath } = context
    const issues = []

    // 自定义业务规则：所有金额计算必须使用 Decimal 类型
    if (/\b(float|Number)\b.*\b(price|amount|total|money)\b/i.test(content)) {
      issues.push({
        ruleId: 'business-amount-type',
        severity: 'error',
        file: filePath,
        line: findLineNumber(content, /float|Number.*price|amount/),
        message: '金额字段必须使用 Decimal 类型，不能使用 float 或 Number',
        suggestion: 'import Decimal from "decimal.js"; 使用 Decimal 类型处理金额计算',
        confidence: 0.9,
      })
    }

    // 自定义业务规则：所有 API 调用必须有错误处理
    // ... 更多业务规则

    return issues
  }
}

module.exports = BusinessRuleInspector
```

### 1.4 检查器注册与发现

```javascript
// scripts/registry.js

class InspectorRegistry {
  constructor() {
    this.inspectors = new Map()
  }

  /**
   * 注册检查器
   */
  register(inspector) {
    if (this.inspectors.has(inspector.id)) {
      throw new Error(`检查器 ${inspector.id} 已注册`)
    }
    this.inspectors.set(inspector.id, inspector)
  }

  /**
   * 自动发现并注册检查器
   * 扫描内置目录 + 项目自定义目录
   */
  async autoDiscover(projectRoot) {
    // 1. 加载内置检查器
    const builtinDir = path.join(__dirname, 'inspectors')
    const builtinFiles = glob.sync('*.js', { cwd: builtinDir })
    for (const file of builtinFiles) {
      const InspectorClass = require(path.join(builtinDir, file))
      this.register(new InspectorClass())
    }

    // 2. 加载项目自定义检查器
    const customDir = path.join(projectRoot, '.ai-inspection', 'inspectors')
    if (fs.existsSync(customDir)) {
      const customFiles = glob.sync('*.js', { cwd: customDir })
      for (const file of customFiles) {
        const InspectorClass = require(path.join(customDir, file))
        this.register(new InspectorClass())
      }
    }

    console.log(`已加载 ${this.inspectors.size} 个检查器`)
  }

  /**
   * 获取适用于指定文件的检查器
   */
  getApplicableInspectors(filePath) {
    return [...this.inspectors.values()].filter(i => i.shouldInspect(filePath))
  }
}
```

---

## 二、项目级自定义

### 2.1 配置文件体系

```
配置加载优先级（从高到低）：

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   1. CLI 参数（最高优先级）                                       │
│      node runner.js --severity error --model gpt-4o             │
│                                                                  │
│   2. 文件级指令                                                   │
│      // ai-ignore: rule-id                                       │
│                                                                  │
│   3. 目录级配置                                                   │
│      .ai-inspection/config.json（子目录覆盖）                    │
│                                                                  │
│   4. 项目级配置                                                   │
│      .ai-inspection/config.json（项目根目录）                    │
│                                                                  │
│   5. 团队级配置                                                   │
│      通过 npm 包分发的团队共享配置                                │
│                                                                  │
│   6. 全局默认（最低优先级）                                       │
│      脚本内置的 DEFAULT_CONFIG                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 项目配置模板

```json
// .ai-inspection/config.json — 完整配置示例
{
  // ── 检查器配置 ──
  "inspectors": {
    "ai-inspector": {
      "enabled": true,
      "model": "gpt-4o",
      "fallbackModel": "claude-sonnet",
      "maxConcurrency": 5,
      "timeout": 60000
    },
    "business-rule": {
      "enabled": true
    }
  },

  // ── 规则配置 ──
  "rules": {
    "arch-layer-violation": {
      "enabled": true,
      "severity": "error",
      "options": {
        "allowedDirectImports": ["@/utils/logger"]
      }
    },
    "func-too-long": {
      "enabled": true,
      "severity": "warning",
      "options": {
        "maxLines": 60
      }
    },
    "stale-comment": {
      "enabled": false
    }
  },

  // ── 采集配置 ──
  "collector": {
    "extensions": [".vue", ".ts", ".tsx", ".js", ".jsx"],
    "exclude": [
      "node_modules/**",
      "dist/**",
      "src/legacy/**",
      "**/*.generated.*",
      "**/*.test.*"
    ]
  },

  // ── 上下文配置 ──
  "context": {
    "maxTokens": 8000,
    "includeImportContext": true,
    "importContextMode": "signature",
    "specFiles": [
      ".ai-inspection/specs/general.md",
      ".ai-inspection/specs/vue-component.md"
    ]
  },

  // ── 缓存配置 ──
  "cache": {
    "enabled": true,
    "file": ".ai-inspect-cache.json",
    "ttl": "7d"
  },

  // ── 输出配置 ──
  "output": {
    "formats": ["json", "sarif", "markdown"],
    "outputDir": ".ai-inspection/reports",
    "confidenceThreshold": 0.7
  }
}
```

### 2.3 团队共享配置包

```javascript
// 团队可以发布 npm 包来共享配置
// npm 包名：@team/ai-inspection-config

// packages/ai-inspection-config/index.js
module.exports = {
  rules: {
    'arch-layer-violation': { severity: 'error', enabled: true },
    'hardcoded-secret': { severity: 'error', enabled: true },
    'xss-risk': { severity: 'error', enabled: true },
    'func-too-long': { severity: 'warning', options: { maxLines: 50 } },
  },
  inspectors: {
    'ai-inspector': { model: 'gpt-4o' },
  },
  // 团队自定义检查器
  customInspectors: [
    require('./inspectors/team-naming-convention'),
    require('./inspectors/team-api-pattern'),
  ],
}

// 项目中使用：
// .ai-inspection/config.json
// { "extends": "@team/ai-inspection-config" }
```

---

## 三、自定义 Prompt 模板

### 3.1 模板变量系统

```markdown
<!-- .ai-inspection/prompts/custom-architecture.md -->

# 角色
你是一位熟悉 {{projectName}} 项目的架构师。

# 项目架构
{{projectArchitecture}}

# 检查规则
{{rules}}

# 编码规范
{{relevantSpec}}

# 依赖上下文
{{importContext}}

# 待检查代码
文件：{{filePath}}

```{{language}}
{{code}}
```

# 输出要求
严格按 JSON 格式输出，不要输出 JSON 之外的内容。
```

### 3.2 变量解析

```javascript
// scripts/template-engine.js

const TEMPLATE_VARS = {
  '{{projectName}}': (ctx) => ctx.projectConfig.name || '本项目',
  '{{projectArchitecture}}': (ctx) => loadProjectArchitectureDesc(ctx),
  '{{rules}}': (ctx) => formatRules(ctx.rules),
  '{{relevantSpec}}': (ctx) => loadRelevantSpec(ctx.filePath),
  '{{importContext}}': (ctx) => formatImportContext(ctx.importContext),
  '{{filePath}}': (ctx) => ctx.filePath,
  '{{language}}': (ctx) => detectLanguage(ctx.filePath),
  '{{code}}': (ctx) => ctx.content,
}

function renderTemplate(templatePath, context) {
  let template = fs.readFileSync(templatePath, 'utf-8')

  for (const [varName, resolver] of Object.entries(TEMPLATE_VARS)) {
    template = template.replaceAll(varName, resolver(context))
  }

  return template
}
```

---

## 四、演进路线

### 4.1 四阶段演进

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI 代码检查系统演进路线                         │
│                                                                  │
│   Phase 1：单脚本 + 硬编码（1-2 周）                              │
│   ├── 一个 runner.js 脚本                                        │
│   ├── 1-2 条硬编码规则                                           │
│   ├── 直接调用 OpenAI API                                        │
│   ├── 输出到控制台                                               │
│   └── 目标：验证可行性，跑通最小闭环                              │
│                                                                  │
│   Phase 2：配置化 + 规则引擎（2-4 周）                            │
│   ├── 规则从代码中抽离为配置文件                                  │
│   ├── Prompt 模板化（变量替换）                                   │
│   ├── 支持多模型配置                                              │
│   ├── 输出 JSON + Markdown 报告                                  │
│   └── 目标：非核心开发者也能添加/修改规则                         │
│                                                                  │
│   Phase 3：插件化 + 团队共享（1-2 月）                            │
│   ├── 检查器接口标准化                                            │
│   ├── 支持自定义检查器（项目级 + 团队级）                         │
│   ├── 团队配置包 npm 分发                                         │
│   ├── CI/CD 集成（GitHub Actions + PR 评论）                     │
│   ├── 缓存 + 成本控制                                            │
│   └── 目标：团队可自助扩展，系统可规模化使用                      │
│                                                                  │
│   Phase 4：自学习 + 生态（长期）                                  │
│   ├── 误报反馈自动收集                                            │
│   ├── 基于反馈自动调优 Prompt（Prompt 自进化）                    │
│   ├── 检查规则市场（社区贡献规则共享）                            │
│   ├── 跨项目学习（A 项目的规则自动适配到 B 项目）                 │
│   └── 目标：系统越用越准，形成正反馈循环                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 各阶段的技术投入与收益

```
        收益
         ↑
         │                                        ╱ Phase 4
         │                                    ╱╱╱
         │                               ╱╱╱
         │                          ╱╱╱╱        Phase 3
         │                     ╱╱╱╱
         │                ╱╱╱╱
         │           ╱╱╱╱                Phase 2
         │      ╱╱╱╱
         │ ╱╱╱╱                         Phase 1
         │╱╱
         └──────────────────────────────────→ 时间/投入
           1周   1月   2月   3月   6月

关键洞察：
• Phase 1 投入最小但收益也最小（只是验证）
• Phase 2 是性价比最高的阶段（配置化后收益显著提升）
• Phase 3 需要较大投入但带来规模化收益
• Phase 4 是长期愿景，需要持续投入
```

---

## 五、最佳实践总结

### 5.1 规则设计

| 实践 | 说明 |
|------|------|
| **从少到多** | 先写 3-5 条高价值规则，验证效果后再扩展 |
| **从严格到宽松** | 先确保高优先级规则准确率，再添加低优先级规则 |
| **每条规则有测试** | 为正例和反例各写 2-3 个测试用例 |
| **定期 Review** | 每月检查一次规则的有效性，删除低价值规则 |

### 5.2 Prompt 管理

| 实践 | 说明 |
|------|------|
| **版本化** | Prompt 文件纳入 Git 管理，变更有记录 |
| **基线测试** | 每次修改 Prompt 后运行基线测试集 |
| **A/B 对比** | 新 Prompt 与旧 Prompt 在相同代码上对比效果 |
| **模型锁定** | 配置中指定模型版本，避免模型升级导致结果波动 |

### 5.3 团队协作

| 实践 | 说明 |
|------|------|
| **渐进式引入** | 只报告 → Warning → Error 阻断，逐步建立信任 |
| **误报反馈闭环** | 开发者反馈误报 → 分析模式 → 调优 Prompt → 验证 |
| **配置共享** | 团队级配置 npm 包分发，项目级可覆盖 |
| **文档完善** | 每条规则都有说明文档，开发者知道"为什么" |

---

## 六、总结

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   扩展性与自定义核心要点：                                        │
│                                                                  │
│   1. 插件化：检查器接口标准化，内置 + 自定义检查器共存            │
│   2. 分层配置：CLI > 文件 > 目录 > 项目 > 团队 > 全局            │
│   3. Prompt 模板化：变量系统 + 项目规范注入 + 团队共享            │
│   4. 四阶段演进：硬编码 → 配置化 → 插件化 → 自学习              │
│   5. 最佳实践：从少到多、版本化、基线测试、渐进式引入            │
│                                                                  │
│   一个好的 AI 代码检查系统，不是"能检查多少东西"，                │
│   而是"能让多少人参与进来添加检查"。                              │
│   可扩展性 = 系统的长期生命力                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
