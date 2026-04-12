export const routes_tool = [
  {
    path: '/tool',
    name: 'tool',
    redirect: { name: 'domain-guide' },
    component: () => import('src/layout/layout-tool-page/layout-tool.vue'),
    children: [
      {
        path: 'domain-guide',
        name: 'domain-guide',
        component: () => import('src/pages/domain-guide/domain-guide.vue'),
      },
      {
        path: 'code-tool',
        name: 'code-tool',

        component: () => import('src/pages/code-tool/index.vue'),
      },
      {
        path: 'common-tool',
        name: 'common-tool',
        component: () => import('src/pages/common-tool/index.vue'),
      },
      {
        path: 'permanent-notice-calendar',
        name: 'permanent-notice-calendar',
        component: () => import('src/pages/single-smart-tool/permanent-notice-calendar/index.vue'),
      },

      {
        path: 'vue-architecture-document',
        name: 'vue-architecture-document',
        component: () =>
          import('src/pages/architecture-document/vue/vue-architecture-document.vue'),
      },
    ],
  },
]
