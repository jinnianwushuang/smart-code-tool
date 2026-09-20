# 任务：深度代码审查

> AI 按 10 大检查维度逐项审查代码，输出结构化检查报告。

## 执行步骤

### 步骤 1：确定检查范围

执行 common-steps.md 步骤 A-B，确定并扫描目标文件。

### 步骤 2：维度 1 — 代码规范

参照 `check-rules/code-quality.md`，检查：

- 单文件行数
- 单函数体行数
- 注释比例
- 命名规范

### 步骤 3：维度 2 — Flutter Widget

参照 `check-rules/flutter-widget.md`，检查：

- const 构造函数
- 列表 key
- build 方法体积
- build 内 setState / Get.put
- Material 3 与旧 API（WidgetStateProperty / PopScope）
- GetX 三件套规范
- Obx / GetBuilder 粒度
- 深层 Widget 嵌套
- 未使用导入

### 步骤 4：维度 3 — 性能

参照 `check-rules/performance.md`，检查：

- const Widget 复用
- ListView.builder vs ListView
- RepaintBoundary
- 不必要的重建
- 图片缓存与尺寸
- 大计算未放 Isolate

### 步骤 5：维度 4 — 内存管理

参照 `check-rules/memory-management.md`，检查：

- Controller dispose
- 监听器移除
- Timer 取消
- StreamSubscription 取消
- AnimationController / FocusNode 释放
- GetX Worker onClose
- 全局 Controller permanent

### 步骤 6：维度 5 — 并发处理

参照 `check-rules/concurrency.md`，检查：

- 竞态条件
- async gap 后 mounted 判断
- Isolate 使用
- 防抖/节流

### 步骤 7：维度 6 — 国际化（如已开启）

如 config.md 中 `i18n_check_enabled` 为 `true`，参照 `check-rules/i18n-check.md` 检查。否则跳过。

### 步骤 8：维度 7 — 安全

参照 `check-rules/security.md`，检查：

- 敏感信息硬编码
- 明文存储（SharedPreferences 存 Token）
- http 明文传输
- SQL 拼接注入
- 不安全正则
- 证书校验关闭

### 步骤 9：维度 8 — 错误处理

参照 `check-rules/error-handling.md`，检查：

- try/catch 覆盖
- runZonedGuarded
- FlutterError.onError
- Dio 拦截器错误处理
- 错误友好化

### 步骤 10：维度 9 — 组件设计

参照 `check-rules/component-design.md`，检查：

- Widget 职责
- Widget 树深度
- GetX Binding 注入
- 状态与视图耦合
- 循环依赖

### 步骤 11：维度 10 — 代码卫生

参照 `check-rules/code-hygiene.md`，检查：

- print/debugPrint
- 死代码
- TODO/FIXME
- 重复代码
- 魔法数字

### 步骤 12：生成报告

执行 common-steps.md 步骤 D-E-F，生成深度审查报告。

## 完成标准

- [ ] 10 个维度全部检查（i18n 视开关而定）
- [ ] 每条问题标注严重级别
- [ ] 报告已生成并保存
- [ ] 如有上次报告，已追加对比
- [ ] 总表已更新
