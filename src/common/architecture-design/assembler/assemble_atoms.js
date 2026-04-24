import * as composable_common from 'src/output/common/composable-common.js'
import { global_log } from 'src/common/architecture-design/util/log/log.js'
import { get_file_name_cases } from 'src/common/architecture-design/util/file/file.js'
import { common_assemble_state } from './assemble_state.js'
import { merge_to_payload_with_conflict_logs } from 'src/common/architecture-design/util/merge/merge.js'
import { useModuleLifecycleAssembler } from 'src/composable/architecture-design/assembler/useModuleLifecycleAssembler.js'

/**
 * assembler 聚合入口函数
 * @param {Object} all_params 聚合参数
 * @returns {Object} 包含状态机、方法和生命周期函数队列的对象
 * @description
 * 1. 根据传入的参数类型（modules 或 public_assembler）选择不同的聚合策略。
 * 2. 当传入 modules 时，自动扫描并分类函数到状态机、方法和生命周期队列。
 * 3. 当传入 public_assembler 时，从公共库中提取指定函数，并根据命名约定分类。
 * 4. 支持特殊约定：如果函数名包含 "assembler"，则执行该函数并解构其内部的三个函数数组进行合并。
 */
export const atoms_assembler = (all_params) => {
  const { modules, current_file_path } = all_params
  const guilei_modules = group_modules({ modules })
  //处理状态机

  const result_point = {
    state_fn_arr: [], // 存储状态机初始化相关的生成器函数
    method_fn_arr: [], // 存储业务方法相关的生成器函数
    lifecycle_fn_arr: [], // 存储生命周期相关的生成器函数
    watcher_fn_arr: [], //存储VUE监听器相关的副作用生成器函数
  }

  //公共的外部模块 聚合
  atoms_assembler_when_public_assembler(all_params, result_point)
  //手动引入的外部模块 聚合
  atoms_assembler_when_manual_assembler(all_params, result_point)

  // modules 处理状态机
  result_point.state_fn_arr.push(assemble_state(guilei_modules, current_file_path))

  //modules 处理业务方法
  result_point.method_fn_arr.push(assemble_method(guilei_modules, current_file_path))
  //modules 处理生命周期
  result_point.lifecycle_fn_arr.push(assemble_lifecycle(guilei_modules))
  //modules 处理VUE监听器
  result_point.watcher_fn_arr.push(...assemble_watcher(guilei_modules))

  global_log('[assembler] 聚合结果：', result_point)
  return result_point
}
/**
 *  modules 处理状态机
 * @param {*} guilei_modules
 * @returns
 */
const assemble_state = (guilei_modules, current_file_path) => {
  return (payload) => {
    common_assemble_state({
      payload,
      modules: guilei_modules.state,
      current_file_path,
    })
  }
}
/**
 *  modules 处理业务方法
 * @param {*} guilei_modules
 * @returns
 */
const assemble_method = (guilei_modules, current_file_path) => {
  return (payload) => {
    const exposed_method = Object.values(guilei_modules.method)[0]
    if (!exposed_method) {
      return
    }
    const { create_messaging_emit, ...other_exposed_method } = exposed_method

    // 对父级的emit函数
    if (create_messaging_emit) {
      // 4. 检查冲突并合并
      merge_to_payload_with_conflict_logs({
        payload,
        dataToMerge: create_messaging_emit(payload),
        file_path: current_file_path,
      })
    }
    //  对外暴露的其他方法
    if (Object.keys(other_exposed_method).length > 0) {
      merge_to_payload_with_conflict_logs({
        payload,
        dataToMerge: other_exposed_method,
        file_path: current_file_path,
      })
    }
  }
}
/**
 *  modules 处理生命周期
 * @param {*} guilei_modules
 * @returns
 */
const assemble_lifecycle = (guilei_modules) => {
  return (payload) => {
    useModuleLifecycleAssembler({
      payload,
      modules: guilei_modules.lifecycle,
    })
  }
}

/**
 *  modules 处理VUE监听器
 * @param {*} guilei_modules
 * @returns
 */
const assemble_watcher = (guilei_modules) => {
  let { watcher } = guilei_modules
  let fn_arr = []
  let mods = Object.entries(watcher)

  mods.forEach((mod) => {
    fn_arr.push(...Object.values(mod))
  })

  return fn_arr
}

/**
 *  modules 聚合分组
 * @param {*} param0
 * @returns
 */
const group_modules = ({ modules }) => {
  const res = { state: {}, singleton: {}, lifecycle: {}, watcher: {}, method: {} }

  for (const [path, mod] of Object.entries(modules)) {
    let file_name_cases = get_file_name_cases(path)
    const { original } = file_name_cases
    // 过滤约定：以 "___" 结尾的文件名不参与自动聚合
    if (original.endsWith('___')) {
      continue
    }

    if (path.includes('/state/')) {
      res.state[path] = mod
    }
    if (path.includes('/state/singleton.js')) {
      res.singleton[path] = mod
      res.lifecycle[path] = mod
    }
    if (
      path.includes('/module/event-pipeline/') ||
      path.includes('/module/lifecycle/') ||
      path.includes('/module/effect/')
    ) {
      if (path.includes('/module/effect/watcher.js')) {
        res.watcher[path] = mod
      } else {
        res.lifecycle[path] = mod
      }
    }
    if (path.includes('/module/exposed-method/')) {
      res.method[path] = mod
    }
  }

  return res
}

/**
 *  公共的外部模块 聚合
 */
const atoms_assembler_when_public_assembler = (all_params, result_point) => {
  const { public_assembler = [] } = all_params

  let check = Array.isArray(public_assembler) && public_assembler.length > 0
  // 如果没有外部传入的 ，则直接返回
  if (!check) {
    return
  }

  const { state_fn_arr, method_fn_arr, lifecycle_fn_arr, watcher_fn_arr } = result_point
  // 遍历列表，从公共 Composable 库中提取对应函数
  public_assembler.forEach((income_fn_name) => {
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
        watcher_fn_arr.push(...fn_result.watcher_fn_arr)
      }
    }
  })
}

/**
 *   手动引入的外部模块 聚合结果
 */
const atoms_assembler_when_manual_assembler = (all_params, result_point) => {
  const { manual_assembler = [] } = all_params

  let check = Array.isArray(manual_assembler) && manual_assembler.length > 0
  // 如果没有外部传入的 ，则直接返回
  if (!check) {
    return
  }

  // 遍历列表，
  manual_assembler.forEach((manual_obj) => {
    if (!manual_obj) {
      return
    }

    result_point.state_fn_arr.push(...(manual_obj.state_fn_arr || []))
    result_point.method_fn_arr.push(...(manual_obj.method_fn_arr || []))
    result_point.lifecycle_fn_arr.push(...(manual_obj.lifecycle_fn_arr || []))
    result_point.watcher_fn_arr.push(...(manual_obj.watcher_fn_arr || []))
  })
}
