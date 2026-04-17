import MarkdownTabViewer from 'src/components/markdown/markdown-tab-viewer.vue'
import { h, defineComponent } from 'vue'
import { get_markdown_tabs } from 'src/output/common/project-common.js'
/**
 * @param {Object} allModules - 传入 import.meta.glob 的执行结果
 * @param {Function} factoryFn - 你之前封装的 createMarkdownTabViewerComponent
 * @returns {Object} 键值对对象 { 'idea-doc': Component, ... }
 */

export function mapMarkdownFolderModulesToComponents(allModules) {
  const grouped = {}

  // 遍历所有 md 文件路径
  for (const path in allModules) {
    // 匹配路径中的组件目录名，例如提取 "idea-doc"
    // 路径示例: ./component/idea-doc/md/test.md
    const match = path.match(/\/md-doc\/([^/]+)\//)
    if (match) {
      const key = match[1]
      if (!grouped[key]) {
        grouped[key] = {}
      }
      // 将属于该 key 的所有 md 文件放入该组
      grouped[key][path] = allModules[path]
    }
  }

  // 为每个组生成对应的 Viewer 组件
  const componentsMap = {}
  for (const key in grouped) {
    componentsMap[key] = createMarkdownTabViewerComponent(grouped[key])
  }

  return componentsMap
}
/**
 * 传入 mdModules，
 */
const createMarkdownTabViewerComponent = (mdModules) => {
  const all_tabs = get_markdown_tabs(mdModules)

  return h(MarkdownTabViewer, {
    tabs: all_tabs,
  })
  //   return () =>
  //     h(MarkdownTabViewer, {
  //       tabs: all_tabs,
  //     })

  //   return defineComponent({
  //     setup() {

  //       return () =>
  //         h(MarkdownTabViewer, {
  //           tabs: all_tabs,
  //         })
  //     },
  //   })
}
