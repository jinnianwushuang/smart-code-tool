export const routes_vue_test = [
  {
    path: '/vue-test',
    name: 'vue-test',
    redirect: { name: 'singleton-demo' },
    component: () => import('src/layout/layout-vue-page/layout-vue-page.vue'),
    children: [
      {
        path: 'verification-explanation',
        name: 'verification-explanation',
        component: () =>
          import('src/pages/vue-test/verification-explanation/verification-explanation.vue'),
      },

      {
        path: 'multiton-demo',
        name: 'multiton-demo',
        component: () => import('src/pages/vue-test/multiton-demo/multiton-demo.vue'),
        children: [
          {
            path: 'multiton-lv1',
            name: 'multiton-lv1',
            component: () =>
              import('src/pages/vue-test/multiton-demo/multiton-lv1/multiton-lv1.vue'),
          },
          {
            path: 'multiton-lv2',
            name: 'multiton-lv2',
            component: () =>
              import('src/pages/vue-test/multiton-demo/multiton-lv2/multiton-lv2.vue'),
          },
          // {
          //   path: 'multiton-lv3',
          //   name: 'multiton-lv3',
          //   component: () =>
          //     import('src/pages/vue-test/multiton-demo/multiton-lv3/multiton-lv3.vue'),
          // },
          // {
          //   path: 'multiton-lv4',
          //   name: 'multiton-lv4',
          //   component: () =>
          //     import('src/pages/vue-test/multiton-demo/multiton-lv4/multiton-lv4.vue'),
          // },
        ],
      },
      {
        path: 'singleton-demo',
        name: 'singleton-demo',
        redirect: { name: 'singleton-lv1' },
        component: () => import('src/pages/vue-test/singleton-demo/singleton-demo.vue'),
        children: [
          {
            path: 'singleton-lv1',
            name: 'singleton-lv1',
            component: () =>
              import('src/pages/vue-test/singleton-demo/singleton-lv1/singleton-lv1.vue'),
          },
          {
            path: 'singleton-lv2',
            name: 'singleton-lv2',
            component: () =>
              import('src/pages/vue-test/singleton-demo/singleton-lv2/singleton-lv2.vue'),
          },
          {
            path: 'singleton-lv3',
            name: 'singleton-lv3',
            component: () =>
              import('src/pages/vue-test/singleton-demo/singleton-lv3/singleton-lv3.vue'),
          },
          {
            path: 'singleton-lv4',
            name: 'singleton-lv4',
            component: () =>
              import('src/pages/vue-test/singleton-demo/singleton-lv4/singleton-lv4.vue'),
          },
          {
            path: 'singleton-lv5',
            name: 'singleton-lv5',
            component: () =>
              import('src/pages/vue-test/singleton-demo/singleton-lv5/singleton-lv5.vue'),
          },
        ],
      },
    ],
  },
]
