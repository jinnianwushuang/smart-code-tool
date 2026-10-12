# Vue3 标准装配架构 — AI 指令集创建计划

## 目标

创建一套**面向 AI 助手**的可复制指令集，同时建立配套的**面向人类**的设计文档体系。指令集拷贝到其他项目后即可使用；设计文档集成到 VitePress 文档站「指令集」顶部菜单下，为未来多指令集扩展做好架构准备。

---

## 核心设计原则

1. **用户文档与 AI 指令文件分离** — 给人看的说明和给 AI 执行的指令分开存放
2. **两级目录隔离** — `docs/instructions/<框架分类>/<指令集名称>/`，前两级提供分类隔离，用户拷贝最内层指令集目录的全部内容
3. **可复制目录自包含** — 拷贝后的 `vue-assembler/` 内含 docs/ + AI 指令文件 + VERSION.md，不依赖外部文件
4. **多指令集可扩展** — 顶层 `docs/instructions/` 支持未来新增 `react/react-assembler/`、`code-review/code-review/` 等
5. **VitePress 集成** — 设计文档纳入顶部菜单「指令集」，独立展示

---

## 目录结构设计

### 第一层：指令集体系顶层（支持多指令集扩展）

> **隔离规则**：`docs/instructions/<框架分类>/<指令集名称>/`，前两级目录提供隔离，用户拷贝的是最内层指令集目录的全部内容。

```
docs/instructions/
├── index.md                                  # 「指令集」菜单总览页（VitePress 入口）
│                                                介绍指令集概念、当前可用指令集列表、未来规划
│
├── vue/                                      # 框架分类：Vue 生态
│   └── vue-assembler/                        # 指令集：Vue 装配架构（用户拷贝此目录全部内容）
│       ├── docs/                             # 用户文档（给人看，VitePress 渲染）
│       ├── vue-assembler/                    # AI 指令文件（给 AI 看，拷贝走的核心）
│       └── VERSION.md                        # 版本号与变更记录
│
├── react/                                    # 〔未来〕框架分类：React 生态
│   └── react-assembler/                      # 指令集：React 装配架构
│       ├── docs/
│       ├── react-assembler/
│       └── VERSION.md
│
└── code-review/                              # 〔未来〕框架分类：通用/跨框架
    └── code-review/                          # 指令集：代码检查
        ├── docs/
        ├── code-review/
        └── VERSION.md
```

### 第二层：Vue 装配架构指令集内部结构

```
docs/instructions/vue/vue-assembler/
│
├── docs/                                     # 用户文档（给人看，VitePress 渲染）
│   ├── index.md                              # 指令集概述 + 快速开始
│   ├── design.md                             # 设计架构：目录结构说明、文件职责划分
│   ├── execution-flow.md                     # 执行流程：AI 接到任务后的完整流程图
│   ├── config-guide.md                       # 配置指南：如何填写 config.md
│   └── file-index.md                         # 文件索引：全部文件清单及职责说明
│
├── vue-assembler/                            # AI 指令文件（给 AI 看，拷贝走的部分）
│   ├── config.md                             # 填空式项目适配配置模板
│   ├── config.example.md                     # 填好的完整配置示例
│   ├── glossary.md                           # 架构术语表
│   ├── entry/                                # AI 上下文入口
│   │   ├── context-entry.md                  # AI 上下文指令入口（系统级引导）
│   │   └── example.md                        # 端到端完整示例
│   ├── instructions/                         # 指令目录
│   │   ├── launcher.md                       # 启动器
│   │   ├── gate-check.md                     # 门禁
│   │   ├── code-standard.md                  # 代码规范
│   │   ├── constraints.md                    # 指令约束
│   │   ├── common-steps.md                   # 通用基础步骤
│   │   ├── task-new-feature.md               # 新需求开发
│   │   ├── task-refactor.md                  # 重构
│   │   ├── task-iteration.md                 # 需求迭代
│   │   ├── task-fix.md                       # 修复
│   │   ├── task-code-review.md               # 代码检查
│   │   └── review-checklist.md               # 复核自检清单
│   └── architecture/                         # 标准架构参照（精简版，内嵌代码片段）
│       ├── assembler-reference.md
│       ├── state-reference.md
│       ├── lifecycle-reference.md
│       ├── event-pipeline-reference.md
│       ├── component-reference.md
│       ├── api-request-reference.md
│       └── directory-convention.md
│
└── VERSION.md                                # 版本号与变更记录
```

### 文件归属说明

| 分类        | 文件位置         | 受众      | 是否拷贝走 | VitePress 渲染     |
| ----------- | ---------------- | --------- | ---------- | ------------------ |
| 设计文档    | `docs/`          | 人类      | 否         | 是                 |
| AI 指令文件 | `vue-assembler/` | AI        | 是         | 否（但可链接查看） |
| 版本记录    | `VERSION.md`     | 人类 + AI | 是         | 是                 |

---

## 各文件内容规划

### 1. config.md — 项目适配配置

拷贝到新项目后需要修改的配置项，分为以下几大类：

#### 1.1 路径配置

- 模板内核目录路径（装配架构核心文件放置位置）
- 公共模块导入路径（`atoms_assembler`、`useContextAssembler` 的实际导入路径）
- `import.meta.glob` 的模块扫描路径模式
- CSS 变量入口文件路径（项目全局 CSS 变量定义文件的相对路径）
- 代码检查报告存放目录（全局指定报告输出位置，默认 `./code-review-reports/`）

#### 1.2 技术栈配置

- UI 框架（Ant Design Vue / Element Plus / 其他）
- API 请求库（axios / fetch / 其他）
- 路由模式（Hash / History）
- 是否使用 TypeScript（`true` / `false`，影响生成文件的扩展名和类型标注）
- 任务完成后是否自动启动运行验证（`true` / `false`，默认 `false` 仅做静态分析；设为 `true` 则 AI 完成代码修改后自动启动项目运行验证）

#### 1.3 编码规范配置

- 注释语言：中文注释（AI 生成的所有代码注释必须使用中文）
- 文件命名规则：`kebab-case`（如 `merchant-search.vue`、`handle_init_table_data.js`）
- 变量命名规则：`snake_case`（如 `table_data`、`modal_visible`、`use_time_str`）
- 项目前缀 / 组件命名风格

#### 1.3.1 代码生成约束（可配置，未配置则走指令集默认值）

| 配置项             | 默认值   | 说明                                                                                              |
| ------------------ | -------- | ------------------------------------------------------------------------------------------------- |
| 单文件最大行数     | `400` 行 | AI 生成的单个代码文件不得超过此行数，超出则必须拆分                                               |
| 注释比例下限       | `10%`    | 注释行数占总行数的比例不得低于此值                                                                |
| 单函数最大行数     | `50` 行  | 单个函数不得超过此行数，超出则必须拆分或抽取子函数                                                |
| 执行前输出完整配置 | `false`  | 设为 `true` 则 AI 在执行任务前，先输出合并后的完整配置（用户配置 + 默认值）供使用者确认，避免黑盒 |

> **规则**：以上配置项均为可选。用户在 config.md 中填写则使用用户值，未填写或未配置则使用指令集内置的默认值。AI 每次生成代码后必须自检是否满足这些约束。

#### 1.4 项目可用资源清单（CSS 复用约束的核心依据）

- 全局 CSS 变量清单（列出项目 `CSS 变量入口文件` 中已定义的所有变量，AI 写样式时必须优先使用这些变量）
- 全局 CSS 工具类清单（项目中已有的通用样式类，如布局、间距、文字等）
- UI 框架常用组件映射（列出框架提供的组件及对应场景，如「表格 → `<a-table>`」「弹窗 → `<a-modal>`」，避免 AI 手写原生实现）
- 项目已安装插件清单（与 UI/样式相关的依赖，如图标库、动画库等）

> **核心原则**：AI 生成样式时遵循优先级链：**框架组件 > 项目已安装插件 > 全局 CSS / CSS 变量 > 自定义 scoped CSS**。禁止产生一堆不通用的 CSS。

#### 1.5 模块扫描配置

- `import.meta.glob` 的扫描范围（`module/**/*.js`、`state/*.js` 等模式）
- 公共装配器模块列表（`public_assembler`）
- 手动引入模块列表（`manual_assembler`）

#### 1.6 可选参照源（次要、可选）

> **说明**：以下为可选配置项。新项目中可能不存在成熟的已验证实现，此时留空即可。若项目内已有符合装配架构的实际业务代码，可配置其路径，AI 会将其作为本地参照，生成更贴合项目实际风格的代码。

- 多例模式实际应用目录路径（如 `project/vue-test-app/pages/vue-test/multiton-demo/multiton-lv5/`）
- 单例模式实际应用目录路径（如 `project/vue-test-app/pages/vue-test/singleton-demo/singleton-lv5/`）
- 其他已验证的页面实现目录路径（可配置多个，AI 在生成代码时会参考其风格和模式）

### 2. entry/ — AI 上下文入口

- **context-entry.md**：AI 助手启动时首先读取的入口文件，引导 AI 按顺序加载 config → architecture → instructions，建立完整上下文
- **example.md**：指令格式块示例，展示标准的任务提交格式（任务类型 / 目标类型 / 问题描述 / 原码入口 / 目标目录 / 报告地址 / 附加信息）

### 3. instructions/ — 指令文件

每个指令文件采用 AI 友好的结构化格式：

- **launcher.md**：执行框架，定义 AI 接到任务后的标准处理流程（读取上下文 → 门禁检查 → **信息完整性检查（信息不全则暂停并向使用者提问确认，给出建议选项或让使用者给出方案，禁止瞎猜）** → **配置透明化确认（若 config.md 配置了「执行前输出完整配置」为 `true`，则输出合并后的完整配置清单供使用者确认，确保无黑盒）** → **识别并锁定唯一任务类型** → **任务有效性判定（不在指令集有效范围内则停止执行，告知使用者原因及需完善的点）** → 选择对应指令 → 执行 → **遇阻熔断（执行过程中卡住时主动停止，列出卡点及需要使用者完善的内容）** → 复核）
- **gate-check.md**：前置条件检查清单（文件是否存在、配置是否正确、依赖是否安装）
- **code-standard.md**：装配架构编码规范（模块职责单一、payload 传递规则、命名规范、注释要求、**CSS 编写优先级规则：框架组件 > 插件 > 全局 CSS/变量 > 自定义 scoped CSS**）
- **constraints.md**：AI 执行边界（不可修改的文件、不可跳过的步骤、必须遵循的模式、**禁止产生不通用 CSS — 必须先查阅 config.md 中的项目可用资源清单**、**单次执行约束 — 一次只能执行一类任务类型，禁止混合执行多种任务，若用户提交包含多种任务类型的请求，必须拆分为多次独立执行**、**存疑即问约束 — 任务信息不全或存在疑义时，必须暂停执行并向使用者提问确认，提问时需给出建议选项或直接让使用者给出方案，禁止瞎猜、禁止脑补需求**、**安全熔断约束 — 任务不在指令集有效范围内时，必须停止执行并明确告知使用者原因及需完善的点；执行过程中遇到无法解决的问题卡点时，必须主动停止并列出卡点清单及需要使用者提供的内容，禁止强行编造或跳过**、**验证边界约束 — 重构/修改代码完成后，默认只走静态分析（代码规范检查、架构合规性检查），不主动启动项目运行验证；仅当用户在 config.md 中配置了「默认启动验证」或在任务命令中明确要求启动验证时，才执行运行验证；否则在完成静态分析后，可建议使用者手动启动项目自检**）
- **common-steps.md**：各任务类型复用的公共步骤（如：创建模块文件的标准模板、注册到装配器的步骤、验证 payload 的步骤）
- **task-new-feature.md**：新需求开发全流程（需求分析 → 确定模板类型 → 创建/修改模块 → 装配验证 → 自检）
- **task-refactor.md**：重构全流程（现状分析 → 目标架构映射 → 逐步迁移 → 验证等价性）
- **task-iteration.md**：需求迭代全流程（理解现有代码 → 增量修改 → 回归验证）
- **task-fix.md**：修复全流程（问题定位 → 根因分析 → 修复 → 验证）
- **task-code-review.md**：代码检查全流程（架构合规性 → 命名规范 → 状态使用 → 副作用清理 → 组件对接 → **CSS 复用合规性检查** → **生成报告并保存到「报告存放目录」，文件名规则：`{任务类型}_{检查目标}_{YYYY-MM-DD-HH-mm-ss}.md`（与项目导出时间戳规范一致），确保不重名** → **更新报告总表 `_index.md`，追加本次检查记录：执行时间、检查目标、结果摘要、报告文件链接**）

> **`_index.md` 总表结构示例**：
>
> | 序号 | 执行时间            | 任务类型 | 检查目标   | 结果摘要                            | 报告链接                                          |
> | ---- | ------------------- | -------- | ---------- | ----------------------------------- | ------------------------------------------------- |
> | 1    | 2026-09-18 14:30:22 | 代码检查 | user-table | 通过 3 项 / 告警 2 项 / 不通过 1 项 | `./code-review_user-table_2026-09-18_14-30-22.md` |

- **review-checklist.md**：AI 完成后的自检清单（关键性检查点，对照标准模板验证）

### 4. architecture/ — 精简版架构参照

从现有 10 篇架构文档（`docs/architecture-document/vue/standardized-template-cn/`）中提取关键信息，编写面向 AI 的精简参照文件：

- **assembler-reference.md**：装配器核心机制（`import.meta.glob` 扫描规则、`atoms_assembler` 参数、`useContextAssembler` 返回值、payload 结构）
- **state-reference.md**：状态管理（单例状态 vs 多例状态的区别、computed 注册、config 配置项）
- **lifecycle-reference.md**：6 个生命周期钩子的执行顺序和职责、6 种副作用清理机制
- **event-pipeline-reference.md**：事件管道系统（管道注册、处理函数命名、income/outcome 通道）
- **component-reference.md**：组件对接规范（props/emit 声明、payload 传递、expose.js 的用法）
- **api-request-reference.md**：API 请求处理（单例模板 7 步标准流程、数据转换、错误处理）
- **directory-convention.md**：目录结构和文件命名约定（多例/单例模板的完整目录说明、新增模块的放置规则）

---

## 指令格式块规范

每个指令文件采用统一的结构化格式，便于 AI 解析：

```markdown
# 指令名称

## 触发条件

描述何时使用此指令

## 前置依赖

列出执行前必须满足的条件（引用 gate-check.md）

## 执行步骤

### 步骤 1：xxx

- 操作：xxx
- 输入：xxx
- 输出：xxx
- 验证：xxx

### 步骤 2：xxx

...

## 约束条件

引用 constraints.md 中的相关约束

## 完成标准

列出所有必须满足的完成条件

## 复核清单

引用 review-checklist.md 中的相关检查项
```

---

## 执行顺序

1. **Phase 0 — 顶层结构**：`docs/instructions/index.md`（指令集总览页）
2. **Phase 1 — architecture/ 参照文件**（7 个文件）：从现有架构文档中提取精华，内嵌关键代码片段，实现自包含
3. **Phase 2 — config.md + config.example.md**：填空模板 + 完整示例
4. **Phase 3 — instructions/ 基础指令**（5 个文件）：launcher、gate-check、code-standard、constraints、common-steps
5. **Phase 4 — instructions/ 任务指令**（5 个文件）+ review-checklist：5 种任务类型的全流程指令 + 复核清单
6. **Phase 5 — glossary.md**：架构术语表
7. **Phase 6 — entry/ 入口文件**（2 个文件）：context-entry 和端到端 example
8. **Phase 7 — VERSION.md**：版本记录
9. **Phase 8 — docs/ 用户文档**（5 个文件）：index.md、design.md、execution-flow.md、config-guide.md、file-index.md

---

## 关键参考资源

| 资源                 | 路径                                                                | 性质                                      |
| -------------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| 架构理解文档（10篇） | `docs/architecture-document/vue/standardized-template-cn/`          | 编写 architecture/ 参照文件的来源         |
| 标准模板代码（多例） | `src/standardization/multiton-template/`                            | 内嵌到 architecture/ 参照文件中实现自包含 |
| 标准模板代码（单例） | `src/standardization/singleton-template/`                           | 内嵌到 architecture/ 参照文件中实现自包含 |
| 实际应用-多例        | `project/vue-test-app/pages/vue-test/multiton-demo/multiton-lv5/`   | **可选参照源**，通过 config.md 1.6 配置   |
| 实际应用-单例        | `project/vue-test-app/pages/vue-test/singleton-demo/singleton-lv5/` | **可选参照源**，通过 config.md 1.6 配置   |

---

## 假设

- 指令集文件使用 Markdown 格式，便于人类浏览和 AI 读取
- architecture/ 精简版以现有文档为基础提炼，内嵌关键代码片段实现自包含，不依赖外部路径引用
- config.md 设计为「填空式」，新项目只需修改标记为 `<!-- 需配置 -->` 的部分
- config.example.md 提供以当前项目为蓝本的完整填写示例
- 指令格式块中的字段（任务类型、目标类型等）为建议格式，可根据实际需要扩展
- glossary.md 提供统一术语定义，确保 AI 与使用者理解一致
- docs/ 用户文档与 vue-assembler/ AI 指令文件分离，分别服务于人类和 AI
- docs/ 下的文档纳入 VitePress「指令集」顶部菜单，未来可扩展更多指令集
- VERSION.md 记录指令集版本与变更，方便跨项目同步更新
