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





//关于公共组件对接
//常规 VUE 组件原生的props 和 emit ，本身就是相当于对接文档
//装配架构下的组件，需要明确声明组件需要父级组件提供什么状态机和通道函数，这些都是组件的对接文档，必须清晰明确，方便后续维护和使用
// 示例一：
// 父级提供状态机： table_data, table_columns, table_loading
// 父级提供通道名称：table
// 父级提供通道函数： handle_query_table_data, handle_edit_table_row, handle_delete_table_row

// 示例二：
// 父级提供状态机： foot_menu_list
// 父级提供通道名称：incocme
// 父级提供通道函数： handle_foot_menu_item_click




//聚合装配
export const all_atoms_assembler = () => {
  return atoms_assembler({
    public_assembler,
    manual_assembler,
    current_file_path,
    modules,
  })
}
