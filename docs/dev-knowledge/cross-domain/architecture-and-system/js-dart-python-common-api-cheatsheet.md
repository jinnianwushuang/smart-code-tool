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

## 三、字符串

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

## 四、数组 / 列表

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

## 五、对象 / Map / 字典

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

## 六、集合 Set

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

## 七、数字与数学

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

## 八、日期与时间

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

## 九、正则表达式

| 能力     | JavaScript               | Dart               | Python            |
| -------- | ------------------------ | ------------------ | ----------------- |
| 定义     | `/re/flags`              | `RegExp(r'')`      | `re.compile(r'')` |
| 测试     | `re.test`                | `hasMatch`         | `re.search`       |
| 全部匹配 | `matchAll`               | `allMatches`       | `findall`         |
| 替换     | `replace` / `replaceAll` | `replaceAllMapped` | `re.sub`          |
| 分组捕获 | `exec()[1]`              | `match.group(1)`   | `match.group(1)`  |

---

## 十、JSON / 序列化

| 能力       | JavaScript         | Dart                        | Python               |
| ---------- | ------------------ | --------------------------- | -------------------- |
| 转 JSON    | `JSON.stringify`   | `jsonEncode`                | `json.dumps`         |
| 解析       | `JSON.parse`       | `jsonDecode`                | `json.loads`         |
| 自定义对象 | `toJSON` / reviver | `toJson` / `fromJson`       | `dataclass` + 库     |
| 模型库     | —                  | json_serializable / freezed | pydantic / dataclass |

---

## 十一、空值 / 可选 / 安全访问

| 能力     | JavaScript           | Dart   | Python                      |
| -------- | -------------------- | ------ | --------------------------- |
| 空值     | `null` / `undefined` | `null` | `None`                      |
| 安全访问 | `?.` 可选链          | `?.`   | 无（靠判断/try）            |
| 空合并   | `??`                 | `??`   | `x if x is not None else d` |
| 非空断言 | `!`                  | `!`    | —                           |

---

## 十二、解构与展开

| 能力     | JavaScript     | Dart                  | Python            |
| -------- | -------------- | --------------------- | ----------------- |
| 序列解构 | `[a, b] = arr` | records/模式 `(a, b)` | `a, b = lst`      |
| 对象解构 | `{ x } = obj`  | 字段访问              | 无（`**dict`）    |
| 展开     | `...arr`       | `...arr`              | `*lst` / `**dict` |
| 剩余参数 | `...rest`      | —                     | `*rest`           |

---

## 十三、函数与闭包

| 能力     | JavaScript        | Dart           | Python               |
| -------- | ----------------- | -------------- | -------------------- |
| 定义     | `function` / 箭头 | 函数 / `=>`    | `def` / `lambda`     |
| 默认参数 | ✅                | ✅             | ✅（可变默认有坑）   |
| 命名参数 | 对象解构          | `{required x}` | 关键字参数           |
| 可变参数 | `...args`         | —              | `*args` / `**kwargs` |
| 闭包     | ✅                | ✅             | ✅                   |
| 高阶函数 | ✅                | ✅             | ✅                   |

---

## 十四、迭代 / 生成器 / 推导

| 能力     | JavaScript            | Dart              | Python             |
| -------- | --------------------- | ----------------- | ------------------ |
| 列表推导 | 无（`map/filter`）    | 集合字面量条件    | `[x for x in ...]` |
| 生成器   | `function*` / `yield` | `sync*` / `yield` | `yield`            |
| for 循环 | `for` / `for...of`    | `for-in`          | `for-in`           |
| 惰性序列 | 迭代器协议            | `LazyIterable`    | 生成器表达式       |

---

## 十五、模块与包

| 能力     | JavaScript   | Dart                   | Python            |
| -------- | ------------ | ---------------------- | ----------------- |
| 导入     | `import {x}` | `import 'x.dart'`      | `from x import y` |
| 命名空间 | `as`         | `as` / `show` / `hide` | `import x as y`   |
| 动态导入 | `import()`   | `deferred as`          | `importlib`       |
| 相对导入 | `./`         | `../`                  | `.` / `..`        |
| 包管理   | npm / pnpm   | pub                    | pip / poetry      |

---

## 十六、异步与并发

| 能力     | JavaScript        | Dart              | Python                |
| -------- | ----------------- | ----------------- | --------------------- |
| 异步原语 | `Promise`         | `Future`          | `asyncio.Task`        |
| 语法     | `async` / `await` | `async` / `await` | `async` / `await`     |
| 并行     | `Promise.all`     | `Future.wait`     | `asyncio.gather`      |
| 流       | AsyncIterable     | `Stream`          | async generator       |
| 真并行   | Web Worker        | `Isolate`         | `multiprocessing`     |
| 多线程   | —                 | —                 | `threading`（受 GIL） |

---

## 十七、异常处理

| 能力   | JavaScript            | Dart                   | Python             |
| ------ | --------------------- | ---------------------- | ------------------ |
| 捕获   | `try / catch`         | `try / catch`          | `try / except`     |
| 抛出   | `throw`               | `throw`                | `raise`            |
| 收尾   | `finally`             | `finally`              | `finally`          |
| 重抛   | `throw e`             | `rethrow`              | `raise`            |
| 自定义 | `class extends Error` | `implements Exception` | `class(Exception)` |

---

## 十八、文件与 IO

| 能力     | JavaScript(Node)   | Dart                    | Python                |
| -------- | ------------------ | ----------------------- | --------------------- |
| 读文本   | `fs.readFileSync`  | `File.readAsStringSync` | `open().read()`       |
| 写文本   | `fs.writeFileSync` | `File.writeAsString`    | `open('w').write`     |
| 存在判断 | `fs.existsSync`    | `File.existsSync`       | `os.path.exists`      |
| 路径拼接 | `path.join`        | `p.join`（path 包）     | `os.path.join`        |
| 遍历目录 | `fs.readdir`       | `listSync`              | `os.listdir` / `glob` |

---

## 十九、环境变量与命令行

| 能力       | JavaScript(Node)   | Dart                   | Python         |
| ---------- | ------------------ | ---------------------- | -------------- |
| 环境变量   | `process.env`      | `Platform.environment` | `os.environ`   |
| 命令行参数 | `process.argv`     | `main(List args)`      | `sys.argv`     |
| 平台判断   | `process.platform` | `Platform.isX`         | `sys.platform` |

---

## 二十、格式化 / 输出

| 能力     | JavaScript            | Dart                   | Python        |
| -------- | --------------------- | ---------------------- | ------------- |
| 打印     | `console.log`         | `print`                | `print`       |
| 对齐填充 | `padStart` / `padEnd` | `padLeft` / `padRight` | f-string 对齐 |
| 小数精度 | `toFixed`             | `toStringAsFixed`      | `f'{x:.2f}'`  |

---

## 二十一、类与 OOP（速记）

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

## 二十二、调试与测试

| 能力     | JavaScript              | Dart          | Python                |
| -------- | ----------------------- | ------------- | --------------------- |
| 调试器   | Chrome / Node inspector | Dart DevTools | pdb / debugpy         |
| 单元测试 | Vitest / Jest           | `test` 包     | `unittest` / `pytest` |
| 断言     | `assert`                | `assert`      | `assert`              |
| 覆盖率   | istanbul / c8           | `--coverage`  | coverage.py           |

---

## 二十三、常用标准库 / 生态

| 场景   | JavaScript       | Dart           | Python                |
| ------ | ---------------- | -------------- | --------------------- |
| 日期   | dayjs / date-fns | `intl`         | `datetime` / pendulum |
| HTTP   | axios / fetch    | `http` / `dio` | `requests` / httpx    |
| 校验   | zod              | validators     | pydantic              |
| 工具库 | lodash           | `collection`   | 内置丰富              |
| CLI    | commander        | `args`         | argparse / typer      |
| 测试   | Vitest / Jest    | `test`         | `pytest`              |

---

## 二十四、命名与惯用法

| 惯例      | JavaScript    | Dart                | Python        |
| --------- | ------------- | ------------------- | ------------- |
| 变量/函数 | camelCase     | camelCase           | snake_case    |
| 类/类型   | PascalCase    | PascalCase          | PascalCase    |
| 常量      | `UPPER_SNAKE` | `const` / camelCase | `UPPER_SNAKE` |
| 文件名    | kebab / camel | snake_case          | snake_case    |
| 私有      | `#` / `_`     | `_`                 | `_` / `__`    |

---

## 二十五、易混点对照（重点）

### 25.1 同名不同义

| 名字     | JavaScript           | Dart                      | Python                  |
| -------- | -------------------- | ------------------------- | ----------------------- |
| `length` | 属性 `s.length`      | 属性                      | 内置 `len()`            |
| `map`    | 数组方法（返回数组） | 方法（返回惰性 Iterable） | 内置函数 / `dict` 类型  |
| `filter` | 数组方法             | 无（用 `where`）          | 内置函数（需 `list()`） |
| `pop`    | 数组尾弹出           | 无（用 `removeLast`）     | 列表尾弹出 / `dict.pop` |
| `==`     | 松散（会转换）       | 内容相等（可重载）        | 值相等（`is` 判身份）   |

### 25.2 类型系统易混

| 点       | JavaScript           | Dart           | Python        |
| -------- | -------------------- | -------------- | ------------- |
| 空值个数 | `null` + `undefined` | 只有 `null`    | 只有 `None`   |
| 整数     | `number`（float64）  | `int`（64 位） | 任意精度      |
| 真假判定 | 大量 falsy 值        | 仅 `bool`      | 空容器/0 为假 |
| 类型注解 | 运行时无关           | 静态强制       | 运行时不强制  |

### 25.3 概念错位提醒

```
JS 的 map/filter 返回数组；Dart 的 map/where 返回惰性 Iterable（要 .toList()）！
JS 的 == 会做类型转换，Python 的 == 比内容、is 比身份，Dart 的 == 可重载。
Python 的 int 不会溢出；JS 的 number 是大浮点；Dart 的 int 是 64 位。
JS 有 null 和 undefined 两个空值；Dart/Python 各只有一个。
```

---

## 二十六、速记卡（一眼记忆版）

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
```

---

## 相关链接

- [JS · Dart · Python 三大语言 API 与底层机制对比（深度版）](/dev-knowledge/cross-domain/architecture-and-system/js-dart-python-api-comparison)
- [React 19 vs Vue 3 vs Flutter 常用 API 与易混点速查](/dev-knowledge/cross-domain/architecture-and-system/framework-common-api-cheatsheet)
