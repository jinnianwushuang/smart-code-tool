# 代码卫生（code-hygiene）

> 检查代码中的遗留调试语句、死代码、技术债务标记和重复代码。

## 检查项

### 1. 残留 `console.log` / `debugger`

- **严重级别**：🟡 Warning
- **检查方式**：扫描所有 `.tsx` / `.jsx` / `.ts` / `.js` 文件中的 `console.log`、`console.debug`、`debugger` 语句
- **排除范围**：
  - `console.error` / `console.warn` 通常用于错误处理，不在此检查范围
  - 注释中的 `console.log` 不计入
- **处理建议**：移除调试语句，保留必要的 `console.error` / `console.warn`

### 2. 死代码 / 未使用的导出与变量

- **严重级别**：🔵 Info
- **检查方式**：检查是否存在定义了但从未被引用的函数、变量、组件、导入
- **问题示例**：

```tsx
// 已定义但从未被任何文件导入
export function legacyHelper() {
  /* ... */
}

// 组件内定义但未使用的变量
const unusedData = useState(null)
```

- **处理建议**：移除死代码，保持代码库整洁

### 3. `TODO` / `FIXME` / `HACK` 堆积

- **严重级别**：🔵 Info
- **检查方式**：统计代码中 `TODO`、`FIXME`、`HACK`、`XXX` 注释的数量
- **阈值建议**：
  - 单文件超过 5 个 → 🟡 Warning
  - 全项目超过 50 个 → 🟡 Warning
- **处理建议**：定期清理技术债务，将 TODO 转化为任务跟踪

### 4. 重复代码块

- **严重级别**：🟡 Warning
- **检查方式**：检查是否存在相似逻辑在多处出现但未抽取为公共函数/组件/Hook
- **判断标准**：
  - 连续 10 行以上高度相似的代码
  - 相同业务逻辑在不同组件中重复实现
- **处理建议**：
  - 重复逻辑抽取为自定义 Hook（`use*.ts`）
  - 重复 UI 模式抽取为公共组件
  - 重复配置抽取为常量文件

### 5. 魔法数字 / 硬编码字符串

- **严重级别**：🔵 Info
- **检查方式**：检查代码中是否直接使用未经定义的数字或字符串字面量（排除 0、1、-1 等常见值）
- **问题示例**：

```tsx
if (status === 3) {
  /* 3 是什么？ */
}
const timeout = 30000 // 30 秒？30 毫秒？
if (type === 'admin_user') {
  /* 硬编码字符串 */
}
```

- **正确写法**：

```tsx
const STATUS_COMPLETED = 3
const REQUEST_TIMEOUT = 30000 // 30 秒
const USER_TYPE_ADMIN = 'admin_user'

if (status === STATUS_COMPLETED) {
  /* ... */
}
const timeout = REQUEST_TIMEOUT
if (type === USER_TYPE_ADMIN) {
  /* ... */
}
```

- **处理建议**：抽取为命名清晰的常量
