# 端到端示例

> 展示从提交任务到完成集成的完整过程。

## 示例 1：新项目集成

### 用户提交

```
任务类型：新项目集成
项目名称：my-admin
项目路径：/Users/dev/my-admin
UI 框架：quasar
包管理器：pnpm
```

### AI 执行过程

**Step 1：门禁检查**

检查 config.md 必填项 → 全部已填写 ✓

**Step 2：生成安装命令**

```bash
# 基础依赖
pnpm add vue vue-router mitt change-case

# 开发依赖
pnpm add -D vite @vitejs/plugin-vue sass-embedded

# UI 框架
pnpm add quasar @quasar/vite-plugin ant-design-vue
```

**Step 3：指导复制代码**

将 `code-template/` 目录下的所有内容复制到 `/Users/dev/my-admin/src/`：

```
src/
├── standardization/
│   ├── multiton-template/
│   └── singleton-template/
├── common/
│   └── architecture-design/
├── composable/
│   ├── architecture-design/
│   └── index.js
└── css/
    ├── index.scss
    ├── dark-variables.scss
    ├── light-variables.scss
    ├── quasar-variables.scss
    ├── utils.scss
    └── scroll.scss
```

**Step 4：指导配置 Vite**

```javascript
// vite.config.js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({ sassVariables: `${projectRoot}/src/css/quasar-variables.scss` }),
  ],
  resolve: {
    alias: {
      src: `${projectRoot}/src`,
    },
  },
  server: { host: '0.0.0.0', port: 5173 },
})
```

**Step 5：验证**

建议用户添加测试路由，访问 `standardization/multiton-template/index.vue`，确认无报错。

**Step 6：完成摘要**

```
✅ 架构骨架搭建完成！

下一步：
1. 参考 multiton-template/ 创建你的第一个业务组件
2. 如需定制（换 UI 框架、加模块），请执行「定制修改」任务
```

---

## 示例 2：更换 UI 框架

### 用户提交

```
任务类型：定制修改
需求：将 Quasar 替换为 Element Plus
```

### AI 执行过程

**Step 1：说明影响范围**

需要修改以下文件：
1. `src/css/quasar-variables.scss` → 替换为 Element Plus 变量
2. `src/standardization/**/*.vue` → 替换组件标签
3. `src/composable/**/useGlobalVariable.js` → 替换 `useQuasar()`
4. `vite.config.js` → 替换插件配置

**Step 2：逐步指导替换**

（逐个文件给出具体替换方案，每次替换后建议用户编译确认）

**Step 3：完成确认**

```
✅ UI 框架已从 Quasar 替换为 Element Plus
- CSS 变量 ✓
- 组件标签 ✓
- JS API ✓
- Vite 配置 ✓

建议启动项目验证所有页面正常显示。
```
