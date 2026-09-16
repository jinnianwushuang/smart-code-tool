import { useUserContext } from '../context/UserContext'
import { STATUS_OPTIONS } from '../data/user-data'
import { Input, Select, Button, Space } from 'antd'

/**
 * 单例模式 - 搜索区域组件
 *
 * 通过 Context 消费共享状态，对标 Vue 侧 inject('ALL_CONTEXT_STATE') + inject('ALL_EVENT_PIPELINE')
 */
export default function UserSearch() {
  const { searchState, setSearchState, handleSearch, handleReset, handleAdd } = useUserContext()

  return (
    <div>
      {/* 搜索表单 */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Space>
          <span>用户名</span>
          <Input
            style={{ width: 160 }}
            value={searchState.username}
            onChange={(e) => setSearchState((s) => ({ ...s, username: e.target.value }))}
            placeholder="请输入用户名"
          />
        </Space>
        <Space>
          <span>状态</span>
          <Select
            style={{ width: 120 }}
            value={searchState.status}
            onChange={(value) => setSearchState((s) => ({ ...s, status: value }))}
            options={[{ value: '', label: '全部' }, ...STATUS_OPTIONS]}
          />
        </Space>
        <Button type="primary" onClick={handleSearch}>
          查询
        </Button>
        <Button onClick={handleReset}>重置</Button>
      </Space>

      {/* 操作栏 */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button type="primary" onClick={handleAdd}>
          + 新增用户
        </Button>
      </div>
    </div>
  )
}
