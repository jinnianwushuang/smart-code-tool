---
title: 业务组件 SDK 打包技术选型
order: 120
---

# Vue 3 业务组件 SDK 打包技术选型指南

当项目已有一套成熟的 Vue 3 + pnpm 定制化后台体系，并希望将其中沉淀的业务性组件（如权限选择器、组织架构树、审批流程面板等）打包为独立 SDK 供外部项目使用时，需要从**工程结构、构建工具、类型声明、版本发布**等维度进行系统性规划。

## 1. SDK 打包方案选型

| 方案                         | 核心技术                             | 优点                                                           | 缺点                             | 适用场景                                      |
| :--------------------------- | :----------------------------------- | :------------------------------------------------------------- | :------------------------------- | :-------------------------------------------- |
| **pnpm Monorepo + Vite Lib** | pnpm workspace + Vite library mode   | **与现有项目无缝集成**，共享依赖管理，构建极快，支持按需导出。 | 需要重构项目为 Monorepo 结构。   | 已有 pnpm 项目，希望渐进式拆分组件为 SDK。    |
| **独立子包 + Vite Lib**      | 独立 Git 仓库 + Vite library mode    | **完全解耦**，独立的版本控制和 CI/CD。                         | 跨仓库维护成本高，依赖同步困难。 | SDK 与主项目完全独立，由不同团队维护。        |
| **Turborepo + Vite Lib**     | Turborepo + pnpm + Vite library mode | **极致构建性能**，任务编排与缓存机制适合大型 Monorepo。        | 引入额外工具链，学习成本略高。   | 多个 SDK 包并行开发，需要任务缓存与并行构建。 |

## 2. 核心技术栈 (Core Stack)

- **构建工具**: [Vite Library Mode](https://cn.vitejs.dev/guide/build#library-mode) - 原生支持 ESM/UMD/IIFE 多格式输出，配置极简。
- **编程语言**: [TypeScript](https://www.typescriptlang.org/) - 为 SDK 消费者提供完整的类型提示，是 SDK 质量的基石。
- **包管理**: [pnpm](https://pnpm.io/) - workspace 协议天然支持 Monorepo，硬链接机制节省磁盘空间。
- **类型声明生成**: [vue-tsc](https://github.com/vuejs/language-tools) + [vite-plugin-dts](https://github.com/qmhc/vite-plugin-dts) - 自动从 `.vue` 文件生成 `.d.ts` 声明。

## 3. Monorepo 工程结构

将 SDK 作为 pnpm workspace 中的一个独立包，与主项目并列管理：

```
project-root/
├── pnpm-workspace.yaml
├── package.json
├── packages/
│   ├── sdk/                    # SDK 包（独立发布）
│   │   ├── src/
│   │   │   ├── components/     # 业务组件
│   │   │   ├── composables/    # 组合式函数
│   │   │   ├── utils/          # 工具函数
│   │   │   ├── styles/         # 公共样式
│   │   │   └── index.ts        # 统一导出入口
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── README.md
│   └── shared/                 # 可选：共享工具包
│       └── ...
├── apps/
│   └── admin/                  # 主后台项目（SDK 消费者）
│       ├── package.json
│       └── ...
└── ...
```

**`pnpm-workspace.yaml` 配置：**

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

## 4. SDK 包核心配置

### 4.1 `package.json` 关键字段

```json
{
  "name": "@your-org/business-sdk",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/business-sdk.umd.cjs",
  "module": "./dist/business-sdk.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/business-sdk.js",
      "require": "./dist/business-sdk.umd.cjs"
    },
    "./style.css": "./dist/style.css"
  },
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "peerDependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.0.0",
    "pinia": "^2.0.0"
  },
  "dependencies": {
    "dayjs": "^1.11.13"
  },
  "devDependencies": {
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^2.3.1",
    "typescript": "~5.6.3",
    "vite": "^6.0.0",
    "vue-tsc": "^2.1.10",
    "@vitejs/plugin-vue": "^5.2.1",
    "vite-plugin-dts": "^4.3.0",
    "vitest": "^2.1.8",
    "@vue/test-utils": "^2.4.6"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build && vue-tsc --emitDeclarationOnly",
    "build:lib": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint . --fix",
    "format": "prettier --write src/",
    "prepublishOnly": "pnpm build:lib"
  },
  "publishConfig": {
    "access": "restricted",
    "registry": "https://npm.your-org.com/"
  }
}
```

**关键说明：**

- `peerDependencies`：将 Vue、Vue Router、Pinia 声明为对等依赖，避免 SDK 打包时将这些框架重复捆绑，导致运行时存在多实例冲突
- `exports` 字段：现代 Node.js 的条件导出规范，确保 ESM/CJS/Types 三端正确解析
- `sideEffects`：标记 CSS 文件有副作用，防止 Tree-shaking 误删样式
- `files`：仅发布 `dist` 目录，减小包体积
- `publishConfig`：如使用私有 npm Registry，在此配置发布地址

### 4.2 `vite.config.ts` 构建配置

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.vue'],
      outDir: 'dist',
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BusinessSDK',
      fileName: 'business-sdk',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // 确保外部化处理 peerDependencies
      external: ['vue', 'vue-router', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
        },
        // 保留 CSS 独立文件
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'style.css'
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    // 生产环境移除 console/debugger
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

### 4.3 组件统一导出入口

**`packages/sdk/src/index.ts`：**

```ts
// 组件导出
export { default as OrgTree } from './components/OrgTree/index.vue'
export { default as PermissionSelect } from './components/PermissionSelect/index.vue'
export { default as ApprovalFlow } from './components/ApprovalFlow/index.vue'

// 组合式函数导出
export { usePermission } from './composables/usePermission'
export { useOrgData } from './composables/useOrgData'

// 工具函数导出
export { formatDate, formatCurrency } from './utils/format'

// 类型导出
export type { OrgNode, PermissionItem, ApprovalStep } from './types'
```

## 5. 消费端使用方式

### 5.1 Monorepo 内部引用（开发阶段）

在 `apps/admin/package.json` 中通过 workspace 协议引用：

```json
{
  "dependencies": {
    "@your-org/business-sdk": "workspace:*"
  }
}
```

### 5.2 外部项目引用（发布后）

```bash
# 安装 SDK
pnpm add @your-org/business-sdk

# 如果使用私有 Registry，需在项目根目录配置 .npmrc
# .npmrc 内容：
# @your-org:registry=https://npm.your-org.com/
```

### 5.3 在 Vue 项目中使用

```vue
<script setup lang="ts">
import { OrgTree, PermissionSelect, usePermission } from '@your-org/business-sdk'
import '@your-org/business-sdk/style.css'

const { permissions, hasPermission } = usePermission()
</script>

<template>
  <OrgTree :data="orgData" @select="handleSelect" />
  <PermissionSelect v-model="selectedPerms" :options="permissions" />
</template>
```

### 5.4 全局注册（可选）

如果希望提供 Vue 插件式的全局注册能力，可以在 SDK 中导出一个 `install` 方法：

```ts
// packages/sdk/src/install.ts
import type { App } from 'vue'
import OrgTree from './components/OrgTree/index.vue'
import PermissionSelect from './components/PermissionSelect/index.vue'

export function install(app: App) {
  app.component('OrgTree', OrgTree)
  app.component('PermissionSelect', PermissionSelect)
}

export default { install }
```

消费端即可通过 `app.use()` 全局注册：

```ts
import BusinessSDK from '@your-org/business-sdk'
import '@your-org/business-sdk/style.css'

app.use(BusinessSDK)
```

## 6. 样式隔离与主题定制

SDK 的样式设计需要兼顾**开箱即用**与**可定制性**：

- **CSS 变量主题系统**：所有颜色、间距、字号通过 CSS 变量暴露，消费端通过覆盖变量即可定制主题。
- **CSS Modules / Scoped**：组件内部使用 `<style scoped>` 或 CSS Modules，避免样式泄漏污染消费端。
- **独立 CSS 产物**：构建时将样式提取为独立的 `style.css`，消费端可选择性引入。

```css
/* packages/sdk/src/styles/variables.css */
:root {
  --sdk-primary-color: #1677ff;
  --sdk-border-radius: 6px;
  --sdk-font-size-base: 14px;
  --sdk-spacing-unit: 8px;
}
```

## 7. 质量保证

- **单元测试**: [Vitest](https://vitest.dev/) + [@vue/test-utils](https://test-utils.vuejs.org/) - 对 SDK 组件进行隔离测试。
- **类型检查**: `vue-tsc --noEmit` - 确保导出的类型声明正确无误。
- **E2E 测试**: 在 `apps/admin` 中集成 SDK 后进行端到端验证，确保消费端行为正常。
- **Bundle 分析**: 使用 `rollup-plugin-visualizer` 分析 SDK 产物体积，确保不引入冗余依赖。

## 8. 版本管理与发布策略

### 8.1 版本号规范

遵循 [SemVer](https://semver.org/) 语义化版本：

| 变更类型             | 版本号变化      | 示例              |
| :------------------- | :-------------- | :---------------- |
| 修复 Bug             | Patch（补丁）   | `1.0.0` → `1.0.1` |
| 新增功能（向后兼容） | Minor（次版本） | `1.0.0` → `1.1.0` |
| 破坏性变更           | Major（主版本） | `1.0.0` → `2.0.0` |

### 8.2 发布流程

```bash
# 1. 构建 SDK
pnpm --filter @your-org/business-sdk build:lib

# 2. 运行测试
pnpm --filter @your-org/business-sdk test

# 3. 更新版本号（根据变更类型）
pnpm --filter @your-org/business-sdk version patch

# 4. 发布到 Registry
pnpm --filter @your-org/business-sdk publish
```

### 8.3 变更日志管理

推荐使用 [changesets](https://github.com/changesets/changesets) 管理版本与变更日志：

```bash
# 安装
pnpm add -Dw @changesets/cli

# 初始化
pnpm changeset init

# 每次修改后记录变更
pnpm changeset

# 自动 bump 版本并生成 CHANGELOG
pnpm changeset version
```

## 9. 项目完整 `package.json` 样板

### Monorepo 根目录 `package.json`

```json
{
  "name": "vue-admin-monorepo",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter admin dev",
    "dev:sdk": "pnpm --filter @your-org/business-sdk dev",
    "build": "pnpm --filter @your-org/business-sdk build:lib && pnpm --filter admin build",
    "build:sdk": "pnpm --filter @your-org/business-sdk build:lib",
    "test": "pnpm -r test",
    "test:sdk": "pnpm --filter @your-org/business-sdk test",
    "lint": "pnpm -r lint",
    "format": "pnpm -r format",
    "type-check": "pnpm -r type-check",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "publish-packages": "changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.11",
    "typescript": "~5.6.3",
    "eslint": "^9.17.0",
    "prettier": "^3.4.2",
    "vite": "^6.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

### SDK 包 `package.json`

```json
{
  "name": "@your-org/business-sdk",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/business-sdk.umd.cjs",
  "module": "./dist/business-sdk.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/business-sdk.js",
      "require": "./dist/business-sdk.umd.cjs"
    },
    "./style.css": "./dist/style.css"
  },
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "scripts": {
    "dev": "vite",
    "build:lib": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint . --fix",
    "format": "prettier --write src/",
    "prepublishOnly": "pnpm build:lib"
  },
  "peerDependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.0.0",
    "pinia": "^2.0.0"
  },
  "dependencies": {
    "dayjs": "^1.11.13"
  },
  "devDependencies": {
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^2.3.1",
    "typescript": "~5.6.3",
    "vite": "^6.0.0",
    "vue-tsc": "^2.1.10",
    "@vitejs/plugin-vue": "^5.2.1",
    "vite-plugin-dts": "^4.3.0",
    "vitest": "^2.1.8",
    "@vue/test-utils": "^2.4.6",
    "eslint": "^9.17.0",
    "prettier": "^3.4.2"
  },
  "publishConfig": {
    "access": "restricted",
    "registry": "https://npm.your-org.com/"
  }
}
```

### 主后台项目 `apps/admin/package.json`

```json
{
  "name": "admin",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --fix",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "@your-org/business-sdk": "workspace:*",
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "pinia": "^2.3.1",
    "pinia-plugin-persistedstate": "^4.2.0",
    "element-plus": "^2.9.1",
    "axios": "^1.7.9",
    "@vueuse/core": "^12.4.0",
    "dayjs": "^1.11.13"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "vite": "^6.0.0",
    "vue-tsc": "^2.1.10",
    "typescript": "~5.6.3",
    "eslint": "^9.17.0",
    "prettier": "^3.4.2"
  }
}
```

## 10. 架构师选型建议

1. **渐进式拆分**：如果现有项目尚未采用 Monorepo，推荐**先建立 `packages/sdk` 目录**，将需要对外输出的组件逐步迁移，保持与主项目通过 `workspace:*` 联动开发。
2. **构建首选 Vite Lib Mode**：Vite 的库模式配置简单、构建速度快，且原生支持 Vue SFC，是 Vue 3 SDK 打包的最优解。
3. **类型声明是核心竞争力**：务必通过 `vite-plugin-dts` 自动生成 `.d.ts`，这是 SDK 专业度和消费端开发体验的关键指标。
4. **私有 Registry**：企业内部 SDK 建议搭建 [Verdaccio](https://verdaccio.org/) 或使用 GitHub Packages / 阿里云制品仓库，避免敏感业务代码泄漏到公共 npm。
5. **文档先行**：使用 VitePress 为 SDK 搭建独立文档站，包含组件 Demo、API 文档和使用示例，大幅降低消费端的接入成本。
