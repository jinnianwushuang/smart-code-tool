<template>
  <div class="reactivity-container">
    <!-- 说明 -->
    <a-card :bordered="false" class="q-mb-lg">
      <template #title>
        <span class="card-title">Vue 响应式深度 — 独有的响应式内核</span>
      </template>
      <p class="desc-text">
        Vue 的响应式系统是框架的<strong>核心引擎</strong>，与 React 的"setState →
        重新渲染"模型截然不同。 Vue 通过
        <strong>Proxy 代理</strong>自动追踪依赖，数据变了视图自动更新，无需手动触发。 本页展示 Vue
        响应式系统的多个维度。
      </p>
    </a-card>

    <!-- 1. ref vs reactive -->
    <a-card :bordered="false" class="q-mb-lg">
      <template #title>
        <a-tag color="blue">1</a-tag>
        ref vs reactive — 两种响应式基础
      </template>
      <a-row :gutter="24">
        <a-col :span="12">
          <div class="demo-section">
            <div class="demo-label">ref（基本类型推荐）</div>
            <a-input-number v-model:value="countRef" :min="0" class="q-mb-sm" style="width: 100%" />
            <div class="demo-value">
              count = <strong>{{ countRef }}</strong>
            </div>
            <div class="demo-hint">访问需 .value，模板中自动解包</div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="demo-section">
            <div class="demo-label">reactive（对象推荐）</div>
            <a-input v-model:value="userReactive.name" placeholder="姓名" class="q-mb-xs" />
            <a-input-number
              v-model:value="userReactive.age"
              placeholder="年龄"
              style="width: 100%"
            />
            <div class="demo-value">
              user = { name: "{{ userReactive.name }}", age: {{ userReactive.age }} }
            </div>
            <div class="demo-hint">直接访问属性，无需 .value</div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 2. computed 惰性求值 -->
    <a-card :bordered="false" class="q-mb-lg">
      <template #title>
        <a-tag color="purple">2</a-tag>
        computed — 惰性求值 + 缓存
      </template>
      <a-row :gutter="16" align="middle">
        <a-col :span="8">
          <a-input-number
            v-model:value="width"
            placeholder="宽"
            style="width: 100%"
            addon-after="cm"
          />
        </a-col>
        <a-col :span="1" style="text-align: center; font-size: 20px; color: #bbb">×</a-col>
        <a-col :span="8">
          <a-input-number
            v-model:value="height"
            placeholder="高"
            style="width: 100%"
            addon-after="cm"
          />
        </a-col>
        <a-col :span="7">
          <div class="computed-result">
            面积 = <strong>{{ area }}</strong> cm²
          </div>
        </a-col>
      </a-row>
      <div class="demo-hint q-mt-sm">
        computed 只在依赖变化时重新计算，多次访问 area 不会重复执行 getter（缓存机制）
      </div>
    </a-card>

    <!-- 3. watch vs watchEffect -->
    <a-card :bordered="false" class="q-mb-lg">
      <template #title>
        <a-tag color="cyan">3</a-tag>
        watch vs watchEffect — 两种侦听器
      </template>
      <a-row :gutter="16">
        <a-col :span="12">
          <div class="demo-section">
            <div class="demo-label">watch（显式指定依赖）</div>
            <a-slider v-model:value="watchTarget" :min="0" :max="100" />
            <div class="watch-log">
              <div v-for="(log, i) in watchLogs" :key="i" class="log-item">{{ log }}</div>
              <div v-if="watchLogs.length === 0" class="log-empty">拖动滑块触发...</div>
            </div>
            <div class="demo-hint">明确知道"监听谁"，拿到新旧值</div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="demo-section">
            <div class="demo-label">watchEffect（自动收集依赖）</div>
            <a-input v-model:value="effectSource" placeholder="输入内容..." />
            <div class="effect-result">
              <span>自动响应: </span>
              <strong>{{ effectResult }}</strong>
            </div>
            <div class="demo-hint">回调中用到的响应式数据自动被追踪</div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 4. shallowRef + customRef -->
    <a-card :bordered="false" class="q-mb-lg">
      <template #title>
        <a-tag color="orange">4</a-tag>
        shallowRef + customRef — 高级响应式工具
      </template>
      <a-row :gutter="24">
        <a-col :span="12">
          <div class="demo-section">
            <div class="demo-label">shallowRef（浅层响应式）</div>
            <div class="demo-hint q-mb-sm">修改嵌套属性不触发更新，替换整个对象才触发</div>
            <a-button size="small" @click="mutateNested" class="q-mr-xs"
              >修改嵌套属性（无效）</a-button
            >
            <a-button size="small" type="primary" @click="replaceWhole"
              >替换整个对象（有效）</a-button
            >
            <div class="demo-value q-mt-sm">
              shallowObj.nested.count = {{ shallowObj.nested.count }}
            </div>
            <div class="demo-value">更新次数: {{ shallowUpdates }}</div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="demo-section">
            <div class="demo-label">customRef（防抖输入）</div>
            <div class="demo-hint q-mb-sm">输入后 500ms 才提交值，适合搜索框防抖</div>
            <a-input v-model:value="debouncedText" placeholder="快速输入试试..." size="large">
              <template #prefix>
                <LoadingOutlined v-if="isDebouncing" spin />
                <SearchOutlined v-else />
              </template>
            </a-input>
            <div class="demo-value q-mt-sm">提交值: "{{ debouncedText }}"</div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 5. toRef / toRefs -->
    <a-card :bordered="false">
      <template #title>
        <a-tag color="green">5</a-tag>
        toRef / toRefs — 响应式解构
      </template>
      <div class="demo-section">
        <div class="demo-label">从 reactive 对象中安全解构</div>
        <a-row :gutter="16" class="q-mt-sm">
          <a-col :span="8">
            <a-input v-model:value="formState.username" placeholder="用户名" />
          </a-col>
          <a-col :span="8">
            <a-input v-model:value="formState.email" placeholder="邮箱" />
          </a-col>
          <a-col :span="8">
            <a-input v-model:value="formState.phone" placeholder="手机" />
          </a-col>
        </a-row>
        <div class="q-mt-sm">
          <a-tag color="blue">原始: {{ JSON.stringify(formState) }}</a-tag>
        </div>
        <div class="q-mt-xs">
          <a-tag color="green"
            >toRefs 解构: username="{{ usernameRef }}", email="{{ emailRef }}"</a-tag
          >
        </div>
        <div class="demo-hint q-mt-sm">
          直接解构 reactive 会丢失响应式，toRefs 保持每个属性的响应式连接
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  watch,
  watchEffect,
  shallowRef,
  customRef,
  toRef,
  toRefs,
} from 'vue'
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons-vue'

// ── 1. ref vs reactive ──
const countRef = ref(0)
const userReactive = reactive({ name: '张三', age: 28 })

// ── 2. computed ──
const width = ref(10)
const height = ref(5)
const area = computed(() => width.value * height.value)

// ── 3. watch vs watchEffect ──
const watchTarget = ref(50)
const watchLogs = ref([])

watch(watchTarget, (newVal, oldVal) => {
  watchLogs.value.unshift(`[${new Date().toLocaleTimeString()}] ${oldVal} → ${newVal}`)
  if (watchLogs.value.length > 5) watchLogs.value.pop()
})

const effectSource = ref('')
const effectResult = ref('')

watchEffect(() => {
  effectResult.value = effectSource.value.split('').reverse().join('')
})

// ── 4. shallowRef ──
const shallowObj = shallowRef({ nested: { count: 0 } })
const shallowUpdates = ref(0)

function mutateNested() {
  shallowObj.value.nested.count++
  // shallowRef 不会追踪嵌套属性变化
}
function replaceWhole() {
  shallowObj.value = { nested: { count: shallowObj.value.nested.count + 1 } }
  shallowUpdates.value++
}

// ── 4b. customRef (防抖) ──
function useDebouncedRef(initialValue, delay = 500) {
  let timeout
  const isDebouncing = ref(false)

  const debouncedRef = customRef((track, trigger) => {
    let value = initialValue

    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        isDebouncing.value = true
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          value = newValue
          trigger()
          isDebouncing.value = false
        }, delay)
      },
    }
  })

  return { debouncedRef, isDebouncing }
}

const { debouncedRef: debouncedText, isDebouncing } = useDebouncedRef('')

// ── 5. toRef / toRefs ──
const formState = reactive({ username: '', email: '', phone: '' })
const { username: usernameRef, email: emailRef } = toRefs(formState)
</script>

<style scoped>
.reactivity-container {
  max-width: 1000px;
  margin: 0 auto;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
}
.desc-text {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin: 0;
}

.demo-section {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}
.demo-label {
  font-weight: 600;
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;
}
.demo-value {
  font-size: 13px;
  color: #555;
  margin-top: 4px;
  font-family: 'JetBrains Mono', monospace;
}
.demo-hint {
  font-size: 12px;
  color: #999;
}

.computed-result {
  padding: 12px;
  background: linear-gradient(135deg, #f0f5ff, #e6f4ff);
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
  color: #1677ff;
}

/* watch log */
.watch-log {
  background: #1a1a2e;
  border-radius: 6px;
  padding: 8px 12px;
  min-height: 80px;
  margin-top: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}
.log-item {
  color: #52c41a;
  margin-bottom: 2px;
}
.log-empty {
  color: #666;
}

/* effect */
.effect-result {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  font-size: 14px;
}

/* 暗色模式 */
body.body--dark .desc-text {
  color: #aaa;
}
body.body--dark .demo-section {
  background: #2a2a2a;
}
body.body--dark .demo-label {
  color: #ddd;
}
body.body--dark .demo-value {
  color: #bbb;
}
body.body--dark .demo-hint {
  color: #777;
}
body.body--dark .computed-result {
  background: linear-gradient(135deg, #112a45, #0e305a);
}
body.body--dark .log-empty {
  color: #555;
}
body.body--dark .effect-result {
  background: #2a2a2a;
  border-color: #444;
}
</style>
