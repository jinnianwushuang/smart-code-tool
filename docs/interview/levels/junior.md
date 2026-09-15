---
title: '初级工程师（P4-P5）学习路径'
level: 'junior'
tags: ['初级', 'P4', 'P5', '学习路径']
difficulty: 'medium'
updated: '2026-09-10'
target: 'P4-P5 初级工程师'
---

# 初级工程师（P4-P5）学习路径

> 初级工程师的核心目标是「会用」——掌握基础概念、常用 API，能独立完成日常开发任务。

## 级别特征

```
核心要求：
├── 掌握 HTML/CSS/JS 基础
├── 能独立完成页面开发
├── 熟悉至少一个框架（Vue/React）
├── 了解基本工具链（Git、npm）
└── 能调试常见问题

面试重点：
├── 基础概念是否清晰
├── 能否写出正确代码
├── 是否了解基本原理
└── 学习能力与态度
```

---

## 学习文档（21 篇）

### HTML/CSS 基础（4 篇）

| 文档                                                                          | 描述                              |
| ----------------------------------------------------------------------------- | --------------------------------- |
| [HTML5 语义化与文档结构 [P4-P5]](/interview/junior/html-semantics)            | 语义标签、SEO、无障碍             |
| [CSS 布局：Flexbox 与 Grid [P4-P5]](/interview/junior/css-layout)             | Flexbox 属性、Grid 布局、居中方案 |
| [响应式设计与移动端适配 [P4-P5]](/interview/junior/responsive-design)         | 媒体查询、移动优先、rem/vw        |
| [CSS 新特性：变量、动画、过渡 [P4-P5]](/interview/junior/css-modern-features) | CSS 变量、transition、animation   |

### JavaScript 基础（4 篇）

| 文档                                                                     | 描述                              |
| ------------------------------------------------------------------------ | --------------------------------- |
| [JavaScript 基础：变量、类型、运算 [P4-P5]](/interview/junior/js-basics) | 数据类型、类型转换、运算符        |
| [函数与作用域基础 [P4-P5]](/interview/junior/functions-and-scope)        | 函数声明、箭头函数、作用域        |
| [对象与类基础 [P4-P5]](/interview/junior/objects-and-classes)            | 对象字面量、class、继承           |
| [DOM 操作与事件处理 [P4-P5]](/interview/junior/dom-and-events)           | querySelector、事件监听、事件委托 |

### 浏览器/网络基础（3 篇）

| 文档                                                                     | 描述                                    |
| ------------------------------------------------------------------------ | --------------------------------------- |
| [浏览器基础：结构与开发者工具 [P4-P5]](/interview/junior/browser-basics) | 浏览器结构、URL→渲染、DevTools          |
| [HTTP 协议基础 [P4-P5]](/interview/junior/http-basics)                   | HTTP 方法、状态码、HTTPS                |
| [浏览器存储全景 [P4-P5]](/interview/junior/storage-and-cookie)           | localStorage/Cookie/IndexedDB/Cache API |

### Vue 入门（2 篇）

| 文档                                                                                 | 描述                            |
| ------------------------------------------------------------------------------------ | ------------------------------- |
| [Vue 3 入门：模板、组件、生命周期 [P4-P5]](/interview/junior/vue-basics)             | 模板语法、组件注册、生命周期    |
| [Vue 组件模式：Props、Emit、Slots [P4-P5]](/interview/junior/vue-component-patterns) | Props/Emit/Slots/provide-inject |

### TypeScript 入门（1 篇）

| 文档                                                                               | 描述                 |
| ---------------------------------------------------------------------------------- | -------------------- |
| [TypeScript 入门：类型注解与基础类型 [P4-P5]](/interview/junior/typescript-basics) | 基础类型、接口、枚举 |

### 工具链（4 篇）

| 文档                                                                 | 描述                             |
| -------------------------------------------------------------------- | -------------------------------- |
| [Git 基础：分支策略与协作流程 [P4-P5]](/interview/junior/git-basics) | add/commit/push、分支、合并      |
| [npm/pnpm 包管理入门 [P4-P5]](/interview/junior/npm-pnpm-basics)     | package.json、依赖管理、scripts  |
| [Chrome DevTools 实战 [P4-P5]](/interview/junior/devtools-basics)    | Elements/Console/Network/Sources |
| [前端调试基础 [P4-P5]](/interview/junior/debugging-basics)           | debugger、断点、条件断点         |

### 安全/部署/实战（3 篇）

| 文档                                                                      | 描述                          |
| ------------------------------------------------------------------------- | ----------------------------- |
| [Web 安全入门：XSS/CSRF [P4-P5]](/interview/junior/web-security-basics)   | XSS 类型与防范、CSRF 原理     |
| [SPA 部署基础（Nginx 配置） [P4-P5]](/interview/junior/spa-deploy-basics) | Nginx try_files、History 模式 |
| [表单与验证基础 [P4-P5]](/interview/junior/form-validation-basics)        | 表单控件、验证规则、正则      |

---

## 建议学习顺序

```
第 1 周：HTML/CSS（4 篇）→ 能写静态页面
第 2 周：JavaScript（4 篇）→ 能写交互逻辑
第 3 周：浏览器/网络（3 篇）→ 理解运行环境
第 4 周：Vue 入门（2 篇）→ 框架开发
第 5 周：TypeScript + 工具链（5 篇）→ 工程化基础
第 6 周：安全/部署/实战（3 篇）→ 完整项目
```

## 晋升到中级

完成初级内容后，建议继续学习 [中级工程师（P5-P6）](/interview/levels/intermediate) 内容，重点深入：

- 闭包、异步、设计模式等 JS 进阶
- 浏览器渲染、HTTP 缓存等原理
- Vue/React 响应式、生命周期等框架深入
