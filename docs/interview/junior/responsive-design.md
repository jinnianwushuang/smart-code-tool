---
title: '响应式设计与移动端适配 [P4-P5]'
level: 'junior'
tags: ['响应式', '媒体查询', '移动端适配', 'rem', 'vw']
difficulty: 'medium'
updated: '2026-09-10'
target: 'P4-P5 初级工程师'
---

# 响应式设计与移动端适配 [P4-P5]

> 响应式设计让页面在不同屏幕尺寸下都能良好展示。核心工具是媒体查询、弹性布局和相对单位。

## 核心概念（What）

### 视口与基础设置

```html
<!-- 必须添加的 meta 标签 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<!-- 含义：
  width=device-width → 视口宽度 = 设备宽度
  initial-scale=1.0 → 初始不缩放
-->
```

### 媒体查询

```css
/* 移动优先（推荐）：先写小屏样式，再逐步增强 */
.container {
  padding: 16px;
}

/* 平板（≥768px） */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    max-width: 720px;
    margin: 0 auto;
  }
}

/* 桌面（≥1024px） */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}

/* 大屏（≥1280px） */
@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
  }
}

/* 常用断点 */
/* 手机：< 768px */
/* 平板：768px - 1023px */
/* 桌面：1024px - 1279px */
/* 大屏：≥ 1280px */
```

### 相对单位

```css
/* rem：相对于根元素（html）字号 */
html {
  font-size: 16px;
}
h1 {
  font-size: 2rem;
} /* = 32px */
p {
  font-size: 1rem;
} /* = 16px */
.mt-16 {
  margin-top: 1rem;
} /* = 16px */

/* em：相对于父元素字号 */
.parent {
  font-size: 20px;
}
.child {
  font-size: 0.8em;
} /* = 16px（20 × 0.8） */

/* vw/vh：相对于视口 */
.hero {
  height: 100vh;
} /* 全屏高度 */
.banner {
  width: 100vw;
} /* 全屏宽度 */
.title {
  font-size: 5vw;
} /* 字号随视口缩放 */

/* %：相对于父元素 */
.half {
  width: 50%;
} /* 父元素宽度的 50% */
```

### 移动端适配方案

```css
/* 方案 1：rem 适配（传统方案） */
/* JS 动态设置根字号 */
<script>
  document.documentElement.style.fontSize = window.innerWidth / 375 * 16 + 'px';
</script>
/* 设计稿 375px → 1rem = 16px */
/* 元素 100px → 100/375*16 = 4.27rem */

/* 方案 2：vw 适配（现代推荐） */
/* 直接使用 vw，无需 JS */
.title { font-size: 4.27vw; }  /* 设计稿 16px / 375 * 100 */
.box { width: 50vw; height: 30vw; }

/* 方案 3：clamp() 流式排版（最新） */
.title {
  font-size: clamp(16px, 4vw, 32px); /* 最小 16px，理想 4vw，最大 32px */
}
.container {
  width: clamp(320px, 90vw, 1200px);
}
```

---

## 常见面试题

### Q1: 什么是移动优先？

**答**：先编写移动端样式（基础样式），再通过 `min-width` 媒体查询逐步增强大屏样式。好处是移动端加载更少的 CSS，性能更好。

### Q2: rem 和 em 的区别？

**答**：

- `rem`：相对于根元素（html）的字号，全局统一
- `em`：相对于父元素的字号，会层层叠加
- 推荐用 `rem`（可预测），`em` 适合局部缩放

### Q3: 1px 物理像素问题是什么？

**答**：

- 高清屏（如 iPhone）设备像素比（DPR）为 2 或 3
- CSS 的 1px ≠ 物理 1px
- 解决方案：`transform: scaleY(0.5)`、`border-image`、`box-shadow`

---

## 延伸练习

1. 用媒体查询实现一个两栏→单栏的响应式布局
2. 用 `clamp()` 实现流式字号（不用媒体查询）
3. 在 Chrome DevTools 中模拟不同设备查看页面

---

## 参考资料

- [MDN 响应式设计](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [现代响应式设计](https://web.dev/responsive-web-design-basics)
