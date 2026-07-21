# 前端全栈万金油基座项目

> **版本**: 1.0  
> **最后更新**: 2026-07-21  
> **适用对象**: 前端开发者、全栈工程师、团队技术负责人  
> **定位**: 一站式基座项目参考手册 —— 架构蓝图 + 功能清单 + 选型决策，微调即用
> **技术主线**: NestJS + React 19 + Next.js 16

---

## 📑 目录

- [一、项目定位与设计目标](#一项目定位与设计目标)
- [二、技术选型与决策](#二技术选型与决策)
- [三、Monorepo 目录结构](#三monorepo-目录结构)
- [四、服务端架构（NestJS）](#四服务端架构nestjs)
- [五、管理后台架构（React 19）](#五管理后台架构react-19)
- [六、用户端架构（Next.js）](#六用户端架构nextjs)
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

### 1.3 适用场景

- 企业中后台管理系统（50+ 页面）
- SaaS 管理平台
- 带 C 端用户界面的全栈产品
- 外包/私活快速交付

---

## 二、技术选型与决策

### 2.1 核心技术栈

| 层 | 技术 | 版本 | 选型理由 |
|----|------|------|----------|
| 服务端 | NestJS | 11.x | 模块化 DI 架构，企业级最佳实践，TypeScript 原生 |
| ORM | Prisma | 7.x | 类型安全、迁移管理、多数据库支持 |
| 数据库 | PostgreSQL | 18+ | JSONB、全文搜索、扩展生态强 |
| 缓存 | Redis | 8+ | 会话/缓存/队列/限流 |
| 管理后台 | React 19 | 19.x | Server Components、Actions、最新生态 |
| 用户端 | Next.js | 16.x | SSR/SSG/ISR、App Router、API Routes |
| UI 库(Admin) | Ant Design 6 / shadcn/ui | - | 企业组件丰富 / 高度可定制 |
| 状态管理 | Zustand + TanStack Query | - | 轻量 + 服务端状态分离 |
| 构建工具 | Vite 8 (Admin) / Turbopack (Next) | - | 极速 HMR |
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

#### React 19 vs Vue 3（管理后台）

| 维度 | React 19 | Vue 3 |
|------|----------|-------|
| 生态规模 | 最大 | 大 |
| 企业组件库 | Ant Design / shadcn | Element Plus / Ant Design Vue |
| Server Components | ✅ | ❌ |
| 招聘市场 | 广 | 广（国内偏多） |
| 与 Next.js 复用 | ✅ 同语言同生态 | ❌ |

**结论**: 用户端用 Next.js，管理后台用 React 19 可最大化代码/组件/类型复用。

#### Prisma vs TypeORM vs Drizzle（ORM）

| 维度 | Prisma | TypeORM | Drizzle |
|------|--------|---------|---------|
| 类型安全 | ⭐⭐⭐ 自动生成 | ⭐⭐ 装饰器 | ⭐⭐⭐ |
| 迁移管理 | 内置 CLI | 内置 | 内置 |
| 性能 | 中（Rust 引擎） | 中 | 高（薄封装） |
| 学习成本 | 低（DSL 简洁） | 中 | 中 |
| NestJS 集成 | 官方模块 | 官方模块 | 社区 |

**结论**: Prisma 的 Schema DSL + 自动生成类型 = 前后端类型共享的最短路径。

---

## 三、Monorepo 目录结构

```
fullstack-base/
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
│   ├── admin/                     # React 19 管理后台
│   │   ├── src/
│   │   │   ├── pages/             # 路由页面（50+）
│   │   │   ├── components/        # 通用组件
│   │   │   ├── layouts/           # 布局组件
│   │   │   ├── stores/            # Zustand 状态
│   │   │   ├── hooks/             # 通用 Hooks
│   │   │   ├── services/          # API 请求层
│   │   │   ├── utils/             # 工具函数
│   │   │   ├── router/            # 路由配置 + 动态路由
│   │   │   ├── i18n/              # 国际化
│   │   │   └── styles/            # 全局样式
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                       # Next.js 用户端
│       ├── src/
│       │   ├── app/               # App Router
│       │   ├── components/
│       │   ├── lib/
│       │   └── styles/
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── shared/                    # 前后端共享
│   │   ├── types/                 # API 类型定义（从 Prisma 生成）
│   │   ├── constants/             # 共享常量/枚举
│   │   ├── utils/                 # 通用工具函数
│   │   └── validation/            # Zod Schema（前后端复用校验）
│   ├── ui/                        # 共享 UI 组件（可选）
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
      "outputs": ["dist/**", ".next/**"]
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

## 五、管理后台架构（React 19）

### 5.1 技术组合

| 能力 | 方案 |
|------|------|
| 路由 | React Router 7 (动态路由) |
| 状态 | Zustand (客户端) + TanStack Query (服务端) |
| UI | Ant Design 6 / shadcn/ui + Tailwind CSS 4 |
| 表单 | React Hook Form + Zod |
| 表格 | TanStack Table (headless) + 自封装 |
| 图表 | ECharts 6 |
| 请求 | Axios + TanStack Query |
| 国际化 | react-i18next |
| 图标 | Lucide / @ant-design/icons |
| 构建 | Vite 8 |

### 5.2 目录约定

```
src/pages/
├── dashboard/              # 首页仪表盘
│   └── index.tsx
├── system/                 # 系统管理
│   ├── user/              # 用户管理
│   │   ├── index.tsx      # 列表页
│   │   ├── detail.tsx     # 详情页
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

// 路由懒加载映射
const componentMap = import.meta.glob('../pages/**/*.tsx')

function generateRoutes(menus: MenuVO[]): RouteObject[] {
  // 递归将菜单树转为 React Router 路由配置
}
```

### 5.4 布局结构

```
┌──────────────────────────────────────────────────┐
│  Header: Logo | 面包屑 | 搜索 | 通知 | 用户头像   │
├────────┬─────────────────────────────────────────┤
│        │                                         │
│  Side  │         Content (路由出口)               │
│  Menu  │                                         │
│        │                                         │
│  可折叠 │                                         │
│        │                                         │
├────────┴─────────────────────────────────────────┤
│  Footer: 版权信息                                 │
└──────────────────────────────────────────────────┘
```

---

## 六、用户端架构（Next.js）

### 6.1 App Router 结构

```
src/app/
├── (marketing)/            # 营销页面组
│   ├── page.tsx           # 首页
│   ├── pricing/
│   └── about/
├── (auth)/                 # 认证页面组
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── (dashboard)/            # 用户中心（需登录）
│   ├── layout.tsx         # 带侧边栏布局
│   ├── overview/
│   ├── settings/
│   └── subscription/
├── api/                    # API Routes (BFF 层，可选)
├── layout.tsx
└── globals.css
```

### 6.2 与管理后台的复用策略

| 复用层 | 方式 |
|--------|------|
| 类型定义 | `packages/shared` 统一导出 |
| 校验逻辑 | Zod Schema 共享 |
| 工具函数 | `packages/shared/utils` |
| UI 组件 | `packages/ui`（设计系统统一时） |
| API 客户端 | 共享 Axios/Fetch 封装 + 类型 |

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
  // ...前后端复用同一份校验
})

export type CreateUserDto = z.infer<typeof createUserSchema>
```

### 7.2 @base/eslint-config

```javascript
// 统一 ESLint 扁平配置
// apps/server、apps/admin、apps/web 各自 extends 此包
module.exports = {
  extends: ['@base/eslint-config/base'],
  // 各应用可追加规则
}
```

### 7.3 @base/tsconfig

```
packages/tsconfig/
├── base.json          # 公共配置
├── nestjs.json        # 服务端（decorators、emitDecoratorMetadata）
├── react.json         # 管理后台（jsx、bundler）
└── nextjs.json        # 用户端（plugins: next）
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

### 8.3 前端权限控制

```typescript
// 路由级：动态路由只注册有权限的页面
// 按钮级：自定义 Hook
function usePermission() {
  const permissions = useAuthStore(s => s.permissions)
  return {
    has: (code: string) => permissions.includes(code),
    hasAny: (codes: string[]) => codes.some(c => permissions.includes(c)),
    hasAll: (codes: string[]) => codes.every(c => permissions.includes(c)),
  }
}

// 使用
const { has } = usePermission()
{has('system:user:delete') && <Button danger>删除</Button>}
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

### 9.2 前端 CRUD 页面模板

```typescript
// 一个典型的列表页结构
function UserListPage() {
  return (
    <PageContainer>
      {/* 搜索栏 */}
      <SearchForm fields={searchFields} onSearch={handleSearch} />

      {/* 操作栏 */}
      <ActionBar>
        <CreateButton permission="system:user:add" />
        <BatchDeleteButton permission="system:user:delete" />
        <ExportButton />
      </ActionBar>

      {/* 表格 */}
      <DataTable
        columns={columns}
        queryKey={['users']}
        queryFn={getUserList}
        rowSelection
        actions={[editAction, deleteAction, resetPwdAction]}
      />
    </PageContainer>
  )
}
```

### 9.3 代码生成器（可选）

```bash
# CLI 一键生成 CRUD 全套
pnpm gen:crud user --fields "name:string,email:string,age:number,status:enum"

# 输出：
# apps/server/src/modules/user/  (controller, service, dto)
# apps/admin/src/pages/system/user/  (list, form, detail)
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

### 10.2 图表封装策略

```typescript
// 统一图表组件，基于 ECharts
<ChartCard title="访问趋势" loading={isLoading}>
  <LineChart data={trendData} xField="date" yField="count" />
</ChartCard>

// 大屏模式（可选）
<FullScreenDashboard>
  <Grid cols={4} rows={3} gap={16}>
    <ChartWidget type="line" span={2} />
    <ChartWidget type="pie" />
    <ChartWidget type="gauge" />
    {/* ... */}
  </Grid>
</FullScreenDashboard>
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
| 文件管理 | 文件列表/分类/搜索/回收站 |

### 11.2 实时通信/消息

```typescript
// WebSocket Gateway (NestJS)
@WebSocketGateway({ cors: true, namespace: '/ws' })
export class NotificationGateway {
  @SubscribeMessage('join')
  handleJoin(client: Socket, room: string) {
    client.join(room)  // 按用户 ID 加入房间
  }

  // 服务端主动推送
  pushToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data)
  }
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

- 管理后台: react-i18next
- 用户端: next-intl
- 服务端错误消息: 根据 Accept-Language 返回

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
  module: string        // 操作模块
  action: string        // 操作类型
  method: string        // HTTP Method
  url: string
  ip: string
  userAgent: string
  requestBody?: string  // 脱敏后的请求体
  responseBody?: string
  status: number
  duration: number      // 耗时 ms
  createdAt: DateTime
}
```

---

## 十二、工程化基础设施

### 12.1 代码规范全套

| 工具 | 作用 |
|------|------|
| ESLint 9 (flat config) | 代码质量检查 |
| Prettier | 代码格式化 |
| Husky | Git Hooks 管理 |
| lint-staged | 暂存区增量检查 |
| commitlint | 提交信息规范（Conventional Commits） |
| TypeScript strict | 类型安全 |

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
    # Next.js standalone 模式

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
├── /admin/*        → admin 静态文件 (React build)
├── /ws/*           → server:3000 (WebSocket)
└── /*              → web:3001 (Next.js 16 SSR)
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

### 14.2 路由配置示例

```typescript
const routes = [
  {
    path: '/dashboard',
    children: [
      { path: 'overview', component: () => import('@/pages/dashboard/overview') },
      { path: 'workbench', component: () => import('@/pages/dashboard/workbench') },
      { path: 'analysis', component: () => import('@/pages/dashboard/analysis') },
    ]
  },
  {
    path: '/system',
    children: [
      { path: 'user', component: () => import('@/pages/system/user') },
      { path: 'role', component: () => import('@/pages/system/role') },
      { path: 'menu', component: () => import('@/pages/system/menu') },
      { path: 'dept', component: () => import('@/pages/system/dept') },
      { path: 'dict', component: () => import('@/pages/system/dict') },
      { path: 'config', component: () => import('@/pages/system/config') },
      { path: 'notice', component: () => import('@/pages/system/notice') },
    ]
  },
  // ... 按业务扩展
]
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
# - 在 apps/admin/src/pages/ 添加业务页面
# - 配置菜单/路由/权限
```

### 15.2 模块插拔清单

| 模块 | 移除方式 | 影响范围 |
|------|----------|----------|
| 审计日志 | 删除 audit-log 模块 + 装饰器 | 低 |
| 国际化 | 移除 i18n 目录，硬编码中文 | 中 |
| WebSocket | 删除 gateway + 前端 socket 逻辑 | 低 |
| 数据可视化 | 删除 dashboard 图表组件 | 低 |
| 工作流 | 删除 approval 模块 | 低 |
| 文件存储 | 改为纯本地上传 | 低 |

### 15.3 常见微调场景

| 场景 | 操作 |
|------|------|
| 换 UI 库 (Ant→shadcn) | 替换 components/，调整 Tailwind 配置 |
| 加新业务模块 | schema 加表 → gen:crud → 配菜单权限 |
| 对接新 OSS | 修改 file 模块 storage adapter |
| 增加审批流 | 引入状态机库，配置流程节点 |
| 切换数据库 | 修改 Prisma provider + 连接串 |

---

## 总结

```
┌─────────────────────────────────────────────────────────────┐
│                    万金油基座项目全景                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐    ┌─────────────┐    ┌──────────────┐        │
│  │ NestJS  │    │  React 19   │    │  Next.js 16  │        │
│  │  Server │◄──►│   Admin     │    │   Web (C端)  │        │
│  └────┬────┘    └──────┬──────┘    └──────┬───────┘        │
│       │                │                   │                │
│       └────────────────┼───────────────────┘                │
│                        ▼                                    │
│              ┌──────────────────┐                           │
│              │  packages/shared │  类型 + 校验 + 工具        │
│              └──────────────────┘                           │
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

> **核心原则**: 基座提供 80% 通用能力，业务只需关注 20% 差异化逻辑。
