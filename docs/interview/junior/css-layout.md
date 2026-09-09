---
title: 'CSS 布局：Flexbox 与 Grid [P4-P5]'
level: 'junior'
tags: ['CSS', 'Flexbox', 'Grid', '布局']
difficulty: 'medium'
updated: '2026-09-10'
target: 'P4-P5 初级工程师'
---

# CSS 布局：Flexbox 与 Grid [P4-P5]

> Flexbox 和 Grid 是现代 CSS 布局的两大核心工具。Flexbox 擅长一维布局，Grid 擅长二维布局。掌握它们是前端开发的基本技能。

## 核心概念（What）

### Flexbox 核心属性

```css
/* 容器属性 */
.container {
  display: flex;

  /* 主轴方向 */
  flex-direction: row; /* 默认：水平排列 */
  flex-direction: column; /* 垂直排列 */

  /* 主轴对齐 */
  justify-content: flex-start; /* 左对齐 */
  justify-content: center; /* 居中 */
  justify-content: space-between; /* 两端对齐 */
  justify-content: space-around; /* 等间距 */

  /* 交叉轴对齐 */
  align-items: stretch; /* 默认：拉伸填满 */
  align-items: center; /* 居中 */
  align-items: flex-start; /* 顶部对齐 */

  /* 换行 */
  flex-wrap: wrap; /* 允许换行 */

  /* 间距（现代写法） */
  gap: 16px; /* 行列间距 */
}

/* 子项属性 */
.item {
  flex-grow: 1; /* 放大比例（分配剩余空间） */
  flex-shrink: 0; /* 缩小比例（空间不足时） */
  flex-basis: 200px; /* 初始大小 */

  /* 简写 */
  flex: 1; /* 等价于 flex: 1 1 0% */
  flex: 0 0 200px; /* 固定宽度，不放大不缩小 */

  /* 单独对齐 */
  align-self: center; /* 覆盖容器的 align-items */
}
```

### 常见 Flexbox 布局

```css
/* 1. 水平居中 */
.center-x {
  display: flex;
  justify-content: center;
}

/* 2. 垂直居中 */
.center-y {
  display: flex;
  align-items: center;
}

/* 3. 完全居中 */
.center-both {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 4. 圣杯布局 */
.layout {
  display: flex;
  min-height: 100vh;
}
.layout nav {
  width: 200px;
}
.layout main {
  flex: 1;
}
.layout aside {
  width: 200px;
}

/* 5. 等高卡片 */
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.card {
  flex: 1 1 300px; /* 最小 300px，自动放大 */
}
```

### Grid 核心属性

```css
/* 容器属性 */
.grid-container {
  display: grid;

  /* 列定义 */
  grid-template-columns: 200px 1fr 200px; /* 固定 + 弹性 + 固定 */
  grid-template-columns: repeat(3, 1fr); /* 三等分 */
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* 自适应 */

  /* 行定义 */
  grid-template-rows: auto 1fr auto;

  /* 间距 */
  gap: 16px;

  /* 区域命名 */
  grid-template-areas:
    'header header header'
    'nav    main   aside'
    'footer footer footer';
}

/* 子项属性 */
.header {
  grid-area: header;
}
.nav {
  grid-area: nav;
}
.main {
  grid-area: main;
}
.aside {
  grid-area: aside;
}
.footer {
  grid-area: footer;
}
```

### 常见 Grid 布局

```css
/* 1. 响应式卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* 2. 经典页面布局 */
.page {
  display: grid;
  grid-template:
    'header' auto
    'main' 1fr
    'footer' auto
    / 1fr;
  min-height: 100vh;
}

/* 3. 居中单个元素 */
.grid-center {
  display: grid;
  place-items: center; /* 同时居中行列 */
  min-height: 100vh;
}
```

---

## 常见面试题

### Q1: Flexbox 和 Grid 分别适合什么场景？

**答**：

- Flexbox：一维布局（一行或一列），如导航栏、按钮组、卡片内部
- Grid：二维布局（行和列同时控制），如页面整体布局、卡片网格
- 简单规则：一个方向用 Flex，两个方向用 Grid

### Q2: `flex: 1` 是什么意思？

**答**：

- 等价于 `flex: 1 1 0%`
- `flex-grow: 1`：按比例放大占据剩余空间
- `flex-shrink: 1`：空间不足时按比例缩小
- `flex-basis: 0%`：初始大小为 0（所有空间都是"剩余空间"）

### Q3: 如何实现完美居中？

**答**：

- Flexbox：`display: flex; justify-content: center; align-items: center;`
- Grid：`display: grid; place-items: center;`
- 绝对定位 + transform：`position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);`

---

## 延伸练习

1. 用 Flexbox 实现一个导航栏（Logo 左，菜单右）
2. 用 Grid 实现一个 12 列栅格系统
3. 用 Grid `auto-fill` 实现响应式卡片网格

---

## 参考资料

- [Flexbox 完全指南](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Grid 完全指南](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Froggy（游戏练习）](https://flexboxfroggy.com)
