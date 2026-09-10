<template>
  <a-card hoverable style="border-radius: 8px">
    <!-- 卡片标题与状态 -->
    <template #title>
      <div style="display: flex; align-items: center; justify-content: space-between">
        <span
          style="font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
        >
          {{ item.name }}
        </span>
        <a-tag :color="item.status === '1' ? 'green' : 'orange'">
          {{ item.status === '1' ? '营业中' : '休息中' }}
        </a-tag>
      </div>
    </template>

    <!-- 操作按钮 -->
    <template #actions>
      <a-button type="link" @click="$emit('edit', item)"><edit-outlined /> 编辑</a-button>
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
defineProps({
  item: Object,
})
defineEmits(['edit', 'delete'])
</script>

<style scoped>
:deep(.ant-descriptions-item-label) {
  color: #8c8c8c;
}
:deep(.ant-descriptions-row > td) {
  padding-bottom: 4px !important;
}
</style>
