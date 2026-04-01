// src/utils/mdLoader.js
import { pascalCase } from 'change-case'

/**
 * 扫描 Markdown 并提取 Frontmatter 作为 Label
 * @param {Record<string, any>} modules - import.meta.glob 的结果
 */
export const get_markdown_tabs = (modules) => {
  const tabs = Object.entries(modules)
    .map(([path, module]) => {
      // 1. 基础信息提取
      const fileName = path.split('/').pop().replace(/\.md$/, '')

      // 2. 过滤下划线文件
      if (fileName.startsWith('_')) return null

      // 3. 核心：从 module 提取 frontmatter
      // unplugin-vue-markdown 会将 frontmatter 挂载在导出对象上

      return {
        // 唯一标识：UserGuide
        name: pascalCase(fileName),
        // 优先使用   里的 title，次之使用文件名
        label: module.title || fileName,
        // 传递排序权重（可选），方便后续对 Tab 进行排序
        order: module.order || 99,
        // Markdown 转换后的 Vue 组件
        component: module.default,
      }
    })
    .filter(Boolean)

  // 4. 根据 order 排序，让 Tab 显示更可控
  return tabs.sort((a, b) => a.order - b.order)
}
