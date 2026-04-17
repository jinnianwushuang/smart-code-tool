---
title: 配置指南
order: 121
---

# 配置指南

## 概述

该模板提供灵活的配置系统，允许您自定义组件行为、API 端点、主题和构建选项，同时保持代码的可维护性。

## 配置文件结构

### 主要配置文件

```
config/
├── index.js          # 主配置文件
├── api.js            # API 配置
├── theme.js          # 主题配置
├── component.js      # 组件配置
├── build.js          # 构建配置
└── env.js            # 环境配置
```

### 主配置文件

位于 `config/index.js`：

```javascript
// Main configuration file
// 主配置文件
export const config = {
  // Application settings
  // 应用程序设置
  app: {
    name: 'My Vue App',
    version: '1.0.0',
    debug: import.meta.env.DEV,
  },

  // Feature flags
  // 功能标志
  features: {
    enableCache: true,
    enableLogging: true,
    enableAnalytics: false,
  },

  // Import other configs
  // 导入其他配置
  ...api_config,
  ...theme_config,
  ...component_config,
  ...build_config,
  ...env_config,
}
```

## API 配置

### 基础 API 配置

位于 `config/api.js`：

```javascript
export const api_config = {
  // Base API settings
  // 基础 API 设置
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
  },

  // API endpoints
  // API 端点
  endpoints: {
    users: '/users',
    products: '/products',
    orders: '/orders',
  },

  // Request/response interceptors
  // 请求/响应拦截器
  interceptors: {
    request: [
      // Add auth token
      // 添加认证令牌
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      // Add request logging
      // 添加请求日志
      (config) => {
        if (config.logging) {
          console.log('API Request:', config.method, config.url)
        }
        return config
      },
    ],
    response: [
      // Handle common responses
      // 处理常见响应
      (response) => {
        if (response.data?.success === false) {
          throw new Error(response.data.message)
        }
        return response
      },
      // Handle errors
      // 处理错误
      (error) => {
        if (error.response?.status === 401) {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      },
    ],
  },
}
```

### 高级 API 配置

```javascript
export const advanced_api_config = {
  ...api_config,

  // Caching configuration
  // 缓存配置
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    strategies: {
      users: 'memory',
      products: 'localStorage',
      orders: 'sessionStorage',
    },
  },

  // Rate limiting
  // 速率限制
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },

  // Request deduplication
  // 请求去重
  deduplication: {
    enabled: true,
    keyGenerator: (config) => `${config.method}_${config.url}_${JSON.stringify(config.params)}`,
  },
}
```

## 主题配置

### 基础主题配置

位于 `config/theme.js`：

```javascript
export const theme_config = {
  // Color palette
  // 颜色调色板
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
  },

  // Typography
  // 排版
  typography: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },

  // Spacing
  // 间距
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
  },

  // Breakpoints
  // 断点
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
}
```

### 深色主题配置

```javascript
export const dark_theme_config = {
  ...theme_config,

  // Dark theme overrides
  // 深色主题覆盖
  colors: {
    ...theme_config.colors,
    primary: '#0d6efd',
    background: '#212529',
    surface: '#343a40',
    text: '#ffffff',
    textSecondary: '#adb5bd',
  },

  // Dark theme specific settings
  // 深色主题特定设置
  dark: {
    enabled: false, // Toggle for dark mode
    autoDetect: true, // Auto-detect system preference
  },
}
```

## 组件配置

### 基础组件配置

位于 `config/component.js`：

```javascript
export const component_config = {
  // Global component settings
  // 全局组件设置
  global: {
    loading: {
      type: 'spinner', // 'spinner', 'skeleton', 'progress'
      color: 'primary',
      size: 'medium',
    },
    notification: {
      position: 'top-right',
      duration: 3000,
      maxCount: 5,
    },
  },

  // Table component settings
  // 表格组件设置
  table: {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  },

  // Form component settings
  // 表单组件设置
  form: {
    layout: 'vertical', // 'horizontal', 'vertical', 'inline'
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    validateTrigger: ['change', 'blur'],
  },

  // Dialog/Modal settings
  // 对话框/模态框设置
  dialog: {
    centered: true,
    destroyOnClose: true,
    maskClosable: false,
    width: 520,
  },
}
```

### 高级组件配置

```javascript
export const advanced_component_config = {
  ...component_config,

  // Component variants
  // 组件变体
  variants: {
    table: {
      bordered: false,
      striped: true,
      hover: true,
    },
    button: {
      size: 'medium',
      shape: 'rounded',
    },
  },

  // Component animations
  // 组件动画
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out',
  },

  // Accessibility settings
  // 无障碍设置
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: true,
  },
}
```

## 构建配置

### Vite 构建配置

位于 `config/build.js`：

```javascript
export const build_config = {
  // Build settings
  // 构建设置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: import.meta.env.DEV,
    minify: !import.meta.env.DEV,
  },

  // Code splitting
  // 代码分割
  codeSplitting: {
    enabled: true,
    chunks: {
      vendor: ['vue', 'vue-router', 'axios'],
      ui: ['element-plus', 'ant-design-vue'],
      utils: ['lodash', 'moment', 'dayjs'],
    },
  },

  // Optimization
  // 优化
  optimization: {
    enabled: true,
    compress: {
      drop_console: !import.meta.env.DEV,
      drop_debugger: !import.meta.env.DEV,
    },
    preload: {
      enabled: true,
      modules: ['vue', 'vue-router'],
    },
  },

  // Plugins
  // 插件
  plugins: [
    // Custom plugins
    // 自定义插件
  ],
}
```

### 高级构建配置

```javascript
export const advanced_build_config = {
  ...build_config,

  // Bundle analysis
  // 包分析
  analysis: {
    enabled: import.meta.env.DEV,
    openAnalyzer: false,
  },

  // PWA settings
  // PWA 设置
  pwa: {
    enabled: false,
    manifest: {
      name: 'My Vue App',
      short_name: 'VueApp',
      theme_color: '#007bff',
    },
  },

  // CDN configuration
  // CDN 配置
  cdn: {
    enabled: false,
    url: 'https://cdn.example.com',
    libraries: {
      vue: 'vue@3',
      axios: 'axios@1',
    },
  },
}
```

## 环境配置

### 环境变量配置

位于 `config/env.js`：

```javascript
export const env_config = {
  // Environment detection
  // 环境检测
  environment: import.meta.env.MODE,

  // Environment-specific settings
  // 环境特定设置
  settings: {
    development: {
      debug: true,
      logLevel: 'debug',
      apiTimeout: 30000,
    },
    staging: {
      debug: true,
      logLevel: 'info',
      apiTimeout: 15000,
    },
    production: {
      debug: false,
      logLevel: 'error',
      apiTimeout: 10000,
    },
  },

  // Feature flags by environment
  // 按环境的功能标志
  features: {
    development: {
      mockApi: true,
      hotReload: true,
      devTools: true,
    },
    staging: {
      mockApi: false,
      hotReload: false,
      devTools: true,
    },
    production: {
      mockApi: false,
      hotReload: false,
      devTools: false,
    },
  },
}
```

### 多环境配置

```javascript
export const multi_env_config = {
  ...env_config,

  // Environment URLs
  // 环境 URL
  urls: {
    development: {
      api: 'http://localhost:3000/api',
      websocket: 'ws://localhost:3001',
      cdn: 'http://localhost:3002',
    },
    staging: {
      api: 'https://staging-api.example.com',
      websocket: 'wss://staging-ws.example.com',
      cdn: 'https://staging-cdn.example.com',
    },
    production: {
      api: 'https://api.example.com',
      websocket: 'wss://ws.example.com',
      cdn: 'https://cdn.example.com',
    },
  },

  // Environment variables validation
  // 环境变量验证
  validation: {
    required: ['VITE_API_BASE_URL', 'VITE_APP_NAME'],
    optional: ['VITE_DEBUG_MODE', 'VITE_LOG_LEVEL'],
  },
}
```

## 配置管理

### 配置加载器

```javascript
// config/loader.js
import { config } from './index.js'

export class ConfigLoader {
  static load() {
    // Load configuration based on environment
    // 根据环境加载配置
    const env = import.meta.env.MODE
    const envConfig = config.settings[env] || {}

    return {
      ...config,
      ...envConfig,
      currentEnv: env,
    }
  }

  static get(key) {
    const fullConfig = this.load()
    return key.split('.').reduce((obj, k) => obj?.[k], fullConfig)
  }

  static set(key, value) {
    // Runtime configuration updates
    // 运行时配置更新
    const keys = key.split('.')
    const lastKey = keys.pop()
    const target = keys.reduce((obj, k) => obj[k] = obj[k] || {}, config)
    target[lastKey] = value
  }
}
```

### 配置验证

```javascript
// config/validator.js
export const config_validator = {
  validate(config) {
    const errors = []

    // Required fields validation
    // 必需字段验证
    if (!config.api?.baseURL) {
      errors.push('API baseURL is required')
    }

    // Type validation
    // 类型验证
    if (config.api?.timeout && typeof config.api.timeout !== 'number') {
      errors.push('API timeout must be a number')
    }

    // Custom validation rules
    // 自定义验证规则
    if (config.theme?.colors) {
      Object.entries(config.theme.colors).forEach(([key, value]) => {
        if (!this.isValidColor(value)) {
          errors.push(`Invalid color for ${key}: ${value}`)
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  isValidColor(color) {
    // Basic color validation
    // 基本颜色验证
    return /^#[0-9A-Fa-f]{6}$/.test(color) || /^#[0-9A-Fa-f]{3}$/.test(color)
  },
}
```

## 运行时配置

### 动态配置更新

```javascript
// Runtime configuration management
// 运行时配置管理
export const runtime_config = {
  // User preferences
  // 用户偏好
  preferences: {
    theme: localStorage.getItem('theme') || 'light',
    language: localStorage.getItem('language') || 'en',
    tablePageSize: parseInt(localStorage.getItem('tablePageSize')) || 10,
  },

  // Update preference
  // 更新偏好
  updatePreference(key, value) {
    this.preferences[key] = value
    localStorage.setItem(key, value)

    // Emit change event
    // 发出更改事件
    window.dispatchEvent(new CustomEvent('config:preference-changed', {
      detail: { key, value }
    }))
  },

  // Get preference with fallback
  // 获取具有回退的偏好
  getPreference(key, fallback = null) {
    return this.preferences[key] ?? fallback
  },
}
```

### 配置热重载

```javascript
// Development-only configuration hot reload
// 仅开发环境的配置热重载
if (import.meta.hot) {
  import.meta.hot.accept('./config/index.js', (newConfig) => {
    // Update configuration
    // 更新配置
    Object.assign(config, newConfig.default)

    // Notify components of config change
    // 通知组件配置更改
    window.dispatchEvent(new CustomEvent('config:updated', {
      detail: { config }
    }))
  })
}
```

## 配置测试

### 配置单元测试

```javascript
// test/config/config.test.js
import { describe, test, expect } from 'vitest'
import { ConfigLoader } from 'src/config/loader.js'
import { config_validator } from 'src/config/validator.js'

describe('Configuration', () => {
  test('loads configuration correctly', () => {
    const config = ConfigLoader.load()

    expect(config).toHaveProperty('api')
    expect(config).toHaveProperty('theme')
    expect(config.api).toHaveProperty('baseURL')
  })

  test('validates configuration', () => {
    const config = ConfigLoader.load()
    const validation = config_validator.validate(config)

    expect(validation.isValid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  test('gets nested config values', () => {
    const value = ConfigLoader.get('api.baseURL')

    expect(typeof value).toBe('string')
    expect(value.length).toBeGreaterThan(0)
  })
})
```

### 环境配置测试

```javascript
// test/config/env.test.js
import { describe, test, expect, vi } from 'vitest'

describe('Environment Configuration', () => {
  test('loads correct environment settings', () => {
    // Mock environment
    // 模拟环境
    vi.stubEnv('MODE', 'development')

    const config = ConfigLoader.load()

    expect(config.debug).toBe(true)
    expect(config.logLevel).toBe('debug')
  })

  test('validates required environment variables', () => {
    const originalEnv = process.env

    // Missing required env var
    // 缺少必需的环境变量
    delete process.env.VITE_API_BASE_URL

    expect(() => ConfigLoader.load()).toThrow()

    process.env = originalEnv
  })
})
```

## 配置最佳实践

### ✅ 应该做
- 使用环境变量进行敏感配置
- 验证配置值
- 提供合理的默认值
- 记录配置选项
- 测试配置加载

### ❌ 不应该做
- 在代码中硬编码配置值
- 暴露敏感信息
- 依赖未经验证的配置
- 过度复杂化配置结构
- 忽略配置错误

## 配置示例

### 完整配置示例

```javascript
// config/production.js
export const production_config = {
  app: {
    name: 'My Production App',
    version: '2.1.0',
  },

  api: {
    baseURL: 'https://api.production.com',
    timeout: 5000,
    retries: 2,
  },

  theme: {
    colors: {
      primary: '#007bff',
      background: '#ffffff',
    },
  },

  features: {
    enableCache: true,
    enableAnalytics: true,
  },
}
```

### 条件配置

```javascript
// Conditional configuration based on features
// 基于功能的条件配置
export const conditional_config = {
  ...base_config,

  // Only enable in development
  // 仅在开发中启用
  ...(import.meta.env.DEV && {
    debug: true,
    mockApi: true,
  }),

  // Feature-specific config
  // 功能特定配置
  ...(features.enableAnalytics && {
    analytics: {
      trackingId: 'GA-XXXXX',
      debug: import.meta.env.DEV,
    },
  }),
}
```
