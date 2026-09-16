import { UserProvider } from './context/UserContext'
import UserSearch from './components/UserSearch'
import UserTable from './components/UserTable'
import UserModal from './components/UserModal'
import { Card, Typography } from 'antd'

const { Title, Paragraph, Text } = Typography

/**
 * 单例模式 Demo 页面
 *
 * 架构对标 Vue 侧 singleton-lv5：
 * - Vue: provide/inject + useContextAssembler → React: Context + 自定义 Hook
 * - 所有子组件通过 UserContext 共享同一份状态（单例）
 * - useUserList Hook 封装全部业务逻辑，对标 Vue 的 all_atoms_assembler
 */
export default function SingletonDemo() {
  return (
    <UserProvider>
      <div>
        <div style={{ marginBottom: 20 }}>
          <Title level={4} style={{ marginBottom: 8 }}>
            单例模式 - 用户管理
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            所有组件通过 React Context 共享同一份状态，对标 Vue 的 provide/inject 机制。
            业务逻辑封装在 <Text code>useUserList</Text> Hook 中。
          </Paragraph>
        </div>
        <Card>
          <UserSearch />
          <UserTable />
          <UserModal />
        </Card>
      </div>
    </UserProvider>
  )
}
