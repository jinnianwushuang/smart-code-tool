---
title: 状态机定义和初始化函数合并
order: 21
---

## 1. 子模块代码示例 (`module/user.js`)

子模块不需要关心如何被聚合，正常导出即可：

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

## 2. 状态机定义和初始化函数合并

1. **原始 Glob 模块**（包含 `init_singleton` 的 JS 文件集合）。
2. **已聚合的 Scope**（包含 `all_singleton` 和 `init_singleton` 的对象）。

通过这种方式，可以把“文件夹扫描结果”和“已经封装好的业务域”混合传入。

```javascript
/**
 * 模块高级聚合器
 * @param {...Object} sources - 原始 glob 结果或已聚合的对象
 */
export const smart_merge_modules = (...sources) => {
  const final_all_singleton = {}
  const final_init_fns = []

  // 记录变量名来源，用于冲突检测和日志导出
  const name_sources_map = {} // { 'user': ['./module/user.js', 'SystemScope'] }

  sources.forEach((source, index) => {
    const sourceIdentifier = `Source_${index}`

    // 类型判断：如果是已聚合的对象 (包含 all_singleton)
    if (source && source.all_singleton) {
      const { all_singleton, init_singleton } = source

      // 处理 all_singleton
      Object.keys(all_singleton).forEach((key) => {
        trackAndMerge(key, all_singleton[key], sourceIdentifier)
      })

      // 收集初始化函数
      if (typeof init_singleton === 'function') {
        final_init_fns.push(init_singleton)
      }
    }
    // 类型判断：如果是原始 glob 扫描对象 (Key 通常以 ./ 或 / 开头)
    else if (source) {
      Object.keys(source).forEach((path) => {
        const moduleContent = source[path]
        // 提取文件名作为 Key
        const fileName = path
          .split('/')
          .pop()
          .replace(/\.\w+$/, '')

        if (fileName.startsWith('_')) return

        // 提取 init_singleton
        if (typeof moduleContent.init_singleton === 'function') {
          final_init_fns.push(moduleContent.init_singleton)
        }

        // 提取剩余导出
        const { init_singleton, ...rest } = moduleContent
        trackAndMerge(fileName, rest, path)
      })
    }
  })

  // 内部辅助函数：处理合并与冲突记录
  function trackAndMerge(key, value, origin) {
    if (!name_sources_map[key]) {
      name_sources_map[key] = []
    }

    name_sources_map[key].push(origin)

    // 冲突检查：如果同一个 key 出现了多次来源
    if (name_sources_map[key].length > 1) {
      console.error(`[Module Conflict] 变量名 "${key}" 重复! \n来源列表:`, name_sources_map[key])
    }

    // 浅合并（后来的覆盖前面的，但记录了错误）
    final_all_singleton[key] = value
  }

  // 聚合初始化函数
  const init_singleton = async (...args) => {
    for (const fn of final_init_fns) {
      await fn(...args)
    }
  }

  // 输出最终的变量来源清单 (调试用)
  console.log('[Module Loader] 最终导出变量来源图:', name_sources_map)

  return {
    init_singleton,
    all_singleton: final_all_singleton,
    _sources: name_sources_map, // 暴露来源信息供排查
  }
}
```

## 3. 使用场景演示

可以非常灵活地混合传入：

```javascript
import * as SystemScope from '@/core/index.js' // 已聚合的对象
const bizModules = import.meta.glob('./biz/*.js', { eager: true }) // 原始 Glob

// 混合合并
const root = smart_merge_modules(SystemScope, bizModules)

/**
 * 假设：
 * SystemScope 里有一个 user 变量
 * bizModules 里也有一个 user.js
 *
 * 控制台会报错：
 * [Module Conflict] 变量名 "user" 重复!
 * 来源列表: ["Source_0", "./biz/user.js"]
 */

export const { init_singleton, all_singleton } = root
```
