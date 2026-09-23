#!/usr/bin/env zx

/**
 * 将指令集按框架打包为套件 zip，供文档页面下载
 *
 * 用法：
 *   npx zx scripts/archive-instructions.mjs
 *
 * 输出：
 *   docs/public/archive/vue-kit.zip         — Vue 全套套件
 *   docs/public/archive/react-kit.zip       — React 全套套件
 *   docs/public/archive/flutter-kit.zip     — Flutter 全套套件
 *   docs/public/archive/instructions-kit.zip — 三合一总套件
 *
 * 每个框架套件包含：
 *   ├── instruction-architecture/   ← 指令设计架构准则（共享）
 *   ├── prompts/                    ← 框架提示词与约束
 *   └── <框架指令集>/               ← 该框架下所有指令集（含 docs + AI 指令区）
 *
 * 新增指令集时，只需在 FRAMEWORKS 配置的 instructionSets 数组中添加条目即可。
 */

import { chalk, fs } from 'zx'

$.verbose = true

// ── 路径常量 ──────────────────────────────────────────────
const ARCHIVE_DIR = 'docs/public/archive'
const STAGING_DIR = '.staging-kits'
const INSTRUCTIONS_ROOT = 'docs/instructions'

// ── 框架配置 ──────────────────────────────────────────────
// 新增指令集时，只需在对应框架的 instructionSets 中添加 { name, src } 即可
const FRAMEWORKS = [
  {
    id: 'vue',
    label: 'Vue',
    instructionSets: [
      {
        name: 'vue-assembler',
        src: `${INSTRUCTIONS_ROOT}/vue/vue-assembler`,
      },
      {
        name: 'vue-code-review',
        src: `${INSTRUCTIONS_ROOT}/vue/vue-code-review`,
      },
      {
        name: 'vue-arch-starter',
        src: `${INSTRUCTIONS_ROOT}/vue/vue-arch-starter`,
      },
    ],
  },
  {
    id: 'react',
    label: 'React',
    instructionSets: [
      {
        name: 'react-assembler',
        src: `${INSTRUCTIONS_ROOT}/react/react-assembler`,
      },
      {
        name: 'react-code-review',
        src: `${INSTRUCTIONS_ROOT}/react/react-code-review`,
      },
    ],
  },
  {
    id: 'flutter',
    label: 'Flutter',
    instructionSets: [
      {
        name: 'flutter-assembler',
        src: `${INSTRUCTIONS_ROOT}/flutter/flutter-assembler`,
      },
      {
        name: 'flutter-code-review',
        src: `${INSTRUCTIONS_ROOT}/flutter/flutter-code-review`,
      },
    ],
  },
]

// ── 共享内容源路径 ─────────────────────────────────────────
const SHARED_SOURCES = {
  architecture: `${INSTRUCTIONS_ROOT}/instruction-architecture`,
}

// ── 执行 ──────────────────────────────────────────────────
console.log(chalk.blue('\n📦 指令集套件打包\n'))

// 确保输出目录和临时目录
await fs.ensureDir(ARCHIVE_DIR)
await fs.remove(STAGING_DIR)
await fs.ensureDir(STAGING_DIR)

const kitZipPaths = []

for (const framework of FRAMEWORKS) {
  const kitName = `${framework.id}-kit`
  const kitDir = `${STAGING_DIR}/${kitName}`

  console.log(chalk.cyan(`\n━━━ ${framework.label} 套件 ━━━`))

  // ── 1. 拷贝指令设计架构准则（共享） ──
  const archDest = `${kitDir}/instruction-architecture`
  if (await fs.pathExists(SHARED_SOURCES.architecture)) {
    await fs.copy(SHARED_SOURCES.architecture, archDest)
    console.log(chalk.gray(`  + instruction-architecture/`))
  }

  // ── 2. 拷贝提示词（从框架目录） ──
  const promptsDest = `${kitDir}/prompts`
  await fs.ensureDir(promptsDest)
  const frameworkPromptsSrc = `${INSTRUCTIONS_ROOT}/${framework.id}`
  // 拷贝 prompts.md
  if (await fs.pathExists(`${frameworkPromptsSrc}/prompts.md`)) {
    await fs.copy(`${frameworkPromptsSrc}/prompts.md`, `${promptsDest}/prompts.md`)
    console.log(chalk.gray(`  + prompts/prompts.md`))
  }
  // 拷贝 constraints.md
  if (await fs.pathExists(`${frameworkPromptsSrc}/constraints.md`)) {
    await fs.copy(`${frameworkPromptsSrc}/constraints.md`, `${promptsDest}/constraints.md`)
    console.log(chalk.gray(`  + prompts/constraints.md`))
  }

  // ── 3. 拷贝该框架下所有指令集 ──
  for (const set of framework.instructionSets) {
    const setDest = `${kitDir}/${set.name}`
    if (await fs.pathExists(set.src)) {
      await fs.copy(set.src, setDest)
      console.log(chalk.gray(`  + ${set.name}/`))
    } else {
      console.log(chalk.yellow(`  ⚠️  跳过 ${set.name}：源目录不存在`))
    }
  }

  // ── 4. 打包框架套件 zip ──
  const zipOutput = `${ARCHIVE_DIR}/${kitName}.zip`
  await $`cd ${STAGING_DIR} && zip -r ${process.cwd()}/${zipOutput} ${kitName}/ -x "*.DS_Store"`
  kitZipPaths.push(zipOutput)

  console.log(chalk.green(`  ✅ ${kitName}.zip 打包完成`))
}

// ── 5. 打包三合一总套件 ──
console.log(chalk.cyan(`\n━━━ 总套件 ━━━`))
const masterZip = `${ARCHIVE_DIR}/instructions-kit.zip`
await $`cd ${STAGING_DIR} && zip -r ${process.cwd()}/${masterZip} . -x "*.DS_Store"`
console.log(chalk.green(`  ✅ instructions-kit.zip 打包完成`))

// ── 6. 清理临时目录 ──
await fs.remove(STAGING_DIR)

console.log(chalk.green('\n✅ 所有套件打包完成！'))
console.log(chalk.gray(`   输出目录: ${ARCHIVE_DIR}/`))
console.log(chalk.gray(`   文件列表:`))
for (const framework of FRAMEWORKS) {
  console.log(chalk.gray(`     ${framework.id}-kit.zip — ${framework.label} 全套套件`))
}
console.log(chalk.gray(`     instructions-kit.zip — 三合一总套件`))
console.log()
