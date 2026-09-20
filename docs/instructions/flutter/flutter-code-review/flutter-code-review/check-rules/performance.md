# 性能（performance）

> 检查 Flutter 3 项目中的常见性能问题。默认 Impeller 渲染引擎。

## 检查项

### 1. 未使用 const Widget 复用

- **严重级别**：🟡 Warning
- **检查方式**：检查频繁重建的父级下是否存在可 `const` 化却未加 `const` 的子 Widget
- **处理建议**：`const` Widget 在重建时被复用，可显著减少 rebuild 与 relayout

### 2. 长列表未使用 ListView.builder

- **严重级别**：🟡 Warning
- **检查方式**：检查大数据量列表是否使用 `ListView(children: [...])` 一次性构建全部子项
- **问题示例**：

```dart
// ❌ 一次性构建所有项，数据多时卡顿
ListView(children: items.map((e) => ItemTile(e)).toList())
```

- **正确写法**：

```dart
// ✅ 懒构建，仅渲染可视区域
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemTile(items[index]),
)
```

### 3. 缺少 RepaintBoundary 隔离重绘

- **严重级别**：🔵 Info
- **检查方式**：检查频繁重绘的区域（动画、视频、进度）是否用 `RepaintBoundary` 隔离，避免波及兄弟节点
- **处理建议**：对高频重绘子树包裹 `RepaintBoundary`

### 4. 不必要的整页重建

- **严重级别**：🟡 Warning
- **检查方式**：检查是否用 `setState` 刷新整个页面，而实际只有局部变化；GetX 项目中 `Obx` / `GetBuilder` 是否粒度过大
- **处理建议**：局部刷新下沉到叶子 Widget；GetX 用 `Obx` 精确包裹响应式节点，或 `GetBuilder(id:)` 局部刷新

### 5. 图片资源未优化

- **严重级别**：🔵 Info
- **检查方式**：检查是否设置了 `cacheWidth` / `cacheHeight`、`Image.asset` 是否配置合理分辨率、网络图是否用缓存组件（`cached_network_image`）
- **问题示例**：

```dart
// ❌ 原图直接解码到内存，大图易 OOM
Image.network(url)
```

- **正确写法**：

```dart
// ✅ 限制解码尺寸
Image.network(url, cacheWidth: 400, cacheHeight: 400)
```

### 6. CPU 密集计算阻塞 UI 线程

- **严重级别**：🟡 Warning
- **检查方式**：检查大 JSON 解析、复杂计算、文件处理是否在主 Isolate 同步执行
- **处理建议**：使用 `compute()` 或 `Isolate.run()` 将 CPU 密集任务放到独立 Isolate

```dart
final result = await Isolate.run(() => heavyCompute(data));
```
