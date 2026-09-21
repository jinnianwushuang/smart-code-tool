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
      text: '指令集体系设计',
      collapsed: true,
      items: [
        { text: '总览', link: '/instructions/instruction-architecture/' },
        {
          text: '设计文档',
          collapsed: true,
          items: [
            {
              text: '分层模型设计',
              link: '/instructions/instruction-architecture/design/layered-model',
            },
            {
              text: '参数管道设计',
              link: '/instructions/instruction-architecture/design/parameter-pipeline',
            },
            {
              text: '注解驱动文档生成',
              link: '/instructions/instruction-architecture/design/annotation-driven-docs',
            },
            {
              text: '执行模型与编排',
              link: '/instructions/instruction-architecture/design/execution-model',
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
            },
            {
              text: '约束规则规范',
              link: '/instructions/instruction-architecture/standards/constraint-rules',
            },
            {
              text: '注解格式规范',
              link: '/instructions/instruction-architecture/standards/annotation-format',
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
            },
            {
              text: '第 3 层示例',
              link: '/instructions/instruction-architecture/examples/layer-3-example/entry',
            },
            {
              text: '编排文件示例',
              link: '/instructions/instruction-architecture/examples/pipeline-example/feature-complete',
            },
          ],
        },
      ],
    },
    {
      text: '提示词集',
      collapsed: true,
      items: [
        { text: '总索引', link: '/instructions/prompts/' },
        { text: '通用提示词', link: '/instructions/prompts/base-sentence' },
        { text: 'Vue 提示词', link: '/instructions/prompts/vue/prompts' },
        { text: 'React 提示词', link: '/instructions/prompts/react/prompts' },
        { text: 'Flutter 提示词', link: '/instructions/prompts/flutter/prompts' },
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
          text: 'Vue 装配架构代码模板',
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
          collapsed: true,

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
    {
      text: 'React',
      collapsed: false,
      items: [
        {
          text: 'React 装配架构 AI 指令集',
          collapsed: true,
          items: [
            { text: '概述', link: '/instructions/react/react-assembler/docs/' },
            { text: '设计架构', link: '/instructions/react/react-assembler/docs/design' },
            { text: '执行流程', link: '/instructions/react/react-assembler/docs/execution-flow' },
            { text: '配置指南', link: '/instructions/react/react-assembler/docs/config-guide' },
            { text: '文件索引', link: '/instructions/react/react-assembler/docs/file-index' },
          ],
        },
        {
          text: 'React 通用代码检查指令集',
          collapsed: true,
          items: [
            { text: '概述', link: '/instructions/react/react-code-review/docs/' },
            { text: '设计架构', link: '/instructions/react/react-code-review/docs/design' },
            {
              text: '执行流程',
              link: '/instructions/react/react-code-review/docs/execution-flow',
            },
            {
              text: '配置指南',
              link: '/instructions/react/react-code-review/docs/config-guide',
            },
            { text: '文件索引', link: '/instructions/react/react-code-review/docs/file-index' },
          ],
        },
        {
          text: '版本记录',
          collapsed: true,
          items: [
            {
              text: 'React 装配架构 — 变更日志',
              link: '/instructions/react/react-assembler/VERSION',
            },
            {
              text: 'React 通用代码检查 — 变更日志',
              link: '/instructions/react/react-code-review/VERSION',
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
          text: 'Flutter 装配架构 AI 指令集',
          collapsed: true,
          items: [
            { text: '概述', link: '/instructions/flutter/flutter-assembler/docs/' },
            { text: '设计架构', link: '/instructions/flutter/flutter-assembler/docs/design' },
            {
              text: '执行流程',
              link: '/instructions/flutter/flutter-assembler/docs/execution-flow',
            },
            { text: '配置指南', link: '/instructions/flutter/flutter-assembler/docs/config-guide' },
            { text: '文件索引', link: '/instructions/flutter/flutter-assembler/docs/file-index' },
          ],
        },
        {
          text: 'Flutter 通用代码检查指令集',
          collapsed: true,
          items: [
            { text: '概述', link: '/instructions/flutter/flutter-code-review/docs/' },
            { text: '设计架构', link: '/instructions/flutter/flutter-code-review/docs/design' },
            {
              text: '执行流程',
              link: '/instructions/flutter/flutter-code-review/docs/execution-flow',
            },
            {
              text: '配置指南',
              link: '/instructions/flutter/flutter-code-review/docs/config-guide',
            },
            {
              text: '文件索引',
              link: '/instructions/flutter/flutter-code-review/docs/file-index',
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
            },
            {
              text: 'Flutter 通用代码检查 — 变更日志',
              link: '/instructions/flutter/flutter-code-review/VERSION',
            },
          ],
        },
      ],
    },
  ],
}
