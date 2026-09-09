---
title: 'CSS 新特性：变量、动画、过渡 [P4-P5]'
level: 'junior'
tags: ['CSS 变量', 'transition', 'animation', 'calc']
difficulty: 'medium'
updated: '2026-09-10'
target: 'P4-P5 初级工程师'
---

# CSS 新特性：变量、动画、过渡 [P4-P5]

> CSS 现代特性让样式更灵活：CSS 变量实现主题切换，transition 实现平滑过渡，animation 实现复杂动画。

## 核心概念（What）

### CSS 变量（Custom Properties）

```css
/* 定义变量 */
:root {
  --primary: #3b82f6;
  --text: #1f2937;
  --bg: #ffffff;
  --spacing: 16px;
  --radius: 8px;
}

/* 使用变量 */
.button {
  background: var(--primary);
  color: white;
  padding: var(--spacing);
  border-radius: var(--radius);
}

/* 带默认值 */
.text { color: var(--text-color, #333); }

/* 暗色主题 */
[data-theme="dark"] {
  --primary: #60a5fa;
  --text: #f9fafb;
  --bg: #111827;
}

/* JS 操作变量 */
document.documentElement.style.setProperty('--primary', '#ef4444');
const color = getComputedStyle(document.documentElement).getPropertyValue('--primary');
```

### Transition 过渡

```css
/* 基础过渡 */
.button {
  background: #3b82f6;
  transition: background 0.3s ease;
}
.button:hover {
  background: #2563eb;
}

/* 多属性过渡 */
.card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* 简写 */
/* transition: 属性 时长  timing-function  delay */
.link {
  transition: color 0.2s ease-in-out 0s;
}
```

### Animation 动画

```css
/* 定义关键帧 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 使用动画 */
.element {
  animation: fadeIn 0.5s ease forwards;
  /* animation: 名称 时长 缓函数 延迟 次数 方向 填充 */
}

/* 常用属性 */
.element {
  animation-name: fadeIn;
  animation-duration: 0.5s;
  animation-timing-function: ease;
  animation-delay: 0.1s;
  animation-iteration-count: 1; /* 或 infinite */
  animation-direction: normal; /* 或 alternate */
  animation-fill-mode: forwards; /* 保持最后一帧 */
}

/* 旋转加载动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.spinner {
  animation: spin 1s linear infinite;
}

/* 脉冲效果 */
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
.pulse {
  animation: pulse 2s ease infinite;
}
```

### calc() 计算

```css
/* 混合单位计算 */
.sidebar {
  width: calc(100% - 200px);
}
.content {
  width: calc(100vw - 250px);
}

/* 嵌套 calc */
.item {
  width: calc(100% / 3 - calc(20px * 2 / 3));
}

/* 配合变量 */
.box {
  --gap: 16px;
  width: calc(100% - var(--gap) * 2);
}
```

---

## 常见面试题

### Q1: CSS 变量和 Sass 变量有什么区别？

**答**：

- CSS 变量：运行时生效，可被 JS 修改，支持响应式
- Sass 变量：编译时替换，不能动态改变
- CSS 变量可以继承、可以在媒体查询中改变

### Q2: transition 和 animation 的区别？

**答**：

- `transition`：需要触发条件（hover/focus/class 变化），只有起止两帧
- `animation`：独立运行，支持多关键帧，可循环播放
- 简单交互用 transition，复杂动画用 animation

### Q3: `animation-fill-mode: forwards` 是什么？

**答**：动画结束后保持最后一帧的样式。默认动画结束后会回到初始状态。

---

## 延伸练习

1. 用 CSS 变量实现亮色/暗色主题切换
2. 用 transition 实现按钮 hover 效果
3. 用 @keyframes 实现一个加载旋转动画

---

## 参考资料

- [CSS 变量](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS 动画指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_animations/Using_CSS_animations)
