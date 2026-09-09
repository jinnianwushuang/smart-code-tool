<template>
  <q-dialog v-model="show" persistent transition-show="slide-up" transition-hide="slide-down">
    <q-card style="min-width: 60vw; max-width: 75vw; max-height: 80vh">
      <q-card-section class="row items-center q-pb-none dialog-header">
        <div class="text-h6 text-weight-bold">导出 JSON - 列配置</div>
        <q-space />
        <q-btn flat round dense icon="close" @click="cancel" />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <!-- 统计信息 -->
        <div class="row q-gutter-md q-mb-md items-center">
          <q-badge color="grey-7" class="q-pa-sm"> 共 {{ keyMappings.length }} 个键 </q-badge>
          <q-badge color="primary" class="q-pa-sm"> 已选中 {{ selectedCount }} 个 </q-badge>
          <q-badge v-if="invalidCount > 0" color="negative" class="q-pa-sm">
            {{ invalidCount }} 个键不符合 JS 命名规范
          </q-badge>
          <q-badge v-else color="positive" class="q-pa-sm"> 所有键名均符合 JS 规范 </q-badge>
          <q-space />
          <q-btn flat dense size="sm" label="全选" icon="select_all" @click="selectAll" />
          <q-btn flat dense size="sm" label="全不选" icon="deselect" @click="deselectAll" />
          <q-btn flat dense size="sm" label="重置映射" icon="restart_alt" @click="resetMappings" />
          <q-btn
            v-if="invalidCount > 0"
            dense
            size="sm"
            label="自动修正"
            icon="auto_fix_high"
            color="warning"
            @click="autoFixInvalidKeys"
          >
            <q-tooltip>将不符合规范的键名自动生成合法名称</q-tooltip>
          </q-btn>
        </div>

        <!-- 列配置表格 -->
        <q-table
          :rows="keyMappings"
          :columns="columns"
          flat
          bordered
          :pagination="{ rowsPerPage: 0 }"
          row-key="original"
          hide-bottom
          class="config-table"
        >
          <template v-slot:body-cell-selected="props">
            <q-td :props="props">
              <q-checkbox v-model="props.row.selected" dense size="sm" color="primary" />
            </q-td>
          </template>

          <template v-slot:body-cell-original="props">
            <q-td :props="props">
              <span class="text-weight-medium">{{ props.row.original }}</span>
            </q-td>
          </template>

          <template v-slot:body-cell-mapped="props">
            <q-td :props="props" style="min-width: 200px">
              <q-input
                v-model="props.row.mapped"
                dense
                outlined
                :error="!isValidJsKey(props.row.mapped)"
                :placeholder="props.row.original"
                class="key-input"
              >
                <template v-if="!isValidJsKey(props.row.mapped)">
                  <q-tooltip
                    >不符合 JS 键命名规范（仅允许字母、数字、_、$，且不能以数字开头）</q-tooltip
                  >
                </template>
              </q-input>
            </q-td>
          </template>

          <template v-slot:body-cell-valid="props">
            <q-td :props="props">
              <q-icon
                :name="isValidJsKey(props.row.mapped) ? 'check_circle' : 'warning'"
                :color="isValidJsKey(props.row.mapped) ? 'positive' : 'negative'"
                size="sm"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-card-section class="row justify-end q-gutter-sm">
        <q-btn flat label="取消" color="grey" @click="cancel" />
        <q-btn
          v-if="mode === 'copy'"
          label="复制 JSON"
          color="teal"
          icon="content_copy"
          @click="confirmExport"
          :disable="selectedCount === 0"
        />
        <q-btn
          v-else
          label="确认导出"
          color="primary"
          icon="download"
          @click="confirmExport"
          :disable="selectedCount === 0"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  headers: { type: Array, default: () => [] },
  enableIndex: { type: Boolean, default: false },
})

const emit = defineEmits(['export', 'copy'])
const show = ref(false)
const keyMappings = ref([])
const mode = ref('export') // 'export' | 'copy'

const JS_KEY_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

const isValidJsKey = (key) => {
  return JS_KEY_REGEX.test(key)
}

const columns = [
  { name: 'selected', label: '导出', field: 'selected', align: 'center', style: 'width: 60px' },
  { name: 'original', label: '原始列名', field: 'original', align: 'left' },
  { name: 'mapped', label: 'Key 映射', field: 'mapped', align: 'left' },
  { name: 'valid', label: '规范', field: 'valid', align: 'center', style: 'width: 60px' },
]

const selectedCount = computed(() => keyMappings.value.filter((m) => m.selected).length)

const invalidCount = computed(
  () => keyMappings.value.filter((m) => m.selected && !isValidJsKey(m.mapped)).length,
)

const selectAll = () => {
  keyMappings.value.forEach((m) => (m.selected = true))
}

const deselectAll = () => {
  keyMappings.value.forEach((m) => (m.selected = false))
}

const resetMappings = () => {
  keyMappings.value.forEach((m) => (m.mapped = m.original))
}

/**
 * 将不合法的键名自动转换为合法 JS 键名
 * 策略：去除非法字符 → 若以数字开头加 field_ 前缀 → 若为空则用 field_N
 */
const autoFixInvalidKeys = () => {
  let counter = 1
  const usedKeys = new Set(keyMappings.value.map((m) => m.mapped).filter(isValidJsKey))

  keyMappings.value.forEach((m) => {
    if (!m.selected || isValidJsKey(m.mapped)) return

    // 尝试清洗原始名：去除非字母数字_$字符
    let sanitized = m.original.replace(/[^a-zA-Z0-9_$]/g, '')

    // 如果以数字开头，加前缀
    if (/^[0-9]/.test(sanitized)) {
      sanitized = 'field_' + sanitized
    }

    // 如果清洗后为空（如纯中文），用 field_N
    if (!sanitized || !isValidJsKey(sanitized)) {
      do {
        sanitized = `field_${counter++}`
      } while (usedKeys.has(sanitized))
    }

    // 确保不重复
    let finalKey = sanitized
    let suffix = 1
    while (usedKeys.has(finalKey)) {
      finalKey = `${sanitized}_${suffix++}`
    }

    m.mapped = finalKey
    usedKeys.add(finalKey)
  })
}

const open = (openMode = 'export') => {
  mode.value = openMode
  // 初始化 keyMappings
  const mappings = []
  if (props.enableIndex) {
    mappings.push({ original: '序号', mapped: 'index', selected: true })
  }
  props.headers.forEach((h) => {
    mappings.push({ original: h, mapped: h, selected: true })
  })
  keyMappings.value = mappings
  show.value = true
}

const cancel = () => {
  show.value = false
}

const confirmExport = () => {
  const selected = keyMappings.value.filter((m) => m.selected)
  const mapping = {}
  selected.forEach((m) => {
    mapping[m.original] = m.mapped
  })
  emit(mode.value === 'copy' ? 'copy' : 'export', mapping)
  show.value = false
}

defineExpose({ open })
</script>

<style scoped>
.dialog-header {
  background: var(--guide-card-bg, #f5f5f5);
  transition: background-color 0.3s;
}

.config-table {
  max-height: 50vh;
  overflow-y: auto;
}

.key-input {
  max-width: 280px;
}

.key-input :deep(.q-field__control) {
  min-height: 32px;
}
</style>
