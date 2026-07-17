// docs/.vitepress/config/vite.js
// Vite 构建配置

/**
 * 生成构建时间字符串，格式: YYYY-MM-DD HH:mm:ss
 */
function formatBuildTime() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  )
}

export const vite = {
  define: {
    __APP_BUILD_TIME__: JSON.stringify(formatBuildTime()),
  },
}
