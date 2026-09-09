/**
 * 批量更新 levels/ 和 index.md 中的文档链接文字，加上层级标注
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const ROOT = join(process.cwd(), 'docs/interview')
const META_PATH = join(ROOT, '_meta.json')

const LEVEL_MAP = {
  junior: 'P4-P5',
  intermediate: 'P5-P6',
  senior: 'P6-P7',
  architect: 'P8',
  manager: 'TL',
}

// 从 _meta.json 构建 link → level 映射
const meta = JSON.parse(readFileSync(META_PATH, 'utf-8'))
const linkToLevel = {}

for (const [moduleName, moduleData] of Object.entries(meta.modules)) {
  if (!moduleData.docs) continue
  for (const [slug, docMeta] of Object.entries(moduleData.docs)) {
    const level = docMeta.level
    const link = `/interview/${moduleName}/${slug}`
    linkToLevel[link] = level
  }
}

console.log(`📋 从 _meta.json 读取到 ${Object.keys(linkToLevel).length} 篇文档的层级映射\n`)

// 要处理的文件列表
const filesToUpdate = [
  join(ROOT, 'index.md'),
  ...readdirSync(join(ROOT, 'levels'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => join(ROOT, 'levels', f)),
]

let totalUpdates = 0

for (const filePath of filesToUpdate) {
  let content = readFileSync(filePath, 'utf-8')
  let fileUpdates = 0

  // 匹配 [text](/interview/...) 模式，给 text 追加层级标签
  content = content.replace(/\[([^\]]+)\]\((\/interview\/[^\)]+)\)/g, (match, text, link) => {
    // 跳过 levels/ 导航链接（已有层级在文字中）
    if (link.includes('/levels/')) return match
    // 跳过已有标签的
    if (/\[P\d|TL\]/.test(text)) return match

    const level = linkToLevel[link]
    if (!level || !LEVEL_MAP[level]) return match

    const tag = LEVEL_MAP[level]
    fileUpdates++
    return `[${text} [${tag}]](${link})`
  })

  writeFileSync(filePath, content, 'utf-8')
  const fileName = filePath.replace(ROOT + '/', '')
  console.log(`✅ ${fileName}: 更新了 ${fileUpdates} 个链接`)
  totalUpdates += fileUpdates
}

console.log(`\n🎉 完成！共更新 ${totalUpdates} 个链接`)
