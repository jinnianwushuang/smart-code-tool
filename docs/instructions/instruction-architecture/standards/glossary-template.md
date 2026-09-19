# 术语表模板

> 每个指令集应配套术语映射文件，统一 AI 与团队对同一概念的理解

---

## 用途

术语表解决的核心问题：AI 和团队成员对同一概念可能有不同理解。  
例如："模块"在某些项目中指路由模块，在另一些项目中指功能组件。

---

## 模板结构

### 人阅读版（glossary.md）

```markdown
# 项目术语表

## 架构术语

| 术语 | 正式名称 | 代码中的命名 | 说明 |
|------|---------|-------------|------|
| 装配器 | Assembler | `xxx-assembler.js` | 负责组件组装的核心引擎 |
| 事件管道 | Event Pipeline | `event-pipeline-register/` | 事件注册与分发的管道机制 |
| 生命周期管理器 | Lifecycle Disposer | `lifecycle-disposer/` | 管理组件生命周期销毁逻辑 |

## 业务术语

| 业务术语 | 代码命名 | 说明 |
|---------|---------|------|
| 统计面板 | StatsPanel | Excel 数据分析的可视化面板 |
| 数据解析器 | DataParser | 负责 Excel 文件解析的核心模块 |

## 目录映射

| 简称 | 实际路径 | 说明 |
|------|---------|------|
| 工具页 | `project/code-tool-app/pages/` | 工具类页面目录 |
| 公共层 | `src/common/` | 跨模块共享的公共代码 |
| 组合函数 | `src/composable/` | Vue 组合式 API 函数目录 |

## 缩写对照

| 缩写 | 全称 | 说明 |
|------|------|------|
| IA | Instruction Architecture | 指令集架构 |
| AC | Auto Check | 自动检查 |
```

### AI 阅读版（glossary.ai.yaml）

```yaml
# AI 阅读版：键值对映射，用于消歧和上下文对齐
# 格式：术语 → { formal_name, code_name, description }

architecture_terms:
  装配器:
    formal_name: Assembler
    code_name: xxx-assembler.js
    description: 负责组件组装的核心引擎
  事件管道:
    formal_name: Event Pipeline
    code_name: event-pipeline-register/
    description: 事件注册与分发的管道机制

business_terms:
  统计面板:
    code_name: StatsPanel
    description: Excel 数据分析的可视化面板

directory_mapping:
  工具页: project/code-tool-app/pages/
  公共层: src/common/
  组合函数: src/composable/

abbreviations:
  IA: Instruction Architecture
  AC: Auto Check
```

---

## 维护规则

| 规则 | 说明 |
|------|------|
| 新增术语 | 在指令集中首次使用新术语时，同步添加到术语表 |
| 双版本同步 | 修改人阅读版时，同步更新 AI 阅读版 |
| 引用强制 | 指令集中涉及专业术语时，必须引用术语映射文件 |
| 定期审查 | 每个迭代结束时审查一次，清理过时术语 |

---

## 使用方式

AI 在执行指令时，遇到术语应查阅术语表：

1. 读取 `shared/glossary.md`（人阅读版）或 `shared/glossary.ai.yaml`（AI 阅读版）
2. 按术语查找对应的代码命名和说明
3. 确保输出中使用正确的代码命名
