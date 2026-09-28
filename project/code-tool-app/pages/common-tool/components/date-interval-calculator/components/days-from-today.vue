<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto shadow-2 transition-base" style="max-width: 1200px">
      <!-- 头部 -->
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="event_note" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">距离今日多少天</div>
        <q-space />
        <q-badge color="cyan-3" text-color="black" :label="`共 ${records.length} 条`" />
      </q-card-section>

      <!-- 输入区 -->
      <q-card-section class="input-bar row items-center q-gutter-sm">
        <div class="text-caption text-grey-7">输入或选择日期：</div>
        <a-date-picker
          v-model:value="selectedDate"
          style="width: 220px"
          placeholder="选择日期"
          :allow-clear="false"
          @change="onDateChange"
        />
        <a-button type="primary" @click="addRecord">
          <template #icon><q-icon name="add" size="sm" /></template>
          添加记录
        </a-button>
      </q-card-section>

      <q-separator />

      <!-- 记录列表 -->
      <q-card-section>
        <div v-if="records.length" class="record-grid">
          <div
            v-for="record in records"
            :key="record.dateStr"
            class="record-card row items-center q-pa-sm rounded-borders"
          >
            <div class="col">
              <div class="row items-center q-gutter-sm">
                <span class="text-weight-bold text-body1">{{ record.dateStr }}</span>
                <span class="text-grey-6 text-caption">{{ record.weekday }}</span>
                <a-tag
                  :color="record.diff > 0 ? 'orange' : record.diff < 0 ? 'blue' : 'green'"
                  class="diff-tag"
                >
                  {{ record.diff > 0 ? '还有' : '已过' }}
                  <span class="text-weight-bold">{{ Math.abs(record.diff) }}</span> 天
                </a-tag>
              </div>
              <div class="text-caption text-grey-7 q-mt-xs">{{ record.readableDiff }}</div>
            </div>
            <q-btn
              flat
              round
              dense
              color="grey-5"
              icon="close"
              size="sm"
              @click="removeRecord(record.dateStr)"
            />
          </div>
        </div>
        <div v-else class="text-grey-5 text-center q-pa-xl">
          <q-icon name="event_busy" size="xl" color="grey-4" />
          <div class="q-mt-sm text-body1">暂无记录，请在上方添加日期</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'

const WEEKDAY_MAP = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const STORAGE_KEY = 'date-interval-days-from-today'

const selectedDate = ref(dayjs())
const recordsRaw = ref([])

// 从 localStorage 加载记录
const loadRecords = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      recordsRaw.value = JSON.parse(stored)
    }
  } catch {
    recordsRaw.value = []
  }
}

// 保存到 localStorage
const saveRecords = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recordsRaw.value))
}

// 日期选择变化时自动添加记录
const onDateChange = () => {
  addRecord()
}

// 添加记录
const addRecord = () => {
  const dateStr = dayjs(selectedDate.value).format('YYYY-MM-DD')
  if (recordsRaw.value.some((r) => r.dateStr === dateStr)) return
  recordsRaw.value.unshift({ dateStr })
  saveRecords()
}

// 删除记录
const removeRecord = (dateStr) => {
  recordsRaw.value = recordsRaw.value.filter((r) => r.dateStr !== dateStr)
  saveRecords()
}

// 计算与今天的天数差及可读描述
const getRecordInfo = (dateStr) => {
  const today = dayjs().startOf('day')
  const target = dayjs(dateStr)
  const diff = target.diff(today, 'day')
  const absDiff = Math.abs(diff)
  const years = Math.floor(absDiff / 365)
  const remainAfterYears = absDiff - years * 365
  const months = Math.floor(remainAfterYears / 30)
  const remainDays = remainAfterYears - months * 30

  let readableDiff = ''
  if (diff === 0) {
    readableDiff = '就是今天'
  } else {
    const parts = []
    if (years > 0) parts.push(`${years} 年`)
    if (months > 0) parts.push(`${months} 个月`)
    if (remainDays > 0) parts.push(`${remainDays} 天`)
    readableDiff = parts.length > 0 ? parts.join(' ') : '1 天'
    readableDiff = (diff > 0 ? '未来 ' : '过去 ') + readableDiff
  }

  return {
    diff,
    weekday: WEEKDAY_MAP[dayjs(dateStr).day()],
    readableDiff,
  }
}

// 带计算信息的记录列表
const records = computed(() => {
  return recordsRaw.value.map((r) => ({
    ...r,
    ...getRecordInfo(r.dateStr),
  }))
})

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.generator-wrapper {
  transition: background-color 0.3s;
}
.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
}
.input-bar {
  background: rgba(63, 81, 181, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.record-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 10px;
}
.record-card {
  background: rgba(128, 128, 128, 0.04);
  border: 1px solid rgba(128, 128, 128, 0.12);
  transition:
    background-color 0.2s,
    box-shadow 0.2s;
}
.record-card:hover {
  background: rgba(128, 128, 128, 0.08);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.diff-tag {
  font-size: 11px;
}
</style>
