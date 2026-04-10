/**
 * 全局日志：用于打印日志，并附加调用者信息
 * @param {...any} message - 日志内容
 * @returns {void}
 * @description
 * 1. 在生产环境下，直接打印日志，不解析堆栈信息，避免性能损失。
 * 2. 在开发环境下，创建一个 Error 对象来获取堆栈信息。
 * 3. 从堆栈中提取调用者的文件名和行号，适配不同浏览器的堆栈格式。
 * 4. 将调用者信息附加到日志前缀中，以便开发者快速定位日志来源。
 * 5. 最终输出格式化的日志，提升调试效率。
 * 6. 该函数可以替代 console.log，提供更丰富的日志信息，尤其适用于大型项目中的调试。
 * 7. 注意：在生产环境中调用该函数不会解析堆栈，因此性能与直接使用 console.log 相当。
 */

export const global_log = (...args) => {
  // 生产环境直接输出，避免堆栈解析开销
  if (import.meta.env?.PROD) {
    console.log(...args)
    return
  }

  // 寻找调用者行
  const callerLine = get_caller_line()
  // 1. 提取路径和行号的正则
  // 匹配 (http://...:8080/src/views/User.vue:20:5) 或 at /src/main.js:10:2
  const regex = /(https?:\/\/[^\s]+|(?:\/)[^\s]+):(\d+):(\d+)/
  const match = callerLine.match(regex)

  let location = '未知位置'
  if (match) {
    const fullPath = match[1] // 完整 URL 或 绝对路径
    const line = match[2] // 行号

    // 移除 Vite 常见的查询参数 (如 ?t=12345 或 ?import)
    const cleanPath = fullPath.split('?')[0]

    // 格式化输出： 路径:行号
    location = `${cleanPath}:${line}`
  }

  // 使用分组打印，让日志在控制台中更整洁
  console.groupCollapsed(`%c[LOG FROM ${location}]`, 'color: #42b983; font-weight: bold;')
  console.log(...args)
  console.groupEnd()
}

// 寻找调用者行（跳过 Error 行和当前函数行）
const get_caller_line = () => {
  const stack = new Error().stack
  const lines = stack.split('\n')

  // 排除掉当前的工具类文件路径,找到真正的调用者行
  // 排除掉当前的工具类文件路径 --- IGNORE ---
  // src/common/architecture-design/util/log/log.js
  const callerLine = lines.filter(
    (line) =>
      !line.includes('Error') &&
      !line.includes('src/common/architecture-design/util/log/log.js') &&
      !line.includes('src/common/architecture-design/util/merge/merge.js') &&
      line.includes('at '),
  )
  return callerLine[0] || ''
}
