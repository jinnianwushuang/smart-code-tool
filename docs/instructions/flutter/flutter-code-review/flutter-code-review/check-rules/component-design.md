# 组件设计（component-design）

> 检查 Widget 与 Controller 的设计合理性，确保可维护性和架构健康。

## 检查项

### 1. Widget / Controller 职责过多

- **严重级别**：🟡 Warning
- **检查方式**：检查单个 Widget 或 GetxController 是否承担了过多职责（数据获取 + 业务逻辑 + 渲染混在一起）
- **处理建议**：按三件套拆分，职责下沉
- **拆分策略**：
  - View（GetView）负责布局与渲染
  - Controller 承载状态与业务逻辑
  - Service / Repository 层负责数据获取
  - 独立子 Widget 封装特定 UI 交互（弹窗、卡片）

### 2. Widget 树嵌套过深 / 巨型 build

- **严重级别**：🟡 Warning
- **检查方式**：检查 `build` 方法的 Widget 树是否嵌套过深或过长（如超 200 行）
- **处理建议**：抽取子 Widget 与私有 `_buildXxx` 方法，每个子 Widget 负责一个独立功能区域

### 3. 状态与视图强耦合

- **严重级别**：🟡 Warning
- **检查方式**：
  - StatefulWidget 中是否将大量业务逻辑写进 State
  - Controller 中是否直接持有 Widget / BuildContext / 操作 UI
- **处理建议**：状态逻辑收敛到 Controller，View 通过 Obx/GetBuilder 订阅；Controller 不引用 Widget 层

### 4. GetX Binding 注入缺失或滥用全局

- **严重级别**：🟡 Warning
- **检查方式**：
  - 页面 Controller 是否通过 Binding（`GetPage(bindings:)`）注入，而非在 View 内 `Get.put`
  - 是否滥用 `Get.put(permanent: true)` 导致页面级 Controller 无法回收
- **正确写法**：

```dart
GetPage(
  name: Routes.user,
  page: () => const UserView(),
  binding: UserBinding(), // ✅ 通过 Binding 注入
)
```

- **处理建议**：页面级依赖用 Binding + `Get.lazyPut`；仅全局服务用 `permanent: true`

### 5. 循环依赖（A 导入 B，B 导入 A）

- **严重级别**：🔴 Error
- **检查方式**：检查模块间是否存在循环 `import` 关系
- **问题示例**：

```dart
// a.dart
import 'b.dart';
// b.dart
import 'a.dart';
```

- **处理建议**：
  - 抽取公共逻辑/模型到第三个文件
  - 通过接口抽象或事件解耦
  - 延迟导入（`import ... deferred as`）
