// npm install glob
//

const fs = require('fs')
const path = require('path')
const { globSync } = require('glob')

/**
 * 核心逻辑：将路径重写为相对路径
 * @param {string} targetDir 模块根目录起点（例如 'src/pages/architecture-document/'）
 * @param {string} searchDir 扫描范围目录（默认为当前目录）
 */
function transformAliasToRelative(targetDir, searchDir = '.') {
  // 1. 获取所有 VUE 和 JS 文件
  const files = globSync(`${searchDir}/**/*.{vue,js}`, {
    ignore: ['node_modules/**', 'dist/**'],
  })

  // 确保 targetDir 格式统一（去掉结尾斜杠）
  const normalizedTarget = targetDir.replace(/\/$/, '')

  files.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8')
    const fileDir = path.dirname(filePath)

    /**
     * 正则说明：匹配 import ... from "path" 或 import("path")
     * 捕获组 1: 路径内容
     */
    const importRegex = /(import\s+.*?\s+from\s+['"]|import\(['"]|require\(['"])([^'"]+)(['"]\)?)/g

    const newContent = content.replace(importRegex, (match, prefix, importPath, suffix) => {
      // 检查引入路径是否以目标根目录开头
      if (importPath.startsWith(normalizedTarget)) {
        // 计算当前文件位置 到 目标资源位置 的相对路径
        let relativePath = path.relative(fileDir, importPath)

        // path.relative 在同级目录下不带 ./，需补全以符合 ESM 规范
        if (!relativePath.startsWith('.')) {
          relativePath = './' + relativePath
        }

        console.log(`[修正] ${filePath}: "${importPath}" -> "${relativePath}"`)
        return `${prefix}${relativePath}${suffix}`
      }
      return match
    })

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf-8')
    }
  })

  console.log('\n扫描并替换完成。')
}

// --- 执行脚本 ---
// 参数 1: 匹配的前缀 (要被替换的路径起点)
// 参数 2: 扫描的目录 (可选，默认为当前目录)
const targetPath = process.argv[2] || 'src/pages/architecture-document/'
const scanPath = process.argv[3] || '.'

if (!targetPath) {
  console.error('请提供目标根目录路径！')
} else {
  transformAliasToRelative(targetPath, scanPath)
}

// # 格式：node aliasToRelative.js [匹配路径] [扫描范围]
// node aliasToRelative.js src/pages/architecture-document/ ./src
