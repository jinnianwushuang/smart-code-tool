<template>
  <q-card flat bordered class="full-height-card shadow-1 transition-base">
    <q-card-actions class="snapshot-actions q-mb-md">
      <q-input
        :model-value="libName"
        @update:model-value="$emit('update:libName', $event)"
        dense
        filled
        label="快照名称"
        class="col q-mr-sm"
      />
      <q-btn
        color="indigo"
        label="保存快照"
        icon="save"
        @click="saveToDB"
        :disable="!processedList.length"
      />
    </q-card-actions>
    <q-card-section class="bg-indigo-8 text-white row items-center">
      <q-icon name="inventory_2" size="xs" class="q-mr-xs" />
      <span>治理快照库</span>
      <q-space />
      <q-btn flat dense icon="file_upload" @click="triggerImport">
        <q-tooltip>恢复备份</q-tooltip>
      </q-btn>
      <q-btn flat dense icon="file_download" @click="exportHistory">
        <q-tooltip>备份全库</q-tooltip>
      </q-btn>
      <input
        type="file"
        ref="fileInput"
        class="hidden"
        accept=".json"
        @change="handleFileRestore"
      />
    </q-card-section>

    <q-card-section class="scroll-area">
      <q-list separator>
        <q-item
          v-for="item in historyList"
          :key="item.id"
          clickable
          v-ripple
          @click="loadFromHistory(item)"
        >
          <q-item-section>
            <q-item-label class="text-weight-bold text-indigo">{{ item.name }}</q-item-label>
            <q-item-label caption lines="1"
              >标准数据: {{ item.standardData.length }} 项</q-item-label
            >
          </q-item-section>
          <q-item-section side>
            <q-btn
              flat
              round
              icon="delete"
              color="grey-3"
              size="sm"
              @click.stop="deleteHistory(item.id)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  libName: Object,
  processedList: Object,
  historyList: Object,
  fileInput: Object,
  saveToDB: Function,
  triggerImport: Function,
  exportHistory: Function,
  handleFileRestore: Function,
  loadFromHistory: Function,
  deleteHistory: Function,
})
defineEmits(['update:libName'])
</script>

<style scoped>
.full-height-card {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}
.scroll-area {
  flex: 1;
  overflow-y: auto;
}
.snapshot-actions {
  background: rgba(128, 128, 128, 0.05);
  transition: background-color 0.3s;
}
.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.2s;
}
:deep(.text-indigo-9) {
  color: var(--q-primary) !important;
}
</style>
