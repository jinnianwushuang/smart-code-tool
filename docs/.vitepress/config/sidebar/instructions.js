// 指令集侧边栏
export const instructionsSidebar = {
  collapsed: false,
  items: [
    {
      text: '快速开始',
      items: [
        { text: '总览', link: '/instructions/' },
        { text: '新增指令集指南', link: '/instructions/CREATE-GUIDE' },
        { text: '计划书归档', link: '/instructions/_plan-archive/' },
      ],
    },
    {
      text: 'Vue',
      collapsed: false,
      items: [
        {
          text: 'Vue 装配架构 AI 指令集',
          collapsed: true,
          items: [
            { text: '概述', link: '/instructions/vue/vue-assembler/docs/' },
            { text: '设计架构', link: '/instructions/vue/vue-assembler/docs/design' },
            { text: '执行流程', link: '/instructions/vue/vue-assembler/docs/execution-flow' },
            { text: '配置指南', link: '/instructions/vue/vue-assembler/docs/config-guide' },
            { text: '文件索引', link: '/instructions/vue/vue-assembler/docs/file-index' },
          ],
        },
        {
          text: 'Vue 通用代码检查指令集',
          collapsed: true,
          items: [
            { text: '概述', link: '/instructions/vue/vue-code-review/docs/' },
            { text: '设计架构', link: '/instructions/vue/vue-code-review/docs/design' },
            { text: '执行流程', link: '/instructions/vue/vue-code-review/docs/execution-flow' },
            { text: '配置指南', link: '/instructions/vue/vue-code-review/docs/config-guide' },
            { text: '文件索引', link: '/instructions/vue/vue-code-review/docs/file-index' },
          ],
        },
        {
          text: 'Vue 架构代码模板',
          collapsed: true,
          items: [
            { text: '概述', link: '/instructions/vue/vue-arch-starter/docs/' },
            { text: '架构概念', link: '/instructions/vue/vue-arch-starter/docs/architecture' },
            { text: '集成指南', link: '/instructions/vue/vue-arch-starter/docs/integration' },
            { text: '定制指南', link: '/instructions/vue/vue-arch-starter/docs/customization' },
            { text: '文件索引', link: '/instructions/vue/vue-arch-starter/docs/file-index' },
            { text: '---' },
            {
              text: '启动器',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/launcher',
            },
            {
              text: '约束规则',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/constraints',
            },
            {
              text: '代码规范',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/code-standard',
            },
            {
              text: '门禁检查',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/gate-check',
            },
            {
              text: '通用步骤',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/common-steps',
            },
            {
              text: '任务：新项目集成',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/task-integration',
            },
            {
              text: '任务：定制修改',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/task-customization',
            },
            {
              text: '复核清单',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/review-checklist',
            },
          ],
        },
        {
          text: '版本记录',
          items: [
            { text: 'Vue 装配架构 — 变更日志', link: '/instructions/vue/vue-assembler/VERSION' },
            {
              text: 'Vue 通用代码检查 — 变更日志',
              link: '/instructions/vue/vue-code-review/VERSION',
            },
            {
              text: 'Vue 架构代码模板 — 变更日志',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/VERSION',
            },
          ],
        },
      ],
    },
  ],
}
