<template>
  <div class="q-pa-md generator-wrapper">
    <div class="row q-col-gutter-md q-mx-auto max-w-1400">
      <!-- 左侧：Antdv 日历主体 -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="shadow-2 transition-base">
          <q-card-section class="bg-indigo-8 text-white row items-center">
            <q-icon name="calendar_today" size="sm" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">万年历</div>
            <q-space />
            <div class="row q-gutter-x-sm">
              <q-btn flat color="white" size="sm" label="导入恢复" @click="triggerFileInput" />
              <q-btn
                flat
                color="white"
                size="sm"
                label="备份导出"
                icon="download"
                @click="exportToJSON"
              />
              <q-btn outline color="white" size="sm" label="清理本月" @click="confirmClearMonth" />
              <input
                type="file"
                ref="fileInput"
                class="hidden"
                accept=".json"
                @change="importFromJSON"
              />
            </div>
          </q-card-section>

          <q-card-section class="q-pb-none">
            <div class="text-caption font-mono">今天日期：{{ dayjs().format('YYYY-MM-DD') }}</div>
          </q-card-section>

          <q-card-section>
            <a-calendar v-model:value="selectedDayjs" @select="onSelect">
              <!-- 自定义日期单元格内容 -->
              <template #dateCellRender="{ current }">
                <div class="calendar-cell">
                  <!-- 农历显示 -->
                  <div class="lunar-text">{{ getLunarDay(current) }}</div>

                  <!-- 节日提醒 -->
                  <div class="festival-tag" v-if="getFestival(current)">
                    {{ getFestival(current) }}
                  </div>

                  <!-- 备注标记点 -->
                  <div class="notes-dots row justify-center q-gutter-x-xs">
                    <div
                      v-for="note in getNotesByDate(current)"
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

      <!-- 右侧：管理面板 -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="shadow-2 sticky-card transition-base">
          <q-card-section class="bg-indigo-8 text-white row items-center q-py-sm">
            <q-icon name="assignment" size="xs" class="q-mr-xs" />
            <div class="text-subtitle2">备注同步中心</div>
            <q-space />
            <q-badge :color="allNotes.length >= 55 ? 'red' : 'cyan-3'" text-color="black">
              {{ allNotes.length }} / 60
            </q-badge>
          </q-card-section>

          <q-card-section class="q-gutter-y-md">
            <q-input v-model="searchQuery" placeholder="搜索日期或内容..." filled dense clearable />

            <div class="scroll-list">
              <a-list item-layout="horizontal" :data-source="filteredNotes">
                <template #renderItem="{ item }">
                  <a-list-item class="cursor-pointer" @click="selectedDayjs = dayjs(item.date)">
                    <a-list-item-meta :description="item.content">
                      <template #title>
                        <span
                          :class="
                            selectedDayjs.format('YYYY-MM-DD') === item.date
                              ? 'text-primary text-weight-bold'
                              : ''
                          "
                        >
                          {{ item.date }}
                        </span>
                      </template>
                    </a-list-item-meta>
                    <template #actions>
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        color="grey-4"
                        size="sm"
                        @click.stop="confirmDelete(item.date)"
                      />
                    </template>
                  </a-list-item>
                </template>
              </a-list>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <q-dialog v-model="editVisible">
      <q-card style="min-width: 350px" class="transition-base">
        <q-card-section class="bg-indigo-8 text-white">
          <div class="text-h6">备注: {{ selectedDayjs.format('YYYY-MM-DD') }}</div>
        </q-card-section>

        <q-card-section>
          <div class="q-mb-md text-primary text-caption">
            {{ getFullLunarDetail(selectedDayjs) }}
          </div>
          <q-input
            v-model="tempContent"
            type="textarea"
            filled
            placeholder="在此输入备注..."
            rows="4"
            counter
            maxlength="100"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="保存" @click="handleSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar, exportFile } from 'quasar'
import dayjs from 'dayjs'
import { Solar, Lunar } from 'lunar-javascript'
import Dexie from 'dexie'

const $q = useQuasar()
const fileInput = ref(null)

// 数据库初始化
const db = new Dexie('AntdvCalendarDB')
db.version(1).stores({ notes: 'date' })

// 状态
const selectedDayjs = ref(dayjs())
const searchQuery = ref('')
const allNotes = ref([])
const editVisible = ref(false)
const tempContent = ref('')

// --- 农历逻辑 ---
const getLunarDay = (current) => {
  const lun = Solar.fromDate(current.toDate()).getLunar()
  return lun.getDayInChinese()
}

const getFestival = (current) => {
  const sol = Solar.fromDate(current.toDate())
  const lun = sol.getLunar()
  const f = [...lun.getFestivals(), ...sol.getFestivals(), ...lun.getJieQi()]
  return f.length > 0 ? f[0] : null
}

const getFullLunarDetail = (day) => {
  const lun = Solar.fromDate(day.toDate()).getLunar()
  return `${lun.getYearInGanZhi()}年(${lun.getYearShengXiao()}) ${lun.getMonthInChinese()}月${lun.getDayInChinese()}`
}

// --- 备注逻辑 ---
const getNotesByDate = (current) => {
  const dStr = current.format('YYYY-MM-DD')
  return allNotes.value.filter((n) => n.date === dStr)
}

const getNoteColor = (content) => {
  if (content.includes('生日') || content.includes('纪念')) return 'red'
  if (content.includes('加班') || content.includes('工作')) return 'blue'
  return 'orange'
}

const filteredNotes = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return allNotes.value
    .filter((n) => n.date.includes(q) || n.content.toLowerCase().includes(q))
    .sort((a, b) => b.date.localeCompare(a.date))
})

// --- 操作函数 ---
const loadData = async () => {
  allNotes.value = await db.notes.toArray()
}

const onSelect = async (val) => {
  const dStr = val.format('YYYY-MM-DD')
  const record = await db.notes.get(dStr)
  tempContent.value = record ? record.content : ''
  editVisible.value = true
}

const confirmClearMonth = () => {
  $q.dialog({
    title: '确认清理',
    message: '确定清理本月数据吗？',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    clearCurrentMonth()
  })
}

const handleSave = async () => {
  const dStr = selectedDayjs.value.format('YYYY-MM-DD')
  if (allNotes.value.length >= 60 && !allNotes.value.find((n) => n.date === dStr)) {
    $q.notify({ message: '备注上限60条', color: 'red' })
    return
  }
  if (tempContent.value.trim()) {
    await db.notes.put({ date: dStr, content: tempContent.value.trim() })
  } else {
    await db.notes.delete(dStr)
  }
  await loadData()
  editVisible.value = false
  if (allNotes.value.length % 10 === 0) $q.notify({ message: '建议备份数据', color: 'info' })
}

const clearCurrentMonth = async () => {
  const monthStr = selectedDayjs.value.format('YYYY-MM')
  const toDel = allNotes.value.filter((n) => n.date.startsWith(monthStr))
  for (const item of toDel) await db.notes.delete(item.date)
  await loadData()
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
  const reader = new FileReader()
  reader.onload = async (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      if (data.length > 60) throw new Error()
      await db.notes.clear()
      await db.notes.bulkPut(data)
      await loadData()
      $q.notify({ message: '恢复成功', color: 'positive' })
    } catch {
      $q.notify({ message: '导入失败(格式错误或超限)', color: 'red' })
    }
  }
  reader.readAsText(file)
}

const confirmDelete = async (d) => {
  await db.notes.delete(d)
  await loadData()
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
.scroll-list {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}
.sticky-card {
  position: sticky;
  top: 16px;
}

.font-mono {
  font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
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
