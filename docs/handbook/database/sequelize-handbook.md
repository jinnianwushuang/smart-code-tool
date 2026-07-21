# Sequelize ORM 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: Node.js 开发者、后端工程师

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、模型定义](#二模型定义)
- [三、数据验证](#三数据验证)
- [四、关联关系](#四关联关系)
- [五、CRUD 操作](#五crud-操作)
- [六、查询操作](#六查询操作)
- [七、事务处理](#七事务处理)
- [八、迁移管理](#八迁移管理)
- [九、Hooks](#九hooks)
- [十、最佳实践](#十最佳实践)
- [十一、开发工作流](#十一开发工作流)

---

## 🐳 Docker Compose 快速启动

> Sequelize 支持多种数据库，以下提供常用的数据库 Docker Compose 模板。

### PostgreSQL

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: sequelize-postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_password
      POSTGRES_DB: sequelize_db
    restart: unless-stopped
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

```bash
# 启动
docker-compose up -d

# Sequelize 连接配置
# dialect: 'postgres'
# host: 'localhost'
# port: 5432
# username: 'postgres'
# password: 'postgres_password'
# database: 'sequelize_db'
```

### MySQL

```yaml
# docker-compose-mysql.yml
version: '3.8'

services:
  mysql:
    image: mysql:8
    container_name: sequelize-mysql
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: sequelize_db
      MYSQL_USER: sequelize_user
      MYSQL_PASSWORD: sequelize_password
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql_data:
```

```bash
# Sequelize 连接配置
# dialect: 'mysql'
# host: 'localhost'
# port: 3306
# username: 'sequelize_user'
# password: 'sequelize_password'
# database: 'sequelize_db'
```

---

## 一、基础概念

### 1.1 什么是 Sequelize

Sequelize 是一个基于 Promise 的 Node.js ORM，支持 PostgreSQL、MySQL、SQLite 和 SQL Server。

### 1.2 安装

```bash
npm install sequelize
npm install pg pg-hstore  # PostgreSQL
# 或
npm install mysql2        # MySQL
# 或
npm install sqlite3       # SQLite
# 或
npm install tedious       # SQL Server
```

### 1.3 初始化连接

```javascript
const { Sequelize } = require('sequelize')

// 方式1: 连接字符串
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres', // 'mysql' | 'sqlite' | 'mssql'
})

// 方式2: URI
const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname')

// 方式3: 配置对象
const sequelize = new Sequelize({
  database: 'dbname',
  username: 'user',
  password: 'pass',
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})

// 测试连接
try {
  await sequelize.authenticate()
  console.log('Connection established')
} catch (error) {
  console.error('Unable to connect:', error)
}
```

---

## 二、模型定义

> 模型（Model）是 Sequelize 的核心，它映射数据库中的一张表，定义了表的字段、数据类型、约束、验证规则等。
> Sequelize 提供两种定义模型的方式：`Model.init()`（推荐）和 `sequelize.define()`。

### 2.1 基本模型（Model.init 语法）

这是官方推荐的定义方式，更清晰、更符合 ES6 类语法：

```javascript
const { Model, DataTypes } = require('sequelize')

// ---- 定义模型类 ----
class User extends Model {}

// ---- 初始化模型 ----
User.init(
  {
    // ========== 主键字段 ==========
    id: {
      type: DataTypes.INTEGER, // 整数类型
      autoIncrement: true, // 自增（每次插入自动 +1）
      primaryKey: true, // 标记为主键
    },

    // ========== 字符串字段 ==========
    username: {
      type: DataTypes.STRING, // VARCHAR(255)
      allowNull: false, // 不允许为 null
      unique: true, // 唯一约束，数据库层面保证不重复
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true, // 内置验证器：必须是合法的邮箱格式
      },
    },

    // ========== 数字字段 ==========
    age: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // 默认值，插入时不提供则自动填充
    },

    // ========== 布尔字段 ==========
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // 默认激活
    },

    // ========== 日期字段 ==========
    lastLoginAt: {
      type: DataTypes.DATE, // DATETIME 类型（包含时间）
      allowNull: true, // 允许为空
    },
  },
  {
    // ========== 模型配置选项 ==========
    sequelize, // 传入 Sequelize 实例（必需）
    modelName: 'User', // 模型名称（单数，用于代码中引用）
    tableName: 'users', // 数据库表名（复数，实际创建的表名）
    timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
  },
)
```

### 2.2 define 语法

另一种定义方式，功能与 `Model.init()` 等价，写法更紧凑：

```javascript
const User = sequelize.define(
  'User', // 模型名称
  {
    // ---- 字段定义（与 Model.init 第一个参数相同） ----
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
    },
  },
  {
    // ---- 模型选项（与 Model.init 第二个参数相同） ----
    timestamps: true, // 自动添加 createdAt / updatedAt
    paranoid: true, // 开启软删除，添加 deletedAt 字段（删除时不真正删除，而是设置时间戳）
    underscored: true, // 字段名使用下划线风格（如 created_at 而非 createdAt）
    freezeTableName: true, // 冻结表名，不自动转复数（模型名 = 表名）
    createdAt: 'created_at', // 自定义 createdAt 字段名
    updatedAt: 'updated_at', // 自定义 updatedAt 字段名
    deletedAt: 'deleted_at', // 自定义 deletedAt 字段名（需配合 paranoid: true）
  },
)
```

### 2.3 完整数据类型一览

```javascript
const { DataTypes } = require('sequelize')

// ========== Sequelize 支持的所有数据类型 ==========

// ---- 字符串类型 ----
DataTypes.STRING // VARCHAR(255)         — 默认最大255字符
DataTypes.STRING(128) // VARCHAR(128)        — 指定最大长度
DataTypes.TEXT // TEXT                 — 不限长度，适合存储长文本（文章、描述等）
DataTypes.TEXT('tiny') // TINYTEXT            — MySQL 专属，最大255字节
DataTypes.TEXT('medium') // MEDIUMTEXT          — MySQL 专属，最大16MB
DataTypes.TEXT('long') // LONGTEXT            — MySQL 专属，最大4GB
DataTypes.CITEXT // CITEXT              — 不区分大小写的 TEXT（PostgreSQL）

// ---- 数字类型 ----
DataTypes.INTEGER // INTEGER              — 32位整数
DataTypes.BIGINT // BIGINT               — 64位整数（超出 JS 安全范围时返回字符串）
DataTypes.FLOAT // FLOAT                — 单精度浮点数
DataTypes.DOUBLE // DOUBLE               — 双精度浮点数
DataTypes.DECIMAL(10, 2) // DECIMAL(10,2)       — 精确小数，适合金额计算（如 99999999.99）
DataTypes.DECIMAL(10, 2).UNSIGNED // UNSIGNED DECIMAL   — 无符号精确小数

// ---- 布尔类型 ----
DataTypes.BOOLEAN // BOOLEAN / TINYINT(1)

// ---- 日期类型 ----
DataTypes.DATE // DATETIME / TIMESTAMP  — 包含日期和时间
DataTypes.DATE(6) // DATETIME(6)           — 毫秒精度
DataTypes.DATEONLY // DATE                — 仅日期，不含时间

// ---- 二进制类型 ----
DataTypes.BLOB // BLOB                — 二进制大对象（文件、图片等）
DataTypes.BLOB('tiny') // TINYBLOB            — MySQL 专属
DataTypes.BLOB('long') // LONGBLOB            — MySQL 专属

// ---- 唯一标识 ----
DataTypes.UUID // UUID 字符串（如 '6f74a084-...'）
DataTypes.UUIDV1 // UUIDv1 默认值生成器
DataTypes.UUIDV4 // UUIDv4 默认值生成器（随机）

// ---- JSON 类型 ----
DataTypes.JSON // JSON                — 存储 JSON 数据（MySQL/PostgreSQL/SQLite）
DataTypes.JSONB // JSONB               — PostgreSQL 专属，支持索引和高效查询

// ---- 枚举类型 ----
DataTypes.ENUM('value1', 'value2') // ENUM — 只允许指定的值

// ---- 数组类型（PostgreSQL 专属） ----
DataTypes.ARRAY(DataTypes.STRING) // TEXT[]             — 字符串数组
DataTypes.ARRAY(DataTypes.INTEGER) // INTEGER[]          — 整数数组

// ---- 虚拟字段 ----
DataTypes.VIRTUAL // 不会存储到数据库，适合计算字段
```

### 2.4 字段选项详解

每个字段都可以配置以下选项，用于控制约束、默认值、验证等行为：

```javascript
const demoSchema = {
  // ========== 字符串字段示例 ==========
  username: {
    type: DataTypes.STRING(50), // VARCHAR(50)，指定最大长度50
    allowNull: false, // 不允许为 null（数据库 NOT NULL 约束）
    unique: true, // 唯一约束（数据库层面保证不重复）
    defaultValue: 'anonymous', // 默认值
    comment: '用户名', // 字段注释（会同步到数据库表结构中）
    field: 'user_name', // 指定数据库中的实际列名（与代码中的属性名不同）
    validate: {
      // ---- 内置验证器 ----
      notEmpty: { msg: '用户名不能为空' }, // 不允许空字符串
      len: { args: [4, 30], msg: '用户名长度必须在4-30之间' }, // 长度限制
      isAlphanumeric: { msg: '用户名只能包含字母和数字' }, // 只允许字母数字
      is: /^[a-zA-Z0-9_]+$/i, // 自定义正则匹配
      notIn: [['admin', 'root']], // 排除特定值
    },
  },

  // ========== 邮箱字段示例 ==========
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'unique_email', // 自定义唯一约束名称
      msg: '该邮箱已被注册', // 违反唯一约束时的错误信息
    },
    validate: {
      isEmail: { msg: '请输入合法的邮箱地址' }, // 内置邮箱验证
      isLowercase: true, // 要求小写（配合 setter 使用更佳）
    },
    set(value) {
      // 自定义 setter：存储前自动转小写
      this.setDataValue('email', value.toLowerCase())
    },
  },

  // ========== 密码字段示例 ==========
  password: {
    type: DataTypes.STRING(255), // 存储哈希后的密码
    allowNull: false,
    validate: {
      len: { args: [8, 100], msg: '密码至少8位' },
      isValidPassword(value) {
        // 自定义验证器
        if (!/[A-Z]/.test(value)) {
          throw new Error('密码必须包含大写字母')
        }
        if (!/[0-9]/.test(value)) {
          throw new Error('密码必须包含数字')
        }
      },
    },
  },

  // ========== 数字字段示例 ==========
  age: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // 默认值
    validate: {
      min: { args: [0], msg: '年龄不能为负数' }, // 最小值
      max: { args: [150], msg: '年龄不能超过150' }, // 最大值
      isInt: { msg: '年龄必须为整数' }, // 必须是整数
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2), // DECIMAL(10,2)，精确小数，适合金额
    defaultValue: 0.0,
    validate: {
      min: { args: [0], msg: '价格不能为负数' },
      isDecimal: { msg: '价格必须为小数' },
    },
  },

  // ========== 枚举字段示例 ==========
  role: {
    type: DataTypes.ENUM('user', 'admin', 'moderator'), // 只允许指定的值
    defaultValue: 'user', // 默认角色
    validate: {
      isIn: {
        args: [['user', 'admin', 'moderator']], // 再次验证（双重保障）
        msg: '无效的角色类型',
      },
    },
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'banned'),
    defaultValue: 'active',
  },

  // ========== 日期字段示例 ==========
  birthday: {
    type: DataTypes.DATEONLY, // 仅存储日期（YYYY-MM-DD），不含时间
    allowNull: true,
  },
  lastLoginAt: {
    type: DataTypes.DATE, // 存储完整日期时间
    allowNull: true,
  },

  // ========== 布尔字段示例 ==========
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // 默认未验证
  },

  // ========== JSON 字段示例 ==========
  preferences: {
    type: DataTypes.JSON, // 存储 JSON 对象
    defaultValue: {}, // 默认空对象
    // 示例值: { theme: 'dark', language: 'zh-CN', notifications: true }
  },

  // ========== UUID 字段示例 ==========
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // 自动生成 UUIDv4
    unique: true,
  },

  // ========== 虚拟字段示例 ==========
  fullName: {
    type: DataTypes.VIRTUAL, // 不会存入数据库
    get() {
      // 读取时动态计算
      return `${this.firstName} ${this.lastName}`
    },
    set(value) {
      throw new Error('Do not try to set the `fullName` value!') // 禁止写入
    },
  },
}
```

### 2.5 模型全局选项

模型的第三个参数（`define` 语法）或 `Model.init` 的第二个参数，用于配置模型级行为：

```javascript
{
  sequelize,               // Sequelize 实例（必需）
  modelName: 'User',       // 模型名称
  tableName: 'users',      // 数据库表名（不指定则默认取 modelName 的复数小写形式）

  // ---- 时间戳 ----
  timestamps: true,        // 自动添加 createdAt 和 updatedAt（默认 true）
  createdAt: 'created_at', // 自定义 createdAt 字段名（默认 'createdAt'）
  updatedAt: 'updated_at', // 自定义 updatedAt 字段名（默认 'updatedAt'）

  // ---- 软删除 ----
  paranoid: true,          // 开启软删除，自动添加 deletedAt 字段
  deletedAt: 'deleted_at', // 自定义 deletedAt 字段名

  // ---- 命名风格 ----
  underscored: true,       // 所有字段使用下划线命名（如 first_name 而非 firstName）
  freezeTableName: true,   // 冻结表名，不自动转复数

  // ---- 版本控制 ----
  version: true,           // 添加 version 字段，每次更新自动 +1（乐观锁）

  // ---- 默认作用域 ----
  defaultScope: {
    attributes: { exclude: ['password'] }, // 查询时默认排除密码字段
  },

  // ---- 命名作用域（可复用的查询条件） ----
  scopes: {
    active: { where: { isActive: true } }, // User.scope('active').findAll()
    admins: { where: { role: 'admin' } }, // User.scope('admins').findAll()
    recent: { order: [['createdAt', 'DESC']], limit: 10 }, // 最近10条
    withPosts: { include: [{ model: Post }] }, // 包含关联数据
  },

  // ---- 索引 ----
  indexes: [
    { fields: ['email'], unique: true }, // 唯一索引
    { fields: ['lastName', 'firstName'] }, // 复合索引
    { fields: ['createdAt'], name: 'idx_created_at' }, // 命名索引
  ],

  // ---- 引擎与字符集（MySQL） ----
  engine: 'InnoDB', // 存储引擎
  charset: 'utf8mb4', // 字符集（支持 emoji）
  collate: 'utf8mb4_unicode_ci', // 排序规则

  // ---- 模型级别验证 ----
  validate: {
    // 跨字段验证（this 指向模型实例）
    eitherNameOrEmail() {
      if (!this.username && !this.email) {
        throw new Error('用户名或邮箱至少提供一个')
      }
    },
  },

  // ---- Hooks ----
  hooks: {
    beforeCreate: async (user) => {
      // 创建前自动加密密码
      if (user.password) {
        user.password = await hashPassword(user.password)
      }
    },
  },
}
```

### 2.6 Getter 与 Setter

可以在字段级别定义自定义的读取/写入逻辑：

```javascript
const User = sequelize.define('User', {
  // ---- getter：读取时自动转换 ----
  firstName: {
    type: DataTypes.STRING,
    get() {
      // this.getDataValue() 获取原始值
      const raw = this.getDataValue('firstName')
      return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw
    },
  },
  lastName: {
    type: DataTypes.STRING,
  },

  // ---- setter：写入时自动转换 ----
  email: {
    type: DataTypes.STRING,
    set(value) {
      // this.setDataValue() 设置实际存储值
      this.setDataValue('email', value.toLowerCase().trim())
    },
  },

  // ---- 虚拟字段：不存储，动态计算 ----
  fullName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.firstName} ${this.lastName}`
    },
    set(value) {
      const [first, ...rest] = value.split(' ')
      this.setDataValue('firstName', first)
      this.setDataValue('lastName', rest.join(' '))
    },
  },

  // ---- 标签数组：存储为 JSON，代码中操作为数组 ----
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const raw = this.getDataValue('tags')
      return Array.isArray(raw) ? raw : []
    },
  },
})

// 使用示例
const user = User.build({ firstName: 'john', lastName: 'doe', email: 'John@Example.COM' })
console.log(user.firstName) // "John"  （getter 自动首字母大写）
console.log(user.email) // "john@example.com"  （setter 自动转小写）
console.log(user.fullName) // "John Doe"  （虚拟字段动态计算）
```

### 2.7 实例方法、静态方法与类方法

```javascript
class User extends Model {}

User.init(
  {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: { type: DataTypes.ENUM('user', 'admin'), default: 'user' },
  },
  { sequelize, modelName: 'User' },
)

// ---- 实例方法：每个模型实例都可以调用 ----
User.prototype.checkPassword = async function (password) {
  // this 指向当前实例
  return await bcrypt.compare(password, this.password)
}

User.prototype.toJSON = function () {
  const values = { ...this.get() }
  delete values.password // 序列化时隐藏密码
  return values
}

// ---- 静态方法 / 类方法：直接通过 Model 调用 ----
User.findByEmail = async function (email) {
  return await User.findOne({ where: { email } })
}

User.findActiveAdmins = async function () {
  return await User.findAll({ where: { role: 'admin', isActive: true } })
}

// 使用示例
// 实例方法: const user = await User.findByPk(1); await user.checkPassword('123')
// 静态方法: const user = await User.findByEmail('test@example.com')
```

---

## 三、数据验证

### 3.1 内置验证器

```javascript
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    validate: {
      notEmpty: { msg: 'Username cannot be empty' },
      len: { args: [4, 20], msg: 'Username must be 4-20 chars' },
    },
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: { msg: 'Invalid email' },
    },
  },
  age: {
    type: DataTypes.INTEGER,
    validate: {
      min: { args: [0], msg: 'Age must be positive' },
      max: { args: [150], msg: 'Age must be less than 150' },
    },
  },
})
```

### 3.2 自定义验证

```javascript
const User = sequelize.define('User', {
  password: {
    type: DataTypes.STRING,
    validate: {
      isValidPassword(value) {
        if (value.length < 8) {
          throw new Error('Password must be at least 8 characters')
        }
        if (!/[A-Z]/.test(value)) {
          throw new Error('Password must contain uppercase letter')
        }
      },
    },
  },
})
```

### 3.3 模型级别验证

```javascript
const User = sequelize.define(
  'User',
  {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
  },
  {
    validate: {
      eitherFirstNameOrLastName() {
        if (!this.firstName && !this.lastName) {
          throw new Error('Either firstName or lastName is required')
        }
      },
    },
  },
)
```

---

## 四、关联关系

### 4.1 一对一

```javascript
const User = sequelize.define('User', {
  /* ... */
})
const Profile = sequelize.define('Profile', {
  /* ... */
})

// User has one Profile
User.hasOne(Profile, {
  foreignKey: 'userId',
  as: 'profile',
})

// Profile belongs to User
Profile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
})
```

### 4.2 一对多

```javascript
const User = sequelize.define('User', {
  /* ... */
})
const Post = sequelize.define('Post', {
  /* ... */
})

// User has many Posts
User.hasMany(Post, {
  foreignKey: 'authorId',
  as: 'posts',
})

// Post belongs to User
Post.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author',
})
```

### 4.3 多对多

```javascript
const User = sequelize.define('User', {
  /* ... */
})
const Project = sequelize.define('Project', {
  /* ... */
})

// 通过中间表
User.belongsToMany(Project, {
  through: 'UserProjects',
  as: 'projects',
  foreignKey: 'userId',
})

Project.belongsToMany(User, {
  through: 'UserProjects',
  as: 'users',
  foreignKey: 'projectId',
})

// 或使用模型
const UserProject = sequelize.define('UserProject', {
  role: DataTypes.STRING,
})

User.belongsToMany(Project, { through: UserProject })
Project.belongsToMany(User, { through: UserProject })
```

### 4.4 查询关联

```javascript
// 包含关联数据
const user = await User.findByPk(1, {
  include: [
    {
      model: Profile,
      as: 'profile',
    },
  ],
})

// 嵌套包含
const user = await User.findByPk(1, {
  include: [
    {
      model: Post,
      as: 'posts',
      include: [
        {
          model: Comment,
          as: 'comments',
        },
      ],
    },
  ],
})
```

---

## 五、CRUD 操作

### 5.1 创建

```javascript
// 创建单条记录
const user = await User.create({
  username: 'john',
  email: 'john@example.com',
  age: 25,
})

// 批量创建
const users = await User.bulkCreate([
  { username: 'alice', email: 'alice@example.com' },
  { username: 'bob', email: 'bob@example.com' },
])

// 创建或更新
const [user, created] = await User.findOrCreate({
  where: { username: 'john' },
  defaults: {
    email: 'john@example.com',
    age: 25,
  },
})

if (created) {
  console.log('Created new user')
} else {
  console.log('User already exists')
}
```

### 5.2 读取

```javascript
// 查找所有
const users = await User.findAll()

// 查找单条（主键）
const user = await User.findByPk(1)

// 查找第一条
const user = await User.findOne({
  where: { username: 'john' },
})

// 带条件查找
const users = await User.findAll({
  where: {
    age: { [Op.gt]: 18 },
  },
})

// 计数
const count = await User.count({
  where: { isActive: true },
})

// 检查是否存在
const exists =
  (await User.count({
    where: { email: 'test@example.com' },
  })) > 0
```

### 5.3 更新

```javascript
// 更新实例
const user = await User.findByPk(1)
user.username = 'newname'
await user.save()

// 直接更新
await User.update({ username: 'newname' }, { where: { id: 1 } })

// 增量更新
await User.increment({ age: 1 }, { where: { id: 1 } })

// 批量更新
await User.update(
  { isActive: false },
  { where: { lastLogin: { [Op.lt]: new Date('2023-01-01') } } },
)
```

### 5.4 删除

```javascript
// 删除实例
const user = await User.findByPk(1)
await user.destroy()

// 直接删除
await User.destroy({
  where: { id: 1 },
})

// 批量删除
await User.destroy({
  where: { isActive: false },
})

// 软删除（需要 paranoid: true）
await User.destroy({
  where: { id: 1 },
})

// 恢复软删除
await User.restore({
  where: { id: 1 },
})
```

---

## 六、查询操作

### 6.1 操作符

```javascript
const { Op } = require('sequelize');

// 等于
{ id: 1 }
{ id: { [Op.eq]: 1 } }

// 不等于
{ id: { [Op.ne]: 1 } }

// 大于/小于
{ age: { [Op.gt]: 18 } }
{ age: { [Op.gte]: 18 } }
{ age: { [Op.lt]: 65 } }
{ age: { [Op.lte]: 65 } }

// 之间
{ age: { [Op.between]: [18, 65] } }

// 在列表中
{ id: { [Op.in]: [1, 2, 3] } }
{ id: { [Op.notIn]: [4, 5] } }

// LIKE
{ name: { [Op.like]: '%John%' } }
{ name: { [Op.iLike]: '%john%' } } // 不区分大小写

// 以...开头/结尾
{ email: { [Op.startsWith]: 'admin' } }
{ email: { [Op.endsWith]: '.com' } }
{ email: { [Op.substring]: 'example' } }

// IS NULL / NOT NULL
{ deletedAt: { [Op.is]: null } }
{ deletedAt: { [Op.not]: null } }

// AND / OR
{
  [Op.and]: [
    { age: { [Op.gt]: 18 } },
    { isActive: true }
  ]
}

{
  [Op.or]: [
    { role: 'admin' },
    { role: 'moderator' }
  ]
}
```

### 6.2 排序

```javascript
const users = await User.findAll({
  order: [
    ['createdAt', 'DESC'],
    ['username', 'ASC'],
  ],
})

// 嵌套排序
const users = await User.findAll({
  include: [Post],
  order: [[Post, 'createdAt', 'DESC']],
})
```

### 6.3 分页

```javascript
const page = 1
const limit = 10
const offset = (page - 1) * limit

const { count, rows } = await User.findAndCountAll({
  limit,
  offset,
  order: [['createdAt', 'DESC']],
})

console.log(`Total: ${count}, Pages: ${Math.ceil(count / limit)}`)
```

### 6.4 选择字段

```javascript
// 只选择特定字段
const users = await User.findAll({
  attributes: ['id', 'username', 'email'],
})

// 排除字段
const users = await User.findAll({
  attributes: { exclude: ['password'] },
})

// 重命名字段
const users = await User.findAll({
  attributes: [
    'id',
    ['username', 'name'],
    [sequelize.fn('UPPER', sequelize.col('username')), 'upperName'],
  ],
})
```

### 6.5 聚合

```javascript
// 计数
const count = await User.count()

// 最大值
const maxAge = await User.max('age')

// 最小值
const minAge = await User.min('age')

// 求和
const totalAge = await User.sum('age')

// 平均值
const avgAge = await User.avg('age')

// 分组
const result = await User.findAll({
  attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
  group: ['role'],
})
```

### 6.6 原始查询

```javascript
// 原始 SQL
const [results, metadata] = await sequelize.query('SELECT * FROM users WHERE age > :age', {
  replacements: { age: 18 },
  type: sequelize.QueryTypes.SELECT,
})

// 其他查询类型
await sequelize.query('UPDATE users SET active = false', {
  type: sequelize.QueryTypes.UPDATE,
})
```

---

## 七、事务处理

### 7.1 托管事务

```javascript
try {
  await sequelize.transaction(async (t) => {
    const user = await User.create(
      {
        username: 'john',
      },
      { transaction: t },
    )

    await Profile.create(
      {
        userId: user.id,
        bio: 'Developer',
      },
      { transaction: t },
    )
  })

  console.log('Transaction committed')
} catch (error) {
  console.log('Transaction rolled back')
}
```

### 7.2 非托管事务

```javascript
const t = await sequelize.transaction()

try {
  const user = await User.create(
    {
      username: 'john',
    },
    { transaction: t },
  )

  await Profile.create(
    {
      userId: user.id,
    },
    { transaction: t },
  )

  await t.commit()
} catch (error) {
  await t.rollback()
}
```

### 7.3 事务隔离级别

```javascript
await sequelize.transaction(
  {
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  },
  async (t) => {
    // 事务逻辑
  },
)
```

---

## 八、迁移管理

### 8.1 CLI 安装

```bash
npm install --save-dev sequelize-cli
```

### 8.2 初始化

```bash
npx sequelize-cli init
```

生成结构：

```
config/
  config.json
models/
  index.js
migrations/
seeders/
```

### 8.3 创建迁移

```bash
npx sequelize-cli migration:generate --name create-users-table
```

```javascript
// migrations/xxx-create-users-table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users')
  },
}
```

### 8.4 运行迁移

#### 执行迁移

```bash
# 执行所有待处理的迁移
npx sequelize-cli db:migrate

# 查看迁移状态（已执行 / 待执行）
npx sequelize-cli db:migrate:status

# 指定环境执行迁移
npx sequelize-cli db:migrate --env production

# 使用自定义配置文件执行迁移
npx sequelize-cli db:migrate --config config/database.js

# 指定 migrations 目录执行迁移
npx sequelize-cli db:migrate --migrations-path ./db/migrations
```

#### 回滚迁移

```bash
# 回滚最后一次迁移
npx sequelize-cli db:migrate:undo

# 回滚最近 N 次迁移
npx sequelize-cli db:migrate:undo --step 3

# 回滚到特定迁移（保留该迁移，回滚其后的所有迁移）
npx sequelize-cli db:migrate:undo --to 20230101000000-create-users.js

# 回滚所有迁移
npx sequelize-cli db:migrate:undo:all

# 回滚到指定环境的初始状态
npx sequelize-cli db:migrate:undo:all --env production
```

#### 生成迁移文件

```bash
# 生成迁移文件
npx sequelize-cli migration:generate --name add-posts-table

# 生成包含具体字段的迁移文件
npx sequelize-cli migration:generate --name add-email-to-users

# 查看待生成的迁移 SQL（不实际执行）
npx sequelize-cli db:migrate --dry-run
```

#### 数据库管理

```bash
# 创建数据库
npx sequelize-cli db:create

# 删除数据库（谨慎使用）
npx sequelize-cli db:drop

# 重新执行所有迁移（先 undo:all 再 migrate）
npx sequelize-cli db:migrate:undo:all && npx sequelize-cli db:migrate
```

### 8.5 种子数据

```bash
npx sequelize-cli seed:generate --name demo-users
```

```javascript
// seeders/xxx-demo-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        username: 'admin',
        email: 'admin@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'user',
        email: 'user@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {})
  },
}
```

```bash
# 运行种子
npx sequelize-cli db:seed:all

# 回滚种子
npx sequelize-cli db:seed:undo:all
```

---

## 九、Hooks

### 9.1 模型 Hooks

```javascript
User.beforeCreate((user, options) => {
  // 创建前
  user.password = hashPassword(user.password)
})

User.afterCreate((user, options) => {
  // 创建后
  console.log('User created:', user.id)
})

User.beforeUpdate((user, options) => {
  // 更新前
  if (user.changed('password')) {
    user.password = hashPassword(user.password)
  }
})

User.afterDestroy((user, options) => {
  // 删除后
  console.log('User deleted:', user.id)
})
```

### 9.2 可用 Hooks

```javascript
// 生命周期 Hooks
beforeValidate
afterValidate
validationFailed

beforeCreate
afterCreate

beforeUpdate
afterUpdate

beforeDestroy
afterDestroy

beforeRestore
afterRestore

beforeBulkCreate
afterBulkCreate

beforeBulkUpdate
afterBulkUpdate

beforeBulkDestroy
afterBulkDestroy
```

### 9.3 异步 Hooks

```javascript
User.beforeCreate(async (user, options) => {
  const avatar = await uploadToS3(user.avatar)
  user.avatarUrl = avatar.url
})
```

---

## 十、最佳实践

### 10.1 项目结构

```
src/
├── config/
│   └── database.js
├── models/
│   ├── index.js
│   ├── user.js
│   └── post.js
├── migrations/
├── seeders/
└── services/
    ├── user.service.js
    └── post.service.js
```

### 10.2 模型组织

```javascript
// models/index.js
const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const config = require('../config/database')[env]

const db = {}

let sequelize
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config)
}

fs.readdirSync(__dirname)
  .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model
  })

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
```

### 10.3 连接池配置

```javascript
{
  pool: {
    max: 10,        // 最大连接数
    min: 0,         // 最小连接数
    acquire: 30000, // 获取连接超时时间
    idle: 10000     // 连接空闲超时时间
  }
}
```

### 10.4 性能优化

```javascript
// 使用索引
User.init({
  email: {
    type: DataTypes.STRING,
    index: true,
  },
})

// 复合索引
User.init(
  {},
  {
    indexes: [
      {
        fields: ['lastName', 'firstName'],
      },
    ],
  },
)

// 避免 N+1 查询
const users = await User.findAll({
  include: [Post],
})

// 只选择需要的字段
const users = await User.findAll({
  attributes: ['id', 'username'],
})
```

### 10.5 错误处理

```javascript
try {
  await User.create({ username: 'test' })
} catch (error) {
  if (error instanceof Sequelize.UniqueConstraintError) {
    console.log('Duplicate entry')
  } else if (error instanceof Sequelize.ValidationError) {
    console.log('Validation failed:', error.errors)
  } else {
    console.error('Database error:', error)
  }
}
```

### 10.6 日志记录

```javascript
const sequelize = new Sequelize(database, username, password, {
  logging: (sql, timing) => {
    console.log(`[${timing}ms] ${sql}`)
  },
  benchmark: true,
})
```

---

## 十一、开发工作流

### 11.1 开发流程总览

> Sequelize 采用 **Migration-First** 的开发模式：先定义模型，再通过 sequelize-cli 生成迁移文件，确保数据库结构与代码同步。

```
┌─────────────────────────────────────────────────────────────────┐
│                  Sequelize 开发工作流总览                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ① 定义/修改 Model（models/*.js）                               │
│       ↓                                                         │
│  ② 生成迁移文件（sequelize-cli migration:generate）              │
│       ↓                                                         │
│  ③ 编写迁移 up/down 逻辑                                        │
│       ↓                                                         │
│  ④ 执行迁移（sequelize-cli db:migrate）                          │
│       ↓                                                         │
│  ⑤ 编写业务代码（Service / Controller）                          │
│       ↓                                                         │
│  ⑥ 提交 Model + migrations/ + seeders/ 到 Git                   │
│       ↓                                                         │
│  ⑦ 生产环境: db:migrate --env production                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 日常开发工作流

```bash
# ===== 第一步：初始化项目（仅首次） =====
mkdir my-app && cd my-app
npm init -y
npm install sequelize pg pg-hstore   # PostgreSQL
npm install -D sequelize-cli nodemon dotenv

# ===== 第二步：初始化 Sequelize 目录结构 =====
npx sequelize-cli init
# 生成：config/ models/ migrations/ seeders/

# ===== 第三步：配置数据库连接 =====
# 编辑 config/config.json 或使用环境变量

# ===== 第四步：启动本地数据库 =====
docker-compose up -d

# ===== 第五步：创建数据库 =====
npx sequelize-cli db:create

# ===== 第六步：生成模型 + 迁移文件 =====
npx sequelize-cli model:generate --name User --attributes username:string,email:string,age:integer
# 自动生成：
#   models/user.js          → 模型定义
#   migrations/xxx-create-user.js → 迁移文件

# ===== 第七步：执行迁移 =====
npx sequelize-cli db:migrate

# ===== 第八步：填充种子数据（可选） =====
npx sequelize-cli seed:generate --name demo-users
npx sequelize-cli db:seed:all

# ===== 第九步：开发调试 =====
npx nodemon src/app.js

# ===== 第十步：提交到版本控制 =====
git add models/ migrations/ seeders/ config/
git commit -m "feat: add user model with migration"
```

### 11.3 迁移工作流详解

```bash
# ===== 新增表 =====
npx sequelize-cli migration:generate --name create-posts-table
# 编辑迁移文件，编写 createTable 逻辑
npx sequelize-cli db:migrate

# ===== 修改表（添加字段） =====
npx sequelize-cli migration:generate --name add-avatar-to-users
# 编辑迁移文件：
#   up:   queryInterface.addColumn('Users', 'avatar', { type: Sequelize.STRING })
#   down: queryInterface.removeColumn('Users', 'avatar')
npx sequelize-cli db:migrate

# ===== 修改表（修改字段类型） =====
npx sequelize-cli migration:generate --name change-bio-to-text
# 编辑迁移文件：
#   up:   queryInterface.changeColumn('Users', 'bio', { type: Sequelize.TEXT })
#   down: queryInterface.changeColumn('Users', 'bio', { type: Sequelize.STRING })
npx sequelize-cli db:migrate

# ===== 添加索引 =====
npx sequelize-cli migration:generate --name add-index-users-email
# 编辑迁移文件：
#   up:   queryInterface.addIndex('Users', ['email'], { unique: true })
#   down: queryInterface.removeIndex('Users', ['email'])
npx sequelize-cli db:migrate

# ===== 回滚操作 =====
npx sequelize-cli db:migrate:undo              # 回滚最近一次
npx sequelize-cli db:migrate:undo --step 3     # 回滚最近 3 次
npx sequelize-cli db:migrate:undo:all          # 回滚所有（仅开发环境）

# ===== 查看迁移状态 =====
npx sequelize-cli db:migrate:status
```

### 11.4 生产部署工作流

```bash
# ===== 生产环境部署步骤 =====

# 1. 安装依赖
npm ci --only=production

# 2. 执行迁移（指定生产环境配置）
npx sequelize-cli db:migrate --env production

# 3. 启动应用
node src/app.js
```

```javascript
// config/config.js（推荐用 JS 替代 JSON，支持环境变量）
require('dotenv').config()

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres_password',
    database: process.env.DB_NAME || 'sequelize_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres_password',
    database: 'sequelize_db_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
}
```

```dockerfile
# Dockerfile 示例
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/models ./models
COPY --from=builder /app/config ./config
COPY --from=builder /app/migrations ./migrations

# 启动时执行迁移
CMD ["sh", "-c", "npx sequelize-cli db:migrate --env production && node src/app.js"]
```

### 11.5 团队协作工作流

```bash
# ===== 场景 A：拉取同事的迁移 =====
git pull origin main
npm install
npx sequelize-cli db:migrate
# 自动检测并执行新的迁移文件

# ===== 场景 B：迁移冲突解决 =====
# 1. 解决 migrations/ 目录的 Git 冲突（迁移文件不应修改，只应新增）
# 2. 如果本地已执行了冲突迁移：
npx sequelize-cli db:migrate:undo --step 1   # 回滚本地迁移
git pull origin main                          # 拉取正确版本
npx sequelize-cli db:migrate                  # 重新执行

# ===== 场景 C：新成员加入项目 =====
git clone <repo>
npm install
# 配置 .env 或 config/config.js 中的数据库连接
docker-compose up -d                          # 启动本地数据库
npx sequelize-cli db:create                   # 创建数据库
npx sequelize-cli db:migrate                  # 执行所有历史迁移
npx sequelize-cli db:seed:all                 # 填充种子数据
npx nodemon src/app.js                        # 启动开发服务器

# ===== 场景 D：重置开发数据库 =====
npx sequelize-cli db:migrate:undo:all         # 回滚所有迁移
npx sequelize-cli db:migrate                  # 重新执行所有迁移
npx sequelize-cli db:seed:all                 # 重新填充种子
# 或更彻底：
npx sequelize-cli db:drop && npx sequelize-cli db:create && npx sequelize-cli db:migrate
```

### 11.6 CI/CD 集成工作流

```yaml
# .github/workflows/sequelize.yml
name: Sequelize CI

on:
  pull_request:
    paths:
      - 'models/**'
      - 'migrations/**'
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        ports:
          - 5432:5432
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres_password
          POSTGRES_DB: sequelize_db_test
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - name: Run Migrations
        run: npx sequelize-cli db:migrate --env test
        env:
          DB_HOST: localhost
          DB_USER: postgres
          DB_PASS: postgres_password
      - name: Run Tests
        run: npm test
        env:
          NODE_ENV: test
          DB_HOST: localhost
          DB_USER: postgres
          DB_PASS: postgres_password

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
      - name: Run Migrations
        run: npx sequelize-cli db:migrate --env production
        env:
          DB_HOST: ${{ secrets.DB_HOST }}
          DB_USER: ${{ secrets.DB_USER }}
          DB_PASS: ${{ secrets.DB_PASS }}
          DB_NAME: ${{ secrets.DB_NAME }}
```

### 11.7 迁移故障排查

```bash
# ===== 迁移失败后的恢复流程 =====

# 1. 查看迁移状态
npx sequelize-cli db:migrate:status

# 2. 开发环境：回滚后重试
npx sequelize-cli db:migrate:undo --step 1
# 修复迁移文件后重新执行
npx sequelize-cli db:migrate

# 3. 生产环境：手动修复
#    a) 查看失败的迁移 SQL
#    b) 手动在数据库执行修复 SQL
#    c) 创建新迁移修复（不要修改已执行的迁移文件）
npx sequelize-cli migration:generate --name fix-broken-migration
npx sequelize-cli db:migrate

# ===== 常见问题速查 =====
# SequelizeDatabaseError        → SQL 语法错误或表/字段不存在
# SequelizeUniqueConstraintError → 唯一约束冲突，检查重复数据
# SequelizeValidationError      → 模型验证失败，检查字段规则
# SequelizeConnectionError      → 数据库连接失败，检查配置和网络
# SequelizeTimeoutError         → 查询超时，检查慢查询或连接池
# Migration overlap conflict    → 迁移时间戳冲突，重命名迁移文件时间戳
```

### 11.8 工作流命令速查表

| 阶段 | 命令 | 说明 |
|------|------|------|
| 初始化 | `npx sequelize-cli init` | 创建目录结构 |
| 创建数据库 | `npx sequelize-cli db:create` | 创建数据库 |
| 生成模型+迁移 | `npx sequelize-cli model:generate --name X --attributes ...` | 一键生成模型和迁移 |
| 生成迁移 | `npx sequelize-cli migration:generate --name X` | 仅生成迁移文件 |
| 执行迁移 | `npx sequelize-cli db:migrate` | 应用所有待执行迁移 |
| 迁移状态 | `npx sequelize-cli db:migrate:status` | 查看已执行/待执行 |
| 回滚迁移 | `npx sequelize-cli db:migrate:undo` | 回滚最近一次 |
| 回滚 N 次 | `npx sequelize-cli db:migrate:undo --step N` | 回滚最近 N 次 |
| 回滚所有 | `npx sequelize-cli db:migrate:undo:all` | 全部回滚（仅开发） |
| 种子数据 | `npx sequelize-cli db:seed:all` | 执行所有种子 |
| 回滚种子 | `npx sequelize-cli db:seed:undo:all` | 回滚所有种子 |
| 生产迁移 | `npx sequelize-cli db:migrate --env production` | 生产环境执行迁移 |
| 预览 SQL | `npx sequelize-cli db:migrate --dry-run` | 预览不执行 |
| 重置数据库 | `db:drop → db:create → db:migrate → db:seed:all` | 完全重建（仅开发） |

---

## 附录

### A. 常用命令

```bash
# ──── 数据库管理 ────
npx sequelize-cli db:create                    # 创建数据库
npx sequelize-cli db:drop                      # 删除数据库

# ──── 迁移 ────
npx sequelize-cli db:migrate                   # 执行所有待处理迁移
npx sequelize-cli db:migrate:status            # 查看迁移状态
npx sequelize-cli db:migrate:undo              # 回滚最后一次迁移
npx sequelize-cli db:migrate:undo --step N     # 回滚最近 N 次迁移
npx sequelize-cli db:migrate:undo:all          # 回滚所有迁移
npx sequelize-cli db:migrate --env production  # 指定环境执行迁移
npx sequelize-cli db:migrate --dry-run         # 预览迁移 SQL（不实际执行）

# ──── 种子数据 ────
npx sequelize-cli db:seed:all                  # 执行所有种子数据
npx sequelize-cli db:seed:undo                 # 回滚最后一次种子
npx sequelize-cli db:seed:undo --step N        # 回滚最近 N 次种子
npx sequelize-cli db:seed:undo:all             # 回滚所有种子数据
npx sequelize-cli db:seed --seed <seed-file>   # 执行指定种子文件

# ──── 代码生成 ────
npx sequelize-cli model:generate --name User --attributes name:string,email:string       # 生成模型 + 迁移
npx sequelize-cli migration:generate --name migration-name                               # 仅生成迁移文件
npx sequelize-cli seed:generate --name seed-name                                         # 仅生成种子文件

# ──── 配置与诊断 ────
npx sequelize-cli db:migrate --config config/database.js                                 # 使用自定义配置文件
npx sequelize-cli db:migrate --migrations-path ./db/migrations                           # 指定迁移目录
npx sequelize-cli init                           # 初始化 Sequelize 项目目录结构
npx sequelize-cli init:config                    # 仅初始化配置文件
npx sequelize-cli init:migrations                # 仅初始化 migrations 目录
npx sequelize-cli init:seeders                   # 仅初始化 seeders 目录
npx sequelize-cli init:models                    # 仅初始化 models 目录
```

### B. 有用的资源

- **官方文档**: https://sequelize.org/
- **GitHub**: https://github.com/sequelize/sequelize
- **Awesome Sequelize**: https://github.com/dreams-tech/awesome-sequelize

### C. 学习路线

```
SQL 基础 → Sequelize 基础 → 模型定义 → 关联关系 → 查询操作 → 迁移管理 → 高级特性

1. SQL 和数据库基础
2. Sequelize 安装和配置
3. 模型定义和验证
4. 关联关系（一对一、一对多、多对多）
5. CRUD 操作
6. 查询和过滤
7. 事务处理
8. 迁移和种子
9. Hooks
10. 性能优化
```

---

**祝您 Sequelize 开发愉快！** 🚀
