import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// Your site is live at https://jinnianwushuang.github.io/smart-code-tool/
// https://vite.dev/config/
export default defineConfig({
  base: '/smart-code-tool/', // 例如：'/my-vue-app/'
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
