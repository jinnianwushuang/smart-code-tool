---
title: 扩展模板
order: 1111
---

# 扩展模板

## 概述

该模板设计为可扩展的，允许您添加新功能、修改现有行为并集成第三方库，同时保持架构的一致性。

## 扩展点

### 1. 组件扩展

#### 添加新组件

在 `component/` 目录中创建新组件：

```
component/
├── my-custom-component/
│   ├── my-custom-component.vue
│   └── state/
│       └── state.js
```

**组件结构**:

```javascript
<!-- my-custom-component.vue -->

<div class="my-custom-component">
    <h3>{{ title }}</h3>
    <slot></slot>
  </div>

import { useContextAssembler } from 'src/output/common/composable-common.js'
import { my_custom_component_assembler } from './state/state.js'
const props = defineProps({ title: { type: String, default: 'Custom Component' } })
const base_payload = {
  /* component payload */
}
const {
  //Assembled properties and methods
  // 组装的属性和方法
} = useContextAssembler(base_payload, my_custom_component_assembler())
```

**状态文件** (`state/state.js`):

```javascript
import { assemble_component } from 'src/common/architecture-design/assembler/assemble_component.js'

export const my_custom_component_assembler = () => {
  return assemble_component({
    atoms: [
      // Component atoms
      // 组件原子
    ],
    molecules: [
      // Component molecules
      // 组件分子
    ],
    organisms: [
      // Component organisms
      // 组件有机体
    ],
  })
}
```

#### 扩展现有组件

修改现有组件以添加新功能：

```javascript
// Extend table component with export functionality
// 使用导出功能扩展表格组件
export const extended_table_assembler = () => {
  const base_table = table_assembler()

  return {
    ...base_table,
    atoms: [
      ...base_table.atoms,
      // Add export atom
      // 添加导出原子
      {
        key: 'export_data',
        getter: () => ref([]),
      },
    ],
    molecules: [
      ...base_table.molecules,
      // Add export molecule
      // 添加导出分子
      {
        key: 'handle_export_data',
        value: (payload) => async () => {
          const { table_data, export_data } = payload
          export_data.value = table_data.value
          // Export logic here
          // 导出逻辑在这里
        },
      },
    ],
  }
}
```

### 2. API 扩展

#### 添加新 API 端点

在 `api/module/` 中创建新模块：

```javascript
// api/module/product.js
import { request_wrapper } from '../utils/wrapper/request-wrapper.js'

export const get_product_list = (params) => {
  return request_wrapper({
    method: 'GET',
    url: '/products',
    params,
  })
}

export const create_product = (data) => {
  return request_wrapper({
    method: 'POST',
    url: '/products',
    data,
  })
}

// Add to main API index
// 添加到主 API 索引
// api/index.js
export * from './module/product.js'
```

#### 扩展现有 API

添加新方法到现有模块：

```javascript
// Extend user.js with new methods
// 使用新方法扩展 user.js
export const get_user_permissions = (userId) => {
  return request_wrapper({
    method: 'GET',
    url: `/users/${userId}/permissions`,
  })
}

export const update_user_permissions = (userId, permissions) => {
  return request_wrapper({
    method: 'PUT',
    url: `/users/${userId}/permissions`,
    data: { permissions },
  })
}
```

### 3. 状态管理扩展

#### 添加新状态原子

```javascript
// Add to state/state.js
// 添加到 state/state.js
export const extended_state_atoms = () => {
  return [
    // Existing atoms
    // 现有原子
    ...state_atoms(),

    // New atoms
    // 新原子
    {
      key: 'user_preferences',
      getter: () =>
        ref({
          theme: 'light',
          language: 'en',
        }),
    },
    {
      key: 'notification_settings',
      getter: () =>
        ref({
          email: true,
          push: false,
        }),
    },
  ]
}
```

#### 添加新状态分子

```javascript
// Add to state/state.js
// 添加到 state/state.js
export const extended_state_molecules = () => {
  return [
    // Existing molecules
    // 现有分子
    ...state_molecules(),

    // New molecules
    // 新分子
    {
      key: 'handle_update_preferences',
      value: (payload) => async (preferences) => {
        const { user_preferences } = payload
        user_preferences.value = { ...user_preferences.value, ...preferences }
        // Save to API
        // 保存到 API
        await update_user_preferences(preferences)
      },
    },
  ]
}
```

### 4. 生命周期扩展

#### 添加自定义生命周期钩子

```javascript
// module/lifecycle/custom-lifecycle.js
export const lifecycle_onCustomEvent = (payload) => {
  console.log('Custom lifecycle event')
  // Custom logic
  // 自定义逻辑
}

// Extend existing lifecycle
// 扩展现有生命周期
export const extended_lifecycle_hooks = {
  ...lifecycle_hooks,
  onCustomEvent: lifecycle_onCustomEvent,
}
```

#### 添加效果清理

```javascript
// module/effect/custom-effect.js
export const cleanup_effect_custom = (payload) => {
  // Custom cleanup logic
  // 自定义清理逻辑
  return [
    // Cleanup items
    // 清理项目
  ]
}

// Add to assembler
// 添加到组装器
export const extended_cleanup_effects = [...cleanup_effects, cleanup_effect_custom]
```

## 集成第三方库

### 1. UI 库集成

#### 集成 Element Plus

```javascript
// src/main.js
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

app.use(ElementPlus)
```

#### 创建包装组件

```javascript
<!-- component/element-wrapper/
     ├── el-table-wrapper.vue
     └── el-form-wrapper.vue -->

<el-table v-bind="$attrs" v-on="$listeners">
    <slot></slot>
  </el-table>

// Wrapper for Element Plus table // Element Plus 表格的包装器
```

### 2. 状态管理库集成

#### 集成 Pinia

```javascript
// src/store/index.js
import { createPinia } from 'pinia'

const pinia = createPinia()
app.use(pinia)
```

#### 创建 Pinia 存储

```javascript
// src/store/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    preferences: {},
  }),

  actions: {
    async fetchUser() {
      // Integrate with existing API
      // 与现有 API 集成
      const userData = await get_user_detail(this.user.id)
      this.user = userData
    },
  },
})
```

#### 在组件中使用

```javascript
import { useUserStore } from 'src/store/user.js'

const userStore = useUserStore()

// Use alongside existing assembler
// 与现有组装器一起使用
const {
  table_data,
  // Other assembled properties
} = useContextAssembler(base_payload, all_atoms_assembler())

// Access Pinia store
// 访问 Pinia 存储
const user = computed(() => userStore.user)
```

### 3. 图表库集成

#### 集成 ECharts

```javascript
// src/utils/chart.js
import * as echarts from 'echarts'

// Chart component wrapper
// 图表组件包装器
export const createChart = (dom, options) => {
  const chart = echarts.init(dom)
  chart.setOption(options)
  return chart
}
```

#### 创建图表组件

```javascript
<!-- component/chart/
     ├── chart.vue -->

<div ref="chartRef" class="chart-container"></div>

import { createChart } from 'src/utils/chart.js' const chartRef = ref() onMounted(() => { const
chart = createChart(chartRef.value, { // Chart options // 图表选项 }) // Add to cleanup //
添加到清理 return () => chart.dispose() })
```

## 自定义中间件

### 请求中间件

```javascript
// api/middleware/auth.js
export const auth_middleware = (config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

// api/middleware/logging.js
export const logging_middleware = (config) => {
  console.log('API Request:', config.method, config.url)
  return config
}

// Apply middleware
// 应用中间件
// api/index.js
apiClient.interceptors.request.use(auth_middleware)
apiClient.interceptors.request.use(logging_middleware)
```

### 响应中间件

```javascript
// api/middleware/response-transform.js
export const response_transform_middleware = (response) => {
  // Transform response data
  // 转换响应数据
  if (response.data && response.data.data) {
    response.data = response.data.data
  }
  return response
}

// api/middleware/error-handling.js
export const error_handling_middleware = (error) => {
  if (error.response?.status === 401) {
    // Handle unauthorized
    // 处理未授权
    window.location.href = '/login'
  }
  return Promise.reject(error)
}

// Apply middleware
// 应用中间件
apiClient.interceptors.response.use(response_transform_middleware)
apiClient.interceptors.response.use(null, error_handling_middleware)
```

## 插件系统

### 创建插件

```javascript
// plugin/notification.js
export const notification_plugin = {
  install(app, options) {
    // Add global notification method
    // 添加全局通知方法
    app.config.globalProperties.$notify = (message, type = 'info') => {
      console.log(`[${type.toUpperCase()}] ${message}`)
      // Integrate with UI library notification
      // 与 UI 库通知集成
    }
  },
}

// Use plugin
// 使用插件
// src/main.js
app.use(notification_plugin)
```

### 功能插件

```javascript
// plugin/export.js
export const export_plugin = {
  install(app) {
    app.config.globalProperties.$export = {
      toCSV: (data, filename) => {
        // CSV export logic
        // CSV 导出逻辑
      },
      toExcel: (data, filename) => {
        // Excel export logic
        // Excel 导出逻辑
      },
    }
  },
}
```

## 主题和样式扩展

### 自定义主题

```text
// src/styles/theme.scss
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
}

// Dark theme
// 深色主题
[data-theme='dark'] {
  --primary-color: #0d6efd;
  --background-color: #212529;
  --text-color: #ffffff;
}
```

### 组件样式扩展

```javascript
<div :class="componentClass">
    <!-- Component content -->
  </div>

const props = defineProps({ variant: { type: String, default: 'default', }, }) const componentClass
= computed(() => ['my-component', `my-component--${props.variant}`]) .my-component { /* Base styles
*/ } .my-component--primary { background-color: var(--primary-color); } .my-component--secondary {
background-color: var(--secondary-color); }
```

## 测试扩展

### 单元测试扩展

```javascript
// test/component/my-custom-component.test.js
import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyCustomComponent from 'src/component/my-custom-component/my-custom-component.vue'

describe('MyCustomComponent', () => {
  test('renders with custom title', () => {
    const wrapper = mount(MyCustomComponent, {
      props: {
        title: 'Test Title',
      },
    })

    expect(wrapper.text()).toContain('Test Title')
  })

  test('uses assembler correctly', () => {
    // Test assembler integration
    // 测试组装器集成
  })
})
```

### E2E 测试扩展

```javascript
// test/e2e/custom-component.spec.js
import { test, expect } from '@playwright/test'

test('custom component interaction', async ({ page }) => {
  await page.goto('/custom-page')

  // Test custom component functionality
  // 测试自定义组件功能
  await page.click('.my-custom-component button')
  await expect(page.locator('.result')).toBeVisible()
})
```

## 性能优化扩展

### 代码分割

```javascript
// Lazy load components
// 延迟加载组件
const MyCustomComponent = defineAsyncComponent(
  () => import('src/component/my-custom-component/my-custom-component.vue'),
)
```

### 虚拟滚动

```javascript
// component/virtual-list/
import { VirtualList } from 'vueuc'

// Use for large lists
// 用于大型列表
```

### 记忆化

```javascript
import { computed, customRef } from 'vue'

// Memoized computed
// 记忆化计算
const expensiveComputed = computed(() => {
  // Expensive operation
  // 昂贵的操作
  return computeExpensiveValue()
})

// Custom memoization
// 自定义记忆化
const memoizedValue = customRef((track, trigger) => {
  let value
  let dirty = true

  return {
    get() {
      if (dirty) {
        track()
        value = computeValue()
        dirty = false
      }
      return value
    },
    set(newValue) {
      value = newValue
      dirty = false
      trigger()
    },
  }
})
```

## 部署扩展

### 环境配置

```javascript
// config/env.js
export const environments = {
  development: {
    apiBaseUrl: 'http://localhost:3000/api',
    debug: true,
  },
  staging: {
    apiBaseUrl: 'https://staging-api.example.com',
    debug: true,
  },
  production: {
    apiBaseUrl: 'https://api.example.com',
    debug: false,
  },
}

export const currentEnv = environments[import.meta.env.MODE]
```

### 构建优化

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Custom chunk splitting
          // 自定义块分割
          vendor: ['vue', 'vue-router'],
          ui: ['element-plus'],
          utils: ['lodash', 'moment'],
        },
      },
    },
  },
}
```

## 最佳实践

### ✅ 应该做

- 遵循现有架构模式
- 保持向后兼容性
- 添加适当的测试
- 更新文档
- 使用 TypeScript 进行类型安全

### ❌ 不应该做

- 破坏现有 API
- 添加循环依赖
- 忽略错误处理
- 跳过测试
- 过度抽象

## 迁移指南

### 从旧版本迁移

```javascript
// Before (old pattern)
// 之前（旧模式）
export const old_component = {
  data() {
    return { items: [] }
  },
  methods: {
    loadItems() {
      /* ... */
    },
  },
}

// After (new assembler pattern)
// 之后（新组装器模式）
export const new_component_assembler = () => {
  return assemble_component({
    atoms: [
      {
        key: 'items',
        getter: () => ref([]),
      },
    ],
    molecules: [
      {
        key: 'handle_load_items',
        value: (payload) => async () => {
          const { items } = payload
          // Migration logic
          // 迁移逻辑
        },
      },
    ],
  })
}
```
