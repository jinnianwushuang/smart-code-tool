<template>
  <div class="row q-pa-md q-gutter-sm">
    <q-btn label="Alert" color="primary" @click="all_dialog_state.alert = true" />
    <q-btn
      label="Confirm"
      color="primary"
      @click="ALL_EVENT_PIPELINE.table.handle_table_action_confirm_click('Confirm')"
    />
    <div>{{ user_info.name }}</div>
  </div>
</template>

<script setup>
import { all_singleton } from 'src/standardization/backend-page-template/state/singleton.js'
import { ALL_EVENT_PIPELINE } from 'src/standardization/backend-page-template/module/event-pipeline/event-pipeline.js'
const { all_dialog_state, user_info } = all_singleton
</script>

<style lang="scss" scoped></style>
