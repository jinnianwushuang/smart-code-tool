# 并发处理（concurrency）

> 检查异步操作和并发场景中的安全问题。

## 检查项

### 1. API 请求竞态条件

- **严重级别**：🔴 Error
- **检查方式**：检查是否存在快速连续发起多个请求但未处理竞态的模式（如搜索、分页切换），后发请求可能先返回导致旧数据覆盖
- **问题示例**：

```dart
Future<void> search(String keyword) async {
  final res = await api.search(keyword);
  results.value = res.data; // 旧请求晚返回会覆盖新结果
}
```

- **正确写法**：

```dart
int _reqId = 0;
Future<void> search(String keyword) async {
  final id = ++_reqId;
  final res = await api.search(keyword);
  if (id == _reqId) results.value = res.data; // 仅最新请求生效
}
```

- **处理建议**：使用请求 ID / `CancelableToken`（Dio）取消旧请求，GetX 可用 `debounce` Worker

### 2. async gap 后访问 context/state 未判 mounted

- **严重级别**：🔴 Error
- **检查方式**：检查 `await` 之后是否直接访问 `BuildContext`、调用 `setState`、`Get.snackbar` 等而未判断 `mounted`（`use_build_context_synchronously`）
- **问题示例**：

```dart
await fetchData();
Navigator.push(context, ...); // ❌ await 后 context 可能已失效
```

- **正确写法**：

```dart
await fetchData();
if (!mounted) return;      // StatefulWidget
Navigator.push(context, ...);
// 或 GetxController 中判断 isClosed
if (isClosed) return;
```

### 3. Future / Stream 未处理错误

- **严重级别**：🟡 Warning
- **检查方式**：检查 `async/await` 是否有 `try/catch`，`Future` 是否有 `catchError`，`Stream` 是否有 `onError`
- **正确写法**：

```dart
try {
  final data = await api.getData();
  list.value = data;
} catch (e, s) {
  logger.error('加载失败', e, s);
}
```

### 4. 防抖/节流缺失

- **严重级别**：🟡 Warning
- **检查方式**：检查高频触发场景（搜索输入、滚动加载、按钮连点）是否使用了防抖或节流
- **处理建议**：使用 GetX `debounce` / `interval` Worker，或 `easy_debounce` 等库；按钮点击做防重复提交
