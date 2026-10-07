<template>
  <div class="qt-tag-filter">
    <el-button @click="togglePanel" :type="modelValue ? 'primary' : 'default'" plain>
      🏷️ {{ modelValue || '全部标签' }}
      <el-icon v-if="modelValue" style="margin-left: 4px" @click.stop="clear">
        <span style="font-size: 12px">✕</span>
      </el-icon>
    </el-button>

    <!-- 浮层面板 -->
    <Teleport to="body">
      <el-dialog
        v-model="expanded"
        title="标签筛选"
        width="85vw"
        top="10vh"
        :close-on-click-modal="true"
        class="qt-tag-dialog"
      >
        <el-input
          v-model="search"
          placeholder="输入筛选标签..."
          clearable
          autofocus
          style="margin-bottom: 16px"
          size="large"
        />
        <div class="qt-tag-panel-grid">
          <el-tag
            v-for="tag in filteredTags"
            :key="tag"
            :type="modelValue === tag ? '' : 'info'"
            :effect="modelValue === tag ? 'dark' : 'plain'"
            class="qt-tag-chip"
            @click="toggle(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-empty
            v-if="filteredTags.length === 0"
            description="无匹配标签"
            :image-size="60"
            style="width: 100%"
          />
        </div>
        <template #footer>
          <div class="qt-tag-dialog-footer">
            <span class="qt-tag-panel-count">
              {{ filteredTags.length }} 个标签{{ search ? `（共 ${tags.length}）` : '' }}
            </span>
            <el-button v-if="modelValue" text type="primary" @click="clear">清除选择</el-button>
          </div>
        </template>
      </el-dialog>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tags: { type: Array, required: true },
  modelValue: { type: String, default: '' },
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
  } else {
    emit('update:modelValue', tag)
  }
}

function clear() {
  emit('update:modelValue', '')
  search.value = ''
}

function togglePanel() {
  expanded.value = !expanded.value
  if (!expanded.value) search.value = ''
}
</script>
