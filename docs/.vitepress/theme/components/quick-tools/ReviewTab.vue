<script setup>
import { dayjs, formatRelative } from './utils'

defineProps({
  records: { type: Array, required: true },
  sorted: { type: Array, required: true },
  sortMode: { type: String, required: true },
  currentPage: { type: Object, required: true },
  currentMastery: { type: Number, default: null },
})

const emit = defineEmits(['record', 'update:sortMode', 'delete', 'clear-all', 'export'])

const levels = Array.from({ length: 11 }, (_, i) => i)

/** 根据掌握程度返回配色等级 */
const masteryLevel = (m) => (m <= 3 ? 'low' : m <= 7 ? 'mid' : 'high')
</script>

<template>
  <div class="qt-tab-content">
    <!-- 当前页面 + 掌握程度录入 -->
    <div class="qt-review-form">
      <div class="qt-review-current">
        <span class="qt-review-label">当前页面</span>
        <span class="qt-record-title" :title="currentPage.title">{{ currentPage.title }}</span>
      </div>
      <div class="qt-mastery-row">
        <span class="qt-review-label">掌握程度</span>
        <div class="qt-mastery-btns">
          <button
            v-for="n in levels"
            :key="n"
            :class="['qt-mastery-btn', { active: currentMastery === n }]"
            @click="emit('record', n)"
            :title="`记为掌握程度 ${n}`"
          >
            {{ n }}
          </button>
        </div>
      </div>
      <div v-if="currentMastery !== null" class="qt-edit-hint">
        ✏️ 当前页面已记录（掌握程度 {{ currentMastery }}），点击数字可更新
      </div>
    </div>

    <!-- 排序工具栏 -->
    <div class="qt-sort-bar">
      <span class="qt-review-label">排序</span>
      <button
        :class="['qt-sort-btn', { active: sortMode === 'time' }]"
        @click="emit('update:sortMode', 'time')"
      >
        🕐 更新时间
      </button>
      <button
        :class="['qt-sort-btn', { active: sortMode === 'mastery-desc' }]"
        @click="emit('update:sortMode', 'mastery-desc')"
      >
        掌握 ↓ 高到低
      </button>
      <button
        :class="['qt-sort-btn', { active: sortMode === 'mastery-asc' }]"
        @click="emit('update:sortMode', 'mastery-asc')"
      >
        掌握 ↑ 低到高
      </button>
      <button
        v-if="records.length > 0"
        class="qt-action-btn ghost qt-right"
        @click="emit('export')"
        title="导出为 Markdown"
      >
        ⬇️ 导出
      </button>
    </div>

    <!-- 记录列表 -->
    <div class="qt-record-scroll">
      <div v-if="records.length === 0" class="qt-empty">暂无复习记录</div>

      <div v-else>
        <div class="qt-record-list">
          <div v-for="record in sorted" :key="record.id" class="qt-record-card">
            <div class="qt-record-header">
              <span :class="['qt-mastery-badge', masteryLevel(record.mastery)]">
                {{ record.mastery }}
              </span>
              <span class="qt-record-title" :title="record.title">{{ record.title }}</span>
              <div class="qt-record-actions">
                <a :href="record.url" class="qt-icon-btn nav" title="跳转到此页面">🔗</a>
                <button class="qt-icon-btn danger" @click="emit('delete', record.id)" title="删除">
                  🗑️
                </button>
              </div>
            </div>
            <div class="qt-record-meta">
              <span class="qt-record-time"
                >🕐 {{ dayjs(record.updatedAt || record.time).format('YYYY-MM-DD HH:mm') }}</span
              >
              <span class="qt-relative-time">{{
                formatRelative(record.updatedAt || record.time)
              }}</span>
              <span v-if="record.updatedAt" class="qt-review-created"
                >加入于 {{ dayjs(record.time).format('YYYY-MM-DD HH:mm') }}</span
              >
            </div>
          </div>
        </div>

        <div class="qt-doubt-footer">
          <button class="qt-text-btn" @click="emit('clear-all')">🧹 清空全部记录</button>
        </div>
      </div>
    </div>
  </div>
</template>
