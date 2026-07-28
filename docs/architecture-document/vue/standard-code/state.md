---
title: 零件-属性
order: 21
---

# 零件-属性

## 零件-属性-目录结构

```text
./state
├── computed.js
├── config.js
├── multiton.js
├── singleton
│   ├── dialog.js
│   ├── other.js
│   └── table.js
└── singleton.js
```

## 单实例属性

#### 1. 单实例子模块示例：state/singleton/other.js

```javascript
import { ref } from 'vue'
export const user_info = ref({ name: 'Guest' })

// 这个函数会被提取到总的 init_all_singleton 中
export const init_singleton = () => {
  user_info.value = { name: 'Guest' }
}
```

#### 2. 聚合单实例变量：state/singleton.js

```javascript
import { common_assemble_singleton } from 'src/output/common/project-common.js'

// 引入公共弹窗组件的 singleton
import * as dialog_copy_use_singleton from 'src/components/dialog/dialog-copy-use/state/singleton.js'
// 扫描模块
const modules = import.meta.glob('./singleton/*.js', { eager: true })
// 装配 singleton
export const { all_singleton, init_all_singleton } = common_assemble_singleton(
  modules,
  dialog_copy_use_singleton,
)
```

## 多实例属性：state/multiton.js

```javascript
import { ref } from 'vue'

export const create_multiton_variable = (payload) => {
  const current_time = ref(new Date())
  return { current_time }
}
```

## 计算属性：state/computed.js

```javascript
import { computed } from 'vue'
export const create_computed_variable = (payload) => {
  const demo_computed = computed(() => {
    return 'demo_computed'
  })
  return {
    demo_computed,
  }
}
```

## 常量属性：state/config.js

```javascript
export const demo_options = []
```
