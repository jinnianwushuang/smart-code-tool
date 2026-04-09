import { common_assemble_singleton } from 'src/output/common/project-common.js'

// 引入公共弹窗组件的 singleton
import * as dialog_copy_use_singleton from 'src/components/dialog/dialog-copy-use/state/singleton.js'
// 扫描模块
const modules = import.meta.glob('./singleton/*.js', { eager: true })
// 装配 singleton
export const { all_singleton, init_singleton } = common_assemble_singleton(
  modules,
  dialog_copy_use_singleton,
)
