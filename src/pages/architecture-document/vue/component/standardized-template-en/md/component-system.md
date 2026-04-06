# Component System

## Overview

The template uses three main Vue components that demonstrate the pluggable architecture:

1. **DialogWrapper** - Manages modal dialogs
2. **TableMainArea** - Displays tabular data with pagination
3. **TopSearchArea** - Provides search/filter interface

## Component Architecture

### Component Wrapper Pattern

Each component follows a consistent pattern:

```vue
<template>
  <WrappedComponent
    :config="wrapper_config"
    :all_singleton="all_singleton"
    :all_event_pipeline="all_event_pipeline"
    :all_config="all_config"
  />
</template>

<script setup>
// Import central service modules
const { all_singleton } = all_singleton; // State
const { all_event_pipeline } = all_event_pipeline; // Events
const { wrapper_config } = wrapper_config; // Configuration
</script>
```

This pattern ensures:
- **Consistent Props** - All components receive same prop structure
- **Shared State** - All components access singleton state
- **Unified Events** - Centralized event handling
- **Configuration-Driven** - Behavior controlled by config

### 1. DialogWrapper Component

**Location**: `/component/dialog-wrapper/`

**Purpose**: Manages modal dialog displays with pluggable dialog types

**Files**:
- `dialog-wrapper.vue` - Main wrapper component
- `config/config.js` - Dialog configuration and auto-loading
- `component/dialog-copy-use/` - Example dialog implementation

**Configuration** (`config.js`):
```javascript
import { common_assemble_component } from 'src/output/common/project-common.js'
import { markRaw } from 'vue'

// Auto-discover dialog components
const modules = import.meta.glob('../component/*/*.vue', { eager: true })
const components = common_assemble_component(modules)
const { DialogCopyUse } = components

// Define available dialogs
export const dialog_wrapper_config = [
  { 
    name: '警告弹窗', 
    model_key: 'dialog_copy_use', 
    component: markRaw(DialogCopyUse) 
  },
  {
    name: '确认弹窗',
    model_key: 'public_dialog_copy_use',
    component: markRaw(PublicDialogCopyUse),
  },
]
```

**State Management**:
```javascript
// In state/singleton/dialog.js
export const all_dialog_state = ref({})
export const current_record_to_dialog_data = ref({})
```

**Adding a New Dialog**:
1. Create new `.vue` file in `component/dialog-wrapper/component/`
2. Component automatically discovered by glob
3. Add entry to `dialog_wrapper_config` array
4. Trigger dialog by setting `all_dialog_state[model_key] = true`

### 2. TableMainArea Component

**Location**: `/component/table-main-area/`

**Purpose**: Displays paginated tabular data with custom cell rendering

**Files**:
- `table-main-area.vue` - Main table component
- `config/config.js` - Column definitions and component assembly
- `component/table-td-copy-use/` - Example custom cell component

**Column Configuration** (`config.js`):
```javascript
const { TableTdCopyUse } = components

export const columns = [
  {
    name: 'index',
    dataIndex: 'index',
    key: 'index',
    customRender: ({ text, record, index }) => index + 1,
  },
  {
    name: 'Name',
    dataIndex: 'name',
    key: 'name',
    customRender: (obj) => h(TableTdCopyUse, obj), // Custom component
  },
  {
    name: 'Age',
    dataIndex: 'age',
    key: 'age',
    customRender: ({ text, record, index }) => text + '岁',
  },
]
```

**State Management**:
```javascript
// In state/singleton/table.js
export const table_data = ref([])
export const table_loading = ref(false)
export const selected_data = ref([])
export const pagination = ref({ current: 1, pageSize: 10, total: 0 })
```

**Event Handling**:
```javascript
// In module/event-pipeline/module/table.js
export const on_table_change = (payload, { pagination, filters, sorter }) => {
  // Triggered on pagination/sorting change
}

export const handle_table_action_confirm_click = (payload, str) => {
  // Triggered by action buttons
}
```

**Adding a Custom Cell Component**:
1. Create `.vue` component in `component/table-main-area/component/table-td-copy-use/`
2. Component receives `{ text, record, index }` props
3. Add to columns config using `customRender`
4. Component auto-discovered and injected

### 3. TopSearchArea Component

**Location**: `/component/top-search-area/`

**Purpose**: Search/filter interface for table queries

**Features**:
- Input fields for search criteria
- Query button triggering API calls
- Direct state mutations

**State Integration**:
```javascript
// In state/singleton/dialog.js
export const query_form = ref({})

// Usage in TopSearchArea
<template>
  <q-input v-model="query_form.key_word" label="关键字" />
  <q-btn @click="all_event_pipeline.other.handle_query_click" label="查询" />
</template>
```

## Component Communication Flow

### Props Flow (Parent → Child)
```
index.vue
  ↓ passes config/state/events
DialogWrapper → DialogCopyUse (receives all_singleton, all_event_pipeline)
TableMainArea → TableTdCopyUse (receives record, index, text)
TopSearchArea → (uses shared state)
```

### Event Flow (Child → Event Pipeline)
```
User clicks button
  ↓
Component emits event via all_event_pipeline
  ↓
Event handler in module/event-pipeline/
  ↓
State update via all_singleton
  ↓
Reactive propagation to all components
```

### State Update Flow
```
API response
  ↓
success_handler updates all_singleton.table_data
  ↓
Vue reactivity detected
  ↓
Table re-renders with new data
  ↓
Dependent components update via computed properties
```

## Dynamic Component Assembly

### How Components Are Auto-Loaded

**In dialog wrapper config**:
```javascript
const modules = import.meta.glob('../component/*/*.vue', { eager: true })
const components = common_assemble_component(modules)
```

**What happens**:
1. Glob finds all `.vue` files matching pattern
2. `common_assemble_component()` processes them
3. Components keyed by filename
4. Components available as `components.DialogCopyUse`

**Benefits**:
- Add new dialog → automatic discovery
- No manual imports needed
- Minimal build overhead with eager loading

## Best Practices

### ✅ Do
- Keep components focused on single responsibility
- Use provided props (config, state, events)
- Delegate business logic to event pipelines
- Use `markRaw()` for heavy components

### ❌ Don't
- Create local component state (use singleton instead)
- Emit custom events (use event pipeline instead)
- Import other components directly
- Handle API calls in components

## Examples

### Creating a New Custom Table Cell Component

```vue
<!-- component/table-main-area/component/custom-cell/custom-cell.vue -->
<template>
  <div class="custom-cell">
    <span @click="handle_click">{{ text }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  text: String,
  record: Object,
  index: Number,
})

const emit = defineEmits(['cell-click'])

const handle_click = () => {
  emit('cell-click', props.record)
}
</script>
```

Then in `config/config.js`:
```javascript
const { CustomCell } = components

export const columns = [
  {
    name: 'Custom',
    dataIndex: 'custom_field',
    customRender: (obj) => h(CustomCell, obj),
  },
]
```

### Creating a New Dialog Type

```vue
<!-- component/dialog-wrapper/component/confirm-dialog/confirm-dialog.vue -->
<template>
  <q-dialog v-model="all_dialog_state[model_key]">
    <q-card>
      <q-card-section>
        <div class="text-h6">Confirm Action</div>
      </q-card-section>
      <q-card-actions>
        <q-btn
          label="Confirm"
          @click="all_event_pipeline.dialog.handle_confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
const model_key = 'confirm_dialog'
const props = defineProps({
  all_singleton: Object,
  all_event_pipeline: Object,
})

const { all_dialog_state } = props.all_singleton
</script>
```

Then in `dialog-wrapper.vue` config:
```javascript
export const dialog_wrapper_config = [
  {
    name: 'Confirm Dialog',
    model_key: 'confirm_dialog',
    component: markRaw(ConfirmDialog),
  },
]