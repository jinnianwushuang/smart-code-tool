<!--
  CascadeTab.vue — 级联菜单选择器

  类似省市区级联选择器风格，多列逐级深入：
    1. 导入 sidebar.js 构建多级层次数据
    2. 每列展示当前层级的选项列表
    3. 选中分组 → 右侧出现子列
    4. 选中叶子 → 跳转文档 + 关闭面板
    5. 面包屑导航显示当前选择路径，可点击回退
-->
<template>
  <div class="cascade-container">
    <!-- 面包屑 -->
    <div class="cascade-breadcrumb">
      <span class="breadcrumb-item" :class="{ active: path.length === 0 }" @click="backTo(-1)">
        🏠 根目录
      </span>
      <template v-for="(item, index) in path" :key="item.id">
        <span class="breadcrumb-sep">/</span>
        <span
          class="breadcrumb-item"
          :class="{ active: index === path.length - 1 }"
          @click="backTo(index)"
        >
          {{ item.label }}
        </span>
      </template>
    </div>

    <!-- 级联列 -->
    <div class="cascade-columns">
      <!-- 第一列：始终显示顶级分区 -->
      <div class="cascade-column">
        <div class="column-header">知识体系</div>
        <div class="column-list">
          <div
            v-for="section in sections"
            :key="section.id"
            class="column-item"
            :class="{
              selected: path.length > 0 && path[0]?.id === section.id,
              'is-group': section.children?.length,
            }"
            @click="selectSection(0, section)"
          >
            <span class="item-label">{{ section.label }}</span>
            <span v-if="section.children?.length" class="item-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 动态后续列 -->
      <div v-for="colIndex in visibleColumns" :key="colIndex" class="cascade-column">
        <div class="column-header">{{ getColumnTitle(colIndex) }}</div>
        <div class="column-list">
          <div
            v-for="item in getColumnItems(colIndex)"
            :key="item.id"
            class="column-item"
            :class="{
              selected: isItemSelected(colIndex, item),
              'is-group': item.children?.length,
              'is-leaf': !item.children?.length,
            }"
            @click="selectSection(colIndex, item)"
          >
            <span class="item-icon">{{ item.children?.length ? '📁' : '📄' }}</span>
            <span class="item-label">{{ item.label }}</span>
            <span v-if="item.children?.length" class="item-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 空提示 -->
      <div v-if="visibleColumns === 0 && path.length > 0" class="cascade-empty">
        <p v-if="currentNode?.link">📄 已到达叶子节点，点击即可跳转</p>
        <p v-else>📂 该分类下暂无内容</p>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="cascade-footer">
      <span v-if="currentNode">
        <template v-if="currentNode.children?.length">
          包含 <strong>{{ countLeaves(currentNode) }}</strong> 篇文档
        </template>
        <template v-else> 📄 {{ currentNode.label }} — 点击即可跳转 </template>
      </span>
      <span v-else>选择一个分类开始浏览</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { sidebar } from '../../../../config/sidebar.js'

const props = defineProps({
  navigateTo: { type: Function, required: true },
  onClose: { type: Function, default: null },
})

// ── 路由键 → 标签映射 ──
const routeLabelMap = {
  '/': '首页',
  '/ai/': 'AI 知识库',
  '/aigc/': 'AIGC',
  '/psychology/': '心理认知',
  '/handbook/': '开发手册',
  '/dev-knowledge/': '研发知识库',
}

// ── 构建顶级分区 ──
const sections = computed(() => {
  const result = []
  Object.entries(sidebar).forEach(([routeKey, secs]) => {
    secs.forEach((sec) => {
      const label = sec.text || routeLabelMap[routeKey] || '其他'
      result.push({
        id: `s-${routeKey}`,
        label,
        link: null,
        children: flattenItems(sec.items || [], 1),
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

// ── 路径状态 ──
const path = ref([])

const currentNode = computed(() => {
  if (path.value.length === 0) return null
  return path.value[path.value.length - 1]
})

// 当前选中项有多少层子节点（用于判断是否到底）
const visibleColumns = computed(() => {
  // column 0 = sections（始终显示，模板中硬编码）
  // column 1 = path[0].children
  // column 2 = path[1].children
  // ...
  let count = 0
  for (let i = 0; i < path.value.length; i++) {
    if (path.value[i]?.children?.length) {
      count = i + 1
    } else {
      break
    }
  }
  return count
})

// ── 列标题 ──
const columnTitles = ['分类', '子分类', '文档组', '文档', '子页']

function getColumnTitle(colIndex) {
  const depth = colIndex
  return columnTitles[Math.min(depth, columnTitles.length - 1)] || '更多'
}

// ── 获取列数据 ──
function getColumnItems(colIndex) {
  if (colIndex === 0) return sections.value
  // colIndex N → 显示 path[N-1] 的 children
  const parent = path.value[colIndex - 1]
  return parent?.children || []
}

// ── 选中判断 ──
function isItemSelected(colIndex, item) {
  if (colIndex === 0) {
    // column 0：检查 path[0] 是否匹配
    return path.value.length > 0 && path.value[0]?.id === item.id
  }
  // column N：检查 path[N] 是否匹配
  return path.value.length > colIndex && path.value[colIndex]?.id === item.id
}

// ── 点击选项 ──
function selectSection(colIndex, item) {
  // 截断路径到 colIndex，然后添加新选中项
  path.value = path.value.slice(0, colIndex)
  path.value.push(item)

  // 如果是叶子节点 → 导航
  if (!item.children?.length && item.link) {
    props.navigateTo(item.link)
    nextTick(() => props.onClose?.())
  }
}

// ── 面包屑回退 ──
function backTo(index) {
  if (index < 0) {
    path.value = []
  } else {
    path.value = path.value.slice(0, index + 1)
  }
}

// ── 工具 ──
function countLeaves(node) {
  if (!node.children?.length) return node.link ? 1 : 0
  return node.children.reduce((s, c) => s + countLeaves(c), 0)
}
</script>

<style scoped>
.cascade-container {
  display: flex;
  flex-direction: column;
  height: 65vh;
}

/* ── 面包屑 ── */
.cascade-breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  flex-wrap: wrap;
  min-height: 34px;
}

.breadcrumb-item {
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
  transition: all 0.15s;
  white-space: nowrap;
}

.breadcrumb-item:hover {
  background: var(--el-fill-color);
  color: var(--el-text-color-primary);
}

.breadcrumb-item.active {
  color: var(--el-color-primary);
  font-weight: 600;
}

.breadcrumb-sep {
  color: var(--el-text-color-placeholder);
  font-size: 11px;
}

/* ── 级联列容器 ── */
.cascade-columns {
  display: flex;
  flex: 1;
  gap: 1px;
  margin-top: 8px;
  background: var(--el-border-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  overflow: hidden;
}

.cascade-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

/* ── 列头 ── */
.column-header {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}

/* ── 列列表 ── */
.column-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
}

/* ── 列项 ── */
.column-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--el-text-color-regular);
  transition: all 0.12s;
}

.column-item:hover {
  background: var(--el-fill-color-light);
}

.column-item.selected {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 500;
}

.column-item.is-group {
  font-weight: 500;
}

.column-item.is-leaf:hover {
  background: var(--el-color-primary-light-9);
}

.item-icon {
  flex-shrink: 0;
  font-size: 13px;
}

.item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-arrow {
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--el-text-color-placeholder);
  margin-left: auto;
}

.column-item.selected .item-arrow {
  color: var(--el-color-primary);
}

/* ── 空状态 ── */
.cascade-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  background: var(--el-bg-color);
  border-radius: 0 6px 6px 0;
}

/* ── 底部信息 ── */
.cascade-footer {
  padding: 6px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}
</style>
