# 依赖清单

> 以下依赖版本经过验证，可正常工作。更高版本通常也兼容，如遇问题请回退到指定版本。

## 必需依赖

| 包名                 | 版本     | 说明                                            |
| -------------------- | -------- | ----------------------------------------------- |
| `vue`                | `^3.5.0` | 核心框架                                        |
| `vue-router`         | `^5.0.0` | 路由（`useGlobalVariable.js` 中使用）           |
| `vite`               | `^8.0.0` | 构建工具（`import.meta.glob` 是 Vite 特有 API） |
| `@vitejs/plugin-vue` | `^6.0.0` | Vite Vue 插件                                   |

## 装配架构核心依赖

| 包名          | 版本     | 说明                                  |
| ------------- | -------- | ------------------------------------- |
| `mitt`        | `^3.0.0` | 事件总线（`mitt-kit/mitt.js` 中使用） |
| `change-case` | `^5.0.0` | 命名转换（装配器文件名解析）          |

## UI 框架（二选一）

### 默认：Quasar + Ant Design Vue

| 包名                  | 版本      | 说明                         |
| --------------------- | --------- | ---------------------------- |
| `quasar`              | `^2.15.0` | UI 组件库                    |
| `@quasar/vite-plugin` | `^2.0.0`  | Vite Quasar 插件             |
| `sass-embedded`       | `^1.60.0` | SCSS 预处理器（Quasar 依赖） |
| `ant-design-vue`      | `^4.0.0`  | 业务组件库                   |

### 替换为 Element Plus

| 包名            | 版本      | 说明          |
| --------------- | --------- | ------------- |
| `element-plus`  | `^2.5.0`  | UI 组件库     |
| `sass-embedded` | `^1.60.0` | SCSS 预处理器 |

> 更换 UI 框架后，需同步修改 CSS 变量文件和模板中的 Vue 组件标签。详见 `customization.md` 的「UI 框架替换」章节。

## 可选依赖

| 包名     | 版本      | 说明                   |
| -------- | --------- | ---------------------- |
| `lodash` | `^4.17.0` | 工具函数库（按需引入） |
| `dayjs`  | `^1.11.0` | 日期处理库             |

## 快速安装

```bash
# 基础依赖
pnpm add vue vue-router mitt change-case

# 开发依赖
pnpm add -D vite @vitejs/plugin-vue sass-embedded

# UI 框架（默认方案）
pnpm add quasar @quasar/vite-plugin ant-design-vue

# 可选
pnpm add lodash dayjs
```
