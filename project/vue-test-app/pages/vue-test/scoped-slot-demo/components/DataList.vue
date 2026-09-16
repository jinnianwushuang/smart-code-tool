<template>
  <div class="data-list">
    <div v-for="(item, index) in pagedData" :key="index" class="list-item">
      <!-- 默认插槽：父组件完全自定义每项的渲染 -->
      <slot :item="item" :index="index + (currentPage - 1) * pageSize">
        <!-- 未提供插槽时的默认渲染 -->
        <div class="default-item">{{ item }}</div>
      </slot>
    </div>

    <!-- 空状态 -->
    <div v-if="data.length === 0">
      <slot name="empty">暂无数据</slot>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="list-pagination">
      <a-pagination
        v-model:current="currentPage"
        :total="data.length"
        :page-size="pageSize"
        size="small"
        show-less-items
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  pageSize: { type: Number, default: 5 },
})

const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(props.data.length / props.pageSize))

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize
  return props.data.slice(start, start + props.pageSize)
})
</script>

<style scoped>
.data-list {
  width: 100%;
}
.list-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}
.list-item:hover {
  background: #f9f9f9;
}
.list-item:last-child {
  border-bottom: none;
}
.default-item {
  font-size: 14px;
  color: #666;
}
.list-pagination {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

/* 暗色模式 */
body.body--dark .list-item {
  border-bottom-color: #333;
}
body.body--dark .list-item:hover {
  background: #2a2a2a;
}
body.body--dark .default-item {
  color: #aaa;
}
</style>
