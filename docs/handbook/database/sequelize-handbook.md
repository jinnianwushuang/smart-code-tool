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

### 2.1 基本模型

```javascript
const { Model, DataTypes } = require('sequelize')

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    age: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true, // 自动添加 createdAt 和 updatedAt
  },
)
```

### 2.2 define 语法

```javascript
const User = sequelize.define(
  'User',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    paranoid: true, // 软删除
    underscored: true, // 使用下划线命名
  },
)
```

### 2.3 数据类型

```javascript
DataTypes.STRING // VARCHAR(255)
DataTypes.TEXT // TEXT
DataTypes.INTEGER // INTEGER
DataTypes.BIGINT // BIGINT
DataTypes.FLOAT // FLOAT
DataTypes.DOUBLE // DOUBLE
DataTypes.DECIMAL(10, 2) // DECIMAL
DataTypes.BOOLEAN // BOOLEAN
DataTypes.DATE // DATETIME
DataTypes.DATEONLY // DATE
DataTypes.UUID // UUID
DataTypes.JSON // JSON
DataTypes.JSONB // JSONB (PostgreSQL)
DataTypes.BLOB // BLOB
DataTypes.ENUM('value1', 'value2') // ENUM
```

### 2.4 字段选项

```javascript
{
  type: DataTypes.STRING,
  allowNull: false,           // 是否允许 null
  defaultValue: 'default',    // 默认值
  unique: true,               // 唯一约束
  primaryKey: true,           // 主键
  autoIncrement: true,        // 自增
  comment: '字段说明',         // 注释
  field: 'db_column_name',    // 数据库列名
  validate: {                 // 验证规则
    notEmpty: true,
    len: [4, 10],
    isEmail: true,
    isUrl: true,
    isIP: true,
    isAlpha: true,
    isAlphanumeric: true,
    isNumeric: true,
    min: 10,
    max: 100,
    isIn: [['en', 'zh']],
    notIn: [['admin']],
    isDate: true,
    customValidator(value) {
      if (value < 18) {
        throw new Error('Must be 18 or older');
      }
    }
  }
}
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

```bash
# 执行所有待处理的迁移
npx sequelize-cli db:migrate

# 回滚最后一次迁移
npx sequelize-cli db:migrate:undo

# 回滚所有迁移
npx sequelize-cli db:migrate:undo:all

# 回滚到特定迁移
npx sequelize-cli db:migrate:undo --to 20230101000000-create-users.js
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

## 附录

### A. 常用命令

```bash
# 迁移
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate:status

# 种子
npx sequelize-cli db:seed:all
npx sequelize-cli db:seed:undo:all

# 生成
npx sequelize-cli migration:generate --name migration-name
npx sequelize-cli seed:generate --name seed-name
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
