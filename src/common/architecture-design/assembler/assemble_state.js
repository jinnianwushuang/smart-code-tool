import { merge_to_payload_with_conflict_logs } from 'src/common/architecture-design/util/merge/merge.js'
import { global_log } from 'src/common/architecture-design/util/log/log.js'
/**
 * 模块扫描后 解析组装状态机
 * @param {Object} payload - 传入的初始数据对象，供状态模块使用
 * @param {Object} modules - 通过 import.meta.glob 获取的模块对象，键为文件路径，值为模块内容
 * @returns {void}
 * @description
 * 1. 通过 import.meta.glob 获取所有状态相关模块。
 * 2. 根据文件路径识别模块类型（singleton、config、multiton、computed）。
 * 3. 调用相应的函数提取数据，并合并到 payload 中。
 * 4. 使用 merge_to_payload_with_conflict_logs 记录任何键冲突，确保开发者能清晰了解数据来源和冲突情况。
 * 5. 最终输出一个完整的状态对象，供后续使用。

 */

const assemb_quene = [
  {
    file_path: '/state/config.js',
    handle: (payload, module) => module || {},
  },
  {
    file_path: '/state/singleton.js',
    handle: (payload, module) => module.all_singleton || {},
  },

  {
    file_path: '/state/multiton.js',
    handle: (payload, module) => module?.create_multiton_variable?.(payload) || {},
  },
  {
    file_path: '/state/computed.js',
    handle: (payload, module) => module?.create_computed_variable?.(payload) || {},
  },
]

export const common_assemble_state = ({ payload, modules }) => {
  assemb_quene.forEach(({ file_path, handle }) => {
    Object.keys(modules).forEach((path) => {
      if (path.includes(file_path)) {
        const module = modules[path]
        const dataToMerge = handle(payload, module)
        merge_to_payload_with_conflict_logs({ payload, dataToMerge, file_path })
      }
    })
  })
}
