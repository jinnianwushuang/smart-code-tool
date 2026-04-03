<template>
  <q-page class="q-pa-lg bg-grey-1">
    <q-card flat bordered class="q-mx-auto shadow-2">
      <q-card-section class="bg-indigo text-white row items-center">
        <q-icon name="style" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">Change-Case 全格式转换器</div>
      </q-card-section>
      <q-card-section class="q-gutter-y-md">
        <!-- 实时输入框 -->
        <q-input
          v-model="inputText"
          filled
          label="请输入原始字符串"
          placeholder="例如: helloWorld 或 user-profile-avatar"
          @update:model-value="processTransform"
          clearable
          bg-color="white"
        >
          <template #prepend>
            <q-btn color="grey" class="q-mr-lg" @click="inputText = ''">清空</q-btn>
          </template>
        </q-input>
        <!-- 转换结果表格 -->
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="method"
          flat
          bordered
          :pagination="{ rowsPerPage: 0 }"
          hide-bottom
          binary-state-sort
        >
          <template v-slot:body-cell-index="props">
            <q-td :props="props">
              <div class="text-weight-bold text-indigo">{{ props.rowIndex + 1 }}</div>
            </q-td>
          </template>
          <!-- 方法名列：显示函数名 -->
          <template v-slot:body-cell-method="props">
            <q-td :props="props">
              <div class="text-weight-bold text-indigo">{{ props.value }}</div>
            </q-td>
          </template>
          <template v-slot:body-cell-desc="props">
            <q-td :props="props">
              <div class="text-caption text-grey-7">{{ props.row.desc }}</div>
            </q-td>
          </template>
          <!-- 结果列：显示转换后的内容并支持复制 -->
          <template v-slot:body-cell-result="props">
            <q-td :props="props">
              <div class="row items-center no-wrap">
                <q-badge outline color="black" class="q-pa-sm text-body2 font-mono">
                  {{ props.value || '-' }}
                </q-badge>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-action1="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                color="grey-6"
                icon="content_copy"
                size="sm"
                class="q-ml-sm"
                @click="copyText(props.row.result)"
              >
                <q-tooltip>复制</q-tooltip>
              </q-btn>
            </q-td>
          </template>
          <template v-slot:body-cell-action="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                color="grey-6"
                icon="content_copy"
                size="sm"
                class="q-ml-sm"
                @click="copyText(props.row.result)"
              >
                <q-tooltip>复制</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import * as changeCase from 'change-case'
import { copyText } from 'src/output/common/project-common.js'
const $q = useQuasar()
const inputText = ref('src/pages/code-tool/components/string-change-case/string-change-case.vue')
const rows = ref([])
import { methodConfigs, suffixes, columns } from './config/config.js'
// 定义需要展示的方法及其描述（对应你提供的列表）

const processTransform = () => {
  let input = inputText.value?.trim()
  if (!input) {
    rows.value = []
    return
  }

  suffixes.map((suffix) => {
    if (input.endsWith(suffix)) {
      input = input.replace(suffix, '')
    }
  })

  rows.value = methodConfigs.map((config) => {
    let result = ''
    try {
      // 动态调用 change-case 对应方法
      if (input && typeof changeCase[config.method] === 'function') {
        result = changeCase[config.method](input)
      }
    } catch (e) {
      result = '转换错误'
    }
    return {
      ...config,
      result: result,
    }
  })
}

// 页面加载时初始转换一次
onMounted(() => {
  processTransform()
})
</script>
<style scoped>
.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>
