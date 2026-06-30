# Tailwind CSS 日常开发使用参考手册

> **版本**: 1.0  
> **最后更新**: 2026-06-19  
> **适用对象**: 前端开发人员、UI 设计师

---

## 目录

1. [快速开始](#1-快速开始)
2. [核心概念](#2-核心概念)
3. [布局系统](#3-布局系统)
4. [Flexbox 和 Grid](#4-flexbox-和-grid)
5. [间距系统](#5-间距系统)
6. [尺寸控制](#6-尺寸控制)
7. [排版样式](#7-排版样式)
8. [背景与边框](#8-背景与边框)
9. [效果与变换](#9-效果与变换)
10. [交互状态](#10-交互状态)
11. [响应式设计](#11-响应式设计)
12. [暗黑模式](#12-暗黑模式)
13. [自定义配置](#13-自定义配置)
14. [组件开发](#14-组件开发)
15. [实用技巧](#15-实用技巧)
16. [性能优化](#16-性能优化)
17. [常见问题](#17-常见问题)
18. [速查表](#18-速查表)

---

## 1. 快速开始

### 1.1 安装 Tailwind CSS

#### 使用 npm（推荐）

```bash
# 初始化项目
npm init -y

# 安装 Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# 生成配置文件
npx tailwindcss init -p
```

#### 配置文件

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### CSS 入口文件

```css
/* src/input.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 构建命令

```bash
# 开发环境（带监听）
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch

# 生产环境（压缩）
npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify
```

### 1.2 框架集成

#### React + Vite

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```jsx
// src/App.jsx
function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-blue-600">
        Hello Tailwind!
      </h1>
    </div>
  )
}

export default App
```

#### Vue 3 + Vite

```bash
npm create vite@latest my-app -- --template vue
cd my-app
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```vue
<!-- src/App.vue -->
<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <h1 class="text-3xl font-bold text-blue-600">
      Hello Tailwind!
    </h1>
  </div>
</template>
```

### 1.3 CDN 方式（仅用于原型开发）

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <h1 class="text-3xl font-bold underline">Hello world!</h1>
</body>
</html>
```

> ⚠️ **注意**: CDN 方式不适合生产环境。

---

## 2. 核心概念

### 2.1 Utility-First 理念

Tailwind CSS 采用实用优先的设计理念，直接使用工具类而非自定义 CSS。

```html
<!-- Tailwind CSS -->
<div class="p-4 rounded-lg shadow-md">
  <h2 class="text-2xl font-bold text-gray-900">Title</h2>
</div>
```

### 2.2 类名命名规则

```
{property}-{modifier}-{value}

示例：
- text-center         → text-align: center
- bg-blue-500         → background-color: #3b82f6
- p-4                 → padding: 1rem
- md:text-lg          → @media (min-width: 768px)
- hover:bg-red-500    → &:hover
```

### 2.3 颜色系统

Tailwind 提供完整的调色板：gray, red, orange, yellow, green, blue, indigo, purple, pink 等。

每个颜色有 11 个色阶：-50, -100, -200, -300, -400, -500, -600, -700, -800, -900, -950

```html
<div class="bg-blue-500 text-white">Blue Background</div>
<div class="border-red-500">Red Border</div>
```

### 2.4 间距比例

基于 0.25rem (4px) 的比例系统：0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96

```html
<div class="p-4">Padding 1rem (16px)</div>
<div class="m-2">Margin 0.5rem (8px)</div>
<div class="gap-6">Gap 1.5rem (24px)</div>
```

---

## 3. 布局系统

### 3.1 Display

```html
<div class="block">Block</div>
<div class="inline-block">Inline Block</div>
<div class="flex">Flex</div>
<div class="grid">Grid</div>
<div class="hidden">Hidden</div>
```

### 3.2 Position

```html
<div class="static">Static</div>
<div class="fixed top-0 right-0">Fixed</div>
<div class="relative">
  <div class="absolute top-0 left-0">Absolute</div>
</div>
<div class="sticky top-0">Sticky</div>
```

### 3.3 Z-Index

```html
<div class="z-0">Level 0</div>
<div class="z-10">Level 10</div>
<div class="z-50">Level 50</div>
```

### 3.4 Overflow

```html
<div class="overflow-hidden">Hidden</div>
<div class="overflow-auto">Auto</div>
<div class="overflow-x-auto">X axis auto</div>
```

---

## 4. Flexbox 和 Grid

### 4.1 Flexbox 基础

```html
<!-- Flex Container -->
<div class="flex flex-row">Row</div>
<div class="flex flex-col">Column</div>
<div class="flex flex-wrap">Wrap</div>

<!-- Alignment -->
<div class="flex justify-center">Center</div>
<div class="flex justify-between">Space Between</div>
<div class="flex items-center">Items Center</div>
```

### 4.2 Flex Item Properties

```html
<div class="flex">
  <div class="flex-grow">Grows</div>
  <div class="flex-shrink-0">Doesn't shrink</div>
  <div class="flex-1">Flex 1</div>
</div>
```

### 4.3 Grid 基础

```html
<!-- Grid Columns -->
<div class="grid grid-cols-1">1 column</div>
<div class="grid grid-cols-2">2 columns</div>
<div class="grid grid-cols-3">3 columns</div>
<div class="grid grid-cols-4">4 columns</div>

<!-- Custom -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">Auto-fit</div>
```

### 4.4 Grid Placement

```html
<div class="grid grid-cols-3 gap-4">
  <div class="col-span-2">Spans 2 columns</div>
  <div class="row-span-2">Spans 2 rows</div>
</div>
```

### 4.5 Gap

```html
<div class="flex gap-4">Gap 1rem</div>
<div class="grid gap-6">Grid gap 1.5rem</div>
<div class="gap-x-4 gap-y-2">X: 1rem, Y: 0.5rem</div>
```

---

## 5. 间距系统

### 5.1 Padding

```html
<div class="p-4">Uniform padding</div>
<div class="px-4 py-2">Horizontal and vertical</div>
<div class="pt-4 pr-2 pb-3 pl-1">Individual sides</div>
```

### 5.2 Margin

```html
<div class="m-4">Uniform margin</div>
<div class="mx-auto">Center horizontally</div>
<div class="mt-4 mb-2">Top and bottom</div>
<div class="-mt-4">Negative margin</div>
```

### 5.3 Space Between

```html
<div class="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<div class="flex space-x-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

---

## 6. 尺寸控制

### 6.1 Width

```html
<!-- Fixed -->
<div class="w-64">16rem</div>

<!-- Percentage -->
<div class="w-1/2">50%</div>
<div class="w-full">100%</div>

<!-- Viewport -->
<div class="w-screen">100vw</div>

<!-- Auto -->
<div class="w-auto">Auto</div>
<div class="w-fit">Fit content</div>
```

### 6.2 Max Width

```html
<div class="max-w-xs">20rem</div>
<div class="max-w-sm">24rem</div>
<div class="max-w-md">28rem</div>
<div class="max-w-lg">32rem</div>
<div class="max-w-xl">36rem</div>
<div class="max-w-2xl">42rem</div>
<div class="max-w-7xl">80rem</div>
```

### 6.3 Height

```html
<div class="h-64">16rem</div>
<div class="h-full">100%</div>
<div class="h-screen">100vh</div>
<div class="h-auto">Auto</div>
```

---

## 7. 排版样式

### 7.1 Font Size

```html
<div class="text-xs">Extra small</div>
<div class="text-sm">Small</div>
<div class="text-base">Base</div>
<div class="text-lg">Large</div>
<div class="text-xl">Extra large</div>
<div class="text-2xl">2XL</div>
<div class="text-4xl">4XL</div>
<div class="text-6xl">6XL</div>
```

### 7.2 Font Weight

```html
<div class="font-light">Light (300)</div>
<div class="font-normal">Normal (400)</div>
<div class="font-medium">Medium (500)</div>
<div class="font-semibold">Semibold (600)</div>
<div class="font-bold">Bold (700)</div>
```

### 7.3 Text Alignment

```html
<div class="text-left">Left</div>
<div class="text-center">Center</div>
<div class="text-right">Right</div>
<div class="text-justify">Justify</div>
```

### 7.4 Text Decoration

```html
<div class="underline">Underline</div>
<div class="line-through">Line through</div>
<div class="no-underline">No decoration</div>
```

### 7.5 Text Transform

```html
<div class="uppercase">UPPERCASE</div>
<div class="lowercase">lowercase</div>
<div class="capitalize">Capitalize</div>
```

### 7.6 Line Height

```html
<div class="leading-tight">1.25</div>
<div class="leading-normal">1.5</div>
<div class="leading-relaxed">1.625</div>
<div class="leading-loose">2</div>
```

### 7.7 Letter Spacing

```html
<div class="tracking-tight">Tight</div>
<div class="tracking-normal">Normal</div>
<div class="tracking-wide">Wide</div>
```

---

## 8. 背景与边框

### 8.1 Background Color

```html
<div class="bg-white">White</div>
<div class="bg-black">Black</div>
<div class="bg-blue-500">Blue</div>
<div class="bg-transparent">Transparent</div>
```

### 8.2 Gradient Backgrounds

```html
<div class="bg-gradient-to-r from-blue-500 to-purple-500">
  Horizontal gradient
</div>
<div class="bg-gradient-to-b from-red-500 to-yellow-500">
  Vertical gradient
</div>
```

### 8.3 Border Radius

```html
<div class="rounded">Default (0.25rem)</div>
<div class="rounded-lg">Large (0.5rem)</div>
<div class="rounded-xl">Extra large (0.75rem)</div>
<div class="rounded-full">Full circle</div>
```

### 8.4 Border Width & Color

```html
<div class="border border-gray-300">1px border</div>
<div class="border-2 border-blue-500">2px blue border</div>
<div class="border-t">Top border only</div>
```

### 8.5 Box Shadow

```html
<div class="shadow-sm">Small shadow</div>
<div class="shadow">Default shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
<div class="shadow-none">No shadow</div>
```

---

## 9. 效果与变换

### 9.1 Opacity

```html
<div class="opacity-0">0%</div>
<div class="opacity-50">50%</div>
<div class="opacity-100">100%</div>
```

### 9.2 Transform

```html
<!-- Scale -->
<div class="scale-50">Scale 50%</div>
<div class="scale-100">Scale 100%</div>
<div class="scale-150">Scale 150%</div>

<!-- Rotate -->
<div class="rotate-45">45°</div>
<div class="rotate-90">90°</div>
<div class="rotate-180">180°</div>

<!-- Translate -->
<div class="translate-x-4">X: 1rem</div>
<div class="translate-y-4">Y: 1rem</div>
```

### 9.3 Transition & Animation

```html
<!-- Transition -->
<div class="transition duration-300 ease-in-out">Transition</div>

<!-- Animation -->
<div class="animate-spin">Spin</div>
<div class="animate-pulse">Pulse</div>
<div class="animate-bounce">Bounce</div>
```

### 9.4 Filter

```html
<div class="blur-md">Blur</div>
<div class="brightness-150">Brightness 150%</div>
<div class="grayscale">Grayscale</div>
<div class="sepia">Sepia</div>
```

---

## 10. 交互状态

### 10.1 Hover, Focus, Active

```html
<button class="bg-blue-500 hover:bg-blue-700 focus:ring-2 active:bg-blue-800">
  Interactive button
</button>
```

### 10.2 Group Hover

```html
<div class="group">
  <div class="text-gray-500 group-hover:text-blue-500">
    Child changes on parent hover
  </div>
</div>
```

### 10.3 Form States

```html
<input class="focus:border-blue-500 focus:ring-2" />
<button class="disabled:bg-gray-300 disabled:cursor-not-allowed">Disabled</button>
<input class="valid:border-green-500 invalid:border-red-500" pattern="[0-9]+" />
```

---

## 11. 响应式设计

### 11.1 断点系统

```
sm: 640px   → @media (min-width: 640px)
md: 768px   → @media (min-width: 768px)
lg: 1024px  → @media (min-width: 1024px)
xl: 1280px  → @media (min-width: 1280px)
2xl: 1536px → @media (min-width: 1536px)
```

### 11.2 移动优先

```html
<div class="
  w-full           <!-- Mobile -->
  sm:w-1/2         <!-- Small -->
  md:w-1/3         <!-- Medium -->
  lg:w-1/4         <!-- Large -->
">
  Responsive width
</div>

<h1 class="
  text-xl          <!-- Mobile -->
  md:text-2xl      <!-- Medium -->
  lg:text-3xl      <!-- Large -->
">
  Responsive heading
</h1>
```

### 11.3 隐藏/显示

```html
<!-- Hide on mobile, show on larger screens -->
<div class="hidden md:block">Desktop only</div>

<!-- Show on mobile, hide on larger screens -->
<div class="block md:hidden">Mobile only</div>
```

---

## 12. 暗黑模式

### 12.1 启用暗黑模式

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
}
```

### 12.2 使用暗黑模式

```html
<div class="bg-white dark:bg-gray-900">
  <p class="text-gray-900 dark:text-white">
    Adaptive text
  </p>
</div>
```

### 12.3 JavaScript 切换

```javascript
// Toggle dark mode
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark')
}

// Check system preference
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark')
}
```

---

## 13. 自定义配置

### 13.1 扩展主题

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
}
```

### 13.2 第三方插件

```bash
npm install -D @tailwindcss/forms @tailwindcss/typography
```

```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

```html
<!-- Forms plugin -->
<input class="form-input" />

<!-- Typography plugin -->
<article class="prose prose-lg">
  <h1>Heading</h1>
  <p>Content</p>
</article>
```

---

## 14. 组件开发

### 14.1 @layer 指令

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn {
    @apply px-4 py-2 rounded-md font-semibold transition-colors;
  }
  
  .btn-primary {
    @apply bg-blue-500 text-white hover:bg-blue-600;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
  
  .input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md 
           focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}
```

### 14.2 按钮组件

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>

<!-- With icon -->
<button class="btn btn-primary inline-flex items-center gap-2">
  <svg class="w-5 h-5">...</svg>
  Download
</button>
```

### 14.3 卡片组件

```html
<div class="card">
  <div class="border-b pb-4 mb-4">
    <h3 class="text-lg font-semibold">Card Title</h3>
  </div>
  <p class="text-gray-600">Content...</p>
</div>
```

### 14.4 表单组件

```html
<!-- Input -->
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <input type="email" class="input" placeholder="you@example.com" />
</div>

<!-- Checkbox -->
<div class="flex items-center">
  <input type="checkbox" class="form-checkbox h-4 w-4 text-blue-600" />
  <label class="ml-2 text-sm">I agree</label>
</div>
```

---

## 15. 实用技巧

### 15.1 任意值

```html
<!-- Arbitrary values -->
<div class="w-[100px]">Custom width</div>
<div class="bg-[#123456]">Custom color</div>
<div class="top-[100px]">Custom position</div>
<div class="grid-cols-[1fr_2fr_1fr]">Custom grid</div>
```

### 15.2 重要标志

```html
<div class="!text-red-500">Important</div>
```

### 15.3 状态变体

```html
<div class="hover:bg-blue-500 focus:ring-2 active:scale-95">
  Multiple states
</div>
```

### 15.4 组合变体

```html
<div class="md:hover:bg-blue-500 dark:focus:ring-blue-300">
  Combined variants
</div>
```

### 15.5 伪元素

```html
<div class="before:content-['•'] before:mr-2">
  Before pseudo-element
</div>
<div class="after:content-['*'] after:text-red-500">
  After pseudo-element
</div>
```

---

## 16. 性能优化

### 16.1 PurgeCSS 配置

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx,vue}",
  ],
  // Only purge in production
}
```

### 16.2 减少类名重复

```html
<!-- Bad: Repetitive -->
<div class="p-4 p-4 p-4">Content</div>

<!-- Good: Use component classes -->
<div class="card-content">Content</div>
```

### 16.3 使用 @apply

```css
.btn {
  @apply px-4 py-2 rounded-md font-semibold;
}
```

### 16.4 代码分割

```javascript
// Dynamic imports for better performance
const Component = lazy(() => import('./Component'))
```

---

## 17. 常见问题

### 17.1 类名不生效

**问题**: 添加的类名没有效果

**解决**:
1. 检查 `content` 配置是否包含文件路径
2. 重启开发服务器
3. 清除浏览器缓存

### 17.2 样式冲突

**问题**: Tailwind 样式与其他 CSS 冲突

**解决**:
```javascript
// tailwind.config.js
module.exports = {
  corePlugins: {
    preflight: false, // Disable base styles if needed
  },
}
```

### 17.3 文件大小过大

**问题**: 生成的 CSS 文件太大

**解决**:
1. 确保正确配置 `content`
2. 使用生产构建（自动 PurgeCSS）
3. 启用压缩

### 17.4 IntelliSense 不工作

**解决**:
1. 安装 Tailwind CSS IntelliSense 扩展
2. 重启 VS Code
3. 检查 `tailwind.config.js` 是否正确

---

## 18. 速查表

### 18.1 常用布局

```html
<!-- Center content -->
<div class="flex items-center justify-center min-h-screen">
  Content
</div>

<!-- Sticky footer -->
<div class="flex flex-col min-h-screen">
  <header>Header</header>
  <main class="flex-1">Content</main>
  <footer>Footer</footer>
</div>

<!-- Sidebar layout -->
<div class="flex">
  <aside class="w-64">Sidebar</aside>
  <main class="flex-1">Content</main>
</div>
```

### 18.2 常用组件

```html
<!-- Badge -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  New
</span>

<!-- Alert -->
<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
  Error message
</div>

<!-- Tooltip -->
<div class="relative group">
  <button>Hover me</button>
  <div class="absolute hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
    Tooltip
  </div>
</div>
```

### 18.3 常用工具类

```
Layout: flex, grid, block, hidden, relative, absolute
Spacing: p-4, m-4, gap-4, space-x-4
Sizing: w-full, h-screen, max-w-md
Typography: text-lg, font-bold, text-center
Colors: bg-blue-500, text-white, border-gray-300
Effects: shadow-lg, rounded-lg, opacity-50
Interactive: hover:bg-blue-600, focus:ring-2
Responsive: md:flex, lg:grid-cols-3
Dark mode: dark:bg-gray-900
```

### 18.4 快捷键

```
VS Code:
- Ctrl+Space: IntelliSense
- Alt+Click: Multi-cursor
- F12: Go to definition

Browser DevTools:
- F12: Open DevTools
- Ctrl+Shift+C: Inspect element
- Ctrl+Shift+I: Console
```

---

## 附录

### A. 有用的资源

- **官方文档**: https://tailwindcss.com/docs
- **Tailwind UI**: https://tailwindui.com
- **Heroicons**: https://heroicons.com
- **Tailwind Play**: https://play.tailwindcss.com
- **Awesome Tailwind**: https://github.com/aniftyco/awesome-tailwindcss

### B. 常用插件

- `@tailwindcss/forms` - 美化表单元素
- `@tailwindcss/typography` - 排版样式
- `@tailwindcss/aspect-ratio` - 宽高比
- `@tailwindcss/line-clamp` - 文本截断
- `tailwindcss-animate` - 动画库

### C. IDE 扩展

- **VS Code**: Tailwind CSS IntelliSense
- **WebStorm**: Built-in support
- **Sublime Text**: TailwindCSS package

---

**祝您使用 Tailwind CSS 愉快！** 🎨

如有问题，请查阅官方文档或社区论坛。
