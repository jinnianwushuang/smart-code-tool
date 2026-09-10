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
import { provide, inject } from 'vue'

const ALL_EVENT_PIPELINE = inject('ALL_EVENT_PIPELINE')
const ALL_CONTEXT_STATE = inject('ALL_CONTEXT_STATE')
const visible = defineModel('visible')
const props = defineProps({})

const {
  isEdit,
  confirmLoading,
  current_editing_record,
  formState,
  formRef,
  formRules,
  statusOptions,
} = ALL_CONTEXT_STATE

watch(
  () => props.visible,
  (val) => {
    if (val) formState.value = { ...current_editing_record }
  },
  { immediate: true },
)

const handleOk = () => {
  formRef.value.validate().then(() => {
    ALL_EVENT_PIPELINE.dialog.handleModalOk(formState.value)
  })
}
</script>
