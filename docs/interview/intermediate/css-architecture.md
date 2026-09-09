---
title: "CSS 架构：BEM/CSS Modules/Tailwind [P5-P6]"
level: "intermediate"
tags: ["CSS", "BEM", "CSS Modules", "Tailwind", "架构"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# CSS 架构：BEM/CSS Modules/Tailwind [P5-P6]

> CSS 架构解决样式命名、作用域和可维护性问题。BEM 是命名规范，CSS Modules 是作用域方案，Tailwind 是原子化 CSS。

## 核心概念（What）

### CSS 架构问题

```
CSS 痛点：
├── 全局作用域 → 样式冲突
├── 命名混乱 → 难以维护
├── 样式冗余 → 难以删除
└── 优先级混乱 → 难以覆盖

解决方案：
├── BEM → 命名规范（约定）
├── CSS Modules → 作用域（编译时）
├── CSS-in-JS → 作用域（运行时）
└── Tailwind → 原子化（工具类）
```

## 底层原理（Why）

### BEM 命名规范

```
BEM = Block（块）+ Element（元素）+ Modifier（修饰符）

格式：
.block__element--modifier

示例：
.button              → Block（按钮）
.button__icon        → Element（按钮的图标）
.button--primary     → Modifier（主要按钮）
.button--large       → Modifier（大按钮）

HTML：
<button class="button button--primary">
  <span class="button__icon">🎉</span>
  <span class="button__text">提交</span>
</button>

CSS：
.button {
  padding: 8px 16px;
  border-radius: 4px;
}

.button--primary {
  background: #3b82f6;
  color: white;
}

.button__icon {
  margin-right: 8px;
}

优点：
├── 命名清晰（看名字知结构）
├── 避免冲突（前缀唯一）
└── 易于维护

缺点：
├── 类名过长
├── 全局作用域（仍会冲突）
└── 需要团队约定
```

### CSS Modules

```
CSS Modules = 编译时生成唯一类名

使用：
// Button.module.css
.button {
  padding: 8px 16px;
}

.primary {
  background: #3b82f6;
}

// Button.jsx
import styles from './Button.module.css';

function Button() {
  return (
    <button className={`${styles.button} ${styles.primary}`}>
      提交
    </button>
  );
}

编译后：
.button_abc123 {
  padding: 8px 16px;
}

.primary_def456 {
  background: #3b82f6;
}

优点：
├── 自动作用域（不会冲突）
├── 类名简洁
└── 支持 CSS 所有特性

缺点：
├── 需要构建工具
├── 动态类名麻烦
└── 调试类名不直观

框架支持：
├── React → 原生支持
├── Vue → <style module>
└── Vite → 自动支持 .module.css
```

### Tailwind CSS

```
Tailwind = 原子化 CSS（工具类）

传统 CSS：
.card {
  padding: 16px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

Tailwind：
<div class="p-4 rounded-lg bg-white shadow-md">
  卡片内容
</div>

常用类：
├── 间距：p-4（padding: 16px）、m-2（margin: 8px）
├── 布局：flex、grid、items-center
├── 尺寸：w-64（width: 256px）、h-32
├── 颜色：text-gray-900、bg-blue-500
├── 圆角：rounded-lg、rounded-full
├── 阴影：shadow-md、shadow-lg
└── 响应：md:flex、lg:w-1/2

优点：
├── 快速开发（不用写 CSS）
├── 样式复用（组合类名）
├── 文件小（只打包用到的）
└── 设计系统（统一规范）

缺点：
├── HTML 中类名过长
├── 学习成本（记住类名）
└── 复杂样式麻烦（用 @apply）

配置：
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{vue,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6'
      }
    }
  }
}
```

## 实战应用（How）

### 方案对比

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│              │    BEM       │ CSS Modules  │   Tailwind   │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ 作用域       │ 无（约定）   │ 自动         │ 无           │
│ 学习成本     │ 低           │ 中           │ 中           │
│ 开发速度     │ 慢           │ 中           │ 快           │
│ 维护性       │ 中           │ 高           │ 高           │
│ 文件体积     │ 大           │ 中           │ 小           │
│ 适用场景     │ 传统项目     │ 组件化项目   │ 快速开发     │
└──────────────┴──────────────┴──────────────┴──────────────┘

推荐：
├── 新项目 → Tailwind
├── 组件库 → CSS Modules
└── 老项目 → BEM
```

### 组合使用

```vue
<!-- Vue + Tailwind + CSS Modules -->
<template>
  <div :class="[$style.card, 'p-4', 'rounded-lg']">
    <h2 class="text-xl font-bold mb-2">{{ title }}</h2>
    <p class="text-gray-600">{{ content }}</p>
  </div>
</template>

<style module>
.card {
  @apply bg-white shadow-md;
}
</style>
```

## 高频面试题

### Q1: BEM 的优缺点？

```
优点：
├── 命名清晰（看名字知结构）
├── 避免冲突（前缀唯一）
└── 易于维护

缺点：
├── 类名过长
├── 全局作用域（仍会冲突）
└── 需要团队约定
```

### Q2: CSS Modules 的原理？

```
原理：
├── 编译时将类名转为唯一值
├── 生成映射关系
└── 通过 import 获取类名

示例：
.button → .button_abc123

优点：
├── 自动作用域
├── 不会冲突
└── 支持 CSS 所有特性

缺点：
├── 需要构建工具
├── 动态类名麻烦
└── 调试不直观
```

### Q3: Tailwind 的优缺点？

```
优点：
├── 快速开发（不用写 CSS）
├── 样式复用（组合类名）
├── 文件小（只打包用到的）
└── 设计系统（统一规范）

缺点：
├── HTML 中类名过长
├── 学习成本（记住类名）
└── 复杂样式麻烦

适用：
├── 快速原型
├── 中小型项目
└── 设计系统
```

## 延伸思考

1. 如何选择 CSS 架构方案？
2. CSS-in-JS（styled-components）的优缺点？
3. 如何在团队中推广 CSS 规范？

## 参考资料

- [BEM 官方文档](https://en.bem.info/)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [Tailwind CSS](https://tailwindcss.com/)
