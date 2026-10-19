---
title: 'npm/pnpm 包管理入门 [P4-P5]'
level: 'junior'
tags: ['npm', 'pnpm', '包管理', 'package.json', 'scripts']
difficulty: 'medium'
target: 'P4-P5 初级工程师'
---

# npm/pnpm 包管理入门 [P4-P5]

> npm 和 pnpm 是 JavaScript 包管理工具。管理项目依赖、运行脚本、发布包都离不开它们。pnpm 更快、更节省磁盘空间。

## 核心概念（What）

### 包管理器是什么

```
包管理器 = 管理项目依赖的工具

功能：
├── 安装第三方包（如 lodash、vue）
├── 管理版本号（语义化版本）
├── 运行脚本命令（npm run dev）
├── 锁定依赖版本（lock 文件）
└── 发布自己的包

常见包管理器：
├── npm    → Node.js 自带，最广泛
├── yarn   → Facebook 开发，较快
├── pnpm   → 快、节省磁盘（硬链接），推荐
└── bun    → 最新，极快
```

### package.json

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "private": true,
  "type": "module",

  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest"
  },

  "dependencies": {
    "vue": "^3.5.0",
    "axios": "^1.7.0"
  },

  "devDependencies": {
    "vite": "^6.0.0",
    "eslint": "^9.0.0"
  }
}
```

### 语义化版本号（SemVer）

```
格式：主版本.次版本.补丁版本  →  3.5.12

主版本（Major）：不兼容的改动
次版本（Minor）：向下兼容的新功能
补丁版本（Patch）：向下兼容的 Bug 修复

版本符号：
├── ^3.5.12  →  >=3.5.12 <4.0.0（允许次版本和补丁更新）
├── ~3.5.12  →  >=3.5.12 <3.6.0（只允许补丁更新）
├── 3.5.12   →  精确版本（不允许任何更新）
└── *        →  任意版本（不推荐）

推荐：dependencies 用 ^，lock 文件锁定精确版本
```

## 底层原理（Why）

### 包管理器底层机制

```
包管理器的底层原理：

  1. npm 依赖解析算法：
     ├── 1. 读取 package.json 中的依赖声明
     ├── 2. 查询 Registry（https://registry.npmjs.org）
     │   └── 获取所有可用版本的元数据（dist-tags、versions）
     ├── 3. 版本匹配：
     │   ├── ^1.2.3 → 匹配 >=1.2.3 <2.0.0（主版本不变）
     │   ├── ~1.2.3 → 匹配 >=1.2.3 <1.3.0（次版本不变）
     │   └── 1.2.3 → 精确匹配（不允许任何更新）
     ├── 4. 依赖树构建：
     │   ├── 递归解析每个依赖的子依赖
     │   ├── 检测版本冲突（同一包的不同版本）
     │   └── 扁平化安装（hoisting）：将依赖提升到顶层
     └── 5. 下载与安装：
         ├── 下载 tarball（.tgz 压缩包）
         ├── 解压到 node_modules/
         └── 执行 postinstall 脚本（如果有）

  2. pnpm 的硬链接机制：
     ├── 问题：npm/yarn 每个项目都复制一份依赖（浪费磁盘）
     ├── 解决：pnpm 使用全局存储（store）
     │   ├── 首次安装：下载依赖到全局 store（~/.pnpm-store）
     │   └── 后续安装：硬链接到 node_modules（不占用额外空间）
     ├── 硬链接原理：
     │   ├── 多个文件名指向同一个 inode（磁盘上的文件数据）
     │   ├── 修改一个文件不影响其他文件（COW 写时复制）
     │   └── 节省磁盘空间（100 个项目共享同一份依赖）
     └── 幽灵依赖问题：
         ├── npm/yarn 扁平化安装导致可以访问未声明的依赖
         └── pnpm 严格模式：只能访问 package.json 中声明的依赖

  3. lock 文件的作用机制：
     ├── 为什么需要 lock 文件：
     │   ├── 同一项目不同时间安装可能得到不同版本
     │   └── 团队成员/CI 环境版本不一致导致 bug
     ├── lock 文件记录：
     │   ├── 每个依赖的精确版本
     │   ├── 依赖的依赖（完整依赖树）
     │   ├── 下载源（registry URL）
     │   └── 完整性校验（integrity hash）
     └── 工作流程：
         ├── 首次安装：生成 lock 文件（package-lock.json / pnpm-lock.yaml）
         ├── 后续安装：优先使用 lock 文件中的版本
         └── 更新依赖：手动运行 npm update / pnpm update

  4. Registry 协议与镜像源：
     ├── npm Registry API：
     │   ├── GET /{package}：获取包的元数据（所有版本）
     │   ├── GET /{package}/{version}：获取特定版本
     │   └── GET /{package}/-/{filename}：下载 tarball
     ├── 镜像源：
     │   ├── 官方：https://registry.npmjs.org
     │   ├── 淘宝：https://registry.npmmirror.com（国内加速）
     │   └── 自建：Verdaccio（私有 Registry）
     └── 配置方式：
         ├── .npmrc 文件：registry=https://...
         └── 命令行：npm config set registry <url>
```

## 基础用法（How）

### npm 常用命令

```bash
# 初始化项目
npm init              # 交互式创建 package.json
npm init -y           # 快速创建默认 package.json

# 安装依赖
npm install              # 安装所有依赖（根据 package.json）
npm install lodash       # 安装到 dependencies
npm install -D vite      # 安装到 devDependencies
npm install -g pnpm      # 全局安装

# 简写
npm i lodash             # = npm install lodash
npm i -D vite            # = npm install --save-dev vite

# 卸载
npm uninstall lodash

# 运行脚本
npm run dev              # 运行 scripts.dev
npm run build
npm test                 # test 可以省略 run

# 其他
npm list                 # 查看依赖树
npm list --depth=0       # 只看顶层
npm outdated             # 检查过期依赖
npm update               # 更新依赖（在版本范围内）
npm cache clean --force  # 清理缓存
```

### pnpm 常用命令

```bash
# 安装 pnpm
npm install -g pnpm

# 初始化
pnpm init

# 安装依赖
pnpm install             # 安装所有依赖
pnpm add lodash          # 安装到 dependencies
pnpm add -D vite         # 安装到 devDependencies

# 卸载
pnpm remove lodash

# 运行脚本
pnpm dev                 # 可以省略 run！
pnpm build

# 其他
pnpm list
pnpm outdated
pnpm update
```

### npm vs pnpm 对比

```
┌──────────────┬──────────────┬──────────────┐
│              │    npm       │    pnpm      │
├──────────────┼──────────────┼──────────────┤
│ 安装速度     │ 慢           │ 快（3x）     │
│ 磁盘占用     │ 每个项目复制 │ 全局硬链接   │
│ node_modules │ 扁平结构     │ 隔离结构     │
│ 幽灵依赖     │ 可能         │ 不可能       │
│ lock 文件    │ package-lock │ pnpm-lock    │
│ 命令风格     │ npm run dev  │ pnpm dev     │
└──────────────┴──────────────┴──────────────┘

pnpm 的 node_modules 结构：
node_modules/
├── .pnpm/                  # 真实的包存储（硬链接到全局）
│   ├── lodash@4.17.21/
│   └── vue@3.5.0/
├── lodash -> .pnpm/...     # 符号链接
└── vue -> .pnpm/...

优点：
├── 节省磁盘（多个项目共享同一份）
├── 安装更快
└── 杜绝幽灵依赖（不能访问未声明的包）
```

### scripts 脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --fix",
    "lint:check": "eslint .",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "prebuild": "npm run lint",
    "postinstall": "husky install"
  }
}
```

```
脚本钩子：
├── prebuild   → 在 build 之前自动执行
├── postbuild  → 在 build 之后自动执行
├── preinstall → 在安装之前自动执行
└── postinstall → 在安装之后自动执行

组合脚本：
"build": "npm run lint && vite build && echo 'Done'"
```

### .npmrc 配置

```bash
# .npmrc（项目根目录）

# 设置 registry（国内镜像）
registry=https://registry.npmmirror.com

# pnpm 特有配置
shamefully-hoist=true       # 扁平化（某些兼容性问题时用）
strict-peer-dependencies=false

# 代理
proxy=http://127.0.0.1:7890
https-proxy=http://127.0.0.1:7890
```

### lock 文件

```
lock 文件的作用：
├── 锁定所有依赖的精确版本
├── 锁定依赖的下载地址
├── 保证团队所有人安装相同版本
└── 必须提交到 Git！

文件对应：
├── npm  → package-lock.json
├── yarn → yarn.lock
├── pnpm → pnpm-lock.yaml
└── bun  → bun.lockb

注意：
├── 不要手动编辑 lock 文件
├── 安装时自动生成
├── 必须提交到 Git
└── npm ci / pnpm install --frozen-lockfile → CI 环境用
```

## 常见面试题

### Q1: dependencies 和 devDependencies 的区别？

```
dependencies（运行依赖）：
├── 项目运行时需要的包
├── 如：vue、axios、lodash
└── 打包时会包含

devDependencies（开发依赖）：
├── 只在开发时需要的包
├── 如：vite、eslint、typescript
└── 打包时不包含（减小体积）

注意：如果是纯前端项目（Vite/Webpack 打包），
两者都会参与构建，区别主要在库开发时
```

### Q2: ^ 和 ~ 版本符号的区别？

```
^3.5.12：
├── 固定主版本 3
├── 允许 3.5.13、3.6.0、3.99.0
└── 不允许 4.0.0

~3.5.12：
├── 固定主版本和次版本 3.5
├── 允许 3.5.13、3.5.99
└── 不允许 3.6.0

推荐用 ^，配合 lock 文件保证一致性
```

### Q3: 什么是幽灵依赖（phantom dependency）？

```
幽灵依赖 = 代码中使用了未声明的包

npm 的扁平结构导致：
node_modules/
├── A/
│   └── node_modules/B  （A 依赖 B）
├── B/                   （B 被提升到顶层）

你的代码可以 require('B')，但你的 package.json 没声明 B！
如果 A 升级不再依赖 B，你的代码就崩了。

pnpm 通过隔离结构杜绝此问题。
```

### Q4: npm ci 和 npm install 的区别？

```
npm install：
├── 根据 package.json 解析版本
├── 可能更新 lock 文件
└── 适合本地开发

npm ci（Clean Install）：
├── 严格按照 lock 文件安装
├── 不更新 lock 文件
├── 如果 lock 和 package.json 不一致则报错
├── 先删除 node_modules
└── 适合 CI/CD 环境，保证可重复构建
```

## 延伸练习

1. 创建一个新项目，用 pnpm 初始化
2. 安装 vue 和 vite，观察 pnpm-lock.yaml
3. 配置 scripts：dev、build、lint
4. 设置 npmmirror 镜像源
5. 对比 npm 和 pnpm 的 node_modules 结构

## 参考资料

- [npm 官方文档](https://docs.npmjs.com/)
- [pnpm 官方文档](https://pnpm.io/)
- [语义化版本 2.0](https://semver.org/)
