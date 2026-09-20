# 文件索引

> 指令集全部文件的功能索引。

## 目录结构总览

```
react-code-review/
├── docs/                          ← 人类文档区
├── react-code-review/             ← AI 指令区
│   ├── entry/
│   ├── check-rules/
│   ├── instructions/
│   ├── architecture/
│   ├── config.md
│   ├── config.example.md
│   └── glossary.md
└── VERSION.md
```

## AI 指令区文件索引

### entry/ — AI 入口

| 文件               | 功能                           |
| ------------------ | ------------------------------ |
| `context-entry.md` | AI 入口文件，定义 5 步加载顺序 |
| `example.md`       | 端到端完整示例                 |

### check-rules/ — 10 大检查维度

| 文件                   | 功能                                                                 |
| ---------------------- | -------------------------------------------------------------------- |
| `code-quality.md`      | 代码规范（行数/函数长度/注释/ESLint/命名）                           |
| `react-component.md`   | React 组件（key/dangerouslySetInnerHTML/Compiler 反模式/Hooks 规则） |
| `performance.md`       | 性能（重渲染/Compiler/虚拟滚动/懒加载/Suspense）                     |
| `memory-management.md` | 内存管理（useEffect 清理/监听/定时器/AbortController）               |
| `concurrency.md`       | 并发处理（竞态/Promise/防抖节流/async useEffect）                    |
| `i18n-check.md`        | 国际化（硬编码/多语种键值对比）                                      |
| `security.md`          | 安全（XSS/注入/敏感信息/正则）                                       |
| `error-handling.md`    | 错误处理（try/catch/ErrorBoundary/友好化）                           |
| `component-design.md`  | 组件设计（职责/Props 透传/循环依赖/Server-Client 边界）              |
| `code-hygiene.md`      | 代码卫生（console.log/死代码/魔法数字）                              |

### instructions/ — 执行指令

| 文件                   | 功能                     |
| ---------------------- | ------------------------ |
| `launcher.md`          | 启动器（9 步标准流程）   |
| `constraints.md`       | 约束规则（8 条硬性约束） |
| `code-standard.md`     | 报告编写规范             |
| `gate-check.md`        | 门禁检查（4 类前置检查） |
| `common-steps.md`      | 通用步骤（A-F）          |
| `task-eslint-audit.md` | 任务：ESLint 配置审计    |
| `task-deep-review.md`  | 任务：深度代码审查       |
| `task-full-review.md`  | 任务：完整检查           |
| `task-i18n-check.md`   | 任务：国际化专项检查     |
| `review-checklist.md`  | 复核自检清单             |

### 根级文件

| 文件                                        | 功能           |
| ------------------------------------------- | -------------- |
| `config.md`                                 | 填空式配置模板 |
| `config.example.md`                         | 完整配置示例   |
| `glossary.md`                               | 术语表         |
| `architecture/check-framework-reference.md` | 检查框架参照   |
| `VERSION.md`                                | 版本记录       |
