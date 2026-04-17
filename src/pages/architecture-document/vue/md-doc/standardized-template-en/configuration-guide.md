# Configuration Guide

## Overview

Configuration in the backend-page-template is centralized and explicit, making it easy to customize behavior without modifying components.

## Configuration Files

### Main Configuration

**File**: `state/config.js`

```javascript
export const demo_options = [];
```

Extend for your needs:

```javascript
export const table_config = {
  pageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  defaultSort: 'updated_at',
  defaultSortOrder: 'desc',
}

export const api_config = {
  baseURL: '/api',
  timeout: 30000,
  retryCount: 3,
}

export const ui_config = {
  theme: 'light',
  showLoadingBar: true,
  showNotifications: true,
  animationDuration: 300,
}
```

### Component Configuration

**Dialog Configuration**: `component/dialog-wrapper/config/config.js`

```javascript
export const dialog_wrapper_config = [
  {
    name: 'Dialog Name',
    model_key: 'dialog_id',
    component: markRaw(DialogComponent),
    props: {  // Optional: pass default props
      title: 'Dialog Title',
      size: 'md',
    },
  },
]
```

**Table Configuration**: `component/table-main-area/config/config.js`

```javascript
export const columns = [
  {
    name: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: '200px',
    sortable: true,
    customRender: (obj) => h(CustomCell, obj),
  },
  // ... more columns
]

export const table_default_config = {
  size: 'small',
  bordered: true,
  striped: true,
  pagination: {
    pageSize: 20,
    showSizeChanger: true,
  },
}
```

## Feature Flags

### Environment-Based Configuration

```javascript
// In assembler.js or config.js
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

export const feature_flags = {
  ENABLE_ADVANCED_FILTERS: !isProd,
  ENABLE_ANALYTICS: isProd,
  ENABLE_BULK_OPERATIONS: !isDev,
  ENABLE_DEBUG_MODE: isDev,
}
```

### Runtime Feature Flags

```javascript
export const runtime_flags = ref({
  show_export: true,
  show_import: false,
  show_analytics: false,
})

// Toggle at runtime
export const toggle_feature = (payload, featureName) => {
  runtime_flags.value[featureName] = !runtime_flags.value[featureName]
}
```

### Using Feature Flags

In components:

```javascript
import { feature_flags, runtime_flags } from 'src/standardization/backend-page-template/state/config.js'

<q-btn
  v-if="feature_flags.ENABLE_EXPORT"
  label="Export"
/>
```

In event handlers:

```javascript
export const handle_action_click = (payload) => {
  if (!feature_flags.ENABLE_ADVANCED_FILTERS) return
  
  // Action logic
}
```

## Theming & Styling

### CSS Variables

Create `css/theme.scss`:

```scss
// Light theme
:root {
  --color-primary: #1976d2;
  --color-secondary: #26a69a;
  --color-danger: #f44336;
  --color-success: #4caf50;
  --color-warning: #ff9800;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  --border-radius: 4px;
  --box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

// Dark theme
[data-theme="dark"] {
  --color-primary: #90caf9;
  --color-secondary: #80cbc4;
  // ... more colors
}
```

### Using Theme Variables

```scss
// In components
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}
```

### Theme Switching

```javascript
export const theme = ref('light')

export const set_theme = (payload, themeName) => {
  theme.value = themeName
  document.documentElement.setAttribute('data-theme', themeName)
}
```

## API Configuration

### Service Configuration

Create `api-request/config.js`:

```javascript
export const api_endpoints = {
  users: '/api/users',
  products: '/api/products',
  orders: '/api/orders',
  analytics: '/api/analytics',
}

export const api_timeout = 30000
export const api_retry_count = 3
export const api_cache_duration = 5 * 60 * 1000  // 5 minutes
```

### Request Interceptors

```javascript
// In api-request/module/
export const create_request_config = (payload) => {
  return {
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      'Authorization': `Bearer ${payload.auth_token}`,
      'X-Request-ID': generateRequestId(),
    },
    timeout: 30000,
  }
}
```

## State Defaults

### Initialize Defaults

`state/singleton/table.js`:

```javascript
const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 10,
  total: 0,
}

const DEFAULT_FILTERS = {
  status: 'all',
  category: 'all',
  dateRange: [],
}

export const table_data = ref([])
export const pagination = ref({ ...DEFAULT_PAGINATION })
export const filters = ref({ ...DEFAULT_FILTERS })

export const init_singleton = () => {
  table_data.value = []
  pagination.value = { ...DEFAULT_PAGINATION }
  filters.value = { ...DEFAULT_FILTERS }
}
```

## Localization

### i18n Configuration

Create `config/i18n.js`:

```javascript
export const translations = {
  en: {
    'dialog.title': 'Confirm Action',
    'dialog.confirm': 'Confirm',
    'dialog.cancel': 'Cancel',
    'table.loading': 'Loading...',
    'table.empty': 'No data',
    'error.network': 'Network error',
  },
  zh: {
    'dialog.title': '确认操作',
    'dialog.confirm': '确认',
    'dialog.cancel': '取消',
    'table.loading': '加载中...',
    'table.empty': '无数据',
    'error.network': '网络错误',
  },
}

export const current_locale = ref('en')

export const t = (key) => {
  return translations[current_locale.value][key] || key
}
```

### Using Translations

```javascript
const message = t('dialog.confirm')
```

## Advanced Configuration

### Multi-Environment Setup

```javascript
// config/environment.js
const env_config = {
  development: {
    api_url: 'http://localhost:3000',
    log_level: 'debug',
    cache_enabled: false,
  },
  staging: {
    api_url: 'https://staging-api.example.com',
    log_level: 'info',
    cache_enabled: true,
  },
  production: {
    api_url: 'https://api.example.com',
    log_level: 'error',
    cache_enabled: true,
  },
}

export const current_env_config = env_config[import.meta.env.MODE]
```

### Conditional Configuration Loading

```javascript
const modules = import.meta.glob([
  '../module/**/*.js',
  '../state/*.js',
  // Load environment-specific configs
  ...(import.meta.env.DEV ? ['../config/dev/**/*.js'] : []),
  ...(import.meta.env.PROD ? ['../config/prod/**/*.js'] : []),
], { eager: true })
```

### User Preferences

```javascript
// state/singleton/preferences.js
export const user_preferences = ref({
  theme: 'light',
  language: 'en',
  itemsPerPage: 10,
  autoRefresh: false,
})

export const save_preferences = () => {
  localStorage.setItem('user_preferences', JSON.stringify(user_preferences.value))
}

export const load_preferences = () => {
  const saved = localStorage.getItem('user_preferences')
  if (saved) {
    user_preferences.value = JSON.parse(saved)
  }
}
```

## Configuration Best Practices

### ✅ Do
- Centralize all configuration in `state/config.js`
- Use feature flags for experimental features
- Document configuration options
- Provide sensible defaults
- Make configuration environment-aware

### ❌ Don't
- Hard-code values in components
- Store configuration in multiple places
- Use magic numbers or strings
- Skip feature flag protection
- Over-configure simple features

## Configuration Schema

```javascript
/**
 * Complete configuration schema for backend-page-template
 */
export const configuration_schema = {
  table: {
    pageSize: Number,      // Default page size
    pageSizeOptions: Array, // Available page sizes
    defaultSort: String,    // Default sort column
    defaultSortOrder: String, // 'asc' | 'desc'
    virtualScroll: Boolean, // Enable virtual scrolling
    maxHeight: String,      // Table max-height CSS
    striped: Boolean,       // Row striping
    bordered: Boolean,      // Show borders
  },
  
  api: {
    baseURL: String,        // Base API URL
    timeout: Number,        // Request timeout in ms
    retryCount: Number,     // Failed request retries
    cacheEnabled: Boolean,  // Enable response caching
    cacheDuration: Number,  // Cache duration in ms
  },
  
  ui: {
    theme: String,          // 'light' | 'dark'
    locale: String,         // Language code
    showLoadingBar: Boolean,
    animationDuration: Number,
    notificationPosition: String, // 'top' | 'bottom' | 'center'
  },
  
  features: {
    enableExport: Boolean,
    enableImport: Boolean,
    enableAdvancedFilters: Boolean,
    enableBulkOperations: Boolean,
  },
}
```