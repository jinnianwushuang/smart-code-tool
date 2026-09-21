# 生命周期约束参照

> Flutter Widget 与 GetxController 生命周期约束规则、Isolate 并发策略。

## 核心原则

1. **禁止在 build 内调用 Get.put**：依赖注入必须在 Binding 或生命周期钩子中
2. **禁止在 build 内修改状态**：build 是纯描述方法，不得有副作用
3. **Isolate 处理 CPU 密集任务**：JSON 解析、图片处理、大数据排序必须走 Isolate
4. **异步操作必须在生命周期内**：API 调用在 onReady，不在构造函数
5. **dispose 必须完整清理**：Controller 和 Widget 的资源清理不可遗漏

## 禁止在 build 内的操作

```dart
/// ❌ 禁止清单（在 build 方法内）
@override
Widget build(BuildContext context) {
  Get.put(MyController());          // ❌ 依赖注入
  Get.find<MyController>().init();  // ❌ 初始化操作
  controller.loadData();            // ❌ 触发 API 调用
  setState(() { count++; });        // ❌ 修改状态
  Navigator.push(context, ...);     // ❌ 路由跳转
  showDialog(context: context, ...); // ❌ 弹窗
  return Container();
}

/// ✅ 正确做法
class MyPage extends GetView<MyController> {
  const MyPage({super.key});

  @override
  Widget build(BuildContext context) {
    // build 只做 UI 描述，不包含任何副作用
    return Scaffold(
      body: Obx(() => _buildContent()),
    );
  }

  Widget _buildContent() {
    if (controller.isLoading.value) {
      return const CircularProgressIndicator();
    }
    return ListView.builder(
      itemCount: controller.items.length,
      itemBuilder: (_, i) => ListTile(title: Text(controller.items[i])),
    );
  }
}
```

## 生命周期执行顺序

```
路由跳转触发页面创建
     │
     ▼
┌─────────────────────┐
│ Binding.dependencies │  ← Controller 注册（Get.lazyPut）
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Controller.onInit    │  ← 同步初始化（监听器、本地资源）
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Widget.build (首次)  │  ← 首次构建 UI
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Controller.onReady   │  ← 异步初始化（API 调用、数据加载）
└────────┬────────────┘
         │
         ▼
    页面正常运行
    （build 被状态变化触发多次重建）
         │
         ▼
┌─────────────────────┐
│ Controller.onClose   │  ← 资源清理
│ Binding 自动解注册    │
└─────────────────────┘
```

## Isolate 并发策略

```dart
/// CPU 密集任务必须走 Isolate
class DataProcessController extends GetxController {
  final processedData = <Result>[].obs;
  final isProcessing = false.obs;

  /// ✅ 大数据处理使用 compute（Isolate 封装）
  Future<void> handleProcessLargeData(List<Map<String, dynamic>> raw) async {
    isProcessing.value = true;
    try {
      // compute 会自动在独立 Isolate 中执行
      final result = await compute(_parseDataInIsolate, raw);
      processedData.assignAll(result);
    } finally {
      isProcessing.value = false;
    }
  }

  /// 在 Isolate 中执行的函数（必须是顶层或 static）
  static List<Result> _parseDataInIsolate(List<Map<String, dynamic>> raw) {
    return raw.map((item) => Result.fromJson(item)).toList()
      ..sort((a, b) => b.score.compareTo(a.score));
  }
}
```

### 何时使用 Isolate

| 场景                   | 是否用 Isolate | 说明                       |
| ---------------------- | -------------- | -------------------------- |
| JSON 解析（< 100 条）  | 否             | 数据量小，主线程即可       |
| JSON 解析（> 1000 条） | 是             | 大数据量避免 UI 卡顿       |
| 图片处理/压缩          | 是             | CPU 密集                   |
| 复杂排序/过滤          | 视情况         | 数据量大时用 Isolate       |
| API 请求               | 否             | I/O 操作，async/await 即可 |
| 数据库读写             | 否             | I/O 操作，async/await 即可 |
| 文件读写               | 否             | I/O 操作，async/await 即可 |

## 异步操作约束

```dart
class DataController extends GetxController {
  final items = <Item>[].obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    // ✅ onInit 中做同步初始化
    _setupListeners();
  }

  @override
  void onReady() {
    super.onReady();
    // ✅ onReady 中做异步初始化（首次数据加载）
    loadData();
  }

  /// ✅ 异步数据加载标准模式
  Future<void> loadData() async {
    isLoading.value = true;
    try {
      final data = await Get.find<DataApi>().fetchItems();
      items.assignAll(data);
    } on DioException catch (e) {
      // 网络错误处理
      Get.snackbar('错误', '网络请求失败：${e.message}');
    } catch (e) {
      // 通用错误处理
      Get.snackbar('错误', '数据加载失败：$e');
    } finally {
      isLoading.value = false;
    }
  }

  void _setupListeners() {
    // 同步监听器设置
    ever(items, _onItemsChanged);
  }

  void _onItemsChanged(List<Item> newItems) {
    // 响应 items 变化
  }
}
```

## Widget 生命周期与 GetX 配合

```dart
/// StatefulWidget + GetX 的正确配合
class ComplexWidget extends StatefulWidget {
  const ComplexWidget({super.key});

  @override
  State<ComplexWidget> createState() => _ComplexWidgetState();
}

class _ComplexWidgetState extends State<ComplexWidget> {
  // Widget 局部状态用 StatefulWidget
  late final AnimationController _animationController;
  late final ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    // 必须完整清理
    _animationController.dispose();
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    // 滚动监听逻辑
  }

  @override
  Widget build(BuildContext context) {
    // 使用 GetX Controller 的响应式状态
    final controller = Get.find<MyController>();
    return Obx(() => Text('${controller.count}'));
  }
}
```

## 资源清理完整清单

### Controller 中

```dart
@override
void onClose() {
  // Rx 变量
  _obs1.close();
  _obs2.close();

  // Timer
  _timer?.cancel();

  // Debounce
  _debounce?.cancel();

  // Stream 订阅
  _subscription?.cancel();

  // Worker（ever/once/debounce 返回的）
  _worker?.dispose();

  super.onClose();
}
```

### StatefulWidget 中

```dart
@override
void dispose() {
  // AnimationController
  _animController.dispose();

  // ScrollController
  _scrollController.dispose();

  // TextEditingController
  _textController.dispose();

  // FocusNode
  _focusNode.dispose();

  // StreamController
  _streamController.close();

  super.dispose();
}
```
