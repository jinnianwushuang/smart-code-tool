<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto shadow-2 transition-base" style="max-width: 1200px">
      <!-- 头部 -->
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="calendar_today" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">日期间隔计算器</div>
      </q-card-section>

      <!-- 第一行：两日期计算间隔 + 前/后多少天计算日期 -->
      <q-card-section class="row q-col-gutter-lg">
        <div class="col-12 col-md-6">
          <IntervalCalculator />
        </div>
        <div class="col-12 col-md-6">
          <DateOffsetCalculator />
        </div>
      </q-card-section>

      <!-- 第二行：距离今日多少天 -->
      <q-card-section>
        <DaysFromToday />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import IntervalCalculator from './components/interval-calculator.vue'
import DateOffsetCalculator from './components/date-offset-calculator.vue'
import DaysFromToday from './components/days-from-today.vue'
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
</style>
