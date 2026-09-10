<template>
  <q-expansion-item
    icon="settings"
    label="表头映射与过滤"
    header-class="control-panel border-radius-4"
    default-opened
  >
    <q-card>
      <q-card-section class="q-gutter-y-xs">
        <div v-if="rawHeaders.length === 0" class="text-caption text-grey text-center q-pa-md">
          暂无表头信息，请先导入数据
        </div>
        <div v-for="header in rawHeaders" :key="header" class="row items-center q-gutter-x-sm">
          <q-checkbox v-model="mapping[header].enabled" dense />
          <q-input
            v-model="mapping[header].newKey"
            dense
            filled
            :label="`原: ${header}`"
            class="col"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-expansion-item>
</template>

<script setup>
defineProps({
  rawHeaders: Object,
  mapping: Object,
})
</script>

<style scoped>
.control-panel {
  background-color: rgba(128, 128, 128, 0.05);
  transition:
    background-color 0.3s,
    border-color 0.3s;
}

.border-radius-4 {
  border-radius: 4px;
}
</style>
