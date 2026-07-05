# CSS3 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: 前端开发者、UI 设计师

---

## 📑 目录

- [一、选择器](#一选择器)
- [二、盒模型](#二盒模型)
- [三、布局](#三布局)
- [四、Flexbox](#四flexbox)
- [五、Grid](#五grid)
- [六、定位](#六定位)
- [七、文本样式](#七文本样式)
- [八、背景和边框](#八背景和边框)
- [九、变换和过渡](#九变换和过渡)
- [十、动画](#十动画)
- [十一、响应式设计](#十一响应式设计)
- [十二、变量和函数](#十二变量和函数)
- [十三、最佳实践](#十三最佳实践)

---

## 一、选择器

### 1.1 基本选择器

```css
/* 元素选择器 */
div {
}

/* 类选择器 */
.class {
}

/* ID 选择器 */
#id {
}

/* 通配符 */
* {
}

/* 群组选择器 */
h1,
h2,
h3 {
}
```

### 1.2 组合选择器

```css
/* 后代选择器 */
div p {
}

/* 子元素选择器 */
div > p {
}

/* 相邻兄弟选择器 */
h1 + p {
}

/* 通用兄弟选择器 */
h1 ~ p {
}
```

### 1.3 属性选择器

```css
/* 存在属性 */
[title] {
}
/* 精确匹配属性值 */
[type='text'] {
}
/* 包含完整单词（空格分隔） */
[class~='btn'] {
}
/* 以指定值开头 */
[href^='https'] {
}
/* 以指定值结尾 */
[href$='.pdf'] {
}
/* 包含指定子字符串 */
[href*='example'] {
}
/* 语言属性 */
[lang|='en'] {
}
```

### 1.4 伪类

```css
/* 状态伪类 */
a:hover {
}
a:active {
}
a:focus {
}
a:visited {
}
input:checked {
}
input:disabled {
}
input:enabled {
}

/* 结构伪类 */
:first-child {
}
:last-child {
}
:nth-child(2n) {
}
:nth-of-type(odd) {
}
:only-child {
}
:empty {
}

/* UI 伪类 */
:required {
}
:optional {
}
:valid {
}
:invalid {
}
:in-range {
}
:out-of-range {
}
```

### 1.5 伪元素

```css
::before {
  content: '';
}
::after {
  content: '';
}
::first-line {
}
::first-letter {
}
::selection {
}
::placeholder {
}
```

---

## 二、盒模型

### 2.1 标准盒模型

```css
.box {
  width: 200px;
  height: 100px;
  padding: 10px;
  border: 1px solid #000;
  margin: 20px;
}

/* 总宽度 = width + padding + border + margin */
```

### 2.2 IE 盒模型

```css
.box {
  box-sizing: border-box;
  width: 200px;
  /* 总宽度 = width (包含 padding 和 border) */
}
```

### 2.3 边距合并

```css
/* 垂直外边距会合并，取较大值 */
.margin-collapse {
  margin-top: 20px;
  margin-bottom: 30px;
}
```

---

## 三、布局

### 3.1 Display

```css
display: block; /* 块级元素 */
display: inline; /* 行内元素 */
display: inline-block; /* 行内块元素 */
display: none; /* 隐藏 */
display: flex; /* Flexbox */
display: grid; /* Grid */
```

### 3.2 Float

```css
.float-left {
  float: left;
}

.float-right {
  float: right;
}

/* 清除浮动 */
.clearfix::after {
  content: '';
  display: table;
  clear: both;
}
```

---

## 四、Flexbox

### 4.1 容器属性

```css
.container {
  display: flex;

  /* 主轴方向 */
  flex-direction: row | row-reverse | column | column-reverse;

  /* 换行 */
  flex-wrap: nowrap | wrap | wrap-reverse;

  /* 简写 */
  flex-flow: row wrap;

  /* 主轴对齐 */
  justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;

  /* 交叉轴对齐 */
  align-items: stretch | flex-start | flex-end | center | baseline;

  /* 多行对齐 */
  align-content: flex-start | flex-end | center | space-between | space-around | stretch;

  /* 间距 */
  gap: 10px;
  row-gap: 10px;
  column-gap: 20px;
}
```

### 4.2 项目属性

```css
.item {
  /* 放大比例 */
  flex-grow: 0;

  /* 缩小比例 */
  flex-shrink: 1;

  /* 基础大小 */
  flex-basis: auto;

  /* 简写 */
  flex: 0 1 auto;

  /* 单独对齐 */
  align-self: auto | flex-start | flex-end | center | baseline | stretch;

  /* 顺序 */
  order: 0;
}
```

---

## 五、Grid

### 5.1 容器属性

```css
.container {
  display: grid;

  /* 行列定义 */
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 50px 50px;

  /* 简写 */
  grid-template: repeat(3, 100px) / repeat(2, 50px);

  /* 间距 */
  gap: 10px;
  row-gap: 10px;
  column-gap: 20px;

  /* 对齐 */
  justify-items: start | end | center | stretch;
  align-items: start | end | center | stretch;
  place-items: center;

  justify-content: start | end | center | stretch | space-around | space-between | space-evenly;
  align-content: start | end | center | stretch | space-around | space-between | space-evenly;
  place-content: center;
}
```

### 5.2 项目属性

```css
.item {
  /* 位置 */
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;

  /* 简写 */
  grid-column: 1 / 3;
  grid-row: 1 / 2;
  grid-area: 1 / 1 / 2 / 3;

  /* 对齐 */
  justify-self: start | end | center | stretch;
  align-self: start | end | center | stretch;
  place-self: center;
}
```

### 5.3 模板区域

```css
.container {
  grid-template-areas:
    'header header header'
    'sidebar main main'
    'footer footer footer';
}

.header {
  grid-area: header;
}
.sidebar {
  grid-area: sidebar;
}
.main {
  grid-area: main;
}
.footer {
  grid-area: footer;
}
```

---

## 六、定位

### 6.1 Position

```css
position: static; /* 默认 */
position: relative; /* 相对定位 */
position: absolute; /* 绝对定位 */
position: fixed; /* 固定定位 */
position: sticky; /* 粘性定位 */

/* 偏移 */
top: 10px;
right: 10px;
bottom: 10px;
left: 10px;

/* 层级 */
z-index: 1;
```

---

## 七、文本样式

### 7.1 字体

```css
font-family: Arial, sans-serif;
font-size: 16px;
font-weight: normal | bold | 400 | 700;
font-style: normal | italic | oblique;
font-variant: normal | small-caps;
line-height: 1.5;

/* 简写 */
font:
  italic bold 16px/1.5 Arial,
  sans-serif;
```

### 7.2 文本

```css
color: #333;
text-align: left | center | right | justify;
text-decoration: none | underline | overline | line-through;
text-transform: none | uppercase | lowercase | capitalize;
letter-spacing: 2px;
word-spacing: 5px;
text-indent: 2em;
white-space: normal | nowrap | pre | pre-wrap | pre-line;
word-break: normal | break-all | keep-all;
overflow-wrap: normal | break-word;
```

### 7.3 省略号

```css
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 多行省略 */
.multi-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 八、背景和边框

### 8.1 背景

```css
background-color: #fff;
background-image: url('image.jpg');
background-repeat: no-repeat | repeat-x | repeat-y | repeat;
background-position: center | top left | 50% 50%;
background-size: cover | contain | 100px 100px;
background-attachment: scroll | fixed | local;

/* 简写 */
background: #fff url('image.jpg') no-repeat center/cover;

/* 渐变 */
background: linear-gradient(to right, red, blue);
background: radial-gradient(circle, red, blue);
```

### 8.2 边框

```css
border-width: 1px;
border-style: solid | dashed | dotted | double | groove | ridge | inset | outset;
border-color: #000;

/* 简写 */
border: 1px solid #000;

/* 单边 */
border-top: 1px solid #000;
border-right: 1px solid #000;
border-bottom: 1px solid #000;
border-left: 1px solid #000;

/* 圆角 */
border-radius: 5px;
border-radius: 50%; /* 圆形 */
border-radius: 10px 20px 30px 40px; /* 左上 右上 右下 左下 */
```

### 8.3 阴影

```css
/* 盒阴影 */
box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.3); /* 内阴影 */
box-shadow:
  0 0 10px red,
  0 0 20px blue; /* 多层阴影 */

/* 文本阴影 */
text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
```

---

## 九、变换和过渡

### 9.1 Transform

```css
transform: translate(50px, 100px);
transform: translateX(50px);
transform: translateY(100px);

transform: rotate(45deg);
transform: rotateX(45deg);
transform: rotateY(45deg);
transform: rotateZ(45deg);

transform: scale(2);
transform: scaleX(2);
transform: scaleY(0.5);

transform: skew(30deg, 20deg);
transform: skewX(30deg);
transform: skewY(20deg);

transform: matrix(1, 0, 0, 1, 50, 100);

/* 变换原点 */
transform-origin: center | top left | 50% 50%;

/* 3D */
transform: perspective(1000px) rotateY(45deg);
transform-style: preserve-3d;
```

### 9.2 Transition

```css
transition-property: all | width | height | color;
transition-duration: 0.3s;
transition-timing-function: ease | linear | ease-in | ease-out | ease-in-out |
  cubic-bezier(0.1, 0.7, 1, 0.1);
transition-delay: 0s;

/* 简写 */
transition: all 0.3s ease 0s;
transition:
  width 0.3s,
  height 0.3s;
```

---

## 十、动画

### 10.1 Keyframes

```css
@keyframes slide {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100px);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-50px);
  }
}
```

### 10.2 Animation

```css
animation-name: slide;
animation-duration: 1s;
animation-timing-function: ease;
animation-delay: 0s;
animation-iteration-count: infinite | 1 | 2;
animation-direction: normal | reverse | alternate | alternate-reverse;
animation-fill-mode: none | forwards | backwards | both;
animation-play-state: running | paused;

/* 简写 */
animation: slide 1s ease 0s infinite alternate;
```

---

## 十一、响应式设计

### 11.1 Media Queries

```css
/* 断点 */
@media (max-width: 768px) {
  /* 平板 */
}

@media (max-width: 480px) {
  /* 手机 */
}

@media (min-width: 1200px) {
  /* 桌面 */
}

/* 方向 */
@media (orientation: portrait) {
}
@media (orientation: landscape) {
}

/* 分辨率 */
@media (min-resolution: 2dppx) {
}
@media (-webkit-min-device-pixel-ratio: 2) {
}

/* 打印 */
@media print {
  .no-print {
    display: none;
  }
}
```

### 11.2 视口单位

```css
width: 100vw; /* 视口宽度 */
height: 100vh; /* 视口高度 */
width: 50vmin; /* 较小的视口尺寸 */
width: 50vmax; /* 较大的视口尺寸 */
```

### 11.3 响应式图片

```css
img {
  max-width: 100%;
  height: auto;
}

/* srcset */
<img
  src="small.jpg"
  srcset="medium.jpg 768w, large.jpg 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

---

## 十二、变量和函数

### 12.1 CSS Variables

```css
:root {
  --primary-color: #3498db;
  --font-size: 16px;
  --spacing: 1rem;
}

.element {
  color: var(--primary-color);
  font-size: var(--font-size);
  padding: var(--spacing);

  /* 默认值 */
  margin: var(--margin, 10px);
}
```

### 12.2 Calc

```css
width: calc(100% - 20px);
height: calc(50vh - 2rem);
font-size: calc(1rem + 1vw);
```

### 12.3 其他函数

```css
/* 颜色函数 */
color: rgb(255, 0, 0);
color: rgba(255, 0, 0, 0.5);
color: hsl(0, 100%, 50%);
color: hsla(0, 100%, 50%, 0.5);

/* 滤镜 */
filter: blur(5px);
filter: brightness(1.5);
filter: contrast(200%);
filter: grayscale(100%);
filter: hue-rotate(90deg);
filter: invert(100%);
filter: opacity(50%);
filter: saturate(200%);
filter: sepia(100%);

/* 混合模式 */
mix-blend-mode: multiply | screen | overlay | darken | lighten;
background-blend-mode: multiply | screen | overlay;
```

---

## 十三、最佳实践

### 13.1 重置样式

```css
/* Normalize.css 或现代重置 */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  line-height: 1.5;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}
```

### 13.2 BEM 命名

```css
/* Block Element Modifier */
.block {
}
.block__element {
}
.block--modifier {
}
.block__element--modifier {
}

/* 示例 */
.card {
}
.card__title {
}
.card__image {
}
.card--featured {
}
.card__button--primary {
}
```

### 13.3 性能优化

```css
/* 避免昂贵选择器 */
/* ❌ 不好 */
div div div .class {
}

/* ✅ 好 */
.class {
}

/* 使用 will-change */
.animated {
  will-change: transform, opacity;
}

/* 硬件加速 */
.gpu-accelerated {
  transform: translateZ(0);
}

/* 减少重绘重排 */
.batch-updates {
  transform: translateX(100px);
  opacity: 0;
}
```

### 13.4 可访问性

```css
/* 焦点样式 */
:focus {
  outline: 2px solid #000;
  outline-offset: 2px;
}

/* 跳过链接 */
.skip-link {
  position: absolute;
  left: -9999px;
}

.skip-link:focus {
  left: 0;
}

/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* 高对比度 */
@media (prefers-contrast: high) {
  /* 增强对比度 */
}
```

---

## 附录

### A. 常用框架

- **Tailwind CSS**: 实用优先
- **Bootstrap**: 组件库
- **Bulma**: Flexbox 框架
- **Foundation**: 响应式框架

### B. 预处理器的

- **Sass/SCSS**
- **Less**
- **Stylus**

### C. 有用的资源

- **MDN CSS**: https://developer.mozilla.org/en-US/docs/Web/CSS
- **CSS-Tricks**: https://css-tricks.com/
- **Can I Use**: https://caniuse.com/
- **CSS Grid Generator**: https://cssgrid-generator.netlify.app/

---

**祝您 CSS 开发愉快！** 🎨
