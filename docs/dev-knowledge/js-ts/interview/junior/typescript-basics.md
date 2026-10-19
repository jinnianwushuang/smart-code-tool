---
title: 'TypeScript 入门：类型注解与基础类型 [P4-P5]'
level: 'junior'
tags: ['TypeScript', '类型注解', '接口', '基础类型']
difficulty: 'medium'
target: 'P4-P5 初级工程师'
---

# TypeScript 入门：类型注解与基础类型 [P4-P5]

> TypeScript 为 JavaScript 添加类型系统，在编译时捕获错误，提升代码质量和开发体验。

## 核心概念（What）

### 基础类型

```typescript
// 原始类型
let name: string = 'Alice'
let age: number = 25
let isActive: boolean = true
let nothing: null = null
let notDefined: undefined = undefined

// 数组
let numbers: number[] = [1, 2, 3]
let names: Array<string> = ['Alice', 'Bob'] // 等价写法

// 对象
let user: { name: string; age: number } = { name: 'Alice', age: 25 }

// 函数
function add(a: number, b: number): number {
  return a + b
}

const greet = (name: string): string => `Hello, ${name}`

// any（任意类型，尽量避免）
let data: any = 'hello'
data = 42 // 不报错（失去类型检查）

// unknown（安全的任意类型）
let value: unknown = 'hello'
// value.toUpperCase(); // 报错！需要先类型检查
if (typeof value === 'string') {
  value.toUpperCase() // ✓ 类型收窄后可以
}

// void（无返回值）
function log(msg: string): void {
  console.log(msg)
}

// 联合类型
let id: string | number = '123'
id = 456 // ✓

// 字面量类型
let direction: 'left' | 'right' | 'up' | 'down'
direction = 'left' // ✓
// direction = 'forward'; // ✗ 报错
```

### 接口（interface）

```typescript
// 定义对象结构
interface User {
  id: number
  name: string
  email?: string // 可选属性
  readonly createdAt: Date // 只读
}

const user: User = {
  id: 1,
  name: 'Alice',
  createdAt: new Date(),
}

// 继承
interface Admin extends User {
  role: string
  permissions: string[]
}

const admin: Admin = {
  id: 1,
  name: 'Admin',
  createdAt: new Date(),
  role: 'super',
  permissions: ['read', 'write', 'delete'],
}
```

### 类型别名（type）

```typescript
// 类型别名
type ID = string | number
type Status = 'pending' | 'active' | 'inactive'
type Callback = (data: string) => void

// 与 interface 的区别：
// ├── interface：只能描述对象形状，支持继承
// ├── type：可以描述任意类型（联合、交叉、元组等）
// └── 对象类型优先用 interface，其他用 type

// 元组
type Pair = [string, number]
const pair: Pair = ['age', 25]

// 交叉类型
type Named = { name: string }
type Aged = { age: number }
type Person = Named & Aged // { name: string; age: number }
```

### 实用技巧

```typescript
// 类型推断（不需要显式标注）
const x = 42 // 推断为 number
const arr = [1, 2, 3] // 推断为 number[]

// as 类型断言
const input = document.getElementById('input') as HTMLInputElement

// 非空断言
const el = document.getElementById('app')! // 告诉 TS 一定存在

// 枚举
enum Color {
  Red, // 0
  Green, // 1
  Blue, // 2
}
const c: Color = Color.Green

// 泛型基础
function identity<T>(arg: T): T {
  return arg
}
identity<string>('hello') // T = string
identity(42) // T = number（自动推断）
```

---

## 底层原理（Why）

### TypeScript 类型系统底层机制

```
TypeScript 的底层原理：

  1. TypeScript 编译器的本质：
     ├── TypeScript 是 JavaScript 的超集（添加了类型系统）
     ├── 编译器（tsc）的作用：
     │   ├── 1. 类型检查：验证代码是否符合类型约束
     │   ├── 2. 类型擦除：移除所有类型注解（生成纯 JavaScript）
     │   └── 3. 语法转换：将新语法转为旧版本（如可选链 ?.）
     └── 关键点：
         ├── TypeScript 只在编译时检查类型
         └── 运行时没有类型信息（完全擦除）

  2. 类型系统的理论基础：
     ├── 结构类型（Structural Typing）：
     │   ├── 关注对象的形状（有哪些属性/方法）
     │   └── 形状兼容即可赋值（不关心名字）
     ├── 名义类型（Nominal Typing）：
     │   ├── 关注类型的名称
     │   └── 必须显式声明继承关系
     └── TypeScript 采用结构类型：
         ├── 更灵活（鸭子类型）
         └── 兼容 JavaScript 的动态特性

  3. 类型推断算法：
     ├── 从右向左推断：
     │   ├── const x = 42 → x 的类型是 number
     │   └── let x = 42 → x 的类型是 number（可变）
     ├── 上下文推断：
     │   ├── 函数参数类型从调用时推断
     │   └── 返回值类型从函数体推断
     └── 泛型推断：
         ├── 从传入的参数推断类型参数
         └── 复杂场景需要显式指定

  4. 类型擦除的影响：
     ├── 运行时无法访问类型信息：
     │   ├── 不能用类型做条件判断（编译时已移除）
     │   └── 不能用类型创建实例（没有构造函数）
     ├── 解决方案：
     │   ├── 使用值（运行时存在）代替类型
     │   └── 使用类型守卫（type guard）进行类型收窄
     └── 理解类型擦除是理解 TypeScript 限制的关键
```

---

## 常见面试题

### Q1: TypeScript 有什么好处？

**答**：编译时类型检查（减少运行时错误）、代码提示更准确、重构更安全、文档化代码。

### Q2: interface 和 type 的区别？

**答**：interface 只能描述对象、支持 extends 继承；type 可以描述任意类型（联合、交叉、元组）。对象类型优先用 interface。

### Q3: any 和 unknown 的区别？

**答**：any 跳过类型检查（不安全）；unknown 需要类型收窄后才能使用（安全）。推荐用 unknown 替代 any。

---

## 延伸练习

1. 用 interface 定义一个 `Product` 类型（名称、价格、库存）
2. 写一个泛型函数 `first<T>(arr: T[]): T`
3. 用联合类型定义一个 `Status` 变量

---

## 参考资料

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript 入门教程](https://ts.xcatliu.com)
