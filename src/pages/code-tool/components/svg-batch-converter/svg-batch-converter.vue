<template>
  <div style="padding: 24px; background: #f0f2f5; min-height: 100vh">
    <a-card title="SVG 批量转 Vue (带单文件复制)" :bordered="false">
      <template #extra>
        <a-space>
          <a-checkbox v-model:checked="autoColor">自动 currentColor</a-checkbox>
          <a-button type="primary" :disabled="!fileList.length" @click="handleDownloadAll">
            <template #icon><DownloadOutlined /></template>
            打包下载 ZIP
          </a-button>
        </a-space>
      </template>

      <!-- 上传区 -->
      <a-upload-dragger
        v-model:fileList="fileList"
        :multiple="true"
        accept=".svg"
        :before-upload="() => false"
      >
        <p class="ant-upload-drag-icon"><InboxOutlined /></p>
        <p class="ant-upload-text">点击或拖拽 SVG 文件</p>
      </a-upload-dragger>

      <!-- 文件列表 -->
      <a-list
        v-if="fileList.length"
        item-layout="horizontal"
        :data-source="fileList"
        style="margin-top: 20px; background: #fff; border-radius: 8px"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <!-- 列表操作：复制按钮 -->
            <template #actions>
              <a-button size="small" type="link" @click="copySingleVue(item)">
                <template #icon><CopyOutlined /></template>
                复制 Vue 代码
              </a-button>
            </template>

            <a-list-item-meta
              :title="item.name"
              :description="`${(item.size / 1024).toFixed(1)} KB`"
            >
              <template #avatar>
                <div class="svg-preview" v-html="previews[item.uid]"></div>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { InboxOutlined, DownloadOutlined, CopyOutlined } from '@ant-design/icons-vue'
import { parse } from 'svgson'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const fileList = ref([])
const autoColor = ref(true)
const previews = ref({}) // 存储 SVG 预览 HTML

// 监听文件列表，生成实时预览图
watch(
  fileList,
  (newList) => {
    newList.forEach(async (file) => {
      if (!previews.value[file.uid]) {
        const text = (await file.originFileObj?.text()) || (await file.text())
        previews.value[file.uid] = text
      }
    })
  },
  { deep: true },
)

// 核心转换逻辑：处理颜色和结构
const convertToVue = async (svgRaw) => {
  const json = await parse(svgRaw)

  const processNode = (node) => {
    const { name, attributes, children } = node
    const newAttrs = { ...attributes }

    if (autoColor.value) {
      if (newAttrs.fill && newAttrs.fill !== 'none') newAttrs.fill = 'currentColor'
      if (newAttrs.stroke && newAttrs.stroke !== 'none') newAttrs.stroke = 'currentColor'
    }

    const attrsStr = Object.entries(newAttrs)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ')
    const childrenStr = children.map(processNode).join('')
    return `<${name} ${attrsStr}${children.length ? `>${childrenStr}</${name}>` : ' />'}`
  }

  const body = json.children.map(processNode).join('\n    ')
  return `<template>
  <svg xmlns="http://www.w3.org" viewBox="${json.attributes.viewBox || '0 0 24 24'}" v-bind="$attrs">
    ${body}
  </svg>
</template>

<script setup>
// Generated Component
<\/script>`
}

// 复制单个组件代码
const copySingleVue = async (file) => {
  try {
    const rawText = (await file.originFileObj?.text()) || (await file.text())
    const vueCode = await convertToVue(rawText)
    await navigator.clipboard.writeText(vueCode)
    message.success(`${file.name} 代码已复制`)
  } catch (err) {
    message.error('复制失败')
  }
}

// 批量下载逻辑
const handleDownloadAll = async () => {
  const zip = new JSZip()
  for (const file of fileList.value) {
    const rawText = (await file.originFileObj?.text()) || (await file.text())
    const vueCode = await convertToVue(rawText)
    const name = file.name.replace('.svg', '').replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    const compName = name.charAt(0).toUpperCase() + name.slice(1) + '.vue'
    zip.file(compName, vueCode)
  }
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, `icons-vue-${Date.now()}.zip`)
}
</script>

<style scoped>
.svg-preview {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 4px;
}
/* 深度选择器确保预览内的 SVG 尺寸合适 */
.svg-preview :deep(svg) {
  max-width: 100%;
  max-height: 100%;
}
</style>
