<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vitepress'
import { useCurrentPage } from './quick-tools/composables/useCurrentPage'
import { useProgress } from './quick-tools/composables/useProgress'
import { useDoubt } from './quick-tools/composables/useDoubt'
import { useNote } from './quick-tools/composables/useNote'
import { useReview } from './quick-tools/composables/useReview'
import { useReviewNotification } from './quick-tools/composables/useReviewNotification'
import ProgressTab from './quick-tools/tabs/ProgressTab.vue'
import DoubtTab from './quick-tools/tabs/DoubtTab.vue'
import NoteTab from './quick-tools/tabs/NoteTab.vue'
import ReviewTab from './quick-tools/tabs/ReviewTab.vue'
import './quick-tools/shared/quick-tools.css'

// ==================== 页面信息 ====================
const router = useRouter()

/** 导航到记录对应的页面（SPA 内跳转） */
const navigateTo = (url) => {
  if (!url) return
  try {
    const target = new URL(url)
    const current = new URL(window.location.href)
    // 同域名走 SPA 路由，否则整页跳转
    if (target.origin === current.origin) {
      router.go(target.pathname)
    } else {
      window.location.href = url
    }
  } catch {
    window.location.href = url
  }
}

const { currentUrl, currentTitle, refresh } = useCurrentPage()

/** 获取当前页面快照（每次操作时实时读取） */
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

// ==================== 初始化复习系统 + 自动学习 ====================
onMounted(async () => {
  // 初始化复习系统（加载 IndexedDB + 文档清单 + 数据迁移）
  await review.init()

  // 启动自动学习追踪
  review.autoLearn.startTracking(window.location.pathname)

  // 如果用户开启了通知，启动定时检查
  const settings = await review.storage.getSettings()
  if (settings.enableNotification) {
    const granted = await notification.requestPermission()
    if (granted) notification.startChecking()
  }
})

// 监听路由变化 → 自动学习切换页面
router.onAfterRouteChanged = (to) => {
  if (to) {
    review.autoLearn.onRouteChange(to)
  }
}

onUnmounted(() => {
  review.autoLearn.destroy()
})

// ==================== 面板状态 ====================
const isOpen = ref(false)
const activeTab = ref('progress')

/** badge 显示：今日到期复习数（复习 Tab 优先） */
const badgeCount = computed(() => {
  const dueCount = review.dueRecords.value.length
  return (
    progress.records.value.length +
    doubt.records.value.length +
    note.records.value.length +
    dueCount
  )
})

const togglePanel = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) activeTab.value = 'progress'
}

const closePanel = () => {
  isOpen.value = false
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
</script>

<template>
  <div class="quick-tools-wrapper">
    <!-- 右侧贴边按钮 -->
    <button class="qt-sticky-btn" @click="togglePanel" title="快捷工具">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
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
      <span v-if="badgeCount > 0" class="qt-badge">{{ badgeCount }}</span>
    </button>

    <!-- 遮罩 + 面板 -->
    <Transition name="qt-fade">
      <div v-if="isOpen" class="qt-overlay" @click.self="closePanel">
        <div class="qt-panel qt-panel-large">
          <!-- 头部 -->
          <div class="qt-panel-header">
            <h3 class="qt-panel-title">🧰 快捷工具</h3>
            <button class="qt-close-btn" @click="closePanel" title="关闭">✕</button>
          </div>

          <!-- Tab 切换 -->
          <div class="qt-tabs">
            <button
              :class="['qt-tab', { active: activeTab === 'progress' }]"
              @click="activeTab = 'progress'"
            >
              📖 进度 ({{ progress.records.value.length }})
            </button>
            <button :class="['qt-tab', { active: activeTab === 'doubt' }]" @click="switchToDoubt">
              ❓ 疑惑 ({{ doubt.unresolvedCount.value }})
            </button>
            <button :class="['qt-tab', { active: activeTab === 'note' }]" @click="switchToNote">
              📝 笔记 ({{ note.records.value.length }})
            </button>
            <button :class="['qt-tab', { active: activeTab === 'review' }]" @click="switchToReview">
              🔁 复习
              <span v-if="review.dueRecords.value.length > 0" class="qt-tab-badge">
                {{ review.dueRecords.value.length }}
              </span>
            </button>
          </div>

          <!-- 面板内容区 -->
          <div class="qt-panel-body">
            <ProgressTab
              v-if="activeTab === 'progress'"
              :records="progress.records.value"
              :navigate-to="navigateTo"
              @add="progress.add"
              @delete="progress.remove"
              @clear-all="progress.clearAll"
              @export="progress.exportRecords"
            />

            <DoubtTab
              v-if="activeTab === 'doubt'"
              ref="doubtTabRef"
              :records="doubt.records.value"
              :sorted="doubt.sorted.value"
              :draft="doubt.draft.value"
              :editing-id="doubt.editingId.value"
              :navigate-to="navigateTo"
              @update:draft="doubt.draft.value = $event"
              @save="doubt.save"
              @edit="doubt.edit"
              @resolve="doubt.resolve"
              @delete="doubt.remove"
              @clear-resolved="doubt.clearResolved"
              @clear-all="doubt.clearAll"
              @export="doubt.exportRecords"
            />

            <NoteTab
              v-if="activeTab === 'note'"
              ref="noteTabRef"
              :records="note.records.value"
              :sorted="note.sorted.value"
              :draft="note.draft.value"
              :editing-id="note.editingId.value"
              :navigate-to="navigateTo"
              @update:draft="note.draft.value = $event"
              @save="note.save"
              @edit="note.edit"
              @delete="note.remove"
              @clear-all="note.clearAll"
              @export="note.exportRecords"
            />

            <ReviewTab v-if="activeTab === 'review'" :review="review" :navigate-to="navigateTo" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
