# 端到端完整示例

> 展示从任务提交到 AI 检查完成的完整流程。

## 1. 任务提交格式

```
任务类型：深度代码审查
检查目录：src/pages/user-management/
报告地址：默认
附加信息：重点关注内存泄漏问题
```

## 2. AI 预期执行过程

### 步骤 1：读取上下文
- 读取 config.md → 获取 UI 框架（antd）、react_compiler、阈值配置等
- 读取 glossary.md → 统一术语理解
- 读取 check-framework-reference.md → 理解 10 大维度和严重级别

### 步骤 2：门禁检查
- 检查 config.md 关键配置 → 通过
- 检查 package.json 存在 → 通过
- 检查 .gitignore 存在 → 通过
- 检查目标目录存在 → 通过

### 步骤 3：确定检查范围
- 检查目录：`src/pages/user-management/`
- 读取 .gitignore → 排除 node_modules、dist 等
- 扫描目标文件 → 找到 15 个 .tsx / .ts / .jsx 文件

### 步骤 4：锁定任务类型
- 任务类型：深度代码审查
- 对应指令：task-deep-review.md

### 步骤 5-11：逐维度检查
- 维度 1 代码规范 → 发现 2 个 Warning（文件超 400 行）
- 维度 2 React 组件 → 发现 2 个 Warning（手写 useMemo/forwardRef，Compiler 反模式）
- 维度 3 性能 → 发现 1 个 Info（大列表未虚拟化）
- 维度 4 内存管理 → 发现 2 个 Error（useEffect 未清理定时器/订阅）
- 维度 5 并发 → 发现 1 个 Warning（搜索未做防抖）
- 维度 6 i18n → 跳过（开关关闭）
- 维度 7 安全 → 通过
- 维度 8 错误处理 → 发现 1 个 Warning（API 无 catch）
- 维度 9 组件设计 → 通过
- 维度 10 代码卫生 → 发现 3 个 Info（console.log 残留）

### 步骤 12：生成报告

```
## 执行报告

### 检查概况
- 检查目标：src/pages/user-management/
- 检查文件数：15
- 发现问题：Error: 2 / Warning: 6 / Info: 4

### 🔴 Error
1. [memory-management] UserTable.tsx — useEffect 中 setInterval 未在清理函数中 clearInterval
2. [memory-management] useUserStream.ts — 订阅未在 useEffect 返回函数中取消

### 🟡 Warning
1. [code-quality] UserList.tsx — 文件行数 456 行（>400）
2. [react-component] UserCard.tsx — 使用 forwardRef（React 19 应改为 ref as prop）
3. [react-component] UserFilter.tsx — Compiler 已启用，手写 useMemo 属冗余
4. [concurrency] SearchInput.tsx — 搜索输入未做防抖
5. [error-handling] api.ts — fetchUser 无 try/catch
6. [code-quality] utils.ts — 文件行数 412 行（>400）

### 🔵 Info
1. [performance] UserTable.tsx — 大数据量列表未使用虚拟滚动
2. [code-hygiene] UserList.tsx — 3 处 console.log 残留
3. [code-hygiene] utils.ts — 2 处 TODO 注释
4. [code-quality] UserList.tsx — 注释比例 8%（<10%）

### 建议
- 建议优先修复 2 个 Error（内存泄漏风险）
- Compiler 反模式项可批量清理，简化心智负担
- 建议手动启动项目自检，确认功能正常
```
