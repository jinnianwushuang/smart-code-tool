import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// 项目根目录（配置文件在 entries/vue-test/ 下，回退两级）
const projectRoot = fileURLToPath(new URL('../..', import.meta.url))

// VUE 架构验证 - 独立项目 Vite 配置
export default defineConfig(async () => {
  return {
    root: projectRoot,
    base: '/smart-code-tool/vue-test-app/',
    build: {
      outDir: `${projectRoot}/dist/vue-test-app`,
      rollupOptions: {
        input: `${projectRoot}/index-vue-test.html`,
      },
    },
    define: {
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
    ],
    resolve: {
      alias: {
        src: `${projectRoot}/src`,
        project: `${projectRoot}/project/vue-test`,
      },
    },
    server: {
      host: '0.0.0.0',
      port: 23350,
    },
  }
})
