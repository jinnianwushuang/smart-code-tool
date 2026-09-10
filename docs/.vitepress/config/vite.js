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
  server: {
    // 开发环境代理子应用到各自的开发服务器，实现统一入口
    proxy: {
      '/smart-code-tool/code-tool-app/': {
        target: 'http://localhost:23330',
        changeOrigin: true,
      },
      '/smart-code-tool/vue-test-app/': {
        target: 'http://localhost:23350',
        changeOrigin: true,
        bypass(req) {
          // 不代理 .md 文件和 Vite 内部请求（?import、?direct、HMR 等）
          const url = req.url || ''
          if (url.includes('.md')) return false
          if (url.includes('?import') || url.includes('?direct')) return false
        },
      },
    },
  },
}
