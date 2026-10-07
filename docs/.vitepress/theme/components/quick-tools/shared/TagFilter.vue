<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tags: { type: Array, required: true },
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '🔍 搜索标签...' },
})

const emit = defineEmits(['update:modelValue'])

const search = ref('')
const expanded = ref(false)

const filteredTags = computed(() => {
  if (!search.value) return props.tags
  const q = search.value.toLowerCase()
  return props.tags.filter((t) => t.toLowerCase().includes(q))
})

function toggle(tag) {
  if (props.modelValue === tag) {
    emit('update:modelValue', '')
    search.value = ''
  } else {
    emit('update:modelValue', tag)
    search.value = ''
    expanded.value = false
  }
}

function clear() {
  emit('update:modelValue', '')
  search.value = ''
}

function onBlur() {
  // 延迟关闭，让 click 事件先触发
  setTimeout(() => {
    expanded.value = false
    search.value = ''
  }, 200)
}
</script>

<template>
  <div class="qt-tag-filter" :class="{ expanded }">
    <div class="qt-tag-filter-trigger" @click="expanded = !expanded">
      <span v-if="modelValue" class="qt-tag-filter-selected">
        {{ modelValue }}
        <button class="qt-tag-filter-clear" @click.stop="clear" title="清除">✕</button>
      </span>
      <span v-else class="qt-tag-filter-placeholder">{{ placeholder }}</span>
      <span class="qt-tag-filter-arrow">▾</span>
    </div>
    <div v-if="expanded" class="qt-tag-filter-dropdown">
      <input
        v-model="search"
        class="qt-tag-filter-search"
        type="text"
        placeholder="输入筛选..."
        @click.stop
      />
      <div class="qt-tag-filter-list">
        <div
          v-for="tag in filteredTags"
          :key="tag"
          :class="['qt-tag-filter-item', { active: modelValue === tag }]"
          @click.stop="toggle(tag)"
        >
          {{ tag }}
        </div>
        <div v-if="filteredTags.length === 0" class="qt-tag-filter-empty">无匹配标签</div>
      </div>
    </div>
  </div>
</template>
