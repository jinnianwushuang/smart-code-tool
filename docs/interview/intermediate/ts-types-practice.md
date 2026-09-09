---
title: "TypeScript 类型体操入门 [P5-P6]"
level: "intermediate"
tags: ["TypeScript", "泛型", "条件类型", "映射类型", "工具类型"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# TypeScript 类型体操入门 [P5-P6]

> TypeScript 类型体操是利用类型系统解决复杂问题的技巧。掌握泛型、条件类型、映射类型，能写出类型安全的代码。

## 核心概念（What）

### 类型体操是什么

```
类型体操 = 使用 TypeScript 类型系统解决复杂问题

核心能力：
├── 泛型 → 类型参数化
├── 条件类型 → 类型判断
├── 映射类型 → 类型转换
├── 工具类型 → 内置工具
└── 类型推导 → 自动推断

应用场景：
├── API 类型定义
├── 组件 Props 类型
├── 工具函数类型
└── 类型安全的库
```

## 底层原理（Why）

### 泛型（Generics）

```typescript
// 泛型 = 类型参数

// 不使用泛型（类型丢失）
function identity(arg: any): any {
  return arg;
}

const result = identity('hello'); // any

// 使用泛型（类型安全）
function identity<T>(arg: T): T {
  return arg;
}

const result = identity('hello'); // string
const num = identity(123); // number

// 多个类型参数
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second];
}

const p = pair('hello', 123); // [string, number]

// 泛型约束
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

getLength('hello'); // ✓
getLength([1, 2, 3]); // ✓
// getLength(123); // ✗

// 泛型接口
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

interface User {
  id: number;
  name: string;
}

const response: ApiResponse<User> = {
  code: 200,
  data: { id: 1, name: 'Alice' },
  message: 'success'
};

// 泛型类
class Container<T> {
  private value: T;
  
  constructor(value: T) {
    this.value = value;
  }
  
  getValue(): T {
    return this.value;
  }
}

const strContainer = new Container('hello');
const numContainer = new Container(123);
```

### 条件类型

```typescript
// 条件类型 = 类型判断

// 基本语法
// T extends U ? X : Y

// 示例：判断是否为数组
type IsArray<T> = T extends Array<any> ? true : false;

type A = IsArray<string[]>; // true
type B = IsArray<number>; // false

// 示例：提取 Promise 类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type A = UnwrapPromise<Promise<string>>; // string
type B = UnwrapPromise<number>; // number

// 示例：函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

function getUser() {
  return { id: 1, name: 'Alice' };
}

type User = ReturnType<typeof getUser>; // { id: number; name: string }

// 分布式条件类型
type ToArray<T> = T extends any ? T[] : never;

type A = ToArray<string | number>; // string[] | number[]

// 过滤 never
type Exclude<T, U> = T extends U ? never : T;

type A = Exclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'
```

### 映射类型

```typescript
// 映射类型 = 基于旧类型创建新类型

// 基本语法
// { [K in keyof T]: ValueType }

// 示例：所有属性变为可选
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

interface User {
  id: number;
  name: string;
  age: number;
}

type PartialUser = MyPartial<User>;
// { id?: number; name?: string; age?: number }

// 示例：所有属性变为只读
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

type ReadonlyUser = MyReadonly<User>;
// { readonly id: number; readonly name: string; readonly age: number }

// 示例：所有属性变为必填
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

interface OptionalUser {
  id?: number;
  name?: string;
}

type RequiredUser = MyRequired<OptionalUser>;
// { id: number; name: string }

// 示例：键值翻转
type Flip<T> = {
  [K in keyof T as T[K]]: K;
};

type Colors = {
  red: 'RED';
  green: 'GREEN';
  blue: 'BLUE';
};

type FlippedColors = Flip<Colors>;
// { RED: 'red'; GREEN: 'green'; BLUE: 'blue' }
```

### 工具类型

```typescript
// TypeScript 内置工具类型

// Partial<T> → 所有属性可选
interface User {
  id: number;
  name: string;
  age: number;
}

type PartialUser = Partial<User>;
// { id?: number; name?: string; age?: number }

// Required<T> → 所有属性必填
type RequiredUser = Required<User>;

// Readonly<T> → 所有属性只读
type ReadonlyUser = Readonly<User>;

// Pick<T, K> → 选择部分属性
type UserBasic = Pick<User, 'id' | 'name'>;
// { id: number; name: string }

// Omit<T, K> → 排除部分属性
type UserWithoutAge = Omit<User, 'age'>;
// { id: number; name: string }

// Record<K, T> → 键值对类型
type UserMap = Record<string, User>;
// { [key: string]: User }

// Exclude<T, U> → 从 T 中排除 U
type A = Exclude<'a' | 'b' | 'c', 'a'>;
// 'b' | 'c'

// Extract<T, U> → 从 T 中提取 U
type B = Extract<'a' | 'b' | 'c', 'a' | 'b'>;
// 'a' | 'b'

// NonNullable<T> → 排除 null 和 undefined
type C = NonNullable<string | null | undefined>;
// string

// Parameters<T> → 函数参数类型
function greet(name: string, age: number) {}
type GreetParams = Parameters<typeof greet>;
// [name: string, age: number]

// ReturnType<T> → 函数返回类型
type GreetReturn = ReturnType<typeof greet>;
// void

// InstanceType<T> → 类实例类型
class User {
  constructor(public name: string) {}
}
type UserInstance = InstanceType<typeof User>;
// User
```

## 实战应用（How）

### API 类型定义

```typescript
// 通用响应类型
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
}

// 分页响应
interface PaginatedResponse<T> {
  code: number;
  data: {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
  };
  message: string;
}

// 用户相关
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
}

// API 函数
async function getUser(id: number): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

async function createUser(
  data: CreateUserRequest
): Promise<ApiResponse<User>> {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}

async function getUsers(
  page: number,
  pageSize: number
): Promise<PaginatedResponse<User>> {
  const response = await fetch(`/api/users?page=${page}&pageSize=${pageSize}`);
  return response.json();
}
```

### 组件 Props 类型

```vue
<script setup lang="ts">
import { defineProps } from 'vue';

interface Props {
  title: string;
  count?: number;
  items: Array<{ id: number; name: string }>;
  onClick?: (id: number) => void;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  onClick: () => {}
});

// 使用
function handleClick(id: number) {
  props.onClick?.(id);
}
</script>

<!-- 泛型组件 -->
<script setup lang="ts" generic="T extends { id: number; name: string }">
interface Props<T> {
  items: T[];
  renderItem: (item: T) => string;
}

const props = defineProps<Props<T>>();
</script>
```

### 工具函数类型

```typescript
// 类型安全的 localStorage
function getStorageItem<T>(key: string, defaultValue: T): T {
  const item = localStorage.getItem(key);
  if (item === null) {
    return defaultValue;
  }
  return JSON.parse(item) as T;
}

function setStorageItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// 使用
const user = getStorageItem<User>('user', null);
setStorageItem('user', { id: 1, name: 'Alice' });

// 类型安全的 EventEmitter
class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners: { [K in keyof Events]?: Array<(data: Events[K]) => void> } = {};
  
  on<K extends keyof Events>(event: K, listener: (data: Events[K]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }
  
  emit<K extends keyof Events>(event: K, data: Events[K]) {
    this.listeners[event]?.forEach(listener => listener(data));
  }
}

// 使用
interface AppEvents {
  'user-login': User;
  'user-logout': void;
  'error': Error;
}

const emitter = new TypedEventEmitter<AppEvents>();

emitter.on('user-login', (user) => {
  console.log(user.name); // 类型安全
});

emitter.emit('user-login', { id: 1, name: 'Alice' });
```

## 高频面试题

### Q1: 什么是泛型？

```
泛型 = 类型参数化

作用：
├── 类型安全（避免 any）
├── 代码复用（通用函数/类）
└── 类型推导（自动推断）

示例：
function identity<T>(arg: T): T {
  return arg;
}

const str = identity('hello'); // string
const num = identity(123); // number
```

### Q2: 常用工具类型有哪些？

```
┌──────────────────┬──────────────────────────┐
│ 工具类型         │ 作用                     │
├──────────────────┼──────────────────────────┤
│ Partial<T>       │ 所有属性可选             │
│ Required<T>      │ 所有属性必填             │
│ Readonly<T>      │ 所有属性只读             │
│ Pick<T, K>       │ 选择部分属性             │
│ Omit<T, K>       │ 排除部分属性             │
│ Record<K, T>     │ 键值对类型               │
│ Exclude<T, U>    │ 从 T 中排除 U            │
│ Extract<T, U>    │ 从 T 中提取 U            │
│ NonNullable<T>   │ 排除 null/undefined      │
│ ReturnType<T>    │ 函数返回类型             │
│ Parameters<T>    │ 函数参数类型             │
└──────────────────┴──────────────────────────┘
```

### Q3: 条件类型的使用场景？

```
场景：
├── 类型判断（IsArray、IsFunction）
├── 类型提取（UnwrapPromise、ReturnType）
├── 类型过滤（Exclude、Extract）
└── 类型转换（ToTuple、ToUnion）

示例：
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type A = UnwrapPromise<Promise<string>>; // string
```

## 延伸思考

1. 如何实现深度 Partial？
2. 类型体操的调试技巧？
3. 如何设计类型安全的 API？

## 参考资料

- [TypeScript 类型体操](https://github.com/type-challenges/type-challenges)
- [TypeScript 高级类型](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
