<template>
  <div class="md-viewer-wrapper">
    <!-- 渲染主体：必须包含 markdown-body 类名 -->
    <div class="markdown-body" v-html="renderedHtml" @click="handleGlobalClick"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import { full as emoji } from 'markdown-it-emoji'

// 引入样式
import 'github-markdown-css/github-markdown.css'
import 'highlight.js/styles/github.css'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

// 1. 配置 MarkdownIt
const md = new MarkdownIt({
  html: true,
  linkify: true,
  highlight: function (str, lang) {
    const code =
      lang && hljs.getLanguage(lang)
        ? hljs.highlight(str, { language: lang }).value
        : md.utils.escapeHtml(str)

    // 注入自定义 HTML：外层包裹 div 方便定位复制按钮
    return `<div class="code-block-wrapper">
              <button class="copy-btn" data-code="${encodeURIComponent(str)}">复制</button>
              <pre><code class="hljs ${lang}">${code}</code></pre>
            </div>`
  },
}).use(emoji) // 启用 Emoji 支持

const renderedHtml = computed(() => md.render(props.content))

// 2. 利用事件代理处理点击复制
const handleGlobalClick = (e) => {
  const target = e.target
  if (target.classList.contains('copy-btn')) {
    const code = decodeURIComponent(target.getAttribute('data-code'))
    navigator.clipboard.writeText(code).then(() => {
      const originalText = target.innerText
      target.innerText = '已复制!'
      target.classList.add('copied')
      setTimeout(() => {
        target.innerText = originalText
        target.classList.remove('copied')
      }, 2000)
    })
  }
}
</script>

<style>
/* 注意：这里的样式不要加 scoped，否则无法作用于 v-html 生成的内容 */

.md-viewer-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px;
  background: #fff;
}

/* 代码块容器 */
.code-block-wrapper {
  position: relative;
  margin-bottom: 16px;
}

/* 复制按钮样式 */
.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  font-size: 12px;
  color: #57606a;
  background-color: #f6f8fa;
  border: 1px solid rgba(27, 31, 36, 0.15);
  border-radius: 6px;
  cursor: pointer;
  opacity: 0; /* 默认隐藏 */
  transition:
    opacity 0.2s,
    background-color 0.2s;
  z-index: 10;
}

.code-block-wrapper:hover .copy-btn {
  opacity: 1; /* 鼠标悬停显示 */
}

.copy-btn:hover {
  background-color: #ebeff2;
}

.copy-btn.copied {
  color: #2da44e;
  border-color: #2da44e;
}

/* 适配移动端或常驻显示可调低 opacity */
@media (max-width: 768px) {
  .copy-btn {
    opacity: 0.8;
  }
}
</style>
