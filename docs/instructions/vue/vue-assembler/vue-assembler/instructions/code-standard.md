# 代码规范

> AI 生成的所有代码必须符合以下规范。

## 1. 命名规范

- **文件名**：`kebab-case`（如 `merchant-search.vue`、`handle_init_table_data.js`）
- **变量名**：`snake_case`（如 `table_data`、`modal_visible`）
- **函数名**：`snake_case`（如 `handle_query_click`、`init_singleton`）
- **常量**：`UPPER_SNAKE_CASE`（如 `ALL_EVENT_PIPELINE`）
- **生命周期函数**：`lifecycle_` 前缀（如 `lifecycle_onMounted`）
- **副作用清理函数**：`cleanup_effect_` 前缀
- **事件处理函数**：`handle_` 或 `on_` 前缀

## 2. 注释规范

- 所有代码注释使用**中文**（或按 config.md 中的 `comment_language` 配置）
- 注释比例不低于 **10%**（或按 config.md 中的 `min_comment_ratio` 配置）
- 每个导出函数必须有简要的功能说明注释
- 复杂逻辑必须有行内注释

## 3. 模块职责规范

- 每个模块文件保持**单一职责**
- 状态模块只负责状态声明和初始化
- 事件管道模块只负责事件处理逻辑
- 副作用模块只负责副作用的注册和清理
- 生命周期模块负责编排初始化/销毁流程

## 4. payload 传递规范

- 所有处理函数的第一个参数为 `payload`
- 通过解构 `payload` 获取所需状态和方法
- 禁止在函数内部重新构造 payload
- 禁止在函数外部访问全局变量（一切通过 payload 传递）

## 5. CSS 编写优先级

生成样式时，必须按以下优先级选择实现方式：

```
1. 框架组件库内置样式（如 <a-table>、<a-modal> 等）
2. 项目已安装插件提供的样式
3. 全局 CSS / CSS 变量（参照 config.md 中的资源清单）
4. 自定义 scoped CSS（最后手段）
```

**禁止产生一堆不通用的 CSS。** 写样式前必须先查阅 config.md 中的项目可用资源清单。

## 6. 代码量约束

- 单文件不超过 **400 行**（或按 config.md 中的 `max_file_lines` 配置），超出必须拆分
- 单函数不超过 **50 行**（或按 config.md 中的 `max_function_lines` 配置），超出必须拆分或抽取子函数
- 注释比例不低于 **10%**（或按 config.md 中的 `min_comment_ratio` 配置）

## 7. 组件规范

- 使用 Vue 3 组合式 API（`<script setup>`）
- 组件保持单一职责，不在组件内写复杂业务逻辑
- 业务逻辑通过事件管道委托，不直接修改状态
- 组件对接必须声明对接文档（父级提供什么状态、通道、函数）
