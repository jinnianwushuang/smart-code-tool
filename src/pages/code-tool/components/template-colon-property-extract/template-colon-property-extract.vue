<template>
  <q-page class="q-pa-md bg-grey-1">
    <q-card flat bordered class="q-mx-auto shadow-2" style="max-width: 900px">
      <q-card-section class="bg-cyan-8 text-white row items-center">
        <q-icon name="link" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">Vue 属性绑定提取器 (:Property)</div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- 正则提示与复制 -->
        <div class="row items-center bg-cyan-1 q-pa-sm rounded-borders border-cyan-2">
          <div class="text-caption text-cyan-9">
            通用匹配正则: <code class="bg-white q-px-xs">:([\w.-]+)="[^"]+"</code>
          </div>
          <q-space />
          <q-btn
            flat
            dense
            color="cyan-9"
            icon="content_copy"
            label="复制正则"
            size="sm"
            @click="copy(regPattern)"
          >
            <q-tooltip>复制正则用于 IDE 全局搜索</q-tooltip>
          </q-btn>
        </div>

        <!-- 代码输入区 -->
        <q-input
          v-model="rawTemplate"
          type="textarea"
          filled
          label="粘贴带有 : 绑定的 Vue Template 代码"
          placeholder='例如: <q-input :model-value="name" :disable="isPending" />'
          rows="10"
          @update:model-value="extractProps"
        />

        <!-- 控制与统计 -->
        <div class="row items-center q-gutter-x-md">
          <q-checkbox v-model="addComma" label="每行末尾增加逗号" color="cyan-8" />
          <q-separator vertical inset />
          <div class="text-subtitle2 text-grey-8">
            唯一属性总数: <q-badge color="cyan-8">{{ propList.length }}</q-badge>
          </div>
        </div>

        <div class="row q-my-md q-gutter-x-sm">
          <q-btn label="清空" color="grey" variant="flat" @click="reset" />
        </div>

        <!-- 结果输出区 -->
        <q-input
          v-model="formattedResult"
          type="textarea"
          filled
          readonly
          label="提取出的属性名列表"
          bg-color="white"
          rows="8"
        >
          <template v-slot:append>
            <q-btn
              round
              dense
              flat
              icon="content_copy"
              color="primary"
              @click="copy(formattedResult)"
              :disable="!formattedResult"
            >
              <q-tooltip>一键复制全部</q-tooltip>
            </q-btn>
          </template>
        </q-input>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { copyText, extract_base_variable } from 'src/output/common/project-common.js'

const $q = useQuasar()
const rawTemplate = ref('')
const addComma = ref(true)
const propList = ref([])

// 正则解释：
// :           匹配冒号
// ([\w.-]+)   捕获组1：匹配属性名（包含字母、数字、下划线、点、横杠）
// ="[^"]+"    匹配等号及引号内的任意内容
const regPattern = ref(':([\\w.-]+)="[^"]+"')

const extractProps = () => {
  if (!rawTemplate.value) {
    propList.value = []
    return
  }

  const propRegex = /:([\w.-]+)="([^"]+)"/g
  const foundProps = new Set()
  let match

  while ((match = propRegex.exec(rawTemplate.value)) !== null) {
    // console.error('match-----', match)
    let attrName = match[2].trim()
    if (attrName) {
      attrName = extract_base_variable(attrName)
      foundProps.add(attrName)
    }
  }

  propList.value = Array.from(foundProps)
}

// 格式化输出字符串
const formattedResult = computed(() => {
  if (propList.value.length === 0) return ''
  return propList.value.map((name) => `${name}${addComma.value ? ',' : ''}`).join('\n')
})

const copy = (text) => {
  if (!text) return
  copyText(text)
}

const reset = () => {
  rawTemplate.value = ''
  propList.value = []
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
.border-cyan-2 {
  border: 1px solid #80deea;
}
code {
  font-family: 'Fira Code', monospace;
  font-weight: bold;
}
</style>
