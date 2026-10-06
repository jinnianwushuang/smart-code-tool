/**
 * ⚠️ AI / 开发者须知：
 * 1. 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 *    新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 *    id 一旦生成永不修改，即使 text / link 变更也保持原值。
 *    VitePress 会忽略 id 字段，不影响解析。
 * 2. 对应的 markdown 文档必须在 frontmatter 中包含 tags 字段（字符串数组），
 *    用于快捷工具的标签筛选和统计分布。示例：tags: ['指令集', 'Vue']
 */

// 指令集侧边栏
export const instructionsSidebar = {
  collapsed: false,
  items: [
    {
      text: '快速开始',
      items: [
        { id: 'urjfs3o5zDYrokhLuD1LVUAU', text: '总览', link: '/instructions/' },
        {
          id: 'u8j7TdX7Rvk-wIoGBh8xiXbL',
          text: '新增指令集指南',
          link: '/instructions/CREATE-GUIDE',
        },
        {
          id: 'GHdjVG0XCjQNzSsr2edfzeFe',
          text: '计划书归档',
          link: '/instructions/_plan-archive/',
        },
      ],
    },
    {
      text: '指令集体系设计',
      collapsed: true,
      items: [
        {
          id: 'dZinK2xonp__M0s83nQXY32-',
          text: '总览',
          link: '/instructions/instruction-architecture/',
        },
        {
          text: '设计文档',
          collapsed: true,
          items: [
            {
              text: '分层模型设计',
              link: '/instructions/instruction-architecture/design/layered-model',
              id: 'ToEdgcvYply8B3AZGaiNnikV',
            },
            {
              text: '参数管道设计',
              link: '/instructions/instruction-architecture/design/parameter-pipeline',
              id: '5mrsWr-VgCOqnsBsUr3LtGOo',
            },
            {
              text: '注解驱动文档生成',
              link: '/instructions/instruction-architecture/design/annotation-driven-docs',
              id: '-RHtZ83mJAwDbPdlS5GLXoNs',
            },
            {
              text: '执行模型与编排',
              link: '/instructions/instruction-architecture/design/execution-model',
              id: '3qxdijt6h0KXoJif_57YZvgX',
            },
          ],
        },
        {
          text: '规范文件',
          collapsed: true,
          items: [
            {
              text: '术语表模板',
              link: '/instructions/instruction-architecture/standards/glossary-template',
              id: '9cTO-D0onJkFuXslg1Oz2e6v',
            },
            {
              text: '约束规则规范',
              link: '/instructions/instruction-architecture/standards/constraint-rules',
              id: 'nieouMuASjxiT75hIywxDT8i',
            },
            {
              text: '注解格式规范',
              link: '/instructions/instruction-architecture/standards/annotation-format',
              id: 'yokm4c6TUhEj2nEr2k--rlqF',
            },
          ],
        },
        {
          text: '实现示例',
          collapsed: true,
          items: [
            {
              text: '第 2 层示例',
              link: '/instructions/instruction-architecture/examples/layer-2-example/entry',
              id: '9rCoRla0uJq0wLNSoTR6pXL7',
            },
            {
              text: '第 3 层示例',
              link: '/instructions/instruction-architecture/examples/layer-3-example/entry',
              id: 'nVW1oXAY24EhaY7SwCrhN9PL',
            },
            {
              text: '编排文件示例',
              link: '/instructions/instruction-architecture/examples/pipeline-example/feature-complete',
              id: 'KQinjtPzR-83NY0VkQ3CmNH7',
            },
          ],
        },
      ],
    },
    {
      text: '多工作区组合开发套件',
      link: '/instructions/multi-workspace-composition',
      id: 'Qtn0ecgODQxcPI-rQbsL_oLe',
    },
    {
      text: 'Vue',
      collapsed: false,
      items: [
        { id: 'aqSbWE9nvwaS968q3KXaMA8P', text: 'Vue 提示词', link: '/instructions/vue/prompts' },
        {
          text: 'Vue 装配架构 AI 指令集',
          collapsed: true,
          items: [
            {
              id: 'zVhAsZ-oaiLSSQdrzzOMDNRO',
              text: '概述',
              link: '/instructions/vue/vue-assembler/docs/',
            },
            {
              id: 'yfY7x0dyZMpJgt3FQ2pgx5NQ',
              text: '设计架构',
              link: '/instructions/vue/vue-assembler/docs/design',
            },
            {
              id: 'Tkp5YbJBjPEO3k0_W54fzWHD',
              text: '执行流程',
              link: '/instructions/vue/vue-assembler/docs/execution-flow',
            },
            {
              id: 'MbHgRNuPU9yWX8Htu3jBJ5ky',
              text: '配置指南',
              link: '/instructions/vue/vue-assembler/docs/config-guide',
            },
            {
              id: 'gll-5UChdEvi1SaU23j3an4I',
              text: '文件索引',
              link: '/instructions/vue/vue-assembler/docs/file-index',
            },
          ],
        },
        {
          text: 'Vue 通用代码检查指令集',
          collapsed: true,
          items: [
            {
              id: 'N-CrPe2XCxCwJLQwtzfDkCZx',
              text: '概述',
              link: '/instructions/vue/vue-code-review/docs/',
            },
            {
              id: '0hUBC3j5gMTFg3alnUNPfGGy',
              text: '设计架构',
              link: '/instructions/vue/vue-code-review/docs/design',
            },
            {
              id: 's8ipwko-1ke4XNdNF7pnNAPm',
              text: '执行流程',
              link: '/instructions/vue/vue-code-review/docs/execution-flow',
            },
            {
              id: 'bajV24MMpZQ6gZNV6gy1Kpop',
              text: '配置指南',
              link: '/instructions/vue/vue-code-review/docs/config-guide',
            },
            {
              id: 'CDc8cKqdLxxTdXXw1go63Ue_',
              text: '文件索引',
              link: '/instructions/vue/vue-code-review/docs/file-index',
            },
          ],
        },
        {
          text: 'Vue 装配架构代码模板',
          collapsed: true,
          items: [
            {
              id: 'CgtHHghwdNQsDogc-M3YfrU-',
              text: '概述',
              link: '/instructions/vue/vue-arch-starter/docs/',
            },
            {
              id: 'KooCJvOOHH6QA7wraTWMvdMF',
              text: '架构概念',
              link: '/instructions/vue/vue-arch-starter/docs/architecture',
            },
            {
              id: 'XC97c5grDLfdRTy0heT0B3r5',
              text: '集成指南',
              link: '/instructions/vue/vue-arch-starter/docs/integration',
            },
            {
              id: '3bypHDsT-8o7pMP1Z8pW91dD',
              text: '定制指南',
              link: '/instructions/vue/vue-arch-starter/docs/customization',
            },
            {
              id: '2bNiLqBDCxsVGWJMTb1Q6t-N',
              text: '文件索引',
              link: '/instructions/vue/vue-arch-starter/docs/file-index',
            },
            { text: '---' },
            {
              text: '启动器',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/launcher',
              id: 'RlqqQRN7Tbmkl268nU0rnAUa',
            },
            {
              text: '约束规则',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/constraints',
              id: 'kfiBO4m5-SRTkIqhByl6B-Sj',
            },
            {
              text: '代码规范',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/code-standard',
              id: 'FoNhPbmbqCa3Xi0DuTAlSfET',
            },
            {
              text: '门禁检查',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/gate-check',
              id: '1KuwNt8wQF1tSzY60m4ePemo',
            },
            {
              text: '通用步骤',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/common-steps',
              id: 'qYPFnavxJOth4ZGUZeYMHhyk',
            },
            {
              text: '任务：新项目集成',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/task-integration',
              id: 'M0B7ztLZDjLV7iuadIJlSlFc',
            },
            {
              text: '任务：定制修改',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/task-customization',
              id: 'FV4tHfRfuvFpuaZYxWRbsIqI',
            },
            {
              text: '复核清单',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/instructions/review-checklist',
              id: 'NhAT5Q5VrvXbwmcNJHffGgNT',
            },
          ],
        },
        {
          text: '版本记录',
          collapsed: true,

          items: [
            {
              id: '7eYxBb3zYuHGIBa8vN-QgHND',
              text: 'Vue 装配架构 — 变更日志',
              link: '/instructions/vue/vue-assembler/VERSION',
            },
            {
              text: 'Vue 通用代码检查 — 变更日志',
              link: '/instructions/vue/vue-code-review/VERSION',
              id: 'MCnTWwAVqx_f0YnVpD0OvHJt',
            },
            {
              text: 'Vue 架构代码模板 — 变更日志',
              link: '/instructions/vue/vue-arch-starter/vue-arch-starter/VERSION',
              id: 'dSlsILidcLsdUTQBoxQfGczU',
            },
          ],
        },
      ],
    },
    {
      text: 'React',
      collapsed: false,
      items: [
        {
          id: 'f3MJ1Jwns_g069uLVrm_mp6D',
          text: 'React 提示词',
          link: '/instructions/react/prompts',
        },
        {
          text: 'React 装配架构 AI 指令集',
          collapsed: true,
          items: [
            {
              id: '_vuFn8kWoANAQnpeGPJw1bSw',
              text: '概述',
              link: '/instructions/react/react-assembler/docs/',
            },
            {
              id: 'K3XiDvYnr0e4U-m46CLbnWdM',
              text: '设计架构',
              link: '/instructions/react/react-assembler/docs/design',
            },
            {
              id: 'LWB-VVEPB0jHrId4CwtV8Fnd',
              text: '执行流程',
              link: '/instructions/react/react-assembler/docs/execution-flow',
            },
            {
              id: 'vOSUGJeljv0EoFp5Vy16qHCd',
              text: '配置指南',
              link: '/instructions/react/react-assembler/docs/config-guide',
            },
            {
              id: 'KqV36n0PJ3fLtVcTovNgFRib',
              text: '文件索引',
              link: '/instructions/react/react-assembler/docs/file-index',
            },
          ],
        },
        {
          text: 'React 通用代码检查指令集',
          collapsed: true,
          items: [
            {
              id: 'ulo0DZTcwCzuD9q8Cu8FPCIC',
              text: '概述',
              link: '/instructions/react/react-code-review/docs/',
            },
            {
              id: 'pX8Iq7hLf-xP8TR6D5omVDQe',
              text: '设计架构',
              link: '/instructions/react/react-code-review/docs/design',
            },
            {
              text: '执行流程',
              link: '/instructions/react/react-code-review/docs/execution-flow',
              id: 'Hn1FpKPPhOcp9v5UbRGvpGaN',
            },
            {
              text: '配置指南',
              link: '/instructions/react/react-code-review/docs/config-guide',
              id: '6mP0tRKl4LzI7EyW2JILLMJR',
            },
            {
              id: 'yTlWgufegvwGBaK58P-hz-zS',
              text: '文件索引',
              link: '/instructions/react/react-code-review/docs/file-index',
            },
          ],
        },
        {
          text: '版本记录',
          collapsed: true,
          items: [
            {
              text: 'React 装配架构 — 变更日志',
              link: '/instructions/react/react-assembler/VERSION',
              id: 'TcN1pGESx81HqA7pV4UY_5-9',
            },
            {
              text: 'React 通用代码检查 — 变更日志',
              link: '/instructions/react/react-code-review/VERSION',
              id: 'hdeu5AQYL_G73pQ9U1S61AgM',
            },
          ],
        },
      ],
    },
    {
      text: 'Flutter',
      collapsed: false,
      items: [
        {
          id: 'dlzsdgyf5S_qahp3XL304WKv',
          text: 'Flutter 提示词',
          link: '/instructions/flutter/prompts',
        },
        {
          text: 'Flutter 装配架构 AI 指令集',
          collapsed: true,
          items: [
            {
              id: 'uJ2fE5HyU_PTtLp239vjsQ0C',
              text: '概述',
              link: '/instructions/flutter/flutter-assembler/docs/',
            },
            {
              id: '1v_AAymk0f3OO_gb7Lmg0NXR',
              text: '设计架构',
              link: '/instructions/flutter/flutter-assembler/docs/design',
            },
            {
              text: '执行流程',
              link: '/instructions/flutter/flutter-assembler/docs/execution-flow',
              id: 'vSS8Lxwrj6Kb26I997TLqHqA',
            },
            {
              id: 'DdsXGDDw5dsvxjK_sS_gYAN9',
              text: '配置指南',
              link: '/instructions/flutter/flutter-assembler/docs/config-guide',
            },
            {
              id: '5Yg_BgBk7xlJYoa5nCfxXt80',
              text: '文件索引',
              link: '/instructions/flutter/flutter-assembler/docs/file-index',
            },
          ],
        },
        {
          text: 'Flutter 通用代码检查指令集',
          collapsed: true,
          items: [
            {
              id: 'CLQ2_QVznWvRnBDBkiwvZnGD',
              text: '概述',
              link: '/instructions/flutter/flutter-code-review/docs/',
            },
            {
              id: 'KQHXYjDW73_CrSpLnhqTX-OK',
              text: '设计架构',
              link: '/instructions/flutter/flutter-code-review/docs/design',
            },
            {
              text: '执行流程',
              link: '/instructions/flutter/flutter-code-review/docs/execution-flow',
              id: 'C3Set8D9jFZd7Fl2y_YFHtGs',
            },
            {
              text: '配置指南',
              link: '/instructions/flutter/flutter-code-review/docs/config-guide',
              id: 'B8QfuZDY589p0VZRRXKFCc-u',
            },
            {
              text: '文件索引',
              link: '/instructions/flutter/flutter-code-review/docs/file-index',
              id: 'TQGz4I4JGpRnVVE9E8JfvYvS',
            },
          ],
        },
        {
          text: '版本记录',
          collapsed: true,
          items: [
            {
              text: 'Flutter 装配架构 — 变更日志',
              link: '/instructions/flutter/flutter-assembler/VERSION',
              id: 'Fw8dJ6kzHdpt857_5n4vrXGK',
            },
            {
              text: 'Flutter 通用代码检查 — 变更日志',
              link: '/instructions/flutter/flutter-code-review/VERSION',
              id: 'vqPuMCBRgbVwYGSpS0hjs1wP',
            },
          ],
        },
      ],
    },
  ],
}
