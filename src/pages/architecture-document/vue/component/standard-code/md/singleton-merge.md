---
title: 单实例状态机
order: 21
---

## 单实例状态

## 1. 子模块代码示例 (`module/user.js`)

```javascript
// src/store/module/user.js

export const user_info = { name: 'Guest' }

export const logout = () => {
  /* ... */
}

// 这个函数会被提取到总的 init_singleton 中
export const init_singleton = async (config) => {
  console.log('User module initializing with:', config)
  user_info.name = 'Admin'
}
```
