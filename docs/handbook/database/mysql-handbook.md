# MySQL 数据库速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: 数据库管理员、后端开发者、数据工程师

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、数据类型](#二数据类型)
- [三、DDL 数据定义](#三ddl-数据定义)
- [四、DML 数据操作](#四dml-数据操作)
- [五、DQL 数据查询](#五dql-数据查询)
- [六、高级查询](#六高级查询)
- [七、索引优化](#七索引优化)
- [八、事务处理](#八事务处理)
- [九、用户权限](#九用户权限)
- [十、性能优化](#十性能优化)
- [十一、备份恢复](#十一备份恢复)
- [十二、最佳实践](#十二最佳实践)

---

## 🐳 Docker Compose 快速启动

### 单机模式（开发/测试环境）

```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8
    container_name: mysql
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: app_db
      MYSQL_USER: app_user
      MYSQL_PASSWORD: app_password
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost']
      interval: 10s
      timeout: 5s
      retries: 5

  phpmyadmin:
    image: phpmyadmin:latest
    container_name: phpmyadmin
    ports:
      - '8080:80'
    environment:
      PMA_HOST: mysql
      PMA_PORT: 3306
      MYSQL_ROOT_PASSWORD: root_password
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped

volumes:
  mysql_data:
```

### 主从复制模式（生产环境）

```yaml
# docker-compose-replication.yml
version: '3.8'

services:
  mysql-master:
    image: mysql:8
    container_name: mysql-master
    ports:
      - '3306:3306'
    volumes:
      - mysql_master_data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: app_db
      MYSQL_USER: repl_user
      MYSQL_PASSWORD: repl_password
    command:
      - --server-id=1
      - --log-bin=mysql-bin
      - --binlog-format=ROW
    restart: unless-stopped

  mysql-slave:
    image: mysql:8
    container_name: mysql-slave
    ports:
      - '3307:3306'
    volumes:
      - mysql_slave_data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password
    command:
      - --server-id=2
      - --relay-log=relay-bin
      - --read-only=1
    depends_on:
      - mysql-master
    restart: unless-stopped

volumes:
  mysql_master_data:
  mysql_slave_data:
```

```bash
# 启动
docker-compose up -d

# 连接信息
# Host: localhost:3306
# Root: root / root_password
# User: app_user / app_password
# Database: app_db
```

---

## 一、基础概念

### 1.1 什么是 MySQL

MySQL 是一个关系型数据库管理系统(RDBMS),使用 SQL(结构化查询语言)进行数据管理。

**特点**:

- 开源免费
- 支持多种操作系统
- 高性能、高可靠性
- 支持事务处理
- 丰富的存储引擎(InnoDB, MyISAM等)

### 1.2 连接数据库

```bash
# 本地连接
mysql -u root -p

# 远程连接
mysql -h hostname -u username -p database_name

# 指定端口
mysql -h 127.0.0.1 -P 3306 -u root -p
```

### 1.3 基本命令

```sql
-- 显示所有数据库
SHOW DATABASES;

-- 选择数据库
USE database_name;

-- 显示当前数据库的所有表
SHOW TABLES;

-- 显示表结构
DESCRIBE table_name;
-- 或
SHOW COLUMNS FROM table_name;

-- 退出
EXIT;
-- 或
QUIT;
```

---

## 二、数据类型

### 2.1 数值类型

```sql
-- 整数类型
TINYINT       -- 1字节, -128到127
SMALLINT      -- 2字节
MEDIUMINT     -- 3字节
INT           -- 4字节
BIGINT        -- 8字节

-- 浮点类型
FLOAT         -- 单精度浮点数
DOUBLE        -- 双精度浮点数
DECIMAL(M,D)  -- 精确小数,M总位数,D小数位数

-- 示例
CREATE TABLE numbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    age TINYINT UNSIGNED,
    salary DECIMAL(10,2),
    score FLOAT
);
```

### 2.2 字符串类型

```sql
-- 定长字符串
CHAR(n)       -- n个字符,最大255

-- 变长字符串
VARCHAR(n)    -- n个字符,最大65535

-- 大文本
TEXT          -- 最大65535字节
MEDIUMTEXT    -- 最大16MB
LONGTEXT      -- 最大4GB

-- 二进制数据
BLOB          -- 二进制大对象

-- 示例
CREATE TABLE strings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code CHAR(10),
    name VARCHAR(100),
    description TEXT,
    content LONGTEXT
);
```

### 2.3 日期时间类型

```sql
DATE          -- 日期 'YYYY-MM-DD'
TIME          -- 时间 'HH:MM:SS'
DATETIME      -- 日期时间 'YYYY-MM-DD HH:MM:SS'
TIMESTAMP     -- 时间戳,自动更新
YEAR          -- 年份

-- 示例
CREATE TABLE dates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    birth_date DATE,
    start_time TIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    birth_year YEAR
);
```

### 2.4 枚举和集合

```sql
-- 枚举(单选)
ENUM('value1', 'value2', 'value3')

-- 集合(多选)
SET('value1', 'value2', 'value3')

-- 示例
CREATE TABLE options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gender ENUM('male', 'female', 'other'),
    hobbies SET('reading', 'sports', 'music', 'travel')
);
```

---

## 三、DDL 数据定义

### 3.1 创建数据库

```sql
-- 创建数据库
CREATE DATABASE mydb;

-- 创建数据库并指定字符集
CREATE DATABASE mydb
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 如果不存在则创建
CREATE DATABASE IF NOT EXISTS mydb;
```

### 3.2 删除数据库

```sql
DROP DATABASE mydb;
DROP DATABASE IF EXISTS mydb;
```

### 3.3 创建表

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL COMMENT '邮箱',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    age TINYINT UNSIGNED COMMENT '年龄',
    gender ENUM('male', 'female', 'other') DEFAULT 'other' COMMENT '性别',
    balance DECIMAL(10,2) DEFAULT 0.00 COMMENT '余额',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 索引
    INDEX idx_email (email),
    INDEX idx_username (username),

    -- 引擎和字符集
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 3.4 外键约束

#### 3.4.1 创建外键

```sql
-- 创建订单表(引用用户表)
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
    user_id INT NOT NULL COMMENT '用户ID',
    amount DECIMAL(10,2) NOT NULL COMMENT '订单金额',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-待支付, 1-已支付, 2-已取消',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    -- 外键约束
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE      -- 删除用户时级联删除订单
        ON UPDATE CASCADE,     -- 更新用户ID时级联更新

    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 创建订单项表(引用订单表和产品表)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL COMMENT '订单ID',
    product_id INT NOT NULL COMMENT '产品ID',
    quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
    price DECIMAL(10,2) NOT NULL COMMENT '单价',

    -- 外键约束
    CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT     -- 禁止删除有引用的产品
        ON UPDATE CASCADE,

    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单项表';
```

#### 3.4.2 外键操作类型

```sql
-- ON DELETE / ON UPDATE 可选操作:
-- CASCADE:     级联操作(删除/更新主表时,从表也跟着删除/更新)
-- RESTRICT:    限制操作(如果从表有引用,禁止删除/更新主表)
-- NO ACTION:   与RESTRICT类似(MySQL中相同)
-- SET NULL:    设置为NULL(删除/更新主表时,从表外键设为NULL)
-- SET DEFAULT: 设置为默认值(需要字段有默认值)

-- 示例: 软删除场景
CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT COMMENT '分类ID',
    title VARCHAR(200) NOT NULL,
    content TEXT,
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除: 0-否, 1-是',

    -- 删除分类时,文章category_id设为NULL
    CONSTRAINT fk_article_category FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 3.4.3 管理外键

```sql
-- 查看外键信息
SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'database_name'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 添加外键(表已存在时)
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user
FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- 删除外键
ALTER TABLE orders DROP FOREIGN KEY fk_orders_user;

-- 禁用外键检查(批量导入数据时使用)
SET FOREIGN_KEY_CHECKS = 0;
-- 执行批量操作...
SET FOREIGN_KEY_CHECKS = 1;
```

### 3.5 表关系设计

#### 3.5.1 一对一关系 (1:1)

```sql
-- 用户和用户详情
CREATE TABLE user_profiles (
    user_id INT PRIMARY KEY,  -- 既是主键也是外键
    bio TEXT COMMENT '个人简介',
    avatar VARCHAR(255) COMMENT '头像URL',
    address VARCHAR(500) COMMENT '地址',

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 3.5.2 一对多关系 (1:N)

最常见的外键关系，一个用户可以有多个订单（参考上面的 orders 表示例）。

#### 3.5.3 多对多关系 (M:N)

多对多关系需要中间表来实现：

```sql
-- 学生表
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    student_no VARCHAR(20) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 课程表
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    credit INT NOT NULL DEFAULT 1 COMMENT '学分'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 中间表（学生选课）
CREATE TABLE student_courses (
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enroll_date DATE DEFAULT (CURDATE()) COMMENT '选课日期',
    grade DECIMAL(5,2) COMMENT '成绩',

    PRIMARY KEY (student_id, course_id),  -- 联合主键
    FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_course_id (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生选课表';
```

### 3.6 修改表结构

```sql
-- 添加列
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- 修改列
ALTER TABLE users MODIFY COLUMN phone VARCHAR(25);
ALTER TABLE users CHANGE COLUMN phone mobile VARCHAR(25);

-- 删除列
ALTER TABLE users DROP COLUMN phone;

-- 重命名表
ALTER TABLE users RENAME TO user_info;

-- 添加主键
ALTER TABLE users ADD PRIMARY KEY (id);

-- 删除主键
ALTER TABLE users DROP PRIMARY KEY;

-- 添加索引
ALTER TABLE users ADD INDEX idx_age (age);

-- 删除索引
ALTER TABLE users DROP INDEX idx_age;
```

### 3.7 删除表

```sql
DROP TABLE users;
DROP TABLE IF EXISTS users;

-- 清空表数据(保留结构)
TRUNCATE TABLE users;
```

### 3.8 查看表信息

```sql
-- 查看建表语句
SHOW CREATE TABLE users;

-- 查看表状态
SHOW TABLE STATUS LIKE 'users';

-- 查看索引
SHOW INDEX FROM users;
```

---

## 四、DML 数据操作

### 4.1 插入数据

```sql
-- 插入单条记录
INSERT INTO users (username, email, password)
VALUES ('john', 'john@example.com', 'password123');

-- 插入多条记录
INSERT INTO users (username, email, password) VALUES
    ('alice', 'alice@example.com', 'pass123'),
    ('bob', 'bob@example.com', 'pass456'),
    ('charlie', 'charlie@example.com', 'pass789');

-- 插入时忽略重复
INSERT IGNORE INTO users (username, email, password)
VALUES ('john', 'john@example.com', 'password123');

-- 插入或更新(存在则更新)
INSERT INTO users (username, email, password)
VALUES ('john', 'john@example.com', 'newpass')
ON DUPLICATE KEY UPDATE
    email = VALUES(email),
    password = VALUES(password);
```

### 4.2 更新数据

```sql
-- 更新单条记录
UPDATE users
SET email = 'newemail@example.com'
WHERE id = 1;

-- 更新多条记录
UPDATE users
SET status = 0
WHERE age < 18;

-- 批量更新不同值
UPDATE users
SET balance = CASE id
    WHEN 1 THEN 100.00
    WHEN 2 THEN 200.00
    WHEN 3 THEN 300.00
END
WHERE id IN (1, 2, 3);

-- 自增/自减
UPDATE users
SET balance = balance + 50.00
WHERE id = 1;

UPDATE products
SET stock = stock - 1
WHERE id = 10 AND stock > 0;
```

### 4.3 删除数据

```sql
-- 删除单条记录
DELETE FROM users WHERE id = 1;

-- 删除符合条件的记录
DELETE FROM users WHERE status = 0;

-- 删除所有记录(慎用)
DELETE FROM users;

-- 限制删除数量
DELETE FROM logs ORDER BY created_at ASC LIMIT 1000;
```

### 4.4 替换数据

```sql
-- REPLACE: 先删除再插入(基于主键或唯一索引)
REPLACE INTO users (id, username, email)
VALUES (1, 'john_new', 'john_new@example.com');
```

---

## 五、DQL 数据查询

### 5.1 基本查询

```sql
-- 查询所有字段
SELECT * FROM users;

-- 查询指定字段
SELECT id, username, email FROM users;

-- 使用别名
SELECT
    id AS user_id,
    username AS name,
    email AS mail
FROM users;

-- 去重
SELECT DISTINCT age FROM users;

-- 限制结果数量
SELECT * FROM users LIMIT 10;
SELECT * FROM users LIMIT 10 OFFSET 20;  -- 从第21条开始取10条
```

### 5.2 条件查询

```sql
-- 等于
SELECT * FROM users WHERE age = 25;

-- 不等于
SELECT * FROM users WHERE age != 25;
SELECT * FROM users WHERE age <> 25;

-- 比较运算符
SELECT * FROM users WHERE age > 18;
SELECT * FROM users WHERE age >= 18;
SELECT * FROM users WHERE age < 60;
SELECT * FROM users WHERE age <= 60;

-- BETWEEN (包含边界)
SELECT * FROM users WHERE age BETWEEN 18 AND 60;

-- IN
SELECT * FROM users WHERE age IN (18, 25, 30);
SELECT * FROM users WHERE age NOT IN (18, 25, 30);

-- LIKE (模糊匹配)
SELECT * FROM users WHERE username LIKE 'john%';     -- 以john开头
SELECT * FROM users WHERE username LIKE '%john%';    -- 包含john
SELECT * FROM users WHERE username LIKE '_ohn';      -- 第二个字符是o,共4个字符

-- IS NULL / IS NOT NULL
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;
```

### 5.3 逻辑运算符

```sql
-- AND
SELECT * FROM users WHERE age > 18 AND status = 1;

-- OR
SELECT * FROM users WHERE age < 18 OR age > 60;

-- NOT
SELECT * FROM users WHERE NOT status = 1;

-- 组合使用
SELECT * FROM users
WHERE (age BETWEEN 18 AND 30)
  AND (status = 1 OR status = 2)
  AND username LIKE 'a%';
```

### 5.4 排序

```sql
-- 升序(默认)
SELECT * FROM users ORDER BY age ASC;

-- 降序
SELECT * FROM users ORDER BY age DESC;

-- 多字段排序
SELECT * FROM users
ORDER BY age DESC, created_at ASC;

-- 按表达式排序
SELECT * FROM users
ORDER BY LENGTH(username) DESC;
```

### 5.5 聚合函数

```sql
-- COUNT: 计数
SELECT COUNT(*) FROM users;
SELECT COUNT(DISTINCT age) FROM users;

-- SUM: 求和
SELECT SUM(balance) FROM users;

-- AVG: 平均值
SELECT AVG(age) FROM users;

-- MAX: 最大值
SELECT MAX(age) FROM users;

-- MIN: 最小值
SELECT MIN(age) FROM users;

-- 分组统计
SELECT
    gender,
    COUNT(*) as count,
    AVG(age) as avg_age,
    MAX(balance) as max_balance
FROM users
GROUP BY gender;

-- HAVING: 过滤分组
SELECT
    gender,
    COUNT(*) as count
FROM users
GROUP BY gender
HAVING count > 10;
```

---

## 六、高级查询

### 6.1 JOIN 连接查询

#### 6.1.1 基本 JOIN 类型

```sql
-- INNER JOIN (内连接) - 只返回两个表内都匹配的行，交集
SELECT u.username, o.order_no
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN (左连接) - 返回左表（users）所有行，右表无匹配则为NULL
SELECT u.username, o.order_no
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- RIGHT JOIN (右连接) - 返回右表(orders)所有行，左表无匹配则为NULL
SELECT u.username, o.order_no
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;

-- FULL OUTER JOIN (全外连接,MySQL不直接支持,用UNION模拟)
SELECT u.username, o.order_no
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
UNION
SELECT u.username, o.order_no
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;
```

#### 6.1.2 多表连接

```sql
-- 三表连接
SELECT
    u.username,
    o.order_no,
    p.product_name
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id;

-- 查询订单及详细信息(完整示例)
SELECT
    o.order_no,
    u.username,
    u.email,
    p.product_name,
    oi.quantity,
    oi.price,
    (oi.quantity * oi.price) as subtotal,
    o.created_at as order_time
FROM orders o
INNER JOIN users u ON o.user_id = u.id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.id = 100;
```

#### 6.1.3 实际应用场景

```sql
-- 场景1: 查询用户及其订单信息
SELECT
    u.username,
    u.email,
    o.order_no,
    o.amount,
    o.created_at as order_time
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.id = 1;

-- 场景2: 查询学生的选课情况(多对多关系)
SELECT
    s.name as student_name,
    s.student_no,
    c.course_name,
    sc.grade,
    c.credit,
    sc.enroll_date
FROM students s
INNER JOIN student_courses sc ON s.id = sc.student_id
INNER JOIN courses c ON sc.course_id = c.id
ORDER BY s.name, c.course_name;

-- 场景3: 统计每个用户的订单数量和总金额
SELECT
    u.username,
    COUNT(o.id) as order_count,
    SUM(o.amount) as total_amount,
    AVG(o.amount) as avg_amount,
    MAX(o.amount) as max_order,
    MIN(o.amount) as min_order
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username
HAVING order_count > 0
ORDER BY total_amount DESC;

-- 场景4: 查找没有订单的用户
SELECT
    u.username,
    u.email
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;

-- 场景5: 查询每个分类的文章数量
SELECT
    c.category_name,
    COUNT(a.id) as article_count
FROM categories c
LEFT JOIN articles a ON c.id = a.category_id
GROUP BY c.id, c.category_name
ORDER BY article_count DESC;
```

#### 6.1.4 JOIN 优化建议

```sql
-- ✅ 好的实践
-- 1. 使用明确的字段列表代替 SELECT *
SELECT u.username, o.order_no, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- 2. 为JOIN条件字段创建索引
-- 确保 user_id, order_id 等外键字段有索引

-- 3. 先过滤再JOIN(减少数据量)
SELECT u.username, o.order_no
FROM users u
INNER JOIN (
    SELECT * FROM orders WHERE amount > 1000
) o ON u.id = o.user_id;

-- ❌ 避免的做法
-- 1. 避免不必要的多表JOIN
-- 2. 避免在JOIN条件中使用函数
-- 3. 避免JOIN大表时没有合适的索引
```

### 6.2 子查询

```sql
-- WHERE 子句中的子查询
SELECT * FROM users
WHERE age > (SELECT AVG(age) FROM users);

-- IN 子查询
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE amount > 1000);

-- EXISTS 子查询
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- FROM 子句中的子查询(派生表)
SELECT * FROM (
    SELECT user_id, COUNT(*) as order_count
    FROM orders
    GROUP BY user_id
) AS order_stats
WHERE order_count > 5;

-- SELECT 子句中的子查询
SELECT
    username,
    (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count
FROM users u;
```

### 6.3 UNION 联合查询

```sql
-- UNION (去重)
SELECT username FROM users
UNION
SELECT customer_name FROM customers;

-- UNION ALL (不去重,性能更好)
SELECT username FROM users
UNION ALL
SELECT customer_name FROM customers;
```

### 6.4 窗口函数(MySQL 8.0+)

```sql
-- ROW_NUMBER: 行号
SELECT
    username,
    age,
    ROW_NUMBER() OVER (ORDER BY age DESC) as row_num
FROM users;

-- RANK: 排名(有并列会跳过)
SELECT
    username,
    age,
    RANK() OVER (ORDER BY age DESC) as rank
FROM users;

-- DENSE_RANK: 密集排名(有并列不跳过)
SELECT
    username,
    age,
    DENSE_RANK() OVER (ORDER BY age DESC) as dense_rank
FROM users;

-- PARTITION BY: 分区
SELECT
    username,
    gender,
    age,
    ROW_NUMBER() OVER (PARTITION BY gender ORDER BY age DESC) as rank_in_gender
FROM users;

-- 聚合窗口函数
SELECT
    username,
    age,
    SUM(age) OVER (ORDER BY id) as running_total,
    AVG(age) OVER (ORDER BY id ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg
FROM users;
```

### 6.5 CTE 公用表表达式(MySQL 8.0+)

```sql
-- 简单CTE
WITH active_users AS (
    SELECT * FROM users WHERE status = 1
)
SELECT * FROM active_users WHERE age > 18;

-- 递归CTE
WITH RECURSIVE numbers AS (
    SELECT 1 as n
    UNION ALL
    SELECT n + 1 FROM numbers WHERE n < 10
)
SELECT * FROM numbers;
```

---

## 七、索引优化

### 7.1 创建索引

```sql
-- 普通索引
CREATE INDEX idx_username ON users(username);

-- 唯一索引
CREATE UNIQUE INDEX idx_email ON users(email);

-- 复合索引
CREATE INDEX idx_age_status ON users(age, status);

-- 前缀索引
CREATE INDEX idx_name_prefix ON users(username(10));

-- 全文索引
CREATE FULLTEXT INDEX idx_content ON articles(content);

-- 在建表时创建
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100),
    INDEX idx_username (username),
    UNIQUE INDEX idx_email (email)
);
```

### 7.2 查看索引

```sql
-- 查看表的索引
SHOW INDEX FROM users;

-- 查看索引使用情况
EXPLAIN SELECT * FROM users WHERE username = 'john';
```

### 7.3 删除索引

```sql
DROP INDEX idx_username ON users;
```

### 7.4 索引使用原则

```sql
-- ✅ 适合创建索引的场景
-- 1. 频繁用于WHERE条件的列
-- 2. 用于JOIN连接的列
-- 3. 用于ORDER BY的列
-- 4. 用于GROUP BY的列
-- 5. 唯一性高的列

-- ❌ 不适合创建索引的场景
-- 1. 数据量小的表
-- 2. 频繁更新的列
-- 3. 区分度低的列(如性别)
-- 4. 很少用于查询的列

-- 最左前缀原则
-- 复合索引 (a, b, c)
-- ✅ 可以使用索引
SELECT * FROM table WHERE a = 1;
SELECT * FROM table WHERE a = 1 AND b = 2;
SELECT * FROM table WHERE a = 1 AND b = 2 AND c = 3;

-- ❌ 不能使用索引
SELECT * FROM table WHERE b = 2;
SELECT * FROM table WHERE c = 3;
SELECT * FROM table WHERE b = 2 AND c = 3;
```

### 7.5 EXPLAIN 分析

```sql
EXPLAIN SELECT * FROM users WHERE username = 'john';

-- 关键字段说明:
-- type: all(全表扫描) < index(索引扫描) < range(范围扫描) < ref(索引查找) < const(常量) < system
-- key: 实际使用的索引
-- rows: 预估扫描行数
-- Extra: 额外信息(Using where, Using index, Using temporary等)
```

---

## 八、事务处理

### 8.1 事务控制

```sql
-- 开始事务
START TRANSACTION;
-- 或
BEGIN;

-- 提交事务
COMMIT;

-- 回滚事务
ROLLBACK;

-- 设置保存点
SAVEPOINT savepoint_name;

-- 回滚到保存点
ROLLBACK TO savepoint_name;

-- 释放保存点
RELEASE SAVEPOINT savepoint_name;
```

### 8.2 事务示例

```sql
START TRANSACTION;

-- 转账操作
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- 检查是否成功
IF @@error_count > 0 THEN
    ROLLBACK;
ELSE
    COMMIT;
END IF;
```

### 8.3 隔离级别

```sql
-- 查看当前隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;  -- 默认
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- 四种隔离级别:
-- 1. READ UNCOMMITTED: 读未提交(最低级别,可能有脏读)
-- 2. READ COMMITTED: 读已提交(Oracle默认)
-- 3. REPEATABLE READ: 可重复读(MySQL默认)
-- 4. SERIALIZABLE: 串行化(最高级别,性能最差)
```

### 8.4 锁机制

```sql
-- 共享锁(读锁)
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;

-- 排他锁(写锁)
SELECT * FROM users WHERE id = 1 FOR UPDATE;

-- 查看锁信息
SHOW ENGINE INNODB STATUS;
SELECT * FROM information_schema.INNODB_LOCKS;
SELECT * FROM information_schema.INNODB_TRX;
```

---

## 九、用户权限

### 9.1 用户管理

```sql
-- 创建用户
CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
CREATE USER 'username'@'%' IDENTIFIED BY 'password';  -- 允许任意主机

-- 删除用户
DROP USER 'username'@'localhost';

-- 修改密码
ALTER USER 'username'@'localhost' IDENTIFIED BY 'new_password';

-- 查看所有用户
SELECT user, host FROM mysql.user;
```

### 9.2 权限管理

```sql
-- 授予权限
GRANT ALL PRIVILEGES ON database.* TO 'username'@'localhost';
GRANT SELECT, INSERT, UPDATE ON database.table TO 'username'@'localhost';
GRANT SELECT ON *.* TO 'username'@'localhost';

-- 撤销权限
REVOKE ALL PRIVILEGES ON database.* FROM 'username'@'localhost';
REVOKE SELECT ON database.table FROM 'username'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 查看用户权限
SHOW GRANTS FOR 'username'@'localhost';

-- 常用权限:
-- ALL PRIVILEGES: 所有权限
-- SELECT: 查询
-- INSERT: 插入
-- UPDATE: 更新
-- DELETE: 删除
-- CREATE: 创建
-- DROP: 删除
-- ALTER: 修改
-- INDEX: 索引
-- EXECUTE: 执行存储过程
-- TRIGGER: 触发器
```

---

## 十、性能优化

### 10.1 查询优化

```sql
-- ✅ 优化建议

-- 1. 避免 SELECT *
SELECT id, username FROM users;  -- 只查询需要的字段

-- 2. 使用索引覆盖
SELECT id, username FROM users WHERE username = 'john';  -- username有索引

-- 3. 避免在索引列上使用函数
-- ❌ 不好
SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- ✅ 好
SELECT * FROM users WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- 4. 使用 LIMIT 限制结果集
SELECT * FROM users LIMIT 100;

-- 5. 避免使用 OR,改用 UNION
-- ❌ 不好
SELECT * FROM users WHERE age = 18 OR age = 25;
-- ✅ 好
SELECT * FROM users WHERE age = 18
UNION
SELECT * FROM users WHERE age = 25;

-- 6. 使用 EXISTS 代替 IN
-- ❌ 不好
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);
-- ✅ 好
SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 7. 批量插入
INSERT INTO users (username, email) VALUES
    ('user1', 'user1@example.com'),
    ('user2', 'user2@example.com'),
    ('user3', 'user3@example.com');
```

### 10.2 配置优化

```ini
# my.cnf 配置文件优化

[mysqld]
# 连接数
max_connections = 500

# 缓冲池大小(物理内存的50-70%)
innodb_buffer_pool_size = 2G

# 日志文件大小
innodb_log_file_size = 256M

# 查询缓存( MySQL 8.0已移除)
query_cache_size = 0

# 临时表大小
tmp_table_size = 64M
max_heap_table_size = 64M

# 排序缓冲
sort_buffer_size = 4M
read_buffer_size = 4M

# 线程缓存
thread_cache_size = 8

# 慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

### 10.3 监控和优化

```sql
-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query_log%';
SHOW VARIABLES LIKE 'long_query_time';

-- 查看当前连接
SHOW PROCESSLIST;

-- 查看表状态
SHOW TABLE STATUS;

-- 查看索引使用情况
SELECT
    table_schema,
    table_name,
    index_name,
    seq_in_index,
    column_name
FROM information_schema.STATISTICS
WHERE table_schema = 'database_name';

-- 查看锁等待
SELECT * FROM information_schema.INNODB_LOCK_WAITS;
```

---

## 十一、备份恢复

### 11.1 备份

```bash
# 备份整个数据库
mysqldump -u root -p database_name > backup.sql

# 备份多个数据库
mysqldump -u root -p --databases db1 db2 > backup.sql

# 备份所有数据库
mysqldump -u root -p --all-databases > backup.sql

# 备份指定表
mysqldump -u root -p database_name table1 table2 > backup.sql

# 只备份结构
mysqldump -u root -p --no-data database_name > structure.sql

# 只备份数据
mysqldump -u root -p --no-create-info database_name > data.sql

# 压缩备份
mysqldump -u root -p database_name | gzip > backup.sql.gz

# 带时间戳的备份
mysqldump -u root -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 11.2 恢复

```bash
# 恢复数据库
mysql -u root -p database_name < backup.sql

# 从压缩文件恢复
gunzip < backup.sql.gz | mysql -u root -p database_name

# 在MySQL中恢复
SOURCE /path/to/backup.sql;
```

### 11.3 导入导出

```sql
-- 导出数据到文件
SELECT * FROM users INTO OUTFILE '/tmp/users.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- 从文件导入数据
LOAD DATA INFILE '/tmp/users.csv'
INTO TABLE users
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

---

## 十二、最佳实践

### 12.1 设计规范

1. **表设计规范**
   - 每个表必须有主键
   - 使用有意义的表名和字段名
   - 添加注释说明
   - 使用合适的存储引擎(InnoDB推荐)
   - 统一字符集(utf8mb4)

2. **字段设计规范**
   - 选择合适的数据类型
   - 尽量使用NOT NULL约束
   - 为字段设置默认值
   - 使用UNSIGNED修饰无符号数值
   - 避免使用TEXT/BLOB,考虑分表存储

3. **索引设计规范**
   - 为高频查询字段创建索引
   - 遵循最左前缀原则
   - 避免过多索引(影响写入性能)
   - 定期分析和优化索引
   - 使用覆盖索引减少回表

### 12.2 安全规范

1. **账户安全**
   - 不使用root账户连接应用
   - 为每个应用创建独立账户
   - 遵循最小权限原则
   - 定期更换密码
   - 限制访问IP

2. **数据安全**
   - 敏感数据加密存储
   - 使用参数化查询防止SQL注入
   - 定期备份数据
   - 启用二进制日志
   - 审计重要操作

3. **网络安全**
   - 修改默认端口
   - 绑定特定IP地址
   - 启用SSL连接
   - 防火墙限制访问
   - 禁用远程root登录

### 12.3 性能规范

1. **查询优化**
   - 避免SELECT \*,只查询需要的字段
   - 使用LIMIT限制结果集
   - 合理使用索引
   - 避免在索引列上使用函数
   - 使用EXPLAIN分析查询

2. **事务优化**
   - 保持事务简短
   - 避免长时间持有锁
   - 合理设置隔离级别
   - 批量操作使用事务
   - 及时提交或回滚

3. **连接优化**
   - 使用连接池
   - 及时关闭连接
   - 避免频繁创建销毁连接
   - 监控连接数
   - 设置合理的超时时间

### 12.4 运维规范

1. **监控告警**
   - 监控CPU、内存、磁盘使用率
   - 监控连接数和QPS
   - 监控慢查询
   - 监控主从延迟
   - 设置告警阈值

2. **备份策略**
   - 每日全量备份
   - 每小时增量备份
   - 定期测试恢复
   - 异地备份
   - 保留足够历史备份

3. **容量规划**
   - 定期评估数据增长
   - 预留足够磁盘空间
   - 规划分库分表方案
   - 定期清理历史数据
   - 归档冷数据

---

## 附录

### A. 常用系统变量

```sql
-- 查看版本
SELECT VERSION();

-- 查看字符集
SHOW VARIABLES LIKE 'character_set%';

-- 查看排序规则
SHOW VARIABLES LIKE 'collation%';

-- 查看最大连接数
SHOW VARIABLES LIKE 'max_connections';

-- 查看缓冲池大小
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';

-- 查看时区
SHOW VARIABLES LIKE 'time_zone';
SELECT @@time_zone;
```

### B. 常用系统函数

```sql
-- 日期时间函数
NOW()                    -- 当前日期时间
CURDATE()                -- 当前日期
CURTIME()                -- 当前时间
UNIX_TIMESTAMP()         -- Unix时间戳
FROM_UNIXTIME()          -- Unix时间戳转日期
DATE_ADD()               -- 日期加法
DATE_SUB()               -- 日期减法
DATEDIFF()               -- 日期差
YEAR(), MONTH(), DAY()   -- 提取年月日

-- 字符串函数
CONCAT()                 -- 字符串连接
SUBSTRING()              -- 截取字符串
LENGTH()                 -- 字符串长度
UPPER(), LOWER()         -- 大小写转换
TRIM()                   -- 去除空格
REPLACE()                -- 替换字符串

-- 数学函数
ABS()                    -- 绝对值
CEIL(), FLOOR()          -- 向上/向下取整
ROUND()                  -- 四舍五入
RAND()                   -- 随机数
POWER()                  -- 幂运算

-- 聚合函数
COUNT(), SUM(), AVG(), MAX(), MIN()

-- 条件函数
IF()                     -- 条件判断
CASE WHEN ... THEN ... END  -- 条件分支
COALESCE()               -- 返回第一个非NULL值
NULLIF()                 -- 相等返回NULL
```

### C. 学习资源

- **官方文档**: https://dev.mysql.com/doc/
- **MySQL教程**: https://www.mysqltutorial.org/
- **性能优化**: 《高性能MySQL》
- **在线练习**: https://sqlzoo.net/
- **社区论坛**: https://forums.mysql.com/

---

**提示**: 本手册涵盖了MySQL日常开发中最常用的功能和最佳实践,建议结合实际项目需求深入学习和实践。
