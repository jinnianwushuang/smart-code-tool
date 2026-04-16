<template>
  <div>
    <!-- 1. 顶部查询区域 -->
    <MerchantSearch />

    <MerchantMainArea key="1" :index="1" />
    <MerchantMainArea key="2" :index="2" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'

import MerchantSearch from './components/merchant-search/merchant-search.vue'
import MerchantMainArea from './components/merchant-main-area/merchant-main-area.vue'

import { useContextAssembler } from 'src/output/common/composable-common.js'
import { all_atoms_assembler } from './assembler/assembler.js'

// 组件内定义的 props
const props = defineProps({})
// 组件内定义的  emit
const emit = defineEmits([])
// 下游组件调用的 income 通道 指定函数名字
const income_pipeline = []
// 需要包装payload 给当前组件模板内直接用的函数名字
const wrap_payload = []
// 基础上下文
const base_payload = {
  props,
  income_pipeline,
  wrap_payload,
}
const {} = useContextAssembler(base_payload, all_atoms_assembler())
</script>

<style scoped></style>
