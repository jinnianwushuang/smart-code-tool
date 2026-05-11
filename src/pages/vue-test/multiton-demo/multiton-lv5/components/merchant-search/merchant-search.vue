<template>
  <div>
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
          <a-button type="primary" @click="ALL_EVENT_PIPELINE.other.search()">查询</a-button>
          <a-button style="margin-left: 8px" @click="ALL_EVENT_PIPELINE.other.reset()">
            重置</a-button
          >
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 2. 操作栏 -->
    <div
      style="
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <a-button type="primary" size="large" @click="ALL_EVENT_PIPELINE.other.handleAdd()">
        <template #icon><plus-outlined /></template>
        入驻新商户
      </a-button>
      <span style="color: #999">当前共 {{ pagination.total }} 家商户</span>
    </div>
  </div>
</template>

<script setup>
import { PlusOutlined } from '@ant-design/icons-vue'
import { all_singleton } from '../../state/singleton.js'
import * as all_config from '../../state/config.js'
import { ALL_EVENT_PIPELINE } from '../../module/event-pipeline/event-pipeline.js'
const { categoryOptions } = all_config
const { searchState, pagination } = all_singleton
</script>
