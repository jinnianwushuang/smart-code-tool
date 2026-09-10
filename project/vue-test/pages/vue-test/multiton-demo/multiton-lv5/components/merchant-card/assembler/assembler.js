import { atoms_assembler } from 'src/output/common/project-common.js'

//公共的外部模块
const public_assembler = ['useGlobalState']
//手动引入的外部模块，不在 composable_common 中 的模块
const manual_assembler = []
//当前文件路径
const current_file_path = import.meta.url

//模块扫描
const modules = import.meta.glob(['../module/**/*.js', '../state/*.js'], {
  eager: true,
})

//聚合装配
export const all_atoms_assembler = () => {
  return atoms_assembler({
    public_assembler,
    manual_assembler,
    current_file_path,
    modules,
  })
}
