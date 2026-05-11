import { get_file_name_cases } from 'src/common/architecture-design/util/file/file.js'
import { global_log } from 'src/common/architecture-design/util/log/log.js'

/**
 * 多例模块高级聚合器
 * @param {...Object} sources - 原始 glob 结果或已聚合的对象
 * @returns {Object}  create_multiton_variable 生成器
 * @description
 * 1. 接受多个数据源（原始 glob 对象或已聚合对象），统一处理并合并到一个最终的  生成器 中。
 */
export const common_assemble_multiton = (...sources) => {
  // 统一维护聚合状态
const all_creater_fn=[]

  sources.forEach((source,  ) => {
    if (!source) return // 跳过空值
    // const sourceIdentifier = `Source_${index}`

    if (typeof source === "function") {
      all_creater_fn.push(source)

    } else {
      handleRawSource(source, all_creater_fn)
    }
  })



  return (payload) => {
    let all_variable={}
    all_creater_fn.forEach((creater_fn) => {

     Object.assign(all_variable, creater_fn(payload))
    })
    return all_variable
  }
}


/**
 * 子函数：处理原始的 Vite glob 扫描对象
 */
const handleRawSource = (source, all_creater_fn) => {
  Object.keys(source).forEach((path) => {
    const moduleContent = source[path]
    const file_cases = get_file_name_cases(path)

    // 过滤约定：以 "___" 结尾的文件名不参与聚合
    if (file_cases.original.endsWith('___')) return
    let creater_fn = moduleContent.default || moduleContent['create_multiton_variable']

    if (creater_fn) {
       all_creater_fn.push(creater_fn)
     }
  })
}
