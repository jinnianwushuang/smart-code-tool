---
title: "Chrome DevTools 实战 [P4-P5]"
level: "junior"
tags: ["DevTools", "Chrome", "调试工具", "开发者工具"]
difficulty: "medium"
updated: "2026-09-10"
target: "P4-P5 初级工程师"
---

# Chrome DevTools 实战 [P4-P5]

> Chrome DevTools 是浏览器内置的调试工具。掌握 Elements、Console、Network、Sources 面板，能快速定位和解决问题。

## 核心概念（What）

### DevTools 是什么

```
Chrome DevTools = 浏览器内置的开发者工具

功能：
├── 查看和编辑 DOM/CSS
├── 调试 JavaScript
├── 查看网络请求
├── 分析性能
├── 查看存储（Cookie、localStorage）
└── 模拟移动设备

打开方式：
├── F12
├── Cmd/Ctrl + Option + I
├── Cmd/Ctrl + Shift + I
└── 右键 → 检查
```

### 面板概览

```
主要面板：
├── Elements    → DOM 和 CSS
├── Console     → 日志和命令执行
├── Network     → 网络请求
├── Sources     → 代码和调试
├── Application → 存储和应用
├── Performance → 性能分析
└── Lighthouse  → 审计和优化
```

## 基础用法（How）

### Elements 面板

```
功能：
├── 查看 DOM 结构
├── 实时编辑 HTML
├── 修改 CSS 样式
├── 查看盒模型
├── 查看计算后的样式
└── 模拟不同屏幕尺寸

常用操作：
├── 点击元素 → 定位到 DOM 节点
├── 双击 → 编辑文本/属性
├── 右键 → 复制 XPath、删除节点
├── 样式区 → 勾选/取消 CSS 属性
└── 盒模型 → 查看 margin/border/padding/content 尺寸

实用技巧：
├── $0 → 获取当前选中的元素
├── 拖拽元素 → 调整 DOM 顺序
└── :hov → 强制伪类状态（如 :hover）
```

### Console 面板

```javascript
// 常用输出方法
console.log('普通日志');
console.info('信息');
console.warn('警告');
console.error('错误');
console.debug('调试');

// 格式化输出
console.log('Name: %s, Age: %d', 'Alice', 25);
console.log('%c红色文字', 'color: red; font-size: 20px');

// 表格展示
console.table([
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 }
]);

// 计时
console.time('timer');
// ... 执行代码
console.timeEnd('timer'); // 输出耗时

// 分组
console.group('用户信息');
console.log('姓名: Alice');
console.log('年龄: 25');
console.groupEnd();

// 计数
console.count('click'); // click: 1
console.count('click'); // click: 2
console.countReset('click'); // 重置

// 断言
console.assert(1 === 2, '断言失败：1 不等于 2');

// 实用技巧
clear();                    // 清空控制台
copy(document.title);       // 复制到剪贴板
table(document.querySelectorAll('a')); // 表格展示
dir(document.body);         // 详细展示对象
```

### Network 面板

```
功能：
├── 查看所有网络请求
├── 查看请求/响应详情
├── 分析加载性能
├── 模拟弱网/离线
└── 拦截请求

常用筛选：
├── All       → 所有请求
├── Fetch/XHR → AJAX 请求
├── JS        → JavaScript 文件
├── CSS       → 样式文件
├── Img       → 图片
├── Media     → 音视频
└── Doc       → 文档

关键指标：
├── Waterfall → 加载时间线
├── Status    → 状态码（200、404、500）
├── Type      → 请求类型
├── Size      → 文件大小
└── Time      → 加载耗时

实用技巧：
├── 右键 → Copy as cURL（复制请求命令）
├── 右键 → Copy response（复制响应）
├── 勾选 Disable cache → 禁用缓存
├── Throttling → 模拟慢网络（3G/4G）
└── Block request URL → 拦截特定请求
```

### Sources 面板

```
功能：
├── 查看源代码
├── 设置断点
├── 单步调试
├── 查看调用栈
└── 查看变量值

调试控制：
├── F8        → 继续执行
├── F10       → 单步跳过（不进入函数）
├── F11       → 单步进入（进入函数）
├── Shift+F11 → 单步退出（跳出函数）
└── 点击行号 → 设置/取消断点

断点类型：
├── 普通断点 → 点击行号
├── 条件断点 → 右键 → Add conditional breakpoint
├── 日志断点 → 右键 → Add logpoint（不暂停）
└── DOM 断点 → Elements 面板设置

常用功能：
├── Watch    → 监视变量
├── Call Stack → 查看调用栈
├── Scope    → 查看作用域变量
└── Snippets → 保存常用代码片段
```

### Application 面板

```
功能：
├── 查看 Storage
│   ├── Local Storage
│   ├── Session Storage
│   ├── Cookies
│   ├── IndexedDB
│   └── Web SQL
├── 查看 Cache Storage
├── 查看 Service Workers
└── 查看 Manifest

实用操作：
├── 右键 → Clear（清空存储）
├── 点击条目 → 查看/编辑值
└── 勾选 → 批量删除
```

## 常见面试题

### Q1: 如何用 DevTools 调试异步代码？

```
步骤：
1. Sources 面板找到代码
2. 在 async 函数内设置断点
3. 触发操作
4. 使用 F10/F11 单步执行
5. 查看 Scope 面板的变量值
6. 查看 Call Stack 的调用栈

技巧：
├── 在 Promise 链中设置多个断点
├── 使用 Watch 监视 Promise 状态
└── Console 中可以执行 await
```

### Q2: 如何查看接口请求的参数和响应？

```
Network 面板：
1. 筛选 Fetch/XHR
2. 点击请求
3. 查看标签：
   ├── Headers → 请求头/响应头
   ├── Payload → 请求参数
   ├── Preview → 响应预览（格式化）
   ├── Response → 原始响应
   └── Timing → 加载时间线
```

### Q3: 如何模拟移动端？

```
Device Mode（设备模式）：
1. 点击左上角设备图标（Cmd/Ctrl + Shift + M）
2. 选择设备（iPhone、iPad 等）
3. 自定义分辨率
4. 模拟触摸事件
5. 模拟地理位置

注意：只是模拟屏幕尺寸和 User-Agent，
不是真正的移动端环境，测试需用真机。
```

### Q4: 如何分析页面性能？

```
Performance 面板：
1. 点击录制按钮
2. 执行操作
3. 停止录制
4. 查看时间线：
   ├── Scripting → JS 执行时间
   ├── Rendering → 渲染时间
   ├── Painting → 绘制时间
   └── Loading → 加载时间

关键指标：
├── FCP → First Contentful Paint
├── LCP → Largest Contentful Paint
└── TTI → Time to Interactive

Lighthouse 面板：
1. 点击 Lighthouse
2. 选择审计项
3. 生成报告
4. 查看性能/可访问性/最佳实践分数
```

## 延伸练习

1. 打开任意网站，用 Elements 修改页面内容
2. 用 Console 输出彩色日志和表格
3. 用 Network 查看接口请求，分析加载时间
4. 用 Sources 设置断点调试代码
5. 用 Application 查看和清空 localStorage

## 参考资料

- [Chrome DevTools 官方文档](https://developer.chrome.com/docs/devtools/)
- [DevTools 入门](https://developer.chrome.com/docs/devtools/overview/)
