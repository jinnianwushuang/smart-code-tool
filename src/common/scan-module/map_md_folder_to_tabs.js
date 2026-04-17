import MarkdownTabViewer from 'src/components/markdown/markdown-tab-viewer.vue'
import { h, defineComponent } from 'vue'
import { get_markdown_tabs } from 'src/output/common/project-common.js'
import { pascalCase } from 'change-case'

/**
 * @param {Object} allMdModules - 传入 import.meta.glob 的执行结果
 * @param {Function} factoryFn - 你之前封装的 createMarkdownTabViewerComponent
 * @returns {Object} 键值对对象 { 'idea-doc': Component, ... }
 */
export function mapMarkdownFolderModulesToTabs({ allMdModules, folderLabelMap }) {
  const grouped = {}

  // 遍历所有 md 文件路径
  for (const path in allMdModules) {
    // 匹配路径中的组件目录名，例如提取 "idea-doc"
    // 路径示例: ./md-doc/idea-doc/test.md
    //      正则表达式详细说明：
    // \/md-doc\/：匹配起始的 /md-doc/ 字符串（斜杠需要转义）。
    // ([^/]+)：核心捕获组。匹配并捕获紧随其后的“非斜杠”字符。+ 表示匹配一个或多个。
    // \/：匹配文件夹名后面的那个斜杠，确保我们只抓取到这一层级。

    const match = path.match(/\/md-doc\/([^/]+)\//)
    // console.error('match-----', match)
    if (match) {
      const key = match[1]
      if (!grouped[key]) {
        grouped[key] = {}
      }
      // 将属于该 key 的所有 md 文件放入该组
      grouped[key][path] = allMdModules[path]
    }
  }

  // 为每个组生成对应的 Viewer 组件
  const tabs = []

  for (let folderName in folderLabelMap) {
    if (grouped[folderName]) {
      tabs.push({
        name: pascalCase(folderName),
        folder: folderName, // 保留原始文件夹名供调试
        label: folderLabelMap[folderName],
        component: createMarkdownTabViewerComponent(grouped[folderName]),
      })
    }
  }

  return tabs
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
