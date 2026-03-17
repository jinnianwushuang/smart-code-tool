<template>
  <div class="row q-gutter-sm items-center">
    <q-btn
      v-for="(item, index) in tabs"
      :key="item.name"
      unelevated
      :color="modelValue === item.name ? activeColor : inactiveColor"
      :text-color="modelValue === item.name ? activeTextColor : inactiveTextColor"
      @click="updateTab(item.name)"
      class="q-px-md border-r-8 rounded-borders"
    >
      <div class="row no-wrap items-center">
        <span class="text-caption q-mr-xs text-weight-light">{{ index + 1 }}.</span>
        <span>{{ item.label }}</span>
      </div>
    </q-btn>
  </div>
</template>

<script setup>
/**
 * 属性定义
 * modelValue: 当前选中的 tab name (支持 v-model)
 * tabs: 数据源 [{ name: 'xxx', label: '显示文字' }]
 */
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  tabs: {
    type: Array,
    default: () => [],
  },
  activeColor: {
    type: String,
    default: 'primary',
  },
  activeTextColor: {
    type: String,
    default: 'white',
  },
  inactiveColor: {
    type: String,
    default: 'grey-2',
  },
  inactiveTextColor: {
    type: String,
    default: 'grey-7',
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const updateTab = (name) => {
  emit('update:modelValue', name)
  emit('change', name)
}
</script>
