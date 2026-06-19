# SCSS/Sass 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: CSS 开发者、前端工程师

---

## 📑 目录

- [一、基础语法](#一基础语法)
- [二、变量](#二变量)
- [三、嵌套](#三嵌套)
- [四、混合宏](#四混合宏)
- [五、继承](#五继承)
- [六、函数](#六函数)
- [七、控制指令](#七控制指令)
- [八、模块化](#八模块化)
- [九、内置模块](#九内置模块)
- [十、最佳实践](#十最佳实践)

---

## 一、基础语法

### 1.1 SCSS vs Sass

```scss
// SCSS (推荐) - 使用大括号和分号
.container {
  width: 100%;
}

// Sass - 缩进语法
.container
  width: 100%
```

### 1.2 注释

```scss
// 单行注释（不会输出到 CSS）

/* 
   多行注释
   会输出到 CSS 
*/

/*! 
   重要注释
   即使在压缩模式下也会保留 
*/
```

---

## 二、变量

### 2.1 定义变量

```scss
$primary-color: #3498db;
$font-size-base: 16px;
$spacing-unit: 1rem;
$border-radius: 4px;
```

### 2.2 使用变量

```scss
.button {
  background-color: $primary-color;
  font-size: $font-size-base;
  padding: $spacing-unit;
  border-radius: $border-radius;
}
```

### 2.3 默认值

```scss
$base-font-size: 16px !default;
$base-line-height: 1.5 !default;
```

### 2.4 作用域

```scss
$global-var: value;

.module {
  $local-var: value;

  .element {
    color: $local-var; // 可以使用
  }
}

// $local-var 在这里不可用
```

### 2.5 !global 标志

```scss
.module {
  $var: value !global;
}
```

---

## 三、嵌套

### 3.1 选择器嵌套

```scss
.nav {
  ul {
    margin: 0;
    padding: 0;
  }

  li {
    display: inline-block;
  }

  a {
    text-decoration: none;

    &:hover {
      color: red;
    }
  }
}
```

### 3.2 属性嵌套

```scss
.box {
  border: {
    top: 1px solid #000;
    bottom: 1px solid #000;
  }

  font: {
    size: 16px;
    weight: bold;
    family: Arial, sans-serif;
  }
}
```

### 3.3 & 父选择器

```scss
.button {
  color: blue;

  &:hover {
    color: red;
  }

  &.active {
    color: green;
  }

  &--primary {
    background: blue;
  }

  &__icon {
    margin-right: 5px;
  }

  .parent & {
    color: purple;
  }
}
```

### 3.4 @at-root

```scss
.component {
  @at-root {
    .component-dark {
      background: black;
    }
  }
}
```

---

## 四、混合宏

### 4.1 定义混合宏

```scss
@mixin border-radius($radius) {
  -webkit-border-radius: $radius;
  -moz-border-radius: $radius;
  border-radius: $radius;
}

@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### 4.2 使用混合宏

```scss
.button {
  @include border-radius(5px);
  @include flex-center;
}
```

### 4.3 默认参数

```scss
@mixin button($bg: blue, $color: white, $padding: 10px) {
  background: $bg;
  color: $color;
  padding: $padding;
}

.btn {
  @include button;
  @include button(red);
  @include button(green, black, 15px);
}
```

### 4.4 可变参数

```scss
@mixin box-shadow($shadows...) {
  -webkit-box-shadow: $shadows;
  box-shadow: $shadows;
}

.element {
  @include box-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
  @include box-shadow(0 2px 5px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 0, 0, 0.2));
}
```

### 4.5 内容块

```scss
@mixin media($breakpoint) {
  @if $breakpoint == mobile {
    @media (max-width: 768px) {
      @content;
    }
  } @else if $breakpoint == tablet {
    @media (max-width: 1024px) {
      @content;
    }
  }
}

.responsive {
  @include media(mobile) {
    font-size: 14px;
  }

  @include media(tablet) {
    font-size: 16px;
  }
}
```

### 4.6 关键字参数

```scss
@mixin link($color, $hover-color) {
  color: $color;

  &:hover {
    color: $hover-color;
  }
}

a {
  @include link($hover-color: red, $color: blue);
}
```

---

## 五、继承

### 5.1 @extend

```scss
.message {
  border: 1px solid #ccc;
  padding: 10px;
  color: #333;
}

.success {
  @extend .message;
  border-color: green;
}

.error {
  @extend .message;
  border-color: red;
}
```

### 5.2 占位符选择器

```scss
%message {
  border: 1px solid #ccc;
  padding: 10px;
  color: #333;
}

.success {
  @extend %message;
  border-color: green;
}

.error {
  @extend %message;
  border-color: red;
}
```

### 5.3 链式继承

```scss
%base {
  font-size: 16px;
}

%button {
  @extend %base;
  padding: 10px;
}

.primary-button {
  @extend %button;
  background: blue;
}
```

---

## 六、函数

### 6.1 定义函数

```scss
@function double($value) {
  @return $value * 2;
}

@function strip-unit($value) {
  @return $value / ($value * 0 + 1);
}
```

### 6.2 使用函数

```scss
.element {
  width: double(100px);
  font-size: strip-unit(16px) * 1.5;
}
```

### 6.3 内置函数

```scss
// 颜色函数
lighten(#000, 10%)
darken(#fff, 10%)
saturate(#f00, 20%)
desaturate(#f00, 20%)
adjust-hue(#f00, 30deg)
mix(#f00, #00f, 50%)
opacity(rgba(0, 0, 0, 0.5))
complement(#f00)
invert(#f00)

// 字符串函数
str-length("hello")
str-insert("hello", " world", 5)
str-index("hello", "ll")
str-slice("hello", 1, 3)
to-upper-case("hello")
to-lower-case("HELLO")

// 数字函数
percentage(0.5)
round(10.5)
ceil(10.2)
floor(10.8)
abs(-10)
min(1, 2, 3)
max(1, 2, 3)
random()
random(10)

// 列表函数
length(10px 20px 30px)
nth(10px 20px 30px, 2)
set-nth(10px 20px 30px, 2, 25px)
join((10px 20px), (30px 40px))
append(10px 20px, 30px)
index(10px 20px 30px, 20px)
list-separator(10px 20px)

// Map 函数
map-get((key1: value1, key2: value2), key1)
map-merge((key1: value1), (key2: value2))
map-remove((key1: value1, key2: value2), key1)
map-keys((key1: value1, key2: value2))
map-values((key1: value1, key2: value2))
map-has-key((key1: value1), key1)
```

---

## 七、控制指令

### 7.1 @if

```scss
@mixin theme($theme: light) {
  @if $theme == light {
    background: white;
    color: black;
  } @else if $theme == dark {
    background: black;
    color: white;
  } @else {
    @warn "Unknown theme: #{$theme}";
  }
}
```

### 7.2 @for

```scss
// through (包含结束值)
@for $i from 1 through 5 {
  .item-#{$i} {
    width: 20px * $i;
  }
}

// to (不包含结束值)
@for $i from 1 to 5 {
  .item-#{$i} {
    width: 20px * $i;
  }
}
```

### 7.3 @each

```scss
// 简单列表
@each $color in red, green, blue {
  .text-#{$color} {
    color: $color;
  }
}

// Map
$sizes: (
  small: 12px,
  medium: 16px,
  large: 20px,
);

@each $size, $value in $sizes {
  .text-#{$size} {
    font-size: $value;
  }
}

// 多变量
@each $animal, $color, $cursor in (puma, black, default), (egret, white, pointer) {
  .#{$animal}-icon {
    background-image: url('/images/#{$animal}.png');
    border: 2px solid $color;
    cursor: $cursor;
  }
}
```

### 7.4 @while

```scss
$i: 6;

@while $i > 0 {
  .item-#{$i} {
    width: 2em * $i;
  }
  $i: $i - 2;
}
```

### 7.5 @error, @warn, @debug

```scss
@function divide($a, $b) {
  @if $b == 0 {
    @error "Division by zero.";
  }
  @return $a / $b;
}

@mixin deprecated-mixin {
  @warn "This mixin is deprecated. Use new-mixin instead.";
}

@debug 'Value: #{$value}';
```

---

## 八、模块化

### 8.1 @use (推荐)

```scss
// _colors.scss
$primary: #3498db;
$secondary: #2ecc71;

// main.scss
@use 'colors';

.button {
  background: colors.$primary;
}

// 命名空间
@use 'colors' as c;
.button {
  background: c.$primary;
}

// 默认命名空间
@use 'colors' as *;
.button {
  background: $primary;
}
```

### 8.2 @forward

```scss
// _library.scss
@forward 'colors';
@forward 'typography';

// main.scss
@use 'library';
```

### 8.3 @import (已弃用)

```scss
// 不推荐使用，但向后兼容
@import 'colors';
@import 'typography';
```

### 8.4 部分文件

```scss
// _partial.scss (下划线前缀表示部分文件)

// main.scss
@use 'partial'; // 不需要下划线和扩展名
```

---

## 九、内置模块

### 9.1 sass:math

```scss
@use 'sass:math';

.element {
  width: math.div(100%, 3);
  height: math.pow(2, 3);
  margin: math.sqrt(16) * 1px;
}
```

### 9.2 sass:color

```scss
@use 'sass:color';

.element {
  background: color.adjust(#000, $lightness: 10%);
  color: color.scale(#f00, $lightness: -50%);
  border-color: color.change(#00f, $alpha: 0.5);
}
```

### 9.3 sass:string

```scss
@use 'sass:string';

$result: string.to-upper-case('hello');
$index: string.index('hello', 'll');
$slice: string.slice('hello', 1, 3);
```

### 9.4 sass:list

```scss
@use 'sass:list';

$length: list.length(10px 20px 30px);
$item: list.nth(10px 20px 30px, 2);
$joined: list.join((10px 20px), (30px 40px));
```

### 9.5 sass:map

```scss
@use 'sass:map';

$map: (
  key1: value1,
  key2: value2,
);
$value: map.get($map, key1);
$keys: map.keys($map);
$values: map.values($map);
```

### 9.6 sass:meta

```scss
@use 'sass:meta';

@if meta.type-of($value) == number {
  // ...
}

@if meta.variable-exists(primary-color) {
  // ...
}

@include meta.load-css('colors');
```

### 9.7 sass:selector

```scss
@use 'sass:selector';

@debug selector.append('.parent', '.child'); // ".parent .child"
@debug selector.extend('.a.b', '.a.c'); // ".a.b.c"
```

---

## 十、最佳实践

### 10.1 项目结构

```
styles/
├── abstracts/
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _functions.scss
│   └── _placeholders.scss
├── base/
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _utilities.scss
├── components/
│   ├── _buttons.scss
│   ├── _cards.scss
│   └── _forms.scss
├── layout/
│   ├── _header.scss
│   ├── _footer.scss
│   └── _sidebar.scss
├── pages/
│   ├── _home.scss
│   └── _about.scss
├── themes/
│   ├── _light.scss
│   └── _dark.scss
└── main.scss
```

### 10.2 7-1 Pattern

```scss
// main.scss
@use 'abstracts/variables';
@use 'abstracts/mixins';
@use 'abstracts/functions';

@use 'base/reset';
@use 'base/typography';

@use 'components/buttons';
@use 'components/cards';

@use 'layout/header';
@use 'layout/footer';

@use 'pages/home';

@use 'themes/light';
```

### 10.3 命名规范

```scss
// BEM with SCSS
.block {
  &__element {
    &--modifier {
      // styles
    }
  }
}

// 变量命名
$color-primary: #3498db;
$color-secondary: #2ecc71;
$font-size-base: 16px;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 2rem;
$border-radius-sm: 2px;
$border-radius-md: 4px;
$z-index-dropdown: 1000;
$z-index-modal: 2000;
```

### 10.4 性能优化

```scss
// 避免深层嵌套（不超过3层）
.parent {
  .child {
    .grandchild {
      // 避免再嵌套
    }
  }
}

// 使用占位符而非类继承
%button-base {
  padding: 10px 20px;
}

.btn {
  @extend %button-base;
}

// 合理使用混合宏
@mixin responsive($breakpoint) {
  @if $breakpoint == sm {
    @media (max-width: 576px) {
      @content;
    }
  }
}

.element {
  @include responsive(sm) {
    font-size: 14px;
  }
}
```

### 10.5 主题切换

```scss
// _themes.scss
$themes: (
  light: (
    bg: #ffffff,
    text: #000000,
    primary: #3498db,
  ),
  dark: (
    bg: #1a1a1a,
    text: #ffffff,
    primary: #5dade2,
  ),
);

@mixin theme($theme) {
  @each $name, $colors in $themes {
    [data-theme='#{$name}'] & {
      @content ($colors);
    }
  }
}

.card {
  @include theme($colors) {
    background: map.get($colors, bg);
    color: map.get($colors, text);
    border-color: map.get($colors, primary);
  }
}
```

### 10.6 响应式断点

```scss
// _breakpoints.scss
$breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px,
);

@mixin respond-to($breakpoint) {
  $value: map.get($breakpoints, $breakpoint);

  @if $value {
    @media (min-width: $value) {
      @content;
    }
  } @else {
    @warn "Unknown breakpoint: #{$breakpoint}";
  }
}

// 使用
.container {
  width: 100%;

  @include respond-to(sm) {
    width: 540px;
  }

  @include respond-to(md) {
    width: 720px;
  }

  @include respond-to(lg) {
    width: 960px;
  }
}
```

---

## 附录

### A. 编译工具

- **Dart Sass**: 官方实现（推荐）
- **Node Sass**: 已弃用
- **Ruby Sass**: 已弃用

### B. 构建集成

```javascript
// webpack
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
}

// Vite
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/styles/variables.scss" as *;',
      },
    },
  },
}
```

### C. 有用的资源

- **Sass 官方文档**: https://sass-lang.com/documentation
- **Sass Guidelines**: https://sass-guidelin.es/
- **Sass Meister**: https://www.sassmeister.com/ (在线编译器)

---

**祝您 SCSS 开发愉快！** 💅
