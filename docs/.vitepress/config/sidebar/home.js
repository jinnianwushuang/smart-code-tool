/**
 * ⚠️ AI / 开发者须知：
 * 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 * 新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 * id 一旦生成永不修改，即使 text / link 变更也保持原值。
 * VitePress 会忽略 id 字段，不影响解析。
 */

// 首页侧边栏配置
export const homeSidebar = {
  // text: '🏠 首页',
  items: [
    { id: 'Gr_sTowxSTaHZCtr3gxb1eOE', text: '首页', link: '/' },
    { id: 'lQIIz_RM5ltPjjv6KQSdRxwF', text: 'AI', link: '/ai/' },
    {
      text: '架构',
      link: '/architecture-document/',
      id: 'T17fZnChv5AMEgtEUNvg7WfQ',
    },
    {
      text: '心理认知',
      link: '/psychology/',
      id: 'uQbfeHU1XaKr9PceowahW3Px',
    },

    {
      text: '开发手册',
      link: '/handbook',
      id: 'WI6RU8BgzE6QpTHOxtDOrTOD',
    },
    {
      text: '指令集',
      link: '/instructions/',
      id: 'm7q2z0Vjs9VssaNpIFKVHPkH',
    },
  ],
}
