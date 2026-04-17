<template>
  <div>
    <div>多实例下层组件示例代码</div>

    <div>{{ current_card_data }}</div>

    <div>
      <q-btn
        label="like"
        :class="all_event_pipeline.other.compute_btn_class()"
        @click="all_event_pipeline.other.handle_xxx_demo"
      />
    </div>
  </div>
</template>

<script setup>

const {parent_payload} = defineProps({
  parent_payload: {
    type: Object,
    required: true,
  },

})


const { current_card_data ,all_event_pipeline } = parent_payload
</script>

<style lang="scss" scoped></style>
