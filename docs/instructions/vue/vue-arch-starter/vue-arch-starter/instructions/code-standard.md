# 代码规范

> 模板代码遵循的编写约定，AI 在指导开发者时需遵守。

## 1. 导入规范

```javascript
// ✅ 正确：使用 src/ 别名
import { atoms_assembler } from 'src/common/architecture-design/assembler/assemble_atoms.js'

// ❌ 错误：使用相对路径
import { atoms_assembler } from '../../../common/architecture-design/assembler/assemble_atoms.js'

// ❌ 错误：使用绝对路径
import { atoms_assembler } from '/Users/dev/project/src/common/...'
```

## 2. 文件命名

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 目录 | kebab-case | `multiton-template/`、`event-pipeline/` |
| JS 文件 | kebab-case | `assemble_atoms.js`、`useContextAssembler.js` |
| Vue 文件 | kebab-case | `index.vue`、`component-demo.vue` |
| SCSS 文件 | kebab-case | `dark-variables.scss` |
| Composable | camelCase 以 use 开头 | `useContextAssembler.js` |

## 3. 模块目录约定

```
standardization/<模板名>/
├── state/              ← 状态机定义
│   ├── config.js       ← 配置状态
│   ├── computed.js     ← 计算属性
│   ├── multiton.js     ← 多例状态
│   └── singleton/      ← 单例状态
├── module/             ← 功能模块
│   ├── lifecycle/      ← 生命周期钩子
│   ├── effect/         ← 副作用（timer/listener/watcher/dom/mitter/other）
│   ├── emit/           ← 父组件通信
│   ├── event-pipeline/ ← 事件通道
│   ├── exposed-method/ ← 对外暴露方法
│   └── other-method/   ← 其他方法
├── assembler/          ← 装配器配置
├── component/          ← 组件
└── css/                ← 样式
```

## 4. CSS 规范

- 组件样式使用 `<style scoped lang="scss">`
- 全局样式变量放在 `src/css/` 目录
- CSS 复用优先级：框架组件库 > 插件/主题包 > 全局 CSS 变量 > 自定义 scoped CSS
- 更换 UI 框架时，同步替换 CSS 变量文件

## 5. 注释规范

- 每个模块文件顶部添加功能说明注释
- 装配器配置中的 `public_assembler` 和 `manual_assembler` 列表需注释用途
- 关键业务逻辑添加行内注释
