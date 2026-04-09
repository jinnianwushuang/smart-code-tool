import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import dayjs from 'dayjs'
import Markdown from 'unplugin-vue-markdown/vite'
import { createHighlighter } from 'shiki'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import prism from 'markdown-it-prism'
import matter from 'gray-matter' // 引入 frontmatter 解析器
// 1. 扩展插件
dayjs.extend(utc)
dayjs.extend(timezone)

// https://quasar.dev/start/vite-plugin
// Your site is live at https://jinnianwushuang.github.io/smart-code-tool/
// https://vite.dev/config/
export default defineConfig(async () => {
  // 1. 初始化 Shiki 高亮器 (Vite 配置支持异步)
  const highlighter = await createHighlighter({
    themes: ['github-dark'],
    langs: ['javascript', 'typescript', 'vue', 'html', 'bash', 'json'],
  })
  return {
    base: '/smart-code-tool/', // 例如：'/my-vue-app/'、ß
    // base: '/',

    define: {
      // 注入全局变量
      __APP_BUILD_TIME__: JSON.stringify(
        dayjs().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss Z'),
      ),
    },
    plugins: [
      vue({
        template: { transformAssetUrls },
        // 必须：允许 vue 插件处理 .md 文件
        include: [/\.vue$/, /\.md$/],
      }),
      // https://github.com/unplugin/unplugin-vue-markdown/blob/HEAD/src/types.ts
      // 1. Markdown 必须在 Vue 之前
      Markdown({
        include: [/\.md$/],
        markdownUses: [prism],
        // 关键 1: 关闭自带的 Frontmatter 解析，避免重复冲突
        frontmatter: true,
        // 关键 2: 关闭 Head 注入，解决 useHead 报错
        headEnabled: true,
        // 关键 3: 开启代码块转义
        escapeCodeTagInterpolation: true,

        // 关键 4: 手动彻底剥离 Frontmatter，确保留给 md-it 的是纯净的 Markdown
        // transforms: {
        //   before(code) {
        //     // 使用 gray-matter 剥离，并确保返回的 content 前后有换行符
        //     // 否则 ## 标题如果紧贴顶部可能无法识别
        //     const { content } = matter(code)
        //     return `\n${content}\n`
        //   },
        // },

        // 关键 5: 使用最新的 markdownSetup 钩子
        markdownSetup(md) {
          md.renderer.rules.fence = (tokens, idx, options, env, self) => {
            const token = tokens[idx]
            const lang = token.info.trim() || 'text'
            const code = token.content

            // 1. 确保 highlighter 存在，否则回退到默认渲染
            if (!highlighter) {
              return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`
            }

            // 2. 生成高亮 HTML
            const highlightedHtml = highlighter.codeToHtml(code, {
              lang,
              // theme: 'vitesse-dark',
              // 切换为 github-dark 或 github-light
              theme: 'github-dark',
            })

            // 3. 对原始代码进行更安全的编码，防止在 HTML 属性中报错
            const safeRawCode = encodeURIComponent(code)

            // 注意：在返回的字符串中，确保 v-pre 所在标签包裹了所有可能含有 {{ }} 的内容
            return `
            <MarkdownCodeBlock lang="${lang}" rawCode="${safeRawCode}">
              <div v-pre>${highlightedHtml}</div>
            </MarkdownCodeBlock>\n`

            //             return `

            //   <div v-pre>${highlightedHtml}</div>
            //  \n`
          }
        },
      }),

      // MarkdownCodeBlock

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
  }
})
