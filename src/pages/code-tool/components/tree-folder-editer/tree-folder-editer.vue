<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto editor-max-w transition-base">
      <!-- 顶部状态栏 -->
      <q-card-section class="bg-indigo-8 text-white">
        <div class="row items-center q-gutter-x-md">
          <q-icon name="account_tree" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold">树形文件夹编辑器</div>
          <q-space />
          <div class="row q-gutter-x-sm">
            <q-btn
              color="white"
              text-color="indigo-8"
              label="导出 JSON"
              icon="download"
              @click="downloadJSON"
            />
            <q-btn
              color="white"
              text-color="indigo-8"
              label="复制文本树"
              icon="content_copy"
              @click="copyTextTree"
            />
          </div>
        </div>
      </q-card-section>

      <!-- 左右分栏主体 -->
      <q-splitter v-model="splitRatio" :limits="[25, 75]" class="editor-splitter">
        <!-- 左侧: JSON 可视化编辑器 -->
        <template #before>
          <div class="panel-col">
            <div class="panel-toolbar">
              <q-icon name="data_object" size="18px" color="indigo-8" class="q-mr-xs" />
              <span class="text-subtitle2 text-weight-bold">JSON 编辑器</span>
              <q-space />
              <q-badge :color="jsonError ? 'negative' : 'positive'" class="q-mr-sm">
                {{ jsonError ? '语法错误' : '格式有效' }}
              </q-badge>
              <q-btn outline dense icon="auto_fix_high" label="格式化" size="sm" color="indigo-8" @click="formatJSON" :disable="!!jsonError" />
              <q-btn outline dense icon="vpn_key" label="修复 Key" size="sm" color="teal-8" @click="repairKeys" :disable="!!jsonError">
                <q-tooltip>重写所有 key 为算法生成的唯一路径 key</q-tooltip>
              </q-btn>
            </div>
            <!-- 错误提示条 -->
            <div v-if="jsonError" class="json-error-bar">
              <q-icon name="error_outline" size="14px" class="q-mr-xs" />
              {{ jsonError }}
            </div>
            <div class="json-editor-wrap">
              <Codemirror
                v-model="jsonText"
                :extensions="cmExtensions"
                placeholder="在此编辑 JSON 数据结构..."
                @ready="handleCmReady"
              />
            </div>
            <div class="panel-statusbar">
              <span>{{ nodeStats.directories }} 个目录 / {{ nodeStats.files }} 个文件</span>
              <q-space />
              <q-btn outline dense size="sm" icon="restart_alt" label="重置为默认" color="orange-8" @click="resetToDefault" />
            </div>
          </div>
        </template>

        <!-- 右侧: 树形结构联动预览 -->
        <template #after>
          <div class="panel-col">
            <div class="panel-toolbar">
              <q-icon name="org_chart" size="18px" color="indigo-8" class="q-mr-xs" />
              <span class="text-subtitle2 text-weight-bold">树形结构预览</span>
              <q-space />
              <a-input-search
                v-model:value="searchValue"
                placeholder="搜索文件名或注释..."
                style="width: 170px"
                size="small"
                allow-clear
              />
              <q-btn outline dense icon="unfold_more" label="展开全部" size="sm" color="indigo-8" @click="expandAll" />
              <q-btn outline dense icon="unfold_less" label="折叠全部" size="sm" color="indigo-8" @click="collapseAll" />
              <q-btn outline dense icon="add" label="根目录" size="sm" color="positive" @click="addNode(null, 'directory')" />
            </div>
            <div class="tree-scroll-area">
              <template v-if="parsedTree">
                <a-directory-tree
                  block-node
                  :tree-data="displayTreeData"
                  :expanded-keys="expandedKeys"
                  class="custom-tree"
                  @expand="(keys) => (expandedKeys = keys)"
                >
                  <template #title="{ title, key, isLeaf, description }">
                    <div class="tree-node-content">
                      <div class="node-main">
                        <a-input
                          v-if="editKey === key"
                          size="small"
                          v-model:value="editValue"
                          @blur="saveEdit(key)"
                          @pressEnter="saveEdit(key)"
                          v-focus
                        />
                        <span v-else class="node-title" v-html="highlightText(title)"></span>
                        <span v-if="description && editKey !== key" class="node-desc">
                          <span class="desc-prefix">//</span>
                          <span v-html="highlightText(description)"></span>
                        </span>
                      </div>
                      <div class="node-actions">
                        <a-tooltip title="编辑注释">
                          <comment-outlined @click.stop="openDescModal(key, description)" />
                        </a-tooltip>
                        <plus-circle-outlined v-if="!isLeaf" @click.stop="addNode(key, 'directory')" />
                        <file-add-outlined v-if="!isLeaf" @click.stop="addNode(key, 'file')" />
                        <edit-outlined @click.stop="enterEdit(key, title)" />
                        <delete-outlined @click.stop="deleteNode(key)" style="color: #ff4d4f" />
                      </div>
                    </div>
                  </template>
                </a-directory-tree>
                <a-empty v-if="displayTreeData.length === 0" description="未找到匹配项" style="margin-top: 40px" />
              </template>
              <div v-else class="tree-invalid-hint">
                <q-icon name="warning_amber" size="48px" color="orange" />
                <div class="text-subtitle1 q-mt-sm text-grey-7">JSON 存在语法错误，修复后自动恢复预览</div>
              </div>
            </div>
          </div>
        </template>
      </q-splitter>
    </q-card>

    <!-- 注释编辑弹窗 -->
    <a-modal v-model:open="descModalVisible" title="说明注释" @ok="handleDescOk">
      <a-textarea v-model:value="tempDescription" :rows="4" placeholder="输入功能描述..." />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, watch, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  PlusCircleOutlined,
  FileAddOutlined,
  EditOutlined,
  DeleteOutlined,
  CommentOutlined,
} from '@ant-design/icons-vue'
import Dexie from 'dexie'
import { Dark } from 'quasar'
import { Codemirror } from 'vue-codemirror'
import { basicSetup } from 'codemirror'
import { json } from '@codemirror/lang-json'
import { linter } from '@codemirror/lint'
import { oneDark } from '@codemirror/theme-one-dark'
import { Compartment } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { base_architecture_tree } from './config/base-architecture-tree.js'

// --- 数据库与核心状态 ---
const db = new Dexie('ArchitectureTreeFolderDB')
db.version(2).stores({ configs: 'id' })

const jsonText = ref('') // JSON 编辑器文本 (唯一数据源)
const expandedKeys = ref([])
const searchValue = ref('')
const editKey = ref(null)
const editValue = ref('')
const descModalVisible = ref(false)
const tempDescription = ref('')
const activeNodeKey = ref('')
const splitRatio = ref(50)

// --- CodeMirror 编辑器配置 ---
/** JSON 实时校验 Linter: 精确到错误位置, 在编辑器内显示波浪线与提示 */
const jsonLinter = linter((view) => {
  const text = view.state.doc.toString()
  if (!text.trim()) return []
  try {
    JSON.parse(text)
    return []
  } catch (e) {
    let pos = 0
    const posMatch = e.message.match(/position (\d+)/i)
    const lineColMatch = e.message.match(/line (\d+) column (\d+)/i)
    if (posMatch) {
      pos = parseInt(posMatch[1])
    } else if (lineColMatch) {
      const lineNo = Math.min(parseInt(lineColMatch[1]), view.state.doc.lines)
      pos = view.state.doc.line(lineNo).from + parseInt(lineColMatch[2]) - 1
    }
    return [{ from: Math.min(pos, view.state.doc.length), severity: 'error', message: e.message }]
  }
})

/** 主题隔间: 用于深浅色模式动态切换 */
const themeCompartment = new Compartment()
const cmView = shallowRef(null)

const cmExtensions = [
  basicSetup, // 行号 / 折叠 / 括号匹配 / 搜索替换 / 自动缩进 / 撤销重做等
  json(), // JSON 语法高亮与语言支持
  jsonLinter,
  EditorView.theme({
    '&': { fontSize: '13px', height: '100%' },
    '.cm-scroller': {
      fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
      lineHeight: '1.6',
    },
  }),
  themeCompartment.of(Dark.isActive ? oneDark : []),
]

const handleCmReady = ({ view }) => {
  cmView.value = view
}

// 跟随系统/应用深浅色模式切换编辑器主题
watch(
  () => Dark.isActive,
  (dark) => {
    cmView.value?.dispatch({
      effects: themeCompartment.reconfigure(dark ? oneDark : []),
    })
  },
)

// --- JSON 解析与校验 ---
const jsonError = computed(() => {
  if (!jsonText.value.trim()) return ''
  try {
    JSON.parse(jsonText.value)
    return ''
  } catch (e) {
    return e.message
  }
})

/** 解析后的树数据 (只读派生, 所有 key 统一由路径算法生成, 忽略 JSON 中的旧 key) */
const parsedTree = computed(() => {
  if (!jsonText.value.trim()) return []
  try {
    const data = JSON.parse(jsonText.value)
    if (!Array.isArray(data)) return []
    const normalize = (list, prefix) =>
      list.map((node, i) => {
        const key = `${prefix}${i}`
        const result = { ...node, key }
        if (node.children) result.children = normalize(node.children, `${key}-`)
        return result
      })
    return normalize(data, 'n-')
  } catch {
    return null
  }
})

/** 节点统计 */
const nodeStats = computed(() => {
  const stats = { directories: 0, files: 0 }
  const walk = (list) => {
    if (!Array.isArray(list)) return
    list.forEach((n) => {
      if (n.children) {
        stats.directories++
        walk(n.children)
      } else {
        stats.files++
      }
    })
  }
  if (parsedTree.value) walk(parsedTree.value)
  return stats
})

// --- 搜索过滤 ---
const displayTreeData = computed(() => {
  if (!parsedTree.value) return []
  const keyword = searchValue.value.toLowerCase().trim()
  if (!keyword) return parsedTree.value
  const filterTree = (data) => {
    return data
      .map((node) => ({ ...node }))
      .filter((node) => {
        const titleMatch = (node.title || '').toLowerCase().includes(keyword)
        const descMatch = (node.description || '').toLowerCase().includes(keyword)
        if (node.children) node.children = filterTree(node.children)
        return titleMatch || descMatch || (node.children && node.children.length > 0)
      })
  }
  return filterTree(parsedTree.value)
})

// 搜索时自动展开
watch(searchValue, (val) => {
  if (val && displayTreeData.value) {
    const keys = []
    const getAllKeys = (data) => {
      data.forEach((n) => {
        keys.push(n.key)
        if (n.children) getAllKeys(n.children)
      })
    }
    getAllKeys(displayTreeData.value)
    expandedKeys.value = keys
  }
})

const highlightText = (text) => {
  if (!searchValue.value || !text) return text
  const escaped = searchValue.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, '<span class="search-highlight">$1</span>')
}

// --- 数据持久化 (存储 JSON 文本, 固定单一数据源) ---
const STORAGE_ID = 'main'
const loadData = async () => {
  const config = await db.configs.get(STORAGE_ID)
  if (config && config.text) {
    jsonText.value = config.text
  } else {
    // 无数据时以 base_architecture_tree 作为基础展示
    jsonText.value = JSON.stringify(base_architecture_tree, null, 2)
  }
  expandAll()
}

let saveTimer = null
watch(jsonText, () => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    if (!jsonError.value) {
      await db.configs.put({ id: STORAGE_ID, text: jsonText.value })
    }
  }, 400)
})

onMounted(loadData)

// --- JSON 编辑器操作 ---
const formatJSON = () => {
  try {
    jsonText.value = JSON.stringify(JSON.parse(jsonText.value), null, 2)
  } catch (e) {
    message.error('格式化失败: ' + e.message)
  }
}

/** 修复 Key: 重写所有节点的 key 为基于路径的唯一确定性 key */
const repairKeys = () => {
  try {
    const data = JSON.parse(jsonText.value)
    if (!Array.isArray(data)) {
      message.warning('JSON 根节点必须是数组')
      return
    }
    const regenerate = (list, prefix) =>
      list.map((node, i) => {
        const key = `${prefix}${i}`
        const result = { ...node, key }
        if (node.children) result.children = regenerate(node.children, `${key}-`)
        return result
      })
    jsonText.value = JSON.stringify(regenerate(data, 'n-'), null, 2)
    message.success('所有 key 已重写为唯一路径 key')
  } catch (e) {
    message.error('修复失败: ' + e.message)
  }
}

const resetToDefault = () => {
  Modal.confirm({
    title: '确认重置？',
    content: '将恢复为默认架构模板，当前数据会丢失',
    onOk: () => {
      jsonText.value = JSON.stringify(base_architecture_tree, null, 2)
      expandAll()
    },
  })
}

/** 将修改后的树数据序列化回 JSON 文本 */
const syncToJSON = (data) => {
  jsonText.value = JSON.stringify(data, null, 2)
}

/** 深拷贝当前树用于修改 */
const cloneTree = () => JSON.parse(JSON.stringify(parsedTree.value || []))

// --- 树操作方法 (修改后同步回 JSON 文本) ---
const enterEdit = (key, title) => {
  editKey.value = key
  editValue.value = title
}

const saveEdit = (key) => {
  const data = cloneTree()
  const walk = (list) =>
    list.forEach((n) => {
      if (n.key === key) n.title = editValue.value
      if (n.children) walk(n.children)
    })
  walk(data)
  syncToJSON(data)
  editKey.value = null
}

const openDescModal = (key, desc) => {
  activeNodeKey.value = key
  tempDescription.value = desc || ''
  descModalVisible.value = true
}

const handleDescOk = () => {
  const data = cloneTree()
  const walk = (list) =>
    list.forEach((n) => {
      if (n.key === activeNodeKey.value) n.description = tempDescription.value
      if (n.children) walk(n.children)
    })
  walk(data)
  syncToJSON(data)
  descModalVisible.value = false
}

const addNode = (parentKey, type) => {
  const data = cloneTree()
  const newNode = {
    title: 'New Item',
    description: '',
    ...(type === 'directory' ? { children: [] } : {}),
  }
  // 新节点统一由路径算法生成 key (与 parsedTree 的 normalize 算法一致)
  let newKey
  if (!parentKey) {
    data.push(newNode)
    newKey = `n-${data.length - 1}`
  } else {
    const walk = (list) =>
      list.forEach((n) => {
        if (n.key === parentKey) {
          if (!n.children) n.children = []
          n.children.push(newNode)
          newKey = `${n.key}-${n.children.length - 1}`
        } else if (n.children) walk(n.children)
      })
    walk(data)
  }
  syncToJSON(data)
  if (parentKey && !expandedKeys.value.includes(parentKey)) {
    expandedKeys.value = [...expandedKeys.value, parentKey]
  }
  enterEdit(newKey, newNode.title)
}

const deleteNode = (key) => {
  Modal.confirm({
    title: '确认删除？',
    content: '删除后其所有子节点也将被移除',
    onOk: () => {
      const data = cloneTree()
      const filter = (list) =>
        list.filter((n) => {
          if (n.children) n.children = filter(n.children)
          return n.key !== key
        })
      syncToJSON(filter(data))
    },
  })
}

// --- 展开/折叠 ---
const expandAll = () => {
  const keys = []
  const walk = (list) => {
    if (!Array.isArray(list)) return
    list.forEach((n) => {
      if (n.children) {
        keys.push(n.key)
        walk(n.children)
      }
    })
  }
  walk(parsedTree.value)
  expandedKeys.value = keys
}

const collapseAll = () => {
  expandedKeys.value = []
}

// --- 导出功能 ---
const downloadJSON = () => {
  if (jsonError.value) {
    message.warning('JSON 存在语法错误，请先修复')
    return
  }
  const formatted = JSON.stringify(JSON.parse(jsonText.value), null, 2)
  const blob = new Blob([formatted], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.download = 'architecture-tree.json'
  a.href = url
  a.click()
  URL.revokeObjectURL(url)
}

/** 生成文本树并复制 */
const copyTextTree = () => {
  if (!parsedTree.value || jsonError.value) {
    message.warning('JSON 存在语法错误，请先修复')
    return
  }
  const lines = []
  const walk = (list, prefix) => {
    list.forEach((node, idx) => {
      const isLast = idx === list.length - 1
      const connector = isLast ? '└── ' : '├── '
      const desc = node.description ? `  // ${node.description}` : ''
      lines.push(`${prefix}${connector}${node.title || '(未命名)'}${desc}`)
      if (node.children && node.children.length) {
        walk(node.children, prefix + (isLast ? '    ' : '│   '))
      }
    })
  }
  walk(parsedTree.value, '')
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    message.success('文本树已复制到剪贴板')
  })
}

const vFocus = { mounted: (el) => el.focus() }
</script>

<style scoped>
.generator-wrapper {
  transition: background-color 0.3s;
}
.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
}
.editor-max-w {
  max-width: 1400px;
}
.editor-splitter {
  min-height: calc(100vh - 220px);
}
.panel-col {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 220px);
}
.panel-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.15);
  flex-shrink: 0;
}
.panel-statusbar {
  display: flex;
  align-items: center;
  padding: 4px 12px;
  border-top: 1px solid rgba(128, 128, 128, 0.15);
  font-size: 12px;
  color: rgba(128, 128, 128, 0.8);
  flex-shrink: 0;
}
.json-error-bar {
  display: flex;
  align-items: center;
  padding: 4px 12px;
  background: rgba(244, 67, 54, 0.08);
  color: #e53935;
  font-size: 12px;
  font-family: 'Fira Code', monospace;
  border-bottom: 1px solid rgba(244, 67, 54, 0.15);
  flex-shrink: 0;
}
.json-editor-wrap {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
.json-editor-wrap :deep(.cm-editor) {
  height: 100%;
}
.json-editor-wrap :deep(.cm-editor.cm-focused) {
  outline: none;
}
.tree-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}
.tree-invalid-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}
/* --- 树节点样式 (保持原有风格) --- */
.tree-node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 8px;
}
.node-main {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  overflow: hidden;
  font-family: 'Fira Code', monospace;
}
.node-desc {
  color: rgba(128, 128, 128, 0.7);
  font-size: 12px;
  font-style: italic;
}
.desc-prefix {
  opacity: 0.5;
  margin-right: 4px;
}
.node-actions {
  display: none;
  gap: 10px;
  color: var(--q-primary);
}
.tree-node-content:hover .node-actions {
  display: flex;
}
:deep(.ant-tree-node-content-wrapper) {
  display: flex !important;
  transition: background-color 0.2s;
}
:deep(.search-highlight) {
  color: #ff9800;
  font-weight: bold;
  text-decoration: underline;
  background: rgba(255, 152, 0, 0.1);
  padding: 0 2px;
  border-radius: 2px;
}
.custom-tree {
  background: transparent;
}
:deep(.ant-tree) {
  background: transparent !important;
}
</style>
