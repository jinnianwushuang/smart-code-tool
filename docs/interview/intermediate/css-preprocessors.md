---
title: 'CSS 预处理器：Sass/Less/PostCSS [P5-P6]'
level: 'intermediate'
tags: ['CSS', '预处理器', 'Sass', 'Less', 'PostCSS']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P5-P6 中级工程师'
---

# CSS 预处理器：Sass/Less/PostCSS [P5-P6]

> CSS 预处理器扩展了 CSS 的能力，提供变量、嵌套、混合等特性。Sass 最流行，Less 更简单，PostCSS 是插件平台。

## 核心概念（What）

### 预处理器是什么

```
CSS 预处理器 = 扩展 CSS 语法的工具

CSS 限制：
├── 没有变量
├── 没有嵌套
├── 没有混合（mixin）
├── 没有函数
└── 难以维护

预处理器提供：
├── 变量（Variables）
├── 嵌套（Nesting）
├── 混合（Mixins）
├── 函数（Functions）
├── 继承（Extend）
└── 导入（Import）

工作流程：
├── 编写 .scss / .less 文件
├── 预处理器编译
└── 生成标准 .css 文件
```

## 底层原理（Why）

### Sass/SCSS

```scss
// 变量
$primary: #3b82f6;
$spacing: 16px;
$border-radius: 8px;

.button {
  background: $primary;
  padding: $spacing;
  border-radius: $border-radius;
}

// 嵌套
.nav {
  background: white;

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    display: inline-block;
  }

  a {
    color: $primary;

    &:hover {
      color: darken($primary, 10%);
    }
  }
}

// 混合（Mixin）
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  @include flex-center;
}

// 带参数的混合
@mixin responsive($breakpoint) {
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

.container {
  @include responsive(mobile) {
    padding: 16px;
  }
}

// 继承
%button-base {
  padding: 8px 16px;
  border-radius: 4px;
}

.button-primary {
  @extend %button-base;
  background: #3b82f6;
}

// 函数
@function calculate-width($columns, $container-width) {
  @return ($columns / 12) * $container-width;
}

.sidebar {
  width: calculate-width(3, 1200px); // 300px
}

// 运算
$base-size: 16px;

.text {
  font-size: $base-size * 1.5; // 24px
  margin: $base-size / 2; // 8px
}
```

### Less

```less
// 变量
@primary: #3b82f6;
@spacing: 16px;

.button {
  background: @primary;
  padding: @spacing;
}

// 嵌套
.nav {
  background: white;

  ul {
    margin: 0;
  }

  a {
    color: @primary;

    &:hover {
      color: darken(@primary, 10%);
    }
  }
}

// 混合（Mixin）
.flex-center() {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  .flex-center();
}

// 带参数的混合
.border-radius(@radius: 8px) {
  border-radius: @radius;
}

.button {
  .border-radius(4px);
}

// 运算
@base-size: 16px;

.text {
  font-size: @base-size * 1.5;
  margin: @base-size / 2;
}
```

### PostCSS

```javascript
// PostCSS = CSS 工具平台（插件化）

// 常用插件：
// 1. Autoprefixer（自动添加浏览器前缀）
// 输入：
display: flex;

// 输出：
display: -webkit-box;
display: -ms-flexbox;
display: flex;

// 2. postcss-preset-env（使用未来 CSS 特性）
// 输入：
:root {
  --primary: #3b82f6;
}

.button {
  color: var(--primary);
}

// 3. cssnano（压缩 CSS）
// 4. postcss-import（内联 @import）
// 5. postcss-nested（嵌套语法）

// 配置：postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-preset-env'),
    require('cssnano')
  ]
}
```

## 实战应用（How）

### Sass vs Less 对比

```
┌──────────────┬──────────────┬──────────────┐
│              │    Sass      │    Less      │
├──────────────┼──────────────┼──────────────┤
│ 语法         │ SCSS（类 CSS）│ 类 CSS       │
│ 变量符号     │ $            │ @            │
│ 嵌套         │ ✓            │ ✓            │
│ 混合         │ @mixin       │ .mixin()     │
│ 继承         │ @extend      │ ✗            │
│ 条件语句     │ @if/@else    │ when         │
│ 循环         │ @each/@for   │ ✗            │
│ 函数         │ 自定义函数   │ 自定义函数   │
│ 生态         │ Bootstrap    │ Ant Design   │
│ 学习曲线     │ 陡峭         │ 平缓         │
└──────────────┴──────────────┴──────────────┘

推荐：
├── 复杂项目 → Sass（功能强大）
├── 简单项目 → Less（易上手）
└── 现代项目 → PostCSS + 插件
```

### 项目中使用

```bash
# 安装 Sass
npm install -D sass

# Vite 自动支持
# 直接 import .scss 文件

# 目录结构
src/
├── styles/
│   ├── _variables.scss    # 变量（下划线开头）
│   ├── _mixins.scss       # 混合
│   ├── _reset.scss        # 重置样式
│   └── main.scss          # 入口文件
├── components/
│   └── Button/
│       ├── Button.vue
│       └── Button.scss
```

```scss
// _variables.scss
$primary: #3b82f6;
$spacing: 16px;

// _mixins.scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// main.scss
@import 'variables';
@import 'mixins';
@import 'reset';
```

### 最佳实践

```scss
// 1. 使用变量管理设计系统
$colors: (
  primary: #3b82f6,
  secondary: #64748b,
  success: #10b981,
  danger: #ef4444,
);

@each $name, $color in $colors {
  .text-#{$name} {
    color: $color;
  }
  .bg-#{$name} {
    background: $color;
  }
}

// 2. 响应式混合
$breakpoints: (
  mobile: 768px,
  tablet: 1024px,
  desktop: 1280px,
);

@mixin responsive($size) {
  $value: map-get($breakpoints, $size);
  @media (max-width: $value) {
    @content;
  }
}

.container {
  max-width: 1200px;

  @include responsive(tablet) {
    max-width: 100%;
    padding: 0 16px;
  }
}

// 3. BEM + 嵌套
.block {
  &__element {
    // ...
  }

  &--modifier {
    // ...
  }
}
```

## 高频面试题

### Q1: Sass 和 Less 的区别？

```
Sass：
├── 功能强大（条件、循环、继承）
├── 语法更严格
├── 生态：Bootstrap
└── 适合复杂项目

Less：
├── 简单易学
├── 语法接近 CSS
├── 生态：Ant Design
└── 适合简单项目
```

### Q2: PostCSS 是什么？

```
PostCSS = CSS 工具平台

特点：
├── 插件化架构
├── 本身不转换 CSS
├── 通过插件实现功能
└── 可以组合多个插件

常用插件：
├── Autoprefixer → 自动前缀
├── postcss-preset-env → 未来 CSS
├── cssnano → 压缩
└── postcss-nested → 嵌套

优势：
├── 灵活（按需选择插件）
├── 轻量（只处理需要的）
└── 现代化（使用新特性）
```

### Q3: 如何选择预处理器？

```
选择建议：
├── 复杂项目 → Sass
├── 简单项目 → Less
├── 现代项目 → PostCSS
└── 团队熟悉 → 跟随团队

趋势：
├── Sass 仍最流行
├── PostCSS 越来越重要
└── Tailwind 崛起（替代方案）
```

## 延伸思考

1. 如何设计 CSS 变量系统？
2. PostCSS 插件如何开发？
3. 预处理器 vs CSS-in-JS？

## 参考资料

- [Sass 官方文档](https://sass-lang.com/)
- [Less 官方文档](https://lesscss.org/)
- [PostCSS 官方文档](https://postcss.org/)
