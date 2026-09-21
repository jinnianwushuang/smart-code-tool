# 自定义 Hooks 模式参照

## Hook 分类

| 类别      | 命名规则          | 说明                      |
| --------- | ----------------- | ------------------------- |
| 页面 Hook | `use-<页面名>.js` | 管理整个页面的状态和逻辑  |
| 功能 Hook | `use-<功能名>.js` | 封装可复用的功能逻辑      |
| 数据 Hook | `use-<数据名>.js` | 封装数据获取和缓存逻辑    |
| 工具 Hook | `use-<工具名>.js` | 封装浏览器 API 或通用工具 |

## 页面 Hook 标准写法

```jsx
// hooks/use-user-management.js
// 一个页面 Hook 聚合了该页面所有状态和逻辑
export function useUserManagement() {
  // 1. 状态声明
  const [tableData, setTableData] = useState([])
  const [tableLoading, setTableLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [queryForm, setQueryForm] = useState({})

  // 2. 副作用（初始加载）
  useEffect(() => {
    loadTableData()
  }, [])

  // 3. 核心逻辑函数
  const loadTableData = async (params = {}) => {
    /* ... */
  }

  // 4. 事件处理函数
  const handleQuery = () => {
    /* ... */
  }
  const handleReset = () => {
    /* ... */
  }

  // 5. 返回状态和方法
  return { tableData, tableLoading, pagination, queryForm, handleQuery, handleReset }
}
```

## 功能 Hook 标准写法

```jsx
// hooks/use-debounce.js
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

```jsx
// hooks/use-toggle.js
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)
  const toggle = () => setValue((v) => !v)
  const setTrue = () => setValue(true)
  const setFalse = () => setValue(false)
  return { value, toggle, setTrue, setFalse }
}
```

## 数据 Hook 标准写法

```jsx
// hooks/use-api.js
export function useApi(apiFunc, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (params) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiFunc(params)
      setData(response.data)
      return response.data
    } catch (err) {
      setError(err)
      if (options.onError) options.onError(err)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setData(null)
    setLoading(false)
    setError(null)
  }

  return { data, loading, error, execute, reset }
}
```

## 工具 Hook 标准写法

```jsx
// hooks/use-local-storage.js
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    setStoredValue(value)
    window.localStorage.setItem(key, JSON.stringify(value))
  }

  return [storedValue, setValue]
}
```

```jsx
// hooks/use-media-query.js
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
```

## Hook 组合模式

```jsx
// 多个 Hook 组合使用
export function useUserManagement() {
  const { data: tableData, loading, execute: loadData } = useApi(fetchUserList)
  const { value: dialogVisible, setTrue: openDialog, setFalse: closeDialog } = useToggle()
  const debouncedQuery = useDebounce(queryForm.keyword, 300)

  // 监听防抖查询变化
  useEffect(() => {
    if (debouncedQuery) loadData({ keyword: debouncedQuery })
  }, [debouncedQuery])

  return { tableData, loading, dialogVisible, openDialog, closeDialog, loadData }
}
```

## 关键约束

- Hook 必须以 `use` 开头命名
- Hook 内部禁止条件调用其他 Hook（遵循 Hooks 规则）
- 副作用必须有清理函数（`useEffect` 返回 cleanup）
- 页面 Hook 返回对象（方便解构），功能 Hook 可返回数组或对象
- 禁止在 Hook 中直接操作 DOM（使用 ref）
- 禁止在循环、条件语句、嵌套函数中调用 Hook
