<template>
  <div class="q-pa-md">
    <q-card flat bordered class="tool-main-card">
      <TabLikeButtonsV1 v-model="currentTabName" :tabs="dateTabs" />
      <component :is="currentComponent" />
    </q-card>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import TabLikeButtonsV1 from 'src/components/tab-like-buttons/tab-like-buttons-v1.vue'
import { usePersistentTab } from 'project/pages/use-persistent-tab.js'

const dateTabs = [
  {
    name: 'CalendarNotes',
    label: '日历记事本',
    component: defineAsyncComponent(() => import('../permanent-notice-calendar/index.vue')),
  },
  {
    name: 'DateInterval',
    label: '日期间隔计算器',
    component: defineAsyncComponent(
      () =>
        import('../../common-tool/components/date-interval-calculator/date-interval-calculator.vue'),
    ),
  },
  {
    name: 'DaysFromToday',
    label: '距离今日多少天',
    component: defineAsyncComponent(
      () =>
        import('../../common-tool/components/date-interval-calculator/components/days-from-today.vue'),
    ),
  },
  {
    name: 'Festival',
    label: '中国传统节日计算器',
    component: defineAsyncComponent(
      () => import('../../common-tool/components/festival-calculator/festival-calculator.vue'),
    ),
  },
]

const currentTabName = usePersistentTab(dateTabs, 'CalendarNotes', 'date-notes')

const currentComponent = computed(() => {
  const tab = dateTabs.find((t) => t.name === currentTabName.value)
  return tab ? tab.component : null
})
</script>

<style scoped>
.tool-main-card {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
  min-height: 600px;
}
</style>
