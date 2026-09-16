<script setup>
import { ref, computed, nextTick } from 'vue'
import { useCurrentPage } from './quick-tools/useCurrentPage'
import { useReadingTimer } from './quick-tools/useReadingTimer'
import { useProgress } from './quick-tools/useProgress'
import { useDoubt } from './quick-tools/useDoubt'
import { useNote } from './quick-tools/useNote'
import ProgressTab from './quick-tools/ProgressTab.vue'
import DoubtTab from './quick-tools/DoubtTab.vue'
import NoteTab from './quick-tools/NoteTab.vue'
import './quick-tools/quick-tools.css'

// ==================== 页面信息 ====================
const { currentUrl, currentTitle, refresh } = useCurrentPage()

/** 获取当前页面快照（每次操作时实时读取） */
const getPage = () => {
  refresh()
  return { url: currentUrl.value, title: currentTitle.value }
}

// ==================== 学习计时 ====================
const { displayTime } = useReadingTimer()

// ==================== 业务模块 ====================
const progress = useProgress(getPage)
const doubt = useDoubt(getPage)
const note = useNote(getPage)

// ==================== 面板状态 ====================
const isOpen = ref(false)
const activeTab = ref('progress')

const totalCount = computed(
  () => progress.records.value.length + doubt.records.value.length + note.records.value.length,
)

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
      <span v-if="totalCount > 0" class="qt-badge">{{ totalCount }}</span>
    </button>

    <!-- 遮罩 + 面板 -->
    <Transition name="qt-fade">
      <div v-if="isOpen" class="qt-overlay" @click.self="closePanel">
        <div class="qt-panel">
          <!-- 头部 -->
          <div class="qt-panel-header">
            <h3 class="qt-panel-title">🧰 快捷工具</h3>
            <span class="qt-reading-time" title="今日累计阅读时长">⏱️ {{ displayTime }}</span>
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
          </div>

          <!-- 面板内容区 -->
          <div class="qt-panel-body">
            <ProgressTab
              v-if="activeTab === 'progress'"
              :records="progress.records.value"
              @add="progress.add"
              @delete="progress.remove"
              @clear-all="progress.clearAll"
            />

            <DoubtTab
              v-if="activeTab === 'doubt'"
              ref="doubtTabRef"
              :records="doubt.records.value"
              :sorted="doubt.sorted.value"
              :draft="doubt.draft.value"
              :editing-id="doubt.editingId.value"
              @update:draft="doubt.draft.value = $event"
              @save="doubt.save"
              @edit="doubt.edit"
              @resolve="doubt.resolve"
              @delete="doubt.remove"
              @clear-resolved="doubt.clearResolved"
            />

            <NoteTab
              v-if="activeTab === 'note'"
              ref="noteTabRef"
              :records="note.records.value"
              :sorted="note.sorted.value"
              :draft="note.draft.value"
              :editing-id="note.editingId.value"
              @update:draft="note.draft.value = $event"
              @save="note.save"
              @edit="note.edit"
              @delete="note.remove"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
