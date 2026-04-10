<template>
  <div style="padding: 24px; background: #f0f2f5; min-height: 100vh">
    <!-- 1. 顶部查询区域 -->
    <MerchantSearch :search-state="searchState" @search="onSearch" @reset="onReset" />

    <!-- 2. 操作栏 -->
    <div
      style="
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <a-button type="primary" size="large" @click="handleAdd">
        <template #icon><plus-outlined /></template>
        入驻新商户
      </a-button>
      <span style="color: #999">当前共 {{ pagination.total }} 家商户</span>
    </div>

    <!-- 3. 卡片列表区域 (替代表格) -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }"
      :data-source="merchantList"
      :loading="loading"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <MerchantCard :item="item" @edit="handleEdit" @delete="handleDelete" />
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
        @change="loadData"
      />
    </div>

    <!-- 5. 新增/编辑 抽屉弹窗 (商户字段多，建议用抽屉或大弹窗) -->
    <MerchantFormModal
      v-model:visible="modalVisible"
      :is-edit="isEdit"
      :initial-data="formState"
      :confirm-loading="confirmLoading"
      @ok="handleModalOk"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import MerchantSearch from './components/MerchantSearch.vue'
import MerchantCard from './components/MerchantCard.vue'
import MerchantFormModal from './components/MerchantFormModal.vue'




onMounted(loadData)
</script>

<style scoped></style>
