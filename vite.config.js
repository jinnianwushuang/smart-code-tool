import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import dayjs from 'dayjs'
// https://quasar.dev/start/vite-plugin
// Your site is live at https://jinnianwushuang.github.io/smart-code-tool/
// https://vite.dev/config/
export default defineConfig({
  base: '/smart-code-tool/', // 例如：'/my-vue-app/'
  define: {
    // 注入全局变量
    __APP_BUILD_TIME__: JSON.stringify(dayjs().format('YYYY-MM-DD HH:mm:ss')),
  },
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
