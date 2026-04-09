<template>
  <div class="q-pa-md">
    <q-card flat bordered class="q-mx-auto shadow-3 max-w-1200">
      <q-card-section class="bg-blue-grey-8 text-white row items-center">
        <q-icon name="cleaning_services" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">代码文本清洗 & 去重工具</div>
      </q-card-section>

      <q-card-section class="row q-col-gutter-md">
        <!-- 左侧：配置选项 -->
        <div class="col-12 col-md-4">
          <q-list bordered separator class="rounded-borders">
            <q-item-label header>切分规则</q-item-label>

            <q-item tag="label" v-ripple>
              <q-item-section avatar
                ><q-checkbox v-model="options.split_by_commas" color="positive"
              /></q-item-section>
              <q-item-section><q-item-label>中英文逗号切割</q-item-label></q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section avatar
                ><q-checkbox v-model="options.split_by_colons" color="positive"
              /></q-item-section>
              <q-item-section><q-item-label>中英文冒号号切割</q-item-label></q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section avatar
                ><q-checkbox v-model="options.split_by_semicolons" color="positive"
              /></q-item-section>
              <q-item-section><q-item-label>中英文分号切割</q-item-label></q-item-section>
            </q-item>

            <q-separator />
            <q-item-label header>清洗规则</q-item-label>
            <q-item tag="label" v-ripple>
              <q-item-section avatar
                ><q-checkbox v-model="options.removeComments" color="primary"
              /></q-item-section>
              <q-item-section><q-item-label>去除注释 (//, /* */)</q-item-label></q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section avatar
                ><q-checkbox v-model="options.removeThis" color="primary"
              /></q-item-section>
              <q-item-section><q-item-label>去除 this.</q-item-label></q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section avatar
                ><q-checkbox v-model="options.removeValue" color="primary"
              /></q-item-section>
              <q-item-section><q-item-label>去除 .value</q-item-label></q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section avatar
                ><q-checkbox v-model="options.removeSync" color="primary"
              /></q-item-section>
              <q-item-section><q-item-label>去除 .sync</q-item-label></q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section avatar
                ><q-checkbox v-model="options.removeDollar" color="primary"
              /></q-item-section>
              <q-item-section><q-item-label>去除 $ 符号</q-item-label></q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section avatar
                ><q-checkbox v-model="options.removeQuotes" color="primary"
              /></q-item-section>
              <q-item-section
                ><q-item-label>去除中英文引号 (' " “” ‘’)</q-item-label></q-item-section
              >
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section avatar
                ><q-checkbox v-model="options.removeColon" color="primary"
              /></q-item-section>
              <q-item-section><q-item-label>去除中英文冒号 (: ：)</q-item-label></q-item-section>
            </q-item>

            <q-separator />
            <q-item-label header>输出修饰</q-item-label>
            <q-item tag="label" v-ripple>
              <q-item-section avatar
                ><q-checkbox v-model="options.addComma" color="secondary"
              /></q-item-section>
              <q-item-section><q-item-label>每行行末加逗号 (,)</q-item-label></q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section avatar
                ><q-checkbox v-model="options.addSemicolon" color="secondary"
              /></q-item-section>
              <q-item-section><q-item-label>每行行末加分号 (;)</q-item-label></q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- 右侧：输入与输出 -->
        <div class="col-12 col-md-8 q-gutter-y-md">
          <q-input
            v-model="inputText"
            type="textarea"
            filled
            label="输入原始文本 / 代码"
            placeholder="粘贴你的多行内容..."
            rows="10"
            @update:model-value="processText"
          />

          <q-input
            v-model="outputText"
            type="textarea"
            filled
            readonly
            label="清洗去重后的结果"
            bg-color="grey-2"
            rows="10"
          >
            <template v-slot:append>
              <q-btn round dense flat icon="content_copy" @click="copyResult">
                <q-tooltip>复制结果</q-tooltip>
              </q-btn>
            </template>
          </q-input>

          <div class="row items-center justify-between bg-grey-3 q-pa-sm rounded-borders">
            <div class="text-caption">
              结果统计: <b>{{ stats.count }}</b> 行
            </div>
            <q-btn label="强制重新处理" color="primary" icon="refresh" @click="processText" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'

const $q = useQuasar()
const inputText = ref('')
const outputText = ref('')
const stats = reactive({ count: 0 })

const options = reactive({
  removeComments: true,
  removeThis: true,
  removeValue: true,
  removeSync: true,
  removeDollar: true,
  removeQuotes: true,
  removeColon: true,
  addComma: false,
  addSemicolon: false,

  split_by_commas: true,
  split_by_colons: false,
  split_by_semicolons: false,
})

/**
 * @param {Object} options 勾选状态
 * @param {boolean} options.split_by_commas - 是否勾选中英文逗号 ( , ， )
 * @param {boolean} options.split_by_colons - 是否勾选中英文冒号 ( : ： )
 * @param {boolean} options.split_by_semicolons - 是否勾选分号 ( ; ； )
 * @returns {RegExp|null} 返回生成的正则表达式
 */
const generateSplitRegex = () => {
  let charSet = ''

  // 1. 根据勾选状态拼接字符
  if (options.split_by_commas) charSet += ',，'
  if (options.split_by_colons) charSet += ':：'
  if (options.split_by_semicolons) charSet += ';；'

  // 2. 如果没有任何勾选，返回 null 或默认正则
  if (!charSet) return null

  // 3. 构建正则表达式
  // [ ,，:：;； ]+ 表示匹配其中任意字符一次或多次（避免切出空字符串）
  return new RegExp(`[${charSet}]+`, 'g')
}

// 核心处理逻辑
const processText = () => {
  if (!inputText.value) {
    outputText.value = ''
    stats.count = 0
    return
  }

  let content = inputText.value

  // 1. 去除注释
  if (options.removeComments) {
    content = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
  }

  // 按行分割并去除每行首尾空格
  let lines = content.split(/\r?\n/)
  let new_lines = []
  let split_regex = generateSplitRegex()
  lines.forEach((line) => {
    if (split_regex) {
      new_lines.push(...line.split(split_regex).map((l) => l.trim()))
    } else {
      new_lines.push(line.trim())
    }
  })
  lines = new_lines

  let processedLines = lines.map((line) => {
    let temp = line

    // 2. 依次应用去除规则
    if (options.removeThis) temp = temp.replace(/this\./g, '')
    if (options.removeValue) temp = temp.replace(/\.value/g, '')
    if (options.removeSync) temp = temp.replace(/\.sync/g, '')
    if (options.removeDollar) temp = temp.replace(/\$/g, '')
    if (options.removeQuotes) temp = temp.replace(/['"“”‘’]/g, '')
    if (options.removeColon) temp = temp.replace(/[:：]/g, '')

    return temp.trim()
  })

  // 3. 去除空行并去重
  let uniqueLines = [...new Set(processedLines.filter((line) => line.length > 0))]

  // 4. 添加后缀修饰
  uniqueLines = uniqueLines.map((line) => {
    let end = ''
    if (options.addComma) end += ','
    if (options.addSemicolon) end += ';'
    return line + end
  })

  stats.count = uniqueLines.length
  outputText.value = uniqueLines.join('\n')
}

// 监听选项变化自动处理
watch(options, () => processText())

const copyResult = () => {
  if (!outputText.value) return
  copyToClipboard(outputText.value)
    .then(() =>
      $q.notify({ message: '复制成功', color: 'positive', position: 'top', timeout: 1000 }),
    )
    .catch(() => $q.notify({ message: '复制失败', color: 'negative' }))
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
</style>
