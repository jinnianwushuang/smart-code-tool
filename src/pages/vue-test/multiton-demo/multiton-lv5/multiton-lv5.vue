<template>
  <div>
    <!-- 1. 顶部查询区域 -->
    <MerchantSearch />

    <!-- 2. 入住新商户 按钮 + 操作栏 -->
    <div
      style="
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <span style="color: #999">当前共 {{ pagination.total }} 家商户</span>
    </div>

    <!-- 3. 卡片列表区域 (替代表格) -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }"
      :data-source="merchantList"
      :loading="loading"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <MerchantCard :item="item" />
        </a-list-item>
      </template>
    </a-list>

    <!-- 4. 底部翻页 -->
    <div style="margin-top: 24px; text-align: right">
      <a-pagination
        v-model:current="pagination.current"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        show-size-changer
      />
      <!-- @change="loadData" -->
    </div>

    <!-- 5. 新增/编辑 抽屉弹窗 (商户字段多，建议用抽屉或大弹窗) -->
    <MerchantFormModal
      v-model:visible="modalVisible"
      :is-edit="isEdit"
      :initial-data="formState"
      confirm-loading="confirmLoading"
    />
  </div>
</template>

<script setup>
import { PlusOutlined } from '@ant-design/icons-vue'
import MerchantSearch from './components/MerchantSearch.vue'
import MerchantCard from './components/MerchantCard.vue'
import MerchantFormModal from './components/MerchantFormModal.vue'

import { useContextAssembler } from 'src/output/common/composable-common.js'
import { all_atoms_assembler } from './assembler/assembler.js'

import { all_event_pipeline } from './module/event-pipeline/event-pipeline.js'

// 组件内定义的 props
const props = defineProps({})
// 组件内定义的  emit
const emit = defineEmits([])
// 下游组件调用的 income 通道 指定函数名字
const income_pipeline = []
// 需要包装payload 给当前组件模板内直接用的函数名字
const wrap_payload = []
// 基础上下文
const base_payload = {
  props,
  income_pipeline,
  wrap_payload,
}

const { modalVisible, pagination, merchantList, loading, confirmLoading } = useContextAssembler(
  base_payload,
  all_atoms_assembler(),
)
</script>

<style scoped></style>
