/**
 * 将路由配置转换为菜单数据结构
 * @param {Array} routes - 路由原始数组 (menuRoutes)
 * @param {String} basePath - 基础路径（用于递归拼接完整 URL）
 */
export function generate_menu_from_routes(routes, basePath = '') {
  const menuList = []

  routes.forEach((route) => {
    // 1. 过滤：跳过 meta.hidden 为 true 的路由（如登录页、404等）
    if (route.meta?.hidden) return

    // 2. 路径处理：拼接父级路径得到完整路径
    // 如果 path 是以 / 开头则是绝对路径，否则进行拼接
    const fullPath = route.path.startsWith('/')
      ? route.path
      : `${basePath}/${route.path}`.replace(/\/+/g, '/')

    // 3. 构造菜单项
    const menuItem = {
      path: fullPath,
      name: route.name, // 对应路由的 name，用于 router.push
      key: route.name,
      label: route.meta?.title || '未命名',
      icon: route.meta?.icon || '',
    }

    // 4. 递归处理子路由
    if (route.children && route.children.length > 0) {
      const children = generate_menu_from_routes(route.children, fullPath)
      if (children.length > 0) {
        menuItem.children = children
      }
    }

    menuList.push(menuItem)
  })

  return menuList
}
