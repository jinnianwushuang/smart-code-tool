# 任务：新项目集成

> 引导开发者在全新的 Vue 3 项目中搭建装配架构骨架。

## 前置条件

- `config.md` 必填项已完成
- `gate-check.md` 检查通过

## 执行步骤

### Step 1：确认配置（复用 common-steps Step A）

### Step 2：安装依赖（复用 common-steps Step B）

输出完整的安装命令，等待用户执行并确认。

### Step 3：复制代码（复用 common-steps Step C）

指导用户将 `code-template/` 内容复制到项目 `src/` 下。

### Step 4：配置 Vite（复用 common-steps Step D）

参考 `vite.config.template.js`，指导用户配置路径别名和插件。

### Step 5：验证集成（复用 common-steps Step E）

建议用户：
1. 在路由中添加测试路由，指向 `standardization/multiton-template/index.vue`
2. 启动开发服务器
3. 访问页面，确认无报错

### Step 6：清理验证页面（复用 common-steps Step F）

### Step 7：输出完成摘要

```
✅ 架构骨架搭建完成！

目录结构：
  src/standardization/   ← 标准模板（多例 + 单例）
  src/common/            ← 装配引擎核心
  src/composable/        ← 架构组合函数
  src/css/               ← 全局样式变量

下一步：
  1. 参考 multiton-template/ 创建你的第一个业务组件
  2. 如需定制（换 UI 框架、加模块），请执行「定制修改」任务
```

## 常见问题

集成过程中如遇问题，参考 `docs/integration.md` 末尾的 Common Pitfalls FAQ 章节。
