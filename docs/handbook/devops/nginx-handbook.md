# Nginx 速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-21  
> **适用对象**: 后端开发人员、DevOps 工程师、系统管理员

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、安装与配置](#二安装与配置)
- [三、核心配置](#三核心配置)
- [四、反向代理](#四反向代理)
- [五、负载均衡](#五负载均衡)
- [六、SSL/HTTPS](#六sslhttps)
- [七、静态文件服务](#七静态文件服务)
- [八、URL 重写](#八url-重写)
- [九、性能优化](#九性能优化)
- [十、安全配置](#十安全配置)
- [十一、日志管理](#十一日志管理)
- [十二、常用命令](#十二常用命令)
- [十三、故障排查](#十三故障排查)
- [十四、实用配置示例](#十四实用配置示例)

---

## 一、基础概念

### 1.1 Nginx 是什么

Nginx 是一个高性能的 HTTP 和反向代理服务器，也是一个 IMAP/POP3/SMTP 代理服务器。

**特点**：

- ⚡ 高并发处理能力
- 💾 低内存占用
- 🔧 配置灵活
- 🌐 支持热部署
- 🛡️ 稳定性强

### 1.2 架构模型

```
Client → Nginx (Master Process)
              ↓
        Worker Process 1
        Worker Process 2
        Worker Process 3
        ...
              ↓
        Backend Servers
```

**关键概念**：

- **Master Process**：主进程，负责管理和监控 Worker 进程
- **Worker Process**：工作进程，处理实际请求
- **Event-driven**：事件驱动架构，非阻塞 I/O
- **Asynchronous**：异步处理，高并发支持

### 1.3 配置文件结构

```nginx
# 全局块
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

# 事件块
events {
    worker_connections 1024;
}

# HTTP 块
http {
    include /etc/nginx/mime.types;

    # 上游服务器
    upstream backend {
        server 127.0.0.1:3000;
    }

    # 服务器块
    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend;
        }
    }
}
```

---

## 二、安装与配置

### 2.1 安装 Nginx

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### CentOS/RHEL

```bash
sudo yum install epel-release
sudo yum install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### macOS

```bash
brew install nginx
brew services start nginx
```

#### Docker

```bash
docker run -d \
  --name nginx \
  -p 80:80 \
  -p 443:443 \
  -v /path/to/config:/etc/nginx/conf.d \
  -v /path/to/html:/usr/share/nginx/html \
  nginx:latest
```

### 2.2 验证安装

```bash
# 检查版本
nginx -v

# 测试配置文件
nginx -t

# 查看编译参数
nginx -V

# 检查运行状态
systemctl status nginx
```

### 2.3 目录结构

```
/etc/nginx/
├── nginx.conf              # 主配置文件
├── mime.types              # MIME 类型映射
├── conf.d/                 # 额外配置文件
│   ├── default.conf
│   └── custom.conf
├── sites-available/        # 可用站点配置（Debian）
├── sites-enabled/          # 已启用站点配置（Debian）
├── modules-available/      # 可用模块
├── modules-enabled/        # 已启用模块
└── snippets/               # 配置片段

/var/log/nginx/
├── access.log              # 访问日志
└── error.log               # 错误日志

/usr/share/nginx/html/      # 默认网站根目录
```

---

## 三、核心配置

### 3.1 全局配置

```nginx
# 运行用户
user nginx;

# Worker 进程数（通常设置为 CPU 核心数）
worker_processes auto;

# 错误日志
error_log /var/log/nginx/error.log warn;

# PID 文件
pid /run/nginx.pid;

# 自动重启 Worker 进程
worker_rlimit_nofile 65535;
```

### 3.2 事件配置

```nginx
events {
    # 每个 Worker 的最大连接数
    worker_connections 1024;

    # 使用 epoll（Linux）或 kqueue（macOS/BSD）
    use epoll;

    # 多接受模式
    multi_accept on;
}
```

### 3.3 HTTP 配置

```nginx
http {
    # 包含 MIME 类型
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    # 访问日志
    access_log /var/log/nginx/access.log main;

    # 发送文件优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # 超时设置
    keepalive_timeout 65;
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;

    # 上传文件大小限制
    client_max_body_size 10m;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

### 3.4 Server 配置

```nginx
server {
    # 监听端口
    listen 80;
    listen [::]:80;           # IPv6

    # 服务器名称
    server_name example.com www.example.com;

    # 网站根目录
    root /var/www/html;
    index index.html index.htm;

    # 字符集
    charset utf-8;

    # 默认位置
    location / {
        try_files $uri $uri/ =404;
    }
}
```

---

## 四、反向代理

### 4.1 基本反向代理

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;

        # 传递真实 IP
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
}
```

### 4.2 WebSocket 代理

```nginx
server {
    listen 80;
    server_name ws.example.com;

    location /ws {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

### 4.3 路径转发

```nginx
server {
    listen 80;
    server_name example.com;

    # API 请求转发到后端
    location /api/ {
        proxy_pass http://backend_api;
        proxy_set_header Host $host;
    }

    # 前端应用
    location / {
        root /var/www/frontend;
        try_files $uri $uri/ /index.html;
    }
}
```

### 4.4 代理缓存

```nginx
http {
    # 定义缓存区域
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

    server {
        location / {
            proxy_pass http://backend;

            # 启用缓存
            proxy_cache my_cache;
            proxy_cache_valid 200 302 10m;
            proxy_cache_valid 404 1m;
            proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;

            # 添加缓存头
            add_header X-Cache-Status $upstream_cache_status;
        }
    }
}
```

---

## 五、负载均衡

### 5.1 轮询（默认）

```nginx
upstream backend {
    server 192.168.1.10:3000;
    server 192.168.1.11:3000;
    server 192.168.1.12:3000;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

### 5.2 加权轮询

```nginx
upstream backend {
    server 192.168.1.10:3000 weight=3;  # 3/6 的请求
    server 192.168.1.11:3000 weight=2;  # 2/6 的请求
    server 192.168.1.12:3000 weight=1;  # 1/6 的请求
}
```

### 5.3 IP Hash（会话保持）

```nginx
upstream backend {
    ip_hash;
    server 192.168.1.10:3000;
    server 192.168.1.11:3000;
    server 192.168.1.12:3000;
}
```

### 5.4 最少连接

```nginx
upstream backend {
    least_conn;
    server 192.168.1.10:3000;
    server 192.168.1.11:3000;
    server 192.168.1.12:3000;
}
```

### 5.5 健康检查

```nginx
upstream backend {
    server 192.168.1.10:3000 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:3000 max_fails=3 fail_timeout=30s;
    server 192.168.1.12:3000 backup;  # 备份服务器
    server 192.168.1.13:3000 down;    # 标记为不可用
}
```

### 5.6 完整示例

```nginx
upstream app_servers {
    least_conn;

    server 10.0.1.10:3000 weight=5 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:3000 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3000 weight=2 max_fails=3 fail_timeout=30s;
    server 10.0.1.13:3000 backup;

    keepalive 32;
}

server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://app_servers;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

---

## 六、SSL/HTTPS

### 6.1 基本 HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        root /var/www/html;
    }
}
```

### 6.2 HTTP 强制跳转 HTTPS

```nginx
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    location / {
        root /var/www/html;
    }
}
```

### 6.3 Let's Encrypt 自动续期

```nginx
server {
    listen 80;
    server_name example.com;

    # Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # 其他请求重定向到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

**获取证书**：

```bash
sudo certbot certonly --webroot -w /var/www/certbot -d example.com
```

### 6.4 SSL 优化配置

```nginx
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
```

---

## 七、静态文件服务

### 7.1 基本静态文件

```nginx
server {
    listen 80;
    server_name static.example.com;

    root /var/www/static;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

### 7.2 静态文件优化

```nginx
server {
    listen 80;
    server_name static.example.com;

    root /var/www/static;

    # 启用发送文件
    sendfile on;
    tcp_nopush on;

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # HTML 不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
    gzip_min_length 1000;
}
```

### 7.3 目录列表

```nginx
location /downloads/ {
    autoindex on;
    autoindex_exact_size off;
    autoindex_localtime on;
}
```

### 7.4 防盗链

```nginx
location ~* \.(jpg|jpeg|png|gif)$ {
    valid_referers none blocked example.com *.example.com;

    if ($invalid_referer) {
        return 403;
        # 或者返回默认图片
        # rewrite ^/ /images/forbidden.png break;
    }
}
```

---

## 八、URL 重写

### 8.1 基本重写

```nginx
# 永久重定向（301）
rewrite ^/old-page$ /new-page permanent;

# 临时重定向（302）
rewrite ^/temp-page$ /new-page redirect;

# 内部重写
rewrite ^/api/v1/(.*)$ /api/v2/$1 last;
```

### 8.2 正则重写

```nginx
# 捕获组
rewrite ^/users/(\d+)$ /profile?id=$1 last;

# 多个捕获组
rewrite ^/blog/(\d{4})/(\d{2})/(.+)$ /articles?year=$1&month=$2&slug=$3 last;

# 条件重写
if ($request_uri ~* "^/old/(.*)") {
    rewrite ^ /new/$1 permanent;
}
```

### 8.3 SEO 友好 URL

```nginx
# 移除 .html 扩展名
location / {
    try_files $uri $uri.html $uri/ =404;
}

# 美化 URL
rewrite ^/product/([a-z0-9-]+)$ /products.php?slug=$1 last;
```

### 8.4 canonical URL

```nginx
# 强制 www
server {
    listen 80;
    server_name example.com;
    return 301 https://www.example.com$request_uri;
}

# 强制不带 www
server {
    listen 80;
    server_name www.example.com;
    return 301 https://example.com$request_uri;
}

# 强制 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

### 8.5 维护页面

```nginx
# 启用维护模式
set $maintenance 0;
if (-f /var/www/maintenance.html) {
    set $maintenance 1;
}

if ($maintenance = 1) {
    return 503;
}

error_page 503 @maintenance;
location @maintenance {
    rewrite ^ /maintenance.html last;
}
```

---

## 九、性能优化

### 9.1 Worker 进程优化

```nginx
# 设置为 CPU 核心数
worker_processes auto;

# 每个 Worker 的连接数
events {
    worker_connections 4096;
    multi_accept on;
}

# 文件描述符限制
worker_rlimit_nofile 65535;
```

### 9.2 缓冲优化

```nginx
http {
    # 客户端 body 缓冲
    client_body_buffer_size 16k;
    client_body_temp_path /var/nginx/client_body_temp;

    # 代理缓冲
    proxy_buffering on;
    proxy_buffer_size 8k;
    proxy_buffers 8 8k;
    proxy_busy_buffers_size 16k;

    # FastCGI 缓冲
    fastcgi_buffering on;
    fastcgi_buffer_size 8k;
    fastcgi_buffers 8 8k;
}
```

### 9.3 缓存优化

```nginx
http {
    # 开放文件缓存
    open_file_cache max=10000 inactive=60s;
    open_file_cache_valid 60s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # 代理缓存
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;
}
```

### 9.4 Gzip 压缩

```nginx
http {
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/json
        application/javascript
        application/x-javascript
        text/xml
        application/xml
        application/xml+rss
        image/svg+xml;
}
```

### 9.5 Brotli 压缩（需要模块）

```nginx
http {
    brotli on;
    brotli_comp_level 6;
    brotli_types
        text/plain
        text/css
        application/javascript
        application/json
        image/svg+xml;
}
```

### 9.6 HTTP/2

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    # HTTP/2 会自动启用服务器推送
    # 手动推送资源
    http2_push /css/style.css;
    http2_push /js/app.js;
}
```

### 9.7 连接优化

```nginx
http {
    # Keepalive
    keepalive_timeout 65;
    keepalive_requests 100;

    # TCP 优化
    tcp_nopush on;
    tcp_nodelay on;

    # 重置超时
    reset_timedout_connection on;
}
```

---

## 十、安全配置

### 10.1 隐藏版本信息

```nginx
http {
    server_tokens off;
}

# 自定义响应头
more_clear_headers Server;
add_header X-Powered-By "";
```

### 10.2 安全头

```nginx
server {
    # 防止点击劫持
    add_header X-Frame-Options "SAMEORIGIN" always;

    # XSS 保护
    add_header X-XSS-Protection "1; mode=block" always;

    # 内容类型嗅探保护
    add_header X-Content-Type-Options "nosniff" always;

    # 严格传输安全（HSTS）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 内容安全策略
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" always;

    # 引用策略
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 权限策略
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
}
```

### 10.3 限制请求方法

```nginx
server {
    # 只允许 GET, POST, HEAD
    if ($request_method !~ ^(GET|POST|HEAD)$) {
        return 405;
    }
}
```

### 10.4 限制访问

```nginx
# IP 白名单
location /admin/ {
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
}

# IP 黑名单
location /blocked/ {
    deny 192.168.1.100;
    deny 10.0.0.0/8;
    allow all;
}
```

### 10.5 速率限制

```nginx
http {
    # 定义速率限制区域
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=1r/m;

    # 连接数限制
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
}

server {
    # API 速率限制
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://backend;
    }

    # 登录接口更严格的限制
    location /api/login {
        limit_req zone=login_limit;
        proxy_pass http://backend;
    }

    # 连接数限制
    location / {
        limit_conn conn_limit 10;
        root /var/www/html;
    }
}
```

### 10.6 防止 SQL 注入和 XSS

```nginx
# 基本的输入过滤（不能完全依赖，应在应用层处理）
location / {
    if ($query_string ~* "(union.*select|insert.*into|delete.*from|drop.*table)") {
        return 403;
    }

    if ($query_string ~* "(<script|javascript:|onload=)") {
        return 403;
    }
}
```

### 10.7 文件上传限制

```nginx
server {
    # 限制上传文件大小
    client_max_body_size 10m;

    # 限制特定类型的上传
    location /upload/ {
        # 只允许图片
        if ($request_filename !~* \.(jpg|jpeg|png|gif)$) {
            return 403;
        }

        client_max_body_size 5m;
        proxy_pass http://backend;
    }
}
```

---

## 十一、日志管理

### 11.1 日志格式

```nginx
http {
    # 标准格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    # JSON 格式（便于分析）
    log_format json escape=json '{'
        '"time":"$time_iso8601",'
        '"remote_addr":"$remote_addr",'
        '"request":"$request",'
        '"status":$status,'
        '"body_bytes_sent":$body_bytes_sent,'
        '"request_time":$request_time,'
        '"http_referer":"$http_referer",'
        '"http_user_agent":"$http_user_agent"'
    '}';

    # 详细格式
    log_format detailed '$remote_addr - $remote_user [$time_local] '
                        '"$request_method $request_uri $server_protocol" '
                        '$status $body_bytes_sent "$http_referer" '
                        '"$http_user_agent" rt=$request_time uct="$upstream_connect_time" '
                        'uht="$upstream_header_time" urt="$upstream_response_time"';
}
```

### 11.2 访问日志

```nginx
server {
    # 使用标准格式
    access_log /var/log/nginx/access.log main;

    # 使用 JSON 格式
    access_log /var/log/nginx/access.json.log json;

    # 关闭特定位置的日志
    location /health {
        access_log off;
    }

    # 静态文件单独日志
    location ~* \.(jpg|jpeg|png|gif|css|js)$ {
        access_log /var/log/nginx/static.access.log;
    }
}
```

### 11.3 错误日志

```nginx
# 全局错误日志
error_log /var/log/nginx/error.log;

# 不同级别的错误日志
error_log /var/log/nginx/error.log warn;
error_log /var/log/nginx/error.log error;
error_log /var/log/nginx/error.log crit;

# Server 级别
server {
    error_log /var/log/nginx/example.com.error.log;
}
```

### 11.4 日志轮转

**Logrotate 配置** (`/etc/logrotate.d/nginx`)：

```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

### 11.5 条件日志

```nginx
map $status $loggable {
    ~^[23]  0;
    default 1;
}

server {
    access_log /var/log/nginx/access.log combined if=$loggable;
}
```

---

## 十二、常用命令

### 12.1 服务管理

```bash
# 启动 Nginx
sudo systemctl start nginx
sudo service nginx start

# 停止 Nginx
sudo systemctl stop nginx
sudo service nginx stop

# 重启 Nginx
sudo systemctl restart nginx
sudo service nginx restart

# 重载配置（不中断服务）
sudo systemctl reload nginx
sudo nginx -s reload

# 查看状态
sudo systemctl status nginx
sudo service nginx status

# 开机自启
sudo systemctl enable nginx
```

### 12.2 配置测试

```bash
# 测试配置文件语法
sudo nginx -t

# 测试并显示详细信息
sudo nginx -T

# 查看版本信息
nginx -v
nginx -V

# 查看编译参数
nginx -V 2>&1 | grep configure
```

### 12.3 信号控制

```bash
# 优雅停止（等待请求完成）
sudo nginx -s quit

# 快速停止
sudo nginx -s stop

# 重载配置
sudo nginx -s reload

# 重新打开日志文件
sudo nginx -s reopen

# 查看主进程 PID
cat /run/nginx.pid
```

### 12.4 进程管理

```bash
# 查看 Nginx 进程
ps aux | grep nginx

# 查看 Worker 进程数
ps -ef | grep "nginx: worker" | wc -l

# 查看连接数
ss -s | grep nginx
netstat -an | grep :80 | wc -l

# 实时监控连接
watch -n 1 'ss -s | grep nginx'
```

### 12.5 日志查看

```bash
# 实时查看访问日志
tail -f /var/log/nginx/access.log

# 实时查看错误日志
tail -f /var/log/nginx/error.log

# 查看最近的错误
tail -n 100 /var/log/nginx/error.log

# 统计访问最多的 IP
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20

# 统计 HTTP 状态码
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn

# 查看今天的访问
grep "$(date '+%d/%b/%Y')" /var/log/nginx/access.log

# 查找 404 错误
grep " 404 " /var/log/nginx/access.log

# 查找特定 URL
grep "/api/users" /var/log/nginx/access.log
```

### 12.6 性能监控

```bash
# 查看活跃连接
curl http://localhost/nginx_status

# 需要先在配置中启用
# location /nginx_status {
#     stub_status;
#     allow 127.0.0.1;
#     deny all;
# }

# 使用 ab 进行压力测试
ab -n 1000 -c 100 http://example.com/

# 使用 wrk 进行压力测试
wrk -t12 -c400 -d30s http://example.com/

# 查看系统资源使用
top -p $(pgrep nginx)
htop -p $(pgrep nginx)
```

---

## 十三、故障排查

### 13.1 常见问题

#### 问题 1：Nginx 无法启动

```bash
# 检查配置文件
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 检查端口占用
sudo lsof -i :80
sudo netstat -tlnp | grep :80

# 检查权限
ls -la /var/log/nginx/
ls -la /etc/nginx/
```

#### 问题 2：502 Bad Gateway

```nginx
# 检查 upstream 配置
upstream backend {
    server 127.0.0.1:3000;
}

# 检查后端服务是否运行
curl http://127.0.0.1:3000

# 增加超时时间
proxy_connect_timeout 60s;
proxy_read_timeout 60s;
```

#### 问题 3：504 Gateway Timeout

```nginx
# 增加超时设置
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;

# 检查后端性能
# 优化应用代码或增加服务器资源
```

#### 问题 4：403 Forbidden

```bash
# 检查文件权限
ls -la /var/www/html/
chmod 755 /var/www/html/
chown -R www-data:www-data /var/www/html/

# 检查 SELinux（CentOS）
getenforce
setenforce 0  # 临时禁用测试
```

#### 问题 5：413 Request Entity Too Large

```nginx
# 增加上传大小限制
client_max_body_size 100m;
```

### 13.2 调试技巧

```nginx
# 启用详细错误日志
error_log /var/log/nginx/error.log debug;

# 添加调试头
add_header X-Debug-Info "Server: $server_name, Time: $time_local" always;

# 记录 upstream 响应时间
log_format debug '$remote_addr - [$time_local] "$request" '
                 '$status $body_bytes_sent '
                 'rt=$request_time uct=$upstream_connect_time '
                 'uht=$upstream_header_time urt=$upstream_response_time';
```

### 13.3 性能诊断

```bash
# 检查慢请求
awk '$NF > 1 {print $0}' /var/log/nginx/access.log | sort -k$NF -rn

# 检查高流量时段
awk -F'[' '{print $2}' /var/log/nginx/access.log | awk -F: '{print $1":"$2}' | sort | uniq -c | sort -rn

# 检查带宽使用
awk '{sum+=$10} END {print sum/1024/1024 " MB"}' /var/log/nginx/access.log

# 实时监控
tail -f /var/log/nginx/access.log | pv -l > /dev/null
```

### 13.4 安全检查

```bash
# 检查开放的端口
sudo nmap localhost

# 检查 SSL 配置
openssl s_client -connect example.com:443

# 在线检查工具
# https://www.ssllabs.com/ssltest/
# https://securityheaders.com/

# 检查配置文件权限
ls -la /etc/nginx/nginx.conf
chmod 644 /etc/nginx/nginx.conf
chown root:root /etc/nginx/nginx.conf
```

---

## 十四、实用配置示例

### 14.1 Vue/React SPA 配置

```nginx
server {
    listen 80;
    server_name app.example.com;

    root /var/www/spa;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/css application/javascript;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 14.2 WordPress 配置

```nginx
server {
    listen 80;
    server_name wordpress.example.com;

    root /var/www/wordpress;
    index index.php index.html;

    # PHP 处理
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # WordPress  permalink
    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    # 禁止访问敏感文件
    location ~ /\. {
        deny all;
    }

    # 缓存静态文件
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
    }
}
```

### 14.3 Docker Compose + Nginx

```yaml
version: '3'
services:
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./html:/usr/share/nginx/html:ro
    depends_on:
      - app
    networks:
      - webnet

  app:
    build: ./app
    expose:
      - '3000'
    networks:
      - webnet

networks:
  webnet:
```

### 14.4 多域名配置

```nginx
# example.com
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/example;

    location / {
        try_files $uri $uri/ =404;
    }
}

# api.example.com
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}

# admin.example.com
server {
    listen 80;
    server_name admin.example.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
    }
}
```

### 14.5 微服务网关

```nginx
upstream user_service {
    server 10.0.1.10:8001;
    server 10.0.1.11:8001;
}

upstream order_service {
    server 10.0.2.10:8002;
    server 10.0.2.11:8002;
}

upstream product_service {
    server 10.0.3.10:8003;
    server 10.0.3.11:8003;
}

server {
    listen 80;
    server_name api.gateway.com;

    # 用户服务
    location /api/users/ {
        proxy_pass http://user_service;
        proxy_set_header Host $host;
    }

    # 订单服务
    location /api/orders/ {
        proxy_pass http://order_service;
        proxy_set_header Host $host;
    }

    # 产品服务
    location /api/products/ {
        proxy_pass http://product_service;
        proxy_set_header Host $host;
    }

    # 默认
    location / {
        return 404;
    }
}
```

### 14.6 限流和熔断

```nginx
http {
    # 限流区域
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=strict:10m rate=1r/s;

    # 连接限制
    limit_conn_zone $binary_remote_addr zone=addr:10m;

    upstream backend {
        server 10.0.1.10:3000 max_fails=3 fail_timeout=30s;
        server 10.0.1.11:3000 max_fails=3 fail_timeout=30s;
    }
}

server {
    listen 80;

    # 一般接口
    location /api/ {
        limit_req zone=general burst=20 nodelay;
        limit_conn addr 10;

        proxy_pass http://backend;

        # 熔断配置
        proxy_next_upstream error timeout http_500 http_502 http_503 http_504;
        proxy_next_upstream_timeout 10s;
        proxy_next_upstream_tries 2;
    }

    # 敏感接口（更严格）
    location /api/login {
        limit_req zone=strict;
        proxy_pass http://backend;
    }
}
```

### 14.7 A/B 测试

```nginx
http {
    split_clients "${cookie.ab_test}${remote_addr}" $variant {
        50% "A";
        50% "B";
    }
}

server {
    location / {
        if ($variant = "A") {
            proxy_pass http://backend_v1;
        }
        if ($variant = "B") {
            proxy_pass http://backend_v2;
        }
    }
}
```

### 14.8 灰度发布

```nginx
http {
    map $http_x_gray_release $gray_backend {
        default production;
        "true" staging;
    }

    upstream production {
        server 10.0.1.10:3000;
        server 10.0.1.11:3000;
    }

    upstream staging {
        server 10.0.2.10:3000;
    }
}

server {
    location / {
        proxy_pass http://$gray_backend;
    }
}
```

---

## 附录：快速参考

### 常用变量

| 变量                      | 说明          |
| ------------------------- | ------------- |
| `$remote_addr`            | 客户端 IP     |
| `$remote_port`            | 客户端端口    |
| `$request`                | 完整请求行    |
| `$request_method`         | 请求方法      |
| `$request_uri`            | 请求 URI      |
| `$status`                 | 响应状态码    |
| `$body_bytes_sent`        | 发送的字节数  |
| `$http_referer`           | Referer 头    |
| `$http_user_agent`        | User-Agent 头 |
| `$server_name`            | 服务器名称    |
| `$server_port`            | 服务器端口    |
| `$time_local`             | 本地时间      |
| `$upstream_response_time` | 上游响应时间  |

### 常用状态码

| 状态码 | 含义                  |
| ------ | --------------------- |
| 200    | OK                    |
| 301    | Moved Permanently     |
| 302    | Found                 |
| 304    | Not Modified          |
| 400    | Bad Request           |
| 403    | Forbidden             |
| 404    | Not Found             |
| 405    | Method Not Allowed    |
| 413    | Payload Too Large     |
| 500    | Internal Server Error |
| 502    | Bad Gateway           |
| 503    | Service Unavailable   |
| 504    | Gateway Timeout       |

### 性能调优清单

- ✅ 设置合适的 `worker_processes`（CPU 核心数）
- ✅ 调整 `worker_connections`（根据并发需求）
- ✅ 启用 Gzip/Brotli 压缩
- ✅ 配置静态文件缓存
- ✅ 启用 HTTP/2
- ✅ 优化 SSL/TLS 配置
- ✅ 配置代理缓存
- ✅ 设置合理的超时时间
- ✅ 启用日志轮转
- ✅ 监控系统资源使用

### 安全检查清单

- ✅ 隐藏 Nginx 版本信息
- ✅ 配置安全响应头
- ✅ 启用 HTTPS
- ✅ 配置 HSTS
- ✅ 设置速率限制
- ✅ 限制请求方法
- ✅ 配置 IP 访问控制
- ✅ 限制上传文件大小
- ✅ 定期更新 Nginx
- ✅ 监控异常访问

---

**提示**：修改配置后务必使用 `nginx -t` 测试配置，然后使用 `nginx -s reload` 重载配置，避免直接重启导致服务中断。
