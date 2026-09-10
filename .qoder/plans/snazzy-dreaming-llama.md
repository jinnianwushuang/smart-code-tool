# 子项目文件重组织：src/ → project/ 分离

## Context

项目采用三架构（VitePress 文档 + code-tool 工具库 + vue-test 架构验证），但子项目特有的页面和布局组件仍混在 `src/` 中。按照用户要求：

- `project/<子项目>/` = 子项目特有文件（页面、布局），遵循 Vue3 标准 src 目录结构
- `src/` = 多项目共享代码 + 内核核心代码

**已完成的前置工作**：目录已创建 `project/code-tool/{pages,layout}` 和 `project/vue-test/{pages,layout}`

## 文件分类

### 留在 src/（共享/内核）

| 目录/文件           | 说明                                               |
| ------------------- | -------------------------------------------------- |
| `App.vue`           | 共享根组件                                         |
| `assets/`           | 共享 CSS 资源                                      |
| `boot/`             | 组件注册（共享）                                   |
| `common/`           | 工具函数、架构设计原子、主题、模块扫描             |
| `components/`       | 共享组件（code-block、markdown、tab-like-buttons） |
| `composable/`       | 共享 composables（架构设计模式）                   |
| `css/`              | 共享样式                                           |
| `i18n/`             | 国际化                                             |
| `output/`           | 输出配置（generate_menu_from_routes 等）           |
| `standardization/`  | 标准化模板参考                                     |
| `layout/layout.vue` | 根布局（纯 RouterView，共享）                      |

### 移动到 project/code-tool/

| 源路径                            | 目标路径                                        |
| --------------------------------- | ----------------------------------------------- |
| `src/pages/code-tool/`            | `project/code-tool/pages/code-tool/`            |
| `src/pages/common-tool/`          | `project/code-tool/pages/common-tool/`          |
| `src/pages/all-tool/`             | `project/code-tool/pages/all-tool/`             |
| `src/pages/domain-guide/`         | `project/code-tool/pages/domain-guide/`         |
| `src/pages/single-smart-tool/`    | `project/code-tool/pages/single-smart-tool/`    |
| `src/pages/docs/`                 | `project/code-tool/pages/docs/`                 |
| `src/pages/use-persistent-tab.js` | `project/code-tool/pages/use-persistent-tab.js` |
| `src/layout/layout-tool-page/`    | `project/code-tool/layout/layout-tool-page/`    |
| `src/layout/layout-docs-page/`    | `project/code-tool/layout/layout-docs-page/`    |
| `src/layout/compoent/`            | `project/code-tool/layout/compoent/`            |

### 移动到 project/vue-test/

| 源路径                        | 目标路径                                   |
| ----------------------------- | ------------------------------------------ |
| `src/pages/vue-test/`         | `project/vue-test/pages/vue-test/`         |
| `src/layout/layout-vue-page/` | `project/vue-test/layout/layout-vue-page/` |

## 核心策略：Vite alias

给两个 Vite 配置各加一个 `project` alias：

- `entries/code-tool/vite.config.js` → `project: ${projectRoot}/project/code-tool`
- `entries/vue-test/vite.config.js` → `project: ${projectRoot}/project/vue-test`

这样路由/布局中：

- `src/pages/xxx` → `project/pages/xxx`（子项目页面）
- `src/layout/xxx` → `project/layout/xxx`（子项目布局）
- `src/output/...`、`src/boot/...`、`src/common/...` 等共享引用保持 `src/` 不变

## Import 路径修改清单

### code-tool 侧

- **`project/code-tool/router/routes/module/tool.js`**
  - `src/layout/layout-tool-page/...` → `project/layout/layout-tool-page/...`
  - `src/pages/domain-guide/...` → `project/pages/domain-guide/...`
  - `src/pages/all-tool/...` → `project/pages/all-tool/...`
  - `src/pages/code-tool/...` → `project/pages/code-tool/...`
  - `src/pages/common-tool/...` → `project/pages/common-tool/...`
  - `src/pages/single-smart-tool/...` → `project/pages/single-smart-tool/...`

- **`project/code-tool/router/routes/module/docs.js`**
  - `src/layout/layout-docs-page/...` → `project/layout/layout-docs-page/...`

- **`project/code-tool/layout/layout-tool-page/layout-tool.vue`**
  - `src/layout/compoent/layout-header/...` → `project/layout/compoent/layout-header/...`
  - 相对路径 `../../../project/code-tool/router/routes/module/tool.js` → `../../router/routes/module/tool.js`

- **`project/code-tool/layout/layout-docs-page/layout-docs.vue`**
  - `src/layout/compoent/layout-header/...` → `project/layout/compoent/layout-header/...`

- **`project/code-tool/layout/compoent/layout-header/layout-header.vue`** — 无需修改（全用 `src/` alias）

### vue-test 侧

- **`project/vue-test/vue-test-routes.js`**
  - `src/layout/layout-vue-page/...` → `project/layout/layout-vue-page/...`
  - `src/pages/vue-test/...` → `project/pages/vue-test/...`（约 12 处）

- **`project/vue-test/layout/layout-vue-page/layout-vue-page.vue`**
  - 相对路径 `../../project/vue-test/vue-test-routes.js` → `../../vue-test-routes.js`

### main.js

- **`project/code-tool/main.js`**
  - `import App from '../../src/App.vue'` → `import App from 'src/App.vue'`

## 执行步骤

1. 移动文件（mv 命令）
2. 修改 Vite 配置（2 个 vite.config.js 增加 project alias）
3. 修改 code-tool 路由（tool.js、docs.js）
4. 修改 vue-test 路由（vue-test-routes.js）
5. 修改布局组件（layout-tool.vue、layout-docs.vue、layout-vue-page.vue）
6. 修改 main.js
7. 清理空目录
8. grep 验证无遗留旧路径

## 最终目录结构

```
project/
├── code-tool/
│   ├── main.js
│   ├── router/
│   │   ├── index.js
│   │   └── routes/
│   │       ├── routes.js
│   │       └── module/{tool.js, docs.js}
│   ├── layout/
│   │   ├── layout-tool-page/{layout-tool.vue, config/}
│   │   ├── layout-docs-page/{layout-docs.vue}
│   │   └── compoent/layout-header/{layout-header.vue}
│   └── pages/
│       ├── all-tool/
│       ├── code-tool/
│       ├── common-tool/
│       ├── docs/
│       ├── domain-guide/
│       ├── single-smart-tool/
│       └── use-persistent-tab.js
└── vue-test/
    ├── main.js
    ├── router.js
    ├── vue-test-routes.js
    ├── layout/
    │   └── layout-vue-page/{layout-vue-page.vue, config/}
    └── pages/
        └── vue-test/
            ├── multiton-demo/
            ├── singleton-demo/
            └── verification-explanation/

src/  (共享内核，不再包含 pages/)
├── App.vue
├── assets/  boot/  common/  components/  composable/
├── css/  i18n/  output/  standardization/
└── layout/
    └── layout.vue   ← 仅保留共享根布局
```

## 验证方式

1. `grep -r "src/pages" project/` — 应无结果
2. `grep -r "src/layout/layout-tool\|src/layout/layout-vue\|src/layout/compoent" project/` — 应无结果
3. `ls src/pages/` — 应为空或不存在
4. `pnpm dev` 启动三个服务器，验证页面正常加载
