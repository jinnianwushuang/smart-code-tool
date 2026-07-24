# TypeScript 核心底层原理深度解析

> **版本**: 1.0  
> **最后更新**: 2026-07-25  
> **适用对象**: 高级前端工程师、架构师、对 TypeScript 类型系统 internals 感兴趣的开发者

---

## 📑 目录

- [一、编译器架构概览](#一编译器架构概览)
- [二、结构化类型系统](#二结构化类型系统)
- [三、类型收窄与控制流分析](#三类型收窄与控制流分析)
- [四、泛型与类型推断](#四泛型与类型推断)
- [五、条件类型原理](#五条件类型原理)
- [六、映射类型原理](#六映射类型原理)
- [七、类型兼容性与赋值规则](#七类型兼容性与赋值规则)
- [八、模块解析机制](#八模块解析机制)
- [九、声明文件与类型生态](#九声明文件与类型生态)
- [十、类型擦除与运行时](#十类型擦除与运行时)

---

## 一、编译器架构概览

### 1.1 编译管线

```
源码 (.ts)
    ↓
Scanner (词法扫描)
    ↓
Token 流
    ↓
Parser (语法解析)
    ↓
AST (抽象语法树)
    ↓
Binder (绑定: 建立符号表)
    ↓
Checker (类型检查)
    ↓
类型诊断 / 类型信息
    ↓
Emitter (代码生成)
    ↓
JS + .d.ts + SourceMap
```

### 1.2 核心模块职责

```
src/compiler/
├── scanner.ts       # 词法分析: 源码 → Token
├── parser.ts        # 语法分析: Token → AST
├── binder.ts        # 绑定: AST 节点 → Symbol (符号表)
├── checker.ts       # 类型检查: 核心引擎 (~50000行)
├── emitter.ts       # 输出: AST → JavaScript
└── program.ts       # Program: 编译单元入口

src/core/
└── ...              # 基础工具 (路径、文本、诊断)
```

### 1.3 Program 与编译单元

```typescript
// Program 是编译的顶层入口
interface Program {
  getSourceFiles(): SourceFile[]        // 所有源文件
  getTypeChecker(): TypeChecker          // 类型检查器
  getCompilerOptions(): CompilerOptions  // 编译选项
  emit(): EmitResult                     // 触发输出
}

// 编译流程伪代码
function createProgram(rootNames, options) {
  // 1. 从入口文件出发, 递归解析 import/require
  // 2. 收集所有 .ts / .d.ts / lib.d.ts 文件
  // 3. 构建文件依赖图
  // 4. 创建 TypeChecker 实例
}
```

### 1.4 AST 节点结构

```typescript
// 每个 AST 节点的核心属性
interface Node {
  kind: SyntaxKind          // 节点类型 (200+ 种)
  pos: number               // 起始位置 (含前导空白)
  end: number               // 结束位置
  parent: Node              // 父节点 (Binder 阶段建立)
}

// 示例: const x: number = 42 的 AST
VariableStatement
└── VariableDeclarationList
    └── VariableDeclaration
        ├── name: Identifier("x")
        ├── type: TypeReferenceNode("number")
        └── initializer: NumericLiteral(42)
```

### 1.5 Symbol 与类型检查

```typescript
// Binder 将声明绑定为 Symbol
interface Symbol {
  name: string
  declarations: Declaration[]   // 一个符号可有多个声明 (声明合并)
  valueDeclaration?: Declaration
  members?: SymbolTable         // 类/接口的成员符号表
  exports?: SymbolTable         // 模块导出符号表
}

// Checker 核心工作流程
// 1. getTypeAtLocation(node)   → 获取节点类型
// 2. isTypeAssignableTo(s, t)  → 判断赋值兼容性
// 3. resolveCall(node)         → 解析函数调用签名
// 4. inferTypeArguments()      → 泛型推断
```

### 1.6 增量编译原理

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,        // 启用增量编译
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}

// 增量编译核心机制:
// 1. 首次编译: 记录文件版本 + 类型依赖关系图
// 2. 再次编译: 对比文件 hash, 只重新检查受影响的文件
// 3. 依赖追踪: A import B → B 变化时 A 也需要重新检查

// Project References (项目引用)
{
  "references": [
    { "path": "../core" },
    { "path": "../utils" }
  ]
}
// 原理: 将大项目拆分为多个编译单元
// 每个单元独立编译, 通过 .d.ts 交互, 实现并行 + 缓存
```

---

## 二、结构化类型系统

### 2.1 结构类型 vs 名义类型

```typescript
// TypeScript 采用结构化类型系统 (Structural Typing)
// 类型兼容性由"结构"决定, 而非"名称"

interface Point2D { x: number; y: number }
interface Vector2D { x: number; y: number }

const p: Point2D = { x: 1, y: 2 }
const v: Vector2D = p  // ✅ 合法! 结构相同即兼容

// 对比 Java/C# 的名义类型 (Nominal Typing):
// Point2D p = new Vector2D()  // ❌ 编译错误, 即使结构相同
```

### 2.2 鸭子类型与子类型判定

```typescript
// "如果它走起来像鸭子, 叫起来像鸭子, 那它就是鸭子"
interface Duck {
  quack(): void
  swim(): void
}

class RobotDuck {
  quack() { console.log('机械嘎嘎') }
  swim() { console.log('机械游泳') }
  selfDestruct() { console.log('自毁') }
}

const duck: Duck = new RobotDuck()  // ✅ 结构满足即可
// RobotDuck 是 Duck 的子类型 (拥有更多成员)

// 子类型规则: S <: T 当且仅当 T 的所有成员在 S 中都存在且兼容
```

### 2.3 类型宽度 (Type Widening)

```typescript
// 字面量类型会被"拓宽"为对应的基础类型
let a = 'hello'       // 类型: string (拓宽)
const b = 'hello'     // 类型: 'hello' (const 不拓宽)

let c = 42            // 类型: number
const d = 42          // 类型: 42

// 控制拓宽的方式
const e = 'hello' as const        // 类型: 'hello'
const f: 'hello' = 'hello'        // 显式字面量类型
const g = { x: 1 } as const       // { readonly x: 1 }

// 拓宽发生场景:
// 1. let/var 声明
// 2. 对象属性 (非 as const)
// 3. 数组元素
// 4. 函数返回值推断
```

### 2.4 类型收窄 (Type Narrowing) 概览

```typescript
// 收窄: 从宽类型到窄类型的推导
function process(value: string | number) {
  // 此处 value: string | number
  if (typeof value === 'string') {
    // 此处 value: string (typeof 守卫收窄)
    value.toUpperCase()
  } else {
    // 此处 value: number (排除法收窄)
    value.toFixed(2)
  }
}
// 详细机制见第三章
```

### 2.5 原始类型的内部表示

```typescript
// TypeScript 类型在 Checker 内部的表示
interface Type {
  flags: TypeFlags          // 类型标记 (String | Number | Union ...)
  symbol?: Symbol
  pattern?: string          // 模板字面量模式
}

interface UnionType extends Type {
  types: Type[]             // 联合类型的成员
}

interface ObjectType extends Type {
  objectFlags: ObjectFlags
}

// TypeFlags 位标记示例
enum TypeFlags {
  Any = 1 << 0,
  Unknown = 1 << 1,
  String = 1 << 2,
  Number = 1 << 3,
  Boolean = 1 << 4,
  Union = 1 << 20,
  Intersection = 1 << 21,
  // ... 共 30+ 种标记, 通过位运算快速判断类型类别
}
```

---

## 三、类型收窄与控制流分析

### 3.1 控制流分析 (CFA) 原理

```typescript
// Checker 通过控制流图 (CFG) 追踪变量类型
// 每个赋值点/分支点都是一个 CFA 节点

function example(x: string | number | boolean) {
  // CFA 节点 1: x = string | number | boolean
  if (typeof x === 'string') {
    // CFA 节点 2 (true 分支): x = string
    x.length
  } else {
    // CFA 节点 3 (false 分支): x = number | boolean
    if (typeof x === 'number') {
      // CFA 节点 4: x = number
      x.toFixed()
    } else {
      // CFA 节点 5: x = boolean
      x.valueOf()
    }
  }
}

// CFA 图:
// [入口: string|number|boolean]
//     ├── typeof === 'string' (T) → [string]
//     └── (F) → [number|boolean]
//              ├── typeof === 'number' (T) → [number]
//              └── (F) → [boolean]
```

### 3.2 收窄守卫全览

```typescript
// 1. typeof 守卫
function f1(x: string | number) {
  if (typeof x === 'string') { /* x: string */ }
}

// 2. instanceof 守卫 (基于原型链)
function f2(x: Date | RegExp) {
  if (x instanceof Date) { /* x: Date */ }
}

// 3. in 操作符守卫
interface Cat { meow(): void }
interface Dog { bark(): void }
function f3(x: Cat | Dog) {
  if ('meow' in x) { /* x: Cat */ }
}

// 4. 自定义类型谓词
function isString(value: unknown): value is string {
  return typeof value === 'string'
}
function f4(x: unknown) {
  if (isString(x)) { /* x: string */ }
}

// 5. 可辨识联合 (Discriminated Union) — 最强大的模式
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'triangle'; base: number; height: number }

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2
    case 'square': return shape.side ** 2
    case 'triangle': return (shape.base * shape.height) / 2
    default: {
      // 穷尽性检查: 如果所有 case 都处理了, never 成立
      const _exhaustive: never = shape
      return _exhaustive
    }
  }
}
```

### 3.3 收窄失效的场景

```typescript
// ❌ 场景1: 闭包中的收窄不保留
function closureProblem(x: string | null) {
  if (x !== null) {
    // 此处 x: string ✅
    setTimeout(() => {
      x.length  // ❌ 错误! x 回到 string | null
      // 原因: 回调执行时机不确定, x 可能已被重新赋值
    })
  }
}

// ✅ 修复: 用 const 捕获收窄后的值
function closureFix(x: string | null) {
  if (x !== null) {
    const narrowed = x  // const 不会被重新赋值
    setTimeout(() => {
      narrowed.length   // ✅ string
    })
  }
}

// ❌ 场景2: 对象属性收窄不跨函数保留
interface State { user: { name: string } | null }
function objProblem(state: State) {
  if (state.user) {
    // state.user: { name: string } ✅
    doSomething()  // 可能修改 state
    state.user.name  // ❌ 收窄失效
  }
}

// ❌ 场景3: 类属性的收窄不保留 (getter 可能有副作用)
class Foo {
  value: string | null = null
  method() {
    if (this.value) {
      this.value.length  // ❌ getter 可能每次返回不同值
    }
  }
}
```

### 3.4 断言函数 (Assertion Functions)

```typescript
// 断言函数: 声明"如果执行通过, 则类型成立"
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Expected string, got ${typeof value}`)
  }
}

function assertNonNull<T>(value: T): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error('Value is nullable')
  }
}

function demo(input: unknown) {
  assertIsString(input)
  // 从这里开始 input: string
  input.toUpperCase()  // ✅
}

// 原理: Checker 在 assert 调用之后的所有 CFA 路径上
// 将断言条件作为已知事实应用
```

---

## 四、泛型与类型推断

### 4.1 类型推断算法

```typescript
// TypeScript 使用"双向推断" (Bidirectional Type Inference)

// 1. 最佳公共类型推断 (Best Common Type)
const arr = [1, 'hello']  // (string | number)[]
// 算法: 从候选类型中找"超类型", 找不到则联合

// 2. 上下文类型推断 (Contextual Typing) — 从外到内
window.onmousedown = (event) => {
  // event 自动推断为 MouseEvent
  // 原理: 从赋值目标 (onmousedown 的签名) 反向推断参数类型
  console.log(event.button)
}

// 3. 泛型参数推断 — 从实参到形参
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0]
}
const s = firstElement(['a', 'b'])  // T 推断为 string
const n = firstElement([1, 2, 3])   // T 推断为 number

// 推断位置: 只有参数位置参与推断, 返回值位置不参与
function badExample<T>(items: T[], compareFn: (a: T, b: T) => boolean): T {
  return items[0]
}
```

### 4.2 推断优先级与候选合并

```typescript
// 多个推断候选时的合并规则
function combine<T>(a: T, b: T): T[] {
  return [a, b]
}

combine(1, 'hello')  // T = string | number (联合)
combine('a', 'b')    // T = string (相同类型)

// 泛型默认值: 推断失败时的回退
interface Response<T = unknown> {
  data: T
  status: number
}

// 显式指定 > 推断 > 默认值 > unknown
const r1: Response = { data: null, status: 200 }        // unknown
const r2: Response<string> = { data: 'ok', status: 200 } // 显式
const r3 = combine<number>(1, 2)                          // 显式覆盖推断
```

### 4.3 泛型约束 (Constraints)

```typescript
// extends 在泛型中表示"约束", 而非继承
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const person = { name: 'Alice', age: 30 }
getProperty(person, 'name')    // ✅ K = 'name', 返回 string
getProperty(person, 'email')   // ❌ 'email' 不满足 keyof typeof person

// 约束的传播
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}
longest('hello', 'hi')      // ✅ string 有 length
longest([1, 2], [1, 2, 3])  // ✅ 数组有 length
longest(10, 20)             // ❌ number 没有 length

// 递归约束: F-bounded Polymorphism
interface Comparable<T extends Comparable<T>> {
  compareTo(other: T): number
}
```

### 4.4 泛型擦除与单态化

```typescript
// TypeScript 泛型是"擦除式"的 (与 Rust/C++ 单态化不同)
function identity<T>(value: T): T {
  return value
}

// 编译后: 只有一份代码, 无类型信息
function identity(value) {
  return value
}

// 推论 1: 运行时无法获取泛型实参
function create<T>(/* 无法在运行时判断 T 是什么 */) {}

// 推论 2: 泛型不能用于运行时判断
function isType<T>(value: unknown): value is T {
  return typeof value === 'string'  // ❌ 错误思路! T 在运行时不存在
}

// 正确做法: 传入运行时类型标记
function isType2<T>(value: unknown, check: (v: unknown) => boolean): value is T {
  return check(value)
}

// 推论 3: 泛型类没有静态多态
class Box<T> {
  static create(): Box<T> {  // ❌ 错误! 静态成员不能引用类泛型
    return new Box()
  }
}
```

### 4.5 变型 (Variance)

```typescript
// 协变 (Covariant): 保持方向 — 子类型 → 子类型
// 数组/只读属性是协变的
type Animal = { name: string }
type Dog = { name: string; bark(): void }

let dogs: Dog[] = [/* ... */]
let animals: Animal[] = dogs  // ✅ Dog[] <: Animal[] (协变)
// 注意: 这其实是不安全的 (写入问题), TS 刻意允许

// 逆变 (Contravariant): 反转方向
// 函数参数是逆变的 (strictFunctionTypes 开启时)
type AnimalHandler = (a: Animal) => void
type DogHandler = (d: Dog) => void

let handleAnimal: AnimalHandler = (a) => console.log(a.name)
let handleDog: DogHandler = handleAnimal  // ✅ 逆变: 能处理Animal的必能处理Dog
// handleDog = (d) => d.bark()  反过来则不行

// 双变 (Bivariant): 方法声明 (历史兼容)
interface EventHandler {
  // 方法语法: 双变 (不检查方向)
  handle(event: MouseEvent): void
}
// 属性语法: 严格逆变
interface StrictHandler {
  handle: (event: MouseEvent) => void
}

// 不变 (Invariant): 可变属性在严格模式下
// 读写属性理论上应不变, 但 TS 对属性采用协变 (实用主义)
```

---

## 五、条件类型原理

### 5.1 基本机制

```typescript
// 语法: T extends U ? X : Y
type IsString<T> = T extends string ? true : false

type A = IsString<'hello'>  // true
type B = IsString<42>       // false

// 底层实现: Checker 调用 isTypeAssignableTo(T, U)
// 结果为 true → 取 X 分支, 否则取 Y 分支
```

### 5.2 分布式条件类型 (Distributive Conditional Types)

```typescript
// 当 T 是裸类型参数且为联合类型时, 条件类型自动"分配"
type ToArray<T> = T extends any ? T[] : never

type Result = ToArray<string | number>
// 分配过程:
// ToArray<string> | ToArray<number>
// = string[] | number[]  (注意: 不是 (string|number)[])

// 阻止分配: 用 [T] 包裹
type ToArrayNoDistribute<T> = [T] extends [any] ? T[] : never
type Result2 = ToArrayNoDistribute<string | number>
// = (string | number)[]

// 经典应用: Exclude / Extract 的实现原理
type MyExclude<T, U> = T extends U ? never : T
type MyExtract<T, U> = T extends U ? T : never

type E1 = MyExclude<'a' | 'b' | 'c', 'a'>
// 分配: ('a' extends 'a' ? never : 'a') | ('b' extends 'a' ? never : 'b') | ...
// = never | 'b' | 'c' = 'b' | 'c'
```

### 5.3 infer 类型推断

```typescript
// infer 在条件类型中声明待推断的类型变量
type ElementType<T> = T extends (infer U)[] ? U : T

type A = ElementType<string[]>   // string
type B = ElementType<number>     // number

// 函数返回值提取
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never
type Fn = () => Promise<string>
type R = MyReturnType<Fn>  // Promise<string>

// 多个 infer 位置
type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never
type Swap<T> = T extends [infer A, infer B] ? [B, A] : never
type S = Swap<[string, number]>  // [number, string]

// infer 的约束 (TS 4.7+)
type ElementOf<T> = T extends Array<infer E extends string> ? E : never
// infer E extends string: 推断的同时施加约束
```

### 5.4 条件类型求值时机

```typescript
// 延迟求值: 当 T 是未解决的类型参数时, 条件类型被"挂起"
function processValue<T>(value: T): T extends string ? number : boolean {
  // 此处无法确定具体分支, 类型为条件类型本身
  if (typeof value === 'string') {
    // return value.length  // ❌ 即使运行时是 string, 类型系统仍视为未解决
    return value.length as any  // 需要断言
  }
  return true as any
}

// 解决时机:
// 1. 泛型实例化时 → 立即求值
// 2. 联合类型 → 分配后逐项求值
// 3. never → 直接返回 never (空联合)
type NeverCase = never extends string ? 'yes' : 'no'  // 'yes'!
// never 是空联合, 分配后无成员, 结果为 never... 
// 但 never 不在类型参数位置时不分配, 直接判断: never extends string = true
```

---

## 六、映射类型原理

### 6.1 基本语法与语义

```typescript
// 映射类型: 遍历键集合, 逐一生成属性
type MyMapped<T> = {
  [K in keyof T]: T[K]  // 同态映射: 逐属性复制
}

// 底层实现 (Checker):
// 1. 获取 keyof T 的联合类型
// 2. 对联合中每个成员 K:
//    - 实例化模板类型 T[K] (将 K 替换为具体键)
//    - 生成属性 { [K]: 实例化结果 }
// 3. 合并所有属性为对象类型

// 键集合可以是任意联合类型
type Flags<T extends string> = {
  [K in T]: boolean
}
type Permissions = Flags<'read' | 'write' | 'execute'>
// { read: boolean; write: boolean; execute: boolean }
```

### 6.2 同态映射与修饰符保留

```typescript
// 同态映射 (Homomorphic): [K in keyof T] 形式
// 特性: 自动保留原属性的 readonly / optional 修饰符
interface Person {
  readonly id: number
  name: string
  age?: number
}

type PersonCopy = { [K in keyof Person]: Person[K] }
// { readonly id: number; name: string; age?: number }  ← 修饰符保留

// 非同态映射: 不保留修饰符
type NonHomo = { [K in keyof Person]: string }
// 注意: 键来源是 keyof Person, 仍视为同态!

// 真正的非同态: 键不来自 keyof T
type Keys = 'a' | 'b'
type Fresh = { [K in Keys]: number }
// { a: number; b: number } — 全新属性, 无修饰符继承

// 修饰符操作符: + 和 -
type MyRequired<T> = { [K in keyof T]-?: T[K] }   // 移除可选
type MyReadonly<T> = { readonly [K in keyof T]: T[K] }  // 添加只读
type Mutable<T> = { -readonly [K in keyof T]: T[K] }    // 移除只读
```

### 6.3 键重映射 (Key Remapping)

```typescript
// TS 4.1+: as 子句重映射键名
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

interface Person {
  name: string
  age: number
}

type PersonGetters = Getters<Person>
// { getName: () => string; getAge: () => number }

// 过滤属性: 映射为 never 的键会被移除
type RemoveMethods<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K]
}

type DataOnly = RemoveMethods<{ name: string; greet(): void }>
// { name: string }  ← greet 被过滤

// 内置工具类型的实现原理
type MyPick<T, K extends keyof T> = { [P in K]: T[P] }
type MyOmit<T, K extends keyof any> = MyPick<T, Exclude<keyof T, K>>
type MyPartial<T> = { [K in keyof T]?: T[K] }
type MyRecord<K extends keyof any, V> = { [P in K]: V }
```

---

## 七、类型兼容性与赋值规则

### 7.1 函数类型兼容性

```typescript
// 参数: 逆变 (目标函数的参数可以比源函数"少")
type Handler = (a: string, b: number) => void
let h1: Handler = (a: string) => {}          // ✅ 参数更少 OK
let h2: Handler = (a: string, b: number, c: boolean) => {}  // ❌ 参数更多

// 返回值: 协变
type Producer = () => string
let p1: Producer = () => 'hello' as string | number  // ❌ 返回值更宽
let p2: () => string | number = () => 'hello'        // ✅ 返回值更窄

// 可选参数与剩余参数
type OptFn = (a: string, b?: number) => void
let f1: OptFn = (a) => {}                    // ✅
let f2: OptFn = (a, b, c) => {}              // ❌

// 方法双变 vs 属性逆变 (strictFunctionTypes)
interface Bivariant {
  method(x: string): void        // 方法语法: 双变
}
interface Contravariant {
  method: (x: string) => void    // 属性语法: 严格逆变
}
```

### 7.2 对象类型兼容性

```typescript
// 多余属性检查 (Excess Property Check)
interface Config { host: string; port: number }

// 直接赋值字面量: 触发多余属性检查
const c1: Config = { host: 'localhost', port: 3000, debug: true }  // ❌

// 间接赋值: 不触发 (结构化类型的本意)
const obj = { host: 'localhost', port: 3000, debug: true }
const c2: Config = obj  // ✅ 结构兼容即可

// 绕过方式:
const c3: Config = { host: 'a', port: 1, debug: true } as Config  // 断言
const c4: Config = { ...{ host: 'a', port: 1, debug: true } }     // 展开

// 原理: 多余属性检查是"新鲜性"(freshness)检查
// 只有新鲜的对象字面量才会被检查多余属性
```

### 7.3 特殊类型的兼容规则

```typescript
// any: 双向兼容 (除了 never)
let a: any = 42
let b: number = a      // ✅ any → number
let c: any = 'hello'   // ✅ string → any

// unknown: 只进不出
let u: unknown = 42        // ✅ 任何类型 → unknown
let n: number = u          // ❌ unknown 不能赋给其他类型
let n2: number = u as number  // ✅ 需要断言

// never: 只出不进
let nv: never = 42         // ❌ 没有值可以是 never
let x: number = nv         // ✅ never → 任何类型 (空类型)

// void 与 undefined
function f(): void {}
let v: void = undefined    // ✅ (strictNullChecks 下)
// let v2: void = null     // ❌ (strictNullChecks)

// 兼容性层级图:
// never → 所有类型 → unknown
// never 是底部类型 (Bottom Type)
// unknown 是顶部类型 (Top Type)
```

### 7.4 联合与交叉类型

```typescript
// 联合类型: T | U — 成员同时拥有两者的"并集"(只能访问交集成员)
type StringOrNumber = string | number
function demo(v: StringOrNumber) {
  v.toString()   // ✅ 两者都有
  // v.length    // ❌ number 没有 length
}

// 交叉类型: T & U — 同时满足两者 (成员取并集)
interface HasName { name: string }
interface HasAge { age: number }
type Person = HasName & HasAge
const p: Person = { name: 'Alice', age: 30 }  // 必须同时满足

// 交叉类型的矛盾与 never
interface A { x: string }
interface B { x: number }
type AB = A & B
// AB['x'] = string & number = never
// AB 类型本身不是 never, 但属性 x 是 never → 实际无法构造值

// 联合类型的分配律
// (A & B) | (A & C) ≡ A & (B | C)
```

---

## 八、模块解析机制

### 8.1 解析策略

```typescript
// 两大解析策略: Classic (历史遗留) vs Node (主流)
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node16"  // node | node16 | nodenext | bundler
  }
}

// Node 解析算法 (相对路径 ./foo):
// 1. ./foo.ts
// 2. ./foo.tsx
// 3. ./foo.d.ts
// 4. ./foo/package.json ("types" 字段)
// 5. ./foo/index.ts
// 6. ./foo/index.tsx
// 7. ./foo/index.d.ts

// 非相对路径 (node_modules 查找):
// import { x } from 'lodash'
// 1. ./node_modules/lodash.ts / .d.ts / package.json#types / index.ts
// 2. ../node_modules/lodash...
// 3. ../../node_modules/lodash...
// 4. 逐级向上直到根目录
```

### 8.2 package.json 导出映射 (exports)

```jsonc
// 现代包的 package.json
{
  "name": "my-lib",
  "main": "./dist/index.js",        // CommonJS 入口
  "module": "./dist/index.mjs",     // ESM 入口 (非标准但广泛支持)
  "types": "./dist/index.d.ts",     // 类型入口
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",   // types 必须放第一位!
      "import": "./dist/index.mjs",   // ESM import 时
      "require": "./dist/index.cjs"   // CJS require 时
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.mjs"
    }
  }
}

// 条件解析顺序: TypeScript 按声明顺序匹配第一个满足的条件
// "types" 条件必须放在最前, 否则会被其他条件"遮蔽"
```

### 8.3 paths 映射与 baseUrl

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils": ["src/utils/index.ts"]
    }
  }
}

// 重要: paths 只影响类型检查, 不影响运行时!
// 运行时解析需要打包器配合:

// vite.config.js
export default {
  resolve: {
    alias: {
      '@': '/src'  // 必须与 tsconfig paths 保持一致
    }
  }
}
```

### 8.4 模块格式与交互

```typescript
// ESM vs CJS 互操作
// esModuleInterop: true 时:
import express from 'express'  // CJS 模块被包装为默认导出
// 编译为:
const express_1 = __importDefault(require('express'))

// __importDefault 原理:
function __importDefault(mod) {
  return mod && mod.__esModule
    ? mod                          // 已是 ESM 编译产物
    : { default: mod }             // CJS 整体作为 default
}

// allowSyntheticDefaultImports: 只影响类型检查
// esModuleInterop: 影响类型检查 + 生成辅助代码

// isolatedModules: 单文件转译模式 (Babel/esbuild/SWC)
// 限制: 不能使用跨文件类型推断的特性
// 原因: 单文件转译器看不到其他文件的类型信息
export { MyType } from './types'      // ❌ isolatedModules 下报错
export type { MyType } from './types' // ✅ type-only export
```

---

## 九、声明文件与类型生态

### 9.1 声明文件解析优先级

```
查找 import 'foo' 的类型:
    ↓
1. 包内 package.json "types"/"typings" 字段
    ↓ (未找到)
2. 包内 index.d.ts
    ↓ (未找到)
3. node_modules/@types/foo/index.d.ts
    ↓ (未找到)
4. typeRoots / types 配置指定的目录
    ↓ (未找到)
5. 报错: Could not find a declaration file
```

### 9.2 declare 与全局扩展

```typescript
// 全局声明 (无需 import 即可使用)
// global.d.ts
declare const __DEV__: boolean
declare interface Window {
  __APP_CONFIG__: { apiBase: string }
}

// 模块扩展 (Module Augmentation)
// 扩展第三方库的类型
import { Router } from 'express'

declare module 'express' {
  interface Request {
    userId: string       // 给 Request 添加自定义属性
    isAuthenticated: boolean
  }
}

// 原理: 声明合并 (Declaration Merging)
// 同名 interface 自动合并成员
// 限制: 只能添加新属性, 不能修改已有属性的类型

// 命名空间合并
interface Config { host: string }
interface Config { port: number }
// 合并结果: { host: string; port: number }
```

### 9.3 声明合并规则

```typescript
// 合并矩阵:
// interface + interface     → 合并成员 ✅
// namespace + namespace     → 合并导出 ✅
// class + interface         → 类获得接口成员 ✅
// function + namespace      → 函数带属性 ✅
// class + class             → ❌ 不允许
// let/const + let/const     → ❌ 不允许

// 经典模式: 函数 + 命名空间
function createWidget(name: string): Widget { /* ... */ }
namespace createWidget {
  export const defaultSize = { width: 100, height: 50 }
}
// 使用: createWidget('btn') / createWidget.defaultSize

// 接口合并的冲突规则:
interface Merged {
  greet(name: string): string     // 先声明的优先级更高
}
interface Merged {
  greet(name: string): string     // ✅ 完全相同则合并
  // greet(name: string): number  // ❌ 同签名不同返回值 → 错误
}
```

### 9.4 类型导入与三斜线指令

```typescript
// 类型导入的三种方式
import { User } from './types'             // 值导入 (运行时保留)
import type { User } from './types'        // 纯类型导入 (编译后擦除)
import { type User, createUser } from './mod'  // 内联 type 修饰符

// 三斜线指令 (仅用于声明文件)
/// <reference path="./globals.d.ts" />       // 引入文件
/// <reference types="node" />                // 引入 @types 包
/// <reference lib="es2020" />                // 引入内置 lib

// lib.d.ts 分层结构:
// lib.es5.d.ts        → 基础 API (Array, Promise...)
// lib.es2015.d.ts     → ES6+
// lib.dom.d.ts        → DOM API
// lib.webworker.d.ts  → Worker API
// tsconfig "lib": ["ES2022", "DOM"] 控制可用 API 类型
```

---

## 十、类型擦除与运行时

### 10.1 擦除规则

```typescript
// 完全擦除 (编译后消失):
interface Foo { x: number }          // → 消失
type Bar = string | number           // → 消失
function f(x: number): number {}     // → function f(x) {}
let a: string = 'hi'                 // → let a = 'hi'
import type { T } from './t'         // → 消失

// 保留为运行时结构:
enum Direction { Up, Down }          // → 生成 JS 对象
namespace NS { export const x = 1 }  // → 生成 IIFE
class Animal {}                      // → 保留 (类是值)

// 参数属性的擦除:
class Point {
  constructor(public x: number, private y: number) {}
}
// 编译为:
class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}
```

### 10.2 枚举的运行时真相

```typescript
// 数字枚举: 双向映射对象
enum Color { Red, Green, Blue }
// 编译为:
var Color;
(function (Color) {
  Color[Color['Red'] = 0] = 'Red'
  Color[Color['Green'] = 1] = 'Green'
  Color[Color['Blue'] = 2] = 'Blue'
})(Color || (Color = {}))
// Color.Red === 0, Color[0] === 'Red' (双向查找)

// 字符串枚举: 单向映射
enum Status { Active = 'ACTIVE' }
// Status.Active === 'ACTIVE', Status['ACTIVE'] === undefined

// const enum: 完全内联, 无运行时对象
const enum Direction { Up = 'UP', Down = 'DOWN' }
let d = Direction.Up
// 编译为: let d = 'UP'  (直接替换为字面量)
// 限制: 不能对 const enum 使用 Object.keys 等反射操作

// 现代替代方案:
const STATUS = { Active: 'ACTIVE', Inactive: 'INACTIVE' } as const
type Status = (typeof STATUS)[keyof typeof STATUS]
// 'ACTIVE' | 'INACTIVE' — 零运行时开销 + 完整类型安全
```

### 10.3 装饰器编译原理

```typescript
// 实验性装饰器 (experimentalDecorators)
@Component({ selector: 'app' })
class AppComponent {}

// 编译为:
let AppComponent = class AppComponent {}
AppComponent = __decorate([
  Component({ selector: 'app' })
], AppComponent)

// __decorate 原理:
function __decorate(decorators, target) {
  // 从后向前依次应用装饰器 (洋葱模型)
  return decorators.reduceRight(
    (acc, decorator) => decorator(acc) || acc,
    target
  )
}

// TC39 标准装饰器 (TS 5.0+, 无需 experimentalDecorators)
function logged(originalMethod: any, context: ClassMethodDecoratorContext) {
  const methodName = String(context.name)
  function replacementMethod(this: any, ...args: any[]) {
    console.log(`LOG: Entering method '${methodName}'`)
    const result = originalMethod.call(this, ...args)
    console.log(`LOG: Exiting method '${methodName}'`)
    return result
  }
  return replacementMethod
}

class Person {
  @logged
  greet() { return 'hello' }
}
```

### 10.4 类型系统与 JavaScript 运行时的边界

```typescript
// 1. typeof 返回的是 JS 类型, 不是 TS 类型
type TS = 'string' | 'number'
const jsType: string = typeof someValue  // JS: 9 种结果
// 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' |
// 'undefined' | 'object' | 'function'

// 2. instanceof 基于原型链, 不基于 TS 类型
class MyError extends Error {}
try { throw new MyError('x') } catch (e) {
  if (e instanceof MyError) { /* 运行时原型链检查 */ }
}
// 注意: 跨 realm (iframe) 时 instanceof 可能失效

// 3. 类型断言不是类型转换!
const s = '123'
const n = s as unknown as number  // ❌ 运行时仍是字符串!
const real = Number(s)            // ✅ 真正的转换

// 4. 泛型无法运行时反射 (与 Java/C# 不同)
function create<T>(): T {
  // 无法: if (T === String) ...
  // 需要显式传入类或工厂:
  return null as any
}
function createWithClass<T>(cls: new () => T): T {
  return new cls()  // ✅ 运行时可用
}

// 5. 运行时类型校验方案
// - zod: Schema 定义 → 运行时校验 + 静态类型推断
// - io-ts / valibot / arktype: 同类方案
import { z } from 'zod'
const UserSchema = z.object({ name: z.string(), age: z.number() })
type User = z.infer<typeof UserSchema>  // 类型从 Schema 推导
const user = UserSchema.parse(input)    // 运行时安全校验
```

### 10.5 编译器性能与优化

```jsonc
// 影响类型检查性能的关键配置
{
  "compilerOptions": {
    "skipLibCheck": true,        // 跳过 .d.ts 检查 (显著提速)
    "incremental": true,         // 增量编译
    "disableSourceOfProjectReferenceRedirect": false,
    "maxNodeModuleJsDepth": 0    // 不深入 node_modules 推断
  }
}

// 类型层面的性能陷阱:
// 1. 过深的递归条件类型 (TS 限制递归深度 ~50)
// 2. 大型联合类型的分配爆炸 (A|B|C extends ... 逐项分配)
// 3. 复杂模板字面量类型的笛卡尔积
//    type T = `${'a'|'b'|'c'}${'1'|'2'|'3'}`  // 9 种组合

// 诊断工具:
// tsc --extendedDiagnostics    → 编译统计 (检查时间/内存)
// tsc --generateTrace outDir  → Chrome trace 可视化
// tsc --listFiles             → 参与编译的文件列表
```