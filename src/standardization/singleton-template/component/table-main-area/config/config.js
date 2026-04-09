import { common_assemble_component } from 'src/output/common/project-common.js'
import { h, markRaw } from 'vue'

// 扫描当前目录下的 module 目录内的 文件
const modules = import.meta.glob('../component/*/*.vue', { eager: true })

const components = common_assemble_component(modules)

console.error('components', Object.keys(components))

const { TableTdCopyUse } = components

export const columns = [
  {
    name: 'index',
    dataIndex: 'index',
    key: 'index',
    customRender: ({ text, record, index }) => index + 1,
  },
  {
    name: 'Name',
    dataIndex: 'name',
    key: 'name',
    customRender: (obj) => h(TableTdCopyUse, obj),
  },
  {
    name: 'Age',
    dataIndex: 'age',
    key: 'age',
    customRender: ({ text, record, index }) => text + '岁',
  },
  {
    name: 'Address',
    dataIndex: 'address',
    key: 'address',
    customRender: ({ text, record, index }) => h(TableTdCopyUse, { text, record, index }),
  },
]
