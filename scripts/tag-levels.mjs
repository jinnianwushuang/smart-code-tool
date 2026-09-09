/**
 * 批量为 sidebar 条目和 markdown 文档标注工程师层级
 * 读取 _meta.json 获取每篇文档的 level，然后：
 * 1. 更新 sidebar/interview.js 中每个条目的 text
 * 2. 更新每个 markdown 文件的 frontmatter title
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const ROOT = join(process.cwd(), 'docs/interview')
const META_PATH = join(ROOT, '_meta.json')
const SIDEBAR_PATH = join(process.cwd(), 'docs/.vitepress/config/sidebar/interview.js')

// 层级 → P 标签映射
const LEVEL_MAP = {
  junior: 'P4-P5',
  intermediate: 'P5-P6',
  senior: 'P6-P7',
  architect: 'P8',
  manager: 'TL',
}

// ── Step 1: 从 _meta.json 构建 link → level 映射 ──
const meta = JSON.parse(readFileSync(META_PATH, 'utf-8'))
const linkToLevel = {} // e.g. "/interview/javascript/v8-engine" → "senior"
const slugToLevel = {} // e.g. "v8-engine" → "senior"

for (const [moduleName, moduleData] of Object.entries(meta.modules)) {
  if (!moduleData.docs) continue
  for (const [slug, docMeta] of Object.entries(moduleData.docs)) {
    const level = docMeta.level
    const link = `/interview/${moduleName}/${slug}`
    linkToLevel[link] = level
    slugToLevel[slug] = level
  }
}

console.log(`📋 从 _meta.json 读取到 ${Object.keys(linkToLevel).length} 篇文档的层级映射\n`)

// ── Step 2: 更新 sidebar/interview.js ──
let sidebarContent = readFileSync(SIDEBAR_PATH, 'utf-8')
let sidebarUpdates = 0

// 匹配所有 { text: '...', link: '/interview/...' } 模式（单行和多行）
// 先处理多行格式
sidebarContent = sidebarContent.replace(
  /text:\s*'([^']+)',\s*\n(\s*)link:\s*'([^']+)'/g,
  (match, text, indent, link) => {
    const level = linkToLevel[link]
    if (!level || !LEVEL_MAP[level]) return match
    const tag = LEVEL_MAP[level]
    if (/\[P\d|TL\]/.test(text)) return match
    sidebarUpdates++
    return `text: '${text} [${tag}]',\n${indent}link: '${link}'`
  },
)

// 再处理单行格式
sidebarContent = sidebarContent.replace(
  /text:\s*'([^']+)',\s*link:\s*'([^']+)'/g,
  (match, text, link) => {
    const level = linkToLevel[link]
    if (!level || !LEVEL_MAP[level]) return match
    const tag = LEVEL_MAP[level]
    if (/\[P\d|TL\]/.test(text)) return match
    sidebarUpdates++
    return `text: '${text} [${tag}]', link: '${link}'`
  },
)

writeFileSync(SIDEBAR_PATH, sidebarContent, 'utf-8')
console.log(`✅ sidebar/interview.js: 更新了 ${sidebarUpdates} 个条目\n`)

// ── Step 3: 更新 markdown 文件的 frontmatter title ──
let mdUpdates = 0
let mdSkipped = 0

function processDir(dirPath) {
  const entries = readdirSync(dirPath)
  for (const entry of entries) {
    const fullPath = join(dirPath, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      processDir(fullPath)
    } else if (entry.endsWith('.md') && entry !== 'index.md') {
      processFile(fullPath, entry)
    }
  }
}

function processFile(filePath, filename) {
  let content = readFileSync(filePath, 'utf-8')
  const slug = filename.replace('.md', '')
  const level = slugToLevel[slug]

  if (!level || !LEVEL_MAP[level]) {
    mdSkipped++
    return
  }

  const tag = LEVEL_MAP[level]
  let updated = false

  // 1. 更新 frontmatter 中的 title（支持单引号和双引号）
  const titleMatch = content.match(/^title:\s*['"](.+)['"]$/m)
  if (titleMatch) {
    const oldTitle = titleMatch[1]
    if (!/\[P\d|TL\]/.test(oldTitle)) {
      const newTitle = `${oldTitle} [${tag}]`
      content = content.replace(/^title:\s*['"].+['"]$/m, `title: '${newTitle}'`)
      updated = true
    }
  }

  // 2. 更新文档内一级标题 # xxx
  const h1Match = content.match(/^# (.+)$/m)
  if (h1Match) {
    const oldH1 = h1Match[1]
    if (!/\[P\d|TL\]/.test(oldH1)) {
      const newH1 = `${oldH1} [${tag}]`
      content = content.replace(/^# .+$/m, `# ${newH1}`)
      updated = true
    }
  }

  if (updated) {
    writeFileSync(filePath, content, 'utf-8')
    mdUpdates++
  } else {
    mdSkipped++
  }
}

processDir(ROOT)
console.log(`✅ markdown frontmatter: 更新了 ${mdUpdates} 篇文档，跳过 ${mdSkipped} 篇`)
console.log(`\n🎉 完成！共更新 ${sidebarUpdates + mdUpdates} 处`)
