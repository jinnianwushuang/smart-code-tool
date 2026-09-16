# TypeScript 典型类型拆解

> 本文档对 TypeScript 中经典的内置工具类型进行**逐行拆解**，揭示其底层实现原理。
> 每个示例都包含：源码 → 语法解析 → 执行过程表格 → 最终结果。

---

## 一、Exclude — 分布式条件类型实现集合"差集"

### 1.1 前置知识：基本条件类型

```typescript
type IsString<T> = T extends string ? true : false

type A = IsString<string> // true
type B = IsString<number> // false
```

**核心语法解析：**

- `T extends string ? true : false`：这是一个**条件类型**，语法形式为 `A extends B ? X : Y`
- 含义：如果类型 `T` 可以赋值给 `string`，则返回 `true`；否则返回 `false`
- `IsString<string>` → `string extends string` 成立 → 返回 `true`
- `IsString<number>` → `number extends string` 不成立 → 返回 `false`

### 1.2 Exclude 源码拆解

```typescript
type Exclude<T, U> = T extends U ? never : T

type Result = Exclude<'a' | 'b' | 'c', 'a'> // 'b' | 'c'
```

`Exclude` 用于从联合类型中**剔除**指定的类型，是条件类型最经典的应用。

- `T extends U ? never : T`：如果 `T` 可以赋值给 `U`，返回 `never`（表示"移除"）；否则保留 `T`
- `never` 在联合类型中代表"空集"，TypeScript 会自动过滤掉联合类型中的 `never`（如 `'b' | 'c' | never` → `'b' | 'c'`）

### 1.3 拆解执行过程

`Exclude<'a' | 'b' | 'c', 'a'>`

当泛型 `T` 是联合类型时，TypeScript 会触发**分发（Distributive）机制**，将联合类型拆开逐个计算：

| 步骤    | 拆分计算                        | 结果    |
| ------- | ------------------------------- | ------- |
| ① `'a'` | `'a' extends 'a' ? never : 'a'` | `never` |
| ② `'b'` | `'b' extends 'a' ? never : 'b'` | `'b'`   |
| ③ `'c'` | `'c' extends 'a' ? never : 'c'` | `'c'`   |

合并结果：`never | 'b' | 'c'` → 过滤 `never` → 最终类型 **`'b' | 'c'`**

### 1.4 分布式条件类型详解

当条件类型的泛型参数是**联合类型**时，TypeScript 会自动将联合类型拆开，对每个成员单独计算，最后再合并结果。这就是**分布式条件类型**。

对比 `ToArray<string | number>` 的执行：

| 步骤       | 拆分计算                                | 结果       |
| ---------- | --------------------------------------- | ---------- |
| ① `string` | `string extends any ? string[] : never` | `string[]` |
| ② `number` | `number extends any ? number[] : never` | `number[]` |

合并结果：**`string[] | number[]`**

> **对比非分发写法**：如果不想触发分发，可以用 `[T]` 包裹泛型来阻止分发：
>
> ```typescript
> type ToArrayNonDistrib<Type> = [Type] extends any ? Type[] : never
> type Result = ToArrayNonDistrib<string | number> // (string | number)[]
> ```
>
> 包裹后 `Type` 不再被视为裸联合类型，分发机制不会触发，结果是单个数组类型而非联合类型。

---

## 二、infer — 条件类型中的类型推断

### 2.1 什么是 infer？

`infer` 用于条件类型的 `extends` 子句中，用来**声明一个临时类型变量**，让 TypeScript 自动从匹配模式中**推断**出该位置的具体类型。可以理解为"模式匹配 + 类型提取"。

### 2.2 Flatten — 提取数组元素类型

```typescript
type Flatten<Type> = Type extends Array<infer Item> ? Item : Type

type Str = Flatten<string[]> // string
type Num = Flatten<number> // number
```

- `Type extends Array<infer Item>`：尝试将 `Type` 匹配为 `Array<某类型>`，如果匹配成功，`infer Item` 会自动捕获该数组的元素类型
- 匹配成功 → 返回 `Item`（元素类型）；匹配失败 → 返回 `Type` 本身

| 输入                | 匹配过程                                                     | 结果     |
| ------------------- | ------------------------------------------------------------ | -------- |
| `Flatten<string[]>` | `string[]` 匹配 `Array<infer Item>` → `Item` 推断为 `string` | `string` |
| `Flatten<number>`   | `number` 不匹配 `Array<...>` → 走 else 分支                  | `number` |

### 2.3 GetReturnType — 提取函数返回值类型

```typescript
type GetReturnType<Func extends (...args: any[]) => any> = Func extends (
  ...args: any[]
) => infer Return
  ? Return
  : never

type Num = GetReturnType<() => number> // number
type Str = GetReturnType<(x: string) => string> // string
```

- `Func extends (...args: any[]) => any`：约束 `Func` 必须是函数类型
- `(...args: any[]) => infer Return`：尝试将 `Func` 匹配为函数模式，`infer Return` 自动捕获返回值类型

| 输入                                   | 匹配过程                                | 结果     |
| -------------------------------------- | --------------------------------------- | -------- |
| `GetReturnType<() => number>`          | 匹配函数模式 → `Return` 推断为 `number` | `number` |
| `GetReturnType<(x: string) => string>` | 匹配函数模式 → `Return` 推断为 `string` | `string` |

### 2.4 infer 核心规则

- `infer` 只能出现在条件类型的 `extends` 子句中
- 推断出的类型变量仅在条件类型的 `true` 分支中可用
- 同一个 `extends` 子句中可以声明多个 `infer`，例如同时提取参数类型和返回类型：

```typescript
type GetParameters<Func> = Func extends (...args: infer P) => any ? P : never

type Params = GetParameters<(a: string, b: number) => void>
// [a: string, b: number]
```

---

## 三、ReturnType — infer 的经典应用

```typescript
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any
```

**拆解执行过程：**

| 输入                                 | 匹配过程                                    | 结果              |
| ------------------------------------ | ------------------------------------------- | ----------------- |
| `ReturnType<() => string>`           | 匹配函数模式 → `R` 推断为 `string`          | `string`          |
| `ReturnType<(x: number) => boolean>` | 匹配函数模式 → `R` 推断为 `boolean`         | `boolean`         |
| `ReturnType<() => Promise<number>>`  | 匹配函数模式 → `R` 推断为 `Promise<number>` | `Promise<number>` |

> 注意：`ReturnType` 提取的是函数**直接返回**的类型。如果返回的是 `Promise<number>`，结果是 `Promise<number>` 而非 `number`。要提取 Promise 内部的类型需要结合 `Awaited`。

---

## 四、Awaited — 递归解包 Promise

```typescript
type Awaited<T> = T extends null | undefined
  ? T
  : T extends object & { then(onfulfilled: infer F): any }
    ? F extends (value: infer V, ...args: any) => any
      ? Awaited<V>
      : never
    : T
```

**简化版理解（核心逻辑）：**

```typescript
type SimpleAwaited<T> = T extends Promise<infer Inner> ? SimpleAwaited<Inner> : T
```

**拆解执行过程：**

| 输入                                | 匹配过程                                                                                         | 结果     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ | -------- |
| `Awaited<Promise<string>>`          | 匹配 `Promise<infer Inner>` → `Inner = string` → 递归 `Awaited<string>` → 不匹配 → 返回 `string` | `string` |
| `Awaited<Promise<Promise<number>>>` | 第一层 → `Inner = Promise<number>` → 递归 → 第二层 → `Inner = number` → 返回 `number`            | `number` |
| `Awaited<string>`                   | 不匹配 `Promise<...>` → 直接返回                                                                 | `string` |

> 这就是 `infer` + **递归条件类型** 的组合应用。TypeScript 会不断解包 `Promise` 嵌套层，直到内部类型不再是 `Promise` 为止。

---

## 五、Partial / Required — 映射类型修饰符

### 5.1 Partial — 所有属性变可选

```typescript
type Partial<T> = {
  [K in keyof T]?: T[K]
}
```

**拆解：**

- `keyof T`：获取 `T` 所有属性名的联合类型
- `[K in keyof T]`：遍历每个属性名（映射类型）
- `?`：添加可选修饰符
- `T[K]`：索引访问类型，获取属性 `K` 对应的值类型

```typescript
interface User {
  name: string
  age: number
}

type PartialUser = Partial<User>
// { name?: string | undefined; age?: number | undefined }
```

### 5.2 Required — 所有属性变必填

```typescript
type Required<T> = {
  [K in keyof T]-?: T[K]
}
```

- `-?`：**移除**可选修饰符（与 `+?` 相反）

```typescript
interface Config {
  host?: string
  port?: number
}

type RequiredConfig = Required<Config>
// { host: string; port: number }
```

---

## 六、Pick / Omit — 属性筛选

### 6.1 Pick — 从类型中挑选部分属性

```typescript
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}
```

**拆解执行过程：**

```typescript
interface Todo {
  title: string
  description: string
  completed: boolean
}

type TodoPreview = Pick<Todo, 'title' | 'completed'>
// { title: string; completed: boolean }
```

- `K extends keyof T`：约束 `K` 必须是 `T` 的属性名之一
- `[P in K]`：只遍历 `K` 指定的属性名
- `T[P]`：保留对应的值类型

### 6.2 Omit — 从类型中排除部分属性

```typescript
type Omit<T, K extends string | number | symbol> = {
  [P in Exclude<keyof T, K>]: T[P]
}
```

**拆解执行过程：**

```typescript
type TodoInfo = Omit<Todo, 'description'>
// { title: string; completed: boolean }
```

- `Exclude<keyof T, K>`：先用 `Exclude` 从所有属性名中剔除 `K` 指定的（呼应第一节）
- `[P in ...]`：遍历剩余的属性名
- `T[P]`：保留对应的值类型

> `Omit` 的底层直接复用了 `Exclude`，体现了工具类型之间的**组合设计思想**。

---

## 七、总结：内置工具类型知识图谱

```
条件类型
├── 基本条件类型：T extends U ? X : Y
├── 分布式条件类型：联合类型自动拆分计算
│   └── Exclude<T, U>
└── infer 类型推断
    ├── Flatten<Type>          → 提取数组元素类型
    ├── ReturnType<T>          → 提取函数返回值类型
    ├── Parameters<T>          → 提取函数参数类型
    └── Awaited<T>             → 递归解包 Promise（infer + 递归）

映射类型
├── 修饰符变更
│   ├── Partial<T>             → 全部变可选（+?）
│   └── Required<T>            → 全部变必填（-?）
└── 属性筛选
    ├── Pick<T, K>             → 挑选指定属性
    └── Omit<T, K>             → 排除指定属性（内部复用 Exclude）
```
