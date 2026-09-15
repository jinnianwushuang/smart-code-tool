---
title: AI 代码检查 — 检查规则体系设计
order: 4
---

# AI 代码检查 — 检查规则体系设计

> 规则是 AI 代码检查系统的"灵魂"。没有规则，AI 不知道该检查什么；规则设计不好，要么漏检（false negative），要么误报（false positive），最终被开发者弃用。本文从数据结构、分类体系、优先级、误报管理四个维度，系统阐述规则体系的设计。

---

## 一、规则的数据结构

### 1.1 规则定义

```javascript
// rules/_schema.js — 规则的标准数据结构

/**
 * @typedef {Object} InspectionRule
 * @property {string} id - 规则唯一标识（kebab-case）
 * @property {string} name - 规则名称（人类可读）
 * @property {string} category - 所属分类
 * @property {'error'|'warning'|'info'} severity - 默认严重级别
 * @property {string[]} filePatterns - 适用的文件 glob 模式
 * @property {string} promptTemplate - 关联的 Prompt 模板路径
 * @property {string} description - 规则描述（给开发者看的说明）
 * @property {string} rationale - 为什么需要这条规则
 * @property {Object} options - 规则可配置选项
 * @property {string} model - 推荐使用的模型（可选）
 */

// 示例：一条架构合规规则
const archLayerViolation = {
  id: 'arch-layer-violation',
  name: '架构分层违规',
  category: 'architecture',
  severity: 'error',
  filePatterns: ['src/components/**/*.vue', 'src/components/**/*.ts'],
  promptTemplate: 'prompts/architecture.md',
  description: '组件不允许直接调用 API 层函数，应通过 composable 间接调用',
  rationale: '直接调用会导致组件与数据源耦合，违反分层架构原则，降低可测试性和可维护性',
  options: {
    allowedDirectImports: [],       // 允许组件直接 import 的模块白名单
    checkLayers: ['api', 'transform'],  // 需要检查的目标层
  },
  model: 'gpt-4o',  // 架构检查需要中等推理能力
}
```

### 1.2 规则注册表

```javascript
// rules/index.js — 所有规则的注册入口

const rules = [
  // ── 代码质量 ──
  require('./code-quality/func-too-long'),
  require('./code-quality/func-mixed-responsibility'),
  require('./code-quality/poor-naming'),
  require('./code-quality/magic-number'),
  require('./code-quality/deep-nesting'),

  // ── 安全 ──
  require('./security/hardcoded-secret'),
  require('./security/xss-risk'),
  require('./security/unsafe-eval'),
  require('./security/sensitive-data-log'),

  // ── 架构 ──
  require('./architecture/layer-violation'),
  require('./architecture/circular-dependency'),
  require('./architecture/framework-pollution'),

  // ── 性能 ──
  require('./performance/oversized-component'),
  require('./performance/sync-large-import'),
  require('./performance/missing-virtual-list'),

  // ── 可维护性 ──
  require('./maintainability/stale-comment'),
  require('./maintainability/todo-without-ticket'),
  require('./maintainability/dead-code'),
]

module.exports = rules
```

---

## 二、规则分类体系

### 2.1 五大分类

```
┌─────────────────────────────────────────────────────────────────┐
│                    规则分类体系                                    │
│                                                                  │
│   ① 代码质量（code-quality）                                     │
│   ├── 函数过长 / 职责混杂 / 命名不清                             │
│   ├── 魔法数字 / 深层嵌套 / 重复逻辑                             │
│   └── 特点：通用性强，跨语言跨框架                                │
│                                                                  │
│   ② 安全风险（security）                                         │
│   ├── 硬编码密钥 / XSS 风险 / 不安全的 eval                      │
│   ├── 敏感数据日志 / 不安全 URL / 正则 ReDoS                     │
│   └── 特点：严重级别通常为 error，零容忍                          │
│                                                                  │
│   ③ 架构合规（architecture）                                     │
│   ├── 分层违规 / 循环依赖 / 框架污染                             │
│   ├── 依赖方向违规 / 模块边界穿越                                 │
│   └── 特点：项目强相关，需要注入项目架构规范                      │
│                                                                  │
│   ④ 性能问题（performance）                                      │
│   ├── 大组件未拆分 / 同步加载大依赖                               │
│   ├── 不必要的响应式 / 缺少虚拟列表                               │
│   └── 特点：需要理解代码的运行时行为                              │
│                                                                  │
│   ⑤ 可维护性（maintainability）                                  │
│   ├── 过时注释 / TODO 无工单 / 死代码                            │
│   ├── console.log 残留 / 注释掉的代码                            │
│   └── 特点：低严重级别，但长期影响代码健康                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 分类与文件类型的关联矩阵

```
                    code-quality  security  architecture  performance  maintainability
Vue 组件 (*.vue)        ✓           ✓           ✓              ✓            ✓
TS/JS 逻辑 (*.ts)       ✓           ✓           ✓              ✓            ✓
API 层 (api/*.js)       ✓           ✓           ✓              -            ✓
Transform (纯函数)      ✓           ✓           ✓              -            ✓
Composable              ✓           ✓           ✓              ✓            ✓
测试文件 (*.test.*)     -           ✓           -              -            ✓
配置文件                -           ✓           -              -            -
```

---

## 三、规则优先级与执行策略

### 3.1 优先级定义

```javascript
// 规则执行优先级（从高到低）
const PRIORITY = {
  CRITICAL: 1,  // 安全漏洞、数据泄露风险 → 必须立即修复
  HIGH: 2,      // 架构违规、分层违反 → 本次迭代必须修复
  MEDIUM: 3,    // 代码质量问题 → 本次迭代建议修复
  LOW: 4,       // 性能优化建议 → 下个迭代考虑
  INFO: 5,      // 可维护性建议 → 有空再改
}

// 规则与优先级的映射
const RULE_PRIORITY = {
  'hardcoded-secret': PRIORITY.CRITICAL,
  'xss-risk': PRIORITY.CRITICAL,
  'arch-layer-violation': PRIORITY.HIGH,
  'circular-dependency': PRIORITY.HIGH,
  'func-too-long': PRIORITY.MEDIUM,
  'func-mixed-responsibility': PRIORITY.MEDIUM,
  'missing-virtual-list': PRIORITY.LOW,
  'stale-comment': PRIORITY.INFO,
}
```

### 3.2 执行策略

```javascript
/**
 * 根据优先级和 Token 预算决定本次检查执行哪些规则
 */
function selectRulesForFile(filePath, options) {
  const {
    maxRulesPerFile = 5,       // 单个文件最多检查几条规则
    maxTotalTokens = 16000,    // 总 Token 预算
  } = options

  // 1. 筛选适用当前文件的规则
  const applicableRules = allRules.filter(rule =>
    matchesFilePatterns(filePath, rule.filePatterns)
  )

  // 2. 按优先级排序
  applicableRules.sort((a, b) =>
    (RULE_PRIORITY[a.id] || 99) - (RULE_PRIORITY[b.id] || 99)
  )

  // 3. 截断：不超过最大规则数
  return applicableRules.slice(0, maxRulesPerFile)
}
```

### 3.3 合并检查 vs 分次检查

```
┌─────────────────────────────────────────────────────────────────┐
│                    规则执行模式                                    │
│                                                                  │
│   模式 A：合并检查（推荐）                                        │
│   ├── 将多条相关规则合并到一个 Prompt 中                          │
│   ├── 一次 AI 调用检查多条规则                                    │
│   ├── 优点：省 Token、速度快                                     │
│   ├── 缺点：规则太多时准确率下降                                  │
│   └── 适用：同一分类下的 3-5 条规则合并                          │
│                                                                  │
│   模式 B：分次检查                                                │
│   ├── 每条规则单独一个 Prompt                                     │
│   ├── 多次 AI 调用分别检查                                        │
│   ├── 优点：每条规则准确率高                                      │
│   ├── 缺点：Token 消耗大、速度慢                                  │
│   └── 适用：高优先级规则（安全/架构）需要精确检查                  │
│                                                                  │
│   最佳实践：混合模式                                              │
│   ├── 安全规则：分次检查（每条规则单独 Prompt）                   │
│   ├── 架构规则：分次检查（需要完整上下文）                        │
│   ├── 代码质量规则：合并检查（3-5 条合一个 Prompt）              │
│   └── 可维护性规则：合并检查（低优先级，节省成本）                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 四、误报管理

### 4.1 误报的来源

```
误报来源：
├── Prompt 描述不够精确 → AI 理解偏差
├── 上下文不足 → AI 缺少关键信息导致误判
├── 规则本身有边界条件 → 某些合法写法被误判为违规
├── 模型版本变化 → 同一 Prompt 在新模型上行为不同
└── 代码特殊性 → 某些特殊场景确实需要"违规"写法
```

### 4.2 误报抑制机制

```javascript
// 机制 1：行级忽略注释
// 开发者可以在代码中添加注释来跳过特定行的检查

// eslint-disable-next-line 的 AI 版本：
// ai-ignore: arch-layer-violation
import { fetchUsers } from '@/api/user-api'  // 此处因特殊原因需要直接调用

// 机制 2：文件级忽略配置
// .ai-inspect-ignore.json
{
  "ignoreRules": {
    "src/legacy/**/*.js": ["arch-layer-violation", "func-too-long"],
    "src/generated/**/*.ts": ["*"]
  }
}

// 机制 3：全局误报白名单
// .ai-inspection/false-positives.json
[
  {
    "ruleId": "magic-number",
    "pattern": "setTimeout(fn, 3000)",
    "reason": "3000ms 是项目约定的防抖延迟，不需要提取为常量",
    "addedBy": "张三",
    "addedAt": "2026-09-01"
  }
]

// 机制 4：置信度阈值
// AI 返回的 confidence < 0.7 的问题自动降级为 info 或不报告
const CONFIDENCE_THRESHOLD = {
  error: 0.85,    // error 级别需要 85% 以上置信度
  warning: 0.7,   // warning 级别需要 70% 以上
  info: 0.5,      // info 级别 50% 以上即可
}
```

### 4.3 误报反馈闭环

```
开发者看到误报
  │
  ↓ 在 PR 评论中标记 "误报" 或运行反馈命令
  │
  ↓ 反馈记录写入 false-positives.json
  │
  ↓ 定期（每周）分析误报模式
  │   ├── 同一规则频繁误报 → 调整 Prompt 措辞
  │   ├── 特定文件类型误报多 → 调整 filePatterns 或排除
  │   └── 特定写法总被误判 → 增加正例到 Prompt
  │
  ↓ 更新 Prompt + 规则配置
  │
  ↓ 运行基线测试验证改进
  │
  ↓ 误报率下降 ✓
```

---

## 五、规则配置体系

### 5.1 分层配置

```
配置优先级（从高到低）：
├── 文件级：代码中的 ai-ignore 注释（最高）
├── 目录级：.ai-inspect-ignore.json（目录覆盖）
├── 项目级：.ai-inspection/config.json（项目配置）
├── 团队级：team-config.json（团队共享配置）
└── 全局默认：scripts 中的 DEFAULT_CONFIG（最低）
```

### 5.2 项目级配置文件

```json
// .ai-inspection/config.json
{
  "rules": {
    "arch-layer-violation": {
      "severity": "error",
      "enabled": true,
      "options": {
        "allowedDirectImports": ["@/utils/logger"]
      }
    },
    "func-too-long": {
      "severity": "warning",
      "enabled": true,
      "options": {
        "maxLines": 60
      }
    },
    "stale-comment": {
      "enabled": false
    }
  },
  "global": {
    "maxConcurrency": 5,
    "cacheEnabled": true,
    "cacheFile": ".ai-inspect-cache.json",
    "confidenceThreshold": 0.7,
    "model": "gpt-4o",
    "fallbackModel": "claude-sonnet"
  },
  "exclude": [
    "node_modules/**",
    "dist/**",
    "src/legacy/**",
    "**/*.generated.*"
  ]
}
```

---

## 六、总结

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   规则体系设计核心要点：                                          │
│                                                                  │
│   1. 数据结构：统一的规则 Schema（id/分类/级别/文件模式/Prompt）  │
│   2. 五大分类：代码质量 / 安全 / 架构 / 性能 / 可维护性          │
│   3. 优先级驱动：CRITICAL → HIGH → MEDIUM → LOW → INFO          │
│   4. 执行策略：高优先级分次检查，低优先级合并检查                  │
│   5. 误报管理：四级抑制（行级/文件级/白名单/置信度）+ 反馈闭环   │
│   6. 分层配置：全局 → 团队 → 项目 → 目录 → 文件，逐层覆盖       │
│                                                                  │
│   规则体系的好坏，直接决定了 AI 代码检查的价值。                  │
│   规则太少 → 检查没有深度；规则太多 → 误报泛滥被弃用              │
│   关键是找到"高价值 + 低误报"的平衡点                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
