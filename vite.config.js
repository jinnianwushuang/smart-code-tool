import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import dayjs from 'dayjs'
import Markdown from 'unplugin-vue-markdown/vite'
import { createHighlighter } from 'shiki'
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
      // 必须：允许 vue 插件处理 .md 文件
      include: [/\.vue$/, /\.md$/],
    }),
    // Markdown({
    //   // 可选：如果你想在 md 里使用 Vue 组件 允许在 MD 中解析 Vue 指令和组件
    //   vueTemplate: true,
    //   // 可选：给 md 文件增加包装类名
    //   wrapperClasses: 'markdown-body',
    // }),
    Markdown({
      vueTemplate: true,
      // 1. 配置代码高亮 (使用 Shiki)
      markdownItSetup: async (md) => {
        const highlighter = await createHighlighter({
          themes: ['github-dark', 'github-light'],
          langs: ['javascript', 'typescript', 'vue', 'html', 'css', 'bash'],
        })

        md.options.highlight = (code, lang) => {
          return highlighter.codeToHtml(code, {
            lang,
            theme: 'github-dark',
          })
        }

        // 2. 自定义插件：为代码块增加“复制”按钮的 HTML 结构
        const defaultRender = md.renderer.rules.fence
        md.renderer.rules.fence = (...args) => {
          const [tokens, idx] = args
          const content = tokens[idx].content.replace(/"/g, '&quot;')
          const rawCode = defaultRender(...args)
          // 在代码块外层包裹一层，并添加复制按钮
          return `
            <div class="code-block-wrapper" style="position: relative;">
              <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${content}\`).then(() => { this.innerText='已复制'; setTimeout(() => this.innerText='复制', 2000) })"
                style="position: absolute; right: 10px; top: 10px; z-index: 10; opacity: 0.6; cursor: pointer; border: none; border-radius: 4px; padding: 4px 8px; font-size: 12px;">
                复制
              </button>
              ${rawCode}
            </div>
          `
        }
      },
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
  server: {
    port: 23330,
  },
})
