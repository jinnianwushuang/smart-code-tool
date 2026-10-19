---
title: '高级类型体操 [P6-P7]'
level: 'senior'
tags: ['TypeScript', '条件类型', '模板字面量类型', '递归类型']
difficulty: 'hard'
target: 'P6+ 高级工程师'
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

### 1. 条件类型的约束求解算法

TypeScript 的条件类型不是简单的三元运算，而是编译器类型检查器中的**约束求解器**。

```
条件类型求解过程：

T extends U ? X : Y

编译器执行步骤：
  1. 检查 T 是否为“裸类型参数”（naked type parameter）
     ├── 是 → 进入分布式求解
     └── 否 → 进入普通求解

  2a. 普通求解：
     ├── 检查 T 是否可赋值给 U（用 isTypeAssignableTo 算法）
     ├── 可赋值 → 返回 X
     └── 不可赋值 → 返回 Y

  2b. 分布式求解（Distributive）：
     ├── 将 T 拆分为联合类型的每个成员
     ├── 对每个成员独立执行条件检查
     └── 将结果合并为新的联合类型

     示例：string | number extends any ? T[] : never
       → (string extends any ? string[] : never)
       | (number extends any ? number[] : never)
       → string[] | number[]

  3. 延迟求解（Deferred）：
     当 T 尚未确定时（泛型参数未实例化）
     → 条件类型保持未解析状态
     → 等到 T 被具体类型替换时才求解

为什么 [T] extends [U] 可以阻止分布式：
  元组类型不是联合类型（即使内部包含联合）
  → [string | number] 不是裸类型参数
  → 不触发分布式求解
  → 直接检查 [string | number] 是否可赋值给 [any]
```

### 2. infer 类型变量推断机制

`infer` 不是“猜测”，而是编译器在条件类型中执行的**类型反向求解**。

```
infer 求解算法：

type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never

当 T = (x: number) => string 时：
  1. 编译器尝试将 T 匹配到 (...args: any[]) => infer R
  2. 匹配成功 → 从返回位置“反向提取”类型
  3. R = string → 条件为真 → 返回 R

infer 的作用域规则：
  ├── infer 声明的变量只在条件类型的 true 分支中可见
  ├── 多个 infer 可以出现在同一条件中（独立推断）
  └── 同名 infer 多次出现时，取交叉类型（intersection）

infer 的协变/逆变：
  协变位置（返回类型）：
    T extends () => infer R → R 取所有可能返回类型的联合

  逆变位置（参数类型）：
    T extends (arg: infer A) => void → A 取所有参数类型的交叉
```

### 3. 模板字面量类型的笛卡尔积算法

模板字面量类型在遇到联合类型时，自动计算**笛卡尔积**。

```
笛卡尔积展开算法：

type Result = `${'a' | 'b'}-${'x' | 'y'}`

编译器执行：
  1. 收集每个插值位置的联合成员
     pos1: 'a' | 'b'
     pos2: 'x' | 'y'

  2. 计算笛卡尔积
     'a' × 'x' = 'a-x'
     'a' × 'y' = 'a-y'
     'b' × 'x' = 'b-x'
     'b' × 'y' = 'b-y'

  3. 合并为联合类型
     'a-x' | 'a-y' | 'b-x' | 'b-y'

复杂度警告：
  如果每个位置有 N 个成员，M 个位置
  → 结果类型有 N^M 个成员
  → 3 个位置各 10 个成员 = 1000 个联合成员
  → 编译器可能超时或内存溢出

  实践约束：
    ├── 避免在模板字面量中使用大联合类型
    ├── 用 Distributive 条件类型分步计算
    └── TypeScript 4.5+ 对模板字面量做了尾递归优化
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
