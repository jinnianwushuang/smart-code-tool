# 文件索引

> 代码模板包中所有文件的功能说明。

## 目录结构总览

```
vue-arch-starter/
├── code-template/                    ← 核心代码（复制到项目 src/ 下）
│   ├── vite.config.template.js       ← Vite 配置参考
│   ├── dependencies.md               ← 依赖清单
│   ├── standardization/              ← 标准模板
│   ├── common/                       ← 装配引擎
│   ├── composable/                   ← 组合函数
│   └── css/                          ← 样式变量
├── config.md                         ← 配置模板
├── config.example.md                 ← 完整配置示例
├── glossary.md                       ← 术语表
├── VERSION.md                        ← 版本记录
├── entry/                            ← AI 入口
├── instructions/                     ← AI 指令
└── docs/                             ← 人类文档（本区域）
```

## code-template/ — 核心代码

### 配置文件

| 文件 | 说明 |
|------|------|
| `vite.config.template.js` | Vite 配置参考模板，含 src/ 别名、Quasar 插件、SCSS 变量 |
| `dependencies.md` | 必需/可选依赖清单，含版本要求和快速安装命令 |

### standardization/ — 标准模板

| 目录 | 说明 |
|------|------|
| `multiton-template/` | 多例模板 — 每次使用创建独立实例 |
| `multiton-template/index.vue` | 多例模板主组件 |
| `multiton-template/assembler/` | 多例装配器配置 |
| `multiton-template/state/` | 多例状态定义（config/computed/multiton/singleton） |
| `multiton-template/module/` | 多例功能模块（lifecycle/effect/emit/event-pipeline 等） |
| `multiton-template/component/component-demo/` | 验证页面（集成后删除） |
| `multiton-template/css/` | 多例模板样式 |
| `singleton-template/` | 单例模板 — 全局共享单一实例 |
| `singleton-template/index.vue` | 单例模板主组件 |
| `singleton-template/assembler/` | 单例装配器配置（含 expose.js） |
| `singleton-template/state/` | 单例状态定义 |
| `singleton-template/module/` | 单例功能模块 |
| `singleton-template/component/` | 单例组件（table-main-area/dialog-wrapper/top-search-area） |
| `singleton-template/api-request/` | API 请求模块 |
| `singleton-template/css/` | 单例模板样式 |

### common/architecture-design/ — 装配引擎

| 目录 | 说明 |
|------|------|
| `assembler/` | 7 个核心装配器（atoms/state/multiton/singleton/component/event-pipeline/function） |
| `function-wrapper/` | payload 函数包装器（wrap_with_payload / pipeline） |
| `mitt-kit/` | 事件总线封装（EMITTER） |
| `util/file/` | 文件名解析工具 |
| `util/log/` | 日志工具 |
| `util/merge/` | payload 合并 + 架构合规检查 |

### composable/ — 组合函数

| 文件/目录 | 说明 |
|----------|------|
| `index.js` | Composable 函数索引（供装配器动态查找） |
| `architecture-design/assembler/` | 上下文启动器 + 模块生命周期装配器 |
| `architecture-design/lifecycle-disposer-composable/` | 生命周期自动清理（事件监听 / 其他资源） |
| `architecture-design/global-variable-composable/` | 全局变量注入（router/route） |

### css/ — 样式变量

| 文件 | 说明 |
|------|------|
| `index.scss` | 全局样式入口 |
| `dark-variables.scss` | 暗色主题变量 |
| `light-variables.scss` | 亮色主题变量 |
| `quasar-variables.scss` | Quasar 组件变量（换框架时替换） |
| `utils.scss` | 工具类样式 |
| `scroll.scss` | 滚动条样式 |

## instructions/ — AI 指令

| 文件 | 说明 |
|------|------|
| `launcher.md` | 启动器（任务类型识别 + 标准执行流程） |
| `constraints.md` | 约束规则（8 条） |
| `code-standard.md` | 代码规范（导入/命名/目录/CSS/注释） |
| `gate-check.md` | 门禁检查（前置条件清单） |
| `common-steps.md` | 通用步骤（A-F） |
| `task-integration.md` | 任务：新项目集成 |
| `task-customization.md` | 任务：定制修改 |
| `review-checklist.md` | 复核自检清单 |
