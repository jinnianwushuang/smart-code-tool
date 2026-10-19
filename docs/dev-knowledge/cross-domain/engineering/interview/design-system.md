---
title: '设计系统与组件库架构 [P8]'
level: 'architect'
tags: ['设计系统', 'headless UI', 'design token', '主题引擎']
difficulty: 'hard'
target: '架构师（P8）'
---

# 设计系统与组件库架构 [P8]

> 设计系统是产品一致性的基石。2026 年，Headless UI + Design Token + 主题引擎成为组件库架构的标准范式。

## 核心概念（What）

### 设计系统三层架构

```
┌─────────────────────────────────────┐
│  Design Tokens（设计令牌）           │
│  颜色、字体、间距、圆角、阴影...      │
├─────────────────────────────────────┤
│  Headless Components（无样式组件）    │
│  纯逻辑：状态管理、键盘导航、ARIA     │
├─────────────────────────────────────┤
│  Styled Components（样式组件）        │
│  视觉层：主题适配、响应式、动画        │
└─────────────────────────────────────┘
```

---

## 底层原理（Why）

### 1. Headless UI 的无障碍状态机模型

Headless UI 的底层不是「提供逻辑不提供样式」，而是将每个组件建模为一个**有限状态机 + ARIA 属性映射器**。

```
Headless UI 状态机模型（以 Listbox/Select 为例）：

  状态图：
    Closed ──[点击触发器/按 Enter]──► Open
      ▲                                    │
      └────[按 Escape/选择选项/失焦]────┘

  每个状态对应的 ARIA 属性映射：
    Closed:
      ├── trigger: aria-expanded="false"
      ├── trigger: aria-haspopup="listbox"
      └── listbox: role="listbox" aria-activedescendant=""

    Open:
      ├── trigger: aria-expanded="true"
      ├── listbox: role="listbox" tabindex="0"
      ├── activeOption: role="option" aria-selected="true"
      └── 其他 option: role="option" aria-selected="false"

  键盘导航状态转换：
    ├── ArrowDown → activeIndex = (activeIndex + 1) % options.length
    ├── ArrowUp → activeIndex = (activeIndex - 1 + options.length) % options.length
    ├── Home → activeIndex = 0
    ├── End → activeIndex = options.length - 1
    ├── Enter/Space → 选中当前 activeOption → 状态转为 Closed
    └── Escape → 状态转为 Closed（不选中）

  焦点管理协议：
    ├── 打开时：焦点从触发器移到 Listbox
    ├── 导航时：焦点保持在 Listbox，用 aria-activedescendant 指向当前选项
    └── 关闭时：焦点返回触发器（保证无障碍连贯性）
```

### 2. 主题引擎的 Token 解析与 CSS 变量注入管线

主题引擎的底层不是「Context 传值」，而是**Token 解析 → 变换 → CSS 变量注入 → 组件消费的运行时管线**。

```
主题引擎运行时管线：

  Phase 1: Token 解析
    ├── 加载 Token 定义（JSON / JS 对象）
    ├── 解析引用（{color.primary} → 查找实际值）
    └── 应用主题覆盖（light/dark/brand）

  Phase 2: Token 变换（Transform）
    ├── 颜色空间转换：HEX → RGB → OKLCH（用于动态生成 hover/active 色）
    │   ├── hover: oklch(l * 0.9, c, h)（降低亮度 10%）
    │   ├── active: oklch(l * 0.8, c, h)（降低亮度 20%）
    │   └── disabled: oklch(l, c * 0.3, h)（降低饱和度 70%）
    ├── 尺寸单位转换：px → rem（基于根字体大小）
    └── 复合 Token 拆分：typography → font-size + font-weight + line-height

  Phase 3: CSS 变量注入
    ├── 将 Token 扁平化为 key-value 对
    ├── 生成 CSS 变量名：color.blue.500 → --color-blue-500
    ├── 注入到 :root 或 [data-theme="dark"] 选择器下
    └── 使用 CSSStyleSheet.insertRule() 动态更新（比 style.setProperty 快）

  Phase 4: 组件消费
    ├── 组件样式中引用 CSS 变量：background: var(--color-primary)
    ├── 主题切换时只需更新 CSS 变量值（不重新渲染组件树）
    └── 性能优势：样式更新不触发 React/Vue 的 diff 算法

  主题切换性能对比：
    ├── React Context 方案：触发全组件树重渲染（O(N)）
    ├── CSS Variables 方案：只触发样式重计算（O(1) JS 开销）
    └── 结论：大型应用必须用 CSS Variables 方案
```

### 3. 组件 API 设计的可组合性原则

设计系统组件 API 的底层不是「props 设计」，而是**可组合性（Composability）的形式化原则**。

```
可组合性设计原则：

  1. 控制反转（Inversion of Control）：
     ├── 组件不控制自己的状态，状态由外部管理
     ├── 例：Select 组件不内部存储选中值，而是通过 value + onChange 由父组件控制
     └── 好处：组件可复用性最大化（无状态 = 无副作用）

  2. Compound Components 模式：
     ├── 将复杂组件拆分为多个子组件，通过 Context 隐式通信
     ├── 例：<Select><Select.Trigger /><Select.Options><Select.Option /></Select.Options></Select>
     ├── 底层实现：父组件通过 Context 提供状态和方法，子组件通过 useContext 消费
     └── 好处：使用者可以自由组合布局，不受固定结构限制

  3. Render Props / Slot 模式：
     ├── 组件提供逻辑，使用者提供渲染
     ├── 例：<Menu.Item render={(props) => <Link {...props} />} />
     └── 好处：逻辑和渲染完全解耦，支持任意自定义渲染

  4. 样式无关性（Style Agnostic）：
     ├── Headless 组件不输出任何 CSS 类名
     ├── 通过 data-* 属性暴露状态（data-open, data-disabled, data-focused）
     ├── 使用者用任意 CSS 方案（Tailwind / CSS Modules / styled-components）消费
     └── 好处：组件库与样式方案完全解耦
```

---

## 高频面试题

### Q1: Headless UI 的优势是什么？

**参考答案要点**：

- 逻辑和样式分离，可复用逻辑
- 使用者可以完全自定义视觉样式
- 内置无障碍支持（ARIA、键盘导航）
- 适合设计系统需要支持多品牌的场景

### Q2: Design Token 如何实现跨平台？

**参考答案要点**：

- Token 定义与平台无关（JSON 格式）
- 使用 Style Dictionary 等工具转换为各平台格式
- Web → CSS 变量 / SCSS 变量 / JS 对象
- iOS → Swift 常量 / ObjC 宏
- Android → XML 资源文件

### Q3: 如何设计支持多品牌的组件库？

**参考答案要点**：

- 三层架构：Token → Headless → Styled
- Token 层定义品牌差异（颜色、字体）
- Headless 层品牌无关（纯逻辑）
- Styled 层消费 Token，实现品牌样式

---

## 延伸思考

1. **设计题**：设计一个支持 3 个品牌、5 个平台的 Design Token 体系。
2. **场景题**：如何在现有组件库上渐进式引入 Design Token？
3. **对比题**：Radix UI vs Headless UI vs Ariakit，各自的 Headless 方案？

---

## 参考资料

- [Design Tokens W3C 规范](https://design-tokens.github.io/community-group/format/)
- [Style Dictionary](https://amzn.github.io/style-dictionary/)
- [Headless UI](https://headlessui.com)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
