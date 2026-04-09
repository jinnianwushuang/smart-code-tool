import { atoms_assembler } from 'src/output/common/project-common.js'




//当前文件路径
const current_file_path = import.meta.url

//模块扫描
const modules = import.meta.glob(['../module/**/*.js', '../state/*.js'], {
  eager: true,
})

//聚合装配
export const src_composable_demo_use_user_time_assembler_assembler = () => {
  return atoms_assembler({
    current_file_path,
    modules,
  })
}
