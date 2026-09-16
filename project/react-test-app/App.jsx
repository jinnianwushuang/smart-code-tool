import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { routes } from './router/routes/react-test-routes'
import Layout from './layout/Layout'

const isInIframe = window.self !== window.top

export default function App() {
  const [isDark, setIsDark] = useState(false)

  // 监听 VitePress 父页面主题切换
  useEffect(() => {
    if (!isInIframe) return

    try {
      if (window.parent.document.documentElement.classList.contains('dark')) {
        setIsDark(true)
      }
    } catch (_) {}

    const handler = (event) => {
      if (event.data?.type === 'theme-change') {
        setIsDark(event.data.theme === 'dark')
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // 同步 dark class 到 html
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <Routes>
        <Route element={<Layout isDark={isDark} />}>
          <Route path="/" element={<Navigate to="/react-test" replace />} />
          {routes}
        </Route>
      </Routes>
    </ConfigProvider>
  )
}
