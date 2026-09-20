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
请使用 Flutter 3 + GetX 编写 [页面名，如：用户详情] 页面。
技术栈：GetX 4.6+ + [Dio / GetConnect] + [cached_network_image / shimmer]
目录约定：lib/features/[feature]/{data,domain,presentation}/

要求（GetX 标准三件套）：
1. **View（页面）**：继承 GetView<[Controller]>，禁止 StatefulWidget（除非确有需要）
   - build 方法内通过 `controller.xxx` 访问状态
   - 响应式区域使用 Obx(() => ...) 包裹，最小化重建范围
   - Material 3：使用 `Theme.of(context).colorScheme` 语义色，禁止硬编码颜色
2. **Controller**：继承 GetxController
   - 状态字段使用 `Rx<T>` 或 `.obs`（如 `final count = 0.obs`）
   - 生命周期：`onInit()` 拉数据、`onReady()` 首帧后动画、`onClose()` 释放 Timer/StreamSubscription
   - 异步方法使用 `Future<void>` + try/catch/finally，loading 状态用 `RxBool`
3. **Binding**：实现 Bindings 类，`dependencies()` 内使用 `Get.lazyPut<[Controller]>(() => [Controller]())`
4. **路由注册**：在 app_pages.dart 添加 `GetPage(name: '/xxx', page: () => XxxView(), binding: XxxBinding())`
5. **常量与类型**：抽离到 constants.dart / models.dart，View 内禁止硬编码字符串

请给出：完整三件套代码、路由配置、Binding 注册、页面参数传递（Get.arguments / Get.parameters）示例。
```

---

## FB2. 新建表单页面（TextEditingController + 校验）

> 适用：登录 / 注册 / 编辑类带校验的表单

```text
请使用 Flutter 3 + GetX 编写 [表单名，如：登录 / 注册 / 商品发布] 表单页面。
字段：
1. [字段1，如：手机号] - [校验规则，如：必填 + 11 位数字正则]
2. [字段2，如：密码] - [校验规则，如：必填 + 8-20 位 + 含数字字母]
3. [字段3，如：验证码] - [异步校验 / 60 秒倒计时]

要求：
- **表单容器**：使用 Form + GlobalKey<FormState>，或 GetX 的 GetForm（少用）
- **控制器**：Controller 中定义 `final phoneController = TextEditingController()`，onClose 中 dispose
- **校验**：TextFormField 的 validator 返回 String? 表示错误信息
- **异步校验**：使用 `autovalidateMode: AutovalidateMode.onUserInteraction` + 防抖（debounce）
- **提交**：Form.validate() 通过后调用 controller.submit()，配合 Obx 显示 loading
- **UI 细节**：
  - 密码框支持 obscureText 切换（visibility 图标）
  - 键盘类型正确（TextInputType.phone / email / number）
  - 输入限制：LengthLimitingTextInputFormatter + 自定义正则 Formatter
  - 焦点管理：FocusNode + FocusScope.of(context).nextFocus()
  - 底部按钮避免键盘遮挡：Scaffold + resizeToAvoidBottomInset + SafeArea
- **错误反馈**：提交失败使用 Get.snackbar 或 inline 错误提示
- **防重复提交**：Controller 内 `final isSubmitting = false.obs`，Obx 控制按钮 enabled

请给出：完整代码、正则表达式、异步校验防抖实现、键盘遮挡处理方案。
```

---

## FB3. 新建列表页面（下拉刷新 + 上拉加载 + 空态）

> 适用：分页数据列表，含刷新、加载、空态、错误态

```text
请使用 Flutter 3 + GetX 封装 [业务名，如：订单列表 / 商品瀑布流] 分页列表页面。

要求：
1. **状态管理**（Controller 内）：
   - `final list = <ItemModel>[].obs` — 数据列表
   - `final page = 1.obs` / `final hasMore = true.obs`
   - `final refreshStatus = RefreshStatus.idle.obs`（配合 SmartRefresher）或手写
   - `final loadStatus = Rx<LoadState>(LoadState.loading)`（loading/success/empty/error 四态）
2. **UI 组件**：
   - 下拉刷新 + 上拉加载：使用 `pull_to_refresh_flutter3` 的 SmartRefresher 或 EasyRefresh
   - 列表：`ListView.builder` / `GridView.builder`（>50 项禁止直接 ListView(children:)）
   - 瀑布流：`flutter_staggered_grid_view` 的 MasonryGridView
   - 骨架屏：`shimmer` 首次加载显示
   - 空态：图标 + 文案 + 操作按钮
   - 错误态：图标 + 错误信息 + 重试按钮
3. **性能优化**：
   - Item 使用 const 构造（若字段全部 final）
   - 图片使用 cached_network_image + placeholder + errorWidget
   - 大量数据分页加载（每页 20 条），滚动到底部再请求
   - ListView.builder 的 itemExtent / cacheExtent 优化滚动性能
   - 图片尺寸使用 `cacheWidth` / `cacheHeight` 降采样，减少内存
4. **滚动交互**：
   - ScrollController 监听滚动位置，实现"回到顶部"悬浮按钮（>3 屏显示）
   - 滚动方向感知：向上滑隐藏 AppBar，向下滑显示（SliverAppBar + pinned）
5. **搜索栏联动**：搜索输入使用 debounce（300ms），触发重置 page=1 重新加载
6. **错误重试**：网络错误区分「首页加载失败」和「加载更多失败」，前者全屏错误页，后者底部错误提示 + 点击重试

请给出：完整三件套代码、SmartRefresher 配置、四态切换逻辑、防抖搜索实现。
```

---

## FB4. 弹窗 / 底部弹层 / 全屏对话框

> 适用：确认弹窗、底部选择器、自定义 Dialog

```text
请使用 Flutter 3 + GetX 封装通用 [弹窗类型，如：确认删除 / 表单编辑 / 详情预览 / 城市选择] 弹窗组件。

要求：
1. **调用方式**：
   - 普通 Dialog：`Get.dialog<T>(MyDialog(), barrierDismissible: false)`
   - Bottom Sheet：`Get.bottomSheet<T>(MySheet(), isScrollControlled: true)`
   - Snackbar：`Get.snackbar(title, message, snackPosition: SnackPosition.BOTTOM)`
   - Loading：`Get.dialog(Center(child: CircularProgressIndicator()), barrierDismissible: false)`
2. **返回值**：使用 `Navigator.pop(context, result)` 或 `Get.back<T>(result: value)`，调用侧 `final result = await Get.dialog<bool>(...)`
3. **样式定制**：
   - Dialog 圆角：`Dialog(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)))`
   - Bottom Sheet 顶部圆角 + 拖拽指示条（DraggableScrollableSheet）
   - 遮罩透明度：`barrierColor: Colors.black54`
4. **交互细节**：
   - 确认按钮支持 loading（异步操作时禁用防重复点击）
   - 关闭时自动重置内部状态（用 StatefulBuilder 或独立 StatefulWidget）
   - Android 返回键拦截：`PopScope(canPop: false, onPopInvokedWithResult: ...)`
   - 键盘弹出时 Bottom Sheet 自动上移（isScrollControlled + Padding(viewInsets)）
5. **无障碍**：Semantics 标签、按钮最小点击区域 48x48
6. **主题适配**：亮暗色主题下的背景色、文字色、分割线色

请给出：完整代码、调用示例、返回值处理、Android 返回键拦截方案。
```

---

## FB5. 大 Widget 拆解与目录组织

> 适用：将超过 300 行的大页面拆分为模块化架构

```text
我有一个 Flutter 页面文件超过 [N] 行，需要按模块化最佳实践进行拆解。
页面职责：[描述页面功能]
当前问题：[如：build 方法太长 / 状态和业务耦合 / 大量重复 Widget]

请按以下架构拆解：
1. **主 View（<200 行）**：只负责布局编排，通过组合子 Widget 实现
2. **子 Widget 目录**（widgets/）：独立 UI 片段各自成文件（Header / Card / Item / EmptyView）
   - 纯展示：StatelessWidget + const 构造 + 接收数据 props
   - 需局部状态：StatefulWidget，但状态仅限 UI（如展开/收起）
3. **Controller 拆分**：业务复杂时按职责拆多个 Controller（DataController / FormController / ScrollController）
   - 通过 Get.put 注册，View 内 Get.find 使用
   - 或使用 Mixin（GetxController with XxxMixin）复用横切逻辑
4. **业务逻辑**（domain/）：Entity / Repository / UseCase 分层
5. **数据层**（data/）：RemoteDataSource / LocalDataSource / Model / DTO
6. **常量与工具**：constants.dart / formatters.dart / validators.dart 独立文件
7. **主题与样式**：app_theme.dart / app_colors.dart / app_text_styles.dart

GetX 特殊要求：
- Obx 粒度最小化：只包裹真正需要重建的 Widget，避免整页 Obx
- 用 GetBuilder 处理非响应式（手动 update()）的场景，性能更好
- Controller 之间通信用 Get.find<OtherController>()，避免直接依赖
- 深层 Widget 传递数据用 Get.arguments / Get.parameters，避免层层 props

请给出：拆解后的目录结构、每个文件的职责说明、主 View 的编排代码、Controller 拆分建议。
```

---

## FB6. 性能优化（Flutter DevTools 排查）

> 适用：解决掉帧、内存泄漏、启动慢等性能问题

```text
我的 Flutter 3 应用存在性能问题，请帮我分析和优化。
问题现象：[如：列表滚动掉帧 / 页面切换卡顿 / 内存持续增长 / 冷启动 >3s / 动画不流畅]
当前代码：
[粘贴相关代码片段]
使用工具：Flutter DevTools Performance / Memory / CPU Profiler

请从以下角度排查并给出优化方案：
1. **Widget 重建**：
   - build 方法内是否创建了非 const Widget？可否加 const？
   - Obx 是否包裹过大？可否下沉到叶子节点？
   - setState 触发范围是否过大？可否用 ValueListenableBuilder / AnimatedBuilder 局部重建？
2. **列表性能**：
   - 是否用 ListView.builder 而非 ListView(children:)？
   - Item 是否设置 `itemExtent` 或 `prototypeItem` 帮助预布局？
   - 图片是否用 `cacheWidth` / `cacheHeight` 降采样到显示尺寸？
   - 是否有大量嵌套 ClipRRect / Opacity / ShaderMask（这些是重绘大户）？
3. **动画性能**：
   - 使用 RepaintBoundary 隔离动画区域，避免整页重绘
   - 复杂动画考虑 `AnimatedBuilder` + `Transform` 而非 rebuild Widget 树
   - 隐式动画（AnimatedContainer）替代显式 AnimationController（简单场景）
4. **图片与资源**：
   - 使用 cached_network_image 缓存网络图
   - 大图预解码：`precacheImage` + `Image.asset(..., gaplessPlayback: true)`
   - SVG 用 flutter_svg，避免位图放大失真
5. **内存泄漏**：
   - Controller 的 onClose 是否 dispose 了 TextEditingController / AnimationController / StreamSubscription / Timer？
   - Get.lazyPut 的 fenix 参数是否合理（true 允许回收后重建）？
6. **启动性能**：
   - main() 内 WidgetsFlutterBinding.ensureInitialized() 后的初始化是否可延迟？
   - Splash 期间预热数据（Get.put + 首屏 Controller onInit 拉取）
   - 使用 `deferred as` 延迟加载非核心库
7. **Impeller / Skia**：Flutter 3.24+ 默认 Impeller（iOS/Android），首次着色器编译不再卡顿；老设备可回退 Skia
8. **平台通道**：MethodChannel 高频调用是否可批处理？考虑 Isolate.run 分离 CPU 密集任务

请给出：优化前后代码对比、DevTools 排查步骤、性能提升预期。
```

---

## FB7. Controller 与状态管理进阶

> 适用：复杂状态流转、跨 Controller 通信、Worker

```text
请使用 GetX 实现 [业务场景，如：多 Tab 联动筛选 / 购物车全局状态 / 登录态全局共享]。

要求：
1. **状态定义**：
   - 简单类型：`final count = 0.obs` / `final name = ''.obs`
   - 复杂对象：`final user = Rx<User?>(null)` / `final list = <Item>[].obs`
   - 只读暴露：`String get name => _name.value`，内部 `final _name = ''.obs`
2. **响应式消费**：
   - `Obx(() => Text('${controller.count}'))` — 自动订阅 count
   - `GetX<Controller>(builder: (c) => ...)` — 组合 Obx + GetBuilder + 依赖注入
   - `GetBuilder<Controller>(builder: (c) => ..., id: 'xxx')` — 手动 update(['xxx'])
3. **Worker（副作用监听）**：
   - `ever<T>(variable, (value) => ...)` — 每次变化触发
   - `once<T>(variable, (value) => ...)` — 只触发一次
   - `debounce(variable, (value) => ..., time: Duration(milliseconds: 500))` — 防抖
   - `interval(variable, (value) => ..., time: Duration(seconds: 1))` — 节流
   - **必须在 onInit 中创建、onClose 中 worker.dispose()**
4. **跨 Controller 通信**：
   - `Get.find<OtherController>().doSomething()` — 直接调用
   - 事件总线：GetxController 内暴露 `StreamController.broadcast()`，其他 Controller 订阅
5. **全局 Controller**：`Get.put(GlobalController(), permanent: true)` 常驻内存
6. **依赖注入时机**：
   - `Get.put` — 立即注入
   - `Get.lazyPut` — 首次 Get.find 时创建
   - `Get.lazyPut(fenix: true)` — 允许回收后重建
   - Binding 内注册，配合 GetPage 自动生效
7. **持久化**：GetStorage / shared_preferences 存储用户偏好、Token

请给出：完整 Controller 代码、Worker 使用示例、跨 Controller 通信方案、内存释放保证。
```

---

## FB8. 主题、暗色模式与响应式布局

> 适用：Material 3 主题定制、亮暗切换、多设备适配

```text
请为 Flutter 3 应用配置完整的主题系统与响应式布局方案。

要求：
1. **Material 3 主题**：
   - 使用 `ThemeData(useMaterial3: true, colorScheme: ColorScheme.fromSeed(seedColor: Color(0xFFxxxxxx)))`
   - 亮色：`ThemeData.light()` + colorScheme；暗色：`ThemeData.dark()` + colorScheme
   - 文本主题：`textTheme: Typography.material2021().black.apply(fontFamily: 'PingFang SC')`
   - 组件主题：`appBarTheme` / `cardTheme` / `inputDecorationTheme` / `elevatedButtonTheme` 统一定制
2. **暗色模式切换**：
   - `Get.changeTheme(themeMode == dark ? ThemeData.dark() : ThemeData.light())`
   - `Get.changeThemeMode(ThemeMode.dark)` — Flutter 3 推荐
   - 跟随系统：`ThemeMode.system`
   - 持久化：GetStorage 存储用户选择
   - 检测：`Get.isDarkMode` / `Theme.of(context).brightness`
3. **响应式布局**：
   - `Get.mediaQuery` 或 `MediaQuery.of(context)` 获取屏幕尺寸
   - `flutter_screenutil` 做 px → dp 适配（375 设计稿）
   - 断点：mobile (<600) / tablet (600-1024) / desktop (>1024)
   - 布局差异：`LayoutBuilder` + `OrientationBuilder` 组合
   - 大屏（平板/桌面）使用 NavigationRail / 双栏布局（列表 + 详情）
4. **字体缩放**：尊重系统字体大小 `MediaQuery.textScaleFactorOf(context)`，避免文字溢出
5. **安全区**：`SafeArea` 包裹避免刘海屏 / 底部横条遮挡
6. **RTL 支持**：`Directionality` + `EdgeInsetsDirectional` / `AlignmentDirectional`
7. **多语言**：GetX 国际化配置 `translations: MyTranslations(), locale: Locale('zh', 'CN'), fallbackLocale: Locale('en', 'US')`
   - 使用 `'key'.tr` 获取翻译，`Get.updateLocale(Locale('en'))` 动态切换

请给出：完整 app_theme.dart / app_translations.dart / main.dart 配置、暗色切换代码、ScreenUtil 初始化、断点判断工具函数。
```

---

## C. GetX 生态与架构

## FC1. 路由系统与页面导航

> 适用：命名路由、路由守卫、参数传递、深层链接

```text
请使用 GetX 搭建 [项目名] 的完整路由系统。

要求：
1. **路由配置**：
   - `GetMaterialApp(initialRoute: Routes.SPLASH, getPages: AppPages.routes, ...)`
   - app_pages.dart 集中定义 `static final routes = [GetPage(...), ...]`
   - routes.dart 定义常量：`static const HOME = '/home'`
   - 每个 GetPage 包含 name / page / binding / middlewares / transition / curve / duration
2. **导航 API**：
   - `Get.to(() => Page())` — 普通跳转
   - `Get.toNamed('/home')` — 命名路由跳转
   - `Get.off(() => Page())` — 替换当前页
   - `Get.offAll(() => Page())` — 清空栈跳转（登录后跳主页）
   - `Get.back()` — 返回
   - `Get.backUntil((route) => route.settings.name == '/home')` — 返回到指定页
3. **参数传递**：
   - 对象参数：`Get.toNamed('/detail', arguments: {'id': 123})`，接收侧 `Get.arguments['id']`
   - 路径参数：`GetPage(name: '/detail/:id', ...)`，接收侧 `Get.parameters['id']`
4. **路由转场动画**：
   - `transition: Transition.cupertino / fade / rightToLeft / downToUp / size`
   - 自定义：`customTransition: CustomTransition()`
5. **路由中间件（GetMiddleware）**：
   - 登录守卫：`redirect: (route) => !AuthService.isLogged ? RouteSettings(name: '/login') : null`
   - 埋点：`onPageCalled` / `onBindingsStart` / `onPageBuildStart` / `onPageDispose`
   - 权限校验：读取 route.settings.arguments 判断
6. **深层链接 / Universal Links**：使用 `uni_links` 或 `app_links` + Get.toNamed 分发
7. **返回拦截**：`PopScope(canPop: false, onPopInvokedWithResult: (didPop, result) => ...)` 处理未保存草稿提示

请给出：完整路由配置、Middleware 实现、参数传递示例、登录守卫代码、转场动画配置。
```

---

## FC2. 网络请求与数据层

> 适用：Dio / GetConnect 封装、拦截器、Token 刷新、错误统一处理

```text
请使用 [Dio 5 / GetConnect] 为 Flutter 3 + GetX 项目封装网络层。

要求：
1. **基础封装**：
   - ApiService 单例：`Get.put(ApiService(), permanent: true)`
   - baseUrl / timeout / headers 从 AppConfig 读取
   - 请求方法：`get<T>` / `post<T>` / `put<T>` / `delete<T>` 返回统一 `ApiResult<T>`
2. **ApiResult 封装**：
   - `sealed class ApiResult<T>` with `Success<T>(data)` / `Failure(error, code, message)`
   - 或使用 `Either<Failure, T>`（dartz / fpdart）
3. **拦截器**（Dio Interceptor / GetConnect RequestModifier）：
   - **请求拦截**：注入 Token、DeviceId、语言、版本号、traceId
   - **响应拦截**：统一解析后端 `{code, data, message}` 结构，code!=0 转 Failure
   - **错误拦截**：DioException 分类（connectTimeout / receiveTimeout / badResponse / cancel）转友好文案
   - **日志拦截**：debug 模式打印 curl 格式日志（用 pretty_dio_logger）
4. **Token 刷新**：
   - 401 触发 refresh_token 请求，成功后重放原请求
   - 并发请求同时 401 只 refresh 一次，其他等待（用 Completer）
   - refresh 失败清空登录态 + Get.offAllNamed('/login')
5. **取消请求**：页面 dispose 时 cancel（CancelToken + Controller.onClose）
6. **缓存策略**：
   - GET 请求可配置 `cache: Duration(minutes: 5)`（dio_cache_interceptor）
   - 弱网/无网降级读取本地缓存（Hive / GetStorage）
7. **文件上传/下载**：
   - 上传：FormData + 进度回调
   - 下载：dio.download + 断点续传（Range header）
8. **重试机制**：网络异常自动重试 3 次（指数退避）
9. **模型转换**：
   - 手写 fromJson / toJson，或用 `json_serializable` + `build_runner`
   - 空安全处理：字段全部 nullable 或有默认值，避免 parse 崩溃

请给出：完整封装代码、拦截器实现、Token 刷新并发处理、错误分类映射表、使用示例。
```

---

## FC3. 全局状态：登录态 / 用户信息 / 主题

> 适用：跨页面共享的全局状态管理

```text
请使用 GetX 设计 [项目名] 的全局状态管理方案。

要求：
1. **全局 Controller**（ permanent: true 常驻）：
   - `AuthController` — token / userInfo / isLogged
   - `ThemeController` — themeMode / 动态色
   - `LocaleController` — locale / 语言切换
   - `SettingsController` — 用户偏好（字体大小、通知开关）
2. **注册时机**：`main()` 中 `WidgetsFlutterBinding.ensureInitialized()` 之后立即 `Get.put(AuthController(), permanent: true)`
3. **持久化**：
   - 使用 `GetStorage`（GetX 官方推荐，轻量 KV）或 `shared_preferences`
   - `final box = GetStorage(); box.write('token', 'xxx'); box.read('token');`
   - AuthController onInit 中从 storage 恢复登录态
4. **登录态判断**：
   - `final isLogged = false.obs` — 响应式
   - `final token = Rxn<String>()` — nullable 类型
   - `bool get hasToken => token.value != null && token.value!.isNotEmpty`
5. **UI 消费**：
   - 顶层用 `Obx(() => app.routes)` 根据登录态切换 initialRoute
   - 页面内用 `Obx(() => Text(controller.user.value?.name ?? '未登录'))`
6. **登出流程**：
   - 清空 token / userInfo
   - 取消所有网络请求（CancelToken）
   - `Get.deleteAll(force: true)` 清理非 permanent Controller
   - `Get.offAllNamed('/login')` 跳登录页
7. **Token 过期主动登出**：拦截器 401 触发 AuthController.logout()
8. **多账号切换**：storage 存 `List<UserSession>`，切换时更新当前 session

请给出：完整 AuthController / ThemeController 代码、持久化配置、UI 消费示例、登出清理逻辑。
```

---

## FC4. 本地存储与离线数据

> 适用：Hive / GetStorage / sqflite 数据持久化

```text
请使用 [GetStorage / Hive / sqflite / drift] 为 Flutter 3 应用实现本地存储层。

要求：
1. **存储选型**：
   - **GetStorage**：轻量 KV，适合用户偏好、Token、少量数据（<1MB）
   - **Hive**：高性能 NoSQL，适合大量结构化数据（消息、缓存列表）
   - **sqflite / drift**：关系型数据库，适合复杂查询、多表关联
2. **GetStorage 使用**：
   - `await GetStorage.init('app_box');` main 中初始化
   - `final box = GetStorage('app_box'); box.write('key', value); box.read<T>('key');`
   - 响应式读取：`box.listenKey<T>('key', (value) => ...)`
3. **Hive 使用**：
   - `Hive.openBox<T>('boxName')` + `@HiveType` / `@HiveField` 注解（配合 hive_generator）
   - 加密 Box：`Hive.openBox('secure', encryptionCipher: HiveAesCipher(key))`
   - 大数据懒加载：`box.lazyBox` + `lazyGet`
4. **Repository 层封装**：
   - `abstract class UserRepository` + `UserRepositoryImpl` 实现
   - 网络 + 本地组合策略：`Network-First` / `Cache-First` / `Stale-While-Revalidate`
5. **数据迁移**：版本升级时 schema 迁移（Hive 的 `box.put` 兼容旧字段，sqflite 的 `onUpgrade`）
6. **敏感数据加密**：
   - Token 用 `flutter_secure_storage`（Keychain / Keystore）
   - 或 Hive + HiveAesCipher，密钥从 secure_storage 读取
7. **清理策略**：
   - 缓存过期时间戳，读取时判断
   - 提供 `clearCache()` 供设置页调用
   - 应用卸载时系统自动清理，但登录 Token 建议主动清空
8. **异步初始化**：main() 中 `await GetStorage.init()` + `await Hive.initFlutter()` 后再 runApp

请给出：完整封装代码、Repository 实现、加密配置、缓存策略示例、迁移方案。
```

---

## D. Flutter 3 新特性与最佳实践

## FD1. Material 3 与 WidgetStateProperty

> 适用：迁移到 Material 3、使用新 API 替代过时 API

```text
请将以下 Flutter 代码迁移到 Flutter 3.24+ 的 Material 3 规范：
[粘贴旧代码]

迁移清单：
1. ❌ `MaterialStateProperty.all(...)` → ✅ `WidgetStateProperty.all(...)`（Flutter 3.19+ 重命名）
2. ❌ `MaterialState.selected` → ✅ `WidgetState.selected`
3. ❌ `useMaterial3: false` → ✅ `useMaterial3: true`（Flutter 3.16+ 默认开启）
4. ❌ `TextTheme.headline1` → ✅ `TextTheme.displayLarge`（M3 命名）
5. ❌ `primarySwatch` → ✅ `colorScheme: ColorScheme.fromSeed(seedColor: ...)`
6. ❌ `RaisedButton` / `FlatButton` → ✅ `ElevatedButton` / `TextButton` / `FilledButton`
7. ❌ `Scaffold.resizeToAvoidBottomPadding` → ✅ `Scaffold.resizeToAvoidBottomInset`
8. ❌ `WillPopScope` → ✅ `PopScope(canPop:, onPopInvokedWithResult:)`
9. ❌ `ButtonBar` → ✅ `OverflowBar`
10. ❌ `Scrollbar.isAlwaysShown` → ✅ `Scrollbar.thumbVisibility`
11. ❌ `RawKeyboardListener` → ✅ `KeyboardListener` / `Focus.onKeyEvent`
12. ❌ 硬编码颜色 → ✅ `Theme.of(context).colorScheme.primary/onPrimary/surface/...`
13. ❌ `Card.margin` 全局 → ✅ `CardTheme.margin` 统一
14. ❌ `ElevatedButton.styleFrom(primary:)` → ✅ `styleFrom(backgroundColor:, foregroundColor:)`
15. ❌ 手动 Icon 主题 → ✅ `IconThemeData(size:, color:, fill:, weight:, grade:, opticalSize:)`（M3 支持可变图标轴）

Material 3 新组件：
- `FilledButton` / `FilledButton.tonal` — M3 主要按钮
- `SegmentedButton` — 分段控制器
- `SearchBar` / `SearchAnchor` — M3 搜索栏
- `Badge` — 徽章
- `NavigationDrawer` / `NavigationBar` — M3 导航
- `DatePickerDialog` / `showDatePicker` — M3 样式日期选择器

请给出：迁移后的代码、Material 3 主题配置、组件对照表说明。
```

---

## FD2. Dart 3 新特性（Records / Patterns / sealed class）

> 适用：使用 Dart 3 现代语法编写更简洁的代码

```text
请使用 Dart 3 新特性重构以下 Flutter 代码：
[粘贴旧代码]

要求（Dart 3 语法）：
1. **Records（记录类型）**：
   - 多返回值：`(int, String) getUser() => (1, 'Tom');`
   - 命名字段：`({int id, String name}) user = (id: 1, name: 'Tom');`
   - 解构：`final (id, name) = getUser();` / `final (:id, :name) = user;`
2. **Patterns（模式匹配）**：
   - switch 表达式：`final result = switch (status) { 200 => 'ok', 404 => 'nf', _ => 'err' };`
   - 解构赋值：`final [first, second, ...rest] = list;`
   - 对象模式：`if (json case {'type': 'user', 'id': final id}) { ... }`
   - Guard 子句：`case int n when n > 100: ...`
3. **sealed / base / interface / final class**：
   - `sealed class Result<T>` — 强制穷举子类
   - `class Success<T> extends Result<T>` / `class Failure<T> extends Result<T>`
   - switch (result) { case Success(data: final d): ..., case Failure(error: final e): ... } — 编译器检查穷尽
4. **if-case / for-in 模式**：
   - `if (obj case User(name: final n)) print(n);`
   - `for (final (key, value) in map.entries) ...`
5. **class modifiers**：
   - `base class` — 只能被继承，不能被 implements
   - `interface class` — 只能被 implements，不能被 extends（外部库）
   - `final class` — 不能被继承或实现
   - `mixin class` — 既可实例化又可作为 mixin
6. **null-aware elements**（Dart 3.0+）：`[1, 2, ?maybeNull, 3]` — null 时忽略
7. **extension types**（Dart 3.3+）：`extension type Meters(double value) { ... }` — 零开销类型抽象

请给出：重构后的代码、模式匹配使用示例、sealed class 状态机实现、性能对比说明。
```

---

## FD3. Isolate 与 CPU 密集任务

> 适用：JSON 解析、图片处理、加密计算等重 CPU 场景

```text
请使用 Flutter 3 的 Isolate 机制处理 [场景，如：大 JSON 解析 / 图片压缩 / 文件加密 / 复杂计算]。

要求：
1. **Isolate.run（Dart 3 推荐）**：
   - `final result = await Isolate.run(() => heavyComputation(data));`
   - 自动创建、执行、销毁 Isolate，无需手写 SendPort/ReceivePort
   - 闭包内可访问外部变量（自动拷贝）
2. **compute（旧 API，仍可用）**：
   - `final result = await compute(parseJson, jsonString);`
   - 需要 top-level 或 static 函数
3. **长驻 Isolate**（高频调用场景）：
   - `Isolate.spawn(_entryPoint, receivePort.sendPort);`
   - 双向通信：SendPort + ReceivePort
   - 生命周期管理：Controller onClose 时 isolate.kill()
4. **数据传递约束**：
   - 只能传递不可变对象或可深拷贝对象
   - TransferableTypedData 用于大 Uint8List（零拷贝）
5. **典型场景**：
   - JSON 解析 >100KB：`Isolate.run(() => jsonDecode(str))`
   - 图片处理：`Isolate.run(() => image.decodeImage(bytes))`（用 image 包）
   - 加密哈希：`Isolate.run(() => sha256.convert(data))`
   - Excel/PDF 生成：`Isolate.run(() => generatePdf(...))`
6. **UI 反馈**：Isolate 执行期间显示 loading，避免主线程阻塞导致的假死
7. **性能对比**：<50ms 的计算直接同步执行（Isolate 启动开销 ~10ms）

请给出：完整代码、Isolate.run 与 compute 对比、长驻 Isolate 通信示例、TransferableTypedData 用法。
```

---

## FD4. 平台适配（Android / iOS / Web / Desktop）

> 适用：一套代码多端运行，处理平台差异

```text
请为 Flutter 3 应用配置多平台适配方案（Android / iOS / Web / Windows / macOS）。

要求：
1. **平台判断**：
   - `GetPlatform.isAndroid / isIOS / isWeb / isWindows / isMacOS / isLinux`（GetX 提供，Web 兼容）
   - `defaultTargetPlatform` — 编译期常量，Web 上返回运行平台
   - `kIsWeb` — 是否 Web 编译
2. **UI 差异**：
   - iOS 使用 CupertinoIcons / CupertinoPageScaffold（可选）
   - Android 使用 Material 3 默认样式
   - Desktop 增大按钮尺寸、支持键盘快捷键（Shortcuts + Actions）
   - Web 处理 CORS、路由 URL 模式（usePathUrlStrategy）
3. **权限处理**：
   - 使用 `permission_handler` 统一封装
   - Android：AndroidManifest.xml 声明 + 运行时申请
   - iOS：Info.plist 声明用途字符串
   - Web：不支持部分权限（如 contacts），降级处理
4. **文件系统**：
   - `path_provider` 获取临时/文档/下载目录（Web 不支持部分路径）
   - Web 用 `universal_html` 或 `web` 包处理 blob / download
5. **窗口尺寸**：
   - Desktop 支持窗口大小调整：`window_manager` 包
   - 断点布局：mobile (<600) / tablet (600-1024) / desktop (>1024)
   - 大屏使用 NavigationRail + 双栏
6. **键盘快捷键**（Desktop / Web）：
   - `Shortcuts(shortcuts: { LogicalKeySet(...): Intent(...) }, child: Actions(...))`
   - `FocusNode` + `onKeyEvent` 处理原始按键
7. **平台通道**：
   - MethodChannel / EventChannel / BasicMessageChannel 封装到 services/platform/
   - 使用 `pigeon` 生成类型安全的通道代码
   - FFI 调用 C/C++ 库（性能敏感场景）
8. **构建产物**：
   - Android：APK / AAB（--split-per-abi 减小体积）
   - iOS：IPA（需 macOS + Xcode）
   - Web：`flutter build web --release --web-renderer canvaskit|html|skwasm`
   - Desktop：`flutter build windows|macos|linux`

请给出：平台判断工具函数、权限封装、条件 Widget 示例、平台通道代码、构建脚本。
```

---

## FD5. 状态管理方案选型对比（GetX vs 其他）

> 适用：项目初期技术选型 or 混合使用

```text
请对比 Flutter 3 主流状态管理方案，并给出选型建议。
项目特点：[描述，如：中小型 App / 团队熟悉度 / 是否需要 SSR / 长期维护]

对比维度（GetX 4.6 / Riverpod 2 / Bloc 8 / Provider / MobX）：
1. **学习曲线**：GetX 最低（一站式），Riverpod 中，Bloc 中高
2. **样板代码量**：GetX 少，Bloc 多（Event/State/Repository），Riverpod 中
3. **性能**：Riverpod 编译期检查最优，GetX 依赖运行时反射（Get.find）
4. **可测试性**：Riverpod / Bloc 天然易测（依赖注入清晰），GetX 需 mock GetInstance
5. **类型安全**：Riverpod 最强（Provider 类型化），GetX 较弱（Get.find<T> 运行时）
6. **附加能力**：
   - GetX：路由 / DI / 状态 / 国际化 / Snackbar / 主题切换一站式
   - Riverpod：纯状态，路由需 go_router
   - Bloc：CQRS 分层清晰，事件驱动
7. **社区生态**：Bloc / Provider 官方推荐，GetX 社区活跃但争议（黑盒魔法多）
8. **大型项目适配**：Riverpod / Bloc 更合适，GetX 需严格约束目录与规范

选型建议：
- **个人项目 / MVP / 快速迭代**：GetX（本次项目基线）— 一站式高效
- **中大型商业项目 / 团队协作**：Riverpod + go_router — 类型安全、可测试
- **企业级 / 严格分层**：Bloc — CQRS + Clean Architecture 天然契合
- **老项目维护**：Provider — 官方推荐、稳定

GetX 使用注意事项：
- 避免过度依赖 Get.context / Get.key（不利于测试）
- Controller 拆分粒度控制，避免"上帝 Controller"
- 严禁在 build 方法内 Get.put（会重复注入）
- 使用 Binding 统一注册，方便依赖追踪

请给出：针对本项目的选型结论、代码示例对比、迁移成本评估、长期维护建议。
```

---

## E. Dart 通用与异步流程

## FE1. 复杂数据结构处理

> 适用：JSON 转换、树结构、分组统计

```text
我有一组复杂 JSON 数据如下：
[粘贴数据或描述结构]

请帮我编写 Dart 纯函数实现以下转换：
1. 过滤：剔除 [条件，如：状态为已取消] 的数据
2. 转换：[如：列表转树状结构 / 数组平铺 / 分组统计]
3. 计算：统计 [字段名] 的总和/平均值/分布

要求：
- 优先使用 Dart 3 collection methods（map / where / fold / groupBy / expand）
- 使用 Records / Patterns 简化多返回值和分支逻辑
- 空安全：字段 nullable 时用 `?.` / `??` / `!` 明确处理
- 性能：大数据集使用 `Iterable` 惰性求值，最后 `.toList()`
- 提供完整类型定义（Model / Entity）与边界处理（空数据、字段缺失）
```

---

## FE2. 异步流程控制（Future / Stream / Isolate）

> 适用：并发请求、串行请求、超时、竞态、流处理

```text
我需要处理一组异步任务，场景如下：
[如：并发请求 5 个接口全部完成后合并数据 / 依次串行请求 / 搜索框防竞态 / 实时消息流]

要求：
1. **并发**：`Future.wait([f1, f2, f3])` — 全部完成；`Future.wait([...], eagerError: true)` — 快速失败
2. **串行**：`for (final url in urls) { results.add(await fetch(url)); }`
3. **超时**：`future.timeout(Duration(seconds: 5), onTimeout: () => fallback)`
4. **竞态取消**：
   - Dio CancelToken：搜索框输入变化时 cancelToken.cancel() 上一次请求
   - StreamSubscription：新请求前 `await previousSubscription?.cancel()`
5. **防抖节流**：
   - Stream + `debounceTime`（rxdart）
   - 或 GetX Worker：`debounce(searchKeyword, (v) => doSearch(v), time: 500.milliseconds)`
6. **重试**：手写 `Future<T> retry<T>(Future<T> Function() fn, {int times = 3, Duration delay})` 指数退避
7. **Stream 处理**：
   - `Stream.fromIterable` / `StreamController.broadcast`
   - 转换：`map` / `where` / `asyncMap` / `transform`
   - 组合：`StreamGroup.merge` / `zip`（rxdart）
8. **错误处理**：try/catch/finally + `Future.catchError` + `onError` 参数
9. **并发限制**：`pool` 包的 Pool(N) 控制最大并发数

请给出：完整实现代码、调用示例、错误处理策略、竞态与超时方案。
```

---

## FE3. 工具函数与扩展方法（extension）

> 适用：常用工具封装、类型扩展

```text
请封装 [功能名，如：日期格式化 / 字符串校验 / 颜色转换 / 数字千分位] 工具函数。

要求：
1. **Dart 3 extension 优先**：
   - `extension StringX on String { bool get isPhone => ...; }`
   - `extension DateTimeX on DateTime { String get ymd => ...; }`
   - `extension ContextX on BuildContext { ThemeData get theme => Theme.of(this); }`
2. **空安全**：nullable 类型用 `extension on String?` 或明确判空
3. **国际化**：日期用 `intl` 包的 `DateFormat`，数字用 `NumberFormat`
4. **性能**：正则用 `RegExp` 提前编译（static final），避免每次调用重新构建
5. **TypeScript 类型定义**：完整泛型 + 返回类型注解
6. **单元测试**：使用 `flutter_test` 覆盖正常/边界/异常场景
7. **常用扩展推荐**：
   - `String`：trimAll / capitalize / isPhone / isEmail / isUrl / mask（脱敏）
   - `DateTime`：isToday / isYesterday / format / diff / addDays
   - `int / double`：currencyFormat / percentFormat / toFileSize
   - `List<T>`：chunk / distinctBy / groupByKey / sumBy
   - `BuildContext`：theme / mediaQuery / size / isDark / showSnackbar

请给出：完整代码、扩展方法列表、调用示例、单元测试用例。
```

---

## FE4. Widget 测试与集成测试

> 适用：单元测试、Widget 测试、集成测试

```text
请为 [组件名 / Controller 名 / 页面名] 编写完整的测试用例。

要求：
1. **单元测试**（Controller / Util / Repository）：
   - 使用 `flutter_test` + `mocktail` / `mockito`
   - GetX Controller 测试：`Get.put(MockService()); final c = MyController(); c.onInit();`
   - 测试 tearDown：`Get.reset()` 清理注入
   - 覆盖：正常路径 / 边界值 / 异常路径 / 空数据
2. **Widget 测试**：
   - `testWidgets('description', (tester) async { await tester.pumpWidget(MyApp()); });`
   - 查找元素：`find.text('xxx')` / `find.byType(Button)` / `find.byKey(Key('k'))`
   - 交互：`tester.tap(...)` / `tester.enterText(...)` / `tester.drag(...)`
   - 等待：`tester.pump()` / `tester.pumpAndSettle()` / `tester.pumpWidget(Duration(...))`
   - 断言：`expect(find.text('xxx'), findsOneWidget)`
3. **Golden 测试**（UI 快照）：
   - `await expectLater(find.byType(MyWidget), matchesGoldenFile('goldens/my_widget.png'));`
   - CI 环境使用 `--update-goldens` 更新基线
4. **集成测试**：
   - `integration_test` 包 + `IntegrationTestWidgetsFlutterBinding`
   - 真机运行：`flutter test integration_test -d <device>`
5. **GetX 测试注意**：
   - GetMaterialApp 包裹被测 Widget
   - Get.testMode = true（禁用日志）
   - 依赖注入 mock：`Get.put<ApiService>(MockApiService())`
6. **覆盖率**：`flutter test --coverage` + `lcov` 生成报告

请给出：完整测试代码、mock 配置、常见陷阱（异步未等待、Get 单例污染）说明。
```

---

## F. 移动端专项

## FF1. 长列表与滚动性能

> 适用：商品列表、聊天记录、信息流

```text
请使用 Flutter 3 + GetX 开发 [业务名] 高性能长列表页面。
数据量：[如：单页 20 条 / 总量可能 >1000 条]

要求：
1. **列表组件选型**：
   - 定高：`ListView.builder(itemExtent: 72, ...)` — 性能最佳
   - 变高：`ListView.builder` + `prototypeItem` 帮助预布局
   - 网格：`GridView.builder` / `SliverGrid`
   - 瀑布流：`flutter_staggered_grid_view` 的 MasonryGridView
   - 混合布局：`CustomScrollView` + 多个 Sliver（SliverAppBar / SliverList / SliverGrid）
2. **图片优化**：
   - `Image.network` → `CachedNetworkImage`（磁盘缓存 + 内存缓存）
   - `cacheWidth` / `cacheHeight` 降采样到实际显示尺寸的 2 倍（Retina）
   - `placeholder` + `errorWidget` 占位图，避免布局抖动
   - 大量小图使用 `precacheImage` 预加载
3. **懒加载 + 分页**：
   - ScrollController 监听 `pixels >= maxScrollExtent - 200` 触发下一页
   - 加载状态：`RefreshStatus.idle / loading / noMore / failed`
   - 防重复触发：`isLoading` 标志位
4. **item 优化**：
   - 尽量 const 构造（`const SizedBox(height: 8)`）
   - 提取独立 Widget 类，避免闭包捕获（`ItemWidget(item: item)` 而非 `builder: (ctx, i) => Container(...)`）
   - 复杂 item 用 `RepaintBoundary` 隔离重绘
5. **滚动交互**：
   - 滚动到顶部悬浮按钮（>3 屏显示）
   - SliverAppBar 折叠头部
   - 滚动方向感知隐藏底部 Bar
6. **虚拟滚动**：Flutter 的 ListView.builder 天然虚拟化（只构建可视区域）
7. **内存监控**：DevTools Memory 观察 ImageCache 大小，超过 100MB 需清理（`imageCache.clear()`）

请给出：完整代码、CustomScrollView + Sliver 组合示例、滚动性能对比说明。
```

---

## FF2. 动画与手势交互

> 适用：转场动画、共享元素、复杂手势

```text
请使用 Flutter 3 实现 [动画场景，如：Hero 共享元素转场 / 卡片翻转 / 拖拽排序 / 手势缩放]。

要求：
1. **隐式动画**（简单场景优先）：
   - `AnimatedContainer` / `AnimatedOpacity` / `AnimatedAlign` / `AnimatedPositioned`
   - `TweenAnimationBuilder<T>` — 一次性 Tween 动画
   - `AnimatedSwitcher` — Widget 切换淡入淡出
2. **显式动画**（复杂控制）：
   - `AnimationController` + `Tween` + `AnimatedBuilder`
   - `CurvedAnimation(parent: controller, curve: Curves.easeInOut)`
   - Controller 在 onClose 中 dispose，避免内存泄漏
3. **Hero 共享元素**：
   - 前后页同 tag：`Hero(tag: 'avatar-$id', child: Image(...))`
   - 自定义飞行：`flightShuttleBuilder`
   - GetX 路由配合：`Get.to(() => DetailPage(), arguments: id, transition: Transition.fadeIn)`
4. **物理动画**：
   - `SpringSimulation` / `FrictionSimulation` / `GravitySimulation`
   - `AnimationController.animateWith(simulation)`
5. **手势**：
   - `GestureDetector` — 点击/双击/长按/拖拽/缩放
   - `InkWell` — Material 波纹效果（可点击区域）
   - `Listener` — 原始指针事件
   - `Draggable` + `DragTarget` — 拖放
   - `ReorderableListView` — 拖拽排序
   - 复杂手势竞技场：`RawGestureDetector` + `GestureRecognizer`
6. **Rive / Lottie 动画**：
   - Lottie：`lottie` 包播放 AE 导出 JSON
   - Rive：`rive` 包播放交互式矢量动画（性能更好）
7. **性能**：
   - `RepaintBoundary` 隔离动画区域
   - `Transform` 而非修改 Widget 位置属性（避免 relayout）
   - `Opacity` 慎用（触发 saveLayer），改用 `AnimatedOpacity` 或颜色 alpha
8. **可访问性**：动画可通过 `MediaQuery.disableAnimationsOf(context)` 关闭

请给出：完整动画代码、手势冲突处理、性能优化说明。
```

---

## FF3. 推送 / 权限 / 硬件能力

> 适用：Firebase 推送、定位、相机、蓝牙

```text
请为 Flutter 3 应用集成 [能力，如：Firebase 推送 / 定位 / 相机 / 相册 / 蓝牙 / NFC / 生物识别]。

要求：
1. **推送（Firebase Cloud Messaging）**：
   - `firebase_messaging` + `flutter_local_notifications`
   - 前台/后台/终止三态处理：`FirebaseMessaging.onMessage` / `onMessageOpenedApp` / `getInitialMessage`
   - iOS 需申请通知权限：`messaging.requestPermission()`
   - Android 13+ 需 POST_NOTIFICATIONS 运行时权限
   - Topic 订阅、Token 上报到后端
2. **定位**：
   - `geolocator` 获取位置 + `permission_handler` 申请权限
   - 后台定位需 foreground service（Android）或 always 权限（iOS）
   - 精度选择：`LocationAccuracy.low/medium/high/best`
3. **相机 / 相册**：
   - 拍照：`image_picker` 或 `camera`
   - 相册多选：`wechat_assets_picker` / `photo_manager`
   - 压缩：`flutter_image_compress` 上传前压缩
   - iOS Info.plist：NSCameraUsageDescription / NSPhotoLibraryUsageDescription
4. **权限统一封装**：
   - `permission_handler`：`Permission.camera.request()` / `.status.isGranted`
   - Android：AndroidManifest.xml 声明 + 运行时申请
   - iOS：Info.plist 用途字符串（必填，否则崩溃）
   - 拒绝后引导设置页：`openAppSettings()`
5. **文件选择**：`file_picker` 支持多类型
6. **生物识别**：`local_auth` 指纹 / Face ID
7. **蓝牙**：`flutter_blue_plus` BLE 扫描与连接
8. **NFC**：`nfc_manager`（iOS 需 entitlement，Android 需 HCE）
9. **分享**：`share_plus` 系统分享面板
10. **深链接**：`app_links` / `uni_links` 处理 Universal Links / App Links

请给出：完整封装代码、iOS/Android 配置文件示例、权限申请流程、错误处理与降级方案。
```

---

## FF4. 发布与 CI/CD

> 适用：打包、签名、渠道分发、自动化构建

```text
请为 Flutter 3 应用配置 [平台] 的完整发布流程。

要求：
1. **Android 发布**：
   - 生成 keystore：`keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload`
   - key.properties 存储密码（**加入 .gitignore**）
   - build.gradle 配置 signingConfigs.release
   - 混淆：`--obfuscate --split-debug-info=build/symbols` 生成符号表用于崩溃还原
   - 分包：`flutter build appbundle --release`（Play 商店）/ `flutter build apk --split-per-abi`（渠道分发）
   - 版本号：`pubspec.yaml` version 或 CI 注入 buildNumber
2. **iOS 发布**：
   - Apple Developer 账号 + 证书（Distribution）+ Provisioning Profile
   - Xcode 配置 Signing & Capabilities（Automatic / Manual）
   - `flutter build ipa --release --export-options-plist=ios/ExportOptions.plist`
   - Transporter 或 fastlane pilot 上传 App Store Connect
3. **CI/CD**（GitHub Actions / Codemagic / fastlane）：
   - 触发：push tag / PR merge
   - 步骤：flutter pub get → analyze → test → build → sign → upload
   - Secrets：keystore / p12 / API Key 存 GitHub Secrets
   - 产物：APK / IPA 上传 Release，或分发到蒲公英 / fir.im
4. **环境区分**：
   - `--dart-define=ENV=prod` 编译期注入
   - `--dart-define-from-file=config/prod.json` 从文件读取
   - `main_dev.dart` / `main_prod.dart` 多入口
5. **崩溃监控**：Sentry / Firebase Crashlytics / Bugly
6. **性能监控**：Firebase Performance / Sentry Performance
7. **热更新**：Flutter 官方不支持代码热更新（政策风险），可用 `shorebird`（合规方案）
8. **灰度发布**：Play Console 分阶段发布 / TestFlight 内测

请给出：完整 build.gradle / Xcode 配置、GitHub Actions workflow yaml、fastlane Fastfile、多环境配置示例。
```

---

## Flutter 3 + GetX 迁移速查表

从 Flutter 2 / GetX 3 迁移到 Flutter 3.24+ 时，以下写法需要更新（可作为 Prompt 补充指令）：

```text
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
