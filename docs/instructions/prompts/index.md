---
title: 提示词集
---

# 提示词集

面向 AI 助手的编程提示词模板集合。每个 Prompt 均可**一键复制，替换 `[方括号]` 后直接粘贴到 AI 聊天框使用**。

## 提示词索引

## A. 通用提示词（框架无关）

> 详见 [通用提示词集](./base-sentence)

| 编号 | 场景          | 一句话说明                                                   |
| ---- | ------------- | ------------------------------------------------------------ |
| A1   | 组件/模块开发 | 新组件/模块的标准开发模板，含 TS 类型、交互细节、逻辑分离    |
| A2   | Bug 调试      | 结构化描述 Bug 现象 + 已尝试方案，让 AI 快速定位根因并修复   |
| A3   | 代码重构      | 按 SOLID/DRY 等原则重构，保持功能不变并给出核心变更说明      |
| A4   | 数据处理      | 复杂 JSON 转换、树结构互转、统计聚合，封装为纯函数含边界处理 |

## B. Vue 组件开发（日常高频）

> 详见 [Vue 提示词集](./vue/prompts)

| 编号 | 场景            | 一句话说明                                                               |
| ---- | --------------- | ------------------------------------------------------------------------ |
| VB1   | 新建基础组件    | `script setup` + TS，含 defineProps 泛型、defineEmits、defineExpose      |
| VB2   | 新建表单组件    | 带 v-model 双向绑定、字段联动、校验规则、异步校验、错误提示              |
| VB3   | 新建列表/表格   | useTable composable 封装分页请求，含搜索栏展开收起、排序、空状态         |
| VB4   | 新建弹窗组件    | defineModel 控制显隐 + default 插槽 + confirm/cancel 事件 + loading 防抖 |
| VB5   | 组件大文件拆解  | 将 >300 行组件拆为主组件(布局) + composable(逻辑) + 子组件(UI) + utils   |
| VB6   | 组件性能优化    | 排查 shallowRef/v-memo/虚拟滚动/watchEffect，给出优化代码和性能说明      |
| VB7   | Composable 提取 | 从组件提取 useXxx 函数，返回解构友好对象，含 loading 和错误处理          |
| VB8   | 样式穿透与主题  | :deep() 正确覆盖组件库样式 + CSS 变量亮暗主题切换 + 优先级控制           |

## C. Vue 生态与架构

| 编号 | 场景         | 一句话说明                                                            |
| ---- | ------------ | --------------------------------------------------------------------- |
| VB9   | Pinia Store  | Setup Store 语法 + Getters 计算 + 异步 Action 含 loading + 字段持久化 |
| VB10  | 路由与权限   | 登录后动态挂载路由 + v-permission 按钮指令 + 路由守卫 + 面包屑        |
| VB11  | ECharts 封装 | 通用 BaseChart 组件，markRaw 防代理 + ResizeObserver + 点击事件 emit  |
| VB12  | H5 移动端    | 触底加载 + 下拉刷新 + IntersectionObserver 图片懒加载 + px 转 vw      |

## D. React 组件开发（日常高频）

> 详见 [React 提示词集](./react/prompts)（基于 React 19）

| 编号 | 场景             | 一句话说明                                                                   |
| ---- | ---------------- | ---------------------------------------------------------------------------- |
| RB1   | 新建基础组件     | 函数组件 + TS，ref as prop（免 forwardRef）、解构默认参数（免 defaultProps） |
| RB2   | 新建表单组件     | `<form action>` + useActionState + useFormStatus + useOptimistic 新范式      |
| RB3   | 新建列表/表格    | useTable Hook + useTransition/useDeferredValue + Suspense + TanStack Query   |
| RB4   | 新建弹窗组件     | createPortal + 焦点管理 + Esc 关闭 + useImperativeHandle 暴露方法            |
| RB5   | 组件大文件拆解   | Container/Presentational + Custom Hooks + utils + types.ts（Compiler 友好）  |
| RB6   | 组件性能优化     | React Compiler / useTransition / useDeferredValue / 虚拟滚动 / RSC 边界下沉  |
| RB7   | Custom Hook 提取 | useXxx 返回解构友好对象，含 AbortController 竞态、cleanup、StrictMode 幂等   |
| RB8   | 样式与主题       | CSS Modules / Tailwind / next-themes + React 19 `precedence` 样式优先级      |

## E. React 生态与架构

| 编号 | 场景         | 一句话说明                                                                 |
| ---- | ------------ | -------------------------------------------------------------------------- |
| RC1   | 状态管理     | Zustand + devtools/persist 中间件 + 细粒度 selector + useShallow 防重渲染  |
| RC2   | 路由与权限   | React Router v7 loader / Next.js middleware + Permission 组件 + 懒加载路由 |
| RC3   | ECharts 封装 | ref as prop + useImperativeHandle + ResizeObserver + dispose 防内存泄漏    |
| RC4   | H5 移动端    | IntersectionObserver 触底 + 下拉刷新 + 虚拟滚动 + dvh + @use-gesture/react |

## F. React 19 新特性专属

| 编号 | 场景                       | 一句话说明                                                                     |
| ---- | -------------------------- | ------------------------------------------------------------------------------ |
| RD1   | Server Components 设计     | 'use client' 边界划分 + Server Actions + 流式 Suspense + 序列化约束            |
| RD2   | use() API 与 Suspense      | 声明式消费 Promise/Context + Promise 缓存 + 错误冒泡到 ErrorBoundary           |
| RD3   | Actions 三剑客             | useActionState + useFormStatus + useOptimistic 组合的表单/异步交互范式         |
| RD4   | Document Metadata & 预加载 | 原生 `<title>`/`<meta>` + `<link precedence>` + preload/preconnect/prefetchDNS |
| RD5   | Ref 新语义                 | ref as prop + ref callback cleanup + useImperativeHandle + useRef 初值必填     |
| RD6   | ErrorBoundary 与错误报告   | onCaughtError/onUncaughtError/onRecoverableError + 分层边界 + Sentry 上报      |

## G. Flutter 页面与 Widget 开发（日常高频）

> 详见 [Flutter 提示词集](./flutter/prompts)（基于 Flutter 3.24+ + GetX 4.6+）

| 编号 | 场景             | 一句话说明                                                                      |
| ---- | ---------------- | ------------------------------------------------------------------------------- |
| FB1   | 新建基础页面     | GetView + Controller + Binding 三件套，.obs 响应式，Material 3 主题             |
| FB2   | 新建表单页面     | Form + GlobalKey + validator + 异步防抖校验 + 键盘遮挡处理                      |
| FB3   | 新建列表页面     | SmartRefresher + 四态切换 + 图片降采样 + 防抖搜索                               |
| FB4   | 弹窗/底部弹层    | Get.dialog / Get.bottomSheet / Get.snackbar + PopScope 拦截 Android 返回键      |
| FB5   | 大 Widget 拆解   | View/widgets/controller/domain/data 分层，Obx 粒度最小化，Controller Mixin 复用 |
| FB6   | 性能优化         | Widget 重建/列表性能/动画隔离/图片降采样/内存泄漏/Impeller/Isolate.run          |
| FB7   | Controller 进阶  | Worker(ever/once/debounce/interval) + 跨 Controller 通信 + permanent 全局状态   |
| FB8   | 主题与响应式布局 | Material 3 亮暗切换 + flutter_screenutil + 断点布局 + GetX 国际化 .tr           |

## H. GetX 生态与架构

| 编号 | 场景         | 一句话说明                                                                         |
| ---- | ------------ | ---------------------------------------------------------------------------------- |
| FC1   | 路由系统     | GetMaterialApp + GetPage + Binding + GetMiddleware（登录守卫/埋点） + 转场动画     |
| FC2   | 网络与数据层 | Dio 拦截器 + ApiResult sealed class + Token 刷新并发队列 + CancelToken + 缓存降级  |
| FC3   | 全局状态     | AuthController / ThemeController permanent 注入 + GetStorage 持久化 + 登出清理流程 |
| FC4   | 本地存储     | GetStorage / Hive / sqflite 选型 + Repository 封装 + 敏感数据加密 + 版本迁移       |

## I. Flutter 3 新特性与最佳实践

| 编号 | 场景                      | 一句话说明                                                                             |
| ---- | ------------------------- | -------------------------------------------------------------------------------------- |
| FD1   | Material 3 与 WidgetState | WidgetStateProperty 重命名 + M3 主题与新组件（FilledButton/SegmentedButton/SearchBar） |
| FD2   | Dart 3 新特性             | Records / Patterns / sealed class / if-case / extension types 重构旧代码               |
| FD3   | Isolate 与 CPU 密集任务   | Isolate.run 自动创建销毁 + TransferableTypedData 零拷贝 + 长驻 Isolate 双向通信        |
| FD4   | 多平台适配                | Android/iOS/Web/Desktop 差异 + 权限统一封装 + 平台通道(pigeon) + 构建产物              |
| FD5   | 状态管理选型对比          | GetX vs Riverpod vs Bloc vs Provider 多维度对比 + 项目选型建议                         |

## J. Dart 通用与异步

| 编号 | 场景                 | 一句话说明                                                                   |
| ---- | -------------------- | ---------------------------------------------------------------------------- |
| FE1   | 数据处理             | Dart 3 collection methods + Records/Patterns + 空安全 + Iterable 惰性求值    |
| FE2   | 异步流程控制         | Future.wait / Stream / CancelToken 竞态 / 防抖节流 / 重试指数退避            |
| FE3   | 工具函数与 extension | extension on String/DateTime/BuildContext + 正则预编译 + 单元测试            |
| FE4   | Widget 与集成测试    | flutter_test + mocktail + Golden 快照 + integration_test + GetX 测试注意事项 |

## K. 移动端专项

| 编号 | 场景               | 一句话说明                                                                    |
| ---- | ------------------ | ----------------------------------------------------------------------------- |
| FF1   | 长列表与滚动性能   | ListView.builder + itemExtent + CachedNetworkImage + RepaintBoundary          |
| FF2   | 动画与手势交互     | 隐式/显式动画 + Hero 共享元素 + Rive/Lottie + RawGestureDetector              |
| FF3   | 推送/权限/硬件能力 | FCM 三态推送 + permission_handler + 相机相册 + 生物识别 + BLE + 深链接        |
| FF4   | 发布与 CI/CD       | Android keystore/AAB + iOS ipa + GitHub Actions + 多环境 dart-define + Sentry |

## L. JavaScript 通用

| 编号 | 场景         | 一句话说明                                                          |
| ---- | ------------ | ------------------------------------------------------------------- |
| C1   | 数据结构处理 | 过滤/平铺/树转换/分组统计，优先 ES6+ 数组方法，含空数据边界处理     |
| C2   | 异步流程控制 | Promise.all/串行/AbortSignal.timeout/搜索竞态，async/await 完整实现 |
| C3   | 工具函数封装 | structuredClone/防抖节流/Intl 日期格式化，含 TS 类型和测试用例      |
| C4   | DOM 原生操作 | 原生 JS 实现弹窗/瀑布流/拖拽，含节流+样式隔离+销毁方法              |

## M. Web/H5 应用

| 编号 | 场景          | 一句话说明                                                   |
| ---- | ------------- | ------------------------------------------------------------ |
| D1   | H5 无限滚动   | 触底加载 + 下拉刷新 + 图片懒加载占位图 + iOS 滑动无白屏      |
| D2   | PC 响应式页面 | 适配 1920/1440/平板 + 滚动入场动画 + hover 交互 + 语义化 SEO |
| D3   | H5 活动页     | requestAnimationFrame 精准倒计时 + 埋点预留 + 结束自动置灰   |
| D4   | 多端适配      | Media Queries + useDevice Hook + Pointer Events 统一处理     |

## 使用方式

1. 从上方索引找到匹配场景的编号
2. 点击进入对应详情页，找到该编号的 Prompt
3. 复制代码块中的内容
4. 替换 `[方括号]` 为你的实际参数
5. 粘贴到 AI 聊天框发送

## 与指令集的关系

| 类型                  | 定位              | 使用方式             |
| --------------------- | ----------------- | -------------------- |
| **提示词集**（本页）  | 单条即用型 Prompt | 复制单条粘贴给 AI    |
| [指令集](../index.md) | 完整架构工作流    | 整个目录拷贝到项目中 |
