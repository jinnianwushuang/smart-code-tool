---
title: 'Node.js 部署与运维体系 [P6-P7]'
level: 'senior'
tags: ['Node.js', 'Docker', 'CI/CD', 'PM2', '监控', '日志']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P6+ 高级工程师'
---

# Node.js 部署与运维体系 [P6-P7]

> Node.js 服务的部署和运维是前端全栈化的最后一环。2026 年，Docker 容器化 + PM2 进程管理 + 结构化日志 + 可观测性体系是生产环境的标准配置。

## 核心概念（What）

### 部署体系全景

```
开发环境 → 构建 → Docker 镜像 → 推送仓库 → K8s/ECS 部署
    │        │        │            │            │
  本地调试  Bundle  多阶段构建   Harbor/ECR   健康检查
  Hot Reload Tree-shake 安全扫描  版本标签   自动扩缩容
```

### 核心组件

| 组件     | 工具                       | 职责               |
| -------- | -------------------------- | ------------------ |
| 容器化   | Docker + multi-stage build | 环境一致性         |
| 进程管理 | PM2                        | 多进程、重启、日志 |
| 日志体系 | Pino + 日志收集            | 结构化日志         |
| 监控告警 | Prometheus + Grafana       | 指标采集与可视化   |
| 健康检查 | /health + /ready           | 服务存活与就绪检测 |

---

## 底层原理（Why）

### 1. Docker 多阶段构建

```dockerfile
# 阶段 1：安装依赖
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod

# 阶段 2：构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

# 阶段 3：生产运行
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

### 2. PM2 进程管理

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'api-server',
      script: 'dist/main.js',
      instances: 'max', // 根据 CPU 核数启动
      exec_mode: 'cluster', // 集群模式
      max_memory_restart: '512M', // 内存超限自动重启
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // 日志配置
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      merge_logs: true,
      // 重启策略
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      // 优雅关闭
      listen_timeout: 5000,
      kill_timeout: 5000,
    },
  ],
}
```

### 3. 结构化日志

```typescript
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // 生产环境使用 JSON 格式
  transport:
    process.env.NODE_ENV === 'production'
      ? undefined // 直接输出 JSON，由日志收集器处理
      : { target: 'pino-pretty', options: { colorize: true } },
  // 序列化敏感信息
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie'],
    censor: '[REDACTED]',
  },
})

// 使用
logger.info({ userId: 123, action: 'login' }, 'User logged in')
// 输出：{"level":30,"time":1699000000000,"userId":123,"action":"login","msg":"User logged in"}
```

### 4. 监控与健康检查

```typescript
import { collectDefaultMetrics, register, Counter, Histogram } from 'prom-client'

// 采集默认指标（CPU、内存、事件循环延迟等）
collectDefaultMetrics()

// 自定义指标
const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
})

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
})

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

// 就绪检查（检查依赖服务）
app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    await redis.ping()
    res.json({ status: 'ready' })
  } catch (err) {
    res.status(503).json({ status: 'not ready' })
  }
})

// Prometheus 指标端点
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})
```

### 5. BFF 层设计

```
BFF（Backend For Frontend）架构：

┌─────────┐     ┌─────────┐     ┌──────────────┐
│  Web 端  │────→│  BFF    │────→│ 微服务 A     │
└─────────┘     │ (Node)  │     └──────────────┘
                │         │     ┌──────────────┐
┌─────────┐     │  聚合   │────→│ 微服务 B     │
│ Mobile  │────→│  裁剪   │     └──────────────┘
└─────────┘     │  转换   │     ┌──────────────┘
                │         │────→│ 微服务 C     │
                └─────────┘     └──────────────┘

BFF 职责：
├── 接口聚合：多个微服务数据合并为一次响应
├── 数据裁剪：按端（Web/Mobile）返回不同字段
├── 格式转换：统一错误格式、分页格式
└── 鉴权：JWT 验证、权限校验
```

---

## 高频面试题

### Q1: PM2 cluster 模式的原理是什么？

**参考答案要点**：

- 基于 Node.js cluster 模块，master 进程 fork worker 进程
- 每个 worker 是独立的事件循环，充分利用多核 CPU
- 内置负载均衡（round-robin）
- 一个 worker 崩溃不影响其他 worker（自动重启）
- 注意：内存不共享，需要通过 Redis 等外部存储共享状态

### Q2: 如何实现 Node.js 服务的优雅关闭？

**参考答案要点**：

- 监听 SIGTERM/SIGINT 信号
- 停止接收新请求（关闭 HTTP server）
- 等待正在处理的请求完成（设置超时）
- 关闭数据库连接、Redis 连接
- 最后退出进程
- K8s 中 preStop hook 配合 terminationGracePeriodSeconds

### Q3: Docker 多阶段构建的好处是什么？

**参考答案要点**：

- 最终镜像只包含运行所需文件，体积更小
- 不包含构建工具和开发依赖，安全性更高
- 利用 Docker 层缓存，加速构建
- 非 root 用户运行，减少攻击面

---

## 延伸思考

1. **设计题**：设计一个支持水平扩展的 Node.js API 服务架构。
2. **场景题**：线上服务内存持续增长，如何排查和解决？
3. **对比题**：PM2 vs Docker vs K8s 部署 Node.js 服务，各自适用场景？

---

## 参考资料

- [PM2 文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Docker Node.js 最佳实践](https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md)
- [Pino 日志库](https://getpino.io)
- [Prometheus + Grafana 监控](https://prometheus.io/docs/introduction/overview/)
