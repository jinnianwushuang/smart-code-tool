# Assembler Pattern

## Overview

The **Assembler Pattern** is the central orchestration mechanism that auto-discovers, validates, and composes all modules into a cohesive context. It's the "brain" of the architecture.

## Core Concept

Instead of manually importing and wiring modules, the assembler:

1. **Discovers** modules via `import.meta.glob()`
2. **Validates** module structure and exports
3. **Composes** into a unified context object
4. **Injects** into components via `useContextAssembler()`

## Architecture

```
import.meta.glob()
  ↓ discovers all modules
Module Files (JS imports)
  ↓ collection of unorganized imports
Assembler Function (atoms_assembler)
  ↓ validates, transforms, composes
Unified Context Object
  ↓ structured with clear interface
useContextAssembler() Composable
  ↓ injects into components
Component Instance
  ↓ uses destructured context
Component Logic
```

## Main Assembler Setup

### assembler.js

Located at `/assembler/assembler.js`:

```javascript
import { atoms_assembler } from 'src/output/common/project-common.js'

// 1. Public external modules (from composable_common)
const public_assembler = ['useGlobalState']

// 2. Manual assembler modules not in composable_common
const manual_assembler = []

// 3. Current file path for relative imports
const current_file_path = import.meta.url

// 4. Module discovery via glob
const modules = import.meta.glob(['../module/**/*.js', '../state/*.js'], {
  eager: true, // Synchronous loading
})

// 5. Assemble and export
export const all_atoms_assembler = () => {
  return atoms_assembler({
    public_assembler,
    manual_assembler,
    current_file_path,
    modules,
  })
}
```

## How It Works

### Step 1: Module Discovery

```javascript
const modules = import.meta.glob(
  [
    '../module/**/*.js', // Find all module JS files
    '../state/*.js', // Find all state files
  ],
  {
    eager: true, // Load synchronously
  },
)
```

Results in:

```javascript
{
  '/path/to/module/lifecycle/lifecycle.js': { lifecycle_onMounted, ... },
  '/path/to/module/emit/emit.js': { create_messaging_emit },
  '/path/to/state/singleton.js': { all_singleton, init_singleton },
  // ... all other modules
}
```

### Step 2: Module Validation & Transformation

The `atoms_assembler()` function:

1. Validates each module has proper exports
2. Categorizes modules by type (state, effects, lifecycle, etc.)
3. Extracts function names and signatures
4. Builds namespace hierarchy

### Step 3: Context Composition

Creates unified context:

```javascript
{
  // State (from state/singleton.js)
  user_info,
  table_data,
  pagination,

  // Computed properties (from state/computed.js)
  visible_row_count,

  // Lifecycle hooks (from module/lifecycle/lifecycle.js)
  lifecycle_onBeforeMount,
  lifecycle_onMounted,

  // Emit functions (from module/emit/emit.js)
  btn_a_click,

  // Exposed methods
  handle_xxx_demo,
  handle_query_demo,

  // Event pipeline (dynamically created)
  ALL_EVENT_PIPELINE: {
    dialog: { handle_dialog_copy_use_confirm_click, ... },
    table: { handle_table_action_confirm_click, ... },
    other: { handle_query_click, ... },
  },
}
```

### Step 4: Dependency Injection

In main component:

```javascript
const { user_info, btn_a_click, handle_query_demo } = useContextAssembler(
  base_payload,
  all_atoms_assembler(),
)
```

The `useContextAssembler()`:

1. Creates payload with injected state
2. Calls all initialization functions
3. Binds event handlers
4. Returns ready-to-use context

## Configuration Parameters

### public_assembler

```javascript
const public_assembler = ['useGlobalState']
```

- Lists modules from `composable_common`
- These are shared across all pages
- Reduces duplication

### manual_assembler

```javascript
const manual_assembler = ['custom_module_path']
```

- Modules not in composable_common
- Listed explicitly
- Allows exceptions to convention

### current_file_path

```javascript
const current_file_path = import.meta.url
```

- Location of assembler.js
- Used for relative path resolution
- Ensures correct module discovery

## Module Types

### State Modules

**Pattern**: Export `ref()` or state initialization function

```javascript
// singleton/table.js
export const table_data = ref([])
export const init_singleton = () => { ... }
```

### Lifecycle Modules

**Pattern**: Export functions named `lifecycle_*`

```javascript
// module/lifecycle/lifecycle.js
export const lifecycle_onMounted = (payload) => { ... }
export const lifecycle_onBeforeUnmount = (payload) => { ... }
```

### Emit Modules

**Pattern**: Export creation function returning emit handlers

```javascript
// module/emit/emit.js
export const create_messaging_emit = (payload) => {
  return { btn_a_click: () => {...} }
}
```

### Event Pipeline Modules

**Pattern**: Export functions named `handle_*` or `on_*`

```javascript
// module/event-pipeline/module/dialog.js
export const handle_dialog_copy_use_confirm_click = (payload) => { ... }
```

### Effect Cleanup Modules

**Pattern**: Export `cleanup_effect_*` functions returning cleanup handlers

```javascript
// module/effect/watcher.js
export const cleanup_effect_watcher = (payload) => {
  return [watch(...), listener]
}
```

## Creating a New Module

### Step 1: Create Module File

Create `module/custom-feature/custom-feature.js`:

```javascript
export const handle_custom_action = (payload) => {
  const { table_data } = payload
  console.log('Custom action triggered')
  return { success: true }
}
```

### Step 2: Module Auto-Discovered

Assembler automatically finds it via glob pattern.

### Step 3: Use in Component

```javascript
const { handle_custom_action } = useContextAssembler(payload, all_atoms_assembler())

// Or via event pipeline if configured
ALL_EVENT_PIPELINE.custom_feature.handle_custom_action()
```

## Advanced: Custom Assembler

### Wrapping for Custom Logic

```javascript
const custom_assembler = () => {
  const base_context = all_atoms_assembler()

  return {
    ...base_context,

    // Add custom derived context
    custom_computed: computed(() => {
      return base_context.table_data.value.length > 0
    }),

    // Override behavior
    handle_custom_action: (payload) => {
      console.log('Custom override')
      return base_context.handle_custom_action(payload)
    },
  }
}
```

## Troubleshooting

### Module Not Discovered

1. Check glob pattern in assembler.js
2. Verify file location matches pattern
3. Ensure file has `.js` extension
4. Check `eager: true` is set

### Module Not Exported Properly

1. Verify export syntax: `export const functionName = ...`
2. Check function signature matches pattern
3. Ensure lifecycle functions start with `lifecycle_`
4. Event handlers should be named `handle_*` or `on_*`

### Context Injection Not Working

1. Verify `useContextAssembler()` called with correct parameters
2. Check `base_payload` includes required fields
3. Ensure assembler passed as second argument
4. Debug by logging returned context

## Best Practices

### ✅ Do

- Keep modules focused and single-purpose
- Follow naming conventions (lifecycle*, handle*, cleanup\_, etc.)
- Export pure functions when possible
- Document module interface with comments
- Group related modules in subdirectories

### ❌ Don't

- Create circular dependencies between modules
- Mutate global state outside event handlers
- Mix concerns in single module
- Create modules with hidden side effects
- Skip assembler for manual imports

## Performance Considerations

### Module Loading

- `eager: true` loads all modules synchronously
- Use `eager: false` for lazy loading if page has many modules
- Glob patterns are optimized by Vite

### Context Composition

- Assembler runs once at component mount
- Context reused via destructuring
- No performance impact from additional modules

## Extension Points

### Adding Custom Context

```javascript
const all_atoms_assembler = (custom_context) => {
  const base = atoms_assembler({
    public_assembler,
    manual_assembler,
    current_file_path,
    modules,
  })

  return { ...base, ...custom_context }
}
```

### Conditional Module Loading

```javascript
const modules = import.meta.glob(
  [
    '../module/**/*.js',
    '../state/*.js',
    // Load environment-specific configs
    ...(isAdminMode ? ['../admin-module/**/*.js'] : []),
  ],
  { eager: true },
)
```
