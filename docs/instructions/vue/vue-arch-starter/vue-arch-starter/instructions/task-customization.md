# 任务：定制修改

> 基于已集成的架构模板进行定制化修改。

## 前置条件

- 架构骨架已搭建完成（`task-integration.md` 已执行过）
- `config.md` 配置完整

## 支持的定制类型

### 1. 更换 UI 框架

**影响范围**：

| 文件 | 修改内容 |
|------|---------|
| `src/css/quasar-variables.scss` | 替换为目标框架的变量文件 |
| `src/standardization/**/*.vue` | 替换框架组件标签（如 `<q-btn>` → `<el-button>`） |
| `src/composable/**/useGlobalVariable.js` | 替换 `useQuasar()` 调用 |
| `vite.config.js` | 替换插件配置 |

**执行步骤**：
1. 确认目标框架（Element Plus / Naive UI / 其他）
2. 列出需要替换的组件映射表
3. 逐个文件替换，每次替换后确认编译通过
4. 更新 CSS 变量文件
5. 更新 Vite 插件配置

### 2. 添加新的 Effect 模块

在 `standardization/<模板名>/module/effect/` 下新增文件：

| 文件名 | 用途 |
|--------|------|
| `timer.js` | 定时器管理（自动清理） |
| `listener.js` | 原生事件监听（自动清理） |
| `watcher.js` | Vue 监听器 |
| `dom.js` | DOM 操作 |
| `mitter.js` | 事件总线通信 |
| `other.js` | 其他副作用 |

### 3. 扩展状态管理

- 在 `state/` 下新增状态文件
- 装配器会通过 `import.meta.glob` 自动扫描并注册

### 4. 自定义事件通道

- 在 `module/event-pipeline/` 下新增文件
- 每个文件定义一个独立的事件通道

### 5. 调整模块扫描规则

- 修改 `assembler/assembler.js` 中的 `import.meta.glob` 模式
- 注意：`___` 结尾的文件名会被自动排除

## 执行原则

1. 每次只修改一类内容
2. 修改前先说明影响范围
3. 修改后建议用户运行编译检查
4. 详细指南参考 `docs/customization.md`
