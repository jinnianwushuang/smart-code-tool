# Redis 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-07-10  
> **适用版本**: Redis 7.x / Redis Stack  
> **适用对象**: 后端开发者、全栈工程师、DevOps 工程师

---

## 📑 目录

- [一、Redis 基础](#一redis-基础)
- [二、安装与配置](#二安装与配置)
- [三、字符串 (String)](#三字符串-string)
- [四、哈希 (Hash)](#四哈希-hash)
- [五、列表 (List)](#五列表-list)
- [六、集合 (Set)](#六集合-set)
- [七、有序集合 (Sorted Set)](#七有序集合-sorted-set)
- [八、通用命令](#八通用命令)
- [九、事务与管道](#九事务与管道)
- [十、发布与订阅](#十发布与订阅)
- [十一、Lua 脚本](#十一lua-脚本)
- [十二、持久化](#十二持久化)
- [十三、集群与高可用](#十三集群与高可用)
- [十四、Node.js 客户端 (ioredis)](#十四nodejs-客户端-ioredis)
- [十五、Python 客户端 (redis-py)](#十五python-客户端-redis-py)
- [十六、常见应用场景](#十六常见应用场景)
- [十七、性能优化](#十七性能优化)
- [十八、运维与监控](#十八运维与监控)

---

## 一、Redis 基础

### 1.1 什么是 Redis

Redis (Remote Dictionary Server) 是一个开源的内存数据结构存储，可用作数据库、缓存和消息中间件。

**核心特性**：

- 基于内存，读写性能极高 (10 万+ QPS)
- 支持丰富的数据结构 (String、Hash、List、Set、Sorted Set 等)
- 持久化 (RDB + AOF)
- 主从复制、哨兵模式、Cluster 集群
- 发布/订阅、Lua 脚本、事务
- 支持 TTL 过期时间

### 1.2 数据结构对比

| 数据结构    | 用途              | 典型场景           | 时间复杂度 (常用操作) |
| ----------- | ----------------- | ------------------ | --------------------- |
| String      | 简单键值对        | 缓存、计数器、锁   | GET/SET O(1)          |
| Hash        | 对象存储          | 用户信息、配置     | HGET/HSET O(1)        |
| List        | 有序列表          | 消息队列、时间线   | LPUSH/RPOP O(1)       |
| Set         | 无序集合 (去重)   | 标签、好友关系     | SADD/SREM O(1)        |
| Sorted Set  | 有序集合 (带分数) | 排行榜、延迟队列   | ZADD O(log N)         |
| Bitmap      | 位操作            | 签到、在线状态     | SETBIT O(1)           |
| HyperLogLog | 基数统计          | UV 统计            | PFADD O(1)            |
| Stream      | 消息流            | 事件溯源、日志     | XADD O(1)             |
| GEO         | 地理位置          | 附近的人、距离排序 | GEOADD O(log N)       |

---

## 二、安装与配置

### 2.1 安装

```bash
# macOS
brew install redis

# Ubuntu / Debian
sudo apt update
sudo apt install redis-server

# Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Docker (带密码和持久化)
docker run -d --name redis -p 6379:6379 redis:7-alpine \
  redis-server --requirepass yourpassword --appendonly yes
```

### 2.2 基础配置

```ini
# redis.conf

# 网络
bind 127.0.0.1               # 绑定地址
port 6379                     # 端口
protected-mode yes            # 保护模式

# 内存
maxmemory 256mb               # 最大内存
maxmemory-policy allkeys-lru  # 内存淘汰策略

# 持久化 — RDB
save 900 1                    # 900 秒内至少 1 次修改则保存
save 300 10                   # 300 秒内至少 10 次修改则保存
save 60 10000                 # 60 秒内至少 10000 次修改则保存
dbfilename dump.rdb
dir /var/lib/redis

# 持久化 — AOF
appendonly yes                # 开启 AOF
appendfilename "appendonly.aof"
appendfsync everysec          # 每秒同步

# 安全
requirepass yourpassword      # 设置密码

# 客户端
maxclients 10000              # 最大客户端连接数
timeout 0                     # 空闲超时 (0=不限制)
tcp-keepalive 300             # TCP keepalive
```

### 2.3 连接 Redis

```bash
# 命令行连接
redis-cli

# 带密码连接
redis-cli -h 127.0.0.1 -p 6379 -a yourpassword

# 测试连接
redis-cli ping
# → PONG

# 选择数据库 (默认 db 0)
redis-cli -n 1
```

---

## 三、字符串 (String)

### 3.1 基础操作

```bash
# 设置值
SET name "Alice"
SET name "Alice" EX 60          # 60 秒过期
SET name "Alice" PX 60000       # 60000 毫秒过期
SET name "Alice" NX             # 不存在时设置 (分布式锁)
SET name "Alice" XX             # 存在时设置 (更新)

# 获取值
GET name                        # → "Alice"

# 批量操作
MSET name "Alice" age "25" city "Beijing"
MGET name age city              # → ["Alice", "25", "Beijing"]

# 自增/自减
SET counter 0
INCR counter                    # → 1
INCRBY counter 10               # → 11
DECR counter                    # → 10
DECRBY counter 5                # → 5

# 浮点数
INCRBYFLOAT price 1.5           # → 1.5

# 字符串操作
SET greeting "Hello World"
STRLEN greeting                 # → 11
GETRANGE greeting 0 4           # → "Hello"
SETRANGE greeting 6 "Redis"     # → "Hello Redis"
APPEND greeting "!"             # → "Hello Redis!"

# 存在则获取
GETSET name "Bob"               # 返回旧值 "Alice"，设为 "Bob"

# 不存在则设置
SETNX lock "token123"           # → 1 (设置成功) 或 0 (已存在)
```

### 3.2 过期时间

```bash
# 设置过期 (秒)
EXPIRE key 60

# 设置过期 (毫秒)
PEXPIRE key 60000

# 设置过期时间戳
EXPIREAT key 1690000000

# 查看剩余时间
TTL key                         # → 剩余秒数 (-1=永不过期, -2=已过期)
PTTL key                        # → 剩余毫秒数

# 移除过期
PERSIST key
```

---

## 四、哈希 (Hash)

### 4.1 基础操作

```bash
# 设置字段
HSET user:1 name "Alice" age "25" email "alice@example.com"

# 获取单个字段
HGET user:1 name                # → "Alice"

# 获取所有字段
HGETALL user:1                  # → {name: "Alice", age: "25", email: "..."}

# 获取多个字段
HMGET user:1 name age email     # → ["Alice", "25", "alice@example.com"]

# 批量设置
HMSET user:1 name "Bob" age "30" city "Shanghai"

# 字段自增
HINCRBY user:1 age 1            # → 26
HINCRBYFLOAT user:1 score 0.5   # → 0.5

# 检查字段是否存在
HEXISTS user:1 name             # → 1
HEXISTS user:1 phone            # → 0

# 删除字段
HDEL user:1 email               # → 1

# 字段数量
HLEN user:1                     # → 3

# 获取所有字段名
HKEYS user:1                    # → ["name", "age"]

# 获取所有值
HVALS user:1                    # → ["Alice", "25"]
```

---

## 五、列表 (List)

### 5.1 基础操作

```bash
# 左推入 (头部)
LPUSH queue "task1" "task2" "task3"

# 右推入 (尾部)
RPUSH queue "task4" "task5"

# 获取范围元素 (0-based, 包含两端)
LRANGE queue 0 -1               # 获取所有
LRANGE queue 0 2                # 前 3 个元素

# 左弹出 (头部)
LPOP queue                      # → "task3"

# 右弹出 (尾部)
RPOP queue                      # → "task5"

# 阻塞弹出 (超时返回 nil)
BLPOP queue 10                  # 最多等待 10 秒
BRPOP queue 10

# 获取长度
LLEN queue                      # → 元素数量

# 按索引获取
LINDEX queue 0                  # 第一个元素

# 按索引设置
LSET queue 0 "new_task"

# 插入
LINSERT queue BEFORE "task2" "task1.5"
LINSERT queue AFTER "task2" "task2.5"

# 删除元素 (count>0 从左, count<0 从右, count=0 全部)
LREM queue 1 "task1"

# 截取
LTRIM queue 0 99                # 只保留前 100 个元素

# 从一个列表移动到另一个
RPOPLPUSH source dest           # 从 source 右弹出，左推入 dest
BRPOPLPUSH source dest 10       # 阻塞版本
```

---

## 六、集合 (Set)

### 6.1 基础操作

```bash
# 添加成员
SADD tags "redis" "database" "nosql" "cache"

# 获取所有成员
SMEMBERS tags                   # → ["redis", "database", "nosql", "cache"]

# 检查成员是否存在
SISMEMBER tags "redis"          # → 1
SISMEMBER tags "mysql"          # → 0

# 成员数量
SCARD tags                      # → 4

# 删除成员
SREM tags "cache"               # → 1

# 随机获取
SRANDMEMBER tags                # 随机 1 个
SRANDMEMBER tags 2              # 随机 2 个 (不删除)
SPOP tags                       # 随机弹出 1 个 (删除)

# 移动成员到另一个集合
SMOVE tags1 tags2 "redis"
```

### 6.2 集合运算

```bash
# 交集
SADD set1 "a" "b" "c"
SADD set2 "b" "c" "d"
SINTER set1 set2                # → ["b", "c"]

# 并集
SUNION set1 set2                # → ["a", "b", "c", "d"]

# 差集 (set1 有, set2 没有)
SDIFF set1 set2                 # → ["a"]

# 存储结果
SINTERSTORE result set1 set2    # 交集存入 result
SUNIONSTORE result set1 set2    # 并集存入 result
SDIFFSTORE result set1 set2     # 差集存入 result
```

---

## 七、有序集合 (Sorted Set)

### 7.1 基础操作

```bash
# 添加成员 (带分数)
ZADD leaderboard 100 "Alice"
ZADD leaderboard 200 "Bob" 150 "Charlie"
ZADD leaderboard NX 300 "Dave"     # 不存在时添加
ZADD leaderboard GT 250 "Alice"    # 新分数 > 旧分数时更新

# 获取成员分数
ZSCORE leaderboard "Alice"         # → 100

# 按分数范围获取 (从低到高)
ZRANGE leaderboard 0 -1            # 所有成员
ZRANGE leaderboard 0 -1 WITHSCORES # 带分数
ZRANGEBYSCORE leaderboard 100 200  # 分数 100~200

# 按分数范围获取 (从高到低)
ZREVRANGE leaderboard 0 -1 WITHSCORES
ZREVRANGEBYSCORE leaderboard 200 100

# 按排名获取
ZRANK leaderboard "Bob"            # → 2 (从 0 开始, 升序)
ZREVRANK leaderboard "Bob"         # → 0 (降序)

# 成员数量
ZCARD leaderboard                  # → 总数
ZCOUNT leaderboard 100 200         # → 分数在 100~200 之间的数量

# 分数增减
ZINCRBY leaderboard 50 "Alice"     # → 150

# 删除成员
ZREM leaderboard "Dave"            # → 1
ZREMRANGEBYRANK leaderboard 0 0    # 删除最低分
ZREMRANGEBYSCORE leaderboard 0 50  # 删除分数 ≤50 的

# Top N
ZREVRANGE leaderboard 0 9 WITHSCORES  # 前 10 名
```

---

## 八、通用命令

### 8.1 键操作

```bash
# 检查键是否存在
EXISTS key                       # → 1 或 0

# 删除键
DEL key1 key2 key3               # 删除多个
UNLINK key1 key2                  # 异步删除 (不阻塞)

# 重命名
RENAME old_key new_key
RENAMENX old_key new_key          # 目标不存在时重命名

# 查看键类型
TYPE key                          # → string/list/set/zset/hash/stream

# 模式匹配查找
KEYS user:*                       # ⚠️ 生产环境禁用 (阻塞)
SCAN 0 MATCH user:* COUNT 100     # ✅ 推荐 (增量遍历)

# 序列化/反序列化
DUMP key                          # 序列化
RESTORE key ttl serialized-value  # 反序列化

# 随机键
RANDOMKEY                         # 随机返回一个键
```

### 8.2 数据库操作

```bash
# 选择数据库
SELECT 0                          # 默认数据库
SELECT 1                          # 切换到 db1

# 键数量
DBSIZE                            # 当前数据库键数量

# 清空数据库
FLUSHDB                           # 清空当前数据库
FLUSHALL                          # 清空所有数据库
FLUSHDB ASYNC                     # 异步清空 (不阻塞)

# 服务器信息
INFO                              # 全部信息
INFO server                       # 服务器信息
INFO memory                       # 内存信息
INFO keyspace                     # 键空间信息
INFO clients                      # 客户端信息
INFO stats                        # 统计信息

# 配置
CONFIG GET maxmemory              # 获取配置
CONFIG SET maxmemory "256mb"      # 动态设置
CONFIG REWRITE                    # 持久化到配置文件
```

---

## 九、事务与管道

### 9.1 事务 (Transaction)

```bash
# 开启事务
MULTI

# 命令入队
SET name "Alice"
SET age "25"
INCR counter

# 执行
EXEC                              # 原子性执行所有命令

# 取消
DISCARD                           # 放弃事务

# 乐观锁
WATCH key                         # 监视键变化
MULTI
SET key "new_value"
EXEC                              # 如果 key 被修改, EXEC 返回 nil

# 示例: 乐观锁实现
WATCH stock
MULTI
DECR stock
EXEC                              # 如果 stock 在 WATCH 后被修改, 返回 nil
```

### 9.2 管道 (Pipeline)

```bash
# 客户端管道 — 批量发送命令, 一次网络往返
# Node.js (ioredis)
const pipeline = redis.pipeline()
pipeline.set('key1', 'value1')
pipeline.set('key2', 'value2')
pipeline.get('key1')
pipeline.get('key2')
const results = await pipeline.exec()
// → [[null, 'OK'], [null, 'OK'], [null, 'value1'], [null, 'value2']]

# Python (redis-py)
pipe = redis.pipeline()
pipe.set('key1', 'value1')
pipe.set('key2', 'value2')
pipe.get('key1')
results = pipe.execute()
```

---

## 十、发布与订阅

### 10.1 基础 Pub/Sub

```bash
# 订阅频道
SUBSCRIBE channel1 channel2

# 发布消息
PUBLISH channel1 "Hello World"

# 模式订阅
PSUBSCRIBE news.*
# 匹配 news.sports, news.tech, news.finance 等

# 模式发布
PUBLISH news.sports "Breaking news!"

# 取消订阅
UNSUBSCRIBE channel1
PUNSUBSCRIBE news.*
```

### 10.2 代码实现

```javascript
// Node.js (ioredis) — 发布
import Redis from 'ioredis'
const publisher = new Redis()

await publisher.publish(
  'notifications',
  JSON.stringify({
    type: 'order_created',
    data: { orderId: '12345', amount: 99.99 },
  }),
)

// Node.js (ioredis) — 订阅
const subscriber = new Redis()

await subscriber.subscribe('notifications')
subscriber.on('message', (channel, message) => {
  const data = JSON.parse(message)
  console.log(`[${channel}]`, data)
})
```

```python
# Python (redis-py)
import redis

# 发布
publisher = redis.Redis()
publisher.publish('notifications', json.dumps({'type': 'order_created'}))

# 订阅
subscriber = redis.Redis()
pubsub = subscriber.pubsub()
pubsub.subscribe('notifications')

for message in pubsub.listen():
    if message['type'] == 'message':
        print(message['data'])
```

---

## 十一、Lua 脚本

### 11.1 基础用法

```bash
# 执行 Lua 脚本
EVAL "return redis.call('SET', KEYS[1], ARGV[1])" 1 mykey myvalue

# 加载脚本 (返回 SHA1)
SCRIPT LOAD "return redis.call('GET', KEYS[1])"
# → "a1b2c3d4..."

# 通过 SHA1 执行
EVALSHA "a1b2c3d4..." 1 mykey
```

### 11.2 常用 Lua 脚本

```lua
-- 分布式锁 (原子性 SET NX + EX)
-- KEYS[1] = lock_key, ARGV[1] = token, ARGV[2] = timeout
if redis.call('SET', KEYS[1], ARGV[1], 'NX', 'EX', ARGV[2]) then
    return 1  -- 获取锁成功
else
    return 0  -- 获取锁失败
end

-- 释放分布式锁 (原子性检查 + 删除)
-- KEYS[1] = lock_key, ARGV[1] = token
if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
else
    return 0
end

-- 限流器 (滑动窗口)
-- KEYS[1] = rate_key, ARGV[1] = max_requests, ARGV[2] = window_seconds
local current = redis.call('GET', KEYS[1])
if current and tonumber(current) >= tonumber(ARGV[1]) then
    return 0  -- 超出限制
end
local result = redis.call('INCR', KEYS[1])
if result == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[2])
end
return 1  -- 允许通过

-- 原子性自增并返回新值 (带上限)
-- KEYS[1] = counter_key, ARGV[1] = increment, ARGV[2] = max_value
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
if current + tonumber(ARGV[1]) > tonumber(ARGV[2]) then
    return -1  -- 超出上限
end
return redis.call('INCRBY', KEYS[1], ARGV[1])
```

### 11.3 客户端使用

```javascript
// Node.js (ioredis) — 定义 Lua 命令
import Redis from 'ioredis'
const redis = new Redis()

// 注册自定义命令
redis.defineCommand('acquireLock', {
  numberOfKeys: 1,
  lua: `
    if redis.call('SET', KEYS[1], ARGV[1], 'NX', 'EX', ARGV[2]) then
      return 1
    else
      return 0
    end
  `,
})

redis.defineCommand('releaseLock', {
  numberOfKeys: 1,
  lua: `
    if redis.call('GET', KEYS[1]) == ARGV[1] then
      return redis.call('DEL', KEYS[1])
    else
      return 0
    end
  `,
})

// 使用
const token = crypto.randomUUID()
const acquired = await redis.acquireLock('mylock', token, '30') // 30秒过期
if (acquired) {
  try {
    // 执行业务逻辑
  } finally {
    await redis.releaseLock('mylock', token)
  }
}
```

---

## 十二、持久化

### 12.1 RDB 快照

```bash
# 手动触发
SAVE                              # 阻塞式 (生产环境避免)
BGSAVE                            # 后台子进程 (推荐)

# 配置自动触发 (redis.conf)
# save <seconds> <changes>
save 900 1                        # 900 秒内至少 1 次修改
save 300 10                       # 300 秒内至少 10 次修改
save 60 10000                     # 60 秒内至少 10000 次修改

# 恢复数据
# 将 dump.rdb 放到 Redis 工作目录，重启即可
```

### 12.2 AOF 日志

```bash
# 配置 (redis.conf)
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec              # always | everysec | no

# 手动触发 AOF 重写 (压缩文件)
BGREWRITEAOF

# 自动重写配置
auto-aof-rewrite-percentage 100   # AOF 增长 100% 时触发重写
auto-aof-rewrite-min-size 64mb    # AOF 最小 64MB 才触发重写
```

### 12.3 RDB vs AOF 对比

| 特性     | RDB                  | AOF                 |
| -------- | -------------------- | ------------------- |
| 数据安全 | 可能丢失最后一次快照 | 最多丢失 1 秒数据   |
| 文件大小 | 小 (二进制压缩)      | 大 (文本命令日志)   |
| 恢复速度 | 快                   | 慢 (需要重放命令)   |
| 写入性能 | 无影响 (后台)        | everysec 有轻微影响 |
| 适用场景 | 备份、灾难恢复       | 数据高安全要求      |

---

## 十三、集群与高可用

### 13.1 主从复制

```bash
# 从节点配置 (redis.conf)
replicaof master_host 6379        # 指定主节点
masterauth master_password        # 主节点密码

# 运行时设置
REPLICAOF master_host 6379
REPLICAOF NO ONE                  # 取消复制 (从变主)

# 查看复制状态
INFO replication
```

### 13.2 哨兵模式 (Sentinel)

```ini
# sentinel.conf
sentinel monitor mymaster 127.0.0.1 6379 2   # 监控主节点, 需要 2 票同意
sentinel down-after-milliseconds mymaster 5000 # 5 秒无响应视为下线
sentinel failover-timeout mymaster 60000       # 故障转移超时 60 秒
sentinel parallel-syncs mymaster 1             # 故障后同时同步的从节点数
```

```bash
# 启动哨兵
redis-sentinel sentinel.conf

# 查看哨兵信息
redis-cli -p 26379 sentinel master mymaster
redis-cli -p 26379 sentinel slaves mymaster
```

### 13.3 Redis Cluster

```bash
# 创建集群 (3 主 3 从)
redis-cli --cluster create \
  127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 \
  127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
  --cluster-replicas 1

# 集群信息
redis-cli -p 7000 cluster info
redis-cli -p 7000 cluster nodes

# 集群操作
redis-cli --cluster add-node 127.0.0.1:7006 127.0.0.1:7000
redis-cli --cluster del-node 127.0.0.1:7006 <node-id>
redis-cli --cluster rebalance 127.0.0.1:7000
```

---

## 十四、Node.js 客户端 (ioredis)

### 14.1 基础用法

```javascript
import Redis from 'ioredis'

// 连接
const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  password: 'yourpassword',
  db: 0,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 50, 2000)
  },
})

// String 操作
await redis.set('name', 'Alice')
await redis.set('token', 'abc', 'EX', 3600) // 1 小时过期
await redis.set('lock', 'token', 'NX', 'EX', 30) // 分布式锁
const name = await redis.get('name')

// Hash 操作
await redis.hset('user:1', { name: 'Alice', age: 25 })
const user = await redis.hgetall('user:1')
const age = await redis.hget('user:1', 'age')

// List 操作
await redis.lpush('queue', 'task1', 'task2')
const task = await redis.rpop('queue')

// Set 操作
await redis.sadd('tags', 'redis', 'database', 'cache')
const tags = await redis.smembers('tags')

// Sorted Set 操作
await redis.zadd('rank', 100, 'Alice', 200, 'Bob')
const top = await redis.zrevrange('rank', 0, 9, 'WITHSCORES')

// 事件
redis.on('connect', () => console.log('Connected'))
redis.on('error', (err) => console.error('Error:', err))
```

### 14.2 封装工具类

```javascript
import Redis from 'ioredis'

class RedisClient {
  constructor(options = {}) {
    this.redis = new Redis(options)
  }

  // 缓存获取 (带序列化)
  async getCache(key) {
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  // 缓存设置 (带序列化 + TTL)
  async setCache(key, value, ttl = 3600) {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl)
  }

  // 缓存删除
  async delCache(...keys) {
    await this.redis.del(...keys)
  }

  // 分布式锁
  async acquireLock(key, ttl = 30) {
    const token = crypto.randomUUID()
    const result = await this.redis.set(`lock:${key}`, token, 'NX', 'EX', ttl)
    return result === 'OK' ? token : null
  }

  // 释放锁
  async releaseLock(key, token) {
    const script = `
      if redis.call('GET', KEYS[1]) == ARGV[1] then
        return redis.call('DEL', KEYS[1])
      end
      return 0
    `
    return await this.redis.eval(script, 1, `lock:${key}`, token)
  }

  // 限流器
  async rateLimit(key, limit, windowSec = 60) {
    const current = await this.redis.get(key)
    if (current && parseInt(current) >= limit) {
      return false
    }
    const count = await this.redis.incr(key)
    if (count === 1) {
      await this.redis.expire(key, windowSec)
    }
    return true
  }

  // 管道批量操作
  async pipeline(operations) {
    const pipe = this.redis.pipeline()
    for (const op of operations) {
      pipe[op.command](...op.args)
    }
    return await pipe.exec()
  }

  async disconnect() {
    await this.redis.quit()
  }
}

export default RedisClient
```

### 14.3 Cluster 连接

```javascript
import Redis from 'ioredis'

const cluster = new Redis.Cluster(
  [
    { host: '127.0.0.1', port: 7000 },
    { host: '127.0.0.1', port: 7001 },
    { host: '127.0.0.1', port: 7002 },
  ],
  {
    redisOptions: {
      password: 'yourpassword',
    },
  },
)
```

---

## 十五、Python 客户端 (redis-py)

### 15.1 基础用法

```python
import redis
import json

# 连接
r = redis.Redis(
    host='127.0.0.1',
    port=6379,
    password='yourpassword',
    db=0,
    decode_responses=True,  # 自动解码 bytes 为 str
)

# String
r.set('name', 'Alice')
r.set('token', 'abc', ex=3600)           # 1 小时过期
r.set('lock', 'token', nx=True, ex=30)   # 分布式锁
name = r.get('name')

# Hash
r.hset('user:1', mapping={'name': 'Alice', 'age': '25'})
user = r.hgetall('user:1')

# List
r.lpush('queue', 'task1', 'task2')
task = r.rpop('queue')

# Pipeline
pipe = r.pipeline()
pipe.set('key1', 'value1')
pipe.set('key2', 'value2')
pipe.get('key1')
results = pipe.execute()

# Pub/Sub
pubsub = r.pubsub()
pubsub.subscribe('channel')
for message in pubsub.listen():
    if message['type'] == 'message':
        print(message['data'])
```

### 15.2 连接池

```python
import redis

# 连接池
pool = redis.ConnectionPool(
    host='127.0.0.1',
    port=6379,
    password='yourpassword',
    db=0,
    max_connections=50,
    decode_responses=True,
)

r = redis.Redis(connection_pool=pool)
```

---

## 十六、常见应用场景

### 16.1 缓存层

```javascript
// Cache-Aside 模式
async function getUserById(id) {
  const cacheKey = `user:${id}`

  // 1. 先查缓存
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // 2. 缓存未命中，查数据库
  const user = await db.User.findByPk(id)

  // 3. 写入缓存 (TTL 1 小时)
  if (user) {
    await redis.set(cacheKey, JSON.stringify(user), 'EX', 3600)
  }

  return user
}

// 缓存失效
async function updateUser(id, data) {
  const user = await db.User.update(data, { where: { id } })
  await redis.del(`user:${id}`) // 删除缓存
  return user
}
```

### 16.2 分布式锁

```javascript
async function withLock(key, fn, ttl = 30) {
  const lockKey = `lock:${key}`
  const token = crypto.randomUUID()

  // 获取锁
  const acquired = await redis.set(lockKey, token, 'NX', 'EX', ttl)
  if (!acquired) {
    throw new Error(`获取锁失败: ${key}`)
  }

  try {
    return await fn()
  } finally {
    // 释放锁 (Lua 保证原子性)
    const script = `
      if redis.call('GET', KEYS[1]) == ARGV[1] then
        return redis.call('DEL', KEYS[1])
      end
      return 0
    `
    await redis.eval(script, 1, lockKey, token)
  }
}

// 使用
await withLock('order:create', async () => {
  // 只有拿到锁才能执行
  await createOrder(data)
})
```

### 16.3 限流器

```javascript
// 固定窗口限流
async function fixedWindowRateLimit(key, limit, windowSec = 60) {
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, windowSec)
  }
  const ttl = await redis.ttl(key)
  return { allowed: count <= limit, remaining: limit - count, retryAfter: ttl }
}

// 滑动窗口限流 (更精确)
async function slidingWindowRateLimit(key, limit, windowMs = 60000) {
  const now = Date.now()
  const windowStart = now - windowMs

  const pipe = redis.pipeline()
  pipe.zremrangebyscore(key, 0, windowStart) // 移除窗口外的记录
  pipe.zadd(key, now, `${now}:${Math.random()}`) // 添加当前请求
  pipe.zcard(key) // 统计窗口内请求数
  pipe.pexpire(key, windowMs) // 设置过期
  const results = await pipe.exec()

  const count = results[2][1] // zcard 的结果
  return { allowed: count <= limit, count }
}
```

### 16.4 消息队列

```javascript
// 简单消息队列 (List)
// 生产者
async function produce(queue, message) {
  await redis.lpush(queue, JSON.stringify(message))
}

// 消费者 (阻塞等待)
async function consume(queue, timeout = 5) {
  const result = await redis.brpop(queue, timeout)
  if (result) {
    return JSON.parse(result[1])
  }
  return null
}

// 可靠消息队列 (RPOPLPUSH + 备份列表)
async function reliableConsume(sourceQueue, backupQueue, timeout = 5) {
  // 原子性地从源队列弹出并推入备份队列
  const message = await redis.brpoplpush(sourceQueue, backupQueue, timeout)
  if (message) {
    try {
      const data = JSON.parse(message)
      // 处理消息
      await processMessage(data)
      // 处理成功后从备份队列删除
      await redis.lrem(backupQueue, 1, message)
      return data
    } catch (err) {
      // 处理失败，消息保留在备份队列，可重试
      throw err
    }
  }
  return null
}
```

### 16.5 排行榜

```javascript
class Leaderboard {
  constructor(key) {
    this.key = key
  }

  async addScore(member, score) {
    await redis.zadd(this.key, score, member)
  }

  async incrementScore(member, increment) {
    return await redis.zincrby(this.key, increment, member)
  }

  async getTopN(n = 10) {
    return await redis.zrevrange(this.key, 0, n - 1, 'WITHSCORES')
  }

  async getRank(member) {
    return await redis.zrevrank(this.key, member)
  }

  async getScore(member) {
    return await redis.zscore(this.key, member)
  }

  async getRangeByScore(min, max) {
    return await redis.zrangebyscore(this.key, min, max, 'WITHSCORES')
  }

  async remove(member) {
    await redis.zrem(this.key, member)
  }

  async totalMembers() {
    return await redis.zcard(this.key)
  }
}
```

### 16.6 Session 管理

```javascript
class SessionStore {
  constructor(prefix = 'session:', ttl = 1800) {
    this.prefix = prefix
    this.ttl = ttl // 30 分钟
  }

  async get(sessionId) {
    const data = await redis.get(this.prefix + sessionId)
    if (data) {
      // 续期
      await redis.expire(this.prefix + sessionId, this.ttl)
      return JSON.parse(data)
    }
    return null
  }

  async set(sessionId, data) {
    await redis.set(this.prefix + sessionId, JSON.stringify(data), 'EX', this.ttl)
  }

  async destroy(sessionId) {
    await redis.del(this.prefix + sessionId)
  }

  async regenerate(oldId, newId, data) {
    const pipe = redis.pipeline()
    pipe.del(this.prefix + oldId)
    pipe.set(this.prefix + newId, JSON.stringify(data), 'EX', this.ttl)
    await pipe.exec()
  }
}
```

---

## 十七、性能优化

### 17.1 内存优化

```
1. 选择合适的数据结构
   ├── 对象数据 → Hash (比多个 String 省内存)
   ├── 去重需求 → Set / Bitmap
   └── 统计 UV  → HyperLogLog (仅 12KB)

2. 使用 Hash 编码优化
   hash-max-ziplist-entries 512    # 小于 512 个字段用 ziplist
   hash-max-ziplist-value 64       # 字段值小于 64 字节用 ziplist

3. 内存淘汰策略
   allkeys-lru    # 所有键中淘汰最近最少使用的 (推荐)
   volatile-lru   # 有过期时间的键中淘汰 LRU
   allkeys-lfu    # 所有键中淘汰最不常用的
   volatile-ttl   # 淘汰即将过期的键
   noeviction     # 不淘汰，内存满时返回错误

4. 压缩 List/Set
   list-max-ziplist-size -2        # -1=5KB, -2=8KB, -3=16KB
   set-max-intset-entries 512      # 整数集合优化
```

### 17.2 性能最佳实践

```
1. 使用 Pipeline 批量操作
   ├── 减少网络往返
   └── 一次发送多条命令

2. 避免大 Key
   ├── 拆分大 Hash (user:1:profile, user:1:settings)
   ├── 拆分大 List (使用分片)
   └── 使用 SCAN 代替 KEYS

3. 合理设置 TTL
   ├── 缓存数据设置过期时间
   ├── 避免所有 key 同一时间过期 (加随机偏移)
   └── 热点数据延长 TTL

4. 连接池
   ├── 使用连接池复用连接
   └── 设置合理的 maxclients

5. 避免阻塞
   ├── 使用 UNLINK 代替 DEL (异步删除)
   ├── 使用 SCAN 代替 KEYS
   └── 使用 SORT 的 LIMIT 限制结果数
```

### 17.3 BigKey 处理

```bash
# 查找大 Key
redis-cli --bigkeys

# 使用 SCAN 分析
redis-cli --scan --pattern '*' | while read key; do
  size=$(redis-cli debug object "$key" | grep -o 'serializedlength:[0-9]*')
  echo "$key $size"
done

# 拆分大 Hash
# 大: user:1 → {field1, field2, ... field10000}
# 拆分: user:1:profile → {name, age, email}
#       user:1:settings → {theme, lang}
#       user:1:stats → {loginCount, lastLogin}
```

---

## 十八、运维与监控

### 18.1 常用运维命令

```bash
# 慢查询日志
CONFIG SET slowlog-log-slower-than 10000   # 记录超过 10ms 的查询
CONFIG SET slowlog-max-len 128             # 最多保存 128 条
SLOWLOG GET 10                             # 获取最近 10 条
SLOWLOG LEN                                # 当前慢查询数量
SLOWLOG RESET                              # 清空

# 客户端管理
CLIENT LIST                                # 列出所有客户端
CLIENT KILL <ip:port>                      # 杀死指定客户端
CLIENT SETNAME my-app                      # 设置客户端名称

# 内存分析
MEMORY USAGE key                           # 查看 key 的内存使用
MEMORY DOCTOR                              # 内存诊断
MEMORY PURGE                               # 释放内存

# 延迟监控
redis-cli --latency                        # 持续监控延迟
redis-cli --intrinsic-latency 5            # 测试内在延迟 (5秒)
```

### 18.2 监控指标

```
核心监控指标:
├── 内存
│   ├── used_memory              # 已用内存
│   ├── used_memory_peak         # 内存峰值
│   ├── mem_fragmentation_ratio  # 内存碎片率 (建议 1~1.5)
│   └── evicted_keys             # 淘汰的键数量
│
├── 性能
│   ├── instantaneous_ops_per_sec # 每秒操作数
│   ├── instantaneous_input_kbps  # 输入带宽
│   └── instantaneous_output_kbps # 输出带宽
│
├── 键空间
│   ├── keyspace_hits            # 键命中次数
│   ├── keyspace_misses          # 键未命中次数
│   └── hit_rate                 # 命中率 (建议 > 95%)
│
├── 连接
│   ├── connected_clients        # 连接客户端数
│   ├── blocked_clients          # 阻塞客户端数
│   └── rejected_connections     # 拒绝连接数
│
└── 持久化
    ├── rdb_last_bgsave_status   # RDB 保存状态
    ├── aof_rewrite_in_progress  # AOF 重写状态
    └── aof_last_bgrewrite_status# AOF 重写状态
```

### 18.3 Docker 部署

```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    container_name: redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 3s
      retries: 3

  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: redis-gui
    ports:
      - '8081:8081'
    environment:
      REDIS_HOSTS: local:redis:6379
    depends_on:
      - redis

volumes:
  redis_data:
```

---

## 附录

### A. 常用命令速查

| 命令                     | 说明         |
| ------------------------ | ------------ |
| SET/GET/MSET/MGET        | 字符串读写   |
| HSET/HGET/HGETALL/HMSET  | 哈希操作     |
| LPUSH/RPUSH/LPOP/RPOP    | 列表操作     |
| SADD/SMEMBERS/SREM       | 集合操作     |
| ZADD/ZRANGE/ZSCORE/ZRANK | 有序集合操作 |
| EXPIRE/TTL/PERSIST       | 过期时间     |
| INCR/INCRBY/DECR         | 计数器       |
| SUBSCRIBE/PUBLISH        | 发布/订阅    |
| EVAL/EVALSHA             | Lua 脚本     |
| MULTI/EXEC/DISCARD       | 事务         |
| SCAN/KEYS                | 键查找       |
| INFO/CONFIG/SLOWLOG      | 运维         |

### B. 学习资源

- **官方文档**: https://redis.io/docs/
- **Redis University**: https://university.redis.com/
- **Redis GitHub**: https://github.com/redis/redis
- **ioredis**: https://github.com/redis/ioredis
- **redis-py**: https://github.com/redis/redis-py

---

**提示**: 本手册涵盖 Redis 日常开发中最常用的命令和应用场景，建议结合实际项目需求深入学习和实践。
