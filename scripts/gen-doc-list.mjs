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

import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

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
      docs.push({
        id: item.id,
        title: item.text,
        url: item.link,
        group: groupPath.length > 0 ? groupPath.join(' > ') : '未分组',
      })
    } else if (hasItems) {
      // 分组节点：递归进入子级
      const newGroupPath = item.text ? [...groupPath, item.text] : groupPath
      traverse(item.items, newGroupPath)
    }
  }
}

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
