<template>
  <div class="data-grid" :style="gridStyle">
    <div v-for="(item, index) in data" :key="index" class="grid-cell">
      <!-- 默认插槽：父组件自定义每个卡片的渲染 -->
      <slot :item="item" :index="index">
        <div class="default-card">{{ item }}</div>
      </slot>
    </div>

    <!-- 空状态 -->
    <div v-if="data.length === 0" class="grid-empty">
      <slot name="empty">暂无数据</slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Number, default: 3 },
})

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
  gap: '16px',
}))
</script>

<style scoped>
.grid-cell {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s;
}
.grid-cell:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
.default-card {
  padding: 24px;
  text-align: center;
  color: #666;
}
.grid-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 32px;
  color: #bbb;
}

/* 暗色模式 */
body.body--dark .grid-cell {
  border-color: #333;
}
body.body--dark .grid-cell:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
body.body--dark .default-card {
  color: #aaa;
}
body.body--dark .grid-empty {
  color: #777;
}
</style>
