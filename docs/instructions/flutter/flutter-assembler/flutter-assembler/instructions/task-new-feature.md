# 任务：新需求开发

> 从零创建符合架构规范的新页面/模块。

## 执行步骤

### 1. 分析需求

```
1. 理解需求描述，确定页面/模块的功能范围
2. 识别需要的子组件（搜索区、表格区、对话框等）
3. 识别需要的状态（列表数据、表单数据、分页等）
4. 识别需要的 API 接口
5. 如有歧义，触发「存疑即问」
```

### 2. 创建目录结构

```
lib/features/<功能名>/
├── bindings/
│   └── <功能名>_binding.dart       # Binding
├── controllers/
│   └── <功能名>_controller.dart    # Controller
├── pages/
│   └── <功能名>_page.dart          # 页面入口 Widget
├── widgets/                        # 页面级子组件
│   ├── search_bar.dart
│   ├── data_table.dart
│   └── edit_dialog.dart
├── models/                         # 数据模型（如需）
│   └── <模型名>.dart
└── services/                       # API 服务（如需）
    └── <功能名>_api.dart
```

### 3. 创建 Controller

```
1. 参照 architecture/controller-reference.md
2. 声明响应式状态（.obs）和简单状态
3. 实现 onInit（同步初始化）
4. 实现 onReady（首次数据加载）
5. 实现 onClose（资源清理）
6. 实现事件处理函数（handle*）
7. 实现私有业务方法（_前缀）
```

### 4. 创建 Binding

```
1. 参照 architecture/controller-reference.md 中的 Binding 部分
2. 使用 Get.lazyPut 注册 Controller（fenix: true）
3. 如需 API 服务，使用 Get.lazySingleton 注册
```

### 5. 创建页面入口 Widget

```
1. 参照 architecture/widget-reference.md
2. 使用 GetView<Controller>
3. 组合子组件
4. 保持 build 方法简洁（≤ 30 行）
```

### 6. 创建子组件

```
1. 每个子组件一个文件，snake_case.dart 命名
2. const 构造函数优先
3. Obx 下沉至叶子节点
4. 使用 Material 3 组件（参照 config.md 中的 material_component_mapping）
```

### 7. 执行通用步骤

```
→ 执行 common-steps.md 中的步骤 D（静态分析自检）
→ 执行 common-steps.md 中的步骤 E（输出执行报告）
```

## 完成标准

- [ ] 页面可正常渲染（结构完整）
- [ ] Controller 包含所有需要的状态和方法
- [ ] Binding 正确注册 Controller
- [ ] 子组件通过 Controller 通信
- [ ] 代码符合命名规范和代码量约束
- [ ] 注释比例达标
- [ ] 执行报告已输出
