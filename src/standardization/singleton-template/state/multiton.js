import { common_assemble_multiton } from 'src/output/common/project-common.js'
// 引入公共弹窗组件的 multiton
import { create_multiton_variable as create_multiton_variable_dialog_copy_use } from 'src/components/dialog/dialog-copy-use/state/multiton.js'
// 扫描模块
const modules = import.meta.glob('./multiton/*.js', { eager: true })
// 装配 multiton
export const create_multiton_variable = common_assemble_multiton(
  modules,
  create_multiton_variable_dialog_copy_use,
)
