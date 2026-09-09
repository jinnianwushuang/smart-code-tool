---
title: "浏览器渲染机制：重排/重绘/合成 [P5-P6]"
level: "intermediate"
tags: ["浏览器", "渲染", "重排", "重绘", "GPU 加速"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# 浏览器渲染机制：重排/重绘/合成 [P5-P6]

> 理解浏览器渲染流程，才能写出高性能的前端代码。重排（Reflow）和重绘（Repaint）是性能优化的核心。

## 核心概念（What）

### 渲染流水线

```
浏览器渲染流程（5 步）：

1. 解析 HTML → 构建 DOM 树
2. 解析 CSS → 构建 CSSOM 树
3. 合并 DOM + CSSOM → 构建 Render 树（渲染树）
4. Layout（布局/重排）→ 计算元素位置和大小
5. Paint（绘制/重绘）→ 绘制像素
6. Composite（合成）→ 图层合成，显示到屏幕

关键概念：
├── DOM 树 → HTML 解析后的树结构
├── CSSOM 树 → CSS 解析后的样式信息
├── Render 树 → 只包含可见元素（display: none 不包含）
├── 布局 → 几何信息（位置、大小）
├── 绘制 → 视觉信息（颜色、边框、阴影）
└── 合成 → 图层叠加
```

## 底层原理（Why）

### 重排（Reflow / Layout）

```
重排 = 重新计算元素的几何信息（位置、大小）

触发条件：
├── 改变元素尺寸（width、height、padding、margin）
├── 改变元素位置（top、left、position）
├── 改变布局（display、float）
├── 添加/删除元素
├── 改变字体大小（font-size）
├── 读取几何信息（offsetWidth、scrollTop）
├── 窗口大小变化（resize）
└── 页面初始渲染

代价：高
├── 需要重新计算布局
├── 可能影响其他元素
└── 触发后续重绘和合成
```

### 重绘（Repaint）

```
重绘 = 重新绘制像素（外观变化，不影响布局）

触发条件：
├── 改变颜色（color、background）
├── 改变边框（border）
├── 改变阴影（box-shadow）
├── 改变可见性（visibility）
├── 改变轮廓（outline）
└── 改变背景（background）

代价：中
├── 不需要重新计算布局
├── 只需要重新绘制
└── 比重排便宜
```

### 合成（Composite）

```
合成 = 将图层合成为最终画面

触发条件：
├── transform 变化
├── opacity 变化
├── filter 变化
└── 动画（CSS animation/transition）

代价：低
├── 不需要重排或重绘
├── GPU 加速
└── 最便宜的操作
```

### 触发重排的操作

```javascript
// 避免强制同步布局（读写交替）
// ❌ 不好（每次循环都触发重排）
for (let i = 0; i < elements.length; i++) {
  const width = elements[i].offsetWidth; // 读
  elements[i].style.width = width + 10 + 'px'; // 写
}

// ✅ 好（批量读，批量写）
const widths = elements.map(el => el.offsetWidth); // 批量读
elements.forEach((el, i) => {
  el.style.width = widths[i] + 10 + 'px'; // 批量写
});

// 使用 requestAnimationFrame
function updateLayout() {
  elements.forEach((el, i) => {
    el.style.width = widths[i] + 10 + 'px';
  });
}
requestAnimationFrame(updateLayout);

// 使用 DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  fragment.appendChild(div); // 不触发重排
}
container.appendChild(fragment); // 只触发一次重排
```

## 实战应用（How）

### GPU 加速

```css
/* 使用 GPU 加速的属性 */
.gpu-accelerated {
  transform: translate3d(0, 0, 0); /* 创建合成层 */
  will-change: transform; /* 提前告知浏览器 */
}

/* 动画推荐用 transform 和 opacity */
/* ❌ 不好（触发重排） */
@keyframes slide {
  from { left: 0; }
  to { left: 100px; }
}

/* ✅ 好（合成层，GPU 加速） */
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

/* will-change 使用 */
.element {
  will-change: transform, opacity;
}

/* 注意：不要滥用 will-change */
/* 只在动画前设置，动画后移除 */
.element:hover {
  will-change: transform;
}
```

### 性能优化策略

```javascript
// 1. 批量修改 DOM
// ❌ 不好
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// ✅ 好（使用 CSS 类）
element.classList.add('new-style');

// ✅ 好（使用 cssText）
element.style.cssText += 'width: 100px; height: 100px; margin: 10px;';

// 2. 离线操作 DOM
// 克隆节点，修改后替换
const clone = element.cloneNode(true);
clone.style.width = '100px';
element.parentNode.replaceChild(clone, element);

// 3. 使用 requestAnimationFrame
function animate() {
  element.style.transform = `translateX(${position}px)`;
  position += 1;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// 4. 避免布局抖动
// 使用 ResizeObserver 代替轮询
const observer = new ResizeObserver(entries => {
  entries.forEach(entry => {
    console.log('Size changed:', entry.contentRect);
  });
});
observer.observe(element);
```

### 性能检测

```javascript
// Performance API
const start = performance.now();
// ... 执行操作
const end = performance.now();
console.log(`耗时: ${end - start}ms`);

// Layout Shift（布局偏移）
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    console.log('Layout shift:', entry.value);
  }
}).observe({ type: 'layout-shift', buffered: true });

// Long Task（长任务）
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    console.log('Long task detected:', entry.duration);
  }
}).observe({ type: 'longtask', buffered: true });
```

## 高频面试题

### Q1: 重排和重绘的区别？

```
重排（Reflow）：
├── 重新计算几何信息
├── 触发条件：尺寸、位置、布局变化
├── 代价高
└── 一定触发重绘

重绘（Repaint）：
├── 重新绘制像素
├── 触发条件：外观变化（颜色、边框）
├── 代价中等
└── 不一定触发重排

合成（Composite）：
├── 图层合成
├── 触发条件：transform、opacity
├── 代价最低
└── GPU 加速
```

### Q2: 如何避免重排？

```
策略：
├── 批量读写（避免强制同步布局）
├── 使用 DocumentFragment
├── 使用 CSS 类（一次修改）
├── 离线操作 DOM（克隆节点）
├── 使用 transform/opacity（合成层）
├── 使用 will-change（提前告知）
└── 使用 requestAnimationFrame
```

### Q3: 为什么动画推荐用 transform？

```
原因：
├── transform 触发合成层
├── 不需要重排或重绘
├── GPU 加速
└── 性能最好

对比：
├── left/top → 重排（慢）
├── background → 重绘（中）
└── transform → 合成（快）

示例：
/* ❌ 慢 */
animation: slide 1s;
@keyframes slide {
  to { left: 100px; }
}

/* ✅ 快 */
animation: slide 1s;
@keyframes slide {
  to { transform: translateX(100px); }
}
```

## 延伸思考

1. 如何检测页面性能瓶颈？
2. will-change 的副作用？
3. 如何优化长列表渲染？

## 参考资料

- [浏览器渲染流程](https://web.dev/rendering-performance/)
- [GPU 加速](https://web.dev/gpu-accelerated-animation/)
