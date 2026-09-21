# 复核自检清单

> AI 完成任何任务后，必须逐项检查以下清单。全部通过后方可结束任务。

## 1. 命名规范

- [ ] 组件文件名使用 `PascalCase.jsx`
- [ ] Hook/工具文件名使用 `kebab-case.js`
- [ ] 组件名使用 `PascalCase`
- [ ] Hook 名使用 `camelCase`，`use` 前缀
- [ ] 事件处理函数使用 `handle` 前缀
- [ ] 状态变量使用 `camelCase`

## 2. 注释

- [ ] 所有注释使用中文（或符合 config.md 配置）
- [ ] 注释比例 ≥ 配置值（默认 10%）
- [ ] 每个导出函数/Hook 有功能说明注释
- [ ] 复杂逻辑有行内注释

## 3. 代码量

- [ ] 单组件文件行数 ≤ 200 行
- [ ] 单 Hook 文件行数 ≤ 300 行
- [ ] 单函数行数 ≤ 50 行

## 4. React Compiler 兼容性

- [ ] 无手写 `useMemo`
- [ ] 无手写 `useCallback`
- [ ] 无使用 `forwardRef`
- [ ] 无使用 `defaultProps`/`propTypes`
- [ ] 无使用 class 组件

## 5. Hook 规则

- [ ] 无条件/循环/嵌套中调用 Hook
- [ ] 所有 useEffect 有清理函数
- [ ] 状态更新使用函数式更新（避免闭包陷阱）

## 6. Server/Client 边界

- [ ] `'use client'` 在文件第一行（如需要）
- [ ] Server Component 无 Hook 和事件处理
- [ ] 敏感信息未暴露在 Client Component

## 7. CSS

- [ ] 优先使用 UI 框架组件和全局 CSS 变量
- [ ] 无不通用的自定义 CSS
- [ ] 使用的 CSS 变量在 config.md 清单中

## 8. 组件

- [ ] 组件保持单一职责
- [ ] 复杂逻辑已抽取到 Hook
- [ ] 未在组件内部定义子组件

## 9. 任务完成度

- [ ] 所有需求点已实现
- [ ] 无遗漏的功能项
- [ ] 执行报告已输出
