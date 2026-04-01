---
title: 单实例状态机
order: 21
---

## 单实例状态

## 1. 子模块代码示例 (`state/singleton/user.js`)

```javascript
import { ref } from 'vue'
export const user_info = ref({ name: 'Guest' })

export const logout = () => {
  /* ... */
}

// 这个函数会被提取到总的 init_singleton 中
export const init_singleton = () => {
  user_info.value = { name: 'Guest' }
}
```

## 2. 聚合单实例变量 (`state/singleton.js`)

```javascript
import { smart_merge_singleton } from 'src/output/common/project-common.js'

// 引入公共弹窗组件的 singleton
import * as dialog_copy_use_singleton from 'src/components/dialog/dialog-copy-use/state/singleton.js'
// 扫描模块
const modules = import.meta.glob('./singleton/*.js', { eager: true })

export const { all_singleton, init_singleton } = smart_merge_singleton(
  modules,
  dialog_copy_use_singleton,
)
```
