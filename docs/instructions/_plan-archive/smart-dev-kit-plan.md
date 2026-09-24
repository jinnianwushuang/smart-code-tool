# smart-dev-kit 实施计划书（存档修正版）

> 本文档为 smart-dev-kit 项目的实施计划书存档，已根据项目实际完成情况修正。
> 原始计划基于「多工作区组合开发套件」设计文档拆解，以下为最终实施结果。

---

## 总体概览

```
阶段 0 ─ ✅ 项目初始化（骨架 + Git + 工作区配置 + pnpm）
阶段 1 ─ ✅ api-archive 数据层（目录结构 + 约束文件 + AI 入口）
阶段 2 ─ ✅ api-archive/server Fastify 5 服务（上报接收 + 查询 API + 防抖落盘 + schema 骨架生成）
阶段 3 ─ ✅ api-archive/sdk（HTTP/WS 上报 SDK + 日志模块）
阶段 4 ─ ✅ CLI 命令（fix-schemas + force-update-schemas + sync-mapping + generate-mapping + rebuild-index + clean 系列）
阶段 5 ─ ✅ dispatcher 总调度（AI 入口编排 + schema-enrichment）
阶段 6 ─ ✅ 架构层集成（Vue/React/Flutter 指令集 + vue-arch-starter）
阶段 7 ─ ✅ api-web 接口可视化（Vue 3 + Vite 6 + AntDV 4 + Pinia，项目作用域路由 + Tab 面板）
阶段 8 ─ ✅ scripts ZX 脚本（服务拉起/停止 + 清理命令）
阶段 9 ─ ✅ 联调验证（端到端测试，fullstack-base 项目已跑通）
阶段 10 ─ ✅ AI 反向丰富指令（schema 第③级 + schema-enrichment.md）
```

---

## projectId 全链路校验（核心约束）

商业项目不固定，通过**自定义 projectId**（即项目名字，如 `fullstack-base`）与套件关联。projectId 是贯穿整个系统的数据隔离和关联纽带，**每一层都必须严格校验**，否则会导致数据错乱、存档串项目。

> **命名规范**：projectId 为人类可读的项目名称，只允许小写字母、数字、连字符（`a-z0-9-`），禁止哈希值或不可读字符串。

### 校验链路

```
商业项目定义 projectId（如 'fullstack-base'）
  │
  ├─→ SDK 初始化时传入 projectId
  │     │
  │     ├─→ 每条上报数据必须携带 projectId
  │     ├─→ 服务端校验 projectId 非空、格式合法
  │     └─→ 服务端校验 projectId 与请求体内部 projectId 一致
  │
  ├─→ 服务端按 projectId 隔离存储（三级目录）
  │     ├─→ archives/<projectId>/<module>/<channel>/...
  │     ├─→ schemas/<projectId>/<module>/<channel>/...
  │     └─→ mappings/<projectId>.json
  │
  ├─→ 配置查询 API 按 projectId 返回存档状态
  │
  ├─→ SDK 轮询时按 projectId 获取节流规则
  │
  ├─→ api-web 按 projectId 过滤展示
  │
  └─→ CLI 命令按 projectId 操作
```

### 校验规则

| 层级        | 校验点                                    | 说明                                      |
| ----------- | ----------------------------------------- | ----------------------------------------- |
| **SDK**     | 初始化时校验 projectId 非空且格式合法     | 只允许 `a-z0-9-`，空或非法直接报错        |
| **SDK**     | 上报数据自动附加 projectId                | 每条数据必须携带，不可缺失                |
| **服务端**  | 接收时校验 projectId 存在、格式合法且一致 | URL 路径与请求体内部的 projectId 必须一致 |
| **服务端**  | 落盘时校验目录名 = projectId              | 防止路径穿越或写错目录                    |
| **服务端**  | 查询 API 校验 projectId 对应的目录存在    | 不存在返回 404，不报错                    |
| **api-web** | 页面加载时校验 projectId 有效             | 无效 projectId 显示空状态                 |
| **CLI**     | 命令参数校验 projectId 存在               | 不存在提示错误                            |

> **实施原则**：projectId 校验贯穿所有阶段，每个阶段实现时都要检查。
> **实际数据**：已接入项目 `fullstack-base`，包含 23 个模块（analytics、articles、auth、categories 等），channel 为 `vue-admin`。

---

## 阶段 0：项目初始化

**目标**：建立 smart-dev-kit 仓库骨架和基础配置。

### 步骤

- [x] **0.1** 初始化 Git 仓库 + pnpm 包管理

- [x] **0.2** 创建根目录结构

  ```
  smart-dev-kit/
  ├── AI_ENTRY.md                ← AI 助手阅读理解入口
  ├── README.md                  ← 项目简介 + 快速开始
  ├── smart-dev-kit.config.json  ← 全局配置
  ├── smart-dev-kit.code-workspace ← VSCode 工作区配置
  ├── package.json               ← 根目录脚本命令（zx）
  ├── .gitignore
  ├── api-archive/               ← 接口层
  ├── api-web/                   ← 接口可视化
  ├── vue-instructions/          ← Vue 架构层指令集
  ├── react-instructions/        ← React 架构层指令集
  ├── flutter-instructions/      ← Flutter 架构层指令集
  ├── dispatcher/                ← 总调度
  └── scripts/                   ← ZX 脚本
  ```

- [x] **0.3** 创建根目录配置文件 `smart-dev-kit.config.json`

  ```json
  {
    "server": {
      "port": 38800,
      "debounceMs": 5000,
      "maxArchivePerApi": 4,
      "asyncThrottleMs": 100,
      "archiveStatusCacheMs": 300000,
      "maxBodySize": 1048576,
      "maxBatchSize": 50
    },
    "sdk": {
      "pollIntervalMs": 30000,
      "batchSize": 5,
      "batchFlushMs": 5000
    },
    "apiWeb": {
      "port": 38820
    }
  }
  ```

  > 与原计划差异：`maxArchivePerApi` 调整为 4（原计划 10），`batchSize` 调整为 5（原计划 10），新增 `maxBodySize`（1MB）和 `maxBatchSize`（50）安全限制

- [x] **0.4** 创建 `package.json`（根目录，type: module，zx 脚本命令）

  实际注册的命令：

  ```json
  {
    "scripts": {
      "dev": "zx scripts/start.mjs",
      "start": "zx scripts/start.mjs",
      "stop": "zx scripts/stop.mjs",
      "restart": "pnpm stop && pnpm start",
      "fix-schemas": "zx scripts/fix-schemas.mjs",
      "force-update-schemas": "zx scripts/force-update-schemas.mjs",
      "sync-mapping": "zx scripts/sync-mapping.mjs",
      "generate-mapping": "zx scripts/generate-mapping.mjs",
      "rebuild-index": "zx scripts/rebuild-index.mjs",
      "clean:archives": "zx scripts/clean-archives.mjs",
      "clean:schemas": "zx scripts/clean-schemas.mjs",
      "clean:all": "zx scripts/clean-all.mjs"
    }
  }
  ```

- [x] **0.5** 创建 `smart-dev-kit.code-workspace`（单根工作区）

- [x] **0.6** 创建 `.gitignore`

- [x] **0.7** 创建 `README.md`

- [x] **0.8** 创建 `AI_ENTRY.md` — AI 助手阅读理解入口（原计划无此项，实际新增）

---

## 阶段 1：api-archive 数据层

**目标**：建立接口存档、schema、映射文件的目录结构和格式约束。

### 步骤

- [x] **1.1** 创建 `constraints/archive-format.json` — 定义 archives/ 下 JSON 文件的结构规范

- [x] **1.2** 创建 `constraints/schema-format.json` — 定义 schemas/ 下字段解释文件的结构规范

  > **字段平坦化规范**：
  >
  > - 所有字段使用**单层 path key**（点号分隔），不层层嵌套
  > - 数组用 `[0]` 表示元素结构，如 `data.orders[0].orderId`
  > - 每个字段独立一行，包含 `type`、`required`、`description`
  > - `description` 初始为空，由 AI 后续增补解释

  > **模板完整性要求**：
  >
  > - SDK 上报的原始 JSON 中**每个字段都必须提取**，不能遗漏
  > - 嵌套对象递归展开为平坦 path，如 `{ data: { list: [{ name: '' }] } }` → `data.list[0].name`
  > - 模板必须完整生成，即使字段很多也不能截断

- [x] **1.3** 创建 `constraints/mapping-format.json` — 定义 mappings/ 下映射文件的结构规范

- [x] **1.4** 创建 `api-archive/ai-entry.md` — 接口层 AI 理解入口

- [x] **1.5** 创建 `api-archive/schema-enrichment.md` — AI 反向丰富 schema 指令文档

### 实际数据存储结构

```
api-archive/
├── archives/<projectId>/<module>/<channel>/   ← 接口原始 JSON 存档
├── schemas/<projectId>/<module>/<channel>/    ← 字段解释文件（含 _index.json）
├── mappings/                                  ← 映射文件
├── constraints/                               ← 格式约束（3 个 JSON Schema）
├── sdk/                                       ← 上报 SDK
├── server/                                    ← Fastify 本地服务
├── ai-entry.md                                ← 接口层 AI 入口
└── schema-enrichment.md                       ← AI 反向丰富 schema 指令
```

> 与原计划差异：数据存储采用三级目录 `<projectId>/<module>/<channel>/`，channel 表示调用来源（如 `vue-admin`），比原计划更精细

---

## 阶段 2：api-archive/server — Fastify 5 服务

**目标**：搭建 Fastify 本地服务，实现上报接收、接口查询、异步节流落盘、schema 骨架生成、存档上限控制。

**核心原则**：

- 所有接口**快速响应**（先返回 200，后台异步处理）
- IO 密集场景采用**异步节流**，避免磁盘写入阻塞
- 单接口存档上限控制（默认 4 条，配置文件可调）

### 实际文件结构

```
api-archive/server/
├── index.js              ← Fastify 服务入口
├── config.js             ← 配置加载（读取 smart-dev-kit.config.json）
├── registry.js           ← 路由注册中心
├── buffer.js             ← 内存缓冲区（批量上报数据暂存）
├── writer.js             ← 异步节流落盘
├── schema-generator.js   ← Schema 骨架自动生成（第①级）
├── archive-status.js     ← 存档状态缓存（定时扫描）
├── routes/
│   ├── report.js         ← POST /api/report（上报接收）
│   ├── archives.js       ← GET /api/archives/:projectId（存档查询）
│   ├── schemas.js        ← GET /api/schemas/:projectId（schema 查询）
│   ├── projects.js       ← 项目列表查询
│   └── config.js         ← GET /api/config（配置 + 存档状态）
├── .cache/               ← 缓存目录（archive-status.json）
└── package.json          ← Fastify 5 + @fastify/cors 10
```

### 步骤

- [x] **2.1** 初始化 Fastify 5 项目（pnpm 管理依赖）

- [x] **2.2** 实现配置加载 `server/config.js`
  - 读取根目录 `smart-dev-kit.config.json`
  - 提供默认值（端口 38800、上限 4、防抖 5s 等）

- [x] **2.3** 实现核心入口 `server/index.js`
  - 启动 Fastify 5 服务
  - 注册 CORS 插件
  - 通过 registry.js 统一注册路由

- [x] **2.4** 实现上报接收 API `POST /api/report`
  - 快速响应：立即返回 200
  - 支持批量上报（数组格式，上限 maxBatchSize=50）
  - 请求体大小限制 maxBodySize=1MB
  - 数据放入 buffer.js 内存缓冲区

- [x] **2.5** 实现异步节流落盘机制（writer.js）
  - 节流窗口 5 秒到期后批量写入
  - 写入前检查存档上限（maxArchivePerApi=4）
  - 超过上限的接口不再写入

- [x] **2.6** 实现 schema 骨架自动生成（schema-generator.js，第①级）
  - 从原始 JSON 递归展开所有字段，平坦化为 path key
  - 每个字段生成 `{ type, required, description: "" }`
  - 已存在的 schema 合并（新增字段补入，不覆盖已有 description）

- [x] **2.7** 实现接口查询 API
  - `GET /api/archives/:projectId` — 列出项目的所有接口存档
  - `GET /api/schemas/:projectId` — 列出项目的所有 schema
  - `GET /api/projects` — 列出所有已接入项目
  - `GET /api/config` — 获取配置 + 存档状态缓存
  - `GET /api/health` — 健康检查

- [x] **2.8** 实现存档状态缓存（archive-status.js）
  - 后台定时任务（5 分钟间隔）扫描 archives/ 目录
  - 生成缓存文件 `.cache/archive-status.json`

> 与原计划差异：服务端模块拆分更细（registry、buffer、writer、archive-status 独立），新增 projects 路由，Fastify 版本为 5（原计划未指定版本），存档上限调整为 4

---

## 阶段 3：api-archive/sdk — 上报 SDK

**目标**：创建轻量 SDK，供主项目手动拷贝后挂载到 HTTP/WS 实例上自动上报，具备智能节流和批量上报能力。

**核心能力**：

- **极简接入**：初始化只需传入项目名，其他全部自动
- **批量上报**：攒一批数据再发送，减少请求次数
- **定时轮询**：定期从服务端获取接口配置和存档状态
- **智能节流**：已满的接口不再上报，避免无效请求

### SDK 接入设计（极简参数）

```js
// 主项目 src/utils/request.js（axios 实例封装处）
import { createReporter } from './api-reporter'

const axiosInstance = axios.create({ baseURL: '...' })

// 只需传入项目名，其他全部自动
createReporter(axiosInstance, 'fullstack-base')
```

### 实际文件结构

```
api-archive/sdk/
├── index.js          ← SDK 入口，导出 createReporter
├── reporter.js       ← 批量上报逻辑（HTTP/WS 拦截）
├── poller.js         ← 定时轮询服务端配置
├── throttle.js       ← 智能节流控制
├── logger.js         ← 日志模块（原计划无，实际新增）
├── types.d.ts        ← TypeScript 类型定义
└── INTEGRATION.md    ← SDK 对接文档
```

### 步骤

- [x] **3.1** 创建 `sdk/index.js` — SDK 入口
  - 导出 `createReporter(instance, projectName)` 函数
  - 服务端地址默认 `http://localhost:38800`，可通过可选第三参数覆盖
  - 初始化时立即拉取一次服务端配置

- [x] **3.2** 创建 `sdk/reporter.js` — 批量上报逻辑
  - HTTP 模式：拦截 axios 实例的请求/响应
  - WS 模式：拦截 WebSocket 实例的消息
  - 数据先放入本地缓冲区，达到 `batchSize`(5) 或 `batchFlushMs`(5s) 后批量发送

- [x] **3.3** 创建 `sdk/poller.js` — 定时轮询配置
  - 按 `pollIntervalMs`（默认 30 秒）轮询 `GET /api/config`
  - 获取各接口存档状态
  - 更新本地节流规则

- [x] **3.4** 创建 `sdk/throttle.js` — 智能节流控制
  - 上报前检查接口是否已满（count >= maxArchivePerApi）
  - 已满的接口直接丢弃
  - 节流规则随轮询结果动态更新

- [x] **3.5** 创建 `sdk/logger.js` — 日志模块（原计划无，实际新增用于调试）

- [x] **3.6** 创建 `sdk/types.d.ts` — TypeScript 类型定义

- [x] **3.7** 生成 SDK 对接文档 `sdk/INTEGRATION.md`

---

## 阶段 4：CLI 命令

**目标**：实现 schema 修复、映射同步、索引重建、数据清理等 CLI 命令。

### 实际文件结构

```
scripts/
├── start.mjs              ← 启动所有服务
├── stop.mjs               ← 停止所有服务
├── fix-schemas.mjs        ← Schema 第②级修复（对比差异）
├── force-update-schemas.mjs ← 强制补全所有 schema 元数据字段
├── sync-mapping.mjs       ← 同步映射文件
├── generate-mapping.mjs   ← 生成映射文件
├── rebuild-index.mjs      ← 重建 _index.json 索引
├── clean-archives.mjs     ← 清理存档数据
├── clean-schemas.mjs      ← 清理 schema 数据
└── clean-all.mjs          ← 清理所有数据
```

### 步骤

- [x] **4.1** 实现 `scripts/fix-schemas.mjs`（schema 第②级修复）
  - 对比 archives/ 与 schemas/ 的差异
  - 新增字段补入 schema 骨架
  - 删除字段标记 deprecated
  - 类型变更标记 conflict

- [x] **4.2** 实现 `scripts/force-update-schemas.mjs`（原计划无，实际新增）
  - 强制补全所有 schema 的元数据字段

- [x] **4.3** 实现 `scripts/sync-mapping.mjs`
  - 手动触发映射文件生成

- [x] **4.4** 实现 `scripts/generate-mapping.mjs`
  - 生成指定项目的映射文件

- [x] **4.5** 实现 `scripts/rebuild-index.mjs`（原计划无，实际新增）
  - 重建 schemas/ 下各项目的 `_index.json` 索引文件

- [x] **4.6** 实现清理脚本（原计划无，实际新增）
  - `clean-archives.mjs` — 清理存档数据
  - `clean-schemas.mjs` — 清理 schema 数据
  - `clean-all.mjs` — 清理所有数据

- [x] **4.7** 在根 `package.json` 中注册所有命令（使用 zx 执行）

---

## 阶段 5：dispatcher 总调度

**目标**：创建 AI 入口编排中心，负责串联三层上下文。

### 实际文件结构

```
dispatcher/
├── entry.md              ← 调度入口（AI 总入口文件）
├── ai-entry.md           ← dispatcher 的 AI 理解入口
├── frameworks.json       ← 框架路由配置
└── schema-enrichment.md  ← Schema 丰富指令编排
```

### 步骤

- [x] **5.1** 创建 `dispatcher/entry.md` — AI 总入口文件
  - 声明加载顺序
  - 根据框架类型路由到对应指令集

- [x] **5.2** 创建 `dispatcher/frameworks.json` — 框架路由配置

  ```json
  {
    "vue": {
      "name": "Vue",
      "instructions": "../vue-instructions/",
      "prompts": "../vue-instructions/prompts.md",
      "constraints": "../vue-instructions/constraints.md"
    },
    "react": { ... },
    "flutter": { ... }
  }
  ```

  > 与原计划差异：新增 `name` 和 `constraints` 字段，路径使用 `../` 相对引用

- [x] **5.3** 创建 `dispatcher/ai-entry.md` — dispatcher 的 AI 理解入口

- [x] **5.4** 创建 `dispatcher/schema-enrichment.md` — Schema 丰富指令编排（原计划无，实际新增）

---

## 阶段 6：架构层集成

**目标**：将 smart-code-tool 中已有的指令集和提示词拷贝到 smart-dev-kit 对应目录。

### 实际文件结构

```
vue-instructions/
├── ai-entry.md          ← Vue 架构层 AI 入口
├── constraints.md       ← Vue 约束规则
├── prompts.md           ← Vue 提示词
├── vue-arch-starter/    ← Vue 架构启动器（含完整 code-template）
│   ├── docs/            ← 文档（architecture、customization、file-index、integration）
│   └── vue-arch-starter/ ← 指令集本体（config、entry、glossary、instructions、code-template）
├── vue-assembler/       ← Vue 组装器指令集
│   ├── VERSION.md
│   ├── docs/
│   └── vue-assembler/
└── vue-code-review/     ← Vue 代码审查指令集
    ├── VERSION.md
    ├── docs/
    └── vue-code-review/

react-instructions/
├── ai-entry.md
├── constraints.md
├── prompts.md
├── react-assembler/
└── react-code-review/

flutter-instructions/
├── ai-entry.md
├── constraints.md
├── prompts.md
├── flutter-assembler/
└── flutter-code-review/
```

### 步骤

- [x] **6.1** 拷贝 Vue 指令集
  - vue-assembler、vue-code-review、vue-arch-starter（含完整 code-template）
  - `prompts.md` + `constraints.md` + `ai-entry.md`

- [x] **6.2** 拷贝 React 指令集
  - react-assembler、react-code-review
  - `prompts.md` + `constraints.md` + `ai-entry.md`

- [x] **6.3** 拷贝 Flutter 指令集
  - flutter-assembler、flutter-code-review
  - `prompts.md` + `constraints.md` + `ai-entry.md`

- [x] **6.4** 每个指令集包含 VERSION.md 版本标记

> 与原计划差异：未拷贝 instruction-architecture 设计文档，新增了 vue-arch-starter（含完整代码模板），每个框架指令集统一包含 ai-entry.md + constraints.md + prompts.md 三件套

---

## 阶段 7：api-web 接口可视化

**目标**：搭建独立前端项目，提供接口浏览、schema 展示、KIT 指南、SDK 文档等页面。

### 技术栈（实际）

- Vue 3.5 + Vite 6 + Ant Design Vue 4 + Pinia 2 + Vue Router 4
- 开发代理：Vite proxy 转发 `/api` 到 `http://localhost:38800`

### 实际路由结构

| 路由                                                 | 页面            | 说明                                      |
| ---------------------------------------------------- | --------------- | ----------------------------------------- |
| `/`                                                  | Home.vue        | 项目列表首页                              |
| `/docs`                                              | Docs.vue        | 文档中心（Tab 切换：使用指南 / SDK 文档） |
| `/project/:projectId`                                | ProjectLayout   | 项目作用域布局                            |
| `/project/:projectId/apis`                           | ApiOverview.vue | 接口概览（模块 → channel → 接口树形）     |
| `/project/:projectId/apis/:module/:channel/:apiPath` | ApiDetail.vue   | 接口详情（多 Tab）                        |

### 接口详情 Tab 面板

| Tab      | 组件            | 说明            |
| -------- | --------------- | --------------- |
| Archives | ArchivesTab.vue | 历史存档列表    |
| Diff     | DiffTab.vue     | 变更对比        |
| Fields   | FieldsTab.vue   | Schema 字段解释 |
| Preview  | PreviewTab.vue  | 响应预览        |
| Raw      | RawTab.vue      | 原始 JSON       |

### 实际文件结构

```
api-web/src/
├── main.js
├── App.vue
├── router/index.js
├── stores/
├── composables/
├── components/
├── layouts/ProjectLayout.vue
└── pages/
    ├── Home.vue
    ├── Docs.vue
    ├── docs/GuideTab.vue
    ├── docs/SdkDocsTab.vue
    └── project/
        ├── ApiOverview.vue
        ├── ApiDetail.vue
        └── tabs/
            ├── ArchivesTab.vue
            ├── DiffTab.vue
            ├── FieldsTab.vue
            ├── PreviewTab.vue
            └── RawTab.vue
```

### 步骤

- [x] **7.1** 初始化 Vite 6 + Vue 3 前端项目（pnpm 管理）

- [x] **7.2** 配置路由（项目作用域嵌套路由 + 文档中心）

- [x] **7.3** 实现接口概览页面（ApiOverview）
  - 调用 Fastify API 获取接口列表
  - 树形展示：模块 → channel → 接口

- [x] **7.4** 实现接口详情页面（ApiDetail + 5 个 Tab）
  - Archives Tab：历史存档列表
  - Diff Tab：变更对比
  - Fields Tab：Schema 字段解释（高亮缺失 description）
  - Preview Tab：响应预览
  - Raw Tab：原始 JSON

- [x] **7.5** 实现文档中心页面
  - GuideTab：KIT 使用指南
  - SdkDocsTab：SDK 对接文档

- [x] **7.6** 配置 Vite proxy（开发时转发 `/api` 到 Fastify 服务）

> 与原计划差异：路由结构从扁平式改为项目作用域嵌套（`/project/:projectId/...`），页面从独立路由改为 Tab 面板模式，Vite 版本为 6（原计划 8），整合了 Schema 管理和变更对比到接口详情页的 Tab 中

---

## 阶段 8：scripts ZX 脚本

**目标**：创建服务拉起/停止脚本，统一管理 Fastify + api-web 的启动。

### 步骤

- [x] **8.1** 创建 `scripts/start.mjs`
  - 先清理占用端口
  - 同时启动 Fastify 服务 + api-web Vite 开发服务

- [x] **8.2** 创建 `scripts/stop.mjs`
  - 优雅停止所有服务

- [x] **8.3** 验证 `pnpm start` 可同时拉起两个服务

> 与原计划差异：未创建 Dockerfile 和 docker-compose.yml（决定暂不需要 Docker 部署）

---

## 阶段 9：联调验证

**目标**：端到端测试整个链路。

### 步骤

- [x] **9.1** 启动服务：`pnpm start`
- [x] **9.2** 模拟 SDK 上报：POST 到 `/api/report`
- [x] **9.3** 验证 archives/ 自动生成 JSON 文件（fullstack-base 项目已跑通）
- [x] **9.4** 验证 schemas/ 自动生成骨架文件 + `_index.json` 索引
- [x] **9.5** 执行 `pnpm fix-schemas`，验证差异修复
- [x] **9.6** 打开 api-web，验证项目列表 → 接口浏览 → 详情 Tab 面板
- [x] **9.7** 验证文档中心页面
- [x] **9.8** 验证 dispatcher/entry.md 的 AI 入口编排

### 实际验证数据

- 已接入项目：`fullstack-base`
- 涵盖模块：analytics、articles、auth、categories、comments、depts、dicts、files、jobs、logs、marketing、medias、members、menus、monitor、notifications、orders、permissions、profile、roles、tags、users、workflows（共 23 个）
- channel：`vue-admin`

---

## 阶段 10：AI 反向丰富指令（Schema 第③级）

**目标**：编写 AI 指令，让 AI 从主项目业务代码中反向推导字段含义，自动回填 schema。

### 实际实现方式

AI 直接搜索主项目源码（不依赖预生成的 mapping 文件），工作流：

```
1. 读商业项目根目录 smart-kit.json → 获取主项目路径和 apiDirs
2. 读 schema → 找出 description 为空的字段
3. grep 接口路径 → 定位 API 定义文件
4. 追踪 TypeScript 类型 / Prisma schema → 获取字段含义
5. 回填 schema（包括 mappings）
```

### 步骤

- [x] **10.1** 创建 `api-archive/schema-enrichment.md` — AI 反向丰富 schema 完整指令

- [x] **10.2** 创建 `dispatcher/schema-enrichment.md` — Schema 丰富指令编排（调度层）

- [x] **10.3** 定义商业项目配置文件 `smart-kit.json` 规范
  - 商业项目根目录放置，AI 执行任务前必须先读取
  - 字段：`projectId`（必填）、`kitPath`（必填）、`framework`（可选）、`apiDirs`（可选）

> 与原计划差异：放弃了通过 mapping 文件定位的方式，改为 AI 直接搜索主项目源码（grep + 类型追踪），更灵活准确。新增 `smart-kit.json` 配置文件规范作为商业项目接入的桥梁

---

## 执行优先级（已完成）

| 优先级 | 阶段          | 说明                                            | 状态 |
| ------ | ------------- | ----------------------------------------------- | ---- |
| **P0** | 0 → 1 → 2 → 3 | 核心链路：数据层 + 服务 + SDK，先跑通上报和存档 | ✅   |
| **P1** | 4 → 8         | CLI 命令 + 服务拉起，让日常开发可用             | ✅   |
| **P2** | 5 → 6         | 总调度 + 架构层集成，让 AI 能加载完整上下文     | ✅   |
| **P3** | 7             | api-web 可视化，让人能直观浏览接口              | ✅   |
| **P4** | 9 → 10        | 联调 + AI 反向丰富，完善闭环                    | ✅   |

---

## 已确认决策（含实施修正）

| 决策项            | 最终结论                                                                            |
| ----------------- | ----------------------------------------------------------------------------------- |
| api-web 技术选型  | **Vue 3.5 + Vite 6 + Ant Design Vue 4 + Pinia 2**（原计划 Vite 8，实际 Vite 6）     |
| Fastify 版本      | **Fastify 5 + @fastify/cors 10**                                                    |
| Fastify 服务端口  | **38800**                                                                           |
| api-web 开发端口  | **38820**                                                                           |
| 包管理器          | **pnpm**（全局 + 子项目独立 lock）                                                  |
| 架构层集成方式    | **直接拷贝**（独立托管，含 vue-arch-starter 完整 code-template）                    |
| Git 仓库          | 本地 `git init`，用户自行上传 GitHub 私人仓库                                       |
| Docker            | **未实施**（原计划生成 Dockerfile，实际决定暂不需要）                               |
| 配置文件位置      | 项目根目录 `smart-dev-kit.config.json`                                              |
| 存档上限          | 单接口最多 **4 条**（原计划 10 条，实际调整为 4）                                   |
| 批量上报大小      | SDK batchSize **5**（原计划 10），服务端 maxBatchSize **50**                        |
| 安全限制          | 请求体 maxBodySize **1MB**（原计划无，实际新增）                                    |
| 服务端响应策略    | 所有接口**快速响应**（先返回 200，后台异步处理）                                    |
| 服务端 IO 策略    | **异步节流**，避免磁盘写入阻塞主线程                                                |
| SDK 上报方式      | **批量上报**（攒一批再发，减少请求次数）                                            |
| SDK 轮询机制      | **定时轮询**服务端配置（默认 30 秒），获取存档状态                                  |
| SDK 节流策略      | **智能节流**，已满的接口不再上报，避免无效请求                                      |
| 存档状态缓存      | 异步生成缓存文件，**5 分钟刷新一次**，不实时计算                                    |
| projectId 校验    | **全链路严格校验**，格式 `^[a-z0-9-]+$`                                             |
| 数据存储结构      | **三级目录** `<projectId>/<module>/<channel>/`（原计划二级，实际增加 channel 维度） |
| Schema 字段格式   | **平坦化**，单层 path key（`data.list[0].name`），不嵌套                            |
| Schema 模板完整性 | **每个字段都必须提取**，description 留空等 AI 后续增补                              |
| Schema 索引       | 每个 projectId 下生成 `_index.json` 索引文件（原计划无）                            |
| api-web 路由      | **项目作用域嵌套路由** `/project/:projectId/...`（原计划扁平路由）                  |
| api-web 页面模式  | **Tab 面板**（接口详情内含 Archives/Diff/Fields/Preview/Raw 五个 Tab）              |
| AI 丰富 Schema    | **直接搜索主项目源码**，不依赖预生成 mapping 文件（原计划通过 mapping 定位）        |
| 商业项目接入      | 根目录放置 `smart-kit.json` 配置文件，AI 执行任务前必须先读取                       |
| AI 入口文档       | 根目录 `AI_ENTRY.md`（原计划无，实际新增为 AI 助手统一入口）                        |
