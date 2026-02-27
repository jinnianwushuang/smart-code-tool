<template>
  <q-page>
    <q-card>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab v-for="item in all_tabs" :key="item.name" :name="item.name" :label="item.label" />
      </q-tabs>

      <q-separator />

      <component :is="current_component" />
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import Tab1 from './components/Tab1.vue'
import Tab2 from './components/Tab2.vue'
import Tab3 from './components/Tab3.vue'

const tab = ref('tab1')
const all_tabs = [
  { name: 'tab1', label: '属性转换', component: Tab1 },
  { name: 'tab2', label: 'Tab 2', component: Tab2 },
  { name: 'tab3', label: 'Tab 3', component: Tab3 },
]
const current_component = computed(() => {
  const current_tab = all_tabs.find((t) => t.name === tab.value)
  return current_tab ? current_tab.component : null
})
</script>

<style scoped>
.q-page {
  padding: 16px;
}
</style>
