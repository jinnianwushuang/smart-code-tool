<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showButton = ref(false)
const scrollThreshold = 300 // 滚动超过300px时显示按钮

const handleScroll = () => {
  showButton.value = window.scrollY > scrollThreshold
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Transition name="fade">
    <button
      v-if="showButton"
      class="back-to-top"
      @click="scrollToTop"
      aria-label="回到顶部"
      title="回到顶部"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 999;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: var(--vp-c-brand-1);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.back-to-top:hover {
  background-color: var(--vp-c-brand-2);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.back-to-top:active {
  transform: translateY(0);
}

/* 深色模式适配 */
.dark .back-to-top {
  background-color: var(--vp-c-brand-2);
}

.dark .back-to-top:hover {
  background-color: var(--vp-c-brand-1);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .back-to-top {
    right: 16px;
    bottom: 16px;
    width: 40px;
    height: 40px;
  }
}
</style>
