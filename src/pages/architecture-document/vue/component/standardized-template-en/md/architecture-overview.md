# Backend Page Template - Architecture Overview

## Introduction

The Backend Page Template is a sophisticated, pluggable architecture for Vue.js backend pages that emphasizes modularity, composability, and clear separation of concerns. It's designed to standardize backend page development while remaining highly extensible.

## Core Architecture Principles

### 1. **Pluggable Module System**
Every component (state, lifecycle, effects, events, API requests) is independently loadable and composable. Modules are auto-discovered via Vite's `import.meta.glob()` and assembled at runtime.

### 2. **Separation of Concerns**
The template separates:
- **State Management** (singleton, multiton, computed)
- **Lifecycle Hooks** (Vue 3 lifecycle events)
- **Event Handling** (emits, event pipelines, user interactions)
- **Side Effects** (DOM, watchers, listeners, timers, event emitters)
- **API Communication** (data fetching and transformation)
- **Component Composition** (UI components with reusable logic)

### 3. **Assembler Pattern**
Central to the architecture is the **Assembler Pattern**, which:
- Scans and auto-discovers modules
- Composes them into cohesive units
- Provides injection through `useContextAssembler` composable
- Eliminates manual module imports and registration

## Directory Structure

```
backend-page-template/
├── index.vue                 # Main page component
├── assembler/                # Assembler configuration
│   └── assembler.js          # Main assembler setup
├── state/                    # State management
│   ├── config.js             # Configuration options
│   ├── singleton.js          # Singleton state modules
│   ├── multiton.js           # Per-instance state modules
│   ├── computed.js           # Computed properties
│   └── singleton/            # Singleton implementations
│       ├── table.js          # Table-related state
│       ├── dialog.js         # Dialog-related state
│       └── other.js          # Other shared state
├── module/                   # Business logic modules
│   ├── lifecycle/            # Vue lifecycle hooks
│   ├── emit/                 # Vue emit functions
│   ├── exposed-method/       # Public API methods
│   ├── event-pipeline/       # Event handling system
│   ├── effect/               # Side effect cleanup
│   └── other-method/         # Utility methods
├── component/                # UI components
│   ├── dialog-wrapper/       # Dialog wrapper component
│   ├── table-main-area/      # Table component area
│   └── top-search-area/      # Search area component
├── api-request/              # API communication
│   └── module/               # API handlers
├── css/                      # Styles
└── docs/                     # Documentation (generated)
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vue Component (index.vue)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  useContextAssembler() - Central Composition Hub     │  │
│  └──────────────────────────────────────────────────────┘  │
│           ↓          ↓          ↓          ↓         │
│      ┌─────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐ │
│      │  State  │ │ Emit   │ │ Effects │ │ Event    │ │
│      │                      Pipeline │ │
│      └─────────┘ └────────┘ └─────────┘ └──────────┘ │
│           ↓ (access/modify) ↓ (trigger) ↓             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Singleton/Multiton State Store            │  │
│  │  (table_data, pagination, user_info, etc.)         │  │
│  └──────────────────────────────────────────────────────┘  │
│           ↓ (reactive updates)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Child Components                            │  │
│  │  (DialogWrapper, TableMainArea, TopSearchArea)     │  │
│  └──────────────────────────────────────────────────────┘  │
│           ↓ (props/events)                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Request Handler                    │  │
│  │            (handle_init_table_data, etc.)          │  │
│  └──────────────────────────────────────────────────────┘  │
│           ↓ (async requests)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Backend API Services                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Key Technology Stack

- **Vue 3** - UI framework with Composition API
- **Vite** - Build tool with dynamic module loading
- **Reactive System** - Vue 3's `ref()`, `computed()`, `watch()`
- **Mitt** - Custom event emitter for cross-component communication
- **Auto Module Discovery** - Vite's `import.meta.glob()`

## Execution Flow

### Initialization Phase
1. User opens page → `index.vue` loads
2. `useContextAssembler()` initializes
3. Assembler scans `/module/**` and `/state/*.js` directories
4. Modules are validated and composed
5. Singleton state initialized

### Runtime Phase
1. Component renders with state from assembler
2. User interactions trigger emit functions
3. Emit functions trigger event pipelines
4. Event pipelines update state or trigger API calls
5. API calls modify global state
6. Vue reactivity propagates changes to UI

### Cleanup Phase
1. Component unmounts
2. Effect cleanup handlers execute (listeners, watchers, timers)
3. Singleton state retained for next initialization
4. Resources released

## Benefits of This Architecture

| Feature | Benefit |
|---------|---------|
| **Modular Design** | Easy to understand, test, and maintain individual modules |
| **Auto-Discovery** | No manual registration - modules found automatically |
| **Pluggable** | Add/remove modules without changing core code |
| **Type-Safe** | Clear module interfaces and payload structures |
| **Scalable** | Growing project organized consistently |
| **Reusable** | Components and logic can be shared across pages |
| **Testable** | Pure functions with dependency injection |
| **Configurable** | Centralized configuration in state/ |

## Getting Started

The template is ready to use in two ways:

1. **As a Template** - Copy to new page and customize
2. **As a Reference** - Study the patterns for your own pages

See [Extending the Template](./extending-the-template.md) for customization guide.