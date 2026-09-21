# 通用基础步骤

> 被各任务指令复用的通用步骤。任务指令中通过「执行 common-steps.md 中的步骤 X」引用。

## 步骤 A：创建 Binding

```
1. 参照 architecture/controller-reference.md
2. 创建 Binding 文件：<功能名>_binding.dart
3. 使用 Get.lazyPut 注册页面 Controller（fenix: true）
4. 如需 API 服务，一并注册
```

## 步骤 B：创建 Controller

```
1. 参照 architecture/controller-reference.md
2. 创建 Controller 文件：<功能名>_controller.dart
3. 声明响应式状态（.obs）和简单状态
4. 实现 onInit（同步初始化）、onReady（异步加载）、onClose（资源清理）
5. 实现事件处理方法（handle* 前缀）
6. 实现私有业务方法（_前缀）
```

## 步骤 C：创建 Widget

```
1. 参照 architecture/widget-reference.md
2. 页面入口 Widget 使用 GetView<Controller>
3. 子组件使用 StatelessWidget 或 GetView
4. const 构造函数优先
5. Obx 下沉至叶子节点
6. 使用 Material 3 组件（参照 config.md 中的 material_component_mapping）
```

## 步骤 D：静态分析自检

```
1. 命名规范检查
   - 文件命名：snake_case
   - 类命名：PascalCase
   - 变量/方法：camelCase
   - 私有成员：_前缀

2. 注释比例检查
   - 计算注释行数 / 总行数
   - 确认 ≥ min_comment_ratio（默认 10%）

3. 文件行数检查
   - Widget 文件 ≤ max_widget_lines（默认 200 行）
   - Controller 文件 ≤ max_controller_lines（默认 300 行）
   - 单函数 ≤ max_function_lines（默认 50 行）

4. 架构合规检查
   - build 方法内无 Get.put
   - build 方法内无状态修改
   - Obx 包裹最小刷新单元
   - const 构造函数已使用
   - onClose 资源清理完整

5. GetX 约束检查
   - Controller 通过 Binding 注册
   - Rx 变量在 onClose 中关闭
   - 无 Navigator.push 使用
```

## 步骤 E：输出执行报告

```
## 执行报告

### 创建/修改文件清单
1. <文件路径> — <文件说明>
2. ...

### 自检结果
- 命名规范：✅ / ❌
- 注释比例：✅ X%（≥ Y%）
- 文件行数：✅ 最大 N 行（≤ M 行）
- 架构合规：✅ / ❌
- GetX 约束：✅ / ❌

### 建议
- （如有需要手动确认的事项）
- 建议手动启动项目自检，确认功能正常
```
