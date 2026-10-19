// docs/.vitepress/config/nav.js
// 导航栏配置

export const nav = [
  {
    text: '心理',
    link: '/psychology/',
  },
  { text: 'AI', link: '/ai/' },
  {
    text: '手册',
    link: '/handbook',
  },
  {
    text: '研发知识',
    link: '/dev-knowledge/',
  },
  {
    text: 'AIGC',
    link: '/aigc/',
  },
  {
    text: '工具库',
    link: '/app-iframe/code-tool-app/',
  },
  {
    text: '其他',
    items: [
      { text: 'VUE 架构验证', link: '/app-iframe/vue-test-app/' },
      { text: 'React 架构验证', link: '/app-iframe/react-test-app/' },
    ],
  },
]
