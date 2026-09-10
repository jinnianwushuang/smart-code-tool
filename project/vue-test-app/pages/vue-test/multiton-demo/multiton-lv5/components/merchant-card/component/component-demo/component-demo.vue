<template>
  <div>
    <div>多实例下层组件示例代码</div>

    <div>{{ current_card_data }}</div>

    <div>
      <q-btn
        label="like"
        :class="ALL_EVENT_PIPELINE.other.compute_btn_class()"
        @click="ALL_EVENT_PIPELINE.other.handle_xxx_demo"
      />
    </div>
  </div>
</template>

<script setup>
const { parent_payload } = defineProps({
  parent_payload: {
    type: Object,
    required: true,
  },
})

const { current_card_data, ALL_EVENT_PIPELINE } = parent_payload
</script>

<style lang="scss" scoped></style>
