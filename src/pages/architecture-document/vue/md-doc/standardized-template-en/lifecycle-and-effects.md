# Lifecycle and Effects Management

## Overview

The template provides structured lifecycle management and comprehensive effect cleanup system that integrates with Vue 3's lifecycle hooks while maintaining clean, composable code.

## Lifecycle System

### Lifecycle Hooks

Located in `module/lifecycle/lifecycle.js`:

```javascript
export const lifecycle_onBeforeMount = (payload) => {
  console.log('lifecycle_onBeforeMount')
  handle_xxx_demo(payload)
}

export const lifecycle_onMounted = (payload) => {
  console.log('lifecycle_onMounted')
  handle_query_demo(payload)
}

export const lifecycle_onBeforeUnmount = (payload) => {
  console.log('lifecycle_onBeforeUnmount')
}

export const lifecycle_onUnmounted = (payload) => {
  console.log('lifecycle_onUnmounted')
}

export const lifecycle_onActivated = (payload) => {
  console.log('lifecycle_onActivated')
}

export const lifecycle_onDeactivated = (payload) => {
  console.log('lifecycle_onDeactivated')
}
```

### Available Lifecycle Hooks

| Hook | Timing | Use Case |
|------|--------|----------|
| `lifecycle_onBeforeMount` | Before component mounts | Prepare state/validation |
| `lifecycle_onMounted` | After component mounts | Fetch initial data, start timers |
| `lifecycle_onBeforeUnmount` | Before component unmounts | Save state, cancel pending requests |
| `lifecycle_onUnmounted` | After component unmounts | Final cleanup |
| `lifecycle_onActivated` | Component reactivated (KeepAlive) | Resume timers, refresh state |
| `lifecycle_onDeactivated` | Component deactivated (KeepAlive) | Pause timers, cache state |

### Lifecycle Execution Flow

```
Component Creation
    ↓
useContextAssembler() → lifecycle_onBeforeMount(payload)
    ↓
Vue mounts component
    ↓
lifecycle_onMounted(payload)
    ↓
Component in view
    ↓
(optional KeepAlive)
    ↓
lifecycle_onBeforeUnmount(payload)
    ↓
Vue unmounts component
    ↓
lifecycle_onUnmounted(payload)
    ↓
Component destroyed
```

### Using Lifecycle Hooks

In main component:

```javascript
import { useContextAssembler } from 'src/output/common/composable-common.js'
import { all_atoms_assembler } from './assembler/module/assembler.js'

const {
  user_info,
  lifecycle_onBeforeMount,
  lifecycle_onMounted,
} = useContextAssembler(base_payload, all_atoms_assembler())

// Hooks automatically called by useContextAssembler
```

The `useContextAssembler()` composable automatically calls lifecycle hooks at appropriate times.

## Effects Cleanup System

### Overview

Effects are side effects (listeners, watchers, timers, etc.) that need cleanup to prevent memory leaks. The system provides centralized cleanup.

### Effect Types

Located in `module/effect/`:

```
module/effect/
├── dom.js        # DOM references cleanup
├── listener.js   # Event listeners cleanup
├── watcher.js    # Vue watchers cleanup
├── timer.js      # Timers cleanup
├── mitter.js     # Event emitter listeners cleanup
└── other.js      # Custom observers, etc.
```

### 1. DOM Effects

**File**: `module/effect/dom.js`

Tracks DOM references that need cleanup:

```javascript
export const cleanup_effect_dom = (payload) => {
  const { form_ref } = payload
  return [form_ref]  // References to clean up
}
```

**Use Case**: 
- Form references
- Component refs
- DOM queries that should be nullified

**Cleanup**: References are nullified when component unmounts

### 2. Event Listeners

**File**: `module/effect/listener.js`

Registers event listeners with cleanup handlers:

```javascript
import { handle_resize } from '../other-method/event-listener.js'

export const cleanup_effect_listener = (payload) => {
  return [
    {
      target: window,
      type: 'resize',
      handler: (event) => handle_resize(payload, event),
    },
  ]
}
```

**Lifecycle**:
1. Listener registered on component mount
2. Handler called when event fires
3. Listener unregistered on component unmount

**Example with Custom Handler**:

```javascript
export const cleanup_effect_listener = (payload) => {
  const { pagination } = payload
  
  return [
    {
      target: window,
      type: 'scroll',
      handler: (event) => {
        if (window.scrollY > 500) {
          pagination.value.current = 1
        }
      },
    },
    {
      target: document,
      type: 'keydown',
      handler: (event) => {
        if (event.key === 'Escape') {
          // Handle escape key
        }
      },
    },
  ]
}
```

### 3. Watchers

**File**: `module/effect/watcher.js`

Manages Vue watchers with automatic cleanup:

```javascript
import { watch } from "vue"

export const cleanup_effect_watcher = (payload) => {
  const { current_time } = payload
  
  return [watch(current_time, (new_time) => {
    console.log('Time changed:', new_time)
  })]
}
```

**Advanced Example**:

```javascript
import { watch, computed } from "vue"

export const cleanup_effect_watcher = (payload) => {
  const { table_data, pagination, query_form } = payload
  
  return [
    // Watch table data changes
    watch(table_data, (newData) => {
      console.log('Table updated:', newData.length)
    }),
    
    // Watch pagination changes
    watch(() => pagination.value.current, (newPage) => {
      console.log('Page changed to:', newPage)
    }),
    
    // Deep watch for query form changes
    watch(query_form, (newForm) => {
      console.log('Query form:', newForm)
    }, { deep: true }),
    
    // Computed watches
    watch(
      () => table_data.value.length,
      (newLength) => {
        if (newLength === 0) {
          console.log('No data')
        }
      }
    ),
  ]
}
```

### 4. Timers

**File**: `module/effect/timer.js`

Tracks timers for cleanup:

```javascript
export const cleanup_effect_timer = (payload) => {
  const { timer1, timer_obj } = payload
  
  return [timer1, timer_obj]  // Timer IDs/objects to clean up
}
```

**Example with Interval & Timeout**:

```javascript
export const cleanup_effect_timer = (payload) => {
  const timers = []
  
  // Create interval (cleanup by ID)
  const intervalId = setInterval(() => {
    console.log('Periodic task')
  }, 5000)
  timers.push(intervalId)
  
  // Create timeout (cleanup by ID)
  const timeoutId = setTimeout(() => {
    console.log('Delayed task')
  }, 10000)
  timers.push(timeoutId)
  
  return timers
}
```

### 5. Event Emitter Listeners

**File**: `module/effect/mitter.js`

Manages custom event emitter subscriptions:

```javascript
import { EMITTER } from "src/output/common/project-common.js"

export const cleanup_effect_mitter = (payload) => {
  const { current_time } = payload
  
  return [EMITTER.on("custom-event", () => {
    console.log("Event received at", current_time.value)
  })]
}
```

**Advanced Example**:

```javascript
export const cleanup_effect_mitter = (payload) => {
  const { all_dialog_state, table_data } = payload
  
  const subscriptions = []
  
  // Subscribe to dialog open events
  subscriptions.push(
    EMITTER.on("dialog:open", (dialogData) => {
      // Handle dialog opening
      all_dialog_state.value = dialogData
    })
  )
  
  // Subscribe to data refresh events
  subscriptions.push(
    EMITTER.on("data:refresh", () => {
      // Trigger data reload
      console.log('Refreshing data')
    })
  )
  
  return subscriptions
}
```

### 6. Other Effects

**File**: `module/effect/other.js`

For custom observers and other cleanup needs:

```javascript
export const cleanup_effect_other = (payload) => {
  const { } = payload
  
  // Example: ResizeObserver
  const containerRef = payload.container_ref
  const observer = new ResizeObserver((entries) => {
    console.log('Container resized')
  })
  
  if (containerRef?.value) {
    observer.observe(containerRef.value)
  }
  
  return [observer]  // Disconnect called on cleanup
}
```

## Complete Lifecycle Example

### Single Component Lifecycle

```javascript
// 1. Before mount - prepare
export const lifecycle_onBeforeMount = (payload) => {
  const { init_singleton } = payload
  init_singleton()  // Reset state
}

// 2. After mount - load data and setup effects
export const lifecycle_onMounted = (payload) => {
  const { handle_init_table_data } = payload
  handle_init_table_data(payload)  // Fetch initial data
}

// 3. On unmount - cleanup happens automatically via effects
export const lifecycle_onBeforeUnmount = (payload) => {
  const { table_data, pagination } = payload
  // Optional: save state before unmount
  localStorage.setItem('table_state', JSON.stringify({
    data: table_data.value,
    pagination: pagination.value,
  }))
}
```

### KeepAlive Lifecycle

For cached components using Vue's `<KeepAlive>`:

```javascript
export const lifecycle_onDeactivated = (payload) => {
  // Component hidden, pause expensive operations
  const { timer1 } = payload
  clearInterval(timer1)
}

export const lifecycle_onActivated = (payload) => {
  // Component shown again, resume operations
  const { handle_resume_timer } = payload
  handle_resume_timer(payload)
}
```

## Cleanup Mechanism

### How Cleanup Works

1. **Registration Phase** (mount):
   - Effect cleanup functions create handlers
   - Handlers registered with system

2. **Active Phase** (component visible):
   - Handlers execute (watchers fire, listeners trigger)
   - State updates propagate

3. **Cleanup Phase** (unmount):
   - All effect cleanup functions called
   - Listeners unregistered (`removeEventListener`)
   - Watchers stopped (`watcherStop()`)  
   - Timers cleared (`clearInterval`, `clearTimeout`)
   - Observers disconnected (`observer.disconnect()`)
   - Event subscriptions unsubscribed

### Memory Leak Prevention

The system prevents leaks by:

```javascript
// ✅ Automatic cleanup pattern
export const cleanup_effect_listener = (payload) => {
  return [
    { target, type, handler }  // Registered and cleaned up
  ]
}

// ❌ Manual cleanup outside framework
window.addEventListener('resize', () => {})  // Danger! No cleanup
```

## Best Practices

### ✅ Do
- Register all effects in cleanup modules
- Keep lifecycle hooks focused
- Use appropriate effect types
- Document what each effect does
- Test that cleanup occurs

### ❌ Don't
- Create listeners outside cleanup system
- Forget to return cleanup handlers
- Create circular cleanup dependencies
- Perform expensive operations in unmount
- Store references that prevent cleanup

## Testing Lifecycle & Effects

```javascript
test('component initializes onMounted', () => {
  const payload = { /* mock payload */ }
  
  lifecycle_onMounted(payload)
  
  expect(payload.table_data.value.length).toBeGreaterThan(0)
})

test('watchers cleanup on unmount', () => {
  const payload = { /* mock payload */ }
  const cleanupFns = cleanup_effect_watcher(payload)
  
  // Call cleanup
  cleanupFns.forEach(fn => fn())
  
  // Verify watchers stopped
  expect(payload.current_time.value).not.toChange()
})
```