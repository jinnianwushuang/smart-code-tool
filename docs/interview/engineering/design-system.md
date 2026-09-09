---
title: "设计系统与组件库架构 [P8]"
level: "architect"
tags: ["设计系统", "headless UI", "design token", "主题引擎"]
difficulty: "hard"
updated: "2026-09-10"
target: "架构师（P8）"
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

### 1. Design Token 架构

```json
// tokens/base.json
{
  "color": {
    "blue": { "50": "#eff6ff", "500": "#3b82f6", "900": "#1e3a5f" },
    "gray": { "50": "#f9fafb", "500": "#6b7280", "900": "#111827" }
  },
  "spacing": { "0": "0", "1": "4px", "2": "8px", "4": "16px" },
  "font": { "size": { "sm": "14px", "md": "16px", "lg": "18px" } }
}

// tokens/brand-a.json（品牌 A 覆盖）
{ "color": { "blue": { "500": "#2563eb" } } }
```

### 2. Headless UI 模式

```tsx
// Headless 组件只提供逻辑，不提供样式
import { useListbox } from '@headlessui/react';

function MySelect({ options }) {
  const { getOptionProps, isOpen, getToggleButtonProps } = useListbox({ options });

  return (
    <div>
      <button {...getToggleButtonProps()}>
        {isOpen ? 'Close' : 'Open'}
      </button>
      {isOpen && (
        <ul>
          {options.map((option, i) => (
            <li {...getOptionProps({ option, index: i })}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  // 样式完全由使用者控制
}
```

### 3. 主题引擎

```typescript
// 主题系统架构
interface Theme {
  tokens: DesignTokens;
  components: ComponentTokens;
}

// 运行时主题切换
const ThemeContext = createContext<Theme>(lightTheme);

function ThemeProvider({ theme, children }) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// CSS 变量方案（性能最优）
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  Object.entries(flattenTokens(theme.tokens)).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}
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
