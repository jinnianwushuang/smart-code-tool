import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Typography, theme } from 'antd'
import {
  UnorderedListOutlined,
  AppstoreOutlined,
  BlockOutlined,
  FunctionOutlined,
  FormOutlined,
  HomeOutlined,
} from '@ant-design/icons'

const { Sider, Content, Header } = Layout
const { Text } = Typography

const isInIframe = window.self !== window.top

const MENU_ITEMS = [
  { key: '/react-test', icon: <HomeOutlined />, label: '总览' },
  { key: '/react-test/singleton', icon: <UnorderedListOutlined />, label: '单例模式' },
  { key: '/react-test/multiton', icon: <AppstoreOutlined />, label: '多例模式' },
  { key: '/react-test/compound', icon: <BlockOutlined />, label: '复合组件' },
  { key: '/react-test/hooks-pipeline', icon: <FunctionOutlined />, label: 'Hook 管线' },
  { key: '/react-test/controlled', icon: <FormOutlined />, label: '受控/非受控' },
]

export default function AppLayout({ isDark }) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const { token } = theme.useToken()

  const selectedKey = MENU_ITEMS.find((item) =>
    item.key === '/react-test'
      ? currentPath === '/react-test' || currentPath === '/react-test/'
      : currentPath.startsWith(item.key),
  )?.key

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        width={200}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '18px 18px 14px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: token.colorPrimary,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            R
          </div>
          <Text strong style={{ fontSize: 14 }}>
            React 架构验证
          </Text>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={MENU_ITEMS}
          onClick={({ key }) => navigate(key)}
          style={{
            borderRight: 0,
            marginTop: 8,
            background: 'transparent',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            padding: '12px 18px',
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            boxSizing: 'border-box',
          }}
        >
          <Text type="secondary" style={{ fontSize: 11 }}>
            5 种核心范式
          </Text>
        </div>
      </Sider>

      <Layout>
        {!isInIframe && (
          <Header
            style={{
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              height: 48,
              lineHeight: '48px',
              background: token.colorBgContainer,
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Text type="secondary">React 架构验证</Text>
          </Header>
        )}
        <Content style={{ overflow: 'auto', padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
