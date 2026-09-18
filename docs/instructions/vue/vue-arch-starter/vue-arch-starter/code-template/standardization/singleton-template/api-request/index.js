import { common_assemble_function } from 'src/common/architecture-design/assembler/assemble_function.js'

// 1. 扫描 module 目录下所有 .js 文件
// eager: true 表示同步引入，生成的 modules 是一个包含模块内容的 Object
const modules = import.meta.glob('./module/*.js', { eager: true })

// 3. 统一导出
export default common_assemble_function(modules)
