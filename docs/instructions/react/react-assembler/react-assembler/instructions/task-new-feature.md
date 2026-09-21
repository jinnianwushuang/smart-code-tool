# 任务：新需求开发

> 从零创建符合架构规范的新页面/模块。

## 执行步骤

### 1. 分析需求

```
1. 理解需求描述，确定页面/模块的功能范围
2. 识别需要的子组件（搜索区、表格区、对话框等）
3. 识别需要的状态（列表数据、表单数据、分页等）
4. 识别需要的 API 接口
5. 如有歧义，触发「存疑即问」
```

### 2. 创建目录结构

```
pages/<页面名>/
├── index.jsx                    # 页面入口
├── hooks/
│   └── use-<页面名>.js          # 页面 Hook
├── components/                  # 页面级组件
│   ├── SearchBar.jsx
│   ├── DataTable.jsx
│   └── ActionDialog.jsx
├── actions/                     # Actions（如需表单提交）
│   └── <操作名>-action.js
└── styles/
    └── index.module.css
```

### 3. 创建页面 Hook

```
1. 参照 architecture/hooks-reference.md 创建页面 Hook
2. 声明所有状态（useState）
3. 实现数据获取逻辑
4. 实现事件处理函数（handle*）
5. 实现初始加载（useEffect）
6. 返回状态和方法对象
```

### 4. 创建页面入口组件

```
1. 参照 architecture/component-reference.md
2. 调用页面 Hook 获取状态
3. 组合子组件，通过 props 传递数据和回调
4. 保持组件简洁，逻辑全在 Hook 中
```

### 5. 创建子组件

```
1. 每个子组件一个文件，PascalCase.jsx 命名
2. 通过 props 接收数据和回调函数
3. 使用 UI 框架组件（参照 config.md 中的 ui_component_mapping）
4. 样式遵循 CSS 优先级链
```

### 6. 执行通用步骤

```
→ 执行 common-steps.md 中的步骤 D（静态分析自检）
→ 执行 common-steps.md 中的步骤 E（输出执行报告）
```

## 完成标准

- [ ] 页面可正常渲染（结构完整）
- [ ] 页面 Hook 包含所有需要的状态和方法
- [ ] 子组件通过 props 正确通信
- [ ] 代码符合命名规范和代码量约束
- [ ] 注释比例达标
