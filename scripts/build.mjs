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

  // Step 3: 构建 VitePress 文档（主项目，会先清空 dist/ 再输出到 dist/）
  console.log(chalk.yellow('📚 Step 3: Building VitePress documentation (main)...'))
  await $`vitepress build docs`
  console.log(chalk.green('✓ Documentation built\n'))

  // Step 4: 构建工具库应用（子项目 /tool/）→ 直接输出到 dist/tool/
  // 注意：必须在 VitePress 之后构建，因为 VitePress 会清空 dist/
  console.log(chalk.yellow('🔨 Step 4: Building tool application → dist/tool/...'))
  await $`vite build --config entries/code-tool/vite.config.js`
  console.log(chalk.green('✓ Tool application built\n'))

  // Step 5: 构建 VUE 架构验证应用（子项目 /vue-test/）→ 输出到 dist/vue-test-app/
  console.log(chalk.yellow('🧪 Step 5: Building vue-test application → dist/vue-test-app/...'))
  await $`vite build --config entries/vue-test/vite.config.js`
  console.log(chalk.green('✓ Vue-test application built\n'))

  // 完成
  console.log(chalk.green('\n========================================'))
  console.log(chalk.green('✅ Build completed successfully!'))
  console.log(chalk.gray('   Output directory: ./dist'))
  console.log(chalk.gray('   Documentation: ./dist (main)'))
  console.log(chalk.gray('   Tool App: ./dist/tool'))
  console.log(chalk.gray('   Vue-Test App: ./dist/vue-test'))
  console.log(chalk.green('========================================\n'))
} catch (error) {
  console.error(chalk.red('\n❌ Build failed!'))
  console.error(chalk.red(`Error: ${error.message}`))
  if (error.stderr) {
    console.error(chalk.red(`Stderr: ${error.stderr}`))
  }
  process.exit(1)
}
