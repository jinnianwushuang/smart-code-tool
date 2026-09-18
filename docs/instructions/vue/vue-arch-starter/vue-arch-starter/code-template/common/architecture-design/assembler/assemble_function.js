import { global_log } from 'src/common/architecture-design/util/log/log.js'
/**
 *  聚合 所有函数
 * @param {Object} modules - 通过 import.meta.glob 获取的模块对象，键为文件路径，值为模块内容
 * @returns {Object} 包含所有函数的对象
 * @description
 * 1. 接受一个模块对象，包含多个文件路径和对应的模块内容。
 * 2. 遍历每个模块，提取其中所有命名的导出（Named Exports）。
 * 3. 将所有函数类型的导出合并到一个统一的 allFunctions 对象中。
 * 4. 最终返回一个包含所有函数的对象，供后续使用。

 */

export const common_assemble_function = (modules = {}) => {
  const allFunctions = {}

  // 2. 遍历并合并所有导出的函数
  Object.keys(modules).forEach((path) => {
    const mod = modules[path]

    // 过滤并合并所有命名的导出 (Named Exports)
    Object.keys(mod).forEach((key) => {
      if (typeof mod[key] === 'function') {
        allFunctions[key] = mod[key]
      }
    })
  })
  global_log('[函数] 聚合结果：', allFunctions)

  return allFunctions
}
