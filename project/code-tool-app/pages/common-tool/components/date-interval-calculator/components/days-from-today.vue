<template>
  <q-card flat bordered class="transition-base">
    <q-card-section class="bg-indigo-1 text-indigo-10">
      <div class="text-subtitle1 text-weight-bold">
        <q-icon name="event_note" size="sm" class="q-mr-xs" />
        距离今日多少天
      </div>
    </q-card-section>
    <q-card-section>
      <div class="row q-col-gutter-md">
        <!-- 左侧：输入区域 -->
        <div class="col-12 col-md-4">
          <div class="text-caption q-mb-xs text-grey-7">输入或选择日期</div>
          <a-date-picker
            v-model:value="selectedDate"
            style="width: 100%"
            placeholder="选择日期"
            :allow-clear="false"
            @change="onDateChange"
          />
          <a-button type="primary" block class="q-mt-md" @click="addRecord">
            <template #icon><q-icon name="add" size="sm" /></template>
            添加记录
          </a-button>
        </div>
        <!-- 右侧：记录列表 -->
        <div class="col-12 col-md-8">
          <div class="text-caption q-mb-xs text-grey-7">日期记录（共 {{ records.length }} 条）</div>
          <q-list v-if="records.length" bordered separator dense class="rounded-borders">
            <q-item v-for="record in records" :key="record.dateStr">
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ record.dateStr }}
                  <span class="text-grey-6 text-weight-regular">（{{ record.weekday }}）</span>
                </q-item-label>
                <q-item-label caption>
                  {{ record.readableDiff }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row items-center no-wrap q-gutter-sm">
                  <a-tag :color="record.diff > 0 ? 'orange' : record.diff < 0 ? 'blue' : 'green'">
                    {{ record.diff > 0 ? '还有' : '已过' }}
                    <span class="text-weight-bold">{{ Math.abs(record.diff) }}</span> 天
                  </a-tag>
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="close"
                    size="sm"
                    @click="removeRecord(record.dateStr)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-grey-5 text-center q-pa-md">暂无记录，请添加日期</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
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
.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
}
</style>
