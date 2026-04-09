<template>
  <div>
    <q-splitter v-model="splitterModel" style="height: calc(100vh - 100px)">
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
