#!/usr/bin/env zx

/**
 * 将指令集的 AI 指令区目录打包为 zip，供文档页面下载
 *
 * 用法：
 *   npx zx scripts/archive-instructions.mjs
 *
 * 打包规则：
 *   docs/instructions/vue/vue-assembler/vue-assembler/       → docs/public/archive/vue-assembler.zip
 *   docs/instructions/vue/vue-code-review/vue-code-review/   → docs/public/archive/vue-code-review.zip
 *   docs/instructions/vue/vue-arch-starter/vue-arch-starter/ → docs/public/archive/vue-arch-starter.zip
 */

import { chalk, fs } from 'zx'

$.verbose = true

// ── 打包配置 ──────────────────────────────────────────────
const ARCHIVE_DIR = 'docs/public/archive'

const TASKS = [
  {
    name: 'vue-assembler',
    src: 'docs/instructions/vue/vue-assembler/vue-assembler',
    output: `${ARCHIVE_DIR}/vue-assembler.zip`,
  },
  {
    name: 'vue-code-review',
    src: 'docs/instructions/vue/vue-code-review/vue-code-review',
    output: `${ARCHIVE_DIR}/vue-code-review.zip`,
  },
  {
    name: 'vue-arch-starter',
    src: 'docs/instructions/vue/vue-arch-starter/vue-arch-starter',
    output: `${ARCHIVE_DIR}/vue-arch-starter.zip`,
  },
]

// ── 执行 ──────────────────────────────────────────────────
console.log(chalk.blue('\n📦 指令集压缩包打包\n'))

// 确保输出目录存在
await fs.ensureDir(ARCHIVE_DIR)

for (const task of TASKS) {
  const srcExists = await fs.pathExists(task.src)

  if (!srcExists) {
    console.log(chalk.yellow(`⚠️  跳过 ${task.name}：源目录不存在 → ${task.src}`))
    continue
  }

  console.log(chalk.gray(`  打包 ${task.src} → ${task.output}`))

  // 进入源目录的父级，以目录名作为 zip 内的根目录
  const parentDir = task.src.substring(0, task.src.lastIndexOf('/'))
  const dirName = task.src.substring(task.src.lastIndexOf('/') + 1)

  await $`cd ${parentDir} && zip -r ${process.cwd()}/${task.output} ${dirName}/ -x "*.DS_Store"`

  console.log(chalk.green(`  ✅ ${task.name} 打包完成`))
}

console.log(chalk.green('\n✅ 所有指令集压缩包打包完成！'))
console.log(chalk.gray(`   输出目录: ${ARCHIVE_DIR}/\n`))
