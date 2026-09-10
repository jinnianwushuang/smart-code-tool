<template>
  <div>
    <div class="text-h4 q-my-md">商户列表区域 {{ index }}</div>
    <!-- 3. 卡片列表区域 (替代表格) -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }"
      :data-source="merchantList"
      :loading="loading"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <MerchantCard :item="item" :parent_payload="payload" />
        </a-list-item>
      </template>
    </a-list>

    <!-- 4. 底部翻页 -->
    <div style="margin-top: 24px; text-align: right">
      <a-pagination
        v-model:current="pagination.current"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        show-size-changer
        @change="handle_on_pagination_change"
      />
    </div>

    <!-- 5. 新增/编辑 抽屉弹窗 (商户字段多，建议用抽屉或大弹窗) -->
    <MerchantFormModal
      v-model:visible="modalVisible"
      v-if="modalVisible"
      :editing_obj="current_record_to_dialog_data"
      :isEdit="isEdit"
      @ok="handle_on_pagination_change"
    />
  </div>
</template>

<script setup>
import MerchantCard from '../merchant-card/merchant-card.vue'
import MerchantFormModal from '../merchant-form-modal/merchant-form-modal.vue'

import { ALL_EVENT_PIPELINE as ALL_EVENT_PIPELINE_parent } from '../../module/event-pipeline/event-pipeline.js'

import { provide, inject } from 'vue'
import { useContextAssembler } from 'src/output/common/composable-common.js'
import { all_atoms_assembler } from './assembler/assembler.js'

// const current_tab = inject('')

// 组件内定义的 props
const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
})

// 组件内定义的  emit
const emit = defineEmits([])
// 下游组件调用的 income 通道 指定函数名字
const income_pipeline = []
// 需要包装payload 给当前组件模板内直接用的函数名字
const wrap_payload = ['handle_on_pagination_change']
// 基础上下文
const base_payload = {
  //   current_tab,
  props,
  income_pipeline,
  ALL_EVENT_PIPELINE_parent,
  wrap_payload,
}
const payload = useContextAssembler(base_payload, all_atoms_assembler())

const {
  current_record_to_dialog_data,
  merchantList,
  modalVisible,
  pagination,
  loading,
  isEdit,
  wrapped_payload: { handle_on_pagination_change },
  // ALL_EVENT_PIPELINE,
} = payload

// provide('ALL_EVENT_PIPELINE', ALL_EVENT_PIPELINE)
</script>

<style lang="scss" scoped></style>
