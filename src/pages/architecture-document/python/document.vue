<template>
  <div>
    <q-card>
      <TabLikeButtonsV1 v-model="current_tab_name" :tabs="all_tabs" />

      <component :is="current_component" />
    </q-card>
  </div>
</template>

<script setup>
import { computed, ref, provide } from 'vue'

import { mapMarkdownFolderModulesToTabs, pascalCase } from 'src/output/common/project-common.js'
const default_tab_name = 'reference-code'
// 1. 定义中文映射表
const folderLabelMap = {
  'reference-code': '参考代码',
}

const current_tab_name = ref(pascalCase(default_tab_name))
provide('parent_tab', current_tab_name)
// 1. 全量扫描（注意路径要能覆盖所有子目录）
const allMdModules = import.meta.glob('./md-doc/*/*.md', { eager: true })

const all_tabs = mapMarkdownFolderModulesToTabs({
  allMdModules,
  folderLabelMap,
})

const current_component = computed(() => {
  const current_tab = all_tabs.find((t) => t.name === current_tab_name.value)
  return current_tab ? current_tab.component : null
})
</script>

<style scoped>
.div {
  padding: 16px;
}
</style>
