---
title: 'Design Token 体系 [P8]'
level: 'architect'
tags: ['Design Token', '多品牌', '多主题', '跨平台']
difficulty: 'expert'
target: '架构师（P8）'
---

# Design Token 体系 [P8]

> Design Token 是设计系统的原子单元。2026 年，成熟的 Token 体系支持多品牌、多主题、跨平台流转，是大型设计系统的基石。

## 核心概念（What）

### Token 分层模型

```
┌─────────────────────────────┐
│     Global Token             │  ← 全局基础值
│  color.blue.500 = #3b82f6   │
├─────────────────────────────┤
│     Alias Token              │  ← 语义化别名
│  color.primary = {blue.500} │
├─────────────────────────────┤
│     Component Token          │  ← 组件级别
│  button.primary.bg = {primary}│
└─────────────────────────────┘

分层优势：
├── 全局变更：修改 Global Token 影响所有使用处
├── 主题切换：修改 Alias Token 的映射
├── 组件定制：Component Token 覆盖 Alias
└── 跨平台：Global Token 生成各平台格式
```

---

## 底层原理（Why）

### 1. Token 解析管线（DTCG 规范 → 平台产物）

Design Token 的核心不是 JSON 定义，而是从**声明式 Token 文件**到**多平台可用产物**的编译管线。

```
Token 编译管线（Style Dictionary / Tokens Studio 底层流程）：

Phase 1: Parse（解析）
  ├── 读取 tokens/**/*.json（支持多文件合并）
  ├── 按 DTCG 规范校验结构：
  │   ├── 每个 Token 必须有 $value（或 value）字段
  │   ├── $type 标注语义类型（color/dimension/typography）
  │   └── $description 可选描述
  └── 构建 Token Tree（嵌套对象，key = Token 路径）

Phase 2: Resolve References（引用解析）
  ├── 扫描所有 $value 中的 {path.to.token} 引用
  ├── 构建引用依赖图（DAG）
  │   ├── 节点 = Token
  │   └── 边 = 引用关系（A → B 表示 A 引用了 B）
  ├── 循环检测：DFS 发现后边 → 报错
  └── 拓扑排序：确定解析顺序，逐个替换引用为实际值

Phase 3: Transform（变换）
  ├── 按平台注册的 Transform 链依次处理每个 Token
  ├── 常见 Transform：
  │   ├── color/css/hex: #3b82f6 → #3b82f6（不变）
  │   ├── color/css/rgb: #3b82f6 → rgb(59, 130, 246)
  │   ├── size/rem: 16px → 1rem（除以 16）
  │   ├── size/swift: 16px → CGFloat(16.0)
  │   └── name/kebab: color.blue.500 → color-blue-500
  └── Transform 是纯函数：(Token) → Token（值变换，结构不变）

Phase 4: Format（格式化输出）
  ├── 将 Transform 后的 Token 树渲染为目标格式
  ├── 常见 Format：
  │   ├── css/variables → :root { --color-blue-500: #3b82f6; }
  │   ├── javascript/es6 → export const colorBlue500 = '#3b82f6'
  │   ├── ios-swift/class.swift → static let colorBlue500 = ...
  │   ├── android/resources → <color name="color_blue_500">...</color>
  │   └── flutter/class.dart → static const colorBlue500 = ...
  └── Format 本质是模板引擎：Token Tree + Template → String
```

### 2. 多层 Token 模型的引用解析算法

Token 分层（Global → Alias → Component）的底层是**有向无环图（DAG）上的拓扑求解**。

```
引用解析算法：

Token 引用图（DAG）示例：
  Global:     color.blue.500 = "#3b82f6"
  Alias:      color.primary = {color.blue.500}
  Component:  button.primary.bg = {color.primary}

  依赖图：
    button.primary.bg → color.primary → color.blue.500
    （叶子节点）          （中间节点）      （根节点 = 字面量）

解析过程（拓扑排序 + 深度优先）：
  1. 从 button.primary.bg 出发，发现引用 color.primary
  2. 递归到 color.primary，发现引用 color.blue.500
  3. 递归到 color.blue.500，值为字面量 "#3b82f6" → 返回
  4. color.primary = "#3b82f6" → 返回
  5. button.primary.bg = "#3b82f6" → 完成

循环引用检测：
  如果 A → B → C → A，DFS 发现后边（back edge）
  → 抛出 CircularReferenceError
  → 编译失败，提示循环路径

条件引用（Theme Override）：
  Alias: color.primary = {
    "default": "{color.blue.500}",
    "$themes.dark": "{color.blue.300}"
  }
  → 解析时根据当前 Theme 上下文选择分支
  → 生成产物时每个 Theme 一套值
```

### 3. 主题/品牌覆盖的分层合并协议

多主题 + 多品牌的底层是**多层深度合并（deep merge）+ 作用域覆盖**。

```
分层合并协议（优先级从低到高）：

  Layer 0: Global Tokens（基础值，无覆盖）
  Layer 1: Theme Override（主题覆盖 Alias 值）
  Layer 2: Brand Override（品牌覆盖 Alias 值）
  Layer 3: Component Override（组件级覆盖）

合并算法：
  resolveTokenValue(tokenPath, context):
    value = Global[tokenPath].value
    if Theme[context.theme][tokenPath] exists:
      value = Theme[context.theme][tokenPath]  // 覆盖
    if Brand[context.brand][tokenPath] exists:
      value = Brand[context.brand][tokenPath]  // 再覆盖
    if Component[context.component][tokenPath] exists:
      value = Component[context.component][tokenPath]  // 最高优先
    return value

CSS Variables 实现映射：
  :root {
    --color-primary: #3b82f6;       /* Global/Alias 默认值 */
  }
  [data-theme="dark"] {
    --color-primary: #60a5fa;       /* Theme 覆盖 */
  }
  [data-brand="brandA"] {
    --color-primary: #8b5cf6;       /* Brand 覆盖 */
  }
  .button-primary {
    background: var(--color-primary); /* Component 消费 */
  }

产物矩阵（N 主题 × M 品牌）：
  → 生成 N × M 套 CSS Variables 文件
  → 或运行时通过 data-theme/data-brand 属性切换
```

### 4. 跨平台生成引擎的 Transform 链设计

跨平台生成的核心是**可插拔的 Transform 链 + Format 模板**。

```
Transform 链（Pipeline）设计：

  每个平台注册一条 Transform 链：
    css:  [name/kebab, color/css/hex, size/rem, shadow/css]
    ios:  [name/camel, color/ios/uicolor, size/float, font/ctfont]
    android: [name/snake, color/android/color, size/sp, font/typeface]

  Transform 接口：
    {
      name: 'size/rem',
      type: 'value',           // 变换类型：value/name/attribute
      matcher: (token) => token.$type === 'dimension',  // 匹配条件
      transformer: (token) => ({
        ...token,
        $value: `${parseFloat(token.$value) / 16}rem`   // 变换逻辑
      })
    }

  Transform 执行顺序 = 注册顺序（数组顺序）
  每个 Transform 只关注单一职责（Unix 管道哲学）

Format 模板引擎：
  Format 不是简单的字符串拼接，而是 Token Tree → 目标语法树的映射：

  css/variables Format:
    输入: Token Tree（已 Transform）
    处理: 遍历叶子节点 → 生成 CSS 声明 → 按层级嵌套
    输出:
      :root {
        --color-blue-500: #3b82f6;
        --spacing-md: 1rem;
      }

  关键设计：Format 只关心「怎么输出」，不关心「值是什么」
  → Transform 负责值的平台适配
  → Format 负责语法结构的平台适配
  → 二者正交，可独立扩展
```

---

## 高频面试题

### Q1: Design Token 的分层模型是什么？

**参考答案要点**：

- Global Token：全局基础值（颜色、间距、字体）
- Alias Token：语义化别名（primary、success、danger）
- Component Token：组件级别覆盖
- 分层好处：全局变更、主题切换、组件定制互不影响

### Q2: 如何实现多主题切换？

**参考答案要点**：

- Alias Token 映射不同值（light/dark）
- CSS Variables 动态切换（`data-theme="dark"`）
- 组件 Token 可选覆盖
- 用户偏好持久化（localStorage）
- 跟随系统主题（`prefers-color-scheme`）

### Q3: Token 如何在团队中治理？

**参考答案要点**：

- 设计师和工程师共同定义
- 使用 Figma Token 插件同步
- 版本管理（语义化版本）
- 变更审批流程
- 自动化检查（CI 验证 Token 使用）

---

## 延伸思考

1. **设计题**：为一个 SaaS 产品设计支持多租户品牌的 Token 体系。
2. **场景题**：Token 有 500+ 个，如何管理和维护？
3. **对比题**：Style Dictionary vs Tokens Studio vs 自建方案？

---

## 参考资料

- [W3C Design Token Format](https://design-tokens.github.io/community-group/format/)
- [Style Dictionary](https://amzn.github.io/style-dictionary/)
- [Tokens Studio](https://tokens.studio)
