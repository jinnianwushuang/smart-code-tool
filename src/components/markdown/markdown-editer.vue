<template>
  <div class="markdown-wrapper">
    <div class="toc-container" v-if="tocVisible">
      <h3>目录</h3>
      <ul class="toc-list">
        <li
          v-for="(item, index) in tocList"
          :key="index"
          :style="{ paddingLeft: (item.level - 1) * 16 + 'px' }"
        >
          <a @click="scrollToAnchor(item.slug)">{{ item.content }}</a>
        </li>
      </ul>
    </div>
    <div class="editor-container">
      <div class="toolbar">
        <button @click="downloadMarkdown" class="download-btn">
          <i class="fas fa-download"> 下载文档</i>
        </button>
      </div>
      <MdEditor
        v-model="mdText"
        :theme="theme"
        :previewTheme="previewTheme"
        :codeTheme="codeTheme"
        :toolbarsExclude="excludeTools"
        @onGetCatalog="handleCatalogChange"
        @onImageClick="handleImageClick"
        @onCopyCode="handleCopyCode"
        style="height: calc(100% - 50px)"
      />
    </div>
    <div class="image-modal" v-if="showImageModal" @click="showImageModal = false">
      <img :src="currentImageSrc" alt="Preview Image" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  tocVisible: {
    type: Boolean,
    default: true,
  },
  fileName: {
    type: String,
    default: 'document.md',
  },
})

const emit = defineEmits(['update:modelValue'])

const mdText = ref(props.modelValue)
const tocList = ref([])
const showImageModal = ref(false)
const currentImageSrc = ref('')
const theme = ref('light')
const previewTheme = ref('default')
const codeTheme = ref('atom')
const excludeTools = ['save', 'htmlPreview', 'catalog']

const handleCatalogChange = (list) => {
  tocList.value = list
}

const scrollToAnchor = (slug) => {
  const element = document.getElementById(slug)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleImageClick = (url) => {
  currentImageSrc.value = url
  showImageModal.value = true
}

const handleCopyCode = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('代码已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const downloadMarkdown = () => {
  const blob = new Blob([mdText.value], { type: 'text/markdown;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = props.fileName
  link.click()
  URL.revokeObjectURL(link.href)
}

onMounted(() => {
  //   mdText.value = `# 欢迎使用 Markdown Editor
  // ## 简介
  // 这是一个基于 [md-editor-v3](https://github.com/imzbf/md-editor-v3) 构建的 Vue 组件，支持丰富的功能。
  // ### 功能列表
  // - ✅ 目录导航
  // - ✅ 图片点击放大
  // - ✅ 代码一键复制
  // - ✅ 文档一键下载
  // - ✅ 高颜值主题
  // ## 示例代码
  // \`\`\`javascript
  // console.log('Hello, world!');
  // \`\`\`
  // ## 示例图片
  // ![示例图片](https://picsum.photos/400/300)
  // `
})
</script>

<style scoped>
.markdown-wrapper {
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.toc-container {
  width: 250px;
  padding: 20px;
  background-color: #f9f9f9;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.toc-list {
  list-style: none;
  padding-left: 0;
}

.toc-list li a {
  cursor: pointer;
  color: #333;
  text-decoration: none;
  display: block;
  padding: 4px 0;
  transition: color 0.2s ease;
}

.toc-list li a:hover {
  color: #007bff;
}

.editor-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.toolbar {
  padding-bottom: 10px;
}

.download-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: transform 0.2s ease;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.download-btn i {
  margin-right: 8px;
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
}

.image-modal img {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
}
</style>
