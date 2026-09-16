import { createContext, useContext } from 'react'
import { useUserList } from '../hooks/useUserList'

/**
 * 单例模式 - React Context
 *
 * 对标 Vue 的 provide/inject 机制
 * 所有子组件通过 useContext 共享同一份状态，实现单例消费
 */
const UserContext = createContext(null)

export function UserProvider({ children }) {
  const userList = useUserList()
  return <UserContext.Provider value={userList}>{children}</UserContext.Provider>
}

export function useUserContext() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUserContext must be used within UserProvider')
  return ctx
}
