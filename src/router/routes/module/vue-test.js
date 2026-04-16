import { generate_menu_from_routes } from 'src/output/common/project-common.js'
import {
  HomeOutlined,
  UserOutlined,
  ShopOutlined,
  NotificationOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  CopyOutlined,
  SwitcherOutlined,
} from '@ant-design/icons-vue'
import { h } from 'vue'

export const routes_vue_test = [
  {
    path: '/vue-test',
    name: 'vue-test',
    redirect: { name: 'singleton-demo' },
    meta: { title: 'VUE架构验证', icon: () => h(ExperimentOutlined), hidden: false },
    component: () => import('src/layout/layout-vue-page/layout-vue-page.vue'),
    children: [
      {
        path: 'verification-explanation',
        name: 'verification-explanation',
        meta: { title: '验证解释', icon: () => h(NotificationOutlined), hidden: false },
        component: () =>
          import('src/pages/vue-test/verification-explanation/verification-explanation.vue'),
      },

      {
        path: 'multiton-demo',
        name: 'multiton-demo',
        meta: { title: '多例验证', icon: () => h(UserOutlined) },
        component: () => import('src/pages/vue-test/multiton-demo/multiton-demo.vue'),
        children: [
          {
            path: 'multiton-lv1',
            name: 'multiton-lv1',
            meta: { title: '多例验证-LV1' },
            component: () =>
              import('src/pages/vue-test/multiton-demo/multiton-lv1/multiton-lv1.vue'),
          },
          {
            path: 'multiton-lv2',
            name: 'multiton-lv2',
            meta: { title: '多例验证-LV2' },
            component: () =>
              import('src/pages/vue-test/multiton-demo/multiton-lv2/multiton-lv2.vue'),
          },
          {
            path: 'multiton-lv3',
            name: 'multiton-lv3',
            meta: { title: '多例验证-LV3' },
            component: () =>
              import('src/pages/vue-test/multiton-demo/multiton-lv3/multiton-lv3.vue'),
          },
          {
            path: 'multiton-lv5',
            name: 'multiton-lv5',
            meta: { title: '多例验证-LV5' },
            component: () =>
              import('src/pages/vue-test/multiton-demo/multiton-lv5-2/multiton-lv5-2.vue'),
          },
        ],
      },
      {
        path: 'singleton-demo',
        name: 'singleton-demo',
        redirect: { name: 'singleton-lv1' },
        meta: { title: '单例验证', icon: () => h(ShopOutlined) },
        component: () => import('src/pages/vue-test/singleton-demo/singleton-demo.vue'),
        children: [
          {
            path: 'singleton-lv1',
            name: 'singleton-lv1',
            meta: { title: '单例验证-LV1' },
            component: () =>
              import('src/pages/vue-test/singleton-demo/singleton-lv1/singleton-lv1.vue'),
          },
          {
            path: 'singleton-lv2',
            name: 'singleton-lv2',
            meta: { title: '单例验证-LV2' },
            component: () =>
              import('src/pages/vue-test/singleton-demo/singleton-lv2/singleton-lv2.vue'),
          },
          {
            path: 'singleton-lv3',
            name: 'singleton-lv3',
            meta: { title: '单例验证-LV3' },
            component: () =>
              import('src/pages/vue-test/singleton-demo/singleton-lv3/singleton-lv3.vue'),
          },
          {
            path: 'singleton-lv4',
            name: 'singleton-lv4',
            meta: { title: '单例验证-LV4' },
            component: () =>
              import('src/pages/vue-test/singleton-demo/singleton-lv4/singleton-lv4.vue'),
          },
          {
            path: 'singleton-lv5',
            name: 'singleton-lv5',
            meta: { title: '单例验证-LV5' },
            component: () =>
              import('src/pages/vue-test/singleton-demo/singleton-lv5/singleton-lv5.vue'),
          },
        ],
      },
    ],
  },
]

export const menu_vue_test = generate_menu_from_routes(routes_vue_test)

console.log(menu_vue_test)
