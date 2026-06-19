# Python 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-19  
> **适用对象**: Python 开发人员、数据科学家、后端工程师

---

## 目录

1. [基础语法](#1-基础语法)
2. [数据结构](#2-数据结构)
3. [控制流](#3-控制流)
4. [函数](#4-函数)
5. [面向对象](#5-面向对象)
6. [模块和包](#6-模块和包)
7. [文件操作](#7-文件操作)
8. [异常处理](#8-异常处理)
9. [列表推导式](#9-列表推导式)
10. [装饰器](#10-装饰器)
11. [生成器](#11-生成器)
12. [上下文管理器](#12-上下文管理器)
13. [正则表达式](#13-正则表达式)
14. [日期时间](#14-日期时间)
15. [并发编程](#15-并发编程)
16. [常用标准库](#16-常用标准库)
17. [虚拟环境](#17-虚拟环境)
18. [代码规范](#18-代码规范)
19. [调试技巧](#19-调试技巧)
20. [性能优化](#20-性能优化)

---

## 1. 基础语法

### 1.1 变量和数据类型

```python
# 基本数据类型
integer = 42              # int
floating = 3.14           # float
string = "Hello"          # str
boolean = True            # bool
none_value = None         # NoneType

# 类型检查
type(variable)            # 返回类型
isinstance(var, int)      # 检查类型

# 类型转换
int("42")                 # 字符串转整数
float("3.14")             # 字符串转浮点
str(42)                   # 数字转字符串
bool(1)                   # 转为布尔值

# 多重赋值
a, b, c = 1, 2, 3
x = y = z = 0
```

### 1.2 字符串操作

```python
# 字符串定义
single = 'Hello'
double = "World"
triple = """Multi
line
string"""

# 字符串格式化
name = "Alice"
age = 25

# f-string (推荐)
f"Name: {name}, Age: {age}"
f"Result: {2 + 2}"
f"Pi: {3.14159:.2f}"      # 保留2位小数

# format()
"Name: {}, Age: {}".format(name, age)
"Name: {n}, Age: {a}".format(n=name, a=age)

# % 格式化
"Name: %s, Age: %d" % (name, age)

# 常用方法
text = "  Hello World  "
text.strip()              # 去除空格
text.lower()              # 转小写
text.upper()              # 转大写
text.title()              # 标题格式
text.replace("Hello", "Hi")
text.split(" ")           # 分割为列表
"-".join(["a", "b", "c"]) # 连接列表
text.startswith("Hello")  # 检查开头
text.endswith("World")    # 检查结尾
text.find("World")        # 查找位置
text.count("l")           # 计数

# 字符串切片
text = "Hello World"
text[0]                   # 'H'
text[-1]                  # 'd'
text[0:5]                 # 'Hello'
text[6:]                  # 'World'
text[::-1]                # 反转字符串
```

### 1.3 运算符

```python
# 算术运算符
+ - * /                   # 加减乘除
//                        # 整除
%                         # 取模
**                        # 幂运算

# 比较运算符
== != < > <= >=

# 逻辑运算符
and or not

# 成员运算符
in not in

# 身份运算符
is is not

# 赋值运算符
= += -= *= /= //= %= **=

# 位运算符
& | ^ ~ << >>
```

### 1.4 输入输出

```python
# 输入
name = input("Enter name: ")
age = int(input("Enter age: "))

# 输出
print("Hello")
print("Name:", name)
print(f"Name: {name}")
print("Hello", "World", sep="-", end="!\n")

# 文件输出
with open("output.txt", "w") as f:
    f.write("Hello\n")
    print("World", file=f)
```

---

## 2. 数据结构

### 2.1 列表 (List)

```python
# 创建列表
fruits = ["apple", "banana", "cherry"]
numbers = list(range(10))
empty = []

# 访问元素
fruits[0]                 # 'apple'
fruits[-1]                # 'cherry'
fruits[1:3]               # ['banana', 'cherry']

# 修改元素
fruits[0] = "orange"

# 添加元素
fruits.append("grape")    # 末尾添加
fruits.insert(1, "kiwi")  # 指定位置插入
fruits.extend(["mango"])  # 扩展列表

# 删除元素
fruits.remove("banana")   # 删除指定值
fruits.pop()              # 删除并返回最后一个
fruits.pop(0)             # 删除并返回指定位置
del fruits[0]             # 删除元素
fruits.clear()            # 清空列表

# 列表操作
len(fruits)               # 长度
"apple" in fruits         # 检查存在
fruits.index("apple")     # 查找索引
fruits.count("apple")     # 计数
fruits.sort()             # 排序（原地）
fruits.reverse()          # 反转（原地）
sorted(fruits)            # 返回新排序列表

# 列表复制
copy1 = fruits[:]         # 切片复制
copy2 = fruits.copy()     # copy方法
copy3 = list(fruits)      # list构造函数
```

### 2.2 元组 (Tuple)

```python
# 创建元组
coordinates = (10, 20)
single = (1,)             # 单元素元组
empty = ()

# 访问元素
coordinates[0]            # 10

# 元组解包
x, y = coordinates
a, b, c = 1, 2, 3

# 元组操作
len(coordinates)
coordinates.count(10)
coordinates.index(20)

# 不可变性
# coordinates[0] = 5     # Error!
```

### 2.3 字典 (Dictionary)

```python
# 创建字典
person = {
    "name": "Alice",
    "age": 25,
    "city": "Beijing"
}

# 访问元素
person["name"]            # 'Alice'
person.get("name")        # 'Alice'
person.get("phone", "N/A") # 默认值

# 修改元素
person["age"] = 26
person["phone"] = "123456"  # 添加新键

# 删除元素
del person["city"]
person.pop("age")
person.popitem()          # 删除最后一项

# 字典操作
len(person)
"name" in person          # 检查键存在
person.keys()             # 所有键
person.values()           # 所有值
person.items()            # 所有键值对

# 遍历字典
for key in person:
    print(key, person[key])

for key, value in person.items():
    print(f"{key}: {value}")

# 字典合并
dict1 = {"a": 1}
dict2 = {"b": 2}
merged = {**dict1, **dict2}  # Python 3.5+
merged = dict1 | dict2       # Python 3.9+
```

### 2.4 集合 (Set)

```python
# 创建集合
fruits = {"apple", "banana", "cherry"}
empty_set = set()

# 集合操作
fruits.add("grape")
fruits.remove("banana")
fruits.discard("kiwi")      # 不存在时不报错
fruits.pop()                # 随机删除

# 集合运算
set1 = {1, 2, 3}
set2 = {3, 4, 5}

set1 | set2                 # 并集: {1, 2, 3, 4, 5}
set1 & set2                 # 交集: {3}
set1 - set2                 # 差集: {1, 2}
set1 ^ set2                 # 对称差集: {1, 2, 4, 5}

# 集合方法
set1.union(set2)
set1.intersection(set2)
set1.difference(set2)
set1.issubset(set2)
set1.issuperset(set2)
```

### 2.5 队列和栈

```python
from collections import deque

# 栈 (Stack) - LIFO
stack = []
stack.append(1)             # push
stack.append(2)
stack.pop()                 # pop: 2

# 队列 (Queue) - FIFO
queue = deque([1, 2, 3])
queue.append(4)             # enqueue
queue.popleft()             # dequeue: 1

# 双端队列
deque_obj = deque([1, 2, 3])
deque_obj.appendleft(0)     # 左侧添加
deque_obj.pop()             # 右侧删除
deque_obj.popleft()         # 左侧删除
```

---

## 3. 控制流

### 3.1 条件语句

```python
# if-elif-else
age = 18

if age < 13:
    print("Child")
elif age < 18:
    print("Teenager")
else:
    print("Adult")

# 三元表达式
status = "adult" if age >= 18 else "minor"

# 多条件
if age >= 18 and has_id:
    print("Allowed")

if age < 13 or has_parent:
    print("OK")

# match-case (Python 3.10+)
match status:
    case "success":
        print("Success")
    case "error":
        print("Error")
    case _:
        print("Unknown")
```

### 3.2 for 循环

```python
# 基本循环
for i in range(5):
    print(i)                # 0, 1, 2, 3, 4

# 遍历列表
fruits = ["apple", "banana"]
for fruit in fruits:
    print(fruit)

# 带索引
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# 遍历字典
person = {"name": "Alice", "age": 25}
for key, value in person.items():
    print(f"{key}: {value}")

# range 用法
range(5)                    # 0, 1, 2, 3, 4
range(1, 6)                 # 1, 2, 3, 4, 5
range(0, 10, 2)             # 0, 2, 4, 6, 8

# break 和 continue
for i in range(10):
    if i == 5:
        break               # 跳出循环
    if i % 2 == 0:
        continue            # 跳过本次
    print(i)

# else 子句
for i in range(5):
    print(i)
else:
    print("Loop completed") # 正常结束时执行
```

### 3.3 while 循环

```python
# 基本 while
count = 0
while count < 5:
    print(count)
    count += 1

# while-else
count = 0
while count < 5:
    print(count)
    count += 1
else:
    print("Done")

# 无限循环
while True:
    user_input = input("Enter 'q' to quit: ")
    if user_input == 'q':
        break
```

---

## 4. 函数

### 4.1 基本函数

```python
# 定义函数
def greet(name):
    """Greet a person."""
    return f"Hello, {name}!"

# 调用函数
message = greet("Alice")

# 默认参数
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# 可变参数
def sum_all(*args):
    return sum(args)

sum_all(1, 2, 3, 4)         # 10

# 关键字参数
def create_user(**kwargs):
    return kwargs

create_user(name="Alice", age=25)
# {'name': 'Alice', 'age': 25}

# 混合参数
def func(a, b, *args, **kwargs):
    pass
```

### 4.2 Lambda 函数

```python
# 基本 lambda
square = lambda x: x ** 2
square(5)                   # 25

# 作为参数
numbers = [1, 2, 3, 4, 5]
sorted_numbers = sorted(numbers, key=lambda x: -x)

# map 和 filter
squares = list(map(lambda x: x**2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))
```

### 4.3 作用域

```python
# 全局变量
global_var = "global"

def my_func():
    # 局部变量
    local_var = "local"
    
    # 修改全局变量
    global global_var
    global_var = "modified"

# nonlocal (嵌套函数)
def outer():
    x = "outer"
    def inner():
        nonlocal x
        x = "inner"
    inner()
    print(x)                # "inner"
```

### 4.4 函数注解

```python
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b

# 查看注解
add.__annotations__
# {'a': <class 'int'>, 'b': <class 'int'>, 'return': <class 'int'>}
```

---

## 5. 面向对象

### 5.1 类和对象

```python
class Person:
    """Person class."""
    
    # 类变量
    species = "Homo sapiens"
    
    # 构造函数
    def __init__(self, name, age):
        # 实例变量
        self.name = name
        self.age = age
    
    # 实例方法
    def greet(self):
        return f"Hi, I'm {self.name}"
    
    # 字符串表示
    def __str__(self):
        return f"Person({self.name}, {self.age})"
    
    def __repr__(self):
        return f"Person('{self.name}', {self.age})"

# 创建对象
person = Person("Alice", 25)
person.greet()              # "Hi, I'm Alice"
```

### 5.2 继承

```python
class Student(Person):
    def __init__(self, name, age, student_id):
        super().__init__(name, age)
        self.student_id = student_id
    
    def study(self):
        return f"{self.name} is studying"

# 使用
student = Student("Bob", 20, "S123")
student.greet()             # 继承的方法
student.study()             # 自己的方法
```

### 5.3 多态

```python
class Dog:
    def speak(self):
        return "Woof!"

class Cat:
    def speak(self):
        return "Meow!"

def animal_sound(animal):
    print(animal.speak())

animal_sound(Dog())         # Woof!
animal_sound(Cat())         # Meow!
```

### 5.4 属性装饰器

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def radius(self):
        """Getter"""
        return self._radius
    
    @radius.setter
    def radius(self, value):
        """Setter"""
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value
    
    @property
    def area(self):
        """Computed property"""
        import math
        return math.pi * self._radius ** 2

circle = Circle(5)
circle.radius               # 5
circle.area                 # 78.54...
circle.radius = 10          # OK
# circle.radius = -1        # Error!
```

### 5.5 魔术方法

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    
    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)
    
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y
    
    def __len__(self):
        return 2
    
    def __getitem__(self, index):
        return [self.x, self.y][index]
    
    def __iter__(self):
        yield self.x
        yield self.y

v1 = Vector(1, 2)
v2 = Vector(3, 4)
v3 = v1 + v2                # Vector(4, 6)
```

### 5.6 抽象基类

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass
    
    @abstractmethod
    def perimeter(self):
        pass

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height
    
    def perimeter(self):
        return 2 * (self.width + self.height)

# shape = Shape()           # Error! Can't instantiate
rect = Rectangle(5, 10)
rect.area()                 # 50
```

---

## 6. 模块和包

### 6.1 导入模块

```python
# 基本导入
import math
import os, sys

# 别名导入
import numpy as np
import pandas as pd

# 部分导入
from math import sqrt, pi
from collections import defaultdict, Counter

# 全部导入（不推荐）
from math import *

# 相对导入（包内）
from .module import function
from ..package import module
```

### 6.2 创建模块

```python
# mymodule.py
"""My module documentation."""

def hello(name):
    """Say hello."""
    return f"Hello, {name}!"

def add(a, b):
    """Add two numbers."""
    return a + b

if __name__ == "__main__":
    # 测试代码
    print(hello("World"))
```

### 6.3 创建包

```
mypackage/
├── __init__.py
├── module1.py
├── module2.py
└── subpackage/
    ├── __init__.py
    └── module3.py
```

```python
# __init__.py
from .module1 import function1
from .module2 import function2

__all__ = ['function1', 'function2']
```

### 6.4 常用内置模块

```python
import os                   # 操作系统接口
import sys                  # 系统相关
import math                 # 数学函数
import random               # 随机数
import datetime             # 日期时间
import json                 # JSON 处理
import re                   # 正则表达式
import collections          # 容器数据类型
import itertools            # 迭代器
import functools            # 高阶函数
import pathlib              # 路径操作
import typing               # 类型提示
```

---

## 7. 文件操作

### 7.1 读取文件

```python
# 读取整个文件
with open('file.txt', 'r') as f:
    content = f.read()

# 逐行读取
with open('file.txt', 'r') as f:
    for line in f:
        print(line.strip())

# 读取所有行
with open('file.txt', 'r') as f:
    lines = f.readlines()

# 读取指定字节
with open('file.txt', 'r') as f:
    chunk = f.read(1024)
```

### 7.2 写入文件

```python
# 写入文件（覆盖）
with open('file.txt', 'w') as f:
    f.write("Hello\n")
    f.write("World\n")

# 追加文件
with open('file.txt', 'a') as f:
    f.write("New line\n")

# 写入多行
lines = ["Line 1\n", "Line 2\n", "Line 3\n"]
with open('file.txt', 'w') as f:
    f.writelines(lines)
```

### 7.3 文件模式

```python
'r'     # 只读（默认）
'w'     # 写入（覆盖）
'a'     # 追加
'x'     # 创建（已存在则失败）
'b'     # 二进制模式
't'     # 文本模式（默认）
'+'     # 读写模式

# 示例
open('file.txt', 'rb')    # 二进制读取
open('file.txt', 'w+')    # 读写
open('file.txt', 'ab')    # 二进制追加
```

### 7.4 CSV 文件

```python
import csv

# 读取 CSV
with open('data.csv', 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)

# 写入 CSV
with open('data.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Name', 'Age'])
    writer.writerow(['Alice', 25])
    writer.writerow(['Bob', 30])

# DictReader/DictWriter
with open('data.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row['Name'], row['Age'])
```

### 7.5 JSON 文件

```python
import json

# 读取 JSON
with open('data.json', 'r') as f:
    data = json.load(f)

# 写入 JSON
data = {'name': 'Alice', 'age': 25}
with open('data.json', 'w') as f:
    json.dump(data, f, indent=2)

# 字符串转换
json_str = json.dumps(data, indent=2)
data = json.loads(json_str)
```

### 7.6 pathlib (现代路径操作)

```python
from pathlib import Path

# 创建路径
path = Path('directory/file.txt')

# 路径操作
path.parent                  # 父目录
path.name                    # 文件名
path.suffix                  # 扩展名
path.stem                    # 文件名（无扩展名）

# 检查
path.exists()
path.is_file()
path.is_dir()

# 读取写入
content = path.read_text()
path.write_text("Hello")

# 遍历目录
for file in Path('.').glob('*.txt'):
    print(file)

# 创建目录
Path('new_dir').mkdir(parents=True, exist_ok=True)
```

---

## 8. 异常处理

### 8.1 基本异常处理

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero")
except TypeError as e:
    print(f"Type error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
else:
    print("No error occurred")
finally:
    print("Always executed")
```

### 8.2 常见异常

```python
ValueError                  # 值错误
TypeError                   # 类型错误
IndexError                  # 索引错误
KeyError                    # 键错误
AttributeError              # 属性错误
FileNotFoundError           # 文件未找到
IOError                     # IO 错误
ImportError                 # 导入错误
NameError                   # 名称错误
StopIteration               # 迭代停止
```

### 8.3 引发自定义异常

```python
# 自定义异常
class MyError(Exception):
    def __init__(self, message, code):
        super().__init__(message)
        self.code = code

# 抛出异常
raise ValueError("Invalid value")
raise MyError("Something wrong", 404)

# 重新抛出
try:
    do_something()
except Exception as e:
    log_error(e)
    raise                   # 重新抛出
```

### 8.4 断言

```python
# 断言
assert x > 0, "x must be positive"
assert isinstance(x, int), "x must be int"

# 禁用断言
# python -O script.py
```

---

## 9. 列表推导式

### 9.1 基本推导式

```python
# 列表推导式
squares = [x**2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# 带条件
evens = [x for x in range(10) if x % 2 == 0]
# [0, 2, 4, 6, 8]

# 嵌套循环
pairs = [(x, y) for x in range(3) for y in range(3)]
# [(0,0), (0,1), (0,2), (1,0), ...]
```

### 9.2 字典和集合推导式

```python
# 字典推导式
square_dict = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# 集合推导式
unique_squares = {x**2 for x in [-2, -1, 0, 1, 2]}
# {0, 1, 4}
```

### 9.3 生成器表达式

```python
# 生成器表达式（惰性求值）
sum_of_squares = sum(x**2 for x in range(1000000))

# 比列表推导式更节省内存
gen = (x**2 for x in range(10))
next(gen)                   # 0
next(gen)                   # 1
```

---

## 10. 装饰器

### 10.1 基本装饰器

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("Before function")
        result = func(*args, **kwargs)
        print("After function")
        return result
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")

say_hello()
# Before function
# Hello!
# After function
```

### 10.2 带参数的装饰器

```python
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")
# Hello, Alice!
# Hello, Alice!
# Hello, Alice!
```

### 10.3 常用装饰器

```python
from functools import wraps, lru_cache
import time

# 保留元信息
def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

# 缓存装饰器
@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 计时装饰器
def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end-start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
```

### 10.4 类装饰器

```python
class Singleton:
    def __init__(self, cls):
        self.cls = cls
        self.instance = None
    
    def __call__(self, *args, **kwargs):
        if self.instance is None:
            self.instance = self.cls(*args, **kwargs)
        return self.instance

@Singleton
class Database:
    def __init__(self):
        print("Database created")

db1 = Database()            # Database created
db2 = Database()            # No output (same instance)
```

---

## 11. 生成器

### 11.1 基本生成器

```python
# 生成器函数
def count_up_to(n):
    i = 0
    while i < n:
        yield i
        i += 1

# 使用生成器
counter = count_up_to(5)
next(counter)               # 0
next(counter)               # 1

for num in count_up_to(5):
    print(num)              # 0, 1, 2, 3, 4
```

### 11.2 生成器表达式

```python
# 生成器表达式
gen = (x**2 for x in range(10))

# 惰性求值，节省内存
sum(x**2 for x in range(1000000))
```

### 11.3 send 和 close

```python
def generator():
    while True:
        value = yield
        print(f"Received: {value}")

gen = generator()
next(gen)                   # 启动生成器
gen.send("Hello")           # Received: Hello
gen.send("World")           # Received: World
gen.close()                 # 关闭生成器
```

### 11.4 yield from

```python
def chain(*iterables):
    for iterable in iterables:
        yield from iterable

list(chain([1, 2], [3, 4], [5, 6]))
# [1, 2, 3, 4, 5, 6]
```

---

## 12. 上下文管理器

### 12.1 with 语句

```python
# 文件操作
with open('file.txt', 'r') as f:
    content = f.read()
# 自动关闭文件

# 锁操作
import threading
lock = threading.Lock()
with lock:
    # 临界区
    pass
# 自动释放锁
```

### 12.2 自定义上下文管理器

```python
# 使用类
class MyContext:
    def __enter__(self):
        print("Entering")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Exiting")
        if exc_type:
            print(f"Exception: {exc_val}")
        return False        # 不抑制异常

with MyContext() as ctx:
    print("Inside")

# 使用 contextlib
from contextlib import contextmanager

@contextmanager
def my_context():
    print("Entering")
    try:
        yield
    finally:
        print("Exiting")

with my_context():
    print("Inside")
```

### 12.3 多个上下文管理器

```python
with open('input.txt', 'r') as infile, \
     open('output.txt', 'w') as outfile:
    outfile.write(infile.read())

# Python 3.10+
with (
    open('input.txt', 'r') as infile,
    open('output.txt', 'w') as outfile
):
    outfile.write(infile.read())
```

---

## 13. 正则表达式

### 13.1 基本用法

```python
import re

# 匹配
pattern = r'\d+'
text = "There are 123 apples"

match = re.search(pattern, text)
if match:
    print(match.group())    # '123'

# 查找所有
matches = re.findall(r'\d+', "123 and 456")
# ['123', '456']

# 替换
result = re.sub(r'\d+', 'NUM', "123 and 456")
# 'NUM and NUM'

# 分割
parts = re.split(r'\s+', "hello   world  test")
# ['hello', 'world', 'test']
```

### 13.2 常用模式

```python
# 字符类
\d      # 数字 [0-9]
\D      # 非数字
\w      # 单词字符 [a-zA-Z0-9_]
\W      # 非单词字符
\s      # 空白字符
\S      # 非空白字符
.       # 任意字符（除换行）

# 量词
*       # 0 或多次
+       # 1 或多次
?       # 0 或 1 次
{n}     # 恰好 n 次
{n,}    # 至少 n 次
{n,m}   # n 到 m 次

# 锚点
^       # 字符串开头
$       # 字符串结尾
\b      # 单词边界

# 分组
(...)   # 捕获组
(?:...) # 非捕获组
(?P<name>...) # 命名组
```

### 13.3 编译正则

```python
# 预编译（提高效率）
pattern = re.compile(r'\d+')
pattern.search("123")
pattern.findall("123 456")

# 标志
re.IGNORECASE     # 忽略大小写
re.MULTILINE      # 多行模式
re.DOTALL         # . 匹配换行
re.VERBOSE        # 详细模式

pattern = re.compile(r'''
    \d+     # digits
    \s+     # whitespace
    \w+     # word
''', re.VERBOSE)
```

### 13.4 示例

```python
# 邮箱验证
email_pattern = r'^[\w.-]+@[\w.-]+\.\w+$'
re.match(email_pattern, "user@example.com")

# URL 提取
url_pattern = r'https?://[^\s]+'
re.findall(url_pattern, "Visit https://example.com or http://test.com")

# 电话号码
phone_pattern = r'\d{3}-\d{3}-\d{4}'
re.search(phone_pattern, "Call 123-456-7890")
```

---

## 14. 日期时间

### 14.1 datetime 模块

```python
from datetime import datetime, date, time, timedelta

# 当前时间
now = datetime.now()
today = date.today()

# 创建日期时间
dt = datetime(2024, 1, 15, 10, 30, 0)
d = date(2024, 1, 15)
t = time(10, 30, 0)

# 格式化
now.strftime("%Y-%m-%d %H:%M:%S")
# '2024-01-15 10:30:00'

now.strftime("%A, %B %d, %Y")
# 'Monday, January 15, 2024'

# 解析
dt = datetime.strptime("2024-01-15 10:30:00", "%Y-%m-%d %H:%M:%S")

# 日期运算
tomorrow = today + timedelta(days=1)
last_week = today - timedelta(weeks=1)
diff = tomorrow - today
diff.days                   # 1

# 属性
now.year, now.month, now.day
now.hour, now.minute, now.second
now.weekday()               # 0=Monday, 6=Sunday
```

### 14.2 时区处理

```python
from datetime import timezone, timedelta

# UTC 时间
utc_now = datetime.now(timezone.utc)

# 时区转换
eastern = timezone(timedelta(hours=-5))
dt_eastern = utc_now.astimezone(eastern)

# 使用 zoneinfo (Python 3.9+)
from zoneinfo import ZoneInfo
tokyo = ZoneInfo("Asia/Tokyo")
dt_tokyo = utc_now.astimezone(tokyo)
```

### 14.3 time 模块

```python
import time

# 时间戳
timestamp = time.time()

# 休眠
time.sleep(1)               # 休眠 1 秒

# 性能计时
start = time.perf_counter()
# ... code ...
end = time.perf_counter()
elapsed = end - start
```

---

## 15. 并发编程

### 15.1 线程 (Threading)

```python
import threading

# 创建线程
def worker(name):
    print(f"Worker {name} started")
    # ... work ...
    print(f"Worker {name} finished")

thread = threading.Thread(target=worker, args=("A",))
thread.start()
thread.join()               # 等待线程完成

# 线程池
from concurrent.futures import ThreadPoolExecutor

def task(n):
    return n * n

with ThreadPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(task, range(10)))
```

### 15.2 进程 (Multiprocessing)

```python
from multiprocessing import Process, Pool

# 创建进程
def worker(name):
    print(f"Process {name}")

process = Process(target=worker, args=("A",))
process.start()
process.join()

# 进程池
def square(x):
    return x * x

with Pool(processes=4) as pool:
    results = pool.map(square, range(10))
```

### 15.3 异步编程 (Asyncio)

```python
import asyncio

# 协程
async def fetch_data(url):
    print(f"Fetching {url}")
    await asyncio.sleep(1)  # 模拟 IO 操作
    return f"Data from {url}"

# 运行协程
async def main():
    result = await fetch_data("https://api.example.com")
    print(result)

asyncio.run(main())

# 并发执行
async def main():
    tasks = [
        fetch_data("url1"),
        fetch_data("url2"),
        fetch_data("url3")
    ]
    results = await asyncio.gather(*tasks)
    print(results)

asyncio.run(main())

# async/await with aiohttp
import aiohttp

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()

async def main():
    async with aiohttp.ClientSession() as session:
        html = await fetch(session, "https://example.com")
        print(html)

asyncio.run(main())
```

### 15.4 锁和同步

```python
import threading

# 锁
lock = threading.Lock()

def safe_increment(counter):
    with lock:
        counter[0] += 1

# RLock (可重入锁)
rlock = threading.RLock()

# 信号量
semaphore = threading.Semaphore(3)

def limited_worker():
    with semaphore:
        # 最多 3 个线程同时执行
        pass

# 事件
event = threading.Event()

def waiter():
    event.wait()            # 等待事件
    print("Event triggered")

def trigger():
    event.set()             # 触发事件
```

---

## 16. 常用标准库

### 16.1 collections

```python
from collections import defaultdict, Counter, deque, namedtuple

# defaultdict
word_count = defaultdict(int)
for word in ["apple", "banana", "apple"]:
    word_count[word] += 1

# Counter
counter = Counter(["apple", "banana", "apple"])
counter.most_common(1)      # [('apple', 2)]

# deque
queue = deque([1, 2, 3])
queue.append(4)
queue.popleft()             # 1

# namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(1, 2)
p.x, p.y                    # 1, 2
```

### 16.2 itertools

```python
import itertools

# 无限迭代器
itertools.count(10)         # 10, 11, 12, ...
itertools.cycle([1, 2, 3])  # 1, 2, 3, 1, 2, 3, ...
itertools.repeat('A', 5)    # A, A, A, A, A

# 组合
itertools.permutations([1, 2, 3], 2)
# (1,2), (1,3), (2,1), (2,3), (3,1), (3,2)

itertools.combinations([1, 2, 3], 2)
# (1,2), (1,3), (2,3)

# 链式
itertools.chain([1, 2], [3, 4])
# 1, 2, 3, 4

# 分组
data = sorted([1, 1, 2, 2, 3])
for key, group in itertools.groupby(data):
    print(key, list(group))
```

### 16.3 functools

```python
from functools import reduce, partial, wraps

# reduce
from functools import reduce
product = reduce(lambda x, y: x * y, [1, 2, 3, 4])
# 24

# partial
from functools import partial

def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
square(5)                   # 25

# lru_cache
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

### 16.4 os 和 sys

```python
import os
import sys

# 环境变量
os.environ.get('PATH')
os.environ['MY_VAR'] = 'value'

# 路径操作
os.getcwd()                 # 当前目录
os.listdir('.')             # 列出文件
os.path.join('dir', 'file.txt')
os.path.exists('file.txt')
os.path.isfile('file.txt')
os.path.isdir('directory')

# 系统信息
sys.argv                    # 命令行参数
sys.platform                # 平台信息
sys.version                 # Python 版本
sys.path                    # 模块搜索路径

# 退出
sys.exit(0)                 # 正常退出
sys.exit(1)                 # 错误退出
```

### 16.5 json 和 pickle

```python
import json
import pickle

# JSON
data = {'name': 'Alice', 'age': 25}
json_str = json.dumps(data)
data = json.loads(json_str)

# Pickle (序列化 Python 对象)
data = {'list': [1, 2, 3], 'dict': {'a': 1}}
pickled = pickle.dumps(data)
data = pickle.loads(pickled)

# 文件操作
with open('data.pkl', 'wb') as f:
    pickle.dump(data, f)

with open('data.pkl', 'rb') as f:
    data = pickle.load(f)
```

---

## 17. 虚拟环境

### 17.1 创建虚拟环境

```bash
# 创建虚拟环境
python -m venv myenv

# 激活虚拟环境
# macOS/Linux
source myenv/bin/activate

# Windows
myenv\Scripts\activate

# 退出虚拟环境
deactivate
```

### 17.2 包管理

```bash
# 安装包
pip install package_name
pip install package_name==1.0.0
pip install -r requirements.txt

# 卸载包
pip uninstall package_name

# 列出已安装的包
pip list
pip freeze > requirements.txt

# 升级 pip
pip install --upgrade pip

# 使用国内镜像
pip install package_name -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 17.3 requirements.txt

```
# requirements.txt
flask==2.0.1
requests>=2.25.0
numpy~=1.21.0
pandas
-r base-requirements.txt
```

### 17.4 Poetry (现代包管理)

```bash
# 安装 Poetry
curl -sSL https://install.python-poetry.org | python3 -

# 初始化项目
poetry init

# 添加依赖
poetry add flask
poetry add requests --dev

# 安装依赖
poetry install

# 运行命令
poetry run python script.py
poetry shell                # 进入虚拟环境
```

---

## 18. 代码规范

### 18.1 PEP 8 规范

```python
# 缩进：4 个空格
def my_function():
    if True:
        print("Indented")

# 行长度：最多 79 字符
# 文档字符串：最多 72 字符

# 空行
# 顶级函数/类之间：2 个空行
# 类内方法之间：1 个空行

# 导入顺序
# 1. 标准库
import os
import sys

# 2. 第三方库
import flask
import requests

# 3. 本地应用
from myapp import module

# 命名规范
# 变量/函数：snake_case
my_variable = 10
def my_function():
    pass

# 类：PascalCase
class MyClass:
    pass

# 常量：UPPER_CASE
MAX_SIZE = 100

# 私有：_prefix
_internal = "private"

# 名称修饰：__prefix
__mangled = "name mangled"
```

### 18.2 类型提示

```python
from typing import List, Dict, Optional, Union, Tuple

# 基本类型
def greet(name: str) -> str:
    return f"Hello, {name}"

# 复杂类型
def process(items: List[int]) -> Dict[str, int]:
    return {"count": len(items)}

# Optional
def find(name: str) -> Optional[str]:
    if name:
        return name
    return None

# Union
def parse(value: Union[str, int]) -> str:
    return str(value)

# Tuple
def get_coordinates() -> Tuple[float, float]:
    return (10.5, 20.3)

# Any
from typing import Any
def process_any(data: Any) -> Any:
    return data
```

### 18.3 文档字符串

```python
def calculate_area(radius: float) -> float:
    """Calculate the area of a circle.
    
    Args:
        radius: The radius of the circle. Must be positive.
    
    Returns:
        The area of the circle.
    
    Raises:
        ValueError: If radius is negative.
    
    Example:
        >>> calculate_area(5)
        78.53981633974483
    """
    if radius < 0:
        raise ValueError("Radius cannot be negative")
    import math
    return math.pi * radius ** 2
```

### 18.4 代码检查工具

```bash
# flake8 - 代码风格检查
pip install flake8
flake8 script.py

# pylint - 代码质量检查
pip install pylint
pylint script.py

# black - 代码格式化
pip install black
black script.py

# mypy - 类型检查
pip install mypy
mypy script.py

# isort - 导入排序
pip install isort
isort script.py
```

---

## 19. 调试技巧

### 19.1 print 调试

```python
# 基本 print
print("Variable:", variable)

# f-string 调试 (Python 3.8+)
x = 10
print(f"{x=}")                # x=10

# pprint (美化输出)
import pprint
data = {'key1': [1, 2, 3], 'key2': {'nested': 'value'}}
pprint.pprint(data)
```

### 19.2 pdb 调试器

```python
import pdb

# 设置断点
pdb.set_trace()               # Python 3.6 之前
breakpoint()                  # Python 3.7+

# 常用命令
# n (next) - 执行下一行
# s (step) - 进入函数
# c (continue) - 继续执行
# p variable - 打印变量
# pp variable - 美化打印
# l (list) - 显示代码
# h (help) - 帮助
# q (quit) - 退出
```

### 19.3 logging 模块

```python
import logging

# 基本配置
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# 日志级别
logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
logger.critical("Critical message")

# 文件日志
file_handler = logging.FileHandler('app.log')
logger.addHandler(file_handler)
```

### 19.4 性能分析

```python
import cProfile
import pstats

# 性能分析
def slow_function():
    total = 0
    for i in range(1000000):
        total += i
    return total

# 命令行
# python -m cProfile script.py

# 代码中
profiler = cProfile.Profile()
profiler.enable()
slow_function()
profiler.disable()

stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(10)
```

### 19.5 内存分析

```python
import tracemalloc

# 开始追踪
tracemalloc.start()

# ... 你的代码 ...

# 获取快照
snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics('lineno')

for stat in top_stats[:10]:
    print(stat)

# 停止追踪
tracemalloc.stop()
```

---

## 20. 性能优化

### 20.1 算法优化

```python
# 使用集合代替列表进行查找
# Bad: O(n)
if item in my_list:
    pass

# Good: O(1)
if item in my_set:
    pass

# 使用字典代替多重 if-elif
# Bad
if status == "active":
    handler = active_handler
elif status == "inactive":
    handler = inactive_handler

# Good
handlers = {
    "active": active_handler,
    "inactive": inactive_handler,
}
handler = handlers.get(status, default_handler)
```

### 20.2 使用内置函数

```python
# 使用内置函数而非手动循环
sum(numbers)                  # 而非手动累加
max(numbers)                  # 而非手动比较
min(numbers)
len(collection)
any(iterable)
all(iterable)

# 使用 map/filter 而非循环
squares = list(map(lambda x: x**2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))
```

### 20.3 列表 vs 生成器

```python
# 大数据集使用生成器
# Bad: 占用大量内存
total = sum([x**2 for x in range(1000000)])

# Good: 惰性求值
total = sum(x**2 for x in range(1000000))
```

### 20.4 缓存

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_computation(n):
    # 耗时计算
    return sum(i**2 for i in range(n))

# 手动缓存
cache = {}
def cached_function(arg):
    if arg not in cache:
        cache[arg] = compute(arg)
    return cache[arg]
```

### 20.5 并行处理

```python
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

# CPU 密集型任务使用进程池
def cpu_intensive(n):
    return sum(i**2 for i in range(n))

with ProcessPoolExecutor() as executor:
    results = list(executor.map(cpu_intensive, range(10)))

# IO 密集型任务使用线程池
import requests

def fetch_url(url):
    return requests.get(url).text

with ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(fetch_url, urls))
```

### 20.6 性能测量

```python
import time
import timeit

# time 模块
start = time.perf_counter()
# ... code ...
end = time.perf_counter()
print(f"Elapsed: {end - start:.4f}s")

# timeit 模块
def test_function():
    return sum(range(1000))

time_taken = timeit.timeit(test_function, number=1000)
print(f"Average: {time_taken/1000:.6f}s")

# IPython magic
# %timeit sum(range(1000))
# %time sum(range(1000))
```

---

## 附录

### A. Python 版本特性

```python
# Python 3.6+
# f-strings
name = "Alice"
f"Hello, {name}"

# 变量注解
age: int = 25

# Python 3.7+
# dataclasses
from dataclasses import dataclass

@dataclass
class Person:
    name: str
    age: int

# Python 3.8+
# 海象运算符
if (n := len(data)) > 10:
    print(f"Too many items: {n}")

# Python 3.9+
# 字典合并
dict1 | dict2
dict1 |= dict2

# 类型提示泛型
list[int]
dict[str, int]

# Python 3.10+
# match-case
match value:
    case 1:
        print("One")
    case _:
        print("Other")

# 联合类型
def func(x: int | str) -> None:
    pass

# Python 3.11+
# ExceptionGroup
# TypedDict improvements
```

### B. 常用第三方库

```
Web 框架:
- Flask: 轻量级 Web 框架
- Django: 全功能 Web 框架
- FastAPI: 高性能 API 框架

数据处理:
- NumPy: 数值计算
- Pandas: 数据分析
- Matplotlib: 数据可视化

机器学习:
- Scikit-learn: 机器学习
- TensorFlow: 深度学习
- PyTorch: 深度学习

网络请求:
- Requests: HTTP 客户端
- aiohttp: 异步 HTTP

数据库:
- SQLAlchemy: ORM
- Peewee: 轻量 ORM

测试:
- pytest: 测试框架
- unittest: 内置测试

工具:
- Click: CLI 工具
- Typer: 现代 CLI
- Rich: 终端美化
```

### C. 有用的资源

- **官方文档**: https://docs.python.org/3/
- **PEP 8**: https://peps.python.org/pep-0008/
- **Real Python**: https://realpython.com/
- **Python Weekly**: https://www.pythonweekly.com/
- **Awesome Python**: https://github.com/vinta/awesome-python

---

**祝您 Python 编程愉快！** 🐍

如有问题，请查阅官方文档或社区论坛。
