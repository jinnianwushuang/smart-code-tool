# API Request Handling System

## Overview

The API request system provides a structured, testable approach to backend communication with clear separation between:

- **Request orchestration** - Command flow and state management
- **Parameter computation** - Request payload building
- **API invocation** - Service layer integration
- **Response handling** - Data transformation and state updates
- **Error management** - Failure recovery

## Architecture

```
Event (handle_query_click)
  ↓
Main Dispatcher (handle_init_table_data)
  ↓
┌─────────────────────────────────────┐
│ 1. Pre-check: Can Proceed?          │
│    - Validate state                 │
│    - Check permissions              │
│    - Guard against duplicates       │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 2. Compute Request Params           │
│    - Format data                    │
│    - Add timestamps,pagination      │
│    - Apply filters                  │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 3. Get Target API Function          │
│    - Lookup service method          │
│    - Apply strategy pattern         │
│    - Handle versions/variants       │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 4. Execute API Call                 │
│    - Set loading state              │
│    - Invoke service                 │
│    - Await response                 │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 5. Handle Response                  │
│    - Check status codes             │
│    - Transform data                 │
│    - Update state                   │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 6. Handle Errors                    │
│    - Log errors                     │
│    - Show notifications             │
│    - Retry logic                    │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ 7. Finally: Cleanup                 │
│    - Reset loading state            │
│    - Update UI                      │
│    - Trigger callbacks              │
└─────────────────────────────────────┘
  ↓
State Updated → Reactive Components Updated
```

## Main Request Handler

**File**: `/api-request/module/handle_init_table_data.js`

```javascript
import { api_service } from 'src/api/index.js'

export const handle_init_table_data = async (payload) => {
  const {} = payload

  try {
    // 1. Pre-check
    const can_proceed = check_request_eligibility(payload)
    if (!can_proceed) return

    // 2. Compute params
    const final_params = compute_request_params(payload)

    // 3. Get API function
    const api_func = get_target_api_func(payload)

    // 4. Execute request
    const response = await api_func(final_params)

    // 5. Handle response
    handle_api_response(payload, response)
  } catch (error) {
    // 6. Handle errors
    error_handler(payload, error)
  } finally {
    // 7. Cleanup
    finally_handler(payload)
  }
}
```

## Phase-by-Phase Breakdown

### Phase 1: Pre-Check

Validates if request should proceed:

```javascript
const check_request_eligibility = (payload) => {
  const { params, is_loading } = payload

  // Guard: prevent duplicate requests
  if (is_loading) {
    console.warn('Request already in progress')
    return false
  }

  // Guard: validate required parameters
  if (!params || !params.key_word) {
    console.warn('Missing required parameters')
    return false
  }

  return true
}
```

**Benefits**: Prevents race conditions, duplicate requests, invalid states

### Phase 2: Compute Request Parameters

Transforms state into API request payload:

```javascript
const compute_request_params = (payload) => {
  const { params, user_id, pagination } = payload

  return {
    // Original params
    keyword: params.key_word,
    category: params.category,

    // Pagination
    page: pagination.value.current,
    limit: pagination.value.pageSize,

    // Context
    uid: user_id,
    timestamp: Date.now(),

    // Computed
    sort_by: 'updated_at',
    sort_order: 'desc',
  }
}
```

**Benefits**: Clear transformation logic, easy to test, single location for param logic

### Phase 3: Get Target API Function

Selects appropriate API method via strategy pattern:

```javascript
const get_target_api_func = (payload) => {
  const { api_type } = payload

  const api_map = {
    fetch_users: api_service.fetchUsers,
    fetch_products: api_service.fetchProducts,
    search: api_service.search,
  }

  return api_map[api_type] || api_service.defaultFetch
}
```

**Benefits**: Flexible API selection, supports multiple endpoints, easy to extend

### Phase 4: Execute Request

Performs the async API call:

```javascript
const response = await api_func(final_params)
```

**With Loading State**:

```javascript
const { table_loading } = payload

table_loading.value = true // Set before request

try {
  const response = await api_func(final_params)
  return response
} finally {
  table_loading.value = false // Always reset
}
```

### Phase 5: Handle Success Response

Processes successful responses:

```javascript
const handle_api_response = (payload, response) => {
  const { table_data, pagination } = payload

  if (response.code === 200) {
    success_handler(payload, response.data)
  } else {
    error_handler(payload, response.message)
  }
}

const success_handler = (payload, data) => {
  const { table_data, pagination } = payload

  // Update table data
  table_data.value = data.rows || []

  // Update pagination
  pagination.value.total = data.total
  pagination.value.current = data.page

  // Show success message
  console.log('Data loaded successfully')
}
```

### Phase 6: Handle Errors

Manages failures:

```javascript
const error_handler = (payload, message) => {
  const { table_data } = payload

  console.error('Request failed:', message)

  // Show error notification
  notify.error('Failed to load data')

  // Optional: Reset to last known state
  // table_data.value = [...cached_data]

  // Optional: Retry logic
  // retry_count++
}
```

### Phase 7: Finally - Cleanup

Post-request cleanup:

```javascript
const finally_handler = (payload) => {
  const { table_loading } = payload

  // Ensure loading state reset
  table_loading.value = false

  // Log analytics
  console.log('Request completed')

  // Trigger callbacks
  emit('data-loaded')
}
```

## API Request Module

**File**: `/api-request/index.js`

Aggregates all request handlers:

```javascript
import { common_assemble_function } from 'src/output/common/project-common.js'

// Auto-discover module/*.js handlers
const modules = import.meta.glob('./module/*.js', { eager: true })

// Export aggregated handlers
export default common_assemble_function(modules)
```

**Usage**:

```javascript
import { handle_init_table_data } from 'src/standardization/backend-page-template/api-request/index.js'

// In event handler
export const handle_query_click = (payload) => {
  handle_init_table_data(payload)
}
```

## Creating New API Requests

### Step 1: Create Request Handler

Create `api-request/module/handle_search_users.js`:

```javascript
import { api_service } from 'src/api/index.js'

export const handle_search_users = async (payload) => {
  const { search_query, filters } = payload

  try {
    const params = {
      q: search_query.value,
      ...filters.value,
      timestamp: Date.now(),
    }

    const response = await api_service.searchUsers(params)

    if (response.code === 200) {
      // Update state
      payload.search_results.value = response.data.users
      return response.data
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    payload.search_error.value = error.message
    throw error
  } finally {
    payload.search_loading.value = false
  }
}
```

### Step 2: Use in Event Pipeline

In `module/event-pipeline/module/search.js`:

```javascript
import { handle_search_users } from 'src/standardization/backend-page-template/api-request/index.js'

export const handle_search_click = (payload) => {
  handle_search_users(payload)
}
```

### Step 3: Trigger from Component

```vue
<template>
  <q-btn @click="ALL_EVENT_PIPELINE.search.handle_search_click" />
</template>
```

## Advanced Patterns

### Pagination + Sorting + Filtering

```javascript
const compute_request_params = (payload) => {
  const { pagination, sort_config, filters } = payload

  return {
    // Pagination
    page: pagination.value.current,
    page_size: pagination.value.pageSize,

    // Sorting
    sort_by: sort_config.value.column,
    sort_order: sort_config.value.order,

    // Filtering
    ...filters.value,

    // Metadata
    timestamp: Date.now(),
    request_id: generateRequestId(),
  }
}
```

### Request With Retry Logic

```javascript
const executeWithRetry = async (apiFunc, params, maxRetries = 3) => {
  let lastError

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiFunc(params)
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await delay(1000 * (i + 1)) // Exponential backoff
      }
    }
  }

  throw lastError
}
```

### Request With Caching

```javascript
const requestCache = new Map()

const getCachedOrFetch = async (api_func, params, cacheKey) => {
  // Check cache
  if (requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey)
    if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data
    }
  }

  // Fetch fresh data
  const response = await api_func(params)

  // Cache result
  requestCache.set(cacheKey, {
    data: response,
    timestamp: Date.now(),
  })

  return response
}
```

### Parallel Requests

```javascript
export const handle_init_page_data = async (payload) => {
  const { table_data, stats_data } = payload

  try {
    const [tableResponse, statsResponse] = await Promise.all([
      api_service.fetchTableData(),
      api_service.fetchStats(),
    ])

    table_data.value = tableResponse.data
    stats_data.value = statsResponse.data
  } catch (error) {
    console.error('Failed to load page data:', error)
  }
}
```

### Cancellable Requests

```javascript
const requestControllers = new Map()

export const handle_search_users = async (payload) => {
  const { search_query } = payload

  // Cancel previous request
  if (requestControllers.has('search_users')) {
    requestControllers.get('search_users').abort()
  }

  // Create new controller
  const controller = new AbortController()
  requestControllers.set('search_users', controller)

  try {
    const response = await api_service.searchUsers(
      { q: search_query.value },
      { signal: controller.signal },
    )

    payload.search_results.value = response.data
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Search failed:', error)
    }
  }
}
```

## Best Practices

### ✅ Do

- Pre-validate before making requests
- Transform params clearly in separate function
- Use strategy/factory pattern for API selection
- Always include try-catch-finally
- Reset loading states in finally block
- Handle both HTTP errors and business logic errors
- Log request lifecycle for debugging

### ❌ Don't

- Make requests directly from components
- Mix API logic with event handlers
- Forget error handling
- Leave loading state hanging
- Make synchronous API calls
- Handle multiple business domains in one request
- Ignore network timeouts

## Testing API Handlers

```javascript
test('handle_init_table_data fetches and updates state', async () => {
  const payload = {
    table_data: { value: [] },
    pagination: { value: { current: 1 } },
    table_loading: { value: false },
  }

  // Mock API
  jest.spyOn(api_service, 'fetchTable').mockResolvedValue({
    code: 200,
    data: { rows: [{ id: 1 }], total: 10 },
  })

  await handle_init_table_data(payload)

  expect(payload.table_data.value).toEqual([{ id: 1 }])
  expect(payload.pagination.value.total).toBe(10)
})
```
