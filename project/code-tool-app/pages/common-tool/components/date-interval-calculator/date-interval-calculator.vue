<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto shadow-2 transition-base" style="max-width: 1200px">
      <!-- 头部 -->
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="calendar_today" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">日期间隔计算器</div>
      </q-card-section>

      <q-card-section class="row q-col-gutter-lg">
        <!-- 左侧：两个日期计算间隔 -->
        <div class="col-12 col-md-6">
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
                    v-model:value="intervalStartDate"
                    style="width: 100%"
                    placeholder="选择开始日期"
                    :allow-clear="false"
                  />
                </div>
                <div>
                  <div class="text-caption q-mb-xs text-grey-7">结束日期</div>
                  <a-date-picker
                    v-model:value="intervalEndDate"
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
              <div v-if="intervalResult" class="q-mt-md">
                <a-divider class="q-my-sm" />
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <div class="result-card text-center q-pa-sm rounded-borders">
                      <div class="text-caption text-grey-7">总天数</div>
                      <div class="text-h4 text-weight-bold text-indigo-8">
                        {{ intervalResult.totalDays }}
                      </div>
                      <div class="text-caption text-grey-6">天</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="result-card text-center q-pa-sm rounded-borders">
                      <div class="text-caption text-grey-7">总周数</div>
                      <div class="text-h4 text-weight-bold text-teal-8">
                        {{ intervalResult.weeks }}
                      </div>
                      <div class="text-caption text-grey-6">
                        周 {{ intervalResult.remainDays }} 天
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="result-card text-center q-pa-sm rounded-borders">
                      <div class="text-caption text-grey-7">总月数（约）</div>
                      <div class="text-h5 text-weight-bold text-orange-8">
                        {{ intervalResult.months }}
                      </div>
                      <div class="text-caption text-grey-6">
                        个月 {{ intervalResult.remainDaysAfterMonths }} 天
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="result-card text-center q-pa-sm rounded-borders">
                      <div class="text-caption text-grey-7">总年数（约）</div>
                      <div class="text-h5 text-weight-bold text-blue-8">
                        {{ intervalResult.years }}
                      </div>
                      <div class="text-caption text-grey-6">
                        年 {{ intervalResult.remainMonths }} 月
                        {{ intervalResult.remainDaysAfterYears }} 天
                      </div>
                    </div>
                  </div>
                </div>
                <div class="q-mt-sm text-center">
                  <a-tag color="blue" class="q-pa-xs">
                    {{ intervalResult.startDateStr }} 至 {{ intervalResult.endDateStr }}
                  </a-tag>
                  <a-tag color="green" class="q-pa-xs q-ml-xs">
                    共 {{ intervalResult.totalDays }} 天
                  </a-tag>
                  <a-tag color="orange" class="q-pa-xs q-ml-xs">
                    {{ intervalResult.workdays }} 个工作日
                  </a-tag>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 右侧：日期加减天数 -->
        <div class="col-12 col-md-6">
          <q-card flat bordered class="full-height transition-base">
            <q-card-section class="bg-indigo-1 text-indigo-10">
              <div class="text-subtitle1 text-weight-bold">
                <q-icon name="flight_takeoff" size="sm" class="q-mr-xs" />
                前/后多少天计算日期
              </div>
            </q-card-section>
            <q-card-section class="q-gutter-md">
              <a-space direction="vertical" style="width: 100%" size="middle">
                <div>
                  <div class="text-caption q-mb-xs text-grey-7">基准日期</div>
                  <a-date-picker
                    v-model:value="offsetBaseDate"
                    style="width: 100%"
                    placeholder="选择基准日期"
                    :allow-clear="false"
                  />
                </div>
                <div class="row q-gutter-sm">
                  <div class="col-6">
                    <div class="text-caption q-mb-xs text-grey-7">天数</div>
                    <a-input-number
                      v-model:value="offsetDays"
                      style="width: 100%"
                      :min="0"
                      :max="99999"
                      placeholder="输入天数"
                    />
                  </div>
                  <div class="col-6">
                    <div class="text-caption q-mb-xs text-grey-7">方向</div>
                    <a-select v-model:value="offsetDirection" style="width: 100%">
                      <a-select-option value="after">之后（加）</a-select-option>
                      <a-select-option value="before">之前（减）</a-select-option>
                    </a-select>
                  </div>
                </div>
                <a-button type="primary" block @click="calcOffset">
                  <template #icon><q-icon name="arrow_forward" size="sm" /></template>
                  计算日期
                </a-button>
              </a-space>

              <!-- 偏移结果 -->
              <div v-if="offsetResult" class="q-mt-md">
                <a-divider class="q-my-sm" />
                <div class="text-center q-pa-md result-card rounded-borders">
                  <div class="text-caption text-grey-7">计算结果</div>
                  <div class="text-h5 text-weight-bold text-indigo-8 q-my-sm">
                    {{ offsetResult.dateStr }}
                  </div>
                  <div class="q-gutter-xs">
                    <a-tag color="blue">{{ offsetResult.weekday }}</a-tag>
                    <a-tag color="green">{{ offsetResult.isoDate }}</a-tag>
                  </div>
                  <div class="q-mt-sm text-caption text-grey-6">
                    {{ offsetResult.baseStr }}
                    {{ offsetDirection === 'after' ? '+' : '-' }}
                    {{ offsetDays }} 天
                  </div>
                </div>

                <!-- 常用偏移对比 -->
                <div class="q-mt-md">
                  <div class="text-caption text-grey-7 q-mb-xs">常用偏移对比：</div>
                  <q-list bordered separator dense class="rounded-borders">
                    <q-item v-for="item in commonOffsets" :key="item.label">
                      <q-item-section>
                        <q-item-label>{{ item.label }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-item-label class="text-weight-bold text-indigo-8">
                          {{ item.dateStr }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const WEEKDAY_MAP = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// ─── 间隔计算 ───
const intervalStartDate = ref(dayjs())
const intervalEndDate = ref(dayjs().add(30, 'day'))
const intervalResult = ref(null)

const calcInterval = () => {
  const start = dayjs(intervalStartDate.value)
  const end = dayjs(intervalEndDate.value)
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

  intervalResult.value = {
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

// ─── 偏移计算 ───
const offsetBaseDate = ref(dayjs())
const offsetDays = ref(30)
const offsetDirection = ref('after')
const offsetResult = ref(null)

const calcOffset = () => {
  const base = dayjs(offsetBaseDate.value)
  const days = offsetDays.value || 0
  const target =
    offsetDirection.value === 'after' ? base.add(days, 'day') : base.subtract(days, 'day')

  offsetResult.value = {
    dateStr: target.format('YYYY-MM-DD'),
    isoDate: target.format('YYYY-MM-DDTHH:mm:ss'),
    weekday: WEEKDAY_MAP[target.day()],
    baseStr: base.format('YYYY-MM-DD'),
  }
}

const commonOffsets = computed(() => {
  const base = dayjs(offsetBaseDate.value)
  const items = [
    { label: '7 天后', days: 7, dir: 'after' },
    { label: '30 天后', days: 30, dir: 'after' },
    { label: '90 天后', days: 90, dir: 'after' },
    { label: '100 天后', days: 100, dir: 'after' },
    { label: '7 天前', days: 7, dir: 'before' },
    { label: '30 天前', days: 30, dir: 'before' },
    { label: '100 天前', days: 100, dir: 'before' },
    { label: '365 天后', days: 365, dir: 'after' },
  ]
  return items.map((item) => {
    const d = item.dir === 'after' ? base.add(item.days, 'day') : base.subtract(item.days, 'day')
    return {
      label: item.label,
      dateStr: `${d.format('YYYY-MM-DD')} ${WEEKDAY_MAP[d.day()]}`,
    }
  })
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
.result-card {
  background: rgba(128, 128, 128, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.15);
}
.result-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
