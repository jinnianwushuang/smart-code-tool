<template>
  <q-card flat bordered class="full-height transition-base">
    <q-card-section class="bg-indigo-1 text-indigo-10">
      <div class="text-subtitle1 text-weight-bold">
        <q-icon name="date_range" size="sm" class="q-mr-xs" />
        两日期计算间隔
      </div>
    </q-card-section>
    <q-card-section class="q-gutter-md">
      <a-space direction="vertical" style="width: 100%" size="middle">
        <div>
          <div class="text-caption q-mb-xs text-grey-7">开始日期</div>
          <a-date-picker
            v-model:value="startDate"
            style="width: 100%"
            placeholder="选择开始日期"
            :allow-clear="false"
          />
        </div>
        <div>
          <div class="text-caption q-mb-xs text-grey-7">结束日期</div>
          <a-date-picker
            v-model:value="endDate"
            style="width: 100%"
            placeholder="选择结束日期"
            :allow-clear="false"
          />
        </div>
        <a-button type="primary" block @click="calcInterval">
          <template #icon><q-icon name="calculate" size="sm" /></template>
          计算间隔
        </a-button>
      </a-space>

      <!-- 间隔结果 -->
      <div v-if="result" class="q-mt-md">
        <a-divider class="q-my-sm" />
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <div class="result-card text-center q-pa-sm rounded-borders">
              <div class="text-caption text-grey-7">总天数</div>
              <div class="text-h4 text-weight-bold text-indigo-8">
                {{ result.totalDays }}
              </div>
              <div class="text-caption text-grey-6">天</div>
            </div>
          </div>
          <div class="col-6">
            <div class="result-card text-center q-pa-sm rounded-borders">
              <div class="text-caption text-grey-7">总周数</div>
              <div class="text-h4 text-weight-bold text-teal-8">
                {{ result.weeks }}
              </div>
              <div class="text-caption text-grey-6">周 {{ result.remainDays }} 天</div>
            </div>
          </div>
          <div class="col-6">
            <div class="result-card text-center q-pa-sm rounded-borders">
              <div class="text-caption text-grey-7">总月数（约）</div>
              <div class="text-h5 text-weight-bold text-orange-8">
                {{ result.months }}
              </div>
              <div class="text-caption text-grey-6">个月 {{ result.remainDaysAfterMonths }} 天</div>
            </div>
          </div>
          <div class="col-6">
            <div class="result-card text-center q-pa-sm rounded-borders">
              <div class="text-caption text-grey-7">总年数（约）</div>
              <div class="text-h5 text-weight-bold text-blue-8">
                {{ result.years }}
              </div>
              <div class="text-caption text-grey-6">
                年 {{ result.remainMonths }} 月 {{ result.remainDaysAfterYears }} 天
              </div>
            </div>
          </div>
        </div>
        <div class="q-mt-sm text-center">
          <a-tag color="blue" class="q-pa-xs">
            {{ result.startDateStr }} 至 {{ result.endDateStr }}
          </a-tag>
          <a-tag color="green" class="q-pa-xs q-ml-xs"> 共 {{ result.totalDays }} 天 </a-tag>
          <a-tag color="orange" class="q-pa-xs q-ml-xs"> {{ result.workdays }} 个工作日 </a-tag>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs'

const startDate = ref(dayjs())
const endDate = ref(dayjs().add(30, 'day'))
const result = ref(null)

const calcInterval = () => {
  const start = dayjs(startDate.value)
  const end = dayjs(endDate.value)
  const diff = end.diff(start, 'day')
  const absDiff = Math.abs(diff)

  let workdays = 0
  const cursor = diff >= 0 ? start : end
  const endCursor = diff >= 0 ? end : start
  let d = dayjs(cursor)
  while (d.isBefore(endCursor)) {
    const day = d.day()
    if (day !== 0 && day !== 6) workdays++
    d = d.add(1, 'day')
  }

  const years = Math.floor(absDiff / 365)
  const remainAfterYears = absDiff - years * 365
  const remainMonths = Math.floor(remainAfterYears / 30)
  const remainDaysAfterYears = remainAfterYears - remainMonths * 30

  const months = Math.floor(absDiff / 30)
  const remainDaysAfterMonths = absDiff - months * 30

  result.value = {
    totalDays: absDiff,
    weeks: Math.floor(absDiff / 7),
    remainDays: absDiff % 7,
    months,
    remainDaysAfterMonths,
    years,
    remainMonths,
    remainDaysAfterYears,
    workdays,
    startDateStr: start.format('YYYY-MM-DD'),
    endDateStr: end.format('YYYY-MM-DD'),
  }
}
</script>

<style scoped>
.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
}
.result-card {
  background: rgba(128, 128, 128, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.15);
}
.result-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
