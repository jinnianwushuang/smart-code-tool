# 前端包管理与 Monorepo 工具链速查手册

> **版本**: 1.0  
> **最后更新**: 2026-07-12  
> **适用对象**: 前端开发者、全栈工程师、团队技术负责人

---

## 📑 目录

- [一、包管理器对比](#一包管理器对比)
- [二、npm 速查](#二npm-速查)
- [三、pnpm 速查](#三pnpm-速查)
- [四、Yarn 速查](#四yarn-速查)
- [五、Monorepo 与 Workspace](#五monorepo-与-workspace)
- [六、Nx 构建系统](#六nx-构建系统)
- [七、Turborepo](#七turborepo)
- [八、版本与发布管理](#八版本与发布管理)
- [九、最佳实践](#九最佳实践)

---

## 一、包管理器对比

### 1.1 核心差异一览

| 特性              | npm                    | pnpm                        | Yarn (Classic)         | Yarn Berry (v4)              |
| ----------------- | ---------------------- | --------------------------- | ---------------------- | ---------------------------- |
| **安装速度**      | 较慢                   | 最快（硬链接复用）          | 较快                   | 快（PnP 模式最快）           |
| **磁盘占用**      | 大（每项目独立复制）   | 极小（全局 store + 硬链接） | 大                     | 极小（PnP 模式）             |
| **幽灵依赖**      | ✅ 存在（hoisting）    | ❌ 严格隔离                 | ✅ 存在                | ❌ PnP 严格隔离              |
| **Workspace**     | 原生支持               | 原生支持                    | 原生支持               | 原生支持                     |
| **锁文件**        | `package-lock.json`    | `pnpm-lock.yaml`            | `yarn.lock`            | `yarn.lock`                  |
| **Node 模块结构** | `node_modules/` 扁平化 | `.pnpm/` 内容寻址 store     | `node_modules/` 扁平化 | `.yarn/` PnP 或 node_modules |
| **全局缓存**      | `~/.npm`               | `~/.local/share/pnpm/store` | `~/.yarn/cache`        | `.yarn/cache`（项目内）      |

### 1.2 如何选择

```
个人小项目 / 学习项目        → npm（零配置，Node.js 内置）
团队协作 / 生产项目          → pnpm（速度快、磁盘小、严格依赖）
已有 Yarn 项目              → Yarn Berry（渐进升级）
Monorepo 多包项目           → pnpm workspace + Nx/Turborepo
```

---

## 二、npm 速查

### 2.1 基础命令

```bash
# ---- 项目初始化 ----
npm init                    # 交互式初始化 package.json
npm init -y                 # 快速初始化（使用默认值）

# ---- 安装依赖 ----
npm install                 # 安装 package.json 中所有依赖
npm install <pkg>           # 安装到 dependencies（生产依赖）
npm install -D <pkg>        # 安装到 devDependencies（开发依赖）
npm install -g <pkg>        # 全局安装
npm install <pkg>@1.2.3     # 安装指定版本
npm install <pkg>@^1.2.0    # 安装兼容版本（主版本不变）

# ---- 卸载 ----
npm uninstall <pkg>         # 卸载依赖
npm uninstall -g <pkg>      # 卸载全局依赖

# ---- 更新 ----
npm update                  # 更新所有依赖（遵循 semver 范围）
npm update <pkg>            # 更新指定依赖
npm outdated                # 检查哪些依赖有可用更新

# ---- 运行脚本 ----
npm run <script>            # 运行 package.json 中定义的脚本
npm start                   # 直接运行 start 脚本（不需要 run）
npm test                    # 直接运行 test 脚本

# ---- 信息查看 ----
npm list                    # 查看已安装的依赖树
npm list --depth=0          # 只看顶层依赖（不递归）
npm info <pkg>              # 查看包的详细信息（版本、依赖、描述等）
npm view <pkg> versions     # 查看包的所有可用版本
npm ls <pkg>                # 查看某个包在依赖树中的位置
```

### 2.2 版本语义（Semver）

```
MAJOR.MINOR.PATCH   例如 1.2.3

MAJOR  — 主版本号，不兼容的 API 变更
MINOR  — 次版本号，向后兼容的功能新增
PATCH  — 修订号，向后兼容的 Bug 修复

范围符号：
^1.2.3  →  >=1.2.3 <2.0.0   允许 MINOR 和 PATCH 更新（最常用）
~1.2.3  →  >=1.2.3 <1.3.0   只允许 PATCH 更新
1.2.3   →  =1.2.3            精确锁定版本
*       →  任意版本
>=1.0.0 <2.0.0  →  自定义范围
```

### 2.3 npm 配置

```bash
# ---- 常用配置 ----
npm config get registry                     # 查看当前 registry
npm config set registry https://registry.npmmirror.com  # 设置国内镜像
npm config delete registry                  # 恢复默认 registry

# ---- .npmrc 文件（项目级配置） ----
# .npmrc 示例
registry=https://registry.npmmirror.com
save-exact=true                # 安装时锁定精确版本（不加 ^ ~）
engine-strict=true             # 严格检查 Node.js 版本要求
auto-install-peers=true        # 自动安装 peer dependencies
```

### 2.4 npx 工具

```bash
npx <command>           # 运行本地或临时的可执行包
npx create-vite         # 运行 create-vite 脚手架
npx --yes <command>     # 自动确认安装（CI 环境使用）
npx -p <pkg> <cmd>      # 使用指定包运行命令
```

---

## 三、pnpm 速查

### 3.1 安装 pnpm

```bash
# 推荐方式（Node.js 内置 corepack）
corepack enable
corepack prepare pnpm@latest --activate

# 或通过 npm 安装
npm install -g pnpm

# 验证版本
pnpm --version
```

### 3.2 基础命令

```bash
# ---- 项目初始化 ----
pnpm init                  # 初始化 package.json

# ---- 安装依赖 ----
pnpm install               # 安装所有依赖（等价于 npm install）
pnpm add <pkg>             # 安装到 dependencies
pnpm add -D <pkg>          # 安装到 devDependencies
pnpm add -g <pkg>          # 全局安装
pnpm add <pkg>@1.2.3       # 安装指定版本

# ---- 卸载 ----
pnpm remove <pkg>          # 卸载依赖

# ---- 更新 ----
pnpm update                # 更新所有依赖
pnpm update <pkg>          # 更新指定依赖
pnpm outdated              # 检查过时依赖

# ---- 运行脚本 ----
pnpm run <script>          # 运行脚本
pnpm <script>              # 简写（pnpm 支持直接运行脚本名）
pnpm start                 # 运行 start
pnpm test                  # 运行 test

# ---- 信息查看 ----
pnpm list                  # 查看依赖树
pnpm list --depth=0        # 只看顶层
pnpm why <pkg>             # 查看为什么安装了某个包（依赖来源分析）
pnpm store path            # 查看全局 store 路径
pnpm store prune           # 清理未使用的 store 缓存（释放磁盘）
```

### 3.3 pnpm 核心原理

```
┌─────────────────────────────────────────────────┐
│              全局 Store（~/.local/share/pnpm/store）  │
│  内容寻址存储：每个文件以 hash 命名，只存一份           │
└─────────────────────────────────────────────────┘
            │              │              │
            │ 硬链接        │ 硬链接        │ 硬链接
            ▼              ▼              ▼
      project-a/       project-b/       project-c/
      node_modules/    node_modules/    node_modules/
      .pnpm/           .pnpm/           .pnpm/

优势：
  - 磁盘只存一份文件，多项目共享
  - 安装速度极快（只需创建硬链接）
  - 严格依赖隔离，无幽灵依赖
```

### 3.4 pnpm 配置（.npmrc）

```ini
# .npmrc 示例
registry=https://registry.npmmirror.com
save-exact=true

# pnpm 专属配置
shamefully-hoist=true      # 兼容模式：将依赖提升到 node_modules 根目录（不推荐）
auto-install-peers=true    # 自动安装 peer dependencies
strict-peer-dependencies=false  # peer deps 缺失时不报错
node-linker=hoisted        # 使用提升模式（兼容老旧项目）
# node-linker=pnpm         # 默认，严格隔离模式

# 覆盖依赖版本（类似 npm overrides）
overrides:
  lodash@<4.17.21=4.17.21  # 强制所有 lodash 升级到安全版本
```

---

## 四、Yarn 速查

### 4.1 Yarn Berry（v4）安装

```bash
# 启用 corepack
corepack enable

# 初始化 Yarn Berry
yarn set version berry

# 验证
yarn --version
```

### 4.2 基础命令

```bash
yarn                       # 安装所有依赖
yarn add <pkg>             # 添加依赖
yarn add -D <pkg>          # 添加开发依赖
yarn remove <pkg>          # 移除依赖
yarn run <script>          # 运行脚本
yarn <script>              # 简写运行脚本
yarn why <pkg>             # 查看依赖来源
yarn up <pkg>              # 升级依赖（类似 npm update）
yarn dlx <pkg>             # 临时运行（类似 npx）
```

### 4.3 Yarn PnP（Plug'n'Play）

```bash
# Yarn Berry 默认使用 PnP 模式，不生成 node_modules
# 而是生成 .pnp.cjs 文件，直接解析包路径

# 安装（不生成 node_modules）
yarn install

# 如果某些工具不兼容 PnP，可以切换回 node_modules 模式
# .yarnrc.yml
nodeLinker: node-modules
```

---

## 五、Monorepo 与 Workspace

### 5.1 什么是 Monorepo

```
Monorepo = 单一代码仓库，管理多个相关项目/包

monorepo/
├── packages/
│   ├── ui/            # 共享 UI 组件库
│   ├── utils/         # 工具函数库
│   ├── config/        # 共享配置（ESLint、TS 等）
│   └── types/         # 共享类型定义
├── apps/
│   ├── web/           # Web 应用
│   ├── admin/         # 管理后台
│   └── mobile/        # 移动端
├── package.json
├── pnpm-workspace.yaml  # pnpm workspace 配置
└── nx.json              # Nx 配置（可选）
```

### 5.2 pnpm Workspace 配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*' # packages 目录下所有子包
  - 'apps/*' # apps 目录下所有子应用
  - 'tools/*' # tools 目录下所有工具
  - '!**/test/**' # 排除 test 目录
```

### 5.3 Workspace 命令

```bash
# ---- 在指定包中执行命令 ----
pnpm --filter <pkg> <cmd>          # 在某个子包中运行命令
pnpm --filter ui add lodash        # 在 ui 包中添加 lodash
pnpm --filter web run dev          # 在 web 应用中运行 dev

# ---- 批量执行 ----
pnpm -r run build                  # 在所有子包中运行 build（递归）
pnpm -r --filter "./packages/*" run test  # 只在 packages 下运行 test

# ---- 依赖关系过滤 ----
pnpm --filter "...web" run build   # 构建 web 及其所有依赖（上游）
pnpm --filter "web..." run build   # 构建 web 及其所有被依赖者（下游）
pnpm --filter "^web" run test      # 只在 web 的直接依赖中运行 test

# ---- 通配符过滤 ----
pnpm --filter "*-ui" run build     # 匹配所有以 -ui 结尾的包
pnpm --filter "@scope/*" run test  # 匹配某个 scope 下所有包
```

### 5.4 包之间的引用

```json
// packages/ui/package.json
{
  "name": "@myorg/ui",
  "version": "1.0.0"
}

// apps/web/package.json
{
  "dependencies": {
    "@myorg/ui": "workspace:*",         // 引用 workspace 中的包（任意版本）
    "@myorg/utils": "workspace:^1.0.0"  // 引用并指定版本范围
  }
}
```

---

## 六、Nx 构建系统

### 6.1 什么是 Nx

Nx 是一个智能、快速、可扩展的构建系统，专为 Monorepo 设计，提供：

- **任务缓存**：相同输入不重复执行，极大加速 CI
- **依赖图分析**：只构建受影响的包
- **并行执行**：智能并行运行任务
- **代码生成器**：快速生成组件、库、应用模板

### 6.2 安装 Nx

```bash
# ---- 新项目（使用 Nx 脚手架） ----
npx create-nx-workspace my-monorepo

# ---- 已有项目添加 Nx ----
pnpm add -Dw nx
npx nx init            # 初始化 nx.json

# ---- 安装常用插件 ----
pnpm add -Dw @nx/js          # JavaScript/TypeScript 支持
pnpm add -Dw @nx/vite        # Vite 构建支持
pnpm add -Dw @nx/jest        # Jest 测试支持
pnpm add -Dw @nx/eslint      # ESLint 集成
pnpm add -Dw @nx/react       # React 支持
pnpm add -Dw @nx/vue         # Vue 支持
pnpm add -Dw @nx/next        # Next.js 支持
```

### 6.3 Nx 核心命令

```bash
# ---- 运行任务 ----
nx run <project>:<target>       # 运行指定项目的指定任务
nx build web                    # 构建 web 项目
nx test ui                      # 测试 ui 项目
nx lint utils                   # lint utils 项目
nx serve web                    # 启动 web 开发服务器

# ---- 批量运行 ----
nx run-many -t build            # 运行所有项目的 build
nx run-many -t test -p ui utils  # 只在 ui 和 utils 运行 test
nx run-many -t lint --all       # 所有项目运行 lint

# ---- 受影响分析（CI 优化核心） ----
nx affected -t build            # 只构建受影响的包（基于 git diff）
nx affected -t test             # 只测试受影响的包
nx affected -t lint             # 只 lint 受影响的包
nx affected -t build --base=origin/main --head=HEAD  # 指定比较范围

# ---- 可视化 ----
nx graph                        # 打开依赖图可视化界面（浏览器）
nx graph --file=graph.json      # 导出依赖图为 JSON

# ---- 代码生成 ----
nx g @nx/js:lib my-lib          # 生成一个 JS/TS 库
nx g @nx/react:app my-app       # 生成一个 React 应用
nx g @nx/vue:lib my-vue-lib    # 生成一个 Vue 库
```

### 6.4 nx.json 配置

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",

  "namedInputs": {
    "default": ["{projectRoot}/**/*"],
    "production": ["default", "!{projectRoot}/**/*.spec.ts", "!{projectRoot}/**/*.test.ts"]
  },

  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true,
      "outputs": ["{projectRoot}/dist"]
    },
    "test": {
      "inputs": ["default", "^production"],
      "cache": true
    },
    "lint": {
      "cache": true
    }
  },

  "nxCloudAccessToken": "YOUR_TOKEN_HERE"
}
```

**关键配置说明：**

- `dependsOn: ["^build"]` — 构建当前包之前，先构建它的依赖包
- `cache: true` — 开启任务缓存，输入不变则跳过执行
- `outputs` — 声明任务产出目录，用于缓存恢复
- `inputs` — 声明任务输入文件，用于缓存 key 计算

### 6.5 Nx Cloud（远程缓存）

```bash
# 连接 Nx Cloud（团队共享缓存）
nx connect

# 查看缓存状态
nx cache

# CI 中使用
# 在 CI 环境中设置 NX_CLOUD_ACCESS_TOKEN 环境变量即可自动启用远程缓存
```

### 6.6 Nx 项目配置（project.json）

```json
{
  "name": "web",
  "sourceRoot": "apps/web/src",
  "targets": {
    "build": {
      "executor": "@nx/vite:build",
      "options": {
        "outputPath": "apps/web/dist"
      }
    },
    "serve": {
      "executor": "@nx/vite:dev-server",
      "options": {
        "buildTarget": "web:build"
      }
    },
    "test": {
      "executor": "@nx/vite:test"
    }
  }
}
```

---

## 七、Turborepo

### 7.1 什么是 Turborepo

Turborepo 是一个高性能的 Monorepo 构建系统，特点：

- 零配置增量构建
- 智能任务缓存（本地 + 远程）
- 并行任务执行
- 与 pnpm/yarn/npm workspace 无缝集成

### 7.2 安装

```bash
pnpm add -Dw turbo

# 初始化（生成 turbo.json）
npx turbo init
```

### 7.3 turbo.json 配置

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "package.json"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**", "tests/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### 7.4 Turborepo 命令

```bash
turbo run build            # 构建所有项目（带缓存）
turbo run test             # 测试所有项目
turbo run lint             # lint 所有项目
turbo run build --filter=web         # 只构建 web 及其依赖
turbo run build --filter=web...      # 构建 web 和所有依赖它的包
turbo run build --filter=...web      # 构建 web 的上游依赖
turbo run build --force              # 强制重新构建（忽略缓存）
turbo run dev                        # 并行启动所有 dev 服务器
turbo run build --dry-run            # 预览执行计划（不实际执行）
```

### 7.5 Nx vs Turborepo 对比

| 特性             | Nx                                  | Turborepo                     |
| ---------------- | ----------------------------------- | ----------------------------- |
| **定位**         | 全功能构建系统 + 代码生成           | 轻量构建编排器                |
| **配置复杂度**   | 较高（需要 nx.json + project.json） | 低（一个 turbo.json）         |
| **任务缓存**     | ✅ 本地 + Nx Cloud                  | ✅ 本地 + Vercel Remote Cache |
| **代码生成**     | ✅ 丰富的 generator                 | ❌ 无                         |
| **依赖图可视化** | ✅ `nx graph`                       | ❌ 无内置                     |
| **受影响分析**   | ✅ `nx affected`（精确）            | ✅ `--filter`（基于文件变化） |
| **适合场景**     | 大型团队、复杂 Monorepo             | 中小型 Monorepo、快速上手     |

---

## 八、版本与发布管理

### 8.1 Changesets

Changesets 是目前最流行的 Monorepo 版本管理工具，与 pnpm workspace 高度集成。

```bash
# 安装
pnpm add -Dw @changesets/cli

# 初始化
npx changeset init

# 创建变更日志（交互式）
pnpm changeset
# 会询问：哪些包变更？变更类型（major/minor/patch）？变更描述？

# 根据 changeset 自动升版
pnpm changeset version

# 发布
pnpm changeset publish
```

### 8.2 Changesets 工作流

```
1. 开发者修改代码
2. 运行 pnpm changeset → 生成 .changeset/xxx.md 文件
3. 提交代码和 changeset 文件到 Git
4. CI 中运行 pnpm changeset version → 自动升版并生成 CHANGELOG
5. 运行 pnpm changeset publish → 发布到 npm
6. 自动创建 Git Tag 和 GitHub Release
```

### 8.3 npm 发布

```bash
# 发布到 npm
npm publish               # 公开发布
npm publish --access public  # 作用域包需要指定 --access public

# 发布 dry-run（预览，不实际发布）
npm publish --dry-run

# 发布 tag
npm publish --tag beta     # 发布为 beta 标签（不影响 latest）

# 私有包（.npmrc）
# @myorg:registry=https://npm.pkg.github.com
# //npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

---

## 九、最佳实践

### 9.1 Monorepo 推荐结构

```
my-monorepo/
├── .changeset/               # Changesets 变更记录
│   └── config.json
├── .github/
│   └── workflows/
│       └── ci.yml            # CI 配置
├── packages/                 # 共享库
│   ├── ui/                   # UI 组件库
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── utils/                # 工具函数
│   └── config/               # 共享配置（ESLint、TS、Prettier）
│       ├── eslint.js
│       ├── tsconfig.base.json
│       └── prettier.js
├── apps/                     # 应用
│   ├── web/
│   ├── admin/
│   └── docs/
├── package.json
├── pnpm-workspace.yaml
├── nx.json                   # 或 turbo.json
└── tsconfig.base.json        # 根 TS 配置
```

### 9.2 CI 优化策略

```yaml
# .github/workflows/ci.yml 示例
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 需要完整 git 历史用于 affected 分析

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      # Nx 方式：只构建受影响的包
      - run: npx nx affected -t build lint test

      # 或 Turborepo 方式
      # - run: npx turbo run build lint test --filter=...[origin/main]
```

### 9.3 常用技巧

```bash
# ---- 清理缓存 ----
pnpm store prune             # 清理 pnpm store 未使用的文件
nx reset                     # 重置 Nx 缓存和守护进程
turbo daemon clean           # 清理 Turborepo 守护进程

# ---- 调试依赖问题 ----
pnpm why <pkg>               # 查看包被谁依赖
pnpm list --depth=Infinity   # 查看完整依赖树
npm explain <pkg>            # npm 版本的依赖解释

# ---- 统一版本 ----
# 在根 package.json 中使用 overrides/resolutions 强制统一依赖版本
# package.json (npm):
# "overrides": { "lodash": "4.17.21" }
# package.json (pnpm):
# "pnpm": { "overrides": { "lodash": "4.17.21" } }
# package.json (yarn):
# "resolutions": { "lodash": "4.17.21" }
```

---

## 附录

### A. 资源链接

- **pnpm**: https://pnpm.io/
- **Nx**: https://nx.dev/
- **Turborepo**: https://turbo.build/
- **Changesets**: https://github.com/changesets/changesets
- **npm**: https://docs.npmjs.com/
- **Yarn**: https://yarnpkg.com/

### B. 学习路线

```
npm 基础 → pnpm 使用 → Workspace 概念 → Monorepo 实践 → Nx/Turborepo → CI/CD 优化

1. 理解 npm 基础命令和 package.json
2. 学习 pnpm 优势和工作原理
3. 理解 Monorepo 和 Workspace 概念
4. 搭建 pnpm workspace 项目
5. 引入 Nx 或 Turborepo 管理构建
6. 配置 Changesets 管理版本发布
7. CI/CD 流水线优化（缓存 + 受影响分析）
```

---

**祝您包管理与 Monorepo 开发愉快！** 📦
