---
title: 状态定义与组装器说明
order: 100
---

# 状态定义与组装器说明

## 目录结构

```
state/
├── config.js
├── computed.js
├── multiton.js
├── singleton.js
└── singleton/
```

## `state/singleton.js`

`singleton.js` 是当前模块的状态入口，负责扫描本目录下的 `module/**/*.js` 和 `state/*.js`，并交给外部的 `atoms_assembler` 统一装配。

```javascript
import { atoms_assembler } from 'src/output/common/project-common.js'
const modules = import.meta.glob(['../module/**/*.js', '../state/*.js'], {
  eager: true,
})
export const all_atoms_assembler = () => {
  return atoms_assembler({
    public_assembler,
    manual_assembler,
    current_file_path,
    modules,
  })
}
```

- `public_assembler` 用于声明公共外部模块
- `manual_assembler` 用于手动引入不在 `composable_common` 中的模块
- `modules` 是通过 `import.meta.glob` 扫描出的动态模块

## `state/multiton.js`

该文件用于定义多实例状态，适用于需要多个独立实例共享逻辑但不共享数据的场景。

## `state/computed.js`

当前实现中提供了一个演示性的计算属性创建函数：

```javascript
import { computed } from 'vue'
export const create_computed_variable = (payload) => {
  const demo_computed = computed(() => {
    return 'demo_computed'
  })
  return {
    demo_computed,
  }
}
```

它说明了：
- 可以在 `payload` 内解构上下文
- 返回 `computed` 变量供组件使用

## `state/config.js`

用于保存当前模板的配置信息，例如下拉列表选项、表格列配置等。

```javascript
export const demo_options = []
```

## 组装器工作流程

1. `index.vue` 调用 `all_atoms_assembler()` 获取当前模块所有状态和方法
2. `all_atoms_assembler()` 使用 `atoms_assembler` 统一装配扫描到的模块
3. `useContextAssembler(base_payload, all_atoms_assembler())` 将装配结果注入组件

这样，`state/` 中新增文件即可自动参与当前模板的状态装配，无需手动 import。

## 结论

- `state/` 目录提供模块化状态定义
- `singleton.js` 是当前模板最核心的状态入口
- `computed.js` 和 `config.js` 演示了可扩展的状态/计算属性结构
- 该机制保证了可插拔的状态扩展能力
