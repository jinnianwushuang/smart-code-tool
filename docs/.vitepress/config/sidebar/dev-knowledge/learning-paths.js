/**
 * ⚠️ AI / 开发者须知：
 * 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 * 新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 * id 一旦生成永不修改，即使 text / link 变更也保持原值。
 * VitePress 会忽略 id 字段，不影响解析。
 */

// ── 学习路径导航 ──
export const learningPathsSection = {
  text: '学习路径导航',
  collapsed: false,
  items: [
    {
      id: 'iIBnp7w831B0xDF-gwsaUhz6',
      text: '初级工程师（P4-P5）',
      link: '/dev-knowledge/learning-paths/junior',
    },
    {
      id: '8t5Ar_hPd06rodt3sUPTfhn7',
      text: '中级工程师（P5-P6）',
      link: '/dev-knowledge/learning-paths/intermediate',
    },
    {
      id: 't_bOPLWCjxZsDId1piV-8xYP',
      text: '高级工程师（P6-P7）',
      link: '/dev-knowledge/learning-paths/senior',
    },
    {
      id: 'O4CwJq2yv3vr38SP4Rwd7FnU',
      text: '架构师（P8）',
      link: '/dev-knowledge/learning-paths/architect',
    },
    {
      id: 'Yfm5ZMq_XHuSURZW3dftDr8D',
      text: '技术主管（TL）',
      link: '/dev-knowledge/learning-paths/manager',
    },
    {
      id: 'YyNSeu8ggs4zKQ9pKoNDpipz',
      text: 'Flutter 学习路径',
      link: '/dev-knowledge/learning-paths/flutter',
    },
  ],
}
