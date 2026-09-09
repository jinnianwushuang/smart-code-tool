<template>
  <div>
    <div
      class="row items-center justify-between q-mb-md results-header q-pa-sm rounded-borders"
    >
      <div class="text-subtitle2">
        生成了 <span class="font-bold text-blue-600">{{ results.length }}</span> 个片段
      </div>
      <a-space>
        <a-button size="small" @click="downloadAsTxt">合并导出 (.txt)</a-button>
        <a-button type="primary" @click="downloadAsZip">打包下载 (.zip)</a-button>
      </a-space>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
      <q-card
        v-for="(item, index) in results"
        :key="index"
        flat
        bordered
        class="segment-card transition-base"
      >
        <q-card-section
          class="q-py-xs row items-center justify-between bg-grey-1 transition-base card-header"
        >
          <span class="text-caption text-weight-bold">#{{ index + 1 }}</span>
          <q-btn
            flat
            round
            dense
            icon="content_copy"
            size="xs"
            color="primary"
            @click="copyToClipboard(item)"
          >
            <q-tooltip>复制此段</q-tooltip>
          </q-btn>
        </q-card-section>
        <q-separator />
        <q-card-section class="text-xs text-grey-8 line-clamp-4 leading-relaxed font-mono">
          {{ item }}
        </q-card-section>
        <q-card-section class="q-pt-none row justify-end">
          <div class="text-[10px] text-grey-5">{{ item.length }} chars</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
defineProps({
  results: Object,
  downloadAsTxt: Function,
  downloadAsZip: Function,
  copyToClipboard: Function,
})
</script>

<style scoped>
.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.2s;
}

.results-header {
  background-color: rgba(33, 150, 243, 0.08);
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.segment-card {
  background: rgba(128, 128, 128, 0.02);
}

.segment-card:hover {
  border-color: var(--q-primary);
  transform: translateY(-2px);
}

.card-header {
  background: rgba(128, 128, 128, 0.05) !important;
}

.font-mono {
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rounded-borders {
  border-radius: 8px;
}
</style>
