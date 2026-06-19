import { routes_tool } from './module/tool.js'
import { routes_vue_test } from './module/vue-test.js'
import { routes_docs } from './module/docs.js'

export const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/tool',
    component: () => import('src/layout/layout.vue'),
    children: [...routes_tool, ...routes_vue_test, ...routes_docs],
  },
]
