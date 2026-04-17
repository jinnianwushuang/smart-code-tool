---
title: PYTHON 基础代码
order: 104
---

## PYTHON 基础代码

```python
# 1. 变量与类型注解 (Type Hints)
integer_val: int = 42           # 整数
float_val: float = 3.14         # 浮点数
string_val: str = "Hello"       # 字符串
boolean_val: bool = True        # 布尔值
none_val = None                 # 空值

# 2. 容器数据类型 (Collections)
my_list = [1, 2, "apple"]       # 列表 (可变)
my_tuple = (10, 20, 30)         # 元组 (不可变)
my_dict = {"name": "Alice", "age": 25}  # 字典 (键值对)
my_set = {1, 2, 2, 3}           # 集合 (自动去重)

# 3. 流程控制 (Flow Control)
score = 85
if score >= 90:
    print("优秀")
elif score >= 60:
    print("及格")
else:
    print("不及格")

# Match-Case (Python 3.10+)
status = 404
match status:
    case 200: print("成功")
    case 404: print("未找到")
    case _: print("其他状态")

# 4. 循环结构 (Loops)
# For 循环遍历列表
for item in my_list:
    if item == "apple":
        continue  # 跳过本次
    print(f"处理项目: {item}")

# While 循环
count = 0
while count < 3:
    print(f"当前计数: {count}")
    count += 1

# 5. 函数与参数解包
def greet_user(name: str, *args, greeting: str = "你好", **kwargs) -> str:
    """带类型注解和变长参数的函数"""
    print(f"额外参数: {args}")    # 元组
    print(f"关键字参数: {kwargs}") # 字典
    return f"{greeting}, {name}!"

# 6. 高级特性：列表推导式 (List Comprehension)
squares = [x**2 for x in range(5)]  # [0, 1, 4, 9, 16]

# 7. 面向对象 (OOP)
class Animal:
    def __init__(self, name: str):
        self.name = name  # 公有属性
        self.__id = 123   # 私有属性 (双下划线)

    def make_sound(self):
        pass

class Dog(Animal):
    def make_sound(self):
        return f"{self.name} says: Woof!"

    @property
    def info(self):
        return f"小狗名称: {self.name}"

# 8. 异步编程 (Async/Await)
import asyncio

async def fetch_api():
    await asyncio.sleep(1)
    return {"data": "success"}

# 9. 上下文管理器 (Context Manager)
def file_ops():
    # 自动处理关闭逻辑
    with open("test.txt", "w", encoding="utf-8") as f:
        f.write("Hello World")

# 10. 常用装饰器 (Decorators)
import time

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"耗时: {time.time() - start:.4f}s")
        return result
    return wrapper

# 11. 常用标准库 (Standard Libraries)
import json
import os
import sys
from datetime import datetime, timedelta

# [JSON] 序列化与反序列化
data_dict = {"id": 1, "active": True, "tags": ["python", "dev"]}
json_str = json.dumps(data_dict, indent=2)      # 字典转字符串 (序列化)
parsed_dict = json.loads(json_str)              # 字符串转字典 (反序列化)

# [OS] 文件系统与路径操作
cwd = os.getcwd()                               # 获取当前工作目录
path_exists = os.path.exists("test.txt")        # 检查路径是否存在
full_path = os.path.join(cwd, "logs", "app.log") # 跨平台路径拼接
env_var = os.getenv("PATH")                     # 获取环境变量

# [SYS] 系统相关
args = sys.argv                                 # 获取命令行参数 (list)
py_version = sys.version                        # 获取 Python 版本信息
sys_platform = sys.platform                     # 运行平台: 'win32', 'linux', 'darwin'

# [Datetime] 时间日期处理
now = datetime.now()                            # 当前时间对象
formatted = now.strftime("%Y-%m-%d %H:%M:%S")   # 格式化输出字符串
next_week = now + timedelta(days=7)             # 时间加减计算

# 12. 异常处理 (Exception Handling)
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"捕获到错误: {e}")
finally:
    print("执行清理操作")

# 调用函数并打印结果
if __name__ == "__main__":
    final_msg = greet_user("开发者", greeting="欢迎")
    print(final_msg)
    print(f"字典内容: {my_dict.get('name')}")
```
