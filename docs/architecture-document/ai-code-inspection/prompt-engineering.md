---
title: AI 代码检查 — Prompt 工程策略
order: 2
---

# AI 代码检查 — Prompt 工程策略

> Prompt 是 AI 代码检查系统的"规则定义语言"。传统 Lint 用 AST 匹配定义规则，AI 检查用 Prompt 定义规则。Prompt 的质量直接决定了检查的准确性和稳定性。

---

## 一、Prompt 设计核心原则

### 1.1 四要素框架

每个代码检查 Prompt 都应包含四个要素：

```
┌─────────────────────────────────────────────────────────────────┐
│                    代码检查 Prompt 四要素                         │
│                                                                  │
│   ① 角色（Role）                                                 │
│      你是资深前端架构师 / 安全专家 / 性能工程师                    │
│      作用：激活模型在特定领域的判断能力                            │
│                                                                  │
│   ② 规范（Standard）                                             │
│      项目编码规范 + 检查规则的具体描述                             │
│      作用：告诉 AI "什么是对的，什么是错的"                       │
│                                                                  │
│   ③ 示例（Examples）                                             │
│      正例（合规代码）+ 反例（违规代码）+ 期望输出                  │
│      作用：消除歧义，让 AI 理解判断标准                           │
│                                                                  │
│   ④ 输出格式（Output Format）                                    │
│      JSON Schema 约束 + 字段说明                                  │
│      作用：确保返回结果可被程序化解析                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 原则 1：输出格式必须强约束

```markdown
<!-- ✅ 正确：强制 JSON Schema 输出 -->

你必须严格按照以下 JSON 格式输出检查结果。不要输出任何 JSON 之外的内容。

输出格式：
```json
{
  "issues": [
    {
      "ruleId": "规则ID",
      "severity": "error | warning | info",
      "line": 行号,
      "column": 列号,
      "message": "问题描述",
      "suggestion": "修复建议",
      "confidence": 0.0-1.0
    }
  ],
  "summary": {
    "totalIssues": 总数,
    "errors": 错误数,
    "warnings": 警告数
  }
}
```

如果没有发现任何问题，输出 `{"issues": [], "summary": {"totalIssues": 0, "errors": 0, "warnings": 0}}`
```

```markdown
<!-- ❌ 反模式：开放式输出 -->

请检查以下代码是否有问题，给出你的分析。

<!-- 问题：输出格式不确定，无法程序化解析 -->
```

### 1.3 原则 2：规则描述必须具体可判断

```markdown
<!-- ✅ 正确：具体、可判断 -->

规则 [arch-layer-violation]：
组件文件（*.vue）中不允许直接 import api/ 目录下的函数。
组件应该通过 composable/ 目录下的组合函数间接获取数据。

违规示例：
```javascript
// src/components/UserList.vue
import { fetchUsers } from '@/api/user-api'  // ❌ 违规：组件直接调用 API 层
```

合规示例：
```javascript
// src/components/UserList.vue
import { useUserList } from '@/composables/useUserList'  // ✅ 合规：通过 composable 间接调用
```
```

```markdown
<!-- ❌ 反模式：模糊、不可判断 -->

请检查代码是否遵循了良好的架构设计。

<!-- 问题："良好的架构设计"太模糊，AI 会按自己的理解随意判断 -->
```

### 1.4 原则 3：Few-shot 示例是准确率的倍增器

```markdown
<!-- 在 Prompt 中提供 2-3 个示例，显著提升准确率 -->

## 检查示例

### 示例 1：架构违规
输入代码：
```javascript
// src/components/OrderTable.vue
<script setup>
import { fetchOrders } from '@/api/order-api'
const orders = ref([])
onMounted(async () => { orders.value = await fetchOrders() })
</script>
```
期望输出：
```json
{
  "issues": [{
    "ruleId": "arch-layer-violation",
    "severity": "error",
    "line": 2,
    "message": "组件直接 import 了 api/order-api，违反分层架构。应通过 composable 间接调用。",
    "suggestion": "创建 composable/useOrderList.js，在其中调用 fetchOrders()，组件只消费 composable 返回的数据。",
    "confidence": 0.95
  }]
}
```

### 示例 2：合规代码
输入代码：
```javascript
// src/components/OrderTable.vue
<script setup>
import { useOrderList } from '@/composables/useOrderList'
const { orders, loading } = useOrderList()
</script>
```
期望输出：
```json
{"issues": [], "summary": {"totalIssues": 0, "errors": 0, "warnings": 0}}
```
```

---

## 二、不同检查场景的 Prompt 模板

### 2.1 代码质量检查

```markdown
# 角色
你是一位资深前端代码审查专家，专注于代码可读性和可维护性。

# 检查规则
请检查以下代码是否存在以下问题：

1. [函数过长] 单个函数超过 50 行（不含空行和注释）
2. [职责混杂] 一个函数同时做了两件以上不相关的事
3. [命名不清] 变量/函数名不能准确表达其用途（如 data1, temp, handle, process）
4. [魔法数字] 代码中出现了未定义为常量的数字字面量
5. [深层嵌套] if/for 嵌套超过 3 层
6. [重复逻辑] 代码中有明显的重复模式可以抽取为公共函数

# 输出格式
[JSON Schema 约束，同上]

# 待检查代码
{{code}}
```

### 2.2 安全漏洞检查

```markdown
# 角色
你是一位应用安全专家，专注于前端代码中的安全漏洞检测。

# 检查规则
请检查以下代码是否存在以下安全问题：

1. [硬编码密钥] 代码中直接写了 API Key、Token、密码等敏感信息
2. [XSS 风险] 使用 v-html / innerHTML / dangerouslySetInnerHTML 且数据来源不可控
3. [不安全的 eval] 使用 eval()、new Function()、setTimeout(string) 等动态执行
4. [正则 ReDoS] 正则表达式存在灾难性回溯风险
5. [不安全的 URL] 使用 http:// 而非 https:// 加载外部资源
6. [敏感数据暴露] 在 console.log 中输出了敏感信息（token、密码等）

# 严重级别定义
- error：可被直接利用的安全漏洞
- warning：存在潜在安全风险
- info：安全最佳实践建议

# 输出格式
[JSON Schema 约束]

# 待检查代码
{{code}}
```

### 2.3 架构合规检查

```markdown
# 角色
你是一位前端架构师，专注于项目架构规范的执行。

# 项目架构规范
本项目采用以下分层架构：
- api/：接口请求层，只负责发 HTTP 请求，返回原始数据
- transforms/：算法层，纯函数，不 import 框架 API
- composables/：组合层，连接数据层和 UI 层
- components/：显示层，只负责 UI 渲染

# 依赖方向规则（只能向下依赖）
components → composables → transforms → api
不允许反向依赖，不允许跨层依赖

# 检查规则
1. [反向依赖] 下层 import 了上层模块
2. [跨层调用] 组件直接调用 api/ 函数
3. [框架污染] transforms/ 中的纯函数 import 了 vue/react
4. [循环依赖] A import B，B 又 import A

# 输出格式
[JSON Schema 约束]

# 待检查代码
文件路径：{{filePath}}
文件内容：
{{code}}

相关 import 的来源文件（供参考）：
{{importContext}}
```

### 2.4 性能问题检查

```markdown
# 角色
你是一位前端性能优化专家。

# 检查规则
请检查以下代码是否存在以下性能问题：

1. [大组件未拆分] 单文件组件超过 400 行，应考虑拆分
2. [同步加载大依赖] 非首屏组件使用了同步 import 而非 defineAsyncComponent
3. [不必要的响应式] 大量不需要响应式的数据使用了 ref/reactive
4. [循环中的重复计算] 在 v-for 循环中每次都调用相同的计算函数
5. [未使用虚拟列表] 渲染超过 100 条数据的列表但未使用虚拟滚动
6. [图片未优化] 大图未使用懒加载、格式未优化

# 输出格式
[JSON Schema 约束]

# 待检查代码
{{code}}
```

---

## 三、Prompt 版本管理

### 3.1 为什么需要版本管理

```
场景：
• v1.0 的 Prompt 在 GPT-4o 上准确率 85%
• 模型升级到 GPT-4o-2024-11-20 后，同一条 Prompt 准确率降到 70%
• 你修改了 Prompt 措辞，准确率回到 90%
• 但你不知道这次修改会不会导致其他规则的准确率变化

→ Prompt 需要像代码一样进行版本管理
```

### 3.2 版本管理策略

```
prompts/
├── code-quality/
│   ├── v1.0.0.md          # 初始版本
│   ├── v1.1.0.md          # 新增"魔法数字"检查规则
│   ├── v1.1.1.md          # 修复：减少误报的措辞调整
│   ├── v2.0.0.md          # 重大重构：改变输出格式
│   └── current → v1.1.1   # 软链接或配置指向当前版本
│
├── security/
│   ├── v1.0.0.md
│   └── current → v1.0.0
│
└── architecture/
    ├── v1.0.0.md
    └── current → v1.0.0
```

### 3.3 基线测试集

```javascript
// tests/baseline/code-quality.baseline.js
// 每条基线测试 = 输入代码 + 期望输出
module.exports = [
  {
    name: '函数过长应报警',
    input: generateLongFunction(60),  // 60 行函数
    expected: {
      ruleId: 'func-too-long',
      severity: 'warning',
    },
  },
  {
    name: '合规代码不应误报',
    input: `function add(a, b) { return a + b; }`,
    expected: {
      issues: [],
    },
  },
  // ... 更多基线
]

// 每次修改 Prompt 后运行基线测试
// 如果基线通过率下降，说明 Prompt 修改引入了回归
```

---

## 四、多模型适配

### 4.1 模型分级策略

```
┌─────────────────────────────────────────────────────────────────┐
│                    模型分级使用策略                                │
│                                                                  │
│   简单规则（命名检查、格式检查）                                   │
│   ├── 模型：GPT-4o-mini / Claude Haiku / 本地小模型              │
│   ├── 成本：极低                                                 │
│   └── 原因：简单规则不需要强推理能力                             │
│                                                                  │
│   中等规则（架构合规、性能检查）                                   │
│   ├── 模型：GPT-4o / Claude Sonnet                               │
│   ├── 成本：中等                                                 │
│   └── 原因：需要理解代码结构和上下文                             │
│                                                                  │
│   复杂规则（安全漏洞、业务逻辑审查）                               │
│   ├── 模型：Claude Opus / o1 / 最强可用模型                      │
│   ├── 成本：较高                                                 │
│   └── 原因：需要深度推理和多步分析                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 模型适配层

```javascript
// scripts/executor.js
const MODEL_CONFIGS = {
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    maxTokens: 4096,
    temperature: 0,  // 代码检查需要确定性，不用创造性
  },
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 8192,
    temperature: 0,
  },
  'claude-sonnet': {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    maxTokens: 8192,
    temperature: 0,
  },
  'local-qwen': {
    provider: 'ollama',
    model: 'qwen2.5:14b',
    baseUrl: 'http://localhost:11434',
    maxTokens: 4096,
    temperature: 0,
  },
}

// 规则与模型的绑定
const RULE_MODEL_MAP = {
  'naming-check': 'gpt-4o-mini',       // 简单规则用小模型
  'arch-compliance': 'gpt-4o',         // 中等规则用中模型
  'security-audit': 'claude-sonnet',   // 复杂规则用强模型
}

async function executeCheck(rule, prompt, code) {
  const modelId = RULE_MODEL_MAP[rule.id] || 'gpt-4o'
  const config = MODEL_CONFIGS[modelId]
  return callLLM(config, prompt, code)
}
```

### 4.3 降级与重试

```javascript
async function callWithFallback(prompt, code, maxRetries = 2) {
  const models = ['gpt-4o', 'claude-sonnet', 'local-qwen']  // 降级链

  for (const modelId of models) {
    try {
      const result = await callLLM(MODEL_CONFIGS[modelId], prompt, code)
      const parsed = validateOutput(result)  // 校验输出格式
      if (parsed.valid) return { ...parsed, model: modelId }
    } catch (error) {
      console.warn(`模型 ${modelId} 失败: ${error.message}，尝试下一个`)
    }
  }

  throw new Error('所有模型均失败')
}
```

---

## 五、Prompt 调优实践

### 5.1 降低误报的常用技巧

| 技巧 | 说明 | 示例 |
|------|------|------|
| **明确排除条件** | 告诉 AI 什么不算违规 | "以下情况不算违规：测试文件中的硬编码、注释中的示例代码" |
| **提高置信度阈值** | 只报告高置信度的问题 | "confidence < 0.7 的问题不要报告" |
| **增加正例** | 给 AI 看"看起来像违规但实际合规"的代码 | "这个写法虽然直接调用了 API，但在 composable 内部是允许的" |
| **分步检查** | 让 AI 先分析再判断 | "第一步：列出代码中的所有 import。第二步：检查每个 import 的来源目录。第三步：判断是否违反依赖方向规则。" |

### 5.2 提升召回率的常用技巧

| 技巧 | 说明 |
|------|------|
| **细化规则描述** | 越具体的描述，AI 越容易匹配到问题 |
| **增加反例数量** | 3-5 个反例比 1 个反例效果好得多 |
| **要求 AI 逐行检查** | "请逐行检查以下代码，对每一行判断是否违反规则" |
| **分解复杂规则** | 一条大规则拆成多条小规则，分别检查 |

---

## 六、总结

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Prompt 工程核心要点：                                          │
│                                                                  │
│   1. 四要素：角色 + 规范 + 示例 + 输出格式                       │
│   2. 输出强约束：JSON Schema 约束，确保可程序化解析              │
│   3. 规则具体化：用代码示例定义"什么是对的，什么是错的"          │
│   4. 版本管理：Prompt 像代码一样版本化 + 基线测试               │
│   5. 模型分级：简单规则用小模型，复杂规则用强模型                │
│   6. 持续调优：根据误报/漏报数据迭代 Prompt 措辞               │
│                                                                  │
│   Prompt 是 AI 代码检查系统的灵魂。                              │
│   好的 Prompt = 好的规则定义 = 高准确率 + 低误报率              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
