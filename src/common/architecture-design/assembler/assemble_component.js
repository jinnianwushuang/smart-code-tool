import { get_file_name_cases } from 'src/common/architecture-design/util/file/file.js'
import { global_log } from 'src/common/architecture-design/util/log/log.js'

/**
 * 组件扫描]：自动注入组件
 * @param {*} modules - 通过 import.meta.glob 获取的模块对象，键为文件路径，值为模块内容
 * @returns {Object} 包含所有注入组件的对象
 * @description
 * 1. 接受一个模块对象，包含多个文件路径和对应的模块内容。
 * 2. 遍历每个模块，校验路径是否符合组件命名规范（必须在 component 目录下，且文件名以 table-td|table_td|dialog-|dialog_ 开头）。
 * 3. 对于符合规范的组件，提取其默认导出并根据文件名转换为 PascalCase 的组件名进行注入。
 * 4. 最终返回一个包含所有注入组件的对象，供后续使用。
 */
export const common_assemble_component = (modules) => {
  global_log('Vite 扫描到的原始路径列表:', Object.keys(modules))
  const components = {}
  // 1. 校验规则:必须是 component 下的子目录，且文件名匹配前缀
  const validPattern = /component\/[^/]+\/(table-td|table_td|dialog-|dialog_).+\.vue$/i

  Object.keys(modules).forEach((path) => {
    if (path.endsWith('_.vue')) {
      global_log('[组件扫描警告]：组件路径以_.vue结尾，]不进行自动注入:]' + path)
      // 相当于 continue，跳过不符合命名规范的文件
      return
    }
    // 2. 根目录合规校验（Vite 返回的 path 通常以 /src 或 /project 开头)
    if (!path.startsWith('/src') && !path.startsWith('/project')) {
      global_log(`[组件扫描警告]：路径 "${path}" 不在 /src 或 /project 下，已跳过。`)
      return
    }

    // 3. 业务命名规则校验
    if (!validPattern.test(path)) {
      global_log(
        '[组件扫描警告]：组件路径不符合规则！只能是 table-td|table_td|dialog-|dialog_  否则不进行自动注入：' +
          path,
      )
      return
    }
    let componentName = get_file_name_cases(path).pascal
    global_log('[组件扫描]：自动注入组件：' + componentName)
    if (modules[path].default) {
      components[componentName] = modules[path].default
    }
  })

  global_log('[组件扫描]：自动注入组件列表：', Object.keys(components).join(', '))
  return components
}
