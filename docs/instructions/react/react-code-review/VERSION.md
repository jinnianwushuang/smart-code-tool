# 版本记录

## v1.0.0（2026-09-20）

### 初始版本

- 面向 React 19 + TypeScript 5.5+，默认启用 React Compiler 约束
- 建立 10 大检查维度（代码规范、React 组件、性能、内存管理、并发处理、国际化、安全、错误处理、组件设计、代码卫生）
- 共 57 个检查项（i18n 开启时）
- 4 种任务类型：ESLint 配置审计、深度代码审查、完整检查、国际化专项检查
- React 19 专项：ref as prop、use() API、Actions 三剑客、Server Components 边界、Document Metadata、ErrorBoundary 增强
- 反模式检查：手写 useMemo/useCallback/forwardRef/defaultProps/proptypes（Compiler 已接管）
- 检查报告支持时间戳命名、上次报告对比、总表记录
- 支持指定检查目录，默认遵循 .gitignore 排除规则
- 国际化检查可配置开关，支持多语种键值对比
