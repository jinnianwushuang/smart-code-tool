<template>
  <q-dialog v-model="visible">
    <q-card style="min-width: 350px" class="transition-base">
      <q-card-section class="bg-indigo-8 text-white">
        <div class="text-h6">备注: {{ dateStr }}</div>
      </q-card-section>
      <q-card-section>
        <div class="q-mb-md text-primary text-caption">{{ lunarDetail }}</div>
        <q-input
          v-model="content"
          type="textarea"
          filled
          placeholder="在此输入备注..."
          rows="4"
          counter
          maxlength="100"
          @keydown="(e) => $emit('editor-keydown', e)"
        />
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="取消" v-close-popup />
        <q-btn flat label="保存" @click="$emit('save')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  dateStr: String,
  lunarDetail: String,
  content: String,
})

const emit = defineEmits(['update:modelValue', 'update:content', 'save', 'editor-keydown'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const content = computed({
  get: () => props.content,
  set: (val) => emit('update:content', val),
})
</script>

<style scoped>
.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.2s;
}
</style>
