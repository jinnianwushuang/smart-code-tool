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

## 四、AI 协作约束

1. **新增文档后必须同步更新侧边栏**：编辑 `.vitepress/config/sidebar/dev-knowledge.js`，在对应框架分组中添加菜单项
2. **每个目录必须同时有 `entry.md` 和 `index.md`**：`entry.md` 是 AI 入口，`index.md` 是 VitePress 路由索引
3. **侧边栏菜单项必须包含 `id` 字段**：运行 `node scripts/inject-sidebar-ids.mjs` 自动生成
4. **文档 frontmatter 必须包含 `tags` 字段**：用于快捷工具的标签筛选和统计分布

---

## 五、与旧模块的关系

本模块从以下两个旧模块迁移而来（旧目录保留不动，作为历史归档）：

| 旧模块                   | 文档数 | 说明                         |
| ------------------------ | ------ | ---------------------------- |
| `architecture-document/` | 143 篇 | 原按主题分散组织的架构文档   |
| `interview/`             | 134 篇 | 原按等级分散组织的面试知识库 |

旧模块的顶部导航入口（「架构」「面试」）在过渡期保留，新入口为「研发知识」。
