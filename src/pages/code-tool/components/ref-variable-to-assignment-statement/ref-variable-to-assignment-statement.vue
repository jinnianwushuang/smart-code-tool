<template>
  <div style="padding: 24px; background: #f0f2f5; min-height: 100vh">
    <a-card title="Vue3 ref 赋值语句转换器" :bordered="false">
      <a-row :gutter="20">
        <!-- 输入 -->
        <a-col :span="12">
          <div style="margin-bottom: 8px; font-weight: 500">原始定义语句：</div>
          <a-textarea
            v-model:value="inputCode"
            placeholder="请粘贴 export const xxx = ref(...) 语句"
            :auto-size="{ minRows: 12, maxRows: 20 }"
          />
        </a-col>

        <!-- 输出 -->
        <a-col :span="12">
          <div style="margin-bottom: 8px; font-weight: 500; color: #1890ff">转换后的赋值语句：</div>
          <a-textarea
            v-model:value="outputCode"
            readonly
            placeholder="转换结果将显示在这里"
            :auto-size="{ minRows: 12, maxRows: 20 }"
            style="background: #fafafa; font-family: 'Courier New', Courier, monospace"
          />
        </a-col>
      </a-row>

      <div style="margin-top: 20px; display: flex; gap: 12px">
        <a-button type="primary" size="large" @click="handleConvert"> 执行转换 </a-button>
        <a-button size="large" @click="handleCopy" :disabled="!outputCode"> 复制结果 </a-button>
        <a-button size="large" danger @click="handleClear"> 清空 </a-button>
      </div>
    </a-card>
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
