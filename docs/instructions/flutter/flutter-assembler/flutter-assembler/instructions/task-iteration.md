# 任务：需求迭代

> 在已有页面基础上增加或修改功能。

## 执行步骤

### 1. 分析变更范围

```
1. 读取目标页面现有代码，理解现有结构
2. 确定需要修改的文件（Controller / Widget / Binding）
3. 评估变更对现有功能的影响
4. 如有歧义，触发「存疑即问」
```

### 2. 修改 Controller

```
1. 参照 architecture/controller-reference.md
2. 在现有 Controller 中添加新状态/方法
3. 新增事件处理函数
4. 确保不破坏现有功能
5. 如果 Controller 过大，拆分为多个子 Controller
```

### 3. 修改/新增 Widget

```
1. 参照 architecture/widget-reference.md
2. 修改现有 Widget 的 UI 结构
3. 或创建新子组件（参照 common-steps.md 步骤 C）
4. const 构造函数优先
5. Obx 下沉至叶子节点
```

### 4. 验证变更

```
→ 执行 common-steps.md 中的步骤 D（静态分析自检）
→ 确认新增功能与现有功能不冲突
```

### 5. 输出报告

```
→ 执行 common-steps.md 中的步骤 E（输出执行报告）
→ 额外列出：变更影响范围、是否有破坏性变更
```

## 完成标准

- [ ] 新功能已实现
- [ ] 现有功能未被破坏
- [ ] 代码符合命名规范和代码量约束
- [ ] 注释已更新
- [ ] 执行报告已输出
