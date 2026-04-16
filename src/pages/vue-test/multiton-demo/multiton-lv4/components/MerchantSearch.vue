<template>
  <a-card style="margin-bottom: 24px">
    <a-form layout="inline" :model="searchState">
      <a-form-item label="商户名称">
        <a-input v-model:value="searchState.name" placeholder="请输入商户名" allow-clear />
      </a-form-item>
      <a-form-item label="行业类型">
        <a-select
          v-model:value="searchState.category"
          placeholder="请选择"
          style="width: 150px"
          allow-clear
        >
          <a-select-option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="$emit('search')">查询</a-button>
        <a-button style="margin-left: 8px" @click="$emit('reset')">重置</a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup>
import { categoryOptions } from '../config/config'
defineProps({
  searchState: Object,
})
defineEmits(['search', 'reset'])
</script>
