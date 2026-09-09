---
title: "Design Token 体系 [P8]"
level: "architect"
tags: ["Design Token", "多品牌", "多主题", "跨平台"]
difficulty: "expert"
updated: "2026-09-10"
target: "架构师（P8）"
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

### 1. Token 定义（W3C DTCG 格式）

```json
{
  "color": {
    "blue": {
      "50": { "value": "#eff6ff", "type": "color" },
      "500": { "value": "#3b82f6", "type": "color" },
      "900": { "value": "#1e3a8a", "type": "color" }
    },
    "semantic": {
      "primary": { "value": "{color.blue.500}", "type": "color" },
      "success": { "value": "#22c55e", "type": "color" },
      "danger": { "value": "#ef4444", "type": "color" },
      "text": {
        "primary": { "value": "#111827", "type": "color" },
        "secondary": { "value": "#6b7280", "type": "color" },
        "disabled": { "value": "#9ca3af", "type": "color" }
      }
    }
  },
  "spacing": {
    "xs": { "value": "4px", "type": "dimension" },
    "sm": { "value": "8px", "type": "dimension" },
    "md": { "value": "16px", "type": "dimension" },
    "lg": { "value": "24px", "type": "dimension" },
    "xl": { "value": "32px", "type": "dimension" }
  },
  "typography": {
    "heading": {
      "h1": { "value": { fontSize: "32px", fontWeight: 700, lineHeight: 1.2 }, "type": "typography" },
      "h2": { "value": { fontSize: "24px", fontWeight: 600, lineHeight: 1.3 }, "type": "typography" }
    },
    "body": {
      "default": { "value": { fontSize: "14px", fontWeight: 400, lineHeight: 1.5 }, "type": "typography" }
    }
  }
}
```

### 2. 多主题支持

```json
// 亮色主题
{
  "theme": {
    "light": {
      "color": {
        "background": { "value": "#ffffff" },
        "surface": { "value": "#f9fafb" },
        "text": { "primary": { "value": "#111827" } }
      }
    },
    "dark": {
      "color": {
        "background": { "value": "#111827" },
        "surface": { "value": "#1f2937" },
        "text": { "primary": { "value": "#f9fafb" } }
      }
    }
  }
}
```

### 3. 多品牌支持

```json
// 品牌 A
{
  "brand": {
    "brandA": {
      "color": {
        "primary": { "value": "#3b82f6" },
        "logo": { "value": "url('/brand-a-logo.svg')" }
      }
    },
    "brandB": {
      "color": {
        "primary": { "value": "#8b5cf6" },
        "logo": { "value": "url('/brand-b-logo.svg')" }
      }
    }
  }
}
```

### 4. 跨平台生成

```javascript
// Style Dictionary 配置
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({
  source: ['tokens/**/*.json'],
  platforms: {
    // Web: CSS Variables
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
      }],
    },
    // Web: Tailwind config
    tailwind: {
      transformGroup: 'js',
      buildPath: 'dist/tailwind/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6',
      }],
    },
    // iOS: Swift constants
    ios: {
      transformGroup: 'ios',
      buildPath: 'dist/ios/',
      files: [{
        destination: 'Tokens.swift',
        format: 'ios-swift/class.swift',
      }],
    },
    // Android: XML resources
    android: {
      transformGroup: 'android',
      buildPath: 'dist/android/',
      files: [{
        destination: 'tokens.xml',
        format: 'android/resources',
      }],
    },
    // Flutter: Dart constants
    flutter: {
      transformGroup: 'flutter',
      buildPath: 'dist/flutter/',
      files: [{
        destination: 'tokens.dart',
        format: 'flutter/class.dart',
      }],
    },
  },
});

await sd.buildAllPlatforms();
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
