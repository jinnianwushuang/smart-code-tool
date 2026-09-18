# 门禁检查 — 前置条件

> AI 在执行任何任务前，必须先通过以下检查。任一不通过则停止，告知使用者缺失项。

## 1. 配置完整性检查

- [ ] config.md 已填写且关键路径配置不为空
- [ ] `template_core_path` 已配置
- [ ] `atoms_assembler_import_path` 已配置
- [ ] `use_context_assembler_import_path` 已配置
- [ ] `ui_framework` 已配置

## 2. 核心文件存在性检查

- [ ] 装配器文件存在：`assembler/assembler.js`
- [ ] 主页面文件存在：`index.vue`
- [ ] 生命周期模块存在：`module/lifecycle/lifecycle.js`
- [ ] 状态目录存在：`state/` 目录及其中的文件

## 3. 任务信息检查

- [ ] 任务类型已明确（新需求 / 重构 / 迭代 / 修复 / 代码检查）
- [ ] 目标文件或目录已指定
- [ ] 需求描述足够清晰，无歧义

## 4. 依赖检查

- [ ] Vue 3 相关依赖已安装
- [ ] UI 框架依赖已安装（根据 config.md 中的配置）
- [ ] Vite 构建工具可用

## 检查失败处理

- 配置缺失 → 提示使用者补充 config.md
- 文件不存在 → 提示使用者确认路径或先创建模板文件
- 信息不足 → 触发「存疑即问」，向使用者提问
- 依赖缺失 → 提示使用者安装依赖
