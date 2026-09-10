<template>
  <q-card flat bordered class="q-ma-sm">
    <q-card-section>
      <div class="text-h6">非嵌套属性转换</div>
      <div class="text-subtitle2">JS对象键值对转为 `export const` 定义</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-input
        v-model="inputText"
        filled
        type="textarea"
        label="输入 (例如: name: 'John')"
        :placeholder="placeholder"
        rows="10"
      />
    </q-card-section>

    <q-card-section class="q-gutter-sm">
      <q-checkbox v-model="useExport" label="增加 export" />
      <q-checkbox v-model="useSemicolon" label="增加分号 (;)" />
      <q-checkbox v-model="useRefWrap" label="包裹 ref()" />
    </q-card-section>

    <q-card-section>
      <div class="row q-gutter-x-lg">
        <q-btn color="primary" label="生成" @click="process" />
        <q-btn color="primary" label="复制" @click="copyOutput" />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-input v-model="outputText" filled readonly type="textarea" label="生成结果" rows="10">
        <template v-slot:append>
          <q-btn flat icon="content_copy" @click="copyOutput" padding="xs" />
        </template>
      </q-input>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { useNonNestedProcessor } from '../module/useProcessor.js'
import { copyText } from 'src/output/common/project-common.js'
const $q = useQuasar()

const inputText = ref('')
const useExport = ref(true)
const useSemicolon = ref(true)
const useRefWrap = ref(true)
const placeholder = `name: 'John',
age: 30,`
const { outputText, process } = useNonNestedProcessor({
  inputText,
  useExport,
  useSemicolon,
  useRefWrap,
})

const copyOutput = () => {
  copyText(outputText.value)
}
</script>
