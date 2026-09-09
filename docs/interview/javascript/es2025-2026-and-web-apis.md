---
title: 'ES2025/2026 新特性与现代 Web APIs [P6-P7]'
level: 'senior'
tags: ['ES2025', 'ES2026', 'Temporal', 'Decorators', 'View Transitions', 'Scroll-driven Animations']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P6+ 高级工程师'
---

# ES2025/2026 新特性与现代 Web APIs [P6-P7]

> 2025-2026 年，JavaScript 语言层面迎来了 Temporal API、Decorators、Iterator Helpers 等重大特性；浏览器平台则新增了 View Transitions API、Scroll-driven Animations、Popover API 等革命性 Web APIs。这些是 2026 面试高频考点。

## 核心概念（What）

### 语言层面（ES2025/2026）

| 特性                      | 状态              | 解决的问题                                |
| ------------------------- | ----------------- | ----------------------------------------- |
| **Temporal API**          | Stage 3/4         | 替代 Date 的现代日期时间 API              |
| **Decorators**            | Stage 3（已实现） | 标准化的装饰器（与 TS 协调）              |
| **Iterator Helpers**      | ES2025            | 迭代器链式操作（map/filter/reduce）       |
| **Promise.withResolvers** | ES2024            | 简化 Promise 外部控制                     |
| **Set Methods**           | ES2025            | 集合运算（union/intersection/difference） |
| **Array.fromAsync**       | ES2024            | 异步迭代器转数组                          |
| **RegExp v flag**         | ES2024            | Unicode 集类字符匹配                      |

### 平台层面（Web APIs 2025/2026）

| API                          | 解决的问题              | 浏览器支持  |
| ---------------------------- | ----------------------- | ----------- |
| **View Transitions API**     | 页面/组件切换动画       | Chrome 111+ |
| **Scroll-driven Animations** | 纯 CSS 滚动驱动动画     | Chrome 115+ |
| **Popover API**              | 原生弹出层管理          | Chrome 114+ |
| **CSS Anchor Positioning**   | CSS 锚点定位（替代 JS） | Chrome 125+ |
| **Navigation API**           | 现代 SPA 路由管理       | Chrome 118+ |
| **CSS Nesting**              | 原生 CSS 嵌套           | 全浏览器    |

---

## 底层原理（Why）

### 1. Temporal API

```javascript
// 旧方式：Date 对象（时区混乱、API 反人类）
const oldDate = new Date('2026-09-10') // 时区问题！
const oldDiff = date2 - date1 // 毫秒？秒？

// 新方式：Temporal API（精确、直觉）
// PlainDate：纯日期（无时区）
const birthday = Temporal.PlainDate.from('2026-09-10')
const nextYear = birthday.add({ years: 1 })

// PlainDateTime：日期 + 时间（无时区）
const meeting = Temporal.PlainDateTime.from('2026-09-10T14:30:00')

// ZonedDateTime：带时区的完整时间
const launch = Temporal.ZonedDateTime.from('2026-09-10T09:00:00+08:00[Asia/Shanghai]')
// 转换时区
const tokyoLaunch = launch.withTimeZone('Asia/Tokyo')
console.log(tokyoLaunch.toString()) // 2026-09-10T10:00:00+09:00[Asia/Tokyo]

// Duration：精确时间段
const duration = Temporal.Duration.between(birthday, nextYear)
console.log(duration.years) // 1

// 比较
console.log(birthday.equals(Temporal.PlainDate.from('2026-09-10'))) // true
```

### 2. Decorators（标准化装饰器）

```javascript
// TC39 Decorators（与 TypeScript 装饰器有差异，2026 逐步统一）
function logged(originalMethod, context) {
  function replacementMethod(...args) {
    console.log(`Calling ${context.name} with`, args)
    const result = originalMethod.call(this, ...args)
    console.log(`Returning ${context.name} with`, result)
    return result
  }
  return replacementMethod
}

class UserService {
  @logged
  async getUser(id) {
    return await fetch(`/api/users/${id}`).then((r) => r.json())
  }
}

// 自动访问器（auto accessors）
class Component {
  accessor name = 'default'
  // 等价于：
  // #name = 'default';
  // get name() { return this.#name; }
  // set name(v) { this.#name = v; }
}

// 注意：TC39 装饰器与 TypeScript 装饰器的差异
// ├── TC39：第二个参数是 context 对象
// ├── TS legacy：使用 reflect-metadata
// └── 2026 趋势：TS 5.x 默认使用 TC39 标准（isolatedDeclarations）
```

### 3. Iterator Helpers

```javascript
// ES2025：迭代器原生支持链式操作
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// 旧方式：先 map 再 filter（创建中间数组）
const result = numbers.map((n) => n * 2).filter((n) => n > 10)

// 新方式：Iterator helpers（惰性求值，无中间数组）
const result = numbers
  .values()
  .map((n) => n * 2)
  .filter((n) => n > 10)
  .toArray()

// 更多 Iterator 方法
const iter = [1, 2, 3].values()
iter.map((x) => x * 2) // 映射
iter.filter((x) => x > 2) // 过滤
iter.take(3) // 取前 N 个
iter.drop(2) // 跳过前 N 个
iter.flatMap((x) => [x, x]) // 扁平映射
iter.reduce((a, b) => a + b, 0) // 归约
iter.forEach((x) => console.log(x)) // 遍历
iter.some((x) => x > 5) // 存在性检查
iter.every((x) => x > 0) // 全称检查
iter.find((x) => x === 3) // 查找
iter.toArray() // 转数组
```

### 4. Promise.withResolvers

```javascript
// ES2024：简化 Promise 外部控制
// 旧方式
let resolve, reject
const promise = new Promise((res, rej) => {
  resolve = res
  reject = rej
})

// 新方式
const { promise, resolve, reject } = Promise.withResolvers()

// 实际使用：事件监听器 Promise
function waitForEvent(element, eventName) {
  const { promise, resolve } = Promise.withResolvers()
  element.addEventListener(eventName, resolve, { once: true })
  return promise
}

// 实际使用：流式处理
async function* processStream(reader) {
  while (true) {
    const { promise, resolve } = Promise.withResolvers()
    reader.read().then(resolve)
    const { done, value } = await promise
    if (done) return
    yield value
  }
}
```

### 5. View Transitions API

```javascript
// 页面切换动画（SPA 和 MPA 都支持）

// SPA 中使用
async function navigateTo(url) {
  // 启动视图过渡
  const transition = document.startViewTransition(() => {
    // 更新 DOM（同步操作）
    router.navigate(url);
    updateContent();
  });

  // 等待过渡完成
  await transition.finished;
}

// CSS 定义动画
::view-transition-old(root) {
  animation: fade-out 0.3s ease;
}

::view-transition-new(root) {
  animation: fade-in 0.3s ease;
}

// 命名视图过渡（特定元素）
// HTML: <img src="..." style="view-transition-name: hero-image">
::view-transition-old(hero-image) {
  animation: slide-out 0.5s ease;
}
::view-transition-new(hero-image) {
  animation: slide-in 0.5s ease;
}
```

### 6. Scroll-driven Animations

```css
/* 纯 CSS 实现滚动驱动动画（无需 JS！） */

/* 进度条：随页面滚动填充 */
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  background: #3b82f6;
  animation: progress linear;
  animation-timeline: scroll();
}

@keyframes progress {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

/* 元素淡入：进入视口时显示 */
.fade-in-section {
  animation: fadeIn ease-in;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

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

/* 视差效果 */
.parallax-bg {
  animation: parallax linear;
  animation-timeline: scroll();
}

@keyframes parallax {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-100px);
  }
}
```

### 7. Popover API

```html
<!-- 原生 Popover（无需 JS 库！） -->
<button popovertarget="my-popover">打开弹窗</button>

<div id="my-popover" popover>
  <h3>提示信息</h3>
  <p>这是原生 Popover 内容</p>
  <button popovertarget="my-popover" popovertargetaction="hide">关闭</button>
</div>

<!-- Popover 特性 -->
<!-- ✅ 自动管理显示/隐藏 -->
<!-- ✅ 点击外部自动关闭 -->
<!-- ✅ Escape 键关闭 -->
<!-- ✅ 焦点管理（Top Layer） -->
<!-- ✅ 可嵌套 -->

<!-- 手动控制 -->
<script>
  const popover = document.getElementById('my-popover')
  popover.showPopover() // 显示
  popover.hidePopover() // 隐藏
  popover.togglePopover() // 切换
</script>
```

### 8. Navigation API

```javascript
// 现代 SPA 路由管理（替代 History API）
const nav = window.navigation

// 监听导航事件
nav.addEventListener('navigate', (event) => {
  const url = new URL(event.destination.url)

  // 拦截导航，实现 SPA 路由
  if (isAppRoute(url.pathname)) {
    event.intercept({
      handler: async () => {
        // 显示加载状态
        showLoading()
        // 加载页面数据
        await loadPage(url.pathname)
        // 更新 DOM
        renderPage(url.pathname)
      },
    })
  }
})

// 导航信息
console.log(nav.currentEntry) // 当前条目
console.log(nav.entries()) // 历史记录栈
console.log(nav.canGoBack) // 能否后退
console.log(nav.canGoForward) // 能否前进

// 状态传递（导航时携带数据）
nav.navigate('/dashboard', { state: { fromLogin: true } })
```

---

## 高频面试题

### Q1: Temporal API 解决了 Date 的哪些问题？

**参考答案要点**：

- 时区处理混乱（Date 默认 UTC，显示本地时间）
- API 反人类（月份从 0 开始、getTime 返回毫秒）
- 不支持日历系统
- Temporal 提供 PlainDate（纯日期）、ZonedDateTime（带时区）、Duration（时间段）

### Q2: View Transitions API 的工作原理？

**参考答案要点**：

- 浏览器截取旧状态和新状态的快照
- 在 Top Layer 创建伪元素（::view-transition-old/new）
- 开发者通过 CSS 定义过渡动画
- 支持命名视图（view-transition-name）实现元素级过渡
- SPA 和 MPA 都支持

### Q3: Scroll-driven Animations 相比 IntersectionObserver 的优势？

**参考答案要点**：

- 纯 CSS 实现（无需 JS，性能更好）
- 动画进度与滚动位置精确同步
- 支持 entry/exit/cover 等多种范围
- 可以做进度条、视差效果、元素渐入
- IntersectionObserver 仍需 JS 控制动画

---

## 延伸思考

1. **设计题**：为一个电商网站设计页面切换动画（View Transitions）。
2. **场景题**：如何用 Scroll-driven Animations 实现滚动进度条和视差效果？
3. **对比题**：Popover API vs 第三方弹窗库（Headless UI、Radix），各自的 trade-off？

---

## 参考资料

- [Temporal API Proposal](https://github.com/tc39/proposal-temporal)
- [TC39 Decorators](https://github.com/tc39/proposal-decorators)
- [Iterator Helpers](https://github.com/tc39/proposal-iterator-helpers)
- [View Transitions API](https://developer.chrome.com/docs/web-platform/view-transitions)
- [Scroll-driven Animations](https://developer.chrome.com/docs/web-platform/scroll-driven-animations)
- [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [Navigation API](https://developer.chrome.com/docs/web-platform/navigation-api)
