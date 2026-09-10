<template>
  <a-card hoverable style="border-radius: 8px">
    <!-- 卡片标题与状态 -->
    <template #title>
      <div style="display: flex; align-items: center; justify-content: space-between">
        <span
          style="font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
        >
          商户组 {{ parent_index }} : 商户名字: {{ item.name }}
        </span>
        <a-tag :color="item.status === '1' ? 'green' : 'orange'">
          {{ item.status === '1' ? '营业中' : '休息中' }}
        </a-tag>
      </div>
    </template>

    <!-- 操作按钮 -->
    <template #actions>
      <a-button type="link" @click="ALL_EVENT_PIPELINE_parent.other.handleEdit(item)"
        ><edit-outlined /> 编辑</a-button
      >
      <a-popconfirm title="确定删除该商户及其所有数据？" @confirm="$emit('delete', item.id)">
        <a-button type="link" danger><delete-outlined /> 删除</a-button>
      </a-popconfirm>
    </template>

    <!-- 商户详细信息展示 -->
    <a-descriptions :column="1" size="small">
      <a-descriptions-item label="负责人">{{ item.contactPerson }}</a-descriptions-item>
      <a-descriptions-item label="联系电话">{{ item.phone }}</a-descriptions-item>
      <a-descriptions-item label="主营类目">{{ item.category }}</a-descriptions-item>
      <a-descriptions-item label="账户余额">
        <span style="color: #f5222d; font-weight: bold">￥{{ item.balance }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="综合评分">
        <a-rate :value="item.rating" disabled style="font-size: 12px" />
      </a-descriptions-item>
      <a-descriptions-item label="详细地址">
        <a-typography-paragraph :ellipsis="{ rows: 1 }" :content="item.address" />
      </a-descriptions-item>
    </a-descriptions>
  </a-card>
</template>

<script setup>
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'

import { provide, inject } from 'vue'
import { useContextAssembler } from 'src/output/common/composable-common.js'
import { all_atoms_assembler } from './assembler/assembler.js'

// const current_tab = inject('current_tab')
// 组件内定义的 props
const props = defineProps({ item: Object, parent_payload: Object })
// 组件内定义的  emit
const emit = defineEmits([])
// 下游组件调用的 income 通道 指定函数名字
const income_pipeline = []
// 需要包装payload 给当前组件模板内直接用的函数名字
const wrap_payload = []
// 基础上下文
const base_payload = {
  // current_tab,
  props,
  income_pipeline,

  wrap_payload,
}

const payload = useContextAssembler(base_payload, all_atoms_assembler())

const {
  // wrapped_payload: {   },
  // ALL_EVENT_PIPELINE,
} = payload

const { parent_payload } = props
const {} = parent_payload

const parent_index = parent_payload.props.index
const ALL_EVENT_PIPELINE_parent = parent_payload.ALL_EVENT_PIPELINE

// provide('ALL_EVENT_PIPELINE', ALL_EVENT_PIPELINE)
</script>

<style scoped>
:deep(.ant-descriptions-item-label) {
  color: #8c8c8c;
}
:deep(.ant-descriptions-row > td) {
  padding-bottom: 4px !important;
}
</style>
