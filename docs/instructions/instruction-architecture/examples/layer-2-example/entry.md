# 第 3 层：日常开发 — 完整示例

> 本示例展示一个典型的第 3 层指令集结构

---

## 目录结构

```
layer-3-dev/
├── entry.md              # 入口文件（模块索引 + 路由）
├── new-feature.md        # 新功能开发指令
├── refactor.md           # 重构指令
├── fix.md                # 修复指令
└── self-check.md         # 模块自检指令
```

---

## entry.md 示例

```markdown
# 日常开发指令集

## 可用指令

### 无参数（直接执行）

- 无

### 需要参数

- [新功能开发](./new-feature.md) — 参数：module（必须）
- [重构](./refactor.md) — 参数：module（必须）, scope（可选）
- [修复](./fix.md) — 参数：module（必须）, issue（必须）
- [模块自检](./self-check.md) — 参数：module（必须）

## 使用方式

选择对应指令，提供所需参数后执行。
示例：`执行 fix 指令，module=pages/login，issue=登录按钮点击无响应`
```

---

## new-feature.md 示例

```markdown
<!--
@instruction: 新功能开发
@mode: parameterized
@params:
  - name: module
    type: path
    required: true
    description: 目标模块路径
    example: project/code-tool-app/pages/excel-stats
  - name: component
    type: string
    required: false
    description: 目标组件名（不指定则操作整个模块）
-->

# 新功能开发

## 门禁检查

- [ ] 参数 module 已提供且指向有效目录
- [ ] 已加载第 2 层基础上下文
- [ ] 当前分支为开发分支

## 执行步骤

1. 读取目标模块目录结构，了解现有文件
2. 读取模块内现有组件，了解命名规范和代码风格
3. 根据需求创建新组件/文件，遵循现有风格
4. 更新模块索引文件（如有）
5. 输出变更清单

## 约束

- 仅操作 module 指定目录下的文件
- 不得修改 shared/ 或 common/ 目录
- 新文件命名遵循项目命名规范

## 熔断条件

- 遇到架构违规 → 停止并报告
- 不确定如何集成 → 标记为"需确认"
```

---

## self-check.md 示例

```markdown
<!--
@instruction: 模块自检
@mode: parameterized
@params:
  - name: module
    type: path
    required: true
    description: 目标模块路径
-->

# 模块自检

## 门禁检查

- [ ] 参数 module 已提供且指向有效目录
- [ ] 模块目录存在且非空

## 检查清单

1. **文件结构检查**：目录结构是否符合项目规范
2. **命名检查**：文件名、组件名是否符合命名规范
3. **依赖检查**：是否有未声明的依赖引用
4. **架构检查**：是否存在跨层调用或循环依赖
5. **注解检查**：核心模块是否有 AUTO_DOC 注解

## 输出格式
```

## 自检报告：{module}

### 通过项

- ✅ ...

### 警告项

- ⚠️ ...

### 失败项

- ❌ ...

### 建议

- ...

```

## 边界

- 只做静态分析，不启动项目
- 不自动修复问题，仅报告
```

---

## 使用说明

本示例展示了第 3 层的核心特征：

- **必须参数**：每条指令都需要 module 参数
- **门禁检查**：执行前验证条件
- **约束明确**：限定操作范围
- **熔断机制**：遇到问题停止而非强行继续
- **输出格式**：预定义的报告模板
