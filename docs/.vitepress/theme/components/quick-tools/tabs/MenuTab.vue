<!--
  MenuTab.vue — 站点菜单导航（容器）

  包含两个子 tab：
    1. 🌿 铺展 — 完整树形视图 + 搜索过滤（TreeTab 内联）
    2. 📊 级联 — 多级级联选择器（CascadeTab 组件）

  依赖：
    - TreeNode.vue 铺展 tab 的递归渲染
    - CascadeTab.vue 级联 tab
    - config/sidebar.js 完整侧边栏配置（单一数据源）
-->
<template>
  <div class="menu-tab-container">
    <el-tabs v-model="activeSubTab" class="menu-sub-tabs">
      <el-tab-pane name="cascade">
        <template #label><span>📊 级联</span></template>
        <CascadeTab :navigate-to="navigateTo" :on-close="onClose" />
      </el-tab-pane>
      <el-tab-pane name="tree">
        <template #label><span>🌿 铺展</span></template>

        <!-- 工具栏 -->
        <div class="menu-tab-toolbar">
          <el-input
            v-model="keyword"
            placeholder="🔍 搜索文档..."
            clearable
            class="menu-tab-search"
          />
          <el-button text size="small" @click="toggleExpandAll" class="menu-tab-action">
            {{ allExpanded ? '收起全部' : '展开全部' }}
          </el-button>
        </div>

        <!-- 统计 -->
        <div class="menu-tab-stats">
          <span v-if="keyword && filteredCount < totalCount">
            匹配 <strong>{{ filteredCount }}</strong> / {{ totalCount }} 篇
          </span>
          <span v-else>共 {{ totalCount }} 篇文档</span>
        </div>

        <!-- 菜单树 -->
        <div class="menu-tree-wrap">
          <div v-if="treeData.length" class="menu-tree">
            <TreeNode
              v-for="node in treeData"
              :key="node.id"
              :node="node"
              :expanded="expandedMap[node.id]"
              :expanded-map="expandedMap"
              :depth="node.depth"
              :keyword="keyword"
              :current-path="currentPath"
              @toggle="onToggle"
              @navigate="onNavigate"
            />
          </div>
          <div v-else-if="keyword" class="menu-empty">
            <span class="empty-icon">🔍</span>
            <p>未找到匹配「{{ keyword }}」的文档</p>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute } from 'vitepress'
import { sidebar } from '../../../../config/sidebar.js'
import TreeNode from './TreeNode.vue'
import CascadeTab from './CascadeTab.vue'

const props = defineProps({
  navigateTo: { type: Function, required: true },
  onClose: { type: Function, default: null },
})

const route = useRoute()
const activeSubTab = ref('cascade')
const keyword = ref('')
const allExpanded = ref(false)
const expandedMap = reactive({})
const currentPath = computed(() => route.path)

// ── 路由键 → 显示标签映射 ──
const routeLabelMap = {
  '/': '🏠 首页',
  '/ai/': '🤖 AI 知识库',
  '/aigc/': '🎨 AIGC',
  '/psychology/': '🧠 心理认知',
  '/handbook/': '📖 开发手册',
  '/dev-knowledge/': '🔮 研发知识库',
}

// ── 从 sidebar.js 构建树数据 ──
const treeData = computed(() => {
  const result = []
  Object.entries(sidebar).forEach(([routeKey, sections]) => {
    sections.forEach((section) => {
      const label = section.text || routeLabelMap[routeKey] || '📂 其他'
      result.push({
        id: `s-${routeKey}`,
        label,
        link: null,
        children: flattenItems(section.items || [], 1),
        depth: 0,
      })
    })
  })
  return result
})

function flattenItems(items, depth) {
  if (!items?.length) return []
  const result = []
  for (const item of items) {
    if (item.text) {
      result.push({
        id: item.id || `g-${item.text}-${depth}`,
        label: item.text,
        link: item.link || null,
        children: item.items?.length ? flattenItems(item.items, depth + 1) : [],
        depth,
      })
    } else if (item.items?.length) {
      result.push(...flattenItems(item.items, depth))
    }
  }
  return result
}

// ── 统计 ──
const totalCount = computed(() => treeData.value.reduce((sum, n) => sum + countLeaves(n), 0))
const filteredCount = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return totalCount.value
  return countMatchingLeaves(treeData.value, kw)
})

function countLeaves(node) {
  if (!node.children?.length) return node.link ? 1 : 0
  return node.children.reduce((s, c) => s + countLeaves(c), 0)
}

function countMatchingLeaves(nodes, kw) {
  let n = 0
  for (const node of nodes) {
    if (!node.children?.length) {
      if (node.link && (node.label || '').toLowerCase().includes(kw)) n++
    } else {
      n += countMatchingLeaves(node.children, kw)
    }
  }
  return n
}

// ── 搜索时自动展开匹配分支 ──
watch(keyword, (val) => {
  if (val.trim()) {
    const kw = val.trim().toLowerCase()
    autoExpandMatching(treeData.value, kw)
  }
})

function nodeMatches(node, kw) {
  if ((node.label || '').toLowerCase().includes(kw)) return true
  if (node.children?.length) return node.children.some((c) => nodeMatches(c, kw))
  return false
}

function autoExpandMatching(nodes, kw) {
  for (const node of nodes) {
    if (node.children?.length) {
      if (nodeMatches(node, kw)) expandedMap[node.id] = true
      autoExpandMatching(node.children, kw)
    }
  }
}

// ── 展开/收起 ──
function onToggle(node) {
  expandedMap[node.id] = !expandedMap[node.id]
}

function toggleExpandAll() {
  allExpanded.value = !allExpanded.value
  setAllExpanded(treeData.value, allExpanded.value)
}

function setAllExpanded(nodes, expanded) {
  for (const node of nodes) {
    if (node.children?.length) {
      expandedMap[node.id] = expanded
      setAllExpanded(node.children, expanded)
    }
  }
}

// ── 导航 ──
function onNavigate(node) {
  if (!node.link) return
  props.navigateTo(node.link)
  nextTick(() => props.onClose?.())
}

// ── 初始化 ──
onMounted(() => {
  treeData.value.forEach((section) => {
    expandedMap[section.id] = true
  })
  nextTick(() => {
    const path = route.path
    if (path && path !== '/') expandToPath(treeData.value, path)
  })
})

function expandToPath(nodes, targetPath) {
  for (const node of nodes) {
    if (node.children?.length && containsPath(node.children, targetPath)) {
      expandedMap[node.id] = true
      expandToPath(node.children, targetPath)
      return true
    }
  }
  return false
}

function containsPath(nodes, targetPath) {
  for (const node of nodes) {
    if (!node.children?.length) {
      if (node.link && isCurrentPath(node.link, targetPath)) return true
    } else {
      if (containsPath(node.children, targetPath)) return true
    }
  }
  return false
}

function isCurrentPath(link, targetPath) {
  if (!link) return false
  const p = targetPath || route.path
  return p === link || p === link + '.html' || link === p.replace(/\.html$/, '')
}
</script>

<style scoped>
.menu-tab-container {
  display: flex;
  flex-direction: column;
  height: 68vh;
}

/* 子 tab 紧凑样式 */
.menu-sub-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.menu-sub-tabs .el-tabs__header) {
  margin-bottom: 8px;
}

:deep(.menu-sub-tabs .el-tabs__content) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.menu-sub-tabs .el-tab-pane) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ── 铺展 tab 内部样式 ── */
.menu-tab-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.menu-tab-search {
  flex: 1;
}

.menu-tab-action {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.menu-tab-stats {
  padding: 6px 0 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.menu-tab-stats strong {
  color: var(--el-color-primary);
}

.menu-tree-wrap {
  flex: 1;
  overflow-y: auto;
  margin-top: 4px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 4px 0;
}

.menu-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--el-text-color-secondary);
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.menu-empty p {
  font-size: 13px;
  margin: 0;
}
</style>
