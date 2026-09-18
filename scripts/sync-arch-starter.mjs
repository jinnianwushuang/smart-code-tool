#!/usr/bin/env zx

/**
 * 将 src/ 中的架构核心代码同步到 vue-arch-starter 代码模板包
 *
 * 用法：
 *   npx zx scripts/sync-arch-starter.mjs
 *
 * 流程：
 *   1. 从 src/ 复制最新代码到 code-template/
 *   2. 消除聚合文件（将 src/output/ 间接导入替换为实际路径直接导入）
 *   3. 同步 composable/index.js
 *   4. 报告变更文件清单
 *
 * 同步后需手动操作：
 *   - 检查 VERSION.md 是否需要更新变更说明
 *   - 运行 npx zx scripts/archive-instructions.mjs 重新打包 zip
 */

import { chalk, fs } from 'zx'

$.verbose = true

// ── 路径配置 ──────────────────────────────────────────────
const PROJECT_ROOT = process.cwd()
const TEMPLATE_DIR = 'docs/instructions/vue/vue-arch-starter/vue-arch-starter/code-template'

// 源目录 → 模板目录 的映射
const SYNC_MAP = [
  {
    src: 'src/standardization/multiton-template',
    dest: `${TEMPLATE_DIR}/standardization/multiton-template`,
  },
  {
    src: 'src/standardization/singleton-template',
    dest: `${TEMPLATE_DIR}/standardization/singleton-template`,
  },
  { src: 'src/common/architecture-design', dest: `${TEMPLATE_DIR}/common/architecture-design` },
  {
    src: 'src/composable/architecture-design',
    dest: `${TEMPLATE_DIR}/composable/architecture-design`,
  },
  { src: 'src/css', dest: `${TEMPLATE_DIR}/css` },
]

// ── 聚合文件符号 → 实际文件路径 映射 ─────────────────────
// src/output/common/project-common.js 的 re-export 链
const PROJECT_COMMON_SYMBOL_MAP = {
  // assembler
  atoms_assembler: 'src/common/architecture-design/assembler/assemble_atoms.js',
  common_assemble_component: 'src/common/architecture-design/assembler/assemble_component.js',
  common_assemble_event_pipeline:
    'src/common/architecture-design/assembler/assemble_event_pipeline.js',
  common_assemble_function: 'src/common/architecture-design/assembler/assemble_function.js',
  common_assemble_multiton: 'src/common/architecture-design/assembler/assemble_multiton.js',
  common_assemble_singleton: 'src/common/architecture-design/assembler/assemble_singleton.js',
  common_assemble_state: 'src/common/architecture-design/assembler/assemble_state.js',
  // function-wrapper
  wrap_with_payload: 'src/common/architecture-design/function-wrapper/wrap_with_payload.js',
  wrap_with_payload_pipeline:
    'src/common/architecture-design/function-wrapper/wrap_with_payload_pipeline.js',
  // mitt-kit
  EMITTER: 'src/common/architecture-design/mitt-kit/mitt.js',
  // util
  get_file_name_config: 'src/common/architecture-design/util/file/file.js',
  get_file_name_module: 'src/common/architecture-design/util/file/file.js',
  log_assembler: 'src/common/architecture-design/util/log/log.js',
  architecture_check_pre_process: 'src/common/architecture-design/util/merge/architecture_check.js',
  architecture_check_after_process:
    'src/common/architecture-design/util/merge/architecture_check.js',
  merge_to_payload_with_conflict_logs: 'src/common/architecture-design/util/merge/merge.js',
}

// src/boot/output-source/project-common-other.js 的第三方依赖映射
const THIRD_PARTY_MAP = {
  useQuasar: { package: 'quasar', type: 'named' },
  useRoute: { package: 'vue-router', type: 'named' },
  useRouter: { package: 'vue-router', type: 'named' },
  lodash: { package: 'lodash', type: 'default' },
  dayjs: { package: 'dayjs', type: 'default' },
  message: { package: 'ant-design-vue', type: 'named' },
  pascalCase: { package: 'change-case', type: 'named' },
  camelCase: { package: 'change-case', type: 'named' },
}

console.log(chalk.blue('\n🔄 同步架构代码到 vue-arch-starter\n'))

// ── Step 1: 复制文件 ─────────────────────────────────────
console.log(chalk.yellow('📦 Step 1: 复制源文件到 code-template/'))

for (const { src, dest } of SYNC_MAP) {
  const srcPath = `${PROJECT_ROOT}/${src}`
  if (!(await fs.pathExists(srcPath))) {
    console.log(chalk.red(`  ❌ 源目录不存在: ${src}`))
    process.exit(1)
  }
  await fs.ensureDir(dest)
  await fs.copy(srcPath, dest, { overwrite: true })
  console.log(chalk.green(`  ✅ ${src} → ${dest}`))
}

// 清理 .DS_Store
await $`find ${TEMPLATE_DIR} -name ".DS_Store" -delete`.quiet()

// ── Step 2: 消除聚合文件 ─────────────────────────────────
console.log(chalk.yellow('\n🔧 Step 2: 消除聚合文件导入'))

// 收集所有需要处理的 .js 和 .vue 文件
const allFiles = await $`find ${TEMPLATE_DIR} -type f \\( -name "*.js" -o -name "*.vue" \\)`.quiet()
const files = allFiles.stdout.trim().split('\n').filter(Boolean)

let replacementCount = 0

for (const filePath of files) {
  let content = await fs.readFile(filePath, 'utf-8')
  const originalContent = content

  // ── 2a: 替换 src/output/common/project-common.js ──────
  // 匹配: import { sym1, sym2 } from 'src/output/common/project-common.js'
  // 支持单引号和双引号
  content = content.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"]src\/output\/common\/project-common\.js['"]/g,
    (match, symbolsStr) => {
      const symbols = symbolsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      // 按实际文件路径分组
      const grouped = {}
      for (const sym of symbols) {
        const realPath = PROJECT_COMMON_SYMBOL_MAP[sym]
        if (realPath) {
          if (!grouped[realPath]) grouped[realPath] = []
          grouped[realPath].push(sym)
        } else {
          console.log(chalk.yellow(`  ⚠️  未知符号: ${sym} (文件: ${filePath})`))
        }
      }
      // 生成替换后的 import 语句
      const imports = Object.entries(grouped).map(([path, syms]) => {
        return `import { ${syms.join(', ')} } from '${path}'`
      })
      return imports.join('\n')
    },
  )

  // ── 2b: 替换 src/output/common/composable-common.js ───
  // 命名空间导入: import * as composable_common from '...'
  content = content.replace(
    /import\s*\*\s*as\s+(\w+)\s*from\s*['"]src\/output\/common\/composable-common\.js['"]/g,
    (match, ns) => {
      return `import * as ${ns} from 'src/composable/index.js'`
    },
  )
  // 具名导入: import { xxx } from '...'
  content = content.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"]src\/output\/common\/composable-common\.js['"]/g,
    (match, symbolsStr) => {
      const symbols = symbolsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      // 每个 composable 符号对应独立文件
      const composableSymbolMap = {
        useContextAssembler: 'src/composable/architecture-design/assembler/useContextAssembler.js',
        useModuleLifecycleAssembler:
          'src/composable/architecture-design/assembler/useModuleLifecycleAssembler.js',
        useGlobalVariable:
          'src/composable/architecture-design/global-variable-composable/useGlobalVariable.js',
        useAllExceptEventListenerCleaner:
          'src/composable/architecture-design/lifecycle-disposer-composable/useAllExceptEventListenerCleaner.js',
        useEventListenerCleaner:
          'src/composable/architecture-design/lifecycle-disposer-composable/useEventListenerCleaner.js',
      }
      const grouped = {}
      for (const sym of symbols) {
        const realPath = composableSymbolMap[sym]
        if (realPath) {
          if (!grouped[realPath]) grouped[realPath] = []
          grouped[realPath].push(sym)
        } else {
          console.log(chalk.yellow(`  ⚠️  未知 composable 符号: ${sym} (文件: ${filePath})`))
        }
      }
      return Object.entries(grouped)
        .map(([path, syms]) => {
          return `import { ${syms.join(', ')} } from '${path}'`
        })
        .join('\n')
    },
  )

  // ── 2c: 替换 src/boot/output-source/project-common-other.js ──
  content = content.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"]src\/boot\/output-source\/project-common-other\.js['"]/g,
    (match, symbolsStr) => {
      const symbols = symbolsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const grouped = {}
      for (const sym of symbols) {
        const info = THIRD_PARTY_MAP[sym]
        if (info) {
          if (!grouped[info.package]) grouped[info.package] = { named: [], default: null }
          if (info.type === 'default') {
            grouped[info.package].default = sym
          } else {
            grouped[info.package].named.push(sym)
          }
        } else {
          console.log(chalk.yellow(`  ⚠️  未知第三方符号: ${sym} (文件: ${filePath})`))
        }
      }
      return Object.entries(grouped)
        .map(([pkg, { named, default: def }]) => {
          const parts = []
          if (def) parts.push(def)
          if (named.length > 0) parts.push(`{ ${named.join(', ')} }`)
          return `import ${parts.join(', ')} from '${pkg}'`
        })
        .join('\n')
    },
  )

  // 写回文件（仅内容有变化时）
  if (content !== originalContent) {
    await fs.writeFile(filePath, content, 'utf-8')
    replacementCount++
    console.log(chalk.green(`  ✅ 替换导入: ${filePath}`))
  }
}

if (replacementCount === 0) {
  console.log(chalk.gray('  （无需替换，源文件未使用聚合文件导入）'))
}

// ── Step 3: 同步 composable/index.js ─────────────────────
console.log(chalk.yellow('\n📋 Step 3: 检查 composable/index.js'))

const composableIndex = `${TEMPLATE_DIR}/composable/index.js`
const composableSrcDir = `${TEMPLATE_DIR}/composable/architecture-design`

// 扫描 composable/architecture-design/ 下所有导出的函数
const composableFiles = await $`find ${composableSrcDir} -name "*.js" -type f`.quiet()
const composableFileList = composableFiles.stdout.trim().split('\n').filter(Boolean)

let indexContent = `/**\n * Composable 函数索引\n *\n * 供 assemble_atoms.js 动态查找公共外部模块使用（public_assembler 机制）\n * 新增公共 composable 时，在此处添加 export 即可被装配器自动发现\n */\n`

for (const f of composableFileList.sort()) {
  const relativePath = f.replace(`${PROJECT_ROOT}/`, '')
  // 转换为 src/ 路径格式
  const srcPath = relativePath.replace(`${TEMPLATE_DIR}/`, 'src/')
  indexContent += `export * from '${srcPath}'\n`
}

const existingIndex = await fs.readFile(composableIndex, 'utf-8').catch(() => '')
if (indexContent !== existingIndex) {
  await fs.writeFile(composableIndex, indexContent, 'utf-8')
  console.log(chalk.green('  ✅ composable/index.js 已更新'))
} else {
  console.log(chalk.gray('  （composable/index.js 无变化）'))
}

// ── 完成 ─────────────────────────────────────────────────
console.log(chalk.green('\n========================================'))
console.log(chalk.green('✅ 代码同步完成！'))
console.log(chalk.green('========================================'))
console.log(chalk.gray(`   模板目录: ${TEMPLATE_DIR}/`))
console.log(chalk.gray(`   导入替换: ${replacementCount} 个文件`))
console.log('')
console.log(chalk.yellow('📌 后续步骤:'))
console.log(chalk.gray('   1. 检查 VERSION.md 是否需要更新变更说明'))
console.log(chalk.gray('   2. 运行 npx zx scripts/archive-instructions.mjs 重新打包 zip'))
