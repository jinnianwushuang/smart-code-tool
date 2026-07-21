# PostgreSQL vs MySQL + MongoDB：为什么 PostgreSQL 是更优选择

> **版本**: 1.0  
> **最后更新**: 2026-07-21  
> **适用对象**: 后端开发者、全栈工程师、DBA、架构师、技术选型决策者

---

## 📑 目录

- [一、背景与选型动机](#一背景与选型动机)
- [二、三者定位概览](#二三者定位概览)
- [三、核心维度对比](#三核心维度对比)
- [四、PostgreSQL 核心优势详解](#四postgresql-核心优势详解)
- [五、PostgreSQL 替代 MySQL + MongoDB 的方案](#五postgresql-替代-mysql--mongodb-的方案)
- [六、性能基准对比](#六性能基准对比)
- [七、生态与扩展能力](#七生态与扩展能力)
- [八、运维与部署对比](#八运维与部署对比)
- [九、典型场景选型建议](#九典型场景选型建议)
- [十、迁移策略](#十迁移策略)
- [十一、总结](#十一总结)

---

## 一、背景与选型动机

传统架构中，很多团队采用 **MySQL（关系型）+ MongoDB（文档型）** 的双数据库组合：

- MySQL 处理结构化事务数据（订单、用户、支付）
- MongoDB 处理半结构化/灵活 Schema 数据（日志、配置、用户画像）

这种组合带来的问题：

| 痛点 | 说明 |
|------|------|
| 运维成本翻倍 | 两套集群、两套监控、两套备份策略 |
| 数据一致性难保证 | 跨库事务无法原子提交 |
| 技术栈割裂 | 团队需同时精通 SQL + NoSQL 两套查询范式 |
| 数据冗余与同步 | 同一实体可能在两个库中各存一份 |

**PostgreSQL 凭借其"多模型"能力，可以用单一数据库覆盖上述全部场景。**

---

## 二、三者定位概览

| 维度 | PostgreSQL | MySQL | MongoDB |
|------|-----------|-------|---------|
| 类型 | 对象-关系型（ORDBMS） | 关系型（RDBMS） | 文档型（NoSQL） |
| 数据模型 | 关系表 + JSON/JSONB + 数组 + 复合类型 + 图 | 关系表 | BSON 文档 |
| 事务 | 完整 ACID（含 DDL） | ACID（InnoDB） | 4.0+ 多文档事务（有限） |
| Schema | 灵活（支持无 Schema 的 JSONB 列） | 严格 | 无 Schema |
| 许可证 | PostgreSQL License（类 MIT） | GPL（Oracle 控制） | SSPL（非 OSI） |
| 当前最新大版本 | PostgreSQL 17 | MySQL 9.x | MongoDB 8.x |

---

## 三、核心维度对比

### 3.1 数据模型灵活性

```sql
-- PostgreSQL：一张表同时拥有结构化列 + 文档列
CREATE TABLE products (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  price       NUMERIC(12,2),
  attributes  JSONB,          -- 灵活属性，替代 MongoDB
  tags        TEXT[],         -- 原生数组
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 查询 JSONB 内部字段（支持 GIN 索引）
SELECT * FROM products
WHERE attributes @> '{"color": "red", "size": "XL"}';
```

```javascript
// MongoDB 等价操作
db.products.find({ "attributes.color": "red", "attributes.size": "XL" })
```

> PostgreSQL 的 JSONB 在功能上完全覆盖 MongoDB 的文档查询能力，同时还享有 SQL 事务保障。

### 3.2 事务与一致性

| 能力 | PostgreSQL | MySQL (InnoDB) | MongoDB |
|------|-----------|----------------|---------|
| 单行事务 | ✅ | ✅ | ✅ |
| 多表事务 | ✅ | ✅ | ⚠️ 4.0+（性能代价大） |
| DDL 事务 | ✅（CREATE TABLE 可回滚） | ❌ | ❌ |
| 分布式事务 | ✅（2PC / FDW） | ⚠️ XA（有限） | ⚠️（跨分片代价极高） |
| 隔离级别 | Read Committed ~ Serializable | Read Committed ~ Serializable | Snapshot（默认） |

### 3.3 查询能力

| 能力 | PostgreSQL | MySQL | MongoDB |
|------|-----------|-------|---------|
| 窗口函数 | ✅ 完整 | ✅ 8.0+ | ⚠️ 有限（$setWindowFields） |
| CTE / 递归 CTE | ✅ | ✅ 8.0+ | ⚠️ $graphLookup（有限） |
| 全文搜索 | ✅ 内置 tsvector | ⚠️ 基础 FULLTEXT | ✅ 文本索引 |
| 地理空间 | ✅ PostGIS（业界标准） | ⚠️ 基础 Spatial | ✅ 2dsphere |
| 图查询 | ✅ Apache AGE 扩展 | ❌ | ⚠️ $graphLookup |
| 向量搜索 | ✅ pgvector | ❌ | ✅（Atlas Vector Search） |

### 3.4 索引体系

| 索引类型 | PostgreSQL | MySQL | MongoDB |
|----------|-----------|-------|---------|
| B-Tree | ✅ | ✅ | ✅ |
| Hash | ✅ | ⚠️ Memory 引擎 | ✅ |
| GIN（倒排） | ✅ | ❌ | ✅（多键索引） |
| GiST（空间/全文） | ✅ | ❌ | ❌ |
| SP-GiST | ✅ | ❌ | ❌ |
| BRIN（大表） | ✅ | ❌ | ❌ |
| 部分索引 | ✅ | ❌ | ✅（Partial） |
| 表达式索引 | ✅ | ❌ | ✅（Wildcard） |
| 覆盖索引 | ✅（INCLUDE） | ✅ 8.0+ | ✅ |

---

## 四、PostgreSQL 核心优势详解

### 4.1 真正的多模型数据库

```
┌─────────────────────────────────────────────────┐
│              PostgreSQL 统一引擎                  │
├──────────┬──────────┬──────────┬────────────────┤
│ 关系表    │ JSONB    │ 时序     │ 向量 / 图      │
│ (SQL)    │ (文档)   │ (TimescaleDB) │ (pgvector/AGE) │
└──────────┴──────────┴──────────┴────────────────┘
```

一个数据库实例即可替代：MySQL（关系）+ MongoDB（文档）+ Elasticsearch（搜索）+ Redis（部分缓存场景）。

### 4.2 数据完整性与类型系统

```sql
-- 复合类型
CREATE TYPE address AS (
  street TEXT,
  city   TEXT,
  zip    TEXT
);

-- 域类型（带约束的别名）
CREATE DOMAIN email AS TEXT CHECK (VALUE ~* '^[^@]+@[^@]+\.[^@]+$');

-- 枚举
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'done');

-- 范围类型
CREATE TABLE reservations (
  room_id INT,
  during  TSTZRANGE,
  EXCLUDE USING gist (room_id WITH =, during WITH &&)  -- 防止时间重叠
);
```

MySQL 和 MongoDB 均不支持上述高级类型约束。

### 4.3 扩展性架构

PostgreSQL 的扩展机制是其最强大的差异化能力：

| 扩展 | 用途 | 替代方案 |
|------|------|---------|
| **PostGIS** | 地理空间分析 | MongoDB 2dsphere / 独立 GIS 服务 |
| **pgvector** | 向量相似度搜索（AI/RAG） | Milvus / Pinecone / MongoDB Atlas Vector |
| **TimescaleDB** | 时序数据 | InfluxDB / TimescaleDB |
| **Apache AGE** | 图数据库 | Neo4j |
| **pg_partman** | 自动分区管理 | 手动分区脚本 |
| **Citus** | 分布式水平扩展 | MongoDB 分片 / MySQL 分库分表 |
| **pg_cron** | 数据库内定时任务 | 外部 crontab |
| **pg_stat_statements** | 慢查询分析 | 外部 APM |
| **pgbouncer** | 连接池 | ProxySQL |

### 4.4 MVCC 与并发控制

```
PostgreSQL MVCC 实现：
- 读不阻塞写，写不阻塞读
- 通过 VACUUM 回收死元组（非 undo log）
- 支持 Serializable Snapshot Isolation (SSI)
  → 唯一在 Serializable 级别下无锁实现真正可串行化的主流数据库
```

MySQL InnoDB 使用 undo log 实现 MVCC，长事务会导致 undo 表空间膨胀；MongoDB 使用 WiredTiger 快照，但多文档事务性能衰减明显。

### 4.5 安全性与权限

| 能力 | PostgreSQL | MySQL | MongoDB |
|------|-----------|-------|---------|
| 行级安全 (RLS) | ✅ | ❌ | ❌ |
| 列级权限 | ✅ | ✅ | ⚠️（视图模拟） |
| 数据加密 (TDE) | ✅（pgcrypto / 扩展） | ✅ Enterprise | ✅ Enterprise |
| SCRAM 认证 | ✅ | ✅ caching_sha2 | ✅ SCRAM |
| 审计日志 | ✅ pgaudit | ✅ Enterprise | ✅ |

### 4.6 许可证优势

| 数据库 | 许可证 | 风险 |
|--------|--------|------|
| PostgreSQL | PostgreSQL License（类 MIT/BSD） | 无商业限制，永不闭源 |
| MySQL | GPL + Oracle 商业双许可 | Oracle 控制路线图，社区版功能受限 |
| MongoDB | SSPL（Server Side Public License） | 非 OSI 认证，云厂商受限，存在合规风险 |

---

## 五、PostgreSQL 替代 MySQL + MongoDB 的方案

### 5.1 架构对比

```
传统方案（双数据库）：
┌──────────┐     ┌──────────┐
│  MySQL   │     │ MongoDB  │
│ (订单/用户)│     │(日志/配置) │
└────┬─────┘     └────┬─────┘
     │                 │
     └───────┬─────────┘
             │
      ┌──────┴──────┐
      │  应用服务层   │  ← 需维护两套连接、两套 ORM
      └─────────────┘

PostgreSQL 统一方案：
┌─────────────────────────────┐
│        PostgreSQL           │
│  ┌─────────┐  ┌──────────┐ │
│  │关系表    │  │ JSONB 列  │ │
│  │(订单/用户)│  │(日志/配置)│ │
│  └─────────┘  └──────────┘ │
└──────────────┬──────────────┘
               │
        ┌──────┴──────┐
        │  应用服务层   │  ← 单一连接池、单一 ORM
        └─────────────┘
```

### 5.2 代码层对比（Node.js / Prisma）

```typescript
// 传统方案：两个 Client
const mysql = new PrismaClient({ datasourceUrl: 'mysql://...' })
const mongo = new PrismaClient({ datasourceUrl: 'mongodb://...' })

// 跨库"事务"只能靠应用层补偿（Saga 模式）
await mysql.order.create({ data: orderData })
try {
  await mongo.auditLog.create({ data: logData })
} catch {
  await mysql.order.delete({ where: { id: orderData.id } })  // 手动补偿
}
```

```typescript
// PostgreSQL 统一方案：单一 Client + 原生事务
const prisma = new PrismaClient()

await prisma.$transaction([
  prisma.order.create({ data: orderData }),
  prisma.auditLog.create({ data: logData }),  // JSONB 字段存储灵活数据
])
```

### 5.3 JSONB 索引策略

```sql
-- 为高频查询的 JSONB 字段创建 GIN 索引
CREATE INDEX idx_products_attrs ON products USING gin (attributes jsonb_path_ops);

-- 为特定路径创建表达式索引
CREATE INDEX idx_products_color ON products ((attributes->>'color'));

-- 部分索引：仅索引活跃商品
CREATE INDEX idx_active_products_attrs
ON products USING gin (attributes)
WHERE status = 'active';
```

---

## 六、性能基准对比

### 6.1 OLTP 场景（pgbench / sysbench 等效负载）

| 场景 | PostgreSQL 17 | MySQL 9 | MongoDB 8 |
|------|:---:|:---:|:---:|
| 简单点查 (PK) | ★★★★★ | ★★★★★ | ★★★★★ |
| 复杂多表 JOIN | ★★★★★ | ★★★★ | ★★（$lookup 性能差） |
| 高并发写入 | ★★★★★ | ★★★★ | ★★★★ |
| 文档型读写 (JSONB) | ★★★★☆ | ★★（JSON 函数弱） | ★★★★★ |
| 聚合分析 (GROUP BY) | ★★★★★ | ★★★★ | ★★★ |

### 6.2 关键性能特性

| 特性 | PostgreSQL | MySQL | MongoDB |
|------|-----------|-------|---------|
| 并行查询 | ✅（多核并行 Seq Scan / JOIN） | ⚠️ 有限 | ⚠️ 有限 |
| JIT 编译 | ✅（LLVM JIT） | ❌ | ❌ |
| 表分区 | ✅ 声明式分区 | ✅ | ✅ 自动分片 |
| 连接模型 | 进程模型（配合 PgBouncer） | 线程模型 | 线程模型 |
| 批量写入优化 | ✅ COPY 命令 | ✅ LOAD DATA | ✅ insertMany |

---

## 七、生态与扩展能力

### 7.1 ORM / 驱动支持

| 语言/框架 | PostgreSQL | MySQL | MongoDB |
|-----------|:---:|:---:|:---:|
| Prisma | ✅ | ✅ | ✅ |
| Drizzle | ✅ | ✅ | ✅ |
| TypeORM | ✅ | ✅ | ✅ |
| SQLAlchemy | ✅ | ✅ | ⚠️（通过 mongoengine） |
| GORM (Go) | ✅ | ✅ | ⚠️（通过 mgorm） |
| Diesel (Rust) | ✅ | ✅ | ❌ |

### 7.2 云服务支持

所有主流云均提供 PostgreSQL 托管服务：

- **AWS**: RDS for PostgreSQL / Aurora PostgreSQL
- **GCP**: Cloud SQL for PostgreSQL / AlloyDB
- **Azure**: Azure Database for PostgreSQL
- **阿里云**: RDS PostgreSQL / PolarDB
- **Supabase**: 开源 Firebase 替代（底层即 PostgreSQL）
- **Neon**: Serverless PostgreSQL

---

## 八、运维与部署对比

### 8.1 运维复杂度

| 维度 | PostgreSQL | MySQL + MongoDB |
|------|-----------|-----------------|
| 实例数量 | 1 套 | 2 套 |
| 备份策略 | pg_basebackup / pgBackRest | mysqldump + mongodump |
| 监控 | pg_stat_* 视图 + Prometheus | 两套 exporter |
| 高可用 | Patroni / repmgr / 流复制 | MHA/Orchestrator + Replica Set |
| 升级 | 单次升级 | 两次升级，版本兼容矩阵翻倍 |
| 团队技能 | SQL 即可 | SQL + MQL + 两套运维知识 |

### 8.2 Docker Compose 对比

```yaml
# PostgreSQL 统一方案 - 单容器
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pgdata:
```

```yaml
# 传统方案 - 双容器
services:
  mysql:
    image: mysql:9
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysqldata:/var/lib/mysql
    ports:
      - "3306:3306"

  mongodb:
    image: mongo:8
    environment:
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodata:/data/db
    ports:
      - "27017:27017"

volumes:
  mysqldata:
  mongodata:
```

---

## 九、典型场景选型建议

### 9.1 推荐 PostgreSQL 的场景

| 场景 | 原因 |
|------|------|
| 新项目 / 从零开始 | 一个库搞定，降低复杂度 |
| SaaS 多租户 | RLS 行级安全天然支持租户隔离 |
| 电商 / 金融 | 强 ACID + 复杂查询 + 审计 |
| AI / RAG 应用 | pgvector 向量搜索，无需额外向量库 |
| 地理信息系统 | PostGIS 业界标准 |
| 需要灵活 Schema | JSONB 完全替代 MongoDB |
| 中小团队 | 减少运维负担，一套技术栈 |

### 9.2 仍适合 MySQL 的场景

| 场景 | 原因 |
|------|------|
| 已有大量 MySQL 存量系统 | 迁移成本高 |
| 读多写少的简单 Web 应用 | MySQL 足够且生态成熟 |
| 团队仅熟悉 MySQL | 学习曲线考量 |
| WordPress / 传统 CMS | 生态绑定 |

### 9.3 仍适合 MongoDB 的场景

| 场景 | 原因 |
|------|------|
| 超大规模水平扩展（TB 级文档） | MongoDB 自动分片更成熟 |
| 已有 MongoDB 重度依赖 | 迁移成本 |
| 纯文档存储、无事务需求 | MongoDB 开发体验略简洁 |
| 实时分析 + 聚合管道 | MongoDB Aggregation Pipeline 表达力强 |

---

## 十、迁移策略

### 10.1 MySQL → PostgreSQL

| 步骤 | 工具/方法 |
|------|----------|
| Schema 转换 | pgLoader / AWS SCT / ora2pg 思路 |
| 数据迁移 | pgLoader（支持 mysql → pg 直连迁移） |
| SQL 语法适配 | 替换反引号 → 双引号、AUTO_INCREMENT → SERIAL |
| 驱动替换 | mysql2 → pg / Prisma 切换 provider |
| 验证 | 双写对比 → 灰度切流 → 全量切换 |

### 10.2 MongoDB → PostgreSQL (JSONB)

| 步骤 | 工具/方法 |
|------|----------|
| 文档结构分析 | 识别固定字段 vs 灵活字段 |
| Schema 设计 | 固定字段 → 列，灵活字段 → JSONB 列 |
| 数据迁移 | 自定义 ETL 脚本 / Node.js 批量导入 |
| 查询改写 | MQL → SQL + JSONB 操作符 |
| 索引重建 | MongoDB 索引 → GIN / 表达式索引 |

### 10.3 关键语法映射

| MongoDB 操作 | PostgreSQL 等价 |
|-------------|----------------|
| `db.col.insertOne({a:1, b:{c:2}})` | `INSERT INTO col (a, b) VALUES (1, '{"c":2}')` |
| `db.col.find({"b.c": 2})` | `SELECT * FROM col WHERE b @> '{"c":2}'` |
| `db.col.updateOne({}, {$set:{"b.d":3}})` | `UPDATE col SET b = b \|\| '{"d":3}'` |
| `db.col.aggregate([{$group:...}])` | `SELECT ... GROUP BY ...` |
| `db.col.createIndex({"b.c":1})` | `CREATE INDEX ON col ((b->>'c'))` |

---

## 十一、总结

### 核心结论

```
┌────────────────────────────────────────────────────────────┐
│  PostgreSQL = MySQL 的关系能力 + MongoDB 的文档灵活性        │
│             + 更强的类型系统 + 更丰富的索引 + 扩展生态        │
│             + 真正的 ACID + 更宽松的许可证                   │
└────────────────────────────────────────────────────────────┘
```

### 一句话总结

> **除非有明确的历史包袱或超大规模分片需求，PostgreSQL 应作为新项目的默认数据库选择。它用一套系统、一套技能栈、一份运维成本，覆盖了 MySQL + MongoDB 双数据库的全部能力，且在数据完整性、查询表达力、扩展性上全面领先。**

### 决策速查

| 你的情况 | 建议 |
|---------|------|
| 新项目，无历史包袱 | **PostgreSQL** |
| 需要文档存储 + 关系查询 | **PostgreSQL (JSONB)** |
| AI 应用需要向量搜索 | **PostgreSQL + pgvector** |
| 已有 MySQL 且运行良好 | 保持 MySQL，新模块可引入 PG |
| 已有 MongoDB 重度依赖 | 保持 MongoDB，评估是否可合并 |
| 超大规模（10TB+）水平扩展 | 评估 Citus(PG) vs MongoDB 分片 |
