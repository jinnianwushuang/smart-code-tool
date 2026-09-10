<template>
  <q-tab-panel name="batch" class="row q-col-gutter-md">
    <div class="col-12 col-md-4 q-gutter-y-md">
      <q-banner dense class="bg-blue-1 text-blue-9 rounded-borders">
        格式: 姓名,电话,职位 (每行一人)
      </q-banner>
      <q-input
        v-model="batchInput"
        type="textarea"
        filled
        label="数据源"
        placeholder="张三,13800138000,技术经理"
        rows="12"
      />
      <div class="row q-gutter-sm">
        <q-btn color="indigo" label="生成预览" icon="refresh" class="col" @click="generateBatch" />
        <q-btn
          color="green-8"
          label="导出 PDF"
          icon="picture_as_pdf"
          class="col"
          @click="exportBatchPDF"
          :disable="!batchCards.length"
        />
      </div>
    </div>

    <div class="col-12 col-md-8 q-pa-md">
      <div id="pdf-content" class="bg-white q-pa-md rounded-borders min-height-400">
        <div class="row q-col-gutter-md" v-if="batchCards.length">
          <div v-for="(card, index) in batchCards" :key="index" class="col-4 text-center">
            <div class="q-pa-sm border-dashed rounded-borders bg-grey-1">
              <qrcode-vue :value="card.vcard" :size="130" level="M" :foreground="foreground" />
              <div class="text-subtitle2 q-mt-xs">{{ card.name }}</div>
              <div class="text-caption text-grey-8">{{ card.title }}</div>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-center text-grey-4 q-pa-xl">输入数据并生成名片</div>
      </div>
    </div>
  </q-tab-panel>
</template>

<script setup>
import QrcodeVue from 'qrcode.vue'

defineProps({
  batchInput: Object,
  batchCards: Object,
  foreground: Object,
  generateBatch: Function,
  exportBatchPDF: Function,
})
</script>
