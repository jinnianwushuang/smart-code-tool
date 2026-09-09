<template>
  <div class="q-pa-md generator-wrapper">
    <div class="row q-col-gutter-md q-mx-auto max-w-1200">
      <!-- 1. 顶部控制台 -->
      <div class="col-12">
        <q-card flat bordered class="bg-indigo-8 text-white shadow-2 transition-base">
          <q-card-section class="row items-center q-pb-none">
            <q-icon name="schedule" size="md" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">时间转换器</div>
            <q-space />
            <q-select
              v-model="selectedTimezone" :options="timezoneOptions"
              dark dense filled options-dense
              label="基准时区 (Base)" class="q-mr-md" style="min-width: 200px"
            />
            <q-toggle v-model="isAutoUpdate" label="实时同步" color="cyan" keep-color />
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div v-for="item in currentFormats" :key="item.label" class="col-12 col-sm-4 col-md-2">
              <div class="time-badge q-pa-xs rounded-borders text-center cursor-pointer" @click="copy(item.value)">
                <div class="text-caption text-indigo-2">{{ item.label }}</div>
                <div class="text-subtitle2 font-mono ellipsis">{{ item.value }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 2. 全球时区对比 -->
      <div class="col-12">
        <q-card flat bordered class="shadow-1 transition-base">
          <q-card-section class="bg-indigo-8 text-white row items-center q-py-xs">
            <q-icon name="language" size="sm" class="q-mr-xs" />
            <div class="text-subtitle1">全球时区实时对比 (相对基准时差)</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div v-for="tz in worldClockList" :key="tz.name" class="col-12 col-sm-4 col-md-2">
              <q-card flat bordered class="hover-shadow clock-item transition-base">
                <q-card-section class="q-pa-sm text-center">
                  <div class="row items-center justify-between no-wrap">
                    <span class="text-weight-bold">{{ tz.name }}</span>
                    <q-badge :color="tz.diff >= 0 ? 'orange' : 'deep-orange'" label-color="white">
                      {{ tz.diff >= 0 ? '+' : '' }}{{ tz.diff }}h
                    </q-badge>
                  </div>
                  <div class="text-h6 font-mono text-center q-my-xs text-blue-grey-10">{{ tz.time }}</div>
                  <div class="text-center">
                    <q-btn flat dense color="primary" label="复制" icon="content_copy" size="xs" @click="copy(tz.full)" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 3. 编程常用格式 -->
      <div class="col-12">
        <q-card flat bordered class="shadow-1 transition-base">
          <q-card-section class="bg-indigo-8 text-white row items-center q-py-xs">
            <q-icon name="terminal" size="sm" class="q-mr-xs" />
            <div class="text-subtitle1">编程常用格式化</div>
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div v-for="fmt in codeReadyFormats" :key="fmt.label" class="col-12 col-sm-4 col-md-3">
              <q-input
                :model-value="fmt.value" :label="fmt.label"
                filled dense readonly stack-label class="font-mono"
              >
                <template v-slot:append>
                  <q-btn flat round dense icon="content_copy" size="xs" @click="copy(fmt.value)" />
                </template>
              </q-input>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 4. 解析与偏移 -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="full-height shadow-1 transition-base">
          <q-card-section class="bg-indigo-8 text-white">解析与快捷偏移</q-card-section>
          <q-card-section class="q-gutter-y-sm">
            <q-input v-model="parseInput" filled label="时间戳或字符串" dense clearable class="font-mono" />
            <div class="row q-gutter-xs">
              <q-btn
                v-for="opt in offsets" :key="opt.label"
                :label="opt.label" size="xs" color="grey-3" text-color="black"
                @click="applyOffset(opt.value, opt.unit)"
              />
            </div>
            <q-list bordered separator class="rounded-borders q-mt-md control-panel">
              <q-item v-for="res in parseResults" :key="res.label">
                <q-item-section>
                  <q-item-label caption>{{ res.label }}</q-item-label>
                  <q-item-label class="font-mono text-weight-bold">{{ res.value }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round icon="content_copy" size="xs" @click="copy(res.value)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- 5. 代码生成器 -->
      <div class="col-12 col-md-8">
        <q-card flat bordered class="full-height shadow-1 transition-base">
          <q-card-section class="bg-indigo-8 text-white row items-center">
            <q-icon name="javascript" size="sm" class="q-mr-xs" />
            <span>Day.js 代码片段生成</span>
          </q-card-section>
          <q-card-section class="row q-col-gutter-sm">
            <div v-for="snippet in codeSnippets" :key="snippet.title" class="col-12 col-md-6 q-mb-sm">
              <div class="row items-center justify-between q-mb-xs">
                <span class="text-caption text-weight-bold text-indigo">{{ snippet.title }}</span>
                <q-btn flat round dense icon="content_copy" size="xs" color="indigo" @click="copy(snippet.code)" />
              </div>
              <div class="snippet-box q-pa-sm rounded-borders font-mono text-lime-4 size-11 pre-wrap overflow-hidden">
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
import { useTimeConverter } from './composables/use-time-converter.js'
import { TIMEZONE_OPTIONS, OFFSETS } from './utils/time-constants.js'

const {
  isAutoUpdate, selectedTimezone, parseInput,
  currentFormats, worldClockList, codeReadyFormats, codeSnippets, parseResults,
  applyOffset, copy,
} = useTimeConverter()

const timezoneOptions = TIMEZONE_OPTIONS
const offsets = OFFSETS
</script>

<style scoped>
.generator-wrapper { transition: background-color 0.3s; }
.transition-base { transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s, transform 0.2s; }
.max-w-1200 { max-width: 1200px; }
.font-mono { font-family: 'Fira Code', 'Courier New', monospace; }
.size-11 { font-size: 11px; }
.time-badge { background: rgba(255,255,255,0.15); transition: background 0.2s; }
.time-badge:hover { background: rgba(255,255,255,0.25); }
.pre-wrap { white-space: pre-wrap; word-break: break-all; }
.clock-item { background: rgba(128,128,128,0.03); }
.hover-shadow:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateY(-2px); }
.control-panel { background: rgba(128,128,128,0.05); }
.snippet-box { background: rgba(0,0,0,0.8); }
</style>
