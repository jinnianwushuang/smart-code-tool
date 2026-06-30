# MongoDB 数据库速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: 数据库管理员、后端开发者、数据工程师

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、数据类型](#二数据类型)
- [三、基本操作](#三基本操作)
- [四、查询操作](#四查询操作)
- [五、高级查询](#五高级查询)
- [六、聚合管道](#六聚合管道)
- [七、索引优化](#七索引优化)
- [八、文档更新](#八文档更新)
- [九、事务处理](#九事务处理)
- [十、复制集](#十复制集)
- [十一、分片集群](#十一分片集群)
- [十二、最佳实践](#十二最佳实践)

---

## 一、基础概念

### 1.1 什么是 MongoDB

MongoDB 是一个基于分布式文件存储的 NoSQL 数据库,使用 BSON(二进制 JSON)格式存储数据。

**特点**:

- 文档型数据库
- 灵活的 Schema
- 高性能、高可用性
- 水平扩展能力强
- 支持丰富的查询语言
- 内置复制和分片

### 1.2 核心概念

```
传统关系型数据库    MongoDB
───────────────    ─────────
Database          Database (数据库)
Table             Collection (集合)
Row               Document (文档)
Column            Field (字段)
Index             Index (索引)
Join              $lookup / 嵌入文档
```

### 1.3 安装和连接

```bash
# 安装 MongoDB (macOS)
brew install mongodb-community

# 启动 MongoDB
brew services start mongodb-community

# 连接 MongoDB
mongosh
mongosh "mongodb://localhost:27017"

# 远程连接
mongosh "mongodb://username:password@host:27017/database"
```

### 1.4 基本命令

```javascript
// 显示所有数据库
show dbs

// 切换/创建数据库
use mydb

// 显示当前数据库
db

// 显示所有集合
show collections

// 删除当前数据库
db.dropDatabase()

// 退出
exit
```

---

## 二、数据类型

### 2.1 基本数据类型

```javascript
{
    // 字符串
    name: "John",

    // 数字 (整数或浮点数)
    age: 25,
    price: 99.99,

    // 布尔值
    isActive: true,

    // null
    deletedAt: null,

    // 数组
    tags: ["mongodb", "database", "nosql"],

    // 对象/嵌套文档
    address: {
        street: "123 Main St",
        city: "New York",
        zip: "10001"
    },

    // ObjectId (12字节唯一标识符)
    _id: ObjectId("507f191e810c19729de860ea"),

    // Date (日期时间,UTC)
    createdAt: new Date(),

    // Timestamp (内部使用时间戳)
    ts: Timestamp(1638360000, 1),

    // Binary Data (二进制数据)
    data: BinData(),

    // Regular Expression (正则表达式)
    pattern: /pattern/i
}
```

### 2.2 特殊类型

```javascript
{
    // Decimal128 (高精度小数)
    amount: NumberDecimal("99.99"),

    // MinKey/MaxKey (用于比较)
    min: MinKey(),
    max: MaxKey(),

    // JavaScript Code (代码)
    code: Code("function() { return 'Hello'; }"),

    // Symbol (已废弃,不推荐使用)
    symbol: Symbol("symbol")
}
```

---

## 三、基本操作

### 3.1 创建集合

```javascript
// 隐式创建(插入文档时自动创建)
db.users.insertOne({ name: 'John' })

// 显式创建
db.createCollection('users')

// 创建带选项的集合
db.createCollection('logs', {
  capped: true, // 固定大小集合
  size: 1048576, // 最大1MB
  max: 1000, // 最多1000个文档
})

// 查看集合信息
db.getCollectionInfos()
```

### 3.2 删除集合

```javascript
// 删除集合
db.users.drop()

// 删除所有集合
db.getCollectionNames().forEach(function (collection) {
  db[collection].drop()
})
```

### 3.3 插入文档

```javascript
// 插入单个文档
db.users.insertOne({
  name: 'John Doe',
  age: 25,
  email: 'john@example.com',
  createdAt: new Date(),
})

// 插入多个文档
db.users.insertMany([
  { name: 'Alice', age: 30, email: 'alice@example.com' },
  { name: 'Bob', age: 35, email: 'bob@example.com' },
  { name: 'Charlie', age: 28, email: 'charlie@example.com' },
])

// 指定 _id
db.users.insertOne({
  _id: 'custom_id_123',
  name: 'Custom User',
})

// 批量插入(无序)
db.users.bulkWrite([
  { insertOne: { document: { name: 'User1' } } },
  { insertOne: { document: { name: 'User2' } } },
])
```

### 3.4 查询文档

```javascript
// 查询所有文档
db.users.find()

// 格式化输出
db.users.find().pretty()

// 限制返回数量
db.users.find().limit(10)

// 跳过指定数量
db.users.find().skip(20)

// 排序
db.users.find().sort({ age: 1 }) // 升序
db.users.find().sort({ age: -1 }) // 降序

// 组合使用
db.users.find().sort({ age: -1 }).skip(10).limit(5)

// 查询单个文档
db.users.findOne({ name: 'John' })

// 计数
db.users.countDocuments()
db.users.countDocuments({ age: { $gte: 18 } })
```

### 3.5 更新文档

```javascript
// 更新单个文档
db.users.updateOne({ name: 'John' }, { $set: { age: 26 } })

// 更新多个文档
db.users.updateMany({ status: 'inactive' }, { $set: { status: 'active' } })

// 替换整个文档
db.users.replaceOne({ name: 'John' }, { name: 'John Updated', age: 27, email: 'new@example.com' })

// 更新并返回文档
db.users.findOneAndUpdate(
  { name: 'John' },
  { $set: { age: 28 } },
  { returnDocument: 'after' }, // 返回更新后的文档
)
```

### 3.6 删除文档

```javascript
// 删除单个文档
db.users.deleteOne({ name: 'John' })

// 删除多个文档
db.users.deleteMany({ status: 'inactive' })

// 删除所有文档
db.users.deleteMany({})

// 查找并删除
db.users.findOneAndDelete({ name: 'John' })
```

---

## 四、查询操作

### 4.1 比较运算符

```javascript
// $eq - 等于
db.users.find({ age: { $eq: 25 } })
db.users.find({ age: 25 }) // 简写

// $ne - 不等于
db.users.find({ age: { $ne: 25 } })

// $gt - 大于
db.users.find({ age: { $gt: 18 } })

// $gte - 大于等于
db.users.find({ age: { $gte: 18 } })

// $lt - 小于
db.users.find({ age: { $lt: 60 } })

// $lte - 小于等于
db.users.find({ age: { $lte: 60 } })

// $in - 在数组中
db.users.find({ age: { $in: [18, 25, 30] } })

// $nin - 不在数组中
db.users.find({ age: { $nin: [18, 25, 30] } })
```

### 4.2 逻辑运算符

```javascript
// $and - 与
db.users.find({
  $and: [{ age: { $gte: 18 } }, { status: 'active' }],
})

// $or - 或
db.users.find({
  $or: [{ age: { $lt: 18 } }, { age: { $gt: 60 } }],
})

// $nor - 或非
db.users.find({
  $nor: [{ age: { $lt: 18 } }, { age: { $gt: 60 } }],
})

// $not - 非
db.users.find({ age: { $not: { $gte: 18 } } })
```

### 4.3 元素运算符

```javascript
// $exists - 字段是否存在
db.users.find({ phone: { $exists: true } })
db.users.find({ phone: { $exists: false } })

// $type - 字段类型
db.users.find({ age: { $type: 'number' } })
db.users.find({ name: { $type: 'string' } })

// 类型别名:
// "double", "string", "object", "array", "binData",
// "undefined", "objectId", "bool", "date", "null",
// "regex", "js", "symbol", "int", "timestamp", "long", "decimal"
```

### 4.4 数组运算符

```javascript
// $all - 包含所有元素
db.products.find({ tags: { $all: ['electronics', 'sale'] } })

// $size - 数组大小
db.products.find({ tags: { $size: 3 } })

// $elemMatch - 数组元素匹配条件
db.products.find({
  reviews: {
    $elemMatch: {
      rating: { $gte: 4 },
      comment: { $exists: true },
    },
  },
})

// 数组索引访问
db.products.find({ 'reviews.0.rating': { $gte: 4 } })
```

### 4.5 字符串查询

```javascript
// 正则表达式
db.users.find({ name: /^John/ }) // 以John开头
db.users.find({ name: /john$/i }) // 以john结尾,不区分大小写
db.users.find({ name: /john/i }) // 包含john,不区分大小写

// $regex
db.users.find({ name: { $regex: 'john', $options: 'i' } })

// $text - 文本搜索(需要文本索引)
db.articles.find({ $text: { $search: 'mongodb database' } })
```

### 4.6 嵌入式文档查询

```javascript
// 精确匹配
db.users.find({ address: { city: 'New York', zip: '10001' } })

// 点符号查询
db.users.find({ 'address.city': 'New York' })
db.users.find({ 'address.zip': '10001' })

// 嵌套数组查询
db.orders.find({ 'items.product': 'Laptop' })
db.orders.find({ 'items.quantity': { $gt: 2 } })
```

### 4.7 投影(选择字段)

```javascript
// 只返回指定字段
db.users.find({}, { name: 1, age: 1 })

// 排除指定字段
db.users.find({}, { password: 0 })

// 数组投影
db.users.find({}, { name: 1, 'hobbies.$': 1 }) // 只返回第一个匹配的元素

// $slice - 数组切片
db.posts.find({}, { comments: { $slice: 5 } }) // 前5个
db.posts.find({}, { comments: { $slice: -5 } }) // 后5个
db.posts.find({}, { comments: { $slice: [10, 5] } }) // 从第10个开始取5个
```

---

## 五、高级查询

### 5.1 游标操作

```javascript
// 遍历游标
const cursor = db.users.find()
cursor.forEach((doc) => {
  printjson(doc)
})

// 转换为数组
const users = db.users.find().toArray()

// 检查是否有下一个
while (cursor.hasNext()) {
  printjson(cursor.next())
}

// 关闭游标
cursor.close()
```

### 5.2 去重

```javascript
// distinct
db.users.distinct('age')
db.users.distinct('city', { age: { $gte: 18 } })

// 聚合去重
db.users.aggregate([{ $group: { _id: '$age' } }])
```

### 5.3 分组统计

```javascript
// 简单分组
db.orders.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      totalAmount: { $sum: '$amount' },
      avgAmount: { $avg: '$amount' },
      maxAmount: { $max: '$amount' },
      minAmount: { $min: '$amount' },
    },
  },
])

// 多字段分组
db.orders.aggregate([
  {
    $group: {
      _id: {
        status: '$status',
        year: { $year: '$createdAt' },
      },
      count: { $sum: 1 },
    },
  },
])
```

### 5.4 $lookup 关联查询

```javascript
// 基本关联
db.orders.aggregate([
  {
    $lookup: {
      from: 'users', // 关联的集合
      localField: 'userId', // 本地字段
      foreignField: '_id', // 外部字段
      as: 'user', // 结果字段名
    },
  },
])

// 展开数组
db.orders.aggregate([
  {
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user',
    },
  },
  { $unwind: '$user' }, // 将数组展开为单独文档
])

// 复杂关联(带条件)
db.orders.aggregate([
  {
    $lookup: {
      from: 'products',
      let: { productId: '$productId' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [{ $eq: ['$_id', '$$productId'] }, { $eq: ['$status', 'active'] }],
            },
          },
        },
      ],
      as: 'product',
    },
  },
])
```

### 5.5 地理空间查询

```javascript
// 创建地理空间索引
db.places.createIndex({ location: '2dsphere' })

// 插入地理数据
db.places.insertOne({
  name: 'Central Park',
  location: {
    type: 'Point',
    coordinates: [-73.9654, 40.7829], // [经度, 纬度]
  },
})

// 附近查询
db.places.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [-73.9654, 40.7829],
      },
      $maxDistance: 1000, // 米
    },
  },
})

// 范围内查询
db.places.find({
  location: {
    $geoWithin: {
      $centerSphere: [[-73.9654, 40.7829], 10 / 3963.2], // 10英里
    },
  },
})
```

---

## 六、聚合管道

### 6.1 聚合管道基础

```javascript
db.orders.aggregate([
  // 阶段1: 过滤
  { $match: { status: 'completed' } },

  // 阶段2: 分组
  {
    $group: {
      _id: '$customerId',
      totalAmount: { $sum: '$amount' },
      orderCount: { $sum: 1 },
    },
  },

  // 阶段3: 过滤分组结果
  { $match: { totalAmount: { $gte: 1000 } } },

  // 阶段4: 排序
  { $sort: { totalAmount: -1 } },

  // 阶段5: 限制
  { $limit: 10 },
])
```

### 6.2 常用聚合阶段

```javascript
// $project - 投影
db.users.aggregate([
  {
    $project: {
      name: 1,
      age: 1,
      fullName: { $concat: ['$firstName', ' ', '$lastName'] },
      isAdult: { $cond: [{ $gte: ['$age', 18] }, true, false] },
    },
  },
])

// $match - 过滤
db.users.aggregate([{ $match: { age: { $gte: 18 }, status: 'active' } }])

// $group - 分组
db.orders.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      total: { $sum: '$amount' },
    },
  },
])

// $sort - 排序
db.users.aggregate([{ $sort: { age: -1, name: 1 } }])

// $limit - 限制
db.users.aggregate([{ $limit: 10 }])

// $skip - 跳过
db.users.aggregate([{ $skip: 20 }])

// $unwind - 展开数组
db.posts.aggregate([{ $unwind: '$tags' }])

// $addFields - 添加字段
db.users.aggregate([
  {
    $addFields: {
      fullName: { $concat: ['$firstName', ' ', '$lastName'] },
    },
  },
])

// $replaceRoot - 替换根文档
db.users.aggregate([{ $replaceRoot: { newRoot: '$profile' } }])

// $facet - 多面聚合
db.products.aggregate([
  {
    $facet: {
      categories: [{ $group: { _id: '$category', count: { $sum: 1 } } }],
      priceStats: [{ $group: { _id: null, avgPrice: { $avg: '$price' } } }],
    },
  },
])
```

### 6.3 聚合表达式

```javascript
// 算术运算
{ $add: ["$price", "$tax"] }
{ $subtract: ["$price", "$discount"] }
{ $multiply: ["$price", "$quantity"] }
{ $divide: ["$total", "$quantity"] }
{ $mod: ["$total", 2] }

// 比较运算
{ $eq: ["$status", "active"] }
{ $ne: ["$status", "deleted"] }
{ $gt: ["$age", 18] }
{ $gte: ["$age", 18] }
{ $lt: ["$age", 60] }
{ $lte: ["$age", 60] }

// 逻辑运算
{ $and: [{ $eq: ["$status", "active"] }, { $gte: ["$age", 18] }] }
{ $or: [{ $lt: ["$age", 18] }, { $gt: ["$age", 60] }] }
{ $not: { $eq: ["$status", "deleted"] } }

// 条件运算
{ $cond: { if: { $gte: ["$age", 18] }, then: "adult", else: "minor" } }
{ $ifNull: ["$nickname", "$name"] }
{ $switch: {
    branches: [
        { case: { $lte: ["$age", 12] }, then: "child" },
        { case: { $lte: ["$age", 18] }, then: "teen" }
    ],
    default: "adult"
}}

// 字符串运算
{ $concat: ["$firstName", " ", "$lastName"] }
{ $substr: ["$name", 0, 5] }
{ $toUpper: "$name" }
{ $toLower: "$name" }
{ $trim: { input: "$name" } }
{ $strLenCP: "$name" }

// 日期运算
{ $year: "$createdAt" }
{ $month: "$createdAt" }
{ $dayOfMonth: "$createdAt" }
{ $hour: "$createdAt" }
{ $minute: "$createdAt" }
{ $second: "$createdAt" }
{ $dayOfWeek: "$createdAt" }
{ $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }

// 数组运算
{ $size: "$tags" }
{ $slice: ["$comments", 5] }
{ $first: "$array" }
{ $last: "$array" }
{ $filter: {
    input: "$scores",
    as: "score",
    cond: { $gte: ["$$score", 60] }
}}
{ $map: {
    input: "$scores",
    as: "score",
    in: { $multiply: ["$$score", 2] }
}}
```

### 6.4 聚合示例

```javascript
// 销售统计
db.orders.aggregate([
  { $match: { createdAt: { $gte: new Date('2024-01-01') } } },
  {
    $group: {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      },
      totalSales: { $sum: '$amount' },
      orderCount: { $sum: 1 },
      avgOrderValue: { $avg: '$amount' },
    },
  },
  { $sort: { '_id.year': 1, '_id.month': 1 } },
])

// 用户行为分析
db.events.aggregate([
  { $match: { eventType: 'page_view' } },
  {
    $group: {
      _id: '$page',
      viewCount: { $sum: 1 },
      uniqueUsers: { $addToSet: '$userId' },
    },
  },
  {
    $project: {
      page: '$_id',
      viewCount: 1,
      uniqueUserCount: { $size: '$uniqueUsers' },
    },
  },
  { $sort: { viewCount: -1 } },
  { $limit: 10 },
])
```

---

## 七、索引优化

### 7.1 创建索引

```javascript
// 单字段索引
db.users.createIndex({ email: 1 })

// 复合索引
db.users.createIndex({ lastName: 1, firstName: 1 })

// 唯一索引
db.users.createIndex({ email: 1 }, { unique: true })

// 稀疏索引(只索引存在该字段的文档)
db.users.createIndex({ phone: 1 }, { sparse: true })

// TTL索引(自动过期)
db.logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })

// 文本索引
db.articles.createIndex({ title: 'text', content: 'text' })

// 地理空间索引
db.places.createIndex({ location: '2dsphere' })

// 部分索引
db.users.createIndex({ email: 1 }, { partialFilterExpression: { status: 'active' } })

// 哈希索引
db.collection.createIndex({ field: 'hashed' })
```

### 7.2 查看索引

```javascript
// 查看所有索引
db.users.getIndexes()

// 查看索引大小
db.users.totalIndexSize()

// 查看索引使用情况
db.users.find({ email: 'test@example.com' }).explain('executionStats')
```

### 7.3 删除索引

```javascript
// 删除指定索引
db.users.dropIndex('email_1')

// 删除所有索引(除_id)
db.users.dropIndexes()
```

### 7.4 索引优化原则

```javascript
// ✅ 适合创建索引的场景
// 1. 频繁用于查询条件的字段
// 2. 用于排序的字段
// 3. 用于分组的字段
// 4. 唯一性约束的字段

// ❌ 不适合创建索引的场景
// 1. 很少查询的字段
// 2. 频繁更新的字段
// 3. 区分度低的字段(如布尔值)
// 4. 小集合

// 最左前缀原则
// 复合索引 { a: 1, b: 1, c: 1 }
// ✅ 可以使用索引
db.collection.find({ a: 1 })
db.collection.find({ a: 1, b: 2 })
db.collection.find({ a: 1, b: 2, c: 3 })

// ❌ 不能使用索引
db.collection.find({ b: 2 })
db.collection.find({ c: 3 })
db.collection.find({ b: 2, c: 3 })

// 覆盖索引(避免回表)
db.users.createIndex({ email: 1, name: 1 })
db.users.find({ email: 'test@example.com' }, { name: 1, _id: 0 })
```

---

## 八、文档更新

### 8.1 更新运算符

```javascript
// $set - 设置字段值
db.users.updateOne({ _id: 1 }, { $set: { name: 'John', age: 25 } })

// $unset - 删除字段
db.users.updateOne({ _id: 1 }, { $unset: { phone: '' } })

// $rename - 重命名字段
db.users.updateOne({ _id: 1 }, { $rename: { oldName: 'newName' } })

// $inc - 递增/递减
db.users.updateOne({ _id: 1 }, { $inc: { age: 1, score: -5 } })

// $mul - 乘法
db.products.updateOne(
  { _id: 1 },
  { $mul: { price: 1.1 } }, // 价格上涨10%
)

// $min - 如果新值更小则更新
db.users.updateOne({ _id: 1 }, { $min: { score: 60 } })

// $max - 如果新值更大则更新
db.users.updateOne({ _id: 1 }, { $max: { score: 100 } })

// $currentDate - 设置为当前时间
db.users.updateOne({ _id: 1 }, { $currentDate: { updatedAt: true } })
```

### 8.2 数组更新运算符

```javascript
// $push - 添加到数组末尾
db.users.updateOne({ _id: 1 }, { $push: { hobbies: 'reading' } })

// $push + $each - 添加多个元素
db.users.updateOne({ _id: 1 }, { $push: { hobbies: { $each: ['reading', 'sports'] } } })

// $push + $position - 指定位置插入
db.users.updateOne({ _id: 1 }, { $push: { scores: { $each: [95], $position: 0 } } })

// $push + $sort - 添加并排序
db.users.updateOne({ _id: 1 }, { $push: { scores: { $each: [95], $sort: -1 } } })

// $addToSet - 添加到数组(不重复)
db.users.updateOne({ _id: 1 }, { $addToSet: { tags: 'mongodb' } })

// $pop - 删除数组首/尾元素
db.users.updateOne(
  { _id: 1 },
  { $pop: { scores: 1 } }, // 删除最后一个
)
db.users.updateOne(
  { _id: 1 },
  { $pop: { scores: -1 } }, // 删除第一个
)

// $pull - 删除匹配的元素
db.users.updateOne({ _id: 1 }, { $pull: { hobbies: 'reading' } })

// $pullAll - 删除所有匹配的元素
db.users.updateOne({ _id: 1 }, { $pullAll: { tags: ['tag1', 'tag2'] } })

// 数组位置更新
db.users.updateOne({ _id: 1, 'scores.score': { $gte: 90 } }, { $set: { 'scores.$.grade': 'A' } })
```

### 8.3 upsert 操作

```javascript
// 不存在则插入,存在则更新
db.users.updateOne(
  { email: 'john@example.com' },
  {
    $set: { name: 'John', age: 25 },
    $setOnInsert: { createdAt: new Date() },
  },
  { upsert: true },
)
```

---

## 九、事务处理

### 9.1 事务基础

```javascript
// 开启会话
const session = db.getMongo().startSession()

try {
  // 开启事务
  session.startTransaction()

  // 执行操作
  const usersCollection = session.getDatabase('mydb').users
  const ordersCollection = session.getDatabase('mydb').orders

  usersCollection.updateOne({ _id: 1 }, { $inc: { balance: -100 } })

  ordersCollection.insertOne({
    userId: 1,
    amount: 100,
    createdAt: new Date(),
  })

  // 提交事务
  session.commitTransaction()
} catch (error) {
  // 回滚事务
  session.abortTransaction()
  throw error
} finally {
  // 结束会话
  session.endSession()
}
```

### 9.2 事务注意事项

```javascript
// ⚠️ 事务限制:
// 1. 仅适用于复制集或分片集群
// 2. 事务最长运行60秒
// 3. 不能跨数据库(4.2+支持)
// 4. 不能创建/删除集合
// 5. 性能开销较大,尽量保持简短

// ✅ 最佳实践:
// 1. 保持事务简短
// 2. 避免在事务中进行大量计算
// 3. 合理设置重试逻辑
// 4. 监控事务执行情况
```

---

## 十、复制集

### 10.1 复制集概念

```
Primary (主节点) - 处理读写请求
    ↓ 复制
Secondary (从节点) - 只读,数据备份
    ↓ 复制
Secondary (从节点) - 只读,数据备份
```

### 10.2 配置复制集

```javascript
// 初始化复制集
rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'localhost:27017' },
    { _id: 1, host: 'localhost:27018' },
    { _id: 2, host: 'localhost:27019' },
  ],
})

// 查看复制集状态
rs.status()

// 查看复制集配置
rs.conf()

// 添加成员
rs.add('localhost:27020')

// 移除成员
rs.remove('localhost:27020')

// 查看主节点
rs.isMaster()
```

### 10.3 读写关注

```javascript
// 写关注
db.users.insertOne({ name: 'John' }, { writeConcern: { w: 'majority', wtimeout: 5000 } })

// 读关注
db.users.find({ status: 'active' }, {}, { readConcern: { level: 'majority' } })

// 级别说明:
// w: 1 - 主节点确认
// w: "majority" - 大多数节点确认
// readConcern: "local" - 本地数据
// readConcern: "majority" - 大多数节点确认的数据
```

---

## 十一、分片集群

### 11.1 分片概念

```
Router (mongos) - 路由层
    ↓
Config Server - 配置服务器(元数据)
    ↓
Shard 1    Shard 2    Shard 3  - 分片(实际数据存储)
```

### 11.2 启用分片

```javascript
// 启用数据库分片
sh.enableSharding('mydb')

// 创建分片键索引
db.users.createIndex({ userId: 1 })

// 对集合分片
sh.shardCollection('mydb.users', { userId: 1 })

// 查看分片状态
sh.status()

// 分片策略:
// 1. Range-based (范围分片): { userId: 1 }
// 2. Hash-based (哈希分片): { userId: "hashed" }
// 3. Zone-based (区域分片): 基于地理位置等
```

---

## 十二、最佳实践

### 12.1 设计规范

1. **文档设计**
   - 使用嵌入文档表示一对一或一对少关系
   - 使用引用表示一对多或多对多关系
   - 避免文档过大(超过16MB)
   - 合理使用数组,避免无限增长
   - 设计合理的Schema,平衡规范化和反规范化

2. **字段命名**
   - 使用驼峰命名法
   - 避免使用保留字
   - 保持一致的命名风格
   - 添加必要的注释

3. **数据类型**
   - 使用合适的数据类型
   - 优先使用ObjectId作为主键
   - 使用ISODate存储时间
   - 使用NumberDecimal存储金额

### 12.2 性能优化

1. **查询优化**
   - 合理使用索引
   - 避免全表扫描
   - 使用投影减少返回字段
   - 使用limit限制结果集
   - 使用explain分析查询性能

2. **写入优化**
   - 批量插入优于逐条插入
   - 合理使用writeConcern
   - 避免频繁更新大文档
   - 使用upsert减少网络往返

3. **索引优化**
   - 为高频查询创建索引
   - 遵循最左前缀原则
   - 定期分析和优化索引
   - 避免过多索引
   - 使用覆盖索引

### 12.3 安全规范

1. **认证授权**
   - 启用身份验证
   - 使用强密码
   - 遵循最小权限原则
   - 定期更换密码
   - 使用角色管理权限

2. **网络安全**
   - 绑定特定IP地址
   - 修改默认端口
   - 启用SSL/TLS加密
   - 防火墙限制访问
   - 禁用不必要的服务

3. **数据安全**
   - 定期备份数据
   - 启用审计日志
   - 敏感数据加密存储
   - 监控异常访问
   - 实施数据脱敏

### 12.4 运维规范

1. **监控告警**
   - 监控CPU、内存、磁盘使用率
   - 监控连接数和QPS
   - 监控慢查询
   - 监控复制延迟
   - 设置告警阈值

2. **备份策略**
   - 定期全量备份
   - 增量备份(Oplog)
   - 定期测试恢复
   - 异地备份
   - 保留足够历史备份

3. **容量规划**
   - 定期评估数据增长
   - 预留足够磁盘空间
   - 规划分片策略
   - 定期清理历史数据
   - 归档冷数据

### 12.5 开发规范

1. **连接管理**
   - 使用连接池
   - 及时关闭连接
   - 避免频繁创建销毁连接
   - 设置合理的超时时间
   - 实现重试机制

2. **错误处理**
   - 捕获并处理异常
   - 实现幂等操作
   - 记录详细错误日志
   - 提供友好的错误提示
   - 实现降级策略

3. **代码规范**
   - 使用ORM/ODM库(Mongoose等)
   - 参数化查询防止注入
   - 避免N+1查询问题
   - 合理使用缓存
   - 编写单元测试

---

## 附录

### A. 常用命令

```javascript
// 数据库操作
show dbs
use mydb
db.dropDatabase()

// 集合操作
show collections
db.createCollection("name")
db.collection.drop()

// 文档操作
db.collection.find()
db.collection.findOne()
db.collection.insertOne()
db.collection.insertMany()
db.collection.updateOne()
db.collection.updateMany()
db.collection.deleteOne()
db.collection.deleteMany()

// 索引操作
db.collection.createIndex()
db.collection.getIndexes()
db.collection.dropIndex()
db.collection.dropIndexes()

// 聚合操作
db.collection.aggregate()

// 复制集操作
rs.status()
rs.conf()
rs.initiate()
rs.add()
rs.remove()

// 分片操作
sh.status()
sh.enableSharding()
sh.shardCollection()
```

### B. 常用工具

```bash
# MongoDB Shell
mongosh

# 导入导出
mongoimport --db mydb --collection users --file users.json
mongoexport --db mydb --collection users --out users.json

# 备份恢复
mongodump --db mydb --out ./backup
mongorestore --db mydb ./backup/mydb

# 性能分析
mongotop
mongostat

# GUI工具
# - MongoDB Compass (官方)
# - Studio 3T
# - Robo 3T
```

### C. 学习资源

- **官方文档**: https://docs.mongodb.com/
- **MongoDB University**: https://university.mongodb.com/
- **MongoDB博客**: https://www.mongodb.com/blog
- **在线练习**: https://mongoplayground.net/
- **社区论坛**: https://community.mongodb.com/

---

**提示**: 本手册涵盖了MongoDB日常开发中最常用的功能和最佳实践,建议结合实际项目需求深入学习和实践。
