# PostgreSQL 速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-21  
> **适用对象**: 数据库管理员、后端开发人员、DevOps 工程师

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、安装与配置](#二安装与配置)
- [三、数据库操作](#三数据库操作)
- [四、表操作](#四表操作)
- [五、数据操作](#五数据操作)
- [六、查询进阶](#六查询进阶)
- [七、索引优化](#七索引优化)
- [八、用户与权限](#八用户与权限)
- [九、备份与恢复](#九备份与恢复)
- [十、性能监控](#十性能监控)
- [十一、高级特性](#十一高级特性)
- [十二、常用命令速查](#十二常用命令速查)
- [十三、故障排查](#十三故障排查)
- [十四、实用示例](#十四实用示例)

---

## 🐳 Docker Compose 快速启动

### 单机模式（开发/测试环境）

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_password
      POSTGRES_DB: app_db
    restart: unless-stopped
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: pgadmin
    ports:
      - '5050:80'
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin_password
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

### 主从复制模式（生产环境）

```yaml
# docker-compose-replication.yml
version: '3.8'

services:
  postgres-primary:
    image: postgres:16-alpine
    container_name: postgres-primary
    ports:
      - '5432:5432'
    volumes:
      - postgres_primary_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_password
      POSTGRES_DB: app_db
      POSTGRES_REPLICATION_USER: repl_user
      POSTGRES_REPLICATION_PASSWORD: repl_password
    command:
      - postgres
      - -c
      - wal_level=replica
      - -c
      - max_wal_senders=5
      - -c
      - max_replication_slots=5
    restart: unless-stopped

  postgres-replica:
    image: postgres:16-alpine
    container_name: postgres-replica
    ports:
      - '5433:5432'
    volumes:
      - postgres_replica_data:/var/lib/postgresql/data
    environment:
      PGUSER: postgres
      PGPASSWORD: postgres_password
      PG_PRIMARY_HOST: postgres-primary
      PG_PRIMARY_PORT: 5432
    depends_on:
      - postgres-primary
    restart: unless-stopped

volumes:
  postgres_primary_data:
  postgres_replica_data:
```

```bash
# 启动
docker-compose up -d

# 连接信息
# Host: localhost:5432
# User: postgres / postgres_password
# Database: app_db
# pgAdmin: http://localhost:5050
```

---

## 一、基础概念

### 1.1 PostgreSQL 简介

PostgreSQL 是一个功能强大的开源对象关系数据库系统，具有极高的可扩展性和标准合规性。

**特点**：

- ✅ ACID 兼容
- ✅ 支持复杂查询
- ✅ 丰富的数据类型
- ✅ 强大的扩展性
- ✅ MVCC（多版本并发控制）
- ✅ 完善的事务支持

### 1.2 核心概念

```
┌──────────────┐
│   Cluster    │  ← PostgreSQL 实例
├──────────────┤
│  Database 1  │  ← 数据库
│  Database 2  │
├──────────────┤
│   Schema     │  ← 模式（命名空间）
├──────────────┤
│   Table      │  ← 表
│   Index      │  ← 索引
│   View       │  ← 视图
│   Function   │  ← 函数
└──────────────┘
```

**关键术语**：

- **Cluster**: PostgreSQL 服务器实例
- **Database**: 数据库，包含多个 schema
- **Schema**: 命名空间，组织数据库对象
- **Table**: 数据表
- **Role**: 用户或角色
- **Tablespace**: 物理存储位置

### 1.3 数据类型

#### 数值类型

```sql
-- 整数
INTEGER          -- 4字节，-21亿到+21亿
BIGINT           -- 8字节
SMALLINT         -- 2字节

-- 精确数值
NUMERIC(10,2)    -- 精确小数
DECIMAL(10,2)    -- 同 NUMERIC

-- 浮点数
REAL             -- 4字节浮点
DOUBLE PRECISION -- 8字节浮点

-- 序列
SERIAL           -- 自增整数
BIGSERIAL        -- 自增大整数
```

#### 字符类型

```sql
VARCHAR(n)       -- 可变长度，最大n
CHAR(n)          -- 固定长度
TEXT             -- 无限长度文本
```

#### 日期时间类型

```sql
DATE             -- 日期
TIME             -- 时间
TIMESTAMP        -- 日期时间
TIMESTAMPTZ      -- 带时区的日期时间
INTERVAL         -- 时间间隔
```

#### 其他常用类型

```sql
BOOLEAN          -- 布尔值
UUID             -- UUID
JSON/JSONB       -- JSON数据（JSONB更高效）
ARRAY            -- 数组
BYTEA            -- 二进制数据
INET             -- IP地址
CIDR             -- CIDR网络地址
```

---

## 二、安装与配置

### 2.1 安装 PostgreSQL

#### Ubuntu/Debian

```bash
# 安装
sudo apt update
sudo apt install postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 查看状态
sudo systemctl status postgresql
```

#### CentOS/RHEL

```bash
# 安装
sudo yum install postgresql-server postgresql-contrib

# 初始化
sudo postgresql-setup initdb

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS

```bash
# 使用 Homebrew
brew install postgresql@15
brew services start postgresql@15

# 或使用 Postgres.app
# 下载: https://postgresapp.com/
```

#### Docker

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

### 2.2 初始配置

#### 连接 PostgreSQL

```bash
# 切换到 postgres 用户
sudo -i -u postgres

# 连接数据库
psql

# 或直接连接
psql -U postgres
```

#### 修改监听地址

```bash
# 编辑配置文件
sudo nano /etc/postgresql/15/main/postgresql.conf

# 修改以下配置
listen_addresses = '*'              # 监听所有地址
port = 5432                         # 端口
max_connections = 100               # 最大连接数
shared_buffers = 128MB              # 共享缓冲区
work_mem = 4MB                      # 工作内存
```

#### 配置客户端认证

```bash
# 编辑 pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# 添加规则
# TYPE  DATABASE  USER  ADDRESS  METHOD
local   all       all            peer
host    all       all   127.0.0.1/32  md5
host    all       all   ::1/128       md5
host    mydb      appuser 0.0.0.0/0   md5
```

#### 重启服务

```bash
sudo systemctl restart postgresql
```

### 2.3 基本管理命令

```bash
# 查看版本
psql --version
psql -c "SELECT version();"

# 查看运行状态
pg_lsclusters
systemctl status postgresql

# 查看日志
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# 重新加载配置（不重启）
sudo systemctl reload postgresql
```

---

## 三、数据库操作

### 3.1 创建和管理数据库

```sql
-- 创建数据库
CREATE DATABASE mydb;
CREATE DATABASE mydb WITH OWNER = admin ENCODING = 'UTF8';

-- 列出所有数据库
\l
\list

-- 切换数据库
\c mydb
\connect mydb

-- 删除数据库
DROP DATABASE mydb;
DROP DATABASE IF EXISTS mydb;

-- 查看当前数据库
SELECT current_database();
```

### 3.2 数据库信息

```sql
-- 查看数据库大小
SELECT pg_size_pretty(pg_database_size('mydb'));

-- 查看所有数据库大小
SELECT
    datname AS database_name,
    pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
ORDER BY pg_database_size(datname) DESC;

-- 查看数据库连接数
SELECT count(*) FROM pg_stat_activity;

-- 查看数据库活动
SELECT * FROM pg_stat_activity;
```

---

## 四、表操作

### 4.1 创建表

```sql
-- 基本表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 带外键的表
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- 带索引的表
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

### 4.2 修改表

```sql
-- 添加列
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN age INTEGER CHECK (age >= 0);

-- 修改列
ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(30);
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- 重命名列
ALTER TABLE users RENAME COLUMN phone TO mobile;

-- 删除列
ALTER TABLE users DROP COLUMN mobile;
ALTER TABLE users DROP COLUMN IF EXISTS mobile;

-- 添加约束
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE posts ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);

-- 删除约束
ALTER TABLE users DROP CONSTRAINT unique_email;

-- 重命名表
ALTER TABLE users RENAME TO app_users;

-- 添加默认值
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT NOW();

-- 删除表
DROP TABLE users;
DROP TABLE IF EXISTS users;
DROP TABLE users CASCADE;  -- 级联删除依赖对象
```

### 4.3 查看表信息

```sql
-- 列出所有表
\dt
\dt *.*  -- 包括所有schema

-- 查看表结构
\d users
\d+ users  -- 详细信息

-- 查看表的索引
\di users*

-- 查看表的大小
SELECT pg_size_pretty(pg_total_relation_size('users'));

-- 查看表的行数
SELECT reltuples::bigint AS row_count
FROM pg_class
WHERE relname = 'users';

-- 查看表的定义
SELECT table_definition
FROM information_schema.views
WHERE table_name = 'view_name';
```

---

## 五、数据操作

### 5.1 插入数据

```sql
-- 单行插入
INSERT INTO users (username, email, password_hash)
VALUES ('john', 'john@example.com', '$2b$10$...');

-- 多行插入
INSERT INTO users (username, email, password_hash)
VALUES
    ('alice', 'alice@example.com', '$2b$10$...'),
    ('bob', 'bob@example.com', '$2b$10$...'),
    ('charlie', 'charlie@example.com', '$2b$10$...');

-- 返回插入的数据
INSERT INTO users (username, email)
VALUES ('david', 'david@example.com')
RETURNING id, username, created_at;

-- 插入或更新（UPSERT）
INSERT INTO users (username, email, password_hash)
VALUES ('john', 'john@example.com', '$2b$10$new_hash')
ON CONFLICT (username)
DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = CURRENT_TIMESTAMP;

-- 从查询结果插入
INSERT INTO archived_users (username, email, archived_at)
SELECT username, email, NOW()
FROM users
WHERE created_at < '2023-01-01';
```

### 5.2 更新数据

```sql
-- 基本更新
UPDATE users
SET email = 'newemail@example.com'
WHERE id = 1;

-- 多字段更新
UPDATE users
SET
    email = 'newemail@example.com',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- 基于计算的更新
UPDATE products
SET price = price * 1.1
WHERE category = 'electronics';

-- 返回更新的数据
UPDATE users
SET email = 'updated@example.com'
WHERE id = 1
RETURNING id, email, updated_at;

-- 批量更新
UPDATE orders
SET status = 'completed'
WHERE status = 'pending'
AND created_at < NOW() - INTERVAL '30 days';
```

### 5.3 删除数据

```sql
-- 删除单行
DELETE FROM users WHERE id = 1;

-- 删除多行
DELETE FROM users WHERE created_at < '2023-01-01';

-- 返回删除的数据
DELETE FROM users
WHERE id = 1
RETURNING *;

-- 清空表（更快）
TRUNCATE TABLE users;
TRUNCATE TABLE users RESTART IDENTITY;  -- 重置序列

-- 级联删除
TRUNCATE TABLE users CASCADE;
```

### 5.4 查询数据

```sql
-- 基本查询
SELECT * FROM users;
SELECT username, email FROM users;

-- 条件查询
SELECT * FROM users WHERE age > 18;
SELECT * FROM users WHERE age BETWEEN 18 AND 65;
SELECT * FROM users WHERE username LIKE 'john%';
SELECT * FROM users WHERE email ILIKE '%@gmail.com';  -- 不区分大小写

-- 排序
SELECT * FROM users ORDER BY created_at DESC;
SELECT * FROM users ORDER BY age ASC, username ASC;

-- 限制结果
SELECT * FROM users LIMIT 10;
SELECT * FROM users LIMIT 10 OFFSET 20;  -- 分页

-- 去重
SELECT DISTINCT email FROM users;
SELECT DISTINCT ON (username) * FROM users ORDER BY username, created_at DESC;
```

---

## 六、查询进阶

### 6.1 JOIN 查询

```sql
-- INNER JOIN
SELECT u.username, p.title
FROM users u
INNER JOIN posts p ON u.id = p.user_id;

-- LEFT JOIN
SELECT u.username, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.username;

-- RIGHT JOIN
SELECT p.title, u.username
FROM users u
RIGHT JOIN posts p ON u.id = p.user_id;

-- FULL OUTER JOIN
SELECT u.username, p.title
FROM users u
FULL OUTER JOIN posts p ON u.id = p.user_id;

-- 多表JOIN
SELECT
    u.username,
    p.title,
    c.content
FROM users u
JOIN posts p ON u.id = p.user_id
JOIN comments c ON p.id = c.post_id
WHERE u.username = 'john';
```

### 6.2 子查询

```sql
-- WHERE 子句中的子查询
SELECT * FROM users
WHERE id IN (SELECT user_id FROM posts WHERE status = 'published');

-- FROM 子句中的子查询
SELECT username, post_count
FROM (
    SELECT u.username, COUNT(p.id) as post_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    GROUP BY u.username
) AS subquery
WHERE post_count > 5;

-- EXISTS 子查询
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM posts p
    WHERE p.user_id = u.id
    AND p.status = 'published'
);

-- 相关子查询
SELECT
    username,
    (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as post_count
FROM users u;
```

### 6.3 聚合函数

```sql
-- 基本聚合
SELECT COUNT(*) FROM users;
SELECT SUM(total_amount) FROM orders;
SELECT AVG(price) FROM products;
SELECT MIN(created_at), MAX(created_at) FROM users;

-- GROUP BY
SELECT
    status,
    COUNT(*) as count,
    SUM(total_amount) as total
FROM orders
GROUP BY status;

-- HAVING
SELECT
    user_id,
    COUNT(*) as order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 10;

-- 窗口函数
SELECT
    username,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num,
    RANK() OVER (PARTITION BY status ORDER BY total_amount DESC) as rank
FROM users;
```

### 6.4 CTE（公用表表达式）

```sql
-- 基本 CTE
WITH active_users AS (
    SELECT id, username, email
    FROM users
    WHERE created_at > NOW() - INTERVAL '30 days'
)
SELECT * FROM active_users;

-- 递归 CTE
WITH RECURSIVE employee_hierarchy AS (
    -- 基础情况
    SELECT id, name, manager_id, 1 as level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- 递归情况
    SELECT e.id, e.name, e.manager_id, eh.level + 1
    FROM employees e
    INNER JOIN employee_hierarchy eh ON e.manager_id = eh.id
)
SELECT * FROM employee_hierarchy;

-- 多个 CTE
WITH
    recent_orders AS (
        SELECT * FROM orders
        WHERE created_at > NOW() - INTERVAL '7 days'
    ),
    order_totals AS (
        SELECT user_id, SUM(total_amount) as total
        FROM recent_orders
        GROUP BY user_id
    )
SELECT u.username, ot.total
FROM users u
JOIN order_totals ot ON u.id = ot.user_id
ORDER BY ot.total DESC;
```

### 6.5 全文搜索

```sql
-- 基本全文搜索
SELECT * FROM articles
WHERE to_tsvector('english', content) @@ to_tsquery('english', 'database & search');

-- 创建全文搜索索引
CREATE INDEX idx_articles_search ON articles
USING gin(to_tsvector('english', content));

-- 搜索排名
SELECT
    title,
    ts_rank(to_tsvector('english', content), query) as rank
FROM articles,
     to_tsquery('english', 'postgresql') as query
WHERE to_tsvector('english', content) @@ query
ORDER BY rank DESC;

-- 高亮显示
SELECT
    title,
    ts_headline('english', content, query) as highlighted
FROM articles,
     to_tsquery('english', 'database') as query
WHERE to_tsvector('english', content) @@ query;
```

---

## 七、索引优化

### 7.1 索引类型

```sql
-- B-Tree 索引（默认，适合等值和范围查询）
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created ON users(created_at DESC);

-- Hash 索引（仅适合等值查询）
CREATE INDEX idx_users_hash ON users USING hash(email);

-- GiST 索引（适合几何、全文搜索）
CREATE INDEX idx_location ON places USING gist(location);

-- GIN 索引（适合数组、JSONB、全文搜索）
CREATE INDEX idx_tags ON articles USING gin(tags);
CREATE INDEX idx_jsonb ON docs USING gin(data jsonb_path_ops);

-- BRIN 索引（适合有序大数据）
CREATE INDEX idx_logs_time ON logs USING brin(created_at);

-- 部分索引
CREATE INDEX idx_active_users ON users(email) WHERE active = true;

-- 表达式索引
CREATE INDEX idx_lower_email ON users(lower(email));
CREATE INDEX idx_date ON orders((created_at::date));

-- 覆盖索引
CREATE INDEX idx_covering ON users(username, email) INCLUDE (created_at);
```

### 7.2 索引管理

```sql
-- 查看索引
\di
SELECT * FROM pg_indexes WHERE tablename = 'users';

-- 查看索引使用情况
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 查找未使用的索引
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE '%_pkey';

-- 重建索引
REINDEX INDEX idx_users_email;
REINDEX TABLE users;
REINDEX DATABASE mydb;

-- 删除索引
DROP INDEX idx_users_email;
DROP INDEX IF EXISTS idx_users_email;

-- 并发创建索引（不锁表）
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

### 7.3 查询优化

```sql
-- 查看执行计划
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM users WHERE email = 'test@example.com';

-- 强制使用索引
SET enable_seqscan = off;
SELECT * FROM users WHERE email = 'test@example.com';
SET enable_seqscan = on;

-- 优化器提示
SET random_page_cost = 1.1;
SET effective_cache_size = '4GB';
```

---

## 八、用户与权限

### 8.1 用户管理

```sql
-- 创建用户
CREATE USER appuser WITH PASSWORD 'secret';
CREATE ROLE approle WITH LOGIN PASSWORD 'secret';

-- 创建超级用户
CREATE USER admin WITH SUPERUSER PASSWORD 'adminpass';

-- 修改用户
ALTER USER appuser WITH PASSWORD 'newpass';
ALTER USER appuser VALID UNTIL '2025-12-31';

-- 删除用户
DROP USER appuser;
DROP ROLE IF EXISTS appuser;

-- 查看用户
\du
SELECT * FROM pg_roles;
```

### 8.2 权限管理

```sql
-- 授予权限
GRANT CONNECT ON DATABASE mydb TO appuser;
GRANT USAGE ON SCHEMA public TO appuser;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO appuser;
GRANT ALL PRIVILEGES ON DATABASE mydb TO appuser;

-- 授予特定表的权限
GRANT SELECT ON users TO appuser;
GRANT INSERT, UPDATE ON posts TO appuser;

-- 授予序列权限
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO appuser;

-- 撤销权限
REVOKE DELETE ON users FROM appuser;
REVOKE ALL ON DATABASE mydb FROM appuser;

-- 查看权限
\dp users
SELECT * FROM information_schema.role_table_grants WHERE grantee = 'appuser';
```

### 8.3 角色继承

```sql
-- 创建角色
CREATE ROLE read_only;
CREATE ROLE read_write;
CREATE ROLE admin;

-- 授予角色权限
GRANT SELECT ON ALL TABLES IN SCHEMA public TO read_only;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO read_write;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;

-- 将角色授予用户
GRANT read_only TO appuser;
GRANT read_write TO editor;
GRANT admin TO dba;

-- 查看角色成员
\du
SELECT r.rolname, m.rolname as member
FROM pg_auth_members am
JOIN pg_roles r ON am.roleid = r.oid
JOIN pg_roles m ON am.member = m.oid;
```

---

## 九、备份与恢复

### 9.1 逻辑备份

```bash
# 备份单个数据库
pg_dump -U postgres mydb > mydb_backup.sql
pg_dump -U postgres -F c mydb > mydb_backup.dump  # 自定义格式

# 备份所有数据库
pg_dumpall -U postgres > all_databases.sql

# 只备份schema
pg_dump -U postgres --schema-only mydb > schema.sql

# 只备份数据
pg_dump -U postgres --data-only mydb > data.sql

# 压缩备份
pg_dump -U postgres mydb | gzip > mydb_backup.sql.gz

# 并行备份
pg_dump -U postgres -j 4 -F d -f backup_dir mydb
```

### 9.2 恢复数据

```bash
# 恢复 SQL 文件
psql -U postgres mydb < mydb_backup.sql

# 恢复自定义格式
pg_restore -U postgres -d mydb mydb_backup.dump

# 恢复到新数据库
createdb -U postgres newdb
pg_restore -U postgres -d newdb mydb_backup.dump

# 解压并恢复
gunzip -c mydb_backup.sql.gz | psql -U postgres mydb

# 从目录恢复
pg_restore -U postgres -d mydb -j 4 backup_dir
```

### 9.3 物理备份

```bash
# 基础备份
pg_basebackup -U postgres -D /backup/base -Fp -Xs -P

# 带压缩的基础备份
pg_basebackup -U postgres -D /backup/base -Ft -z -Xs -P

# WAL 归档配置
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'
```

### 9.4 Point-in-Time Recovery (PITR)

```bash
# 1. 启用 WAL 归档
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'

# 2. 创建基础备份
pg_basebackup -U postgres -D /backup/base -Fp -Xs -P

# 3. 恢复到指定时间点
# recovery.conf
restore_command = 'cp /backup/wal/%f %p'
recovery_target_time = '2024-01-15 14:30:00'

# 4. 启动恢复
pg_ctl start
```

### 9.5 自动化备份脚本

```bash
#!/bin/bash
# backup.sh - PostgreSQL 自动备份脚本

BACKUP_DIR="/backup/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="mydb"
DB_USER="postgres"
RETENTION_DAYS=7

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump -U $DB_USER -F c -b -v -f "$BACKUP_DIR/${DB_NAME}_${DATE}.dump" $DB_NAME

# 压缩备份
gzip "$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

# 删除旧备份
find $BACKUP_DIR -name "${DB_NAME}_*.dump.gz" -mtime +$RETENTION_DAYS -delete

# 记录日志
echo "Backup completed: ${DB_NAME}_${DATE}.dump.gz" >> $BACKUP_DIR/backup.log
```

---

## 十、性能监控

### 10.1 系统视图

```sql
-- 查看活动查询
SELECT
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;

-- 查看慢查询
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    rows
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- 查看锁
SELECT
    l.locktype,
    l.relation::regclass,
    l.mode,
    l.granted,
    a.query,
    a.pid
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
WHERE NOT l.granted;

-- 查看表统计
SELECT
    schemaname,
    relname AS table_name,
    seq_scan,
    idx_scan,
    n_tup_ins,
    n_tup_upd,
    n_tup_del
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- 查看索引统计
SELECT
    schemaname,
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 10.2 缓存命中率

```sql
-- 缓存命中率
SELECT
    sum(heap_blks_read) as heap_read,
    sum(heap_blks_hit) as heap_hit,
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM pg_statio_user_tables;

-- 理想值应该 > 0.99
```

### 10.3 连接监控

```sql
-- 当前连接数
SELECT count(*) FROM pg_stat_activity;

-- 按数据库分组
SELECT
    datname,
    count(*) as connections
FROM pg_stat_activity
GROUP BY datname;

-- 按用户分组
SELECT
    usename,
    count(*) as connections
FROM pg_stat_activity
GROUP BY usename;

-- 最长运行的查询
SELECT
    pid,
    now() - query_start AS duration,
    query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC
LIMIT 10;
```

### 10.4 性能调优参数

```sql
-- 查看当前配置
SHOW shared_buffers;
SHOW work_mem;
SHOW effective_cache_size;
SHOW maintenance_work_mem;

-- 推荐配置（根据内存调整）
-- 4GB RAM:
-- shared_buffers = 1GB
-- effective_cache_size = 3GB
-- work_mem = 64MB
-- maintenance_work_mem = 512MB

-- 16GB RAM:
-- shared_buffers = 4GB
-- effective_cache_size = 12GB
-- work_mem = 256MB
-- maintenance_work_mem = 2GB
```

---

## 十一、高级特性

### 11.1 分区表

```sql
-- 创建分区表
CREATE TABLE measurements (
    id SERIAL,
    device_id INTEGER NOT NULL,
    value NUMERIC NOT NULL,
    created_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (created_at);

-- 创建分区
CREATE TABLE measurements_2024_q1 PARTITION OF measurements
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE measurements_2024_q2 PARTITION OF measurements
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

-- 创建分区索引
CREATE INDEX idx_measurements_device ON measurements (device_id);

-- 查询自动路由到分区
SELECT * FROM measurements
WHERE created_at BETWEEN '2024-01-01' AND '2024-03-31';
```

### 11.2 JSONB 操作

```sql
-- 创建 JSONB 表
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 插入 JSONB
INSERT INTO documents (title, data)
VALUES ('User Profile', '{
    "name": "John",
    "age": 30,
    "tags": ["developer", "postgres"],
    "address": {
        "city": "Beijing",
        "zipcode": "100000"
    }
}');

-- 查询 JSONB
SELECT data->>'name' as name FROM documents;
SELECT data->'address'->>'city' as city FROM documents;

-- JSONB 条件查询
SELECT * FROM documents
WHERE data @> '{"age": 30}';

SELECT * FROM documents
WHERE data ? 'tags';

SELECT * FROM documents
WHERE data->'tags' ? 'developer';

-- JSONB 索引
CREATE INDEX idx_documents_data ON documents USING gin(data);
CREATE INDEX idx_documents_name ON documents USING gin((data->>'name'));
```

### 11.3 物化视图

```sql
-- 创建物化视图
CREATE MATERIALIZED VIEW monthly_sales AS
SELECT
    DATE_TRUNC('month', order_date) as month,
    COUNT(*) as order_count,
    SUM(total_amount) as total_sales
FROM orders
GROUP BY DATE_TRUNC('month', order_date);

-- 查询物化视图
SELECT * FROM monthly_sales ORDER BY month DESC;

-- 刷新物化视图
REFRESH MATERIALIZED VIEW monthly_sales;

-- 并发刷新（不阻塞查询）
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_sales;

-- 创建索引
CREATE INDEX idx_monthly_sales_month ON monthly_sales (month);
```

### 11.4 触发器

```sql
-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_update_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- 审计触发器
CREATE TABLE user_audit (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(10),
    old_data JSONB,
    new_data JSONB,
    changed_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION audit_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO user_audit (user_id, action, new_data)
        VALUES (NEW.id, 'INSERT', to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO user_audit (user_id, action, old_data, new_data)
        VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO user_audit (user_id, action, old_data)
        VALUES (OLD.id, 'DELETE', to_jsonb(OLD));
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION audit_user_changes();
```

### 11.5 存储过程

```sql
-- 创建存储过程
CREATE OR REPLACE PROCEDURE transfer_funds(
    from_account INTEGER,
    to_account INTEGER,
    amount NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- 检查余额
    IF (SELECT balance FROM accounts WHERE id = from_account) < amount THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;

    -- 执行转账
    UPDATE accounts SET balance = balance - amount WHERE id = from_account;
    UPDATE accounts SET balance = balance + amount WHERE id = to_account;

    -- 记录交易
    INSERT INTO transactions (from_account, to_account, amount, created_at)
    VALUES (from_account, to_account, amount, NOW());
END;
$$;

-- 调用存储过程
CALL transfer_funds(1, 2, 100.00);
```

---

## 十二、常用命令速查

### 12.1 psql 元命令

```sql
-- 帮助
\?              -- psql 命令帮助
\h              -- SQL 命令帮助
\h CREATE TABLE -- 特定命令帮助

-- 连接
\c dbname       -- 切换数据库
\conninfo       -- 显示连接信息

-- 数据库
\l              -- 列出数据库
\l+             -- 详细信息

-- 表
\dt             -- 列出表
\dt *.*         -- 所有schema的表
\d tablename    -- 查看表结构
\d+ tablename   -- 详细信息

-- 索引
\di             -- 列出索引
\di+            -- 详细信息

-- 视图
\dv             -- 列出视图

-- 序列
\ds             -- 列出序列

-- 函数
\df             -- 列出函数

-- 用户和权限
\du             -- 列出角色
\dp tablename   -- 查看权限

-- 输出格式
\x              -- 切换扩展显示
\a              -- 切换非对齐模式
\f separator    -- 设置字段分隔符
\o filename     -- 输出到文件
\q              -- 退出
```

### 12.2 常用 SQL 命令

```sql
-- 系统信息
SELECT version();
SELECT current_database();
SELECT current_user;
SELECT NOW();
SELECT pg_postmaster_start_time();

-- 数据库大小
SELECT pg_size_pretty(pg_database_size(current_database()));

-- 表大小
SELECT
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_relation_size(relid)) AS data_size,
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- 清理和分析
VACUUM ANALYZE users;
VACUUM FULL users;  -- 重建表（需要排他锁）
ANALYZE users;

-- 终止查询
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE query LIKE '%long_running_query%'
AND state = 'active';

-- 取消查询
SELECT pg_cancel_backend(pid)
FROM pg_stat_activity
WHERE query LIKE '%query_to_cancel%';
```

### 12.3 命令行工具

```bash
# 连接数据库
psql -U username -d dbname
psql -h localhost -p 5432 -U username -d dbname
psql "postgresql://username:password@localhost:5432/dbname"

# 执行 SQL 文件
psql -U username -d dbname -f script.sql

# 执行单条命令
psql -U username -d dbname -c "SELECT version();"

# 导出 CSV
psql -U username -d dbname -c "COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER" > users.csv

# 导入 CSV
psql -U username -d dbname -c "COPY users FROM STDIN WITH CSV HEADER" < users.csv

# 备份和恢复
pg_dump -U username dbname > backup.sql
pg_restore -U username -d dbname backup.dump

# 创建数据库
createdb -U username newdb
dropdb -U username olddb

# 创建用户
createuser -U username -P newuser
dropuser -U username olduser
```

---

## 十三、故障排查

### 13.1 连接问题

```bash
# 检查 PostgreSQL 是否运行
systemctl status postgresql
pg_lsclusters

# 检查监听地址
netstat -tlnp | grep 5432
ss -tlnp | grep 5432

# 测试连接
psql -h localhost -U postgres -c "SELECT 1;"

# 查看日志
tail -f /var/log/postgresql/postgresql-15-main.log

# 检查防火墙
sudo ufw status
sudo iptables -L
```

### 13.2 性能问题

```sql
-- 查找慢查询
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000  -- 超过1秒
ORDER BY mean_exec_time DESC;

-- 查找锁等待
SELECT
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- 检查膨胀的表
SELECT
    schemaname,
    relname,
    n_dead_tup,
    n_live_tup,
    CASE WHEN n_live_tup > 0
        THEN n_dead_tup::float / n_live_tup
        ELSE 0
    END as dead_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 10000
ORDER BY n_dead_tup DESC;
```

### 13.3 磁盘空间问题

```sql
-- 查看数据库大小
SELECT
    datname,
    pg_size_pretty(pg_database_size(datname)) as size
FROM pg_database
ORDER BY pg_database_size(datname) DESC;

-- 查看最大的表
SELECT
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 20;

-- 清理死元组
VACUUM VERBOSE ANALYZE tablename;

-- 重建表释放空间
VACUUM FULL tablename;
```

### 13.4 常见问题及解决方案

```bash
# 问题: FATAL: too many connections for role
# 解决: 增加 max_connections 或终止空闲连接
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';"

# 问题: FATAL: remaining connection slots are reserved
# 解决: 增加 superuser_reserved_connections 或减少 max_connections

# 问题: ERROR: could not extend file
# 解决: 清理磁盘空间或增加存储

# 问题: PANIC: could not write to file
# 解决: 检查磁盘空间和权限

# 问题: 查询很慢
# 解决:
# 1. 使用 EXPLAIN ANALYZE 分析
# 2. 添加合适的索引
# 3. 更新统计信息: ANALYZE tablename
# 4. 调整 work_mem
```

---

## 十四、实用示例

### 14.1 用户管理系统

```sql
-- 创建用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建会话表
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- 自动清理过期会话
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 定时任务（需要 pg_cron 扩展）
-- SELECT cron.schedule('cleanup-sessions', '0 * * * *', 'SELECT cleanup_expired_sessions()');
```

### 14.2 博客系统

```sql
-- 文章表
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    content TEXT,
    excerpt TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 标签表
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 文章标签关联
CREATE TABLE post_tags (
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- 评论表
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    parent_id INTEGER REFERENCES comments(id),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 热门文章查询
CREATE OR REPLACE VIEW popular_posts AS
SELECT
    p.id,
    p.title,
    p.slug,
    p.view_count,
    COUNT(c.id) as comment_count,
    p.published_at
FROM posts p
LEFT JOIN comments c ON p.id = c.post_id
WHERE p.status = 'published'
GROUP BY p.id
ORDER BY p.view_count DESC, comment_count DESC
LIMIT 10;
```

### 14.3 电商订单系统

```sql
-- 产品表
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 订单表
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    total_amount NUMERIC(10,2) NOT NULL,
    shipping_address JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 订单项表
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- 库存扣减触发器
CREATE OR REPLACE FUNCTION reduce_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product not found';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reduce_stock
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION reduce_stock();

-- 月度销售报告
CREATE OR REPLACE VIEW monthly_sales_report AS
SELECT
    DATE_TRUNC('month', o.created_at) as month,
    COUNT(DISTINCT o.id) as order_count,
    COUNT(oi.id) as item_count,
    SUM(oi.subtotal) as total_revenue,
    AVG(oi.subtotal) as avg_order_value
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status != 'cancelled'
GROUP BY DATE_TRUNC('month', o.created_at)
ORDER BY month DESC;
```

### 14.4 日志系统

```sql
-- 使用分区表的日志系统
CREATE TABLE logs (
    id BIGSERIAL,
    level VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- 按月分区
CREATE TABLE logs_2024_01 PARTITION OF logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE logs_2024_02 PARTITION OF logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- 索引
CREATE INDEX idx_logs_level ON logs (level);
CREATE INDEX idx_logs_created ON logs (created_at DESC);
CREATE INDEX idx_logs_metadata ON logs USING gin(metadata);

-- 自动创建下月分区
CREATE OR REPLACE FUNCTION create_next_month_partition()
RETURNS void AS $$
DECLARE
    next_month DATE := DATE_TRUNC('month', NOW() + INTERVAL '1 month');
    partition_name TEXT := 'logs_' || TO_CHAR(next_month, 'YYYY_MM');
    start_date TEXT := TO_CHAR(next_month, 'YYYY-MM-DD');
    end_date TEXT := TO_CHAR(next_month + INTERVAL '1 month', 'YYYY-MM-DD');
BEGIN
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF logs FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
    );
END;
$$ LANGUAGE plpgsql;
```

---

## 附录：快速参考

### A. 常用数据类型对照

| 用途     | 推荐类型              | 说明        |
| -------- | --------------------- | ----------- |
| 主键     | SERIAL/BIGSERIAL/UUID | 自增或UUID  |
| 用户名   | VARCHAR(50)           | 可变长度    |
| 邮箱     | VARCHAR(100)          | 可变长度    |
| 密码哈希 | VARCHAR(255)          | bcrypt等    |
| 价格     | NUMERIC(10,2)         | 精确小数    |
| 数量     | INTEGER               | 整数        |
| 描述     | TEXT                  | 长文本      |
| 状态     | VARCHAR(20)           | 枚举值      |
| 时间戳   | TIMESTAMP/TIMESTAMPTZ | 带/不带时区 |
| JSON     | JSONB                 | 二进制JSON  |
| 布尔     | BOOLEAN               | true/false  |
| IP地址   | INET                  | IPv4/IPv6   |

### B. 性能调优清单

- ✅ 定期运行 VACUUM ANALYZE
- ✅ 为常用查询添加索引
- ✅ 监控慢查询日志
- ✅ 调整 shared_buffers（25% RAM）
- ✅ 调整 work_mem（复杂查询）
- ✅ 使用连接池（PgBouncer）
- ✅ 定期清理过期数据
- ✅ 监控缓存命中率（>99%）
- ✅ 避免 SELECT \*
- ✅ 使用 EXPLAIN ANALYZE 优化查询

### C. 安全最佳实践

- ✅ 使用强密码
- ✅ 最小权限原则
- ✅ 启用 SSL/TLS
- ✅ 定期备份
- ✅ 监控异常访问
- ✅ 及时更新版本
- ✅ 使用参数化查询防SQL注入
- ✅ 限制远程访问
- ✅ 审计重要操作
- ✅ 加密敏感数据

---

**提示**：PostgreSQL 功能强大，建议定期查阅官方文档了解新特性和最佳实践。对于生产环境，务必进行充分的测试和性能调优。
