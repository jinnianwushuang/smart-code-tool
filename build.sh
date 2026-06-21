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