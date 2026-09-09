<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto shadow-2 transition-base" style="max-width: 1200px">
      <!-- 头部工具栏 -->
      <q-card-section class="bg-indigo-8 text-white">
        <div class="row items-center q-gutter-sm">
          <q-icon name="transform" size="sm" />
          <div class="text-h6 text-weight-bold">Excel-JSON 转换器</div>
          <q-space />
          <q-btn flat color="white" label="清空" icon="clear_all" @click="clearAll" />
          <q-btn
            color="white"
            text-color="indigo-8"
            label="下载 JSON"
            icon="download"
            @click="downloadJson"
            :disable="!finalJson.length"
          />
        </div>
      </q-card-section>

      <q-card-section class="row q-col-gutter-lg">
        <!-- 左侧：输入与配置 -->
        <div class="col-12 col-md-5 q-gutter-y-md">
          <!-- 数据导入区 -->
          <q-tabs
            v-model="importTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="file" icon="upload_file" label="上传文件" />
            <q-tab name="paste" icon="content_paste" label="直接粘贴" />
          </q-tabs>

          <q-tab-panels v-model="importTab" animated class="bg-transparent">
            <q-tab-panel name="file" class="q-pa-none">
              <q-file
                v-model="excelFile"
                filled
                label="选择 Excel 文件"
                accept=".xlsx, .xls"
                @update:model-value="handleFileImport"
              >
                <template v-slot:prepend><q-icon name="attach_file" /></template>
              </q-file>
            </q-tab-panel>
            <q-tab-panel name="paste" class="q-pa-none">
              <q-input
                v-model="pasteText"
                type="textarea"
                filled
                label="粘贴 Excel 单元格"
                placeholder="从表格复制后在此 Ctrl+V"
                rows="5"
                @paste="handlePaste"
              />
            </q-tab-panel>
          </q-tab-panels>

          <!-- 字段映射与过滤 -->
          <HeaderMapping :rawHeaders="rawHeaders" :mapping="mapping" />

          <!-- 数据清洗开关 -->
          <div class="row q-gutter-sm">
            <q-toggle v-model="config.trimSpace" label="去除首尾空格" dense />
            <q-toggle v-model="config.removeEmpty" label="过滤空行" dense />
            <q-toggle
              v-model="config.asObject"
              label="单对象模式"
              dense
              v-if="finalJson.length === 1"
            />
          </div>
        </div>

        <!-- 右侧：实时预览 -->
        <div class="col-12 col-md-7">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle2 text-grey-8">
              JSON 实时预览
              <q-badge color="indigo" class="q-ml-sm">{{ finalJson.length }} 条记录</q-badge>
            </div>
            <div class="q-gutter-x-xs">
              <q-btn
                flat
                dense
                color="primary"
                icon="copy_all"
                label="复制"
                @click="copy(jsonString)"
                :disable="!jsonString"
              />
              <q-btn flat dense color="grey" icon="help_outline">
                <q-tooltip>映射功能可将 Excel 的中文列名转换为英文变量名</q-tooltip>
              </q-btn>
            </div>
          </div>

          <q-input
            v-model="jsonString"
            type="textarea"
            filled
            readonly
            rows="25"
            class="font-mono result-area"
            placeholder="数据转换结果将显示在这里..."
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import HeaderMapping from './components/header-mapping.vue'
import { useExcelJson } from './composables/use-excel-json.js'

const {
  importTab,
  excelFile,
  pasteText,
  rawHeaders,
  mapping,
  config,
  finalJson,
  jsonString,
  handleFileImport,
  handlePaste,
  copy,
  downloadJson,
  clearAll,
} = useExcelJson()
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

.font-mono :deep(textarea) {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.result-area :deep(textarea) {
  background: rgba(128, 128, 128, 0.02);
}
</style>
