# Smart Code Tool

> 个人前端知识库 & 开发工具集，基于 Vue 3 多应用架构构建。

## 技术栈

Vue 3.5 · Vite 8 (Rolldown + Oxc) · VitePress · Quasar 2 · Ant Design Vue 4 · Tailwind CSS 4 · ECharts 6 · zx

## 快速开始

```bash
pnpm install
pnpm dev        # 启动全部（文档站 :23000 + code-tool-app :23330 + vue-test-app :23350）
pnpm build      # 全量构建 → dist/
```

## 常用命令

```bash
pnpm docs:dev     # 仅文档站
pnpm format       # Prettier 格式化
pnpm pdf          # 导出全部文档 PDF
pnpm clean:ports  # 清理残留端口占用
```

## 部署

产物输出到 `dist/`，通过 Nginx 部署，基础路径 `/smart-code-tool/`。
