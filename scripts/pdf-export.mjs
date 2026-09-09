/**
 * VitePress 文档 → PDF 电子书导出脚本
 *
 * 流程：读取 sidebar 配置 → 启动 VitePress dev server → Puppeteer 逐页渲染 → pdf-lib 合并 + 书签
 *
 * 用法：node scripts/pdf-export.mjs [--group handbook]
 */

import { spawn } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync, mkdirSync, rmSync, readdirSync } from 'node:fs'
import puppeteer from 'puppeteer'
import { PDFDocument, PDFHexString, PDFName } from 'pdf-lib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ─── 配置 ───────────────────────────────────────────────────────────────────────
const VITEPRESS_PORT = 23340
const BASE_PATH = '/smart-code-tool' // 与 docs/.vitepress/config.js 中 base 保持一致
const BASE_URL = `http://localhost:${VITEPRESS_PORT}${BASE_PATH}`
const OUTPUT_DIR = resolve(ROOT, 'pdf-output')
const TEMP_DIR = resolve(OUTPUT_DIR, '.temp')

// 从命令行参数解析要导出的分组（默认 handbook，传 all 则导出全部）
const args = process.argv.slice(2)
const groupIndex = args.indexOf('--group')
const GROUP = groupIndex !== -1 && args[groupIndex + 1] ? args[groupIndex + 1] : 'handbook'

// 从 sidebar 目录读取所有可导出的分组（排除 index.js 和 home.js）
function getAllGroups() {
  const sidebarDir = resolve(ROOT, 'docs/.vitepress/config/sidebar')
  return readdirSync(sidebarDir)
    .filter((f) => f.endsWith('.js') && f !== 'index.js' && f !== 'home.js')
    .map((f) => f.replace(/\.js$/, ''))
}

// 生成文件名时间戳，格式：2026-07-29_05-30-00
function getTimestamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
}

// ─── 1. 读取 sidebar 配置，提取有序页面列表 ─────────────────────────────────────
async function loadSidebarPages(group) {
  const sidebarPath = resolve(ROOT, `docs/.vitepress/config/sidebar/${group}.js`)
  if (!existsSync(sidebarPath)) {
    console.error(`❌ 找不到 sidebar 配置文件: ${sidebarPath}`)
    process.exit(1)
  }

  const mod = await import(sidebarPath)
  // 导出名约定：xxxSidebar
  const sidebarKey = Object.keys(mod).find((k) => k.endsWith('Sidebar'))
  if (!sidebarKey) {
    console.error(`❌ 在 ${sidebarPath} 中未找到 *Sidebar 导出`)
    process.exit(1)
  }

  const sidebar = mod[sidebarKey]
  const groups = []

  // 递归提取 { text, link } 结构，同时记录完整菜单路径与层级序号
  function extract(items, ancestors = [], counters = []) {
    items.forEach((item, index) => {
      const numberPath = [...counters, index + 1]

      if (item.link) {
        const textPath = [...ancestors, item.text]
        // 书签标题：层级序号前缀（如 1-2-1）+ 完整菜单结构前缀
        const label = `${numberPath.join('-')} ${textPath.join(' - ')}`
        groups.push({
          group: ancestors[ancestors.length - 1] || '',
          title: item.text,
          link: item.link,
          label,
        })
      }

      if (item.items) {
        extract(item.items, [...ancestors, item.text], numberPath)
      }
    })
  }

  const topItems = sidebar.items || sidebar
  extract(Array.isArray(topItems) ? topItems : [topItems])

  return groups
}

// ─── 2. 启动 VitePress dev server ──────────────────────────────────────────────
function startDevServer() {
  return new Promise((resolvePromise, reject) => {
    console.log('🚀 启动 VitePress dev server ...')
    const child = spawn('npx', ['vitepress', 'dev', 'docs', '--port', String(VITEPRESS_PORT)], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    })

    let started = false
    const timeout = setTimeout(() => {
      if (!started) {
        reject(new Error('VitePress dev server 启动超时（60s）'))
        child.kill()
      }
    }, 60000)

    child.stdout.on('data', (data) => {
      const text = data.toString()
      if (text.includes('localhost') || text.includes('ready') || text.includes('Local:')) {
        if (!started) {
          started = true
          clearTimeout(timeout)
          // 额外等待 2s 确保服务完全就绪
          setTimeout(() => resolvePromise(child), 2000)
        }
      }
    })

    child.stderr.on('data', (data) => {
      const text = data.toString()
      // VitePress 部分信息输出到 stderr
      if (text.includes('localhost') || text.includes('Local:')) {
        if (!started) {
          started = true
          clearTimeout(timeout)
          setTimeout(() => resolvePromise(child), 2000)
        }
      }
    })

    child.on('error', reject)
  })
}

// ─── 3. Puppeteer 逐页渲染 PDF ─────────────────────────────────────────────────
async function renderPages(pages, browser) {
  console.log(`📄 共 ${pages.length} 个页面待渲染`)

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })

  // 确保临时目录存在
  if (existsSync(TEMP_DIR)) rmSync(TEMP_DIR, { recursive: true })
  mkdirSync(TEMP_DIR, { recursive: true })

  const pdfBuffers = []

  for (let i = 0; i < pages.length; i++) {
    const { title, link, group, label } = pages[i]
    const url = `${BASE_URL}${link}`
    console.log(`  [${i + 1}/${pages.length}] ${group} › ${title}`)

    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

      // 等待文档主体内容渲染完成
      await page.waitForSelector('.vp-doc', { timeout: 15000 }).catch(() => {})

      // 移除侧边栏、导航等干扰元素，只保留正文
      await page.evaluate(() => {
        const selectors = [
          '.VPSidebar',
          '.VPNavBar',
          '.VPNav',
          '.VPDocAside',
          '.VPFooter',
          '.edit-link',
          '.prev-next',
        ]
        selectors.forEach((sel) => {
          document.querySelectorAll(sel).forEach((el) => el.remove())
        })
        // 让内容区域占满宽度
        const content = document.querySelector('.VPDoc .container')
        if (content) {
          content.style.maxWidth = '100%'
          content.style.padding = '20px 40px'
        }
        const vpDoc = document.querySelector('.VPDoc')
        if (vpDoc) {
          vpDoc.style.padding = '0'
        }
      })

      // 额外等待图片加载
      await page.evaluate(() => {
        return Promise.all(
          Array.from(document.images)
            .filter((img) => !img.complete)
            .map((img) => new Promise((res) => { img.onload = img.onerror = res }))
        )
      })

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
        displayHeaderFooter: true,
        headerTemplate: `<div style="width:100%;text-align:center;font-size:9px;color:#999;">${title}</div>`,
        footerTemplate: '<div style="width:100%;text-align:center;font-size:9px;color:#999;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      })

      pdfBuffers.push({ title, group, link, label, buffer: pdfBuffer })
    } catch (err) {
      console.warn(`  ⚠️ 渲染失败: ${title} (${err.message})`)
      pdfBuffers.push({ title, group, link, label, buffer: null })
    }
  }

  await page.close()
  return pdfBuffers
}

// ─── 4. 合并 PDF + 添加书签 ────────────────────────────────────────────────────
async function mergePdf(pdfEntries, groupName) {
  console.log('📚 合并 PDF 并生成书签目录 ...')

  const mergedPdf = await PDFDocument.create()
  mergedPdf.setTitle(`${groupName} 电子书`)
  mergedPdf.setCreator('smart-code-tool pdf-export')

  const bookmarks = [] // { title, group, pageIndex }
  let currentPageIndex = 0

  for (const entry of pdfEntries) {
    if (!entry.buffer) continue

    const srcPdf = await PDFDocument.load(entry.buffer)
    const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices())

    const startPage = currentPageIndex
    for (const p of copiedPages) {
      mergedPdf.addPage(p)
      currentPageIndex++
    }

    bookmarks.push({
      title: entry.title,
      group: entry.group,
      label: entry.label,
      pageIndex: startPage,
    })
  }

  // 通过 pdf-lib 底层 API 添加书签
  addBookmarks(mergedPdf, bookmarks)

  const outputPath = resolve(OUTPUT_DIR, `${groupName}-ebook-${getTimestamp()}.pdf`)
  const bytes = await mergedPdf.save()

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const { writeFileSync } = await import('node:fs')
  writeFileSync(outputPath, bytes)

  console.log(`✅ 输出完成: ${outputPath}`)
  console.log(`   共 ${currentPageIndex} 页, ${bookmarks.length} 个章节`)
  return outputPath
}

/**
 * 为 PDF 添加书签目录（扁平结构，分组名作为前缀）
 */
function addBookmarks(pdfDoc, bookmarks) {
  try {
    const context = pdfDoc.context
    const pages = pdfDoc.getPages()
    if (pages.length === 0 || bookmarks.length === 0) return

    // 构建 outline items（标题已含层级序号 + 完整菜单前缀）
    const outlineItems = []

    for (const bm of bookmarks) {
      const label = bm.label || bm.title

      const pageRef = pages[bm.pageIndex].ref
      outlineItems.push({ title: label, pageRef, pageIndex: bm.pageIndex })
    }

    // 创建 outline 字典链
    const outlineDict = context.obj({
      Type: 'Outlines',
      Count: outlineItems.length,
    })
    const outlineRef = context.register(outlineDict)

    const itemRefs = []
    for (let i = 0; i < outlineItems.length; i++) {
      const item = outlineItems[i]
      const destArray = context.obj([item.pageRef, PDFName.of('Fit')])
      const itemDict = context.obj({
        // 中文标题必须用 PDFHexString（UTF-16BE 编码），否则阅读器无法解析
        Title: PDFHexString.fromText(item.title),
        Parent: outlineRef,
        Dest: destArray,
      })
      itemRefs.push(context.register(itemDict))
    }

    // 链接 Prev / Next
    for (let i = 0; i < itemRefs.length; i++) {
      const dict = context.lookup(itemRefs[i])
      if (i > 0) dict.set(context.obj('Prev'), itemRefs[i - 1])
      if (i < itemRefs.length - 1) dict.set(context.obj('Next'), itemRefs[i + 1])
    }

    // 设置 First / Last
    if (itemRefs.length > 0) {
      outlineDict.set(context.obj('First'), itemRefs[0])
      outlineDict.set(context.obj('Last'), itemRefs[itemRefs.length - 1])
    }

    // 挂载到 catalog
    pdfDoc.catalog.set(context.obj('Outlines'), outlineRef)
    // 设置 PageMode 为显示书签面板
    pdfDoc.catalog.set(context.obj('PageMode'), context.obj('UseOutlines'))
  } catch (err) {
    console.warn('⚠️ 书签生成失败（不影响 PDF 内容）:', err.message)
  }
}

// ─── 主流程 ─────────────────────────────────────────────────────────────────────
async function main() {
  // 解析要导出的分组列表（all = 全部分组）
  const groups = GROUP === 'all' ? getAllGroups() : [GROUP]

  console.log(`\n📖 PDF 电子书导出 - 分组: [${groups.join(', ')}]\n`)

  // 1. 启动 dev server（只启动一次，供所有分组复用）
  const server = await startDevServer()
  console.log('✅ VitePress dev server 已就绪\n')

  // 2. 启动浏览器（只启动一次，供所有分组复用）
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const results = []

  try {
    for (const group of groups) {
      console.log(`\n${'═'.repeat(56)}`)
      console.log(`📁 处理分组: [${group}]`)
      console.log(`${'═'.repeat(56)}`)

      // 3. 读取页面列表
      const pages = await loadSidebarPages(group)
      console.log(`📋 从 sidebar 配置读取到 ${pages.length} 个页面\n`)

      if (pages.length === 0) {
        console.warn(`⚠️ 分组 [${group}] 没有可导出的页面，跳过`)
        continue
      }

      // 4. 逐页渲染
      const pdfEntries = await renderPages(pages, browser)

      // 5. 合并 + 书签
      const outputPath = await mergePdf(pdfEntries, group)
      results.push({ group, outputPath })
    }
  } finally {
    // 6. 关闭浏览器与 dev server
    await browser.close()
    console.log('\n🛑 关闭 dev server ...')
    server.kill('SIGTERM')
  }

  // 清理临时文件
  if (existsSync(TEMP_DIR)) rmSync(TEMP_DIR, { recursive: true })

  console.log('\n🎉 全部完成！')
  console.log(`   共生成 ${results.length} 个 PDF:`)
  results.forEach((r) => console.log(`   - [${r.group}] ${r.outputPath}`))
  console.log('')
}

main().catch((err) => {
  console.error('❌ 导出失败:', err)
  process.exit(1)
})
