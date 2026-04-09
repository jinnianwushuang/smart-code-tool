<template>
  <div style="padding: 24px; background: #f0f2f5; min-height: 100vh">
    <!-- 1. 顶部查询区域 -->
    <a-card style="margin-bottom: 24px">
      <a-form layout="inline" :model="searchState">
        <a-form-item label="商户名称">
          <a-input v-model:value="searchState.name" placeholder="请输入商户名" allow-clear />
        </a-form-item>
        <a-form-item label="行业类型">
          <a-select v-model:value="searchState.category" placeholder="请选择" style="width: 150px" allow-clear>
            <a-select-option value="餐饮">餐饮美食</a-select-option>
            <a-select-option value="零售">百货零售</a-select-option>
            <a-select-option value="娱乐">休闲娱乐</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="onSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="onReset">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 2. 操作栏 -->
    <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center">
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
          <a-card hoverable style="border-radius: 8px">
            <!-- 卡片标题与状态 -->
            <template #title>
              <div style="display: flex; align-items: center; justify-content: space-between">
                <span style="font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                  {{ item.name }}
                </span>
                <a-tag :color="item.status === '1' ? 'green' : 'orange'">
                  {{ item.status === '1' ? '营业中' : '休息中' }}
                </a-tag>
              </div>
            </template>

            <!-- 操作按钮 -->
            <template #actions>
              <a-button type="link" @click="handleEdit(item)"><edit-outlined /> 编辑</a-button>
              <a-popconfirm title="确定删除该商户及其所有数据？" @confirm="handleDelete(item.id)">
                <a-button type="link" danger><delete-outlined /> 删除</a-button>
              </a-popconfirm>
            </template>

            <!-- 商户详细信息展示 -->
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="负责人">{{ item.contactPerson }}</a-descriptions-item>
              <a-descriptions-item label="联系电话">{{ item.phone }}</a-descriptions-item>
              <a-descriptions-item label="主营类目">{{ item.category }}</a-descriptions-item>
              <a-descriptions-item label="账户余额">
                <span style="color: #f5222d; font-weight: bold">￥{{ item.balance }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="综合评分">
                <a-rate :value="item.rating" disabled style="font-size: 12px" />
              </a-descriptions-item>
              <a-descriptions-item label="详细地址">
                <a-typography-paragraph :ellipsis="{ rows: 1 }" :content="item.address" />
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
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
    <a-modal
      v-model:visible="modalVisible"
      :title="isEdit ? '修改商户资料' : '商户入驻申请'"
      width="650px"
      @ok="handleModalOk"
      :confirm-loading="confirmLoading"
      destroyOnClose
    >
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="商户全称" name="name">
              <a-input v-model:value="formState.name" placeholder="请输入完整公司/店名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="经营类目" name="category">
              <a-select v-model:value="formState.category" placeholder="请选择行业">
                <a-select-option value="餐饮">餐饮美食</a-select-option>
                <a-select-option value="零售">百货零售</a-select-option>
                <a-select-option value="娱乐">休闲娱乐</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="负责人姓名" name="contactPerson">
              <a-input v-model:value="formState.contactPerson" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" name="phone">
              <a-input v-model:value="formState.phone" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="详细经营地址" name="address">
              <a-textarea v-model:value="formState.address" :rows="2" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="运营状态" name="status">
              <a-radio-group v-model:value="formState.status" button-style="solid">
                <a-radio-button value="1">正常营业</a-radio-button>
                <a-radio-button value="0">关店歇业</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';

// --- 数据定义 ---
const loading = ref(false);
const merchantList = ref([]);
const searchState = reactive({ name: '', category: undefined });
const pagination = reactive({ current: 1, pageSize: 8, total: 40 });

// --- 获取数据 ---
const loadData = async () => {
  loading.value = true;
  // 模拟 API 请求
  setTimeout(() => {
    const data = [];
    for (let i = 1; i <= pagination.pageSize; i++) {
      data.push({
        id: i + (pagination.current - 1) * pagination.pageSize,
        name: `阳光${['果蔬', '海鲜', '火锅', '便利店'][i % 4]}旗舰店`,
        category: ['餐饮', '零售', '娱乐'][i % 3],
        contactPerson: '张经理',
        phone: '138-0000-0000',
        balance: (Math.random() * 10000).toFixed(2),
        rating: Math.floor(Math.random() * 3) + 3,
        status: Math.random() > 0.2 ? '1' : '0',
        address: '某某市高新区技术软件园 A 座 10' + i + '号',
      });
    }
    merchantList.value = data;
    loading.value = false;
  }, 600);
};

// --- 搜索逻辑 ---
const onSearch = () => {
  pagination.current = 1;
  loadData();
};
const onReset = () => {
  searchState.name = '';
  searchState.category = undefined;
  onSearch();
};

// --- 弹窗逻辑 ---
const modalVisible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const formState = reactive({
  id: null,
  name: '',
  category: undefined,
  contactPerson: '',
  phone: '',
  address: '',
  status: '1'
});

const rules = {
  name: [{ required: true, message: '商户名不能为空' }],
  category: [{ required: true, message: '请选择经营类目' }],
  phone: [{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]
};

const handleAdd = () => {
  isEdit.value = false;
  Object.assign(formState, { id: null, name: '', category: undefined, contactPerson: '', phone: '', address: '', status: '1' });
  modalVisible.value = true;
};

const handleEdit = (item) => {
  isEdit.value = true;
  Object.assign(formState, { ...item });
  modalVisible.value = true;
};

const handleModalOk = () => {
  formRef.value.validate().then(() => {
    confirmLoading.value = true;
    setTimeout(() => {
      message.success(isEdit.value ? '信息更新成功' : '商户入驻成功');
      modalVisible.value = false;
      confirmLoading.value = false;
      loadData();
    }, 800);
  });
};

const handleDelete = (id) => {
  message.success(`已成功移除商户 ID: ${id}`);
  loadData();
};

onMounted(loadData);
</script>

<style scoped>
/* 针对 Descriptions 内部样式的微调 */
:deep(.ant-descriptions-item-label) {
  color: #8c8c8c;
}
:deep(.ant-descriptions-row > td) {
  padding-bottom: 4px !important;
}
</style>
