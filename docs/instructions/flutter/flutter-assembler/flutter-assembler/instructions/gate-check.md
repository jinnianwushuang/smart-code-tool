# 门禁检查 — 前置条件

> AI 执行任务前必须通过的 4 类前置检查。任一不通过则停止并告知缺失项。

## 检查清单

### 1. 配置完整性检查

检查 config.md 中必填项是否已填写：

```
→ features_root_path 不为空
→ shared_widgets_path 不为空
→ shared_controllers_path 不为空
→ routes_config_path 不为空
→ api_client_path 不为空
→ flutter_version 不为空
→ getx_version 不为空
→ ui_style 不为空
→ api_request_lib 不为空
→ local_storage_lib 不为空
```

**不通过处理**：列出所有空值配置项，要求用户补充后重新执行。

### 2. 核心文件存在性检查

检查 config.md 中引用的关键路径是否存在：

```
→ 路由配置文件（routes_config_path）
→ 主题配置文件（theme_config_path）
→ API 客户端文件（api_client_path）
```

**不通过处理**：列出所有不存在的文件路径，要求用户确认路径是否正确。

### 3. 任务信息检查

检查用户提交的任务信息是否包含必要字段：

```
→ 任务类型（可自动识别或用户明确指定）
→ 问题描述（具体需求内容）
→ 目标目录（输出路径）
```

**不通过处理**：列出缺失字段，给出建议选项，等待用户补充。

### 4. 依赖检查

检查项目是否满足基本依赖要求：

```
→ Flutter SDK 版本与 config.md 配置兼容
→ get 包已添加到 pubspec.yaml
→ 其他 config.md 中声明的依赖库已安装
```

**不通过处理**：列出缺失的依赖，给出 `flutter pub add` 命令建议。

## 检查结果输出格式

```
## 门禁检查结果

### 配置完整性：✅ / ❌
### 核心文件存在性：✅ / ❌
### 任务信息：✅ / ❌
### 依赖检查：✅ / ❌

（如有不通过项，列出具体缺失内容）
```
