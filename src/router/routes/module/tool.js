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
        meta: { title: '技术导航', icon: () => h(HomeOutlined) },
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
    ],
  },
]

export const menu_routes_tool = generate_menu_from_routes(routes_tool)

console.log('menu_routes_tool', menu_routes_tool)
