import { get_file_name_cases } from 'src/common/architecture-design/util/file/file.js'
import { global_log } from 'src/common/architecture-design/util/log/log.js'
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
