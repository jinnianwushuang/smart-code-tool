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
        <a-button type="primary" @click="mitt_emit('onSearch')">查询</a-button>
        <a-button style="margin-left: 8px" @click="mitt_emit('onReset')">重置</a-button>
      </a-form-item>
    </a-form>

    <q-space />

    <div style="margin-bottom: 16px">
      <a-button type="primary" @click="mitt_emit('handleAdd')">
        <template #icon><plus-outlined /></template>
        新增用户
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { PlusOutlined } from '@ant-design/icons-vue'
import { statusOptions } from '../config/config.js'
import * as all_singleton from '../variable/singleton.js'
import { mitt_emit } from '../mitt/mitt-emit.js'
const { searchState } = all_singleton
defineProps({})
</script>
