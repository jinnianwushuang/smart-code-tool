---
title: 'JS · Dart · Python 常用 API 与易混点速查'
tags: ['JavaScript', 'Dart', 'Python', '速查', 'API', '对比', '语言']
---

# JS · Dart · Python 常用 API 与易混点速查

> 本文按「能力」把三门语言的常用 API 并排对齐，**只罗列不展开**，方便一眼回忆、消除混淆。底层机制与完整代码示例见深度版：[JS · Dart · Python 三大语言 API 与底层机制对比](/dev-knowledge/cross-domain/architecture-and-system/js-dart-python-api-comparison)。

---

## 一、类型与声明

| 能力     | JavaScript              | Dart                      | Python                |
| -------- | ----------------------- | ------------------------- | --------------------- |
| 变量声明 | `let` / `const` / `var` | `var` / `final` / `const` | 直接赋值 `x = 1`      |
| 常量     | `const`                 | `const`（编译期）         | 约定大写（无真常量）  |
| 类型标注 | TS `x: T`               | `int x` / 自动推断        | 注解 `x: int`（可选） |
| 动态类型 | ✅ 原生                 | `dynamic`                 | ✅ 原生               |
| 静态类型 | ❌（靠 TS）             | ✅ 强类型                 | 渐进（type hints）    |
| 空安全   | ❌                      | ✅ `?`                    | 部分（`Optional`）    |

---

## 二、类型转换 / 判断

| 能力        | JavaScript            | Dart           | Python                    |
| ----------- | --------------------- | -------------- | ------------------------- |
| 转字符串    | `String(x)` / 模板    | `x.toString()` | `str(x)`                  |
| 转整数      | `parseInt` / `Number` | `int.parse`    | `int(x)`                  |
| 转浮点      | `parseFloat`          | `double.parse` | `float(x)`                |
| 类型判断    | `typeof`              | `is`           | `type()` / `isinstance()` |
| 真值判断    | falsy 规则            | 只认 `bool`    | 隐式真值                  |
| 数字↔字符串 | 隐式转换              | 需显式         | 需显式                    |

---

## 三、数字与数学

| 能力     | JavaScript              | Dart               | Python                 |
| -------- | ----------------------- | ------------------ | ---------------------- |
| 绝对值   | `Math.abs`              | `x.abs()`          | `abs(x)`               |
| 取整     | `Math.floor/ceil/round` | `floor/ceil/round` | `math.floor` / `round` |
| 幂       | `Math.pow` / `**`       | `pow` / `.pow`     | `**` / `pow`           |
| 最大最小 | `Math.max/min`          | `max` / `min`      | `max()` / `min()`      |
| 随机     | `Math.random`           | `Random()`         | `random` 模块          |
| 除零     | `Infinity`              | 抛异常             | 抛异常                 |
| 整数溢出 | 变浮点                  | 64 位回绕          | 任意精度（不溢出）     |

---

## 四、位运算与进制

| 能力     | JavaScript     | Dart                | Python       |
| -------- | -------------- | ------------------- | ------------ |
| 与/或/非 | `&` `\|` `~`   | `&` `\|` `~`        | `&` `\|` `~` |
| 异或     | `^`            | `^`                 | `^`          |
| 左移     | `<<`           | `<<`                | `<<`         |
| 右移     | `>>` / `>>>`   | `>>` / `>>>`        | `>>`（算术） |
| 转二进制 | `toString(2)`  | `toRadixString(2)`  | `bin(x)`     |
| 十六进制 | `toString(16)` | `toRadixString(16)` | `hex(x)`     |
| 位宽     | 32 位（`\|0`） | 64 位               | 任意精度     |

---

## 五、补码与位表示

| 概念       | JavaScript                        | Dart                    | Python             |
| ---------- | --------------------------------- | ----------------------- | ------------------ |
| 整数存储   | IEEE-754 double（位运算转 32 位） | 64 位二进制补码         | 任意精度补码       |
| 有符号右移 | `>>`（符号扩展）                  | `>>`（符号扩展）        | `>>`（算术）       |
| 无符号右移 | `>>>`（零填充）                   | `>>>`                   | 无（需掩码）       |
| 溢出回绕   | 转 float 不回绕                   | VM 回绕 / Web 转 double | 不回绕（自动扩位） |
| 位宽截断   | `\|0` 截 32 位                    | `toInt64`/掩码          | `& mask`           |
| 负数表示   | 补码（32 位）                     | 补码（64 位）           | 补码（无限位）     |

---

## 六、数值边界 / IEEE-754

| 概念     | JavaScript               | Dart            | Python          |
| -------- | ------------------------ | --------------- | --------------- |
| 整数上限 | `MAX_SAFE_INTEGER`(2^53) | `int` 64 位     | 任意精度        |
| 浮点标准 | IEEE-754 double          | IEEE-754 double | IEEE-754 double |
| 溢出行为 | 丢精度/转 float          | Web 转 double   | 自动扩位        |
| NaN      | `NaN !== NaN`            | `double.nan`    | `float('nan')`  |
| 整数除   | `/`（浮点）`~~`          | `~/`            | `//`            |

---

## 七、字符串

| 能力   | JavaScript               | Dart          | Python        |
| ------ | ------------------------ | ------------- | ------------- |
| 插值   | `` `...${x}` ``          | `'...$x'`     | `f'...{x}'`   |
| 长度   | `s.length`               | `s.length`    | `len(s)`      |
| 包含   | `includes`               | `contains`    | `in`          |
| 切片   | `slice`                  | `substring`   | `s[a:b]`      |
| 分割   | `split`                  | `split`       | `split`       |
| 去空白 | `trim`                   | `trim`        | `strip`       |
| 替换   | `replace` / `replaceAll` | `replaceAll`  | `replace`     |
| 大小写 | `toUpperCase`            | `toUpperCase` | `upper`       |
| 多行   | 模板字符串               | `'''` / `"""` | `'''` / `"""` |

---

## 八、字符编码 / Unicode

| 能力     | JavaScript             | Dart                  | Python        |
| -------- | ---------------------- | --------------------- | ------------- |
| 码点     | `codePointAt`          | `runes`               | `ord()`       |
| 反查字符 | `String.fromCodePoint` | `String.fromCharCode` | `chr()`       |
| 遍历码点 | `[...str]`             | `str.runes`           | `for c in s`  |
| 长度陷阱 | UTF-16 码元            | UTF-16 码元           | 码点数        |
| 编解码   | `TextEncoder`          | `utf8.encode`         | `str.encode`  |
| 规范化   | `normalize()`          | 有限                  | `unicodedata` |

---

## 九、字符串驻留 / interning

| 概念        | JavaScript   | Dart              | Python              |
| ----------- | ------------ | ----------------- | ------------------- |
| 字面量驻留  | 引擎自动     | 编译器驻留        | 自动（标识符风格）  |
| 手动 intern | 无（引擎级） | `String.intern()` | `sys.intern()`      |
| 值比较      | `===`        | `==`              | `==`                |
| 身份比较    | 无原始值身份 | 对象 `identity`   | `is`/`id()`         |
| 拼接成本    | 不可变新串   | 不可变            | 不可变（建议 join） |

---

## 十、日期与时间

| 能力     | JavaScript       | Dart                     | Python                |
| -------- | ---------------- | ------------------------ | --------------------- |
| 当前时间 | `new Date()`     | `DateTime.now()`         | `datetime.now()`      |
| UTC      | `toISOString`    | `toUtc()`                | `now(timezone.utc)`   |
| 时间戳   | `getTime()`      | `millisecondsSinceEpoch` | `timestamp()`         |
| 解析     | `Date.parse`     | `DateTime.parse`         | `strptime`            |
| 格式化   | `Intl` / 库      | `DateFormat`（intl）     | `strftime`            |
| 时间加减 | `+ ms`           | `add(Duration)`          | `timedelta`           |
| 常用库   | dayjs / date-fns | `intl`                   | `datetime` / pendulum |

---

## 十一、数组 / 列表

| 能力   | JavaScript          | Dart                     | Python                |
| ------ | ------------------- | ------------------------ | --------------------- |
| 长度   | `arr.length`        | `list.length`            | `len(lst)`            |
| 增     | `push`              | `add`                    | `append`              |
| 删尾   | `pop`               | `removeLast`             | `pop`                 |
| 删指定 | `splice`            | `removeAt`               | `del` / `remove`      |
| 查找   | `find` / `indexOf`  | `firstWhere` / `indexOf` | `index()` / 推导      |
| 映射   | `map`               | `map().toList()`         | 推导 / `map()`        |
| 过滤   | `filter`            | `where`                  | 推导 / `filter()`     |
| 归约   | `reduce`            | `reduce`                 | `functools.reduce`    |
| 排序   | `sort` / `toSorted` | `sort` / `sorted`        | `sort()` / `sorted()` |
| 拷贝   | `[...arr]`          | `list.toList()`          | `lst.copy()`          |
| 反转   | `reverse`           | `reversed`               | `reverse` / `[::-1]`  |

---

## 十二、对象 / Map / 字典

| 能力   | JavaScript             | Dart              | Python               |
| ------ | ---------------------- | ----------------- | -------------------- |
| 创建   | `{}` / `new Map()`     | `{}` / `<K, V>{}` | `{}` / `dict()`      |
| 取值   | `obj.k` / `map.get`    | `map[k]`          | `d[k]` / `.get`      |
| 存值   | `obj.k = v`            | `map[k] = v`      | `d[k] = v`           |
| 删除   | `delete`               | `remove`          | `del` / `pop`        |
| 键判断 | `in` / `has`           | `containsKey`     | `in`                 |
| 所有键 | `Object.keys`          | `map.keys`        | `d.keys()`           |
| 所有值 | `Object.values`        | `map.values`      | `d.values()`         |
| 遍历   | `for...in` / `entries` | `forEach((k,v))`  | `for k,v in items()` |
| 合并   | `{...a, ...b}`         | `{...a, ...b}`    | `{**a, **b}`         |

---

## 十三、集合 Set

| 能力 | JavaScript    | Dart                | Python                    |
| ---- | ------------- | ------------------- | ------------------------- |
| 创建 | `new Set()`   | `<int>{}` / `Set()` | `set()` / `{1, 2}`        |
| 增   | `add`         | `add`               | `add`                     |
| 删   | `delete`      | `remove`            | `discard` / `remove`      |
| 判断 | `has`         | `contains`          | `in`                      |
| 并集 | 手写 spread   | `union`             | `a \| b` / `.union`       |
| 交集 | 手写 `filter` | `intersection`      | `a & b` / `.intersection` |
| 差集 | 手写 `filter` | `difference`        | `a - b` / `.difference`   |

---

## 十四、JSON / 序列化

| 能力       | JavaScript         | Dart                        | Python               |
| ---------- | ------------------ | --------------------------- | -------------------- |
| 转 JSON    | `JSON.stringify`   | `jsonEncode`                | `json.dumps`         |
| 解析       | `JSON.parse`       | `jsonDecode`                | `json.loads`         |
| 自定义对象 | `toJSON` / reviver | `toJson` / `fromJson`       | `dataclass` + 库     |
| 模型库     | —                  | json_serializable / freezed | pydantic / dataclass |

---

## 十五、解构与展开

| 能力     | JavaScript     | Dart                  | Python            |
| -------- | -------------- | --------------------- | ----------------- |
| 序列解构 | `[a, b] = arr` | records/模式 `(a, b)` | `a, b = lst`      |
| 对象解构 | `{ x } = obj`  | 字段访问              | 无（`**dict`）    |
| 展开     | `...arr`       | `...arr`              | `*lst` / `**dict` |
| 剩余参数 | `...rest`      | —                     | `*rest`           |

---

## 十六、类型系统 / 静态检查

| 能力       | JavaScript        | Dart          | Python              |
| ---------- | ----------------- | ------------- | ------------------- |
| 检查器     | TypeScript        | 内置 analyzer | `mypy` / `pyright`  |
| 严格模式   | `strict`          | 默认强类型    | `--strict`          |
| 泛型       | `<T>`             | `<T>`         | `Generic`/类型参数  |
| 联合类型   | `A \| B`          | `A \| B`      | `Union[A,B]`/`A\|B` |
| 可选       | `?` / `undefined` | `T?`          | `Optional[T]`       |
| 字面量类型 | `'a' \| 'b'`      | 无            | `Literal[...]`      |

---

## 十七、类型系统流派

| 维度         | JavaScript        | Dart            | Python                |
| ------------ | ----------------- | --------------- | --------------------- |
| 检查时机     | 运行时动态        | 静态（可推断）  | 运行时动态            |
| 类型风格     | 结构（duck）      | 名义（nominal） | 结构（duck/Protocol） |
| 名义 vs 结构 | 结构              | 名义 class      | `Protocol` 结构化     |
| 强制转换     | 隐式（松散 `==`） | 显式 `as`       | 显式                  |
| 渐进类型     | TS 叠加           | 原生强类型      | type hints 不强制     |

---

## 十八、空值 / 可选 / 安全访问

| 能力     | JavaScript           | Dart   | Python                      |
| -------- | -------------------- | ------ | --------------------------- |
| 空值     | `null` / `undefined` | `null` | `None`                      |
| 安全访问 | `?.` 可选链          | `?.`   | 无（靠判断/try）            |
| 空合并   | `??`                 | `??`   | `x if x is not None else d` |
| 非空断言 | `!`                  | `!`    | —                           |

---

## 十九、空安全 / flow analysis

| 维度      | JavaScript           | Dart               | Python                    |
| --------- | -------------------- | ------------------ | ------------------------- |
| null 安全 | 无（`undefined`）    | Sound Null Safety  | 类型提示（可选）          |
| 可空标注  | `T \| undefined`(TS) | `T?`               | `Optional[T]`/`T \| None` |
| 空合并    | `??`                 | `??`               | `or`（有坑）              |
| 安全访问  | `?.`                 | `?.`               | `getattr(o,'a',None)`     |
| 流程分析  | TS 收窄              | 类型推广 promotion | mypy 收窄                 |

---

## 二十、类型守卫与窄化

| 能力     | JavaScript            | Dart          | Python            |
| -------- | --------------------- | ------------- | ----------------- |
| 类型判断 | `typeof`/`instanceof` | `is`          | `isinstance`      |
| 类型谓词 | `x is T` 函数         | 自动提升      | `TypeGuard`(3.10) |
| 窄化     | `if`/`switch` 收敛    | `if (x is T)` | `assert`/`if`     |
| 可空收窄 | `!`/`??`/可选链       | `!`/`??`/`?.` | `assert x`/判断   |
| 判别联合 | TS 判别式             | sealed class  | `Literal` 字段    |

---

## 二十一、函数与闭包

| 能力     | JavaScript        | Dart           | Python               |
| -------- | ----------------- | -------------- | -------------------- |
| 定义     | `function` / 箭头 | 函数 / `=>`    | `def` / `lambda`     |
| 默认参数 | ✅                | ✅             | ✅（可变默认有坑）   |
| 命名参数 | 对象解构          | `{required x}` | 关键字参数           |
| 可变参数 | `...args`         | —              | `*args` / `**kwargs` |
| 闭包     | ✅                | ✅             | ✅                   |
| 高阶函数 | ✅                | ✅             | ✅                   |

---

## 二十二、函数式进阶

| 能力     | JavaScript              | Dart           | Python              |
| -------- | ----------------------- | -------------- | ------------------- |
| 柯里化   | 手写/ramda              | 手写           | `functools.partial` |
| 部分应用 | 手写/ramda              | 闭包           | `functools.partial` |
| 组合     | 手写/`flow`             | 手写           | 手写/`toolz`        |
| 管道     | `Array.reduce`/pipeline | 级联 `..`      | `\|>`（3.12）       |
| 惰性求值 | Generator               | `LazyIterable` | 生成器              |
| 记忆化   | lodash.memoize          | 手写           | `functools.cache`   |

---

## 二十三、尾调用优化 TCO

| 维度       | JavaScript         | Dart           | Python              |
| ---------- | ------------------ | -------------- | ------------------- |
| 规范态度   | ES5 严格模式曾要求 | ✅ 支持        | ❌ 不优化           |
| 引擎现实   | V8 已移除          | 编译器复用栈帧 | 无（栈会增长）      |
| 自尾递归   | 不保证             | 不爆栈         | 爆栈风险            |
| 规避手段   | 循环/蹦床          | 直接递归       | 改循环/提限         |
| 深递归上限 | 引擎栈             | 引擎栈         | `setrecursionlimit` |

---

## 二十四、闭包捕获 / 装箱

| 概念      | JavaScript         | Dart           | Python             |
| --------- | ------------------ | -------------- | ------------------ |
| 捕获方式  | 按引用（环境记录） | 按引用（cell） | 按引用（cell）     |
| 变量盒子  | Environment Record | `VariableCell` | `cell`（freevars） |
| 循环陷阱  | `let` 块级解决     | 每次新绑定     | 晚绑定（默认参解） |
| this 捕获 | 箭头函数词法       | 词法 `this`    | 显式 `self`        |
| 逃逸分配  | 堆上 context       | closure 对象   | cell 对象          |

---

## 二十五、函数对象内部结构

| 部件     | JavaScript              | Dart          | Python                          |
| -------- | ----------------------- | ------------- | ------------------------------- |
| 代码体   | `[[Code]]`/字节码       | 编译后机器码  | `__code__`                      |
| 闭包引用 | `[[Scopes]]`            | closure 捕获  | `__closure__`（cells）          |
| 名字     | `fn.name`               | `runtimeType` | `__name__`                      |
| 文档     | JSDoc 注释              | `///` 文档    | `__doc__`                       |
| 参数信息 | `fn.length`/`arguments` | 命名/可选参   | `__defaults__`/`__kwdefaults__` |
| 属性袋   | 可加属性                | 有限          | `__dict__`                      |

---

## 二十六、作用域 / 闭包底层

| 维度       | JavaScript                 | Dart       | Python            |
| ---------- | -------------------------- | ---------- | ----------------- |
| 作用域模型 | 词法（Environment Record） | 词法       | 词法 LEGB         |
| 提升       | `var` 提升/`let` TDZ       | 声明前置   | 定义前不可用      |
| 闭包捕获   | 按引用捕获变量             | 按引用捕获 | cell/freevars     |
| 私有       | `#`/WeakMap                | `_` 库级   | `_`/`__` 名称改编 |

---

## 二十七、this / receiver / self 语义

| 维度      | JavaScript            | Dart           | Python             |
| --------- | --------------------- | -------------- | ------------------ |
| 关键字    | `this`（运行时绑定）  | `this`（静态） | `self`（显式传参） |
| 箭头/嵌套 | 词法捕获外层          | 闭包捕获       | lambda 无 self     |
| 丢失      | 回调丢 this           | —              | 方法引用丢 self    |
| 绑定      | `bind`/`call`/`apply` | —              | 描述符 `__get__`   |

---

## 二十八、类与 OOP（速记）

| 特性   | JavaScript    | Dart            | Python           |
| ------ | ------------- | --------------- | ---------------- |
| 模型   | 原型链        | 类              | 类（多范式）     |
| 继承   | `extends`     | `extends`       | 多继承           |
| 接口   | ❌            | ✅ `implements` | ❌（`Protocol`） |
| Mixin  | ❌            | ✅ `with`       | ✅               |
| 抽象类 | ❌            | ✅ `abstract`   | ✅ `ABC`         |
| 私有   | `#` 前缀      | `_` 前缀        | `_` / `__`       |
| 属性   | getter/setter | `get`/`set`     | `@property`      |

---

## 二十九、原型链 / 继承查找

| 概念     | JavaScript              | Dart             | Python               |
| -------- | ----------------------- | ---------------- | -------------------- |
| 查找机制 | 原型链 `[[Prototype]]`  | superclass 链    | MRO（C3 线性化）     |
| 定义继承 | `class extends`         | `class extends`  | `class(Base)`        |
| 多继承   | ❌（对象混合）          | `mixin` + `with` | ✅ 多继承            |
| 方法解析 | 沿原型链                | 沿 superclass    | `__mro__`            |
| 原型读取 | `Object.getPrototypeOf` | `runtimeType`    | `type()`/`__class__` |

---

## 三十、运算符重载 / 魔术方法

| 能力         | JavaScript                      | Dart            | Python                   |
| ------------ | ------------------------------- | --------------- | ------------------------ |
| 运算符重载   | ❌                              | ✅ `operator +` | ✅ `__add__`             |
| 相等         | 重写 `==`/`Symbol`              | `==`/`hashCode` | `__eq__`/`__hash__`      |
| 字符串化     | `toString`/`Symbol.toPrimitive` | `toString()`    | `__str__`/`__repr__`     |
| 可调用       | 函数即对象                      | `call()`        | `__call__`               |
| 容器协议     | `Symbol.iterator`               | `Iterable`      | `__iter__`/`__getitem__` |
| 生命周期钩子 | —                               | 无              | `__init__`/`__del__`     |

---

## 三十一、元编程 / 反射

| 能力       | JavaScript               | Dart                 | Python               |
| ---------- | ------------------------ | -------------------- | -------------------- |
| 属性拦截   | `Proxy`/`defineProperty` | 无                   | `__getattr__`/描述符 |
| 运行时反射 | `Object.keys`/`Reflect`  | `dart:mirrors`(弃用) | `inspect`/`getattr`  |
| 动态调用   | `obj[m]`/`Reflect.apply` | 受限                 | `getattr`/`eval`     |
| 装饰器/宏  | 装饰器提案               | 注解                 | `@decorator`/宏      |
| 类工厂     | 返回 class               | 命名构造             | 元类 `type()`        |

---

## 三十二、属性查找 / 描述符

| 概念       | JavaScript                 | Dart            | Python                     |
| ---------- | -------------------------- | --------------- | -------------------------- |
| 自有属性   | `getOwnPropertyDescriptor` | 字段            | `__dict__`                 |
| 继承查找   | 原型链/`in`                | superclass 字段 | MRO                        |
| 拦截       | `Proxy`/getter-setter      | `noSuchMethod`  | `__getattr__`/描述符       |
| 描述符协议 | ❌（访问器）               | ❌              | `__get__`/`__set__`        |
| 动态加属性 | 默认可                     | ❌（静态）      | 默认可（`__slots__` 限制） |

---

## 三十三、不可变与冻结

| 能力     | JavaScript       | Dart                | Python                   |
| -------- | ---------------- | ------------------- | ------------------------ |
| 浅冻结   | `Object.freeze`  | 无内置              | `frozenset`/`tuple`      |
| 深不可变 | immer/手写       | `@immutable` 类     | `tuple`/`NamedTuple`     |
| 只读类型 | TS `Readonly<T>` | `final`             | `Final`(typing)          |
| 值对象   | 无               | `record`/freezed    | `dataclass(frozen=True)` |
| 副本修改 | `{...o, k:v}`    | `copyWith`(freezed) | `dataclasses.replace`    |

---

## 三十四、值语义 vs 引用语义

| 维度      | JavaScript               | Dart            | Python            |
| --------- | ------------------------ | --------------- | ----------------- |
| 基元/对象 | 原始值 vs 引用           | 一切皆对象      | 一切皆对象        |
| 变量含义  | 值/引用绑定              | 引用绑定        | 名字→对象（绑定） |
| 拷贝      | 浅拷贝/`structuredClone` | `copyWith`/手写 | 赋值即别名/`copy` |
| 传参      | 按共享传值               | 按对象引用      | 按对象引用        |
| 可变默认  | —                        | —               | 可变默认共享坑    |

---

## 三十五、对象与内存布局

| 维度     | JavaScript（V8） | Dart                    | Python（CPython）         |
| -------- | ---------------- | ----------------------- | ------------------------- |
| 对象头   | Map（隐藏类）    | 类标签 + 位图           | `PyObject`(refcount+type) |
| 属性存储 | 内联字段 + 补全  | 具名字段                | `__dict__` / `__slots__`  |
| 形状变化 | 隐藏类迁移       | 固定布局                | 动态 `__dict__`           |
| 加速     | 内联缓存 ICF     | AOT 直调                | 属性缓存                  |
| 数字     | 指针标记/堆箱化  | `int/double`（VM 拆箱） | `int`/`float` 对象        |

---

## 三十六、GC 与内存回收

| 维度     | JavaScript          | Dart                      | Python            |
| -------- | ------------------- | ------------------------- | ----------------- |
| 主策略   | 分代标记清除        | 分代（Young/Old）         | 引用计数 + 分代   |
| 循环引用 | ✅ 处理             | ✅                        | GC 兜底           |
| 弱引用   | `WeakRef`/`WeakMap` | `Expando`/`WeakReference` | `weakref`         |
| 手动释放 | ❌                  | ❌                        | 计数归零（`del`） |
| 触发时机 | 引擎控制            | 引擎控制                  | 阈值触发          |

---

## 三十七、迭代 / 生成器 / 推导

| 能力     | JavaScript            | Dart              | Python             |
| -------- | --------------------- | ----------------- | ------------------ |
| 列表推导 | 无（`map/filter`）    | 集合字面量条件    | `[x for x in ...]` |
| 生成器   | `function*` / `yield` | `sync*` / `yield` | `yield`            |
| for 循环 | `for` / `for...of`    | `for-in`          | `for-in`           |
| 惰性序列 | 迭代器协议            | `LazyIterable`    | 生成器表达式       |

---

## 三十八、迭代器协议

| 概念     | JavaScript                 | Dart              | Python                   |
| -------- | -------------------------- | ----------------- | ------------------------ |
| 协议     | `[Symbol.iterator]`        | `iterator` getter | `__iter__`/`__next__`    |
| 取下一   | `it.next()`→`{value,done}` | `moveNext()`→bool | `next(it)`→StopIteration |
| 消费     | `for...of`                 | `for-in`          | `for-in`                 |
| 惰性生成 | `function*`                | `sync*`           | `yield` 生成器           |
| 展开     | `[...it]`                  | `[...it]`         | `list(it)`               |

---

## 三十九、正则表达式

| 能力     | JavaScript               | Dart               | Python            |
| -------- | ------------------------ | ------------------ | ----------------- |
| 定义     | `/re/flags`              | `RegExp(r'')`      | `re.compile(r'')` |
| 测试     | `re.test`                | `hasMatch`         | `re.search`       |
| 全部匹配 | `matchAll`               | `allMatches`       | `findall`         |
| 替换     | `replace` / `replaceAll` | `replaceAllMapped` | `re.sub`          |
| 分组捕获 | `exec()[1]`              | `match.group(1)`   | `match.group(1)`  |

---

## 四十、正则进阶

| 能力          | JavaScript      | Dart                 | Python             |
| ------------- | --------------- | -------------------- | ------------------ |
| 命名组        | `(?<n>..)`      | 同                   | `(?P<n>..)`        |
| 前瞻          | `(?=)`/`(?!)`   | 同                   | 同                 |
| 后顾          | `(?<=)`/`(?<!)` | 受限                 | 支持               |
| 非贪婪        | `*?`            | `*?`                 | `*?`               |
| 全局/多行标志 | `/g` `/m` `/s`  | `multiLine`/`dotAll` | `re.M`/`re.S`      |
| 编译缓存      | 每次新 `RegExp` | 同                   | `re.compile`(缓存) |

---

## 四十一、异步与并发

| 能力     | JavaScript        | Dart              | Python                |
| -------- | ----------------- | ----------------- | --------------------- |
| 异步原语 | `Promise`         | `Future`          | `asyncio.Task`        |
| 语法     | `async` / `await` | `async` / `await` | `async` / `await`     |
| 并行     | `Promise.all`     | `Future.wait`     | `asyncio.gather`      |
| 流       | AsyncIterable     | `Stream`          | async generator       |
| 真并行   | Web Worker        | `Isolate`         | `multiprocessing`     |
| 多线程   | —                 | —                 | `threading`（受 GIL） |

---

## 四十二、并发原语细节

| 能力      | JavaScript | Dart       | Python              |
| --------- | ---------- | ---------- | ------------------- |
| 隔离单元  | Web Worker | `Isolate`  | `Process`           |
| 锁        | 手写       | `Lock` 包  | `threading.Lock`    |
| 信号量    | —          | —          | `asyncio.Semaphore` |
| 原子操作  | Atomics    | 受限       | —                   |
| 通道/队列 | 手写       | `SendPort` | `queue.Queue`       |
| 竞态防护  | 单线程安全 | 单线程安全 | GIL 部分保证        |

---

## 四十三、定时与延时

| 能力       | JavaScript        | Dart                | Python             |
| ---------- | ----------------- | ------------------- | ------------------ |
| 单次延时   | `setTimeout`      | `Timer`             | `threading.Timer`  |
| 周期       | `setInterval`     | `Timer.periodic`    | 循环 / APScheduler |
| 休眠       | 手写 sleep        | `Future.delayed`    | `time.sleep`       |
| 取消       | `clearTimeout`    | `timer.cancel()`    | `Timer.cancel()`   |
| 微任务     | `queueMicrotask`  | `scheduleMicrotask` | 事件循环           |
| 高精度计时 | `performance.now` | `Stopwatch`         | `perf_counter`     |

---

## 四十四、事件循环底层机制

| 维度       | JavaScript                 | Dart               | Python          |
| ---------- | -------------------------- | ------------------ | --------------- |
| 队列       | 微任务 + 宏任务            | 微任务 + 事件队列  | 就绪回调 + task |
| 微任务来源 | `Promise`/`queueMicrotask` | `Future.microtask` | 协程步          |
| 检查点     | 栈清空后逐条排空           | 帧末排空微任务     | loop 迭代       |
| 阻塞       | 同步阻塞整个循环           | 同（单 Isolate）   | 同（阻塞循环）  |

---

## 四十五、并发内存模型

| 维度     | JavaScript              | Dart                | Python         |
| -------- | ----------------------- | ------------------- | -------------- |
| 执行保证 | run-to-completion       | 单 Isolate 内顺序   | GIL 串行化     |
| 并行单元 | Agent/Worker            | Isolate             | Thread/Process |
| 内存共享 | SharedArrayBuffer       | 不共享（send 拷贝） | 共享（受 GIL） |
| 同步原语 | Atomics(happens-before) | 消息传递            | Lock/Event     |
| 真并行   | ✅(Worker)              | ✅(Isolate)         | ❌(GIL, CPU)   |

---

## 四十六、await 的规范展开

| 阶段         | JavaScript          | Dart               | Python            |
| ------------ | ------------------- | ------------------ | ----------------- |
| 挂起原语     | `await`→Promise job | `await`→event loop | `await`→coroutine |
| 恢复调度     | 微任务 microtask    | 微任务队列         | loop 回调         |
| 非 awaitable | 立即完成            | 立即               | `TypeError`       |
| 循环模型     | 宏/微任务           | 事件/微任务        | asyncio loop      |
| 取消         | AbortController     | Future 无取消      | `Task.cancel()`   |

---

## 四十七、异常处理

| 能力   | JavaScript            | Dart                   | Python             |
| ------ | --------------------- | ---------------------- | ------------------ |
| 捕获   | `try / catch`         | `try / catch`          | `try / except`     |
| 抛出   | `throw`               | `throw`                | `raise`            |
| 收尾   | `finally`             | `finally`              | `finally`          |
| 重抛   | `throw e`             | `rethrow`              | `raise`            |
| 自定义 | `class extends Error` | `implements Exception` | `class(Exception)` |

---

## 四十八、错误处理范式

| 范式          | JavaScript       | Dart          | Python                 |
| ------------- | ---------------- | ------------- | ---------------------- |
| 异常式        | `throw`/`try`    | `throw`/`try` | `raise`/`try`          |
| Result/Option | neverthrow       | sealed 返回   | returns/第三方         |
| 可空返回      | `T \| null`      | `T?`          | `Optional[T]`          |
| 传播          | `throw` 上抛     | `rethrow`     | `raise` 上抛           |
| 聚合错误      | `AggregateError` | `catch` 组合  | `ExceptionGroup`(3.11) |

---

## 四十九、模块与包

| 能力     | JavaScript   | Dart                   | Python            |
| -------- | ------------ | ---------------------- | ----------------- |
| 导入     | `import {x}` | `import 'x.dart'`      | `from x import y` |
| 命名空间 | `as`         | `as` / `show` / `hide` | `import x as y`   |
| 动态导入 | `import()`   | `deferred as`          | `importlib`       |
| 相对导入 | `./`         | `../`                  | `.` / `..`        |
| 包管理   | npm / pnpm   | pub                    | pip / poetry      |

---

## 五十、模块加载阶段

| 阶段     | JavaScript（ESM） | Dart       | Python           |
| -------- | ----------------- | ---------- | ---------------- |
| 解析     | Parse             | 编译       | 编译字节码       |
| 链接     | Link（实例化）    | 静态链接   | import 解析      |
| 求值     | Evaluate          | 顶层初始化 | 执行模块体       |
| 提升     | 声明 hoist（TDZ） | 无         | 无（运行时绑定） |
| 循环依赖 | 活绑定            | 受限       | 部分（易错）     |
| 缓存     | Module Registry   | 一次性     | `sys.modules`    |

---

## 五十一、包管理与版本兼容

| 维度     | JavaScript     | Dart           | Python            |
| -------- | -------------- | -------------- | ----------------- |
| 包管理   | npm / pnpm     | pub            | pip / poetry / uv |
| 版本声明 | `package.json` | `pubspec.yaml` | `pyproject.toml`  |
| 锁文件   | `pnpm-lock`    | `pubspec.lock` | `poetry.lock`     |
| 版本范围 | `^` `~`        | `^` `~`        | `~=` / caret      |
| 私有源   | registry       | hosted         | index-url         |
| 隔离方式 | node_modules   | 全局缓存       | `venv` / conda    |

---

## 五十二、运行 / 打包 / 发布

| 维度         | JavaScript     | Dart               | Python        |
| ------------ | -------------- | ------------------ | ------------- |
| 直接运行     | `node x.js`    | `dart run`         | `python x.py` |
| 编译         | JIT(V8)        | JIT + AOT          | 字节码        |
| AOT 产物     | 打包器 bundle  | `dart compile exe` | —             |
| 前端构建     | Vite / Webpack | `build_runner`     | —             |
| 发布仓库     | npm            | pub.dev            | PyPI          |
| 单文件可执行 | pkg(有限)      | 原生支持           | PyInstaller   |

---

## 五十三、执行模型 / 编译流水线

| 阶段     | JavaScript（V8）    | Dart                  | Python（CPython）   |
| -------- | ------------------- | --------------------- | ------------------- |
| 解析     | Parser → AST        | Analyzer → Kernel(IL) | `compile()` → AST   |
| 字节码   | Ignition（解释器）  | 无（直走 JIT/AOT）    | 字节码 + eval 循环  |
| 优化编译 | TurboFan（JIT）     | JIT / AOT（机器码）   | 3.13 试验性 tier    |
| 运行形态 | JIT                 | JIT + AOT             | 字节码解释          |
| 规范文档 | ECMAScript(ecma262) | Dart Language Spec    | Python Language Ref |

---

## 五十四、规范级抽象操作 / 数据模型

| 概念     | JavaScript（ECMAScript AO） | Dart             | Python（data model）    |
| -------- | --------------------------- | ---------------- | ----------------------- |
| 类型判定 | `Type(x)`                   | 静态类型 + `is`  | `type()`                |
| 转原始值 | `ToPrimitive`               | `toString()`     | `__str__`/`__format__`  |
| 转数字   | `ToNumber`                  | `parse`/`as num` | `__float__`/`__index__` |
| 相等算法 | `SameValueZero`/`===`       | `==` 重载        | `__eq__`/`is`           |
| 属性键   | `ToPropertyKey`             | String/`Symbol`  | `__hash__`/`__eq__`     |
| 完成记录 | Completion Record           | 返回/抛出        | 帧 block/异常           |

---

## 五十五、文件与 IO

| 能力     | JavaScript(Node)   | Dart                    | Python                |
| -------- | ------------------ | ----------------------- | --------------------- |
| 读文本   | `fs.readFileSync`  | `File.readAsStringSync` | `open().read()`       |
| 写文本   | `fs.writeFileSync` | `File.writeAsString`    | `open('w').write`     |
| 存在判断 | `fs.existsSync`    | `File.existsSync`       | `os.path.exists`      |
| 路径拼接 | `path.join`        | `p.join`（path 包）     | `os.path.join`        |
| 遍历目录 | `fs.readdir`       | `listSync`              | `os.listdir` / `glob` |

---

## 五十六、环境变量与命令行

| 能力       | JavaScript(Node)   | Dart                   | Python         |
| ---------- | ------------------ | ---------------------- | -------------- |
| 环境变量   | `process.env`      | `Platform.environment` | `os.environ`   |
| 命令行参数 | `process.argv`     | `main(List args)`      | `sys.argv`     |
| 平台判断   | `process.platform` | `Platform.isX`         | `sys.platform` |

---

## 五十七、格式化 / 输出

| 能力     | JavaScript            | Dart                   | Python        |
| -------- | --------------------- | ---------------------- | ------------- |
| 打印     | `console.log`         | `print`                | `print`       |
| 对齐填充 | `padStart` / `padEnd` | `padLeft` / `padRight` | f-string 对齐 |
| 小数精度 | `toFixed`             | `toStringAsFixed`      | `f'{x:.2f}'`  |

---

## 五十八、调试与测试

| 能力     | JavaScript              | Dart          | Python                |
| -------- | ----------------------- | ------------- | --------------------- |
| 调试器   | Chrome / Node inspector | Dart DevTools | pdb / debugpy         |
| 单元测试 | Vitest / Jest           | `test` 包     | `unittest` / `pytest` |
| 断言     | `assert`                | `assert`      | `assert`              |
| 覆盖率   | istanbul / c8           | `--coverage`  | coverage.py           |

---

## 五十九、常用标准库 / 生态

| 场景   | JavaScript       | Dart           | Python                |
| ------ | ---------------- | -------------- | --------------------- |
| 日期   | dayjs / date-fns | `intl`         | `datetime` / pendulum |
| HTTP   | axios / fetch    | `http` / `dio` | `requests` / httpx    |
| 校验   | zod              | validators     | pydantic              |
| 工具库 | lodash           | `collection`   | 内置丰富              |
| CLI    | commander        | `args`         | argparse / typer      |
| 测试   | Vitest / Jest    | `test`         | `pytest`              |

---

## 六十、命名与惯用法

| 惯例      | JavaScript    | Dart                | Python        |
| --------- | ------------- | ------------------- | ------------- |
| 变量/函数 | camelCase     | camelCase           | snake_case    |
| 类/类型   | PascalCase    | PascalCase          | PascalCase    |
| 常量      | `UPPER_SNAKE` | `const` / camelCase | `UPPER_SNAKE` |
| 文件名    | kebab / camel | snake_case          | snake_case    |
| 私有      | `#` / `_`     | `_`                 | `_` / `__`    |

---

## 六十一、易混点对照（重点）

### 61.1 同名不同义

| 名字     | JavaScript           | Dart                      | Python                  |
| -------- | -------------------- | ------------------------- | ----------------------- |
| `length` | 属性 `s.length`      | 属性                      | 内置 `len()`            |
| `map`    | 数组方法（返回数组） | 方法（返回惰性 Iterable） | 内置函数 / `dict` 类型  |
| `filter` | 数组方法             | 无（用 `where`）          | 内置函数（需 `list()`） |
| `pop`    | 数组尾弹出           | 无（用 `removeLast`）     | 列表尾弹出 / `dict.pop` |
| `==`     | 松散（会转换）       | 内容相等（可重载）        | 值相等（`is` 判身份）   |

### 61.2 类型系统易混

| 点       | JavaScript           | Dart           | Python        |
| -------- | -------------------- | -------------- | ------------- |
| 空值个数 | `null` + `undefined` | 只有 `null`    | 只有 `None`   |
| 整数     | `number`（float64）  | `int`（64 位） | 任意精度      |
| 真假判定 | 大量 falsy 值        | 仅 `bool`      | 空容器/0 为假 |
| 类型注解 | 运行时无关           | 静态强制       | 运行时不强制  |

### 61.3 概念错位提醒

```
JS 的 map/filter 返回数组；Dart 的 map/where 返回惰性 Iterable（要 .toList()）！
JS 的 == 会做类型转换，Python 的 == 比内容、is 比身份，Dart 的 == 可重载。
Python 的 int 不会溢出；JS 的 number 是大浮点；Dart 的 int 是 64 位。
JS 有 null 和 undefined 两个空值；Dart/Python 各只有一个。
```

---

## 六十二、速记卡（一眼记忆版）

```
声明        JS let/const        Dart var/final        Python x = 1
插值        ${x}                '$x'                 f'{x}'
长度        s.length            s.length             len(s)
转整数      parseInt(x)         int.parse(s)         int(s)
类型判断    typeof x            x is T               isinstance(x, T)
列表映射    arr.map(f)          list.map(f).toList   [f(x) for x in lst]
列表过滤    arr.filter(f)       list.where(f)        [x for x if f(x)]
合并数组    [...a, ...b]        [...a, ...b]         [*a, *b]
合并字典    {...a, ...b}        {...a, ...b}         {**a, **b}
异步并行    Promise.all         Future.wait          asyncio.gather
抛异常      throw new Error     throw Exception      raise Exception
打印        console.log         print                print
空合并      x ?? d              x ?? d               x or d (有坑)
JSON        JSON.stringify      jsonEncode           json.dumps
文件读      fs.readFile         File.readAsString    open().read()
按位或      a | b               a | b                a | b
模式匹配    switch-case         sealed + match       match-case(3.10)
深拷贝      structuredClone     copyWith/手写        copy.deepcopy
上下文      try-finally         using/dispose        with 语句
装饰器      装饰器提案          @override/@xxx       @decorator
魔术方法    Symbol/toString     operator+            __add__/__str__
反射        Proxy/Reflect       mirrors(弃用)        getattr/inspect
记忆化      lodash.memoize      手写                 functools.cache
不可变      Object.freeze       @immutable/final     frozenset/tuple
执行流水线  AST→Ignition→TF     Kernel→AOT/JIT       AST→字节码
内存模型    run-to-completion   Isolate堆隔离        GIL串行化
原型链      [[Prototype]]链     superclass链         MRO(C3)
迭代器      Symbol.iterator     moveNext()           __iter__/__next__
驻留        引擎自动            String.intern()      sys.intern()
整数上限    2^53 MAX_SAFE       64 位                任意精度
GC          分代标记清除        Young/Old 分代       引用计数+分代
null安全    无 undefined        Sound Null Safety    类型提示可选
模块阶段    Parse/Link/Eval     编译+顶层初始化      字节码+sys.modules
补码位表示  32 位(位运算)       64 位补码            任意精度补码
TCO         V8 已移除           编译器支持           不优化
闭包捕获    Environment Record  VariableCell         cell(freevars)
函数结构    [[Code]]/[[Scopes]] 机器码+closure       __code__/__closure__
```

---

## 相关链接

- [JS · Dart · Python 三大语言 API 与底层机制对比（深度版）](/dev-knowledge/cross-domain/architecture-and-system/js-dart-python-api-comparison)
- [React 19 vs Vue 3 vs Flutter 常用 API 与易混点速查](/dev-knowledge/cross-domain/architecture-and-system/framework-common-api-cheatsheet)
