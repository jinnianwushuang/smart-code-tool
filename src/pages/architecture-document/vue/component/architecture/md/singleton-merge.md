---
title: 单实例状态机-聚合装配-子孙组件消费状态机
order: 21
---

## 单实例状态机扫描和多组聚合合并架构

将**初始化逻辑**与**属性状态机**在导出阶段进行了横向切割。

## 1. 子模块代码示例 (`singleton/user.js`)

子模块不需要关心如何被聚合，正常导出即可：

```javascript
import { ref } from 'vue'
export const user_info = ref({ name: 'Guest' })

// 这个函数会被提取到总的 init_all_singleton 中
export const init_singleton = () => {
  user_info.value = { name: 'Guest' }
}
```

## 2. 核心聚合器实现

智能的**递归解析器**。它必须能识别两种输入：

1. **原始 Glob 模块**（包含 `init_singleton` 的 JS 文件集合）。
2. **已聚合的 模块**（包含 `all_singleton` 和 `init_all_singleton` 的对象）。

通过这种方式，可以把“文件夹扫描结果”和“已经封装好的业务域”混合传入。

```javascript
import { get_file_name_cases } from 'src/common/util/file/file.js'
import { global_log } from 'src/common/util/log/log.js'
/**
 * 单例模块高级聚合器
 * @param {...Object} sources - 原始 glob 结果或已聚合的对象
 * @returns {Object} 包含 init_all_singleton 和 all_singleton 的聚合结果
 * @description
 * 1. 接受多个数据源（原始 glob 对象或已聚合对象），统一处理并合并到一个最终的 all_singleton 中。
 * 2. 维护一个 init_all_singleton 函数列表，确保所有模块的初始化函数都能被调用。
 * 3. 记录每个状态机的来源，输出冲突日志，帮助开发者快速定位问题。
 * 4. 最终输出一个包含 all_singleton 和 init_all_singleton 的对象，供后续使用。
 */
export const common_assemble_singleton = (...sources) => {
  // 统一维护聚合状态
  const state = {
    final_all_singleton: {},
    final_init_fns: [],
    name_sources_map: {},
  }

  sources.forEach((source, index) => {
    if (!source) return // 跳过空值
    const sourceIdentifier = `Source_${index}`

    if (source.all_singleton) {
      handleAggregatedSource(source, sourceIdentifier, state)
    } else {
      handleRawSource(source, state)
    }
  })

  // 聚合初始化函数
  const init_all_singleton = async (...args) => {
    for (const fn of state.final_init_fns) {
      await fn(...args)
    }
  }

  // 输出最终的状态机来源清单 (调试用)
  global_log('[Module Loader] 最终导出状态机来源图:', state.name_sources_map)

  return {
    init_all_singleton,
    all_singleton: state.final_all_singleton,
    _sources: state.name_sources_map, // 暴露来源信息供排查
  }
}

/**
 * 内部辅助函数：处理状态机合并与冲突记录
 */
const trackAndMerge = (key, value, origin, state) => {
  const { name_sources_map, final_all_singleton } = state

  if (!name_sources_map[key]) {
    name_sources_map[key] = []
  }

  name_sources_map[key].push(origin)

  // 冲突检查：如果同一个 key 出现了多次来源
  if (name_sources_map[key].length > 1) {
    global_log(`[Module Conflict] 状态机名 "${key}" 重复! \n来源列表:`, name_sources_map[key])
  }

  // 浅合并（后来的覆盖前面的，但记录了错误）
  final_all_singleton[key] = value
}

/**
 * 子函数：处理已经是聚合状态的对象
 */
const handleAggregatedSource = (source, sourceIdentifier, state) => {
  const { all_singleton, init_all_singleton } = source

  // 处理 all_singleton 内的每一个状态机
  Object.keys(all_singleton).forEach((key) => {
    trackAndMerge(key, all_singleton[key], sourceIdentifier, state)
  })

  // 收集初始化函数
  if (typeof init_all_singleton === 'function') {
    state.final_init_fns.push(init_all_singleton)
  }
}

/**
 * 子函数：处理原始的 Vite glob 扫描对象
 */
const handleRawSource = (source, state) => {
  Object.keys(source).forEach((path) => {
    const moduleContent = source[path]
    const file_cases = get_file_name_cases(path)

    // 过滤约定：以 "___" 结尾的文件名不参与聚合
    if (file_cases.original.endsWith('___')) return

    // 提取 init_singleton
    if (typeof moduleContent.init_singleton === 'function') {
      state.final_init_fns.push(moduleContent.init_singleton)
    }

    // 提取剩余导出并合并
    const { init_singleton, ...rest } = moduleContent
    Object.entries(rest).forEach(([exportKey, exportValue]) => {
      trackAndMerge(exportKey, exportValue, path, state)
    })
  })
}
```

## 3. 使用场景演示

可以非常灵活地混合传入：

```javascript
import { common_assemble_singleton } from 'src/output/common/project-common.js'

// 引入公共弹窗组件的 singleton
import * as dialog_copy_use_singleton from 'src/components/dialog/dialog-copy-use/state/singleton.js'
// 扫描模块
const modules = import.meta.glob('./singleton/*.js', { eager: true })
// 装配 singleton
export const { all_singleton, init_singleton } = common_assemble_singleton(
  modules,
  dialog_copy_use_singleton,
)
```

## 4. 调用示例

```javascript
import { all_singleton } from 'src/standardization/backend-page-template/state/singleton.js'

const { user_info } = all_singleton
```

## 💡 封装亮点

1. **逻辑解耦**：初始化逻辑集中在 `init_singleton` 运行，而业务属性通过 `all_singleton` 访问。
2. **全自动扫描**：只要在 `singleton` 目录下新增文件，它会自动被加入初始化序列和导出列表。
3. **自动识别**：通过判断 `all_singleton` 属性是否存在，自动切换处理逻辑。
4. **溯源日志**：`name_sources_map` 会记录每个变量名到底被哪些文件或哪些作用域“染指”过，报错信息非常直观。
5. **防抖式报错**：即使发生冲突，程序也不会崩溃，而是采用“后入为主”策略并打印 **Error 级别日志**，方便在 Dev 阶段快速定位。
