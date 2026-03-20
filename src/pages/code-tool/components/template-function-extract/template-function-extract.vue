<template>
  <q-page class="q-pa-md bg-grey-1">
    <q-card flat bordered class="q-mx-auto shadow-2" style="max-width: 900px">
      <q-card-section class="bg-deep-orange-7 text-white row items-center">
        <q-icon name="ads_click" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">Vue 事件函数提取器 (@Event)</div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- 正则提示与复制 -->
        <div class="row items-center bg-orange-1 q-pa-sm rounded-borders border-orange-2">
          <div class="text-caption text-orange-9">
            通用匹配正则:
            <code class="bg-white q-px-xs">/@([\w-]+)((?:\.[\w-]+)*)\s*=\s*["']([^"']+)["']/g</code>
          </div>
          <q-space />
          <q-btn
            flat
            dense
            color="orange-9"
            icon="content_copy"
            label="复制正则"
            size="sm"
            @click="copy(VUE_EVENT_REGEX_COPY)"
          >
            <q-tooltip>用于 IDE 全局搜索提取</q-tooltip>
          </q-btn>
        </div>

        <!-- 代码输入区 -->
        <q-input
          v-model="rawTemplate"
          type="textarea"
          filled
          label="粘贴带有 @ 绑定的 Vue Template 代码"
          placeholder='例如: <q-btn @click="saveData" @on-close="handleClose" />'
          rows="10"
          @update:model-value="extractFunctions"
        />
        <div class="row q-my-md q-gutter-x-sm">
          <q-btn label="清空" color="grey" variant="flat" size="sm" @click="reset" />
        </div>
        <!-- 控制与统计 -->
        <div class="row items-center q-gutter-x-md">
          <q-checkbox v-model="addComma" label="每行末尾增加逗号" color="deep-orange" />
          <q-separator vertical inset />
          <div class="text-subtitle2 text-grey-8">
            识别到唯一函数: <q-badge color="deep-orange">{{ functionList.length }}</q-badge>
          </div>
        </div>

        <!-- 结果输出区 -->
        <q-input
          v-model="formattedResult"
          type="textarea"
          filled
          readonly
          label="提取出的函数名称列表"
          bg-color="white"
          rows="8"
        >
          <template v-slot:append>
            <q-btn
              round
              dense
              flat
              icon="content_copy"
              color="primary"
              @click="copy(formattedResult)"
              :disable="!formattedResult"
            >
              <q-tooltip>一键复制全部</q-tooltip>
            </q-btn>
          </template>
        </q-input>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { copyText } from 'src/output/common/project-common.js'
const $q = useQuasar()
const rawTemplate = ref('')
const addComma = ref(true)
const functionList = ref([])
const regPattern = ref('@[\\w.-]+="([^"(]+)"')
/**
 * @([\w-]+)          - 第1组：事件名 (如 click)
 * ((?:\.[\w-]+)*)    - 第2组：修饰符 (如 .stop.prevent)
 * \s*=\s*            - 匹配等号及前后空格
 * ["']([^"']+)["']   - 第3组：引号内的完整表达式 (不含引号本身)
 */
const VUE_EVENT_REGEX = /@([\w-]+)((?:\.[\w-]+)*)\s*=\s*["']([^"']+)["']/g
const VUE_EVENT_REGEX_COPY = /@([\\w-]+)((?:\\.[\\w-]+)*)\\s*=\\s*["']([^"']+)["']/g
/**
 * 解析并提取函数名
 * @param {string} expression - 正则捕获到的引号内字符串
 * @returns {string|null} - 返回纯函数名，非函数则返回 null
 */
const parseVueHandler = (expression) => {
  const content = expression.trim()
  if (!content) return null

  // 1. 排除包含赋值、算术运算、逻辑运算或箭头函数的内联代码
  // 例如: count++, a = b, !show, val => ...
  if (/[=+\-*/&|!>]/.test(content)) return null

  // 2. 提取函数标识符
  // 匹配规则：以字母/下划线/ $ 开头，后面跟着数字字母下划线
  // 兼容带括号的情况：将 "handleSubmit(123)" 转换为 "handleSubmit"
  const funcMatch = content.match(/^([a-zA-Z_$][\w$]*)/)

  return funcMatch ? funcMatch[1] : null
}

const extractFunctions_inner = (rawTemplate) => {
  if (!rawTemplate) return []

  const funcSet = new Set()
  let match

  // 重置正则位置（防止多次调用时索引偏移）
  VUE_EVENT_REGEX.lastIndex = 0

  while ((match = VUE_EVENT_REGEX.exec(rawTemplate)) !== null) {
    // match[3] 是正则捕获的引号内内容
    const rawExpression = match[3]
    const funcName = parseVueHandler(rawExpression)

    if (funcName) {
      funcSet.add(funcName)
    }
  }

  return Array.from(funcSet)
}
const extractFunctions = () => {
  if (!rawTemplate.value) {
    functionList.value = []
    return
  }

  // --- 使用示例 ---
  functionList.value = extractFunctions_inner(rawTemplate.value)
}

// 格式化输出字符串
const formattedResult = computed(() => {
  if (functionList.value.length === 0) return ''
  return functionList.value.map((name) => `${name}${addComma.value ? ',' : ''}`).join('\n')
})

const reset = () => {
  rawTemplate.value = ''
  functionList.value = []
}
const copy = (text) => {
  if (!text) return
  copyText(text)
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
.border-orange-2 {
  border: 1px solid #ffcc80;
}
code {
  font-family: monospace;
  font-weight: bold;
}
</style>
