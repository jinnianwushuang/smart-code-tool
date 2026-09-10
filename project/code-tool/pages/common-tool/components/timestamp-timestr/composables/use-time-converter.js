import { ref, computed, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { copyText as projectCopyText } from 'src/output/common/project-common.js'
import { WORLD_CITIES } from '../utils/time-constants.js'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)
dayjs.extend(relativeTime)

export function useTimeConverter() {
  const isAutoUpdate = ref(true)
  const now = ref(dayjs())
  const selectedTimezone = ref(dayjs.tz.guess())
  const parseInput = ref('')

  let timer = null
  const updateNow = () => {
    if (isAutoUpdate.value) now.value = dayjs()
  }

  const currentFormats = computed(() => {
    const t = now.value.tz(selectedTimezone.value)
    return [
      { label: 'Unix (ms)', value: t.valueOf().toString() },
      { label: 'Unix (s)', value: t.unix().toString() },
      { label: '当前时区时间', value: t.format('HH:mm:ss') },
    ]
  })

  const worldClockList = computed(() => {
    const baseTime = now.value.tz(selectedTimezone.value)
    const baseOffset = baseTime.utcOffset()
    return WORLD_CITIES.map((city) => {
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

  const codeSnippets = computed(() => {
    const target = parseInput.value || dayjs().format('YYYY-MM-DD HH:mm:ss')
    const tz = selectedTimezone.value
    return [
      { title: '时区初始化', code: `dayjs.tz('${target}', '${tz}')` },
      { title: '格式化', code: `dayjs().tz('${tz}').format('HH:mm:ss')` },
      { title: '计算时差(小时)', code: `dayjs().diff(dayjs('${target}'), 'hour')` },
      { title: '相对时间', code: `dayjs('${target}').fromNow()` },
      { title: '标准日期时间', code: `dayjs('${target}').format('YYYY-MM-DD HH:mm:ss')` },
      { title: '仅日期', code: `dayjs('${target}').format('YYYY-MM-DD')` },
      { title: '紧凑时间戳(文件名)', code: `dayjs('${target}').format('YYYYMMDDHHmmss')` },
      { title: '本地化星期', code: `dayjs('${target}').format('dddd')` },
      { title: '增加 7 天', code: `dayjs('${target}').add(7, 'day').format('YYYY-MM-DD')` },
      {
        title: '减少 1 个月',
        code: `dayjs('${target}').subtract(1, 'month').format('YYYY-MM-DD')`,
      },
      { title: '增加 2 小时', code: `dayjs('${target}').add(2, 'hour').format('HH:mm:ss')` },
      { title: '链式操作(明天此时+1小时)', code: `dayjs().add(1, 'day').add(1, 'hour').format()` },
      { title: '计算相差天数', code: `dayjs().diff(dayjs('${target}'), 'day')` },
      { title: '计算相差秒数', code: `dayjs().diff(dayjs('${target}'), 'second')` },
      { title: '相对时间 (固定对比)', code: `dayjs('${target}').from(dayjs('2025-01-01'))` },
      {
        title: '本日开始时刻',
        code: `dayjs('${target}').startOf('day').format('YYYY-MM-DD HH:mm:ss')`,
      },
      { title: '本月最后一天', code: `dayjs('${target}').endOf('month').format('YYYY-MM-DD')` },
      { title: '本周一', code: `dayjs('${target}').startOf('week').format('YYYY-MM-DD')` },
      { title: '判断是否在之后', code: `dayjs().isAfter(dayjs('${target}'))` },
      { title: '判断是否在之前', code: `dayjs().isBefore(dayjs('${target}'))` },
      { title: '判断是否相同', code: `dayjs().isSame(dayjs('${target}'), 'day')` },
      { title: '判断是否在区间内', code: `dayjs().isBetween('2025-01-01', dayjs('${target}'))` },
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

  const copy = (v) => {
    if (!v) return
    projectCopyText(v)
  }

  onMounted(() => (timer = setInterval(updateNow, 1000)))
  onUnmounted(() => clearInterval(timer))

  return {
    isAutoUpdate,
    now,
    selectedTimezone,
    parseInput,
    currentFormats,
    worldClockList,
    codeReadyFormats,
    codeSnippets,
    parseResults,
    applyOffset,
    copy,
  }
}
