<template>
  <div class="q-pa-md generator-wrapper">
    <q-card flat bordered class="q-mx-auto max-w-1200 transition-base">
      <q-card-section class="bg-indigo-8 text-white row items-center">
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
        <div class="row items-center q-gutter-x-sm">
          <q-btn label="清空" color="grey-7" outline icon="delete" size="sm" @click="clear" />
          <q-space />
          <q-btn
            label="复制结果"
            color="secondary"
            icon="content_copy"
            size="sm"
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
  </div>
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
.generator-wrapper {
  transition: background-color 0.3s;
}

.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
}

.max-w-1200 {
  max-width: 1200px;
}

code {
  background: rgba(128, 128, 128, 0.1);
  color: #c41d7f;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}
</style>
