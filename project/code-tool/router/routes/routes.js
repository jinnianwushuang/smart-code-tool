import { routes_tool } from './module/tool.js'

export const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/tool',
    component: () => import('project/layout/layout.vue'),
    children: [...routes_tool],
  },
]
