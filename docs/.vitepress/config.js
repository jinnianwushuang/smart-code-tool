// docs/.vitepress/config.js
import { defineConfig } from 'vitepress'
import { execSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { nav } from './config/nav'
import { sidebar } from './config/sidebar'
import { search } from './config/search'
import { themeConfig } from './config/theme'
import { vite } from './config/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BASE = '/smart-code-tool/'

export default defineConfig({
  title: 'YOLO',
  description: 'YOLO 文档中心',

  // 必须设置 base。如果你的 GitHub 仓库名是 'my-project',
  // 那么基础路径必须包含仓库名,格式为:/仓库名/docs/
  base: BASE,

  // 文档项目为主项目，直接输出到 dist 根目录
  outDir: '../dist',

  // 忽略死链接检查(允许 localhost 等本地开发链接，以及子应用 iframe 路径)
  ignoreDeadLinks: [
    /^https?:\/\/localhost/,
    /^https?:\/\/127\.0\.0\.1/,
    '/smart-code-tool/vue-test-app/',
    '/smart-code-tool/code-tool-app/',
  ],
  // 头信息（head 中的路径不会自动补 base，需手动拼接）
  head: [['link', { rel: 'icon', href: `${BASE}doc-assets/logo/icons8-light-on-96.png` }]],

  // 启用 VitePress 内置暗色模式切换（导航栏太阳/月亮按钮），统一使用 app-theme-mode 键
  appearance: {
    key: 'app-theme-mode',
    default: 'dark',
  },

  // 自定义主题配置
  themeConfig: {
    ...themeConfig,
    nav,
    search,
    sidebar,
  },

  // 核心:利用 vite 的 define 配置注入全局变量
  vite: {
    ...vite,
    server: {
      ...vite.server,
      host: '127.0.0.1',
      port: 23000,
      strictPort: true,
    },
  },
  markdown: {
    // Shiki 语法高亮配置 - 明暗双主题
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },

  // 构建前自动生成全站文档清单 doc-list.json（供抗遗忘复习系统使用）
  async buildStart() {
    console.log('\n📋 正在生成全站文档清单...')
    execSync('node scripts/gen-doc-list.mjs', {
      cwd: resolve(__dirname, '../..'),
      stdio: 'inherit',
    })
  },
})
