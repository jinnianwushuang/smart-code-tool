# 业务层设计文档

> 定义 Smart Dev Kit 三层上下文中的「业务层」—— 承载位置、目录结构、与 KIT 的对接方式。

---

## 一、定位

三层上下文各回答不同的问题：

| 层     | 回答                              | 承载位置              | 举例                                   |
| ------ | --------------------------------- | --------------------- | -------------------------------------- |
| 接口层 | 接口**是什么** — 字段、类型、参数 | KIT `api-archive/`    | `GET /orders` 返回 `status: "PENDING"` |
| 架构层 | 代码**怎么写** — 模式、规范、约束 | KIT `*-instructions/` | Vue 组件用 `<script setup>` + Pinia    |
| 业务层 | **为什么**这样做、**有什么约束**  | 主项目文档站          | 订单 30 分钟未支付自动取消             |

没有业务层时，AI 能写出结构正确的代码，但会犯**业务逻辑错误** —— 因为它不知道规则。

---

## 二、承载方式：主项目伴生文档站

**业务层不是 KIT 管理的独立目录，而是主项目文档站中的内容约定。**

实际商业项目都有自有的项目文档（推荐 VitePress 文档站），每个主项目自己伴生一个文档站。业务上下文和业务指令都是文档站内的内容模块。

以 fullstack-base 为例：

```
fullstack-base/apps/docs/          ← 文档站根目录
├── entry.md                       ← AI 入口（无则 AI 自动生成）
├── .vitepress/
├── modules/                       ← 核心模块文档
├── ai-instructions/               ← 业务 AI 指令
└── ...
```

### 设计决策

| 决策                   | 理由                                               |
| ---------------------- | -------------------------------------------------- |
| 复用文档站而非新建目录 | 项目已有文档站，开发者熟悉维护流程，不增加额外负担 |
| 业务规则在模块内部     | 规则和模块代码是一体的，维护时一眼可见，不散落     |
| AI 指令独立于模块      | 指令有自己的流程、产出物（图谱/报告）和迭代周期    |
| entry.md 为统一入口    | 与 KIT 所有模块的入口约定一致                      |

---

## 三、目录结构

### 3.1 核心模块文档 (`modules/`)

每个模块一个**目录**（非单文件），内含入口、思维链路和详细文档：

```
modules/
├── order/
│   ├── entry.md                  ← 模块入口：概述 + 阅读导航
│   ├── thinking-chain.md         ← 思维链路：从设计决策到数据流的推导链
│   ├── domain-model.md           ← 实体、关系、状态流转
│   ├── business-rules.md         ← 业务规则（紧贴模块）
│   └── data-flow.md              ← 数据流向（可选，复杂模块才有）
├── user/
│   ├── entry.md
│   ├── thinking-chain.md
│   ├── domain-model.md
│   ├── business-rules.md
│   └── ...
└── content/
    └── ...
```

**思维链路**是模块文档的核心 —— 不是散乱的知识片段，而是一条可传承的推导链：

```
entry.md（入口导航）
  → thinking-chain.md（为什么这样设计 → 关键决策点 → 数据怎么流转 → 改这里会影响哪里）
    → domain-model.md / business-rules.md / ...（链路中引用的详细文档）
```

读完这条链路，就知道这个模块怎么维护。新人（或 AI）不需要翻遍代码才能上手。

### 3.2 业务 AI 指令 (`ai-instructions/`)

独立于模块文档，每个指令有自己的流程目录：

```
ai-instructions/
├── entry.md                      ← 所有业务指令的聚合入口
├── module-review/                ← 模块代码检查
│   ├── entry.md                  ← 指令入口：流程说明
│   ├── file-graph.md             ← 关键点个文件来源图谱
│   ├── check-rules.md            ← 检查规则定义
│   └── report-template.md        ← 检查报告模板
├── business-audit/               ← 业务线梳理
│   ├── entry.md
│   └── ...
├── doc-gen/                      ← 知识文档生成/核对
│   ├── entry.md
│   └── ...
└── comment-gen/                  ← 注释文档生成
    ├── entry.md
    └── ...
```

**为什么不把检查指令放在模块内？**

- 代码检查需要生成**文件来源图谱**（跨模块的关键文件映射），这是独立产物
- 需要输出**检查报告**并做历史对比
- 指令有独立的迭代生命周期（流程优化、规则调整）
- 与模块文档的关注点不同：模块文档是「理解」，指令是「执行」

### 3.3 AI 入口 (`entry.md`)

文档站根目录的 `entry.md` 是 AI 理解业务层的入口：

```markdown
# 文档站 AI 协作入口

## 文档站架构

本项目伴生文档站（VitePress），承载核心模块文档和业务 AI 指令。

## 目录说明

- `modules/` — 核心模块文档，每个模块一个目录，含入口、思维链路、领域模型、业务规则
- `ai-instructions/` — 业务性 AI 指令，每个指令独立目录，含流程和产出物

## 与 Smart Dev Kit 的关系

- 接口层：[smart-dev-kit]/api-archive/entry.md
- 架构层：[smart-dev-kit]/vue-instructions/entry.md
- 总调度：[smart-dev-kit]/dispatcher/entry.md
```

**自生成机制：** AI 去读 `entry.md` 时，如果文件不存在，就基于文档站当前目录结构自动生成一份。这样：

- 有 → 直接读，快速理解
- 没有 → AI 生成，下次就能用了
- 结构变了 → AI 重新生成，自我纠错进化

---

## 四、与 Smart Dev Kit 的对接

### 4.1 配置

`smart-dev-kit.json` 新增 `businessContext` 字段：

```json
{
  "projectId": "fullstack-base",
  "kitPath": "../smart-dev-kit",
  "businessContext": "apps/docs"
}
```

`businessContext` 为字符串类型，指向文档站根目录（相对项目根目录）。

### 4.2 dispatcher 加载编排

```
1. smart-dev-kit.json             → 获取 businessContext 路径
2. <businessContext>/entry.md     → 加载业务层入口（无则自动生成）
3. 按 entry.md 导航加载          → modules/ + ai-instructions/
```

加载顺序（完整）：

```
1. smart-dev-kit.json             → 获取 projectId、kitPath、businessContext
2. dispatcher/entry.md            → 了解调度编排
3. *-instructions/entry.md        → 架构层（框架推断后加载）
4. <businessContext>/entry.md     → 业务层（如有配置）
5. api-archive/entry.md           → 接口层
```

### 4.3 KIT 侧职责

| 职责     | 说明                                                    |
| -------- | ------------------------------------------------------- |
| 配置定义 | `smart-dev-kit.json` 中 `businessContext` 字段          |
| 加载编排 | dispatcher 读取路径并加载 entry.md                      |
| 设计指南 | `instruction-design/business-layer-design.md`（本文档） |

KIT **不管理**文档站内的具体内容 —— 那是主项目自己的事。

---

## 五、冷启动

AI 从现有代码生成文档站内容初版，按模块逐个推进：

```
① 读 Prisma schema + Service → 生成 modules/order/domain-model.md
② 读 Controller + 业务逻辑   → 生成 modules/order/business-rules.md
③ 串联 ①② + 代码结构分析    → 生成 modules/order/thinking-chain.md
④ 汇总模块全貌               → 生成 modules/order/entry.md
⑤ 从检查需求出发             → 生成 ai-instructions/module-review/ 骨架
```

### 5.1 侧边栏菜单同步

**每次往文档站写入新文档时，必须同步更新 VitePress 侧边栏配置。**

写入文档后如果菜单没更新，新文档在导航中不可见，等于白写。

操作流程：

```
① 写入 .md 文件
② 更新 .vitepress/config.ts（或对应 sidebar 配置文件）中的 sidebar 项
③ 确认新文档在侧边栏中有对应入口
```

注意：不同项目的 VitePress 侧边栏配置方式可能不同（有的集中在 `config.ts`，有的拆分到独立 sidebar 文件），AI 应先读取现有配置结构再操作。

---

## 六、与「进化」环节的关系

业务层打通了经验团队共享的落地路径：

```
AI 协作中发现的业务规则遗漏
  → 补充到 modules/<模块>/business-rules.md
    → 团队所有人（和 AI）下次都能读到
```

文档站就是经验沉淀的载体，不需要额外的存储机制。

---

## 七、设计决策记录

| 决策         | 被选方案              | 被拒方案                        | 理由                                  |
| ------------ | --------------------- | ------------------------------- | ------------------------------------- |
| 承载位置     | 主项目文档站          | KIT 内独立目录 / 主项目独立目录 | 复用已有文档站，开发者维护成本低      |
| 业务规则位置 | 模块目录内部          | 独立 business-rules/ 目录       | 紧贴模块，不散落                      |
| AI 指令位置  | 独立 ai-instructions/ | 混入模块文档                    | 指令有独立流程和产出物，关注点不同    |
| 配置格式     | 字符串（文档站路径）  | 对象（多子路径）                | 只需知道根目录，AI 通过 entry.md 导航 |
| 入口文件     | entry.md              | AI_ENTRY.md                     | 与 KIT 所有模块的入口约定一致         |
