#!/usr/bin/env zx

import { chalk } from 'zx'

// 设置详细输出
$.verbose = true

console.log(chalk.blue('\n🚀 Smart Code Tool Build Process\n'))
console.log(chalk.gray('Starting build process...\n'))

try {
  // Step 1: 清除缓存
  console.log(chalk.yellow('📦 Step 1: Clearing cache...'))
  await $`node ./job/cache/clear-cache.js`
  console.log(chalk.green('✓ Cache cleared\n'))

  // Step 2: 创建入口文件
  console.log(chalk.yellow('📝 Step 2: Creating entry files...'))
  await $`node ./job/entry/index.js`
  console.log(chalk.green('✓ Entry files created\n'))

  // Step 3: 构建 Vue 应用
  console.log(chalk.yellow('🔨 Step 3: Building Vue application...'))
  await $`vite build`
  console.log(chalk.green('✓ Vue application built\n'))

  // Step 4: 构建 VitePress 文档
  console.log(chalk.yellow('📚 Step 4: Building VitePress documentation...'))
  await $`vitepress build docs`
  console.log(chalk.green('✓ Documentation built\n'))

  // 完成
  console.log(chalk.green('\n========================================'))
  console.log(chalk.green('✅ Build completed successfully!'))
  console.log(chalk.gray('   Output directory: ./dist'))
  console.log(chalk.gray('   Documentation: ./dist/docs'))
  console.log(chalk.green('========================================\n'))
} catch (error) {
  console.error(chalk.red('\n❌ Build failed!'))
  console.error(chalk.red(`Error: ${error.message}`))
  if (error.stderr) {
    console.error(chalk.red(`Stderr: ${error.stderr}`))
  }
  process.exit(1)
}
