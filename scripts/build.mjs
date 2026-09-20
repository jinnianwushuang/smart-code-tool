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

  // Step 3: 打包指令集压缩包（必须在 VitePress 构建之前，VitePress 会将 docs/public/ 复制到 dist/）
  console.log(chalk.yellow('📦 Step 3: Archiving instruction sets...'))
  await $`npx zx scripts/archive-instructions.mjs`
  console.log(chalk.green('✓ Instruction archives created\n'))

  // Step 4: 构建 VitePress 文档（主项目，会先清空 dist/ 再输出到 dist/）
  console.log(chalk.yellow('📚 Step 4: Building VitePress documentation (main)...'))
  await $`vitepress build docs`
  console.log(chalk.green('✓ Documentation built\n'))

  // Step 5: 构建工具库应用（子项目 /tool/）→ 直接输出到 dist/tool/
  // 注意：必须在 VitePress 之后构建，因为 VitePress 会清空 dist/
  console.log(chalk.yellow('🔨 Step 5: Building tool application → dist/tool/...'))
  await $`vite build --config project/code-tool-app/vite.config.js`
  console.log(chalk.green('✓ Tool application built\n'))

  // Step 6: 构建 VUE 架构验证应用（子项目 /vue-test/）→ 输出到 dist/vue-test-app/
  console.log(chalk.yellow('🧪 Step 6: Building vue-test application → dist/vue-test-app/...'))
  await $`vite build --config project/vue-test-app/vite.config.js`
  console.log(chalk.green('✓ Vue-test application built\n'))

  // Step 7: 构建 React 架构验证应用（子项目 /react-test/）→ 输出到 dist/react-test-app/
  console.log(chalk.yellow('🔨 Step 7: Building react-test application → dist/react-test-app/...'))
  await $`vite build --config project/react-test-app/vite.config.js`
  console.log(chalk.green('✓ React-test application built\n'))

  // Step 8: 后处理 — 移动入口 HTML 到正确位置
  console.log(chalk.yellow('📂 Step 8: Moving entry HTML files...'))
  await $`node ./job/post-build/move-entry-html.js`
  console.log(chalk.green('✓ Entry HTML files moved\n'))

  // 完成
  console.log(chalk.green('\n========================================'))
  console.log(chalk.green('✅ Build completed successfully!'))
  console.log(chalk.gray('   Output directory: ./dist'))
  console.log(chalk.gray('   Documentation: ./dist (main)'))
  console.log(chalk.gray('   Code-Tool App: ./dist/code-tool-app'))
  console.log(chalk.gray('   Vue-Test App: ./dist/vue-test-app'))
  console.log(chalk.gray('   React-Test App: ./dist/react-test-app'))
  console.log(chalk.green('========================================\n'))
} catch (error) {
  console.error(chalk.red('\n❌ Build failed!'))
  console.error(chalk.red(`Error: ${error.message}`))
  if (error.stderr) {
    console.error(chalk.red(`Stderr: ${error.stderr}`))
  }
  process.exit(1)
}
