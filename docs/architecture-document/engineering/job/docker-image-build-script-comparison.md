# Docker 镜像构建脚本对比笔记

## 📋 概述

本文档对比了四种不同语言/工具实现相同 Docker 镜像构建流程的脚本方式。所有脚本的执行逻辑和最终结果完全一致，只是实现语言和风格不同。

---

## 🎯 共同目标

1. **前端项目打包**：执行 `npm run build` 编译前端代码
2. **Docker 镜像构建**：使用 `docker build --platform linux/amd64` 构建镜像
3. **错误处理**：任何步骤失败时立即中断并提示
4. **进度反馈**：实时显示执行状态和结果

---

## 🔍 四种实现方式对比

### 1️⃣ Shell Script (build.sh)

#### 运行方式

```bash
chmod +x build.sh
./build.sh
# 或
bash build.sh
```

#### 核心特点

- **最轻量**：无需安装额外依赖
- **原生支持**：所有 Unix/Linux/macOS 系统自带 bash
- **简洁直接**：命令式编程，直观易懂

#### 脚本代码

```bash
#!/bin/bash

# 确保脚本发生错误时立即停止
set -e

# 定义镜像名称和版本
IMAGE_NAME="smart-code-tool-frontend"
VERSION="latest"

echo "📦 1. 开始本地前端项目打包 (npm run build)..."
# 如果使用的是 pnpm 或 yarn，请自行替换命令
npm run build

echo "🐳 2. 开始构建 Docker 镜像: ${IMAGE_NAME}:${VERSION}..."
# --platform linux/amd64 是为了确保在 Mac M系列芯片上打包时，线上 Linux 服务器也能正常运行
docker build --platform linux/amd64 -t ${IMAGE_NAME}:${VERSION} .

echo "✅ 3. 镜像构建完成！"
echo "你可以通过命令查看镜像: docker images | grep ${IMAGE_NAME}"

```

#### 优缺点分析

| 优点                      | 缺点                                           |
| ------------------------- | ---------------------------------------------- |
| ✅ 零依赖，开箱即用       | ❌ 跨平台兼容性差（Windows 需要 WSL/Git Bash） |
| ✅ 性能最好，无运行时开销 | ❌ 复杂逻辑难以维护                            |
| ✅ 适合 CI/CD 流水线      | ❌ 缺少结构化错误处理机制                      |
| ✅ 学习成本最低           | ❌ 字符串拼接和变量引用容易出错                |

#### 适用场景

- 简单的自动化任务
- Linux 服务器环境
- CI/CD 流水线中的基础脚本

---

### 2️⃣ Node.js Script (build.js)

#### 运行方式

```bash
node build.js
```

#### 核心特点

- **JavaScript 生态**：前端开发者熟悉
- **模块化设计**：封装 `runCommand` 函数复用逻辑
- **结构化错误处理**：try-catch 捕获异常

#### 脚本代码

```javascript
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
```

#### 优缺点分析

| 优点                   | 缺点                                  |
| ---------------------- | ------------------------------------- |
| ✅ 前端团队技术栈统一  | ❌ 需要安装 Node.js 环境              |
| ✅ 强大的 npm 生态系统 | ❌ 相比 Shell 有额外的运行时开销      |
| ✅ 良好的错误处理机制  | ❌ 异步操作需要额外处理（本例是同步） |
| ✅ 跨平台兼容性好      | ❌ 对于简单任务显得臃肿               |

#### 适用场景

- 前端项目配套的构建脚本
- 需要与 npm scripts 集成的场景
- 团队主要使用 JavaScript/TypeScript

---

### 3️⃣ Python Script (build.py)

#### 运行方式

```bash
python3 build.py
# 或
chmod +x build.py
./build.py
```

#### 核心特点

- **通用性强**：Python 在运维、DevOps 领域广泛应用
- **标准库支持**：使用 `subprocess` 模块执行系统命令
- **清晰的代码结构**：函数定义和主入口分离

#### 脚本代码

```python
#!/usr/bin/env python3
import subprocess
import sys

# 定义镜像名称和版本
IMAGE_NAME = "smart-code-tool-frontend"
VERSION = "latest"


def run_command(command, description):
    """运行终端命令并处理错误"""
    print(f"\n🚀 {description}...")
    try:
        # shell=True 允许直接运行整条命令字符串
        # check=True 会在命令执行失败（返回非0状态码）时直接抛出异常
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ 错误: '{description}' 执行失败。")
        sys.exit(1)


def main():
    # 1. 前端打包
    # 如果你使用的是 pnpm 或 yarn，请将 'npm run build' 改为 'pnpm build' 或 'yarn build'
    run_command("npm run build", "开始本地前端项目打包 (npm run build)")

    # 2. 构建 Docker 镜像
    # --platform linux/amd64 确保在 Mac M系列芯片上打出的镜像能在线上 Linux 服务器正常跑
    docker_build_cmd = (
        f"docker build --platform linux/amd64 -t {IMAGE_NAME}:{VERSION} ."
    )
    run_command(docker_build_cmd, f"开始构建 Docker 镜像 [{IMAGE_NAME}:{VERSION}]")

    # 3. 大功告成
    print("\n" + "=" * 40)
    print("✅ 3. 镜像构建完成！")
    print(f"   你可以通过以下命令查看镜像:\n   docker images | grep {IMAGE_NAME}")
    print("=" * 40)


if __name__ == "__main__":
    main()
```

#### 优缺点分析

| 优点                      | 缺点                                     |
| ------------------------- | ---------------------------------------- |
| ✅ 跨平台兼容性极佳       | ❌ 需要安装 Python 环境                  |
| ✅ 丰富的标准库和第三方库 | ❌ 对于简单任务可能过于重量级            |
| ✅ 代码可读性好           | ❌ `shell=True` 存在安全风险（命令注入） |
| ✅ 适合复杂逻辑和数据处理 | ❌ 启动速度比 Shell 慢                   |

#### 适用场景

- 跨平台的构建脚本
- 需要复杂数据处理或 API 调用
- DevOps 工具链的一部分
- 团队熟悉 Python 技术栈

---

### 4️⃣ ZX Script (build-zx.mjs)

#### 运行方式

```bash
# 首先需要安装 zx
pnpm add -D zx
# 或
npm install --save-dev zx

# 执行脚本
npx zx build-zx.mjs
```

#### 核心特点

- **专为脚本设计**：Google 开发的现代脚本工具
- **Promise 化命令执行**：使用 `await $` 语法糖
- **内置彩色输出**：自动提供 chalk 等实用工具
- **ES Module 支持**：使用 `.mjs` 扩展名

#### 脚本代码

```javascript
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
```

#### 优缺点分析

| 优点                                | 缺点                      |
| ----------------------------------- | ------------------------- |
| ✅ 语法最简洁优雅                   | ❌ 需要额外安装 zx 依赖   |
| ✅ 自动错误处理（命令失败自动抛出） | ❌ 社区相对较小，资料有限 |
| ✅ 内置彩色输出和工具函数           | ❌ 学习新工具的曲线       |
| ✅ 完美融合 Shell 和 JavaScript     | ❌ 不适合非 Node.js 项目  |
| ✅ 支持 async/await 异步流程        | ❌ 依赖 Node.js 环境      |

#### 适用场景

- Node.js 项目的现代化脚本编写
- 需要复杂流程控制的自动化任务
- 追求代码简洁性和可读性的团队
- 已经在使用 npm/pnpm 生态的项目

---

## 📊 综合对比表

| 特性           | Shell (.sh) | Node.js (.js) | Python (.py) | ZX (.mjs)    |
| -------------- | ----------- | ------------- | ------------ | ------------ |
| **依赖要求**   | 无          | Node.js       | Python 3     | Node.js + zx |
| **跨平台性**   | ⭐⭐        | ⭐⭐⭐⭐      | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐     |
| **学习曲线**   | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐      | ⭐⭐⭐⭐     | ⭐⭐⭐       |
| **代码简洁度** | ⭐⭐⭐⭐⭐  | ⭐⭐⭐        | ⭐⭐⭐⭐     | ⭐⭐⭐⭐⭐   |
| **错误处理**   | ⭐⭐        | ⭐⭐⭐⭐      | ⭐⭐⭐⭐     | ⭐⭐⭐⭐⭐   |
| **执行性能**   | ⭐⭐⭐⭐⭐  | ⭐⭐⭐        | ⭐⭐⭐       | ⭐⭐⭐       |
| **可维护性**   | ⭐⭐        | ⭐⭐⭐⭐      | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐   |
| **生态系统**   | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐   | ⭐⭐⭐       |
| **团队协作**   | ⭐⭐⭐      | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐     | ⭐⭐⭐⭐     |

---

## 💡 核心知识点总结

### 1. 错误处理机制对比

#### Shell: `set -e`

```bash
set -e  # 任何命令返回非零状态码时立即退出
```

- 最简单但不够灵活
- 无法针对特定命令做差异化处理

#### Node.js: `try-catch + process.exit`

```javascript
try {
  execSync(command, { stdio: 'inherit' })
} catch (error) {
  console.error('错误信息')
  process.exit(1) // 1 表示异常退出
}
```

- 可以捕获具体错误类型
- 可以在 catch 块中做清理工作

#### Python: `subprocess.CalledProcessError`

```python
try:
    subprocess.run(command, shell=True, check=True)
except subprocess.CalledProcessError as e:
    print(f"错误: {e}")
    sys.exit(1)
```

- `check=True` 是关键，否则不会抛出异常
- 可以访问异常的 `returncode`、`output` 等属性

#### ZX: 自动抛出

```javascript
await $`command` // 命令失败自动抛出 Error
```

- 最简洁，无需手动处理
- 可以用 try-catch 包裹进行自定义处理

---

### 2. 命令执行方式对比

| 方式                      | 特点                  | 安全性                      |
| ------------------------- | --------------------- | --------------------------- |
| `execSync` (Node.js)      | 同步执行，阻塞等待    | ⚠️ 需注意命令注入           |
| `subprocess.run` (Python) | 可同步/异步，灵活配置 | ⚠️ `shell=True` 有风险      |
| `$` (ZX)                  | Promise 化，自动转义  | ✅ 较安全，自动处理特殊字符 |
| 直接执行 (Shell)          | 原生支持，最直接      | ⚠️ 需手动处理特殊字符       |

---

### 3. Docker 构建参数说明

```bash
docker build --platform linux/amd64 -t smart-code-tool-frontend:latest .
```

| 参数                     | 作用                                                                   |
| ------------------------ | ---------------------------------------------------------------------- |
| `--platform linux/amd64` | 指定目标平台架构，确保在 ARM Mac 上构建的镜像能在 x86 Linux 服务器运行 |
| `-t name:tag`            | 给镜像打标签（名称:版本）                                              |
| `.`                      | 构建上下文为当前目录（需要存在 Dockerfile）                            |

**为什么需要 `--platform linux/amd64`？**

- Apple Silicon (M1/M2/M3) 芯片基于 ARM 架构
- 大多数云服务器使用 x86_64 (amd64) 架构
- 不加此参数会导致镜像在不兼容的平台上无法运行

---

### 4. 字符串格式化对比

| 语言       | 语法           | 示例                     |
| ---------- | -------------- | ------------------------ |
| Shell      | `${VAR}`       | `"image:${VERSION}"`     |
| JavaScript | `` `${VAR}` `` | `` `image:${VERSION}` `` |
| Python     | `f"{VAR}"`     | `f"image:{VERSION}"`     |
| ZX         | `` `${VAR}` `` | `` `image:${VERSION}` `` |

---

## 🎓 学习建议

### 初学者路径

1. **先学 Shell**：理解基础的命令行操作和脚本概念
2. **再学 Node.js/Python**：根据团队技术栈选择其一
3. **最后尝试 ZX**：体验现代化的脚本编写方式

### 选择指南

```
你的项目是什么类型？
├─ 前端项目 (React/Vue/Angular)
│  ├─ 简单任务 → Shell (.sh)
│  └─ 复杂任务 → Node.js (.js) 或 ZX (.mjs)
│
├─ Python 后端项目
│  └─ 任意复杂度 → Python (.py)
│
├─ 跨平台工具
│  └─ 优先 Python (.py)
│
└─ CI/CD 流水线
   └─ 优先 Shell (.sh)（容器内通常只有基础工具）
```

---

## 🔗 相关资源

- **ZX 官方文档**: https://google.github.io/zx/
- **Node.js child_process**: https://nodejs.org/api/child_process.html
- **Python subprocess**: https://docs.python.org/3/library/subprocess.html
- **Bash 最佳实践**: https://github.com/google/styleguide/blob/gh-pages/shellguide.md
- **Docker 多平台构建**: https://docs.docker.com/build/building/multi-platform/

---

## 📝 实践练习

### 练习 1：添加日志时间戳

为每个脚本添加时间戳输出，格式：`[HH:MM:SS] 消息内容`

### 练习 2：添加清理功能

在脚本开始时检查并删除旧的 `dist/` 目录

### 练习 3：添加参数支持

允许通过命令行参数指定镜像名称和版本：

```bash
./build.sh my-app v1.0.0
node build.js my-app v1.0.0
python3 build.py my-app v1.0.0
npx zx build-zx.mjs my-app v1.0.0
```

### 练习 4：添加推送功能

构建完成后自动推送到 Docker Hub：

```bash
docker push smart-code-tool-frontend:latest
```

---

## ✨ 总结

| 脚本类型    | 一句话评价                                    |
| ----------- | --------------------------------------------- |
| **Shell**   | 简单粗暴，无处不在，Linux 世界的通用语言      |
| **Node.js** | 前端开发者的自然选择，与项目技术栈无缝集成    |
| **Python**  | 跨平台王者，运维和 DevOps 的首选工具          |
| **ZX**      | 现代脚本的新秀，兼具 Shell 的简洁和 JS 的强大 |

**核心理念**：没有最好的工具，只有最适合的工具。根据项目需求、团队技能和部署环境选择最合适的方案。

---

_最后更新：2026-06-22_
