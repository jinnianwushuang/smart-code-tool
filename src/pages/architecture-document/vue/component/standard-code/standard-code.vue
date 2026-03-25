<template>
  <q-page>
    <q-card>
      <div class="tabs-container">
        <!-- 1. 渲染 Tab 按钮 -->
        <TabLikeButtonsV1 v-model="current_tab_name" @change="handle_tab_change" :tabs="all_tabs" />
        <!-- 2. 动态显示 Markdown 内容 -->
        <div class="row justify-center">
          <component :is="current_component.component" v-if="current_component" />
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { shallowRef, onMounted, computed, ref, watch } from 'vue'
import { get_markdown_tabs } from 'src/output/common/project-common.js'

// 1. 扫描文档目录（同步导入组件）
const mdModules = import.meta.glob('./md/*.md', { eager: true })

// 2. 转换为 Tab 数组
const all_tabs = get_markdown_tabs(mdModules)
const current_tab_name = ref(all_tabs[0]?.name || '')
// 3. 响应式控制当前选中的 Tab
// 注意：使用 shallowRef 存储组件对象，避免 Vue 对大型组件进行深层代理提高性能
const current_component = shallowRef(all_tabs[0])
const handle_tab_change = (new_tab_name) => {
  console.error('Current Tab Name:', new_tab_name)
  const current_tab = all_tabs.find((t) => t.name === new_tab_name)
  current_component.value = current_tab ? current_tab : null
}
</script>
