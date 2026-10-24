/**
 * ⚠️ AI / 开发者须知：
 * 本文件是研发知识库侧边栏的「装配器」，各体系 section 已拆分到 ./dev-knowledge/ 子目录。
 * 新增/修改菜单请编辑对应子文件；每个带 link 的叶子项必须含 id（24 位 nanoid）。
 * 新增菜单后运行: node scripts/inject-sidebar-ids.mjs 自动生成 id。
 */

import { learningPathsSection } from './dev-knowledge/learning-paths.js'
import { vueSection } from './dev-knowledge/vue.js'
import { reactSection } from './dev-knowledge/react.js'
import { flutterSection } from './dev-knowledge/flutter.js'
import { jsTsSection } from './dev-knowledge/js-ts.js'
import { nodejsSection } from './dev-knowledge/nodejs.js'
import { pythonSection } from './dev-knowledge/python.js'
import { crossDomainSection } from './dev-knowledge/cross-domain.js'

// ── 组装侧边栏 ──
export const devKnowledgeSidebar = {
  collapsed: false,
  items: [
    learningPathsSection,
    vueSection,
    reactSection,
    flutterSection,
    jsTsSection,
    nodejsSection,
    pythonSection,
    crossDomainSection,
  ],
}
