<template>
  <div class="paradigm-page">
    <h2>mitt + 节流防抖 事件驱动范式</h2>
    <p class="subtitle">
      Vue 3 处理高频实时数据的事件驱动管道 —— 数据生产与消费解耦，更新节奏精确控制
    </p>

    <a-alert
      message="一句话理解"
      description="高频数据不走响应式管道：用 mitt 事件总线接收数据流，用节流/防抖控制频率，用细项 ref 隔离领域，用 computed 做终端消费。"
      type="info"
      show-icon
      style="margin-bottom: 20px"
    />

    <a-card title="解决什么问题" size="small" style="margin-bottom: 16px">
      <p>
        当数据源每秒推送数十次更新（WebSocket 实时指标、传感器数据、动画帧）时， 即使使用
        shallowRef，每次赋值仍然触发响应式通知 → computed 重算 → 组件重渲染。
      </p>
      <p>
        <strong>高频管道在数据源和响应式系统之间插入"节流层"</strong>， 将每秒 30
        次推送降频到人眼可感知的 5~10 次，消除无意义的渲染开销。
      </p>
    </a-card>

    <a-card title="四层管道架构" size="small" style="margin-bottom: 16px">
      <ul>
        <li><strong>① mitt 事件总线</strong>：接收原始数据流，按领域拆分事件</li>
        <li><strong>② 节流/防抖层</strong>：控制更新节奏（throttle / debounce / rAF）</li>
        <li><strong>③ 领域细项导出</strong>：每个指标独立的 ref / shallowRef，领域隔离</li>
        <li><strong>④ computed 终端消费</strong>：组件只绑定计算后的显示数据</li>
      </ul>
    </a-card>

    <h4>事件总线 + 节流订阅</h4>
    <pre class="code-block">{{ codeBus }}</pre>

    <h4>三种降频策略选择</h4>
    <a-card size="small" style="margin-bottom: 16px">
      <a-table :columns="columns" :data-source="strategies" :pagination="false" size="small" />
    </a-card>

    <a-divider />

    <a-card title="与 React 的对应关系" size="small">
      <ul>
        <li>
          <a-tag color="green">mitt 事件总线</a-tag> ≈ React 中
          <a-tag color="blue">相同的 mitt 模式</a-tag>
          —— 事件总线是框架无关的
        </li>
        <li>
          <a-tag color="green">细项 ref</a-tag> ≈ React 的
          <a-tag color="blue">zustand selector 精确订阅</a-tag>
          —— Vue 靠细粒度 ref 隔离，React 靠 selector 隔离
        </li>
        <li>
          <a-tag color="green">computed 终端消费</a-tag> ≈ React 的
          <a-tag color="blue">useMemo 缓存派生</a-tag>
          —— 都是最后一道"去重过滤器"
        </li>
      </ul>
    </a-card>
  </div>
</template>

<script setup>
const codeBus = `import mitt from 'mitt'
import { ref, shallowRef, computed, onMounted, onUnmounted } from 'vue'

const emitter = mitt()

// 节流工具
function throttle(fn, interval) {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last >= interval) { last = now; fn(...args) }
  }
}

// 领域细项导出
const cpuValue = ref(0)
const cpuHistory = shallowRef([])

// 节流后写入 ref（每秒最多 10 次）
const handleCpu = throttle((data) => {
  cpuValue.value = data.value
  cpuHistory.value = [...cpuHistory.value.slice(-59), data.value]
}, 100)

// 终端消费：computed 自动派生显示数据
const cpuPercentText = computed(() => \`\${cpuValue.value.toFixed(1)}%\`)
const cpuStatus = computed(() => {
  const v = cpuValue.value
  if (v >= 90) return 'danger'
  if (v >= 70) return 'warning'
  return 'normal'
})

onMounted(() => emitter.on('cpu', handleCpu))
onUnmounted(() => emitter.off('cpu', handleCpu))`

const columns = [
  { title: '策略', dataIndex: 'name', key: 'name' },
  { title: '适用场景', dataIndex: 'scene', key: 'scene' },
  { title: '效果', dataIndex: 'effect', key: 'effect' },
]

const strategies = [
  { key: '1', name: 'throttle', scene: 'CPU 使用率（持续可见）', effect: '100ms → 10 次/秒' },
  { key: '2', name: 'debounce', scene: '内存趋势（停顿后更新）', effect: '200ms 延迟' },
  { key: '3', name: 'rAF', scene: '网络流量（与帧对齐）', effect: '每帧最多 1 次' },
]
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
