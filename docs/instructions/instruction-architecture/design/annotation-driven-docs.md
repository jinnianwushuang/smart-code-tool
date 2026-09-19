# 注解驱动文档生成

> 代码注解驱动文档自动生成，文档结构以实际项目代码为准，而非手动维护

---

## 整体流程

```
代码中的注解标记 → 脚本全局扫描抓取 → 按 UUID 聚合 → TITLE 切割生成目录 → 生成 Markdown + sidebar
```

不是手动写文档目录，而是通过脚本从代码中提取注解，按规则自动生成文档树。

---

## 注解格式

采用多行独立前缀方式，每个字段使用独立的 `AUTO_DOC_` 前缀行：

```
AUTO_DOC_UUID:    <唯一标识符>
AUTO_DOC_TITLE:   <标题值，支持 / 作为目录分隔符>
AUTO_DOC_SECTION: <章节标识，通常带序号如 1.概述>
AUTO_DOC_CONTENT:
<内容行 1>
<内容行 2>
```

### 层级关系

```
UUID ←→ TITLE          一对一，一个 UUID 只对应一个 TITLE
UUID → SECTION (N)     一对多，一个 UUID 可包含多个 SECTION
SECTION → CONTENT (N)  一对多，每个 SECTION 可包含一个或多个 CONTENT
```

### 字段说明

| 字段               | 关系 | 说明                                                    |
| ------------------ | ---- | ------------------------------------------------------- |
| `AUTO_DOC_UUID`    | 1:1  | 文档节点唯一标识，全局不重复，**可跨文件**              |
| `AUTO_DOC_TITLE`   | 1:1  | 文档节点标题，**用 `/` 切割生成目录层级**               |
| `AUTO_DOC_SECTION` | 1:N  | 段落标题，**按 SECTION 值自然排序**（如 1.概述 2.用法） |
| `AUTO_DOC_CONTENT` | 1:N  | 段落内容，**Markdown 语法**，可直接拼接生成文档         |

---

## 跨语言通用

注解格式与编程语言无关，`AUTO_DOC_` 关键字在所有语言的注释中都适用：

**JavaScript / TypeScript / Java / Go（`//` 或 `/* */`）：**

```javascript
/**
 * AUTO_DOC_UUID: abc123
 * AUTO_DOC_TITLE: 模块名称
 * AUTO_DOC_SECTION: 1.概述
 * AUTO_DOC_CONTENT:
 * 模块功能描述
 */
```

**Python / Ruby / Shell（`#`）：**

```python
# AUTO_DOC_UUID: abc123
# AUTO_DOC_TITLE: 模块名称
# AUTO_DOC_SECTION: 1.概述
# AUTO_DOC_CONTENT:
# 模块功能描述
```

**HTML / Vue Template / XML（`<!-- -->`）：**

```html
<!--
  AUTO_DOC_UUID: abc123
  AUTO_DOC_TITLE: 组件名称
  AUTO_DOC_SECTION: 1.概述
  AUTO_DOC_CONTENT:
  组件功能描述
-->
```

**Dart / Kotlin / C#（`///` 或 `//`）：**

```dart
/// AUTO_DOC_UUID: abc123
/// AUTO_DOC_TITLE: Widget 名称
/// AUTO_DOC_SECTION: 1.概述
/// AUTO_DOC_CONTENT:
/// Widget 功能描述
```

**SQL（`--`）：**

```sql
-- AUTO_DOC_UUID: abc123
-- AUTO_DOC_TITLE: 存储过程名称
-- AUTO_DOC_SECTION: 1.概述
-- AUTO_DOC_CONTENT:
-- 存储过程功能描述
```

---

## 跨文件扫描与聚合

### 扫描规则

- **全局扫描**：遍历指定目录下所有文件，匹配 `AUTO_DOC_` 关键字
- **跨文件抓取**：同一 UUID 可能出现在多个文件中，属于同一份文档
- **每次记录来源**：每条注解同时记录来源文件路径和行号

### 聚合逻辑

```
全局扫描结果（跨所有文件）
  ↓
按 UUID 聚合 → 同一 UUID 不论来自几个文件，合并为一个文档节点
  ↓
TITLE 切割生成目录 → "架构/脚手架/设计思路" → 三层目录结构
  ↓
每个 SECTION 附带源文件信息 → 生成文档时标注来源
  ↓
同一 UUID 内的 SECTION 按值自然排序
  ↓
同一 SECTION 内的多行 CONTENT 直接拼接 → Markdown 语法，原样输出
  ↓
输出树形结构 → 生成 Markdown 文件和 sidebar 配置
```

---

## TITLE 切割生成目录

`AUTO_DOC_TITLE` 的值按 `/` 切割，直接生成目录层级：

```
注解：AUTO_DOC_TITLE: 架构/脚手架/设计思路

生成：
docs/
└── 架构/
    └── 脚手架/
        └── 设计思路.md
```

同一父目录下多个 TITLE 自动成为同级文档：

```
AUTO_DOC_TITLE: 架构/脚手架/设计思路     → docs/架构/脚手架/设计思路.md
AUTO_DOC_TITLE: 架构/脚手架/目录规范     → docs/架构/脚手架/目录规范.md
AUTO_DOC_TITLE: 架构/装配模式/概述       → docs/架构/装配模式/概述.md

生成：
docs/
└── 架构/
    ├── 脚手架/
    │   ├── 设计思路.md
    │   └── 目录规范.md
    └── 装配模式/
        └── 概述.md
```

---

## SECTION 自然排序

同一 UUID 内的多个 SECTION 按值自然排序，作者通过序号控制顺序：

```
"1.概述" < "2.用法" < "3.API" < "10.更新日志"
```

无需额外排序字段。

---

## 源文件追溯

每个 SECTION 独立记录来源文件和行号，生成的文档每个小节带来源标注：

```markdown
## 1.概述

提供通用的平台判断工具方法

> 📎 来源: [src/utils/platform.js](file:///src/utils/platform.js#L10-L18)

## 2.注意事项

需要在 Quasar 环境下使用

> 📎 来源: [src/components/DeviceDetector.vue](file:///src/components/DeviceDetector.vue#L24-L36)
```

同一个 UUID 的不同 SECTION 可以来自不同文件，各自标注各自的来源位置。

---

## 与指令集体系的配合

| 场景              | 说明                                                 |
| ----------------- | ---------------------------------------------------- |
| 第 3 层日常开发时 | 新增模块/组件时同步添加注解，文档自动更新            |
| 第 4 层代码检查时 | 脚本可检查注解覆盖率（核心模块是否有注解）           |
| 第 6 层文档生成时 | 注解是文档生成的原料之一，也可结合 AI 补充更详细描述 |
| 伴生文档站        | VitePress 直接渲染生成的 Markdown，sidebar 自动更新  |

---

## 设计决策

| 决策                        | 理由                                                     |
| --------------------------- | -------------------------------------------------------- |
| 注解嵌入代码而非独立文件    | 文档与代码同生命周期，代码改了注解就在旁边，不易过期     |
| UUID 作为合并键，跨文件聚合 | 同一实体的注解可分散在多个文件中，全局扫描后按 UUID 合并 |
| TITLE 即路径                | 作者写注解时就决定文档目录位置，比算法推断更直接可控     |
| SECTION 自然排序            | 作者通过序号控制顺序，无需额外排序字段                   |
| CONTENT 为 Markdown 语法    | 直接拼接生成文档，支持代码块、列表、加粗等富文本         |
| 每个 SECTION 附带源文件链接 | 读者可直接跳转到代码位置，文档与源码可追溯               |
| 跨语言通用                  | AUTO_DOC 关键字不依赖任何语言的注释语法                  |
