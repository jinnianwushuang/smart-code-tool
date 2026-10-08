/**
 * 从 sidebar 配置文件生成全站文档清单 doc-list.json
 *
 * 功能：
 * - 遍历所有 sidebar 配置，提取叶子节点（带 link 的菜单项）
 * - 输出 JSON 文件，供抗遗忘复习系统使用
 * - 自动跳过无 id 的节点并警告
 *
 * 用法：node scripts/gen-doc-list.mjs
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUTPUT_PATH = resolve(ROOT, 'docs/public/doc-list.json')

// ── 导入所有 sidebar 配置 ──
const { psychologySidebar } = await import('../docs/.vitepress/config/sidebar/psychology.js')
const { aiSidebar } = await import('../docs/.vitepress/config/sidebar/ai.js')
const { architectureSidebar } = await import('../docs/.vitepress/config/sidebar/architecture.js')
const { handbookSidebar } = await import('../docs/.vitepress/config/sidebar/handbook.js')
const { homeSidebar } = await import('../docs/.vitepress/config/sidebar/home.js')
const { interviewSidebar } = await import('../docs/.vitepress/config/sidebar/interview.js')
const { instructionsSidebar } = await import('../docs/.vitepress/config/sidebar/instructions.js')

const ALL_SIDEBARS = [
  { name: '心理认知', sidebar: psychologySidebar },
  { name: 'AI', sidebar: aiSidebar },
  { name: '架构文档', sidebar: architectureSidebar },
  { name: '开发手册', sidebar: handbookSidebar },
  { name: '首页', sidebar: homeSidebar },
  { name: '面试', sidebar: interviewSidebar },
  { name: '指令集', sidebar: instructionsSidebar },
]

// ── URL 路径段 → 可读标签映射 ──
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
  // 手册
  frontend: '前端',
  backend: '后端',
  database: '数据库',
  devops: 'DevOps',
  mobile: '移动端',
  tools: '工具',
  ai: 'AI',
  'tech-glossary-index': '术语',
  // 架构文档
  'design-patterns': '设计模式',
  'data-structure': '数据结构',
  'general-knowledge': '基础',
  nodejs: 'Node.js',
  python: 'Python',
  electron: 'Electron',
  flutter: 'Flutter',
  'typical-analysis': '案例',
  'architectural-vision': '架构',
  'code-analysis': '代码分析',
  database: '数据库',
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
  react: 'React',
  vue: 'Vue',
  flutter: 'Flutter',
}

/**
 * 从 markdown 文件提取 tags：
 * 1. 优先读 frontmatter 中的 tags 字段
 * 2. 无 frontmatter tags → 从 URL 路径推导
 */
function extractTags(url) {
  const mdPath = join(ROOT, 'docs', url + '.md')
  if (existsSync(mdPath)) {
    const content = readFileSync(mdPath, 'utf-8')
    // 尝试匹配 frontmatter tags
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (fmMatch) {
      const tagsMatch = fmMatch[1].match(/^tags:\s*\[([^\]]*)\]/m)
      if (tagsMatch) {
        // 解析 frontmatter tags 数组
        return tagsMatch[1]
          .split(',')
          .map((t) => t.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean)
      }
    }
  }
  // 无 frontmatter tags → 从 URL 路径推导
  return deriveTagsFromUrl(url)
}

/**
 * 从 URL 路径段推导标签
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
    const topMap = {
      interview: '面试',
      handbook: '手册',
      'architecture-document': '架构',
      psychology: '心理学',
      ai: 'AI',
      instructions: '指令集',
    }
    if (topMap[topSeg]) tags.push(topMap[topSeg])
  }
  return tags
}

// ── Git 时间戳提取 ──

/**
 * 从 git 历史提取每个文件的创建时间和最后更新时间
 * 单次 git log 遍历全量历史，性能最优
 * @returns { Map<string, { createdAt: string, updatedAt: string }> }
 */
function extractGitTimestamps() {
  const map = new Map()
  try {
    const output = execSync(
      'git log --reverse --diff-filter=ACDMR --name-status --format="COMMIT %aI" -- docs/',
      { cwd: ROOT, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 },
    )

    let currentCommitTime = null
    for (const line of output.split('\n')) {
      if (line.startsWith('COMMIT ')) {
        currentCommitTime = line.slice(7).trim()
      } else if (line.startsWith('M\tdocs/') || line.startsWith('A\tdocs/')) {
        const filePath = line.slice(2).trim()
        if (filePath.endsWith('.md') && currentCommitTime) {
          const url = '/' + filePath.slice(5).replace(/\.md$/, '') // docs/xxx.md → /xxx
          if (!map.has(url)) {
            map.set(url, { createdAt: currentCommitTime, updatedAt: currentCommitTime })
          } else {
            map.get(url).updatedAt = currentCommitTime
          }
        }
      }
    }
  } catch (e) {
    console.warn('⚠️  Git 时间戳提取失败（可能是首次提交或无 git 仓库）:', e.message)
  }
  return map
}

/**
 * 格式化 ISO 时间字符串为 YYYY-MM-DD HH:mm:ss
 */
function formatDate(isoStr) {
  if (!isoStr) return null
  try {
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return null
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  } catch {
    return null
  }
}

// ── 递归遍历，收集叶子节点 ──
const docs = []
const warnings = []

function traverse(items, groupPath = []) {
  if (!Array.isArray(items)) return

  for (const item of items) {
    if (!item) continue

    const hasLink = !!item.link
    const hasItems = !!item.items

    if (hasLink && !hasItems) {
      // 叶子节点
      if (!item.id) {
        warnings.push(`⚠️  缺少 id: ${item.text} (${item.link})`)
        continue
      }
      const ts = gitTimestamps.get(item.link)
      docs.push({
        id: item.id,
        title: item.text,
        url: item.link,
        group: groupPath.length > 0 ? groupPath.join(' > ') : '未分组',
        tags: extractTags(item.link),
        createdAt: formatDate(ts?.createdAt),
        updatedAt: formatDate(ts?.updatedAt),
      })
    } else if (hasItems) {
      // 分组节点：递归进入子级
      const newGroupPath = item.text ? [...groupPath, item.text] : groupPath
      traverse(item.items, newGroupPath)
    }
  }
}

// ── 提取 Git 时间戳（单次 git log 全量扫描） ──
console.log('⏳ 正在从 git 历史提取时间戳...')
const gitTimestamps = extractGitTimestamps()
console.log(`✅ 提取到 ${gitTimestamps.size} 个文件的时间戳`)

// ── 执行遍历 ──
for (const { sidebar } of ALL_SIDEBARS) {
  if (sidebar?.items) {
    traverse(sidebar.items)
  }
}

// ── 输出结果 ──
const json = JSON.stringify(docs, null, 2)
writeFileSync(OUTPUT_PATH, json, 'utf-8')

console.log(`📋 共收集 ${docs.length} 篇文档`)
console.log(`📁 输出到: docs/public/doc-list.json`)

if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} 个警告：`)
  warnings.forEach((w) => console.log(`  ${w}`))
}

// ── 按 group 统计 ──
const groupCounts = {}
for (const doc of docs) {
  const topGroup = doc.group.split(' > ')[0]
  groupCounts[topGroup] = (groupCounts[topGroup] || 0) + 1
}
console.log('\n📊 各分组文档数：')
for (const [group, count] of Object.entries(groupCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${group}: ${count}`)
}
