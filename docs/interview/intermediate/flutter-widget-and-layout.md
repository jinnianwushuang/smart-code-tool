---
title: 'Flutter Widget 体系与布局系统 [P5-P6]'
level: 'intermediate'
tags: ['Flutter', 'Widget', '布局', 'StatelessWidget', 'StatefulWidget']
difficulty: 'hard'
updated: '2026-09-10'
target: 'P5-P6 中级工程师'
---

# Flutter Widget 体系与布局系统 [P5-P6]

> Flutter 的 UI 由 Widget 组成。理解 Widget 生命周期、布局约束机制和常用布局 Widget，是 Flutter 开发的核心技能。

## 核心概念（What）

### Widget 体系

```
Widget = Flutter UI 的基本构建块

核心原则：
├── 一切皆 Widget
├── 不可变描述 → Widget 是配置
├── Element → 运行时实例
├── RenderObject → 实际渲染
└── 组合优于继承

Widget 分类：
├── StatelessWidget → 无状态（纯展示）
├── StatefulWidget → 有状态（可交互）
├── InheritedWidget → 数据向下传递
└── ProxyWidget → 包装其他 Widget

布局 Widget：
├── Container → 装饰容器
├── Row/Column → 线性布局
├── Stack → 层叠布局
├── Expanded/Flexible → 弹性布局
├── ListView/GridView → 列表/网格
└── CustomScrollView → 自定义滚动
```

## 底层原理（Why）

### StatelessWidget vs StatefulWidget

```dart
// StatelessWidget（无状态）
class GreetingCard extends StatelessWidget {
  final String name;

  const GreetingCard({super.key, required this.name});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Text('Hello, $name!'),
      ),
    );
  }
}

// StatefulWidget（有状态）
class Counter extends StatefulWidget {
  const Counter({super.key});

  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int _count = 0;

  void _increment() {
    setState(() {
      _count++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Count: $_count'),
        ElevatedButton(
          onPressed: _increment,
          child: const Text('Increment'),
        ),
      ],
    );
  }
}
```

### 布局约束机制

```
Flutter 布局规则（Constraints）：

1. 父 Widget 给子 Widget 传递约束
   → 最小/最大宽度、高度

2. 子 Widget 根据约束决定自己的大小
   → 在约束范围内选择尺寸

3. 父 Widget 定位子 Widget
   → 确定最终位置

约束传递：
┌─────────────────────────────┐
│  父 Widget（Screen）         │
│  约束：0 ≤ width ≤ 375      │
│                             │
│  ┌─────────────────────┐    │
│  │ 子 Widget（Card）    │    │
│  │ 约束：0 ≤ w ≤ 343   │    │
│  │ 选择：width = 343    │    │
│  └─────────────────────┘    │
└─────────────────────────────┘

关键约束类型：
├── Tight → 固定尺寸（必须用这个尺寸）
├── Loose → 范围约束（可以选择）
└── Unbounded → 无约束（如 ScrollView 中）
```

### 常用布局 Widget

```dart
// 1. Row（水平布局）
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  crossAxisAlignment: CrossAxisAlignment.center,
  children: [
    Text('Left'),
    Text('Center'),
    Text('Right'),
  ],
)

// 2. Column（垂直布局）
Column(
  mainAxisAlignment: MainAxisAlignment.center,
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text('Title'),
    Text('Subtitle'),
  ],
)

// 3. Stack（层叠布局）
Stack(
  alignment: Alignment.bottomRight,
  children: [
    Image.asset('background.jpg'),
    Positioned(
      top: 16,
      left: 16,
      child: Text('Overlay Text'),
    ),
  ],
)

// 4. Expanded（弹性布局）
Row(
  children: [
    Expanded(
      flex: 2, // 占 2/3
      child: Container(color: Colors.red),
    ),
    Expanded(
      flex: 1, // 占 1/3
      child: Container(color: Colors.blue),
    ),
  ],
)

// 5. Container（装饰容器）
Container(
  width: 200,
  height: 100,
  padding: EdgeInsets.all(16),
  margin: EdgeInsets.symmetric(vertical: 8),
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    boxShadow: [
      BoxShadow(
        color: Colors.black26,
        blurRadius: 8,
        offset: Offset(0, 2),
      ),
    ],
  ),
  child: Text('Content'),
)

// 6. ListView（列表）
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ListTile(
      title: Text(items[index].title),
      subtitle: Text(items[index].subtitle),
      onTap: () => onTap(items[index]),
    );
  },
)

// 7. GridView（网格）
GridView.builder(
  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: 2,
    mainAxisSpacing: 8,
    crossAxisSpacing: 8,
  ),
  itemCount: items.length,
  itemBuilder: (context, index) {
    return Card(child: Text('Item $index'));
  },
)

// 8. CustomScrollView（自定义滚动）
CustomScrollView(
  slivers: [
    SliverAppBar(
      title: Text('App Bar'),
      expandedHeight: 200,
      flexibleSpace: FlexibleSpaceBar(
        background: Image.asset('header.jpg', fit: BoxFit.cover),
      ),
    ),
    SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) => ListTile(title: Text('Item $index')),
        childCount: 20,
      ),
    ),
  ],
)
```

### 常用交互 Widget

```dart
// 按钮
ElevatedButton(
  onPressed: () {},
  child: Text('Elevated'),
)

TextButton(
  onPressed: () {},
  child: Text('Text'),
)

IconButton(
  icon: Icon(Icons.add),
  onPressed: () {},
)

// 输入框
TextField(
  controller: _controller,
  decoration: InputDecoration(
    labelText: 'Username',
    hintText: 'Enter your name',
    border: OutlineInputBorder(),
  ),
  onChanged: (value) => print(value),
)

// 复选框
Checkbox(
  value: _isChecked,
  onChanged: (value) {
    setState(() => _isChecked = value!);
  },
)

// 开关
Switch(
  value: _isOn,
  onChanged: (value) {
    setState(() => _isOn = value);
  },
)

// 滑块
Slider(
  value: _sliderValue,
  min: 0,
  max: 100,
  onChanged: (value) {
    setState(() => _sliderValue = value);
  },
)
```

## 实战应用（How）

### 常见布局模式

```dart
// 1. 卡片列表
Widget _buildCardList() {
  return ListView.builder(
    padding: EdgeInsets.all(16),
    itemCount: items.length,
    itemBuilder: (context, index) {
      final item = items[index];
      return Card(
        margin: EdgeInsets.only(bottom: 12),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item.title,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 8),
              Text(item.description),
            ],
          ),
        ),
      );
    },
  );
}

// 2. 表单布局
Widget _buildForm() {
  return Form(
    key: _formKey,
    child: Column(
      children: [
        TextFormField(
          decoration: InputDecoration(labelText: 'Email'),
          validator: (value) {
            if (value == null || !value.contains('@')) {
              return 'Please enter a valid email';
            }
            return null;
          },
        ),
        SizedBox(height: 16),
        TextFormField(
          decoration: InputDecoration(labelText: 'Password'),
          obscureText: true,
          validator: (value) {
            if (value == null || value.length < 8) {
              return 'Password must be at least 8 characters';
            }
            return null;
          },
        ),
        SizedBox(height: 24),
        ElevatedButton(
          onPressed: _submit,
          child: Text('Submit'),
        ),
      ],
    ),
  );
}

// 3. 响应式布局
Widget _buildResponsiveLayout(BuildContext context) {
  return LayoutBuilder(
    builder: (context, constraints) {
      if (constraints.maxWidth < 600) {
        // 手机：单列
        return _buildSingleColumn();
      } else if (constraints.maxWidth < 1024) {
        // 平板：双列
        return _buildTwoColumns();
      } else {
        // 桌面：三列
        return _buildThreeColumns();
      }
    },
  );
}

// 4. 下拉刷新 + 上拉加载
Widget _buildRefreshList() {
  return RefreshIndicator(
    onRefresh: _refreshData,
    child: ListView.builder(
      itemCount: items.length + 1,
      itemBuilder: (context, index) {
        if (index == items.length) {
          return _buildLoadMoreButton();
        }
        return _buildItem(items[index]);
      },
    ),
  );
}
```

### 性能优化

```dart
// 1. const 构造函数（避免重建）
const Text('Static Text'); // 不会重建

// 2. ListView.builder（按需构建）
// ✓ 好：只构建可见项
ListView.builder(
  itemCount: 10000,
  itemBuilder: (context, index) => ListItem(index),
)

// ✗ 不好：一次性构建所有项
ListView(
  children: List.generate(10000, (i) => ListItem(i)),
)

// 3. RepaintBoundary（减少重绘）
RepaintBoundary(
  child: ExpensiveWidget(),
)

// 4. ValueListenableBuilder（局部更新）
final counter = ValueNotifier(0);

ValueListenableBuilder<int>(
  valueListenable: counter,
  builder: (context, value, child) {
    return Text('Count: $value');
  },
)
```

## 高频面试题

### Q1: StatelessWidget 和 StatefulWidget 的区别？

```
StatelessWidget：
├── 无状态
├── 不可变
├── build 只调用一次
└── 用于：纯展示组件

StatefulWidget：
├── 有状态
├── 可变（setState 触发重建）
├── 有生命周期
└── 用于：交互组件

选择：
├── 不需要交互 → StatelessWidget
├── 需要响应用户操作 → StatefulWidget
└── 状态提升到父组件 → StatelessWidget + Props
```

### Q2: Flutter 的布局约束机制？

```
约束流程：
├── 父→子：传递约束（Constraints）
├── 子：根据约束决定大小
└── 父：定位子 Widget

约束类型：
├── Tight → 固定尺寸
├── Loose → 范围约束
└── Unbounded → 无约束（ScrollView）

常见问题：
├── Unbounded 约束 → 报错（如 Column 中嵌套 ListView）
├── 解决 → Expanded 或 SizedBox 限制高度
└── 理解约束 → 避免布局错误
```

### Q3: 如何优化 Flutter 列表性能？

```
优化策略：
├── ListView.builder → 按需构建
├── const 构造函数 → 避免重建
├── RepaintBoundary → 减少重绘
├── Key → 正确识别元素
├── 分页加载 → 减少内存
└── 图片缓存 → 避免重复加载

示例：
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return const ListItem(); // const
  },
)
```

## 延伸思考

1. Element 和 Widget 的关系？
2. GlobalKey 的使用场景和性能影响？
3. 如何自定义 Widget？

## 参考资料

- [Flutter Widget 目录](https://docs.flutter.dev/ui/widgets)
- [Flutter 布局教程](https://docs.flutter.dev/ui/layout)
