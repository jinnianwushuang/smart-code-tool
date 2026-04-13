<template>
  <div class="q-pa-md generator-wrapper">
    <q-splitter v-model="splitterModel" class="transition-base" style="height: calc(100vh - 130px)">
      <template v-slot:before>
        <div class="q-pa-md">
          <NonNestedProcessor />
        </div>
      </template>

      <template v-slot:after>
        <div class="q-pa-md">
          <NestedProcessor />
        </div>
      </template>
    </q-splitter>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NonNestedProcessor from './component/NonNestedProcessor.vue'
import NestedProcessor from './component/NestedProcessor.vue'

const splitterModel = ref(50) // start at 50%
</script>

<style scoped>
.generator-wrapper {
  transition: background-color 0.3s;
}

.transition-base {
  transition:
    background-color 0.3s,
    border-color 0.3s,
    box-shadow 0.3s;
}

/* 适配黑白模式的分割线颜色 */
:deep(.q-splitter__separator) {
  background-color: rgba(128, 128, 128, 0.2);
}
</style>
