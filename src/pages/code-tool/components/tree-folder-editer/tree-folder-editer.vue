<template>
  <div style="padding: 24px; background: #f0f2f5; min-height: 100vh">
    <a-card :bordered="false" style="max-width: 950px; margin: 0 auto">
      <template #title>
        <a-space size="large">
          <a-radio-group v-model:value="currentArch" button-style="solid" @change="loadData">
            <a-radio-button value="Arch_A">架构 A</a-radio-button>
            <a-radio-button value="Arch_B">架构 B</a-radio-button>
            <a-radio-button value="Arch_C">架构 C</a-radio-button>
          </a-radio-group>
          <!-- 搜索框 -->
          <a-input-search
            v-model:value="searchValue"
            placeholder="搜索文件名或注释..."
            style="width: 250px"
            allow-clear
          />
        </a-space>
      </template>

      <template #extra>
        <a-space>
          <a-button @click="downloadJSON"><download-outlined />导出 JSON</a-button>
          <a-button type="primary" @click="addNode(null, 'directory')">新增根目录</a-button>
        </a-space>
      </template>

      <!-- 展示过滤后的树数据 -->
      <a-directory-tree
        draggable
        block-node
        :tree-data="displayTreeData"
        :expanded-keys="expandedKeys"
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
              <!-- 高亮显示标题 -->
              <span v-else class="node-title" v-html="highlightText(title)"></span>

              <!-- 高亮显示注释 -->
              <span v-if="description && editKey !== key" class="node-desc">
                // <span v-html="highlightText(description)"></span>
              </span>
            </div>

            <div class="node-actions">
              <a-tooltip title="编辑注释"
                ><comment-outlined @click.stop="openDescModal(key, title, description)"
              /></a-tooltip>
              <plus-circle-outlined v-if="!isLeaf" @click.stop="addNode(key, 'directory')" />
              <edit-outlined @click.stop="enterEdit(key, title)" />
              <delete-outlined @click.stop="deleteNode(key)" style="color: #ff4d4f" />
            </div>
          </div>
        </template>
      </a-directory-tree>

      <a-empty
        v-if="displayTreeData.length === 0"
        description="未找到匹配项"
        style="margin-top: 40px"
      />
    </a-card>

    <a-modal v-model:open="descModalVisible" title="说明注释" @ok="handleDescOk">
      <a-textarea v-model:value="tempDescription" :rows="4" placeholder="输入功能描述..." />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, toRaw, computed } from 'vue'
import { message, Modal } from 'ant-design-vue'
import {
  DownloadOutlined,
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CommentOutlined,
} from '@ant-design/icons-vue'
import Dexie from 'dexie'
import { base_architecture_tree } from './config/base-architecture-tree.js'

// --- 数据库与状态 ---
const db = new Dexie('ArchitectureTreeFolderDB')
db.version(1).stores({ configs: 'id' })

const currentArch = ref('Arch_A')
const rawTreeData = ref([]) // 原始持久化数据
const expandedKeys = ref([])
const searchValue = ref('')
const editKey = ref(null)
const editValue = ref('')
const descModalVisible = ref(false)
const tempDescription = ref('')
const activeNodeKey = ref('')

// --- 搜索过滤核心逻辑 ---
const displayTreeData = computed(() => {
  const keyword = searchValue.value.toLowerCase().trim()
  if (!keyword) return rawTreeData.value

  const filterTree = (data) => {
    return data
      .map((node) => ({ ...node }))
      .filter((node) => {
        const titleMatch = node.title.toLowerCase().includes(keyword)
        const descMatch = (node.description || '').toLowerCase().includes(keyword)

        if (node.children) {
          node.children = filterTree(node.children)
        }

        const hasChildMatch = node.children && node.children.length > 0

        // 如果本级匹配或子级有匹配，则保留
        const isMatch = titleMatch || descMatch || hasChildMatch

        // 匹配时自动记录需要展开的 Key
        if (isMatch && keyword && !expandedKeys.value.includes(node.key)) {
          // 这里不直接修改 ref 避免循环更新，通过 watch 处理
        }

        return isMatch
      })
  }
  return filterTree(rawTreeData.value)
})

// 搜索时自动展开节点
watch(searchValue, (val) => {
  if (val) {
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

/** 文字高亮处理 */
const highlightText = (text) => {
  if (!searchValue.value || !text) return text
  const regex = new RegExp(`(${searchValue.value})`, 'gi')
  return text.replace(regex, '<span style="color: #f50; font-weight: bold;">$1</span>')
}

// --- 数据持久化 ---
const loadData = async () => {
  const config = await db.configs.get(currentArch.value)
  rawTreeData.value = config ? config.data : base_architecture_tree
}

watch(
  rawTreeData,
  async (newVal) => {
    await db.configs.put({ id: currentArch.value, data: toRaw(newVal) })
  },
  { deep: true },
)

onMounted(loadData)

// --- 树操作方法 (作用于 rawTreeData) ---
const enterEdit = (key, title) => {
  editKey.value = key
  editValue.value = title
}
const saveEdit = (key) => {
  const walk = (list) =>
    list.forEach((n) => {
      if (n.key === key) n.title = editValue.value
      if (n.children) walk(n.children)
    })
  walk(rawTreeData.value)
  editKey.value = null
}
const openDescModal = (key, title, desc) => {
  activeNodeKey.value = key
  tempDescription.value = desc || ''
  descModalVisible.value = true
}
const handleDescOk = () => {
  const walk = (list) =>
    list.forEach((n) => {
      if (n.key === activeNodeKey.value) n.description = tempDescription.value
      if (n.children) walk(n.children)
    })
  walk(rawTreeData.value)
  descModalVisible.value = false
}
const addNode = (parentKey, type) => {
  const newNode = {
    title: 'New Item',
    key: `k-${Date.now()}`,
    isLeaf: type === 'file',
    description: '',
    children: type === 'directory' ? [] : undefined,
  }
  if (!parentKey) rawTreeData.value.push(newNode)
  else {
    const walk = (list) =>
      list.forEach((n) => {
        if (n.key === parentKey) n.children.push(newNode)
        else if (n.children) walk(n.children)
      })
    walk(rawTreeData.value)
  }
  enterEdit(newNode.key, newNode.title)
}
const deleteNode = (key) => {
  Modal.confirm({
    title: '确认删除？',
    onOk: () => {
      const filter = (list) =>
        list.filter((n) => {
          if (n.children) n.children = filter(n.children)
          return n.key !== key
        })
      rawTreeData.value = filter(rawTreeData.value)
    },
  })
}
const downloadJSON = () => {
  const blob = new Blob([JSON.stringify(rawTreeData.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.download = `${currentArch.value}.json`
  a.href = url
  a.click()
}
const vFocus = { mounted: (el) => el.focus() }
</script>

<style scoped>
.tree-node-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.node-main {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  overflow: hidden;
}
.node-desc {
  color: #8c8c8c;
  font-size: 12px;
  font-style: italic;
}
.node-actions {
  display: none;
  gap: 10px;
  color: #1890ff;
}
.tree-node-content:hover .node-actions {
  display: flex;
}
:deep(.ant-tree-node-content-wrapper) {
  display: flex !important;
}
</style>
