import { singleton_event_pipeline_register } from 'src/output/common/project-common.js'

// 1. 扫描当前目录下 module 文件夹中的 JS
const modules = import.meta.glob('./module/*.js', {
  eager: true,
})

// 2. 记录当前文件路径
const currentFilePath = import.meta.url

// 3. 传入参数进行封装
export const { all_event_pipeline, create_event_pipeline } = singleton_event_pipeline_register({
  modules,
  currentFilePath,
})
