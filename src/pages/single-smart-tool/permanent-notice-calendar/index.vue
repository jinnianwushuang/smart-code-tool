<template>
  <div class="q-pa-md bg-grey-1 min-height-screen">
    <div class="row q-col-gutter-md">
      <!-- 左侧：Antdv 日历主体 -->
      <div class="col-12 col-md-8">
        <a-card :bordered="false" class="shadow-1">
          <template #title>
            <div class="row items-center q-gutter-sm">
              <q-icon name="calendar_today" color="primary" size="sm" />
              <span class="text-weight-bold">万年历</span>
            </div>
          </template>
          <template #extra>
            <div class="row q-gutter-x-sm">
              <a-button size="small" @click="triggerFileInput">导入恢复</a-button>
              <a-button size="small" type="primary" ghost @click="exportToJSON">备份导出</a-button>
              <a-popconfirm title="确定清理本月数据？" @confirm="clearCurrentMonth">
                <a-button size="small" danger ghost>清理本月</a-button>
              </a-popconfirm>
              <input
                type="file"
                ref="fileInput"
                class="hidden"
                accept=".json"
                @change="importFromJSON"
              />
            </div>
          </template>
          <div>今天日期：{{ dayjs().format('YYYY-MM-DD') }}</div>
          <a-calendar v-model:value="selectedDayjs" @select="onSelect">
            <!-- 自定义日期单元格内容 -->
            <template #dateCellRender="{ current }">
              <div class="calendar-cell">
                <!-- 农历显示 -->
                <div class="lunar-text text-grey-6">{{ getLunarDay(current) }}</div>

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
        </a-card>
      </div>

      <!-- 右侧：管理面板 -->
      <div class="col-12 col-md-4">
        <a-card title="备注同步中心" :bordered="false" class="shadow-1 sticky-card">
          <template #extra>
            <a-tag :color="allNotes.length >= 55 ? 'red' : 'blue'">
              {{ allNotes.length }} / 60
            </a-tag>
          </template>

          <div class="q-gutter-y-md">
            <a-input-search
              v-model:value="searchQuery"
              placeholder="搜索日期或内容..."
              allow-clear
            />

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
          </div>
        </a-card>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:visible="editVisible"
      :title="`备注: ${selectedDayjs.format('YYYY-MM-DD')}`"
      @ok="handleSave"
    >
      <div class="q-mb-md text-primary text-caption">
        {{ getFullLunarDetail(selectedDayjs) }}
      </div>
      <a-textarea
        v-model:value="tempContent"
        placeholder="在此输入备注..."
        :rows="4"
        show-count
        :maxlength="100"
      />
    </a-modal>
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
}
.festival-tag {
  font-size: 10px;
  color: #f5222d;
  background: #fff1f0;
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
  max-height: 500px;
  overflow-y: auto;
}
.sticky-card {
  position: sticky;
  top: 16px;
}
.min-height-screen {
  min-height: 90vh;
}
/* 屏蔽 antd 原生蓝色点 */
:deep(.ant-picker-calendar-date-content) {
  overflow-y: hidden !important;
}
</style>
