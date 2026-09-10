<template>
  <div class="q-pa-md generator-wrapper">
    <div class="row q-col-gutter-md justify-center q-mx-auto max-w-1200">
      <!-- 左侧：生成配置 -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="shadow-2 transition-base">
          <q-card-section class="bg-indigo-8 text-white row items-center">
            <q-icon name="lock" size="sm" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">随机密码生成器</div>
          </q-card-section>

          <q-card-section class="q-gutter-y-md">
            <!-- 密码长度 -->
            <div class="text-subtitle2 text-grey-8">
              密码长度: <span class="text-primary text-h6">{{ config.length }}</span>
            </div>
            <q-slider v-model="config.length" :min="4" :max="64" :step="1" label color="indigo" />

            <!-- 字符选项 -->
            <q-list bordered separator class="rounded-borders transition-base">
              <q-item tag="label" v-ripple>
                <q-item-section avatar><q-checkbox v-model="config.uppercase" /></q-item-section>
                <q-item-section><q-item-label>包含大写字母 (A-Z)</q-item-label></q-item-section>
              </q-item>
              <q-item tag="label" v-ripple>
                <q-item-section avatar><q-checkbox v-model="config.lowercase" /></q-item-section>
                <q-item-section><q-item-label>包含小写字母 (a-z)</q-item-label></q-item-section>
              </q-item>
              <q-item tag="label" v-ripple>
                <q-item-section avatar><q-checkbox v-model="config.numbers" /></q-item-section>
                <q-item-section><q-item-label>包含数字 (0-9)</q-item-label></q-item-section>
              </q-item>
              <q-item tag="label" v-ripple>
                <q-item-section avatar><q-checkbox v-model="config.symbols" /></q-item-section>
                <q-item-section
                  ><q-item-label>包含特殊字符 (!@#$%^&*)</q-item-label></q-item-section
                >
              </q-item>
            </q-list>

            <!-- 排除易混淆字符 -->
            <q-toggle
              v-model="config.excludeSimilar"
              label="排除易混淆字符 (i, l, 1, L, o, 0, O)"
              color="orange"
            />

            <q-btn
              class="full-width q-py-sm"
              color="indigo"
              label="立即生成"
              icon="autorenew"
              @click="generatePassword"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- 右侧：结果与强度 -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="full-height shadow-1 transition-base">
          <q-card-section class="bg-indigo-8 text-white row items-center q-py-sm">
            <div class="text-subtitle1">生成结果</div>
            <q-space />
            <q-btn
              flat
              dense
              icon="content_copy"
              label="复制结果"
              @click="copy(mainPassword)"
              :disable="!mainPassword"
            />
          </q-card-section>

          <q-card-section class="q-gutter-y-lg text-center">
            <!-- 主密码展示 -->
            <div class="main-password-box q-pa-lg rounded-borders border-dashed relative-position">
              <div v-if="mainPassword" class="text-h4 font-mono text-break word-wrap">
                {{ mainPassword }}
              </div>
              <div v-else class="text-grey-5 q-pa-md">点击左侧按钮生成安全密码</div>
            </div>

            <!-- 强度进度条 -->
            <div v-if="mainPassword" class="q-px-md">
              <div class="row justify-between text-caption q-mb-xs">
                <span>安全强度: {{ strengthLabel }}</span>
                <span>熵值: {{ entropy.toFixed(1) }} bits</span>
              </div>
              <q-linear-progress
                :value="strengthScore"
                :color="strengthColor"
                class="rounded-borders"
              />
            </div>

            <q-separator />

            <!-- 批量生成 -->
            <div class="row items-center q-gutter-x-md q-px-sm">
              <div class="text-subtitle2">批量生成数量:</div>
              <q-radio v-model="batchCount" :val="5" label="5个" />
              <q-radio v-model="batchCount" :val="10" label="10个" />
              <q-btn flat color="secondary" label="重新批量生成" size="sm" @click="generateBatch" />
              <q-btn
                color="indigo"
                label="一键复制"
                size="sm"
                @click="copyBatch"
                :disable="!batchList.length"
              />
            </div>

            <q-list
              bordered
              separator
              class="batch-list-container rounded-borders overflow-hidden"
              v-if="batchList.length"
            >
              <q-item v-for="(p, i) in batchList" :key="i" class="q-py-xs">
                <q-item-section class="font-mono text-left">{{ p }}</q-item-section>
                <q-item-section side>
                  <q-btn flat round icon="content_copy" size="xs" @click="copy(p)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { copyText as projectCopyText } from 'src/output/common/project-common.js'

const $q = useQuasar()

// 1. 配置状态
const config = reactive({
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeSimilar: false,
})

const mainPassword = ref('')
const batchCount = ref(5)
const batchList = ref([])

// 字符集定义
const CHARS = {
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ', // 默认排除了容易混淆的 O, I
  upperFull: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijkmnopqrstuvwxyz', // 默认排除了 l
  lowerFull: 'abcdefghijklmnopqrstuvwxyz',
  nums: '23456789', // 默认排除了 0, 1
  numsFull: '0123456789',
  syms: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

// 2. 核心逻辑：高强度随机生成
const createPassword = (len) => {
  let charset = ''
  if (config.excludeSimilar) {
    if (config.uppercase) charset += CHARS.upper
    if (config.lowercase) charset += CHARS.lower
    if (config.numbers) charset += CHARS.nums
  } else {
    if (config.uppercase) charset += CHARS.upperFull
    if (config.lowercase) charset += CHARS.lowerFull
    if (config.numbers) charset += CHARS.numsFull
  }
  if (config.symbols) charset += CHARS.syms

  if (!charset) return ''

  // 使用 window.crypto 生成加密级随机数
  const array = new Uint32Array(len)
  window.crypto.getRandomValues(array)

  let password = ''
  for (let i = 0; i < len; i++) {
    password += charset.charAt(array[i] % charset.length)
  }
  return password
}

const generatePassword = () => {
  const pwd = createPassword(config.length)
  if (!pwd) {
    $q.notify({ message: '请至少选择一种字符类型', color: 'negative' })
    return
  }
  mainPassword.value = pwd
  generateBatch()
}

const generateBatch = () => {
  const list = []
  for (let i = 0; i < batchCount.value; i++) {
    list.push(createPassword(config.length))
  }
  batchList.value = list
}

// 3. 强度检测逻辑 (信息熵算法)
const entropy = computed(() => {
  if (!mainPassword.value) return 0
  let poolSize = 0
  if (config.uppercase) poolSize += 26
  if (config.lowercase) poolSize += 26
  if (config.numbers) poolSize += 10
  if (config.symbols) poolSize += 30
  // H = L * log2(N)
  return mainPassword.value.length * Math.log2(poolSize || 1)
})

const strengthScore = computed(() => Math.min(entropy.value / 128, 1)) // 以128位熵为最高标准

const strengthLabel = computed(() => {
  const h = entropy.value
  if (h < 40) return '极弱 - 容易被破解'
  if (h < 60) return '中等 - 建议增加长度'
  if (h < 80) return '强 - 安全性良好'
  return '极强 - 军事级安全'
})

const strengthColor = computed(() => {
  const h = entropy.value
  if (h < 40) return 'negative'
  if (h < 60) return 'orange'
  if (h < 80) return 'blue'
  return 'positive'
})

// 工具函数
const copy = (val) => {
  if (!val) return
  projectCopyText(val)
}

const copyBatch = () => {
  if (!batchList.value.length) return
  projectCopyText(batchList.value.join('\n'))
}

watch(() => batchCount.value, generateBatch)
</script>

<style scoped>
.generator-wrapper {
  transition: background-color 0.3s;
}

.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.2s;
}

.max-w-1200 {
  max-width: 1200px;
}

.font-mono {
  font-family: 'Fira Code', 'Courier New', monospace;
  letter-spacing: 1px;
}

.main-password-box {
  background: rgba(128, 128, 128, 0.05);
  border: 2px dashed rgba(128, 128, 128, 0.2);
}

.batch-list-container {
  background: rgba(128, 128, 128, 0.02);
}

.border-dashed {
  border-style: dashed;
}

.text-break {
  word-break: break-all;
}
.word-wrap {
  white-space: pre-wrap;
}
</style>
