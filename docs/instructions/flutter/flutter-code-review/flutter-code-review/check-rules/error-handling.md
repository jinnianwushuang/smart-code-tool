# 错误处理（error-handling）

> 检查项目中的错误处理完整性，确保异常场景有合理的兜底方案。

## 检查项

### 1. 异步/网络请求无错误处理

- **严重级别**：🔴 Error
- **检查方式**：检查所有 `await` 网络/IO 调用是否有 `try/catch` 包裹，是否存在空 `catch {}`
- **问题示例**：

```dart
// 无 catch
final res = await api.getData();

// 空 catch
try {
  await api.getData();
} catch (e) {} // 吞掉错误
```

- **正确写法**：

```dart
try {
  final res = await api.getData();
  list.value = res.data;
} catch (e, s) {
  Get.snackbar('加载失败'.tr, '请稍后重试'.tr);
  logger.error('API error', e, s);
}
```

### 2. Dio 未配置错误拦截器

- **严重级别**：🟡 Warning
- **检查方式**：检查 Dio 是否配置了 `InterceptorsWrapper` / 自定义 Interceptor 统一处理 `onError`，是否将 `DioException` 转成友好的 `ApiResult`
- **处理建议**：在拦截器中统一处理超时、网络错误、业务错误码，返回 sealed class 结果

### 3. 缺少全局错误捕获

- **严重级别**：🟡 Warning
- **检查方式**：检查 `main` 中是否配置了 `FlutterError.onError` 与 `runZonedGuarded` / `PlatformDispatcher.instance.onError`
- **正确写法**：

```dart
void main() {
  runZonedGuarded(() {
    WidgetsFlutterBinding.ensureInitialized();
    FlutterError.onError = (details) {
      FlutterError.presentError(details);
      // 上报错误到监控平台
    };
    runApp(const MyApp());
  }, (error, stack) {
    // 上报未捕获异常
  });
}
```

### 4. 用户可见的错误未友好化

- **严重级别**：🟡 Warning
- **检查方式**：检查错误提示是否直接将技术异常信息（堆栈、异常 message）展示给用户
- **问题示例**：

```dart
catch (e) {
  Get.snackbar('错误', e.toString()); // ❌ 暴露 DioException / 堆栈
}
```

- **正确写法**：

```dart
catch (e, s) {
  Get.snackbar('操作失败'.tr, '请稍后重试'.tr);
  logger.error('技术详情', e, s); // 技术信息只记日志
}
```

### 5. ErrorWidget / 加载失败兜底缺失

- **严重级别**：🔵 Info
- **检查方式**：检查 `FutureBuilder` / `StreamBuilder` 的 `error` 分支、`Image` 的 `errorBuilder`、路由错误页是否有兜底 UI
- **正确写法**：

```dart
Image.network(url, errorBuilder: (_, __, ___) => const Icon(Icons.broken_image))
```

- **处理建议**：为异步与资源加载提供友好的降级 UI，避免展示红屏
