// docs/.vitepress/config/vite.js
// Vite 构建配置

export const vite = {
  define: {
    __APP_BUILD_TIME__: JSON.stringify(new Date().toLocaleString()),
  },
}
