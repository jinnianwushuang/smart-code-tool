# Smart Code Tool

> 个人前端知识库 & 开发工具集，基于 Vue 3 多应用架构构建。

---

## 项目架构

采用 **共享内核 + 多子项目** 架构：`src/` 存放多项目共用代码，`project/<子项目>/` 存放各项目特有逻辑。

```
smart-code-tool/
├── src/                          # 共享内核（多项目共用）
├── project/
│   ├── code-tool-app/            # 工具库应用
│   └── vue-test-app/             # Vue 架构验证应用
├── entries/
│   ├── code-tool-app/            # 工具库 Vite 配置 + HTML 入口
│   └── vue-test-app/             # Vue 测试 Vite 配置 + HTML 入口
├── docs/                         # VitePress 文档站（主项目）
│   ├── ai/                       # AI 开发
│   ├── architecture-document/    # 架构文档
│   ├── handbook/                 # 技术手册
│   ├── interview/                # 面试知识体系
│   ├── psychology/               # 心理认知
│   └── app-iframe/               # 子应用 iframe 嵌入页
├── scripts/                      # 构建 & 开发脚本 (zx)
└── job/                          # 构建任务（入口生成、后处理、工具函数）
```

## 三应用说明

| 应用             | 端口  | 说明                                         |
| ---------------- | ----- | -------------------------------------------- |
| VitePress 文档站 | 23000 | 主项目，知识库文档 + iframe 嵌入子应用       |
| code-tool-app    | 23330 | 前端工具集（Excel 分析、二维码、文本处理等） |
| vue-test-app     | 23350 | Vue 3 架构验证 & 特性演示                    |

## 技术栈

- **框架**：Vue 3.5、Vue Router 5
- **构建**：Vite 8（Rolldown + Oxc）、pnpm
- **文档**：VitePress
- **UI**：Quasar 2、Ant Design Vue 4、Tailwind CSS 4
- **图表**：ECharts 6
- **脚本**：zx

## 快速开始

```bash
# 环境要求
Node.js >= 24.14.0
pnpm >= 11.3.0

# 安装依赖
pnpm install

# 启动开发（自动清理端口 → 创建入口 → 并行启动三个 dev server）
pnpm dev

# 构建（VitePress → code-tool-app → vue-test-app → 后处理）
pnpm build
```

## 常用命令

```bash
pnpm dev              # 启动全部开发服务
pnpm build            # 全量构建
pnpm docs:dev         # 仅启动文档站开发
pnpm format           # Prettier 格式化
pnpm pdf              # 导出全部文档 PDF
pnpm clean:ports      # 清理残留端口占用
```

## 部署

构建产物输出到 `dist/` 目录，通过 Nginx 部署，基础路径 `/smart-code-tool/`。
