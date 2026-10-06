/**
 * 批量为文档添加 frontmatter tags
 *
 * 功能：
 * 1. 无 frontmatter 的文档 → 添加完整 frontmatter（title + tags）
 * 2. 有 frontmatter 但无 tags 的文档 → 在现有 frontmatter 中插入 tags 行
 * 3. 已有 tags 的文档 → 跳过
 *
 * tags 来源：从 URL 路径推导（复用 gen-doc-list.mjs 的 TAG_MAP 逻辑）
 *
 * 用法：node scripts/add-frontmatter-tags.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DOC_LIST_PATH = resolve(ROOT, 'docs/public/doc-list.json')

// ── URL 路径段 → 可读标签映射（与 gen-doc-list.mjs 保持一致）──
const TAG_MAP = {
  // 面试
  react: 'React',
  vue: 'Vue',
  flutter: 'Flutter',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  intermediate: '中级',
  junior: '初级',
  senior: '高级',
  engineering: '工程化',
  'build-tools': '构建工具',
  'browser-and-network': '浏览器',
  'system-design': '系统设计',
  'api-architecture': 'API',
  architecture: '架构',
  'flutter-intermediate': 'Flutter',
  'cross-platform': '跨端',
  'ai-and-new-tech': 'AI',
  management: '管理',
  levels: '成长路径',
  'framework-comparison': '框架对比',
  // 手册
  frontend: '前端',
  backend: '后端',
  database: '数据库',
  devops: 'DevOps',
  mobile: '移动端',
  tools: '工具',
  ai: 'AI',
  electron: 'Electron',
  'tech-glossary-index': '术语',
  // 架构文档
  'design-patterns': '设计模式',
  'data-structure': '数据结构',
  'general-knowledge': '基础',
  nodejs: 'Node.js',
  python: 'Python',
  'typical-analysis': '案例',
  'architectural-vision': '架构',
  'code-analysis': '代码分析',
  'ai-code-inspection': '代码审查',
  // 心理
  psychology: '心理学',
  'cognition-learning': '认知',
  'mental-health': '心理健康',
  philosophy: '哲学',
  'world-laws': '规律',
  'comprehensive-guide': '综合',
  // AI
  ollama: 'Ollama',
  'base-knowledge': '基础',
  thinking: '思维',
  sentence_assembly: '句子组合',
  // 指令集
  instructions: '指令集',
  'instruction-architecture': '指令架构',
  'multi-workspace-composition': '多工作区',
}

// 顶级分类兜底映射
const TOP_MAP = {
  interview: '面试',
  handbook: '手册',
  'architecture-document': '架构',
  psychology: '心理学',
  ai: 'AI',
  instructions: '指令集',
}

/**
 * 从 URL 路径推导标签
 */
function deriveTagsFromUrl(url) {
  const segments = url.split('/').filter(Boolean)
  const tags = []
  for (const seg of segments) {
    if (TAG_MAP[seg]) {
      const tag = TAG_MAP[seg]
      if (!tags.includes(tag)) tags.push(tag)
    }
  }
  // 兜底：至少给一个顶级分类标签
  if (tags.length === 0 && segments.length > 0) {
    const topSeg = segments[0]
    if (TOP_MAP[topSeg]) tags.push(TOP_MAP[topSeg])
  }
  return tags
}

/**
 * 从 markdown 内容提取第一个 H1 标题
 */
function extractH1(content) {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

// ── 主流程 ──
const docs = JSON.parse(readFileSync(DOC_LIST_PATH, 'utf-8'))
let addedCount = 0
let updatedCount = 0
let skippedCount = 0
const errors = []

for (const doc of docs) {
  const filePath = join(ROOT, 'docs', doc.url + '.md')
  if (!existsSync(filePath)) {
    errors.push(`文件不存在: ${doc.url}`)
    continue
  }

  const content = readFileSync(filePath, 'utf-8')
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)

  if (!fmMatch) {
    // ── 无 frontmatter：添加完整 frontmatter ──
    const tags = deriveTagsFromUrl(doc.url)
    const title = doc.title || extractH1(content) || doc.url.split('/').pop()
    const fmBlock = `---\ntitle: '${title.replace(/'/g, "''")}'\ntags: [${tags.map((t) => `'${t}'`).join(', ')}]\n---\n`
    const newContent = fmBlock + content
    writeFileSync(filePath, newContent, 'utf-8')
    addedCount++
    console.log(`✅ 新增 frontmatter: ${doc.url} → tags: [${tags.join(', ')}]`)
  } else {
    // ── 有 frontmatter：检查是否有 tags ──
    const fmContent = fmMatch[1]
    const tagsMatch = fmContent.match(/^tags:\s*\[([^\]]*)\]/m)

    if (tagsMatch) {
      // 已有 tags，跳过
      skippedCount++
      continue
    }

    // 无 tags：在 frontmatter 中插入 tags 行
    const tags = deriveTagsFromUrl(doc.url)
    const tagsLine = `tags: [${tags.map((t) => `'${t}'`).join(', ')}]\n`

    // 在 frontmatter 结束前的 --- 之前插入
    const beforeFmEnd = content.indexOf('\n---', 4) // 跳过开头的 ---\n
    if (beforeFmEnd === -1) {
      errors.push(`无法定位 frontmatter 结尾: ${doc.url}`)
      continue
    }

    const newContent = content.slice(0, beforeFmEnd) + '\n' + tagsLine + content.slice(beforeFmEnd)
    writeFileSync(filePath, newContent, 'utf-8')
    updatedCount++
    console.log(`🔧 补充 tags: ${doc.url} → tags: [${tags.join(', ')}]`)
  }
}

console.log(`\n📊 统计：`)
console.log(`  新增 frontmatter: ${addedCount}`)
console.log(`  补充 tags: ${updatedCount}`)
console.log(`  已有 tags（跳过）: ${skippedCount}`)
if (errors.length > 0) {
  console.log(`  ❌ ${errors.length} 个错误：`)
  errors.forEach((e) => console.log(`    ${e}`))
}
console.log(`\n💡 运行 node scripts/gen-doc-list.mjs 重新生成 doc-list.json`)
