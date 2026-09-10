#!/usr/bin/env zx

import { chalk } from 'zx'

console.log(chalk.blue('\n🚀 Smart Code Tool Development Mode\n'))
console.log(chalk.gray('Starting development servers...\n'))

try {
  // Step 1: 创建入口文件
  console.log(chalk.yellow('📝 Step 1: Creating entry files...'))
  await $`node ./job/entry/index.js`
  console.log(chalk.green('✓ Entry files created\n'))

  // Step 2: 并行启动三个开发服务器
  console.log(chalk.yellow('🔧 Step 2: Starting development servers...'))
  console.log(chalk.gray('   - Docs (main): http://localhost:23000/smart-code-tool/'))
  console.log(chalk.gray('   - Tool app: http://localhost:23330/smart-code-tool/code-tool-app/'))
  console.log(
    chalk.gray('   - Vue-test app: http://localhost:23350/smart-code-tool/vue-test-app/\n'),
  )

  // 使用 Promise.all 并行启动三个开发服务器
  const vueDev = $`vite --config entries/code-tool/vite.config.js`
  const vueTestDev = $`vite --config entries/vue-test/vite.config.js`
  const docsDev = $`vitepress dev docs`

  // 等待三个进程（它们会持续运行）
  await Promise.all([vueDev, vueTestDev, docsDev])
} catch (error) {
  console.error(chalk.red('\n❌ Development server failed!'))
  console.error(chalk.red(`Error: ${error.message}`))
  process.exit(1)
}
