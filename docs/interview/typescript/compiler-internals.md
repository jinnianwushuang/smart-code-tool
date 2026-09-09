---
title: "TypeScript 编译器架构 [P8]"
level: "architect"
tags: ["TypeScript", "编译器", "AST", "类型检查"]
difficulty: "expert"
updated: "2026-09-10"
target: "架构师（P8）"
---

# TypeScript 编译器架构 [P8]

> TypeScript 编译器（tsc）是一个用 TypeScript 编写的工业级编译器。理解其架构对于开发自定义类型检查器、语言服务插件和构建工具至关重要。

## 核心概念（What）

### 编译器管线

```
源码 (.ts)
   │
   ▼
┌─────────────────────────────────────┐
│  1. Scanner（词法分析器）            │
│     源码 → Token 流                  │
├─────────────────────────────────────┤
│  2. Parser（语法分析器）             │
│     Token 流 → AST                   │
├─────────────────────────────────────┤
│  3. Binder（绑定器）                 │
│     AST → Symbol 表                  │
├─────────────────────────────────────┤
│  4. Checker（类型检查器）            │
│     AST + Symbol → 类型验证          │
├─────────────────────────────────────┤
│  5. Emitter（发射器）                │
│     AST → JavaScript 输出            │
└─────────────────────────────────────┘
   │
   ▼
输出 (.js + .d.ts)
```

---

## 底层原理（Why）

### 1. Scanner（词法分析）

```typescript
// Scanner 将源码字符流转换为 Token 流
// 每个 Token 包含：kind、位置、文本

// 示例：
// const x: number = 42;
// → Tokens: [const, x, :, number, =, 42, ;]

// Scanner 的关键设计：
// - 单遍扫描，不缓存
// - 支持增量扫描（编辑器场景）
// - 处理 JSX、模板字符串等复杂语法
```

### 2. Parser（语法分析）

```typescript
// Parser 将 Token 流转换为 AST
// TypeScript 的 AST 节点类型定义在 types.ts 中

// 关键 AST 节点：
// SourceFile → 文件根节点
//   ├── ImportDeclaration
//   ├── VariableStatement
//   │   └── VariableDeclarationList
//   │       └── VariableDeclaration
//   │           ├── name: Identifier
//   │           ├── type: TypeNode
//   │           └── initializer: Expression
//   ├── FunctionDeclaration
//   ├── ClassDeclaration
//   └── ...

// Parser 使用递归下降（Recursive Descent）
// 支持错误恢复（Error Recovery）：遇到语法错误时尝试继续解析
```

### 3. Binder（符号绑定）

```typescript
// Binder 遍历 AST，建立 Symbol 表
// Symbol 是类型系统的核心概念

// Symbol 类型：
// - Value Symbol：变量、函数、类实例
// - Type Symbol：接口、类型别名、类类型
// - Namespace Symbol：命名空间、模块

// Binder 的工作：
// 1. 创建 Symbol 并关联到 AST 节点
// 2. 建立作用域链
// 3. 解析名称引用（Name Resolution）
// 4. 检测重复声明
```

### 4. Checker（类型检查）

```typescript
// Checker 是编译器最复杂的部分
// 它遍历 AST，为每个表达式推断类型，并验证类型兼容性

// 类型推断流程：
// 1. 获取表达式的类型（getTypeAtLocation）
// 2. 检查类型兼容性（isTypeAssignableTo）
// 3. 报告类型错误

// 关键类型操作：
// - 结构化类型比较（Structural Comparison）
// - 泛型实例化（Generic Instantiation）
// - 条件类型求值（Conditional Type Evaluation）
// - 类型保护窄化（Type Narrowing）

// 类型检查的性能优化：
// - 类型缓存（Type Cache）
// - 延迟求值（Lazy Evaluation）
// - 增量检查（Incremental Checking）
```

### 5. 语言服务（Language Service）

```typescript
// TypeScript Language Service 是编辑器和 IDE 的核心
// 它提供：
// - 自动补全
// - 跳转到定义
// - 查找引用
// - 重构
// - 悬停提示
// - 诊断信息

// Language Service API
interface LanguageService {
  getCompletionsAtPosition(fileName, position): CompletionInfo;
  getDefinitionAtPosition(fileName, position): DefinitionInfo[];
  getReferencesAtPosition(fileName, position): ReferenceEntry[];
  getQuickInfoAtPosition(fileName, position): QuickInfo;
  getSemanticDiagnostics(fileName): Diagnostic[];
}

// tsserver 是 Language Service 的进程化封装
// VS Code 通过 tsserver 获取 TypeScript 智能提示
```

### 6. 自定义 Transformer

```typescript
// TypeScript 编译器支持自定义 AST 转换
// 用于实现代码转换、类型擦除、宏等

import * as ts from 'typescript';

// 自定义 Transformer：将所有 console.log 替换为空操作
function removeConsoleTransformer(context: ts.TransformationContext) {
  return (sourceFile: ts.SourceFile) => {
    function visit(node: ts.Node): ts.Node {
      if (ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.expression.getText() === 'console' &&
          node.expression.name.text === 'log') {
        return ts.factory.createVoidZero(); // 替换为 void 0
      }
      return ts.visitEachChild(node, visit, context);
    }
    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  };
}

// 使用
const result = ts.transform(sourceFile, [removeConsoleTransformer]);
```

---

## 高频面试题

### Q1: TypeScript 编译器的工作流程是什么？

**参考答案要点**：
- Scanner → Parser → Binder → Checker → Emitter 五阶段
- Scanner 词法分析生成 Token 流
- Parser 递归下降生成 AST
- Binder 建立 Symbol 表和作用域链
- Checker 类型推断和验证
- Emitter 输出 JavaScript 和声明文件

### Q2: TypeScript 的类型检查是编译时还是运行时？

**参考答案要点**：
- 完全在编译时，编译后类型信息全部擦除
- 编译产物是纯 JavaScript，不包含任何类型信息
- 这与 Java/C# 的泛型不同（它们有运行时类型擦除/具化）
- 因此不能用 typeof 检查 TypeScript 类型

### Q3: 如何开发一个 TypeScript 编译器插件？

**参考答案要点**：
- 使用 Custom Transformer API
- 通过 ts.transform() 注册自定义转换
- 可以修改 AST 实现代码转换
- 常用于：代码生成、类型擦除优化、宏展开
- 构建工具集成：ts-loader 的 transformers 选项

---

## 延伸思考

1. **设计题**：如果让你设计一个 TypeScript 到 Rust 的编译器，最大的挑战是什么？
2. **场景题**：如何为团队开发一个自定义的 TypeScript lint 规则？
3. **对比题**：TypeScript 编译器 vs Babel vs SWC，各自的架构差异？

---

## 参考资料

- [TypeScript Compiler Architecture](https://github.com/microsoft/TypeScript/wiki/Architectural-Overview)
- [TypeScript 源码](https://github.com/microsoft/TypeScript)
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
