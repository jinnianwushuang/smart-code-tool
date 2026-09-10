<template>
  <q-card flat bordered class="full-height">
    <q-item :class="'bg-' + color + ' text-white'">
      <q-item-section>
        <q-item-label class="text-weight-bold">{{ title }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator />
    <q-card-section class="q-pa-none">
      <q-input
        :model-value="content"
        type="textarea"
        borderless
        readonly
        class="q-px-sm"
        placeholder="无数据"
        rows="10"
        input-style="font-family: monospace; font-size: 12px;"
      />
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <q-btn
        flat
        dense
        :color="color"
        icon="content_copy"
        label="复制"
        @click="$emit('copy')"
        :disable="!content"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped></style>
