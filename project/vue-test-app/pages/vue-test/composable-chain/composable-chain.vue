<template>
  <div class="composable-chain-container">
    <!-- 管线可视化 -->
    <a-card :bordered="false" class="pipeline-card q-mb-lg">
      <template #title>
        <span class="card-title">Composable 组合链 — Todo 管线</span>
      </template>
      <div class="pipeline-flow">
        <div v-for="(step, i) in pipelineSteps" :key="step.name" class="pipeline-step">
          <div class="step-box" :style="{ borderColor: step.color }">
            <div class="step-icon" :style="{ background: step.color }">{{ step.icon }}</div>
            <div class="step-info">
              <div class="step-name">{{ step.name }}</div>
              <div class="step-desc">{{ step.desc }}</div>
            </div>
          </div>
          <div v-if="i < pipelineSteps.length - 1" class="step-arrow">→</div>
        </div>
      </div>
    </a-card>

    <!-- 统计面板 -->
    <a-row :gutter="16" class="q-mb-lg">
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card" style="border-top: 3px solid #1677ff">
          <a-statistic title="总数" :value="total" suffix="项" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card" style="border-top: 3px solid #faad14">
          <a-statistic title="进行中" :value="active" suffix="项" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card" style="border-top: 3px solid #52c41a">
          <a-statistic title="已完成" :value="completed" suffix="项" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card :bordered="false" class="stat-card" style="border-top: 3px solid #722ed1">
          <a-statistic title="完成率" :value="completionRate" suffix="%" />
        </a-card>
      </a-col>
    </a-row>

    <!-- 输入 + 过滤 -->
    <a-card :bordered="false" class="q-mb-lg">
      <a-row :gutter="16" align="middle">
        <a-col :flex="'auto'">
          <a-input
            v-model:value="newTodoTitle"
            placeholder="输入新的待办事项..."
            size="large"
            @pressEnter="handleAddTodo"
          >
            <template #prefix>
              <PlusOutlined />
            </template>
          </a-input>
        </a-col>
        <a-col>
          <a-button
            type="primary"
            size="large"
            @click="handleAddTodo"
            :disabled="!newTodoTitle.trim()"
          >
            添加
          </a-button>
        </a-col>
      </a-row>
      <a-row :gutter="16" class="q-mt-md" align="middle">
        <a-col :flex="'auto'">
          <a-input v-model:value="keyword" placeholder="搜索..." allow-clear>
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-col>
        <a-col>
          <a-radio-group v-model:value="statusFilter" button-style="solid">
            <a-radio-button value="all">全部</a-radio-button>
            <a-radio-button value="active">进行中</a-radio-button>
            <a-radio-button value="completed">已完成</a-radio-button>
          </a-radio-group>
        </a-col>
        <a-col>
          <a-button @click="resetFilter">重置</a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- 列表 -->
    <a-card :bordered="false">
      <template #title>
        待办列表
        <a-tag color="blue" class="q-ml-sm">{{ filteredCount }} / {{ total }}</a-tag>
      </template>
      <a-list :data-source="filteredList" :locale="{ emptyText: '暂无待办事项' }">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #avatar>
                <a-checkbox :checked="item.completed" @change="toggleItem(item.id, 'completed')" />
              </template>
              <template #title>
                <span :class="{ 'todo-done': item.completed }">{{ item.title }}</span>
              </template>
              <template #description>
                <span class="todo-time">{{ formatTime(item.createdAt) }}</span>
              </template>
            </a-list-item-meta>
            <template #actions>
              <a-button type="link" danger size="small" @click="removeItem(item.id)">
                <DeleteOutlined />
              </a-button>
            </template>
          </a-list-item>
        </template>
      </a-list>
      <div v-if="total > 0" class="list-footer q-mt-md">
        <a-button danger size="small" @click="clearAll">清空全部</a-button>
        <span class="persist-hint">数据自动持久化到 localStorage（300ms 防抖）</span>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { useList } from './composables/useList'
import { useFilter } from './composables/useFilter'
import { useStats } from './composables/useStats'
import { usePersist } from './composables/usePersist'

// ── 管线可视化数据 ──
const pipelineSteps = [
  { name: 'useList', desc: '数据层 · CRUD', icon: 'D', color: '#1677ff' },
  { name: 'useFilter', desc: '过滤层 · 搜索+状态', icon: 'F', color: '#722ed1' },
  { name: 'useStats', desc: '计算层 · 统计', icon: 'S', color: '#13c2c2' },
  { name: 'usePersist', desc: '副作用层 · 持久化', icon: 'P', color: '#52c41a' },
]

// ── 管线组合 ──
const { list, addItem, removeItem, toggleItem, clearAll } = useList()
const { keyword, statusFilter, filteredList, resetFilter } = useFilter(list)
const { total, completed, active, completionRate, filteredCount } = useStats(list, filteredList)
const { restore } = usePersist(list)

// ── 新增输入 ──
const newTodoTitle = ref('')

function handleAddTodo() {
  if (!newTodoTitle.value.trim()) return
  addItem({ title: newTodoTitle.value.trim(), completed: false })
  newTodoTitle.value = ''
}

// ── 时间格式化 ──
function formatTime(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ── 启动时恢复持久化数据 ──
onMounted(() => {
  restore()
})
</script>

<style scoped>
.composable-chain-container {
  max-width: 1000px;
  margin: 0 auto;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

/* 管线流程 */
.pipeline-flow {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
}
.pipeline-step {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.step-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  background: #fafafa;
  min-width: 160px;
}
.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}
.step-name {
  font-weight: 600;
  font-size: 13px;
  color: #1a1a1a;
}
.step-desc {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}
.step-arrow {
  font-size: 20px;
  color: #bbb;
  font-weight: 700;
}

/* 统计卡片 */
.stat-card {
  text-align: center;
}

/* 列表项 */
.todo-done {
  text-decoration: line-through;
  color: #bbb;
}
.todo-time {
  font-size: 12px;
  color: #999;
}

/* 底部 */
.list-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
.persist-hint {
  font-size: 12px;
  color: #bbb;
}

/* 暗色模式 */
body.body--dark .step-box {
  border-color: #444;
  background: #2a2a2a;
}
body.body--dark .step-name {
  color: #e0e0e0;
}
body.body--dark .step-desc {
  color: #888;
}
body.body--dark .step-arrow {
  color: #666;
}
body.body--dark .todo-done {
  color: #666;
}
body.body--dark .todo-time {
  color: #777;
}
body.body--dark .list-footer {
  border-top-color: #333;
}
body.body--dark .persist-hint {
  color: #666;
}
</style>
