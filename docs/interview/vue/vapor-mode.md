---
title: "Vapor Mode 原理 [P6-P7]"
level: "senior"
tags: ["Vue", "Vapor Mode", "无虚拟DOM", "编译时优化"]
difficulty: "expert"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# Vapor Mode 原理 [P6-P7]

> Vapor Mode 是 Vue 3.x 引入的无虚拟 DOM 编译模式，它将模板直接编译为命令式 DOM 操作代码，消除虚拟 DOM 的创建和 diff 开销，实现接近 SolidJS 的性能。

## 核心概念（What）

### Vapor Mode 定位

```
┌─────────────────────────────────────────────────┐
│                   Vue 3 渲染模式                  │
├────────────────────┬────────────────────────────┤
│   Virtual DOM Mode │      Vapor Mode            │
│   （默认模式）      │    （无虚拟 DOM 模式）       │
├────────────────────┼────────────────────────────┤
│ 模板 → VNode →    │  模板 → 直接 DOM 操作代码    │
│ Diff → Patch DOM  │  响应式直接驱动 DOM 更新      │
├────────────────────┼────────────────────────────┤
│ 灵活性高           │  性能极致                    │
│ 运行时较大         │  运行时极小                   │
│ 适合动态组件       │  适合静态模板                 │
└────────────────────┴────────────────────────────┘
```

### 为什么需要 Vapor Mode？

| 问题 | 虚拟 DOM 模式 | Vapor Mode |
|------|-------------|------------|
| 内存开销 | 每帧创建大量 VNode 对象 | 零 VNode 开销 |
| 更新路径 | 创建 VNode → Diff → Patch | 直接更新 DOM 属性 |
| 包体积 | 需要完整的运行时 | 编译产物自包含，运行时极小 |
| 启动性能 | 需要初始化 VDOM 系统 | 直接操作 DOM，启动更快 |

---

## 底层原理（Why）

### 1. 编译策略

```html
<!-- 模板 -->
<template vapor>
  <div>
    <p>{{ message }}</p>
    <button @click="count++">Count: {{ count }}</button>
  </div>
</template>
```

```javascript
// 虚拟 DOM 模式编译结果
export function render(_ctx) {
  return (_openBlock(), _createElementBlock("div", null, [
    _createElementVNode("p", null, _toDisplayString(_ctx.message), 1),
    _createElementVNode("button", {
      onClick: () => _ctx.count++
    }, _toDisplayString(_ctx.count), 1)
  ]))
}

// Vapor Mode 编译结果（无虚拟 DOM）
import { template, text, on } from 'vue/vapor'

const _template = template('<div><p></p><button>Count: </button></div>')

export function createApp() {
  const n0 = _template()          // 克隆模板 DOM
  const n1 = n0.firstChild        // <p>
  const n2 = n1.nextSibling       // <button>

  text(n1, () => message)         // 响应式绑定文本
  on(n2, 'click', () => count.value++) // 事件绑定
  text(n2.firstChild, () => count.value) // 按钮文本绑定

  return n0
}
```

### 2. 核心 API

```javascript
// Vapor Mode 的运行时 API（极简）

// template(html) - 创建模板克隆函数
// 内部使用 <template> 元素解析 HTML，返回克隆函数
function template(html) {
  const el = document.createElement('template')
  el.innerHTML = html
  return () => el.content.cloneNode(true)
}

// text(node, getter) - 响应式文本绑定
// getter 是一个返回字符串的函数，内部使用 effect 追踪
function text(node, getter) {
  effect(() => {
    node.textContent = getter()
  })
}

// on(node, event, handler) - 事件绑定
function on(node, event, handler) {
  node.addEventListener(event, handler)
}

// attr(node, name, getter) - 响应式属性绑定
function attr(node, name, getter) {
  effect(() => {
    const value = getter()
    if (value == null) {
      node.removeAttribute(name)
    } else {
      node.setAttribute(name, value)
    }
  })
}

// class/style 绑定类似，使用 effect 直接操作 DOM
```

### 3. 与虚拟 DOM 模式的共存

```
┌─────────────────────────────────────────────┐
│              Vue 3 混合渲染                    │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  App.vue (Vapor Mode)                │    │
│  │  ┌────────────────────────────────┐  │    │
│  │  │  Header.vue (Vapor Mode)       │  │    │
│  │  └────────────────────────────────┘  │    │
│  │  ┌────────────────────────────────┐  │    │
│  │  │  DataTable.vue (VDOM Mode)     │  │    │
│  │  │  需要动态组件/递归组件          │  │    │
│  │  └────────────────────────────────┘  │    │
│  │  ┌────────────────────────────────┐  │    │
│  │  │  Footer.vue (Vapor Mode)       │  │    │
│  │  └────────────────────────────────┘  │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  Vapor 组件可以包含 VDOM 子组件              │
│  VDOM 组件不能包含 Vapor 子组件              │
│  边界通过特殊的互操作层连接                   │
└─────────────────────────────────────────────┘
```

### 4. Vapor Mode 的限制

```
Vapor Mode 适用于：
✅ 静态结构模板（大部分业务组件）
✅ 简单的条件/循环渲染
✅ 事件绑定和响应式更新
✅ 组件间 props/emit 通信

Vapor Mode 不适用于：
❌ 动态组件（<component :is="...">）
❌ 递归组件
❌ 需要 render 函数的组件
❌ 复杂的 slot 传递（部分支持）
❌ Teleport / Suspense（部分支持）
```

### 5. 性能对比

```
基准测试（js-framework-benchmark）：

                    VDOM Mode    Vapor Mode    提升
创建 1000 行         120ms        85ms         29%
更新 1000 行         45ms         25ms         44%
部分更新             35ms         15ms         57%
内存占用             15MB         8MB          47%
包体积（运行时）      33KB         12KB         64%
```

---

## 实战应用（How）

### 启用 Vapor Mode

```vue
<!-- 在模板上声明 vapor 模式 -->
<template vapor>
  <div>
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const message = ref('Hello Vapor')
</script>
```

```javascript
// vite.config.js 配置
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      vapor: true, // 全局启用 Vapor Mode
    })
  ]
})
```

### 迁移策略

```
渐进式迁移路径：
1. 新组件默认使用 Vapor Mode
2. 现有简单组件逐步迁移
3. 复杂/动态组件保持 VDOM 模式
4. 通过混合模式共存

不需要迁移的情况：
- 大量使用 render 函数
- 大量使用动态组件
- 依赖 Teleport/Suspense 的高级特性
```

---

## 高频面试题

### Q1: Vapor Mode 的核心原理是什么？

**参考答案要点**：
- 模板编译为直接 DOM 操作代码，不经过虚拟 DOM
- 使用 `<template>` 元素预解析 HTML，运行时通过 `cloneNode` 创建 DOM
- 响应式系统直接驱动 DOM 更新（通过 effect），不经过 diff
- 运行时 API 极简：template、text、on、attr、class 等
- 包体积大幅减小，因为不需要完整的 VDOM diff 运行时

### Q2: Vapor Mode 和虚拟 DOM 模式如何选择？

**参考答案要点**：
- 大部分业务组件适合 Vapor Mode（静态结构、简单交互）
- 需要动态组件、递归组件、render 函数的场景使用 VDOM 模式
- 两种模式可以共存，Vapor 组件可以包含 VDOM 子组件
- 性能敏感场景优先 Vapor Mode

### Q3: Vapor Mode 和 SolidJS 的编译策略有什么异同？

**参考答案要点**：
- 相同：都是编译时为模板生成直接 DOM 操作代码
- 相同：都使用细粒度响应式系统直接更新 DOM
- 不同：Vue 的响应式基于 Proxy，SolidJS 基于 Signals
- 不同：Vue 支持混合模式（Vapor + VDOM），SolidJS 只有编译模式
- 不同：Vue 的编译器可以分析模板结构做更多优化

---

## 延伸思考

1. **设计题**：如何设计一个编译器，将模板编译为直接 DOM 操作代码？需要处理哪些边界情况？
2. **场景题**：一个大型 Vue 应用如何渐进式迁移到 Vapor Mode？
3. **对比题**：Vapor Mode vs React Compiler（React 19）vs Svelte 5，各自的编译策略差异？

---

## 参考资料

- [Vue Vapor Mode RFC](https://github.com/vuejs/rfcs/discussions/565)
- [Vue Vapor 源码](https://github.com/vuejs/core-vapor)
- [Vapor Mode 性能基准](https://github.com/vuejs/core-vapor/tree/main/benchmarks)
