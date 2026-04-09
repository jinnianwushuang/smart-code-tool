<template>
  <div class="q-pa-md bg-grey-2">
    <div class="row q-col-gutter-md">
      <!-- 1. 顶部控制台 (主控时区/实时) -->
      <div class="col-12">
        <q-card flat bordered class="bg-indigo-10 text-white shadow-2">
          <q-card-section class="row items-center q-pb-none">
            <q-icon name="public" size="md" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">时间转换器</div>
            <q-space />
            <q-select
              v-model="selectedTimezone"
              :options="timezoneOptions"
              dark
              dense
              filled
              options-dense
              label="基准时区 (Base)"
              class="q-mr-md"
              style="min-width: 200px"
            />
            <q-toggle v-model="isAutoUpdate" label="实时同步" color="cyan" keep-color />
          </q-card-section>

          <q-card-section class="row q-col-gutter-sm">
            <div v-for="item in currentFormats" :key="item.label" class="col-12 col-sm-4 col-md-2">
              <div
                class="bg-white-1 q-pa-xs rounded-borders text-center cursor-pointer"
                @click="copy(item.value)"
              >
                <div class="text-caption text-indigo-2">{{ item.label }}</div>
                <div class="text-subtitle2 font-mono ellipsis">{{ item.value }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 2. [新增区域] 全球主要时区对比 -->
      <div class="col-12">
        <q-card flat bordered class="shadow-1">
          <q-card-section class="bg-blue-grey-9 text-white row items-center q-py-xs">
            <q-icon name="language" size="sm" class="q-mr-xs" />
            <div class="text-subtitle1">全球时区实时对比 (相对基准时差)</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div v-for="tz in worldClockList" :key="tz.name" class="col-12 col-sm-4 col-md-2">
              <q-card flat bordered class="bg-grey-1 hover-shadow">
                <q-card-section class="q-pa-sm">
                  <div class="row items-center justify-between no-wrap">
                    <span class="text-weight-bold text-blue-grey-8">{{ tz.name }}</span>
                    <q-badge :color="tz.diff >= 0 ? 'orange' : 'deep-orange'" label-color="white">
                      {{ tz.diff >= 0 ? '+' : '' }}{{ tz.diff }}h
                    </q-badge>
                  </div>
                  <div class="text-h6 font-mono text-center q-my-xs text-blue-grey-10">
                    {{ tz.time }}
                  </div>
                  <div class="text-center">
                    <q-btn
                      flat
                      dense
                      color="primary"
                      label="复制"
                      icon="content_copy"
                      size="xs"
                      @click="copy(tz.full)"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 3. 编程常用格式 (Code Ready) -->
      <div class="col-12">
        <q-card flat bordered class="shadow-1">
          <q-card-section class="bg-blue-9 text-white row items-center q-py-xs">
            <q-icon name="terminal" size="sm" class="q-mr-xs" />
            <div class="text-subtitle1">编程常用格式化</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div v-for="fmt in codeReadyFormats" :key="fmt.label" class="col-12 col-sm-4 col-md-3">
              <q-input
                :model-value="fmt.value"
                :label="fmt.label"
                filled
                dense
                readonly
                stack-label
                class="font-mono"
              >
                <template v-slot:append>
                  <q-btn flat round dense icon="content_copy" size="xs" @click="copy(fmt.value)" />
                </template>
              </q-input>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 4. 解析与偏移 (左) -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="full-height shadow-1">
          <q-card-section class="bg-grey-8 text-white">解析与快捷偏移</q-card-section>
          <q-card-section class="q-gutter-y-sm">
            <q-input v-model="parseInput" filled label="时间戳或字符串" dense clearable />
            <div class="row q-gutter-xs">
              <q-btn
                v-for="opt in offsets"
                :key="opt.label"
                :label="opt.label"
                size="xs"
                color="grey-3"
                text-color="black"
                @click="applyOffset(opt.value, opt.unit)"
              />
            </div>
            <q-list bordered separator class="bg-grey-1 rounded-borders q-mt-md">
              <q-item v-for="res in parseResults" :key="res.label">
                <q-item-section>
                  <q-item-label caption>{{ res.label }}</q-item-label>
                  <q-item-label class="font-mono text-weight-bold">{{ res.value }}</q-item-label>
                </q-item-section>
                <q-item-section side
                  ><q-btn flat round icon="content_copy" size="xs" @click="copy(res.value)"
                /></q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- 5. 代码生成器 (右) -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="full-height shadow-1">
          <q-card-section class="bg-deep-purple-8 text-white row items-center">
            <q-icon name="javascript" size="sm" class="q-mr-xs" />
            <span>Day.js 代码片段生成</span>
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div
              v-for="snippet in codeSnippets"
              :key="snippet.title"
              class="col-12 col-md-6 q-mb-sm"
            >
              <div class="row items-center justify-between q-mb-xs">
                <span class="text-caption text-weight-bold text-deep-purple">{{
                  snippet.title
                }}</span>
                <q-btn
                  flat
                  round
                  dense
                  icon="content_copy"
                  size="xs"
                  color="deep-purple"
                  @click="copy(snippet.code)"
                />
              </div>
              <div
                class="bg-grey-9 q-pa-sm rounded-borders font-mono text-lime-4 size-11 pre-wrap overflow-hidden"
              >
                {{ snippet.code }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)
dayjs.extend(relativeTime)

const $q = useQuasar()
const isAutoUpdate = ref(true)
const now = ref(dayjs())
const selectedTimezone = ref(dayjs.tz.guess())
const parseInput = ref('')
const diffA = ref(dayjs().format('YYYY-MM-DD'))
const diffB = ref('2024-01-01')

const timezoneOptions = [
  'UTC',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'America/New_York',
  'Europe/London',
  'America/Los_Angeles',
]

const worldCities = [
  { name: '北京', zone: 'Asia/Shanghai' },
  { name: '东京', zone: 'Asia/Tokyo' },
  { name: '伦敦', zone: 'Europe/London' },
  { name: '纽约', zone: 'America/New_York' },
  { name: '洛杉矶', zone: 'America/Los_Angeles' },
  { name: 'UTC', zone: 'UTC' },
]

const offsets = [
  { label: '-1h', value: -1, unit: 'hour' },
  { label: '+1h', value: 1, unit: 'hour' },
  { label: '-1d', value: -1, unit: 'day' },
  { label: '+1d', value: 1, unit: 'day' },
]

let timer = null
const updateNow = () => {
  if (isAutoUpdate.value) now.value = dayjs()
}

// 1. 顶部基础信息
const currentFormats = computed(() => {
  const t = now.value.tz(selectedTimezone.value)
  return [
    { label: 'Unix (ms)', value: t.valueOf().toString() },
    { label: 'Unix (s)', value: t.unix().toString() },
    { label: '当前时区时间', value: t.format('HH:mm:ss') },
  ]
})

// 2. [新增] 世界时区列表计算
const worldClockList = computed(() => {
  const baseTime = now.value.tz(selectedTimezone.value)
  const baseOffset = baseTime.utcOffset() // 当前选中的基准偏移(分钟)

  return worldCities.map((city) => {
    const cityTime = now.value.tz(city.zone)
    const diffHours = (cityTime.utcOffset() - baseOffset) / 60
    return {
      name: city.name,
      time: cityTime.format('HH:mm:ss'),
      full: cityTime.format('YYYY-MM-DD HH:mm:ss'),
      diff: diffHours,
    }
  })
})

// 3. 编程格式化
const codeReadyFormats = computed(() => {
  const t = now.value.tz(selectedTimezone.value)
  return [
    { label: 'ISO 8601', value: t.format() },
    { label: 'SQL Standard', value: t.format('YYYY-MM-DD HH:mm:ss') },
    { label: 'Compact Log', value: t.format('YYYYMMDD_HHmmss') },
    { label: 'UTC String', value: t.utc().format() },
    { label: 'kebab-case', value: t.format('YYYY-MM-DD-HH-mm-ss') },
    { label: 'snake_case', value: t.format('YYYY_MM_DD_HH_mm_ss') },
    { label: 'dense', value: t.format('YYYYMMDDHHmmss') },

    { label: 'Unix Timestamp', value: t.unix() },
  ]
})

// 4. 代码生成
const codeSnippets = computed(() => {
  const target = parseInput.value || dayjs().format('YYYY-MM-DD HH:mm:ss')
  const tz = selectedTimezone.value
  return [
    { title: '时区初始化', code: `dayjs.tz('${target}', '${tz}')` },
    { title: '格式化', code: `dayjs().tz('${tz}').format('HH:mm:ss')` },
    { title: '计算时差(小时)', code: `dayjs().diff(dayjs('${target}'), 'hour')` },
    { title: '相对时间', code: `dayjs('${target}').fromNow()` },
    // --- 1. 格式化 (Formatting) ---
    { title: '标准日期时间', code: `dayjs('${target}').format('YYYY-MM-DD HH:mm:ss')` },
    { title: '仅日期', code: `dayjs('${target}').format('YYYY-MM-DD')` },
    { title: '紧凑时间戳(文件名)', code: `dayjs('${target}').format('YYYYMMDDHHmmss')` },
    { title: '本地化星期', code: `dayjs('${target}').format('dddd')` },

    // --- 2. 加减偏移 (Manipulate) ---
    { title: '增加 7 天', code: `dayjs('${target}').add(7, 'day').format('YYYY-MM-DD')` },
    { title: '减少 1 个月', code: `dayjs('${target}').subtract(1, 'month').format('YYYY-MM-DD')` },
    { title: '增加 2 小时', code: `dayjs('${target}').add(2, 'hour').format('HH:mm:ss')` },
    { title: '链式操作(明天此时+1小时)', code: `dayjs().add(1, 'day').add(1, 'hour').format()` },

    // --- 3. 差异与相对时间 (Diff & Relative) ---
    { title: '计算相差天数', code: `dayjs().diff(dayjs('${target}'), 'day')` },
    { title: '计算相差秒数', code: `dayjs().diff(dayjs('${target}'), 'second')` },
    { title: '相对时间 (距今)', code: `dayjs('${target}').fromNow()` }, // 需加载 relativeTime 插件
    { title: '相对时间 (固定对比)', code: `dayjs('${target}').from(dayjs('2025-01-01'))` },

    // --- 4. 边界处理 (Start/End of Time) ---
    {
      title: '本日开始时刻',
      code: `dayjs('${target}').startOf('day').format('YYYY-MM-DD HH:mm:ss')`,
    },
    { title: '本月最后一天', code: `dayjs('${target}').endOf('month').format('YYYY-MM-DD')` },
    { title: '本周一', code: `dayjs('${target}').startOf('week').format('YYYY-MM-DD')` },

    // --- 5. 查询与判断 (Query) ---
    { title: '判断是否在之后', code: `dayjs().isAfter(dayjs('${target}'))` },
    { title: '判断是否在之前', code: `dayjs().isBefore(dayjs('${target}'))` },
    { title: '判断是否相同', code: `dayjs().isSame(dayjs('${target}'), 'day')` },
    { title: '判断是否在区间内', code: `dayjs().isBetween('2025-01-01', dayjs('${target}'))` }, // 需加载 isBetween 插件

    // --- 6. 转换 (Convert) ---
    { title: '转为 Unix 秒', code: `dayjs('${target}').unix()` },
    { title: '转为 JS Date 对象', code: `dayjs('${target}').toDate()` },
    { title: '解析 Unix 秒为 Dayjs', code: `dayjs.unix(1735689600)` },
  ]
})

const parseResults = computed(() => {
  if (!parseInput.value) return []
  const d = /^\d+$/.test(parseInput.value)
    ? parseInput.value.length > 10
      ? dayjs(Number(parseInput.value))
      : dayjs.unix(Number(parseInput.value))
    : dayjs(parseInput.value)
  if (!d.isValid()) return [{ label: '错误', value: '无效格式' }]
  return [
    { label: '本地 (Local)', value: d.format('YYYY-MM-DD HH:mm:ss') },
    {
      label: `目标 (${selectedTimezone.value})`,
      value: d.tz(selectedTimezone.value).format('HH:mm:ss'),
    },
  ]
})

const applyOffset = (v, u) => {
  const base = parseInput.value ? dayjs(parseInput.value) : dayjs()
  parseInput.value = base.add(v, u).format('YYYY-MM-DD HH:mm:ss')
}

const copy = (v) =>
  copyToClipboard(v).then(() =>
    $q.notify({ message: '已复制', color: 'positive', timeout: 500, position: 'top' }),
  )

onMounted(() => (timer = setInterval(updateNow, 1000)))
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.font-mono {
  font-family: 'Fira Code', monospace;
}
.size-11 {
  font-size: 11px;
}
.bg-white-1 {
  background: rgba(255, 255, 255, 0.15);
}
.pre-wrap {
  white-space: pre-wrap;
  word-break: break-all;
}
.hover-shadow:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: 0.3s;
}
</style>
