# Google zx 手册

> **版本**: 1.0  
> **最后更新**: 2026-07-02  
> **适用对象**: DevOps 工程师、前端开发人员、自动化脚本开发者

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、安装与配置](#二安装与配置)
- [三、核心 API](#三核心-api)
- [四、常用工具函数](#四常用工具函数)
- [五、文件操作](#五文件操作)
- [六、进程管理](#六进程管理)
- [七、HTTP 请求](#七http-请求)
- [八、错误处理](#八错误处理)
- [九、最佳实践](#九最佳实践)
- [十、实战示例](#十实战示例)
- [十一、与 Jenkins 集成](#十一与-jenkins-集成)

---

## 一、基础概念

### 1.1 zx 是什么

**zx** 是 Google 开源的一个编写脚本的工具，让你可以用 JavaScript/TypeScript 编写 Shell 脚本。

**特点**：

- 🚀 使用 JavaScript/TypeScript 语法
- 💻 内置常用 Unix 命令（cd, ls, cat 等）
- 🔧 自动处理引号和转义
- 📦 支持 npm 生态
- 🎯 更好的错误处理和调试体验
- ⚡ 基于 Node.js，跨平台支持

### 1.2 为什么选择 zx

**传统 Shell 脚本的问题**：

```bash
# ❌ Shell 脚本的痛点
if [ -f "file.txt" ]; then
    content=$(cat file.txt)
    if [[ $content == *"error"* ]]; then
        echo "Found error"
    fi
fi
```

**zx 的优势**：

```javascript
// ✅ zx 更简洁直观
if (await fs.exists('file.txt')) {
  const content = await fs.readFile('file.txt', 'utf8')
  if (content.includes('error')) {
    console.log('Found error')
  }
}
```

### 1.3 适用场景

- 🔄 CI/CD 自动化脚本
- 🛠️ 项目脚手架和初始化
- 📊 数据批处理和转换
- 🚀 部署和运维脚本
- 🔍 日志分析和监控
- 🧪 测试环境搭建

---

## 二、安装与配置

### 2.1 全局安装

```bash
# 使用 npm
npm install -g zx

# 使用 yarn
yarn global add zx

# 使用 pnpm
pnpm add -g zx
```

### 2.2 项目本地安装

```bash
# 安装到项目
npm install zx

# 在 package.json 中添加脚本
{
  "scripts": {
    "deploy": "zx scripts/deploy.mjs",
    "build": "zx scripts/build.mjs"
  }
}
```

### 2.3 直接使用（无需安装）

```bash
# 通过 npx 直接运行
npx zx script.mjs

# 从 URL 运行
npx zx https://example.com/script.mjs

# 从 stdin 运行
echo 'console.log("Hello")' | npx zx
```

### 2.4 创建 zx 脚本

**方法 1：使用 .mjs 扩展名**

```javascript
// script.mjs
#!/usr/bin/env zx

console.log('Hello from zx!')
```

**方法 2：使用 shebang**

```javascript
// script.js
#!/usr/bin/env zx

console.log('Hello from zx!')
```

**赋予执行权限**：

```bash
chmod +x script.mjs
./script.mjs
```

### 2.5 TypeScript 支持

```typescript
// script.ts
import { $, cd, path } from 'zx'

const dir = path.join(process.cwd(), 'dist')
await $`mkdir -p ${dir}`
```

**运行 TypeScript 脚本**：

```bash
npx tsx script.ts
# 或
npx zx script.ts
```

---

## 三、核心 API

### 3.1 `$` - 执行命令

**基本用法**：

```javascript
// 执行简单命令
await $`ls -la`

// 带变量的命令
const name = 'world'
await $`echo Hello ${name}`

// 多行命令
await $`
  git status
  git diff
`
```

**捕获输出**：

```javascript
// 获取命令输出
const branch = await $`git branch --show-current`
console.log(branch.stdout.trim()) // 当前分支名

// 获取退出码
const result = await $`test -f file.txt`
console.log(result.exitCode) // 0 表示成功
```

**错误处理**：

```javascript
// 默认行为：命令失败时抛出异常
try {
  await $`exit 1`
} catch (error) {
  console.log('Command failed:', error.message)
}

// 忽略错误
await $({ nothrow: true })`exit 1`

// 自定义错误处理
$.nothrow = true
await $`exit 1`
$.nothrow = false
```

**流式输出**：

```javascript
// 实时输出（不缓冲）
await $({ stdio: 'inherit' })`npm run build`

// 分别控制 stdin/stdout/stderr
await $({
  stdio: ['pipe', 'inherit', 'pipe'],
})`command`
```

### 3.2 `cd` - 切换目录

```javascript
// 切换目录
cd('/tmp')
await $`pwd` // /tmp

// 相对路径
cd('src')
await $`pwd` // /current/dir/src

// 临时切换（推荐）
await within(async () => {
  cd('/tmp')
  await $`pwd` // /tmp
})
// 自动恢复到原目录
```

### 3.3 `within` - 作用域隔离

```javascript
// 隔离环境变量和工作目录
await within(async () => {
  $.env.PATH = '/custom/path:' + $.env.PATH
  cd('/tmp')

  await $`echo $PATH`
  await $`pwd`
})

// 外部不受影响
await $`pwd` // 回到原目录
```

### 3.4 `question` - 用户交互

```javascript
// 简单提问
const name = await question('What is your name? ')
console.log(`Hello, ${name}!`)

// 带默认值
const env = await question('Environment? ', {
  default: 'production',
})

// 选择列表
const color = await question('Choose color:', {
  choices: ['red', 'green', 'blue'],
})

// 密码输入（隐藏）
const password = await question('Password: ', {
  hidden: true,
})
```

### 3.5 `sleep` - 延迟执行

```javascript
// 延迟 1 秒
await sleep(1000)

// 延迟 2 秒
await sleep(2 * 1000)
```

### 3.6 `retry` - 重试机制

```javascript
// 重试 3 次
await retry(3, async () => {
  await $`curl https://api.example.com`
})

// 自定义延迟
await retry(5, async (attempt) => {
  console.log(`Attempt ${attempt}`)
  await sleep(1000 * attempt) // 递增延迟
  await $`curl https://api.example.com`
})
```

---

## 四、常用工具函数

### 4.1 `fs` - 文件系统

```javascript
import { fs } from 'zx'

// 读取文件
const content = await fs.readFile('file.txt', 'utf8')

// 写入文件
await fs.writeFile('output.txt', 'Hello World')

// 追加内容
await fs.appendFile('log.txt', 'New line\n')

// 检查文件存在
if (await fs.exists('file.txt')) {
  console.log('File exists')
}

// 删除文件
await fs.rm('file.txt')

// 复制文件
await fs.cp('source.txt', 'dest.txt')

// 创建目录
await fs.mkdir('new-dir', { recursive: true })

// 读取目录
const files = await fs.readdir('./')
```

### 4.2 `path` - 路径处理

```javascript
import { path } from 'zx'

// 拼接路径
const fullPath = path.join('/home', 'user', 'project')

// 获取文件名
path.basename('/home/user/file.txt') // 'file.txt'

// 获取扩展名
path.extname('file.txt') // '.txt'

// 获取目录
path.dirname('/home/user/file.txt') // '/home/user'

// 解析路径
path.resolve('./file.txt')

// 检查绝对路径
path.isAbsolute('/home/user') // true
```

### 4.3 `os` - 系统信息

```javascript
import { os } from 'zx'

// 操作系统
console.log(os.platform()) // 'darwin', 'linux', 'win32'
console.log(os.arch()) // 'x64', 'arm64'

// CPU 信息
console.log(os.cpus().length) // CPU 核心数

// 内存信息
console.log(os.freemem()) // 可用内存
console.log(os.totalmem()) // 总内存

// 临时目录
console.log(os.tmpdir()) // /tmp 或 C:\Temp

// 用户主目录
console.log(os.homedir()) // /home/user
```

### 4.4 `chalk` - 彩色输出

```javascript
import { chalk } from 'zx'

// 基本颜色
console.log(chalk.red('Error'))
console.log(chalk.green('Success'))
console.log(chalk.yellow('Warning'))
console.log(chalk.blue('Info'))

// 样式组合
console.log(chalk.bold.red('Bold Red'))
console.log(chalk.bgWhite.black('Black on White'))

// 实用方法
console.log(chalk.dim('Dimmed text'))
console.log(chalk.underline('Underlined'))
console.log(chalk.strikethrough('Strikethrough'))
```

### 4.5 `argv` - 命令行参数

```javascript
import { argv } from 'zx'

// 访问参数
console.log(argv[0]) // 第一个参数
console.log(argv[1]) // 第二个参数

// 命名参数
// 运行: zx script.mjs --name John --age 25
console.log(argv.name) // 'John'
console.log(argv.age) // '25'

// 布尔标志
// 运行: zx script.mjs --verbose
if (argv.verbose) {
  console.log('Verbose mode enabled')
}
```

---

## 五、文件操作

### 5.1 读取和解析 JSON

```javascript
import { fs } from 'zx'

// 读取 JSON 文件
const config = JSON.parse(await fs.readFile('package.json', 'utf8'))
console.log(config.name)
console.log(config.version)

// 写入 JSON 文件
const data = { name: 'test', version: '1.0.0' }
await fs.writeFile('config.json', JSON.stringify(data, null, 2))
```

### 5.2 批量文件处理

```javascript
import { fs, globby } from 'zx'

// 查找所有 .js 文件
const files = await globby('**/*.js')

// 批量处理
for (const file of files) {
  const content = await fs.readFile(file, 'utf8')
  const modified = content.replace(/old/g, 'new')
  await fs.writeFile(file, modified)
  console.log(`Processed: ${file}`)
}
```

### 5.3 文件监控

```javascript
import { fs } from 'zx'

// 监听文件变化
const watcher = fs.watch('src', (eventType, filename) => {
  console.log(`${eventType}: ${filename}`)
})

// 停止监听
setTimeout(() => {
  watcher.close()
}, 60000)
```

### 5.4 临时文件和目录

```javascript
import { os, fs, path } from 'zx'

// 创建临时目录
const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'myapp-'))
console.log(tempDir) // /tmp/myapp-abc123

// 在临时目录中工作
cd(tempDir)
await $`echo "test" > file.txt`

// 清理临时目录
await fs.rm(tempDir, { recursive: true, force: true })
```

---

## 六、进程管理

### 6.1 并行执行

```javascript
// 并行执行多个命令
const [result1, result2, result3] = await Promise.all([$`git status`, $`git log -1`, $`git branch`])

console.log(result1.stdout)
console.log(result2.stdout)
console.log(result3.stdout)
```

### 6.2 顺序执行

```javascript
// 顺序执行（默认行为）
await $`npm install`
await $`npm run build`
await $`npm test`
```

### 6.3 子进程管理

```javascript
// 启动长时间运行的进程
const proc = $`npm run dev`

// 监听到输出
proc.stdout.on('data', (data) => {
  console.log(data.toString())
})

// 终止进程
setTimeout(() => {
  proc.kill()
}, 10000)
```

### 6.4 进程池

```javascript
// 限制并发数量
async function processWithLimit(tasks, limit) {
  const results = []
  let index = 0

  async function worker() {
    while (index < tasks.length) {
      const task = tasks[index++]
      results.push(await task())
    }
  }

  const workers = Array(limit).fill(null).map(worker)
  await Promise.all(workers)

  return results
}

// 使用
const urls = ['url1', 'url2', 'url3', 'url4', 'url5']
await processWithLimit(
  urls.map((url) => () => $`curl ${url}`),
  3, // 最多 3 个并发
)
```

---

## 七、HTTP 请求

### 7.1 使用 fetch

```javascript
// GET 请求
const response = await fetch('https://api.example.com/users')
const users = await response.json()
console.log(users)

// POST 请求
const createResponse = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John', email: 'john@example.com' }),
})

const newUser = await createResponse.json()
console.log(newUser)

// 带错误处理
try {
  const response = await fetch('https://api.example.com/data')
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  console.log(data)
} catch (error) {
  console.error('Request failed:', error)
}
```

### 7.2 使用 axios（需要安装）

```javascript
import axios from 'axios'

// GET 请求
const { data } = await axios.get('https://api.example.com/users')

// POST 请求
const { data: newUser } = await axios.post('https://api.example.com/users', {
  name: 'John',
  email: 'john@example.com',
})

// 拦截器
axios.interceptors.request.use((config) => {
  console.log(`Request: ${config.method.toUpperCase()} ${config.url}`)
  return config
})
```

### 7.3 下载文件

```javascript
import { fs } from 'zx'

// 下载文件
const response = await fetch('https://example.com/file.zip')
const buffer = await response.arrayBuffer()
await fs.writeFile('file.zip', Buffer.from(buffer))

// 显示进度
const downloadFile = async (url, dest) => {
  const response = await fetch(url)
  const totalSize = parseInt(response.headers.get('content-length'))
  let downloaded = 0

  const stream = response.body
  const chunks = []

  for await (const chunk of stream) {
    chunks.push(chunk)
    downloaded += chunk.length

    const percent = ((downloaded / totalSize) * 100).toFixed(2)
    process.stdout.write(`\rDownloading: ${percent}%`)
  }

  await fs.writeFile(dest, Buffer.concat(chunks))
  console.log('\nDownload complete!')
}

await downloadFile('https://example.com/large-file.zip', 'file.zip')
```

---

## 八、错误处理

### 8.1 命令错误处理

```javascript
// 方式 1: try-catch
try {
  await $`non-existent-command`
} catch (error) {
  console.error('Command failed:', error.message)
  console.error('Exit code:', error.exitCode)
  console.error('Stderr:', error.stderr)
}

// 方式 2: nothrow
const result = await $({ nothrow: true })`non-existent-command`
if (result.exitCode !== 0) {
  console.error('Command failed with exit code:', result.exitCode)
}

// 方式 3: 全局设置
$.nothrow = true
await $`non-existent-command` // 不会抛出异常
```

### 8.2 自定义错误处理

```javascript
// 自定义错误处理器
$.quote = (str) => {
  // 自定义参数转义
  return `'${str.replace(/'/g, "'\\''")}'`
}

// 自定义日志
$.log = (chunk) => {
  // 自定义日志输出
  process.stdout.write(chunk)
}

// 自定义超时
$.timeout = '5s'
try {
  await $`sleep 10` // 5 秒后超时
} catch (error) {
  console.error('Timeout:', error.message)
}
```

### 8.3 优雅退出

```javascript
import { process } from 'zx'

// 注册清理函数
process.on('exit', (code) => {
  console.log(`Exiting with code: ${code}`)
  // 清理资源
})

process.on('SIGINT', () => {
  console.log('Received SIGINT')
  process.exit(130)
})

process.on('SIGTERM', () => {
  console.log('Received SIGTERM')
  process.exit(143)
})
```

---

## 九、最佳实践

### 9.1 代码组织

**推荐结构**：

```
scripts/
├── utils/
│   ├── logger.js      # 日志工具
│   ├── validator.js   # 验证工具
│   └── helpers.js     # 辅助函数
├── deploy/
│   ├── staging.js     # 预发布部署
│   └── production.js  # 生产部署
├── build.js           # 构建脚本
└── cleanup.js         # 清理脚本
```

**模块化示例**：

```javascript
// scripts/utils/logger.js
import {chalk} from 'zx'

export const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  error: (msg) => console.error(chalk.red('✗'), msg),
}

// scripts/deploy.js
#!/usr/bin/env zx
import {log} from '../utils/logger.js'

log.info('Starting deployment...')
await $`npm run build`
log.success('Deployment complete!')
```

### 9.2 环境变量管理

```javascript
import { dotenv } from 'zx'

// 加载 .env 文件
dotenv.config()

// 访问环境变量
const apiKey = process.env.API_KEY
const dbUrl = process.env.DATABASE_URL

// 必需的环境变量
function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const apiKey = requireEnv('API_KEY')
```

### 9.3 配置管理

```javascript
// config.js
export const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    debug: true,
  },
  staging: {
    apiUrl: 'https://staging-api.example.com',
    debug: false,
  },
  production: {
    apiUrl: 'https://api.example.com',
    debug: false,
  },
}

// 根据环境选择配置
const env = process.env.NODE_ENV || 'development'
const currentConfig = config[env]
```

### 9.4 日志记录

```javascript
import { chalk } from 'zx'

class Logger {
  constructor(level = 'info') {
    this.level = level
    this.levels = { debug: 0, info: 1, warn: 2, error: 3 }
  }

  shouldLog(level) {
    return this.levels[level] >= this.levels[this.level]
  }

  debug(msg) {
    if (this.shouldLog('debug')) {
      console.log(chalk.gray('[DEBUG]'), msg)
    }
  }

  info(msg) {
    if (this.shouldLog('info')) {
      console.log(chalk.blue('[INFO]'), msg)
    }
  }

  warn(msg) {
    if (this.shouldLog('warn')) {
      console.warn(chalk.yellow('[WARN]'), msg)
    }
  }

  error(msg) {
    if (this.shouldLog('error')) {
      console.error(chalk.red('[ERROR]'), msg)
    }
  }
}

const logger = new Logger(process.env.LOG_LEVEL)
logger.info('Application started')
```

### 9.5 性能优化

```javascript
// ❌ 避免：不必要的等待
await $`echo 1`
await $`echo 2`
await $`echo 3`

// ✅ 推荐：并行执行
await Promise.all([$`echo 1`, $`echo 2`, $`echo 3`])

// ❌ 避免：重复安装依赖
await $`npm install`
await $`npm install`

// ✅ 推荐：检查后安装
if (!(await fs.exists('node_modules'))) {
  await $`npm install`
}
```

---

## 十、实战示例

### 10.1 项目初始化脚本

```javascript
#!/usr/bin/env zx
import { question, chalk, fs } from 'zx'

console.log(chalk.bold('\n🚀 Project Initializer\n'))

// 收集项目信息
const projectName = await question('Project name: ', {
  default: 'my-project',
})

const description = await question('Description: ', {
  default: 'A new project',
})

const author = await question('Author: ')

// 创建项目结构
console.log(chalk.blue('\n📁 Creating project structure...'))

await fs.mkdir(projectName)
cd(projectName)

await fs.mkdir('src')
await fs.mkdir('tests')
await fs.mkdir('docs')

// 创建 package.json
console.log(chalk.blue('📄 Creating package.json...'))

const packageJson = {
  name: projectName,
  version: '1.0.0',
  description: description,
  main: 'src/index.js',
  scripts: {
    start: 'node src/index.js',
    test: 'jest',
    lint: 'eslint src/',
  },
  author: author,
  license: 'MIT',
}

await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2))

// 创建 README
console.log(chalk.blue('📝 Creating README...'))

const readme = `# ${projectName}

${description}

## Author

${author}

## License

MIT
`

await fs.writeFile('README.md', readme)

// 初始化 Git
console.log(chalk.blue('🔧 Initializing Git...'))
await $`git init`
await $`git add .`
await $`git commit -m "Initial commit"`

console.log(chalk.green('\n✅ Project initialized successfully!'))
console.log(chalk.green(`\n📂 cd ${projectName}`))
console.log(chalk.green('📦 npm install'))
console.log(chalk.green('🚀 npm start\n'))
```

### 10.2 Docker 镜像构建和推送

```javascript
#!/usr/bin/env zx
import { argv, chalk, question } from 'zx'

const imageName = argv.image || (await question('Docker image name: '))
const tag = argv.tag || 'latest'
const registry = argv.registry || 'docker.io'

console.log(chalk.blue(`\n🐳 Building Docker image: ${imageName}:${tag}\n`))

// 构建镜像
console.log(chalk.yellow('Building...'))
await $`docker build -t ${imageName}:${tag} .`

// 标记镜像
console.log(chalk.yellow('Tagging...'))
await $`docker tag ${imageName}:${tag} ${registry}/${imageName}:${tag}`

// 登录（如果需要）
if (argv.login) {
  console.log(chalk.yellow('Logging in to registry...'))
  await $({ stdio: 'inherit' })`docker login ${registry}`
}

// 推送镜像
console.log(chalk.yellow('Pushing...'))
await $({ stdio: 'inherit' })`docker push ${registry}/${imageName}:${tag}`

console.log(chalk.green('\n✅ Image pushed successfully!'))
console.log(chalk.green(`📦 ${registry}/${imageName}:${tag}\n`))
```

### 10.3 数据库备份脚本

```javascript
#!/usr/bin/env zx
import { fs, os, path, chalk } from 'zx'

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_USER = process.env.DB_USER || 'postgres'
const DB_NAME = process.env.DB_NAME || 'mydb'
const BACKUP_DIR = path.join(os.homedir(), 'backups')

// 创建备份目录
await fs.mkdir(BACKUP_DIR, { recursive: true })

// 生成备份文件名
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupFile = path.join(BACKUP_DIR, `${DB_NAME}-${timestamp}.sql.gz`)

console.log(chalk.blue(`\n💾 Starting database backup...\n`))
console.log(chalk.gray(`Host: ${DB_HOST}`))
console.log(chalk.gray(`Database: ${DB_NAME}`))
console.log(chalk.gray(`Backup file: ${backupFile}\n`))

// 执行备份
try {
  await $`pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} | gzip > ${backupFile}`

  const stats = await fs.stat(backupFile)
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2)

  console.log(chalk.green('✅ Backup completed successfully!'))
  console.log(chalk.green(`📦 Size: ${sizeMB} MB`))
  console.log(chalk.green(`📁 Location: ${backupFile}\n`))

  // 清理旧备份（保留最近 7 天）
  console.log(chalk.yellow('🧹 Cleaning old backups...'))
  const files = await fs.readdir(BACKUP_DIR)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 7)

  for (const file of files) {
    if (file.startsWith(DB_NAME)) {
      const filePath = path.join(BACKUP_DIR, file)
      const stats = await fs.stat(filePath)

      if (stats.mtime < cutoffDate) {
        await fs.rm(filePath)
        console.log(chalk.gray(`Deleted: ${file}`))
      }
    }
  }

  console.log(chalk.green('✅ Cleanup complete!\n'))
} catch (error) {
  console.error(chalk.red('❌ Backup failed!'))
  console.error(chalk.red(error.message))
  process.exit(1)
}
```

### 10.4 日志分析和报告

```javascript
#!/usr/bin/env zx
import { fs, chalk } from 'zx'

const logFile = argv.file || 'access.log'
const outputFile = argv.output || 'report.json'

console.log(chalk.blue(`\n📊 Analyzing log file: ${logFile}\n`))

// 读取日志文件
const content = await fs.readFile(logFile, 'utf8')
const lines = content.split('\n').filter((line) => line.trim())

console.log(chalk.gray(`Total lines: ${lines.length}\n`))

// 分析数据
const stats = {
  totalRequests: lines.length,
  statusCodes: {},
  methods: {},
  topIPs: {},
  topPaths: {},
  errors: [],
}

for (const line of lines) {
  // 简单的日志解析（根据实际格式调整）
  const match = line.match(/^(\S+) \S+ \S+ \[(.*?)\] "(.*?) (\S+) \S+" (\d+)/)

  if (match) {
    const [, ip, , method, , statusCode] = match

    // 统计状态码
    stats.statusCodes[statusCode] = (stats.statusCodes[statusCode] || 0) + 1

    // 统计请求方法
    stats.methods[method] = (stats.methods[method] || 0) + 1

    // 统计 IP
    stats.topIPs[ip] = (stats.topIPs[ip] || 0) + 1

    // 收集错误
    if (parseInt(statusCode) >= 400) {
      stats.errors.push({ ip, method, statusCode, timestamp: new Date().toISOString() })
    }
  }
}

// 获取 Top 10 IP
const sortedIPs = Object.entries(stats.topIPs)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .reduce((obj, [ip, count]) => {
    obj[ip] = count
    return obj
  }, {})

stats.topIPs = sortedIPs

// 保存报告
await fs.writeFile(outputFile, JSON.stringify(stats, null, 2))

// 打印摘要
console.log(chalk.bold('📈 Report Summary\n'))
console.log(chalk.blue('Status Codes:'))
Object.entries(stats.statusCodes).forEach(([code, count]) => {
  const color = code.startsWith('2') ? chalk.green : code.startsWith('4') ? chalk.yellow : chalk.red
  console.log(color(`  ${code}: ${count}`))
})

console.log(chalk.blue('\nMethods:'))
Object.entries(stats.methods).forEach(([method, count]) => {
  console.log(chalk.gray(`  ${method}: ${count}`))
})

console.log(chalk.blue('\nTop 10 IPs:'))
Object.entries(stats.topIPs).forEach(([ip, count]) => {
  console.log(chalk.gray(`  ${ip}: ${count}`))
})

console.log(chalk.blue(`\nErrors: ${stats.errors.length}`))

console.log(chalk.green(`\n✅ Report saved to: ${outputFile}\n`))
```

### 10.5 微服务健康检查

```javascript
#!/usr/bin/env zx
import { chalk } from 'zx'

const services = [
  { name: 'API Gateway', url: 'http://localhost:3000/health' },
  { name: 'User Service', url: 'http://localhost:3001/health' },
  { name: 'Order Service', url: 'http://localhost:3002/health' },
  { name: 'Payment Service', url: 'http://localhost:3003/health' },
]

console.log(chalk.bold('\n🏥 Service Health Check\n'))

const results = []

for (const service of services) {
  process.stdout.write(chalk.gray(`Checking ${service.name}... `))

  try {
    const response = await fetch(service.url, {
      timeout: 5000,
    })

    if (response.ok) {
      const data = await response.json()
      console.log(chalk.green('✓ Healthy'))
      results.push({
        name: service.name,
        status: 'healthy',
        uptime: data.uptime,
        timestamp: new Date().toISOString(),
      })
    } else {
      console.log(chalk.red(`✗ Unhealthy (${response.status})`))
      results.push({
        name: service.name,
        status: 'unhealthy',
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.log(chalk.red('✗ Down'))
    results.push({
      name: service.name,
      status: 'down',
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}

// 打印摘要
console.log(chalk.bold('\n📊 Summary\n'))

const healthy = results.filter((r) => r.status === 'healthy').length
const unhealthy = results.filter((r) => r.status === 'unhealthy').length
const down = results.filter((r) => r.status === 'down').length

console.log(chalk.green(`Healthy: ${healthy}`))
console.log(chalk.yellow(`Unhealthy: ${unhealthy}`))
console.log(chalk.red(`Down: ${down}`))

if (down > 0) {
  console.log(chalk.red('\n⚠️  Some services are down!'))
  process.exit(1)
} else {
  console.log(chalk.green('\n✅ All services are operational!\n'))
}
```

---

## 十一、与 Jenkins 集成

### 11.1 在 Jenkins Pipeline 中使用 zx

**Declarative Pipeline**：

```groovy
pipeline {
    agent any

    tools {
        nodejs 'Node 18'
    }

    stages {
        stage('Setup zx') {
            steps {
                sh 'npm install -g zx'
            }
        }

        stage('Run Deployment Script') {
            steps {
                script {
                    // 执行 zx 脚本
                    sh '''
                    zx << 'EOF'
                    #!/usr/bin/env zx

                    console.log('Deploying application...')

                    // 构建
                    await $`npm ci`
                    await $`npm run build`

                    // 测试
                    await $`npm test`

                    // 部署
                    await $`docker build -t myapp:${BUILD_NUMBER} .`
                    await $`docker push registry.example.com/myapp:${BUILD_NUMBER}`

                    console.log('Deployment complete!')
                    EOF
                    '''
                }
            }
        }

        stage('Run Cleanup Script') {
            steps {
                sh 'zx scripts/cleanup.mjs'
            }
        }
    }
}
```

### 11.2 使用 zx 脚本文件

**创建脚本文件** (`scripts/deploy.mjs`)：

```javascript
#!/usr/bin/env zx
import { argv, chalk } from 'zx'

const environment = argv.env || 'staging'
const version = argv.version || process.env.BUILD_NUMBER

console.log(chalk.blue(`Deploying to ${environment}...`))

// 根据环境选择配置
const configs = {
  development: {
    replicas: 1,
    resources: 'minimal',
  },
  staging: {
    replicas: 2,
    resources: 'standard',
  },
  production: {
    replicas: 3,
    resources: 'high',
  },
}

const config = configs[environment]

// 执行部署
await $`kubectl set image deployment/myapp myapp=myapp:${version}`
await $`kubectl scale deployment/myapp --replicas=${config.replicas}`
await $`kubectl rollout status deployment/myapp`

console.log(chalk.green('✅ Deployment successful!'))
```

**Jenkins Pipeline**：

```groovy
pipeline {
    agent any

    environment {
        DEPLOY_ENV = 'production'
    }

    stages {
        stage('Deploy with zx') {
            steps {
                sh 'zx scripts/deploy.mjs --env ${DEPLOY_ENV} --version ${BUILD_NUMBER}'
            }
        }
    }

    post {
        success {
            sh 'zx scripts/notify.mjs --status success'
        }
        failure {
            sh 'zx scripts/notify.mjs --status failure'
        }
    }
}
```

### 11.3 通知脚本示例

**创建通知脚本** (`scripts/notify.mjs`)：

```javascript
#!/usr/bin/env zx
import { argv } from 'zx'

const status = argv.status
const jobName = process.env.JOB_NAME
const buildNumber = process.env.BUILD_NUMBER
const buildUrl = process.env.BUILD_URL

const webhookUrl = process.env.SLACK_WEBHOOK_URL

const message = {
  text:
    status === 'success'
      ? `✅ *${jobName}* #${buildNumber} succeeded`
      : `❌ *${jobName}* #${buildNumber} failed`,
  attachments: [
    {
      color: status === 'success' ? 'good' : 'danger',
      fields: [
        { title: 'Job', value: jobName, short: true },
        { title: 'Build', value: `#${buildNumber}`, short: true },
        { title: 'URL', value: buildUrl, short: false },
      ],
    },
  ],
}

await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(message),
})

console.log(`Notification sent: ${status}`)
```

### 11.4 多环境部署脚本

**创建部署脚本** (`scripts/multi-deploy.mjs`)：

```javascript
#!/usr/bin/env zx
import { argv, question, chalk } from 'zx'

const environments = ['dev', 'staging', 'prod']
const targetEnv = argv.env

if (!targetEnv) {
  console.log(chalk.yellow('Available environments:'))
  environments.forEach((env) => console.log(`  - ${env}`))
  process.exit(1)
}

if (!environments.includes(targetEnv)) {
  console.log(chalk.red(`Invalid environment: ${targetEnv}`))
  process.exit(1)
}

// 生产环境需要确认
if (targetEnv === 'prod') {
  const confirm = await question('⚠️  Deploy to PRODUCTION? (yes/no): ')
  if (confirm.toLowerCase() !== 'yes') {
    console.log(chalk.yellow('Deployment cancelled'))
    process.exit(0)
  }
}

console.log(chalk.blue(`\n🚀 Deploying to ${targetEnv}...\n`))

const configs = {
  dev: {
    namespace: 'development',
    replicas: 1,
    imageTag: 'latest',
  },
  staging: {
    namespace: 'staging',
    replicas: 2,
    imageTag: process.env.BUILD_NUMBER || 'latest',
  },
  prod: {
    namespace: 'production',
    replicas: 3,
    imageTag: process.env.BUILD_NUMBER || 'stable',
  },
}

const config = configs[targetEnv]

try {
  // 更新镜像
  console.log(chalk.gray('Updating image...'))
  await $`kubectl set image deployment/myapp -n ${config.namespace} myapp=myapp:${config.imageTag}`

  // 调整副本数
  console.log(chalk.gray('Scaling replicas...'))
  await $`kubectl scale deployment/myapp -n ${config.namespace} --replicas=${config.replicas}`

  // 等待部署完成
  console.log(chalk.gray('Waiting for rollout...'))
  await $`kubectl rollout status deployment/myapp -n ${config.namespace} --timeout=300s`

  console.log(chalk.green('\n✅ Deployment successful!\n'))
} catch (error) {
  console.error(chalk.red('\n❌ Deployment failed!'))
  console.error(chalk.red(error.message))

  // 回滚
  console.log(chalk.yellow('\n🔄 Rolling back...'))
  await $`kubectl rollout undo deployment/myapp -n ${config.namespace}`

  process.exit(1)
}
```

**Jenkins Pipeline**：

```groovy
pipeline {
    agent any

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'prod'], description: 'Target environment')
    }

    stages {
        stage('Deploy') {
            steps {
                sh 'zx scripts/multi-deploy.mjs --env ${ENVIRONMENT}'
            }
        }
    }
}
```

---

## 附录：常用命令速查

### 安装和运行

```bash
# 全局安装
npm install -g zx

# 运行脚本
zx script.mjs

# 使用 npx（无需安装）
npx zx script.mjs

# 从 URL 运行
npx zx https://example.com/script.mjs
```

### 核心 API

```javascript
// 执行命令
await $`command`

// 切换目录
cd('/path')

// 作用域隔离
await within(async () => {
  /* ... */
})

// 用户交互
const answer = await question('Question? ')

// 延迟
await sleep(1000)

// 重试
await retry(3, async () => {
  /* ... */
})
```

### 工具函数

```javascript
import { fs, path, os, chalk, argv } from 'zx'

// 文件操作
await fs.readFile('file.txt', 'utf8')
await fs.writeFile('file.txt', 'content')
await fs.exists('file.txt')

// 路径处理
path.join('/home', 'user')
path.basename('/home/user/file.txt')

// 彩色输出
chalk.red('Error')
chalk.green('Success')

// 命令行参数
argv.name
argv.verbose
```

---

## 参考资源

- **官方文档**: [https://google.github.io/zx/](https://google.github.io/zx/)
- **GitHub 仓库**: [https://github.com/google/zx](https://github.com/google/zx/)
- **Awesome zx**: [https://github.com/topics/zx](https://github.com/topics/zx)
- **Node.js 文档**: [https://nodejs.org/api/](https://nodejs.org/api/)

---

> 📌 **提示**：zx 让脚本编写变得更简单和愉快。结合 JavaScript/TypeScript 的强大功能和 npm 生态系统，你可以轻松创建复杂的自动化脚本。建议在团队中推广使用，提高 DevOps 效率。
