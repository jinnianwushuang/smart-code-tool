# 依赖包 Major 版本升级计划

## 当前状态

已完成同 major 版本内的 patch/minor 升级（22 个包），以下 12 个包因涉及 major 版本变更（breaking changes）被跳过，需专项处理。

---

## 批次 1：低风险 / 无影响（预计 30 分钟）

这些包在项目中用量极少，API 变更影响面小。

### 1.1 nanoid 5 → 6

- **当前版本**：5.1.14
- **目标版本**：6.x
- **影响文件**：仅 `project/code-tool-app/pages/common-tool/components/id-generator/id-generator.vue`（1 处 `import { nanoid } from 'nanoid'`）
- **Breaking Changes**：nanoid 6 主要变更是 Node.js 最低版本要求和 ESM 导出调整，核心 API `nanoid()` / `customAlphabet()` 保持不变
- **操作步骤**：
  1. `pnpm add nanoid@^6`
  2. 验证 id-generator 组件功能正常
- **风险**：⭐ 极低

### 1.2 uuid 13 → 14

- **当前版本**：13.0.2
- **目标版本**：14.x
- **影响文件**：仅 `project/code-tool-app/pages/common-tool/components/id-generator/id-generator.vue`（1 处 `import { v4 as uuidv4 } from 'uuid'`）
- **Breaking Changes**：uuid 14 主要是 Node.js 版本要求和 TypeScript 类型调整，`v4()` API 不变
- **操作步骤**：
  1. `pnpm add uuid@^14`
  2. 验证 id-generator 组件 UUID 生成功能
- **风险**：⭐ 极低

### 1.3 lucide-vue-next（deprecated）→ @lucide/vue

- **当前状态**：`lucide-vue-next` 已标记 deprecated，官方建议迁移到 `@lucude/vue`
- **影响文件**：项目中 **未使用**（grep 0 匹配）
- **操作步骤**：
  1. `pnpm remove lucide-vue-next`
  2. 如后续需要图标，安装 `pnpm add @lucide/vue`
- **风险