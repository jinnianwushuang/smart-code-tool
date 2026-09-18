# 上下文加载入口

> AI 助手在接到任务后，按以下顺序加载文件建立上下文。

## 加载顺序

### Step 1：加载配置

读取 `config.md`，确认项目配置信息：

- 项目名称和路径
- UI 框架选择
- 路径别名配置

### Step 2：加载术语表

读取 `glossary.md`，理解架构术语和文件对照关系。

### Step 3：加载约束和流程

按顺序读取：

1. `instructions/constraints.md` → 约束规则
2. `instructions/launcher.md` → 标准执行流程
3. `instructions/gate-check.md` → 门禁检查

### Step 4：加载环境信息

读取：

1. `code-template/dependencies.md` → 依赖清单
2. `code-template/vite.config.template.js` → Vite 配置参考

### Step 5：等待任务

上下文加载完成后，向用户确认：

```
已加载 Vue 3 标准架构代码模板的完整上下文。

当前配置：
- 项目：{project_name}
- UI 框架：{ui_framework}

请告诉我你需要执行什么任务：
- 「新项目集成」— 在新项目中搭建架构骨架
- 「定制修改」— 更换 UI 框架、添加模块等
```

## 核心原则

- **存疑即问**：信息不完整时主动提问，禁止猜测
- **单次执行**：一次只做一类任务
- **安全熔断**：超出范围或卡住时停止并反馈
- **只检不改**：默认只给出指导，不直接修改代码
- **遵循路径规范**：所有 import 使用 `src/` 别名
