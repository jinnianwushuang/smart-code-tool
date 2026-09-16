<template>
  <div class="vue-index-container">
    <!-- 标题区 -->
    <div class="hero-section">
      <div class="hero-badge">Vue 3 · Composition API</div>
      <h1 class="hero-title">Vue 架构验证 — 6 大核心范式</h1>
      <p class="hero-desc">
        从代码分级演进（LV1→LV5）到 Vue
        独有响应式内核，覆盖状态管理、逻辑复用、组件通信、渲染委托等核心维度
      </p>
    </div>

    <!-- 范式卡片 -->
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :sm="12" :lg="8" v-for="p in patterns" :key="p.name">
        <a-card :bordered="false" hoverable class="pattern-card" @click="goTo(p.route)">
          <template #cover>
            <div class="card-cover" :style="{ background: p.gradient }">
              <span class="card-icon">{{ p.icon }}</span>
            </div>
          </template>
          <a-card-meta :title="p.name" :description="p.brief" />
          <div class="card-tags q-mt-sm">
            <a-tag
              v-for="tag in p.tags"
              :key="tag"
              :color="tag === 'Vue 独有' ? '#52c41a' : 'default'"
              size="small"
            >
              {{ tag }}
            </a-tag>
          </div>
          <div class="card-meta q-mt-sm">
            <div class="meta-item">
              <span class="meta-label">解决什么</span>
              <span class="meta-value">{{ p.solve }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">核心机制</span>
              <span class="meta-value">{{ p.mechanism }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">React 对应</span>
              <span class="meta-value meta-react">{{ p.reactMapping }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">何时使用</span>
              <span class="meta-value">{{ p.when }}</span>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 对比表格 -->
    <a-card :bordered="false" class="q-mt-xl comparison-card">
      <template #title>
        <span class="card-title">6 种范式全维度对比</span>
      </template>
      <a-table
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="false"
        size="middle"
        :scroll="{ x: 900 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a-tag :color="record.color">{{ record.name }}</a-tag>
          </template>
          <template v-if="column.key === 'unique'">
            <a-tag v-if="record.unique" color="green">Vue 独有</a-tag>
            <span v-else class="text-muted">—</span>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 底部说明 -->
    <div class="footer-note q-mt-xl">
      <p>
        单例 / 多例 / 验证解释 采用 <strong>LV1→LV5 分级演进</strong> 模式，
        从最基础的代码堆砌逐步进化到框架级自研 DSL。 Composable 组合链 / ScopedSlot / 响应式深度
        展示 Vue 3 独有的架构能力。
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goTo(path) {
  router.push({ name: path })
}

const patterns = [
  {
    name: '单例模式',
    icon: '1',
    brief: 'provide/inject + 状态机单例，跨组件共享唯一数据源',
    solve: '跨层级组件共享同一份状态',
    mechanism: 'provide/inject + useContextAssembler',
    reactMapping: 'Context + useContext（Provider 注入）',
    when: '全局配置、用户会话、权限管理',
    tags: ['LV1→LV5', '状态共享'],
    route: 'singleton-demo',
    gradient: 'linear-gradient(135deg, #1677ff, #4096ff)',
  },
  {
    name: '多例模式',
    icon: 'N',
    brief: '每个组件实例独立调用装配器，闭包隔离状态',
    solve: '同一功能多个独立实例互不干扰',
    mechanism: '函数式状态机 + 闭包隔离',
    reactMapping: '每个组件实例独立调用 Hook（闭包隔离）',
    when: '多标签页、多面板、多商户管理',
    tags: ['LV1→LV5', '实例隔离'],
    route: 'multiton-demo',
    gradient: 'linear-gradient(135deg, #722ed1, #9254de)',
  },
  {
    name: 'Composable 组合链',
    icon: 'C',
    brief: '多个 Composable 按职责分层串联，形成数据管线',
    solve: '复杂业务逻辑的分层解耦',
    mechanism: '数据层 → 过滤层 → 计算层 → 副作用层',
    reactMapping: 'Hook 组合管线（useList → useFilter → useStats）',
    when: 'Todo、搜索列表、数据看板',
    tags: ['逻辑复用', '分层管线'],
    route: 'composable-chain',
    gradient: 'linear-gradient(135deg, #13c2c2, #36cfc9)',
  },
  {
    name: 'ScopedSlot 作用域插槽',
    icon: 'S',
    brief: '子组件管数据，父组件管渲染，零 Props 透传',
    solve: '通用容器组件的渲染自定义',
    mechanism: '<slot :item :index> 暴露内部数据',
    reactMapping: 'JSX 嵌套 + Context（无原生插槽语法）',
    when: 'DataTable、DataList、DataGrid 等通用组件',
    tags: ['Vue 独有', '渲染委托'],
    route: 'scoped-slot-demo',
    gradient: 'linear-gradient(135deg, #faad14, #ffc53d)',
  },
  {
    name: '响应式深度',
    icon: 'R',
    brief: 'ref / reactive / computed / watch / shallowRef / customRef',
    solve: '精确控制响应式行为与性能',
    mechanism: 'Proxy 代理 + 依赖自动追踪',
    reactMapping: 'useState + useEffect（无自动依赖追踪）',
    when: '大对象优化、防抖输入、惰性计算',
    tags: ['Vue 独有', '响应式内核'],
    route: 'reactivity-depth',
    gradient: 'linear-gradient(135deg, #f5222d, #ff4d4f)',
  },
  {
    name: '验证解释',
    icon: '?',
    brief: 'LV1→LV5 代码分级演进说明，从堆砌到框架级 DSL',
    solve: '理解架构演进的每一步及其利弊',
    mechanism: 'LV1 堆砌 → LV2 拆分 → LV3 Composable → LV4 单例+MITT → LV5 自动装配',
    reactMapping: 'React 侧无分级演进，直接展示 5 种独立范式',
    when: '入门必读，理解整个架构体系',
    tags: ['LV1→LV5', '架构说明'],
    route: 'verification-explanation',
    gradient: 'linear-gradient(135deg, #52c41a, #73d13d)',
  },
]

// ── 对比表格 ──
const tableColumns = [
  { title: '范式', key: 'name', width: 130, fixed: 'left' },
  { title: '核心机制', dataIndex: 'mechanism', width: 180 },
  { title: '状态归属', dataIndex: 'stateOwnership', width: 110 },
  { title: 'Vue 独有', key: 'unique', width: 80, align: 'center' },
  { title: 'React 对应', dataIndex: 'reactMapping', width: 200 },
  { title: '典型场景', dataIndex: 'scenario', width: 170 },
]

const tableData = [
  {
    name: '单例模式',
    color: 'blue',
    mechanism: 'provide/inject + 状态机',
    stateOwnership: '全局唯一',
    unique: false,
    reactMapping: 'Context + useContext',
    scenario: '用户会话、全局配置、权限',
  },
  {
    name: '多例模式',
    color: 'purple',
    mechanism: '函数式状态机 + 闭包',
    stateOwnership: '每实例独立',
    unique: false,
    reactMapping: '每个实例独立调用 Hook',
    scenario: '多标签页、多面板、多商户',
  },
  {
    name: 'Composable 组合链',
    color: 'cyan',
    mechanism: '多 Composable 分层串联',
    stateOwnership: '管线内流转',
    unique: false,
    reactMapping: 'Hook 组合管线（分层组合）',
    scenario: 'Todo、搜索列表、数据看板',
  },
  {
    name: 'ScopedSlot',
    color: 'orange',
    mechanism: '<slot> 暴露内部数据',
    stateOwnership: '子组件持有',
    unique: true,
    reactMapping: 'JSX 嵌套 + Context',
    scenario: 'DataTable、DataList、DataGrid',
  },
  {
    name: '响应式深度',
    color: 'red',
    mechanism: 'Proxy + 依赖追踪',
    stateOwnership: '响应式对象',
    unique: true,
    reactMapping: 'useState + useEffect',
    scenario: '大对象优化、防抖、惰性计算',
  },
  {
    name: '验证解释',
    color: 'green',
    mechanism: 'LV1→LV5 分级演进',
    stateOwnership: '逐级演进',
    unique: false,
    reactMapping: 'React 侧为 5 种独立范式',
    scenario: '架构入门、理解演进路径',
  },
]
</script>

<style scoped>
.vue-index-container {
  max-width: 1100px;
  margin: 0 auto;
}

/* Hero */
.hero-section {
  text-align: center;
  padding: 32px 0 40px;
}
.hero-badge {
  display: inline-block;
  padding: 4px 16px;
  background: linear-gradient(135deg, #42b883, #35495e);
  color: #fff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 16px;
}
.hero-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px;
}
.hero-desc {
  font-size: 15px;
  color: #888;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* 卡片 */
.pattern-card {
  cursor: pointer;
  transition: all 0.25s;
  border-radius: 12px;
  overflow: hidden;
}
.pattern-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.card-cover {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-icon {
  font-size: 32px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.9);
}
.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

/* 元信息 */
.card-meta {
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}
.meta-item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
}
.meta-label {
  color: #999;
  flex-shrink: 0;
  min-width: 56px;
}
.meta-value {
  color: #555;
}
.meta-react {
  color: #61dafb;
  font-weight: 500;
}

/* 对比表格 */
.comparison-card {
  border-radius: 12px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
}
.text-muted {
  color: #ccc;
}

/* 底部 */
.footer-note {
  text-align: center;
  font-size: 13px;
  color: #999;
  line-height: 1.8;
  padding: 16px 0;
}
.footer-note strong {
  color: #666;
}

/* 暗色模式 */
body.body--dark .hero-title {
  color: #e0e0e0;
}
body.body--dark .hero-desc {
  color: #888;
}
body.body--dark .card-meta {
  border-top-color: #333;
}
body.body--dark .meta-label {
  color: #777;
}
body.body--dark .meta-value {
  color: #aaa;
}
body.body--dark .footer-note {
  color: #777;
}
body.body--dark .footer-note strong {
  color: #aaa;
}
</style>
