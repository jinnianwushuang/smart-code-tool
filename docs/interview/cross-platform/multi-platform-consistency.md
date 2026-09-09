---
title: "多端一致性方案 [P8]"
level: "architect"
tags: ["多端一致性", "Design Token", "共享代码", "平台差异抽象"]
difficulty: "hard"
updated: "2026-09-10"
target: "架构师（P8）"
---

# 多端一致性方案 [P8]

> 多端一致性不是简单的「一套代码多端运行」，而是在不同平台上保持视觉、交互和体验的统一，同时尊重各平台的差异。

## 核心概念（What）

### 多端一致性三层模型

```
┌─────────────────────────────┐
│       表现层（UI）           │  ← 各平台原生渲染
├─────────────────────────────┤
│       抽象层（接口）         │  ← 统一组件 API
├─────────────────────────────┤
│       逻辑层（业务）         │  ← 100% 共享
└─────────────────────────────┘

一致性维度：
├── 视觉一致性：颜色、字体、间距、图标
├── 交互一致性：动画、手势、反馈
├── 数据一致性：状态同步、离线策略
└── 体验一致性：加载、错误、空状态
```

---

## 底层原理（Why）

### 1. Design Token 跨端流转

```typescript
// Design Token 定义（JSON 格式，平台无关）
{
  "color": {
    "primary": { "value": "#1677ff", "type": "color" },
    "success": { "value": "#52c41a", "type": "color" },
    "text": {
      "primary": { "value": "#000000e0", "type": "color" },
      "secondary": { "value": "#00000073", "type": "color" },
    }
  },
  "spacing": {
    "xs": { "value": "4px", "type": "spacing" },
    "sm": { "value": "8px", "type": "spacing" },
    "md": { "value": "16px", "type": "spacing" },
    "lg": { "value": "24px", "type": "spacing" },
  },
  "typography": {
    "heading": { "value": "24px", "type": "fontSize" },
    "body": { "value": "14px", "type": "fontSize" },
    "caption": { "value": "12px", "type": "fontSize" },
  }
}

// Token 转换工具（Style Dictionary）
// 自动生成各平台格式：
// Web → CSS Variables / Tailwind config
// iOS → Swift constants
// Android → XML resources
// Flutter → Dart constants
```

### 2. 平台差异抽象层

```typescript
// 统一接口定义
interface PlatformAdapter {
  // 导航
  navigate(path: string, params?: Record<string, unknown>): void;
  goBack(): void;

  // 存储
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;

  // 通知
  showToast(message: string, type: 'success' | 'error'): void;
  showNotification(title: string, body: string): void;

  // 设备能力
  getDeviceInfo(): DeviceInfo;
  requestPermission(type: PermissionType): Promise<boolean>;
}

// Web 实现
class WebPlatformAdapter implements PlatformAdapter {
  navigate(path: string) {
    window.history.pushState(null, '', path);
  }
  async setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }
  showToast(message: string, type: string) {
    // 使用 Web Toast 组件
  }
}

// React Native 实现
class RNPlatformAdapter implements PlatformAdapter {
  navigate(path: string) {
    navigation.navigate(path);
  }
  async setItem(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  }
  showToast(message: string, type: string) {
    Toast.show(message, { type });
  }
}
```

### 3. 响应式设计策略

```typescript
// 断点系统
const breakpoints = {
  mobile: 0,      // 0-767px
  tablet: 768,    // 768-1023px
  desktop: 1024,  // 1024-1439px
  wide: 1440,     // 1440px+
};

// 自适应布局组件
function ResponsiveLayout({ mobile, tablet, desktop }: LayoutProps) {
  const width = useWindowWidth();

  if (width >= breakpoints.desktop) return desktop;
  if (width >= breakpoints.tablet) return tablet;
  return mobile;
}

// 自适应导航
// Mobile → Bottom Tab Bar
// Tablet → Side Navigation (collapsed)
// Desktop → Side Navigation (expanded)
```

### 4. 共享代码策略

```
Monorepo 共享代码结构：
packages/
├── core/           # 业务逻辑（100% 共享）
│   ├── api/        # API 调用层
│   ├── models/     # 数据模型
│   └── utils/      # 工具函数
├── ui/             # UI 组件（接口共享，实现分平台）
│   ├── Button.tsx      # Web 实现
│   ├── Button.native.tsx  # RN 实现
│   └── types.ts        # 共享接口
├── tokens/         # Design Token（各平台消费）
└── tests/          # 共享测试用例
```

---

## 高频面试题

### Q1: 如何保证多端视觉一致性？

**参考答案要点**：
- Design Token 作为单一事实来源（SSOT）
- 自动化生成各平台样式代码
- 视觉回归测试（多端截图自动对比）
- 设计审查流程（多端截图 Review）
- 共享设计组件（headless UI + 平台主题）

### Q2: 如何处理平台差异？

**参考答案要点**：
- 平台抽象层：统一接口，各平台实现
- 条件渲染：根据平台选择不同组件
- 渐进增强：核心功能一致，平台特定功能按需启用
- 尊重平台惯例：iOS 返回手势、Android 返回键

### Q3: Design Token 如何在团队中推行？

**参考答案要点**：
- 设计师和工程师共同定义 Token
- 使用 Figma Token 插件同步设计稿
- 自动化 CI 检查 Token 使用
- 渐进式迁移（先新后旧）
- 建立 Token 治理流程（变更审批、版本管理）

---

## 延伸思考

1. **设计题**：为一个电商应用设计多端一致性方案（Web + H5 + 小程序 + App）。
2. **场景题**：小程序和 Web 的交互差异（如支付、分享）如何抽象？
3. **对比题**：Style Dictionary vs Tokens Studio vs 自建 Token 系统？

---

## 参考资料

- [Design Tokens Community Group](https://design-tokens.github.io/community-group/)
- [Style Dictionary](https://amzn.github.io/style-dictionary/)
- [多端一致性最佳实践](https://www.smashingmagazine.com/2023/01/cross-platform-design-systems/)
