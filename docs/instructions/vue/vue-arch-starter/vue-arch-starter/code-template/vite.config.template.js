/**
 * Vite 配置参考模板
 *
 * 使用方式：
 * 1. 将此文件复制到项目根目录，重命名为 vite.config.js
 * 2. 根据项目实际情况调整 projectRoot、port 等配置
 * 3. 如果不需要 Quasar，删除 quasar 插件配置和 sassVariables
 * 4. 如果更换了 UI 框架，替换对应的插件配置
 */
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// 项目根目录（如果此文件在项目根目录，则用 import.meta.url 即可）
const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  // ── 插件配置 ──────────────────────────────────────────
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    // Quasar 插件配置 —— 如果不用 Quasar，删除此块
    quasar({
      sassVariables: `${projectRoot}/src/css/quasar-variables.scss`,
    }),
  ],

  // ── 路径别名 ──────────────────────────────────────────
  resolve: {
    alias: {
      // 【必须】src/ 别名 —— 模板代码中所有 import 都依赖此别名
      src: `${projectRoot}/src`,
    },
  },

  // ── CSS 预处理器 ──────────────────────────────────────
  css: {
    preprocessorOptions: {
      scss: {
        // 全局 SCSS 变量文件（在每個 SCSS 文件开头自动注入）
        additionalData: `@use "src/css/index.scss" as *;\n`,
      },
    },
  },

  // ── 开发服务器 ──────────────────────────────────────────
  server: {
    host: '0.0.0.0', // 同时监听 IPv4 + IPv6，避免 macOS 上 localhost 访问异常
    port: 5173, // 按需修改
    cors: true,
  },

  // ── 构建配置 ──────────────────────────────────────────
  build: {
    outDir: 'dist',
  },
})
