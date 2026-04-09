<template>
  <a-modal
    :open="visible"
    :title="isEdit ? '修改商户资料' : '商户入驻申请'"
    width="650px"
    @ok="handleOk"
    @cancel="$emit('update:visible', false)"
    :confirm-loading="confirmLoading"
    destroyOnClose
  >
    <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="商户全称" name="name">
            <a-input v-model:value="formState.name" placeholder="请输入完整公司/店名" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="经营类目" name="category">
            <a-select v-model:value="formState.category" placeholder="请选择行业">
              <a-select-option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="负责人姓名" name="contactPerson">
            <a-input v-model:value="formState.contactPerson" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="联系电话" name="phone">
            <a-input v-model:value="formState.phone" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="详细经营地址" name="address">
            <a-textarea v-model:value="formState.address" :rows="2" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="运营状态" name="status">
            <a-radio-group v-model:value="formState.status" button-style="solid">
              <a-radio-button v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-radio-button>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { categoryOptions, statusOptions, formRules } from '../config/config'
const props = defineProps({
  visible: Boolean,
  isEdit: Boolean,
  confirmLoading: Boolean,
  initialData: Object,
})
const emit = defineEmits(['update:visible', 'ok'])
const formRef = ref(null)
const formState = ref({})
watch(
  () => props.visible,
  (val) => {
    if (val) formState.value = { ...props.initialData }
  },
  { immediate: true },
)
const handleOk = () => {
  formRef.value.validate().then(() => {
    emit('ok', formState.value)
  })
}
</script>
