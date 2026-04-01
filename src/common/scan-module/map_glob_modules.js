import { snakeCase } from 'change-case'

/**
 * 通用模块加载封装
 * @param {Record<string, any>} globResults - import.meta.glob 的结果
 * @param {Object} options
 * @param {string} options.exclude - 需要排除的特定文件名（默认 index）
 * @param {Function} options.transformKey - 键名转换函数（默认 snakeCase）
 * @param {boolean} options.includeDefault - 是否只取 default 导出（默认 true）
 */
export const map_glob_modules = (
  globResults,
  { exclude = 'index', transformKey = snakeCase, includeDefault = true } = {},
) => {
  const modules = {}

  Object.keys(globResults).forEach((path) => {
    // 1. 提取原始文件名（不含路径和后缀）
    const rawName = path
      .split('/')
      .pop()
      .replace(/\.[^/.]+$/, '')

    // 2. 过滤逻辑：排除指定文件、以下划线开头的文件
    if (rawName === exclude || rawName.startsWith('_')) {
      return
    }

    // 3. 转换键名 (例如: UserInfo -> user_info)
    const key = transformKey ? transformKey(rawName) : rawName

    // 4. 获取模块内容
    const module = globResults[path]
    modules[key] = includeDefault ? module.default || module : module
  })

  return modules
}
