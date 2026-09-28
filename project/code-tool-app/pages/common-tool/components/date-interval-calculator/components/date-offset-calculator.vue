<template>
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
            v-model:value="baseDate"
            style="width: 100%"
            placeholder="选择基准日期"
            :allow-clear="false"
          />
        </div>
        <div class="row q-gutter-sm">
          <div class="col-6">
            <div class="text-caption q-mb-xs text-grey-7">天数</div>
            <a-input-number
              v-model:value="days"
              style="width: 100%"
              :min="0"
              :max="99999"
              placeholder="输入天数"
            />
          </div>
          <div class="col-6">
            <div class="text-caption q-mb-xs text-grey-7">方向</div>
            <a-select v-model:value="direction" style="width: 100%">
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
      <div v-if="result" class="q-mt-md">
        <a-divider class="q-my-sm" />
        <div class="text-center q-pa-md result-card rounded-borders">
          <div class="text-caption text-grey-7">计算结果</div>
          <div class="text-h5 text-weight-bold text-indigo-8 q-my-sm">
            {{ result.dateStr }}
          </div>
          <div class="q-gutter-xs">
            <a-tag color="blue">{{ result.weekday }}</a-tag>
            <a-tag color="green">{{ result.isoDate }}</a-tag>
          </div>
          <div class="q-mt-sm text-caption text-grey-6">
            {{ result.baseStr }}
            {{ direction === 'after' ? '+' : '-' }}
            {{ days }} 天
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
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const WEEKDAY_MAP = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const baseDate = ref(dayjs())
const days = ref(30)
const direction = ref('after')
const result = ref(null)

const calcOffset = () => {
  const base = dayjs(baseDate.value)
  const d = days.value || 0
  const target = direction.value === 'after' ? base.add(d, 'day') : base.subtract(d, 'day')

  result.value = {
    dateStr: target.format('YYYY-MM-DD'),
    isoDate: target.format('YYYY-MM-DDTHH:mm:ss'),
    weekday: WEEKDAY_MAP[target.day()],
    baseStr: base.format('YYYY-MM-DD'),
  }
}

const commonOffsets = computed(() => {
  const base = dayjs(baseDate.value)
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
