# 企业级项目 AI 指令集分层体系

> 本文档是指令集体系的方法论层，定义"怎么设计指令集"。  
> 具体实例参见：[Vue 装配架构指令集](/instructions/vue/vue-assembler/docs/)、[Vue 通用代码检查指令集](/instructions/vue/vue-code-review/docs/)

---

## 一、背景与目标

在实际企业级多人协作项目中（Vue、React、Flutter、全栈等），AI 辅助开发需要从"随手问"升级到"工程化"。

通过建立分层的 AI 指令集体系，实现：

- AI 输出质量更稳定、更可预期
- 多人团队使用 AI 时标准统一
- 长周期项目时隔一段时间后仍可快速恢复知识脉络
- 几十万行乃至百万行代码的大项目也能有效覆盖

---

## 二、六层指令体系

| 层级    | 名称           | 执行频率            | 参数需求 | 说明                                           |
| ------- | -------------- | ------------------- | -------- | ---------------------------------------------- |
| 第 1 层 | 项目健康度巡检 | 定期（每周/每迭代） | 可选     | 依赖版本、废弃 API、测试覆盖率                 |
| 第 2 层 | 基础提示词     | 每次开发前          | 无       | 技术栈、目录结构、架构模式、红线               |
| 第 3 层 | 日常开发       | 高频                | 必须     | 新功能、重构、迭代、修复、自检                 |
| 第 4 层 | 代码检查       | 开发中              | 可选     | 插件前置 + AI 补充检查                         |
| 第 5 层 | 上线检查       | 每次上线            | 无       | 核心功能清单逐项检查                           |
| 第 6 层 | 文档生成       | 按需                | 必须     | 生成详细文档目录树，先规划目录结构再逐节点填充 |

详细设计 → [分层模型设计](/instructions/instruction-architecture/design/layered-model)

---

## 三、通用要求（执行规范）

每层指令在每次执行时都必须遵守：

| 维度       | 要求                                           |
| ---------- | ---------------------------------------------- |
| 执行记录   | 每次执行记录时间和报告输出位置                 |
| 版本对比   | 输出与上次报告版本的对比                       |
| 更新日志   | 指令集本身维护 Changelog                       |
| 双版本格式 | 人阅读版（Markdown）+ AI 阅读版（结构化 YAML） |
| 入口文件   | 每层指令有独立 `entry.md` 入口                 |
| 维护责任   | 每层指定维护责任人                             |

---

## 四、设计要求（工程原则）

设计和构建指令集时应遵循的原则，不是每次执行都要跑一遍：

| 机制         | 触发时机       | 核心目的                 |
| ------------ | -------------- | ------------------------ |
| 专业术语映射 | 全程           | 统一 AI 与团队的概念理解 |
| 指令门禁     | 执行前         | 确保条件具备才执行       |
| 规范         | 执行中（软性） | 保证输出质量和一致性     |
| 约束         | 执行中（硬性） | 防止越界操作             |
| 熔断         | 异常时         | 防止错误扩散             |
| 边界         | 全程           | 明确能力范围             |

详细设计 → [约束规则规范](/instructions/instruction-architecture/standards/constraint-rules)

---

## 五、注解驱动文档生成

代码中嵌入 `AUTO_DOC_` 注解，脚本全局跨文件扫描，自动生成文档树：

```
AUTO_DOC_UUID → 唯一标识（跨文件聚合）
AUTO_DOC_TITLE → 标题，按 / 切割生成目录层级
AUTO_DOC_SECTION → 段落标题，自然排序
AUTO_DOC_CONTENT → Markdown 内容，直接拼接
```

- 注解格式**跨语言通用**（JS/TS/Vue/React/Python/Dart/Java 等均适用）
- 同一 UUID 可分散在多个文件中，全局扫描后合并
- 每个 SECTION 附带源文件链接，可追溯
- 生成文档统一输出到文档站点根目录下的独立子目录 `auto-docs/`，与手动文档物理隔离
- 脚本生成文档树时**同步输出 sidebar 菜单树配置**，作为附加产物一并生成，文档站点直接引用

详细设计 → [注解驱动文档生成](/instructions/instruction-architecture/design/annotation-driven-docs)  
格式规范 → [注解格式规范](/instructions/instruction-architecture/standards/annotation-format)

---

## 六、执行模型

| 模式       | 适用场景   | 实现方式                 |
| ---------- | ---------- | ------------------------ |
| 单指令执行 | 日常高频   | 从 entry.md 选中直接执行 |
| 内嵌步骤   | 流程固定   | 指令文件内部追加步骤     |
| 编排执行   | 跨指令串联 | pipelines/ 编排文件调度  |

详细设计 → [执行模型与编排](/instructions/instruction-architecture/design/execution-model)

---

## 七、目录结构模板

指令集实际部署时，指令与报告输出分离为两个独立根目录：

```
项目根目录/
│
├── ai-instructions/              # 指令集根目录（只含指令，不含报告）
│   ├── shared/                 # 跨层共享（术语、约束、规范）
│   ├── layer-1-health/         # 第 1 层
│   ├── layer-2-context/        # 第 2 层
│   ├── layer-3-dev/            # 第 3 层
│   ├── layer-4-code-review/    # 第 4 层
│   │   └── custom/             # 业务扩展指令区（AI 动态追加）
│   ├── layer-5-release/        # 第 5 层
│   ├── layer-6-docs/           # 第 6 层
│   │   └── custom/             # 业务扩展指令区（AI 动态追加）
│   ├── pipelines/              # 编排文件
│   └── guides/                 # 维护指引
│
└── ai-reports/                   # 报告输出根目录（与指令集分离）
    ├── layer-1-health/           # 第 1 层报告输出
    │   └── 2024-03-15/           # 按执行日期归档
    ├── layer-4-code-review/      # 第 4 层报告输出
    │   └── 2024-03-15/
    ├── layer-5-release/          # 第 5 层报告输出
    │   └── v1.2.0/               # 按版本号归档
    └── layer-6-docs/             # 第 6 层文档输出
        ├── api/                  # 每个指令有固定输出子目录
        ├── architecture/
        └── state-machine/
```

### 报告输出规则

| 规则           | 说明                                                           |
| -------------- | -------------------------------------------------------------- |
| 指令与报告分离 | 指令集目录只含指令，报告输出到独立根目录，互不污染             |
| 一指令一目录   | 每条指令在 `ai-reports/` 下有自己固定的输出子目录              |
| 归档策略       | 健康巡检按日期归档，上线检查按版本号归档，文档生成按类型分目录 |
| 文档站点集成   | 项目文档站点直接集成 `ai-reports/` 下的内容，报告即可发布      |
| 动态菜单树     | 报告是动态生成的，文档站点的菜单树也随之动态生成               |

### 报告输出与文档站点集成

报告生成后，项目的文档站点（如 VitePress、Docusaurus 等）直接集成 `ai-reports/` 目录，实现报告即文档：

```
文档站点配置
├── 扫描 ai-reports/ 目录结构
├── 动态生成菜单树（与目录结构一致）
└── 报告文件直接作为页面渲染
```

**动态菜单生成规则**：

| 规则                | 说明                                               |
| ------------------- | -------------------------------------------------- |
| 目录即菜单          | `ai-reports/` 的目录结构直接映射为文档站点的菜单树 |
| 新增即出现          | 新报告输出到新目录后，菜单树自动出现对应条目       |
| 删除即消失          | 报告过期或删除后，菜单条目自动消失                 |
| 归档即分组          | 按日期/版本号归档的子目录自动成为菜单分组          |
| index.md 为分组入口 | 每个输出子目录的 `index.md` 作为该分组的概览页     |

**示例：第 6 层文档生成的菜单树映射**：

```
ai-reports/layer-6-docs/          →  文档生成（菜单顶级分组）
├── api/                          →    ├── API 文档（子分组）
│   ├── index.md                  →    │   └── 概览页
│   ├── user-api.md               →    │   └── 用户模块 API
│   └── order-api.md              →    │   └── 订单模块 API
└── architecture/                 →    ├── 架构文档（子分组）
    ├── index.md                  →    │   └── 概览页
    └── data-flow.md              →    │   └── 数据流图
```

---

## 八、落地路线图

| 优先级 | 层级               | 理由             |
| ------ | ------------------ | ---------------- |
| P0     | 第 2 层 基础提示词 | 所有其他层的基础 |
| P0     | 第 3 层 日常开发   | 使用频率最高     |
| P1     | 第 4 层 代码检查   | 配合日常开发     |
| P1     | 第 5 层 上线检查   | 每次上线都需要   |
| P2     | 第 6 层 文档生成   | 有价值但非紧急   |
| P2     | 第 1 层 健康度巡检 | 长期价值         |
| P3     | 编排文件           | 各层稳定后再串联 |

---

## 九、业务扩展指令机制

第 4 层（代码检查）和第 6 层（文档生成）支持**业务扩展指令**——研发在使用过程中，AI 助手发现缺少指令时主动追加，并在使用中持续自我进化：

| 特性         | 说明                                   |
| ------------ | -------------------------------------- |
| 存放位置     | 各层 `custom/` 子目录                  |
| 入口汇总     | `custom/index.md` 自动聚合所有扩展指令 |
| 一指令一文件 | 每个业务指令独立 `.md` 文件            |
| AI 主动追加  | AI 执行中发现缺失，自动创建并更新索引  |
| 自我进化     | AI 执行后可优化指令内容，更新进化记录  |

详细设计 → [业务扩展指令机制](/instructions/instruction-architecture/design/layered-model#业务扩展指令机制)

---

## 十、与现有指令集的关系

| 层级                                  | 说明                                              |
| ------------------------------------- | ------------------------------------------------- |
| `instruction-architecture/`（本目录） | **方法论层**：定义怎么设计指令集                  |
| `vue/vue-assembler/`                  | **实例层**：方法论在第 2 层（日常开发）的具体落地 |
| `vue/vue-code-review/`                | **实例层**：方法论在第 3 层（代码检查）的具体落地 |
| `vue/vue-arch-starter/`               | **实例层**：架构代码模板，辅助新项目快速搭建      |

---

## 十一、文档导航

### 设计文档（design/）

- [分层模型设计](/instructions/instruction-architecture/design/layered-model) — 六层架构的定义、边界与落地要点
- [参数管道设计](/instructions/instruction-architecture/design/parameter-pipeline) — 参数声明、传递、校验的设计方案
- [注解驱动文档生成](/instructions/instruction-architecture/design/annotation-driven-docs) — AUTO_DOC 注解的全局扫描与文档自动生成
- [执行模型与编排](/instructions/instruction-architecture/design/execution-model) — 单指令执行、内嵌步骤、编排执行三种模式

### 规范文件（standards/）

- [术语表模板](/instructions/instruction-architecture/standards/glossary-template) — 项目术语映射文件的标准模板
- [约束规则规范](/instructions/instruction-architecture/standards/constraint-rules) — 门禁、规范、约束、熔断、边界的完整定义
- [注解格式规范](/instructions/instruction-architecture/standards/annotation-format) — AUTO_DOC 注解的跨语言格式标准

### 实现示例（examples/）

- [第 2 层示例](/instructions/instruction-architecture/examples/layer-2-example/entry) — 基础提示层完整示例
- [第 3 层示例](/instructions/instruction-architecture/examples/layer-3-example/entry) — 日常开发层完整示例
- [编排文件示例](/instructions/instruction-architecture/examples/pipeline-example/feature-complete) — 跨指令编排完整示例
