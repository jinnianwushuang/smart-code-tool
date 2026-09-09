---
title: "TypeScript 工程化实践 [P5-P6]"
level: "intermediate"
tags: ["TypeScript", "tsconfig", "声明文件", "Vue", "React"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# TypeScript 工程化实践 [P5-P6]

> TypeScript 工程化包括 tsconfig 配置、声明文件、与框架集成。掌握这些才能在实际项目中高效使用 TypeScript。

## 核心概念（What）

### 工程化内容

```
TypeScript 工程化：
├── tsconfig.json → 编译配置
├── 声明文件 → .d.ts
├── 类型定义 → @types/*
├── 框架集成 → Vue/React + TS
└── 最佳实践 → 代码规范
```

## 底层原理（Why）

### tsconfig.json 配置

```json
{
  "compilerOptions": {
    // 目标版本
    "target": "ES2020",
    
    // 模块系统
    "module": "ESNext",
    "moduleResolution": "bundler",
    
    // 严格模式
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // 额外检查
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    
    // 路径
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    
    // 输出
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    
    // 库
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    
    // 类型
    "types": ["vite/client"],
    
    // JSX
    "jsx": "preserve",
    
    // 其他
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true
  },
  
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ],
  
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### 声明文件

```typescript
// 1. 为第三方库添加类型（如果库没有自带类型）
// types/lodash.d.ts
declare module 'lodash' {
  export function chunk<T>(array: T[], size: number): T[][];
  export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait?: number
  ): T;
}

// 2. 为静态资源添加类型
// types/assets.d.ts
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 3. 为环境变量添加类型
// types/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 4. 全局类型声明
// types/global.d.ts
declare global {
  interface Window {
    __APP_CONFIG__: {
      apiUrl: string;
      version: string;
    };
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};

// 5. 安装 @types 包
// npm install -D @types/lodash
// npm install -D @types/node
```

### Vue 3 + TypeScript

```vue
<!-- 1. 组件 Props 类型 -->
<script setup lang="ts">
import { defineProps, withDefaults } from 'vue';

interface Props {
  title: string;
  count?: number;
  items: Array<{ id: number; name: string }>;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
});
</script>

<!-- 2. 事件类型 -->
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update', value: string): void;
  (e: 'delete', id: number): void;
}>();

emit('update', 'hello');
emit('delete', 123);
</script>

<!-- 3. Ref 类型 -->
<script setup lang="ts">
import { ref, Ref } from 'vue';

// 自动推导
const count = ref(0); // Ref<number>
const name = ref('Alice'); // Ref<string>

// 显式声明
const user = ref<User | null>(null);
const items = ref<string[]>([]);

// 复杂类型
interface User {
  id: number;
  name: string;
  email: string;
}

const currentUser = ref<User | null>(null);
</script>

<!-- 4. 模板引用类型 -->
<template>
  <input ref="inputRef" />
  <ChildComponent ref="childRef" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const inputRef = ref<HTMLInputElement | null>(null);
const childRef = ref<InstanceType<typeof ChildComponent> | null>(null);

onMounted(() => {
  inputRef.value?.focus();
  childRef.value?.someMethod();
});
</script>

<!-- 5. 组合式函数类型 -->
<script setup lang="ts">
import { ref, computed } from 'vue';

function useCounter(initial: number = 0) {
  const count = ref(initial);
  
  const double = computed(() => count.value * 2);
  
  function increment() {
    count.value++;
  }
  
  function decrement() {
    count.value--;
  }
  
  return {
    count,
    double,
    increment,
    decrement
  };
}

const { count, double, increment, decrement } = useCounter(10);
</script>
```

### React + TypeScript

```tsx
// 1. 组件 Props 类型
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

function Button({ text, onClick, disabled = false, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className={variant}>
      {text}
    </button>
  );
}

// 2. 事件类型
function Input() {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('clicked');
  };
  
  return (
    <>
      <input onChange={handleChange} />
      <button onClick={handleClick}>Click</button>
    </>
  );
}

// 3. Ref 类型
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  return <input ref={inputRef} />;
}

// 4. Context 类型
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// 5. Hook 类型
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue] as const;
}

const [name, setName] = useLocalStorage<string>('name', 'Alice');
```

## 实战应用（How）

### 最佳实践

```typescript
// 1. 避免 any，使用 unknown
// ❌ 不好
function process(data: any) {
  return data.value;
}

// ✅ 好
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: any }).value;
  }
}

// 2. 使用类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}

// 3. 使用 as const
const COLORS = ['red', 'green', 'blue'] as const;
type Color = typeof COLORS[number]; // 'red' | 'green' | 'blue'

const CONFIG = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
} as const;

// 4. 使用 satisfies（TS 4.9+）
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
  blue: [0, 0, 255]
} satisfies Record<string, string | number[]>;

// 5. 使用类型断言
const element = document.getElementById('app') as HTMLDivElement;
const response = await fetch('/api/data') as ApiResponse<User>;

// 6. 使用非空断言
const value = ref<string | null>(null);
console.log(value.value!); // 确定不为 null
```

## 高频面试题

### Q1: tsconfig.json 的重要配置？

```
严格模式：
├── strict → 开启所有严格检查
├── noImplicitAny → 禁止隐式 any
├── strictNullChecks → 严格 null 检查
└── noImplicitThis → 禁止隐式 this

路径配置：
├── baseUrl → 基础路径
├── paths → 路径别名
└── outDir → 输出目录

模块配置：
├── module → 模块系统
├── moduleResolution → 模块解析
└── esModuleInterop → ES 模块互操作
```

### Q2: 如何为第三方库添加类型？

```
方法：
├── 安装 @types 包 → npm install -D @types/lodash
├── 自定义声明文件 → types/lodash.d.ts
├── 使用 declare module
└── 参考官方文档

示例：
declare module 'lodash' {
  export function chunk<T>(array: T[], size: number): T[][];
}
```

### Q3: Vue/React 中如何使用 TypeScript？

```
Vue 3：
├── <script setup lang="ts">
├── defineProps<Props>()
├── ref<T>()
└── 模板引用类型

React：
├── 函数组件 Props 接口
├── 事件类型（ChangeEvent、MouseEvent）
├── useRef<HTMLDivElement>(null)
└── 自定义 Hook 类型
```

## 延伸思考

1. 如何设计类型安全的 API？
2. TypeScript 的类型推导规则？
3. 如何处理复杂的类型场景？

## 参考资料

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
