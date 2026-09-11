<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto shadow-2 transition-base" style="max-width: 1200px">
      <!-- 头部 -->
      <q-card-section class="bg-teal-8 text-white row items-center">
        <q-icon name="celebration" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">中国传统节日计算器</div>
        <q-space />
        <div class="text-caption">{{ lunarInfo }}</div>
      </q-card-section>

      <q-card-section>
        <!-- 节日分类标签页 -->
        <q-tabs
          v-model="festivalTab"
          dense
          class="text-grey"
          active-color="teal"
          indicator-color="teal"
          align="left"
        >
          <q-tab name="all" label="全部节日" icon="list" />
          <q-tab name="lunar" label="农历节日" icon="nights_stay" />
          <q-tab name="solar" label="公历节日" icon="event" />
          <q-tab name="countdown" label="倒计时" icon="timer" />
        </q-tabs>

        <q-tab-panels v-model="festivalTab" animated class="bg-transparent q-mt-sm">
          <!-- 全部节日 -->
          <q-tab-panel name="all">
            <div class="text-caption q-mb-sm text-grey-7">
              点击节日查看今年/明年的公历日期，并计算距今还有多少天：
            </div>
            <div class="row q-gutter-xs">
              <a-button
                v-for="f in allFestivalList"
                :key="f.name"
                size="small"
                :type="selectedFestival?.name === f.name ? 'primary' : 'default'"
                @click="selectFestival(f)"
              >
                {{ f.emoji }} {{ f.name }}
                <span class="festival-date">{{ f.solarStr }}</span>
              </a-button>
            </div>
            <!-- 选中节日详情 -->
            <div v-if="selectedFestival" class="q-mt-md">
              <a-divider class="q-my-sm" />
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <div class="result-card text-center q-pa-md rounded-borders">
                    <div class="text-h5">{{ selectedFestival.emoji }}</div>
                    <div class="text-h6 text-weight-bold text-teal-8 q-my-xs">
                      {{ selectedFestival.name }}
                    </div>
                    <div class="text-h4 text-weight-bold text-indigo-8">
                      {{ selectedFestival.countdown }} 天
                    </div>
                    <div class="text-caption text-grey-6">距离今天</div>
                  </div>
                </div>
                <div class="col-12 col-md-8">
                  <q-list bordered separator dense class="rounded-borders">
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>公历日期</q-item-label>
                        <q-item-label class="text-weight-bold">
                          {{ selectedFestival.solarStr }} {{ selectedFestival.weekday }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="selectedFestival.lunarStr">
                      <q-item-section>
                        <q-item-label caption>农历日期</q-item-label>
                        <q-item-label class="text-weight-bold text-orange-8">
                          {{ selectedFestival.lunarStr }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>年份</q-item-label>
                        <q-item-label>
                          <a-tag :color="selectedFestival.isNextYear ? 'orange' : 'green'">
                            {{ selectedFestival.year }} 年
                            {{ selectedFestival.isNextYear ? '（明年）' : '（今年）' }}
                          </a-tag>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>距今天数</q-item-label>
                        <q-item-label class="text-weight-bold text-teal-8">
                          {{ selectedFestival.countdown }} 天
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>距今天周数</q-item-label>
                        <q-item-label>
                          {{ Math.floor(selectedFestival.countdown / 7) }} 周
                          {{ selectedFestival.countdown % 7 }} 天
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- 农历节日 -->
          <q-tab-panel name="lunar">
            <div class="text-caption q-mb-sm text-grey-7">
              农历传统节日，自动计算今年或明年的公历日期：
            </div>
            <div class="row q-col-gutter-sm">
              <div v-for="f in lunarFestivalList" :key="f.name" class="col-6 col-sm-4 col-md-3">
                <div
                  class="countdown-card text-center q-pa-sm rounded-borders cursor-pointer"
                  :class="{ 'countdown-card--active': selectedFestival?.name === f.name }"
                  @click="selectFestival(f)"
                >
                  <div class="text-h5">{{ f.emoji }}</div>
                  <div class="text-weight-bold text-indigo-8">{{ f.name }}</div>
                  <div class="text-caption text-grey-6">{{ f.lunarStr }}</div>
                  <div class="text-subtitle1 text-weight-bold text-teal-8 q-my-xs">
                    {{ f.countdown }} 天
                  </div>
                  <div class="text-caption text-grey-6">{{ f.solarStr }}</div>
                  <a-tag v-if="f.isNextYear" color="orange" class="q-mt-xs">明年</a-tag>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- 公历节日 -->
          <q-tab-panel name="solar">
            <div class="text-caption q-mb-sm text-grey-7">
              公历固定节日及节气，自动计算今年或明年的日期：
            </div>
            <div class="row q-col-gutter-sm">
              <div v-for="f in solarFestivalList" :key="f.name" class="col-6 col-sm-4 col-md-3">
                <div
                  class="countdown-card text-center q-pa-sm rounded-borders cursor-pointer"
                  :class="{ 'countdown-card--active': selectedFestival?.name === f.name }"
                  @click="selectFestival(f)"
                >
                  <div class="text-h5">{{ f.emoji }}</div>
                  <div class="text-weight-bold text-indigo-8">{{ f.name }}</div>
                  <div class="text-subtitle1 text-weight-bold text-teal-8 q-my-xs">
                    {{ f.countdown }} 天
                  </div>
                  <div class="text-caption text-grey-6">{{ f.solarStr }}</div>
                  <a-tag v-if="f.isNextYear" color="orange" class="q-mt-xs">明年</a-tag>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- 倒计时排行 -->
          <q-tab-panel name="countdown">
            <div class="text-caption q-mb-sm text-grey-7">
              所有节日按倒计时排序，最近的排在最前面：
            </div>
            <q-list bordered separator class="rounded-borders">
              <q-item
                v-for="(item, idx) in countdownRankList"
                :key="item.name"
                clickable
                :active="selectedFestival?.name === item.name"
                active-class="bg-teal-1"
                @click="selectFestival(item)"
              >
                <q-item-section side>
                  <q-badge :color="idx < 3 ? 'red' : 'grey'" :label="`#${idx + 1}`" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ item.emoji }} {{ item.name }}
                    <span v-if="item.lunarStr" class="text-caption text-grey-6 q-ml-sm">
                      {{ item.lunarStr }}
                    </span>
                  </q-item-label>
                  <q-item-label caption>
                    {{ item.solarStr }} {{ item.weekday }}
                    <a-tag v-if="item.isNextYear" color="orange" class="q-ml-xs">明年</a-tag>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-h5 text-weight-bold text-teal-8">
                    {{ item.countdown }}
                  </div>
                  <div class="text-caption text-grey-6">天</div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { Lunar, Solar } from 'lunar-javascript'

const WEEKDAY_MAP = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const festivalTab = ref('all')
const selectedFestival = ref(null)

// ─── 农历工具函数 ───
const getSolarFromLunar = (lunarYear, lunarMonth, lunarDay) => {
  const l = Lunar.fromYmd(lunarYear, lunarMonth, lunarDay)
  const s = l.getSolar()
  return dayjs(
    `${s.getYear()}-${String(s.getMonth()).padStart(2, '0')}-${String(s.getDay()).padStart(2, '0')}`,
  )
}

const getLunarYear = () => Solar.fromDate(new Date()).getLunar().getYear()

const getLunarInfo = () => {
  const today = Solar.fromDate(new Date())
  const lunar = today.getLunar()
  return `${lunar.getYearInGanZhi()}(${lunar.getYearShengXiao()})年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日 | 农历${lunar.toString()}`
}

// 获取清明（通过节气表，支持指定年份）
const getQingmingDate = (year) => {
  // 用该年任意一天的节气表来获取清明
  const anyDate = new Date(year, 0, 1)
  const solar = Solar.fromDate(anyDate)
  const lunar = solar.getLunar()
  const jqTable = lunar.getJieQiTable()
  const qm = jqTable['清明']
  return dayjs(
    `${qm.getYear()}-${String(qm.getMonth()).padStart(2, '0')}-${String(qm.getDay()).padStart(2, '0')}`,
  )
}

// ─── 节日定义 ───
const LUNAR_FESTIVALS = [
  { name: '春节', lunarMonth: 1, lunarDay: 1, emoji: '🧨' },
  { name: '元宵节', lunarMonth: 1, lunarDay: 15, emoji: '🏮' },
  { name: '龙抬头', lunarMonth: 2, lunarDay: 2, emoji: '🐉' },
  { name: '上巳节', lunarMonth: 3, lunarDay: 3, emoji: '🌸' },
  { name: '端午节', lunarMonth: 5, lunarDay: 5, emoji: '🐲' },
  { name: '七夕', lunarMonth: 7, lunarDay: 7, emoji: '🌌' },
  { name: '中元节', lunarMonth: 7, lunarDay: 15, emoji: '🪷' },
  { name: '中秋节', lunarMonth: 8, lunarDay: 15, emoji: '🌕' },
  { name: '重阳节', lunarMonth: 9, lunarDay: 9, emoji: '🏔' },
  { name: '寒衣节', lunarMonth: 10, lunarDay: 1, emoji: '🧥' },
  { name: '下元节', lunarMonth: 10, lunarDay: 15, emoji: '🪯' },
  { name: '腊八', lunarMonth: 12, lunarDay: 8, emoji: '🥣' },
  { name: '小年', lunarMonth: 12, lunarDay: 23, emoji: '🎆' },
]

const SOLAR_FESTIVALS = [
  { name: '元旦', month: 1, day: 1, emoji: '🎊' },
  { name: '情人节', month: 2, day: 14, emoji: '💕' },
  { name: '妇女节', month: 3, day: 8, emoji: '👩' },
  { name: '植树节', month: 3, day: 12, emoji: '🌳' },
  { name: '清明节', month: 0, day: 0, emoji: '🌿', isQingming: true },
  { name: '劳动节', month: 5, day: 1, emoji: '💪' },
  { name: '儿童节', month: 6, day: 1, emoji: '🧒' },
  { name: '建党节', month: 7, day: 1, emoji: '🚩' },
  { name: '建军节', month: 8, day: 1, emoji: '🎖' },
  { name: '教师节', month: 9, day: 10, emoji: '👨‍🏫' },
  { name: '国庆节', month: 10, day: 1, emoji: '🇨🇳' },
  { name: '圣诞节', month: 12, day: 25, emoji: '🎄' },
]

// ─── 核心：构建节日列表（已过节日年份 +1）───
const buildFestivalList = () => {
  const today = dayjs().startOf('day')
  const lunarYear = getLunarYear()
  const solarYear = today.year()
  const list = []

  // 农历节日：如果今年该节日已过，则取明年
  LUNAR_FESTIVALS.forEach((f) => {
    let year = lunarYear
    let d = getSolarFromLunar(year, f.lunarMonth, f.lunarDay)
    if (d.isBefore(today)) {
      year = lunarYear + 1
      d = getSolarFromLunar(year, f.lunarMonth, f.lunarDay)
    }
    list.push({
      ...f,
      year: d.year(),
      solarDate: d,
      solarStr: d.format('YYYY-MM-DD'),
      weekday: WEEKDAY_MAP[d.day()],
      countdown: d.diff(today, 'day'),
      isNextYear: d.year() > solarYear,
      lunarStr: `农历${f.lunarMonth}月${f.lunarDay}`,
      type: 'lunar',
    })
  })

  // 清明（节气，需按年计算）
  {
    let qmDate = getQingmingDate(solarYear)
    let year = solarYear
    if (qmDate.isBefore(today)) {
      year = solarYear + 1
      qmDate = getQingmingDate(year)
    }
    list.push({
      name: '清明节',
      emoji: '🌿',
      isQingming: true,
      year,
      solarDate: qmDate,
      solarStr: qmDate.format('YYYY-MM-DD'),
      weekday: WEEKDAY_MAP[qmDate.day()],
      countdown: qmDate.diff(today, 'day'),
      isNextYear: year > solarYear,
      lunarStr: '',
      type: 'solar',
    })
  }

  // 公历节日：如果今年已过，则取明年
  SOLAR_FESTIVALS.forEach((f) => {
    if (f.isQingming) return // 清明已在上面单独处理
    let year = solarYear
    let d = dayjs(`${year}-${String(f.month).padStart(2, '0')}-${String(f.day).padStart(2, '0')}`)
    if (d.isBefore(today)) {
      year = solarYear + 1
      d = dayjs(`${year}-${String(f.month).padStart(2, '0')}-${String(f.day).padStart(2, '0')}`)
    }
    list.push({
      ...f,
      year,
      solarDate: d,
      solarStr: d.format('YYYY-MM-DD'),
      weekday: WEEKDAY_MAP[d.day()],
      countdown: d.diff(today, 'day'),
      isNextYear: year > solarYear,
      lunarStr: '',
      type: 'solar',
    })
  })

  return list.sort((a, b) => a.countdown - b.countdown)
}

// ─── 计算属性 ───
const allFestivalList = computed(() => buildFestivalList())

const lunarFestivalList = computed(() => buildFestivalList().filter((f) => f.type === 'lunar'))

const solarFestivalList = computed(() => buildFestivalList().filter((f) => f.type === 'solar'))

const countdownRankList = computed(() => buildFestivalList())

const lunarInfo = computed(() => {
  const today = Solar.fromDate(new Date())
  const lunar = today.getLunar()
  return `${lunar.getYearInGanZhi()}(${lunar.getYearShengXiao()})年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日 | 农历${lunar.toString()}`
})

const selectFestival = (f) => {
  selectedFestival.value = f
}
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
.festival-date {
  font-size: 11px;
  color: #888;
  margin-left: 4px;
}
.result-card {
  background: rgba(128, 128, 128, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.15);
}
.result-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.countdown-card {
  background: rgba(128, 128, 128, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.15);
  transition: all 0.2s;
}
.countdown-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #00796b;
}
.countdown-card--active {
  border-color: #00796b;
  background: rgba(0, 121, 107, 0.08);
  box-shadow: 0 2px 8px rgba(0, 121, 107, 0.2);
}
</style>
