// docs/.vitepress/config/nav.js
// 导航栏配置

// 工具库链接：本地开发指向 Vue 开发服务器，生产环境使用相对路径
const isDev = process.env.NODE_ENV !== 'production'
const toolLink = isDev
  ? 'http://localhost:23330/smart-code-tool/tool/index.html'
  : location.origin + '/smart-code-tool/tool/index.html'

export const nav = [
  { text: '首页', link: '/' },
  { text: 'AI', link: '/ai/' },
  {
    text: '架构',
    link: '/architecture-document/',
  },
  {
    text: '心理认知',
    link: '/psychology/',
  },
  {
    text: '开发手册',
    link: '/handbook',
  },
  {
    text: '工具库',
    link: toolLink,
  },
  // { text: 'GitHub', link: 'https://github.com/jinnianwushuang/smart-code-tool' },
]
