import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
// https://quasar.dev/start/vite-plugin
// Your site is live at https://jinnianwushuang.github.io/smart-code-tool/
// https://vite.dev/config/
export default defineConfig({
  base: '/smart-code-tool/', // 例如：'/my-vue-app/'
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),

    // @quasar/plugin-vite options list:
    // https://github.com/quasarframework/quasar/blob/dev/vite-plugin/index.d.ts
    quasar({
      sassVariables: fileURLToPath(new URL('./src/css/quasar-variables.sass', import.meta.url)),
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
