---
title: Flutter 提示词集
---

# Flutter 提示词集

面向 Flutter 3 + GetX 开发场景的 AI 提示词集合。每个 Prompt 用代码块包裹，**复制后替换 `[方括号]` 内容即可直接使用**。

> 版本基线：**Flutter 3.24+ / Dart 3.5+ / GetX 4.6+**。默认使用 Material 3、`WidgetStateProperty`（替代旧 `MaterialStateProperty`）、空安全（null safety）、Impeller 渲染引擎（iOS/Android）。

---

## B. Flutter 页面与 Widget 开发（日常高频）

## FB1. 新建基础页面（GetView + Binding）

> 适用：创建一个标准 GetX 页面，含 Controller / View / Binding 三件套

```text
请先阅读 ./constraints.md 作为基础上下文。
编写 [页面名] 页面，技术栈：[Dio / GetConnect] + [cached_network_image / shimmer]。
目录：lib/features/[feature]/{data,domain,presentation}/
给出完整三件套代码、路由配置、参数传递示例。
```

---

## FB2. 新建表单页面（TextEditingController + 校验）

> 适用：登录 / 注册 / 编辑类带校验的表单

```text
请先阅读 ./constraints.md 作为基础上下文。
编写 [表单名] 表单页面。
字段：
1. [字段1] - [校验规则]
2. [字段2] - [校验规则]
含 Form 校验、异步防抖、键盘类型/遮挡处理、防重复提交。
```

---

## FB3. 新建列表页面（下拉刷新 + 上拉加载 + 空态）

> 适用：分页数据列表，含刷新、加载、空态、错误态

```text
请先阅读 ./constraints.md 作为基础上下文。
封装 [业务名] 分页列表页面。
含 SmartRefresher 下拉刷新/上拉加载、四态切换、骨架屏、图片降采样、防抖搜索、回到顶部。
```

---

## FB4. 弹窗 / 底部弹层 / 全屏对话框

> 适用：确认弹窗、底部选择器、自定义 Dialog

```text
请先阅读 ./constraints.md 作为基础上下文。
封装通用 [弹窗类型] 弹窗组件。
支持 Get.dialog / Get.bottomSheet / Get.snackbar、返回值处理、loading、PopScope 返回键拦截、主题适配。
```

---

## FB5. 大 Widget 拆解与目录组织

> 适用：将超过 300 行的大页面拆分为模块化架构

```text
请先阅读 ./constraints.md 作为基础上下文。
页面超过 [N] 行，职责：[描述]，问题：[如：build 太长 / 状态业务耦合]。
按主 View + 子 Widget + Controller + domain + data 架构拆解，给出目录结构和编排代码。
```

---

## FB6. 性能优化（Flutter DevTools 排查）

> 适用：解决掉帧、内存泄漏、启动慢等性能问题

```text
请先阅读 ./constraints.md 作为基础上下文。
应用存在性能问题：[如：列表掉帧 / 内存增长 / 启动慢]。
当前代码：
[粘贴代码]
请排查并给出优化方案。
```

---

## FB7. Controller 与状态管理进阶

> 适用：复杂状态流转、跨 Controller 通信、Worker

```text
请先阅读 ./constraints.md 作为基础上下文。
使用 GetX 实现 [业务场景，如：多 Tab 联动 / 购物车全局状态]。
含状态定义、响应式消费、Worker 副作用、跨 Controller 通信、持久化。
```

---

## FB8. 主题、暗色模式与响应式布局

> 适用：Material 3 主题定制、亮暗切换、多设备适配

```text
请先阅读 ./constraints.md 作为基础上下文。
配置完整主题系统与响应式布局方案。
含 Material 3 主题、暗色模式切换、flutter_screenutil 适配、断点布局、GetX 国际化。
```

---

## C. GetX 生态与架构

## FC1. 路由系统与页面导航

> 适用：命名路由、路由守卫、参数传递、深层链接

```text
请先阅读 ./constraints.md 作为基础上下文。
搭建 [项目名] 完整路由系统。
含 GetMaterialApp 配置、导航 API、参数传递、转场动画、GetMiddleware 登录守卫、深层链接、PopScope 返回拦截。
```

---

## FC2. 网络请求与数据层

> 适用：Dio / GetConnect 封装、拦截器、Token 刷新、错误统一处理

```text
请先阅读 ./constraints.md 作为基础上下文。
使用 [Dio 5 / GetConnect] 封装网络层。
含 ApiResult sealed class、拦截器（Token/错误/日志）、Token 刷新并发队列、缓存降级、文件上传下载、重试机制。
```

---

## FC3. 全局状态：登录态 / 用户信息 / 主题

> 适用：跨页面共享的全局状态管理

```text
请先阅读 ./constraints.md 作为基础上下文。
设计 [项目名] 全局状态方案。
含 AuthController/ThemeController permanent 注入、GetStorage 持久化、登录态判断、登出清理流程。
```

---

## FC4. 本地存储与离线数据

> 适用：Hive / GetStorage / sqflite 数据持久化

```text
请先阅读 ./constraints.md 作为基础上下文。
使用 [GetStorage / Hive / sqflite] 实现本地存储层。
含存储选型、Repository 封装、敏感数据加密、数据迁移、缓存清理策略。
```

---

## D. Flutter 3 新特性与最佳实践

## FD1. Material 3 与 WidgetStateProperty

> 适用：迁移到 Material 3、使用新 API 替代过时 API

```text
请先阅读 ./constraints.md 作为基础上下文。
将以下代码迁移到 Flutter 3.24+ Material 3 规范：
[粘贴旧代码]
```

---

## FD2. Dart 3 新特性（Records / Patterns / sealed class）

> 适用：使用 Dart 3 现代语法编写更简洁的代码

```text
请先阅读 ./constraints.md 作为基础上下文。
使用 Dart 3 新特性重构以下代码：
[粘贴旧代码]
含 Records / Patterns / sealed class / if-case / extension types。
```

---

## FD3. Isolate 与 CPU 密集任务

> 适用：JSON 解析、图片处理、加密计算等重 CPU 场景

```text
请先阅读 ./constraints.md 作为基础上下文。
使用 Isolate 处理 [场景，如：大 JSON 解析 / 图片压缩]。
含 Isolate.run、长驻 Isolate 双向通信、TransferableTypedData 零拷贝。
```

---

## FD4. 平台适配（Android / iOS / Web / Desktop）

> 适用：一套代码多端运行，处理平台差异

```text
请先阅读 ./constraints.md 作为基础上下文。
配置多平台适配方案（Android / iOS / Web / Desktop）。
含平台判断、UI 差异、权限封装、文件系统、键盘快捷键、平台通道 pigeon、构建产物。
```

---

## FD5. 状态管理方案选型对比（GetX vs 其他）

> 适用：项目初期技术选型 or 混合使用

```text
请先阅读 ./constraints.md 作为基础上下文。
对比 Flutter 3 主流状态管理方案（GetX / Riverpod / Bloc / Provider），项目特点：[描述]。
给出选型结论、代码示例对比、迁移成本评估。
```

---

## E. Dart 通用与异步流程

## FE1. 复杂数据结构处理

> 适用：JSON 转换、树结构、分组统计

```text
请先阅读 ./constraints.md 作为基础上下文。
数据：[粘贴或描述结构]
转换：过滤 [条件] → 转换 [如：列表转树] → 统计 [字段]。
使用 Dart 3 collection methods + Records/Patterns，含空安全和边界处理。
```

---

## FE2. 异步流程控制（Future / Stream / Isolate）

> 适用：并发请求、串行请求、超时、竞态、流处理

```text
请先阅读 ./constraints.md 作为基础上下文。
场景：[如：并发 5 个接口 / 串行请求 / 搜索防竞态 / 实时消息流]。
含 Future.wait、CancelToken 竞态、timeout、防抖节流、重试指数退避、Stream 处理。
```

---

## FE3. 工具函数与扩展方法（extension）

> 适用：常用工具封装、类型扩展

```text
请先阅读 ./constraints.md 作为基础上下文。
封装 [功能名] 工具函数，使用 Dart 3 extension，含 intl 国际化、正则预编译、单元测试。
```

---

## FE4. Widget 测试与集成测试

> 适用：单元测试、Widget 测试、集成测试

```text
请先阅读 ./constraints.md 作为基础上下文。
为 [组件名 / Controller 名] 编写测试用例。
含单元测试（mocktail）、Widget 测试、Golden 快照、GetX 测试注意事项。
```

---

## F. 移动端专项

## FF1. 长列表与滚动性能

> 适用：商品列表、聊天记录、信息流

```text
请先阅读 ./constraints.md 作为基础上下文。
开发 [业务名] 高性能长列表，数据量：[如：>1000 条]。
含列表选型、CachedNetworkImage 降采样、分页懒加载、const 优化、RepaintBoundary、回到顶部。
```

---

## FF2. 动画与手势交互

> 适用：转场动画、共享元素、复杂手势

```text
请先阅读 ./constraints.md 作为基础上下文。
实现 [动画场景，如：Hero 转场 / 卡片翻转 / 拖拽排序]。
含隐式/显式动画、手势处理、Rive/Lottie、RepaintBoundary 性能隔离。
```

---

## FF3. 推送 / 权限 / 硬件能力

> 适用：Firebase 推送、定位、相机、蓝牙

```text
请先阅读 ./constraints.md 作为基础上下文。
集成 [能力，如：FCM 推送 / 定位 / 相机 / 蓝牙 / 生物识别]。
含权限封装、iOS/Android 配置、错误处理与降级。
```

---

## FF4. 发布与 CI/CD

> 适用：打包、签名、渠道分发、自动化构建

```text
请先阅读 ./constraints.md 作为基础上下文。
配置 [平台] 完整发布流程。
含签名打包、混淆分包、CI/CD（GitHub Actions）、多环境 dart-define、崩溃监控、灰度发布。
```

---

## Flutter 3 + GetX 迁移速查表

从 Flutter 2 / GetX 3 迁移到 Flutter 3.24+ 时，以下写法需要更新（可作为 Prompt 补充指令）：

```text
请先阅读 ./constraints.md 作为基础上下文。
请按 Flutter 3 + GetX 4.6 迁移规范检查并改写以下代码：
[粘贴旧代码]

迁移清单：
1. ❌ `MaterialStateProperty` → ✅ `WidgetStateProperty`
2. ❌ `MaterialState.selected` → ✅ `WidgetState.selected`
3. ❌ `useMaterial3: false` → ✅ `useMaterial3: true`（默认）
4. ❌ `TextTheme.headline1..6` → ✅ `TextTheme.displayLarge..small / titleLarge..small / bodyLarge..small`
5. ❌ `primarySwatch` → ✅ `colorScheme: ColorScheme.fromSeed(seedColor: ...)`
6. ❌ `RaisedButton` / `FlatButton` → ✅ `ElevatedButton` / `TextButton` / `FilledButton`
7. ❌ `WillPopScope` → ✅ `PopScope(canPop:, onPopInvokedWithResult:)`
8. ❌ `ButtonBar` → ✅ `OverflowBar`
9. ❌ `Scrollbar.isAlwaysShown` → ✅ `Scrollbar.thumbVisibility`
10. ❌ `RawKeyboardListener` → ✅ `KeyboardListener` / `Focus.onKeyEvent`
11. ❌ `ElevatedButton.styleFrom(primary:, onSurface:)` → ✅ `styleFrom(backgroundColor:, foregroundColor:, disabledBackgroundColor:)`
12. ❌ `Get.put()` 在 build 内 → ✅ Binding 中 `Get.lazyPut()`
13. ❌ `GetBuilder<T>(init: T())` → ✅ Binding 注册 + `GetBuilder<T>(builder: ...)`
14. ❌ 手动 setState → ✅ `.obs` + `Obx()` 或 `update()` + `GetBuilder`
15. ❌ Navigator.push → ✅ Get.to / Get.toNamed
16. ❌ showDialog / showModalBottomSheet → ✅ Get.dialog / Get.bottomSheet（统一栈管理）
17. ❌ 硬编码颜色 → ✅ Theme.of(context).colorScheme.xxx
18. ❌ `Scaffold.of(context).showSnackBar` → ✅ `Get.snackbar` 或 `SnackBarAction`
19. ❌ 手动 MediaQuery.of(context).size → ✅ `Get.width` / `Get.height` / `Get.context`
20. ❌ 字符串拼接多语言 → ✅ `'key'.tr` + translations map
```

---

## 提问技巧（Flutter 3 + GetX 专属）

1. **强制版本**：开头声明「基于 Flutter 3.24+ / Dart 3.5+ / GetX 4.6+」，避免 AI 输出过时 API（MaterialStateProperty / WillPopScope 等）
2. **说明 GetX 使用范围**：明确「使用 GetX 全家桶（路由+DI+状态+国际化）」或「仅用 GetX 状态管理，路由用 go_router」
3. **平台上下文**：说明目标平台（Android / iOS / Web / Desktop），影响权限、动画、UI 规范
4. **赋予角色**：「你是一名精通 Flutter 3 与 GetX 架构的资深移动端工程师」
5. **给例子（Few-Shot）**：贴上项目现有 Controller / View 风格，让 AI 保持一致
6. **分步思考**：复杂逻辑前加「请先分析实现思路（含 Widget 树结构、状态流转、生命周期），再生成代码」
7. **性能优先提示**：明确「代码需通过 Flutter DevTools Performance 检查，避免不必要的 rebuild」
