<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto max-w-1200 transition-base">
      <!-- 头部区域 -->
      <q-card-section class="bg-teal-8 text-white row items-center">
        <q-icon name="swap_horiz" size="sm" class="q-mr-sm" />
        <div>
          <div class="text-h6 text-weight-bold">Web 字符转义工具</div>
          <div class="text-caption text-grey-3">支持 HTML 实体与 URL 参数的编码与解码</div>
        </div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <!-- 输入区域 -->
        <q-input
          v-model="inputText"
          type="textarea"
          filled
          label="输入原始文本或待转换字符"
          placeholder="例如: <div>Hello World</div> 或 https://example.com?query=测试"
          rows="10"
          clearable
          class="font-mono"
        />

        <!-- 操作按钮组 -->
        <div class="row items-center q-gutter-sm">
          <q-btn-group outline>
            <q-btn
              label="HTML 转义"
              color="teal"
              outline
              icon="code"
              size="sm"
              @click="handleAction('escapeHtml')"
            >
              <q-tooltip>将 < 变为 &lt;</q-tooltip>
            </q-btn>
            <q-btn
              label="HTML 反转义"
              color="teal"
              outline
              icon="code_off"
              size="sm"
              @click="handleAction('unescapeHtml')"
            />
          </q-btn-group>

          <q-btn-group outline>
            <q-btn
              label="URL 编码"
              color="cyan-9"
              outline
              icon="link"
              size="sm"
              @click="handleAction('urlEncode')"
            />
            <q-btn
              label="URL 解码"
              color="cyan-9"
              outline
              icon="link_off"
              size="sm"
              @click="handleAction('urlDecode')"
            />
          </q-btn-group>

          <q-btn label="清空" color="grey-7" outline icon="delete" size="sm" @click="clear" />
          <q-space />
          <q-btn
            label="复制结果"
            color="secondary"
            icon="content_copy"
            size="sm"
            @click="copyOutput"
            :disable="!outputText"
          />
        </div>
      </q-card-section>

      <!-- 结果展示区域 -->
      <q-card-section>
        <q-input
          v-model="outputText"
          filled
          readonly
          type="textarea"
          label="转换结果"
          rows="10"
          class="font-mono"
        >
          <template v-slot:append>
            <q-btn flat icon="content_copy" @click="copyOutput" padding="xs" v-if="outputText" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { copyText } from 'src/output/common/project-common.js'

const $q = useQuasar()
const inputText = ref('')
const outputText = ref('')

const handleAction = (type) => {
  if (!inputText.value.trim()) {
    $q.notify({ message: '请输入内容', color: 'warning', position: 'top' })
    return
  }

  try {
    switch (type) {
      case 'escapeHtml':
        outputText.value = inputText.value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
        break
      case 'unescapeHtml':
        const doc = new DOMParser().parseFromString(inputText.value, 'text/html')
        outputText.value = doc.documentElement.textContent
        break
      case 'urlEncode':
        outputText.value = encodeURIComponent(inputText.value)
        break
      case 'urlDecode':
        outputText.value = decodeURIComponent(inputText.value)
        break
    }
    $q.notify({ message: '转换成功', color: 'positive', icon: 'check', timeout: 1000 })
  } catch (e) {
    $q.notify({ message: '转换失败：格式不正确', color: 'negative' })
  }
}

const clear = () => {
  inputText.value = ''
  outputText.value = ''
}

const copyOutput = () => {
  copyText(outputText.value)
}
</script>

<style scoped>
.font-mono :deep(textarea) {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  line-height: 1.5;
}
</style>
