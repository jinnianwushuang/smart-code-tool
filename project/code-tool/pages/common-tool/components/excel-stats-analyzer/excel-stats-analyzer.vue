<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto shadow-2 transition-base" style="max-width: 1400px">
      <!-- 头部工具栏 -->
      <q-card-section class="header-section">
        <div class="row items-center q-gutter-sm">
          <q-icon name="analytics" size="sm" />
          <div class="text-h6 text-weight-bold">Excel 表格统计分析</div>
          <q-space />
          <q-btn
            flat
            color="white"
            label="样例数据"
            icon="lightbulb"
            size="sm"
            @click="loadSample"
          />
          <q-btn flat color="white" label="清空" icon="delete" size="sm" @click="clearAll" />
          <q-btn
            color="white"
            text-color="teal-8"
            label="复制 JSON"
            icon="content_copy"
            size="sm"
            @click="copyJson"
            :disable="!parsedRows.length"
          />
          <q-btn
            color="white"
            text-color="teal-8"
            label="导出 JSON"
            icon="download"
            size="sm"
            @click="downloadJson"
            :disable="!parsedRows.length"
          />
          <q-btn
            color="white"
            text-color="teal-8"
            label="导出 CSV"
            icon="download"
            size="sm"
            @click="exportCsv"
            :disable="!parsedRows.length"
          />
          <q-btn
            color="white"
            text-color="positive"
            label="导出 Excel"
            icon="description"
            size="sm"
            @click="exportExcel"
            :disable="!parsedRows.length"
          />
          <q-btn
            flat
            color="white"
            label="ECharts Spreadsheet"
            icon="open_in_new"
            size="sm"
            href="https://echarts.apache.org/zh/spreadsheet.html"
            target="_blank"
          />
        </div>
      </q-card-section>

      <!-- 输入区（可折叠） -->
      <q-card-section>
        <div class="row items-center q-mb-sm">
          <div class="text-subtitle2 text-weight-bold">数据输入</div>
          <q-space />
          <q-btn
            v-if="parsedRows.length"
            flat
            dense
            size="sm"
            :icon="inputCollapsed ? 'expand_more' : 'expand_less'"
            :label="inputCollapsed ? '展开' : '收起'"
            @click="inputCollapsed = !inputCollapsed"
          />
        </div>

        <div v-show="!inputCollapsed">
          <q-input
            v-model="rawInput"
            type="textarea"
            filled
            label="从 Excel / Confluence / 网页 复制表格数据粘贴到此处（首行为标题，制表符或换行分隔）"
            rows="8"
            class="font-mono"
            @update:model-value="handleInput"
          />
          <div class="row q-gutter-sm q-mt-sm items-center">
            <q-file
              v-model="uploadFile"
              filled
              dense
              label="或上传文件"
              accept=".xlsx,.xls,.csv,.tsv"
              :max-file-size="10 * 1024 * 1024"
              style="max-width: 300px"
              @update:model-value="handleFileUpload"
              clearable
            >
              <template v-slot:prepend><q-icon name="attach_file" /></template>
            </q-file>
            <div class="text-caption text-grey-6">支持 .xlsx / .csv / .tsv</div>
          </div>
        </div>

        <div v-if="parseError" class="text-negative q-mt-xs text-caption">{{ parseError }}</div>
        <div v-if="parsedRows.length" class="row items-center q-mt-xs q-gutter-md">
          <div class="text-caption text-grey-7">
            已解析：{{ parsedRows.length }} 行数据 × {{ headers.length }} 列（{{
              headers.join(', ')
            }}）
          </div>
          <q-checkbox v-model="enableIndex" dense size="sm" label="插入序号列" color="teal" />
        </div>
      </q-card-section>

      <q-separator v-if="parsedRows.length" />

      <!-- 数据表格 + 统计面板 -->
      <q-card-section v-if="parsedRows.length">
        <q-tabs
          v-model="mainTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
        >
          <q-tab name="table" label="数据表格" icon="grid_on" />
          <q-tab name="stats" label="统计分析" icon="bar_chart" />
          <q-tab name="group" label="分组统计" icon="group_work" />
        </q-tabs>

        <q-tab-panels v-model="mainTab" animated class="bg-transparent">
          <!-- 数据表格 -->
          <q-tab-panel name="table" class="q-pa-none q-pt-md">
            <q-table
              :rows="filteredRows"
              :columns="tableColumns"
              flat
              bordered
              :pagination="{ rowsPerPage: 20 }"
              class="result-table-area"
              row-key="__index"
            >
              <template v-slot:top>
                <q-input
                  v-model="tableFilter"
                  dense
                  outlined
                  debounce="300"
                  placeholder="搜索表格内容..."
                  clearable
                  style="max-width: 300px"
                >
                  <template v-slot:prepend><q-icon name="search" /></template>
                </q-input>
              </template>
              <template v-slot:top-right>
                <q-badge color="teal" class="q-pa-sm">
                  {{ filteredRows.length === parsedRows.length ? '' : `${filteredRows.length} / `
                  }}{{ parsedRows.length }} 条
                </q-badge>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- 统计分析 -->
          <q-tab-panel name="stats">
            <StatCards :stat-columns="statColumns" @open-chart="openChart" />
          </q-tab-panel>

          <!-- 分组统计 -->
          <q-tab-panel name="group">
            <GroupStats
              :group-col="groupCol"
              :value-col="valueCol"
              :group-col-options="groupColOptions"
              :value-col-options="valueColOptions"
              :group-stats="groupStats"
              @update:group-col="groupCol = $event"
              @update:value-col="valueCol = $event"
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <!-- 图表弹窗 -->
      <ChartDialog
        ref="chartDialogRef"
        v-model:show="chartDialogShow"
        :col="chartDialogCol"
        :rows="parsedRows"
        :headers="headers"
      />

      <!-- JSON 导出配置弹窗 -->
      <JsonExportDialog
        ref="jsonExportDialogRef"
        :headers="headers"
        :enableIndex="enableIndex"
        @export="handleJsonExport"
        @copy="handleJsonCopy"
      />
    </q-card>
  </div>
</template>

<script setup>
import { useExcelAnalyzer } from './composables/use-excel-analyzer.js'
import StatCards from './components/stat-cards.vue'
import GroupStats from './components/group-stats.vue'
import ChartDialog from './components/chart-dialog.vue'
import JsonExportDialog from './components/json-export-dialog.vue'

const {
  rawInput,
  parseError,
  headers,
  parsedRows,
  mainTab,
  enableIndex,
  inputCollapsed,
  uploadFile,
  tableFilter,
  groupCol,
  valueCol,
  chartDialogRef,
  chartDialogShow,
  chartDialogCol,
  jsonExportDialogRef,
  statColumns,
  groupColOptions,
  valueColOptions,
  groupStats,
  tableColumns,
  filteredRows,
  handleInput,
  handleFileUpload,
  openChart,
  copyJson,
  downloadJson,
  handleJsonExport,
  handleJsonCopy,
  exportCsv,
  exportExcel,
  loadSample,
  clearAll,
} = useExcelAnalyzer()
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
.header-section {
  background: linear-gradient(135deg, #00695c 0%, #00897b 100%);
  color: white;
}
.font-mono :deep(textarea),
.font-mono :deep(.q-table) {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
}
.result-table-area {
  height: 540px;
}
</style>
