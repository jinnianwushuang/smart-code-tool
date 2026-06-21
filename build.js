// node build.js
import { execSync } from 'child_process'
import process from 'process'

// 定义镜像名称和版本
const IMAGE_NAME = 'smart-code-tool-frontend'
const VERSION = 'latest'

/**
 * 封装执行终端命令的函数
 */
function runCommand(command, description) {
  console.log(`\n🚀 ${description}...`)
  try {
    // stdio: 'inherit' 可以让命令的实时输出（比如打包进度、Docker构建过程）直接打印在当前终端里
    execSync(command, { stdio: 'inherit' })
  } catch (error) {
    console.error(`\n❌ 错误: "${description}" 执行失败，脚本已中断。`)
    process.exit(1)
  }
}

function main() {
  // 1. 前端打包
  runCommand('npm run build', '开始本地前端项目打包 (npm run build)')

  // 2. 构建 Docker 镜像
  const dockerBuildCmd = `docker build --platform linux/amd64 -t ${IMAGE_NAME}:${VERSION} .`
  runCommand(dockerBuildCmd, `开始构建 Docker 镜像 [${IMAGE_NAME}:${VERSION}]`)

  // 3. 大功告成
  console.log('\n========================================')
  console.log('✅ 3. 镜像构建完成！')
  console.log(`   你可以通过以下命令查看镜像:\n   docker images | grep ${IMAGE_NAME}`)
  console.log('========================================')
}

main()
