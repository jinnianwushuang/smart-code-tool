import { global_log } from 'src/common/architecture-design/util/log/log.js'
import { get_file_name_cases } from 'src/common/architecture-design/util/file/file.js'

/**
 * assembler 聚合入口函数
 * @param {Object} all_params 聚合参数
 * @returns {Object} 包含状态机、方法和生命周期函数队列的对象
 * @description
 * 1. 根据传入的参数类型（modules 或 income_assembler）选择不同的聚合策略。
 * 2. 当传入 modules 时，自动扫描并分类函数到状态机、方法和生命周期队列。
 * 3. 当传入 income_assembler 时，从公共库中提取指定函数，并根据命名约定分类。
 * 4. 支持特殊约定：如果函数名包含 "assembler"，则执行该函数并解构其内部的三个函数数组进行合并。
 */
export const common_assemble_assembler = (all_params) => {
  const { modules } = all_params

  if (modules) {
    // 如果传入了 modules (通常是 import.meta.glob 的结果)，则进行目录扫描聚合
    return assemble_assembler_when_modules(all_params)
  } else {
    // 否则，处理传入的外部聚合器列表
    return assemble_assembler_when_income_assembler(all_params)
  }
}

/**
 * 场景一：基于 Vite 模块对象进行自动化扫描聚合
 */
const assemble_assembler_when_modules = (all_params) => {
  const { modules } = all_params

  const state_fn_arr = [] // 存储状态机初始化相关的生成器函数
  const method_fn_arr = [] // 存储业务方法相关的生成器函数
  const lifecycle_fn_arr = [] // 存储生命周期相关的生成器函数

  // 遍历所有模块路径进行分类
  Object.keys(modules).forEach((path) => {
    let file_name_cases = get_file_name_cases(path)
    const { original, snake } = file_name_cases

    // 过滤约定：以 "___" 结尾的文件名不参与自动聚合
    if (original.endsWith('___')) return
    const fileName = snake
    let fn = modules[path].default

    // 兼容性处理：若无默认导出，则尝试取第一个具名导出
    if (!fn) {
      fn = modules[path][Object.keys(modules[path])[0]]
    }
    if (typeof fn != 'function') {
      return
    }

    // 根据文件名命名约定进行职责分类
    if (fileName.includes('state')) {
      state_fn_arr.push(fn)
    } else if (fileName.includes('method')) {
      // method.js 存放主要的方法挂载逻辑
      method_fn_arr.push(fn)
    } else if (fileName.includes('lifecycle')) {
      lifecycle_fn_arr.push(fn)
    }
  })

  return {
    state_fn_arr,
    method_fn_arr,
    lifecycle_fn_arr,
  }
}

/**
 * 场景二：基于传入的名称列表从公共库中提取并合并聚合结果
 */
const assemble_assembler_when_income_assembler = (all_params) => {
  const { composable_common, income_assembler = [], local_assembler } = all_params

  const state_fn_arr = []
  const method_fn_arr = []
  const lifecycle_fn_arr = []

  let check = Array.isArray(income_assembler) && income_assembler.length > 0
  // 如果没有外部传入的需求，则直接返回本地扫描的结果（若有）
  if (!check) {
    return local_assembler
  }

  // 遍历需求列表，从公共 Composable 库中提取对应函数
  income_assembler.forEach((income_fn_name) => {
    const fn = composable_common[income_fn_name]
    if (typeof fn != 'function') {
      return
    }
    if (income_fn_name.includes('state')) {
      state_fn_arr.push(fn)
    } else if (income_fn_name.includes('method')) {
      method_fn_arr.push(fn)
    } else if (income_fn_name.includes('lifecycle')) {
      lifecycle_fn_arr.push(fn)
    } else if (income_fn_name.includes('assembler')) {
      // 特殊逻辑：如果本身是聚合器函数，则执行它并解构其内部的三个函数数组
      const fn_result = fn()
      if (fn_result) {
        state_fn_arr.push(...fn_result.state_fn_arr)
        method_fn_arr.push(...fn_result.method_fn_arr)
        lifecycle_fn_arr.push(...fn_result.lifecycle_fn_arr)
      }
    }
  })

  global_log('[Composable] 聚合结果：', {
    state_fn_arr,
    method_fn_arr,
    lifecycle_fn_arr,
  })
  return {
    state_fn_arr,
    method_fn_arr,
    lifecycle_fn_arr,
  }
}
