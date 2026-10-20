<!--
  TreeNode.vue — 递归树节点组件

  通过组件名自引用实现无限深度递归，替代手动嵌套 5 层模板。
-->
<template>
  <div v-show="visible">
    <!-- 叶子节点 -->
    <div
      v-if="isLeaf"
      class="tree-node"
      :class="{ 'is-current': isCurrent }"
      :style="nodeStyle"
      @click="$emit('navigate', node)"
    >
      <span class="node-icon">📄</span>
      <span class="node-label" v-html="labelHtml" />
    </div>

    <!-- 分组节点 -->
    <div v-else class="tree-group" :style="nodeStyle">
      <div class="tree-node is-group" @click="$emit('toggle', node)">
        <span class="node-arrow" :class="{ expanded: expanded }">
          <svg viewBox="0 0 16 16" width="12" height="12">
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              stroke-width="1.5"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="node-icon">{{ depth === 0 ? '📚' : '📁' }}</span>
        <span class="node-label" v-html="labelHtml" />
        <span class="node-count">{{ leafCount }}</span>
      </div>
      <div class="tree-children" :class="{ collapsed: !expanded }">
        <TreeNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :expanded="expandedMap[child.id]"
          :expanded-map="expandedMap"
          :depth="child.depth"
          :keyword="keyword"
          :current-path="currentPath"
          @toggle="$emit('toggle', $event)"
          @navigate="$emit('navigate', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: { type: Object, required: true },
  expanded: { type: Boolean, default: false },
  expandedMap: { type: Object, default: () => ({}) },
  depth: { type: Number, default: 0 },
  keyword: { type: String, default: '' },
  currentPath: { type: String, default: '' },
})

defineEmits(['toggle', 'navigate'])

const isLeaf = computed(() => !props.node.children?.length)

const visible = computed(() => {
  if (!props.keyword) return true
  return nodeMatches(props.node, props.keyword.toLowerCase())
})

const isCurrent = computed(() => {
  if (!props.node.link || !props.currentPath) return false
  const p = props.currentPath
  const l = props.node.link
  return p === l || p === l + '.html' || l === p.replace(/\.html$/, '')
})

const nodeStyle = computed(() => ({ '--depth': props.depth }))

const leafCount = computed(() => countLeaves(props.node))

// ── 搜索高亮 ──
const labelHtml = computed(() => {
  const label = props.node.label || ''
  const kw = props.keyword?.trim()
  if (!kw) return escapeHtml(label)
  try {
    const regex = new RegExp(`(${escapeRegex(kw)})`, 'gi')
    return escapeHtml(label).replace(regex, '<mark class="search-hl">$1</mark>')
  } catch {
    return escapeHtml(label)
  }
})

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeHtml(s) {
  if (!s) return ''
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ── 过滤匹配 ──
function nodeMatches(node, kw) {
  if ((node.label || '').toLowerCase().includes(kw)) return true
  if (node.children?.length) return node.children.some((c) => nodeMatches(c, kw))
  return false
}

// ── 叶子计数 ──
function countLeaves(node) {
  if (!node.children?.length) return node.link ? 1 : 0
  return node.children.reduce((sum, c) => sum + countLeaves(c), 0)
}
</script>

<style scoped>
/* ── 树节点 ── */
.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px 5px calc(12px + var(--depth, 0) * 28px);
  cursor: pointer;
  font-size: 13px;
  line-height: 1.4;
  color: var(--el-text-color-regular);
  border-left: 2px solid transparent;
  transition:
    background-color 0.15s,
    border-color 0.15s;
  position: relative;
}

/* 引导线 */
.tree-node::before {
  content: '';
  position: absolute;
  left: calc(var(--depth, 0) * 28px + 6px);
  top: 0;
  bottom: 0;
  width: 0;
  border-left: 1px solid var(--el-border-color-extra-light);
}

.tree-node:hover {
  background-color: var(--el-fill-color-light);
}

.tree-node.is-current {
  background-color: var(--el-color-primary-light-9);
  border-left-color: var(--el-color-primary);
  color: var(--el-color-primary);
  font-weight: 500;
}

.tree-node.is-current::before {
  border-left-color: var(--el-color-primary-light-5);
}

.tree-node.is-group {
  cursor: default;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.tree-node.is-group:hover {
  background-color: var(--el-fill-color);
}

/* ── 箭头 ── */
.node-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
  transition: transform 0.2s ease;
}

.node-arrow.expanded {
  transform: rotate(90deg);
}

/* ── 图标 ── */
.node-icon {
  flex-shrink: 0;
  font-size: 13px;
  line-height: 1;
}

/* ── 标签 ── */
.node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.search-hl) {
  background-color: #de6e15;
  color: #fff;
  border-radius: 2px;
  padding: 0 2px;
  font-weight: 600;
}

/* ── 计数徽章 ── */
.node-count {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 400;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
  border-radius: 8px;
  padding: 0 6px;
  min-width: 20px;
  text-align: center;
}

/* ── 子节点容器（CSS 过渡替代 Transition 组件） ── */
.tree-children {
  overflow: hidden;
  transition:
    max-height 0.25s ease,
    opacity 0.2s ease;
  max-height: 3000px;
  opacity: 1;
}

.tree-children.collapsed {
  max-height: 0;
  opacity: 0;
}
</style>
