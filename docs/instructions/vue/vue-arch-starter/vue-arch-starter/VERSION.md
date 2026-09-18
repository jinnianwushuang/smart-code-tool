# 版本记录

## v1.0.0 — 2026-09-19

### 初始版本

- 从 smart-code-tool 项目提取 Vue 3 装配架构核心代码模板
- 包含多例模板（multiton-template）和单例模板（singleton-template）
- 包含装配引擎核心（common/architecture-design）
- 包含架构组合函数（composable/architecture-design）
- 包含全局样式变量（css/）
- 消除生成式聚合文件，所有 import 改为直接指向实际源文件
- 附带 Vite 配置模板和依赖清单
- 附带集成指南、定制指南、Common Pitfalls FAQ
- 支持 UI 框架替换（Quasar / Element Plus / Naive UI）

### 代码同步记录

| 日期 | 来源 | 变更说明 |
|------|------|---------|
| 2026-09-19 | smart-code-tool src/ | 初始提取，消除 src/output/ 间接导入 |
