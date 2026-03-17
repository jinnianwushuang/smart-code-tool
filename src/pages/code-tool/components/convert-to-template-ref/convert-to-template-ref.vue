<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="q-mx-auto max-w-1200">
      <q-card-section class="bg-teal text-white row items-center">
        <q-icon name="code" size="sm" class="q-mr-sm" />
        <div class="text-h6">TemplateRef 转换器 (Vue 3.5+)</div>
      </q-card-section>

      <q-card-section class="q-gutter-y-md">
        <div class="text-caption text-grey">
          将 <code>this.$refs.name</code> 转换为 <code>const name = useTemplateRef('name')</code>
        </div>

        <div class="row q-col-gutter-md">
          <!-- 输入 -->
          <div class="col-12">
            <q-input
              v-model="inputCode"
              type="textarea"
              filled
              label="原始代码 (this.$refs...)"
              placeholder="this.$refs.email"
              rows="10"
              @update:model-value="convert"
            />
          </div>
        </div>

        <!-- 操作 -->
        <div class="row q-gutter-x-sm">
          <q-btn label="清空" color="grey" @click="clear" />
          <q-btn
            label="复制结果"
            color="teal"
            icon="content_copy"
            @click="copyOutput"
            :disable="!outputCode"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="outputCode" filled readonly type="textarea" label="生成结果" rows="10">
          <template v-slot:append>
            <q-btn flat icon="content_copy" @click="copyOutput" padding="xs" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { copyText } from 'src/output/common/project-common.js'
const $q = useQuasar()
const inputCode = ref('')
const outputCode = ref('')

/**
 * 转换逻辑
 * 匹配模式：this.$refs.变量名 或 this.$refs['变量名']
 */
const convert = () => {
  const input = inputCode.value
  if (!input) {
    outputCode.value = ''
    return
  }

  // 正则说明：
  // this\.\$refs                  匹配前缀
  // (?:\.([a-zA-Z_$][\w$]*)|      匹配 .variableName 形式
  // \['(.*?)'\]|                  匹配 ['variableName'] 形式
  // \["(.*?)"\])                  匹配 ["variableName"] 形式
  const regex = /this\.\$refs(?:\.([a-zA-Z_$][\w$]*)|\[['"](.*?)['"]\])/g

  // 使用 Set 去重，避免同一个 ref 生成多个 const 定义
  const refsFound = new Set()
  let match

  while ((match = regex.exec(input)) !== null) {
    // match[1] 是点号形式，match[2] 是中括号形式
    const refName = match[1] || match[2]
    if (refName) refsFound.add(refName)
  }

  if (refsFound.size > 0) {
    // 生成结果：const name = useTemplateRef('name')
    outputCode.value = Array.from(refsFound)
      .map((name) => `const ${name} = useTemplateRef('${name}')`)
      .join('\n')
  } else {
    outputCode.value = '未找到匹配的 this.$refs 表达式'
  }
  copyOutput()
}

const clear = () => {
  inputCode.value = ''
  outputCode.value = ''
}
const copyOutput = () => {
  copyText(outputCode.value)
}
</script>

<style scoped>
.max-width-800 {
  max-width: 800px;
}
code {
  background: #eee;
  padding: 2px 4px;
  border-radius: 4px;
}
</style>
