<template>
  <div>
    <q-card>
      <div class="tabs-container">
        <!-- 1. 渲染 Tab 按钮 -->
        <TabLikeButtonsV1 v-model="current_tab_name" @change="handle_tab_change" :tabs="tabs" />

        <!-- 2. 动态显示内容 -->
        <div class="row justify-center q-pa-md">
          <!-- 使用 component 渲染，增加 key 强制刷新组件状态 -->
          <component :is="current_component" v-if="current_component" :key="current_tab_name" />
          <div v-else class="text-grey">暂无内容</div>
        </div>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { ref, shallowRef, watch, onMounted, inject } from 'vue'

const props = defineProps({
  // 传入已经通过 get_markdown_tabs 处理好的数组
  tabs: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const current_tab_name = ref('')
const current_component = shallowRef(null)
const parent_tab = inject('parent_tab')

// 处理切换逻辑
const handle_tab_change = (new_tab_name) => {
  const target = props.tabs.find((t) => t.name === new_tab_name)
  if (target) {
    // 关键：只存储组件对象本身到 shallowRef
    current_component.value = target.component
    current_tab_name.value = target.name
  }
}

// 初始化及监听外部数据变化
watch(
  [() => props.tabs, () => parent_tab.value],
  ([newTabs]) => {
    let find_obj = newTabs.find((t) => t.name === current_tab_name.value)
    if (find_obj) {
      handle_tab_change(find_obj.name)
    } else {
      handle_tab_change(newTabs[0]?.name)
    }
  },
  { immediate: true },
)
</script>
