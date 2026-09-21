# 架构术语表

> 统一 AI 助手与开发者之间的术语理解。

## 核心概念

| 术语 | 定义 |
|------|------|
| **Widget** | Flutter UI 的基本构建单元，描述屏幕上的一个视觉元素 |
| **GetView** | GetX 提供的 StatelessWidget 替代品，内置 `controller` getter |
| **GetxController** | GetX 的业务逻辑容器，管理状态和生命周期 |
| **Bindings** | GetX 的依赖注入机制，在路由跳转时自动注册 Controller |
| **Obx** | GetX 的响应式 Widget，自动追踪 `.obs` 变量的变化并刷新 |
| **GetBuilder** | GetX 的简单状态 Widget，需要手动调用 `update()` 触发刷新 |
| **Rx / .obs** | GetX 的响应式变量，值变化时自动通知依赖的 Obx 重建 |

## 状态相关

| 术语 | 定义 |
|------|------|
| **响应式状态** | 使用 `.obs` 声明的变量，变化时自动触发 Obx 重建 |
| **简单状态** | 普通变量，配合 `update()` 和 `GetBuilder` 手动刷新 |
| **计算属性** | Controller 中的 getter，自动追踪依赖的 Rx 变量 |
| **全局状态** | 通过 `Get.lazySingleton` 注册的 Controller 中的状态 |
| **页面级状态** | 通过 `Get.lazyPut` 注册的 Controller 中的状态，跟随页面生命周期 |
| **assignAll** | RxList 的批量替换方法，比逐个 add 更高效 |

## 生命周期相关

| 术语 | 定义 |
|------|------|
| **onInit** | Controller 创建后的同步初始化钩子 |
| **onReady** | Controller 初始化完成后的异步初始化钩子（首帧后） |
| **onClose** | Controller 销毁前的资源清理钩子 |
| **fenix** | Get.lazyPut 的选项，页面销毁后允许重新创建 Controller |
| **Worker** | GetX 的响应式监听器（ever/once/debounce/interval） |

## 路由相关

| 术语 | 定义 |
|------|------|
| **命名路由** | 通过字符串常量定义的路由路径（如 `/user-management`） |
| **GetPage** | GetX 路由配置单元，包含路径、页面构建器和 Binding |
| **Middleware** | 路由中间件，在页面跳转前后执行横切逻辑 |
| **arguments** | 路由跳转时传递的参数 |

## 架构模式

| 术语 | 定义 |
|------|------|
| **GetView 模式** | 页面 Widget 继承 `GetView<T>`，通过 `controller` 访问业务逻辑 |
| **Binding 注入** | 在路由配置的 `binding` 参数中注册 Controller，自动管理生命周期 |
| **Obx 下沉** | 将 Obx 包裹最小刷新单元而非整个页面，减少不必要的 Widget 重建 |
| **const 构造** | 无动态参数的 Widget 使用 const 构造函数，减少重建开销 |
| **features 模块化** | 按业务功能划分目录，每个 feature 包含完整的 MVC 三层结构 |

## 命名规则速查

| 类型 | 规则 | 示例 |
|------|------|------|
| Dart 文件 | snake_case | `user_management_controller.dart` |
| Widget 类 | PascalCase | `UserManagementPage` |
| Controller 类 | PascalCase + Controller | `UserManagementController` |
| Binding 类 | PascalCase + Binding | `UserManagementBinding` |
| 变量/方法 | camelCase | `isLoading`、`handleSearchChange` |
| 私有成员 | _前缀 | `_currentPage`、`_loadData` |
| 常量 | camelCase | `maxPageSize`、`defaultTimeout` |
| 路由常量 | camelCase | `userManagement` |
