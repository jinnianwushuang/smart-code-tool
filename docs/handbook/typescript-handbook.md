# TypeScript 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: TypeScript 开发人员、前端工程师、Node.js 开发者

---

## 📑 目录

- [一、基础类型](#一基础类型)
- [二、接口](#二接口)
- [三、类型别名](#三类型别名)
- [四、枚举](#四枚举)
- [五、泛型](#五泛型)
- [六、高级类型](#六高级类型)
- [七、类](#七类)
- [八、命名空间](#八命名空间)
- [九、模块](#九模块)
- [十、装饰器](#十装饰器)
- [十一、工具类型](#十一工具类型)
- [十二、类型守卫](#十二类型守卫)
- [十三、映射类型](#十三映射类型)
- [十四、条件类型](#十四条件类型)
- [十五、实用技巧](#十五实用技巧)
- [十六、最佳实践](#十六最佳实践)

---

## 一、基础类型

### 1.1 基本类型

```typescript
// 布尔值
let isDone: boolean = false

// 数字
let decimal: number = 6
let hex: number = 0xf00d
let binary: number = 0b1010
let octal: number = 0o744

// 字符串
let color: string = 'blue'
let template: string = `Hello, ${name}`

// 数组
let list: number[] = [1, 2, 3]
let list2: Array<number> = [1, 2, 3]

// 元组
let x: [string, number] = ['hello', 10]

// any (谨慎使用)
let notSure: any = 4
notSure = 'maybe a string'

// void
function warnUser(): void {
  console.log('This is my warning message')
}

// null 和 undefined
let u: undefined = undefined
let n: null = null

// never (永不存在的值的类型)
function error(message: string): never {
  throw new Error(message)
}

// unknown (类型安全的 any)
let value: unknown
value = true
value = 42
if (typeof value === 'number') {
  console.log(value + 10) // OK
}
```

### 1.2 类型断言

```typescript
// 尖括号语法
let someValue: any = 'this is a string'
let strLength: number = (<string>someValue).length

// as 语法 (推荐，JSX 中必须使用)
let strLength2: number = (someValue as string).length

// 非空断言
let maybeString: string | null = 'hello'
let definitelyString: string = maybeString!
```

### 1.3 字面量类型

```typescript
// 字符串字面量
type Direction = 'north' | 'south' | 'east' | 'west'
let direction: Direction = 'north'

// 数字字面量
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6
let roll: DiceRoll = 3

// 布尔字面量
type TrueOnly = true
let truth: TrueOnly = true
```

---

## 二、接口

### 2.1 基本接口

```typescript
interface Person {
  name: string
  age: number
  email?: string // 可选属性
  readonly id: number // 只读属性
}

const person: Person = {
  name: 'Alice',
  age: 25,
  id: 1,
}
```

### 2.2 函数类型接口

```typescript
interface SearchFunc {
  (source: string, subString: string): boolean
}

let mySearch: SearchFunc
mySearch = function (source: string, subString: string) {
  return source.search(subString) !== -1
}
```

### 2.3 可索引接口

```typescript
interface StringArray {
  [index: number]: string
}

let myArray: StringArray
myArray = ['Bob', 'Fred']
```

### 2.4 类类型接口

```typescript
interface ClockInterface {
  currentTime: Date
  setTime(d: Date): void
}

class Clock implements ClockInterface {
  currentTime: Date = new Date()
  setTime(d: Date) {
    this.currentTime = d
  }
}
```

### 2.5 接口继承

```typescript
interface Shape {
  color: string
}

interface Square extends Shape {
  sideLength: number
}

let square: Square = {
  color: 'blue',
  sideLength: 10,
}

// 多继承
interface PenStroke {
  penWidth: number
}

interface Circle extends Shape, PenStroke {
  radius: number
}
```

### 2.6 混合类型接口

```typescript
interface Counter {
  (start: number): string
  interval: number
  reset(): void
}

function getCounter(): Counter {
  let counter = function (start: number) {}
  counter.interval = 123
  counter.reset = function () {}
  return counter
}
```

---

## 三、类型别名

### 3.1 基本用法

```typescript
type Name = string
type NameResolver = () => string
type NameOrResolver = Name | NameResolver

function getName(n: NameOrResolver): Name {
  if (typeof n === 'string') {
    return n
  } else {
    return n()
  }
}
```

### 3.2 联合类型

```typescript
type Status = 'success' | 'error' | 'pending'
type ID = string | number

function processId(id: ID) {
  if (typeof id === 'string') {
    // id is string
  } else {
    // id is number
  }
}
```

### 3.3 交叉类型

```typescript
interface ErrorHandling {
  success: boolean
  error?: { message: string }
}

interface ArtworksData {
  artworks: { title: string }[]
}

type ArtworksResponse = ArtworksData & ErrorHandling

const response: ArtworksResponse = {
  artworks: [{ title: 'Mona Lisa' }],
  success: true,
}
```

### 3.4 与接口的区别

```typescript
// 类型别名可以表示原始类型、联合类型、元组等
type Point = {
  x: number
  y: number
}

type SetPoint = (x: number, y: number) => void

// 接口只能描述对象形状
interface Point2 {
  x: number
  y: number
}

// 类型别名不能被 extends/implements
// 接口可以被 extends/implements
```

---

## 四、枚举

### 4.1 数字枚举

```typescript
enum Direction {
  Up, // 0
  Down, // 1
  Left, // 2
  Right, // 3
}

enum HttpStatus {
  OK = 200,
  NotFound = 404,
  InternalServerError = 500,
}

// 反向映射
let dir: Direction = Direction.Up
let name: string = Direction[dir] // "Up"
```

### 4.2 字符串枚举

```typescript
enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

// 没有反向映射
```

### 4.3 常量枚举

```typescript
const enum Directions {
  Up,
  Down,
  Left,
  Right,
}

let directions = [Directions.Up, Directions.Down]
// 编译后: let directions = [0, 1];
```

### 4.4 外部枚举

```typescript
declare enum Enum {
  A = 1,
  B,
  C = 2,
}
```

---

## 五、泛型

### 5.1 泛型函数

```typescript
function identity<T>(arg: T): T {
  return arg
}

let output = identity<string>('myString')
let output2 = identity('myString') // 类型推断
```

### 5.2 泛型接口

```typescript
interface GenericIdentityFn<T> {
  (arg: T): T
}

function identity<T>(arg: T): T {
  return arg
}

let myIdentity: GenericIdentityFn<number> = identity
```

### 5.3 泛型类

```typescript
class GenericNumber<T> {
  zeroValue: T
  add: (x: T, y: T) => T
}

let myGenericNumber = new GenericNumber<number>()
myGenericNumber.zeroValue = 0
myGenericNumber.add = function (x, y) {
  return x + y
}
```

### 5.4 泛型约束

```typescript
interface Lengthwise {
  length: number
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length)
  return arg
}

loggingIdentity('hello') // OK
loggingIdentity(3) // Error
```

### 5.5 多个类型参数

```typescript
function swap<T, U>(tuple: [T, U]): [U, T] {
  return [tuple[1], tuple[0]]
}

swap([7, 'seven']) // ["seven", 7]
```

### 5.6 默认类型参数

```typescript
interface Container<T = string> {
  value: T
}

let container: Container // Container<string>
```

### 5.7 泛型工具

```typescript
// Partial - 所有属性可选
interface Todo {
  title: string
  description: string
}

function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>) {
  return { ...todo, ...fieldsToUpdate }
}

// Readonly - 所有属性只读
interface Config {
  apiUrl: string
  timeout: number
}

const config: Readonly<Config> = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
}
```

---

## 六、高级类型

### 6.1 交叉类型 (&)

```typescript
interface ErrorHandling {
  success: boolean
  error?: { message: string }
}

interface ArtworksData {
  artworks: { title: string }[]
}

type ArtworksResponse = ArtworksData & ErrorHandling
```

### 6.2 联合类型 (|)

```typescript
type Status = 'idle' | 'loading' | 'success' | 'error'

function getStatusMessage(status: Status): string {
  switch (status) {
    case 'idle':
      return 'Idle'
    case 'loading':
      return 'Loading...'
    case 'success':
      return 'Success!'
    case 'error':
      return 'Error occurred'
  }
}
```

### 6.3 类型保护

```typescript
// typeof 类型保护
function padLeft(value: string, padding: string | number) {
  if (typeof padding === 'number') {
    return Array(padding + 1).join(' ') + value
  }
  if (typeof padding === 'string') {
    return padding + value
  }
  throw new Error(`Expected string or number, got '${padding}'.`)
}

// instanceof 类型保护
interface Padder {
  getPaddingString(): string
}

class SpaceRepeatingPadder implements Padder {
  constructor(private numSpaces: number) {}
  getPaddingString() {
    return Array(this.numSpaces + 1).join(' ')
  }
}

class StringPadder implements Padder {
  constructor(private value: string) {}
  getPaddingString() {
    return this.value
  }
}

function getPadder(padder: Padder): string {
  if (padder instanceof SpaceRepeatingPadder) {
    return padder.getPaddingString()
  }
  if (padder instanceof StringPadder) {
    return padder.getPaddingString()
  }
  throw new Error('Unknown padder type')
}
```

### 6.4 nullable 类型

```typescript
function f(sn: string | null): string {
  if (sn == null) {
    return 'default'
  } else {
    return sn
  }
}

// 可选链
let x = foo?.bar.baz()

// 空值合并运算符
let x = foo ?? bar()
```

---

## 七、类

### 7.1 基本类

```typescript
class Greeter {
  greeting: string

  constructor(message: string) {
    this.greeting = message
  }

  greet() {
    return 'Hello, ' + this.greeting
  }
}

let greeter = new Greeter('world')
```

### 7.2 访问修饰符

```typescript
class Animal {
  public name: string
  private movement: string
  protected species: string

  constructor(name: string, movement: string, species: string) {
    this.name = name
    this.movement = movement
    this.species = species
  }
}

class Dog extends Animal {
  constructor(name: string) {
    super(name, 'walking', 'canine')
  }

  move() {
    console.log(`${this.name} is ${this.movement}`) // Error: movement is private
    console.log(`${this.name} is a ${this.species}`) // OK
  }
}
```

### 7.3 参数属性

```typescript
class Animal {
  constructor(
    public name: string,
    private movement: string,
    protected species: string,
  ) {}
}
```

### 7.4 存取器

```typescript
class Employee {
  private _fullName: string

  get fullName(): string {
    return this._fullName
  }

  set fullName(newName: string) {
    if (newName && newName.length > 10) {
      throw new Error('fullName has a max length of 10')
    }
    this._fullName = newName
  }
}
```

### 7.5 静态属性

```typescript
class Grid {
  static origin = { x: 0, y: 0 }

  constructor(public scale: number) {}

  calculateDistanceFromOrigin(point: { x: number; y: number }) {
    let xDist = point.x - Grid.origin.x
    let yDist = point.y - Grid.origin.y
    return Math.sqrt(xDist * xDist + yDist * yDist) / this.scale
  }
}
```

### 7.6 抽象类

```typescript
abstract class Animal {
  abstract makeSound(): void

  move(): void {
    console.log('roaming the earth...')
  }
}

class Dog extends Animal {
  makeSound() {
    console.log('woof woof')
  }
}
```

### 7.7 构造函数类型

```typescript
class Greeter {
  greeting: string
  constructor(message: string) {
    this.greeting = message
  }
  greet() {
    return 'Hello, ' + this.greeting
  }
}

let greeterMaker: typeof Greeter = Greeter
greeterMaker.standardGreeting = 'Hey there!'

let greeter2: Greeter = new greeterMaker()
```

---

## 八、命名空间

### 8.1 基本命名空间

```typescript
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean
  }

  const lettersRegexp = /^[A-Za-z]+$/
  const numberRegexp = /^[0-9]+$/

  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return lettersRegexp.test(s)
    }
  }

  export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
      return s.length === 5 && numberRegexp.test(s)
    }
  }
}

let validators: { [s: string]: Validation.StringValidator } = {}
validators['ZIP code'] = new Validation.ZipCodeValidator()
validators['Letters only'] = new Validation.LettersOnlyValidator()
```

### 8.2 命名空间别名

```typescript
import Strings = Validation.Strings
import Validators = Validation.Validators
```

### 8.3 ambient 命名空间

```ts
declare namespace D3 {
  export interface Selectors {
    select(selector: string): Selection
    selectElement(element: EventTarget): Selection
  }

  export interface Event {
    x: number
    y: number
  }

  export interface Base extends Selectors {
    event: Event
  }
}

declare var d3: D3.Base
```

---

## 九、模块

### 9.1 ES Modules

```typescript
// math.ts
export const PI = 3.14159
export function add(a: number, b: number): number {
  return a + b
}
export default class Calculator {}

// app.ts
import Calculator, { PI, add } from './math'
import * as Math from './math'
```

### 9.2 CommonJS

```typescript
// math.ts
export = {
  PI: 3.14159,
  add: function (a: number, b: number) {
    return a + b
  },
}

// app.ts
import math = require('./math')
```

### 9.3 UMD 模块

```typescript
// math.ts
;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory)
  } else if (typeof exports === 'object') {
    factory(exports)
  } else {
    factory((root.math = {}))
  }
})(this, function (exports) {
  exports.PI = 3.14159
  exports.add = function (a: number, b: number) {
    return a + b
  }
})
```

### 9.4 动态导入

```typescript
async function loadModule() {
  const math = await import('./math')
  console.log(math.add(2, 3))
}
```

---

## 十、装饰器

### 10.1 类装饰器

```typescript
function sealed(constructor: Function) {
  Object.seal(constructor)
  Object.seal(constructor.prototype)
}

@sealed
class Greeter {
  greeting: string
  constructor(message: string) {
    this.greeting = message
  }
  greet() {
    return 'Hello, ' + this.greeting
  }
}
```

### 10.2 方法装饰器

```typescript
function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value
  }
}

class Greeter {
  greeting: string
  constructor(message: string) {
    this.greeting = message
  }

  @enumerable(false)
  greet() {
    return 'Hello, ' + this.greeting
  }
}
```

### 10.3 访问器装饰器

```typescript
function configurable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = value
  }
}

class Point {
  private _x: number
  private _y: number

  constructor(x: number, y: number) {
    this._x = x
    this._y = y
  }

  @configurable(false)
  get x() {
    return this._x
  }

  @configurable(false)
  get y() {
    return this._y
  }
}
```

### 10.4 属性装饰器

```typescript
function format(formatString: string) {
  return function (target: any, propertyKey: string) {
    let value = target[propertyKey]

    const getter = function () {
      return value
    }

    const setter = function (newVal: any) {
      value = newVal
    }

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    })
  }
}

class Greeter {
  @format('Hello, %s')
  greeting: string

  constructor(message: string) {
    this.greeting = message
  }
}
```

### 10.5 参数装饰器

```typescript
function validate(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  console.log(`Validating parameter ${parameterIndex} of ${propertyKey.toString()}`)
}

class Greeter {
  greet(@validate message: string) {
    console.log(message)
  }
}
```

---

## 十一、工具类型

### 11.1 `Partial<T>`

```typescript
interface Todo {
  title: string
  description: string
}

function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>) {
  return { ...todo, ...fieldsToUpdate }
}

const todo1 = {
  title: 'organize desk',
  description: 'clear clutter',
}

const todo2 = updateTodo(todo1, {
  description: 'throw out trash',
})
```

### 11.2 `Required<T>`

```typescript
interface Props {
  title?: string
  description?: string
}

const props: Required<Props> = {
  title: 'My Title',
  description: 'My Description',
}
```

### 11.3 `Readonly<T>`

```typescript
interface Todo {
  title: string
}

const todo: Readonly<Todo> = {
  title: 'Delete inactive users',
}

// todo.title = "New title"; // Error
```

### 11.4 Record<K, T>

```typescript
interface CatInfo {
  age: number
  breed: string
}

type CatName = 'miffy' | 'boris' | 'mordred'

const cats: Record<CatName, CatInfo> = {
  miffy: { age: 10, breed: 'Persian' },
  boris: { age: 5, breed: 'Maine Coon' },
  mordred: { age: 16, breed: 'British Shorthair' },
}
```

### 11.5 Pick<T, K>

```typescript
interface Todo {
  title: string
  description: string
  completed: boolean
}

type TodoPreview = Pick<Todo, 'title' | 'completed'>

const todo: TodoPreview = {
  title: 'Clean room',
  completed: false,
}
```

### 11.6 Omit<T, K>

```typescript
interface Todo {
  title: string
  description: string
  completed: boolean
  createdAt: number
}

type TodoPreview = Omit<Todo, 'description' | 'createdAt'>

const todo: TodoPreview = {
  title: 'Clean room',
  completed: false,
}
```

### 11.7 Exclude<T, U>

```typescript
type T0 = Exclude<'a' | 'b' | 'c', 'a'> // "b" | "c"
type T1 = Exclude<'a' | 'b' | 'c', 'a' | 'b'> // "c"
type T2 = Exclude<string | number | (() => void), Function> // string | number
```

### 11.8 Extract<T, U>

```typescript
type T0 = Extract<'a' | 'b' | 'c', 'a' | 'f'> // "a"
type T1 = Extract<string | number | (() => void), Function> // () => void
```

### 11.9 `NonNullable<T>`

```typescript
type T0 = NonNullable<string | number | undefined> // string | number
type T1 = NonNullable<string[] | null | undefined> // string[]
```

### 11.10 `Parameters<T>`

```typescript
declare function f1(arg: { a: number; b: string }): void

type T0 = Parameters<() => string> // []
type T1 = Parameters<(s: string) => void> // [string]
type T2 = Parameters<<T>(arg: T) => T> // [unknown]
type T3 = Parameters<typeof f1> // [{ a: number; b: string }]
```

### 11.11 `ReturnType<T>`

```typescript
declare function f1(): { a: number; b: string }

type T0 = ReturnType<() => string> // string
type T1 = ReturnType<(s: string) => void> // void
type T2 = ReturnType<<T>() => T> // unknown
type T3 = ReturnType<<T extends U, U extends number[]>() => T> // number[]
type T4 = ReturnType<typeof f1> // { a: number; b: string }
```

### 11.12 `InstanceType<T>`

```typescript
class C {
  x = 0
  y = 0
}

type T0 = InstanceType<typeof C> // C
type T1 = InstanceType<any> // any
type T2 = InstanceType<never> // never
type T3 = InstanceType<string> // Error
type T4 = InstanceType<Function> // Error
```

---

## 十二、类型守卫

### 12.1 typeof 守卫

```typescript
function padLeft(value: string, padding: string | number) {
  if (typeof padding === 'number') {
    return Array(padding + 1).join(' ') + value
  }
  if (typeof padding === 'string') {
    return padding + value
  }
  throw new Error(`Expected string or number, got '${padding}'.`)
}
```

### 12.2 instanceof 守卫

```typescript
interface Bird {
  fly(): void
  layEggs(): void
}

interface Fish {
  swim(): void
  layEggs(): void
}

function getSmallPet(): Fish | Bird {
  // ...
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined
}

let pet = getSmallPet()
if (isFish(pet)) {
  pet.swim()
} else {
  pet.fly()
}
```

### 12.3 in 守卫

```typescript
interface Admin {
  name: string
  privileges: string[]
}

interface Employee {
  name: string
  startDate: Date
}

type Staff = Admin | Employee

function printEmployeeInformation(staff: Staff) {
  console.log('Name: ' + staff.name)
  if ('privileges' in staff) {
    console.log('Privileges: ' + staff.privileges.join(', '))
  }
  if ('startDate' in staff) {
    console.log('Start Date: ' + staff.startDate.toDateString())
  }
}
```

### 12.4 自定义类型守卫

```typescript
interface Car {
  manufacturer: string
  model: string
  year: number
}

let taxi: Car = {
  manufacturer: 'Toyota',
  model: 'Camry',
  year: 2014,
}

function isCar(vehicle: any): vehicle is Car {
  return (
    vehicle.manufacturer !== undefined && vehicle.model !== undefined && vehicle.year !== undefined
  )
}

if (isCar(taxi)) {
  console.log(taxi.manufacturer)
}
```

### 12.5 判别联合类型

```typescript
interface Square {
  kind: 'square'
  size: number
}

interface Rectangle {
  kind: 'rectangle'
  width: number
  height: number
}

interface Circle {
  kind: 'circle'
  radius: number
}

type Shape = Square | Rectangle | Circle

function area(s: Shape): number {
  switch (s.kind) {
    case 'square':
      return s.size * s.size
    case 'rectangle':
      return s.width * s.height
    case 'circle':
      return Math.PI * s.radius ** 2
  }
}
```

---

## 十三、映射类型

### 13.1 基本映射

```typescript
type Keys = 'option1' | 'option2'
type Flags = { [K in Keys]: boolean }

// 等同于
type Flags = {
  option1: boolean
  option2: boolean
}
```

### 13.2 键映射

```typescript
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

type Concrete<T> = {
  [P in keyof T]-?: T[P]
}
```

### 13.3 模板字面量类型

```typescript
type EmailLocaleIDs = 'welcome_email' | 'email_heading'
type FooterLocaleIDs = 'footer_title' | 'footer_sendoff'

type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`

// "welcome_email_id" | "email_heading_id" | "footer_title_id" | "footer_sendoff_id"
```

### 13.4 字符串操作类型

```typescript
type Greeting = 'Hello, world'
type ShoutyGreeting = Uppercase<Greeting> // "HELLO, WORLD"

type ASCIICacheKey<Str extends string> = `ID-${Uppercase<Str>}`
type MainID = ASCIICacheKey<'my_app'> // "ID-MY_APP"
```

---

## 十四、条件类型

### 14.1 基本条件类型

```typescript
type IsString<T> = T extends string ? true : false

type A = IsString<string> // true
type B = IsString<number> // false
```

### 14.2 分布式条件类型

```typescript
type ToArray<Type> = Type extends any ? Type[] : never

type StrArrOrNumArr = ToArray<string | number>
// string[] | number[]
```

### 14.3 infer 关键字

```typescript
type Flatten<Type> = Type extends Array<infer Item> ? Item : Type

type Str = Flatten<string[]> // string
type Num = Flatten<number> // number

type GetReturnType<Func extends (...args: any[]) => any> = Func extends (
  ...args: any[]
) => infer Return
  ? Return
  : never

type Num = GetReturnType<() => number> // number
type Str = GetReturnType<(x: string) => string> // string
```

### 14.4 嵌套条件类型

```typescript
type TypeName<T> = T extends string
  ? 'string'
  : T extends number
    ? 'number'
    : T extends boolean
      ? 'boolean'
      : T extends undefined
        ? 'undefined'
        : T extends Function
          ? 'function'
          : 'object'

type T0 = TypeName<string> // "string"
type T1 = TypeName<'a'> // "string"
type T2 = TypeName<true> // "boolean"
type T3 = TypeName<() => void> // "function"
type T4 = TypeName<string[]> // "object"
```

---

## 十五、实用技巧

### 15.1 类型收窄

```typescript
// 使用类型谓词
function isNumber(value: any): value is number {
  return typeof value === 'number'
}

// 使用断言函数
function assertIsNumber(value: any): asserts value is number {
  if (typeof value !== 'number') {
    throw new Error('Not a number')
  }
}

// 使用 satisfies 运算符
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
  bleu: [0, 0, 255],
} satisfies Record<string, string | number[]>
```

### 15.2 类型兼容性

```typescript
// 结构化类型系统
interface Named {
  name: string
}

let x: Named
let y = { name: 'Alice', location: 'Seattle' }
x = y // OK
```

### 15.3 协变和逆变

```typescript
// 协变：返回值
type Covariant<T> = () => T

// 逆变：参数
type Contravariant<T> = (arg: T) => void

// 双向协变：既是参数又是返回值
type Invariant<T> = (arg: T) => T
```

### 15.4 类型推断

```typescript
// 上下文类型推断
window.onmousedown = function (mouseEvent) {
  console.log(mouseEvent.button) // OK
  console.log(mouseEvent.kangaroo) // Error
}

// 最佳通用类型推断
let x = [0, 1, null] // (number | null)[]

// 候选类型推断
function createZoo(): Animal[] {
  return [new Rhino(), new Elephant(), new Snake()]
}
```

### 15.5 声明合并

```typescript
interface Box {
  height: number
  width: number
}

interface Box {
  scale: number
}

let box: Box = { height: 5, width: 6, scale: 10 }
```

### 15.6 模块扩充

```typescript
// observable.ts
export class Observable<T> {
  // ...
}

// map.ts
import { Observable } from './observable'

declare module './observable' {
  interface Observable<T> {
    map<U>(f: (x: T) => U): Observable<U>
  }
}

Observable.prototype.map = function (f) {
  // ...
}
```

---

## 十六、最佳实践

### 16.1 类型安全

```typescript
// ✅ 避免使用 any
function add(a: number, b: number): number {
    return a + b;
}

// ❌ 不推荐
function add(a: any, b: any): any {
    return a + b;
}

// ✅ 使用 unknown 代替 any
function parseJSON(json: string): unknown {
    return JSON.parse(json);
}

// ✅ 启用严格模式
// tsconfig.json
{
    "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true
    }
}
```

### 16.2 接口设计

```typescript
// ✅ 使用接口定义契约
interface UserRepository {
  findById(id: string): Promise<User | null>
  save(user: User): Promise<void>
}

// ✅ 小接口优于大接口
interface Serializable {
  serialize(): string
}

interface Deserializable {
  deserialize(data: string): this
}

// ❌ 避免过大的接口
interface HugeInterface {
  // 太多属性和方法
}
```

### 16.3 泛型使用

```typescript
// ✅ 合理使用泛型约束
function firstElement<T extends Array<any>>(arr: T): T[0] {
  return arr[0]
}

// ✅ 使用默认类型参数
interface Container<T = string> {
  value: T
}

// ✅ 泛型工具类型
type PartialUser = Partial<User>
type ReadonlyUser = Readonly<User>
```

### 16.4 错误处理

```typescript
// ✅ 明确的错误类型
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

// ✅ 使用 Result 类型
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E }

function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return { success: false, error: new Error('Division by zero') }
  }
  return { success: true, data: a / b }
}
```

### 16.5 性能优化

```typescript
// ✅ 使用 const enum 减少运行时开销
const enum LogLevel {
  ERROR,
  WARN,
  INFO,
  DEBUG,
}

// ✅ 避免不必要的类型检查
function process(items: readonly string[]) {
  // items 是只读的，不需要额外保护
}

// ✅ 使用类型断言时要谨慎
const element = document.getElementById('app') as HTMLElement
```

### 16.6 代码组织

```typescript
// ✅ 按功能组织类型
// types/user.ts
export interface User {
  id: string
  name: string
  email: string
}

export type UserInput = Omit<User, 'id'>
export type UserUpdate = Partial<UserInput>

// ✅ 使用命名空间组织相关类型
namespace API {
  export interface Response<T> {
    data: T
    status: number
  }

  export interface Error {
    code: string
    message: string
  }
}
```

### 16.7 测试建议

```typescript
// ✅ 为测试编写类型
interface TestCase {
  input: any
  expected: any
  description: string
}

function runTests(tests: TestCase[]) {
  tests.forEach((test) => {
    // 运行测试
  })
}

// ✅ 使用类型确保测试完整性
type TestSuite = {
  [key: string]: () => void
}

const userTests: TestSuite = {
  'should create user': () => {},
  'should update user': () => {},
}
```

---

## 附录

### A. 常用配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### B. 有用的资源

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **TypeScript Playground**: https://www.typescriptlang.org/play
- **Definitely Typed**: https://definitelytyped.org/
- **Type Challenges**: https://github.com/type-challenges/type-challenges

### C. 学习路线

```
JavaScript 基础 → TypeScript 基础 → 高级类型 → 泛型 → 装饰器 → 工程化

1. JavaScript 基础
2. TypeScript 基本类型
3. 接口和类型别名
4. 泛型和工具类型
5. 高级类型（条件类型、映射类型）
6. 类和装饰器
7. 模块和命名空间
8. 配置和工程化
9. 类型体操
10. 最佳实践
```

---

**祝您 TypeScript 编程愉快！** 🚀

如有问题，请查阅官方文档或社区论坛。
