# 现代前端脚手架项目根目录常见配置文件解析

> **版本**: 1.0  
> **最后更新**: 2026-07-25  
> **适用对象**: 前端工程师、全栈开发者、需要理解项目工程化配置的团队成员

---

## 📑 目录

- [一、典型项目根目录全景](#一典型项目根目录全景)
- [二、package.json — 项目身份证](#二packagejson--项目身份证)
- [三、构建工具配置](#三构建工具配置)
- [四、TypeScript 配置](#四typescript-配置)
- [五、代码质量工具配置](#五代码质量工具配置)
- [六、环境变量文件](#六环境变量文件)
- [七、包管理器配置](#七包管理器配置)
- [八、Git 相关配置](#八git-相关配置)
- [九、编辑器与团队规范配置](#九编辑器与团队规范配置)
- [十、样式工具链配置](#十样式工具链配置)
- [十一、入口文件与静态资源](#十一入口文件与静态资源)
- [十二、配置文件速查表](#十二配置文件速查表)

---

## 一、典型项目根目录全景

### 1.1 Vite + Vue 3 + TypeScript 项目

```
my-project/
├── public/                    # 静态资源 (不经过构建, 直接复制到 dist)
│   └── favicon.ico
├── src/                       # 源码目录
│   ├── assets/                # 需要构建处理的资源
│   ├── components/
│   ├── App.vue
│   └── main.ts
├── .editorconfig              # 编辑器统一配置
├── .env                       # 通用环境变量
├── .env.development           # 开发环境变量
├── .env.production            # 生产环境变量
├── .gitignore                 # Git 忽略规则
├── .npmrc                     # npm/pnpm 行为配置
├── .prettierrc.json           # Prettier 格式化规则
├── eslint.config.js           # ESLint 代码检查规则 (Flat Config)
├── index.html                 # 应用入口 HTML (Vite 的构建入口)
├── package.json               # 项目元信息 + 依赖 + 脚本
├── pnpm-lock.yaml             # pnpm 依赖锁定文件
├── pnpm-workspace.yaml        # pnpm Monorepo 工作区定义
├── tsconfig.json              # TypeScript 主配置
├── tsconfig.app.json          # TS 应用代码配置 (继承主配置)
├── tsconfig.node.json         # TS Node 端配置 (vite.config.ts 等)
└── vite.config.ts             # Vite 构建配置
```

### 1.2 配置文件分类思维

```
按职责分类:
┌─────────────────────────────────────────────────┐
│ 构建相关: vite.config.ts / webpack.config.js     │
│ 类型相关: tsconfig*.json                         │
│ 质量相关: eslint.config.js / .prettierrc.json    │
│ 环境相关: .env / .env.* / .npmrc                 │
│ 版本控制: .gitignore / .gitattributes            │
│ 团队协作: .editorconfig / .nvmrc / .node-version │
│ 依赖管理: package.json / pnpm-workspace.yaml     │
│ 入口文件: index.html                             │
└─────────────────────────────────────────────────┘
```

---

## 二、package.json — 项目身份证

### 2.1 核心字段解析

```jsonc
{
  // ─── 基本信息 ───
  "name": "my-project",           // 包名 (发布到 npm 时的唯一标识)
  "version": "0.1.0",             // 语义化版本: major.minor.patch
  "private": true,                // true = 禁止意外发布到 npm (应用项目必加)
  "type": "module",               // 模块系统: "module" = ESM, 缺省 = CJS
                                   // 决定 .js 文件按 import/export 还是 require 解析

  // ─── 脚本命令 ───
  "scripts": {
    "dev": "vite",                // 启动开发服务器
    "build": "vite build",        // 生产构建
    "preview": "vite preview",    // 本地预览构建产物
    "lint": "eslint .",           // 代码检查
    "format": "prettier --write src/"  // 代码格式化
  },

  // ─── 依赖声明 ───
  "dependencies": {
    // 运行时依赖 — 生产环境需要
    "vue": "^3.5.0",              // ^ = 允许 minor+patch 升级 (3.x.x)
    "pinia": "^2.2.0"
  },
  "devDependencies": {
    // 开发时依赖 — 构建/检查/测试工具
    "vite": "^6.0.0",
    "typescript": "~5.6.0",       // ~ = 仅允许 patch 升级 (5.6.x)
    "eslint": "^9.0.0"
  }
}
```

### 2.2 版本号语义 (SemVer)

```
格式: major.minor.patch  例: 3.5.13
      │       │     │
      │       │     └── 修复 bug, 完全兼容
      │       └──────── 新增功能, 向后兼容
      └──────────────── 破坏性变更, 不兼容

声明前缀:
  "^3.5.0"  → >=3.5.0 <4.0.0   (最常见, 跟随 minor)
  "~3.5.0"  → >=3.5.0 <3.6.0   (保守, 仅跟随 patch)
  "3.5.0"   → 精确锁定
  "*"       → 任意版本 (危险, 勿用)

关键点: package.json 声明的是"范围", lock 文件锁定的才是"精确版本"
```

### 2.3 engines 与包管理器约束

```jsonc
{
  // 限定运行环境版本 (配合 CI 检查)
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  },

  // 强制使用指定包管理器 (pnpm 特性)
  "packageManager": "pnpm@9.15.0",
  // 配合 corepack 使用: 自动下载并使用指定版本的 pnpm
  // 防止团队成员混用 npm/yarn/pnpm 导致 lock 文件冲突
}
```

---

## 三、构建工具配置

### 3.1 vite.config.ts

```typescript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// defineConfig: 提供类型提示 + 支持函数/异步形式
export default defineConfig({
  // ─── 插件 ───
  plugins: [vue()],

  // ─── 路径别名 ───
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // '@' → src 目录, 需与 tsconfig paths 保持同步
    },
  },

  // ─── 开发服务器 ───
  server: {
    port: 5173,               // 端口号
    open: true,               // 自动打开浏览器
    proxy: {
      // 开发环境 API 代理 (解决跨域)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // ─── 构建选项 ───
  build: {
    outDir: 'dist',           // 输出目录
    sourcemap: false,         // 生产环境关闭 sourcemap
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['vue', 'pinia'] },  // 手动分包
      },
    },
  },

  // ─── 部署基础路径 ───
  base: '/',                  // 部署在子路径时改为 '/sub-path/'
})
```

### 3.2 配置加载机制

```
vite 命令执行时的配置解析优先级:

1. CLI 参数 (--port 3000)          ← 最高优先级
2. vite.config.ts                  ← 项目配置
3. Vite 内置默认值                  ← 最低优先级

配置文件查找顺序:
vite.config.js → vite.config.mjs → vite.config.ts → vite.config.mts

注意: vite.config.ts 由 esbuild 转译后在 Node.js 中执行
     此时 import.meta.env 尚未注入, 不可使用!
     需要环境变量时请用 process.env 或 loadEnv()
```

### 3.3 其他构建工具配置 (对照)

```
webpack.config.js    — Webpack 项目 (CRA / 自定义脚手架)
next.config.mjs      — Next.js 项目
nuxt.config.ts       — Nuxt 项目
rollup.config.js     — 库/组件打包项目
esbuild.config.mjs   — 纯 esbuild 构建脚本
```

---

## 四、TypeScript 配置

### 4.1 tsconfig.json 项目引用模式

```jsonc
// tsconfig.json — 根配置 (仅做引用分发, 不含编译选项)
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },    // 应用源码
    { "path": "./tsconfig.node.json" }    // Node 端文件 (构建配置等)
  ]
}
```

```jsonc
// tsconfig.app.json — 应用代码配置
{
  "compilerOptions": {
    // ─── 模块系统 ───
    "module": "ESNext",              // 输出模块格式 (Vite 下保持 ESNext)
    "moduleResolution": "bundler",   // 模块解析策略 (适配打包器)
    "verbatimModuleSyntax": true,    // 强制 type-only import 写法

    // ─── 编译目标 ───
    "target": "ES2020",              // 输出的 JS 语法版本
    "lib": ["ES2020", "DOM", "DOM.Iterable"],  // 可用的类型库

    // ─── 严格性 (推荐全开) ───
    "strict": true,                  // 开启所有严格检查
    "noUnusedLocals": true,          // 禁止未使用的变量
    "noUnusedParameters": true,      // 禁止未使用的参数
    "noFallthroughCasesInSwitch": true,

    // ─── 路径别名 (必须与 vite.config 的 alias 一致) ───
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    // ─── 其他 ───
    "skipLibCheck": true,            // 跳过 .d.ts 检查 (加速)
    "isolatedModules": true,         // 单文件转译兼容 (Vite/esbuild 要求)
    "jsx": "preserve"                // React 项目: "react-jsx"
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

```jsonc
// tsconfig.node.json — Node 端配置 (vite.config.ts 等)
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["node"],               // Node.js 全局类型
    "strict": true,
    "composite": true                // 项目引用要求
  },
  "include": ["vite.config.ts"]
}
```

### 4.2 为什么需要 isolatedModules

```
Vite 使用 esbuild 逐文件转译 TS (不做全量类型检查):

// ❌ 以下写法在单文件转译时无法判断 Foo 是类型还是值:
import { Foo } from './types'
export { Foo }

// ✅ verbatimModuleSyntax 强制的正确写法:
import type { Foo } from './types'
export type { Foo }

// 原理: esbuild 一次只看一个文件, 无法跨文件解析语义
// 如果不标记 type, 转译后可能保留无意义的运行时 import
```

---

## 五、代码质量工具配置

### 5.1 ESLint (Flat Config — eslint.config.js)

```javascript
// eslint.config.js — ESLint 9+ 的 Flat Config 格式
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  // 全局忽略
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  // 规则集组合
  js.configs.recommended,          // ESLint 官方推荐规则
  ...pluginVue.configs['flat/essential'],  // Vue 必要规则
  ...vueTsEslintConfig(),          // TS + Vue 整合规则

  // 自定义规则覆盖
  {
    rules: {
      'vue/multi-word-component-names': 'off',  // 允许单词组件名
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  skipFormatting,  // 格式化交给 Prettier, ESLint 不管格式
]

// Flat Config vs 旧版 (.eslintrc):
// - 不再需要 extends/plugins 字符串, 直接导入 JS 对象
// - 配置即代码, 可调试、可组合
// - ESLint 9 默认格式, .eslintrc 已废弃
```

### 5.2 Prettier (.prettierrc.json)

```jsonc
// .prettierrc.json — 纯格式化工具 (只管样式, 不管逻辑)
{
  "semi": false,              // 不加分号
  "singleQuote": true,        // 单引号
  "printWidth": 100,          // 每行最大宽度 (超出自动换行)
  "tabWidth": 2,              // 缩进宽度
  "trailingComma": "all",     // 尾逗号: all = 函数参数也加
  "arrowParens": "always",    // 箭头函数参数始终加括号
  "endOfLine": "lf",          // 换行符统一 LF (跨平台)
  "bracketSpacing": true      // 对象花括号内加空格
}
```

```
// .prettierignore — Prettier 忽略文件
dist
pnpm-lock.yaml
*.md
```

### 5.3 ESLint 与 Prettier 的分工

```
┌─────────────────────────────────────────────────────┐
│  ESLint: 代码质量 (逻辑问题)                          │
│  - 未使用的变量、隐式类型转换、可能的 bug              │
│  - 不处理: 缩进、引号、分号等纯格式问题               │
├─────────────────────────────────────────────────────┤
│  Prettier: 代码格式 (样式统一)                        │
│  - 缩进、换行、引号、分号、空格                       │
│  - 不处理: 任何逻辑问题                              │
├─────────────────────────────────────────────────────┤
│  协作方式:                                           │
│  - @vue/eslint-config-prettier/skip-formatting      │
│    → 关闭 ESLint 中与 Prettier 冲突的格式规则         │
│  - 保存时: Prettier 格式化 → ESLint 检查             │
└─────────────────────────────────────────────────────┘
```

---

## 六、环境变量文件

### 6.1 .env 文件族

```bash
# .env — 所有模式都会加载 (通用配置)
VITE_APP_TITLE=My App

# .env.development — 仅 vite dev 时加载
VITE_API_BASE=http://localhost:3000/api

# .env.production — 仅 vite build 时加载
VITE_API_BASE=https://api.example.com

# .env.local — 所有模式加载, 但被 git 忽略 (个人/敏感配置)
VITE_DEBUG_TOKEN=xxx

# .env.production.local — 生产模式 + git 忽略
```

### 6.2 加载优先级与安全规则

```
优先级 (高 → 低):
.env.[mode].local > .env.[mode] > .env.local > .env

安全规则:
┌──────────────────────────────────────────────────┐
│ 只有 VITE_ 前缀的变量才会暴露给客户端代码            │
│                                                  │
│ VITE_API_BASE=xxx   → import.meta.env.VITE_API_BASE ✅ │
│ DB_PASSWORD=xxx     → 客户端不可见 (仅构建进程可用)  ❌ │
│                                                  │
│ 原因: 前端代码最终运行在用户浏览器, 一切皆可见       │
│ 敏感信息绝不应该出现在前端环境变量中                 │
└──────────────────────────────────────────────────┘

注入原理:
- Vite 在构建时将 import.meta.env.VITE_XXX 静态替换为字面量
- 不是运行时读取, 是编译时内联 (支持 dead code elimination)
```

---

## 七、包管理器配置

### 7.1 .npmrc

```ini
# .npmrc — npm/pnpm 行为配置 (项目级)

# 镜像源 (国内加速)
registry=https://registry.npmmirror.com

# pnpm 特有配置
shamefully-hoist=true        # 将依赖提升到 node_modules 根目录
                              # (兼容需要幽灵依赖的工具, 如某些 PostCSS 插件)
strict-peer-dependencies=false  # peer 依赖冲突不报错
auto-install-peers=true      # 自动安装 peer 依赖

# 私有仓库 (作用域包)
@my-company:registry=https://npm.my-company.com
//npm.my-company.com/:_authToken=${NPM_TOKEN}
```

### 7.2 pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml — Monorepo 工作区定义
packages:
  - 'packages/*'        # packages/ 下的每个子目录都是独立包
  - 'apps/*'            # 应用目录
  - '!**/test/**'       # 排除测试目录

# 作用:
# 1. pnpm install 时统一安装所有子包依赖
# 2. 子包之间可以用 workspace:* 协议互相引用
# 3. pnpm -r run build 可递归执行所有子包命令
```

### 7.3 Lock 文件对比

```
npm  → package-lock.json
pnpm → pnpm-lock.yaml      (推荐: 结构清晰, 安装快, 磁盘省)
yarn → yarn.lock

Lock 文件的作用:
- 精确记录每个依赖树的实际版本 + 完整性 hash
- 保证团队所有人/CI 安装出完全一致的 node_modules
- 必须提交到 Git! (应用项目和库项目都是)

幽灵依赖问题 (npm/yarn 的扁平化):
node_modules/
├── express/
└── body-parser/    ← express 的依赖, 但你可以直接 import 它!

pnpm 的符号链接方案杜绝了这个问题:
node_modules/
├── .pnpm/           ← 实际存储 (硬链接到全局 store)
└── express → .pnpm/express@4.18.0/node_modules/express
```

---

## 八、Git 相关配置

### 8.1 .gitignore

```text
# .gitignore — 典型前端项目配置

# 依赖目录 (体积大, 可完全由 lock 文件还原)
node_modules

# 构建产物 (可由源码重新生成)
dist
dist-ssr

# 环境变量本地覆盖 (可能含敏感信息)
*.local

# 编辑器与系统文件
.DS_Store
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# 日志
npm-debug.log*
pnpm-debug.log*

# 测试覆盖率
coverage

# Vite 缓存
*.tsbuildinfo
```

### 8.2 提交规范工具 (可选)

```
.husky/               — Git Hooks 管理 (提交前自动 lint/format)
commitlint.config.js  — 提交信息格式检查 (feat:/fix:/docs: 前缀)
.lintstagedrc.json    — 仅检查暂存区文件 (性能优化)

典型工作流:
git commit → husky pre-commit hook → lint-staged
           → 对暂存文件执行 ESLint + Prettier
           → 检查失败则阻止提交
```

---

## 九、编辑器与团队规范配置

### 9.1 .editorconfig

```ini
# .editorconfig — 跨编辑器的基础格式统一
root = true

[*]
charset = utf-8            # 文件编码
indent_style = space       # 缩进: 空格
indent_size = 2            # 缩进宽度
end_of_line = lf           # 换行符: LF (Unix 风格)
insert_final_newline = true # 文件末尾保留空行
trim_trailing_whitespace = true  # 去除行尾空格

[*.md]
trim_trailing_whitespace = false  # Markdown 行尾空格有语义
```

### 9.2 .vscode 目录 (团队共享时)

```jsonc
// .vscode/extensions.json — 推荐插件 (打开项目时提示安装)
{
  "recommendations": [
    "Vue.volar",              // Vue 官方语言服务
    "dbaeumer.vscode-eslint", // ESLint 集成
    "esbenp.prettier-vscode"  // Prettier 集成
  ]
}

// .vscode/settings.json — 项目级编辑器设置
{
  "editor.formatOnSave": true,          // 保存时格式化
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"  // 保存时 ESLint 自动修复
  }
}
```

### 9.3 Node 版本锁定

```
.nvmrc          → 20.11.0     (nvm 用户: nvm use 自动切换)
.node-version   → 20.11.0     (fnm/nodenv/volta 通用)

// package.json 中的 volta 配置 (自动管理, 无需手动切换):
{
  "volta": {
    "node": "20.11.0",
    "pnpm": "9.15.0"
  }
}
```

---

## 十、样式工具链配置

### 10.1 PostCSS (postcss.config.js)

```javascript
// postcss.config.js — CSS 后处理器管道
export default {
  plugins: {
    autoprefixer: {},        // 自动添加浏览器前缀 (-webkit- 等)
    // 'postcss-px-to-viewport': { viewportWidth: 375 }  // 移动端适配
  },
}
// Vite 内置 PostCSS 支持, 有此文件即自动生效
// Tailwind CSS 也通过 PostCSS 插件接入
```

### 10.2 Tailwind CSS (tailwind.config.js)

```javascript
// tailwind.config.js — Tailwind 原子化 CSS 配置
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // 扫描范围: 从这些文件中提取使用到的 class
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: { primary: '#3b82f6' },   // 扩展主题色
      spacing: { '18': '4.5rem' },
    },
  },
  plugins: [],
}
// content 配置直接影响产物体积 (未使用的 class 会被 Tree Shake)
```

### 10.3 Sass 配置 (Vite 内置)

```typescript
// Vite 中 Sass 无需独立配置文件, 在 vite.config 中配置:
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables" as *;`,
        // 每个 SCSS 文件自动注入全局变量 (无需手动 @use)
      },
    },
  },
})
```

---

## 十一、入口文件与静态资源

### 11.1 index.html — Vite 的构建入口

```html
<!-- index.html — 位于项目根目录 (Vite 特色, 非 public/ 内) -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- type="module": Vite 以此为起点解析整个模块图 -->
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>

<!-- 为什么在根目录而不是 public/? -->
<!-- 因为它是构建入口: Vite 会处理其中的资源引用 -->
<!-- - 注入构建后的 JS/CSS 标签 -->
<!-- - 处理 <link>/<img> 引用的资源 -->
<!-- public/ 内的文件则完全不经过处理 -->
```

### 11.2 public/ vs src/assets/

```
┌──────────────────┬─────────────────────────────┐
│ public/          │ src/assets/                  │
├──────────────────┼─────────────────────────────┤
│ 不经过构建处理    │ 经过构建管线处理              │
│ 原样复制到 dist  │ hash 文件名 / 压缩 / 内联     │
│ 用绝对路径引用    │ 用 import 引入               │
│ /logo.png        │ import logo from './logo.png'│
├──────────────────┼─────────────────────────────┤
│ 适合:            │ 适合:                        │
│ - favicon        │ - 组件内图片                  │
│ - robots.txt     │ - 需要压缩优化的资源           │
│ - 第三方不变资源  │ - CSS 中引用的背景图           │
│ - 运行时动态加载  │ - 小图自动转 base64           │
└──────────────────┴─────────────────────────────┘
```

---

## 十二、配置文件速查表

| 文件 | 工具 | 职责 | 是否提交 Git |
| ---- | ---- | ---- | ------------ |
| `package.json` | npm/pnpm | 依赖、脚本、项目元信息 | ✅ |
| `pnpm-lock.yaml` | pnpm | 依赖版本精确锁定 | ✅ |
| `pnpm-workspace.yaml` | pnpm | Monorepo 工作区定义 | ✅ |
| `.npmrc` | npm/pnpm | 镜像源、安装行为 | ✅ |
| `vite.config.ts` | Vite | 构建、开发服务器、插件 | ✅ |
| `tsconfig*.json` | TypeScript | 类型检查与编译选项 | ✅ |
| `eslint.config.js` | ESLint | 代码质量规则 | ✅ |
| `.prettierrc.json` | Prettier | 代码格式化规则 | ✅ |
| `.editorconfig` | 编辑器 | 跨编辑器格式统一 | ✅ |
| `.gitignore` | Git | 忽略规则 | ✅ |
| `.env` | Vite | 通用环境变量 | ✅ |
| `.env.development` | Vite | 开发环境变量 | ✅ |
| `.env.production` | Vite | 生产环境变量 | ✅ |
| `.env.local` | Vite | 本地/敏感环境变量 | ❌ |
| `.nvmrc` | nvm | Node 版本锁定 | ✅ |
| `index.html` | Vite | 应用入口 (构建起点) | ✅ |
| `postcss.config.js` | PostCSS | CSS 后处理管道 | ✅ |
| `tailwind.config.js` | Tailwind | 原子化 CSS 主题配置 | ✅ |
| `node_modules/` | - | 依赖实际文件 | ❌ |
| `dist/` | - | 构建产物 | ❌ |
