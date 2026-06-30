// docs/.vitepress/config/theme.js
// 主题相关配置

export const themeConfig = {
  // Logo 和标题
  logo: '/logo/icons8-light-on-100.png',

  // 上一页/下一页导航
  docFooter: {
    prev: '上一页',
    next: '下一页',
  },

  // 编辑链接配置
  editLink: {
    pattern: 'https://github.com/jinnianwushuang/smart-code-tool/edit/main/docs/:path',
    text: '在 GitHub 上编辑此页',
  },

  // 最后更新时间
  lastUpdated: {
    text: '最后更新于',
    formatOptions: {
      dateStyle: 'short',
      timeStyle: 'medium',
    },
  },

  // 社交链接
  socialLinks: [{ icon: 'github', link: 'https://github.com/jinnianwushuang/smart-code-tool' }],

  // 页面大纲
  outline: {
    // level: [2, 3],
    label: '页面导航',
  },
}
