<template>
  <q-dialog v-model="all_dialog_state[model_key]" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6">警告</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum repellendus sit voluptate
          voluptas eveniet porro. Rerum blanditiis perferendis totam, ea at omnis vel numquam
          exercitationem aut, natus minima, porro labore.
        </div>

        <div>{{ current_record_to_dialog_data }}</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="确认"
          color="primary"
          @click="ALL_EVENT_PIPELINE.dialog.handle_dialog_copy_use_confirm_click"
        />
        <q-btn flat label="取消" color="danger" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
const model_key = 'dialog_copy_use'
const props = defineProps({
  all_singleton: {
    type: Object,
    required: true,
  },
  ALL_EVENT_PIPELINE: {
    type: Object,
    required: false,
  },
  all_config: {
    type: Object,
    required: false,
  },
})

const { all_singleton, ALL_EVENT_PIPELINE, all_config } = props
const { all_dialog_state, current_record_to_dialog_data } = all_singleton
</script>

<style lang="scss" scoped></style>
