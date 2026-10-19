---
title: 'Module Federation V2 架构 [P8]'
level: 'architect'
tags: ['Module Federation', '微前端', '模块共享', '去中心化', '运行时加载']
difficulty: 'expert'
target: '架构师（P8）'
---

# Module Federation V2 架构 [P8]

> Module Federation V2 是 2026 年微前端架构的核心技术。从 V1 的静态远程加载演进到 V2 的动态运行时加载 + 去中心化架构 + 版本协商机制，彻底解决了大型团队的独立部署问题。

## 核心概念（What）

### 核心能力

| 能力                | 说明                              |
| ------------------- | --------------------------------- |
| **远程模块加载**    | 运行时动态加载其他应用的组件/模块 |
| **双向共享**        | Host 和 Remote 可以互相共享模块   |
| **版本协商**        | 共享依赖自动解决版本冲突          |
| **去中心化**        | 无需中心化注册表，应用间对等发现  |
| **TypeScript 支持** | 跨应用类型推导                    |

---

## 底层原理（Why）

### 1. 模块联邦运行时加载协议

MF 的底层不是「动态 import 远程 JS」，而是**remoteEntry.js 协议 + init 协商 + get 加载的三阶段运行时协议**。

```
Module Federation 运行时协议：

  Phase 1: 远程入口加载
    ├── Host 应用通过 <script> 标签加载 remoteEntry.js
    ├── remoteEntry.js 注册一个全局容器（window[remoteName]）
    ├── 容器暴露两个方法：init() 和 get()
    └── 此时远程模块的代码尚未加载（只加载了入口文件）

  Phase 2: init 协商（共享依赖版本协商）
    ├── Host 调用 container.init(sharedScope)
    │   ├── sharedScope 包含 Host 已加载的共享模块
    │   │   { 'react': { version: '18.2.0', get: () => Promise<React> } }
    │   ├── Remote 检查 sharedScope 中的共享模块
    │   ├── 对比 Remote 声明的版本要求（requiredVersion）
    │   │   ├── 满足 → 使用 Host 提供的版本（避免重复加载）
    │   │   └── 不满足 → Remote 加载自己的版本
    │   └── 协商结果缓存（下次加载跳过协商）
    └── 关键：singleton: true 的模块（如 React）全局只允许一个版本

  Phase 3: get 加载（按需获取模块）
    ├── Host 调用 container.get('./ModulePath')
    ├── Remote 返回一个工厂函数（factory）
    ├── 调用 factory() 得到模块导出
    └── 后续调用直接返回缓存（不重复加载）

  性能优化：
    ├── remoteEntry.js 体积极小（~1KB，只包含元数据）
    ├── 实际模块代码按需加载（懒加载）
    ├── 共享模块只加载一次（全局单例）
    └── 浏览器缓存 remoteEntry.js（文件名包含 contenthash）
```

### 2. 去中心化架构：对等发现 + 运行时注册表

去中心化的底层不是「去掉 App Shell」，而是**每个应用既是 Host 又是 Remote + 运行时注册表动态发现**。

```
去中心化架构底层：

  V1 架构（中心化）的局限：
    ├── 一个固定的 Host 应用（容器）
    ├── 所有 Remote 的 URL 在编译时写死
    ├── 新增/移除 Remote 需要重新部署 Host
    └── 无法实现真正的独立部署

  V2 架构（去中心化）的核心创新：
    ├── 每个应用既是 Host 又是 Remote（对等关系）
    ├── 远程 URL 在运行时从注册表获取（不是编译时写死）
    ├── 新增 Remote 只需更新注册表（不需要重新部署任何应用）
    └── 每个应用独立部署、独立升级

  运行时注册表协议：
    ├── 注册表是一个 JSON 服务（/api/module-registry）
    ├── 内容：{ moduleName: { url, version, status } }
    ├── 应用启动时从注册表获取可用模块列表
    ├── 根据 status 过滤（active / canary / deprecated）
    └── 缓存注册表结果（定期刷新）

  金丝雀发布支持：
    ├── 注册表可以返回不同版本的 URL（按用户/百分比分流）
    ├── 10% 用户加载 canary 版本 → 监控错误率 → 全量发布
    └── 回滚 = 更新注册表（秒级生效，无需重新部署）
```

### 3. 共享依赖的版本协商算法

版本协商的底层不是「取最高版本」，而是**语义化版本范围交集 + 运行时 fallback 链**。

```
版本协商算法：

  协商流程：
    1. 每个应用声明共享依赖的版本范围：
       ├── Host: react ^18.0.0
       └── Remote: react ^18.2.0
    2. 计算版本范围的交集：
       ├── ^18.0.0 ∩ ^18.2.0 = ^18.2.0
       └── 如果交集为空 → 版本冲突（加载两份或报错）
    3. 在交集范围内选择最高可用版本
    4. 如果 Host 已加载的版本在交集内 → Remote 直接使用
    5. 如果不在 → Remote 加载自己的版本（fallback）

  singleton: true 的特殊行为：
    ├── 全局只允许一个实例（React、ReactDOM 等）
    ├── 即使版本不完全兼容，也强制使用一个版本
    ├── 协商策略：取满足最多应用的版本
    └── 风险：可能导致微妙的运行时 bug（React Hooks 上下文丢失）

  eager: true 的优化：
    ├── Host 在启动时预加载共享依赖
    ├── Remote 初始化时直接同步获取（无需异步加载）
    └── 减少一次网络请求（首屏性能优化）

  实际生产建议：
    ├── React/ReactDOM → singleton: true（必须全局唯一）
    ├── 工具库（lodash/dayjs）→ singleton: false（允许多版本共存）
    └── 业务组件库 → 不共享（各团队独立维护版本）
```

---

## 高频面试题

### Q1: Module Federation V2 解决了 V1 的哪些痛点？

**参考答案要点**：

- 动态远程加载（运行时决定 URL，不再编译时写死）
- 版本协商机制（自动解决共享依赖冲突）
- 更好的 TypeScript 支持（跨应用类型推导）
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
