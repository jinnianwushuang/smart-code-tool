# Google ZX 构建脚本迁移指南

## 📋 概述

本项目已从 `npm-run-all` 迁移到 **Google ZX**，用于管理构建和开发流程。ZX 提供了更简洁、更强大的 JavaScript 脚本编写体验。

## 🔄 变更内容

### 1. 新增文件

- **`build.mjs`** - 生产环境构建脚本
- **`dev.mjs`** - 开发环境启动脚本

### 2. 依赖变更

```diff
devDependencies:
- "npm-run-all": "^4.1.5"
+ "zx": "^8.7.1"
```

### 3. Scripts 变更

#### 之前（使用 npm-run-all）

```json
{
  "scripts": {
    "dev-1": "run-s create-entry dev-2",
    "dev": "run-p dev-1 docs:dev",
    "build-1": "run-s clear-cache create-entry build-2",
    "build": "run-s build-1 docs:build"
  }
}
```

#### 现在（使用 zx）

```json
{
  "scripts": {
    "dev-1": "zx dev.mjs",
    "dev": "zx dev.mjs",
    "build-1": "zx build.mjs",
    "build": "zx build.mjs"
  }
}
```

## 🚀 使用方法

### 开发模式

```bash
# 启动开发服务器（Vue + VitePress）
pnpm run dev
```

这会：

1. 创建入口文件
2. 并行启动 Vue 应用（端口 23330）和 VitePress 文档（端口 5173）

### 生产构建

```bash
# 执行完整构建流程
pnpm run build
```

这会按顺序执行：

1. ✅ 清除缓存（删除 dist 目录）
2. ✅ 创建入口文件
3. ✅ 构建 Vue 应用
4. ✅ 构建 VitePress 文档

### 单独命令

```bash
# 只构建 Vue 应用
pnpm run build-2

# 只构建文档
pnpm run docs:build

# 预览生产构建
pnpm run preview
```

## 💡 ZX 脚本优势

### 1. 更清晰的代码

```javascript
// ❌ npm-run-all 需要复杂的配置
{
  "build": "run-s clear-cache create-entry build-2 docs:build"
}

// ✅ ZX 提供清晰的步骤和日志
console.log(chalk.yellow('📦 Step 1: Clearing cache...'))
await $`node ./job/cache/clear-cache.js`
console.log(chalk.green('✓ Cache cleared\n'))
```

### 2. 更好的错误处理

```javascript
try {
  await $`vite build`
} catch (error) {
  console.error(chalk.red('❌ Build failed!'))
  console.error(chalk.red(`Error: ${error.message}`))
  process.exit(1)
}
```

### 3. 彩色输出和进度提示

```javascript
console.log(chalk.blue('\n🚀 Smart Code Tool Build Process\n'))
console.log(chalk.yellow('🔨 Step 3: Building Vue application...'))
console.log(chalk.green('✓ Vue application built\n'))
```

### 4. 灵活的流程控制

```javascript
// 顺序执行
await $`step1`
await $`step2`

// 并行执行
await Promise.all([$`task1`, $`task2`])

// 条件执行
if (condition) {
  await $`optional-step`
}
```

## 🔧 GitHub Actions 集成

GitHub Actions 会自动使用新的构建命令，无需修改工作流配置：

```yaml
- name: Build project
  run: pnpm run build
```

这会自动执行 `zx build.mjs` 脚本。

## 📝 自定义构建脚本

如果需要添加新的构建步骤，只需编辑 `build.mjs`：

```javascript
#!/usr/bin/env zx

import { chalk } from 'zx'

// 添加新步骤
console.log(chalk.yellow('✨ New Step: Custom task...'))
await $`your-command`
console.log(chalk.green('✓ Custom task completed\n'))
```

## 🎯 最佳实践

1. **保持脚本简洁** - 每个步骤应该有清晰的职责
2. **使用彩色输出** - 提高可读性和用户体验
3. **添加错误处理** - 确保构建失败时有明确的错误信息
4. **提供进度反馈** - 让用户知道当前正在执行什么

## 🔍 故障排查

### 问题：zx 命令找不到

```bash
# 确保已安装依赖
pnpm install

# 或者全局安装
pnpm add -g zx
```

### 问题：构建失败

查看详细的错误输出，ZX 会显示完整的错误信息和堆栈跟踪。

### 问题：权限错误

```bash
# 赋予执行权限
chmod +x build.mjs
chmod +x dev.mjs
```

## 📚 参考资源

- [Google ZX 官方文档](https://google.github.io/zx/)
- [ZX GitHub 仓库](https://github.com/google/zx)
- [项目 handbook](../../docs/handbook/devops/google-zx-handbook.md)

---

**迁移日期**: 2026-07-06  
**版本**: 1.0
