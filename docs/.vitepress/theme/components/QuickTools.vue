<!--
  QuickTools.vue — 快捷工具面板主组件（入口）

  架构层级：主组件（布局编排）
  职责：
    1. 贴边按钮触发面板开关
    2. el-dialog 弹窗内嵌 el-tabs 一级导航
    3. 编排 6 个 Tab 子组件：复习 / 进度 / 疑惑 / 笔记 / 实况 / 更新
    4. 初始化并注入各 composable 实例（review/progress/doubt/note）
    5. 提供 navigateTo() 全局导航方法

  数据流：
    composable → 主组件(props 传递) → Tab 子组件
    Tab 子组件 → emit 事件 → 主组件 → composable 方法

  依赖：
    - composables/useReview.js          复习调度
    - composables/useProgress.js        阅读进度
    - composables/useDoubt.js           疑惑记录
    - composables/useNote.js            笔记记录
    - composables/useLearningStreak.js  学习打脸追踪
    - tabs/ReviewTab.vue                复习子视图
    - tabs/ProgressTab.vue              进度子视图
    - tabs/DoubtTab.vue                 疑惑子视图
    - tabs/NoteTab.vue                  笔记子视图
    - tabs/LearningStreakTab.vue        实况子视图
    - tabs/RecentUpdatesTab.vue         近期更新子视图
-->
<template>
  <div class="quick-tools-wrapper">
    <!-- 右侧贴边按钮 -->
    <el-badge :value="badgeCount" :hidden="badgeCount === 0" class="qt-badge-wrapper">
      <el-button type="primary" circle size="large" class="qt-sticky-btn" @click="togglePanel">
        <el-icon :size="18">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
            />
          </svg>
        </el-icon>
      </el-button>
    </el-badge>

    <!-- 主面板 -->
    <el-dialog
      v-model="isOpen"
      title="🧰 快捷工具"
      width="85vw"
      top="5vh"
      :close-on-click-modal="true"
      class="qt-dialog"
      destroy-on-close
    >
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="qt-main-tabs">
        <el-tab-pane name="review">
          <template #label>
            <span>🔁 复习</span>
            <el-badge
              v-if="review.dueRecords.value.length > 0"
              :value="review.dueRecords.value.length"
              type="danger"
            />
          </template>
          <ReviewTab :review="review" :navigate-to="navigateTo" />
        </el-tab-pane>

        <el-tab-pane name="progress">
          <template #label>
            <span>📖 进度</span>
            <el-badge
              v-if="progress.records.value.length"
              :value="progress.records.value.length"
              type="primary"
            />
          </template>
          <ProgressTab
            :records="progress.records.value"
            :navigate-to="navigateTo"
            @add="handleProgressAdd"
            @delete="progress.remove"
            @clear-all="progress.clearAll"
            @export="progress.exportRecords"
          />
        </el-tab-pane>

        <el-tab-pane name="doubt">
          <template #label>
            <span>❓ 疑惑</span>
            <el-badge
              v-if="doubt.unresolvedCount.value"
              :value="doubt.unresolvedCount.value"
              type="warning"
            />
          </template>
          <DoubtTab
            ref="doubtTabRef"
            :records="doubt.records.value"
            :sorted="doubt.sorted.value"
            :draft="doubt.draft.value"
            :editing-id="doubt.editingId.value"
            :navigate-to="navigateTo"
            @update:draft="doubt.draft.value = $event"
            @save="handleDoubtSave"
            @edit="doubt.edit"
            @resolve="doubt.resolve"
            @delete="doubt.remove"
            @clear-resolved="doubt.clearResolved"
            @clear-all="doubt.clearAll"
            @export="doubt.exportRecords"
          />
        </el-tab-pane>

        <el-tab-pane name="note">
          <template #label>
            <span>📝 笔记</span>
            <el-badge
              v-if="note.records.value.length"
              :value="note.records.value.length"
              type="info"
            />
          </template>
          <NoteTab
            ref="noteTabRef"
            :records="note.records.value"
            :sorted="note.sorted.value"
            :draft="note.draft.value"
            :editing-id="note.editingId.value"
            :navigate-to="navigateTo"
            @update:draft="note.draft.value = $event"
            @save="handleNoteSave"
            @edit="note.edit"
            @delete="note.remove"
            @clear-all="note.clearAll"
            @export="note.exportRecords"
          />
        </el-tab-pane>

        <el-tab-pane name="streak">
          <template #label>
            <span>📊 实况</span>
          </template>
          <LearningStreakTab />
        </el-tab-pane>

        <el-tab-pane name="recent">
          <template #label>
            <span>🆕 更新</span>
          </template>
          <RecentUpdatesTab :navigate-to="navigateTo" />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vitepress'
import { useCurrentPage } from './quick-tools/composables/useCurrentPage'
import { useProgress } from './quick-tools/composables/useProgress'
import { useDoubt } from './quick-tools/composables/useDoubt'
import { useNote } from './quick-tools/composables/useNote'
import { useReview } from './quick-tools/composables/useReview'
import { useReviewNotification } from './quick-tools/composables/useReviewNotification'
import { useLearningStreak } from './quick-tools/composables/useLearningStreak'
import ProgressTab from './quick-tools/tabs/ProgressTab.vue'
import DoubtTab from './quick-tools/tabs/DoubtTab.vue'
import NoteTab from './quick-tools/tabs/NoteTab.vue'
import ReviewTab from './quick-tools/tabs/ReviewTab.vue'
import LearningStreakTab from './quick-tools/tabs/LearningStreakTab.vue'
import RecentUpdatesTab from './quick-tools/tabs/RecentUpdatesTab.vue'
import './quick-tools/shared/quick-tools.css'

// ==================== 页面信息 ====================
const router = useRouter()

const navigateTo = (url) => {
  if (!url) return
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const target = new URL(url)
      const current = new URL(window.location.href)
      if (target.origin === current.origin) {
        router.go(target.pathname)
      } else {
        window.location.href = url
      }
    } catch {
      window.location.href = url
    }
    return
  }
  const base = import.meta.env.BASE_URL || '/'
  const fullPath = base !== '/' && !url.startsWith(base) ? base + url.slice(1) : url
  router.go(fullPath)
}

const { currentUrl, currentTitle, refresh } = useCurrentPage()
const getPage = () => {
  refresh()
  return { url: currentUrl.value, title: currentTitle.value }
}

// ==================== 业务模块 ====================
const progress = useProgress(getPage)
const doubt = useDoubt(getPage)
const note = useNote(getPage)
const review = useReview(getPage)
const notification = useReviewNotification(review)
const learningStreak = useLearningStreak()

// ==================== 初始化 ====================
onMounted(async () => {
  await review.init()
  review.autoLearn.startTracking(window.location.pathname)
  const settings = await review.storage.getSettings()
  if (settings.enableNotification) {
    const granted = await notification.requestPermission()
    if (granted) notification.startChecking()
  }
})

router.onAfterRouteChanged = (to) => {
  if (to) review.autoLearn.onRouteChange(to)
  // 浏览文档页面也记录学习实况（非索引页 = 实际文档内容页）
  if (to && !to.endsWith('/index') && to !== '/' && to !== '/index.html') {
    learningStreak.recordToday('browse')
  }
}

onUnmounted(() => {
  review.autoLearn.destroy()
})

// ==================== 面板状态 ====================
const isOpen = ref(false)
const activeTab = ref('review')

const badgeCount = computed(() => {
  return (
    progress.records.value.length +
    doubt.records.value.length +
    note.records.value.length +
    review.dueRecords.value.length
  )
})

const togglePanel = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) activeTab.value = 'progress'
}

// ==================== Tab 切换 ====================
const doubtTabRef = ref(null)
const noteTabRef = ref(null)

const switchToDoubt = () => {
  activeTab.value = 'doubt'
  doubt.initForm()
  nextTick(() => doubtTabRef.value?.focusTextarea())
}

const switchToNote = () => {
  activeTab.value = 'note'
  note.initForm()
  nextTick(() => noteTabRef.value?.focusTextarea())
}

const switchToReview = () => {
  activeTab.value = 'review'
  review.refreshRecords()
}

const handleTabChange = (tab) => {
  if (tab === 'doubt') switchToDoubt()
  else if (tab === 'note') switchToNote()
  else if (tab === 'review') switchToReview()
}

// ==================== 学习实况记录 ====================
function handleProgressAdd(...args) {
  progress.add(...args)
  learningStreak.recordToday('progress')
}

function handleDoubtSave(...args) {
  doubt.save(...args)
  learningStreak.recordToday('doubt')
}

function handleNoteSave(...args) {
  note.save(...args)
  learningStreak.recordToday('note')
}
</script>
