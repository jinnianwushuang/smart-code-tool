import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// 项目根目录（配置文件在 entries/react-test-app/ 下，回退两级）
const projectRoot = fileURLToPath(new URL('../..', import.meta.url))

// React 架构验证 - 独立项目 Vite 配置
export default defineConfig(async () => {
  return {
    root: projectRoot,
    cacheDir: `${projectRoot}/node_modules/.vite-react-test-app`,
    base: '/smart-code-tool/react-test-app/',
    build: {
      outDir: `${projectRoot}/dist/react-test-app`,
      rollupOptions: {
        input: `${projectRoot}/entries/react-test-app/index.html`,
      },
    },
    define: {
      __APP_BUILD_TIME__: JSON.stringify(
        dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss Z'),
      ),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        project: `${projectRoot}/project/react-test-app`,
      },
    },
    server: {
      host: '127.0.0.1',
      port: 23370,
      cors: true,
    },
  }
})
