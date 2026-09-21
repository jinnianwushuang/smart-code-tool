# 任务：代码检查

> 检查代码是否符合 GetX 架构规范，生成检查报告。

## 执行步骤

### 1. 确定检查范围

```
1. 确认检查目标（单文件 / 单模块 / 整个功能）
2. 读取目标代码文件
3. 如有歧义，触发「存疑即问」
```

### 2. 命名规范检查

```
1. 文件命名：snake_case
2. Widget 类：PascalCase
3. Controller 类：PascalCase + Controller
4. Binding 类：PascalCase + Binding
5. 变量/方法：camelCase
6. 私有成员：_前缀
7. 路由常量：AppRoutes.xxx
```

### 3. 架构合规检查

```
1. build 方法内是否有 Get.put
2. build 方法内是否有状态修改
3. build 方法内是否有 API 调用
4. Controller 是否通过 Binding 注册
5. 页面入口是否使用 GetView<Controller>
```

### 4. GetX 约束检查

```
1. Obx 是否包裹最小刷新单元
2. const 构造函数是否使用
3. Rx 变量是否在 onClose 中关闭
4. Timer/Debounce 是否在 onClose 中取消
5. 是否使用 Get.toNamed（非 Navigator.push）
```

### 5. 状态管理检查

```
1. 频繁变化的数据是否使用 .obs
2. 不频繁变化的数据是否使用 GetBuilder
3. 计算属性是否使用 getter
4. RxList 是否使用 assignAll
```

### 6. 样式规范检查

```
1. 是否使用 Theme.of(context)
2. 是否有硬编码颜色值
3. 是否使用 WidgetStateProperty
4. 是否遵循优先级链
```

### 7. 代码量检查

```
1. Widget 文件行数 ≤ max_widget_lines
2. Controller 文件行数 ≤ max_controller_lines
3. 单函数行数 ≤ max_function_lines
4. build 方法行数 ≤ 30
```

### 8. 注释检查

```
1. 类是否有文档注释
2. 公共方法是否有文档注释
3. 注释比例 ≥ min_comment_ratio
```

### 9. 生成检查报告

```
→ 执行 common-steps.md 中的步骤 E（输出执行报告）
→ 额外输出：
  - 各项检查的详细通过/不通过情况
  - 问题严重等级（错误/警告/建议）
  - 修复建议
```

### 10. 更新报告总表

```
1. 将本次检查结果追加到代码检查报告总表
2. 报告存放路径：config.md 中的 code_review_report_dir
```

## 完成标准

- [ ] 所有检查项已逐项执行
- [ ] 检查报告已生成
- [ ] 问题已按严重等级分类
- [ ] 修复建议已给出
- [ ] 报告总表已更新
