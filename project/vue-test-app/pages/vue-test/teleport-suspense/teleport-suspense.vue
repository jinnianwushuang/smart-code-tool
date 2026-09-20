<template>
  <div class="ts-container">
    <!-- ─── 概念说明 ─── -->
    <a-card :bordered="false" class="q-mb-lg">
      <template #title>
        <span class="card-title">Teleport + Suspense — Vue 3 渲染控制双利器</span>
      </template>
      <p class="desc-text">
        Vue 3 提供了两个独特的渲染控制原语：
        <strong>Teleport</strong> 让组件在逻辑上属于当前组件，但 DOM 渲染到页面任意位置；
        <strong>Suspense</strong> 让异步组件的加载状态声明式管理，无需手写任何 loading 变量。
      </p>
      <a-row :gutter="16" class="q-mt-md">
        <a-col :span="12">
          <div class="concept-box concept-teleport">
            <div class="concept-icon">🚀</div>
            <div>
              <div class="concept-title">Teleport</div>
              <div class="concept-desc">逻辑在此，DOM 在彼——解耦组件归属与渲染位置</div>
            </div>
          </div>
        </a-col>
        <a-col :span="12">
          <div class="concept-box concept-suspense">
            <div class="concept-icon">⏳</div>
            <div>
              <div class="concept-title">Suspense</div>
              <div class="concept-desc">异步组件自动 fallback——无需手写 loading 状态</div>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- ─── Demo 1: Teleport 弹窗到 body ─── -->
    <a-card :bordered="false" class="q-mb-lg">
      <template #title>
        <a-tag color="blue">Demo 1</a-tag>
        Teleport — 弹窗渲染到 body
      </template>
      <p class="demo-desc">
        弹窗在逻辑上属于此页面，但通过 <code>&lt;Teleport to="body"&gt;</code> 将 DOM 挂载到
        <code>&lt;body&gt;</code> 下，彻底规避父容器 <code>overflow: hidden</code> 和
        <code>z-index</code> 层叠上下文的干扰。
      </p>
      <div class="demo-action-row">
        <a-button type="primary" @click="showModal = true">🚀 打开 Teleport 弹窗</a-button>
        <div class="dom-path">
          <span class="dom-node">body</span>
          <span class="dom-sep">›</span>
          <span class="dom-node dom-node--active">.ts-modal-overlay</span>
          <span class="dom-sep">›</span>
          <span class="dom-node">.ts-modal-box</span>
        </div>
      </div>
      <div class="demo-hint q-mt-sm">
        打开 DevTools → Elements，验证弹窗 DOM 节点直接在
        <code>&lt;body&gt;</code> 下，而非嵌套在页面组件中
      </div>
    </a-card>

    <!-- ─── Demo 2: Teleport 通知到自定义容器 ─── -->
    <a-card :bordered="false" class="q-mb-lg">
      <template #title>
        <a-tag color="purple">Demo 2</a-tag>
        Teleport — 通知渲染到指定容器
      </template>
      <p class="demo-desc">
        通知在此处声明，但通过 <code>&lt;Teleport to="#notification-zone"&gt;</code>
        渲染到右侧容器中，实现「声明位置」与「渲染位置」完全分离。
      </p>
      <a-row :gutter="16">
        <a-col :span="9">
          <div class="demo-section">
            <div class="demo-label">控制区（通知在此声明）</div>
            <a-space direction="vertical" style="width: 100%">
              <a-button block @click="pushNotification('success', '✅ 操作成功完成！')">
                成功通知
              </a-button>
              <a-button block @click="pushNotification('warning', '⚠️ 注意：磁盘空间不足')">
                警告通知
              </a-button>
              <a-button block @click="pushNotification('error', '❌ 请求失败，请重试')">
                错误通知
              </a-button>
              <a-button block danger :disabled="!notifications.length" @click="notifications = []">
                清空全部
              </a-button>
            </a-space>
          </div>
        </a-col>
        <a-col :span="15">
          <div class="demo-section">
            <div class="demo-label">
              通知区域
              <a-tag size="small" color="orange" class="q-ml-xs">DOM 渲染目标</a-tag>
            </div>
            <div class="notification-zone-wrapper">
              <div v-if="!notifications.length" class="notification-empty">
                点击上方按钮发送通知...
              </div>
              <div id="notification-zone" class="notification-zone">
                <Teleport to="#notification-zone">
                  <TransitionGroup name="notif">
                    <div
                      v-for="n in notifications"
                      :key="n.id"
                      :class="['notification-item', `notif-${n.type}`]"
                    >
                      <span>{{ n.message }}</span>
                      <span class="notification-close" @click="removeNotification(n.id)">×</span>
                    </div>
                  </TransitionGroup>
                </Teleport>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- ─── Demo 3: Suspense 异步组件 ─── -->
    <a-card :bordered="false" class="q-mb-lg">
      <template #title>
        <a-tag color="green">Demo 3</a-tag>
        Suspense — 异步组件自动 fallback
      </template>
      <template #extra>
        <a-button size="small" @click="reloadAsync">🔄 重新加载</a-button>
      </template>
      <p class="demo-desc">
        <code>AsyncUserProfile</code> 的 <code>&lt;script setup&gt;</code> 中有顶层
        <code>await</code>（模拟接口请求 2s），Suspense 自动展示 fallback
        骨架屏，加载完成后无缝切换， <strong>无需任何 loading 变量</strong>。
      </p>
      <Suspense :key="suspenseKey">
        <template #default>
          <AsyncUserProfile />
        </template>
        <template #fallback>
          <div class="fallback-wrapper">
            <a-skeleton avatar :paragraph="{ rows: 3 }" active />
            <div class="fallback-hint">
              ⏳ Suspense fallback — 组件正在 await 加载数据（约 2s）...
            </div>
          </div>
        </template>
      </Suspense>
    </a-card>

    <!-- ─── Vue vs React 对比 ─── -->
    <a-card :bordered="false">
      <template #title>
        <span class="card-title">与 React 的对应关系</span>
      </template>
      <div class="compare-list">
        <div class="compare-row">
          <div class="compare-label">跨 DOM 渲染</div>
          <div class="compare-cell compare-vue">
            <a-tag color="green" size="small">Vue</a-tag>
            <code>&lt;Teleport to="body"&gt;</code>
          </div>
          <div class="compare-cell compare-react">
            <a-tag color="blue" size="small">React</a-tag>
            <code>createPortal(el, domNode)</code>
          </div>
          <div class="compare-diff">功能等价，Vue 模板语法更简洁</div>
        </div>
        <div class="compare-row">
          <div class="compare-label">异步组件加载</div>
          <div class="compare-cell compare-vue">
            <a-tag color="green" size="small">Vue</a-tag>
            <code>&lt;Suspense&gt; + async setup()</code>
          </div>
          <div class="compare-cell compare-react">
            <a-tag color="blue" size="small">React</a-tag>
            <code>&lt;Suspense&gt; + React.lazy()</code>
          </div>
          <div class="compare-diff">Vue 支持 setup 内直接 await，React 需外部数据源配合</div>
        </div>
        <div class="compare-row">
          <div class="compare-label">加载状态管理</div>
          <div class="compare-cell compare-vue">
            <a-tag color="green" size="small">Vue</a-tag>
            <span>自动 fallback，无需 loading 变量</span>
          </div>
          <div class="compare-cell compare-react">
            <a-tag color="blue" size="small">React</a-tag>
            <span>需 useEffect + loading state 或 React Query</span>
          </div>
          <div class="compare-diff">Vue 声明式；React 需要额外状态管理</div>
        </div>
      </div>
    </a-card>

    <!-- ─── Teleport 弹窗（挂载到 body） ─── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="ts-modal-overlay" @click.self="showModal = false">
          <div class="ts-modal-box">
            <div class="ts-modal-header">
              <span>🚀 Teleport 弹窗</span>
              <span class="ts-modal-close" @click="showModal = false">×</span>
            </div>
            <div class="ts-modal-body">
              <p>此弹窗通过 <code>&lt;Teleport to="body"&gt;</code> 渲染。</p>
              <p>
                它在逻辑上属于 <code>teleport-suspense.vue</code>，但 DOM 节点直接挂载在
                <code>&lt;body&gt;</code> 下，不受任何父容器的 overflow / z-index 影响。
              </p>
              <div class="ts-dom-path">
                <span class="ts-dom-node">body</span>
                <span class="ts-dom-sep">›</span>
                <span class="ts-dom-node ts-dom-node--active">.ts-modal-overlay</span>
                <span class="ts-dom-sep">›</span>
                <span class="ts-dom-node">.ts-modal-box</span>
              </div>
            </div>
            <div class="ts-modal-footer">
              <a-button @click="showModal = false">关闭</a-button>
              <a-button type="primary" @click="showModal = false">确定</a-button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AsyncUserProfile from './components/AsyncUserProfile.vue'

// ── Demo 1: Teleport 弹窗 ──
const showModal = ref(false)

// ── Demo 2: Teleport 通知 ──
const notifications = ref([])
let notifId = 0

function pushNotification(type, message) {
  const id = ++notifId
  notifications.value.push({ id, type, message })
  // 4s 后自动消失
  setTimeout(() => removeNotification(id), 4000)
}

function removeNotification(id) {
  notifications.value = notifications.value.filter((n) => n.id !== id)
}

// ── Demo 3: Suspense 重载 ──
const suspenseKey = ref(0)

function reloadAsync() {
  suspenseKey.value++
}
</script>

<!-- 组件内 scoped 样式 -->
<style scoped>
.ts-container {
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
.demo-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.7;
  margin: 0 0 14px;
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
.demo-action-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.demo-hint {
  font-size: 12px;
  color: #999;
}

/* ── 概念卡片 ── */
.concept-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
}
.concept-teleport {
  background: linear-gradient(135deg, #f0f5ff, #e6f4ff);
  border: 1px solid #91caff;
}
.concept-suspense {
  background: linear-gradient(135deg, #fffbe6, #fff7cc);
  border: 1px solid #ffd666;
}
.concept-icon {
  font-size: 28px;
  flex-shrink: 0;
  margin-top: 1px;
}
.concept-title {
  font-weight: 700;
  font-size: 15px;
  color: #222;
  margin-bottom: 4px;
}
.concept-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

/* ── DOM 路径指示器 ── */
.dom-path {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
}
.dom-node {
  padding: 2px 8px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  color: #555;
}
.dom-node--active {
  background: #e6f4ff;
  border-color: #91caff;
  color: #1677ff;
  font-weight: 600;
}
.dom-sep {
  color: #ccc;
}

/* ── 通知区域 ── */
.notification-zone-wrapper {
  position: relative;
  min-height: 140px;
}
.notification-zone {
  min-height: 140px;
  background: #fff;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 8px;
}
.notification-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-size: 13px;
  pointer-events: none;
  z-index: 0;
}
.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 13px;
}
.notif-success {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #389e0d;
}
.notif-warning {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  color: #d48806;
}
.notif-error {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #cf1322;
}
.notification-close {
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  opacity: 0.5;
  margin-left: 8px;
  flex-shrink: 0;
}
.notification-close:hover {
  opacity: 1;
}

/* 通知过渡动画 */
.notif-enter-active,
.notif-leave-active {
  transition: all 0.3s ease;
}
.notif-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}
.notif-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

/* ── Suspense fallback ── */
.fallback-wrapper {
  padding: 16px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px dashed #faad14;
}
.fallback-hint {
  font-size: 12px;
  color: #faad14;
  margin-top: 12px;
  text-align: center;
}

/* ── 对比表格 ── */
.compare-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.compare-row {
  display: grid;
  grid-template-columns: 110px 1fr 1fr 1fr;
  gap: 10px;
  align-items: center;
}
.compare-label {
  font-weight: 600;
  font-size: 13px;
  color: #333;
}
.compare-cell {
  font-size: 12px;
  padding: 8px 10px;
  border-radius: 6px;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.compare-vue {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}
.compare-react {
  background: #e6f4ff;
  border: 1px solid #91caff;
}
.compare-diff {
  font-size: 12px;
  color: #888;
  line-height: 1.5;
}

/* ── 暗色模式 ── */
body.body--dark .desc-text,
body.body--dark .demo-desc {
  color: #aaa;
}
body.body--dark .demo-section {
  background: #2a2a2a;
}
body.body--dark .demo-label {
  color: #ddd;
}
body.body--dark .demo-hint {
  color: #666;
}
body.body--dark .concept-teleport {
  background: linear-gradient(135deg, #0d1f3c, #0e305a);
  border-color: #1d4ed8;
}
body.body--dark .concept-suspense {
  background: linear-gradient(135deg, #2d1f00, #3d2b00);
  border-color: #a16207;
}
body.body--dark .concept-title {
  color: #eee;
}
body.body--dark .concept-desc {
  color: #aaa;
}
body.body--dark .dom-node {
  background: #2a2a2a;
  border-color: #444;
  color: #aaa;
}
body.body--dark .dom-node--active {
  background: #0d1f3c;
  border-color: #1d4ed8;
  color: #60a5fa;
}
body.body--dark .notification-zone {
  background: #1a1a1a;
  border-color: #444;
}
body.body--dark .notification-empty {
  color: #555;
}
body.body--dark .notif-success {
  background: #0d2b0d;
  border-color: #166534;
  color: #4ade80;
}
body.body--dark .notif-warning {
  background: #2d1f00;
  border-color: #92400e;
  color: #fbbf24;
}
body.body--dark .notif-error {
  background: #2d0a0a;
  border-color: #991b1b;
  color: #f87171;
}
body.body--dark .fallback-wrapper {
  background: #2a2a2a;
  border-color: #a16207;
}
body.body--dark .compare-label {
  color: #ddd;
}
body.body--dark .compare-vue {
  background: #0d2b0d;
  border-color: #166534;
}
body.body--dark .compare-react {
  background: #0d1f3c;
  border-color: #1d4ed8;
}
body.body--dark .compare-diff {
  color: #777;
}
</style>

<!-- 全局样式（Teleport 到 body 的弹窗无 scoped 属性，需单独声明） -->
<style>
.ts-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.ts-modal-box {
  background: #fff;
  border-radius: 14px;
  width: 480px;
  max-width: 90vw;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}
.ts-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 16px;
  font-weight: 600;
  color: #222;
}
.ts-modal-close {
  cursor: pointer;
  font-size: 22px;
  color: #999;
  line-height: 1;
  transition: color 0.2s;
}
.ts-modal-close:hover {
  color: #333;
}
.ts-modal-body {
  padding: 20px;
  font-size: 14px;
  line-height: 1.8;
  color: #555;
}
.ts-modal-body p {
  margin: 0 0 10px;
}
.ts-modal-body code {
  background: #f5f5f5;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 12px;
  color: #1677ff;
}
.ts-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
}
.ts-dom-path {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  background: #f9f9f9;
  border-radius: 8px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  margin-top: 4px;
}
.ts-dom-node {
  padding: 2px 8px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  color: #555;
}
.ts-dom-node--active {
  background: #e6f4ff;
  border-color: #91caff;
  color: #1677ff;
  font-weight: 600;
}
.ts-dom-sep {
  color: #ccc;
}

/* 弹窗过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-active .ts-modal-box,
.modal-fade-leave-active .ts-modal-box {
  transition: transform 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .ts-modal-box,
.modal-fade-leave-to .ts-modal-box {
  transform: scale(0.92) translateY(-16px);
}

/* 弹窗暗色模式 */
body.body--dark .ts-modal-box {
  background: #1e1e1e;
}
body.body--dark .ts-modal-header {
  border-color: #333;
  color: #eee;
}
body.body--dark .ts-modal-close {
  color: #666;
}
body.body--dark .ts-modal-close:hover {
  color: #ddd;
}
body.body--dark .ts-modal-body {
  color: #aaa;
}
body.body--dark .ts-modal-body code {
  background: #2a2a2a;
  color: #60a5fa;
}
body.body--dark .ts-modal-footer {
  border-color: #333;
}
body.body--dark .ts-dom-path {
  background: #2a2a2a;
}
body.body--dark .ts-dom-node {
  background: #1a1a1a;
  border-color: #444;
  color: #aaa;
}
body.body--dark .ts-dom-node--active {
  background: #0d1f3c;
  border-color: #1d4ed8;
  color: #60a5fa;
}
</style>
