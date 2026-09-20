# 任务：深度代码审查

> AI 按 10 大检查维度逐项审查代码，输出结构化检查报告。

## 执行步骤

### 步骤 1：确定检查范围

执行 common-steps.md 步骤 A-B，确定并扫描目标文件。

### 步骤 2：维度 1 — 代码规范

参照 `check-rules/code-quality.md`，检查：

- 单文件行数
- 单函数体行数
- 注释比例
- 命名规范

### 步骤 3：维度 2 — React 组件

参照 `check-rules/react-component.md`，检查：

- 列表 key
- dangerouslySetInnerHTML
- Compiler 反模式（useMemo/useCallback/memo/forwardRef/defaultProps）
- Hooks 调用规则
- useEffect 依赖数组
- props 类型
- 组件内联对象/函数
- Server/Client 指令边界
- Context 使用方式

### 步骤 4：维度 3 — 性能

参照 `check-rules/performance.md`，检查：

- 不必要的重渲染
- Compiler 记忆化冗余
- 虚拟滚动
- 懒加载 / Suspense
- 大列表渲染
- 图片/资源加载

### 步骤 5：维度 4 — 内存管理

参照 `check-rules/memory-management.md`，检查：

- useEffect 清理函数
- 事件监听清理
- 定时器清理
- AbortController
- 订阅取消
- 闭包引用
- 本地存储

### 步骤 6：维度 5 — 并发处理

参照 `check-rules/concurrency.md`，检查：

- 竞态条件
- 共享状态
- Promise rejection
- 防抖/节流

### 步骤 7：维度 6 — 国际化（如已开启）

如 config.md 中 `i18n_check_enabled` 为 `true`，参照 `check-rules/i18n-check.md` 检查。否则跳过。

### 步骤 8：维度 7 — 安全

参照 `check-rules/security.md`，检查：

- 不安全正则
- eval/Function
- dangerouslySetInnerHTML XSS
- 敏感信息硬编码
- URL 编码
- 存储敏感数据

### 步骤 9：维度 8 — 错误处理

参照 `check-rules/error-handling.md`，检查：

- API 错误处理
- 异步 fallback
- ErrorBoundary
- 错误友好化
- 全局错误处理

### 步骤 10：维度 9 — 组件设计

参照 `check-rules/component-design.md`，检查：

- 组件职责
- Props 透传
- state/props 修改
- Server/Client 边界
- 循环依赖

### 步骤 11：维度 10 — 代码卫生

参照 `check-rules/code-hygiene.md`，检查：

- console.log/debugger
- 死代码
- TODO/FIXME
- 重复代码
- 魔法数字

### 步骤 12：生成报告

执行 common-steps.md 步骤 D-E-F，生成深度审查报告。

## 完成标准

- [ ] 10 个维度全部检查（i18n 视开关而定）
- [ ] 每条问题标注严重级别
- [ ] 报告已生成并保存
- [ ] 如有上次报告，已追加对比
- [ ] 总表已更新
