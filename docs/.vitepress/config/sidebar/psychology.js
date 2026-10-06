/**
 * ⚠️ AI / 开发者须知：
 * 1. 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 *    新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 *    id 一旦生成永不修改，即使 text / link 变更也保持原值。
 *    VitePress 会忽略 id 字段，不影响解析。
 * 2. 对应的 markdown 文档必须在 frontmatter 中包含 tags 字段（字符串数组），
 *    用于快捷工具的标签筛选和统计分布。示例：tags: ['心理学', '认知']
 */

// 心理认知侧边栏配置
export const psychologySidebar = {
  // text: '🧠 心理认知',
  collapsed: false,
  items: [
    {
      text: '世界规律',
      items: [
        {
          text: '十大世界运转法则',
          link: '/psychology/world-laws/world-operation',
          id: 'zU1dwYFb4Bma-fy42Rj88uOS',
        },
      ],
    },
    {
      text: '人生哲学',
      items: [
        {
          text: '威廉·詹姆斯名言',
          link: '/psychology/philosophy/william-james', // 1842年出生，现代心理学与实用主义先驱
          id: '8arIqeXMvyXQpxO5OkVqfDmH',
        },
        {
          text: '西格蒙德·弗洛伊德名言',
          link: '/psychology/philosophy/sigmund-freud', // 1856年出生，精神分析学派创始人
          id: 'ypMfZCZexYzZ00q3gWnoMS21',
        },
        {
          text: '阿尔弗雷德·阿德勒名言',
          link: '/psychology/philosophy/alfred-adler', // 1870年出生，个体心理学创始人
          id: '582xT2OtKFTibtioa0WmlECh',
        },
        {
          text: '卡尔·荣格经典名言',
          link: '/psychology/philosophy/carl-gustav-jung', // 1875年出生，分析心理学创始人
          id: 'If5Tjed6YK23rHwH3gPmMCxW',
        },
        {
          text: '维克多·弗兰克尔名言',
          link: '/psychology/philosophy/viktor-frankl', // 1905年出生，存在主义与意义治疗大师
          id: 'Qx1RtjjPHoxax1FIgc9OypU5',
        },
        {
          text: '米哈里·契克森米哈赖名言',
          link: '/psychology/philosophy/mihaly-csikszentmihalyi', // 1934年出生，积极心理学与心流之父
          id: 'Dfr5YFknDmzZ_1Eo3FCJn61j',
        },
        {
          text: '乔丹·彼得森名言',
          link: '/psychology/philosophy/jordan-b-peterson', // 1962年出生，当代临床心理学家
          id: 'VM-dzE2CAmswYXhvE7EQWRsY',
        },
        {
          text: '纳瓦尔·拉维康特的名言',
          link: '/psychology/philosophy/naval-ravikant', // 1974年出生，当代硅谷现代思想家、投资人
          id: 'UbkBO0rfIoV0WQihHCbQbgKY',
        },
        {
          text: '全球50位顶级富豪的宝贵箴言',
          link: '/psychology/philosophy/priceless-advice', // 50位世界顶级企业家的创业与人生忠告
          id: 'QyIlT7vP6nBJpnhvbg0ZmwMS',
        },
        {
          text: '人生即阅历：不去体验，连猪都不如',
          link: '/psychology/philosophy/life-is-experience',
          id: 'RvjyXbvKcgmLie9ZBRslYpPH',
        },
      ],
    },
    {
      text: '认知与学习',
      items: [
        {
          text: '思维闭环 - 学习之道',
          link: '/psychology/cognition-learning/thought-loop-the-path-of-learning',
          id: '-OSdbTkd955YMX6wVqCy0smw',
        },
        {
          text: '玩游戏与学习的差异',
          link: '/psychology/cognition-learning/games-and-learning',
          id: '1zL_jYmEDainSbmcyiEh3Tu9',
        },
        {
          text: '个人成长顺序',
          link: '/psychology/cognition-learning/sequence-of-personal-growth',
          id: 'f6vCJxnJDyiU5YAC1ELXntBk',
        },
        {
          text: '一天彻底改变人生',
          link: '/psychology/cognition-learning/how-to-fix-your-entire-life-in-1-day',
          id: 'q6kXKaTOynC5tMV1xhrgorV3',
        },
        {
          text: '人生感悟：活在当下',
          link: '/psychology/cognition-learning/living-in-the-moment',
          id: 'I-B9pdeoopPYVhHa5SdkAFgV',
        },
        {
          text: '身体觉醒术：即时提神技巧',
          link: '/psychology/cognition-learning/body-awakening-tips',
          id: 'lZdesaPBf8icsFj3CUBGPm4J',
        },
        {
          text: '锚点效应：你的人生被什么定住了',
          link: '/psychology/cognition-learning/anchoring-effect',
          id: 'YKtDVqHV0DcVP-dOvVs1nuwJ',
        },
      ],
    },

    {
      text: '心理健康',
      items: [
        {
          text: '走出精神内耗',
          link: '/psychology/mental-health/break-from-mental-exhaustion',
          id: 'YLPbNPAZLi6e4rGsbjUK_Vlt',
        },
      ],
    },
    {
      text: '综合指南',
      items: [
        {
          text: '现代生存双指南',
          link: '/psychology/comprehensive-guide/modern-survival-dual-guide',
          id: 'SzBWRrd5Jk9eFFoUNHFkH1EC',
        },
      ],
    },
  ],
}
