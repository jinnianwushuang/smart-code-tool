#!/usr/bin/env zx

// pnpm add -D zx
// # 或者 npm install --save-dev zx
// 打包命令
// npx zx build-zx.mjs

// 定义镜像名称和版本
const IMAGE_NAME = 'smart-code-tool-frontend'
const VERSION = 'latest'

// 设置 zx 的配置：命令执行失败时会立即抛出异常并中断
$.verbose = true

console.log(chalk.blue('\n📦 1. 开始本地前端项目打包...'))
// 如果你用 pnpm，这里改成 await $`pnpm build`
await $`npm run build`

console.log(chalk.blue(`\n🐳 2. 开始构建 Docker 镜像: ${IMAGE_NAME}:${VERSION}...`))
// --platform linux/amd64 确保在 Mac M系列芯片上打包出的镜像能在线上 Linux 服务器跑
await $`docker build --platform linux/amd64 -t ${IMAGE_NAME}:${VERSION} .`

console.log(chalk.green('\n========================================'))
console.log(chalk.green('✅ 3. 镜像构建完成！'))
console.log(chalk.gray(`   你可以通过以下命令查看镜像:\n   docker images | grep ${IMAGE_NAME}`))
console.log(chalk.green('========================================'))
