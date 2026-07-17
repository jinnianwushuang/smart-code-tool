// docs/.vitepress/config.js
import { defineConfig } from 'vitepress'
import { nav } from './config/nav'
import { sidebar } from './config/sidebar'
import { search } from './config/search'
import { themeConfig } from './config/theme'
import { vite } from './config/vite'

export default defineConfig({
  title: 'Smart Code Tool',
  description: 'Smart Code Tool 文档中心',

  // 必须设置 base。如果你的 GitHub 仓库名是 'my-project',
  // 那么基础路径必须包含仓库名,格式为:/仓库名/docs/
  base: '/smart-code-tool/',

  // 文档项目为主项目，直接输出到 dist 根目录
  outDir: '../dist',

  // 忽略死链接检查(允许 localhost 等本地开发链接)
  ignoreDeadLinks: [/^https?:\/\/localhost/, /^https?:\/\/127.0.0.1/],

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
      host: '0.0.0.0',
      port: 23340,
    },
  },
  markdown: {
    // Shiki 语法高亮配置
    theme: 'github-dark',
    // languages: ['excel'],
  },
})
