---
title: "微前端方案对比 [P8]"
level: "architect"
tags: ["微前端", "Module Federation", "qiankun", "WASM"]
difficulty: "hard"
updated: "2026-09-10"
target: "架构师（P8）"
---

# 微前端方案对比 [P8]

> 微前端是将多个前端应用组合成一个统一用户体验的架构模式。2026 年，Module Federation V2 和 Web Container 方案正在重塑微前端格局。

## 核心概念（What）

### 微前端方案全景

```
微前端方案演进：
├── iframe（最原始，完全隔离）
├── Web Components（浏览器原生）
├── qiankun / single-spa（JS 沙箱隔离）
├── Module Federation（构建时集成）
├── Module Federation V2（去中心化）
└── Web Container / WASM 隔离（2026 新趋势）
```

---

## 底层原理（Why）

### 1. Module Federation V2

```javascript
// 宿主应用配置
// webpack.config.js
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    app1: 'app1@https://cdn.example.com/app1/remoteEntry.js',
    app2: 'app2@https://cdn.example.com/app2/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^19.0.0' },
    'react-dom': { singleton: true },
  },
});

// 远程应用配置
new ModuleFederationPlugin({
  name: 'app1',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/components/Button',
    './utils': './src/utils/index',
  },
  shared: ['react', 'react-dom'],
});
```

### 2. JS 沙箱方案（qiankun）

```javascript
// qiankun 的 JS 沙箱：ProxySandbox
// 通过 Proxy 拦截全局变量访问，实现子应用隔离

class ProxySandbox {
  constructor() {
    const rawWindow = window;
    const fakeWindow = Object.create(null);
    const proxy = new Proxy(fakeWindow, {
      get(target, key) {
        return key in target ? target[key] : rawWindow[key];
      },
      set(target, key, value) {
        target[key] = value;
        return true;
      }
    });
    this.proxy = proxy;
  }
}

// 子应用中的 window.alert 实际访问的是 rawWindow.alert
// 子应用中的 window.customProp 存储在 fakeWindow 中
```

### 3. 方案对比

| 维度 | Module Federation | qiankun | iframe |
|------|------------------|---------|--------|
| 隔离性 | 弱（共享运行时） | 中（JS 沙箱） | 强（完全隔离） |
| 通信成本 | 低（直接引用） | 中（事件总线） | 高（postMessage） |
| 依赖共享 | 原生支持 | 需要配置 | 不支持 |
| 技术栈限制 | 同框架 | 可跨框架 | 无限制 |
| 样式隔离 | 需要手动处理 | 自动（Shadow DOM） | 天然隔离 |
| 性能 | 最优 | 良好 | 较差 |

---

## 高频面试题

### Q1: 微前端的核心挑战是什么？

**参考答案要点**：
- JS 沙箱隔离：防止全局变量污染
- CSS 隔离：防止样式冲突
- 应用间通信：状态共享和事件传递
- 依赖管理：共享依赖避免重复加载
- 路由协调：主应用和子应用的路由同步

### Q2: Module Federation 和 qiankun 如何选择？

**参考答案要点**：
- Module Federation：同技术栈、追求性能、构建时集成
- qiankun：跨技术栈、需要隔离、运行时集成
- Module Federation 性能更好但隔离性弱
- qiankun 隔离性更好但性能开销大

### Q3: 如何设计微前端的通信机制？

**参考答案要点**：
- 全局事件总线（EventBus）
- 共享状态（Redux/Zustand 实例）
- URL 参数传递
- CustomEvent + window
- Module Federation 的 shared 机制

---

## 延伸思考

1. **设计题**：设计一个支持 10+ 子应用的微前端架构。
2. **场景题**：微前端应用中如何处理共享状态和登录态？
3. **对比题**：Module Federation V2 vs Web Container vs iframe 2.0？

---

## 参考资料

- [Module Federation 文档](https://module-federation.io)
- [qiankun 文档](https://qiankun.umijs.org)
- [微前端架构设计](https://micro-frontends.org)
