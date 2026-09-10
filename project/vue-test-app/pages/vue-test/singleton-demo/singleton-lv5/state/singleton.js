import { common_assemble_singleton } from 'src/output/common/project-common.js'

// 扫描模块
const modules = import.meta.glob('./singleton/*.js', { eager: true })
// 装配 singleton
export const { all_singleton, init_all_singleton } = common_assemble_singleton(modules)
