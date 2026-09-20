# 复核自检清单

> AI 完成检查任务后，必须逐项自检确认。

## 1. 检查范围

- [ ] 检查范围已正确确定（指定目录或全项目）
- [ ] `.gitignore` 排除规则已生效
- [ ] `exclude_dirs` / `exclude_files` 额外排除已生效
- [ ] 未检查被排除的文件

## 2. 维度覆盖

- [ ] 代码规范（code-quality）已检查
- [ ] React 组件（react-component）已检查
- [ ] 性能（performance）已检查
- [ ] 内存管理（memory-management）已检查
- [ ] 并发处理（concurrency）已检查
- [ ] 国际化（i18n）已检查（如开关开启）或已跳过（如开关关闭）
- [ ] 安全（security）已检查
- [ ] 错误处理（error-handling）已检查
- [ ] 组件设计（component-design）已检查
- [ ] 代码卫生（code-hygiene）已检查

## 3. 报告质量

- [ ] 每条问题标注了严重级别（Error / Warning / Info）
- [ ] 每条问题包含文件路径和行号
- [ ] 每条问题包含修复建议
- [ ] 问题按维度分组

## 4. 报告规范

- [ ] 报告文件名格式正确：`{任务类型}_{检查目标}_{YYYY-MM-DD-HH-mm-ss}.md`
- [ ] 报告保存在 `code_review_report_dir` 指定的目录
- [ ] 如有上次报告，已追加对比章节
- [ ] `_index.md` 总表已更新

## 5. 约束遵守

- [ ] 未修改任何源代码
- [ ] ESLint 检查仅为建议性质
- [ ] 未瞎猜或脑补问题
