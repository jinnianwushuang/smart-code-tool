#!/usr/bin/env zx

import { chalk } from 'zx'

console.log(chalk.blue('\n🚀 Smart Code Tool Development Mode\n'))
console.log(chalk.gray('Starting development servers...\n'))

try {
  // Step 1: 清理残留端口占用
  console.log(chalk.yellow('🧹 Step 1: Cleaning ports...'))
  await $`kill -9 $(lsof -ti :23330 -ti :23000 -ti :23350 -ti :23370) 2>/dev/null || true`
  console.log(chalk.green('✓ Ports 23330 & 23000 & 23350 & 23370 cleared\n'))

  // Step 2: 清理 Vite 依赖优化缓存，避免多实例共享缓存导致 504
  console.log(chalk.yellow('🗑️  Step 2: Cleaning Vite caches...'))
  await $`rm -rf node_modules/.vite-code-tool-app node_modules/.vite-vue-test-app node_modules/.vite-react-test-app node_modules/.vite node_modules/.vite-temp`
  console.log(chalk.green('✓ Vite caches cleared\n'))

  // Step 3: 创建入口文件
  console.log(chalk.yellow('📝 Step 3: Creating entry files...'))
  await $`node ./job/entry/index.js`
  console.log(chalk.green('✓ Entry files created\n'))

  // Step 4: 并行启动四个开发服务器
  console.log(chalk.yellow('🔧 Step 4: Starting development servers...'))
  console.log(chalk.gray('   - Docs (main): http://localhost:23000/smart-code-tool/'))
  console.log(
    chalk.gray(
      '   - Code-Tool app: http://localhost:23330/smart-code-tool/code-tool-app/project/code-tool-app/',
    ),
  )
  console.log(
    chalk.gray(
      '   - Vue-Test app: http://localhost:23350/smart-code-tool/vue-test-app/project/vue-test-app/',
    ),
  )
  console.log(
    chalk.gray(
      '   - React-Test app: http://localhost:23370/smart-code-tool/react-test-app/project/react-test-app/',
    ),
  )
  console.log('\n')
  // 使用 Promise.all 并行启动四个开发服务器
  const vueDev = $`vite --config project/code-tool-app/vite.config.js`
  const vueTestDev = $`vite --config project/vue-test-app/vite.config.js`
  const reactTestDev = $`vite --config project/react-test-app/vite.config.js`
  const docsDev = $`vitepress dev docs`

  // 等待四个进程（它们会持续运行）
  await Promise.all([vueDev, vueTestDev, reactTestDev, docsDev])
} catch (error) {
  console.error(chalk.red('\n❌ Development server failed!'))
  console.error(chalk.red(`Error: ${error.message}`))
  process.exit(1)
}
