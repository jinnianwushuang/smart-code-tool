<template>
  <div class="q-pa-md generator-wrapper">
    <div class="row q-col-gutter-md justify-center q-mx-auto max-w-1200">
      <!-- 左侧：治理与抽取控制 -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="shadow-2 transition-base">
          <q-card-section class="bg-indigo-8 text-white row items-center">
            <q-icon name="fact_check" size="sm" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">随机抽取</div>
          </q-card-section>

          <q-card-section class="q-gutter-y-md">
            <q-input
              v-model="rawInput"
              type="textarea"
              filled
              label="1. 原始数据输入"
              placeholder="粘贴任意包含分隔符的内容..."
              rows="5"
              @update:model-value="processAll"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model="blacklistInput"
                  dense
                  filled
                  label="黑名单 (排除项)"
                  placeholder="屏蔽这些项"
                  type="textarea"
                  rows="2"
                  @update:model-value="processAll"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="whitelistInput"
                  dense
                  filled
                  label="白名单 (准入项)"
                  placeholder="仅从中抽取"
                  type="textarea"
                  rows="2"
                  @update:model-value="processAll"
                />
              </div>
            </div>

            <!-- 标准预览与导出 -->
            <div v-if="processedList.length > 0" class="preview-section q-pa-sm rounded-borders">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-caption text-indigo-9 text-weight-bold">
                  标准数据预览 (共 {{ processedList.length }} 项):
                </div>
                <div class="row q-gutter-x-xs">
                  <q-btn
                    flat
                    dense
                    color="primary"
                    size="sm"
                    icon="content_copy"
                    label="复制"
                    @click="copy(processedList.join(', '))"
                  >
                    <q-tooltip>以逗号分隔复制</q-tooltip>
                  </q-btn>
                  <q-btn-dropdown
                    flat
                    dense
                    color="indigo-7"
                    size="sm"
                    icon="download"
                    label="导出标准项"
                  >
                    <q-list style="min-width: 120px">
                      <q-item clickable v-close-popup @click="exportStandard('txt')">
                        <q-item-section avatar
                          ><q-icon name="description" color="grey-8"
                        /></q-item-section>
                        <q-item-section>导出 .txt (每行一项)</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="exportStandard('csv')">
                        <q-item-section avatar
                          ><q-icon name="grid_on" color="green-7"
                        /></q-item-section>
                        <q-item-section>导出 .csv (Excel单列)</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </div>
              </div>
              <div class="row q-gutter-xs overflow-hidden" style="max-height: 60px">
                <q-badge v-for="item in processedList" :key="item" color="indigo-4">{{
                  item
                }}</q-badge>
              </div>
            </div>

            <div class="row q-col-gutter-sm items-center">
              <div class="col-4">
                <q-input
                  v-model.number="drawCount"
                  type="number"
                  filled
                  label="抽取数"
                  dense
                  :max="processedList.length"
                />
              </div>
              <div class="col-8">
                <q-btn
                  class="full-width"
                  color="primary"
                  label="执行随机抽取"
                  icon="bolt"
                  :disable="!processedList.length || drawCount <= 0"
                  @click="doDraw"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 结果展示 -->
        <q-card
          v-if="drawResults.length"
          flat
          bordered
          class="q-mt-md result-card animate__animated animate__fadeIn"
        >
          <q-card-section class="row items-center">
            <div class="text-h6 text-weight-bold result-text">
              🎉 结果: {{ drawResults.join(' / ') }}
            </div>
            <q-space />
            <q-btn
              flat
              round
              icon="content_copy"
              color="orange-9"
              @click="copy(drawResults.join('、'))"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- 右侧：快照库 -->
      <div class="col-12 col-md-5">
        <SnapshotLibrary
          v-model:libName="libName"
          :processedList="processedList"
          :historyList="historyList"
          :fileInput="fileInput"
          :saveToDB="saveToDB"
          :triggerImport="triggerImport"
          :exportHistory="exportHistory"
          :handleFileRestore="handleFileRestore"
          :loadFromHistory="loadFromHistory"
          :deleteHistory="deleteHistory"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRandomSelection } from './composables/use-random-selection.js'
import SnapshotLibrary from './components/snapshot-library.vue'

const {
  rawInput,
  blacklistInput,
  whitelistInput,
  processedList,
  drawCount,
  drawResults,
  libName,
  historyList,
  fileInput,
  processAll,
  exportStandard,
  doDraw,
  saveToDB,
  loadFromHistory,
  deleteHistory,
  triggerImport,
  handleFileRestore,
  exportHistory,
  copy,
} = useRandomSelection()
</script>

<style scoped>
.generator-wrapper {
  transition: background-color 0.3s;
}
.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.2s;
}
.max-w-1200 {
  max-width: 1200px;
}
.result-card {
  background: rgba(255, 160, 0, 0.1);
  border: 2px dashed rgba(255, 160, 0, 0.4);
}
.result-text {
  color: #ef6c00;
}
.rounded-borders {
  border-radius: 8px;
}
.preview-section {
  background: rgba(63, 81, 181, 0.05);
  border: 1px solid rgba(63, 81, 181, 0.1);
}
</style>
