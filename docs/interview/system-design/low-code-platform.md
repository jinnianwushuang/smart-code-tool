---
title: '低代码平台架构 [P8]'
level: 'architect'
tags: ['低代码', 'DSL', '渲染引擎', '扩展机制']
difficulty: 'expert'
updated: '2026-09-10'
target: '架构师（P8）'
---

# 低代码平台架构 [P8]

> 低代码平台的核心挑战不是「拖拽组件」，而是 DSL 设计、渲染引擎和扩展机制。2026 年，AI + 低代码成为新趋势。

## 核心概念（What）

### 低代码平台架构

```
┌─────────────────────────────────┐
│         可视化编辑器              │
│  拖拽 │ 属性面板 │ 预览 │ 发布   │
├─────────────────────────────────┤
│         DSL 层                   │
│  JSON Schema │ 表达式引擎        │
├─────────────────────────────────┤
│         渲染引擎                 │
│  协议解析 │ 组件注册 │ 数据绑定  │
├─────────────────────────────────┤
│         扩展层                   │
│  自定义组件 │ 自定义动作 │ 插件  │
├─────────────────────────────────┤
│         服务层                   │
│  数据源 │ API │ 权限 │ 版本管理  │
└─────────────────────────────────┘
```

---

## 底层原理（Why）

### 1. DSL 设计

```json
// 低代码 DSL 示例（JSON Schema）
{
  "id": "page_1",
  "component": "Page",
  "props": {
    "title": "用户管理"
  },
  "children": [
    {
      "id": "table_1",
      "component": "Table",
      "props": {
        "dataSource": "{{state.users}}",
        "columns": [
          { "title": "姓名", "dataIndex": "name" },
          { "title": "邮箱", "dataIndex": "email" },
          {
            "title": "操作",
            "render": {
              "component": "ButtonGroup",
              "children": [
                {
                  "component": "Button",
                  "props": {
                    "text": "编辑",
                    "onClick": {
                      "type": "action",
                      "action": "openDialog",
                      "params": { "dialogId": "edit_dialog" }
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ],
  "state": {
    "users": {
      "type": "dataSource",
      "api": "/api/users",
      "autoFetch": true
    }
  }
}
```

### 2. 渲染引擎

```typescript
// 渲染引擎核心
class RenderEngine {
  private componentRegistry = new Map<string, ComponentType>();

  // 注册组件
  registerComponent(name: string, component: ComponentType) {
    this.componentRegistry.set(name, component);
  }

  // 递归渲染 DSL
  render(schema: SchemaNode, context: RenderContext): ReactNode {
    const { component, props, children, condition, loop } = schema;

    // 条件渲染
    if (condition && !this.evaluate(condition, context)) return null;

    const Component = this.componentRegistry.get(component);
    if (!Component) return null;

    // 解析表达式
    const resolvedProps = this.resolveProps(props, context);

    // 循环渲染
    if (loop) {
      const items = this.evaluate(loop.source, context);
      return items.map((item: unknown, index: number) =>
        this.render(
          { ...schema, loop: undefined },
          { ...context, [loop.itemName]: item, $index: index }
        )
      );
    }

    // 渲染子节点
    const resolvedChildren = children?.map(child => this.render(child, context));

    return <Component {...resolvedProps}>{resolvedChildren}</Component>;
  }

  // 解析表达式 {{state.xxx}}
  private resolveProps(props: Record<string, unknown>, context: RenderContext) {
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        resolved[key] = this.evaluate(value.slice(2, -2), context);
      } else {
        resolved[key] = value;
      }
    }
    return resolved;
  }
}
```

### 3. 扩展机制

```typescript
// 自定义组件注册
const CustomComponent: ComponentDefinition = {
  name: 'CustomChart',
  category: 'chart',
  props: [
    { name: 'data', type: 'array', description: '图表数据' },
    { name: 'type', type: 'enum', options: ['bar', 'line', 'pie'] },
    { name: 'title', type: 'string' },
  ],
  // 渲染实现
  render: ({ data, type, title }) => {
    return <Chart data={data} type={type} title={title} />;
  },
};

// 自定义动作
const customActions = {
  exportCSV: {
    execute: async (params: { data: unknown[] }) => {
      const csv = convertToCSV(params.data);
      downloadFile(csv, 'export.csv');
    },
  },
  sendMessage: {
    execute: async (params: { channel: string; message: string }) => {
      await fetch('/api/notify', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },
  },
};
```

### 4. AI + 低代码（2026 趋势）

```
AI 增强低代码：
├── 自然语言生成页面（"创建一个用户管理页面"）
├── AI 辅助配置（智能推荐属性值）
├── 自动生成数据源绑定
├── 智能布局建议
└── 代码生成（导出可编辑的 React/Vue 代码）
```

---

## 高频面试题

### Q1: 低代码平台的核心架构是什么？

**参考答案要点**：

- DSL 层：JSON Schema 描述页面结构
- 渲染引擎：解析 DSL 并渲染为真实组件
- 扩展层：自定义组件、自定义动作、插件
- 编辑器：可视化拖拽、属性配置、实时预览
- 服务层：数据源、API、权限、版本管理

### Q2: 如何设计低代码的 DSL？

**参考答案要点**：

- 组件树结构（component + props + children）
- 表达式引擎（数据绑定、条件渲染、循环）
- 动作系统（事件处理、API 调用）
- 状态管理（页面状态、全局状态）
- 可扩展（自定义组件注册）

### Q3: 低代码平台的局限性？

**参考答案要点**：

- 复杂交互难以表达（DSL 能力边界）
- 性能问题（大量组件的渲染开销）
- 调试困难（运行时解析 vs 编译时）
- 开发者体验（不如直接写代码灵活）
- 趋势：AI + 低代码（自然语言生成 + 代码导出）

---

## 延伸思考

1. **设计题**：设计一个表单低代码平台的 DSL 和渲染引擎。
2. **场景题**：低代码平台渲染 1000 个组件时卡顿，如何优化？
3. **对比题**：低代码 vs ProCode vs AI 生成代码，各自的适用场景？

---

## 参考资料

- [低代码引擎](https://lowcode-engine.cn)
- [JSON Schema](https://json-schema.org)
- [表单设计器](https://xrender.fun/form-render)
