# 抗遗忘复习系统 — AI 快速认知文档

> 本文档供 AI 助手快速理解「抗遗忘复习清单系统」的完整设计与实现细节。
> **状态：已实现 ✅**（全部 Phase 已完成，构建验证通过）
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

| 领域       | 方案                       | 说明                                                                  |
| ---------- | -------------------------- | --------------------------------------------------------------------- |
| 调度算法   | **ts-fsrs**                | Free Spaced Repetition Scheduler，Anki 新一代算法，~15KB gzip         |
| 降级方案   | 固定艾宾浩斯间隔           | 5min→30min→12h→1d→2d→4d→7d→15d，作为「经典模式」可选项                |
| 持久化     | **idb-keyval** (IndexedDB) | 全部工具统一使用 IDB，DB 名 `smart-code-tool`，Store 名 `quick-tools` |
| 文档 ID    | **24 字符 nanoid**         | 稳定锚点，四工具统一 docId 优先匹配                                   |
| 文档清单   | `doc-list.json`            | 构建时从 sidebar 生成，运行时由 docRegistry 加载并注入 mapper         |
| URL 规范化 | `stripBase()`              | 剥离域名 + VitePress base 前缀 + .html 后缀，统一为 doc-list 格式     |
| URL 存储   | `useCurrentPage`           | 返回 stripBase 规范化后的路径（与 doc-list 一致）                     |
| 导航跳转   | `navigateTo`               | 路径格式 URL 加回 base 前缀后走 router.go()                           |

---

## 三、架构分层

```
Layout.vue (全局挂载 useAutoLearn)
  ↓ 累计 ≥ 10min 自动注册
QuickTools.vue (面板入口 + navigateTo 导航)
  └── ReviewTab.vue (五子视图)
        ├── 今日待复习    → 到期文档评分
        ├── 文档盲区      → 从未打开/从未学习/从未复习
        ├── 全部文档      → 按分组展示复习状态
        ├── 统计面板      → 覆盖率、趋势、遗忘曲线
        └── 设置          → 算法模式、导出/导入
```

### 模块职责

| 模块         | 文件                       | 职责                                                    |
| ------------ | -------------------------- | ------------------------------------------------------- |
| 自动学习感知 | `useAutoLearn.js`          | 页面计时、visibilitychange 事件驱动、10s tick、路由监听 |
| 调度引擎     | `useReviewScheduler.js`    | FSRS / 固定间隔算法封装                                 |
| 文档清单管理 | `useReviewDocRegistry.js`  | 加载 doc-list、注入 mapper、盲区检测、旧记录修复        |
| 持久化层     | `useReviewStorage.js`      | IDB 读写（review 专用键）、内存缓存 + 批量持久化        |
| 统一存储层   | `useQtStorage.js`          | 四工具共用 IDB 存储 + localStorage 一次性迁移           |
| docId 映射器 | `useDocIdMapper.js`        | URL↔docId 映射、stripBase 规范化、旧数据迁移            |
| 页面信息     | `useCurrentPage.js`        | 返回 stripBase 规范化后的 URL（与 doc-list 格式一致）   |
| 业务逻辑     | `useReview.js`             | 组合以上模块，暴露 Vue 响应式 API                       |
| 通知提醒     | `useReviewNotification.js` | 浏览器通知 + visibilitychange 感知定时                  |

---

## 四、文件位置

```
docs/.vitepress/
├── config/sidebar/*.js             ← 叶子节点带 id 字段（24 位 nanoid）
├── config.js                        ← base: '/smart-code-tool/'、favicon 绝对路径
└── theme/components/
    ├── QuickTools.vue               ← 主组件（编排层 + navigateTo 加回 base）
    └── quick-tools/
        ├── composables/
        │   ├── useAutoLearn.js              ← 自动学习感知（10s tick + visibilitychange）
        │   ├── useReview.js                 ← 复习业务逻辑
        │   ├── useReviewScheduler.js        ← FSRS 调度引擎
        │   ├── useReviewStorage.js          ← Review IndexedDB 层
        │   ├── useReviewDocRegistry.js      ← 文档清单管理 + 旧记录修复
        │   ├── useReviewNotification.js     ← 浏览器通知（visibilitychange 感知）
        │   ├── useProgress.js               ← 进度记录（IDB）
        │   ├── useDoubt.js                  ← 疑惑记录（IDB）
        │   ├── useNote.js                   ← 笔记记录（IDB）
        │   └── useCurrentPage.js            ← 页面 URL/标题（stripBase 规范化）
        ├── tabs/
        │   ├── ReviewTab.vue                ← 复习五子视图
        │   ├── ProgressTab.vue
        │   ├── DoubtTab.vue
        │   └── NoteTab.vue
        └── shared/
            ├── constants.js                 ← TICK_INTERVAL=10000、阈值、键名
            ├── utils.js
            ├── useQtStorage.js              ← 统一 IDB 存储层（四工具共用）
            ├── useDocIdMapper.js            ← docId 映射 + stripBase + 迁移
            └── quick-tools.css

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
  url: string // 文档路径（stripBase 规范化后，如 /interview/react/xxx）
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
- **visibilitychange 事件驱动**：页面隐藏时立即停止 timer + 持久化，恢复时重启
- SPA 路由切换时停止旧计时、开始新页面累计
- 同一页面多次进入时间累加（5min + 5min = 10min → 触发）
- 达到阈值后自动写入，不重复触发
- tick 间隔 10 秒（对 600 秒阈值误差可忽略，减少 90% CPU 唤醒）

---

## 十、VitePress 适配要点

### URL 规范化（stripBase）

VitePress 生产环境的运行时 URL 与 doc-list.json 存在三处差异：

| 差异点     | 运行时 URL                              | doc-list.json          |
| ---------- | --------------------------------------- | ---------------------- |
| 域名       | `https://jinnianwushuang.github.io/...` | 无域名                 |
| base 前缀  | `/smart-code-tool/interview/react/xxx`  | `/interview/react/xxx` |
| .html 后缀 | `.../react-compiler.html`               | `.../react-compiler`   |

`stripBase()` 统一处理三者，确保 URL 匹配成功。

### URL 存储与导航

- **存储**：`useCurrentPage` 返回 `stripBase(window.location.pathname)`，与 doc-list 格式一致
- **导航**：`navigateTo` 对路径格式 URL 加回 `import.meta.env.BASE_URL` 前缀后调用 `router.go()`
- **旧数据兼容**：完整 URL（含 https://）在 `navigateTo` 中通过 `new URL()` 提取 pathname 处理

### 四工具统一存储

所有工具（Progress/Doubt/Note/Review）统一使用 IndexedDB：

```
IndexedDB: smart-code-tool / quick-tools
├── qt:progress        ← 进度记录
├── qt:doubts          ← 疑惑记录
├── qt:notes           ← 笔记记录
├── review:records     ← 复习记录
├── review:docSnapshot ← 文档快照
└── review:settings    ← 用户配置
```

旧 localStorage 数据在首次访问时自动迁移到 IDB 并清除旧键。

### doc-list 数据源统一

`useReviewDocRegistry` 加载 doc-list.json 后通过 `injectDocList()` 注入到 `useDocIdMapper`，避免重复 fetch。

---

## 十一、实施阶段

| Phase               | 内容                                                            | 状态 |
| ------------------- | --------------------------------------------------------------- | ---- |
| 1. 文档 ID 基础设施 | inject-sidebar-ids 脚本 + 头部约束注释 + gen-doc-list 脚本      | ✅   |
| 2. 存储与调度引擎   | IndexedDB 持久化层 + FSRS 调度封装                              | ✅   |
| 3. 自动学习感知     | useAutoLearn（10s tick + visibilitychange 事件驱动 + 路由监听） | ✅   |
| 4. 核心复习功能     | docRegistry + useReview 重构 + 数据迁移                         | ✅   |
| 5. UI 重构          | ReviewTab 五子视图 + 面板 80vw + 样式                           | ✅   |
| 6. 增强功能         | 浏览器通知 + 导出/导入 + 统计面板                               | ✅   |
| 7. 测试与优化       | 构建验证通过                                                    | ✅   |
| 8. VitePress 适配   | stripBase URL 规范化 + favicon 修复                             | ✅   |
| 9. 四工具统一升级   | docId 锚定 + localStorage → IndexedDB + 数据源统一              | ✅   |
| 10. 定时器优化      | 10s 间隔 + visibilitychange 事件驱动 + 通知感知可见性           | ✅   |
| 11. URL 一致性修复  | useCurrentPage 用 stripBase + navigateTo 加回 base              | ✅   |

---

## 十二、依赖清单

| 包名         | 用途                   | 体积         |
| ------------ | ---------------------- | ------------ |
| `ts-fsrs`    | FSRS 调度算法核心      | ~15KB gzip   |
| `idb-keyval` | IndexedDB Promise 封装 | ~600B brotli |
| `nanoid`     | ID 生成（仅构建脚本）  | 不进入运行时 |
