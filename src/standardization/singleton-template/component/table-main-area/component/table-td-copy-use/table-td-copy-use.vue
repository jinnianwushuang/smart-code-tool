<template>
  <div class="row q-pa-md q-gutter-sm" >
    <q-btn
      label="Alert"
      color="primary"
      @click="all_dialog_state.alert = true"
    />
    <q-btn
      label="Confirm"
      color="primary"
      @click="
        all_event_pipeline.table.handle_table_action_confirm_click('Confirm')
      "
    />
    <div>{{ user_info.name }}</div>
  </div>
</template>

<script setup>
import { all_singleton } from "src/standardization/backend-page-template/state/singleton.js";
import { all_event_pipeline } from "src/standardization/backend-page-template/module/event-pipeline/event-pipeline.js";
const { all_dialog_state,user_info } = all_singleton;
</script>

<style lang="scss" scoped></style>
