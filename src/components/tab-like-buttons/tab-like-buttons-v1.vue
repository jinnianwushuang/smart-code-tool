<template>
  <div class="row q-gutter-sm items-center q-pa-sm">
    <a-button
      v-for="(item, index) in tabs"
      :key="item.name"
      :type="modelValue === item.name ? activeColor : inactiveColor"
      @click="updateTab(item.name)"
      class="q-px-md border-r-8 rounded-borders"
    >
      <div class="row no-wrap items-center">
        <span class="text-caption q-mr-xs text-weight-light">{{ index + 1 }}.</span>
        <span>{{ item.label }}</span>
      </div>
    </a-button>
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
    default: '',
  },
  inactiveColor: {
    type: String,
    default: 'default',
  },
  inactiveTextColor: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const updateTab = (name) => {
  emit('update:modelValue', name)
  emit('change', name)
}
</script>
