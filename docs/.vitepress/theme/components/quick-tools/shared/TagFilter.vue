<!--
  TagFilter.vue — 标签多选筛选器（共享组件）

  架构层级：共享 UI 组件
  职责：
    1. 触发按钮显示已选数量，点击弹出浮层面板
    2. 浮层面板：搜索框 + 标签 chips 网格 + 全选按钮
    3. 支持实时搜索过滤、多选切换、一键全选

  Props：
    - tags: Array<string> — 可选标签列表
    - modelValue: Array<string> — 已选标签（v-model 双向绑定）

  使用方：ReviewTab / ProgressTab / DoubtTab / NoteTab
-->
<template>
  <div class="qt-tag-filter">
    <el-button @click="togglePanel" :type="modelValue.length ? 'primary' : 'default'" plain>
      🏷️ {{ modelValue.length ? `已选 ${modelValue.length} 个` : '全部标签' }}
      <el-icon v-if="modelValue.length" style="margin-left: 4px" @click.stop="clear">
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
            :type="modelValue.includes(tag) ? '' : 'info'"
            :effect="modelValue.includes(tag) ? 'dark' : 'plain'"
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
            <div class="qt-tag-footer-actions">
              <el-button
                type="primary"
                plain
                size="small"
                :disabled="!search || !hasUnselectedFiltered"
                @click="selectAll"
              >
                ✅ 全选
              </el-button>
              <el-button v-if="modelValue.length" text type="primary" @click="clear"
                >清除选择</el-button
              >
              <el-button type="primary" size="small" @click="expanded = false">确定</el-button>
            </div>
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
  modelValue: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const search = ref('')
const expanded = ref(false)

const filteredTags = computed(() => {
  if (!search.value) return props.tags
  const q = search.value.toLowerCase()
  return props.tags.filter((t) => t.toLowerCase().includes(q))
})

/** 过滤结果中是否有未选中的标签 */
const hasUnselectedFiltered = computed(() =>
  filteredTags.value.some((t) => !props.modelValue.includes(t)),
)

function toggle(tag) {
  const next = [...props.modelValue]
  const idx = next.indexOf(tag)
  if (idx >= 0) next.splice(idx, 1)
  else next.push(tag)
  emit('update:modelValue', next)
}

/** 全选当前过滤结果 */
function selectAll() {
  const merged = new Set(props.modelValue)
  filteredTags.value.forEach((t) => merged.add(t))
  emit('update:modelValue', [...merged])
}

function clear() {
  emit('update:modelValue', [])
  search.value = ''
}

function togglePanel() {
  expanded.value = !expanded.value
  if (!expanded.value) search.value = ''
}
</script>
