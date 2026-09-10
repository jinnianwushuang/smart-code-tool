<template>
  <div class="row">
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
        <a-button type="primary" @click="ALL_EVENT_PIPELINE.other.onSearch">查询</a-button>
        <a-button style="margin-left: 8px" @click="ALL_EVENT_PIPELINE.other.onReset">重置</a-button>
      </a-form-item>
    </a-form>

    <q-space />

    <div style="margin-bottom: 16px">
      <a-button type="primary" @click="ALL_EVENT_PIPELINE.other.handleAdd">
        <template #icon><plus-outlined /></template>
        新增用户
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { provide, inject, onMounted } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
// import { ALL_CONTEXT_STATE, ALL_EVENT_PIPELINE } from '../assembler/expose.js'

const ALL_EVENT_PIPELINE = inject('ALL_EVENT_PIPELINE')
const ALL_CONTEXT_STATE = inject('ALL_CONTEXT_STATE')
const { searchState, statusOptions } = ALL_CONTEXT_STATE

onMounted(() => {
  console.error('ALL_CONTEXT_STATE--------', ALL_CONTEXT_STATE)
})
</script>
