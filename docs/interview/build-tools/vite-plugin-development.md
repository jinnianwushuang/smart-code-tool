---
title: "Vite 插件开发实战 [P6-P7]"
level: "senior"
tags: ["Vite", "插件", "Rollup", "虚拟模块", "Hook"]
difficulty: "hard"
updated: "2026-09-10"
target: "P6+ 高级工程师"
---

# Vite 插件开发实战 [P6-P7]

> Vite 插件兼容 Rollup 插件接口，同时提供 Vite 专属钩子。掌握插件开发是深入理解构建工具的关键。

## 核心概念（What）

### Vite 插件架构

```
Vite 插件 = Rollup 插件 + Vite 专属钩子

钩子分类：
├── 通用钩子（Rollup 兼容）：buildStart, transform, resolveId...
├── Vite 专属钩子：config, configResolved, configureServer, transformIndexHtml...
└── 执行顺序：config → configResolved → buildStart → transform → ...
```

---

## 底层原理（Why）

### 1. 插件基本结构

```typescript
// vite-plugin-example.ts
import type { Plugin } from 'vite';

export default function myPlugin(options?: PluginOptions): Plugin {
  return {
    name: 'vite-plugin-example',
    enforce: 'pre', // 'pre' | 'post' | undefined（默认 normal）

    // Vite 专属钩子
    config(config) {
      // 修改 Vite 配置
      config.define = { __VERSION__: JSON.stringify('1.0.0') };
    },

    configResolved(resolvedConfig) {
      // 获取最终配置（只读）
      console.log('Build mode:', resolvedConfig.mode);
    },

    configureServer(server) {
      // 自定义开发服务器中间件
      server.middlewares.use('/api/custom', (req, res) => {
        res.end('Hello from plugin!');
      });
    },

    // Rollup 兼容钩子
    transform(code, id) {
      // 转换模块内容
      if (id.endsWith('.md')) {
        return {
          code: `export default ${JSON.stringify(code)}`,
          map: null,
        };
      }
    },

    resolveId(source) {
      // 自定义模块解析
      if (source === 'virtual:config') {
        return '\0virtual:config'; // \0 前缀标记虚拟模块
      }
    },

    load(id) {
      // 加载虚拟模块
      if (id === '\0virtual:config') {
        return `export default ${JSON.stringify({ version: '1.0.0' })}`;
      }
    },
  };
}
```

### 2. 虚拟模块

```typescript
// 虚拟模块：不存在的文件路径，由插件动态生成
import type { Plugin } from 'vite';

export default function virtualModulePlugin(): Plugin {
  const virtualModuleId = 'virtual:app-config';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-virtual-config',

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        // 动态生成模块内容
        return `
          export const version = '1.0.0';
          export const buildTime = '${new Date().toISOString()}';
          export const env = '${process.env.NODE_ENV}';
        `;
      }
    },
  };
}

// 使用
// import { version, buildTime } from 'virtual:app-config';
```

### 3. 自动导入插件（实战）

```typescript
// 实现类似 unplugin-auto-import 的功能
import type { Plugin } from 'vite';
import { parse } from 'acorn';

interface AutoImportOptions {
  imports: Record<string, string[]>; // { 'vue': ['ref', 'reactive', 'computed'] }
}

export default function autoImportPlugin(options: AutoImportOptions): Plugin {
  const importStatements = generateImportStatements(options.imports);

  return {
    name: 'vite-plugin-auto-import',

    transform(code, id) {
      if (!id.endsWith('.vue') && !id.endsWith('.ts') && !id.endsWith('.js')) {
        return;
      }

      // 检测代码中使用了哪些 API
      const usedImports: string[] = [];
      for (const [module, apis] of Object.entries(options.imports)) {
        for (const api of apis) {
          if (code.includes(api)) {
            usedImports.push(`import { ${api} } from '${module}';`);
          }
        }
      }

      if (usedImports.length === 0) return;

      // 在文件开头注入 import
      const transformedCode = usedImports.join('\n') + '\n' + code;
      return { code: transformedCode, map: null };
    },
  };
}

function generateImportStatements(imports: Record<string, string[]>): string {
  return Object.entries(imports)
    .map(([module, apis]) => `import { ${apis.join(', ')} } from '${module}';`)
    .join('\n');
}
```

### 4. SSR 插件

```typescript
// SSR 插件：处理服务端渲染
import type { Plugin } from 'vite';

export default function ssrPlugin(): Plugin {
  return {
    name: 'vite-plugin-ssr-helper',

    // 仅服务端生效
    applyToEnvironment(environment) {
      return environment.name === 'ssr';
    },

    transform(code, id) {
      // SSR 环境下特殊处理
      if (id.includes('window') || id.includes('document')) {
        // 替换浏览器 API 为安全版本
        return code
          .replace(/window\./g, 'globalThis.window?.')
          .replace(/document\./g, 'globalThis.document?.');
      }
    },

    // 生成 SSR 入口
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        '<script type="module" src="/entry-server.ts"></script></head>'
      );
    },
  };
}
```

---

## 高频面试题

### Q1: Vite 插件和 Rollup 插件的关系？

**参考答案要点**：
- Vite 插件兼容 Rollup 插件接口
- Vite 额外提供专属钩子（config/configureServer/transformIndexHtml）
- Rollup 插件可以直接在 Vite 中使用
- Vite 专属钩子只在 Vite 环境生效

### Q2: 虚拟模块是什么？如何实现？

**参考答案要点**：
- 虚拟模块：不存在的文件路径，由插件动态生成
- resolveId 钩子拦截模块 ID → 返回 \0 前缀标记
- load 钩子返回动态生成的代码
- 用途：运行时配置、自动导入、环境变量注入

### Q3: Vite 插件的 enforce 选项？

**参考答案要点**：
- `'pre'`：在其他插件之前执行
- `'post'`：在所有插件之后执行
- `undefined`（normal）：按注册顺序执行
- 用途：控制插件执行优先级

---

## 延伸思考

1. **设计题**：实现一个 Vite 插件，自动注入页面性能监控代码。
2. **场景题**：Vite 插件中如何访问其他插件的处理结果？
3. **对比题**：Vite 插件 vs Webpack loader/plugin，开发体验对比？

---

## 参考资料

- [Vite 插件 API](https://vitejs.dev/guide/api-plugin.html)
- [Rollup 插件 API](https://rollupjs.org/plugin-development/)
- [unplugin](https://github.com/unjs/unplugin)
