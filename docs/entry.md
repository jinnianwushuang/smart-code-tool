# smart-code-tool/docs — AI 入口

> 本目录是 VitePress 文档站源码，包含知识体系、架构文档、开发手册等内容。

---

## 站点概览

| 模块         | 路径                      | 说明                             |
| ------------ | ------------------------- | -------------------------------- |
| 🧠 心理认知  | `/psychology/`            | 心智模型、行动准则、复盘方法论   |
| ⚡ 架构文档  | `/architecture-document/` | 系统设计、技术选型、架构演进     |
| 📖 开发手册  | `/handbook/`              | 开发规范、最佳实践、工具使用     |
| 📚 面试知识  | `/interview/`             | 140+ 篇知识体系、分类整理        |
| 🛠️ 工具应用  | `/app-iframe/`            | Excel 统计、实用工具集           |
| 🤖 AI 知识库 | `/ai/`                    | AI 概念、Ollama 部署、Agent 实践 |
| 🎨 AIGC      | `/aigc/`                  | AI 生成内容、转行铺路、新技能树  |

---

## 技术栈

- **框架**: VitePress（Vue 3 + Vite）
- **部署**: Docker + Nginx
- **配置文件**: `.vitepress/config.js`

---

## AI 协作约束

### 新增文档后

1. **更新侧边栏**：修改 `.vitepress/config.js` 中的 `sidebar` 配置，否则新文档在导航中不可见
2. **遵循目录约定**：文档放在对应模块目录下，每模块可有自己的 `entry.md`
3. **文件命名**：使用 kebab-case（如 `code-review-rules.md`）

### 文档结构规范

```
docs/
├── entry.md              ← 你正在阅读的文件（AI 入口）
├── index.md              ← VitePress 首页
├── .vitepress/           ← VitePress 配置
│   └── config.js         ← 侧边栏/导航配置（新增文档必须更新）
├── psychology/           ← 心理认知模块
├── architecture-document/ ← 架构文档模块
├── handbook/             ← 开发手册模块
├── interview/            ← 面试知识模块
├── ai/                   ← AI 知识库模块
├── aigc/                 ← AIGC 模块（转行铺路）
└── app-iframe/           ← 工具应用模块
```

---

## 相关入口

- **项目级 AI 入口**: `../AGENTS.md`（smart-code-tool 根目录）
- **业务层指令**: `./ai/instructions/`（AI 协作指令集）
