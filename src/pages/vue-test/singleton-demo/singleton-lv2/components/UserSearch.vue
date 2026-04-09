<template>
  <a-form layout="inline" :model="searchState" style="margin-bottom: 24px">
    <a-form-item label="用户名">
      <a-input v-model:value="searchState.username" placeholder="请输入用户名" allow-clear />
    </a-form-item>
    <a-form-item label="状态">
      <a-select
        v-model:value="searchState.status"
        placeholder="请选择"
        style="width: 120px"
        allow-clear
      >
        <a-select-option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="$emit('search')">查询</a-button>
      <a-button style="margin-left: 8px" @click="$emit('reset')">重置</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { statusOptions } from '../config/config.js'
defineProps({ searchState: Object })
defineEmits(['search', 'reset'])
</script>
