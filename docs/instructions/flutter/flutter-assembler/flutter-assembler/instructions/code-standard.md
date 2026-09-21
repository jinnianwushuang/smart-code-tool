# 代码规范 — Flutter + GetX

> AI 生成 Flutter 代码时必须遵循的规范。

## 1. 命名规范

### 文件命名

- Dart 文件：**snake_case**（如 `user_management_controller.dart`）
- 页面文件：`<功能名>_page.dart`
- Controller 文件：`<功能名>_controller.dart`
- Binding 文件：`<功能名>_binding.dart`

### 类命名

- Widget 类：**PascalCase**（如 `UserManagementPage`）
- Controller 类：**PascalCase + Controller**（如 `UserManagementController`）
- Binding 类：**PascalCase + Binding**（如 `UserManagementBinding`）
- Model 类：**PascalCase**（如 `User`）
- 私有 Widget：**_PascalCase**（如 `_SearchBar`）

### 变量/方法命名

- 变量/方法：**camelCase**（如 `isLoading`、`handleSearchChange`）
- 私有成员：**_前缀**（如 `_currentPage`、`_loadData`）
- 常量：**camelCase**（如 `maxPageSize`）
- 路由常量：**camelCase**（如 `userManagement`）

## 2. 注释规范

- 注释语言：跟随 config.md 中的 `comment_language` 配置
- 类注释：使用 `///` 文档注释，说明类的用途
- 方法注释：公共方法使用 `///` 说明用途和参数
- 复杂逻辑：使用 `//` 行内注释说明意图
- 注释比例：不低于 config.md 中的 `min_comment_ratio`（默认 10%）

## 3. Widget 规范

- **build 方法只做 UI 描述**：不包含业务逻辑、不修改状态
- **const 构造优先**：无动态参数的 Widget 必须使用 const
- **GetView 替代 StatelessWidget**：需要访问 Controller 时使用 `GetView<T>`
- **Obx 下沉**：Obx 包裹最小刷新单元，不包裹整个页面
- **Widget 拆分**：单个 build 方法超过 30 行时考虑拆分为子 Widget

## 4. Controller 规范

- **业务逻辑集中**：状态声明、数据处理、API 调用都在 Controller 中
- **生命周期约束**：onInit 做同步初始化，onReady 做异步加载，onClose 做资源清理
- **Rx 变量必须关闭**：onClose 中调用 `.close()` 关闭所有 `.obs` 变量
- **方法命名**：事件处理方法以 `handle` 开头（如 `handleSearchChange`）
- **私有方法**：以下划线开头（如 `_loadData`）

## 5. Binding 规范

- **唯一注册入口**：Controller 只通过 Binding 注册
- **Get.lazyPut 优先**：页面级 Controller 使用 `Get.lazyPut` + `fenix: true`
- **Get.lazySingleton**：全局服务使用 `Get.lazySingleton`
- **一个页面一个 Binding**：不混合多个页面的 Controller 注册

## 6. 状态管理规范

- **响应式状态**：频繁变化的数据用 `.obs` + `Obx`
- **简单状态**：不频繁变化的数据用普通变量 + `GetBuilder` + `update(['id'])`
- **计算属性**：使用 getter 自动追踪依赖
- **assignAll**：RxList 批量替换使用 `assignAll` 而非逐个操作

## 7. 样式规范

- **优先级链**：Material 3 组件 > 插件 > 全局 Theme > 自定义 Widget
- **Theme 优先**：使用 `Theme.of(context).colorScheme.*` 获取颜色
- **避免硬编码**：颜色、间距、字体大小尽量使用 Theme 变量
- **Material 3 适配**：使用 `WidgetStateProperty` 替代 `MaterialStateProperty`

## 8. 路由规范

- **命名路由常量**：使用 `AppRoutes.xxx` 常量，禁止硬编码字符串
- **Get.toNamed**：使用 GetX 路由方法，禁止 `Navigator.push`
- **Binding 绑定**：路由配置中包含 Binding，自动管理 Controller 生命周期
- **参数传递**：通过 `Get.arguments` 传递路由参数
