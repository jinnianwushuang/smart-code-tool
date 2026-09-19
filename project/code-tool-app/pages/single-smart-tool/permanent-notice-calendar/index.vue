<template>
  <div class="q-pa-md generator-wrapper">
    <div class="row q-col-gutter-md q-mx-auto max-w-1400">
      <!-- 左侧：日历主体 -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="shadow-2 transition-base">
          <!-- 头部标题栏 -->
          <q-card-section class="bg-indigo-8 text-white row items-center q-py-sm">
            <q-icon name="calendar_today" size="sm" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">万年历</div>
            <q-space />
            <q-btn
              flat
              color="white"
              size="sm"
              icon="upload"
              label="导入"
              @click="triggerFileInput"
            />
            <q-btn
              flat
              color="white"
              size="sm"
              icon="download"
              label="导出"
              @click="exportToJSON"
            />
            <q-btn
              outline
              color="white"
              size="sm"
              icon="cleaning_services"
              label="清理本月"
              @click="confirmClearMonth"
            />
            <input
              type="file"
              ref="fileInput"
              class="hidden"
              accept=".json"
              @change="importFromJSON"
            />
          </q-card-section>

          <!-- 日期快捷操作栏 -->
          <div class="quick-toolbar row items-center q-px-md q-py-xs">
            <q-btn flat dense size="sm" label="今天" icon="today" @click="goToday" color="indigo" />
            <q-separator vertical class="q-mx-xs" />
            <q-btn
              flat
              dense
              round
              size="sm"
              icon="fast_rewind"
              @click="navYear(-1)"
              title="上一年"
            />
            <q-btn
              flat
              dense
              round
              size="sm"
              icon="navigate_before"
              @click="navMonth(-1)"
              title="上一月"
            />
            <q-input
              v-model="inputYear"
              dense
              outlined
              class="nav-input"
              input-class="text-center"
              @blur="applyYearMonth"
              @keydown.enter.prevent="applyYearMonth"
            >
              <template #append>
                <div class="text-caption text-grey-5">年</div>
              </template>
            </q-input>
            <q-input
              v-model="inputMonth"
              dense
              outlined
              class="nav-input"
              input-class="text-center"
              @blur="applyYearMonth"
              @keydown.enter.prevent="applyYearMonth"
            >
              <template #append>
                <div class="text-caption text-grey-5">月</div>
              </template>
            </q-input>
            <q-btn
              flat
              dense
              round
              size="sm"
              icon="navigate_next"
              @click="navMonth(1)"
              title="下一月"
            />
            <q-btn
              flat
              dense
              round
              size="sm"
              icon="fast_forward"
              @click="navYear(1)"
              title="下一年"
            />
            <q-space />
            <q-btn-toggle
              v-model="calendarMode"
              flat
              dense
              toggle-color="indigo"
              size="sm"
              :options="[
                { label: '月', value: 'month' },
                { label: '年', value: 'year' },
              ]"
            />
          </div>

          <!-- 日历主体 -->
          <q-card-section class="q-pb-none">
            <a-calendar
              v-model:value="selectedDayjs"
              :mode="calendarMode"
              :fullscreen="calendarMode === 'month'"
              @panelChange="onPanelChange"
              @select="onSelect"
            >
              <template #dateCellRender="{ current }">
                <div class="calendar-cell">
                  <div class="lunar-text">{{ getLunarDay(current) }}</div>
                  <div class="festival-tag" v-if="getFestival(current)">
                    {{ getFestival(current) }}
                  </div>
                  <div class="notes-dots row justify-center q-gutter-x-xs">
                    <div
                      v-for="note in getNotesByDate(allNotes, current)"
                      :key="note.date"
                      :class="['dot', `bg-${getNoteColor(note.content)}`]"
                    ></div>
                  </div>
                </div>
              </template>
            </a-calendar>
          </q-card-section>
        </q-card>
      </div>

      <!-- 右侧：备注管理面板 -->
      <div class="col-12 col-md-4">
        <NotePanel
          :selected-date-str="selectedDayjs.format('YYYY-MM-DD')"
          :lunar-detail="getFullLunarDetail(selectedDayjs)"
          :edit-content="editContent"
          :search-query="searchQuery"
          :note-count="allNotes.length"
          :upcoming-notes="upcomingNotes"
          :filtered-notes="filteredNotes"
          @update:edit-content="editContent = $event"
          @update:search-query="searchQuery = $event"
          @save="handleSave"
          @editor-keydown="handleEditorKeydown"
          @go-to-date="goToDate"
          @delete-note="confirmDelete"
        />
      </div>
    </div>

    <!-- 备注编辑弹窗 -->
    <NoteDialog
      v-model="editVisible"
      :date-str="selectedDayjs.format('YYYY-MM-DD')"
      :lunar-detail="getFullLunarDetail(selectedDayjs)"
      :content="editContent"
      @update:content="editContent = $event"
      @save="handleSave"
      @editor-keydown="handleEditorKeydown"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar, exportFile } from 'quasar'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { getLunarDay, getFestival, getFullLunarDetail } from './utils/lunar-utils'
import { getNoteColor, getNotesByDate } from './utils/note-utils'
import {
  loadAllNotes,
  getNote,
  putNote,
  deleteNote,
  deleteNotes,
  clearAllNotes,
  bulkPutNotes,
} from './utils/calendar-db'
import NotePanel from './components/note-panel.vue'
import NoteDialog from './components/note-dialog.vue'

// 设置 dayjs 中文 locale，确保日历月份下拉显示中文
dayjs.locale('zh-cn')

const $q = useQuasar()
const fileInput = ref(null)

// --- 状态 ---
const selectedDayjs = ref(dayjs())
const calendarMode = ref('month')
const inputYear = ref(String(dayjs().year()))
const inputMonth = ref(String(dayjs().month() + 1))
const searchQuery = ref('')
const allNotes = ref([])
const editVisible = ref(false)
const editContent = ref('')

// --- 计算属性 ---
const filteredNotes = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return allNotes.value
    .filter((n) => n.date.includes(q) || n.content.toLowerCase().includes(q))
    .sort((a, b) => b.date.localeCompare(a.date))
})

const upcomingNotes = computed(() => {
  const today = dayjs().startOf('day')
  const end = today.add(7, 'day')
  return allNotes.value
    .filter((n) => {
      const d = dayjs(n.date)
      return d.isAfter(today) && d.isBefore(end.add(1, 'day'))
    })
    .sort((a, b) => a.date.localeCompare(b.date))
})

// --- 快捷导航 ---
const syncInputFromSelected = () => {
  inputYear.value = String(selectedDayjs.value.year())
  inputMonth.value = String(selectedDayjs.value.month() + 1)
}

const goToday = () => {
  selectedDayjs.value = dayjs()
  syncInputFromSelected()
  loadDateNote(selectedDayjs.value)
}

const navYear = (offset) => {
  selectedDayjs.value = selectedDayjs.value.add(offset, 'year')
  syncInputFromSelected()
}

const navMonth = (offset) => {
  selectedDayjs.value = selectedDayjs.value.add(offset, 'month')
  syncInputFromSelected()
}

const applyYearMonth = () => {
  const y = parseInt(inputYear.value)
  const m = parseInt(inputMonth.value)
  if (isNaN(y) || isNaN(m) || m < 1 || m > 12 || y < 1900 || y > 2100) {
    syncInputFromSelected()
    return
  }
  selectedDayjs.value = selectedDayjs.value.year(y).month(m - 1)
}

const goToDate = (dateStr) => {
  selectedDayjs.value = dayjs(dateStr)
  syncInputFromSelected()
  loadDateNote(selectedDayjs.value)
}

const onPanelChange = (value, mode) => {
  calendarMode.value = mode
}

// --- 数据操作 ---
const loadData = async () => {
  allNotes.value = await loadAllNotes()
}

const loadDateNote = async (day) => {
  const dStr = day.format('YYYY-MM-DD')
  const record = await getNote(dStr)
  editContent.value = record ? record.content : ''
}

const onSelect = async (val) => {
  selectedDayjs.value = val
  await loadDateNote(val)
}

const handleSave = async () => {
  const dStr = selectedDayjs.value.format('YYYY-MM-DD')
  if (allNotes.value.length >= 60 && !allNotes.value.find((n) => n.date === dStr)) {
    $q.notify({ message: '备注上限60条', color: 'red' })
    return
  }
  if (editContent.value.trim()) {
    await putNote(dStr, editContent.value.trim())
  } else {
    await deleteNote(dStr)
  }
  await loadData()
  editVisible.value = false
  if (allNotes.value.length > 0 && allNotes.value.length % 10 === 0) {
    $q.notify({ message: '建议备份数据', color: 'info' })
  }
}

const confirmDelete = (d) => {
  $q.dialog({
    title: '确认删除',
    message: `确定删除 ${d} 的备注吗？`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await deleteNote(d)
    await loadData()
    if (selectedDayjs.value.format('YYYY-MM-DD') === d) {
      editContent.value = ''
    }
  })
}

const confirmClearMonth = () => {
  $q.dialog({
    title: '确认清理',
    message: `确定清理 ${selectedDayjs.value.format('YYYY年MM月')} 的所有备注吗？`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const monthStr = selectedDayjs.value.format('YYYY-MM')
    const toDel = allNotes.value.filter((n) => n.date.startsWith(monthStr))
    await deleteNotes(toDel.map((n) => n.date))
    await loadData()
    editContent.value = ''
  })
}

const exportToJSON = () => {
  exportFile(
    `calendar_backup_${dayjs().format('YYYYMMDD')}.json`,
    JSON.stringify(allNotes.value, null, 2),
  )
}

const triggerFileInput = () => fileInput.value.click()
const importFromJSON = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      if (!Array.isArray(data) || data.length > 60) throw new Error()
      await clearAllNotes()
      await bulkPutNotes(data)
      await loadData()
      $q.notify({ message: '恢复成功', color: 'positive' })
    } catch {
      $q.notify({ message: '导入失败(格式错误或超限)', color: 'red' })
    }
  }
  reader.readAsText(file)
}

const handleEditorKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    handleSave()
  }
}

onMounted(loadData)
</script>

<style scoped>
.generator-wrapper {
  transition: background-color 0.3s;
}

.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.2s;
}

.max-w-1400 {
  max-width: 1400px;
}

/* 快捷操作栏 */
.quick-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(63, 81, 181, 0.03);
}
.quick-toolbar :deep(.q-btn) {
  min-height: 32px;
  min-width: 32px;
}
.quick-toolbar :deep(.q-btn .q-icon) {
  font-size: 20px;
}
.nav-input {
  width: 90px;
  margin: 0 4px;
}
.nav-input :deep(input) {
  padding: 4px 2px;
  font-size: 14px;
  font-weight: 500;
}

/* 日历单元格 */
.calendar-cell {
  position: relative;
  height: 100%;
  padding: 4px;
}
.lunar-text {
  font-size: 10px;
  position: absolute;
  top: 2px;
  right: 2px;
  color: rgba(128, 128, 128, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 4px);
}
.festival-tag {
  font-size: 10px;
  color: #f5222d;
  background: rgba(255, 241, 240, 0.8);
  padding: 0 2px;
  border-radius: 2px;
  margin-top: 18px;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.notes-dots {
  position: absolute;
  bottom: 4px;
  width: 100%;
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* 屏蔽 antd 原生蓝色点 */
:deep(.ant-picker-calendar-date-content) {
  overflow-y: hidden !important;
}

/* 适配深色模式 */
:deep(.ant-picker-calendar) {
  background: transparent !important;
}
</style>
