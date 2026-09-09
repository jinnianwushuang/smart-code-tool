---
title: "Docker 容器化基础与前端部署 [P5-P6]"
level: "intermediate"
tags: ["Docker", "容器化", "部署", "Dockerfile", "docker-compose"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# Docker 容器化基础与前端部署 [P5-P6]

> Docker 是容器化技术，将应用和依赖打包成容器，保证在任何环境都能运行。前端工程师需要掌握 Docker 基础用于部署。

## 核心概念（What）

### Docker 基础

```
Docker = 容器化平台

核心概念：
├── 镜像（Image）→ 只读模板
├── 容器（Container）→ 镜像的运行实例
├── Dockerfile → 构建镜像的脚本
├── docker-compose → 多容器编排
└── Docker Hub → 镜像仓库

优势：
├── 环境一致性 → 开发/测试/生产相同
├── 快速部署 → 秒级启动
├── 资源隔离 → 互不影响
└── 易于扩展 → 水平扩展
```

## 底层原理（Why）

### Docker 基础命令

```bash
# 1. 镜像操作
docker pull nginx                    # 拉取镜像
docker images                        # 查看本地镜像
docker rmi nginx                     # 删除镜像
docker build -t my-app:1.0 .        # 构建镜像

# 2. 容器操作
docker run -d -p 3000:80 nginx      # 运行容器（后台）
docker ps                            # 查看运行中的容器
docker ps -a                         # 查看所有容器
docker stop <container-id>           # 停止容器
docker start <container-id>          # 启动容器
docker restart <container-id>        # 重启容器
docker rm <container-id>             # 删除容器

# 3. 进入容器
docker exec -it <container-id> /bin/bash

# 4. 查看日志
docker logs <container-id>
docker logs -f <container-id>        # 实时查看

# 5. 查看资源使用
docker stats                         # 实时资源使用

# 6. 清理
docker system prune                  # 清理未使用的资源
docker container prune               # 清理停止的容器
docker image prune                   # 清理未使用的镜像
```

### Dockerfile

```dockerfile
# 前端项目 Dockerfile

# 1. 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建
RUN npm run build

# 2. 运行阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
```

```dockerfile
# 多阶段构建（优化）

# 阶段 1：安装依赖
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# 阶段 2：构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 阶段 3：运行
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx 配置

```nginx
# nginx.conf

server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

### docker-compose

```yaml
# docker-compose.yml

version: '3.8'

services:
  # 前端应用
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - app-network

  # 后端 API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    depends_on:
      - db
    networks:
      - app-network

  # 数据库
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network

  # Redis 缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres-data:
```

```bash
# docker-compose 命令
docker-compose up -d                 # 启动所有服务
docker-compose down                  # 停止并删除
docker-compose ps                    # 查看服务状态
docker-compose logs                  # 查看日志
docker-compose logs -f frontend      # 查看指定服务日志
docker-compose restart               # 重启所有服务
docker-compose build                 # 重新构建
```

## 实战应用（How）

### 完整部署流程

```bash
# 1. 构建镜像
docker build -t my-frontend:1.0 .

# 2. 运行容器
docker run -d \
  --name my-app \
  -p 3000:80 \
  -e API_URL=https://api.example.com \
  my-frontend:1.0

# 3. 查看日志
docker logs my-app

# 4. 进入容器调试
docker exec -it my-app /bin/sh

# 5. 停止和删除
docker stop my-app
docker rm my-app
```

### 环境变量

```dockerfile
# Dockerfile
FROM nginx:alpine

# 复制模板文件
COPY nginx.conf.template /etc/nginx/templates/

# 环境变量会在容器启动时替换
ENV API_URL=http://localhost:8080
```

```javascript
// 运行时注入环境变量
// env-config.js
window.__ENV__ = {
  API_URL: '${API_URL}',
  APP_VERSION: '${APP_VERSION}'
};

// 代码中使用
const apiUrl = window.__ENV__.API_URL;
```

### 健康检查

```dockerfile
# Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
```

```yaml
# docker-compose.yml
services:
  frontend:
    build: .
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

### CI/CD 集成

```yaml
# .github/workflows/docker.yml
name: Docker Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            myapp/frontend:latest
            myapp/frontend:${{ github.sha }}
```

## 高频面试题

### Q1: Docker 的优势？

```
优势：
├── 环境一致性 → 开发/测试/生产相同
├── 快速部署 → 秒级启动
├── 资源隔离 → 容器互不影响
├── 易于扩展 → 水平扩展
├── 版本管理 → 镜像标签
└── 回滚方便 → 切换镜像版本
```

### Q2: 如何优化 Docker 镜像？

```
优化策略：
├── 使用多阶段构建 → 减小体积
├── 选择基础镜像 → alpine 版本
├── 合并 RUN 命令 → 减少层数
├── 使用 .dockerignore → 排除不必要文件
├── 利用缓存 → 不常变化的层放前面
└── 清理缓存 → rm -rf /var/cache/apk/*

示例：
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci && \
    npm cache clean --force
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Q3: docker-compose 的作用？

```
docker-compose：
├── 多容器编排
├── 一键启动所有服务
├── 服务间通信
├── 环境变量管理
└── 数据卷挂载

使用场景：
├── 本地开发环境
├── 测试环境
└── 小型生产环境

命令：
├── docker-compose up -d → 启动
├── docker-compose down → 停止
├── docker-compose logs → 日志
└── docker-compose ps → 状态
```

## 延伸思考

1. 如何在 Docker 中调试前端应用？
2. Kubernetes 和 Docker 的关系？
3. 如何做容器监控？

## 参考资料

- [Docker 官方文档](https://docs.docker.com/)
- [Docker 入门教程](https://docs.docker.com/get-started/)
