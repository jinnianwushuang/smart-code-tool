/**
 * 知识点壁纸生成脚本
 *
 * 用法：pnpm gen:wallpaper  或  node scripts/gen-knowledge-wallpaper.mjs
 *
 * 读取 z-doc/knowledge-point/knowledge-point.json，
 * 按 FILTER_THRESHOLD 过滤薄弱知识点，渲染为桌面壁纸 PNG。
 * 一次运行同时输出 4K 和 2K 两张壁纸。
 */

import { createCanvas } from 'canvas'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ════════════════════════════════════════════════════════════
//  ⚙️  可调参数 — 按需修改此处
// ════════════════════════════════════════════════════════════

/** 预设配置：4K / 2K 两套分辨率的完整排版参数 */
const PRESETS = {
  '4k': {
    width: 3840,
    height: 2160,
    fontSizeTitle: 48, // 大标题字号
    fontSizeCategory: 32, // 分类标题字号
    fontSizeItem: 22, // 知识点名称字号
    fontSizeDesc: 18, // 描述文字字号（最小字号）
    fontSizeScore: 18, // 分数标签字号
    itemLineHeight: 56, // 知识点行高（名称 + 描述 + 间距）
    categoryGap: 32, // 分类之间的垂直间距
    columnGap: 70, // 列之间的水平间距
    padding: { top: 110, left: 90, right: 90 },
  },
  '2k': {
    width: 2560,
    height: 1440,
    fontSizeTitle: 36,
    fontSizeCategory: 24,
    fontSizeItem: 18,
    fontSizeDesc: 16, // 最小字号
    fontSizeScore: 16,
    itemLineHeight: 48,
    categoryGap: 26,
    columnGap: 48,
    padding: { top: 80, left: 65, right: 65 },
  },
}

/** 过滤阈值数组：隐藏 know_well >= 此值的知识点（6 = 隐藏已掌握项，11 = 显示全部） */
const FILTER_THRESHOLDS = [6, 11]

/** 列宽估算基准：可用宽度  此值 ≈ 目标列数 */
const COL_WIDTH_ESTIMATE = 500

/** 底部安全边距（防止内容溢出画布） */
const BOTTOM_MARGIN = 40

/** 知识点名称左侧缩进 */
const ITEM_INDENT = 4

/** 分数标签与名称之间的水平间距 */
const TAG_GAP = 10

/** 分数标签尺寸 */
const TAG_WIDTH = 36
const TAG_HEIGHT = 20
const TAG_RADIUS = 4 // 圆角半径
const TAG_TEXT_BASELINE = 15 // 标签内文字基线偏移

/** 分类标题下方装饰线长度（占列宽的比例） */
const DECOR_LINE_RATIO = 0.4

/** 分类标题底部留白（标题文字基线到装饰线的距离） */
const CAT_TITLE_GAP = 6

/** 装饰线底部留白（装饰线到第一个知识点的距离） */
const DECOR_LINE_GAP = 10

// ── 配色方案（Tokyo Night 深色风格） ──

const BG_COLOR = '#1a1b26'
const TITLE_COLOR = '#c0caf5'

/** 分类标题循环色板（8 色） */
const CATEGORY_COLORS = [
  '#7aa2f7', // 蓝
  '#9ece6a', // 绿
  '#f7768e', // 红
  '#e0af68', // 黄
  '#bb9af7', // 紫
  '#73daca', // 青
  '#ff9e64', // 橙
  '#2ac3de', // 天蓝
]

const ITEM_COLOR = '#ffffff' // 知识点名称（白色，高对比度）
const DESC_COLOR = '#565f89' // 副标题 / 水印
const ITEM_DESC_COLOR = '#ffffff' // 知识点描述（白色，高对比度）

/** 分数区间对应的标签颜色 */
const SCORE_COLORS = {
  low: '#f7768e', // 1-3   红色（薄弱）
  mid: '#e0af68', // 4-5   黄色（一般）
  high: '#9ece6a', // 6-7   绿色（熟悉）
  master: '#7aa2f7', // 8-10  蓝色（精通）
}

const DIVIDER_COLOR = '#292e42' // 头部与内容区的分隔线

// ── 字体 ──

/** 通用字体族（标题 / 分类 / 正文共用） */
const FONT_FAMILY = '"SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif'
/** 等宽字体族（分数标签专用，数字等宽更整齐） */
const MONO_FONT = '"SF Mono", "JetBrains Mono", monospace'

// ── 路径 ──

const __dirname = dirname(fileURLToPath(import.meta.url))
const JSON_PATH = resolve(__dirname, '../z-doc/knowledge-point/knowledge-point.json')
const OUTPUT_DIR = resolve(__dirname, '../z-doc/knowledge-point')

// ════════════════════════════════════════════════════════════
//  🔧  工具函数
// ════════════════════════════════════════════════════════════

/**
 * 将 JSON key 映射为可读的分类名称
 * @param {string} key - JSON 中的分类键名
 * @returns {string} 格式化后的分类名
 */
function formatCategoryName(key) {
  const map = {
    javascript: 'JavaScript',
    vue: 'Vue',
    react: 'React',
    typescript: 'TypeScript',
    nodejs: 'Node.js',
    flutter: 'Flutter',
    dart: 'Dart',
    browser_network: 'Browser & Network',
    build_engineering: 'Build & Engineering',
    architecture_design: 'Architecture & Design',
    database: 'Database',
    devops: 'DevOps',
    ai_new_tech: 'AI & New Tech',
    system_design: 'System Design',
    data_structure: 'Data Structure',
    css: 'CSS',
    cross_platform: 'Cross Platform',
    algorithms: 'Algorithms',
  }
  return map[key] || key
}

/**
 * 根据掌握度分数返回对应的标签颜色
 * @param {number} score - know_well 值（1-10）
 * @returns {string} 十六进制颜色值
 */
function getScoreColor(score) {
  if (score <= 3) return SCORE_COLORS.low
  if (score <= 5) return SCORE_COLORS.mid
  if (score <= 7) return SCORE_COLORS.high
  return SCORE_COLORS.master
}

/**
 * 文本换行：将文本按 maxWidth 拆分为多行数组
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} maxWidth - 每行最大像素宽度
 * @returns {string[]} 换行后的文本行数组
 */
function wrapText(ctx, text, maxWidth) {
  const lines = []
  let currentLine = ''
  for (const char of text) {
    const testLine = currentLine + char
    if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines.length > 0 ? lines : ['']
}

/**
 * 绘制圆角矩形路径（仅创建 path，不 fill/stroke）
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r - 圆角半径
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * 贪心多栏布局：将分类按高度降序排列，依次放入当前最短的列
 * @param {Array} cats - 分类列表
 * @param {number} numCols - 目标列数
 * @param {number} colWidth - 列宽（用于估算，当前未直接使用）
 * @param {object} p - 预设配置对象
 * @returns {Array<Array>} 每列包含的分类数组
 */
function distributeToColumns(cats, numCols, colWidth, p) {
  // 估算单个分类的渲染高度（标题行 + 所有知识点行 + 分类间距）
  // 知识点高度 = 名称行 + 描述换行数 × 描述行高
  const estimateHeight = (cat) => {
    let h = p.fontSizeCategory + CAT_TITLE_GAP + DECOR_LINE_GAP
    for (const item of cat.items) {
      h += p.itemLineHeight // 名称行
      if (item.description) {
        // 粗略估算描述行数（按字符宽度比例）
        const avgCharWidth = p.fontSizeDesc * 0.9
        const maxCharsPerLine = Math.floor((colWidth - 10) / avgCharWidth)
        const descLines = Math.ceil(item.description.length / maxCharsPerLine)
        h += (descLines - 1) * (p.fontSizeDesc + 4) // 额外行高
      }
    }
    h += p.categoryGap
    return h
  }

  // 初始化空列，每列起始高度 = padding.top（预留头部空间）
  const columns = Array.from({ length: numCols }, () => [])
  const colHeights = new Array(numCols).fill(p.padding.top)

  // 大分类优先分配，使各列最终高度更均衡
  const sorted = [...cats].sort((a, b) => estimateHeight(b) - estimateHeight(a))

  for (const cat of sorted) {
    const minIdx = colHeights.indexOf(Math.min(...colHeights))
    columns[minIdx].push(cat)
    colHeights[minIdx] += estimateHeight(cat)
  }

  // 恢复每列内分类的原始顺序（贪心排序打乱了顺序）
  for (const col of columns) {
    col.sort((a, b) => cats.indexOf(a) - cats.indexOf(b))
  }

  return columns
}

/**
 * 计算内容实际高度（模拟渲染过程，返回最高列的底部 y 坐标）
 * @param {Array<Array>} columnAssignments - 每列包含的分类数组
 * @param {number} colWidth - 列宽
 * @param {object} p - 预设配置对象
 * @returns {number} 内容实际高度
 */
function calculateContentHeight(columnAssignments, colWidth, p) {
  let maxHeight = 0

  for (const catsInCol of columnAssignments) {
    let y = p.padding.top

    for (const cat of catsInCol) {
      y += p.fontSizeCategory + CAT_TITLE_GAP + DECOR_LINE_GAP

      for (const item of cat.items) {
        let descLineCount = 0
        if (item.description) {
          // 粗略估算描述行数
          const avgCharWidth = p.fontSizeDesc * 0.9
          const maxCharsPerLine = Math.floor((colWidth - 10) / avgCharWidth)
          descLineCount = Math.ceil(item.description.length / maxCharsPerLine)
        }
        y += p.itemLineHeight + descLineCount * (p.fontSizeDesc + 4)
      }

      y += p.categoryGap
    }

    if (y > maxHeight) maxHeight = y
  }

  return maxHeight
}

// ════════════════════════════════════════════════════════════
//  📖  数据加载 & 过滤（所有预设共用）
// ════════════════════════════════════════════════════════════

const raw = JSON.parse(readFileSync(JSON_PATH, 'utf-8'))

// ════════════════════════════════════════════════════════════
//  🎨  壁纸渲染
// ════════════════════════════════════════════════════════════

/**
 * 根据预设配置和过滤阈值生成一张壁纸 PNG
 * @param {string} presetKey - 预设键名（'4k' | '2k'）
 * @param {number} threshold - 过滤阈值（隐藏 know_well >= 此值的知识点）
 */
function generateWallpaper(presetKey, threshold) {
  // ── 按阈值过滤数据 ──
  const categories = []
  for (const [key, items] of Object.entries(raw)) {
    const filtered = items.filter((item) => (item.know_well ?? 5) < threshold)
    if (filtered.length > 0) {
      categories.push({ name: formatCategoryName(key), items: filtered })
    }
  }

  if (categories.length === 0) {
    console.log(`  [${presetKey.toUpperCase()} t<${threshold}] 无薄弱知识点，跳过`)
    return
  }

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0)
  console.log(
    `  [${presetKey.toUpperCase()} t<${threshold}] ${categories.length} 个分类，${totalItems} 个知识点`,
  )
  const p = PRESETS[presetKey]
  const {
    width: W,
    height: H,
    fontSizeTitle: FST,
    fontSizeCategory: FSC,
    fontSizeItem: FSI,
    fontSizeDesc: FSD,
    fontSizeScore: FSS,
    itemLineHeight: ILH,
    categoryGap: CG,
    columnGap: COLG,
    padding: { top: PT, left: PL, right: PR },
  } = p

  // ── 布局计算 ──
  const usableWidth = W - PL - PR
  const targetColumns = Math.min(
    categories.length,
    Math.max(2, Math.floor(usableWidth / COL_WIDTH_ESTIMATE)),
  )
  const colWidth = (usableWidth - COLG * (targetColumns - 1)) / targetColumns
  const columnAssignments = distributeToColumns(categories, targetColumns, colWidth, p)

  // ── 计算内容实际高度（动态调整画布高度） ──
  const contentHeight = calculateContentHeight(columnAssignments, colWidth, p)
  const finalHeight = Math.max(H, contentHeight + BOTTOM_MARGIN)

  // ── 创建画布 & 填充背景 ──
  const canvas = createCanvas(W, finalHeight)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, W, finalHeight)

  // ─ 头部：标题 + 副标题 + 分隔线 ──
  // y 坐标基于 PT 按比例计算，切换预设时自动适配间距
  const titleY = Math.round(PT * 0.35)
  const subtitleY = Math.round(PT * 0.65)
  const dividerY = PT - 8

  ctx.fillStyle = TITLE_COLOR
  ctx.font = `bold ${FST}px ${FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.fillText('Knowledge Map', W / 2, titleY)

  ctx.font = `${FSD + 2}px ${FONT_FAMILY}`
  ctx.fillStyle = DESC_COLOR
  ctx.fillText(
    `${totalItems} weak points · threshold < ${threshold} · ${new Date().toLocaleDateString('zh-CN')}`,
    W / 2,
    subtitleY,
  )

  ctx.strokeStyle = DIVIDER_COLOR
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PL, dividerY)
  ctx.lineTo(W - PR, dividerY)
  ctx.stroke()

  // ── 内容区：逐列绘制分类和知识点 ─
  for (let col = 0; col < columnAssignments.length; col++) {
    const x = PL + col * (colWidth + COLG)
    let y = PT
    const catsInCol = columnAssignments[col]

    for (const cat of catsInCol) {
      const colorIdx = categories.indexOf(cat) % CATEGORY_COLORS.length
      const catColor = CATEGORY_COLORS[colorIdx]

      // 分类标题
      ctx.fillStyle = catColor
      ctx.font = `bold ${FSC}px ${FONT_FAMILY}`
      ctx.textAlign = 'left'
      ctx.fillText(cat.name, x, y + FSC)
      y += FSC + CAT_TITLE_GAP

      // 分类装饰短线（25% 透明度）
      ctx.strokeStyle = catColor + '40'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + colWidth * DECOR_LINE_RATIO, y)
      ctx.stroke()
      y += DECOR_LINE_GAP

      // 知识点列表
      for (const item of cat.items) {
        const score = item.know_well ?? 5
        const scoreColor = getScoreColor(score)

        // 知识点名称
        ctx.fillStyle = ITEM_COLOR
        ctx.font = `600 ${FSI}px ${FONT_FAMILY}`
        ctx.fillText(item.name, x + ITEM_INDENT, y + FSI)

        // 分数标签（半透明背景 + 居中数字）
        const nameWidth = ctx.measureText(item.name).width
        const tagX = x + ITEM_INDENT + nameWidth + TAG_GAP
        const tagY = y + 2
        ctx.fillStyle = scoreColor + '30' // 约 12% 透明度
        roundRect(ctx, tagX, tagY, TAG_WIDTH, TAG_HEIGHT, TAG_RADIUS)
        ctx.fill()
        ctx.fillStyle = scoreColor
        ctx.font = `bold ${FSS}px ${MONO_FONT}`
        ctx.textAlign = 'center'
        ctx.fillText(String(score), tagX + TAG_WIDTH / 2, tagY + TAG_TEXT_BASELINE)
        ctx.textAlign = 'left'

        // 描述文字（自动换行，不截断）
        let descLineCount = 0
        if (item.description) {
          ctx.fillStyle = ITEM_DESC_COLOR
          ctx.font = `${FSD}px ${FONT_FAMILY}`
          const descLines = wrapText(ctx, item.description, colWidth - 10)
          for (let di = 0; di < descLines.length; di++) {
            ctx.fillText(descLines[di], x + ITEM_INDENT, y + FSI + FSD + 6 + di * (FSD + 4))
          }
          descLineCount = descLines.length
        }

        // 行高 = 名称行 + 描述额外行
        y += ILH + descLineCount * (FSD + 4)
        if (y > finalHeight - BOTTOM_MARGIN) break
      }

      y += CG // 分类间距
      if (y > finalHeight - BOTTOM_MARGIN) break
    }
  }

  // ── 底部水印 ──
  ctx.fillStyle = DESC_COLOR + '60' // 约 38% 透明度
  ctx.font = `${FSD}px ${FONT_FAMILY}`
  ctx.textAlign = 'right'
  ctx.fillText('smart-code-tool / knowledge-point.json', W - PR, finalHeight - 30)

  // ── 输出 PNG ──
  const outputPath = resolve(OUTPUT_DIR, `knowledge-wallpaper-${presetKey}-${threshold}.png`)
  const buffer = canvas.toBuffer('image/png')
  writeFileSync(outputPath, buffer)
  console.log(`    ✅ ${outputPath}  (${W} × ${finalHeight})`)
}

// 双层循环：预设 × 阈值
for (const key of Object.keys(PRESETS)) {
  for (const t of FILTER_THRESHOLDS) {
    generateWallpaper(key, t)
  }
}
console.log('\n🎉 全部完成')
