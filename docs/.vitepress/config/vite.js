// docs/.vitepress/config/vite.js
// Vite 构建配置

/**
 * 生成构建时间字符串，强制 Asia/Shanghai 时区 (UTC+8)
 * 输出格式: YYYY-MM-DD HH:mm:ss +08:00
 */
function formatBuildTime() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const p = (type) => {
    const found = parts.find((x) => x.type === type)
    return found ? found.value : '00'
  }
  const h = String(parseInt(p('hour'), 10) % 24).padStart(2, '0')
  return `${p('year')}-${p('month')}-${p('day')} ${h}:${p('minute')}:${p('second')} +08:00`
}

export const vite = {
  define: {
    __APP_BUILD_TIME__: JSON.stringify(formatBuildTime()),
  },
}
