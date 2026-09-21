# 目录结构约定

> Flutter + GetX 项目的标准目录结构与命名规范。

## 页面目录标准结构

```
lib/features/user_management/           ← 功能模块目录
├── bindings/
│   └── user_management_binding.dart    ← Binding（Controller 注册）
├── controllers/
│   └── user_management_controller.dart ← Controller（业务逻辑）
├── pages/
│   └── user_management_page.dart       ← 页面入口 Widget
├── widgets/                            ← 页面级子组件
│   ├── search_bar.dart
│   ├── data_table.dart
│   └── edit_dialog.dart
├── models/                             ← 页面级数据模型
│   └── user.dart
├── services/                           ← 页面级 API 服务（可选）
│   └── user_api.dart
└── utils/                              ← 页面级工具（可选）
    └── validators.dart
```

## 全局共享目录结构

```
lib/
├── app/                                ← 应用级配置
│   ├── routes/
│   │   ├── app_routes.dart             ← 路由常量
│   │   └── app_pages.dart              ← 路由页面映射
│   ├── theme/
│   │   ├── app_theme.dart              ← 主题配置
│   │   └── app_colors.dart             ← 颜色常量
│   └── values/                         ← 全局常量
│       └── app_constants.dart
│
├── core/                               ← 核心基础设施
│   ├── network/
│   │   ├── api_client.dart             ← HTTP 客户端封装
│   │   └── api_response.dart           ← 统一响应模型
│   ├── storage/
│   │   └── local_storage.dart          ← 本地存储
│   ├── extensions/
│   │   └── string_extensions.dart      ← 扩展方法
│   └── utils/
│       ├── debounce.dart               ← 防抖工具
│       └── date_utils.dart             ← 日期工具
│
├── shared/                             ← 全局共享
│   ├── controllers/
│   │   └── auth_controller.dart        ← 全局 Controller
│   ├── bindings/
│   │   └── auth_binding.dart           ← 全局 Binding
│   ├── widgets/                        ← 全局共享组件
│   │   ├── loading_overlay.dart
│   │   └── empty_state.dart
│   └── models/
│       └── user.dart                   ← 全局共享模型
│
├── features/                           ← 功能模块（按业务划分）
│   ├── auth/                           ← 认证模块
│   ├── home/                           ← 首页模块
│   ├── user_management/                ← 用户管理模块
│   └── settings/                       ← 设置模块
│
└── main.dart                           ← 应用入口
```

## 文件命名规则

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| Dart 文件 | snake_case | `user_management_controller.dart` |
| Widget 类 | PascalCase | `UserManagementPage` |
| Controller 类 | PascalCase + Controller | `UserManagementController` |
| Binding 类 | PascalCase + Binding | `UserManagementBinding` |
| Model 类 | PascalCase | `User`、`ProductDetail` |
| API 服务类 | PascalCase + Api | `UserApi`、`ProductApi` |
| 私有 Widget | _PascalCase | `_SearchBar`、`_DataTable` |
| 常量 | camelCase | `maxPageSize`、`defaultTimeout` |
| 变量/方法 | camelCase | `isLoading`、`handleSearchChange` |
| 路由常量 | camelCase | `userManagement` |

## 模块划分原则

```
一个 feature 模块 = 一个独立业务功能

模块内部自治：
  - 自己的 Controller、Binding、Page、Widget
  - 自己的 Model（如果不与全局共享）
  - 自己的 API 服务（可选，也可放在 core/）

模块间通信：
  - 通过全局 Controller（如 AuthController）
  - 通过路由参数传递
  - 通过事件总线（如需解耦）
```

## 小型项目简化结构

```
lib/
├── app/
│   ├── routes/
│   └── theme/
├── core/
│   └── network/
├── pages/                    ← 页面直接放在 pages/ 下
│   ├── login/
│   │   ├── login_controller.dart
│   │   ├── login_binding.dart
│   │   └── login_page.dart
│   └── home/
│       ├── home_controller.dart
│       ├── home_binding.dart
│       └── home_page.dart
├── shared/
│   └── widgets/
└── main.dart
```

> 当功能模块超过 5 个或单个模块文件超过 10 个时，建议切换到 `features/` 模块化结构。
