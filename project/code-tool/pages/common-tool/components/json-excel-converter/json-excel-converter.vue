<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto shadow-2 transition-base" style="max-width: 1300px">
      <!-- 头部工具栏 -->
      <q-card-section class="bg-indigo-8 text-white">
        <div class="row items-center q-gutter-sm">
          <q-icon name="auto_fix_high" size="sm" />
          <div class="text-h6 text-weight-bold">JSON-Excel 转换器</div>
          <q-space />
          <q-btn flat color="white" label="样例数据" icon="lightbulb" size="sm" @click="loadSample" />
          <q-btn flat color="white" label="清空" icon="delete" size="sm" @click="clearAll" />
          <q-btn color="white" text-color="indigo-8" label="下载 JSON" icon="download" size="sm" @click="downloadJson" :disable="!finalData.length" />
          <q-btn color="white" text-color="positive" label="导出 Excel" icon="description" size="sm" @click="exportToExcel" :disable="!finalData.length" />
        </div>
      </q-card-section>

      <q-card-section class="row q-col-gutter-lg">
        <!-- 左侧：输入控制区 -->
        <div class="col-12 col-md-5 q-gutter-y-md">
          <q-tabs v-model="inputTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify">
            <q-tab name="paste" icon="content_paste" label="粘贴代码" />
            <q-tab name="file" icon="upload_file" label="导入文件" />
          </q-tabs>

          <q-tab-panels v-model="inputTab" animated class="bg-transparent">
            <q-tab-panel name="paste" class="q-pa-none">
              <q-input v-model="rawInput" type="textarea" filled label="支持标准 JSON 或 JS 数组" rows="10" class="font-mono" @update:model-value="handleParse" />
            </q-tab-panel>
            <q-tab-panel name="file" class="q-pa-none">
              <q-file v-model="filePicker" filled label="选择文件" accept=".json,.txt,.js" @update:model-value="handleFileImport" clearable>
                <template v-slot:prepend><q-icon name="cloud_upload" /></template>
              </q-file>
            </q-tab-panel>
          </q-tab-panels>

          <!-- 治理配置 -->
          <q-list bordered class="rounded-borders transition-base control-panel shadow-1">
            <q-item-label header class="text-weight-bold text-primary">数据治理配置</q-item-label>
            <q-item tag="label" v-ripple>
              <q-item-section avatar><q-checkbox v-model="config.autoTypeRepair" color="positive" /></q-item-section>
              <q-item-section>
                <q-item-label>类型自动修复</q-item-label>
                <q-item-label caption>自动转换数字字符串、布尔值及 Null</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Key 命名风格转换</q-item-label>
                <div class="row q-gutter-xs q-mt-xs">
                  <q-btn size="sm" :outline="config.caseType !== 'camel'" color="primary" label="小驼峰" @click="config.caseType = 'camel'" />
                  <q-btn size="sm" :outline="config.caseType !== 'snake'" color="primary" label="下划线" @click="config.caseType = 'snake'" />
                  <q-btn size="sm" flat color="grey" label="重置" @click="config.caseType = ''" />
                </div>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-input v-model="filterKeys" dense filled label="仅保留字段 (逗号隔开)" placeholder="例如: id, name" />
              </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section avatar><q-checkbox v-model="config.maskSensitive" color="red" /></q-item-section>
              <q-item-section><q-item-label>智能脱敏开启</q-item-label></q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- 右侧：预览区 -->
        <div class="col-12 col-md-7">
          <q-tabs v-model="viewTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="left">
            <q-tab name="table" label="在线表格" icon="grid_on" />
            <q-tab name="json" label="预览结果" icon="code" />
          </q-tabs>

          <q-tab-panels v-model="viewTab" animated class="bg-transparent shadow-1 rounded-borders">
            <q-tab-panel name="table" class="q-pa-none q-pt-md">
              <q-table :rows="finalData" :columns="tableColumns" flat bordered :pagination="{ rowsPerPage: 10 }" class="result-table-area">
                <template v-slot:top-right>
                  <q-badge color="indigo" class="q-pa-sm">共 {{ finalData.length }} 条</q-badge>
                </template>
              </q-table>
            </q-tab-panel>
            <q-tab-panel name="json" class="q-pa-none q-pt-md">
              <div class="relative-position">
                <q-btn icon="content_copy" color="primary" flat dense class="absolute-top-right z-top" @click="copy(formattedJson)" />
                <q-input v-model="formattedJson" type="textarea" filled readonly rows="22" class="font-mono result-area" />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { useJsonExcel } from './composables/use-json-excel.js'

const {
  inputTab, viewTab, rawInput, filePicker, filterKeys, config,
  finalData, formattedJson, tableColumns,
  handleParse, handleFileImport, clearAll, loadSample, copy, downloadJson, exportToExcel,
} = useJsonExcel()
</script>

<style scoped>
.generator-wrapper { transition: background-color 0.3s; }
.transition-base { transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s; }
.control-panel { background-color: rgba(128,128,128,0.05); transition: background-color 0.3s, border-color 0.3s; }
.font-mono :deep(textarea), .font-mono :deep(.q-table) { font-family: 'Fira Code', 'Courier New', monospace; font-size: 12px; line-height: 1.5; }
.result-area :deep(textarea) { background: rgba(128,128,128,0.02); }
.result-table-area { height: 540px; }
.rounded-borders { border-radius: 8px; }
</style>
