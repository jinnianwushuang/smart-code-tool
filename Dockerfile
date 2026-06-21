# 1. 使用官方轻量版 Nginx 镜像作为基础镜像
FROM nginx:alpine

# 2. 创建子目录（对应你 compose 里的子路径）
RUN mkdir -p /usr/share/nginx/html/smart-code-tool

# 3. 将本地打包好的 dist 目录下的所有文件，复制到镜像内的子目录中
COPY ./dist /usr/share/nginx/html/smart-code-tool/

# 4. (可选) 如果你的前端项目是 History 路由模式，需要自定义 Nginx 配置以防刷新 404
# COPY ./nginx.conf /etc/nginx/conf.d/smart-code-tool.conf

# 5. 暴露 80 端口
EXPOSE 80

# 6. 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]