---
title: 通用工具类 moduleLoader
order: 3
---

## 通用工具类 moduleLoader

进阶版本支持：

1. **自定义转换函数**：不局限于 `snake_case`，也可以传 `camelCase`。
2. **自定义过滤规则**：通过回调函数决定哪些文件要排除。
3. **支持递归（可选）**：通过路径参数灵活配置。

## 1. 封装通用工具类 `moduleLoader.js`

```javascript
import { snakeCase } from 'change-case'

/**
 * 通用模块加载封装
 * @param {Record<string, any>} globResults - import.meta.glob 的结果
 * @param {Object} options
 * @param {string} options.exclude - 需要排除的特定文件名（默认 index）
 * @param {Function} options.transformKey - 键名转换函数（默认 snakeCase）
 * @param {boolean} options.includeDefault - 是否只取 default 导出（默认 true）
 */
export const map_glob_modules = (
  globResults,
  { exclude = 'index', transformKey = snakeCase, includeDefault = true } = {},
) => {
  const modules = {}

  Object.keys(globResults).forEach((path) => {
    // 1. 提取原始文件名（不含路径和后缀）
    const rawName = path
      .split('/')
      .pop()
      .replace(/\.[^/.]+$/, '')

    // 2. 过滤逻辑：排除指定文件、以下划线开头的文件
    if (rawName === exclude || rawName.startsWith('_')) {
      return
    }

    // 3. 转换键名 (例如: UserInfo -> user_info)
    const key = transformKey ? transformKey(rawName) : rawName

    // 4. 获取模块内容
    const module = globResults[path]
    modules[key] = includeDefault ? module.default || module : module
  })

  return modules
}
```

## 2. 在业务中实际应用

## 场景 A：同级目录自动导出 (API 模块)

在 `src/api/index.js` 中：

```javascript
import { map_glob_modules } from '@/utils/moduleLoader'

// 扫描同级 JS
const files = import.meta.glob('./*.js', { eager: true })

// 一键转换并导出
export default map_glob_modules(files)
```

## 场景 B：递归扫描子目录 (Store/Vuex 模块)

如果你想把 `modules/user/info.js` 也扫描进来，可以使用递归模式：

```javascript
import { map_glob_modules } from '@/utils/moduleLoader'
import { camelCase } from 'change-case'

// 扫描所有子目录下的 js
const files = import.meta.glob('./**/*.js', { eager: true })

export const stores = map_glob_modules(files, {
  transformKey: camelCase, // 状态管理通常习惯小驼峰
  exclude: 'main', // 假设入口叫 main.js
})
```

## 3. 进阶：处理多层级路径名（可选）

如果你希望生成的 Key 包含文件夹路径（如 `user_list` 而不仅仅是 `list`），可以微调工具函数：

```javascript
// 修改 map_glob_modules 内部解析路径的逻辑
const rawName = path
  .replace(/^\.\//, '') // 去掉 ./
  .replace(/\.[^/.]+$/, '') // 去掉后缀
  .replace(/\//g, '_') // 将层级 / 替换为 _

// 结果：'./user/OrderList.js' -> 'user_order_list'
```

## 💡 这样封装的好处：

- **配置化**：通过 `options` 参数控制行为，而不是写死逻辑。
- **解耦**：业务代码只需要关心 `import.meta.glob` 的范围，具体的过滤和命名规则由工具函数统一处理。
- **健壮性**：自动处理了 `default` 导出的边界情况。
