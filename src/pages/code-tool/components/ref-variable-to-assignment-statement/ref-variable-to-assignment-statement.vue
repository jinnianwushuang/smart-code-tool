<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto max-w-1200 transition-base">
      <q-card-section class="bg-indigo-8 text-white row items-center">
        <q-icon name="assignment_turned_in" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">Vue3 ref 赋值语句转换器</div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <div class="row q-col-gutter-md">
          <!-- 输入 -->
          <div class="col-12 col-md-6">
            <div class="text-subtitle2 q-mb-xs">原始定义语句：</div>
            <q-input
              v-model="inputCode"
              type="textarea"
              filled
              placeholder="请粘贴 export const xxx = ref(...) 语句"
              rows="15"
              class="font-mono"
              @update:model-value="handleConvert"
            />
          </div>

          <!-- 输出 -->
          <div class="col-12 col-md-6">
            <div class="text-subtitle2 q-mb-xs text-primary">转换后的赋值语句：</div>
            <q-input
              v-model="outputCode"
              type="textarea"
              filled
              readonly
              placeholder="转换结果将显示在这里"
              rows="15"
              class="font-mono result-area"
            />
          </div>
        </div>

        <div class="row items-center q-gutter-x-sm q-mt-md">
          <q-btn
            color="indigo"
            outline
            label="执行转换"
            icon="play_arrow"
            size="sm"
            @click="handleConvert"
          />
          <q-btn label="清空" color="grey-7" outline icon="delete" size="sm" @click="handleClear" />
          <q-space />
          <q-btn
            color="secondary"
            icon="content_copy"
            label="复制结果"
            size="sm"
            @click="handleCopy"
            :disabled="!outputCode"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { copyText } from 'src/output/common/project-common.js'

const inputCode = ref(`export const all_dialog_state = ref({});
export const query_form = ref({
  address: "北京市",
});

// 传递给弹窗的数据
export const current_record_to_dialog_data = ref({
  id: 1,
  name: '测试'
});`)

const outputCode = ref('')

const handleConvert = () => {
  const code = inputCode.value.trim()
  if (!code) {
    message.warning('请输入内容')
    return
  }

  /**
   * 正则解析说明：
   * (?:export\s+)?const\s+  --> 匹配可选的 export 和 必须的 const
   * (\w+)                   --> 第 1 捕获组：变量名
   * \s*=\s*ref\(            --> 匹配 = ref(
   * ([\s\S]*?)              --> 第 2 捕获组：ref 括号内部的所有内容（最小匹配）
   * \);?                    --> 匹配结尾的 );
   * g                       --> 全局匹配
   */
  const regex = /(?:export\s+)?const\s+(\w+)\s*=\s*ref\(([\s\S]*?)\);?/g

  let match
  const results = []

  // 循环匹配所有定义语句
  while ((match = regex.exec(code)) !== null) {
    const varName = match[1] // 变量名
    const initialValue = match[2].trim() // ref 里的初始值内容

    // 生成赋值语句格式：变量.value = 初始值;
    results.push(`${varName}.value = ${initialValue};`)
  }

  if (results.length > 0) {
    outputCode.value = results.join('\n\n')
    handleCopy()
    // message.success(`成功转换 ${results.length} 条语句`)
  } else {
    // message.error('未匹配到符合条件的 ref 定义，请检查格式')
  }
}

const handleClear = () => {
  inputCode.value = ''
  outputCode.value = ''
}
const handleCopy = () => {
  copyText(outputCode.value)
}
</script>
