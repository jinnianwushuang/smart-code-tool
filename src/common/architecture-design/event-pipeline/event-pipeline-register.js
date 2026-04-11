import { get_file_name_cases } from '../util/file/file.js'
import { merge_to_payload_with_conflict_logs } from '../util/merge/merge.js'

const pipeline_count = {}

/**
 * 架构检查：检查当前文件是否已经注册过事件通道
 * @param {string} currentFilePath - 当前文件路径
 */
const architecture_check_pipeline_count = (currentFilePath, multiton) => {
  pipeline_count[currentFilePath] = (pipeline_count[currentFilePath] ?? 0) + 1
  const is_prod = import.meta.env?.PROD
  if (!multiton) {
    if (pipeline_count[currentFilePath] > 1) {
      let message_str = `[架构检查失败] 当前文件 ${currentFilePath}  注册事件通道次数超过 1 次： 当前一共注册了${pipeline_count[currentFilePath]}次，请检查是否正确使用单例模式。或者切换到多例方法调用！！`

      if (is_prod) {
        console.warn(message_str)
      } else {
        console.error(message_str)

        console.error(
          `[架构检查失败] 注册事件通道超过一次：单例模式下，事件通道必须保持唯一性，多次注册事件通道将引发不可预知的错误！ `,
        )
        throw new Error(message_str)
      }
    }
  }
}
/**
 * 通用管道事件调度器
 * @param {Object} modules - 由 import.meta.glob 扫描出的原始对象
 * @param {string} currentFilePath - 传入 import.meta.url
 * @returns {Object} 包含代理对象和生成器
 * @description
 * 1. 预处理：解析路径并转换 snake_case，排除下划线文件。
 * 2. 定义新的生成器函数 (传入 payload 参数)，支持动态注入上下文。
 * 3. 包装模块内容为方法对象，自动补全第一个参数为 payload。
 * 4. 处理 income_pipeline 注入，将指定函数添加到 all_event_pipeline 的 income 属性中。
 */
const register_inner = ({ modules, currentFilePath, multiton }) => {
  const modules_obj = {}
  let all_event_pipeline = {}
  // 1. 预处理：解析路径并转换 snake_case，排除下划线文件
  Object.keys(modules).forEach((path) => {
    const { original, snake } = get_file_name_cases(path)

    // 过滤约定：以 "___" 结尾的文件名不参与聚合
    if (original.endsWith('___')) return

    // 提取模块内容（兼容 default 导出和具名导出）
    modules_obj[snake] = modules[path].default || modules[path]
  })

  /**
   * 2. 定义新的生成器函数 (传入 payload 参数)
   */
  const create_event_pipeline = (payload = {}) => {
    if (multiton) {
      all_event_pipeline = {}
    }

    //架构检查
    architecture_check_pipeline_count(currentFilePath, multiton)

    // 3.  包装模块内容为 方法对象
    Object.entries(modules_obj).forEach(([fileName, moduleContent]) => {
      let all_methods = {}
      Object.entries(moduleContent).forEach(([methodName, originMethod]) => {
        if (typeof originMethod === 'function') {
          // 核心实现：补全第一个参数为 payload
          all_methods[methodName] = (...args) => originMethod(payload, ...args)
        }
        all_event_pipeline[fileName] = all_methods
      })
    })
    // 4. 处理 income_pipeline 注入
    const { income_pipeline } = payload || {}
    if (income_pipeline) {
      let income_pipeline_obj = {}
      income_pipeline.map((incomeMethodName) => {
        let originMethod = payload[incomeMethodName]

        if (typeof originMethod === 'function') {
          // 核心实现：补全第一个参数为 payload
          income_pipeline_obj[incomeMethodName] = (...args) => originMethod(payload, ...args)
        }
      })

      all_event_pipeline['income'] = income_pipeline_obj
    }

    merge_to_payload_with_conflict_logs({
      payload,
      dataToMerge: { all_event_pipeline },
      file_path: currentFilePath,
    })

    return {
      off: () => {
        pipeline_count[currentFilePath] -= 1
        if (pipeline_count[currentFilePath] <= 0) {
          delete pipeline_count[currentFilePath]
        }
        console.error('[事件通道注销] 原始注册文件路径：', currentFilePath)
        all_event_pipeline = {}
      },
    }
  }
  if (multiton) {
    return { create_event_pipeline }
  } else {
    return { create_event_pipeline, all_event_pipeline }
  }
}

export const singleton_event_pipeline_register = (payload = {}) =>
  register_inner({ ...payload, multiton: false })

export const multiton_event_pipeline_register = (payload = {}) =>
  register_inner({ ...payload, multiton: true })
