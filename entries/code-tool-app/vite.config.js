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

// 项目根目录（配置文件在 entries/code-tool-app/ 下，回退两级）
const projectRoot = fileURLToPath(new URL('../..', import.meta.url))

// https://quasar.dev/start/vite-plugin
// Your site is live at https://jinnianwushuang.github.io/smart-code-tool/
// https://vite.dev/config/
export default defineConfig(async () => {
  return {
    root: projectRoot,
    cacheDir: `${projectRoot}/node_modules/.vite-code-tool-app`,
    base: '/smart-code-tool/code-tool-app/',
    build: {
      outDir: `${projectRoot}/dist/code-tool-app`,
      rollupOptions: {
        input: `${projectRoot}/entries/code-tool-app/index.html`,
      },
    },

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
        sassVariables: `${projectRoot}/src/css/quasar-variables.scss`,
      }),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        src: `${projectRoot}/src`,
        project: `${projectRoot}/project/code-tool-app`,
      },
    },
    server: {
      host: '127.0.0.1',
      port: 23330,
      cors: true,
    },
  }
})
