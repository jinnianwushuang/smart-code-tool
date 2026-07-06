#!/usr/bin/env zx

import { chalk } from 'zx'

console.log(chalk.blue('\n🚀 Smart Code Tool Development Mode\n'))
console.log(chalk.gray('Starting development servers...\n'))

try {
  // Step 1: 创建入口文件
  console.log(chalk.yellow('📝 Step 1: Creating entry files...'))
  await $`node ./job/entry/index.js`
  console.log(chalk.green('✓ Entry files created\n'))

  // Step 2: 并行启动 Vue 和 VitePress 开发服务器
  console.log(chalk.yellow('🔧 Step 2: Starting development servers...'))
  console.log(chalk.gray('   - Vue app: http://localhost:23330'))
  console.log(chalk.gray('   - Docs: http://localhost:5173/docs/\n'))

  // 使用 Promise.all 并行启动两个开发服务器
  const vueDev = $`vite`
  const docsDev = $`vitepress dev docs`

  // 等待两个进程（它们会持续运行）
  await Promise.all([vueDev, docsDev])
} catch (error) {
  console.error(chalk.red('\n❌ Development server failed!'))
  console.error(chalk.red(`Error: ${error.message}`))
  process.exit(1)
}
