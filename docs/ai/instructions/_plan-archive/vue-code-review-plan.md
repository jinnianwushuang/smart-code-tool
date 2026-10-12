# Vue 通用代码检查指令集创建计划

## 目标

创建一套**面向所有 Vue 3 项目**的通用代码检查指令集，不绑定特定装配架构。AI 先检查 ESLint 配置并给出建议，再按 10 大检查维度做深度人工审查，输出结构化检查报告。

---

## 核心设计决策

| 决策项     | 结论                                                           |
| ---------- | -------------------------------------------------------------- |
| 定位       | C 方案：先检查 ESLint 配置并建议 → 再由 AI 做深度审查          |
| 适用范围   | 不绑定特定装配架构，所有 Vue 3 项目通用                        |
| 目录路径   | `docs/instructions/vue/vue-code-review/`                       |
| 国际化检查 | 可配置开关（默认关闭）；开启后额外检查多语种文件间键值是否缺失 |

---

## 目录结构

```
docs/instructions/vue/vue-code-review/
│
├── docs/                                        ← 人类文档区
│   ├── index.md                                 ← 概述 + 快速开始
│   ├── design.md                                ← 设计架构说明
│   ├── execution-flow.md                        ← 检查流程图
│   ├── config-guide.md                          ← 配置指南
│   └── file-index.md                            ← 文件索引
│
├── vue-code-review/                             ← AI 指令区（拷贝走的部分）
│   ├── config.md                                ← 填空式配置模板
│   ├── config.example.md                        ← 完整配置示例
│   ├── glossary.md                              ← 术语表（检查维度相关）
│   │
│   ├── entry/                                   ← AI 入口
│   │   ├── context-entry.md                     ← 上下文加载入口
│   │   └── example.md                           ← 端到端检查示例
│   │
│   ├── check-rules/                             ← 10 大检查维度规则
│   │   ├── code-quality.md                      ← 代码规范（行数/函数长度/注释比例）
│   │   ├── vue-template.md                      ← Vue 模板（最佳实践/反模式/deep选择器/全局CSS）
│   │   ├── performance.md                       ← 性能（渲染优化/跑马灯/大列表）
│   │   ├── memory-management.md                 ← 内存管理（定时器/监听器/销毁/Worker/存储）
│   │   ├── concurrency.md                       ← 并发处理（竞态/异步安全）
│   │   ├── i18n-check.md                        ← 国际化（硬编码检测/多语种键值对比）
│   │   ├── security.md                          ← 安全（XSS/注入/敏感信息/正则）
│   │   ├── error-handling.md                    ← 错误处理（catch/ErrorBoundary/友好化）
│   │   ├── component-design.md                  ← 组件设计（职责拆分/Props透传/循环依赖）
│   │   └── code-hygiene.md                      ← 代码卫生（console.log/死代码/魔法数字）
│   │
│   ├── instructions/                            ← 执行指令
│   │   ├── launcher.md                          ← 启动器（标准检查流程）
│   │   ├── constraints.md                       ← 约束规则
│   │   ├── code-standard.md                     ← 代码规范（检查报告编写规范）
│   │   ├── gate-check.md                        ← 门禁检查
│   │   ├── common-steps.md                      ← 通用步骤（扫描/报告生成）
│   │   ├── task-eslint-audit.md                 ← 任务：ESLint 配置审计
│   │   ├── task-deep-review.md                  ← 任务：深度代码审查
│   │   ├── task-full-review.md                  ← 任务：完整检查（ESLint + 深度）
│   │   ├── task-i18n-check.md                   ← 任务：国际化专项检查
│   │   └── review-checklist.md                  ← 复核自检清单
│   │
│   └── architecture/                            ← 参照（轻量）
│       └── check-framework-reference.md         ← 检查框架参照（维度/严重级别/报告格式）
│
└── VERSION.md                                   ← 版本记录
```

---

## 10 大检查维度详解

### 维度 1：代码规范（code-quality）

| 检查项                                        | 默认阈值 | 可配置 |
| --------------------------------------------- | -------- | ------ |
| 单文件最大行数                                | 400 行   | ✅     |
| 单函数体最大行数                              | 50 行    | ✅     |
| 注释比例下限                                  | 10%      | ✅     |
| ESLint 配置是否存在                           | —        | —      |
| ESLint 是否包含 `plugin:vue/vue3-recommended` | —        | —      |
| 命名规范一致性（文件/变量/组件）              | —        | ✅     |

### 维度 2：Vue 模板（vue-template）

| 检查项                             | 说明                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| v-for 缺少 key 或 key 使用 index   | 性能隐患                                                                                               |
| v-html 使用                        | XSS 风险                                                                                               |
| 组件 props 缺少类型验证            | 可维护性                                                                                               |
| 模板内嵌套过深（>3 层 v-if/v-for） | 可读性                                                                                                 |
| 未使用的组件/导入                  | 代码整洁                                                                                               |
| computed 可替代 watch 的场景       | 性能/简洁                                                                                              |
| 模板中复杂表达式未抽取为 computed  | 可读性/性能                                                                                            |
| CSS deep 选择器不合规              | Vue 3 仅支持 `:deep()`，检查是否误用 `::v-deep`、`/deep/`、`>>>` 等 Vue 2 语法                         |
| 组件内写全局 CSS 样式              | 检查 `<style>` 未加 `scoped` 或滥用 `:global()` 导致全局样式污染，全局样式应统一放在项目全局样式文件中 |

### 维度 3：性能（performance）

| 检查项               | 说明                                            |
| -------------------- | ----------------------------------------------- |
| 跑马灯/轮播/动画性能 | requestAnimationFrame 使用、CSS 动画 vs JS 动画 |
| 大列表未使用虚拟滚动 | 渲染性能                                        |
| 不必要的深度 watcher | 响应式开销                                      |
| 频繁触发重渲染       | 响应式数据粒度问题                              |
| 大体积组件未异步加载 | 首屏性能                                        |
| 图片/资源未懒加载    | 加载性能                                        |

### 维度 4：内存管理（memory-management）

| 检查项                              | 说明                                   |
| ----------------------------------- | -------------------------------------- |
| 组件销毁时未清理定时器              | setInterval / setTimeout               |
| 组件销毁时未移除事件监听            | addEventListener / EventEmitter        |
| 组件销毁时未取消 watcher            | watchEffect / watch 的停止             |
| 事件总线（mitt/EventBus）未取消监听 | 跨组件通信泄漏                         |
| WebWorker 通信未关闭                | worker.terminate() / message 监听      |
| 本地存储使用问题                    | 容量超限、数据过期未清理、敏感信息存储 |
| DOM 引用未释放                      | ref 指向的 DOM 在组件销毁后仍被引用    |

### 维度 5：并发处理（concurrency）

| 检查项                   | 说明                           |
| ------------------------ | ------------------------------ |
| API 请求竞态条件         | 快速连续请求，后发先至覆盖结果 |
| 异步操作中共享状态未保护 | 并发修改同一响应式数据         |
| Promise 未处理 rejection | unhandledrejection             |
| 防抖/节流缺失            | 高频操作（搜索、滚动）未做限流 |

### 维度 6：国际化（i18n-check）— 需配置开关

| 检查项                  | 说明                                  |
| ----------------------- | ------------------------------------- |
| 模板中硬编码中文文本    | 未使用 `$t()` / `t()`                 |
| JS 中硬编码用户可见中文 | 未使用 i18n 函数                      |
| **多语种文件键值对比**  | 开启后检查各语种间是否缺失/遗漏配置键 |
| 语种文件间键值一致性    | A 语种有但 B 语种没有的 key           |

### 维度 7：安全（security）

| 检查项                      | 说明                                                  |
| --------------------------- | ----------------------------------------------------- |
| 不安全的正则表达式          | ReDoS 风险，如嵌套量词 `(a+)+`                        |
| `eval()` / `new Function()` | 代码注入风险                                          |
| 敏感信息硬编码              | API Key、密码、Token 等写死在代码中                   |
| URL 拼接未编码              | `window.location` 拼接用户输入未 `encodeURIComponent` |
| `localStorage` 存储敏感数据 | Token、密码等应使用 httpOnly Cookie                   |
| 生产环境未关闭 devtools     | `Vue.config.devtools` 或 `__VUE_PROD_DEVTOOLS__`      |

### 维度 8：错误处理（error-handling）

| 检查项                  | 说明                                                |
| ----------------------- | --------------------------------------------------- |
| API 请求无错误处理      | `catch` 缺失或空 `catch {}`                         |
| 异步操作无 fallback     | `async/await` 无 `try/catch`，Promise 无 `.catch()` |
| 组件缺少 Error Boundary | 未使用 `onErrorCaptured` 处理子组件错误             |
| 用户可见的错误未友好化  | 直接抛出技术错误信息给用户                          |
| 全局错误处理缺失        | `app.config.errorHandler` 未配置                    |

### 维度 9：组件设计（component-design）

| 检查项                               | 说明                               |
| ------------------------------------ | ---------------------------------- |
| 组件职责过多（>500 行 template）     | 应拆分为子组件                     |
| Props 透传超过 3 层（Prop Drilling） | 应使用 `provide/inject` 或状态管理 |
| 组件直接修改 props                   | 应使用 `emit` 通知父组件修改       |
| 过度使用 `ref` 操作 DOM              | 应优先使用声明式模板               |
| 循环依赖（A 导入 B，B 导入 A）       | 架构腐化信号                       |

### 维度 10：代码卫生（code-hygiene）

| 检查项                          | 说明                                    |
| ------------------------------- | --------------------------------------- |
| 残留 `console.log` / `debugger` | 生产代码中遗留调试语句                  |
| 死代码 / 未使用的导出           | 定义了但从未被引用的函数、变量、组件    |
| `TODO` / `FIXME` / `HACK` 堆积  | 技术债务标记过多未处理                  |
| 重复代码块                      | 相似逻辑多处出现但未抽取为公共函数/组件 |
| 魔法数字 / 硬编码字符串         | 应抽取为常量                            |

---

## 检查严重级别

每条检查结果标记严重级别：

| 级别       | 含义                                    | 处理要求 |
| ---------- | --------------------------------------- | -------- |
| 🔴 Error   | 必须修复（内存泄漏、XSS、数据丢失风险） | 立即处理 |
| 🟡 Warning | 建议修复（性能隐患、可维护性问题）      | 尽快处理 |
| 🔵 Info    | 建议优化（代码风格、最佳实践）          | 酌情处理 |

### 检查报告规则

**报告文件名格式**：

```
{任务类型}_{检查目标}_{YYYY-MM-DD-HH-mm-ss}.md
```

示例：

- `deep-review_src-pages_2026-09-19-14-30-22.md`
- `full-review_user-management_2026-09-19-15-00-05.md`
- `eslint-audit_full-project_2026-09-19-16-10-33.md`

| 字段     | 说明                                                                  |
| -------- | --------------------------------------------------------------------- |
| 任务类型 | `eslint-audit` / `deep-review` / `full-review` / `i18n-check`         |
| 检查目标 | 指定目录时取目录名（如 `user-management`），全项目时为 `full-project` |
| 时间戳   | 报告生成时间，格式 `YYYY-MM-DD-HH-mm-ss`（与项目导出规范一致）        |

**报告存放目录**：通过 config.md 中 `code_review_report_dir` 配置，默认 `./code-review-reports/`

**报告总表**：每次检查后更新 `_index.md`，追加记录：执行时间、任务类型、检查目标、结果摘要、报告链接

**与上次报告对比**：生成报告时，检查报告存放目录中是否存在相同任务类型 + 相同检查目标的上次报告。若存在，则在新报告末尾追加「与上次检查对比」章节：

```markdown
## 与上次检查对比

| 维度         | 上次（YYYY-MM-DD） | 本次（YYYY-MM-DD） | 变化  |
| ------------ | ------------------ | ------------------ | ----- |
| Error 数量   | 5                  | 3                  | ✅ -2 |
| Warning 数量 | 12                 | 8                  | ✅ -4 |
| Info 数量    | 20                 | 22                 | ⚠️ +2 |
| 总计         | 37                 | 33                 | ✅ -4 |

### 新增问题

- [Error] memory-management: xxx.vue 未清理定时器

### 已解决问题

- [Error] security: yyy.js 敏感信息硬编码（已修复）
```

对比规则：

- 匹配条件：相同任务类型 + 相同检查目标的最近一次报告
- 无上次报告时跳过对比，不报错

---

## config.md 配置项规划

### 必填项

```yaml
# UI 框架
ui_framework: ""
```

### 可选项

```yaml
# 代码规范阈值
max_file_lines: 400
max_function_lines: 50
min_comment_ratio: 10

# 国际化检查开关
i18n_check_enabled: false
i18n_locale_files: [] # 语种文件路径列表（开启后填写）

# 检查报告
code_review_report_dir: "./code-review-reports/"

# 额外排除目录/文件（在 .gitignore 基础上追加排除）
# 注意：.gitignore 中的规则默认生效，无需在此重复
exclude_dirs: []
exclude_files: []
```

### 检查范围规则

| 优先级 | 规则                             | 说明                                           |
| ------ | -------------------------------- | ---------------------------------------------- |
| 1      | 任务命令指定目标目录             | 执行时通过 `检查目录` 字段指定，仅检查该目录   |
| 2      | 未指定目标目录                   | 默认扫描整个项目                               |
| —      | `.gitignore`                     | **默认生效**，自动排除其中列出的所有目录和文件 |
| —      | `exclude_dirs` / `exclude_files` | 在 `.gitignore` 基础上**额外追加**排除         |

---

## 任务类型

| 任务类型        | 触发关键词               | 说明                             |
| --------------- | ------------------------ | -------------------------------- |
| ESLint 配置审计 | eslint、配置检查、lint   | 检查 ESLint 配置完整性并给出建议 |
| 深度代码审查    | 审查、检查、review、深度 | AI 按 10 大维度逐项审查          |
| 完整检查        | 完整检查、全面检查       | ESLint 审计 + 深度审查           |
| 国际化专项检查  | 国际化、i18n、多语种     | 仅检查国际化相关项（需开关开启） |

### 任务提交格式

```
任务类型：深度代码审查
检查目录：src/pages/user-management/    ← 可选，不填则全项目
报告地址：默认                          ← 可选
附加信息：重点关注内存泄漏问题
```

**检查目录规则**：

- 指定了 `检查目录` → 仅检查该目录及其子目录
- 未指定 → 默认检查整个项目（排除 `.gitignore` + `exclude_dirs/files`）

---

## 执行顺序

| Phase    | 内容                                             | 文件数      |
| -------- | ------------------------------------------------ | ----------- |
| Phase 0  | 更新 `docs/instructions/index.md` 总览页新增条目 | 0（修改 1） |
| Phase 1  | `check-rules/` 10 大检查维度规则文件             | 10          |
| Phase 2  | `config.md` + `config.example.md`                | 2           |
| Phase 3  | `instructions/` 基础指令 5 个文件                | 5           |
| Phase 4  | `instructions/` 任务指令 4 个 + review-checklist | 5           |
| Phase 5  | `glossary.md` 术语表                             | 1           |
| Phase 6  | `architecture/check-framework-reference.md`      | 1           |
| Phase 7  | `entry/` 入口文件 2 个                           | 2           |
| Phase 8  | `VERSION.md`                                     | 1           |
| Phase 9  | `docs/` 用户文档 5 个文件                        | 5           |
| Phase 10 | VitePress 侧边栏注册                             | 0（修改 1） |

---

## 关键参考

| 资源           | 路径                                                    | 用途                   |
| -------------- | ------------------------------------------------------- | ---------------------- |
| 新增指令集指南 | `docs/instructions/CREATE-GUIDE.md`                     | 目录结构和设计规范     |
| 已有指令集参照 | `docs/instructions/vue/vue-assembler/`                  | 文件风格和内容深度参照 |
| 计划书归档     | `docs/instructions/_plan-archive/vue-assembler-plan.md` | 计划书格式参照         |

---

## 假设

- 检查指令集为纯 Markdown 文件，AI 按检查清单逐项审查
- ESLint 配置检查为建议性质，不自动修改项目配置（除非用户要求）
- 国际化检查默认关闭，需在 config.md 中开启
- 检查报告格式与 vue-assembler 中的代码检查报告格式一致（含总表 `_index.md`）
- 严重级别分 3 档：Error / Warning / Info
- 检查范围默认遵循项目 `.gitignore`，无需额外配置
- 执行时可通过 `检查目录` 指定目标目录，未指定则全项目扫描
- `exclude_dirs` / `exclude_files` 在 `.gitignore` 基础上额外追加排除
