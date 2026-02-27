export const routes = [
  {
    path: '/',
    component: () => import('src/layout/layout1.vue'),
    children: [
      {
        path: '',
        name: 'code-tool',

        component: () => import('src/pages/code-tool/index.vue'),
      },
    ],
  },
]
