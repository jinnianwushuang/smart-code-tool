import { createRouter, createWebHashHistory } from 'vue-router'
import { routes_vue_test } from './routes/vue-test-routes.js'

const router = createRouter({
  // history: createWebHistory('/smart-code-tool/vue-test-app/'),
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [...routes_vue_test],
})

export default router
