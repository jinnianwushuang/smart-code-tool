# 注解格式规范

> AUTO_DOC 注解的跨语言格式标准，适用于所有编程语言

---

## 概述

`AUTO_DOC_` 注解是一种嵌入在代码注释中的结构化标记，用于驱动文档自动生成。  
注解关键字在所有编程语言中保持一致，仅注释语法随语言变化。

---

## 注解字段

| 字段 | 关系 | 说明 |
|------|------|------|
| `AUTO_DOC_UUID` | 1:1 | 文档节点唯一标识，全局不重复，可跨文件 |
| `AUTO_DOC_TITLE` | 1:1 | 文档节点标题，用 `/` 切割生成目录层级 |
| `AUTO_DOC_SECTION` | 1:N | 段落标题，按值自然排序（如 1.概述 2.用法） |
| `AUTO_DOC_CONTENT` | 1:N | 段落内容，Markdown 语法，直接拼接生成文档 |

---

## 层级关系

```
UUID ←→ TITLE          一对一
UUID → SECTION (N)     一对多
SECTION → CONTENT (N)  一对多
```

---

## 跨语言注释语法

### JavaScript / TypeScript / Java / Go / C#

```javascript
/**
 * AUTO_DOC_UUID: abc123def456
 * AUTO_DOC_TITLE: 架构/脚手架/设计思路
 *
 * AUTO_DOC_SECTION: 1.概述
 * AUTO_DOC_CONTENT:
 * 本文档描述脚手架的**核心设计理念**和实现方案
 *
 * AUTO_DOC_SECTION: 2.目录结构
 * AUTO_DOC_CONTENT:
 * ```
 * src/
 * ├── core/
 * └── utils/
 * ```
 */
```

### Python / Ruby / Shell / YAML

```python
# AUTO_DOC_UUID: abc123def456
# AUTO_DOC_TITLE: 数据处理/ETL流程/概述
#
# AUTO_DOC_SECTION: 1.概述
# AUTO_DOC_CONTENT:
# ETL 流程负责数据的**抽取、转换、加载**三个步骤
#
# AUTO_DOC_SECTION: 2.配置说明
# AUTO_DOC_CONTENT:
# - 配置文件位于 `config/etl.yaml`
# - 支持环境变量覆盖
```

### HTML / Vue Template / XML

```html
<!--
  AUTO_DOC_UUID: abc123def456
  AUTO_DOC_TITLE: 组件库/表单组件/输入框

  AUTO_DOC_SECTION: 1.概述
  AUTO_DOC_CONTENT:
  通用输入框组件，支持 **v-model** 双向绑定

  AUTO_DOC_SECTION: 2.Props
  AUTO_DOC_CONTENT:
  | Prop | 类型 | 默认值 | 说明 |
  |------|------|--------|------|
  | modelValue | string | '' | 绑定值 |
  | placeholder | string | '' | 占位文本 |
-->
```

### Dart (Flutter)

```dart
/// AUTO_DOC_UUID: abc123def456
/// AUTO_DOC_TITLE: UI组件/按钮组件/概述
///
/// AUTO_DOC_SECTION: 1.概述
/// AUTO_DOC_CONTENT:
/// 通用按钮组件，支持多种样式变体
///
/// AUTO_DOC_SECTION: 2.使用示例
/// AUTO_DOC_CONTENT:
/// ```dart
/// AppButton(
///   text: '提交',
///   onPressed: () => submit(),
/// )
/// ```
```

### SQL

```sql
-- AUTO_DOC_UUID: abc123def456
-- AUTO_DOC_TITLE: 数据库/存储过程/用户统计
--
-- AUTO_DOC_SECTION: 1.概述
-- AUTO_DOC_CONTENT:
-- 统计用户活跃数据的存储过程
--
-- AUTO_DOC_SECTION: 2.参数说明
-- AUTO_DOC_CONTENT:
-- - `start_date`: 统计开始日期
-- - `end_date`: 统计结束日期
```

### Kotlin / Swift

```kotlin
// AUTO_DOC_UUID: abc123def456
// AUTO_DOC_TITLE: Android/网络层/请求拦截器
//
// AUTO_DOC_SECTION: 1.概述
// AUTO_DOC_CONTENT:
// 统一处理请求头的拦截器，自动附加 **Token** 和设备信息
```

---

## 解析规则

```
遇到 AUTO_DOC_UUID → 创建新文档节点（或合并到已有 UUID）
遇到 AUTO_DOC_TITLE → 绑定标题，按 / 切割生成目录路径
遇到 AUTO_DOC_SECTION → 在当前 UUID 下创建新段落
遇到 AUTO_DOC_CONTENT → 追加到当前 SECTION 的内容（Markdown 语法，直接拼接）
每次记录注解时同时记录来源文件路径和行号
```

---

## 排序规则

同一 UUID 内的多个 SECTION 按 SECTION 值**自然排序**：

```
"1.概述" < "2.用法" < "3.API" < "10.更新日志"
```

---

## 目录生成规则

`AUTO_DOC_TITLE` 按 `/` 切割，每段对应一层目录：

```
AUTO_DOC_TITLE: 架构/脚手架/设计思路
→ docs/架构/脚手架/设计思路.md
```

---

## 源文件追溯

每个 SECTION 独立记录来源文件和行号，生成的文档标注：

```markdown
> 📎 来源: [src/utils/platform.js](file:///src/utils/platform.js#L10-L18)
```

---

## 扫描脚本正则参考

通用正则表达式（匹配 AUTO_DOC 关键字行）：

```regex
/^\s*(?:\/\/|#|--|\/\*\*?\s*\*|<!--\s*)?AUTO_DOC_(UUID|TITLE|SECTION|CONTENT):\s*(.*)/
```

各语言可在此基础上适配注释语法前缀。

---

## 注意事项

| 注意项 | 说明 |
|--------|------|
| UUID 全局唯一 | 建议使用有意义的长字符串，避免冲突 |
| TITLE 中的 `/` | 作为目录分隔符，不要在标题中使用 `/` 表示"或" |
| SECTION 带序号 | 建议始终带序号，确保排序可控 |
| CONTENT 支持 Markdown | 代码块、列表、加粗、表格等均可使用 |
| 同一 UUID 可跨文件 | 分散在多个文件中的注解会自动合并 |
| 注释语法不影响关键字 | 脚本只匹配 `AUTO_DOC_` 关键字，注释前缀自动忽略 |
