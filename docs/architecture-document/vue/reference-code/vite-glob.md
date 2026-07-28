---
title: VITE import.meta.glob 封装
order: 2
---

# VITE import.meta.glob 封装

在 Vite 中，`import.meta.glob` 是一个极其强大的功能，它允许你从文件系统中导入多个模块。在应用开发中，通过对其进行封装，可以实现诸如**自动注册路由**、**全局组件加载**、**国际化配置自动化**等功能，极大地提升开发效率。

## 💡 核心参数速查

| 参数                    | JS 中的作用                                                                      |
| :---------------------- | :------------------------------------------------------------------------------- |
| **`eager: true`**       | **立即导入**。返回一个对象（包含内容），不加此参数返回的是函数（返回 Promise）。 |
| **`import: 'default'`** | **简化导出**。直接把 `export default` 的内容给到 value，省去写 `.default`。      |
| **`as: 'raw'`**         | **原文导入**。把文件内容当成字符串读进来（常用于显示源码、读取 Markdown）。      |

以下是几种常见的应用级别封装示例：

## 1. 自动注册全局组件 (Vue 示例)

不用手动 `import`，只要在 `components` 目录下创建 `.vue` 文件就能直接在模板里用。

```javascript
// src/components/index.js
export default {
  install(app) {
    // eager: true 表示同步导入，直接拿到组件定义
    const components = import.meta.glob('./**/*.vue', { eager: true })

    Object.entries(components).forEach(([path, module]) => {
      // 提取文件名。例如：'./HelloWorld.vue' -> 'HelloWorld'
      const name = path
        .split('/')
        .pop()
        .replace(/\.\w+$/, '')

      // 注册组件：优先取 export default，没有则取整个模块
      app.component(name, module.default || module)
    })
  },
}

// 在 main.js 中使用：
// import globalComponents from './components';
// app.use(globalComponents);
```

## 2. 自动化路由生成

根据 `views` 文件夹的结构自动生成 `vue-router` 的配置。

```javascript
// src/router/auto-routes.js
// 异步加载（懒加载），有助于拆分包体积
const modules = import.meta.glob('../views/**/index.vue')

export const autoRoutes = Object.keys(modules).map((path) => {
  // 解析路径。例如：'../views/user/login/index.vue' -> 'user/login'
  const routePath = path.match(/\.\.\/views\/(.*)\/index\.vue/)[1]

  return {
    path: `/${routePath}`,
    name: routePath.replace(/\//g, '-'),
    component: modules[path], // 返回的是一个返回 Promise 的函数
  }
})
```

## 3. 多语言 (i18n) 自动合并

自动读取 `locales` 目录下的所有 JSON 语言包。

```javascript
// src/locales/index.js
const messages = {}
// 强制同步导入，因为语言包通常在初始化时就需要
const modules = import.meta.glob('./lang/*.json', { eager: true })

for (const path in modules) {
  // 提取语言 key。例如：'./lang/zh-CN.json' -> 'zh-CN'
  const langKey = path.match(/([^/]+)\.json$/)[1]

  // 模块内容在 .default 中
  messages[langKey] = modules[path].default
}

export default messages
```

## 4. 静态资源 (图片) 批量获取

如果你想一次性拿到某个目录下所有图片的 URL，这个封装非常管用。

```javascript
// src/utils/assets.js
// 使用 query: '?url' 告诉 Vite 返回的是静态资源路径字符串
const imageModules = import.meta.glob('../assets/images/*.{png,jpg,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

// 转换为简单的 { 文件名: 路径 } 对象
const images = {}
Object.entries(imageModules).forEach(([path, url]) => {
  const name = path.split('/').pop().split('.')[0]
  images[name] = url
})

export default images
// 使用时：<img :src="images.logo" />
```

## 5. 目录扫描聚合导出

扫描导出目录下所有js 模块

```javascript
import { snakeCase } from 'change-case'

/**
 * 自动导出同级目录下所有 JS 模块并转换为 snake_case 键名
 * 规则：
 * 1. 排除当前文件 (index.js)
 * 2. 排除以下划线 _ 开头的文件
 * 3. 将文件名从 camelCase 或 PascalCase 转换为 snake_case
 */
const modules = {}

// 1. 使用 eager: true 同步导入
// 2. 这里的路径匹配根据实际需求调整，通常入口文件叫 index.js
const files = import.meta.glob('./*.js', { eager: true })

Object.keys(files).forEach((path) => {
  // 提取文件名。例如：'./UserInfo.js' -> 'UserInfo'
  const fileName = path
    .split('/')
    .pop()
    .replace(/\.[^/.]+$/, '')

  // 逻辑过滤：排除 index 和以下划线开头的私有文件
  if (fileName !== 'index' && !fileName.startsWith('_')) {
    // 使用 change-case 转换键名：'UserInfo' -> 'user_info'
    const key = snakeCase(fileName)

    // 聚合模块内容（优先获取 default 导出）
    modules[key] = files[path].default || files[path]
  }
})

export default modules
```
