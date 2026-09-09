---
title: "模块联邦 V2 与去中心化微前端 [P8]"
level: "architect"
tags: ["Module Federation", "微前端", "去中心化", "共享依赖"]
difficulty: "expert"
updated: "2026-09-10"
target: "架构师（P8）"
---

# 模块联邦 V2 与去中心化微前端 [P8]

> Module Federation V2 在 2025-2026 年走向成熟，从「模块共享」演进到「去中心化微前端」，解决了 V1 的诸多痛点。

## 核心概念（What）

### 微前端方案演进

```
iframe → 单 JS 合并 → Module Federation V1 → MF V2 → 去中心化
 │          │              │                    │          │
 完全隔离   运行时合并     构建时联邦           类型安全    独立部署
 通信困难   版本冲突       共享依赖复杂         DevEx 改善  自治团队
```

### MF V1 vs V2

| 特性 | V1 | V2 |
|------|----|----|
| 共享策略 | 静态配置 | 动态协商 |
| 类型安全 | 无 | 运行时类型检查 |
| Dev 体验 | 需手动配置 | 自动发现 |
| 版本管理 | 手动 | 语义化版本协商 |
| 去中心化 | 部分 | 完全 |

---

## 底层原理（Why）

### 1. Module Federation V2 配置

```javascript
// host/webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    // 动态远程：运行时决定加载哪个应用
    shop: `shop@${getRemoteUrl('shop')}/remoteEntry.js`,
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.0.0' },
    'react-dom': { singleton: true },
    // 版本协商
    lodash: { singleton: false, version: '^4.17.0' },
  },
});

// remote (shop) webpack.config.js
new ModuleFederationPlugin({
  name: 'shop',
  filename: 'remoteEntry.js',
  exposes: {
    './ProductList': './src/ProductList',
    './Cart': './src/Cart',
    './useCart': './src/hooks/useCart',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});
```

### 2. 去中心化架构

```
去中心化微前端：

┌─────────────────────────────────────────┐
│           App Shell（容器）              │
│  路由注册 │ 全局状态 │ 通信总线 │ 认证    │
└────┬──────────┬──────────┬──────────────┘
     │          │          │
┌────▼───┐ ┌───▼────┐ ┌───▼────┐
│ Team A │ │ Team B │ │ Team C │
│ 独立部署│ │ 独立部署│ │ 独立部署│
│ 独立 CI │ │ 独立 CI │ │ 独立 CI │
│ 独立 DB │ │ 独立 DB │ │ 独立 DB │
└────────┘ └────────┘ └────────┘

每个团队：
├── 独立代码仓库
├── 独立 CI/CD 流水线
├── 独立部署（不影响其他团队）
├── 通过注册表发现其他团队的模块
└── 共享依赖通过版本协商自动解决
```

### 3. 运行时注册表

```typescript
// 模块注册表：运行时发现可用模块
interface ModuleRegistry {
  modules: Record<string, {
    url: string;
    version: string;
    status: 'active' | 'canary' | 'deprecated';
  }>;
}

// 从注册表动态加载远程模块
async function loadRemoteModule(name: string) {
  const registry = await fetch('/api/module-registry').then(r => r.json());
  const module = registry.modules[name];

  if (!module || module.status === 'deprecated') {
    throw new Error(`Module ${name} not available`);
  }

  // 动态加载 remoteEntry.js
  await loadScript(module.url);

  // 初始化容器
  const container = window[name];
  await container.init(__webpack_share_scopes__.default);

  // 获取模块
  const factory = await container.get('./' + name);
  return factory();
}
```

### 4. 共享依赖策略

```
共享依赖冲突解决：

策略 1：Singleton（单例）
├── react, react-dom 全局只允许一个版本
├── 版本不兼容时，使用高版本
└── 风险：可能导致运行时错误

策略 2：版本范围协商
├── 各应用声明可接受的版本范围
├── 运行时选择满足所有范围的最高版本
└── 例如：A 要求 ^4.0.0，B 要求 ^4.1.0 → 使用 4.2.0

策略 3：Eager 加载
├── 宿主应用预加载共享依赖
├── 远程模块直接使用宿主的版本
└── 减少一次网络请求
```

---

## 高频面试题

### Q1: Module Federation V2 解决了 V1 的哪些痛点？

**参考答案要点**：
- 动态远程加载（运行时决定 URL）
- 版本协商机制（自动解决共享依赖冲突）
- 更好的 TypeScript 支持
- Dev 模式自动发现本地远程应用
- 更灵活的共享策略（singleton/eager/strictVersion）

### Q2: 去中心化微前端的挑战？

**参考答案要点**：
- 一致性：Design Token / 主题统一
- 通信：跨应用状态共享和事件通信
- 路由：统一路由注册和导航
- 监控：统一错误追踪和性能监控
- 部署：独立部署但需要集成测试环境

### Q3: 微前端如何处理样式隔离？

**参考答案要点**：
- Shadow DOM：强隔离，但第三方库兼容性问题
- CSS Modules / Scoped CSS：编译时隔离
- BEM 命名约定：约定隔离
- CSS-in-JS：运行时作用域
- 实际方案：CSS Modules + 全局 Design Token 结合

---

## 延伸思考

1. **设计题**：设计一个支持 10+ 团队独立开发的微前端架构。
2. **场景题**：微前端应用的首屏加载时间 5 秒，如何优化？
3. **对比题**：Module Federation vs qiankun vs single-spa，2026 年怎么选？

---

## 参考资料

- [Module Federation V2](https://module-federation.io)
- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Micro Frontends](https://micro-frontends.org)
