# State Management System

## Overview

The template uses a sophisticated state management system combining Vue 3's reactive primitives with modular organization. State is split into three categories:

1. **Singleton** - Shared across all component instances
2. **Multiton** - Per-instance state
3. **Computed** - Derived state

## Architecture

```
┌─────────────────────────────────────┐
│     useContextAssembler()           │
├─────────────────────────────────────┤
│ Receives payload with:              │
│ - props                             │
│ - income_pipeline                   │
│ - wrap_payload                      │
│ - base_payload                      │
└────────┬────────────────────────────┘
         │
    ┌────▼────────────────────────┐
    │  Assembler Initialization   │
    └────┬───────────────────┬────┘
         │                   │
    ┌────▼────────┐  ┌──────▼───────┐
    │  Singleton  │  │ Computed     │
    │   State     │  │ Properties   │
    └────┬────────┘  └──────┬───────┘
         │                  │
    ┌────▼──────────────────▼───┐
    │  Return Composed Context   │
    │  {                         │
    │    user_info,             │
    │    table_data,            │
    │    pagination,            │
    │    ...handlers            │
    │  }                         │
    └────────────────────────────┘
```

## 1. Singleton State

### Definition

Singleton state is **shared globally** across the entire page. A single instance is created and persists throughout the page's lifetime.

### Location

`/state/singleton/`

### Files

**singleton.js** - Aggregates all singleton modules:

```javascript
import { common_assemble_singleton } from 'src/output/common/project-common.js'
import * as dialog_copy_use_singleton from 'src/components/dialog/dialog-copy-use/state/singleton.js'

const modules = import.meta.glob('./singleton/*.js', { eager: true })

export const { all_singleton, init_all_singleton } = common_assemble_singleton(
  modules,
  dialog_copy_use_singleton,
)
```

**singleton/table.js** - Table data state:

```javascript
import { ref } from 'vue'

const default_pagination = {
  current: 1,
  pageSize: 10,
  total: 0,
}

export const table_data = ref([])
export const table_loading = ref(false)
export const selected_data = ref([])
export const pagination = ref({ ...default_pagination })

export const init_singleton = () => {
  table_data.value = []
  selected_data.value = []
  table_loading.value = false
  pagination.value = { ...default_pagination }
}
```

**singleton/dialog.js** - Dialog state:

```javascript
import { ref } from 'vue'

export const all_dialog_state = ref({})
export const query_form = ref({})
export const current_record_to_dialog_data = ref({})

export const init_singleton = () => {
  all_dialog_state.value = {}
  query_form.value = {}
  current_record_to_dialog_data.value = {}
}
```

**singleton/other.js** - Other shared state:

```javascript
import { ref } from 'vue'

export const user_info = ref({ name: 'Guest' })

export const init_singleton = () => {
  user_info.value = { name: 'Guest' }
}
```

### Access Pattern

In components:

```javascript
import { all_singleton } from "src/standardization/backend-page-template/state/singleton.js"

const { table_data, pagination, user_info } = all_singleton

// Use in template
<div>{{ user_info }}</div>
<div>Total: {{ table_data.length }}</div>
```

In event handlers:

```javascript
// Event handlers receive payload with singleton state injected
export const handle_query_click = (payload) => {
  const { table_data, pagination } = payload

  table_data.value = []
  pagination.value.current = 1
}
```

### Singleton Lifecycle

1. **Creation** - `all_singleton` created on first import
2. **Initialization** - `init_singleton()` called to reset state
3. **Persistence** - State retained as component instance changes
4. **Cleanup** - `init_singleton()` called when page destroyed

## 2. Multiton State

### Definition

Multiton state is **per-instance**, created fresh for each component instance. Each instance has its own copy.

### Location

`/state/multiton.js`

### Example

```javascript
import { ref } from 'vue'

export const create_multiton_variable = (payload) => {
  const current_time = ref(new Date())

  return { current_time }
}
```

### Usage

Each component invoking `useContextAssembler()` gets its own `current_time`:

```javascript
// Component A
const { current_time: componentA_time } = useContextAssembler(payload, assembler)

// Component B
const { current_time: componentB_time } = useContextAssembler(payload, assembler)

// componentA_time and componentB_time are independent refs
```

### When to Use

- Per-component timing or counters
- Instance-specific state that shouldn't be shared
- Temporary data that shouldn't persist

## 3. Computed State

### Definition

Computed properties are **derived values** calculated from singleton or multiton state using Vue's `computed()`.

### Location

`/state/computed.js`

### Example

```javascript
import { computed } from 'vue'

export const create_computed_variable = (payload) => {
  const demo_computed = computed(() => {
    return 'demo_computed'
  })

  return { demo_computed }
}
```

### Advanced Example

```javascript
import { computed } from 'vue'

export const create_computed_variable = (payload) => {
  const { table_data, user_info } = payload

  // Computed property: row count
  const visible_row_count = computed(() => {
    return table_data.value.length
  })

  // Computed property: is user admin
  const is_admin = computed(() => {
    return user_info.value.role === 'admin'
  })

  // Computed property: can user delete
  const can_delete = computed(() => {
    return is_admin.value && visible_row_count.value > 0
  })

  return {
    visible_row_count,
    is_admin,
    can_delete,
  }
}
```

### Benefits

- **Reactive Tracking** - Automatically updates when dependencies change
- **Memoized** - Computed only when dependencies change
- **Type-Safe** - Clear input/output contracts
- **Testable** - Pure functions

## Configuration State

### Location

`/state/config.js`

### Purpose

Store app-level configuration options

### Example

```javascript
export const demo_options = [
  { key: 'option1', value: 'value1' },
  { key: 'option2', value: 'value2' },
]
```

## State Payload Structure

### What is Payload?

Payload is the context object passed through the assembler, containing:

```javascript
const payload = {
  // Vue component props
  props,

  // Singleton state
  table_data,
  pagination,
  user_info,
  all_dialog_state,
  query_form,
  current_record_to_dialog_data,

  // Multiton state
  current_time,

  // Computed properties
  visible_row_count,
  is_admin,
  can_delete,

  // Emit functions
  emit,

  // Config
  income_pipeline,
  wrap_payload,
}
```

### Access in Handlers

```javascript
export const handle_query_click = (payload) => {
  const { table_data, query_form, pagination } = payload

  // Use state
  table_data.value = newData

  // API call with current state
  api_service.query({
    keyword: query_form.value.key_word,
    page: pagination.value.current,
  })
}
```

## State Mutation Patterns

### Pattern 1: Direct Mutation

```javascript
export const handle_reset = (payload) => {
  const { table_data, pagination } = payload

  table_data.value = []
  pagination.value.current = 1
}
```

### Pattern 2: Computed Derived State

```javascript
const total_count = computed(() => {
  return table_data.value.reduce((sum, item) => sum + item.count, 0)
})
```

### Pattern 3: Conditional Updates

```javascript
export const handle_api_response = (payload, response) => {
  const { table_data, pagination } = payload

  if (response.code === 200) {
    table_data.value = response.data.rows
    pagination.value.total = response.data.total
  }
}
```

## Reactive Dependencies

### Watchers for Side Effects

```javascript
// In cleanup_effect_watcher
export const cleanup_effect_watcher = (payload) => {
  const { current_time } = payload

  return [
    watch(current_time, (new_time) => {
      console.log('Time changed:', new_time)
    }),
  ]
}
```

### Computed with Multiple Dependencies

```javascript
const can_submit = computed(() => {
  const hasData = table_data.value.length > 0
  const isValid = validation_result.value === true
  const notLoading = !table_loading.value

  return hasData && isValid && notLoading
})
```

## State Initialization & Reset

### Initialization

```javascript
import { all_singleton } from './state/singleton.js'

// In lifecycle hook
export const lifecycle_onBeforeMount = (payload) => {
  const { init_singleton } = payload
  init_singleton() // Reset all singleton state
}
```

### Reset Pattern

```javascript
export const handle_reset_form = (payload) => {
  const { query_form } = payload

  query_form.value = {
    key_word: '',
    category: '',
    date_range: [],
  }
}
```

## Best Practices

### ✅ Do

- Use singleton for truly global state (user info, shared config)
- Use multiton for component-scoped temporary state
- Use computed for derived calculations
- Keep state structure flat and normalized
- Document state shape and mutations

### ❌ Don't

- Mix singleton and local component state
- Create computed that reads sibling computed (create merged computed instead)
- Mutate arrays/objects deeply without reassigning
- Create tightly coupled state dependencies
