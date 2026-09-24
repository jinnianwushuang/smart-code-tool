# smart-dev-kit 实施计划书

> 基于 [多工作区组合开发套件](../smart-code-tool/docs/instructions/multi-workspace-composition.md) 设计文档，拆解为可执行的实施步骤。
> 确认后即可按阶段逐步执行。所有决策已确认，见「已确认决策」章节。

---

## 总体概览

```
阶段 0 ─ ✅ 项目初始化（骨架 + Git + 工作区配置）
阶段 1 ─ ✅ api-archive 数据层（目录结构 + 约束文件）
阶段 2 ─ ✅ api-archive/server Fastify 服务（上报接收 + 查询 API + 防抖落盘 + schema 骨架生成）
阶段 3 ─ ✅ api-archive/sdk（HTTP/WS 上报 SDK）
阶段 4 ─ ✅ CLI 命令（fix-schemas + sync-mapping + generate-mapping）
阶段 5 ─ ✅ dispatcher 总调度（AI 入口编排）
阶段 6 ─ ✅ 架构层集成（从 smart-code-tool 拷贝指令集 + 提示词）
阶段 7 ─ ✅ api-web 接口可视化（Vue 3 + Vite 6 + AntDV + Pinia，6 个页面）
阶段 8 ─ ✅ scripts ZX 脚本（服务拉起 + CLI 入口）
阶段 9 ─ ✅ 联调验证（端到端测试）
阶段 10 ─ ✅ AI 反向丰富指令（schema 第③级）
```

---

## projectId 全链路校验（核心约束）

商业项目不固定，通过**自定义 projectId**（即项目名字，如 `my-ecommerce-app`）与套件关联。projectId 是贯穿整个系统的数据隔离和关联纽带，**每一层都必须严格校验**，否则会导致数据错乱、存档串项目。

> **命名规范**：projectId 为人类可读的项目名称，只允许小写字母、数字、连字符（`a-z0-9-`），禁止哈希值或不可读字符串。

### 校验链路

```
商业项目定义 projectId（如 'my-ecommerce-app'）
  │
  ├─→ SDK 初始化时传入 projectId
  │     │
  │     ├─→ 每条上报数据必须携带 projectId
  │     ├─→ 服务端校验 projectId 非空、格式合法
  │     └─→ 服务端校验 projectId 与请求体内部 projectId 一致
  │
  ├─→ 服务端按 projectId 隔离存储
  │     ├─→ archives/<projectId>/...
  │     ├─→ schemas/<projectId>/...
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

| 层级 | 校验点 | 说明 |
|------|--------|------|
| **SDK** | 初始化时校验 projectId 非空且格式合法 | 只允许 `a-z0-9-`，空或非法直接报错 |
| **SDK** | 上报数据自动附加 projectId | 每条数据必须携带，不可缺失 |
| **服务端** | 接收时校验 projectId 存在、格式合法且一致 | URL 路径与请求体内部的 projectId 必须一致 |
| **服务端** | 落盘时校验目录名 = projectId | 防止路径穿越或写错目录 |
| **服务端** | 查询 API 校验 projectId 对应的目录存在 | 不存在返回 404，不报错 |
| **api-web** | 页面加载时校验 projectId 有效 | 无效 projectId 显示空状态 |
| **CLI** | 命令参数校验 projectId 存在 | 不存在提示错误 |

> **实施原则**：projectId 校验贯穿所有阶段，每个阶段实现时都要检查。

---

## 阶段 0：项目初始化

**目标**：建立 smart-dev-kit 仓库骨架和基础配置。

### 步骤

- [ ] **0.1** 初始化 Git 仓库
  ```bash
  cd /Users/jinnian/Code/web/smart-dev-kit
  git init
  ```

- [ ] **0.2** 创建根目录结构
  ```
  smart-dev-kit/
  ├── api-archive/
  │   ├── archives/
  │   ├── schemas/
  │   ├── mappings/
  │   ├── constraints/
  │   ├── sdk/
  │   └── server/
  ├── api-web/
  ├── vue-instructions/
  ├── react-instructions/
  ├── flutter-instructions/
  ├── dispatcher/
  └── scripts/
  ```

- [ ] **0.3** 创建根目录配置文件 `smart-dev-kit.config.json`
  ```json
  {
    "server": {
      "port": 38800,
      "debounceMs": 5000,
      "maxArchivePerApi": 10,
      "asyncThrottleMs": 100,
      "archiveStatusCacheMs": 300000
    },
    "sdk": {
      "pollIntervalMs": 30000,
      "batchSize": 10,
      "batchFlushMs": 5000
    },
    "apiWeb": {
      "port": 38820
    }
  }
  ```
  > `archiveStatusCacheMs`: 存档状态缓存刷新间隔，默认 5 分钟（300000ms）

- [ ] **0.4** 创建 `package.json`（根目录，管理脚本命令和 zx 依赖）

- [ ] **0.5** 创建 `smart-dev-kit.code-workspace`
  ```jsonc
  {
    "folders": [
      { "path": ".", "name": "📦 Smart Dev Kit" }
    ]
  }
  ```

- [ ] **0.6** 创建 `.gitignore`（node_modules、archives 数据文件按需忽略等）

- [ ] **0.7** 创建 `README.md`（项目简介 + 快速开始）

---

## 阶段 1：api-archive 数据层

**目标**：建立接口存档、schema、映射文件的目录结构和格式约束。

### 步骤

- [ ] **1.1** 创建 `constraints/archive-format.json` — 定义 archives/ 下 JSON 文件的结构规范
  ```json
  {
    "path": "GET /api/user/info",
    "projectId": "my-ecommerce-app",
    "module": "user",
    "timestamp": "2026-09-23T22:00:00Z",
    "request": {},
    "response": {}
  }
  ```

- [ ] **1.2** 创建 `constraints/schema-format.json` — 定义 schemas/ 下字段解释文件的结构规范
  ```json
  {
    "path": "GET /api/user/info",
    "method": "GET",
    "url": "/api/user/info",
    "projectId": "my-ecommerce-app",
    "module": "user",
    "summary": "获取用户信息",
    "status": "active",
    "tags": ["用户中心", "核心接口"],
    "author": "",
    "createdAt": "2026-09-23T22:00:00Z",
    "updatedAt": "2026-09-23T22:00:00Z",
    "sourceFiles": [
      "src/api/user.js",
      "src/views/profile/index.vue"
    ],
    "requestHeaders": {
      "Authorization": { "type": "string", "required": true, "description": "Bearer Token" }
    },
    "requestParams": {
      "userId": { "type": "string", "required": true, "description": "用户 ID" }
    },
    "requestBody": {},
    "responseFields": {
      "data.nickname": { "type": "string", "required": true, "description": "" },
      "data.avatar": { "type": "string", "required": false, "description": "" },
      "data.vipLevel": { "type": "number", "required": true, "description": "" },
      "data.orders[0].orderId": { "type": "string", "required": true, "description": "" },
      "data.orders[0].amount": { "type": "number", "required": true, "description": "" }
    },
    "responseStatus": [200, 401, 404]
  }
  ```

  > **字段平坦化规范**：
  > - 所有字段使用**单层 path key**（点号分隔），不层层嵌套
  > - 数组用 `[0]` 表示元素结构，如 `data.orders[0].orderId`
  > - 每个字段独立一行，包含 `type`、`required`、`description`
  > - `description` 初始为空，由 AI 后续增补解释

  > **模板完整性要求**：
  > - SDK 上报的原始 JSON 中**每个字段都必须提取**，不能遗漏
  > - 嵌套对象递归展开为平坦 path，如 `{ data: { list: [{ name: '' }] } }` → `data.list[0].name`
  > - 模板必须完整生成，即使字段很多也不能截断

- [ ] **1.3** 创建 `constraints/mapping-format.json` — 定义 mappings/ 下映射文件的结构规范

- [ ] **1.4** 创建 `api-archive/ai-entry.md` — AI 理解入口文件

---

## 阶段 2：api-archive/server — Fastify 服务

**目标**：搭建 Fastify 本地服务，实现上报接收、接口查询、异步节流落盘、schema 骨架生成、存档上限控制。

**核心原则**：
- 所有接口**快速响应**（先返回 200，后台异步处理）
- IO 密集场景采用**异步节流**，避免磁盘写入阻塞
- 单接口存档上限控制（默认 10 条，配置文件可调）

### 步骤

- [ ] **2.1** 初始化 Fastify 项目
  ```bash
  cd api-archive/server
  npm init -y
  npm install fastify @fastify/cors
  ```

- [ ] **2.2** 实现配置加载 `server/config.js`
  - 读取根目录 `smart-dev-kit.config.json`
  - 提供默认值（端口 38800、上限 10、防抖 5s 等）
  - 支持热重载（文件变更时重新加载）

- [ ] **2.3** 实现核心入口 `server/index.js`
  - 启动 Fastify 服务（端口从配置文件读取，默认 38800）
  - 注册 CORS 插件（支持跨域）
  - 所有路由注册全局快速响应中间件

- [ ] **2.4** 实现上报接收 API `POST /api/report`
  - **快速响应**：立即返回 200，数据放入内存缓冲区
  - 支持**批量上报**：接收数组格式的多条数据
  - 后台异步处理缓冲区数据

- [ ] **2.5** 实现异步节流落盘机制
  - 节流窗口（配置文件 `debounceMs`，默认 5 秒）到期后批量写入
  - 写入前检查存档上限（`maxArchivePerApi`，默认 10 条）
  - 超过上限的接口**不再写入**，标记为 full
  - 写入操作使用异步 IO，不阻塞主线程

- [ ] **2.6** 实现 schema 骨架自动生成（第①级）
  - 从原始 JSON **递归展开**所有字段，平坦化为 path key
  - 嵌套对象：`data.user.name` → 单层 key
  - 数组元素：`data.list[0].title` → 用 `[0]` 表示元素结构
  - 每个字段生成 `{ type, required, description: "" }`
  - **模板必须完整**，原始 JSON 中每个字段都必须提取，不能遗漏
  - 如果 schema 已存在则合并（新增字段补入，不覆盖已有 description）

- [ ] **2.7** 实现接口查询 API（快速响应）
  - `GET /api/archives/:projectId` — 列出项目的所有接口
  - `GET /api/archives/:projectId/:module/:key` — 查询单个接口详情
  - `GET /api/schemas/:projectId` — 列出项目的所有 schema
  - `GET /api/schemas/:projectId/:module/:key` — 查询单个 schema 详情

- [ ] **2.8** 实现存档状态缓存文件异步生成
  - 后台定时任务（`archiveStatusCacheMs`，默认 5 分钟）扫描 archives/ 目录
  - 统计每个接口的存档条数，判断是否已满
  - 生成缓存文件 `server/.cache/archive-status.json`
  - 缓存文件内容：
    ```json
    {
      "updatedAt": "2026-09-23T22:30:00Z",
      "status": {
        "my-ecommerce-app": {
          "user/GET_user_info": { "count": 8, "full": false },
          "order/GET_order_list": { "count": 10, "full": true }
        }
      }
    }
    ```

- [ ] **2.9** 实现配置查询 API（供 SDK 轮询，快速响应）
  - `GET /api/config` — 直接读取缓存文件返回，不实时计算
  - 返回格式：
    ```json
    {
      "config": { "maxArchivePerApi": 10, "pollIntervalMs": 30000 },
      "archiveStatus": { ... }
    }
    ```
  - 如果缓存文件不存在或过期，立即触发一次异步刷新（不阻塞响应）

- [ ] **2.10** 实现映射文件生成
  - 读取 archives/ 和主项目上报的调用位置信息
  - 生成 `mappings/<projectId>.json`

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
createReporter(axiosInstance, 'my-ecommerce-app')
```

> **设计原则**：SDK 初始化只需一个参数（项目名），服务端地址、轮询间隔、批量大小等全部从配置文件自动获取，开发者零配置。

### 步骤

- [ ] **3.1** 创建 `sdk/index.js` — SDK 入口
  - 导出 `createReporter(instance, projectName)` 函数
  - 参数极简：只需传入项目名（字符串）
  - 服务端地址默认 `http://localhost:38800`，可通过可选第三参数覆盖
  - 初始化时立即拉取一次服务端配置

- [ ] **3.2** 创建 `sdk/reporter.js` — 批量上报逻辑
  - HTTP 模式：拦截 axios 实例的请求/响应
  - WS 模式：拦截 WebSocket 实例的消息
  - 数据先放入本地缓冲区，达到 `batchSize` 或 `batchFlushMs` 后批量发送

- [ ] **3.3** 创建 `sdk/poller.js` — 定时轮询配置
  - 按 `pollIntervalMs`（默认 30 秒）轮询 `GET /api/config`
  - 获取各接口存档状态（是否已满、当前条数、上限）
  - 更新本地节流规则

- [ ] **3.4** 创建 `sdk/throttle.js` — 智能节流控制
  - 上报前检查接口是否已满（count >= maxArchivePerApi）
  - 已满的接口**直接丢弃**，不进入缓冲区
  - 节流规则随轮询结果动态更新

- [ ] **3.5** 创建 `sdk/types.d.ts` — TypeScript 类型定义

- [ ] **3.6** 生成 SDK 对接文档 `api-archive/sdk/INTEGRATION.md`
  - 安装方式（手动拷贝说明）
  - 一行代码接入示例（HTTP / WS）
  - 参数说明（只需项目名）
  - 自动能力说明（批量上报、智能节流、定时轮询）
  - 常见问题 FAQ

---

## 阶段 4：CLI 命令

**目标**：实现 fix-schemas、sync-mapping、generate-mapping 三个 CLI 命令。

### 步骤

- [ ] **4.1** 实现 `scripts/fix-schemas.mjs`（schema 第②级修复）
  - 对比 archives/ 与 schemas/ 的差异
  - 新增字段补入 schema 骨架
  - 删除字段标记 deprecated
  - 类型变更标记 conflict
  - 输出修复报告

- [ ] **4.2** 实现 `scripts/sync-mapping.mjs`
  - 手动触发映射文件生成
  - 读取所有项目的上报数据，重新生成 mappings/

- [ ] **4.3** 实现 `scripts/generate-mapping.mjs`
  - 生成指定项目的映射文件
  - 参数：`--projectId=<id>`

- [ ] **4.4** 在根 `package.json` 中注册命令
  ```json
  {
    "scripts": {
      "start": "zx scripts/start.mjs",
      "fix-schemas": "zx scripts/fix-schemas.mjs",
      "sync-mapping": "zx scripts/sync-mapping.mjs",
      "generate-mapping": "zx scripts/generate-mapping.mjs"
    }
  }
  ```

---

## 阶段 5：dispatcher 总调度

**目标**：创建 AI 入口编排中心，负责串联三层上下文。

### 步骤

- [ ] **5.1** 创建 `dispatcher/entry.md` — AI 总入口文件
  - 声明加载顺序：架构层 → 业务层 → 接口层
  - 根据框架类型路由到对应指令集

- [ ] **5.2** 创建 `dispatcher/frameworks.json` — 框架路由配置
  ```json
  {
    "vue": { "instructions": "./vue-instructions/", "prompts": "./vue-instructions/prompts.md" },
    "react": { "instructions": "./react-instructions/", "prompts": "./react-instructions/prompts.md" },
    "flutter": { "instructions": "./flutter-instructions/", "prompts": "./flutter-instructions/prompts.md" }
  }
  ```

- [ ] **5.3** 创建 `dispatcher/ai-entry.md` — dispatcher 的 AI 理解入口

---

## 阶段 6：架构层集成

**目标**：将 smart-code-tool 中已有的指令集和提示词拷贝到 smart-dev-kit 对应目录。

### 步骤

- [ ] **6.1** 拷贝 Vue 指令集
  - 从 `smart-code-tool/docs/instructions/vue/` 拷贝 vue-assembler、vue-code-review、vue-arch-starter
  - 拷贝 `vue/prompts.md` + `vue/constraints.md`

- [ ] **6.2** 拷贝 React 指令集
  - 从 `smart-code-tool/docs/instructions/react/` 拷贝 react-assembler、react-code-review
  - 拷贝 `react/prompts.md` + `react/constraints.md`

- [ ] **6.3** 拷贝 Flutter 指令集
  - 从 `smart-code-tool/docs/instructions/flutter/` 拷贝 flutter-assembler、flutter-code-review
  - 拷贝 `flutter/prompts.md` + `flutter/constraints.md`

- [ ] **6.4** 拷贝指令集体系设计文档
  - 从 `smart-code-tool/docs/instructions/instruction-architecture/` 拷贝

- [ ] **6.5** 为每个框架创建 `ai-entry.md` — AI 理解入口

> **注意**：后续 smart-code-tool 中的指令集更新需要同步到 smart-dev-kit，或者改为符号链接。

---

## 阶段 7：api-web 接口可视化

**目标**：搭建独立前端项目，提供接口浏览、schema 展示、KIT 指南、SDK 文档等页面。

### 步骤

- [ ] **7.1** 初始化 Vite 8 + Vue 3 前端项目
  ```bash
  cd api-web
  npm create vite@latest . -- --template vue
  npm install ant-design-vue pinia vue-router@4
  ```

- [ ] **7.2** 配置路由
  | 路由 | 页面 | 说明 |
  |------|------|------|
  | `/` | 首页 | 项目概览 + 快速开始 |
  | `/apis` | 接口浏览 | 项目 → 模块 → 接口 三级树形 |
  | `/apis/:projectId/:module/:key` | 接口详情 | 请求/响应 JSON + schema 字段解释 |
  | `/schemas` | Schema 管理 | 按项目浏览 schema，标记缺失 description |
  | `/diff` | 变更对比 | 对比不同时间的接口存档 |
  | `/guide` | KIT 使用指南 | 步骤说明 + AI 指令语句（可复制） |
  | `/sdk-docs` | SDK 对接文档 | 集成指南 + 代码示例 |

- [ ] **7.3** 实现接口浏览页面
  - 调用 Fastify API 获取接口列表
  - 树形展示：项目 → 模块 → 接口
  - 接口详情页展示请求参数、响应结构、字段解释

- [ ] **7.4** 实现 Schema 管理页面
  - 展示每个字段的 type、description、enum、required
  - 高亮标记 description 为空的字段（待 AI 丰富）
  - 高亮标记 deprecated / conflict 状态的字段

- [ ] **7.5** 实现 KIT 使用指南页面
  - 使用步骤说明
  - AI 指令语句（可直接复制的代码块）
  - 框架选择（Vue / React / Flutter）

- [ ] **7.6** 实现 SDK 对接文档页面
  - 安装方式（手动拷贝说明）
  - 挂载代码示例（HTTP / WS）
  - 配置参数说明

- [ ] **7.7** 配置代理（开发时转发到 Fastify 服务）

---

## 阶段 8：scripts ZX 脚本

**目标**：创建服务拉起脚本，统一管理 Fastify + api-web 的启动。

### 步骤

- [ ] **8.1** 创建 `scripts/start.mjs`
  ```js
  #!/usr/bin/env zx
  // 同时启动 Fastify 服务 + api-web 开发服务
  await Promise.all([
    $`node api-archive/server/index.js`,
    $`cd api-web && npx vite --port 38820`
  ])
  ```

- [ ] **8.2** 创建 `scripts/stop.mjs`（可选，优雅停止服务）

- [ ] **8.3** 验证 `npm run start` 可同时拉起两个服务

- [ ] **8.4** 创建 `Dockerfile` + `docker-compose.yml`（api-web 构建 + Fastify 服务，暂不线上部署）

---

## 阶段 9：联调验证

**目标**：端到端测试整个链路。

### 步骤

- [ ] **9.1** 启动服务：`npm run start`
- [ ] **9.2** 模拟 SDK 上报：用 curl 或测试脚本 POST 到 `/api/report`
- [ ] **9.3** 验证 archives/ 自动生成 JSON 文件
- [ ] **9.4** 验证 schemas/ 自动生成骨架文件
- [ ] **9.5** 执行 `npm run fix-schemas`，验证差异修复
- [ ] **9.6** 打开 api-web，验证接口浏览、schema 展示
- [ ] **9.7** 验证 KIT 使用指南页面的 AI 指令语句可复制
- [ ] **9.8** 验证 dispatcher/entry.md 的 AI 入口编排

---

## 阶段 10：AI 反向丰富指令（Schema 第③级）

**目标**：编写 AI 指令，让 AI 从主项目业务代码中反向推导字段含义，自动回填 schema。

### 步骤

- [ ] **10.1** 在 dispatcher/ 或各框架指令集中新增 schema 丰富指令
  - 指令内容：读取 schemas/ 中 description 为空的字段 → 分析主项目业务代码 → 推断字段含义 → 写回 schema

- [ ] **10.2** 定义 AI 丰富 schema 的工作流
  ```
  1. AI 读取 api-archive/schemas/<projectId>/ 下所有 schema 文件
  2. 筛选 description 为空的字段
  3. 根据主项目中的调用位置（api-mapping.md）定位相关代码
  4. 分析代码上下文，推断字段的业务含义
  5. 回填 description、enum、业务规则
  6. 写回 schema 文件
  ```

- [ ] **10.3** 验证 AI 丰富结果在 api-web 中正确展示

---

## 执行优先级建议

| 优先级 | 阶段 | 说明 |
|--------|------|------|
| **P0** | 0 → 1 → 2 → 3 | 核心链路：数据层 + 服务 + SDK，先跑通上报和存档 |
| **P1** | 4 → 8 | CLI 命令 + 服务拉起，让日常开发可用 |
| **P2** | 5 → 6 | 总调度 + 架构层集成，让 AI 能加载完整上下文 |
| **P3** | 7 | api-web 可视化，让人能直观浏览接口 |
| **P4** | 9 → 10 | 联调 + AI 反向丰富，完善闭环 |

---

## 已确认决策

| 决策项 | 结论 |
|--------|------|
| api-web 技术选型 | **Vue 3 + Vite 8 + Ant Design Vue + Pinia** |
| Fastify 服务端口 | **38800** |
| api-web 开发端口 | **38820** |
| 架构层集成方式 | **直接拷贝**（新项目独立托管，后期有变更可 AI 相互比较同步） |
| Git 仓库 | 本地 `git init`，用户自行上传 GitHub 私人仓库 |
| Docker | 生成 Dockerfile + docker-compose.yml，本机有 Docker，暂不线上部署，自用 |
| 配置文件位置 | 项目根目录 `smart-dev-kit.config.json`，包含端口、上限、节流等配置 |
| 存档上限 | 单接口最多 **10 条**（配置文件可调），满了不再接收 |
| 服务端响应策略 | 所有接口**快速响应**（先返回 200，后台异步处理） |
| 服务端 IO 策略 | **异步节流**，避免磁盘写入阻塞主线程 |
| SDK 上报方式 | **批量上报**（攒一批再发，减少请求次数） |
| SDK 轮询机制 | **定时轮询**服务端配置（默认 30 秒），获取存档状态 |
| SDK 节流策略 | **智能节流**，已满的接口不再上报，避免无效请求 |
| 存档状态缓存 | 异步生成缓存文件，**5 分钟刷新一次**，不实时计算 |
| projectId 校验 | **全链路严格校验**，projectId 为人类可读项目名（`a-z0-9-`），是数据隔离的唯一纽带 |
| Schema 字段格式 | **平坦化**，单层 path key（`data.list[0].name`），不嵌套 |
| Schema 模板完整性 | **每个字段都必须提取**，description 留空等 AI 后续增补 |


