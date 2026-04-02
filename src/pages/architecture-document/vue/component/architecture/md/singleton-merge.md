---
title: 单实例状态机-聚合装配-子孙组件消费状态机
order: 21
---

## 单实例状态机扫描和多组聚合合并架构

这是一个非常精妙的架构设计，将**初始化逻辑**与**业务逻辑**在导出阶段进行了横向切割。

## 1. 子模块代码示例 (`module/user.js`)

子模块不需要关心如何被聚合，正常导出即可：

```javascript
import { ref } from 'vue'
export const user_info = ref({ name: 'Guest' })

// 这个函数会被提取到总的 init_singleton 中
export const init_singleton = () => {
  user_info.value = { name: 'Guest' }
}
```

## 2. 智能核心聚合器实现

需要一个更智能的**递归解析器**。它必须能识别两种输入：

1. **原始 Glob 模块**（包含 `init_singleton` 的 JS 文件集合）。
2. **已聚合的 Scope**（包含 `all_singleton` 和 `init_singleton` 的对象）。

通过这种方式，可以把“文件夹扫描结果”和“已经封装好的业务域”混合传入。

```javascript
/**
 * 模块高级聚合器
 * @param {...Object} sources - 原始 glob 结果或已聚合的对象
 */
export const common_assemble_singleton = (...sources) => {
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
const root = common_assemble_singleton(SystemScope, bizModules)

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

## 4. 应用入口调用示例

在你的项目启动入口（如 `main.js`）中：

```javascript
import { init_singleton, all_singleton } from './store/index.js'

// 1. 执行全局初始化
await init_singleton({ api_key: '123' })

// 2. 访问具体单例的内容
console.log(all_singleton.user.user_info.name) // 输出：Guest
```

## 💡 封装亮点

1. **逻辑解耦**：初始化逻辑（如请求基础配置、建立 WebSocket 连接）集中在 `init_singleton` 运行，而业务属性通过 `all_singleton` 访问。
2. **全自动扫描**：只要在 `module` 目录下新增文件，它会自动被加入初始化序列和导出列表。
3. **支持 Async**：统一的 `init_singleton` 使用了 `async/await`，支持各模块之间存在异步初始化逻辑。

4. **自动识别**：通过判断 `all_singleton` 属性是否存在，自动切换处理逻辑。
5. **溯源日志**：`name_sources_map` 会记录每个变量名到底被哪些文件或哪些作用域“染指”过，报错信息非常直观。
6. **防抖式报错**：即使发生冲突，程序也不会崩溃，而是采用“后入为主”策略并打印 **Error 级别日志**，方便在 Dev 阶段快速定位。
