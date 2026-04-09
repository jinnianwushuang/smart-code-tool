<template>
  <GlobalDialogWrapper
    :dialog_wrapper_config="dialog_wrapper_config"
    :all_singleton="all_singleton"
    :all_event_pipeline="all_event_pipeline"
    :all_config="all_config"
  />
</template>

<script setup>
import { all_singleton } from "src/standardization/backend-page-template/state/singleton.js";
import { all_event_pipeline } from "src/standardization/backend-page-template/module/event-pipeline/event-pipeline.js";
import { all_config } from "src/standardization/backend-page-template/state/config.js";
import { dialog_wrapper_config } from "./config/config.js";
</script>

<style lang="scss" scoped></style>
