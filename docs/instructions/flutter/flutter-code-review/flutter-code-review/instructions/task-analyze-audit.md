# 任务：Dart 静态分析审计

> 检查项目的 Dart 静态分析（analysis_options.yaml / flutter_lints）配置完整性，给出优化建议。

## 执行步骤

### 步骤 1：确定检查范围

执行 common-steps.md 步骤 A，确定项目根目录。

### 步骤 2：检查 analysis_options.yaml 是否存在

```
1. 查找项目根目录是否存在 analysis_options.yaml
2. 如不存在，标记为 🟡 Warning，建议创建
3. 记录结果
```

### 步骤 3：检查 lint 规则集

```
1. 如 analysis_options.yaml 存在，检查 include 中是否包含：
   - package:flutter_lints/flutter.yaml（Flutter 官方推荐）
   - 或 package:lints/recommended.yaml（Dart 通用）
2. 如未包含任何规则集，标记为 🟡 Warning
3. 检查是否开启了严格模式相关配置：
   - analyzer > language > strict-casts / strict-raw-types
   - errors 段是否将关键 lint 提升为 error
```

### 步骤 4：检查关键规则与依赖

```
1. 检查是否配置了以下常用规则（或建议补充）：
   - prefer_const_constructors
   - use_build_context_synchronously（async gap 安全）
   - avoid_print
   - prefer_final_locals
2. 如使用代码生成，检查是否引入 build_runner 相关配置
3. 如启用 GetX，建议关注 GetX 相关自定义 lint（若有）
4. 记录缺失的关键规则
```

### 步骤 5：生成报告

执行 common-steps.md 步骤 D、E、F，生成静态分析报告（前缀 `analyze-audit`）。

## 完成标准

- [ ] analysis_options.yaml 已检查
- [ ] flutter_lints / lints 规则集已检查
- [ ] 关键规则与严格模式已检查
- [ ] 报告已生成并保存
- [ ] 总表已更新
