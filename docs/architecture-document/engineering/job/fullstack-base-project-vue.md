# 前端全栈万金油基座项目（Vue 3 版）

> **版本**: 1.0  
> **最后更新**: 2026-07-21  
> **适用对象**: 前端开发者、全栈工程师、团队技术负责人  
> **定位**: 一站式基座项目参考手册 —— 架构蓝图 + 功能清单 + 选型决策，微调即用  
> **技术主线**: NestJS + Vue 3 + Nuxt 4（Vue 全家桶）

---

## 📑 目录

- [一、项目定位与设计目标](#一项目定位与设计目标)
- [二、技术选型与决策](#二技术选型与决策)
- [三、Monorepo 目录结构](#三monorepo-目录结构)
- [四、服务端架构（NestJS）](#四服务端架构nestjs)
- [五、管理后台架构（Vue 3）](#五管理后台架构vue-3)
- [六、用户端架构（Nuxt 4）](#六用户端架构nuxt-4)
- [七、共享包设计（packages）](#七共享包设计packages)
- [八、权限系统设计](#八权限系统设计)
- [九、CRUD 通用模板](#九crud-通用模板)
- [十、数据可视化](#十数据可视化)
- [十一、通用能力模块](#十一通用能力模块)
- [十二、工程化基础设施](#十二工程化基础设施)
- [十三、Docker 部署方案](#十三docker-部署方案)
- [十四、50+ 页面路由规划](#十四50-页面路由规划)
- [十五、快速微调指南](#十五快速微调指南)

---

## 一、项目定位与设计目标

### 1.1 什么是"万金油基座"

一个**开箱即用的全栈项目骨架**，覆盖 80% 中后台 + C 端场景的通用能力，新项目只需：

```
克隆基座 → 替换业务模块 → 调整路由/菜单 → 微调 UI → 上线
```

### 1.2 设计目标

| 目标 | 说明 |
|------|------|
| 微调即用 | 新项目 1 天内跑通核心链路 |
| 模块可插拔 | 不需要的能力一键移除，不留死代码 |
| 约定优于配置 | 统一目录/命名/分层规范，降低心智负担 |
| 前后端一体 | 接口类型共享，减少联调成本 |
| 生产就绪 | Docker 部署、日志、监控、安全开箱可用 |
| Vue 全家桶 | 管理后台 + 用户端统一 Vue 生态，最大化复用 |

### 1.3 适用场景

- 企业中后台管理系统（50+ 页面）
- SaaS 管理平台
- 带 C 端用户界面的全栈产品
- 外包/私活快速交付
- Vue 技术栈团队的全栈项目

---

## 二、技术选型与决策

### 2.1 核心技术栈

| 层 | 技术 | 版本 | 选型理由 |
|----|------|------|----------|
| 服务端 | NestJS | 11.x | 模块化 DI 架构，企业级最佳实践，TypeScript 原生 |
| ORM | Prisma | 7.x | 类型安全、迁移管理、多数据库支持 |
| 数据库 | PostgreSQL | 18+ | JSONB、全文搜索、扩展生态强 |
| 缓存 | Redis | 8+ | 会话/缓存/队列/限流 |
| 管理后台 | Vue 3 | 3.6+ | Composition API、SFC、国内生态最强 |
| 用户端 | Nuxt 4 | 4.x | SSR/SSG/ISR、文件路由、Auto Import |
| UI 库(Admin) | Ant Design Vue | 4.x | 企业组件丰富、设计语言统一、TS 友好 |
| 状态管理 | Pinia | 3.x | Vue 官方推荐、轻量、TS 原生支持 |
| 数据请求 | TanStack Query (Vue) + Axios | - | 服务端状态缓存 + 请求封装 |
| 构建工具 | Vite 8 (Admin) / Nuxt 内置 (Web) | - | 极速 HMR |
| Monorepo | pnpm workspace + Turborepo | - | 任务编排、缓存加速 |
| 部署 | Docker Compose + Nginx | - | 一键部署、环境一致 |

### 2.2 关键选型对比

#### NestJS vs Express vs Fastify（服务端框架）

| 维度 | NestJS | Express | Fastify |
|------|--------|---------|---------|
| 架构约束 | 强（模块/控制器/服务分层） | 无 | 无 |
| DI 容器 | 内置 | 无 | 插件 |
| TypeScript | 原生 | 需配置 | 需配置 |
| 学习曲线 | 中高 | 低 | 低 |
| 大团队协作 | ✅ 强约束统一风格 | ❌ 各写各的 | ❌ 同左 |
| 生态（Guard/Pipe/Interceptor） | 丰富 | 中间件 | 插件 |

**结论**: 50+ 页面的中后台项目，NestJS 的强约束 = 团队协作效率。

#### Vue 3 vs React 19（管理后台）

| 维度 | Vue 3 | React 19 |
|------|-------|----------|
| 学习曲线 | 低（SFC 模板直观） | 中（JSX + Hooks 心智） |
| 国内生态 | 最强（Element/AntDV/Naive） | 强 |
| 招聘市场（国内） | 最广 | 广 |
| 官方工具链 | 完整（Router/Pinia/VueUse） | 需社区组合 |
| TypeScript | 优秀（defineProps 类型推导） | 优秀 |
| 与 Nuxt 复用 | ✅ 同生态同组件 | ❌ 跨生态 |
| 性能 | 编译时优化、细粒度响应式 | 需手动 memo |

**结论**: 用户端用 Nuxt 4，管理后台用 Vue 3 = 组件/Composable/类型/工具链全面复用。

#### Ant Design Vue vs Element Plus vs Naive UI（UI 库）

| 维度 | Ant Design Vue | Element Plus | Naive UI |
|------|---------------|--------------|----------|
| 组件数量 | 70+ | 70+ | 90+ |
| 设计风格 | 企业严谨 | 简洁通用 | 现代轻量 |
| TypeScript | 完善 | 完善 | 原生 TS 编写 |
| 主题定制 | Design Token | CSS 变量 | CSS-in-JS |
| 表格/表单复杂度 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 社区/文档 | 大 | 最大（国内） | 中 |
| 与 React 版统一 | ✅ 同设计语言 | ❌ | ❌ |

**结论**: Ant Design Vue 与 React 版 Ant Design 设计语言一致，团队跨栈无成本。

#### Prisma vs TypeORM vs Drizzle（ORM）

| 维度 | Prisma | TypeORM | Drizzle |
|------|--------|---------|---------|
| 类型安全 | ⭐⭐⭐ 自动生成 | ⭐⭐ 装饰器 | ⭐⭐⭐ |
| 迁移管理 | 内置 CLI | 内置 | 内置 |
| 性能 | 中（Rust 引擎） | 中 | 高（薄封装） |
| 学习成本 | 低（DSL 简洁） | 中 | 中 |
| NestJS 集成 | 官方模块 | 官方模块 | 社区 |

**结论**: Prisma 的 Schema DSL + 自动生成类型 = 前后端类型共享的最短路径。

#### Nuxt 4 vs Next.js（用户端 SSR 框架）

| 维度 | Nuxt 4 | Next.js |
|------|--------|---------|
| 生态归属 | Vue | React |
| 与 Admin 复用 | ✅ 同生态 | ❌ 跨生态 |
| 文件路由 | ✅ 内置 | ✅ 内置 |
| SSR/SSG/ISR | 全支持 | 全支持 |
| Auto Import | ✅ 组件/Composable 零导入 | ❌ |
| 服务端能力 | Nitro 引擎（API Routes） | API Routes |
| 部署 | Node / Docker / Edge | Vercel / Docker |

**结论**: 管理后台已选 Vue 3，用户端用 Nuxt 4 实现全栈 Vue 化，共享组件和逻辑。

---

## 三、Monorepo 目录结构

```
fullstack-base-vue/
├── apps/
│   ├── server/                    # NestJS 服务端
│   │   ├── src/
│   │   │   ├── modules/           # 业务模块（按领域拆分）
│   │   │   │   ├── auth/
│   │   │   │   ├── user/
│   │   │   │   ├── role/
│   │   │   │   ├── menu/
│   │   │   │   ├── ...
│   │   │   │   └── audit-log/
│   │   │   ├── common/            # 通用：守卫/拦截器/管道/装饰器
│   │   │   ├── config/            # 配置模块
│   │   │   ├── prisma/            # Prisma 服务封装
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── admin/                     # Vue 3 管理后台
│   │   ├── src/
│   │   │   ├── views/             # 路由页面（50+）
│   │   │   ├── components/        # 通用组件
│   │   │   ├── layouts/           # 布局组件
│   │   │   ├── stores/            # Pinia 状态
│   │   │   ├── composables/       # 通用 Composables
│   │   │   ├── services/          # API 请求层
│   │   │   ├── utils/             # 工具函数
│   │   │   ├── router/            # 路由配置 + 动态路由
│   │   │   ├── i18n/              # 国际化
│   │   │   ├── directives/        # 自定义指令（权限等）
│   │   │   └── styles/            # 全局样式
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                       # Nuxt 4 用户端
│       ├── pages/                 # 文件路由
│       ├── components/
│       ├── composables/
│       ├── layouts/
│       ├── server/                # Nitro API Routes (BFF)
│       ├── plugins/
│       ├── nuxt.config.ts
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── shared/                    # 前后端共享
│   │   ├── types/                 # API 类型定义（从 Prisma 生成）
│   │   ├── constants/             # 共享常量/枚举
│   │   ├── utils/                 # 通用工具函数
│   │   └── validation/            # Zod Schema（前后端复用校验）
│   ├── ui/                        # 共享 Vue 组件（Admin + Web 复用）
│   ├── composables/               # 共享 Composables
│   ├── eslint-config/             # 统一 ESLint 配置
│   ├── tsconfig/                  # 统一 TS 配置
│   └── docker/                    # Docker 相关配置
│       ├── docker-compose.yml
│       ├── docker-compose.dev.yml
│       └── nginx/
│           ├── admin.conf
│           └── web.conf
│
├── turbo.json                     # Turborepo 任务编排
├── pnpm-workspace.yaml
├── package.json
├── .env.example
├── .husky/                        # Git Hooks
├── commitlint.config.js
└── README.md
```

### 3.1 pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 3.2 turbo.json 核心任务

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".nuxt/**", ".output/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

---

## 四、服务端架构（NestJS）

### 4.1 分层架构

```
Controller (路由/参数校验)
    ↓
Service (业务逻辑)
    ↓
Repository / Prisma (数据访问)
    ↓
Database (PostgreSQL + Redis)
```

### 4.2 模块划分（按领域）

| 模块 | 职责 | 核心接口 |
|------|------|----------|
| auth | 登录/注册/Token/刷新 | POST /auth/login, /auth/refresh |
| user | 用户 CRUD/个人信息 | /users/* |
| role | 角色管理 | /roles/* |
| menu | 菜单/权限树 | /menus/*, /menus/tree |
| dept | 部门/组织架构 | /depts/* |
| dict | 数据字典 | /dicts/* |
| file | 文件上传/管理 | POST /files/upload |
| notification | 站内信/消息推送 | /notifications/* |
| audit-log | 操作日志 | /audit-logs |
| monitor | 系统监控/在线用户 | /monitor/* |
| job | 定时任务管理 | /jobs/* |
| config | 系统配置 | /configs/* |

### 4.3 通用能力封装

```typescript
// 统一响应格式
interface ApiResponse<T> {
  code: number        // 业务状态码
  message: string
  data: T
  timestamp: number
}

// 分页响应
interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 通用查询 DTO
class QueryDto {
  page?: number = 1
  pageSize?: number = 20
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  keyword?: string
  [key: string]: any  // 动态筛选字段
}
```

### 4.4 全局中间件链

```
Request → CORS → Helmet → RateLimit → JWT Guard → Roles Guard
    → ValidationPipe → Interceptor(日志/缓存) → Controller
    → ExceptionFilter(统一错误) → Response
```

---

## 五、管理后台架构（Vue 3）

### 5.1 技术组合

| 能力 | 方案 |
|------|------|
| 框架 | Vue 3.6+ (Composition API + `<script setup>`) |
| 路由 | Vue Router 5 (动态路由 + 路由守卫) |
| 状态 | Pinia (客户端) + TanStack Query Vue (服务端) |
| UI | Ant Design Vue 4 + Tailwind CSS |
| 表单 | Ant Design Vue Form + Zod 校验 |
| 表格 | Ant Design Vue Table (ProTable 封装) |
| 图表 | ECharts 6 + vue-echarts |
| 请求 | Axios + TanStack Query Vue |
| 国际化 | vue-i18n 11 |
| 图标 | @ant-design/icons-vue |
| 工具 | VueUse |
| 构建 | Vite 8 |
| CSS 方案 | Tailwind CSS 4 + Less (AntDV 主题) |

### 5.2 目录约定

```
src/views/
├── dashboard/              # 首页仪表盘
│   ├── index.vue
│   └── components/
├── system/                 # 系统管理
│   ├── user/              # 用户管理
│   │   ├── index.vue      # 列表页
│   │   ├── detail.vue     # 详情页
│   │   └── components/    # 页面私有组件
│   ├── role/
│   ├── menu/
│   ├── dept/
│   ├── dict/
│   └── config/
├── monitor/                # 系统监控
│   ├── online-user/
│   ├── job/
│   └── server-status/
├── audit/                  # 审计日志
│   ├── operation-log/
│   └── login-log/
├── notification/           # 消息中心
├── file/                   # 文件管理
└── [业务模块]/             # 按项目扩展
```

### 5.3 动态路由机制

```typescript
// router/dynamic.ts
// 后端返回菜单树 → 前端动态生成路由
interface MenuVO {
  id: string
  parentId: string | null
  name: string            // 路由 name
  path: string            // 路由 path
  component: string       // 组件路径 (懒加载)
  icon?: string
  permission?: string     // 按钮权限标识
  type: 'directory' | 'menu' | 'button'
  sort: number
  visible: boolean
}

// 视图组件懒加载映射
const viewModules = import.meta.glob('../views/**/*.vue')

function generateRoutes(menus: MenuVO[]): RouteRecordRaw[] {
  // 递归将菜单树转为 Vue Router 路由配置
  return menus
    .filter(m => m.type !== 'button')
    .map(menu => ({
      path: menu.path,
      name: menu.name,
      component: viewModules[`../views/${menu.component}.vue`],
      meta: { title: menu.name, icon: menu.icon, permission: menu.permission },
      children: menu.children ? generateRoutes(menu.children) : [],
    }))
}

// 路由守卫
router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.token) return '/login'
  if (!authStore.routesLoaded) {
    const menus = await authStore.fetchMenus()
    const routes = generateRoutes(menus)
    routes.forEach(r => router.addRoute('Layout', r))
  }
})
```

### 5.4 布局结构

```
┌──────────────────────────────────────────────────┐
│  Header: Logo | 面包屑 | 搜索 | 通知 | 用户头像   │
├────────┬─────────────────────────────────────────┤
│        │                                         │
│  Side  │         <router-view /> (路由出口)       │
│  Menu  │                                         │
│        │                                         │
│  可折叠 │                                         │
│        │                                         │
├────────┴─────────────────────────────────────────┤
│  Footer: 版权信息                                 │
└──────────────────────────────────────────────────┘
```

### 5.5 核心 Composables

```typescript
// composables/usePermission.ts
export function usePermission() {
  const authStore = useAuthStore()
  const has = (code: string) => authStore.permissions.includes(code)
  const hasAny = (codes: string[]) => codes.some(c => authStore.permissions.includes(c))
  const hasAll = (codes: string[]) => codes.every(c => authStore.permissions.includes(c))
  return { has, hasAny, hasAll }
}

// composables/useTable.ts — 通用表格逻辑
export function useTable<T>(queryFn: (params: any) => Promise<PaginatedResponse<T>>) {
  const loading = ref(false)
  const dataSource = ref<T[]>([])
  const pagination = reactive({ current: 1, pageSize: 20, total: 0 })
  const searchParams = ref<Record<string, any>>({})

  async function fetchData() {
    loading.value = true
    try {
      const res = await queryFn({ ...searchParams.value, ...pagination })
      dataSource.value = res.list
      pagination.total = res.total
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchData)
  return { loading, dataSource, pagination, searchParams, fetchData }
}

// composables/useCrud.ts — 增删改查一体
export function useCrud<T>(api: CrudApi<T>) {
  const { fetchData, ...table } = useTable(api.list)
  const modalVisible = ref(false)
  const editingRecord = ref<T | null>(null)

  const handleCreate = () => { editingRecord.value = null; modalVisible.value = true }
  const handleEdit = (record: T) => { editingRecord.value = record; modalVisible.value = true }
  const handleDelete = async (id: string) => {
    await api.remove(id)
    message.success('删除成功')
    fetchData()
  }

  return { ...table, modalVisible, editingRecord, handleCreate, handleEdit, handleDelete }
}
```

### 5.6 自定义指令（按钮权限）

```typescript
// directives/permission.ts
import type { Directive } from 'vue'

export const vPermission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const authStore = useAuthStore()
    const codes = Array.isArray(binding.value) ? binding.value : [binding.value]
    const hasPermission = codes.some(c => authStore.permissions.includes(c))
    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  }
}

// 使用
// <a-button v-permission="'system:user:add'">新增</a-button>
// <a-button v-permission="['system:user:edit', 'system:user:delete']">操作</a-button>
```

---

## 六、用户端架构（Nuxt 4）

### 6.1 目录结构（文件路由）

```
apps/web/
├── pages/
│   ├── index.vue              # 首页
│   ├── pricing.vue            # 定价页
│   ├── about.vue              # 关于
│   ├── login.vue              # 登录
│   ├── register.vue           # 注册
│   └── dashboard/             # 用户中心（需登录）
│       ├── index.vue          # 概览
│       ├── settings.vue       # 设置
│       └── subscription.vue   # 订阅
├── layouts/
│   ├── default.vue            # 默认布局（导航+页脚）
│   ├── auth.vue               # 认证页布局（居中卡片）
│   └── dashboard.vue          # 用户中心布局（侧边栏）
├── components/
│   ├── AppHeader.vue
│   ├── AppFooter.vue
│   └── ...
├── composables/
│   ├── useAuth.ts
│   └── useApi.ts
├── server/                    # Nitro API Routes (BFF 层)
│   ├── api/
│   │   └── [...].ts
│   └── middleware/
├── plugins/
│   └── api-client.ts
├── middleware/
│   └── auth.global.ts        # 全局路由守卫
├── nuxt.config.ts
└── package.json
```

### 6.2 nuxt.config.ts 核心配置

```typescript
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3000',
    },
  },
  ssr: true,
  app: {
    head: {
      title: 'Base App',
      meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width' }],
    },
  },
})
```

### 6.3 与管理后台的复用策略

| 复用层 | 方式 |
|--------|------|
| 类型定义 | `packages/shared` 统一导出 |
| 校验逻辑 | Zod Schema 共享 |
| 工具函数 | `packages/shared/utils` |
| UI 组件 | `packages/ui`（Vue 组件，Admin + Web 共用） |
| Composables | `packages/composables`（useAuth、usePagination 等） |
| API 客户端 | 共享 Axios 封装 + 类型 |
| 国际化资源 | `packages/shared/i18n` 共享翻译文件 |

---

## 七、共享包设计（packages）

### 7.1 @base/shared

```typescript
// packages/shared/src/types/api.ts
// 从 Prisma Schema 自动生成的类型 + 手写 VO/DTO

// packages/shared/src/validation/user.ts
import { z } from 'zod'

export const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  roleIds: z.array(z.string()).min(1),
})

export type CreateUserDto = z.infer<typeof createUserSchema>
```

### 7.2 @base/ui（共享 Vue 组件）

```
packages/ui/
├── src/
│   ├── BaseButton.vue
│   ├── BaseModal.vue
│   ├── BaseTable.vue
│   ├── SearchForm.vue
│   ├── PageContainer.vue
│   └── index.ts
└── package.json
```

### 7.3 @base/composables

```typescript
// packages/composables/src/usePagination.ts
export function usePagination(fetchFn: (params: any) => Promise<any>) {
  const page = ref(1)
  const pageSize = ref(20)
  const total = ref(0)
  // Admin (Vue Router) 和 Web (Nuxt) 均可使用
}

// packages/composables/src/useAuth.ts
export function useAuth() {
  const token = ref<string | null>(null)
  const user = ref<UserVO | null>(null)
  // 共享认证逻辑
}
```

### 7.4 @base/eslint-config & @base/tsconfig

```
packages/tsconfig/
├── base.json          # 公共配置
├── nestjs.json        # 服务端（decorators、emitDecoratorMetadata）
├── vue.json           # 管理后台（vue-tsc、jsx preserve）
└── nuxt.json          # 用户端（extends .nuxt/tsconfig.json）
```

---

## 八、权限系统设计

### 8.1 RBAC 模型

```
┌──────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ User │──N:M──│   Role   │──N:M──│ Permission│──1:N──│  Menu    │
└──────┘     └──────────┘     └──────────┘     └──────────┘
                                                     │
                                              ┌──────┴──────┐
                                              │ directory   │
                                              │ menu        │
                                              │ button      │
                                              └─────────────┘
```

### 8.2 Prisma Schema 核心

```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String   @unique
  password  String
  status    UserStatus @default(ACTIVE)
  roles     UserRole[]
  createdAt DateTime @default(now())
}

model Role {
  id          String   @id @default(cuid())
  code        String   @unique   // admin, editor, viewer
  name        String
  description String?
  users       UserRole[]
  permissions RolePermission[]
}

model Menu {
  id         String   @id @default(cuid())
  parentId   String?
  parent     Menu?    @relation("MenuTree", fields: [parentId], references: [id])
  children   Menu[]   @relation("MenuTree")
  name       String
  path       String?
  component  String?
  icon       String?
  type       MenuType  // DIRECTORY | MENU | BUTTON
  permission String?   // "system:user:add"
  sort       Int      @default(0)
  visible    Boolean  @default(true)
}
```

### 8.3 前端权限控制（Vue 3）

```vue
<!-- 路由级：动态路由只注册有权限的页面 -->
<!-- 按钮级：自定义指令 + Composable 双保险 -->

<template>
  <!-- 方式一：指令 -->
  <a-button v-permission="'system:user:add'" type="primary">新增用户</a-button>

  <!-- 方式二：组件包裹 -->
  <AuthGuard :codes="['system:user:delete']">
    <a-button danger>删除</a-button>
  </AuthGuard>

  <!-- 方式三：Composable -->
  <a-button v-if="has('system:user:edit')" @click="handleEdit">编辑</a-button>
</template>

<script setup lang="ts">
const { has } = usePermission()
</script>
```

---

## 九、CRUD 通用模板

### 9.1 服务端通用 CRUD 基类

```typescript
// 泛型 Service 基类
abstract class BaseCrudService<T, CreateDto, UpdateDto, QueryDto> {
  abstract get model(): PrismaDelegate<T>

  async findAll(query: QueryDto): Promise<PaginatedResponse<T>> { /* ... */ }
  async findOne(id: string): Promise<T> { /* ... */ }
  async create(dto: CreateDto): Promise<T> { /* ... */ }
  async update(id: string, dto: UpdateDto): Promise<T> { /* ... */ }
  async remove(id: string): Promise<void> { /* ... */ }
  async batchRemove(ids: string[]): Promise<void> { /* ... */ }
}
```

### 9.2 前端 CRUD 页面模板（Vue SFC）

```vue
<!-- views/system/user/index.vue -->
<template>
  <PageContainer title="用户管理">
    <!-- 搜索栏 -->
    <SearchForm :fields="searchFields" @search="handleSearch" @reset="handleReset" />

    <!-- 操作栏 -->
    <div class="mb-4 flex gap-2">
      <a-button v-permission="'system:user:add'" type="primary" @click="handleCreate">
        新增
      </a-button>
      <a-button v-permission="'system:user:delete'" danger :disabled="!selectedIds.length"
        @click="handleBatchDelete">
        批量删除
      </a-button>
      <a-button @click="handleExport">导出</a-button>
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="pagination"
      :row-selection="{ selectedRowKeys: selectedIds, onChange: onSelectChange }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a v-permission="'system:user:edit'" @click="handleEdit(record)">编辑</a>
            <a-popconfirm title="确认删除?" @confirm="handleDelete(record.id)">
              <a v-permission="'system:user:delete'" class="text-red-500">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑弹窗 -->
    <UserFormModal
      v-model:open="modalVisible"
      :record="editingRecord"
      @success="fetchData"
    />
  </PageContainer>
</template>

<script setup lang="ts">
const { dataSource, loading, pagination, fetchData, searchParams } = useTable(getUserList)
const { modalVisible, editingRecord, handleCreate, handleEdit, handleDelete } = useCrud(userApi)
const selectedIds = ref<string[]>([])
</script>
```

### 9.3 代码生成器（可选）

```bash
# CLI 一键生成 CRUD 全套
pnpm gen:crud user --fields "name:string,email:string,age:number,status:enum"

# 输出：
# apps/server/src/modules/user/  (controller, service, dto)
# apps/admin/src/views/system/user/  (index.vue, form-modal.vue, detail.vue)
# prisma/schema.prisma  (追加 model)
```

---

## 十、数据可视化

### 10.1 Dashboard 布局

```
┌─────────────────────────────────────────────────────────┐
│  统计卡片行: [用户总数] [今日访问] [订单量] [收入]        │
├────────────────────────────┬────────────────────────────┤
│  折线图: 访问趋势          │  饼图: 用户来源分布         │
├────────────────────────────┼────────────────────────────┤
│  柱状图: 各模块使用量      │  排行: 热门内容 TOP10       │
└────────────────────────────┴────────────────────────────┘
```

### 10.2 图表封装（vue-echarts）

```vue
<!-- components/ChartCard.vue -->
<template>
  <a-card :title="title" :loading="loading">
    <v-chart :option="option" :style="{ height: height + 'px' }" autoresize />
  </a-card>
</template>

<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

defineProps<{ title: string; option: any; loading?: boolean; height?: number }>()
</script>

<!-- 使用 -->
<ChartCard title="访问趋势" :option="lineOption" :loading="isLoading" :height="300" />
```

---

## 十一、通用能力模块

### 11.1 文件/存储服务

| 能力 | 实现 |
|------|------|
| 本地存储 | NestJS Multer + 静态目录 |
| 对象存储 | S3 / 阿里云 OSS / MinIO（自建） |
| 图片处理 | Sharp（缩略图/水印/WebP 转换） |
| 上传方式 | 直传（前端→OSS）/ 中转（前端→Server→OSS） |
| 上传组件 | Ant Design Vue Upload 二次封装（拖拽/裁剪/进度） |
| 文件管理 | 文件列表/分类/搜索/回收站 |

### 11.2 实时通信/消息

```typescript
// WebSocket Gateway (NestJS)
@WebSocketGateway({ cors: true, namespace: '/ws' })
export class NotificationGateway {
  @SubscribeMessage('join')
  handleJoin(client: Socket, room: string) {
    client.join(room)
  }

  pushToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data)
  }
}
```

```typescript
// 前端 Composable (Admin + Web 共享)
// packages/composables/src/useWebSocket.ts
export function useWebSocket(url: string) {
  const { data, status, open, close, send } = useWebSocket(url, {
    autoReconnect: true,
    heartbeat: { interval: 30000 },
  })
  return { data, status, open, close, send }
}
```

**通知类型**: 系统公告、@提及、审批提醒、数据告警

### 11.3 国际化 (i18n)

```
packages/shared/src/i18n/
├── zh-CN/
│   ├── common.json      # 通用：确定/取消/搜索/导出...
│   ├── system.json      # 系统管理模块
│   └── ...
├── en-US/
│   └── ...
└── index.ts
```

- 管理后台: vue-i18n 11
- 用户端: @nuxtjs/i18n（基于 vue-i18n）
- 服务端错误消息: 根据 Accept-Language 返回
- Ant Design Vue: ConfigProvider locale 切换

### 11.4 审计日志

```typescript
// 装饰器自动记录操作日志
@AuditLog({ module: '用户管理', action: '新增用户' })
@Post()
create(@Body() dto: CreateUserDto) { /* ... */ }

// 日志内容
interface AuditLog {
  id: string
  userId: string
  username: string
  module: string
  action: string
  method: string
  url: string
  ip: string
  userAgent: string
  requestBody?: string
  responseBody?: string
  status: number
  duration: number
  createdAt: DateTime
}
```

---

## 十二、工程化基础设施

### 12.1 代码规范全套

| 工具 | 作用 |
|------|------|
| ESLint 9 (flat config) + eslint-plugin-vue | 代码质量检查 |
| Prettier | 代码格式化 |
| Husky | Git Hooks 管理 |
| lint-staged | 暂存区增量检查 |
| commitlint | 提交信息规范（Conventional Commits） |
| TypeScript strict + vue-tsc | 类型安全 |

### 12.2 Git 提交规范

```
feat: 新功能
fix: 修复 Bug
docs: 文档变更
style: 格式调整
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建/工具变更
```

### 12.3 环境变量管理

```bash
# .env.example
DATABASE_URL=postgresql://user:pass@localhost:5432/base_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
OSS_ENDPOINT=
OSS_BUCKET=
OSS_ACCESS_KEY=
OSS_SECRET_KEY=
```

### 12.4 脚本命令

```json
{
  "scripts": {
    "dev": "turbo dev",
    "dev:server": "turbo dev --filter=server",
    "dev:admin": "turbo dev --filter=admin",
    "dev:web": "turbo dev --filter=web",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "type-check": "turbo type-check",
    "db:migrate": "turbo db:migrate --filter=server",
    "db:seed": "turbo db:seed --filter=server",
    "db:studio": "pnpm --filter=server prisma studio",
    "docker:up": "docker compose -f packages/docker/docker-compose.yml up -d",
    "docker:down": "docker compose -f packages/docker/docker-compose.yml down"
  }
}
```

---

## 十三、Docker 部署方案

### 13.1 服务编排

```yaml
# packages/docker/docker-compose.yml
services:
  postgres:
    image: postgres:18-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: base_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}

  redis:
    image: redis:8-alpine
    command: redis-server --requirepass ${REDIS_PASS}

  server:
    build: ../../apps/server
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASS}@postgres:5432/base_db
      REDIS_URL: redis://:${REDIS_PASS}@redis:6379

  admin:
    build: ../../apps/admin
    # Nginx 托管静态文件

  web:
    build: ../../apps/web
    # Nuxt 4 Nitro 服务器模式

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/admin.conf:/etc/nginx/conf.d/admin.conf
      - ./nginx/web.conf:/etc/nginx/conf.d/web.conf
    depends_on: [server, admin, web]

volumes:
  pgdata:
```

### 13.2 Nginx 路由

```
域名/
├── /api/*          → server:3000 (NestJS)
├── /admin/*        → admin 静态文件 (Vue build)
├── /ws/*           → server:3000 (WebSocket)
└── /*              → web:3001 (Nuxt 4 SSR)
```

### 13.3 多阶段构建示例（Admin）

```dockerfile
# apps/admin/Dockerfile
FROM node:24-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/ ./packages/
COPY apps/admin/ ./apps/admin/
RUN pnpm install --frozen-lockfile --filter=admin...
RUN pnpm --filter=admin build

FROM nginx:alpine
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 13.4 Nuxt 4 构建（Web）

```dockerfile
# apps/web/Dockerfile
FROM node:24-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/
RUN pnpm install --frozen-lockfile --filter=web...
RUN pnpm --filter=web build

FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/apps/web/.output ./.output
ENV HOST=0.0.0.0 PORT=3001
EXPOSE 3001
CMD ["node", ".output/server/index.mjs"]
```

---

## 十四、50+ 页面路由规划

### 14.1 路由总览

| 分组 | 页面 | 数量 |
|------|------|------|
| **仪表盘** | 数据概览、工作台、分析页 | 3 |
| **系统管理** | 用户、角色、菜单、部门、字典、参数配置、公告 | 7 |
| **权限管理** | 权限列表、数据权限、权限分配 | 3 |
| **监控中心** | 在线用户、定时任务、服务监控、缓存监控、操作日志、登录日志 | 6 |
| **内容管理** | 文章、分类、标签、评论、媒体库 | 5 |
| **订单/交易** | 订单列表、订单详情、退款管理、支付记录 | 4 |
| **用户运营** | 会员列表、会员详情、积分管理、签到配置、消息推送 | 5 |
| **营销中心** | 优惠券、活动管理、秒杀、拼团、分销 | 5 |
| **数据分析** | 用户分析、行为分析、转化漏斗、留存分析、自定义报表 | 5 |
| **文件管理** | 文件列表、回收站、存储配置 | 3 |
| **通知中心** | 站内信、通知模板、推送记录 | 3 |
| **审批/工作流** | 发起审批、待我审批、审批记录、流程配置 | 4 |
| **个人中心** | 基本信息、安全设置、操作日志、消息偏好 | 4 |
| **其他** | 登录、注册、403、404、500、关于 | 6 |
| **合计** | | **~63** |

### 14.2 路由配置示例（Vue Router）

```typescript
// router/routes/modules/system.ts
export default {
  path: '/system',
  name: 'System',
  component: () => import('@/layouts/BlankLayout.vue'),
  meta: { title: '系统管理', icon: 'SettingOutlined' },
  children: [
    { path: 'user', name: 'SystemUser', component: () => import('@/views/system/user/index.vue'), meta: { title: '用户管理' } },
    { path: 'role', name: 'SystemRole', component: () => import('@/views/system/role/index.vue'), meta: { title: '角色管理' } },
    { path: 'menu', name: 'SystemMenu', component: () => import('@/views/system/menu/index.vue'), meta: { title: '菜单管理' } },
    { path: 'dept', name: 'SystemDept', component: () => import('@/views/system/dept/index.vue'), meta: { title: '部门管理' } },
    { path: 'dict', name: 'SystemDict', component: () => import('@/views/system/dict/index.vue'), meta: { title: '字典管理' } },
    { path: 'config', name: 'SystemConfig', component: () => import('@/views/system/config/index.vue'), meta: { title: '参数配置' } },
    { path: 'notice', name: 'SystemNotice', component: () => import('@/views/system/notice/index.vue'), meta: { title: '公告管理' } },
  ],
} satisfies RouteRecordRaw
```

---

## 十五、快速微调指南

### 15.1 新项目启动流程

```bash
# 1. 克隆基座
git clone <base-repo> my-project && cd my-project

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env  # 修改数据库/Redis/OSS 等配置

# 4. 初始化数据库
pnpm db:migrate && pnpm db:seed

# 5. 启动开发
pnpm dev  # 同时启动 server + admin + web

# 6. 替换业务模块
# - 修改 prisma/schema.prisma 添加业务表
# - 在 apps/server/src/modules/ 添加业务模块
# - 在 apps/admin/src/views/ 添加业务页面
# - 配置菜单/路由/权限
```

### 15.2 模块插拔清单

| 模块 | 移除方式 | 影响范围 |
|------|----------|----------|
| 审计日志 | 删除 audit-log 模块 + 装饰器 | 低 |
| 国际化 | 移除 i18n 目录，硬编码中文 | 中 |
| WebSocket | 删除 gateway + 前端 composable | 低 |
| 数据可视化 | 删除 dashboard 图表组件 | 低 |
| 工作流 | 删除 approval 模块 | 低 |
| 文件存储 | 改为纯本地上传 | 低 |
| Nuxt 用户端 | 删除 apps/web，仅保留 admin | 低 |

### 15.3 常见微调场景

| 场景 | 操作 |
|------|------|
| 换 UI 库 (AntDV→Element Plus) | 替换组件引用，调整主题变量 |
| 加新业务模块 | schema 加表 → gen:crud → 配菜单权限 |
| 对接新 OSS | 修改 file 模块 storage adapter |
| 增加审批流 | 引入状态机库，配置流程节点 |
| 切换数据库 | 修改 Prisma provider + 连接串 |
| 只要管理后台 | 删除 apps/web，nginx 去掉 web 代理 |
| 只要用户端 | 删除 apps/admin，nginx 去掉 admin 代理 |

### 15.4 Vue 3 版 vs React 版对照

| 维度 | Vue 3 版（本文） | React 版 |
|------|-----------------|----------|
| 管理后台 | Vue 3 + Ant Design Vue | React 19 + Ant Design / shadcn |
| 用户端 | Nuxt 4 | Next.js |
| 状态管理 | Pinia | Zustand |
| 路由 | Vue Router 5 (动态 addRoute) | React Router (动态路由) |
| 权限指令 | v-permission 自定义指令 | usePermission Hook + 条件渲染 |
| 组件复用 | SFC + Composables | JSX + Hooks |
| 共享 UI | packages/ui (Vue 组件) | packages/ui (React 组件) |
| 服务端 | NestJS（相同） | NestJS（相同） |
| 数据库/ORM | Prisma + PostgreSQL（相同） | Prisma + PostgreSQL（相同） |
| 部署 | Docker Compose（相同） | Docker Compose（相同） |

---

## 总结

```
┌─────────────────────────────────────────────────────────────┐
│              万金油基座项目全景（Vue 3 版）                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐    ┌─────────────┐    ┌──────────────┐        │
│  │ NestJS  │    │   Vue 3     │    │   Nuxt 4     │        │
│  │  Server │◄──►│   Admin     │    │   Web (C端)  │        │
│  └────┬────┘    └──────┬──────┘    └──────┬───────┘        │
│       │                │                   │                │
│       └────────────────┼───────────────────┘                │
│                        ▼                                    │
│         ┌──────────────────────────────┐                    │
│         │  packages/shared + ui +      │                    │
│         │  composables (Vue 生态共享)   │                    │
│         └──────────────────────────────┘                    │
│                        │                                    │
│       ┌────────────────┼────────────────┐                   │
│       ▼                ▼                ▼                   │
│  ┌─────────┐    ┌──────────┐    ┌───────────┐             │
│  │PostgreSQL│    │  Redis   │    │ OSS/MinIO │             │
│  └─────────┘    └──────────┘    └───────────┘             │
│                                                             │
│  工程化: pnpm + Turborepo + ESLint + Husky + Docker         │
└─────────────────────────────────────────────────────────────┘
```

> **核心原则**: 基座提供 80% 通用能力，业务只需关注 20% 差异化逻辑。Vue 全家桶让 Admin 和 Web 的组件、Composables、类型、工具链全面复用，团队只需掌握一套技术栈。
