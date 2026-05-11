import { get_file_name_cases } from 'src/common/architecture-design/util/file/file.js'

/**
 * 通用管道事件调度器
 * @param {Object} modules - 由 import.meta.glob 扫描出的原始对象
 * @param {string} currentFilePath - 传入 import.meta.url
 * @returns {Object} 包含代理对象和生成器
 */
export const event_pipeline_register_v2_proxy = ({ modules, currentFilePath }) => {
  const modules_obj = {}
  const ALL_EVENT_PIPELINE = {}

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
    // 3. 定义代理对象
    Object.keys(ALL_EVENT_PIPELINE).forEach((fileName) => {
      const moduleContent = modules_obj[fileName]
      ALL_EVENT_PIPELINE[fileName] = new Proxy(moduleContent, {
        get(subTarget, methodName) {
          // 第二层拦截：函数名 (method_name)
          const originMethod = moduleContent[methodName]

          if (typeof originMethod === 'function') {
            // 核心实现：补全第一个参数为 payload
            return (...args) => originMethod(payload, ...args)
          }
          return originMethod
        },
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

      ALL_EVENT_PIPELINE['income'] = income_pipeline_obj
    }
  }

  return {
    ALL_EVENT_PIPELINE,
    create_event_pipeline,
  }
}
