# 复核自检清单

> AI 完成任务后，必须逐项检查以下清单。未通过的项必须修复后才能输出报告。

## 1. 命名规范

- [ ] Dart 文件使用 snake_case
- [ ] Widget 类使用 PascalCase
- [ ] Controller 类使用 PascalCase + Controller
- [ ] Binding 类使用 PascalCase + Binding
- [ ] 变量/方法使用 camelCase
- [ ] 私有成员使用 _前缀
- [ ] 路由使用常量（AppRoutes.xxx）

## 2. 注释规范

- [ ] 类有 `///` 文档注释
- [ ] 公共方法有 `///` 文档注释
- [ ] 复杂逻辑有 `//` 行内注释
- [ ] 注释比例 ≥ min_comment_ratio（默认 10%）

## 3. 代码量约束

- [ ] Widget 文件 ≤ max_widget_lines（默认 200 行）
- [ ] Controller 文件 ≤ max_controller_lines（默认 300 行）
- [ ] 单函数 ≤ max_function_lines（默认 50 行）
- [ ] build 方法 ≤ 30 行（超过则拆子 Widget）

## 4. 架构合规性

- [ ] build 方法内无 Get.put
- [ ] build 方法内无状态修改
- [ ] build 方法内无 API 调用
- [ ] Controller 通过 Binding 注册
- [ ] 页面入口使用 `GetView<Controller>`

## 5. GetX 约束

- [ ] Obx 包裹最小刷新单元（非整个页面）
- [ ] const 构造函数已使用
- [ ] Rx 变量在 onClose 中关闭
- [ ] Timer/Debounce 在 onClose 中取消
- [ ] 无 Navigator.push 使用（使用 Get.toNamed）

## 6. 状态管理

- [ ] 频繁变化的数据使用 .obs
- [ ] 不频繁变化的数据使用 GetBuilder
- [ ] 计算属性使用 getter
- [ ] RxList 使用 assignAll 批量替换
- [ ] 全局状态使用 Get.lazySingleton

## 7. 样式规范

- [ ] 使用 Theme.of(context) 获取颜色/字体
- [ ] 无硬编码颜色值
- [ ] 使用 WidgetStateProperty（非 MaterialStateProperty）
- [ ] 遵循优先级链：Material 3 > 插件 > Theme > 自定义

## 8. 路由规范

- [ ] 使用 AppRoutes 常量
- [ ] 路由配置中包含 Binding
- [ ] 路由参数通过 Get.arguments 传递

## 9. Material 3 适配

- [ ] 使用 Material 3 组件
- [ ] WidgetStateProperty 替代 MaterialStateProperty
- [ ] NavigationBar 替代 BottomNavigationBar（如适用）

## 10. 完成度

- [ ] 所有需求功能已实现
- [ ] 所有文件已创建
- [ ] 静态分析自检通过
- [ ] 执行报告已输出
