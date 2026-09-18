# 目录结构与文件命名约定

## 模板目录结构

### 多例模板

```
multiton-template/
├── index.vue                          # 主页面组件
├── assembler/                         # 装配器
│   └── assembler.js                   # 主装配器（import.meta.glob 自动扫描）
├── state/                             # 状态管理
│   ├── config.js                      # 静态配置
│   ├── multiton.js                    # 多例状态（每实例独立）
│   └── computed.js                    # 计算属性
├── module/                            # 业务逻辑模块
│   ├── lifecycle/lifecycle.js         # 6 个生命周期钩子
│   ├── emit/emit.js                   # 事件发射器
│   ├── exposed-method/exposed-method.js # 暴露方法
│   ├── event-pipeline/                # 事件管道（按业务域拆分）
│   │   ├── dialog.js
│   │   ├── table.js
│   │   └── other.js
│   ├── effect/                        # 6 种副作用清理
│   │   ├── dom.js
│   │   ├── listener.js
│   │   ├── watcher.js
│   │   ├── timer.js
│   │   ├── mitter.js
│   │   └── other.js
│   └── other-method/                  # 工具方法
│       ├── index.js
│       └── event-listener.js
├── component/                         # UI 组件
└── css/index.scss                     # 样式
```

### 单例模板（差异部分）

```
singleton-template/
├── assembler/
│   ├── assembler.js                   # 主装配器（同多例）
│   └── expose.js                      # 【单例独有】对外声明状态和事件通道
├── state/
│   ├── singleton.js                   # 【单例独有】单例状态聚合
│   ├── singleton/                     # 【单例独有】按业务域拆分的单例状态
│   │   ├── table.js
│   │   ├── dialog.js
│   │   └── other.js
│   ├── multiton.js                    # 多例状态（同多例模板）
│   ├── computed.js                    # 计算属性（同多例模板）
│   └── config.js                      # 静态配置（同多例模板）
├── api-request/                       # 【单例独有】API 请求处理
│   ├── index.js
│   └── module/handle_init_table_data.js
└── ...（其余同多例模板）
```

## 文件命名规则

| 类型         | 命名规则         | 示例                                             |
| ------------ | ---------------- | ------------------------------------------------ |
| Vue 组件文件 | `kebab-case.vue` | `merchant-search.vue`、`dialog-wrapper.vue`      |
| JS 模块文件  | `kebab-case.js`  | `handle_init_table_data.js`、`event-listener.js` |
| 状态文件     | 按业务域命名     | `table.js`、`dialog.js`、`other.js`              |
| 样式文件     | `index.scss`     | 统一使用 `index.scss` 作为入口                   |
| 目录名       | `kebab-case`     | `dialog-wrapper/`、`event-pipeline/`             |

## 变量命名规则

| 类型           | 命名规则                           | 示例                                               |
| -------------- | ---------------------------------- | -------------------------------------------------- |
| 状态变量       | `snake_case`                       | `table_data`、`modal_visible`、`use_time_str`      |
| 函数名         | `snake_case`                       | `handle_query_click`、`init_singleton`             |
| 常量           | `UPPER_SNAKE_CASE` 或 `snake_case` | `ALL_EVENT_PIPELINE`、`default_pagination`         |
| 生命周期函数   | `lifecycle_` 前缀                  | `lifecycle_onMounted`、`lifecycle_onBeforeUnmount` |
| 副作用清理函数 | `cleanup_effect_` 前缀             | `cleanup_effect_watcher`、`cleanup_effect_timer`   |
| 事件处理函数   | `handle_` 或 `on_` 前缀            | `handle_query_click`、`on_table_change`            |

## 新增模块的放置规则

| 需求类型           | 放置位置                               | 文件命名            |
| ------------------ | -------------------------------------- | ------------------- |
| 新增表格相关状态   | `state/singleton/table.js`             | 在已有文件中追加    |
| 新增对话框相关状态 | `state/singleton/dialog.js`            | 在已有文件中追加    |
| 新增其他共享状态   | `state/singleton/other.js` 或新建文件  | `新业务域.js`       |
| 新增计算属性       | `state/computed.js`                    | 在已有文件中追加    |
| 新增对话框事件     | `module/event-pipeline/dialog.js`      | 在已有文件中追加    |
| 新增表格事件       | `module/event-pipeline/table.js`       | 在已有文件中追加    |
| 新增通用事件       | `module/event-pipeline/other.js`       | 在已有文件中追加    |
| 新增业务域事件     | `module/event-pipeline/新业务域.js`    | `新业务域.js`       |
| 新增副作用         | `module/effect/对应类型.js`            | 在已有文件中追加    |
| 新增对话框组件     | `component/dialog-wrapper/component/`  | `组件名/组件名.vue` |
| 新增表格单元格组件 | `component/table-main-area/component/` | `组件名/组件名.vue` |

## 关键约束

- 文件名统一使用 `kebab-case`
- 变量名统一使用 `snake_case`
- 新增模块优先追加到已有文件，业务域差异大时才新建文件
- 所有模块文件必须放在装配器 `import.meta.glob` 可扫描到的路径下
