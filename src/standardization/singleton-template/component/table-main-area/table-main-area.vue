<template>
  <TableWithPagination
    :columns="columns"
    :data-source="table_data"
    :loading="table_loading"
    v-model:pagination="pagination"
    @change="ALL_EVENT_PIPELINE.table.on_table_change"
  />
</template>

<script setup>
import { all_singleton } from 'src/standardization/backend-page-template/state/singleton.js'
import { ALL_EVENT_PIPELINE } from 'src/standardization/backend-page-template/module/event-pipeline/event-pipeline.js'
import { columns } from './config/config.js'
const { table_data, table_loading, pagination } = all_singleton
</script>

<style lang="scss" scoped></style>
