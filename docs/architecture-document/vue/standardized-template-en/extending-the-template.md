# Extending the Template Guide

## Overview

The backend-page-template is designed for extensibility. This guide covers common extension scenarios and best practices.

## Adding New Features

### Scenario 1: Add a New State Field

**Goal**: Add user role information to track

**Steps**:

1. Create `state/singleton/permissions.js`:

```javascript
import { ref } from 'vue'

export const user_role = ref('guest')
export const user_permissions = ref([])

export const init_singleton = () => {
  user_role.value = 'guest'
  user_permissions.value = []
}
```

2. It's automatically discovered and aggregated by `state/singleton.js`

3. Access in components:

```javascript
const { user_role, user_permissions } = all_singleton
```

4. Use in computed properties:

```javascript
const can_edit = computed(() => {
  return user_permissions.value.includes('edit')
})
```

### Scenario 2: Add a New Event Handler

**Goal**: Handle user role changes

**Steps**:

1. Create `module/event-pipeline/module/user.js`:

```javascript
export const handle_role_changed = (payload, newRole) => {
  const { user_role, user_permissions } = payload

  user_role.value = newRole

  // Update permissions based on role
  const permissionMap = {
    admin: ['create', 'read', 'update', 'delete'],
    editor: ['create', 'read', 'update'],
    viewer: ['read'],
  }

  user_permissions.value = permissionMap[newRole] || []
}
```

2. Use in components:

```javascript
<q-select
  :options="['admin', 'editor', 'viewer']"
  @update:model-value="(role) => ALL_EVENT_PIPELINE.user.handle_role_changed(role)"
/>
```

### Scenario 3: Add a New Component

**Goal**: Add an export/import dialog

**Steps**:

1. Create `component/export-dialog/export-dialog.vue`:

```vue
<template>
  <q-dialog v-model="all_dialog_state[model_key]">
    <q-card>
      <q-card-section>
        <div class="text-h6">Export Data</div>
        <q-select v-model="export_format" :options="['CSV', 'JSON', 'Excel']" label="Format" />
      </q-card-section>
      <q-card-actions>
        <q-btn label="Export" @click="ALL_EVENT_PIPELINE.export.handle_export_click" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
const model_key = 'export_dialog'
const props = defineProps({
  all_singleton: Object,
  ALL_EVENT_PIPELINE: Object,
})

const export_format = ref('CSV')
const { all_dialog_state } = props.all_singleton
</script>
```

2. Update `component/dialog-wrapper/config/config.js`:

```javascript
const { ExportDialog } = components

export const dialog_wrapper_config = [
  // ... existing dialogs
  {
    name: 'Export Dialog',
    model_key: 'export_dialog',
    component: markRaw(ExportDialog),
  },
]
```

3. Create state for export in `state/singleton/export.js`:

```javascript
import { ref } from 'vue'

export const export_format = ref('CSV')
export const exported_data = ref(null)

export const init_singleton = () => {
  export_format.value = 'CSV'
  exported_data.value = null
}
```

4. Create API handler `api-request/module/handle_export_data.js`:

```javascript
export const handle_export_data = async (payload) => {
  const { table_data, export_format } = payload

  const data = table_data.value
  let output

  if (export_format.value === 'CSV') {
    output = convertToCSV(data)
  } else if (export_format.value === 'JSON') {
    output = JSON.stringify(data, null, 2)
  } else if (export_format.value === 'Excel') {
    output = convertToExcel(data)
  }

  downloadFile(output, `export.${getExtension(export_format.value)}`)
}
```

5. Create event handler `module/event-pipeline/module/export.js`:

```javascript
import { handle_export_data } from 'src/standardization/backend-page-template/api-request/index.js'

export const handle_export_click = (payload) => {
  handle_export_data(payload)
}
```

### Scenario 4: Add API Integration

**Goal**: Fetch user profile on mount

**Steps**:

1. Create `api-request/module/handle_fetch_user_profile.js`:

```javascript
import { api_service } from 'src/api/index.js'

export const handle_fetch_user_profile = async (payload) => {
  const { user_info } = payload

  try {
    const response = await api_service.getUserProfile()

    if (response.code === 200) {
      user_info.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
  }
}
```

2. Update lifecycle `module/lifecycle/lifecycle.js`:

```javascript
import { handle_fetch_user_profile } from '../../api-request/index.js'

export const lifecycle_onMounted = (payload) => {
  handle_fetch_user_profile(payload)
  handle_init_table_data(payload)
}
```

### Scenario 5: Add Custom Hook/Filter

**Goal**: Auto-refresh table every 30 seconds

**Steps**:

1. Create `module/effect/refresh.js`:

```javascript
export const cleanup_effect_refresh = (payload) => {
  const { handle_init_table_data } = payload

  // Auto-refresh every 30 seconds
  const intervalId = setInterval(() => {
    handle_init_table_data(payload)
  }, 30000)

  return [intervalId]
}
```

2. It's automatically picked up by cleanup system

## Removing/Disabling Features

### Remove a Component

Simply delete the component file, e.g., delete `component/top-search-area/top-search-area.vue`

### Disable API Calls

```javascript
const check_request_eligibility = (payload) => {
  // ... existing checks

  // Disable data loading
  if (import.meta.env.VITE_DISABLE_API === 'true') {
    return false
  }

  return true
}
```

### Conditional Module Loading

```javascript
const modules = import.meta.glob(
  [
    '../module/**/*.js',
    '../state/*.js',
    // Load environment-specific configs
    ...(isAdminMode ? ['../admin-modules/**/*.js'] : []),
  ],
  { eager: true },
)
```

## Customization Patterns

### Pattern 1: Override Handler

Create a new version of an existing handler:

```javascript
// Instead of modifying existing, create new
export const handle_init_table_data_v2 = async (payload) => {
  // Custom implementation
}
```

Then use in event:

```javascript
export const handle_query_click = (payload) => {
  if (useAdvancedSearch) {
    handle_init_table_data_v2(payload)
  } else {
    handle_init_table_data(payload)
  }
}
```

### Pattern 2: Wrap Existing Functionality

```javascript
export const handle_query_click_with_validation = (payload) => {
  const { query_form } = payload

  // Add validation
  if (!validates(query_form.value)) {
    notify.error('Invalid search parameters')
    return
  }

  // Call original
  handle_query_click(payload)
}
```

### Pattern 3: Chain Multiple Operations

```javascript
export const handle_save_and_refresh = async (payload) => {
  // Save
  await handle_save_record(payload)

  // Refresh
  await handle_init_table_data(payload)

  // Notify
  notify.success('Data saved and refreshed')
}
```

## Complex Extensions

### Multi-Tab Support

Create `state/singleton/tabs.js`:

```javascript
export const active_tab = ref('table')
export const tab_data = ref({
  table: [],
  analytics: {},
  settings: {},
})

export const init_singleton = () => {
  active_tab.value = 'table'
  tab_data.value = { table: [], analytics: {}, settings: {} }
}
```

Create event handler:

```javascript
export const handle_tab_change = (payload, tabName) => {
  const { active_tab, tab_data } = payload
  active_tab.value = tabName

  // Load tab-specific data
  load_tab_data(tabName, payload)
}
```

### Multi-Page Navigation

```javascript
// In state
export const current_page_id = ref('home')

// In event
export const handle_navigate_to_page = (payload, pageId) => {
  const { current_page_id } = payload
  current_page_id.value = pageId

  // Load page data
  load_page_data(pageId, payload)
}
```

### Advanced Filtering

```javascript
export const cleanup_effect_watcher = (payload) => {
  const { query_form, table_data, filtered_data } = payload

  return [
    watch(
      () => query_form.value,
      (newForm) => {
        // Complex filtering logic
        filtered_data.value = applyMultipleFilters(table_data.value, newForm)
      },
      { deep: true },
    ),
  ]
}
```

## Performance Optimization

### Lazy Load Modules

```javascript
const modules = import.meta.glob('../module/**/*.js', {
  eager: false, // Lazy load
})
```

### Memoize Computed Properties

```javascript
const expensive_computed = computed(() => {
  return table_data.value.map((item) => ({
    ...item,
    display_name: formatName(item.first_name, item.last_name),
    age_group: computeAgeGroup(item.age),
  }))
})
```

### Virtual Scrolling for Large Datasets

```vue
<template>
  <q-virtual-scroll :items="table_data" virtual-scroll-item-size="50">
    <template v-slot="props">
      <table-row :data="props.item" />
    </template>
  </q-virtual-scroll>
</template>
```

## Module Organization Best Practices

### Organize by Domain

```
backend-page-template/
├── module/
│   ├── user/               # User management
│   │   ├── lifecycle.js
│   │   ├── event-pipeline/
│   │   └── api-request/
│   ├── table/              # Table features
│   ├── export/             # Export features
│   └── analytics/          # Analytics
```

### Clear Naming

```javascript
// ✅ Good
handle_save_user_profile
cleanup_subscription_listeners
create_user_form_state

// ❌ Avoid
handle_stuff
cleanup_things
create_state
```

## Documentation

### Document Custom Modules

```javascript
/**
 * Handles user profile form submission
 * @param {Object} payload - Context object
 * @param {Ref<Object>} payload.user_form - User form data
 * @param {Function} payload.emit - Vue emit function
 * @returns {Promise<void>}
 */
export const handle_save_user_profile = async (payload) => {
  // Implementation
}
```

## Troubleshooting Extensions

### Module Not Loading

- Check glob pattern includes file path
- Verify file extension is `.js`
- Ensure eager: true in glob

### State Not Updating

- Verify state is using Vue's `ref()`
- Check payload includes state reference
- Confirm handler modifies `.value`

### Event Not Firing

- Check event handler filename follows pattern
- Verify event imported in event-pipeline.js
- Check component calls with correct function name

## Migration Guide

### Upgrading to New Features

When adding major features:

1. Create new modules with v2 suffix
2. Keep old modules for backward compatibility
3. Update in phases, not all at once
4. Test thoroughly before removing old modules

Example:

```javascript
// Old
export const handle_init_table_data = ...

// New
export const handle_init_table_data_v2 = ...

// Wrapper with feature flag
export const handle_init_table_data = (payload) => {
  if (useNewImplementation) {
    return handle_init_table_data_v2(payload)
  }
  // Old implementation
}
```
