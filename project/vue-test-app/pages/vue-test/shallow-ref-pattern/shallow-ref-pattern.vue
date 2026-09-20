<template>
  <div class="paradigm-page">
    <h2>shallowRef + computed 性能范式</h2>
    <p class="subtitle">
      Vue 3 管理大型深层对象的核心高性能范式 —— 用浅层响应式切断深度追踪，用纯函数算法掌控数据转换
    </p>

    <a-alert
      message="一句话理解"
      description="shallowRef 只在 .value 引用变更时触发更新，内部属性的修改完全在响应式系统之外——开发者拥有完全的控制权。"
      type="info"
      show-icon
      style="margin-bottom: 20px"
    />

    <a-card title="解决什么问题" size="small" style="margin-bottom: 16px">
      <p>
        Vue 3 的 <code>ref</code> / <code>reactive</code> 默认提供<strong>深度响应性</strong>——
        对嵌套对象任何层级的属性修改都会触发依赖追踪和视图更新。 当数据量大时（500 条记录 × 20
        个字段 = 10000 个潜在触发点）， 深度 Proxy 的内存和计算开销成为性能瓶颈。
      </p>
      <p>
        <strong>shallowRef 把响应式边界收缩到"引用变更"这一个维度</strong>， 消除深度 Proxy
        的开销，让开发者完全掌控"何时更新"。
      </p>
    </a-card>

    <a-card title="核心三原则" size="small" style="margin-bottom: 16px">
      <ul>
        <li>
          <strong>数据不可变更新</strong>：永远不修改 shallowRef 内部属性，每次整体替换
          <code>.value</code>
        </li>
        <li><strong>算法在响应式之外</strong>：数据转换是纯函数，不依赖 Vue API</li>
        <li><strong>更新时机可控</strong>：开发者明确知道何时触发更新，可以批量合并</li>
      </ul>
    </a-card>

    <h4>标准写法</h4>
    <pre class="code-block">{{ codeStandard }}</pre>

    <h4>对比：ref 深度追踪 vs shallowRef 浅层响应</h4>
    <pre class="code-block">{{ codeComparison }}</pre>

    <a-divider />

    <a-card title="与 React 的对应关系" size="small">
      <ul>
        <li>
          <a-tag color="green">shallowRef</a-tag> ≈ React 的
          <a-tag color="blue">zustand store</a-tag>
          —— 都是独立于渲染树的状态容器
        </li>
        <li>
          <a-tag color="green">computed</a-tag> ≈ React 的
          <a-tag color="blue">selector + useMemo</a-tag>
          —— 都是惰性求值 / 缓存派生
        </li>
        <li>
          <a-tag color="green">.value = { ...old }</a-tag> ≈ React 的
          <a-tag color="blue">Immer set()</a-tag>
          —— 都是不可变更新
        </li>
      </ul>
      <p style="margin-top: 12px; margin-bottom: 0">
        <strong>关键差异</strong>：Vue 的依赖追踪是自动的（读取即收集）， React
        需要开发者显式声明订阅（selector）。 Vue 更"自动"，React 更"可控"。
      </p>
    </a-card>
  </div>
</template>

<script setup>
const codeStandard = `import { shallowRef, computed } from 'vue'
import { buildTableData } from '@/transforms/order-transform'

// ① 原始数据：shallowRef 缓存，不深度代理
const rawOrders = shallowRef([])
const filters = shallowRef({})

// ② 显示数据：computed 内部调用纯函数算法
// 只在 rawOrders.value 或 filters.value 引用变更时重算
const tableData = computed(() =>
  buildTableData(rawOrders.value, filters.value)
)

// ③ 更新方式：整体替换 .value
async function load() {
  const data = await fetchOrders(filters.value)
  rawOrders.value = data  // ✅ 整体替换，触发一次 computed 重算
}

function updateFilters(partial) {
  filters.value = { ...filters.value, ...partial }  // ✅ 新对象引用
}`

const codeComparison = `// ❌ ref 深度代理：500 条 × 20 字段 = 10000 个 Proxy
const orders = ref([])
orders.value[0].name = 'new'  // 触发通知！深度追踪

// ✅ shallowRef：0 个深度 Proxy，O(1) 开销
const orders = shallowRef([])
orders.value[0].name = 'new'  // 静默修改，不触发任何通知
orders.value = newData         // ✅ 整体替换，触发 1 次通知`
</script>

<style scoped>
.paradigm-page {
  max-width: 800px;
  margin: 0 auto;
}
.subtitle {
  color: #888;
  font-size: 14px;
  margin-bottom: 16px;
}
.code-block {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 8px;
  font-size: 13px;
  overflow: auto;
  line-height: 1.6;
}
body.body--dark .code-block {
  background: #1e1e1e;
  color: #d4d4d4;
}
</style>
