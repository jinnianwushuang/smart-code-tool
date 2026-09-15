---
title: AI 代码检查 — 代码上下文采集与组装
order: 3
---

# AI 代码检查 — 代码上下文采集与组装

> AI 代码检查的准确率，很大程度上取决于"喂给 AI 的上下文质量"。上下文太少，AI 无法理解代码的依赖关系和架构位置；上下文太多，超出 Token 预算或引入噪声。本文聚焦如何精准采集和高效组装代码上下文。

---

## 一、上下文采集的核心挑战

### 1.1 信息量与 Token 预算的矛盾

```
┌─────────────────────────────────────────────────────────────────┐
│                    Token 预算分配（以 8K 上下文为例）             │
│                                                                  │
│   ┌──────────────────────────────────────────────┐              │
│   │  系统指令（角色 + 规则 + 输出格式）    ~1.5K  │  不可压缩   │
│   ├──────────────────────────────────────────────┤              │
│   │  项目编码规范注入                      ~1K   │  按需裁剪   │
│   ├──────────────────────────────────────────────┤              │
│   │  代码上下文（待检查代码 + 依赖文件）   ~4K   │  核心区域   │
│   ├──────────────────────────────────────────────┤              │
│   │  AI 输出空间                            ~1.5K │  不可压缩   │
│   └──────────────────────────────────────────────┘              │
│                                                                  │
│   矛盾：                                                         │
│   • 大型项目的单个文件可能有 500+ 行（~2K tokens）              │
│   • 加上依赖上下文，轻松超出预算                                 │
│   • 但不能只送一个文件——AI 看不到 import 来源就不知道是否违规    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 解决思路

```
精准采集（只拿需要的）→ 智能裁剪（控制大小）→ 分层注入（优先级排序）
```

---

## 二、代码采集策略

### 2.1 Diff 精准采集（PR 模式）

```javascript
// scripts/collector.js
const { execSync } = require('child_process')

/**
 * 采集 PR 中变更的文件
 * @param {string} baseBranch - 目标分支（如 main）
 * @param {string} headBranch - 源分支（如 feature/xxx）
 * @param {Object} options - 过滤选项
 */
function collectDiffFiles(baseBranch, headBranch, options = {}) {
  // 1. 获取变更文件列表
  const diffOutput = execSync(`git diff --name-status ${baseBranch}...${headBranch}`).toString()

  const files = parseDiffOutput(diffOutput)

  // 2. 过滤：只保留目标文件类型
  const targetFiles = files.filter((file) => {
    if (file.status === 'D') return false // 删除的文件不检查
    return matchesTargetExtensions(file.path, options.extensions)
  })

  // 3. 过滤：排除策略
  const includedFiles = targetFiles.filter((file) => {
    return !matchesExcludePatterns(file.path, options.exclude)
  })

  // 4. 读取文件内容
  return includedFiles.map((file) => ({
    path: file.path,
    content: execSync(`git show ${headBranch}:${file.path}`).toString(),
    status: file.status, // A(新增) / M(修改)
  }))
}

// 默认配置
const DEFAULT_OPTIONS = {
  extensions: ['.vue', '.ts', '.tsx', '.js', '.jsx'],
  exclude: [
    'node_modules/**',
    'dist/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/generated/**',
    '**/*.d.ts',
  ],
}
```

### 2.2 依赖上下文补全

**核心问题**：检查一个文件时，AI 看不到它 import 的来源文件，就无法判断是否违反了架构规则。

```javascript
// scripts/context-resolver.js

/**
 * 解析文件的直接依赖，提取关键上下文
 */
function resolveImportContext(filePath, fileContent, projectRoot) {
  const imports = parseImports(fileContent) // 解析 import 语句

  return imports
    .map((imp) => {
      const resolvedPath = resolveImportPath(imp.source, filePath, projectRoot)
      if (!resolvedPath) return null

      const depContent = readFile(resolvedPath)

      return {
        importStatement: imp.statement, // import { fetchUsers } from '@/api/user-api'
        resolvedPath: resolvedPath, // src/api/user-api.js
        layer: detectLayer(resolvedPath), // 'api' | 'transform' | 'composable' | 'component'
        // 只导出签名，不导出完整实现（节省 Token）
        exports: extractExports(depContent), // ['fetchUsers', 'updateUser']
      }
    })
    .filter(Boolean)
}

/**
 * 检测文件所属的架构层
 */
function detectLayer(filePath) {
  if (filePath.includes('/api/')) return 'api'
  if (filePath.includes('/transform')) return 'transform'
  if (filePath.includes('/composable')) return 'composable'
  if (filePath.includes('/component') || filePath.endsWith('.vue')) return 'component'
  return 'unknown'
}
```

### 2.3 上下文补全的 Token 节约策略

```javascript
// 不要发送依赖文件的完整内容，只发送"签名摘要"

/**
 * 提取文件的导出签名（而非完整代码）
 */
function extractExports(fileContent) {
  const exports = []

  // 匹配 export function xxx
  const funcMatches = fileContent.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)
  for (const m of funcMatches) {
    exports.push(`function ${m[1]}(...)`)
  }

  // 匹配 export const xxx = ...
  const constMatches = fileContent.matchAll(/export\s+const\s+(\w+)\s*=/g)
  for (const m of constMatches) {
    exports.push(`const ${m[1]}`)
  }

  // 匹配 export default
  if (fileContent.includes('export default')) {
    exports.push('default export')
  }

  return exports
}

// 结果示例：
// 原始文件 200 行 → 签名摘要 5 行
// Token 节约：~95%
```

---

## 三、上下文组装流程

### 3.1 组装管线

```
待检查文件
  │
  ↓ [Step 1] 读取文件内容
  │
  ↓ [Step 2] 解析 import 语句，识别依赖文件
  │
  ↓ [Step 3] 对每个依赖文件提取签名摘要
  │
  ↓ [Step 4] 检测文件所属架构层
  │
  ↓ [Step 5] 加载与文件类型匹配的检查规则
  │
  ↓ [Step 6] 加载项目编码规范（只加载相关部分）
  │
  ↓ [Step 7] Token 预算检查
  │   ├── 未超预算 → 全部组装为一个 Prompt
  │   └── 超预算   → 按优先级裁剪（见下文）
  │
  ↓ [Step 8] 组装最终 Prompt
  │   ┌─────────────────────────────────────┐
  │   │  System: 角色 + 规则 + 输出格式     │
  │   │  Context: 项目规范（相关部分）       │
  │   │  Context: 依赖签名摘要              │
  │   │  Input: 待检查代码                   │
  │   └─────────────────────────────────────┘
  │
  ↓ 输出：一个完整的 Prompt 请求
```

### 3.2 组装代码示例

```javascript
// scripts/assembler.js

function assemblePrompt(file, options) {
  const { maxTokens = 8000, projectRoot = process.cwd() } = options

  // 1. 解析依赖上下文
  const importContext = resolveImportContext(file.path, file.content, projectRoot)

  // 2. 加载相关规则
  const rules = loadRulesForFile(file.path)

  // 3. 加载相关规范
  const spec = loadRelevantSpec(file.path) // 只加载与当前文件类型相关的规范

  // 4. 计算 Token 预算
  const budget = {
    system: estimateTokens(buildSystemPrompt(rules)),
    spec: estimateTokens(spec),
    context: estimateTokens(formatImportContext(importContext)),
    code: estimateTokens(file.content),
    output: 1500, // 预留输出空间
  }

  const total = Object.values(budget).reduce((a, b) => a + b, 0)

  // 5. 超预算时裁剪
  let finalContext = formatImportContext(importContext)
  if (total > maxTokens) {
    // 优先级：系统指令 > 代码 > 规范 > 依赖上下文
    finalContext = truncateToFit(
      importContext,
      maxTokens - budget.system - budget.code - budget.spec - budget.output,
    )
  }

  // 6. 组装最终 Prompt
  return {
    system: buildSystemPrompt(rules),
    context: [spec, finalContext].filter(Boolean).join('\n\n'),
    input: `文件路径：${file.path}\n\n文件内容：\n${file.content}`,
  }
}
```

---

## 四、大文件处理策略

### 4.1 切片策略

```
┌─────────────────────────────────────────────────────────────────┐
│                    大文件切片策略                                  │
│                                                                  │
│   原始文件（800 行，~3200 tokens）                                │
│                                                                  │
│   策略 A：按函数/类切片                                           │
│   ├── Chunk 1: imports + 第 1-5 个函数                           │
│   ├── Chunk 2: imports + 第 6-10 个函数                          │
│   └── Chunk 3: imports + 第 11-15 个函数                         │
│   每个 Chunk 都带上 imports，让 AI 理解依赖关系                  │
│                                                                  │
│   策略 B：按逻辑区块切片                                          │
│   ├── Chunk 1: <template> 部分（Vue 组件）                       │
│   ├── Chunk 2: <script setup> 前半部分（状态 + 数据获取）        │
│   └── Chunk 3: <script setup> 后半部分（事件处理 + 计算属性）    │
│                                                                  │
│   策略 C：滑动窗口（兜底方案）                                    │
│   ├── Chunk 1: 行 1-200                                         │
│   ├── Chunk 2: 行 150-350（重叠 50 行，避免切断函数）            │
│   └── Chunk 3: 行 300-500                                       │
│                                                                  │
│   推荐：优先策略 A，无法按函数切分时用策略 B，兜底用策略 C        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 切片代码实现

```javascript
/**
 * 按函数边界切片大文件
 */
function sliceByFunctions(filePath, content, maxLinesPerChunk = 200) {
  const lines = content.split('\n')

  // 如果文件不大，不需要切片
  if (lines.length <= maxLinesPerChunk) {
    return [{ chunkIndex: 0, content, lineRange: [1, lines.length] }]
  }

  // 提取 import 语句（每个 Chunk 都要带上）
  const importLines = []
  const codeLines = []
  let inImportSection = true

  for (const line of lines) {
    if (
      inImportSection &&
      (line.startsWith('import ') || line.startsWith('const {') || line.trim() === '')
    ) {
      importLines.push(line)
    } else {
      inImportSection = false
      codeLines.push(line)
    }
  }

  // 按函数边界切分代码部分
  const chunks = []
  let currentChunk = []
  let braceDepth = 0

  for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i]
    currentChunk.push(line)

    // 简单的大括号深度追踪
    braceDepth += (line.match(/{/g) || []).length
    braceDepth -= (line.match(/}/g) || []).length

    // 在函数边界（braceDepth 回到 0）且达到最小行数时切分
    if (braceDepth === 0 && currentChunk.length >= maxLinesPerChunk) {
      chunks.push(currentChunk.join('\n'))
      currentChunk = []
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'))
  }

  // 每个 Chunk 加上 import 前缀
  const importPrefix = importLines.join('\n') + '\n\n'
  return chunks.map((chunk, index) => ({
    chunkIndex: index,
    totalChunks: chunks.length,
    content: importPrefix + chunk,
  }))
}
```

---

## 五、增量 vs 全量：两种采集模式

### 5.1 对比

| 维度           | 增量模式（PR）      | 全量模式（定时扫描）     |
| -------------- | ------------------- | ------------------------ |
| **触发时机**   | PR 创建/更新        | 每日/每周定时任务        |
| **采集范围**   | `git diff` 变更文件 | 项目所有目标文件         |
| **Token 消耗** | 低（只处理变更）    | 高（但有缓存优化）       |
| **延迟**       | 几分钟              | 数十分钟到数小时         |
| **发现能力**   | 只发现新引入的问题  | 能发现历史存量问题       |
| **适用场景**   | 日常开发，每次提交  | 质量基线建立、发布前检查 |

### 5.2 全量扫描的缓存优化

```javascript
/**
 * 基于文件哈希的检查缓存
 * 避免对未修改的文件重复检查
 */
class CheckCache {
  constructor(cacheFile = '.ai-inspect-cache.json') {
    this.cacheFile = cacheFile
    this.cache = this.load()
  }

  load() {
    try {
      return JSON.parse(readFile(this.cacheFile))
    } catch {
      return {}
    }
  }

  save() {
    writeFile(this.cacheFile, JSON.stringify(this.cache, null, 2))
  }

  /**
   * 检查文件是否需要重新检查
   */
  needsCheck(filePath) {
    const hash = computeHash(readFile(filePath))
    const cached = this.cache[filePath]
    return !cached || cached.hash !== hash
  }

  /**
   * 记录检查结果
   */
  record(filePath, results) {
    this.cache[filePath] = {
      hash: computeHash(readFile(filePath)),
      results,
      checkedAt: new Date().toISOString(),
    }
  }

  /**
   * 全量扫描时，跳过缓存命中的文件
   */
  async scanAll(files, checkFn) {
    const toCheck = files.filter((f) => this.needsCheck(f.path))
    const cached = files.filter((f) => !this.needsCheck(f.path))

    console.log(`全量扫描：${toCheck.length} 个文件需要检查，${cached.length} 个文件命中缓存跳过`)

    const results = await Promise.all(toCheck.map((f) => checkFn(f)))

    // 合并缓存结果
    for (const f of cached) {
      results.push({
        path: f.path,
        results: this.cache[f.path].results,
        fromCache: true,
      })
    }

    this.save()
    return results
  }
}
```

---

## 六、项目编码规范注入

### 6.1 规范文件组织

```
.ai-inspection/
├── specs/                          # 项目编码规范
│   ├── general.md                  # 通用规范（命名、注释、文件结构）
│   ├── vue-component.md            # Vue 组件规范
│   ├── api-layer.md                # API 层规范
│   ├── state-management.md         # 状态管理规范
│   └── security.md                 # 安全规范
│
└── config.json                     # 检查配置
```

### 6.2 按需加载规范

```javascript
/**
 * 根据文件路径加载相关的编码规范（只加载相关部分，不全部注入）
 */
function loadRelevantSpec(filePath) {
  const specs = []

  // 所有文件都加载通用规范
  specs.push(readSpec('general.md'))

  // 按文件类型加载特定规范
  if (filePath.endsWith('.vue')) {
    specs.push(readSpec('vue-component.md'))
  }

  // 按目录加载特定规范
  if (filePath.includes('/api/')) {
    specs.push(readSpec('api-layer.md'))
  }
  if (filePath.includes('/store/') || filePath.includes('/composable/')) {
    specs.push(readSpec('state-management.md'))
  }

  return specs.join('\n\n---\n\n')
}
```

---

## 七、总结

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   代码上下文采集与组装核心要点：                                  │
│                                                                  │
│   1. Diff 精准采集：只检查变更文件，不浪费 Token 在不变代码上    │
│   2. 依赖签名摘要：只发送 import 来源文件的导出签名，不送全文    │
│   3. Token 预算分配：系统指令 > 代码 > 规范 > 依赖上下文        │
│   4. 大文件切片：按函数边界切分，每个 Chunk 带上 import 前缀     │
│   5. 缓存优化：基于文件哈希跳过未修改文件的重复检查              │
│   6. 规范按需加载：根据文件路径只加载相关的编码规范片段          │
│                                                                  │
│   上下文质量 = 检查准确率的上限                                  │
│   再好的 Prompt，如果看不到足够的上下文，也无法做出正确判断      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
