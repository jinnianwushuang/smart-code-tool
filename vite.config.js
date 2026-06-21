import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// 1. 扩展插件
dayjs.extend(utc)
dayjs.extend(timezone)

// https://quasar.dev/start/vite-plugin
// Your site is live at https://jinnianwushuang.github.io/smart-code-tool/
// https://vite.dev/config/
export default defineConfig(async () => {
  return {
    base: '/smart-code-tool/',
    // base: '/',

    define: {
      // 注入全局变量
      __APP_BUILD_TIME__: JSON.stringify(
        dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss Z'),
      ),
    },
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),

      quasar({
        sassVariables: fileURLToPath(new URL('./src/css/quasar-variables.scss', import.meta.url)),
      }),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        src: fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 23330,
    },
  }
})
