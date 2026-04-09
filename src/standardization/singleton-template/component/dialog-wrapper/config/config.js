import { common_assemble_component } from 'src/output/common/project-common.js'
import { markRaw } from 'vue'
import PbulicDialogCopyUse from 'src/components/dialog/dialog-copy-use/dialog-copy-use.vue'
// 扫描当前目录下的 module 目录内的 文件
const modules = import.meta.glob('../component/*/*.vue', { eager: true })

const components = common_assemble_component(modules)

const { DialogCopyUse } = components

export const dialog_wrapper_config = [
  { name: '警告弹窗', model_key: 'dialog_copy_use', component: markRaw(DialogCopyUse) },
  {
    name: '确认弹窗',
    model_key: 'public_dialog_copy_use',
    component: markRaw(PbulicDialogCopyUse),
  },
]
