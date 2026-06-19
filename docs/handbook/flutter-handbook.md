# Flutter 开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: 移动应用开发者、跨平台开发者

---

## 📑 目录

- [一、基础概念](#一基础概念)
- [二、Widget](#二widget)
- [三、布局](#三布局)
- [四、状态管理](#四状态管理)
- [五、导航](#五导航)
- [六、网络请求](#六网络请求)
- [七、本地存储](#七本地存储)
- [八、动画](#八动画)
- [九、平台集成](#九平台集成)
- [十、最佳实践](#十最佳实践)

---

## 一、基础概念

### 1.1 Hello World

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      home: Scaffold(
        appBar: AppBar(title: const Text('Flutter Demo')),
        body: const Center(child: Text('Hello, World!')),
      ),
    );
  }
}
```

### 1.2 Widget 树

```
MaterialApp
└── Scaffold
    ├── AppBar
    │   └── Text
    └── Body
        └── Center
            └── Column
                ├── Text
                └── ElevatedButton
```

### 1.3 StatelessWidget vs StatefulWidget

```dart
// StatelessWidget (无状态)
class MyWidget extends StatelessWidget {
  const MyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Container();
  }
}

// StatefulWidget (有状态)
class MyWidget extends StatefulWidget {
  const MyWidget({super.key});

  @override
  State<MyWidget> createState() => _MyWidgetState();
}

class _MyWidgetState extends State<MyWidget> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return Text('$count');
  }
}
```

---

## 二、Widget

### 2.1 基础 Widget

```dart
// 文本
Text('Hello', style: TextStyle(fontSize: 16))

// 图标
Icon(Icons.home, size: 24, color: Colors.blue)

// 图片
Image.network('https://example.com/image.jpg')
Image.asset('assets/images/logo.png')
Image.file(File('/path/to/image'))
Image.memory(bytes)

// 按钮
ElevatedButton(onPressed: () {}, child: Text('Button'))
TextButton(onPressed: () {}, child: Text('Button'))
OutlinedButton(onPressed: () {}, child: Text('Button'))
IconButton(icon: Icon(Icons.add), onPressed: () {})

// 输入框
TextField(
  decoration: InputDecoration(
    labelText: 'Username',
    border: OutlineInputBorder(),
  ),
)

// 容器
Container(
  width: 100,
  height: 100,
  color: Colors.blue,
  padding: EdgeInsets.all(8),
  margin: EdgeInsets.all(8),
)
```

### 2.2 列表

```dart
// ListView
ListView(
  children: [
    ListTile(title: Text('Item 1')),
    ListTile(title: Text('Item 2')),
  ],
)

// ListView.builder
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ListTile(title: Text(items[index]));
  },
)

// GridView
GridView.count(
  crossAxisCount: 2,
  children: List.generate(10, (index) {
    return Center(child: Text('Item $index'));
  }),
)
```

### 2.3 滚动

```dart
SingleChildScrollView(
  child: Column(
    children: [...],
  ),
)

CustomScrollView(
  slivers: [
    SliverAppBar(...),
    SliverList(...),
  ],
)
```

---

## 三、布局

### 3.1 Row & Column

```dart
// Row (水平)
Row(
  mainAxisAlignment: MainAxisAlignment.center,
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text('Left'),
    Text('Right'),
  ],
)

// Column (垂直)
Column(
  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
  children: [
    Text('Top'),
    Text('Bottom'),
  ],
)
```

### 3.2 Stack

```dart
Stack(
  alignment: Alignment.center,
  children: [
    Container(color: Colors.blue, width: 100, height: 100),
    Positioned(
      top: 10,
      right: 10,
      child: Icon(Icons.star),
    ),
  ],
)
```

### 3.3 Expanded & Flexible

```dart
Row(
  children: [
    Expanded(
      flex: 2,
      child: Container(color: Colors.red),
    ),
    Expanded(
      flex: 1,
      child: Container(color: Colors.blue),
    ),
  ],
)
```

### 3.4 Padding & Margin

```dart
Padding(
  padding: EdgeInsets.all(16),
  child: Text('Content'),
)

Container(
  margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
  child: Text('Content'),
)
```

### 3.5 SizedBox & Spacer

```dart
SizedBox(width: 16, height: 16)
Spacer(flex: 1)
```

---

## 四、状态管理

### 4.1 setState

```dart
class Counter extends StatefulWidget {
  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int count = 0;

  void increment() {
    setState(() {
      count++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Text('$count');
  }
}
```

### 4.2 Provider

```dart
// Model
class CounterModel with ChangeNotifier {
  int _count = 0;
  int get count => _count;

  void increment() {
    _count++;
    notifyListeners();
  }
}

// Provider
ChangeNotifierProvider(
  create: (_) => CounterModel(),
  child: Consumer<CounterModel>(
    builder: (context, counter, child) {
      return Text('${counter.count}');
    },
  ),
)

// 使用
context.read<CounterModel>().increment();
```

### 4.3 Riverpod

```dart
final counterProvider = StateNotifierProvider<CounterNotifier, int>((ref) {
  return CounterNotifier();
});

class CounterNotifier extends StateNotifier<int> {
  CounterNotifier() : super(0);

  void increment() => state++;
}

// 使用
ref.watch(counterProvider)
ref.read(counterProvider.notifier).increment()
```

### 4.4 Bloc

```dart
// Event
abstract class CounterEvent {}
class Increment extends CounterEvent {}

// State
class CounterState {
  final int count;
  CounterState(this.count);
}

// Bloc
class CounterBloc extends Bloc<CounterEvent, CounterState> {
  CounterBloc() : super(CounterState(0)) {
    on<Increment>((event, emit) {
      emit(CounterState(state.count + 1));
    });
  }
}

// 使用
BlocBuilder<CounterBloc, CounterState>(
  builder: (context, state) {
    return Text('${state.count}');
  },
)
```

---

## 五、导航

### 5.1 基本导航

```dart
// 跳转
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => SecondPage()),
);

// 返回
Navigator.pop(context);

// 替换
Navigator.pushReplacement(
  context,
  MaterialPageRoute(builder: (context) => NewPage()),
);

// 返回并传值
Navigator.pop(context, result);

// 接收返回值
var result = await Navigator.push(...);
```

### 5.2 命名路由

```dart
MaterialApp(
  routes: {
    '/': (context) => HomePage(),
    '/second': (context) => SecondPage(),
  },
  initialRoute: '/',
)

// 跳转
Navigator.pushNamed(context, '/second');
```

### 5.3 GoRouter

```dart
final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => HomePage(),
    ),
    GoRoute(
      path: '/detail/:id',
      builder: (context, state) {
        final id = state.pathParameters['id'];
        return DetailPage(id: id!);
      },
    ),
  ],
);

// 使用
context.go('/detail/123');
context.push('/detail/123');
```

---

## 六、网络请求

### 6.1 HTTP

```dart
import 'package:http/http.dart' as http;

// GET
Future<void> fetchData() async {
  final response = await http.get(Uri.parse('https://api.example.com/data'));

  if (response.statusCode == 200) {
    var data = jsonDecode(response.body);
  }
}

// POST
Future<void> postData() async {
  final response = await http.post(
    Uri.parse('https://api.example.com/data'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'key': 'value'}),
  );
}
```

### 6.2 Dio

```dart
import 'package:dio/dio.dart';

final dio = Dio(BaseOptions(
  baseUrl: 'https://api.example.com',
  connectTimeout: Duration(seconds: 5),
  receiveTimeout: Duration(seconds: 3),
));

// GET
Response response = await dio.get('/users');

// POST
Response response = await dio.post('/users', data: {'name': 'John'});

// 拦截器
dio.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) {
    options.headers['Authorization'] = 'Bearer token';
    return handler.next(options);
  },
  onResponse: (response, handler) {
    return handler.next(response);
  },
  onError: (error, handler) {
    return handler.next(error);
  },
));
```

### 6.3 JSON 序列化

```dart
// 手动
class User {
  final String name;
  final int age;

  User({required this.name, required this.age});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      name: json['name'],
      age: json['age'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'age': age,
    };
  }
}

// 使用 json_serializable
import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable()
class User {
  final String name;
  final int age;

  User({required this.name, required this.age});

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}
```

---

## 七、本地存储

### 7.1 Shared Preferences

```dart
import 'package:shared_preferences/shared_preferences.dart';

// 保存
final prefs = await SharedPreferences.getInstance();
await prefs.setInt('counter', 10);
await prefs.setString('name', 'John');
await prefs.setBool('isLoggedIn', true);

// 读取
int counter = prefs.getInt('counter') ?? 0;
String name = prefs.getString('name') ?? '';
```

### 7.2 SQLite

```dart
import 'package:sqflite/sqflite.dart';

// 打开数据库
final database = await openDatabase(
  'app.db',
  version: 1,
  onCreate: (db, version) {
    db.execute('''
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        age INTEGER
      )
    ''');
  },
);

// 插入
await database.insert('users', {'name': 'John', 'age': 25});

// 查询
List<Map<String, dynamic>> users = await database.query('users');

// 更新
await database.update('users', {'age': 26}, where: 'id = ?', whereArgs: [1]);

// 删除
await database.delete('users', where: 'id = ?', whereArgs: [1]);
```

### 7.3 Hive

```dart
import 'package:hive/hive.dart';

// 初始化
await Hive.initFlutter();
Hive.registerAdapter(UserAdapter());

// 打开 Box
var box = await Hive.openBox<User>('users');

// 保存
await box.put('key', user);

// 读取
User user = box.get('key');

// 监听
box.watch().listen((event) {
  print('Box changed');
});
```

---

## 八、动画

### 8.1 Implicit Animations

```dart
// AnimatedContainer
AnimatedContainer(
  duration: Duration(milliseconds: 300),
  width: isExpanded ? 200 : 100,
  height: 100,
  color: Colors.blue,
)

// AnimatedOpacity
AnimatedOpacity(
  opacity: isVisible ? 1.0 : 0.0,
  duration: Duration(milliseconds: 300),
  child: Text('Fade'),
)

// AnimatedPositioned
AnimatedPositioned(
  duration: Duration(milliseconds: 300),
  left: position,
  child: Text('Move'),
)
```

### 8.2 Explicit Animations

```dart
class MyAnimation extends StatefulWidget {
  @override
  State<MyAnimation> createState() => _MyAnimationState();
}

class _MyAnimationState extends State<MyAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(seconds: 1),
      vsync: this,
    );
    _animation = Tween<double>(begin: 0, end: 1).animate(_controller);
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _animation,
      child: Container(),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
```

### 8.3 Hero Animations

```dart
// Page 1
Hero(
  tag: 'image-tag',
  child: Image.network(url),
)

// Page 2
Hero(
  tag: 'image-tag',
  child: Image.network(url),
)
```

---

## 九、平台集成

### 9.1 Platform Channels

```dart
// Dart
import 'package:flutter/services.dart';

static const platform = MethodChannel('com.example.app/channel');

Future<void> callNative() async {
  try {
    final result = await platform.invokeMethod('methodName', {'arg': 'value'});
    print(result);
  } on PlatformException catch (e) {
    print(e.message);
  }
}

// Android (Kotlin)
class MainActivity : FlutterActivity() {
  private val CHANNEL = "com.example.app/channel"

  override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
    super.configureFlutterEngine(flutterEngine)
    MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
      .setMethodCallHandler { call, result ->
        if (call.method == "methodName") {
          result.success("Result")
        }
      }
  }
}

// iOS (Swift)
class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    let controller : FlutterViewController = window?.rootViewController as! FlutterViewController
    let channel = FlutterMethodChannel(name: "com.example.app/channel",
                                      binaryMessenger: controller.binaryMessenger)
    channel.setMethodCallHandler { (call, result) in
      if call.method == "methodName" {
        result("Result")
      }
    }
    GeneratedPluginRegistrant.register(with: self)
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
```

### 9.2 Permissions

```dart
import 'package:permission_handler/permission_handler.dart';

// 请求权限
var status = await Permission.camera.request();
if (status.isGranted) {
  // 使用相机
}

// 检查权限
if (await Permission.location.isGranted) {
  // 使用位置
}
```

---

## 十、最佳实践

### 10.1 项目结构

```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── constants/
│   ├── themes/
│   ├── utils/
│   └── widgets/
├── features/
│   ├── auth/
│   │   ├── presentation/
│   │   ├── application/
│   │   └── data/
│   └── home/
├── shared/
│   ├── widgets/
│   └── services/
└── l10n/
```

### 10.2 性能优化

```dart
// 使用 const 构造函数
const Text('Hello')

// 避免在 build 中创建对象
final controller = TextEditingController();

// 使用 keys
ListView.builder(
  key: ValueKey(itemId),
  itemBuilder: ...
)

// 懒加载
LazyIndexedStack(...)

// 图片缓存
CacheNetworkImageProvider(...)

// 减少 rebuild
Selector<CounterModel, int>(
  selector: (_, model) => model.count,
  builder: (_, count, __) => Text('$count'),
)
```

### 10.3 主题

```dart
MaterialApp(
  theme: ThemeData(
    primarySwatch: Colors.blue,
    brightness: Brightness.light,
  ),
  darkTheme: ThemeData(
    brightness: Brightness.dark,
  ),
  themeMode: ThemeMode.system,
)

// 使用
Theme.of(context).primaryColor
```

### 10.4 国际化

```dart
// ARB 文件
{
  "helloWorld": "Hello, World!",
  "@helloWorld": {
    "description": "Greeting message"
  }
}

// 使用
AppLocalizations.of(context)!.helloWorld
```

### 10.5 测试

```dart
// Widget Test
testWidgets('Counter increments', (tester) async {
  await tester.pumpWidget(MyApp());

  expect(find.text('0'), findsOneWidget);

  await tester.tap(find.byIcon(Icons.add));
  await tester.pump();

  expect(find.text('1'), findsOneWidget);
});

// Integration Test
testWidgets('Full app test', (tester) async {
  await tester.pumpWidgetAndSettle(MyApp());
  // ...
});
```

### 10.6 调试

```dart
// Debug banner
MaterialApp(debugShowCheckedModeBanner: false)

// Print
print('Debug: $value')

// DevTools
// flutter run --devtools-server-address

// Inspector
// DevTools > Inspector
```

---

## 附录

### A. 常用包

- **provider**: 状态管理
- **flutter_riverpod**: 状态管理
- **bloc**: 状态管理
- **dio**: HTTP 客户端
- **get_it**: 依赖注入
- **go_router**: 路由
- **intl**: 国际化
- **sqflite**: SQLite
- **shared_preferences**: 本地存储
- **cached_network_image**: 图片缓存

### B. 有用的资源

- **Flutter 官方文档**: https://docs.flutter.dev/
- **Flutter Cookbook**: https://docs.flutter.dev/cookbook
- **Pub.dev**: https://pub.dev/
- **Flutter Gallery**: https://github.com/flutter/gallery

### C. 学习路线

```
Dart 基础 → Flutter 基础 → Widget → 布局 → 状态管理 → 导航 → 网络 → 存储 → 高级特性

1. Dart 语言基础
2. Flutter 框架介绍
3. Widget 系统
4. 布局和约束
5. 状态管理 (setState/Provider/Riverpod/Bloc)
6. 路由和导航
7. 网络请求
8. 本地存储
9. 动画
10. 平台集成
11. 测试
12. 性能优化
13. 发布
```

---

**祝您 Flutter 开发愉快！** 📱
