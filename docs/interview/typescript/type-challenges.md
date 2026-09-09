---
title: "高级类型体操 [P6-P7]"
level: "senior"
tags: ["TypeScript", "条件类型", "模板字面量类型", "递归类型"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# 高级类型体操 [P6-P7]

> TypeScript 的类型系统是图灵完备的，意味着它可以在类型层面实现任意计算。掌握高级类型编程，才能在框架设计和复杂 API 建模中游刃有余。

## 核心概念（What）

### 类型体操的核心工具

```
TypeScript 高级类型工具：
├── 条件类型：T extends U ? X : Y
├── 映射类型：{ [K in keyof T]: ... }
├── 模板字面量类型：`${A}${B}`
├── 递归类型：类型引用自身
├── infer 关键字：在条件类型中推断类型
└── 内置工具类型：Partial, Required, Pick, Omit, ReturnType...
```

---

## 底层原理（Why）

### 1. 条件类型

```typescript
// 条件类型：根据条件选择不同的类型
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>; // true
type B = IsString<42>;      // false

// 分布式条件类型：当 T 是联合类型时，条件类型会分配
type ToArray<T> = T extends any ? T[] : never;

type C = ToArray<string | number>; // string[] | number[]
// 不是 (string | number)[]

// 非分布式：用元组包裹
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type D = ToArrayNonDist<string | number>; // (string | number)[]
```

### 2. infer 关键字

```typescript
// infer 在条件类型中推断类型变量

// 提取函数返回类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type A = MyReturnType<() => string>; // string
type B = MyReturnType<(x: number) => boolean>; // boolean

// 提取 Promise 内部类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type C = UnwrapPromise<Promise<string>>; // string
type D = UnwrapPromise<number>;          // number

// 提取数组元素类型
type ElementOf<T> = T extends (infer E)[] ? E : never;

type E = ElementOf<string[]>; // string

// 提取元组第一个元素
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;

type F = First<[1, 2, 3]>; // 1
```

### 3. 映射类型

```typescript
// 映射类型：遍历联合类型的每个键

// Partial：所有属性变为可选
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// Required：所有属性变为必选
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

// Readonly：所有属性变为只读
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// 键重映射（Key Remapping）
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type Person = { name: string; age: number };
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }
```

### 4. 模板字面量类型

```typescript
// 模板字面量类型：在类型层面拼接字符串

type EventName<T extends string> = `on${Capitalize<T>}`;

type A = EventName<'click'>; // 'onClick'

// 联合类型的笛卡尔积
type Color = 'red' | 'blue';
type Size = 'small' | 'large';

type ColorSize = `${Color}-${Size}`;
// 'red-small' | 'red-large' | 'blue-small' | 'blue-large'

// 实际应用：CSS 属性类型
type CSSProperties = `${'margin' | 'padding'}-${'top' | 'right' | 'bottom' | 'left'}`;
// 'margin-top' | 'margin-right' | ... | 'padding-left'
```

### 5. 递归类型

```typescript
// 深度 Readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K];
};

// 深度 Partial
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepPartial<T[K]>
    : T[K];
};

// 获取对象的所有路径（点分路径）
type Paths<T, K extends keyof T = keyof T> =
  K extends string
    ? T[K] extends object
      ? `${K}.${Paths<T[K]>}` | K
      : K
    : never;

type Config = { db: { host: string; port: number }; debug: boolean };
type ConfigPaths = Paths<Config>;
// 'db.host' | 'db.port' | 'db' | 'debug'
```

### 6. 实战：实现常用工具类型

```typescript
// 1. 实现 Pick
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 2. 实现 Omit
type MyOmit<T, K extends keyof any> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

// 3. 实现 Awaited（Promise 解包）
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;

type A = MyAwaited<Promise<Promise<string>>>; // string

// 4. 实现 Chainable（链式调用类型）
type Chainable<T = {}> = {
  set<K extends string, V>(key: K, value: V): Chainable<T & Record<K, V>>;
  get(): T;
};

// 5. 实现 DeepMerge
type DeepMerge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? K extends keyof T
      ? T[K] extends object ? U[K] extends object ? DeepMerge<T[K], U[K]> : U[K] : U[K]
      : U[K]
    : K extends keyof T
      ? T[K]
      : never;
};
```

---

## 高频面试题

### Q1: 解释分布式条件类型

**参考答案要点**：
- 当条件类型的左侧是裸类型参数（如 T extends U），且 T 是联合类型时，条件类型会分配到联合的每个成员
- `T extends any ? X : Y` 中，如果 T = A | B，结果是 X[A] | X[B]
- 用 `[T] extends [U]` 可以阻止分配

### Q2: infer 关键字的作用是什么？

**参考答案要点**：
- infer 只能在条件类型的 extends 子句中使用
- 用于从类型中推断出类型变量
- 常见用途：提取函数参数/返回类型、Promise 内部类型、数组元素类型

### Q3: 如何实现一个 DeepReadonly 类型？

**参考答案要点**：
- 递归遍历对象类型的所有属性
- 对每个属性，如果是对象类型则递归应用 DeepReadonly
- 需要排除 Function 类型（函数不需要 readonly）
- 使用条件类型判断是否为对象

---

## 延伸思考

1. **设计题**：设计一个类型安全的 ORM 查询构建器 API。
2. **场景题**：如何为一个复杂的配置对象实现类型安全的深度合并？
3. **对比题**：TypeScript 的类型系统 vs Rust 的类型系统，各自的能力边界？

---

## 参考资料

- [TypeScript 高级类型](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [type-challenges](https://github.com/type-challenges/type-challenges)
- [TypeScript 模板字面量类型](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
