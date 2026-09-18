# 门禁检查

> 在执行任何任务前，必须先完成以下检查。

## 前置条件清单

### 1. 配置完整性

- [ ] `config.md` 中 `project_name` 已填写
- [ ] `config.md` 中 `project_root` 已填写
- [ ] `config.md` 中 `ui_framework` 已选择
- [ ] `config.md` 中 `src_alias_path` 已确认

### 2. 环境就绪

- [ ] 项目已安装 Node.js（建议 >= 18）
- [ ] 包管理器已安装（pnpm / npm / yarn）
- [ ] 已按 `dependencies.md` 安装所有必需依赖

### 3. 代码就位

- [ ] `code-template/` 目录内容已复制到项目 `src/` 下
- [ ] `vite.config.js` 中已配置 `src/` 路径别名
- [ ] SCSS 预处理器已配置（如使用 Quasar）

### 4. 路径验证

- [ ] 所有 import 路径使用 `src/` 别名，无绝对路径或错误相对路径
- [ ] `composable/index.js` 中的导出路径正确

## 检查失败处理

如果任何检查项未通过：

1. 列出未通过的项目
2. 给出具体的修复指导
3. 等待用户确认修复完成后再继续
