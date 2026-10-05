# 抗遗忘复习系统 — AI 快速认知文档（详细版）

> 本文档供 AI 助手快速理解「抗遗忘复习清单系统」的完整设计与实现细节。
> **状态：已实现 ✅**（全部 7 个 Phase 已完成，构建验证通过）
> 详细方案见：[`抗遗忘复习系统方案.md`](./抗遗忘复习系统方案.md)

---

## 一、系统定位

在 VitePress 文档站的 QuickTools 快捷工具中，新增基于**艾宾浩斯遗忘曲线**的智能复习调度系统。
核心体验：**自动感知学习行为，零手动操作，到期提醒复习**。

```
用户阅读文档（正常浏览）
  ↓ 页面停留 ≥ 10 分钟（自动感知）
系统自动记录「已学习」→ 触发 FSRS 调度引擎计算首次复习时间
  ↓
到期提醒 → 用户自评（忘了/有印象/记得/秒记）→ 计算下次复习时间
  ↓
循环直到转入长期记忆
```

---

## 二、核心技术选型

| 领域     | 方案                       | 说明                                                          |
| -------- | -------------------------- | ------------------------------------------------------------- |
| 调度算法 | **ts-fsrs**                | Free Spaced Repetition Scheduler，Anki 新一代算法，~15KB gzip |
| 降级方案 | 固定艾宾浩斯间隔           | 5min→30min→12h→1d→2d→4d→7d→15d，作为「经典模式」可选项        |
| 持久化   | **idb-keyval** (IndexedDB) | ~600B brotli，替代现有 localStorage（5MB 限制）               |
| 文档 ID  | **24 字符 nanoid**         | 稳定锚点，防止 URL/标题变更导致历史丢失                       |
| 文档清单 | `doc-list.json`            | 构建时从 sidebar 配置生成，运行时 fetch 获取                  |

---

## 三、架构分层

```
Layout.vue (全局挂载 useAutoLearn)
  ↓ 累计 ≥ 10min 自动注册
QuickTools.vue (面板入口)
  └── ReviewTab.vue (五子视图)
        ├── 今日待复习    → 到期文档评分
        ├── 文档盲区      → 从未打开/从未学习/从未复习
        ├── 全部文档      → 按分组展示复习状态
        ├── 统计面板      → 覆盖率、趋势、遗忘曲线
        └── 设置          → 算法模式、导出/导入
```

### 模块职责

| 模块         | 文件                       | 职责                                               |
| ------------ | -------------------------- | -------------------------------------------------- |
| 自动学习感知 | `useAutoLearn.js`          | 页面计时、可见性检测、路由监听、自动触发注册       |
| 调度引擎     | `useReviewScheduler.js`    | FSRS / 固定间隔算法封装                            |
| 文档清单管理 | `useReviewDocRegistry.js`  | 获取 doc-list、基于 docId 的增删检测、URL 变更同步 |
| 持久化层     | `useReviewStorage.js`      | IndexedDB 读写、localStorage 迁移                  |
| 业务逻辑     | `useReview.js` (重构)      | 组合以上模块，暴露 Vue 响应式 API                  |
| 通知提醒     | `useReviewNotification.js` | 浏览器通知权限管理 + 定时到期检查                  |

---

## 四、文件位置

```
docs/.vitepress/
├── config/sidebar/*.js             ← 叶子节点带 id 字段（24 位 nanoid）
└── theme/components/
    ├── QuickTools.vue              ← 主组件（编排层）
    └── quick-tools/
        ├── composables/
        │   ├── useAutoLearn.js             ← 新增
        │   ├── useReview.js                ← 重构
        │   ├── useReviewScheduler.js       ← 新增
        │   ├── useReviewStorage.js         ← 新增
        │   ├── useReviewDocRegistry.js     ← 新增
        │   └── useReviewNotification.js    ← 新增
        ├── tabs/
        │   └── ReviewTab.vue               ← 重构（五子视图）
        └── shared/
            ├── constants.js
            └── utils.js

scripts/
├── inject-sidebar-ids.mjs          ← 为 sidebar 叶子节点注入 id（幂等）
└── gen-doc-list.mjs                ← 从 sidebar 生成 doc-list.json
```

---

## 五、核心数据结构

### ReviewRecord（以 docId 为主键）

```typescript
interface ReviewRecord {
  docId: string // 文档稳定 ID（与 sidebar 中的 id 对应）
  url: string // 文档路径（可从 doc-list 同步更新）
  title: string // 文档标题（可从 doc-list 同步更新）
  group: string // 所属分组

  autoLearnedAt: string | null // 自动标记「已学习」的时间
  accumulatedSeconds: number // 累计有效阅读秒数

  // FSRS 调度字段
  state: 'new' | 'learning' | 'review' | 'relearning'
  stability: number
  difficulty: number
  due: string // 下次到期时间 (ISO 8601)
  lastReview: string | null

  // 学习历史（完整时间线）
  reviewCount: number
  lapses: number
  history: LearningLogEntry[] // 上限 50 条

  // 元数据
  createdAt: string
  updatedAt: string
  isArchived: boolean // 文档被删除时标记
  isDismissed: boolean // 标记为「已知」，从盲区移除
}

interface LearningLogEntry {
  timestamp: string
  type: 'auto-learn' | 'review'
  accumulatedSeconds?: number // 仅 auto-learn
  rating?: 'again' | 'hard' | 'good' | 'easy' // 仅 review
  interval?: number // 仅 review（天）
  elapsedDays?: number // 仅 review
}
```

---

## 六、Sidebar 菜单 ID 约束

每个带 `link` 的叶子菜单项**必须**包含 `id` 字段：

```javascript
/**
 * ⚠️ AI / 开发者须知：
 * 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 * 新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 * id 一旦生成永不修改，即使 text / link 变更也保持原值。
 * VitePress 会忽略 id 字段，不影响解析。
 */

// 示例
{ text: 'Vue 3 手册', link: '/handbook/frontend/vue3-handbook', id: 'a3f8c1e9b2d4Xk9mPq2vLwR7' }
```

**核心作用**：文档目录调整、文件重命名、标题修改时，复习历史通过 `docId` 匹配保留，不丢失。

---

## 七、文档盲区检测

通过对比 `doc-list.json` 与 IndexedDB 记录，自动识别三类盲区：

| 子分类   | 判定条件                                 | 含义             |
| -------- | ---------------------------------------- | ---------------- |
| 从未打开 | doc-list 中有、IndexedDB 中无记录        | 完全没接触过     |
| 从未学习 | 有访问记录但 `autoLearnedAt = null`      | 停留不足 10 分钟 |
| 从未复习 | `autoLearnedAt` 有值但 `reviewCount = 0` | 学了但没复习过   |

---

## 八、UI 规格

- **面板尺寸**：`80vw × 80vh`（移动端降级 `96vw × 85vh`）
- **复习评分**：四档（😟忘了 / 😐有印象 / 🙂记得 / 😎秒记）
- **历史时间线**：单文档最多 50 条，可在设置中调整（10-100）
- **数据导出/导入**：JSON 格式，支持跨浏览器迁移

---

## 九、有效时间判定规则

- 页面 `visibilityState === 'visible'` 时才计时（切 Tab / 最小化不计）
- SPA 路由切换时停止旧计时、开始新页面累计
- 同一页面多次进入时间累加（5min + 5min = 10min → 触发）
- 达到阈值后自动写入，不重复触发

---

## 十、实施阶段

| Phase               | 内容                                                       | 状态 |
| ------------------- | ---------------------------------------------------------- | ---- |
| 1. 文档 ID 基础设施 | inject-sidebar-ids 脚本 + 头部约束注释 + gen-doc-list 脚本 | ✅   |
| 2. 存储与调度引擎   | IndexedDB 持久化层 + FSRS 调度封装                         | ✅   |
| 3. 自动学习感知     | useAutoLearn（计时 + 可见性 + 路由监听）                   | ✅   |
| 4. 核心复习功能     | docRegistry + useReview 重构 + 数据迁移                    | ✅   |
| 5. UI 重构          | ReviewTab 五子视图 + 面板 80vw + 样式                      | ✅   |
| 6. 增强功能         | 浏览器通知 + 导出/导入 + 统计面板                          | ✅   |
| 7. 测试与优化       | 构建验证通过                                               | ✅   |

---

## 十一、依赖清单

| 包名         | 用途                   | 体积         |
| ------------ | ---------------------- | ------------ |
| `ts-fsrs`    | FSRS 调度算法核心      | ~15KB gzip   |
| `idb-keyval` | IndexedDB Promise 封装 | ~600B brotli |
| `nanoid`     | ID 生成（仅构建脚本）  | 不进入运行时 |
