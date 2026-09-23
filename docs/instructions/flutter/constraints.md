---
title: Flutter 提示词约束
---

# Flutter 提示词约束

> 本文件作为 Flutter 提示词的**基础上下文**，由 AI 助手在回答前自动读取。包含所有 Flutter 提示词共享的技术约束和编码约定。

---

## 版本基线

- **Flutter 3.24+** / **Dart 3.5+** / **GetX 4.6+**
- 启用空安全（null safety）
- Impeller 渲染引擎（iOS/Android）
- Material 3 默认开启

## 目录结构

- 按功能模块分层：`lib/features/[feature]/{data,domain,presentation}/`
- presentation 层：views/ + widgets/ + controllers/
- domain 层：entities/ + repositories/ + usecases/
- data 层：models/ + datasources/ + repositories/

## GetX View 层规范

- 继承 `GetView<Controller>`，禁止不必要的 StatefulWidget
- 响应式区域使用 `Obx(() => ...)` 包裹，**最小化重建范围**
- 颜色使用 `Theme.of(context).colorScheme` 语义色，禁止硬编码
- 使用 Material 3 组件：FilledButton / SegmentedButton / SearchBar 等

## GetX Controller 规范

- 继承 `GetxController`
- 状态字段使用 `Rx<T>` 或 `.obs`（如 `final count = 0.obs`）
- 生命周期：`onInit()` 拉数据 → `onReady()` 首帧后动画 → `onClose()` 释放资源
- 异步方法 `Future<void>` + try/catch/finally，loading 用 `RxBool`
- **禁止在 build 方法内 `Get.put`**

## GetX Binding 规范

- 实现 `Bindings` 类，`dependencies()` 内使用 `Get.lazyPut<Controller>(() => Controller())`
- 路由注册：`GetPage(name: '/xxx', page: () => XxxView(), binding: XxxBinding())`

## GetX 响应式消费

- `Obx(() => ...)` — 自动订阅，粒度最小化
- `GetX<Controller>(builder: ...)` — 组合 Obx + GetBuilder + DI
- `GetBuilder<Controller>(builder: ..., id: 'xxx')` — 手动 `update(['xxx'])`，性能更好
- 跨 Controller 通信：`Get.find<OtherController>()`
- 全局 Controller：`Get.put(Controller(), permanent: true)`

## GetX Worker

- `ever` / `once` / `debounce` / `interval`
- **必须在 `onInit` 中创建，`onClose` 中 `worker.dispose()`**

## Material 3 规范

- `WidgetStateProperty` 替代旧 `MaterialStateProperty`
- 使用 `ColorScheme.fromSeed(seedColor: ...)` 替代 `primarySwatch`
- 新组件：FilledButton / SegmentedButton / SearchBar / Badge / NavigationDrawer

## 性能优化

- 列表使用 `ListView.builder` / `GridView.builder`，禁止 `ListView(children:)`
- 图片使用 `cached_network_image` + `cacheWidth`/`cacheHeight` 降采样
- `RepaintBoundary` 隔离动画区域
- `const` 构造优先，减少 Widget 重建
- Obx 粒度最小化，避免整页 Obx

## 代码组织

- 页面文件不超过 300 行，超出按以下架构拆解：
  - 主 View（布局编排，≤200 行）
  - 子 Widget（widgets/ 目录，独立 UI 片段）
  - Controller 按职责拆分
  - domain/（Entity / Repository / UseCase）
  - data/（RemoteDataSource / LocalDataSource / Model）
- 常量抽到 `constants.dart`，工具函数抽到 `formatters.dart` / `validators.dart`
- 主题集中在 `app_theme.dart`

## 输出要求

- 提供完整可运行的代码，包含必要的 import
- 遵循 GetX 三件套（View + Controller + Binding）
- 提供路由配置示例
