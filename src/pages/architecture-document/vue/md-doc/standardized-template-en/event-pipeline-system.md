# Event Pipeline System

## Overview

The Event Pipeline is a sophisticated event handling system that provides:

1. **Centralized Event Management** - All interactions routed through pipelines
2. **Type-Safe Event Handlers** - Structured payload passing
3. **Auto-Discovery** - Event modules auto-scanned and registered
4. **Composable Pipelines** - Events can trigger other events

## Architecture

```
User Interaction (click, change, etc.)
  ↓
Component Emit
  ↓
Event Pipeline Handler
  ↓
State Mutation / API Call / Other Event
  ↓
Reactive Update
  ↓
UI Re-render
```

## Core Files

### event-pipeline.js
Registers and exposes all event pipelines:

```javascript
import { event_pipeline_register } from "src/output/common/project-common.js"

const modules = import.meta.glob("../module/event-pipeline/*.js", {
  eager: true,
})

const currentFilePath = import.meta.url

export const { all_event_pipeline, create_event_pipeline } =
  event_pipeline_register(modules, currentFilePath)
```

### Module Structure

Event handlers are organized by domain in `module/event-pipeline/module/`:

```
module/event-pipeline/module/
├── dialog.js      # Dialog-related events
├── table.js       # Table-related events
└── other.js       # General events
```

## Event Handlers

### Dialog Events (`module/event-pipeline/module/dialog.js`)

```javascript
export const handle_dialog_copy_use_confirm_click = (payload) => {
  const { all_dialog_state } = payload
  all_dialog_state.value.dialog_copy_use = true
}
```

**Triggered by**: Dialog confirm button
**Payload includes**: Dialog state, record data
**Effect**: Updates dialog visibility state

### Table Events (`module/event-pipeline/module/table.js`)

```javascript
export const handle_table_action_confirm_click = (payload, str) => {
  console.log("handle_table_action_confirm_click", payload, str)
  // Handle table action
}

export const on_table_change = (payload, { pagination, filters, sorter }) => {
  console.log("Pagination changed:", pagination)
  // Fetch new data based on pagination
}
```

**Triggered by**: Table pagination, sorting, filtering
**Parameters**: Standard event parameters from table component
**Effect**: Updates table data and pagination state

### Other Events (`module/event-pipeline/module/other.js`)

```javascript
import { handle_init_table_data } from 'src/standardization/backend-page-template/api-request/index.js'

export { handle_init_table_data }

export const handle_query_click = (payload) => {
  handle_init_table_data(payload)
}
```

**Triggered by**: Search button click
**Effect**: Initiates API call to fetch filtered data

## Event Usage Pattern

### In Components

```vue
<template>
  <q-btn
    label="查询"
    @click="all_event_pipeline.other.handle_query_click"
  />
</template>

<script setup>
import { all_event_pipeline } from "src/standardization/backend-page-template/module/event-pipeline/event-pipeline.js"
</script>
```

### Direct Call with Payload

```vue
<template>
  <q-btn
    label="Delete"
    @click="() => all_event_pipeline.table.handle_table_action_confirm_click(payload, 'delete')"
  />
</template>
```

### Passing Event Data

```javascript
// In component
const handle_table_row_click = (record) => {
  all_event_pipeline.table.handle_row_click({ record })
}

// In event handler
export const handle_row_click = (payload, data) => {
  const { current_record_to_dialog_data } = payload
  const { record } = data
  
  current_record_to_dialog_data.value = record
}
```

## Creating New Events

### Step 1: Create Handler Module

Create file `module/event-pipeline/module/new-feature.js`:

```javascript
export const handle_new_feature_action = (payload) => {
  const { table_data } = payload
  console.log('Custom action triggered')
  return { success: true }
}
```

### Step 2: Module Auto-Discovered

Assembler automatically finds it via glob pattern.

### Step 3: Use in Component

```javascript
const { handle_new_feature_action } = useContextAssembler(payload, all_atoms_assembler())

// Or via event pipeline if configured
all_event_pipeline.new_feature.handle_new_feature_action()
```

## Event Chaining

Events can trigger other events:

```javascript
export const handle_save_record = (payload) => {
  const { all_event_pipeline, table_data } = payload
  
  // Save operation
  saveToDatabase(table_data.value)
  
  // Chain: trigger refresh
  all_event_pipeline.other.handle_query_click(payload)
}
```

## Event with Custom Parameters

```javascript
// Handler with custom parameters
export const handle_delete_record = (payload, recordId, callback) => {
  const { table_data } = payload
  
  table_data.value = table_data.value.filter(item => item.id !== recordId)
  
  if(callback) callback()
}

// Usage
all_event_pipeline.table.handle_delete_record(null, recordId, () => {
  console.log('Delete complete')
})
```

## Event Lifecycle

### 1. Event Fired
```javascript
all_event_pipeline.dialog.handle_dialog_copy_use_confirm_click()
```

### 2. Handler Invoked
Event system passes:
- `payload` - Full context object
- `...args` - Additional parameters

### 3. State Mutation
Handler modifies state via payload references:
```javascript
const { all_dialog_state } = payload
all_dialog_state.value = { /* new state */ }
```

### 4. Reactivity Triggered
Vue detects ref changes and re-renders

### 5. Components Update
All components reading modified state see changes

## Best Practices

### ✅ Do
- Keep handlers focused (single responsibility)
- Use descriptive handler names (`handle_*`, `on_*`)
- Organize by domain (dialog, table, etc.)
- Pass all mutations through handlers
- Keep handlers pure when possible

### ❌ Don't
- Create side effects outside handlers
- Modify state in components directly
- Create handlers that modify other domains' state
- Chain too many events (limit depth)
- Create handlers with implicit dependencies

## Testing Events

```javascript
// Test event handler
import { handle_query_click } from './module/event-pipeline/module/other.js'

test('handle_query_click updates table data', () => {
  const payload = {
    query_form: { value: { key_word: 'test' } },
    table_data: { value: [] },
  }
  
  handle_query_click(payload)
  
  // Assert state changes
  expect(payload.table_data.value.length).toBeGreaterThan(0)
})
```

## Event Error Handling

```javascript
export const handle_api_call = (payload) => {
  const { table_data, table_loading } = payload
  
  table_loading.value = true
  
  try {
    const response = await api_service.fetch(payload)
    table_data.value = response.data
  } catch (error) {
    console.error('API Error:', error)
    // Trigger error event
    all_event_pipeline.other.handle_error(payload, error)
  } finally {
    table_loading.value = false
  }
}