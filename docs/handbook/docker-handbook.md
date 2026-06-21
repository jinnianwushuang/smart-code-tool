# Docker 日常开发使用参考手册

> **版本**: 1.0  
> **最后更新**: 2026-06-19  
> **适用对象**: 开发人员、DevOps 工程师

---

## 目录

1. [基础概念](#1-基础概念)
2. [安装与配置](#2-安装与配置)
3. [镜像管理](#3-镜像管理)
4. [容器操作](#4-容器操作)
5. [Dockerfile 编写](#5-dockerfile-编写)
6. [Docker Compose](#6-docker-compose)
7. [网络配置](#7-网络配置)
8. [数据卷管理](#8-数据卷管理)
9. [日志与监控](#9-日志与监控)
10. [安全最佳实践](#10-安全最佳实践)
11. [性能优化](#11-性能优化)
12. [常见问题排查](#12-常见问题排查)
13. [常用命令速查](#13-常用命令速查)
14. [实战示例](#14-实战示例)

---

## 1. 基础概念

### 1.1 核心组件

```
┌─────────────┐
│   Docker    │
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────┐     ┌──────────┐
│   Docker    │────▶│  Images  │────▶│ Containers│
│   Daemon    │     │ (模板)   │     │ (实例)   │
└─────────────┘     └──────────┘     └──────────┘
                         ▲
                    ┌────┴────┐
                    │Registry │
                    │(仓库)   │
                    └─────────┘
```

- **Image（镜像）**: 只读模板，包含运行应用所需的代码、库和配置
- **Container（容器）**: 镜像的运行实例，轻量级、可移植
- **Dockerfile**: 构建镜像的脚本文件
- **Docker Compose**: 多容器应用编排工具
- **Volume（数据卷）**: 持久化数据存储
- **Network（网络）**: 容器间通信

### 1.2 与传统虚拟机的区别

| 特性     | Docker 容器    | 虚拟机       |
| -------- | -------------- | ------------ |
| 启动速度 | 秒级           | 分钟级       |
| 资源占用 | 低（共享内核） | 高（独立OS） |
| 隔离性   | 进程级         | 系统级       |
| 便携性   | 高             | 中           |
| 性能     | 接近原生       | 有损耗       |

---

## 2. 安装与配置

### 2.1 安装 Docker

#### macOS

```bash
# 使用 Homebrew
brew install --cask docker

# 或使用 Docker Desktop
# 下载: https://www.docker.com/products/docker-desktop
```

#### Ubuntu/Debian

```bash
# 更新包索引
sudo apt-get update

# 安装依赖
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加 Docker GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg

# 添加仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 验证安装
docker --version
docker compose version
```

#### CentOS/RHEL

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
```

### 2.2 配置 Docker

#### daemon.json 配置

```json
{
  "registry-mirrors": ["https://docker.mirrors.ustc.edu.cn", "https://hub-mirror.c.163.com"],
  "insecure-registries": [],
  "max-concurrent-downloads": 10,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 65536,
      "Soft": 65536
    }
  }
}
```

配置文件位置：

- Linux: `/etc/docker/daemon.json`
- macOS: Docker Desktop → Settings → Docker Engine
- Windows: Docker Desktop → Settings → Docker Engine

重启 Docker 使配置生效：

```bash
sudo systemctl restart docker
```

### 2.3 免 sudo 使用 Docker

```bash
# 创建 docker 组
sudo groupadd docker

# 将用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录或执行
newgrp docker

# 验证
docker ps
```

---

## 3. 镜像管理

### 3.1 搜索镜像

```bash
# 在 Docker Hub 搜索
docker search nginx
docker search --filter stars=100 python
docker search --filter is-official=true mysql

# 查看镜像详情
docker inspect nginx:latest
```

### 3.2 拉取镜像

```bash
# 拉取最新镜像
docker pull nginx

# 拉取指定版本
docker pull nginx:1.21-alpine
docker pull python:3.9-slim

# 拉取所有标签（不推荐，体积大）
docker pull --all-tags nginx
```

### 3.3 查看本地镜像

```bash
# 列出所有镜像
docker images
docker image ls

# 详细信息
docker images -a          # 包括中间层
docker images -q          # 只显示ID
docker images --digests   # 显示摘要

# 过滤
docker images --filter "reference=nginx:*"
docker images --filter "before=nginx:1.20"
docker images --filter "since=nginx:1.21"

# 查看镜像历史
docker history nginx:latest
```

### 3.4 删除镜像

```bash
# 删除单个镜像
docker rmi nginx:latest
docker image rm nginx:latest

# 强制删除
docker rmi -f nginx:latest

# 删除未使用的镜像
docker image prune        # 删除悬空镜像
docker image prune -a     # 删除所有未使用镜像
docker image prune -a --filter "until=24h"  # 删除24小时前创建的

# 批量删除
docker rmi $(docker images -q)
docker rmi $(docker images -f "dangling=true" -q)
```

### 3.5 构建镜像

```bash
# 基本构建
docker build -t myapp:1.0 .

# 指定 Dockerfile
docker build -t myapp:1.0 -f Dockerfile.prod .

# 构建参数
docker build --build-arg NODE_ENV=production -t myapp:1.0 .

# 不使用缓存
docker build --no-cache -t myapp:1.0 .

# 多阶段构建
docker build --target builder -t myapp:builder .
```

### 3.6 标记和推送镜像

```bash
# 标记镜像
docker tag myapp:1.0 username/myapp:1.0
docker tag myapp:1.0 registry.example.com/myapp:1.0

# 登录仓库
docker login
docker login registry.example.com

# 推送镜像
docker push username/myapp:1.0
docker push registry.example.com/myapp:1.0

# 推送所有标签
docker push --all-tags username/myapp
```

### 3.7 保存和加载镜像

```bash
# 保存为 tar 文件
docker save -o myapp.tar myapp:1.0
docker save myapp:1.0 | gzip > myapp.tar.gz

# 从 tar 文件加载
docker load -i myapp.tar
docker load < myapp.tar.gz

# 导出容器为镜像
docker export container_id > container.tar
docker import container.tar myapp:imported
```

### 3.8 清理镜像

```bash
# 系统清理
docker system df              # 查看磁盘使用
docker system prune           # 清理未使用资源
docker system prune -a        # 深度清理
docker system prune -a --volumes  # 包括数据卷

# 自动清理
docker builder prune          # 清理构建缓存
```

---

## 4. 容器操作

### 4.1 创建和启动容器

```bash
# 基本运行
docker run nginx

# 后台运行
docker run -d nginx

# 命名容器
docker run -d --name my-nginx nginx

# 端口映射
docker run -d -p 8080:80 nginx
docker run -d -p 127.0.0.1:8080:80 nginx  # 绑定特定IP
docker run -d -p 8080:80 -p 8443:443 nginx # 多端口

# 环境变量
docker run -d -e MYSQL_ROOT_PASSWORD=secret mysql
docker run -d --env-file .env myapp

# 挂载卷
docker run -d -v /host/path:/container/path nginx
docker run -d --mount type=bind,source=/host,target=/container nginx

# 资源限制
docker run -d --memory=512m --cpus=1.5 nginx
docker run -d --memory-reservation=256m nginx

# 网络
docker run -d --network my-network nginx
docker run -d --network host nginx

# 重启策略
docker run -d --restart=always nginx
docker run -d --restart=on-failure:5 nginx
docker run -d --restart=unless-stopped nginx
```

### 4.2 查看容器

```bash
# 列出容器
docker ps                   # 运行中的容器
docker ps -a                # 所有容器
docker ps -l                # 最后一个容器

# 详细信息
docker ps --format "{{.ID}}\t{{.Names}}\t{{.Status}}"
docker ps --filter "status=running"
docker ps --filter "name=nginx"

# 查看容器详情
docker inspect my-nginx
docker inspect --format='{{.NetworkSettings.IPAddress}}' my-nginx

# 查看容器日志
docker logs my-nginx
docker logs -f my-nginx             # 跟踪日志
docker logs --tail 100 my-nginx     # 最后100行
docker logs --since 1h my-nginx     # 最近1小时
docker logs --timestamps my-nginx   # 显示时间戳
```

### 4.3 进入容器

```bash
# 交互式终端
docker exec -it my-nginx bash
docker exec -it my-nginx sh

# 以 root 用户执行
docker exec -it -u root my-nginx bash

# 执行命令
docker exec my-nginx ls /var/www
docker exec my-nginx cat /etc/nginx/nginx.conf

# 复制文件
docker cp my-nginx:/etc/nginx/nginx.conf ./nginx.conf
docker cp ./index.html my-nginx:/usr/share/nginx/html/
```

### 4.4 停止和删除容器

```bash
# 停止容器
docker stop my-nginx
docker stop $(docker ps -q)     # 停止所有容器

# 强制停止
docker kill my-nginx

# 启动已停止的容器
docker start my-nginx

# 重启容器
docker restart my-nginx

# 暂停/恢复
docker pause my-nginx
docker unpause my-nginx

# 删除容器
docker rm my-nginx
docker rm -f my-nginx           # 强制删除运行中的容器
docker rm $(docker ps -aq)      # 删除所有容器

# 自动删除（运行时）
docker run --rm nginx           # 停止后自动删除
```

### 4.5 容器统计信息

```bash
# 实时统计
docker stats
docker stats my-nginx

# 一次性统计
docker stats --no-stream

# 查看进程
docker top my-nginx

# 查看变化
docker diff my-nginx
```

### 4.6 更新容器配置

```bash
# 更新资源限制
docker update --memory=1g --cpus=2 my-nginx

# 更新重启策略
docker update --restart=always my-nginx

# 重命名容器
docker rename old-name new-name
```

---

## 5. Dockerfile 编写

### 5.1 基本结构

```dockerfile
# 基础镜像
FROM node:18-alpine

# 元数据
LABEL maintainer="john@example.com"
LABEL version="1.0"
LABEL description="My Node.js Application"

# 工作目录
WORKDIR /app

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 复制文件
COPY package*.json ./
COPY . .

# 安装依赖
RUN npm ci --only=production

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动命令
CMD ["node", "server.js"]
```

### 5.2 指令详解

#### FROM - 基础镜像

```dockerfile
FROM ubuntu:20.04
FROM node:18-alpine AS builder
FROM scratch                    # 空镜像
```

#### RUN - 执行命令

```dockerfile
# 单行
RUN apt-get update && apt-get install -y curl

# 多行（推荐）
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    wget \
    git && \
    rm -rf /var/lib/apt/lists/*

# 合并层以减少镜像大小
RUN apt-get update && \
    apt-get install -y package1 package2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

#### COPY vs ADD

```dockerfile
# COPY - 复制本地文件（推荐）
COPY package.json /app/
COPY . /app/

# ADD - 支持URL和自动解压（少用）
ADD https://example.com/file.tar.gz /tmp/
ADD archive.tar.gz /app/

# 使用 .dockerignore 排除文件
# .dockerignore
node_modules
.git
*.md
.env
```

#### CMD vs ENTRYPOINT

```dockerfile
# CMD - 可被覆盖
CMD ["node", "server.js"]
CMD node server.js              # shell形式

# ENTRYPOINT - 不易被覆盖
ENTRYPOINT ["nginx", "-g", "daemon off;"]

# 组合使用
ENTRYPOINT ["python", "app.py"]
CMD ["--port", "8080"]          # 作为默认参数

# 运行时覆盖
docker run myapp --port 9000    # 覆盖CMD
docker run --entrypoint bash myapp  # 覆盖ENTRYPOINT
```

#### ENV vs ARG

```dockerfile
# ARG - 构建时参数，不保留在镜像中
ARG NODE_VERSION=18
ARG BUILD_DATE

# ENV - 环境变量，保留在镜像中
ENV APP_HOME=/app
ENV NODE_ENV=production

# 使用
FROM node:${NODE_VERSION}-alpine
RUN echo "Build date: ${BUILD_DATE}"
```

### 5.3 多阶段构建

```dockerfile
# 第一阶段：构建
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 第二阶段：生产
FROM node:18-alpine AS production

WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### 5.4 语言特定示例

#### Python

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# 安装Python依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用
COPY . .

# 非root用户
RUN useradd -m appuser
USER appuser

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
```

#### Java/Spring Boot

```dockerfile
FROM maven:3.8-openjdk-11 AS builder

WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:11-jre-slim

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Go

```dockerfile
FROM golang:1.19-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
```

#### Node.js

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# 非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
```

### 5.5 最佳实践

```dockerfile
# 1. 使用官方镜像和特定版本
FROM node:18.12-alpine

# 2. 设置工作目录
WORKDIR /app

# 3. 先复制依赖文件，利用缓存
COPY package*.json ./
RUN npm ci --only=production

# 4. 再复制源代码
COPY . .

# 5. 合并RUN指令，清理缓存
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    package1 \
    package2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# 6. 使用 .dockerignore
# node_modules
# .git
# *.log

# 7. 添加元数据
LABEL maintainer="team@example.com"
LABEL version="1.0.0"

# 8. 暴露端口
EXPOSE 3000

# 9. 使用非root用户
RUN adduser -D appuser
USER appuser

# 10. 添加健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

# 11. 使用CMD而非ENTRYPOINT（除非有特殊需求）
CMD ["node", "server.js"]
```

---

## 6. Docker Compose

### 6.1 基本概念

Docker Compose 用于定义和运行多容器 Docker 应用。

### 6.2 基本示例

#### 示例 1: Web + API + PostgreSQL

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - '8080:80'
    volumes:
      - ./app:/usr/share/nginx/html
    depends_on:
      - api
    networks:
      - frontend

  api:
    image: node:18-alpine
    command: node server.js
    working_dir: /app
    volumes:
      - ./api:/app
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    ports:
      - '3000:3000'
    depends_on:
      - db
    networks:
      - frontend
      - backend

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backend
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U admin']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:

networks:
  frontend:
  backend:
```

#### 示例 2: Node.js + MongoDB + Redis

```yaml
version: '3.8'

services:
  # Node.js 应用
  app:
    build:
      context: ./app
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      mongo:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app-network
    restart: unless-stopped
    volumes:
      - ./app:/app
      - /app/node_modules

  # MongoDB 数据库
  mongo:
    image: mongo:7-jammy
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secret
      MONGO_INITDB_DATABASE: myapp
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 40s

  # Redis 缓存
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass redispassword
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'redis-cli', '-a', 'redispassword', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  # MongoDB Express (可选，Web 管理界面)
  mongo-express:
    image: mongo-express:latest
    ports:
      - '8081:8081'
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: secret
      ME_CONFIG_MONGODB_URL: mongodb://admin:secret@mongo:27017/
      ME_CONFIG_BASICAUTH: false
    depends_on:
      - mongo
    networks:
      - app-network
    restart: unless-stopped

volumes:
  mongodb_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

**MongoDB 初始化脚本示例** (`./mongo-init/init.js`)：

```javascript
// 创建用户和索引
db = db.getSiblingDB('myapp')

// 创建应用用户
db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [{ role: 'readWrite', db: 'myapp' }],
})

// 创建集合和索引
db.createCollection('users')
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ createdAt: -1 })

db.createCollection('products')
db.products.createIndex({ name: 'text' })
db.products.createIndex({ price: 1 })

db.createCollection('orders')
db.orders.createIndex({ userId: 1 })
db.orders.createIndex({ status: 1, createdAt: -1 })

print('Database initialized successfully!')
```

**Dockerfile 示例** (`./app/Dockerfile`)：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

**使用命令**：

```bash
# 启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f app
docker compose logs -f mongo

# 进入 MongoDB shell
docker compose exec mongo mongosh -u admin -p secret

# 进入 Redis CLI
docker compose exec redis redis-cli -a redispassword

# 备份 MongoDB 数据
docker compose exec mongo mongodump --uri="mongodb://admin:secret@localhost:27017" --out=/dump

# 恢复 MongoDB 数据
docker compose exec mongo mongorestore --uri="mongodb://admin:secret@localhost:27017" /dump

# 停止服务
docker compose down

# 停止并删除数据卷（谨慎使用！）
docker compose down -v
```

### 6.3 常用命令

```bash
# 启动服务
docker compose up
docker compose up -d            # 后台运行
docker compose up --build       # 重新构建
docker compose up -d --scale web=3  # 扩展服务

# 停止服务
docker compose stop
docker compose down             # 停止并删除容器、网络
docker compose down -v          # 同时删除卷
docker compose down --rmi all   # 同时删除镜像

# 查看状态
docker compose ps
docker compose logs
docker compose logs -f web      # 跟踪特定服务日志

# 执行命令
docker compose exec web bash
docker compose exec db psql -U admin -d myapp

# 其他
docker compose config           # 验证配置
docker compose images           # 列出镜像
docker compose top              # 显示进程
docker compose restart          # 重启服务
docker compose pull             # 拉取镜像
```

### 6.4 环境变量

```yaml
# docker-compose.yml
services:
  web:
    image: nginx
    environment:
      - APP_NAME=myapp
      - DEBUG=false
    env_file:
      - .env
      - .env.production
```

```bash
# .env
APP_NAME=myapp
DEBUG=false
DB_HOST=localhost
DB_PORT=5432
```

```bash
# 使用变量替换
services:
  web:
    image: nginx:${NGINX_VERSION:-latest}
    ports:
      - "${WEB_PORT:-80}:80"
```

### 6.5 profiles 功能

```yaml
services:
  web:
    image: nginx
    profiles: ['frontend']

  monitoring:
    image: prometheus
    profiles: ['monitoring']

  redis:
    image: redis
    # 无profiles，始终启动
```

```bash
docker compose --profile frontend up -d
docker compose --profile monitoring up -d
docker compose --profile frontend --profile monitoring up -d
```

### 6.6 完整示例

```yaml
version: '3.8'

x-common-variables: &common-variables
  TZ: Asia/Shanghai
  LOG_LEVEL: info

services:
  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - static_files:/var/www/static
    depends_on:
      - web
      - api
    networks:
      - frontend
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost']
      interval: 30s
      timeout: 10s
      retries: 3

  # Web 前端
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    volumes:
      - static_files:/app/dist
    environment:
      <<: *common-variables
      API_URL: http://api:3000
    networks:
      - frontend
    restart: unless-stopped

  # API 后端
  api:
    build: ./api
    environment:
      <<: *common-variables
      DATABASE_URL: postgresql://admin:secret@db:5432/myapp
      REDIS_URL: redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - frontend
      - backend
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  # PostgreSQL 数据库
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U admin']
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis 缓存
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  # 任务队列 worker
  worker:
    build: ./api
    command: celery -A tasks worker --loglevel=info
    environment:
      <<: *common-variables
      DATABASE_URL: postgresql://admin:secret@db:5432/myapp
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - backend
    restart: unless-stopped
    deploy:
      replicas: 2

volumes:
  postgres_data:
  redis_data:
  static_files:

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true # 内部网络，外部不可访问
```

---

## 7. 网络配置

### 7.1 网络类型

```bash
# 查看网络
docker network ls

# 创建网络
docker network create my-network
docker network create --driver bridge my-bridge
docker network create --driver overlay my-overlay

# 查看网络详情
docker network inspect my-network

# 删除网络
docker network rm my-network
docker network prune
```

### 7.2 Bridge 网络（默认）

```bash
# 创建自定义桥接网络
docker network create --driver bridge \
  --subnet=172.20.0.0/16 \
  --gateway=172.20.0.1 \
  my-bridge

# 连接容器到网络
docker run -d --network my-bridge --name web nginx
docker run -d --network my-bridge --name api node

# 容器间通过名称通信
docker exec web ping api

# 连接已运行的容器
docker network connect my-bridge existing-container

# 断开连接
docker network disconnect my-bridge container
```

### 7.3 Host 网络

```bash
# 使用主机网络（共享主机网络栈）
docker run -d --network host nginx

# 注意：端口映射不起作用，直接使用主机端口
```

### 7.4 None 网络

```bash
# 无网络
docker run -d --network none nginx
```

### 7.5 Overlay 网络（Swarm）

```bash
# 初始化 Swarm
docker swarm init

# 创建 overlay 网络
docker network create -d overlay my-overlay

# 在 Swarm 服务中使用
docker service create --network my-overlay --name web nginx
```

### 7.6 DNS 和服务发现

```bash
# 自定义网络提供内置DNS
docker network create my-network
docker run -d --network my-network --name web nginx
docker run -d --network my-network --name api node

# 容器可以通过名称互相解析
docker exec api ping web
```

### 7.7 端口映射

```bash
# 基本映射
docker run -p 8080:80 nginx

# 指定协议
docker run -p 8080:80/tcp nginx
docker run -p 5353:53/udp dns-server

# 范围映射
docker run -p 8000-8010:8000-8010 nginx

# 动态端口
docker run -p 80 nginx  # 随机宿主端口
docker port container   # 查看映射
```

---

## 8. 数据卷管理

### 8.1 数据卷类型

```
1. Named Volumes（命名卷）- Docker管理
2. Bind Mounts（绑定挂载）- 主机目录
3. tmpfs Mounts - 内存存储
```

### 8.2 命名卷

```bash
# 创建卷
docker volume create my-volume
docker volume create --driver local \
  --opt type=tmpfs \
  --opt device=tmpfs \
  my-tmpfs

# 查看卷
docker volume ls
docker volume inspect my-volume

# 使用卷
docker run -d -v my-volume:/data nginx
docker run -d --mount source=my-volume,target=/data nginx

# 删除卷
docker volume rm my-volume
docker volume prune  # 删除未使用的卷
```

### 8.3 绑定挂载

```bash
# 基本用法
docker run -d -v /host/path:/container/path nginx
docker run -d --mount type=bind,source=/host/path,target=/container/path nginx

# 只读挂载
docker run -d -v /host/path:/container/path:ro nginx

# 相对路径
docker run -d -v ./data:/app/data nginx

# 绝对路径（推荐）
docker run -d -v /absolute/path:/container/path nginx
```

### 8.4 tmpfs 挂载

```bash
# 内存存储（重启后数据丢失）
docker run -d --tmpfs /tmp nginx
docker run -d --mount type=tmpfs,target=/tmp,tmpfs-size=100m nginx
```

### 8.5 数据卷备份和恢复

```bash
# 备份
docker run --rm \
  -v my-volume:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz -C /data .

# 恢复
docker run --rm \
  -v my-volume:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/backup.tar.gz -C /data

# 迁移到其他容器
docker run --rm \
  -v source-volume:/from \
  -v dest-volume:/to \
  alpine ash -c "cd /from && cp -av . /to"
```

### 8.6 Docker Compose 中的数据卷

```yaml
version: '3.8'

services:
  db:
    image: postgres
    volumes:
      # 命名卷
      - postgres_data:/var/lib/postgresql/data

      # 绑定挂载
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

      # 只读挂载
      - ./config:/etc/postgresql:ro

  app:
    image: myapp
    volumes:
      # 匿名卷
      - /app/logs

      # tmpfs
      - type: tmpfs
        target: /tmp
        tmpfs:
          size: 100m

volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /path/on/host
```

---

## 9. 日志与监控

### 9.1 日志驱动

```bash
# 查看日志驱动
docker info | grep Logging

# 运行时指定
docker run -d --log-driver json-file nginx
docker run -d --log-driver syslog nginx
docker run -d --log-driver journald nginx

# 配置日志选项
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  nginx
```

### 9.2 查看日志

```bash
# 基本日志
docker logs container

# 实时跟踪
docker logs -f container

# 时间范围
docker logs --since 1h container
docker logs --since 2023-01-01T00:00:00 container
docker logs --until 10m container

# 行数限制
docker logs --tail 100 container
docker logs --tail all container

# 时间戳
docker logs -t container

# 详细信息
docker logs --details container
```

### 9.3 容器监控

```bash
# 实时统计
docker stats
docker stats container1 container2

# 一次性输出
docker stats --no-stream

# 格式化输出
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# 容器详情
docker inspect container
docker inspect --format='{{.State.Status}}' container
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container

# 进程信息
docker top container
docker top container -eo pid,comm
```

### 9.4 健康检查

```dockerfile
# Dockerfile 中定义
HEALTHCHECK --interval=30s \
  --timeout=3s \
  --start-period=5s \
  --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1
```

```yaml
# Docker Compose 中定义
services:
  web:
    image: nginx
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

```bash
# 查看健康状态
docker inspect --format='{{.State.Health.Status}}' container
docker ps --filter "health=healthy"
docker ps --filter "health=unhealthy"
```

### 9.5 事件监控

```bash
# 实时事件
docker events
docker events --filter event=start
docker events --filter container=my-container

# 历史记录
docker events --since 1h
docker events --until 10m

# 格式化输出
docker events --format '{{.Time}} {{.Actor.Attributes.name}} {{.Action}}'
```

### 9.6 监控工具集成

#### Prometheus + Grafana

```yaml
version: '3.8'

services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports:
      - '8080:8080'
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    restart: unless-stopped

  prometheus:
    image: prom/prometheus
    ports:
      - '9090:9090'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

  grafana:
    image: grafana/grafana
    ports:
      - '3000:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    restart: unless-stopped

volumes:
  grafana_data:
```

---

## 10. 安全最佳实践

### 10.1 最小权限原则

```dockerfile
# 使用非root用户
FROM node:18-alpine

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app
COPY --chown=appuser:appgroup . .

USER appuser
CMD ["node", "server.js"]
```

### 10.2 镜像安全扫描

```bash
# Docker Scout
docker scout quickview image
docker scout cves image

# Trivy
trivy image nginx:latest
trivy image --severity HIGH,CRITICAL nginx:latest

# Clair
# 集成到CI/CD流程
```

### 10.3 敏感信息管理

```bash
# 不要硬编码密码
# ❌ 错误做法
docker run -e DB_PASSWORD=secret myapp

# ✅ 使用 Docker Secrets（Swarm）
echo "secret" | docker secret create db_password -
docker service create --secret db_password myapp

# ✅ 使用环境变量文件
docker run --env-file .env myapp

# ✅ 使用密钥管理服务
docker run -e VAULT_TOKEN=token myapp
```

```yaml
# Docker Compose secrets
version: '3.8'

services:
  db:
    image: postgres
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### 10.4 网络安全

```bash
# 使用自定义网络
docker network create --driver bridge isolated-network

# 限制端口暴露
docker run -p 127.0.0.1:8080:80 nginx

# 内部网络（仅容器间通信）
docker network create --internal backend

# 禁用容器间通信
docker network create --opt com.docker.network.bridge.enable_icc=false my-network
```

### 10.5 资源限制

```bash
# CPU和内存限制
docker run -d \
  --memory=512m \
  --memory-reservation=256m \
  --cpus=1.5 \
  --pids-limit=100 \
  nginx

# 防止OOM
docker run -d --oom-kill-disable=false --memory=512m nginx
```

```yaml
# Docker Compose
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
```

### 10.6 安全配置清单

```dockerfile
# 1. 使用官方镜像和特定版本
FROM node:18.12-alpine

# 2. 添加元数据
LABEL maintainer="security@example.com"

# 3. 更新系统包
RUN apk update && apk upgrade

# 4. 只安装必要的包
RUN apk add --no-cache curl

# 5. 使用非root用户
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 6. 设置工作目录
WORKDIR /app

# 7. 复制文件并设置权限
COPY --chown=appuser:appgroup . .

# 8. 切换到非root用户
USER appuser

# 9. 暴露必要端口
EXPOSE 3000

# 10. 添加健康检查
HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1

# 11. 使用CMD而非shell形式
CMD ["node", "server.js"]
```

---

## 11. 性能优化

### 11.1 镜像优化

```dockerfile
# 1. 使用 Alpine 基础镜像
FROM node:18-alpine        # ~100MB
# vs
FROM node:18               # ~900MB

# 2. 多阶段构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]

# 3. 减少层数
RUN apt-get update && \
    apt-get install -y pkg1 pkg2 pkg3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 4. 使用 .dockerignore
# node_modules
# .git
# *.md
# .env

# 5. 按变化频率排序
COPY package*.json ./      # 变化少
RUN npm ci
COPY . .                   # 变化多
```

### 11.2 构建缓存优化

```dockerfile
# 利用层缓存
FROM node:18-alpine

WORKDIR /app

# 先复制依赖文件（变化少）
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 再复制源代码（变化多）
COPY . .

RUN yarn build
CMD ["node", "dist/index.js"]
```

### 11.3 运行时优化

```bash
# 1. 使用资源限制
docker run -d \
  --memory=512m \
  --cpus=1 \
  --pids-limit=100 \
  myapp

# 2. 使用合适的重启策略
docker run -d --restart=unless-stopped myapp

# 3. 优化日志
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  myapp

# 4. 使用 tmpfs 提高I/O性能
docker run -d \
  --tmpfs /tmp:rw,size=100m \
  myapp
```

### 11.4 网络优化

```bash
# 1. 使用 host 网络模式（高性能场景）
docker run -d --network host myapp

# 2. 优化 DNS
docker run -d \
  --dns 8.8.8.8 \
  --dns-search example.com \
  myapp

# 3. 调整网络缓冲区
docker run -d \
  --sysctl net.core.somaxconn=65535 \
  myapp
```

### 11.5 存储优化

```bash
# 1. 清理未使用资源
docker system prune -a --volumes

# 2. 定期清理
docker builder prune
docker volume prune
docker network prune

# 3. 使用 overlay2 存储驱动
# /etc/docker/daemon.json
{
  "storage-driver": "overlay2"
}
```

### 11.6 性能监控

```bash
# 实时监控
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# 详细分析
docker inspect --format='{{.HostConfig.Memory}}' container
docker inspect --format='{{.HostConfig.CpuShares}}' container

# 使用 cAdvisor
docker run -d \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --publish=8080:8080 \
  google/cadvisor:latest
```

---

## 12. 常见问题排查

### 12.1 容器无法启动

```bash
# 1. 查看日志
docker logs container
docker logs --tail 100 container

# 2. 查看容器状态
docker inspect container | jq '.[0].State'

# 3. 检查资源限制
docker inspect container | jq '.[0].HostConfig'

# 4. 测试镜像
docker run -it --entrypoint sh image_name
```

### 12.2 网络连接问题

```bash
# 1. 检查网络
docker network ls
docker network inspect network_name

# 2. 检查容器IP
docker inspect container | jq '.[0].NetworkSettings'

# 3. 测试连通性
docker exec container ping other_container
docker exec container curl http://other_container:port

# 4. 检查端口映射
docker port container
netstat -tulpn | grep port
```

### 12.3 磁盘空间不足

```bash
# 1. 检查磁盘使用
docker system df
df -h /var/lib/docker

# 2. 清理资源
docker system prune -a --volumes
docker builder prune -a

# 3. 查找大镜像
docker images --format "{{.Size}}\t{{.Repository}}:{{.Tag}}" | sort -hr

# 4. 清理日志
truncate -s 0 /var/lib/docker/containers/*/ *-json.log
```

### 12.4 权限问题

```bash
# 1. 文件权限
docker exec container ls -la /path
docker exec container chmod 755 /path/file

# 2. 用户权限
docker run -u $(id -u):$(id -g) image

# 3. SELinux/AppArmor
# 临时禁用测试
docker run --security-opt label=disable image
```

### 12.5 性能问题

```bash
# 1. 检查资源使用
docker stats
top
htop

# 2. 检查I/O
docker exec container iostat -x 1
iotop

# 3. 检查网络
docker exec container netstat -s
tcpdump -i any port 80

# 4. 分析容器
docker exec container ps aux
docker exec container free -m
```

### 12.6 调试技巧

```bash
# 1. 进入运行中的容器
docker exec -it container bash

# 2. 以交互模式启动
docker run -it --entrypoint sh image

# 3. 保持容器运行
docker run -d nginx sleep infinity

# 4. 复制文件进行调试
docker cp container:/path/to/file ./local-file

# 5. 查看详细日志
docker events
journalctl -u docker.service -f
```

### 12.7 常见错误及解决方案

```bash
# Error: port already allocated
# 解决：检查端口占用
lsof -i :8080
docker ps | grep 8080

# Error: no space left on device
# 解决：清理资源
docker system prune -a

# Error: permission denied
# 解决：检查权限
sudo usermod -aG docker $USER
chmod 666 /var/run/docker.sock

# Error: connection refused
# 解决：检查网络和防火墙
docker network inspect network
iptables -L

# Error: image not found
# 解决：拉取镜像
docker pull image:tag
```

---

## 13. 常用命令速查

### 13.1 镜像命令

```bash
# 搜索和拉取
docker search keyword
docker pull image:tag

# 查看
docker images
docker images -a
docker history image

# 构建
docker build -t name:tag .
docker build -f Dockerfile.prod -t name:tag .

# 删除
docker rmi image
docker rmi $(docker images -q)

# 保存和加载
docker save -o file.tar image
docker load -i file.tar

# 标记和推送
docker tag image user/repo:tag
docker push user/repo:tag
```

### 13.2 容器命令

```bash
# 运行
docker run -d --name name -p 80:80 image
docker run -it image bash

# 查看
docker ps
docker ps -a
docker logs container
docker logs -f container

# 操作
docker start container
docker stop container
docker restart container
docker rm container
docker rm -f container

# 进入
docker exec -it container bash
docker exec container command

# 复制
docker cp container:path ./local
docker cp ./local container:path

# 统计
docker stats
docker top container
docker inspect container
```

### 13.3 网络和卷

```bash
# 网络
docker network ls
docker network create name
docker network inspect name
docker network connect network container
docker network disconnect network container

# 卷
docker volume ls
docker volume create name
docker volume inspect name
docker volume rm name
docker volume prune
```

### 13.4 Docker Compose

```bash
# 基本操作
docker compose up -d
docker compose down
docker compose down -v

# 查看
docker compose ps
docker compose logs
docker compose logs -f service

# 执行
docker compose exec service bash
docker compose run service command

# 其他
docker compose build
docker compose pull
docker compose restart
docker compose scale service=3
```

### 13.5 系统管理

```bash
# 信息
docker info
docker version
docker system df

# 清理
docker system prune
docker system prune -a
docker system prune -a --volumes

# 事件
docker events
docker events --filter event=start

# 守护进程
sudo systemctl start docker
sudo systemctl stop docker
sudo systemctl restart docker
sudo systemctl status docker
```

---

## 14. 实战示例

### 14.1 WordPress 部署

```yaml
version: '3.8'

services:
  wordpress:
    image: wordpress:latest
    ports:
      - '8080:80'
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: secret
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress_data:/var/www/html
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: secret
      MYSQL_ROOT_PASSWORD: rootsecret
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  wordpress_data:
  db_data:
```

### 14.2 Redis 集群

```yaml
version: '3.8'

services:
  redis-master:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    ports:
      - '6379:6379'
    volumes:
      - redis_master_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  redis-slave:
    image: redis:7-alpine
    command: redis-server --replicaof redis-master 6379 --appendonly yes
    depends_on:
      - redis-master
    volumes:
      - redis_slave_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  redis_master_data:
  redis_slave_data:
```

### 14.3 ELK Stack

```yaml
version: '3.8'

services:
  elasticsearch:
    image: elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
      - xpack.security.enabled=false
    volumes:
      - es_data:/usr/share/elasticsearch/data
    ports:
      - '9200:9200'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:9200']
      interval: 30s
      timeout: 10s
      retries: 5

  logstash:
    image: logstash:8.5.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      - '5044:5044'
      - '5000:5000/tcp'
      - '5000:5000/udp'
    depends_on:
      - elasticsearch

  kibana:
    image: kibana:8.5.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - '5601:5601'
    depends_on:
      - elasticsearch

volumes:
  es_data:
```

### 14.4 CI/CD Runner

```yaml
version: '3.8'

services:
  gitlab-runner:
    image: gitlab/gitlab-runner:latest
    volumes:
      - ./config:/etc/gitlab-runner
      - /var/run/docker.sock:/var/run/docker.sock
    restart: unless-stopped

  docker-in-docker:
    image: docker:20-dind
    privileged: true
    volumes:
      - docker_data:/var/lib/docker
    restart: unless-stopped

volumes:
  docker_data:
```

### 14.5 开发环境

```yaml
version: '3.8'

services:
  # Node.js 开发
  node-dev:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./app:/app
      - node_modules:/app/node_modules
    ports:
      - '3000:3000'
    command: npm run dev
    environment:
      - NODE_ENV=development

  # Python 开发
  python-dev:
    image: python:3.9-slim
    working_dir: /app
    volumes:
      - ./backend:/app
    ports:
      - '8000:8000'
    command: python manage.py runserver 0.0.0.0:8000
    environment:
      - DEBUG=true

  # 数据库
  postgres-dev:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: devdb
    ports:
      - '5432:5432'
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  # Redis
  redis-dev:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  # Mailhog (邮件测试)
  mailhog:
    image: mailhog/mailhog
    ports:
      - '1025:1025'
      - '8025:8025'

volumes:
  node_modules:
  postgres_dev_data:
```

### 14.6 微服务架构

```yaml
version: '3.8'

services:
  # API Gateway
  gateway:
    build: ./gateway
    ports:
      - '80:8080'
    depends_on:
      - user-service
      - order-service
      - product-service
    networks:
      - public
      - internal

  # User Service
  user-service:
    build: ./services/user
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres/users
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - internal

  # Order Service
  order-service:
    build: ./services/order
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres/orders
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
    depends_on:
      - postgres
      - rabbitmq
    networks:
      - internal

  # Product Service
  product-service:
    build: ./services/product
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres/products
      - ELASTICSEARCH_URL=http://elasticsearch:9200
    depends_on:
      - postgres
      - elasticsearch
    networks:
      - internal

  # Infrastructure
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - internal

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - internal

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - '15672:15672'
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - internal

  elasticsearch:
    image: elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - es_data:/usr/share/elasticsearch/data
    networks:
      - internal

  kibana:
    image: kibana:8.5.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - '5601:5601'
    depends_on:
      - elasticsearch
    networks:
      - internal

networks:
  public:
  internal:
    internal: true

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  es_data:
```

---

## 附录

### A. Docker 快捷键别名

```bash
# ~/.bashrc 或 ~/.zshrc

# 容器操作
alias dps='docker ps'
alias dpsa='docker ps -a'
alias dstop='docker stop $(docker ps -q)'
alias drm='docker rm $(docker ps -aq)'
alias dlogs='docker logs -f'

# 镜像操作
alias di='docker images'
alias drmi='docker rmi $(docker images -q)'
alias dprune='docker system prune -a --volumes'

# Compose
alias dcu='docker compose up -d'
alias dcd='docker compose down'
alias dcps='docker compose ps'
alias dclogs='docker compose logs -f'
alias dcexec='docker compose exec'

# 快捷函数
dsh() {
    docker exec -it $1 bash
}

dip() {
    docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $1
}

dclean() {
    docker system prune -a --volumes -f
}
```

### B. 有用的资源

- **官方文档**: https://docs.docker.com/
- **Docker Hub**: https://hub.docker.com/
- **最佳实践**: https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
- **安全扫描**: https://docs.docker.com/scout/
- **Compose 参考**: https://docs.docker.com/compose/compose-file/

### C. 版本兼容性

| Docker 版本 | Compose 版本 | 发布日期 |
| ----------- | ------------ | -------- |
| 20.10+      | 2.x          | 2020-12  |
| 19.03+      | 1.29.x       | 2019-07  |
| 18.09+      | 1.25.x       | 2018-12  |

---

**祝您使用 Docker 愉快！** 🐳

如有问题，请查阅官方文档或社区论坛。
