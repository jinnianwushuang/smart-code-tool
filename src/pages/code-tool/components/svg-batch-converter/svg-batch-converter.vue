<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto max-w-1200 transition-base">
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="wallpaper" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">SVG 批量转 Vue 组件</div>
        <q-space />
        <div class="row items-center q-gutter-x-md">
          <q-checkbox v-model="autoColor" label="自动 currentColor" dark color="white" />
          <q-btn
            color="secondary"
            outline
            label="打包下载 ZIP"
            icon="download"
            size="sm"
            :disable="!fileList.length"
            @click="handleDownloadAll"
          />
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- 上传区 -->
        <a-upload-dragger
          v-model:fileList="fileList"
          :multiple="true"
          accept=".svg"
          :before-upload="() => false"
        >
          <p class="ant-upload-drag-icon ant-upload-icon-color"><InboxOutlined /></p>
          <p class="ant-upload-text ant-upload-text-color">点击或拖拽 SVG 文件到此处</p>
        </a-upload-dragger>

        <!-- 文件列表 -->
        <a-list
          v-if="fileList.length"
          item-layout="horizontal"
          :data-source="fileList"
          class="svg-list-container q-mt-md"
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
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { InboxOutlined, DownloadOutlined, CopyOutlined } from '@ant-design/icons-vue'
import { parse } from 'svgson'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { copyText } from 'src/output/common/project-common.js'

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
    copyText(vueCode)
  } catch (err) {
    console.error('复制失败', err)
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
.generator-wrapper {
  transition: background-color 0.3s;
}

.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
}

.max-w-1200 {
  max-width: 1200px;
}

.svg-list-container {
  background: rgba(128, 128, 128, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(128, 128, 128, 0.1);
  padding: 0 16px;
}

.svg-preview {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(128, 128, 128, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.1);
  border-radius: 4px;
  padding: 4px;
}
/* 深度选择器确保预览内的 SVG 尺寸合适 */
.svg-preview :deep(svg) {
  max-width: 100%;
  max-height: 100%;
}
</style>
