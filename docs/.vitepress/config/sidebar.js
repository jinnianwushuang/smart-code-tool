// docs/.vitepress/config/sidebar.js
// 侧边栏配置 - 支持根据路由路径动态显示对应分类的菜单
// 从子模块导入各个侧边栏配置
import {
  psychologySidebar,
  aiSidebar,
  handbookSidebar,
  homeSidebar,
  aigcSidebar,
  devKnowledgeSidebar,
} from './sidebar/index.js'

// 导出侧边栏配置函数,根据路径返回对应的侧边栏
export const sidebar = {
  '/ai/': [aiSidebar],
  // AIGC 经验分享体系
  '/aigc/': [aigcSidebar],
  // 心理认知相关路径
  '/psychology/': [psychologySidebar],

  // 开发手册相关路径
  '/handbook/': [handbookSidebar],

  // 研发知识库（按框架优先组织）
  '/dev-knowledge/': [devKnowledgeSidebar],

  // 默认侧边栏(首页等)
  // '/': [aiSidebar, psychologySidebar, architectureSidebar, handbookSidebar],
  '/': [homeSidebar],
}
