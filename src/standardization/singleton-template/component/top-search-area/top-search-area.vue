<template>
  <div>
    <div class="row q-gutter-md">
      <q-input
        outlined
        dense
        v-model="query_form.key_word"
        label="关键字"
        placeholder="请输入关键字"
      />

      <q-space />
      <q-btn label="查询" color="primary" @click="ALL_EVENT_PIPELINE.other.handle_query_click" />
    </div>
  </div>
</template>

<script setup>
import { all_singleton } from 'src/standardization/backend-page-template/state/singleton.js'
import { ALL_EVENT_PIPELINE } from 'src/standardization/backend-page-template/module/event-pipeline/event-pipeline.js'
const { query_form } = all_singleton
</script>

<style lang="scss" scoped></style>
