<template>
  <a-modal
    :open="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    @ok="handleOk"
    @cancel="$emit('update:visible', false)"
    :confirm-loading="confirmLoading"
    destroyOnClose
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="formRules"
      layout="vertical"
      style="padding-top: 20px"
    >
      <a-form-item label="用户名" name="username">
        <a-input v-model:value="formState.username" placeholder="请输入用户名" />
      </a-form-item>
      <a-form-item label="邮箱" name="email">
        <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
      </a-form-item>
      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="formState.status">
          <a-radio v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { formRules, statusOptions } from '../config/config.js'
import * as all_singleton from '../variable/singleton.js'
import { mitt_emit } from '../mitt/mitt-emit.js'
const visible = defineModel('visible')
const props = defineProps({})

const { isEdit, confirmLoading, current_editing_record } = all_singleton

const formRef = ref(null)
const formState = ref({})

watch(
  () => props.visible,
  (val) => {
    if (val) formState.value = { ...current_editing_record }
  },
  { immediate: true },
)

const handleOk = () => {
  formRef.value.validate().then(() => {
    mitt_emit('handleModalOk', formState.value)
  })
}
</script>
