# Mongoose ODM 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: Node.js 开发者、MongoDB 用户

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、Schema 定义](#二schema-定义)
- [三、模型操作](#三模型操作)
- [四、CRUD 操作](#四crud-操作)
- [五、查询操作](#五查询操作)
- [六、聚合管道](#六聚合管道)
- [七、中间件](#七中间件)
- [八、验证](#八验证)
- [九、索引](#九索引)
- [十、最佳实践](#十最佳实践)
- [十一、开发工作流](#十一开发工作流)

---

## 🐳 Docker Compose 快速启动

> Mongoose 是 MongoDB 的 ODM，需要先启动 MongoDB 实例。

### 单机 MongoDB + Mongo Express

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: mongodb
    ports:
      - '27017:27017'
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: app
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'mongosh', '--eval', "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  mongo-express:
    image: mongo-express:latest
    container_name: mongo-express
    ports:
      - '8081:8081'
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: password
      ME_CONFIG_MONGODB_URL: mongodb://admin:password@mongodb:27017
    depends_on:
      mongodb:
        condition: service_healthy
    restart: unless-stopped

volumes:
  mongo_data:
```

```bash
# 启动
docker-compose up -d

# Mongoose 连接字符串
# mongodb://admin:password@localhost:27017/app?authSource=admin
```

---

## 一、基础概念

### 1.1 什么是 Mongoose

Mongoose 是一个 MongoDB ODM (Object Document Mapper)，为 Node.js 提供优雅的 MongoDB 数据建模解决方案。

### 1.2 安装

```bash
npm install mongoose
```

### 1.3 连接数据库

```javascript
const mongoose = require('mongoose')

// 连接
mongoose.connect('mongodb://localhost:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// 或使用新语法
await mongoose.connect('mongodb://localhost:27017/mydb')

// 连接事件
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from MongoDB')
})

// 优雅关闭
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  process.exit(0)
})
```

### 1.4 Schema vs Model

```javascript
// Schema - 定义数据结构
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
})

// Model - 基于 Schema 创建的构造函数
const User = mongoose.model('User', userSchema)

// Document - Model 的实例
const user = new User({ name: 'John', email: 'john@example.com' })
```

---

# 二、Schema 定义

> Schema 是 Mongoose 的核心概念，它定义了文档的数据结构、字段类型、验证规则、默认值等。
> 可以理解为数据库表的「蓝图」或「模板」。

### 2.1 基本 Schema

```javascript
const userSchema = new mongoose.Schema({
  // ---- 字符串类型 ----
  name: {
    type: String,
    required: true, // 必填字段，插入时如果不提供会抛出 ValidationError
    trim: true, // 自动去除首尾空格
  },
  email: {
    type: String,
    required: true,
    unique: true, // 创建唯一索引，保证该字段值不重复
    lowercase: true, // 存储前自动转为小写
  },

  // ---- 数字类型 ----
  age: {
    type: Number,
    min: 0, // 最小值限制
    max: 150, // 最大值限制
  },
  score: {
    type: Number,
    default: 0, // 默认值，插入时如果不提供则自动填充
  },

  // ---- 布尔类型 ----
  isActive: {
    type: Boolean,
    default: true, // 默认激活
  },

  // ---- 日期类型 ----
  createdAt: {
    type: Date,
    default: Date.now, // 默认值为当前时间（注意：传入函数引用，不是函数调用结果）
  },
  birthday: {
    type: Date, // 存储标准 JavaScript Date 对象
  },
})
```

### 2.2 完整数据类型一览

```javascript
// ========== Mongoose 支持的所有 Schema 类型 ==========

const allTypesSchema = new mongoose.Schema({
  // ---- 基础类型 ----
  str: String, // 字符串
  num: Number, // 数字（整数或浮点数）
  bool: Boolean, // 布尔值
  date: Date, // 日期
  buf: Buffer, // 二进制数据（存储文件、图片等）

  // ---- 特殊类型 ----
  mixed: mongoose.Schema.Types.Mixed, // 混合类型，可以存储任意数据结构（不推荐滥用）
  objectId: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId，常用于关联引用
  decimal: mongoose.Schema.Types.Decimal128, // 高精度小数（金融计算等场景）
  uuid: mongoose.Schema.Types.UUID, // UUID 字符串

  // ---- 集合类型 ----
  tags: [String], // 字符串数组，如 ['tag1', 'tag2']
  scores: [Number], // 数字数组，如 [90, 85, 78]
  items: [{ name: String, qty: Number }], // 对象数组（内嵌子文档）

  // ---- Map 类型 ----
  // 键为字符串，值为指定类型，适合存储动态键值对
  metadata: {
    type: Map,
    of: String, // Map 的值类型
  },
  // 示例: { theme: 'dark', language: 'zh-CN' }
})
```

### 2.3 SchemaType 常用配置项

每个 SchemaType（字段定义）都可以配置以下选项：

```javascript
const demoSchema = new mongoose.Schema({
  // ---- String 专属配置 ----
  username: {
    type: String,
    required: true, // 必填。可传数组自定义错误信息: [true, '用户名不能为空']
    trim: true, // 去除首尾空白
    lowercase: true, // 存储前转小写
    uppercase: false, // 存储前转大写（与 lowercase 二选一）
    minlength: [2, '用户名至少2个字符'], // 最小长度 + 自定义错误信息
    maxlength: [30, '用户名最多30个字符'], // 最大长度 + 自定义错误信息
    match: [/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'], // 正则匹配
    enum: ['alice', 'bob'], // 枚举限制，只允许指定的字符串值
    default: 'anonymous', // 默认值
    index: true, // 为该字段创建索引
    unique: true, // 创建唯一索引
    sparse: true, // 稀疏索引，允许字段不存在时不参与唯一约束
    select: false, // 查询时默认不返回该字段（常用于 password）
    immutable: false, // 设为 true 后字段值不可修改
    get: (v) => v, // 自定义 getter，读取时转换值
    set: (v) => v, // 自定义 setter，写入时转换值
    alias: 'userName', // 字段别名，可以用别名访问
  },

  // ---- Number 专属配置 ----
  price: {
    type: Number,
    min: [0, '价格不能为负数'], // 最小值
    max: [999999, '价格超出范围'], // 最大值
    default: 0, // 默认值
  },

  // ---- Date 配置 ----
  expireAt: {
    type: Date,
    expires: 3600, // TTL 索引，文档在该时间后自动删除（单位：秒）
  },

  // ---- ObjectId 引用配置 ----
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 关联的模型名称，配合 populate() 使用
  },

  // ---- Array 配置 ----
  hobbies: {
    type: [String],
    default: [], // 默认空数组
  },
})
```

### 2.4 Schema 全局选项

Schema 的第二个参数用于配置全局行为：

```javascript
const schema = new mongoose.Schema(
  {
    // 字段定义...
  },
  {
    // ---- 时间戳 ----
    timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
    // 也可以自定义字段名:
    // timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }

    // ---- 序列化 ----
    toJSON: {
      virtuals: true, // toJSON 时包含虚拟字段
      transform: (doc, ret) => {
        // 序列化时自定义转换（如删除密码字段）
        delete ret.password
        return ret
      },
    },
    toObject: { virtuals: true }, // toObject 时包含虚拟字段

    // ---- 版本控制 ----
    versionKey: '__v', // 文档版本号字段名，设为 false 可禁用
    optimisticConcurrency: true, // 乐观并发控制，防止并发更新冲突

    // ---- 严格模式 ----
    strict: true, // 严格模式：不允许保存 Schema 未定义的字段（默认 true）
    strictQuery: true, // 查询严格模式：忽略 Schema 未定义的查询条件

    // ---- ID 相关 ----
    _id: true, // 是否自动添加 _id 字段（默认 true）
    id: true, // 是否添加 id 虚拟 getter（返回 _id 的字符串形式）

    // ---- 其他 ----
    minimize: true, // 自动移除空对象（如 { address: {} } → {}）
    collection: 'my_collection', // 指定集合名称（默认取模型名的复数形式）
    autoIndex: true, // 自动创建索引（生产环境建议关闭，手动管理）
    capped: { size: 1024, max: 100 }, // 固定大小集合（限制大小和文档数）
  },
)
```

### 2.5 嵌套 Schema（子文档）

```javascript
// ---- 定义地址子 Schema ----
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true }, // 街道
  city: { type: String, required: true }, // 城市
  province: { type: String, default: '' }, // 省份
  country: { type: String, default: 'China' }, // 国家
  zipCode: { type: String, match: /^\d{6}$/ }, // 邮编，正则校验6位数字
})

// ---- 在父 Schema 中使用 ----
const userSchema = new mongoose.Schema({
  name: String,

  // 单个嵌套文档（一对一）
  address: addressSchema,

  // 嵌套文档数组（一对多）
  addresses: [addressSchema],

  // 也可以直接内联定义（不推荐用于复杂结构，不易复用）
  profile: {
    avatar: { type: String, default: '' }, // 头像 URL
    bio: { type: String, maxlength: 200 }, // 个人简介
    website: String, // 个人网站
  },
})

// 访问嵌套字段
const user = new User({
  name: '张三',
  address: { street: '中山路1号', city: '深圳', zipCode: '518000' },
})
console.log(user.address.city) // "深圳"

// 嵌套文档也有 _id，可以通过 id() 方法查找
const addr = user.addresses.id('507f191e810c19729de860ea')
```

### 2.6 虚拟字段（Virtuals）

虚拟字段不会存储到数据库中，而是在读取/写入时动态计算：

```javascript
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthDate: Date, // 出生日期
})

// ---- 虚拟 getter：读取时自动计算 ----
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

// ---- 虚拟 setter：写入时自动拆分 ----
userSchema.virtual('fullName').set(function (name) {
  const parts = name.split(' ')
  this.firstName = parts[0]
  this.lastName = parts[1]
})

// ---- 计算年龄的虚拟字段 ----
userSchema.virtual('age').get(function () {
  if (!this.birthDate) return null
  const diff = Date.now() - this.birthDate.getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
})

// 使用示例
const user = new User({ firstName: 'John', lastName: 'Doe' })
console.log(user.fullName) // "John Doe"

user.fullName = 'Jane Smith' // 触发 setter
console.log(user.firstName) // "Jane"

// ⚠️ 注意：虚拟字段默认不包含在 JSON 输出中
// 需要在 Schema 选项中开启:
// { toJSON: { virtuals: true }, toObject: { virtuals: true } }
```

### 2.7 实例方法、静态方法与查询助手

```javascript
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: { type: String, select: false }, // 查询时默认不返回
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
})

// ---- 实例方法：每个文档实例都可以调用 ----
userSchema.methods.checkPassword = function (password) {
  // this 指向当前文档实例
  return this.password === password // 实际项目中应使用 bcrypt 等加密库
}

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password // 序列化时隐藏密码
  return obj
}

// ---- 静态方法：直接通过 Model 调用 ----
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email }) // this 指向 Model
}

userSchema.statics.findActiveAdmins = function () {
  return this.find({ role: 'admin', isActive: true })
}

// ---- 查询助手：链式调用 ----
userSchema.query.byRole = function (role) {
  return this.where({ role }) // this 指向 Query
}

userSchema.query.active = function () {
  return this.where({ isActive: true })
}

// 使用示例
// 实例方法: const user = await User.findById(id); await user.checkPassword('123')
// 静态方法: const user = await User.findByEmail('test@example.com')
// 查询助手: const admins = await User.find().byRole('admin').active()
```

---

## 三、模型操作

### 3.1 创建模型

```javascript
const User = mongoose.model('User', userSchema)

// 或指定集合名
const User = mongoose.model('User', userSchema, 'users')
```

### 3.2 文档实例化

```javascript
// 方式1: new + save
const user = new User({ name: 'John', email: 'john@example.com' })
await user.save()

// 方式2: create
const user = await User.create({ name: 'John', email: 'john@example.com' })

// 方式3: insertMany
const users = await User.insertMany([
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
])
```

---

## 四、CRUD 操作

### 4.1 创建

```javascript
// 单个文档
const user = await User.create({
  name: 'John',
  email: 'john@example.com',
})

// 多个文档
const users = await User.insertMany([{ name: 'Alice' }, { name: 'Bob' }], { ordered: false }) // 即使有错误也继续插入

// 保存
const user = new User({ name: 'John' })
await user.save()
```

### 4.2 读取

```javascript
// 查找所有
const users = await User.find()

// 按 ID 查找
const user = await User.findById('507f191e810c19729de860ea')

// 查找一个
const user = await User.findOne({ email: 'john@example.com' })

// 条件查找
const users = await User.find({ age: { $gte: 18 } })

// 计数
const count = await User.countDocuments({ isActive: true })

// 检查是否存在
const exists = await User.exists({ email: 'test@example.com' })
```

### 4.3 更新

```javascript
// 更新并返回文档
const user = await User.findByIdAndUpdate(
  id,
  { name: 'New Name' },
  { new: true, runValidators: true },
)

// 更新第一个匹配
await User.updateOne({ email: 'john@example.com' }, { $set: { name: 'John Doe' } })

// 更新所有匹配
await User.updateMany({ isActive: false }, { $set: { isActive: true } })

// 替换整个文档
await User.replaceOne({ _id: id }, { name: 'New Name', email: 'new@example.com' })

// 原子操作
await User.updateOne(
  { _id: id },
  {
    $inc: { age: 1 }, // 递增
    $push: { tags: 'new' }, // 添加到数组
    $pull: { tags: 'old' }, // 从数组移除
    $addToSet: { tags: 'tag' }, // 添加到集合（不重复）
  },
)
```

### 4.4 删除

```javascript
// 按 ID 删除
await User.findByIdAndDelete(id)

// 删除一个
await User.deleteOne({ email: 'john@example.com' })

// 删除多个
await User.deleteMany({ isActive: false })

// 从文档删除
const user = await User.findById(id)
await user.deleteOne()
```

---

## 五、查询操作

### 5.1 查询构建器

```javascript
// 链式查询
const users = await User.find()
  .where('age')
  .gte(18)
  .lte(65)
  .where('isActive')
  .equals(true)
  .sort('-createdAt')
  .limit(10)
  .skip(20)
  .select('name email')
  .exec()

// 或使用对象
const users = await User.find({
  age: { $gte: 18, $lte: 65 },
  isActive: true,
})
  .sort('-createdAt')
  .limit(10)
  .skip(20)
  .select('name email')
```

### 5.2 查询操作符

```javascript
// 比较
;($eq, $ne, $gt, $gte, $lt, $lte)
;($in, $nin)

// 逻辑
;($and, $or, $nor, $not)

// 元素
;($exists, $type)

// 评估
;($regex, $text, $where, $expr)

// 数组
;($all, $elemMatch, $size)

// 示例
User.find({
  age: { $gte: 18, $lte: 65 },
  name: { $in: ['John', 'Jane'] },
  email: { $regex: /@example\.com$/i },
  tags: { $all: ['tag1', 'tag2'] },
  'address.city': { $exists: true },
})
```

### 5.3 排序

```javascript
// 字符串格式
User.find().sort('name -age createdAt')

// 对象格式
User.find().sort({ name: 1, age: -1 })

// 1 = 升序, -1 = 降序
```

### 5.4 分页

```javascript
const page = 1
const limit = 10
const skip = (page - 1) * limit

const [users, total] = await Promise.all([
  User.find().skip(skip).limit(limit).sort('-createdAt'),
  User.countDocuments(),
])

console.log({
  data: users,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  },
})
```

### 5.5 投影

```javascript
// 包含字段
User.find().select('name email age')

// 排除字段
User.find().select('-password -__v')

// 条件投影
User.find().select({
  name: 1,
  email: 1,
  age: { $cond: { if: { $gte: ['$age', 18] }, then: 1, else: 0 } },
})
```

### 5.6 填充（Populate）

```javascript
// Schema 定义
const postSchema = new mongoose.Schema({
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

// 基本填充
const posts = await Post.find().populate('author')

// 选择字段
const posts = await Post.find().populate('author', 'name email')

// 深度填充
const posts = await Post.find().populate({
  path: 'author',
  populate: {
    path: 'friends',
    select: 'name',
  },
})

// 条件填充
const posts = await Post.find().populate({
  path: 'author',
  match: { isActive: true },
  select: 'name email',
})
```

---

## 六、聚合管道

### 6.1 基本聚合

```javascript
const result = await User.aggregate([
  { $match: { isActive: true } },
  {
    $group: {
      _id: '$role',
      count: { $sum: 1 },
      avgAge: { $avg: '$age' },
    },
  },
  { $sort: { count: -1 } },
])
```

### 6.2 常用阶段

```javascript
// $match - 过滤
{ $match: { age: { $gte: 18 } } }

// $group - 分组
{ $group: {
  _id: '$category',
  total: { $sum: '$amount' },
  avgPrice: { $avg: '$price' },
  docs: { $push: '$$ROOT' }
}}

// $project - 投影
{ $project: {
  name: 1,
  fullName: { $concat: ['$firstName', ' ', '$lastName'] },
  orderCount: { $size: '$orders' }
}}

// $sort - 排序
{ $sort: { createdAt: -1 } }

// $limit - 限制
{ $limit: 10 }

// $skip - 跳过
{ $skip: 20 }

// $unwind - 展开数组
{ $unwind: '$tags' }

// $lookup - 关联
{ $lookup: {
  from: 'posts',
  localField: '_id',
  foreignField: 'authorId',
  as: 'posts'
}}

// $addFields - 添加字段
{ $addFields: {
  fullName: { $concat: ['$firstName', ' ', '$lastName'] }
}}

// $facet - 多面聚合
{ $facet: {
  byCategory: [
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ],
  byStatus: [
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]
}}
```

### 6.3 表达式操作符

```javascript
// 算术
$add, $subtract, $multiply, $divide, $mod, $pow

// 字符串
$concat, $substr, $toLower, $toUpper, $trim, $split

// 数组
$size, $slice, $concatArrays, $indexOfArray

// 日期
$year, $month, $dayOfMonth, $hour, $minute, $second

// 条件
$cond, $ifNull, $switch

// 比较
$eq, $ne, $gt, $gte, $lt, $lte

// 逻辑
$and, $or, $not

// 示例
{ $project: {
  fullName: { $concat: ['$firstName', ' ', '$lastName'] },
  isAdult: { $cond: { if: { $gte: ['$age', 18] }, then: true, else: false } },
  birthYear: { $year: '$birthDate' }
}}
```

---

## 七、中间件

### 7.1 文档中间件

```javascript
// pre 中间件
userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = hashPassword(this.password)
  }
  next()
})

// post 中间件
userSchema.post('save', function (doc) {
  console.log('User saved:', doc._id)
})

// 异步 pre
userSchema.pre('save', async function () {
  if (this.isNew) {
    await sendWelcomeEmail(this.email)
  }
})
```

### 7.2 查询中间件

```javascript
// pre find
userSchema.pre('find', function (next) {
  this.where({ isActive: true })
  next()
})

// post find
userSchema.post('find', function (docs) {
  console.log(`Found ${docs.length} users`)
})
```

### 7.3 可用中间件

```javascript
// 文档中间件
init
validate
save
remove
updateOne

// 查询中间件
count
deleteMany
deleteOne
distinct
find
findOne
findOneAndDelete
findOneAndRemove
findOneAndUpdate
replaceOne
update
updateMany
updateOne
```

---

## 八、验证

### 8.1 内置验证器

```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name must be at most 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Name can only contain letters'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
  },
  age: {
    type: Number,
    min: [0, 'Age must be positive'],
    max: [150, 'Age must be less than 150'],
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'moderator'],
      message: '{VALUE} is not a valid role',
    },
  },
})
```

### 8.2 自定义验证器

```javascript
const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    validate: {
      validator: function (value) {
        return /^\d{10,11}$/.test(value)
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
})

// 异步验证器
userSchema.path('email').validate(async function (value) {
  const count = await this.constructor.countDocuments({ email: value })
  return count === 0
}, 'Email already exists')
```

### 8.3 验证错误处理

```javascript
try {
  await user.save()
} catch (error) {
  if (error.name === 'ValidationError') {
    Object.keys(error.errors).forEach((key) => {
      console.log(`${key}: ${error.errors[key].message}`)
    })
  }
}
```

---

## 九、索引

### 9.1 单字段索引

```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    index: true,
  },
  username: {
    type: String,
    unique: true,
  },
})
```

### 9.2 复合索引

```javascript
userSchema.index({ firstName: 1, lastName: 1 })
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ location: '2dsphere' }) // 地理空间索引
```

### 9.3 文本索引

```javascript
userSchema.index({ name: 'text', bio: 'text' })

// 文本搜索
User.find({ $text: { $search: 'john developer' } })
```

### 9.4 TTL 索引

```javascript
// 自动删除过期文档
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 })
```

---

## 十、最佳实践

### 10.1 项目结构

```
src/
├── config/
│   └── database.js
├── models/
│   ├── user.js
│   ├── post.js
│   └── index.js
├── services/
│   ├── user.service.js
│   └── post.service.js
└── middleware/
    └── errorHandler.js
```

### 10.2 模型组织

```javascript
// models/user.js
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    // 字段定义
  },
  {
    timestamps: true,
  },
)

// 实例方法
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

// 静态方法
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email })
}

// 查询助手
userSchema.query.byRole = function (role) {
  return this.where({ role })
}

module.exports = mongoose.model('User', userSchema)
```

### 10.3 连接管理

```javascript
// config/database.js
const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

module.exports = connectDB
```

### 10.4 性能优化

```javascript
// 使用索引
userSchema.index({ email: 1 })

// 只选择需要的字段
User.find().select('name email')

// 限制结果数量
User.find().limit(100)

// 使用 lean() 返回纯 JavaScript 对象
const users = await User.find().lean()

// 批量操作
await User.bulkWrite([
  { insertOne: { document: { name: 'John' } } },
  { updateOne: { filter: { _id: id }, update: { name: 'Jane' } } },
])
```

### 10.5 错误处理

```javascript
// 全局错误处理
mongoose.Error.messages = {
  Number: {
    min: '{PATH} must be at least {MIN}',
    max: '{PATH} must be at most {MAX}',
  },
}

// 捕获验证错误
try {
  await user.save()
} catch (error) {
  if (error.name === 'ValidationError') {
    // 处理验证错误
  } else if (error.code === 11000) {
    // 处理重复键错误
  }
}
```

### 10.6 事务处理

```javascript
const session = await mongoose.startSession()
session.startTransaction()

try {
  const user = await User.create([{ name: 'John' }], { session })
  await Profile.create([{ userId: user[0]._id }], { session })

  await session.commitTransaction()
} catch (error) {
  await session.abortTransaction()
  throw error
} finally {
  session.endSession()
}
```

---

## 十一、开发工作流

### 11.1 开发流程总览

> Mongoose 是 Schemaless 数据库的 ODM，没有内置迁移系统，工作流围绕 **Schema 定义 → 模型注册 → 业务开发 → 数据迁移（可选）→ 部署** 展开。

```
┌─────────────────────────────────────────────────────────────────┐
│                  Mongoose 开发工作流总览                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ① 定义/修改 Schema（models/*.js）                              │
│       ↓                                                         │
│  ② 本地启动 MongoDB（Docker / mongod）                          │
│       ↓                                                         │
│  ③ 连接数据库 + 自动同步索引（autoIndex: true）                  │
│       ↓                                                         │
│  ④ 编写业务代码（Service / Controller）                          │
│       ↓                                                         │
│  ⑤ 数据迁移（migrate-mongo / 自定义脚本）                       │
│       ↓                                                         │
│  ⑥ 提交代码到 Git                                               │
│       ↓                                                         │
│  ⑦ 生产环境：关闭 autoIndex + 手动创建索引 + 执行迁移           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 日常开发工作流

```bash
# ===== 第一步：初始化项目（仅首次） =====
mkdir my-app && cd my-app
npm init -y
npm install mongoose
npm install -D nodemon dotenv

# ===== 第二步：启动本地 MongoDB =====
# 方式 A：Docker（推荐）
docker-compose up -d
# 方式 B：本地安装
mongod --dbpath ./data/db

# ===== 第三步：定义 Schema 和 Model =====
# 创建 src/models/user.js，定义 Schema、实例方法、静态方法、中间件

# ===== 第四步：配置数据库连接 =====
# 创建 src/config/database.js，管理连接池和事件监听

# ===== 第五步：开发调试 =====
npx nodemon src/app.js
# Mongoose 在开发环境默认 autoIndex: true，自动创建索引

# ===== 第六步：验证数据（可选） =====
# 使用 Mongo Express（http://localhost:8081）或 mongosh 查看数据
mongosh "mongodb://admin:password@localhost:27017/app?authSource=admin"

# ===== 第七步：提交到版本控制 =====
git add src/models/ src/config/
git commit -m "feat: add user model with validation"
```

### 11.3 数据迁移工作流（migrate-mongo）

> MongoDB 是 Schemaless 的，但生产环境中仍需要迁移脚本处理：索引变更、数据格式升级、字段重命名等。

```bash
# ===== 安装 migrate-mongo =====
npm install -D migrate-mongo

# ===== 初始化 =====
npx migrate-mongo init
# 生成 migrate-mongo-config.js 和 migrations/ 目录
```

```javascript
// migrate-mongo-config.js
const config = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/app',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
}

module.exports = config
```

```bash
# ===== 创建迁移文件 =====
npx migrate-mongo create add_user_index
# 生成 migrations/<timestamp>_add_user_index.js
```

```javascript
// migrations/20260101120000_add_user_index.js
module.exports = {
  async up(db, client) {
    // 向上迁移：创建索引
    await db.collection('users').createIndex(
      { email: 1 },
      { unique: true, background: true },
    )

    // 数据格式迁移示例：拆分 fullName 为 firstName + lastName
    const users = await db.collection('users').find({ fullName: { $exists: true } }).toArray()
    for (const user of users) {
      const [firstName, ...rest] = user.fullName.split(' ')
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: { firstName, lastName: rest.join(' ') },
          $unset: { fullName: '' },
        },
      )
    }
  },

  async down(db, client) {
    // 回滚：删除索引
    await db.collection('users').dropIndex('email_1')
  },
}
```

```bash
# ===== 执行迁移 =====
npx migrate-mongo up          # 执行所有未应用的迁移
npx migrate-mongo down        # 回滚最近一次迁移
npx migrate-mongo status      # 查看迁移状态
```

### 11.4 生产部署工作流

```bash
# ===== 生产环境关键配置 =====

# 1. 关闭 autoIndex（避免启动时自动创建索引影响性能）
# 在 Schema 选项中设置：autoIndex: false
# 或在连接时全局设置：
# mongoose.set('autoIndex', false)

# 2. 手动同步索引（部署时执行一次）
# node scripts/sync-indexes.js

# 3. 执行数据迁移
npx migrate-mongo up

# 4. 启动应用
node src/app.js
```

```javascript
// scripts/sync-indexes.js
const mongoose = require('mongoose')
const connectDB = require('../src/config/database')

async function syncIndexes() {
  await connectDB()

  // 为所有模型同步索引
  const models = mongoose.modelNames()
  for (const modelName of models) {
    const model = mongoose.model(modelName)
    await model.syncIndexes()
    console.log(`✓ ${modelName} indexes synced`)
  }

  await mongoose.connection.close()
  console.log('All indexes synced successfully')
}

syncIndexes().catch((err) => {
  console.error('Index sync failed:', err)
  process.exit(1)
})
```

```dockerfile
# Dockerfile 示例
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/migrate-mongo-config.js ./

# 启动时：同步索引 → 执行迁移 → 启动应用
CMD ["sh", "-c", "node scripts/sync-indexes.js && npx migrate-mongo up && node src/app.js"]
```

### 11.5 团队协作工作流

```bash
# ===== 场景 A：拉取同事的模型变更 =====
git pull origin main
npm install
# 重启应用，开发环境 autoIndex: true 会自动同步新索引
npx nodemon src/app.js

# ===== 场景 B：Schema 变更涉及数据迁移 =====
# 1. 修改 Schema（如字段重命名、类型变更）
# 2. 创建迁移脚本
npx migrate-mongo create rename_user_field
# 3. 编写 up/down 逻辑
# 4. 本地测试
npx migrate-mongo up
npx migrate-mongo down  # 验证回滚
npx migrate-mongo up    # 重新应用
# 5. 提交 Schema + 迁移脚本
git add src/models/ migrations/
git commit -m "feat: rename user.fullName to firstName/lastName"

# ===== 场景 C：新成员加入项目 =====
git clone <repo>
npm install
# 配置 .env 中的 MONGODB_URI
docker-compose up -d          # 启动本地 MongoDB
npx migrate-mongo up          # 执行所有历史迁移
npx nodemon src/app.js        # 启动开发服务器

# ===== 场景 D：索引冲突排查 =====
# 查看当前集合索引
mongosh "mongodb://localhost:27017/app" --eval "db.users.getIndexes()"
# 删除冲突索引
mongosh "mongodb://localhost:27017/app" --eval "db.users.dropIndex('email_1')"
# 重新同步
node scripts/sync-indexes.js
```

### 11.6 CI/CD 集成工作流

```yaml
# .github/workflows/mongoose.yml
name: Mongoose CI

on:
  pull_request:
    paths:
      - 'src/models/**'
      - 'migrations/**'
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: password
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand(\"ping\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - name: Run Tests
        run: npm test
        env:
          MONGODB_URI: mongodb://admin:password@localhost:27017/app_test?authSource=admin

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci --only=production
      - name: Sync Indexes
        run: node scripts/sync-indexes.js
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
      - name: Run Migrations
        run: npx migrate-mongo up
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
```

### 11.7 种子数据管理

```javascript
// scripts/seed.js
const mongoose = require('mongoose')
const connectDB = require('../src/config/database')
const User = require('../src/models/user')

async function seed() {
  await connectDB()

  // 清空现有数据（仅开发环境）
  if (process.env.NODE_ENV !== 'production') {
    await User.deleteMany({})
  }

  // 插入种子数据
  await User.insertMany([
    { name: 'Admin', email: 'admin@example.com', role: 'admin' },
    { name: 'Alice', email: 'alice@example.com', role: 'user' },
    { name: 'Bob', email: 'bob@example.com', role: 'user' },
  ])

  console.log('✓ Seed data inserted')
  await mongoose.connection.close()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
```

```json
// package.json scripts
{
  "scripts": {
    "dev": "nodemon src/app.js",
    "seed": "node scripts/seed.js",
    "migrate:up": "migrate-mongo up",
    "migrate:down": "migrate-mongo down",
    "migrate:status": "migrate-mongo status",
    "migrate:create": "migrate-mongo create",
    "indexes:sync": "node scripts/sync-indexes.js"
  }
}
```

### 11.8 故障排查

```bash
# ===== 连接问题 =====
# 检查 MongoDB 是否运行
docker ps | grep mongo
# 测试连接
mongosh "mongodb://admin:password@localhost:27017/app?authSource=admin" --eval "db.adminCommand('ping')"

# ===== 索引问题 =====
# 查看集合所有索引
mongosh "mongodb://localhost:27017/app" --eval "db.users.getIndexes()"
# 查看索引大小
mongosh "mongodb://localhost:27017/app" --eval "db.users.totalIndexSize()"
# 重建索引（生产慎用，会锁表）
# mongosh --eval "db.users.reIndex()"

# ===== 迁移问题 =====
# 查看迁移状态
npx migrate-mongo status
# 如果迁移部分执行失败：
#   1. 检查 changelog 集合
mongosh "mongodb://localhost:27017/app" --eval "db.changelog.find().sort({appliedAt:-1}).limit(5)"
#   2. 手动修复数据后，删除 changelog 中对应记录重新执行
#   3. 或手动执行剩余迁移逻辑

# ===== 常见问题速查 =====
# MongoServerSelectionError  → 检查 MongoDB 是否启动、连接字符串是否正确
# E11000 duplicate key      → 唯一索引冲突，检查重复数据
# ValidationError           → Schema 验证失败，检查必填/类型/范围
# Buffering timed out       → 连接未建立就执行操作，确保 await connect()
# CastError                 → 类型转换失败（如非法 ObjectId 格式）
```

### 11.9 工作流命令速查表

| 阶段 | 命令 | 说明 |
|------|------|------|
| 启动数据库 | `docker-compose up -d` | 启动本地 MongoDB |
| 开发运行 | `npx nodemon src/app.js` | 热重载开发服务器 |
| 同步索引 | `node scripts/sync-indexes.js` | 手动同步所有模型索引 |
| 创建迁移 | `npx migrate-mongo create <name>` | 创建迁移文件 |
| 执行迁移 | `npx migrate-mongo up` | 应用所有未执行迁移 |
| 回滚迁移 | `npx migrate-mongo down` | 回滚最近一次迁移 |
| 迁移状态 | `npx migrate-mongo status` | 查看迁移执行情况 |
| 种子数据 | `node scripts/seed.js` | 填充测试数据 |
| 数据浏览 | `npx prisma studio` / Mongo Express | GUI 查看数据 |
| 连接测试 | `mongosh <uri> --eval "db.adminCommand('ping')"` | 验证数据库连通性 |
| 索引检查 | `db.<collection>.getIndexes()` | 查看集合索引 |
| 生产部署 | `sync-indexes → migrate up → start app` | 标准上线三步 |

---

## 附录

### A. 常用命令

```bash
# 启动 MongoDB
mongod

# MongoDB Shell
mongosh

# 查看数据库
show dbs

# 使用数据库
use mydb

# 查看集合
show collections

# 查询
db.users.find()
```

### B. 有用的资源

- **官方文档**: https://mongoosejs.com/docs/
- **GitHub**: https://github.com/Automattic/mongoose
- **MongoDB University**: https://university.mongodb.com/

### C. 学习路线

```
MongoDB 基础 → Mongoose 基础 → Schema 定义 → CRUD 操作 → 查询 → 聚合 → 高级特性

1. MongoDB 基础概念
2. Mongoose 安装和连接
3. Schema 和 Model
4. CRUD 操作
5. 查询和过滤
6. 聚合管道
7. 中间件和 Hooks
8. 验证和索引
9. 事务处理
10. 性能优化
```

---

**祝您 Mongoose 开发愉快！** 🍃
