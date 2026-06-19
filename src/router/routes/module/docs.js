import { generate_menu_from_routes } from 'src/output/common/project-common.js'
import {} from '@ant-design/icons-vue'
import { h } from 'vue'

export const routes_docs = [
  {
    path: '/docs',
    name: 'docs',

    meta: { title: '文档', icon: () => h(HomeOutlined) },
    component: () => import('src/layout/layout-docs-page/layout-docs.vue'),
    children: [
      {
        path: '/',
        name: 'docs-index',
        meta: { title: '文档首页' },
        component: () => import('src/pages/docs/index.vue'),
      },
    ],
  },
]
