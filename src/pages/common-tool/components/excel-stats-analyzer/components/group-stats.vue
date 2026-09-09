<template>
  <div>
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-4">
        <q-select
          :model-value="groupCol"
          :options="groupColOptions"
          label="分组列（分类型）"
          outlined
          dense
          emit-value
          map-options
          clearable
          @update:model-value="$emit('update:groupCol', $event)"
        />
      </div>
      <div class="col-12 col-sm-4">
        <q-select
          :model-value="valueCol"
          :options="valueColOptions"
          label="统计列（数值型）"
          outlined
          dense
          emit-value
          map-options
          clearable
          @update:model-value="$emit('update:valueCol', $event)"
        />
      </div>
    </div>

    <q-table
      v-if="groupStats.length"
      :rows="groupStats"
      :columns="GROUP_TABLE_COLUMNS"
      flat
      bordered
      :pagination="{ rowsPerPage: 50 }"
      row-key="name"
    >
      <template v-slot:top-right>
        <q-badge color="teal" class="q-pa-sm">共 {{ groupStats.length }} 组</q-badge>
      </template>
    </q-table>
    <div v-else-if="groupCol && valueCol" class="text-grey text-center q-pa-lg">无有效分组数据</div>
    <div v-else class="text-grey text-center q-pa-lg">请选择分组列和统计列开始分组统计</div>
  </div>
</template>

<script setup>
import { GROUP_TABLE_COLUMNS } from '../utils/constants.js'

defineProps({
  groupCol: { type: String, default: '' },
  valueCol: { type: String, default: '' },
  groupColOptions: { type: Array, default: () => [] },
  valueColOptions: { type: Array, default: () => [] },
  groupStats: { type: Array, default: () => [] },
})

defineEmits(['update:groupCol', 'update:valueCol'])
</script>
