---
title: 'CSS 新特性：变量、动画、过渡 [P4-P5]'
level: 'junior'
tags: ['CSS 变量', 'transition', 'animation', 'calc']
difficulty: 'medium'
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

## 底层原理（Why）

### CSS 新特性底层机制

```
CSS 现代特性的底层原理：

  1. CSS 变量（Custom Properties）的实现：
     ├── 与预处理器变量的本质区别：
     │   ├── Sass/Less 变量：编译时替换（静态，生成后不可变）
     │   └── CSS 变量：运行时计算（动态，可通过 JS 修改）
     ├── 浏览器解析流程：
     │   ├── 1. 解析 :root { --color: red; }
     │   ├── 2. 将变量存储在元素计算样式中
     │   ├── 3. 使用 var(--color) 时查找变量值
     │   └── 4. 支持继承（子元素可以访问父元素的变量）
     └── 作用域机制：
         ├── 变量在哪个元素定义，就在哪个元素及其子元素可用
         └── 同名变量会覆盖（就近原则）

  2. CSS 动画的渲染原理：
     ├── transition（过渡）：
     │   ├── 触发条件：属性值变化（如 hover）
     │   ├── 浏览器行为：
     │   │   ├── 1. 记录起始值和结束值
     │   │   ├── 2. 根据 duration 和 timing-function 计算中间帧
     │   │   └── 3. 每帧重绘元素（触发 Composite 层）
     │   └── 性能优化：只动画 transform/opacity（不触发 Layout）
     ├── animation（动画）：
     │   ├── @keyframes 定义关键帧
     │   ├── animation 属性控制播放
     │   └── 浏览器按帧率（通常 60fps）插值计算
     └── GPU 加速原理：
         ├── transform/opacity 变化会创建独立合成层
         ├── 合成层由 GPU 处理（不占用主线程）
         └── will-change 提示浏览器提前优化

  3. CSS 选择器的匹配算法：
     ├── 浏览器从右向左匹配（效率更高）
     ├── 示例：div.container > p.active
     │   ├── 1. 先找所有 p.active
     │   ├── 2. 再检查父元素是否是 div.container
     │   └── 3. 不匹配则跳过（减少遍历）
     ├── 选择器优先级计算：
     │   ├── 内联样式：1000
     │   ├── ID 选择器：100
     │   ├── 类/属性/伪类：10
     │   └── 标签/伪元素：1
     └── 层叠规则：
         ├── 优先级高的覆盖低的
         ├── 优先级相同则后定义的覆盖先定义的
         └── !important 最高（但应避免使用）

  4. 现代 CSS 布局的数学计算：
     ├── calc()：动态计算值
     │   └── 支持不同单位混合运算（px + %、vh - rem）
     ├── min()/max()/clamp()：响应式计算
     │   ├── min(100%, 500px)：取较小值
     │   ├── max(50%, 300px)：取较大值
     │   └── clamp(min, preferred, max)：限制在范围内
     └── 底层实现：浏览器在布局阶段实时计算（每次重排都重新求值）
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
