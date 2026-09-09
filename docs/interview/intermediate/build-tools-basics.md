---
title: "构建工具入门：Vite 配置与使用 [P5-P6]"
level: "intermediate"
tags: ["构建工具", "Vite", "Webpack", "配置", "环境变量"]
difficulty: "hard"
updated: "2026-09-10"
target: "P5-P6 中级工程师"
---

# 构建工具入门：Vite 配置与使用 [P5-P6]

> Vite 是新一代前端构建工具，基于原生 ES 模块，开发时启动快、热更新快。掌握 Vite 配置是前端工程化的基础。

## 核心概念（What）

### 构建工具的作用

```
构建工具做什么：
├── 模块打包 → 将多个文件打包成 bundle
├── 代码转换 → TypeScript → JavaScript、JSX → JS
├── 代码压缩 → 减小文件体积
├── 代码分割 → 按需加载
├── 热更新 → 开发时实时更新
├── 环境变量 → 区分开发/生产环境
└── 插件系统 → 扩展功能

常见构建工具：
├── Webpack → 功能强大，配置复杂
├── Vite → 快速，配置简单（推荐）
├── Rollup → 库打包
├── Parcel → 零配置
└── Turbopack → Next.js 默认
```

## 底层原理（Why）

### Vite 基础配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  // 插件
  plugins: [vue()],
  
  // 服务器配置
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
  // CSS 配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  },
  
  // 环境变量
  envPrefix: 'VITE_',
  
  // 依赖预构建
  optimizeDeps: {
    include: ['lodash']
  }
});
```

### 环境变量

```bash
# .env（所有环境）
VITE_APP_TITLE=My App

# .env.development（开发环境）
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true

# .env.production（生产环境）
VITE_API_URL=https://api.example.com
VITE_DEBUG=false

# .env.staging（预发布环境）
VITE_API_URL=https://api-staging.example.com
```

```javascript
// 在代码中使用
console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env.VITE_APP_TITLE);

// 类型定义（TypeScript）
// env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 在 HTML 中使用
// index.html
<title><%= VITE_APP_TITLE %></title>
```

### 路径别名

```javascript
// vite.config.js
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@assets': path.resolve(__dirname, 'src/assets')
    }
  }
});

// 使用
import Button from '@/components/Button.vue';
import { formatDate } from '@utils/date';
import logo from '@assets/logo.png';
```

### 代理配置

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      // 简单代理
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      
      // 重写路径
      '/api/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '')
      },
      
      // WebSocket
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true
      },
      
      // 多个路径
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying:', req.url);
          });
        }
      }
    }
  }
});
```

### 代码分割

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 第三方库
          vendor: ['vue', 'vue-router', 'pinia'],
          
          // 工具库
          utils: ['lodash', 'dayjs', 'axios'],
          
          // UI 库
          ui: ['element-plus']
        }
      }
    }
  }
});

// 构建结果
dist/
├── assets/
│   ├── vendor-a1b2c3d4.js    // 第三方库
│   ├── utils-e5f6g7h8.js     // 工具库
│   ├── ui-i9j0k1l2.js        // UI 库
│   ├── app-m3n4o5p6.js       // 应用代码
│   └── index-q7r8s9t0.css    // 样式
```

### 插件系统

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    vue(),
    
    // 自动导入 API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts'
    }),
    
    // 自动导入组件
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    })
  ]
});
```

## 实战应用（How）

### 完整配置示例

```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  
  return {
    plugins: [vue()],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    
    server: {
      port: Number(env.VITE_PORT) || 3000,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production'
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia']
          }
        }
      }
    }
  };
});
```

### 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run dev -- --host # 允许外部访问

# 构建
npm run build        # 生产构建
npm run build -- --mode staging # 指定环境

# 预览
npm run preview      # 预览构建结果

# 其他
npm run lint         # 代码检查
npm run test         # 运行测试
```

## 高频面试题

### Q1: Vite 为什么快？

```
原因：
├── 开发时使用原生 ES 模块
│   └── 不需要打包，按需编译
├── 使用 esbuild 预构建依赖
│   └── 比 Webpack 快 10-100x
├── HMR 基于原生 ES 模块
│   └── 只更新变化的模块
└── 生产时使用 Rollup
    └── 优化打包体积

对比 Webpack：
├── Webpack → 先打包再启动（慢）
└── Vite → 直接启动，按需编译（快）
```

### Q2: 如何配置环境变量？

```
步骤：
├── 创建 .env 文件
├── 使用 VITE_ 前缀
├── 代码中使用 import.meta.env
└── TypeScript 中添加类型

示例：
# .env.production
VITE_API_URL=https://api.example.com

// 代码
const apiUrl = import.meta.env.VITE_API_URL;
```

### Q3: 如何实现代码分割？

```
方法：
├── 路由懒加载 → import()
├── manualChunks → 手动分割
├── 动态导入 → import()
└── 第三方库分割

配置：
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router']
      }
    }
  }
}
```

## 延伸思考

1. Vite 和 Webpack 的区别？
2. 如何开发 Vite 插件？
3. 如何优化构建速度？

## 参考资料

- [Vite 官方文档](https://vitejs.dev/)
- [Vite 配置](https://vitejs.dev/config/)
