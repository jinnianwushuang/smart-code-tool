// docs/.vitepress/config/nav.js
// 导航栏配置

export const nav = [
  { text: '首页', link: '/' },
  {
    text: '心理',
    link: '/psychology/',
  },
  { text: 'AI', link: '/ai/' },
  {
    text: '架构',
    link: '/architecture-document/',
  },

  {
    text: '手册',
    link: '/handbook',
  },
  {
    text: '面试',
    link: '/interview/',
  },
  {
    text: '指令集',
    link: '/instructions/',
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
  // { text: 'GitHub', link: 'https://github.com/jinnianwushuang/smart-code-tool' },
]
