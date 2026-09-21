# 任务：重构

> 将现有代码改造为 GetX 架构规范。

## 执行步骤

### 1. 分析现有代码

```
1. 读取目标文件/模块的现有代码
2. 识别当前架构模式（是否有 Controller、是否有状态管理）
3. 确定需要改造的部分
4. 评估改造影响范围
5. 如有歧义，触发「存疑即问」
```

### 2. 制定改造方案

```
1. 说明当前问题（为什么需要重构）
2. 提出改造方案（至少 1 个，复杂情况给出 2 个选项）
3. 列出改造涉及的文件清单
4. 评估改造风险
```

### 3. 创建/改造 Controller

```
1. 参照 architecture/controller-reference.md
2. 将业务逻辑从 Widget 迁移到 Controller
3. 声明响应式状态（.obs）和简单状态
4. 实现生命周期钩子（onInit/onReady/onClose）
5. 迁移事件处理方法
```

### 4. 创建/改造 Binding

```
1. 参照 common-steps.md 步骤 A
2. 确保 Controller 通过 Binding 注册
3. 移除 Widget 中的 Get.put 调用
```

### 5. 改造 Widget

```
1. 参照 architecture/widget-reference.md
2. 页面入口改为 GetView<Controller>
3. 移除 build 方法中的业务逻辑
4. const 构造函数优先
5. Obx 下沉至叶子节点
```

### 6. 验证改造

```
→ 执行 common-steps.md 中的步骤 D（静态分析自检）
→ 确认改造后功能与改造前一致
```

### 7. 输出报告

```
→ 执行 common-steps.md 中的步骤 E（输出执行报告）
→ 额外列出：改造前后对比、是否有破坏性变更
```

## 完成标准

- [ ] 业务逻辑全部迁移到 Controller
- [ ] Widget 的 build 方法只做 UI 描述
- [ ] Controller 通过 Binding 注册
- [ ] 代码符合 GetX 架构规范
- [ ] 注释已更新
- [ ] 执行报告已输出
