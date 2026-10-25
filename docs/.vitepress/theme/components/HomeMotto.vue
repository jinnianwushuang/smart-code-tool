<template>
  <section class="home-motto">
    <div class="motto-card">
      <span class="quote-glyph" aria-hidden="true">❝</span>

      <p class="motto-headline">不花时间去创造想要的生活，将被迫花很多时间应付不想要的生活。</p>

      <span class="motto-divider" aria-hidden="true"></span>

      <p class="motto-line">学习是唯一的出路，最低成本的出路。</p>
      <p class="motto-line">焦虑的反义词不是自信，是具体——把「学不完」变成「还剩多少页」。</p>
    </div>
  </section>
</template>

<script setup>
// 首页格言卡片：纯展示组件，无逻辑。
// 复用 VitePress 的 --vp-c-* 设计变量，自动适配日间/夜间主题。
</script>

<style scoped>
.home-motto {
  display: flex;
  justify-content: center;
  padding: 1.5rem 1.5rem 3rem;
}

.motto-card {
  position: relative;
  max-width: 640px;
  width: 100%;
  padding: 2.5rem 2.25rem 2.25rem;
  text-align: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background:
    radial-gradient(120% 120% at 50% 0%, var(--vp-c-brand-soft) 0%, transparent 60%),
    var(--vp-c-bg-soft);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: motto-fade-in 0.6s ease both;
}

/* 顶部品牌渐变细条 */
.motto-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--vp-c-brand-1),
    var(--vp-c-brand-2),
    transparent
  );
}

.quote-glyph {
  display: block;
  font-size: 2.5rem;
  line-height: 1;
  color: var(--vp-c-brand-1);
  opacity: 0.5;
  margin-bottom: 0.5rem;
}

.motto-headline {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.7;
  letter-spacing: 0.01em;
  background: linear-gradient(
    120deg,
    var(--vp-c-brand-2) 0%,
    var(--vp-c-brand-1) 55%,
    var(--vp-c-brand-light, var(--vp-c-brand-1)) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.motto-divider {
  display: block;
  width: 48px;
  height: 2px;
  margin: 1.5rem auto;
  border-radius: 2px;
  background: var(--vp-c-brand-soft);
}

.motto-line {
  margin: 0.35rem 0;
  font-size: 1rem;
  line-height: 1.9;
  color: var(--vp-c-text-2);
}

@keyframes motto-fade-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 夜间模式：柔化阴影、提亮渐变 */
.dark .motto-card {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.dark .quote-glyph {
  opacity: 0.65;
}

/* 尊重「减少动态效果」偏好 */
@media (prefers-reduced-motion: reduce) {
  .motto-card {
    animation: none;
  }
}

@media (max-width: 640px) {
  .home-motto {
    padding: 1rem 1rem 2rem;
  }

  .motto-card {
    padding: 2rem 1.25rem 1.75rem;
    border-radius: 12px;
  }

  .motto-headline {
    font-size: 1.15rem;
  }

  .motto-line {
    font-size: 0.95rem;
  }
}
</style>
