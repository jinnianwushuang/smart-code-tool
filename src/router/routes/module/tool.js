import { generate_menu_from_routes } from 'src/output/common/project-common.js'
import {
  HomeOutlined,
  CodeOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ToolOutlined,
} from '@ant-design/icons-vue'
import { h } from 'vue'

export const routes_tool = [
  {
    path: '/tool',
    name: 'tool',
    redirect: { name: 'domain-guide' },
    meta: { title: 'VUE架构验证', icon: () => h(HomeOutlined) },
    component: () => import('src/layout/layout-tool-page/layout-tool.vue'),
    children: [
      {
        path: 'domain-guide',
        name: 'domain-guide',
        meta: { title: '架构导航', icon: () => h(HomeOutlined) },
        component: () => import('src/pages/domain-guide/domain-guide.vue'),
      },
      {
        path: 'code-tool',
        name: 'code-tool',
        meta: { title: '代码工具', icon: () => h(CodeOutlined) },
        component: () => import('src/pages/code-tool/index.vue'),
      },
      {
        path: 'common-tool',
        name: 'common-tool',
        meta: { title: '通用工具', icon: () => h(ToolOutlined) },
        component: () => import('src/pages/common-tool/index.vue'),
      },
      {
        path: 'permanent-notice-calendar',
        name: 'permanent-notice-calendar',
        meta: { title: '万年历', icon: () => h(CalendarOutlined) },
        component: () => import('src/pages/single-smart-tool/permanent-notice-calendar/index.vue'),
      },
      {
        path: 'ai-document',
        name: 'ai-document',
        meta: { title: 'AI和架构', icon: () => h('span', 'AI') },
        component: () => import('src/pages/architecture-document/ai/document.vue'),
      },

      {
        path: 'vue-architecture-document',
        name: 'vue-architecture-document',
        meta: { title: 'VUE', icon: () => h('span', 'VU') },
        component: () => import('src/pages/architecture-document/vue/document.vue'),
      },
      {
        path: 'react-document',
        name: 'react-document',
        meta: { title: 'REACT', icon: () => h('span', 'RE') },
        component: () => import('src/pages/architecture-document/react/document.vue'),
      },
      {
        path: 'flutter-document',
        name: 'flutter-document',
        meta: { title: 'FLUTTER', icon: () => h('span', 'FL') },
        component: () => import('src/pages/architecture-document/flutter/document.vue'),
      },
      {
        path: 'python-document',
        name: 'python-document',
        meta: { title: 'PYTHON', icon: () => h('span', 'PY') },
        component: () => import('src/pages/architecture-document/python/document.vue'),
      },

      {
        path: 'rust-document',
        name: 'rust-document',
        meta: { title: 'RUST', icon: () => h('span', 'RU') },
        component: () => import('src/pages/architecture-document/rust/document.vue'),
      },

      {
        path: 'code-analysis-document',
        name: 'code-analysis-document',
        meta: { title: '代码分析', icon: () => h('span', 'CA') },
        component: () => import('src/pages/architecture-document/code-analysis/document.vue'),
      },
    ],
  },
]

export const menu_routes_tool = generate_menu_from_routes(routes_tool)

console.log('menu_routes_tool', menu_routes_tool)
