---
title: Flutter 基础代码
order: 104
---

## Flutter 基础代码

这份 Flutter 基础知识代码涵盖了从 **环境入口、状态管理、布局进阶、用户输入、异步 UI 到生命周期** 的核心概念。

```dart
import 'package:flutter/material.dart';

// 1. 入口函数：启动 App
void main() {
  runApp(const MyBaseApp());
}

// 2. 根组件：通常配置主题和路由
class MyBaseApp extends StatelessWidget {
  const MyBaseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter 基础速查',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true, // 启用 Material 3
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      // 路由表配置 (可选)
      routes: {
        '/details': (context) => const Scaffold(body: Center(child: Text('详情页'))),
      },
      home: const BaseWidgetTour(),
    );
  }
}

// 3. 有状态组件 (StatefulWidget)
class BaseWidgetTour extends StatefulWidget {
  const BaseWidgetTour({super.key});

  @override
  State<BaseWidgetTour> createState() => _BaseWidgetTourState();
}

class _BaseWidgetTourState extends State<BaseWidgetTour> {
  int _counter = 0;
  final TextEditingController _controller = TextEditingController(); // 输入框控制器

  // 生命周期：初始化
  @override
  void initState() {
    super.initState();
    print('组件初始化');
    _controller.addListener(() => setState(() {})); // 监听输入变化
  }

  void _increment() {
    setState(() { // 通知 UI 刷新
      _counter++;
    });
  }

  // 模拟异步获取数据
  Future<String> _loadData() async {
    await Future.delayed(const Duration(seconds: 2));
    // throw '加载失败'; // 模拟错误
    return "远程数据已送达";
  }

  @override
  Widget build(BuildContext context) {
    // 4. 骨架组件 (Scaffold)
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flutter 核心组件预览'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),

      // 5. 滚动容器
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 文本 (Text)
            const Text(
              '1. 基础文本样式',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),

            // 按钮 (Buttons)
            Row(
              children: [
                ElevatedButton(onPressed: _increment, child: const Text('加 1')),
                const SizedBox(width: 10),
                Expanded( // 填充剩余空间
                  child: Text('计数结果: $_counter', style: Theme.of(context).textTheme.headlineSmall),
                ),
              ],
            ),

            const Divider(), // 分割线

            // 6. 输入框 (Input)
            const Text('2. 用户输入', style: TextStyle(fontWeight: FontWeight.bold)),
            TextField(
              controller: _controller,
              decoration: const InputDecoration(
                labelText: '输入内容并观察下方变化',
                border: OutlineInputBorder(),
              ),
            ),

            // 7. 层叠布局 (Stack & Positioned)
            const SizedBox(height: 20),
            const Text('3. 层叠布局 (Stack)', style: TextStyle(fontWeight: FontWeight.bold)),
            Stack(
              children: [
                Container(height: 100, width: double.infinity, color: Colors.grey[300]),
                Positioned(
                  right: 10,
                  bottom: 10,
                  child: Container(width: 40, height: 40, color: Colors.red),
                ),
                const Center(child: Text('层叠在中间')),
              ],
            ),

            // 8. 异步 UI (FutureBuilder)
            const SizedBox(height: 20),
            const Text('4. 异步数据展示', style: TextStyle(fontWeight: FontWeight.bold)),
            FutureBuilder<String>(
              future: _loadData(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) return const CircularProgressIndicator();
                if (snapshot.hasError) return Text('错误: ${snapshot.error}');
                return Text('结果: ${snapshot.data}', style: const TextStyle(color: Colors.green));
              },
            ),

            const Divider(),
            // 9. 容器与形状 (Container)
            Container(
              margin: const EdgeInsets.symmetric(vertical: 10),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.blueAccent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue),
              ),
              child: const Center(child: Text('我是 Container')),
            ),

            // 10. 列表展示 (ListView 示例)
            const Text('5. 循环生成列表', style: TextStyle(fontWeight: FontWeight.bold)),
            ...List.generate(2, (index) => ListTile(
              leading: const CircleAvatar(child: Icon(Icons.person)),
              title: Text('项目 $index'),
              subtitle: Text('内容详情...'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.pushNamed(context, '/details'), // 路由跳转
            )),

            const Icon(Icons.favorite, color: Colors.red, size: 40),
          ],
        ),
      ),

      // 浮动按钮
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
  }

  // 生命周期：销毁
  @override
  void dispose() {
    print('组件销毁');
    _controller.dispose(); // 重要：释放资源
    super.dispose();
  }
}
```

## 核心知识点速查：

1. **Widget 哲学**：Flutter 中“一切皆 Widget”。分为 `Stateless`（无状态，静态展示）和 `Stateful`（有状态，可交互）。
2. **MaterialApp & Scaffold**：基础模板。`Scaffold` 提供了标准的 `AppBar`、`Body` 和 `FloatingActionButton` 插槽。
3. **布局模型**：
   - **Row / Column**：水平/垂直排列。
   - **Stack**：层叠排列（类似 CSS 的 absolute）。
   - **Expanded / Flexible**：控制子元素在主轴方向的伸缩。
4. **状态更新**：必须调用 `setState(() { ... })` 才能触发 `build` 方法重新执行，更新 UI。
5. **装饰 (BoxDecoration)**：通过 `Container` 的 `decoration` 属性实现圆角、阴影、背景色等类似 CSS 的效果。
6. **布局口诀**：
   - **向下传递约束** (Constraints go down)：父组件告诉子组件能占多大。
   - **向上传递尺寸** (Sizes go up)：子组件决定自己多大。
   - **由父组件决定位置** (Parent sets position)：父组件决定子组件放在哪。
7. **生命周期关键点**：
   - `initState`: 订阅、初始化。`dispose`: 销毁监听器、控制器（防止内存泄漏）。
