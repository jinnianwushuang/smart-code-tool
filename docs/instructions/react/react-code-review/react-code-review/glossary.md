# 术语表

> 统一术语定义，确保 AI 与使用者理解一致。

## 检查维度

| 术语 | 含义 |
|------|------|
| **代码规范（code-quality）** | 文件行数、函数长度、注释比例、ESLint 配置、命名规范等基本质量指标 |
| **React 组件（react-component）** | JSX/TSX 组件中的最佳实践与反模式检查（key、dangerouslySetInnerHTML、Compiler 反模式、Hooks 规则） |
| **性能（performance）** | 重渲染、记忆化、虚拟滚动、懒加载、Suspense 等性能相关检查 |
| **内存管理（memory-management）** | useEffect 清理、事件监听、定时器、AbortController、订阅等资源的生命周期管理 |
| **并发处理（concurrency）** | 竞态条件、共享状态、Promise 处理、防抖节流等异步安全检查 |
| **国际化（i18n）** | 硬编码文本检测、多语种文件键值一致性检查 |
| **安全（security）** | XSS、代码注入、敏感信息泄露、正则安全等检查 |
| **错误处理（error-handling）** | API 错误捕获、ErrorBoundary、错误友好化等检查 |
| **组件设计（component-design）** | 组件职责、Props 透传、循环依赖、Server/Client 边界等架构健康检查 |
| **代码卫生（code-hygiene）** | 调试语句残留、死代码、技术债务、重复代码等检查 |

## React 19 专项术语

| 术语 | 含义 |
|------|------|
| **React Compiler** | React 19 自动记忆化编译器，启用后无需手写 useMemo/useCallback/memo |
| **ref as prop** | React 19 中函数组件可直接接收 `ref` 作为普通 prop，无需 `forwardRef` |
| **Actions** | React 19 表单/异步动作范式，配合 `useActionState` / `useFormStatus` / `useOptimistic` |
| **use() API** | React 19 读取 Promise 或 Context 的新 API，可在条件中调用 |
| **Server Components** | RSC，服务端组件，通过 `'use client'` / `'use server'` 划分边界 |

## 严重级别

| 术语 | 含义 |
|------|------|
| **🔴 Error** | 必须修复的问题，如内存泄漏、XSS、数据丢失风险 |
| **🟡 Warning** | 建议修复的问题，如性能隐患、可维护性问题 |
| **🔵 Info** | 建议优化的问题，如代码风格、最佳实践 |

## 任务类型

| 术语 | 含义 |
|------|------|
| **ESLint 配置审计** | 检查 ESLint 配置的完整性和合理性 |
| **深度代码审查** | 按 10 大维度逐项审查代码 |
| **完整检查** | ESLint 审计 + 深度审查的组合任务 |
| **国际化专项检查** | 仅检查国际化相关项 |

## 报告相关

| 术语 | 含义 |
|------|------|
| **检查报告** | 单次检查的输出文件，包含所有发现的问题及修复建议 |
| **报告总表（_index.md）** | 记录所有历史检查记录的汇总表 |
| **对比章节** | 新报告与上次报告的差异对比（数量变化、新增/已解决问题） |

## 范围相关

| 术语 | 含义 |
|------|------|
| **检查目录** | 任务命令中指定的检查目标目录，未指定则全项目 |
| **排除规则** | `.gitignore` + `exclude_dirs` + `exclude_files` 的合并结果 |
