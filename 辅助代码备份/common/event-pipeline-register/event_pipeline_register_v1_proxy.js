import { get_file_name_cases } from 'src/common/architecture-design/util/file/file.js'

/**
 * 通用管道事件调度器   支持 默认执行和 注入上下文执行
 * @param {Object} modules - 由 import.meta.glob 扫描出的原始对象
 * @param {string} currentFilePath - 传入 import.meta.url
 * @returns {Object} 包含代理对象和生成器
 */
export const event_pipeline_register_v1_proxy = ({ modules, currentFilePath }) => {
  const ALL_EVENT_PIPELINE = {}

  // 1. 预处理：解析路径并转换 snake_case，排除下划线文件
  Object.keys(modules).forEach((path) => {
    const { original, snake } = get_file_name_cases(path)

    // 过滤约定：以 "___" 结尾的文件名不参与聚合
    if (original.endsWith('___')) return

    // 提取模块内容（兼容 default 导出和具名导出）
    ALL_EVENT_PIPELINE[snake] = modules[path].default || modules[path]
  })

  // 4. 处理 income_pipeline 注入
  const create_income_pipeline = (payload = {}) => {
    const { income_pipeline } = payload || {}
    if (income_pipeline) {
      let income_pipeline_obj = {}
      income_pipeline.map((incomeMethodName) => {
        let originMethod = payload[incomeMethodName]

        if (typeof originMethod === 'function') {
          income_pipeline_obj[incomeMethodName] = originMethod
        }
      })

      ALL_EVENT_PIPELINE['income'] = income_pipeline_obj
    }
  }

  /**
   * 2. 定义新的生成器函数 (传入 payload 参数)
   */
  const create_event_pipeline = (payload = {}) => {
    // 4. 处理 income_pipeline 注入
    create_income_pipeline(payload)
    // 3. 定义代理对象
    return new Proxy(ALL_EVENT_PIPELINE, {
      get(target, fileName) {
        // 第一层拦截：文件名 (file_name)

        if (!(fileName in target)) {
          console.error(`[Pipeline Error] 模块 "${fileName}" 不存在。来源: ${currentFilePath}`)
          return {}
        }

        const moduleContent = target[fileName]

        return new Proxy(moduleContent, {
          get(subTarget, methodName) {
            // 第二层拦截：函数名 (method_name)
            const originMethod = subTarget[methodName]

            if (typeof originMethod === 'function') {
              // 核心实现：补全第一个参数为 payload
              return (...args) => originMethod(payload, ...args)
            }
            return originMethod
          },
        })
      },
    })
  }

  return {
    ALL_EVENT_PIPELINE,
    create_event_pipeline,
  }
}

// // src/api/events/index.js
// import { assemble_event_pipeline } from "src/output/common/project-common.js";

// // 1. 扫描当前目录下 module 文件夹中的 JS
// const modules = import.meta.glob('./module/*.js', { eager: true })

// // 2. 记录当前文件路径
// const currentFilePath = import.meta.url

// // 3. 传入参数进行封装
// export const { ALL_EVENT_PIPELINE, create_event_pipeline } = assemble_event_pipeline(
//   modules,
//   currentFilePath,
// )

// import { ALL_EVENT_PIPELINE, create_event_pipeline } from "@/api/events";

// // 方式 A: 直接执行默认对象
// // 实际执行: update_profile({}, '001', '张三')
// ALL_EVENT_PIPELINE.user_center.update_profile("001", "张三");

// // 方式 B: 注入 Payload 执行
// // 实际执行: update_profile({ token: 'xyz' }, '002', '李四')
// const customEvent = create_event_pipeline({ token: "xyz" });
// customEvent.user_center.update_profile("002", "李四");
