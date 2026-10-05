/**
 * 为 sidebar 配置文件中的叶子节点（带 link 的菜单项）自动注入 id 字段
 *
 * 特性：
 * - 幂等：已有 id 的节点自动跳过
 * - 仅处理带 link 的叶子节点，分组节点（只有 text + items）不处理
 * - 使用 24 字符 nanoid 生成稳定 ID
 *
 * 用法：node scripts/inject-sidebar-ids.mjs
 */

import { nanoid } from 'nanoid'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SIDEBAR_DIR = resolve(__dirname, '../docs/.vitepress/config/sidebar')
const ID_LENGTH = 24

/** 导出：sidebar 文件头部约束注释（供其他脚本复用） */
export const SIDEBAR_HEADER_COMMENT = `/**
 * ⚠️ AI / 开发者须知：
 * 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 * 新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 * id 一旦生成永不修改，即使 text / link 变更也保持原值。
 * VitePress 会忽略 id 字段，不影响解析。
 */
`

/** 为单个 sidebar 文件注入 id，返回注入数量 */
function injectIds(filePath) {
  let content = readFileSync(filePath, 'utf-8')
  let injectedCount = 0

  const linkRegex = /link:\s*['"][^'"]+['"]/g
  let match
  const injections = []

  while ((match = linkRegex.exec(content)) !== null) {
    // ── 向后扫描，找到包含此 link: 的对象的闭合 } ──
    let depth = 0
    let closingBracePos = -1
    for (let i = match.index; i < content.length; i++) {
      if (content[i] === '{') depth++
      else if (content[i] === '}') {
        depth--
        if (depth < 0) {
          closingBracePos = i
          break
        }
      }
    }
    if (closingBracePos === -1) continue

    // ── 向前扫描，找到包含此 link: 的对象的起始 { ──
    let openingBracePos = -1
    depth = 0
    for (let i = match.index; i >= 0; i--) {
      if (content[i] === '}') depth++
      else if (content[i] === '{') {
        depth--
        if (depth < 0) {
          openingBracePos = i
          break
        }
      }
    }
    if (openingBracePos === -1) continue

    // ── 跳过分组节点（含 items: 的对象） ──
    const objectContent = content.slice(openingBracePos, closingBracePos + 1)
    if (/\bitems\s*:/.test(objectContent)) continue

    // ── 幂等：已有 id: 则跳过 ──
    if (/\bid\s*:\s*['"]/.test(objectContent)) continue

    // ── 判断单行还是多行对象（基于 { 和 } 是否在同一行） ──
    const objectInner = content.slice(openingBracePos, closingBracePos + 1)
    const isSingleLine = !objectInner.includes('\n')

    // ── 获取 link: 所在行的缩进（仅多行时使用） ──
    const lineStart = content.lastIndexOf('\n', match.index) + 1
    const lineIndent = content.slice(lineStart, match.index).match(/^(\s*)/)[1]

    injections.push({ openingBracePos, closingBracePos, isSingleLine, lineIndent })
  }

  // 从后往前注入，避免位置偏移
  for (let i = injections.length - 1; i >= 0; i--) {
    const { openingBracePos, closingBracePos, isSingleLine, lineIndent } = injections[i]
    const id = nanoid(ID_LENGTH)

    if (isSingleLine) {
      // 单行对象：在 { 后插入 ' id: xxx,'
      content =
        content.slice(0, openingBracePos + 1) + ` id: '${id}',` + content.slice(openingBracePos + 1)
    } else {
      // 多行对象：找到 } 前的最后一个换行符，在该行前插入 id 行
      const lastNlBeforeBrace = content.lastIndexOf('\n', closingBracePos - 1)
      const braceIndent = content.slice(lastNlBeforeBrace + 1, closingBracePos)
      content =
        content.slice(0, lastNlBeforeBrace) +
        `\n${braceIndent}  id: '${id}',` +
        content.slice(lastNlBeforeBrace)
    }
    injectedCount++
  }

  if (injectedCount > 0) {
    writeFileSync(filePath, content, 'utf-8')
  }

  return injectedCount
}

// ── 主流程 ──
const files = readdirSync(SIDEBAR_DIR).filter((f) => f.endsWith('.js') && f !== 'index.js')

let totalInjected = 0
for (const file of files) {
  const filePath = resolve(SIDEBAR_DIR, file)
  const count = injectIds(filePath)
  if (count > 0) {
    console.log(`✅ ${file}: 注入 ${count} 个 id`)
  } else {
    console.log(`⏭️  ${file}: 无需注入（全部已有 id）`)
  }
  totalInjected += count
}

console.log(`\n🎉 完成！共注入 ${totalInjected} 个 id`)
