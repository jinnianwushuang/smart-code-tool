---
title: 研发知识库
---

# 研发知识库 — AI 助手阅读理解入口

> AI 助手请从本文件开始理解研发知识库模块。

---

## 一、模块定位

研发知识库是 smart-code-tool 文档站的核心知识体系，将原先分散在 `architecture-document/`（架构文档）和 `interview/`（面试知识库）两个模块中的 **278 篇文档**，按**语言/框架优先**的原则重新组织为统一知识库。

核心价值：

- **按框架聚合** — 同一语言/框架的架构设计与面试知识集中在一处，不再分散
- **层次清晰** — 每个框架下按 `架构设计` → `面试知识库` 组织，面试按初级/中级/高级分层
- **跨域归一** — 不属于特定框架的通用知识（数据结构、设计模式、工程化等）统一归入「跨域知识」

---

## 二、目录结构

```
dev-knowledge/
├── entry.md                          ← 你正在阅读的文件（AI 入口）
├── index.md                          ← VitePress 目录索引
│
├── vue/                              # Vue 体系（架构 28 + 面试 14 = 42 篇）
│   ├── architecture/                 # 标准化模板、组件模式、Composable、性能、原理、选型
│   └── interview/                    # junior / intermediate / advanced
│
├── react/                            # React 体系（架构 25 + 面试 13 = 38 篇）
│   ├── architecture/                 # 组件模式、Hooks、状态管理、路由、性能、Fiber、选型
│   └── interview/                    # intermediate / advanced
│
├── flutter/                          # Flutter 体系（架构 30 + 面试 15 = 45 篇）
│   ├── architecture/                 # 状态管理、路由、网络、渲染、插件、思考文档、典型拆解
│   └── interview/                    # intermediate / advanced
│
├── js-ts/                            # JavaScript / TypeScript 体系（架构 9 + 面试 19 = 28 篇）
│   ├── architecture/typical-analysis # 类型拆解、事件调度、Promise、原型链、虚拟 DOM
│   └── interview/                    # junior / intermediate / javascript-advanced / typescript
│
├── nodejs/                           # Node.js 体系（架构 3 + 面试 7 = 10 篇）
│   ├── architecture/                 # 项目分层、框架选型、中间件模式
│   └── interview/advanced/           # 运行时、数据库、部署
│
├── python/                           # Python 体系（架构 3 篇）
│   └── architecture/                 # 工程化、技术选型、AI 开发架构
│
├── cross-domain/                     # 跨域知识（不属于特定框架的通用知识）
│   ├── general-fundamentals/         # 通用基础（HTML/CSS/JS/HTTP/Git/浏览器/部署）
│   ├── data-structure/               # 数据结构（6 篇）
│   ├── design-patterns/              # 设计模式（4 篇）
│   ├── browser-and-network/          # 浏览器与网络（4 篇）
│   ├── engineering/                  # 工程化实践（16 篇）
│   ├── architecture-and-system/      # 架构愿景与系统设计（24 篇）
│   ├── framework-comparison/         # 框架对比（3 篇）
│   ├── ai-and-new-tech/              # AI 与新技术（4 篇）
│   ├── api-and-cross-platform/       # API 与跨平台（4 篇）
│   └── management/                   # 技术管理（5 篇）
│
└── learning-paths/                   # 学习路径导航（6 篇）
    ├── junior.md                     # 初级工程师（P4-P5）
    ├── intermediate.md               # 中级工程师（P5-P6）
    ├── senior.md                     # 高级工程师（P6-P7）
    ├── architect.md                  # 架构师（P8）
    ├── manager.md                    # 技术主管（TL）
    └── flutter.md                    # Flutter 学习路径
```

---

## 三、文档等级标签

面试文档标题中包含等级标签，表示该知识点适用的职级范围：

| 标签      | 含义                              |
| --------- | --------------------------------- |
| `[P4-P5]` | 初级工程师 — 基础概念与入门实践   |
| `[P5-P6]` | 中级工程师 — 深入理解与工程化实践 |
| `[P6-P7]` | 高级工程师 — 原理拆解与架构设计   |
| `[P8]`    | 架构师 — 系统设计与技术决策       |
| `[TL]`    | 技术主管 — 团队管理与技术规划     |

---

## 四、新增文档规范

### 4.1 文件放置规则

根据文档内容所属框架/领域，放入对应目录：

| 内容属于       | 放置目录                                                | 示例                       |
| -------------- | ------------------------------------------------------- | -------------------------- |
| Vue 相关       | `vue/architecture/` 或 `vue/interview/<level>/`         | 组件模式、响应式原理       |
| React 相关     | `react/architecture/` 或 `react/interview/<level>/`     | Fiber、Hooks 模式          |
| Flutter 相关   | `flutter/architecture/` 或 `flutter/interview/<level>/` | Widget 体系、渲染引擎      |
| JS/TS 语言层   | `js-ts/architecture/` 或 `js-ts/interview/<level>/`     | 引擎原理、类型体操         |
| Node.js 相关   | `nodejs/architecture/` 或 `nodejs/interview/<level>/`   | 运行时、ORM                |
| Python 相关    | `python/architecture/`                                  | 工程化、AI 开发            |
| 跨框架通用知识 | `cross-domain/` 下对应子目录                            | 数据结构、设计模式、工程化 |
| 学习路径规划   | `learning-paths/`                                       | 新增/更新学习路径文件      |

> **判断原则**：先看内容属于哪个框架，再区分是架构设计还是面试知识。

### 4.2 文件命名

- 使用 **kebab-case**：`vue-lifecycle.md`、`flutter-network-architecture.md`
- 名称要语义化，能看出内容主题
- 面试文档可带等级后缀：`topic-name.md`（等级写在标题和 frontmatter 中）

### 4.3 Frontmatter 必填字段

```yaml
---
title: '文档标题 [P5-P6]' # 必填，含等级标签
level: 'intermediate' # 必填：junior / intermediate / advanced
tags: ['Vue', '响应式', 'Proxy'] # 必填，用于标签筛选
difficulty: 'medium' # 可选：easy / medium / hard
target: 'P5-P6 中级工程师' # 可选，目标读者
---
```

### 4.4 文档内容结构

推荐采用 **What → Why → How** 三段式：

```markdown
# 标题 [等级]

> 一句话说明本文解决什么问题。

## 核心概念（What）

概念定义、知识框架、思维导图

## 为什么需要（Why）

背景、痛点、适用场景

## 如何实现（How）

代码示例、最佳实践、注意事项

## 面试要点

高频面试问题总结（面试文档必填）

## 相关链接

相关文档的绝对路径链接
```

### 4.5 链接规范

- **使用绝对路径**：`/dev-knowledge/vue/interview/advanced/reactivity-deep`
- **不加 `.md` 后缀**：VitePress 自动处理路由
- **VitePress base 自动处理**：`base: '/smart-code-tool/'` 会自动拼接前缀

### 4.6 新增后必做清单

```
□ 1. 将文档放入正确的框架/级别目录
□ 2. 更新侧边栏配置：.vitepress/config/sidebar/dev-knowledge.js
□ 3. 运行 inject IDs：node scripts/inject-sidebar-ids.mjs
□ 4. 运行标签生成：pnpm gen:frontmatter-tags
□ 5. 运行文档列表：pnpm gen:doc-list
□ 6. 如有学习路径引用，同步更新 learning-paths/ 中的链接
```

### 4.7 目录级双文件约定

每个目录必须同时包含：

| 文件       | 用途               | 说明                                               |
| ---------- | ------------------ | -------------------------------------------------- |
| `entry.md` | AI 入口            | 供智能体读取模块概览、技术约束                     |
| `index.md` | VitePress 路由索引 | 目录级链接（如 `/dev-knowledge/vue/`）解析到此文件 |

> ⚠️ 如果目录只有 `entry.md` 没有 `index.md`，目录级路由会 404。

---

## 五、历史沿革

本模块从以下两个旧模块迁移合并而来：

| 旧模块                   | 文档数 | 说明                         |
| ------------------------ | ------ | ---------------------------- |
| `architecture-document/` | 143 篇 | 原按主题分散组织的架构文档   |
| `interview/`             | 134 篇 | 原按等级分散组织的面试知识库 |

旧目录已删除，所有文档统一在 `dev-knowledge/` 下按框架组织。
