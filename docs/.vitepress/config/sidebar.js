// docs/.vitepress/config/sidebar.js
// 侧边栏配置 - 支持根据路由路径动态显示对应分类的菜单
// 从子模块导入各个侧边栏配置
import {
  psychologySidebar,
  aiSidebar,
  architectureSidebar,
  handbookSidebar,
  homeSidebar,
  interviewSidebar,
  aigcSidebar,
} from './sidebar/index.js'

// 导出侧边栏配置函数,根据路径返回对应的侧边栏
export const sidebar = {
  '/ai/': [aiSidebar],
  // AIGC 经验分享体系
  '/aigc/': [aigcSidebar],
  // 心理认知相关路径
  '/psychology/': [psychologySidebar],

  // 架构文档相关路径
  '/architecture-document/': [architectureSidebar],

  // 开发手册相关路径
  '/handbook/': [handbookSidebar],

  // 面试知识库相关路径
  '/interview/': [interviewSidebar],

  // 默认侧边栏(首页等)
  // '/': [aiSidebar, psychologySidebar, architectureSidebar, handbookSidebar],
  '/': [homeSidebar],
}
