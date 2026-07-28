#!/usr/bin/env zx

/**
 * 批量导出所有文档分组的 PDF 电子书
 *
 * 复用 pdf-export.mjs 的 --group all 能力：
 * dev server 与浏览器只启动一次，依次导出 handbook / ai / psychology / architecture 等全部分组。
 *
 * 用法：pnpm pdf:export:all  （或 npx zx scripts/pdf-export-all.mjs）
 */

import { chalk } from 'zx'

console.log(chalk.blue('\n📚 批量导出全部文档 PDF 电子书\n'))
console.log(chalk.gray('将依次导出所有菜单分组，dev server 与浏览器仅启动一次 ...\n'))

try {
  await $`node scripts/pdf-export.mjs --group all`

  console.log(chalk.green('\n========================================'))
  console.log(chalk.green('✅ 所有分组 PDF 导出完成！'))
  console.log(chalk.gray('   输出目录: ./pdf-output'))
  console.log(chalk.green('========================================\n'))
  process.exit(0)
} catch (error) {
  console.error(chalk.red('\n❌ PDF 批量导出失败!'))
  console.error(chalk.red(`Error: ${error.message}`))
  process.exit(1)
}
