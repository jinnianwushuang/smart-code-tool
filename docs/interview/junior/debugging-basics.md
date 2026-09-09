---
title: "前端调试基础 [P4-P5]"
level: "junior"
tags: ["调试", "debugger", "console", "断点", "错误排查"]
difficulty: "medium"
updated: "2026-09-10"
target: "P4-P5 初级工程师"
---

# 前端调试基础 [P4-P5]

> 调试是发现和修复 Bug 的过程。掌握 debugger、console、断点等调试技巧，能快速定位问题。

## 核心概念（What）

### 什么是调试

```
调试 = 发现、定位、修复 Bug 的过程

调试流程：
├── 1. 复现问题（稳定复现）
├── 2. 定位问题（缩小范围）
├── 3. 分析原因（理解为什么）
├── 4. 修复问题（编写代码）
└── 5. 验证修复（测试回归）

常见 Bug 类型：
├── 语法错误 → 代码写错（编译时报错）
├── 运行时错误 → 执行时报错（TypeError、ReferenceError）
├── 逻辑错误 → 不报错但结果不对
└── 异步错误 → 时序问题（Promise、回调）
```

### 调试工具

```
浏览器：
├── Chrome DevTools → 最常用
├── console.log → 最简单
├── debugger → 代码断点
└── 断点调试 → 最强大

Node.js：
├── console.log
├── debugger + node inspect
└── VS Code 调试器

IDE：
├── VS Code 调试器
├── WebStorm 调试器
└── 断点配置
```

## 基础用法（How）

### console 调试

```javascript
// 基础输出
console.log('普通日志');
console.warn('警告');
console.error('错误');
console.info('信息');

// 错误堆栈
console.trace(); // 打印调用栈

// 格式化
console.log('Name: %s, Age: %d', 'Alice', 25);
console.log('%c红色', 'color: red');

// 表格
console.table([
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 }
]);

// 计时
console.time('load');
// ... 代码
console.timeEnd('load'); // load: 12.34ms

// 分组
console.group('用户');
console.log('姓名: Alice');
console.log('年龄: 25');
console.groupEnd();

// 计数
console.count('click'); // click: 1
console.count('click'); // click: 2

// 断言
console.assert(age > 0, '年龄必须大于 0');

// 实用技巧
console.clear(); // 清空
console.dir(element); // 详细展示对象
```

### debugger 断点

```javascript
function calculateTotal(items) {
  let total = 0;
  
  debugger; // 代码断点，执行到这里会暂停
  
  for (let item of items) {
    debugger; // 每次循环暂停
    
    total += item.price * item.quantity;
  }
  
  debugger; // 查看最终结果
  
  return total;
}

calculateTotal([
  { price: 10, quantity: 2 },
  { price: 20, quantity: 1 }
]);

// 使用条件：
// 只在特定条件下暂停
for (let i = 0; i < 100; i++) {
  if (i === 50) {
    debugger; // 只在 i=50 时暂停
  }
}
```

### Chrome DevTools 断点

```
Sources 面板断点：

1. 普通断点
   → 点击行号

2. 条件断点
   → 右键 → Add conditional breakpoint
   → 输入条件：user.id === 123

3. 日志断点（Logpoint）
   → 右键 → Add logpoint
   → 输入日志：User clicked {userId}
   → 不暂停，只打印

4. DOM 断点
   → Elements 面板
   → 右键 → Break on → subtree modifications

5. XHR/Fetch 断点
   → Sources → XHR/fetch Breakpoints
   → 输入 URL 包含的字符串
```

### 调试控制

```
快捷键：
├── F8        → 继续执行（Resume）
├── F10       → 单步跳过（Step over）
├── F11       → 单步进入（Step into）
├── Shift+F11 → 单步退出（Step out）
└── F9        → 设置/取消断点

面板：
├── Scope      → 查看当前作用域变量
├── Watch      → 监视表达式
├── Call Stack → 查看调用栈
├── Breakpoints → 管理所有断点
└── DOM Breakpoints → DOM 断点
```

### VS Code 调试

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Run Node",
      "program": "${file}"
    }
  ]
}
```

```
VS Code 调试操作：
├── F5 → 启动调试
├── F9 → 设置断点
├── F10 → 单步跳过
├── F11 → 单步进入
└── Shift+F11 → 单步退出
```

### 常见错误排查

```javascript
// 1. TypeError: Cannot read property 'x' of undefined
// 原因：对象是 undefined
// 解决：添加可选链
console.log(user?.name);

// 2. ReferenceError: x is not defined
// 原因：变量未定义
// 解决：检查拼写、作用域

// 3. TypeError: x is not a function
// 原因：函数未定义或类型错误
// 解决：检查函数名、导入

// 4. 异步问题
async function fetchData() {
  // 错误：忘记 await
  const data = getData(); // 返回 Promise
  
  // 正确：
  const data = await getData();
}

// 5. 循环中的闭包
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
  // 输出：3, 3, 3（不是 0, 1, 2）
  
  // 解决：用 let
  for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
    // 输出：0, 1, 2
  }
}
```

## 常见面试题

### Q1: console.log 和 debugger 的区别？

```
console.log：
├── 简单快速
├── 输出到控制台
├── 不需要打开 DevTools
├── 生产环境需删除
└── 适合简单调试

debugger：
├── 代码断点
├── 暂停执行
├── 可以查看变量、调用栈
├── 可以单步执行
└── 适合复杂调试

推荐：
├── 简单检查 → console.log
├── 复杂逻辑 → debugger + 断点
└── 生产环境 → 移除所有调试代码
```

### Q2: 如何调试异步代码？

```
方法：
1. async/await + debugger
async function fetchUser() {
  debugger; // 暂停
  const user = await getUser();
  debugger; // 查看结果
}

2. Promise 链
fetchUser()
  .then(user => {
    debugger; // 暂停查看
    console.log(user);
  });

3. 断点设置
→ 在 async 函数内设置断点
→ F10 单步执行
→ 查看 Scope 的变量

注意：
├── 不要在回调外使用 this
├── 检查 Promise 是否被 await
└── 查看 Call Stack 的异步调用
```

### Q3: 如何快速定位 Bug？

```
策略：
1. 二分法
   → 注释一半代码，判断在哪一半
   → 逐步缩小范围

2. 断点法
   → 在可疑位置设置断点
   → 单步执行观察变量

3. 日志法
   → 关键位置打印日志
   → 追踪执行流程

4. 排除法
   → 排除不可能的原因
   → 聚焦可能的原因

5. 搜索法
   → 搜索错误信息
   → 查找类似案例
```

### Q4: 如何调试内存泄漏？

```
Memory 面板：
1. 拍摄堆快照（Heap Snapshot）
2. 执行操作
3. 再次拍摄快照
4. 对比快照（Comparison）
5. 查看增长的对象

常见泄漏：
├── 未清理的定时器
├── 未移除的事件监听
├── 闭包持有大对象
├── 全局变量
└── 分离的 DOM 节点

解决：
├── clearInterval / clearTimeout
├── removeEventListener
├── 弱引用（WeakMap、WeakRef）
└── 及时置 null
```

## 延伸练习

1. 用 console.table 展示数组数据
2. 用 debugger 断点调试循环
3. 用条件断点只在特定条件暂停
4. 用 Watch 监视变量变化
5. 用 Performance 分析页面性能

## 参考资料

- [Chrome DevTools 调试](https://developer.chrome.com/docs/devtools/)
- [VS Code 调试](https://code.visualstudio.com/docs/editor/debugging)
