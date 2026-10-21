---
title: 'Flutter UI 适配·主题系统·加载状态设计实战'
tags: ['Flutter', 'ScreenUtil', 'Material3', '主题', '骨架屏', 'Shimmer', '暗色模式', '响应式']
---

# Flutter UI 适配·主题系统·加载状态设计实战

> 本文基于 flutter_app 项目的 UI 工程实践，深度讲解 ScreenUtil 多设备适配原理、Material 3 主题系统配置（亮/暗双主题）、骨架屏 Shimmer 效果设计、空状态组件封装等实战经验。

---

## 一、ScreenUtil 多设备适配

### 1.1 为什么需要适配

```
Flutter 开发面临的多设备问题：

┌─────────────────────────────────────────────────┐
│ 设计稿：iPhone 13 (375 × 812)                    │
│                                                 │
│ 实际设备：                                       │
│ ├── iPhone SE (320 × 568)  ← 小屏，UI 被压缩     │
│ ├── iPhone 15 Pro Max (430 × 932) ← 大屏，留白多 │
│ ├── iPad Mini (744 × 1133) ← 平板，UI 太小       │
│ └── Android 各种尺寸（320-480 宽度）              │
│                                                 │
│ 问题：写死的像素值在不同设备上显示效果不一致         │
└─────────────────────────────────────────────────┘
```

### 1.2 ScreenUtil 初始化

```dart
// main.dart

import 'package:flutter_screenutil/flutter_screenutil.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // ... 其他初始化
  runApp(MyApp(localeService: localeService));
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return TranslationProvider(
      child: ScreenUtilInit(
        designSize: const Size(AppDimens.designWidth, AppDimens.designHeight),
        minTextAdapt: true,
        builder: (context, child) {
          return GetMaterialApp(
            // ...
          );
        },
      ),
    );
  }
}
```

**关键参数：**

| 参数           | 说明                   | 项目值                     |
| -------------- | ---------------------- | -------------------------- |
| `designSize`   | 设计稿尺寸             | `Size(375, 812)`           |
| `minTextAdapt` | 文本是否按最小缩放适配 | `true`（避免小屏文字过小） |
| `builder`      | 构建 Widget 树         | 包裹 `GetMaterialApp`      |

### 1.3 尺寸常量定义

```dart
// app/values/dimens.dart

class AppDimens {
  AppDimens._();

  /// 设计稿基准宽度
  static const double designWidth = 375;

  /// 设计稿基准高度
  static const double designHeight = 812;

  /// 通用间距（设计稿像素值，ScreenUtil 自动缩放）
  static const double spacingXs = 4.0;
  static const double spacingSm = 8.0;
  static const double spacingMd = 16.0;
  static const double spacingLg = 24.0;
  static const double spacingXl = 32.0;

  /// 圆角
  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
}
```

### 1.4 在代码中使用

```dart
// 方式 1：使用扩展方法（推荐）

Container(
  width: 100.w,           // 宽度按屏幕比例缩放
  height: 50.h,           // 高度按屏幕比例缩放
  padding: EdgeInsets.all(16.w),
  child: Text(
    '标题',
    style: TextStyle(fontSize: 16.sp),  // 字体按屏幕比例缩放
  ),
);

// 方式 2：使用常量（项目规范）

Container(
  width: AppDimens.spacingMd.w,
  height: AppDimens.spacingMd.h,
  padding: EdgeInsets.all(AppDimens.spacingSm.w),
  child: Text(
    '标题',
    style: TextStyle(fontSize: 16.sp),
  ),
);
```

### 1.5 适配原理

```
ScreenUtil 的缩放算法：

宽度缩放比 = 实际屏幕宽度 / 设计稿宽度
高度缩放比 = 实际屏幕高度 / 设计稿高度

示例：
设计稿：375 × 812
iPhone 15 Pro Max：430 × 932
  → 宽度比 = 430 / 375 = 1.147
  → 高度比 = 932 / 812 = 1.148

100.w → 100 × 1.147 = 114.7 像素
16.sp → 16 × 1.147 = 18.35 字号

iPhone SE：320 × 568
  → 宽度比 = 320 / 375 = 0.853
  → 高度比 = 568 / 812 = 0.700

100.w → 100 × 0.853 = 85.3 像素
16.sp → 16 × 0.853 = 13.65 字号
```

### 1.6 注意事项

```dart
// ❌ 错误：在 ScreenUtilInit 之前使用 .w/.h/.sp

class MyPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // 此时 ScreenUtil 还没初始化，会崩溃！
    return Container(width: 100.w);
  }
}

// ✅ 正确：在 builder 内部使用

ScreenUtilInit(
  builder: (context, child) {
    // 此时已初始化，可以安全使用
    return Container(width: 100.w);
  },
);

// ❌ 错误：硬编码像素值

Container(
  width: 375,  // 只适配设计稿尺寸
  height: 100,
);

// ✅ 正确：使用 ScreenUtil 扩展

Container(
  width: 375.w,  // 自动适配所有设备
  height: 100.h,
);
```

---

## 二、Material 3 主题系统

### 2.1 主题配置

```dart
// app/theme/app_theme.dart

import 'package:flutter/material.dart';
import '../values/colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get light => _build(Brightness.light);
  static ThemeData get dark => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    // 从种子颜色生成 ColorScheme
    final colorScheme = ColorScheme.fromSeed(
      seedColor: AppColors.seed,
      brightness: brightness,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,

      // AppBar 主题
      appBarTheme: AppBarTheme(
        centerTitle: true,
        elevation: 0,
        backgroundColor: colorScheme.surface,
        foregroundColor: colorScheme.onSurface,
      ),

      // Card 主题
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),

      // Button 主题
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),

      // Input 主题
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
      ),
    );
  }
}
```

### 2.2 色彩常量

```dart
// app/values/colors.dart

class AppColors {
  AppColors._();

  static const Color seed = Color(0xFF2196F3);      // 品牌主色（蓝色）
  static const Color error = Color(0xFFE53935);     // 错误色（红色）
  static const Color success = Color(0xFF43A047);   // 成功色（绿色）
  static const Color warning = Color(0xFFFFA726);   // 警告色（橙色）
}
```

### 2.3 ColorScheme 自动生成

```
ColorScheme.fromSeed(seedColor: AppColors.seed)

输入：种子颜色 #2196F3（Material Blue 500）

自动生成：
├── primary          → 主色（蓝色系）
├── onPrimary        → 主色上的文字（白色）
├── primaryContainer → 主色容器（浅蓝）
├── secondary        → 辅助色（蓝紫色系）
├── surface          → 表面色（白色/深灰）
├── onSurface        → 表面上的文字（黑色/白色）
├── error            → 错误色（红色系）
└── outline          → 边框色（灰色系）

亮色模式：surface = 白色，onSurface = 黑色
暗色模式：surface = 深灰，onSurface = 白色
```

### 2.4 主题切换

```dart
// GetMaterialApp 配置

GetMaterialApp(
  theme: AppTheme.light,          // 亮色主题
  darkTheme: AppTheme.dark,       // 暗色主题
  themeMode: ThemeMode.system,    // 跟随系统主题
  // ...
);
```

**ThemeMode 选项：**

| 模式               | 行为                 |
| ------------------ | -------------------- |
| `ThemeMode.system` | 跟随系统设置（默认） |
| `ThemeMode.light`  | 强制亮色             |
| `ThemeMode.dark`   | 强制暗色             |

### 2.5 在代码中使用主题

```dart
// 方式 1：通过 context 获取（推荐）

class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Container(
      color: colorScheme.primary,
      child: Text(
        '标题',
        style: textTheme.titleLarge,
      ),
    );
  }
}

// 方式 2：判断暗色模式

final isDark = Theme.of(context).brightness == Brightness.dark;
final bgColor = isDark ? Colors.grey[800] : Colors.white;
```

### 2.6 暗色模式适配要点

```dart
// ❌ 错误：硬编码颜色

Container(
  color: Colors.white,  // 暗色模式下刺眼
  child: Text('内容'),
);

// ✅ 正确：使用主题色

Container(
  color: Theme.of(context).colorScheme.surface,  // 自动适配亮/暗
  child: Text(
    '内容',
    style: TextStyle(
      color: Theme.of(context).colorScheme.onSurface,
    ),
  ),
);

// ✅ 骨架屏适配暗色模式

final isDark = Theme.of(context).brightness == Brightness.dark;
final baseColor = isDark ? Colors.grey[800]! : Colors.grey[300]!;
final highlightColor = isDark ? Colors.grey[700]! : Colors.grey[100]!;
```

---

## 三、骨架屏 Shimmer 效果

### 3.1 为什么需要骨架屏

```
用户体验对比：

场景：列表数据加载中

❌ 白屏 + Loading 转圈：
   - 用户不知道要加载什么
   - 感觉等待时间很长
   - 页面布局跳动感强

✅ 骨架屏（Shimmer 效果）：
   - 预览页面布局结构
   - 降低感知等待时间
   - 加载完成后平滑过渡
```

### 3.2 ListSkeleton 组件

```dart
// shared/widgets/list_skeleton.dart

import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ListSkeleton extends StatelessWidget {
  final int itemCount;
  final double itemHeight;

  const ListSkeleton({
    super.key,
    this.itemCount = 4,
    this.itemHeight = 120,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: itemCount,
      itemBuilder: (context, index) => _SkeletonCard(itemHeight: itemHeight),
    );
  }
}

class _SkeletonCard extends StatelessWidget {
  final double itemHeight;
  const _SkeletonCard({required this.itemHeight});

  @override
  Widget build(BuildContext context) {
    // 自动适配暗色模式
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor = isDark ? Colors.grey[800]! : Colors.grey[300]!;
    final highlightColor = isDark ? Colors.grey[700]! : Colors.grey[100]!;

    return Shimmer.fromColors(
      baseColor: baseColor,
      highlightColor: highlightColor,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? Colors.grey[850] : Colors.white,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 标题占位
            Container(
              width: double.infinity,
              height: 16,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 12),
            // 内容行 1
            Container(
              width: 200,
              height: 12,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 8),
            // 内容行 2
            Container(
              width: 160,
              height: 12,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 3.3 Shimmer 原理

```
Shimmer 效果本质：

1. 底层：灰色矩形（baseColor）
2. 上层：一个从左到右移动的高亮渐变（highlightColor）
3. 动画：渐变持续移动，产生"闪光"效果

Shimmer.fromColors() 内部：
├── 创建 ShaderMask
├── 使用 LinearGradient
├── AnimationController 驱动渐变位移
└── 重复播放动画
```

### 3.4 使用场景

```dart
// 在 Controller 中控制加载状态

class ArticleListController extends GetxController {
  final isLoading = true.obs;
  final articles = <Article>[].obs;

  @override
  void onInit() {
    super.onInit();
    fetchArticles();
  }

  Future<void> fetchArticles() async {
    isLoading.value = true;
    try {
      // 网络请求
      final response = await api.getArticles();
      articles.value = response.data;
    } finally {
      isLoading.value = false;
    }
  }
}

// 在 View 中切换显示

class ArticleListPage extends GetView<ArticleListController> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('文章列表')),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const ListSkeleton();  // 加载中显示骨架屏
        }
        if (controller.articles.isEmpty) {
          return const EmptyState(description: '暂无文章');  // 空状态
        }
        return ListView.builder(
          itemCount: controller.articles.length,
          itemBuilder: (context, index) {
            final article = controller.articles[index];
            return ArticleCard(article: article);
          },
        );
      }),
    );
  }
}
```

---

## 四、EmptyState 空状态组件

### 4.1 组件设计

```dart
// shared/widgets/empty_state.dart

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String description;

  const EmptyState({
    super.key,
    this.icon = Icons.inbox_outlined,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 60),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 64,
              color: Theme.of(context).colorScheme.outline,
            ),
            const SizedBox(height: 12),
            Text(
              description,
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 4.2 使用场景

```dart
// 列表为空
if (articles.isEmpty) {
  return const EmptyState(description: '暂无文章');
}

// 搜索无结果
if (searchResults.isEmpty) {
  return const EmptyState(
    icon: Icons.search_off,
    description: '未找到匹配的内容',
  );
}

// 网络错误
if (hasError) {
  return EmptyState(
    icon: Icons.error_outline,
    description: '加载失败，请稍后重试',
  );
}
```

---

## 五、ArticleCard 列表项组件

### 5.1 组件实现

```dart
// shared/widgets/article_card.dart

class ArticleCard extends StatelessWidget {
  final Article article;

  const ArticleCard({super.key, required this.article});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: InkWell(
        onTap: () => Get.toNamed(
          AppRoutes.articleDetail,
          arguments: {'id': article.id},
        ),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 标题
              Text(
                article.title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              // 摘要
              if (article.summary != null)
                Text(
                  article.summary!,
                  style: TextStyle(
                    fontSize: 14,
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              const SizedBox(height: 12),
              // 元信息
              Row(
                children: [
                  Icon(
                    Icons.person_outline,
                    size: 14,
                    color: Theme.of(context).colorScheme.outline,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    article.author,
                    style: TextStyle(
                      fontSize: 12,
                      color: Theme.of(context).colorScheme.outline,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    article.createdAt,
                    style: TextStyle(
                      fontSize: 12,
                      color: Theme.of(context).colorScheme.outline,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 六、响应式布局策略

### 6.1 布局原则

```
Flutter 移动端响应式布局三层策略：

第一层：ScreenUtil 尺寸适配
├── 所有像素值使用 .w/.h/.sp
├── 自动按屏幕比例缩放
└── 解决"不同屏幕尺寸"问题

第二层：Material 3 主题系统
├── 使用 ColorScheme 语义化颜色
├── 自动适配亮/暗模式
└── 解决"不同视觉偏好"问题

第三层：自适应布局组件
├── LayoutBuilder → 根据父容器尺寸调整布局
├── OrientationBuilder → 根据横竖屏调整
├── MediaQuery → 获取屏幕尺寸/方向/文字缩放
└── 解决"复杂布局场景"问题
```

### 6.2 LayoutBuilder 示例

```dart
// 根据可用宽度调整列数

LayoutBuilder(
  builder: (context, constraints) {
    final width = constraints.maxWidth;
    final crossAxisCount = width > 600 ? 3 : 2;  // 平板 3 列，手机 2 列

    return GridView.builder(
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        childAspectRatio: 1.0,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) => ItemCard(item: items[index]),
    );
  },
);
```

### 6.3 MediaQuery 使用

```dart
// 获取屏幕信息

final screenWidth = MediaQuery.of(context).size.width;
final screenHeight = MediaQuery.of(context).size.height;
final padding = MediaQuery.of(context).padding;  // 安全区域
final textScaleFactor = MediaQuery.of(context).textScaleFactor;  // 系统字体缩放

// 适配刘海屏

SafeArea(
  child: Scaffold(
    body: MyContent(),  // 自动避开刘海/底部 Home Indicator
  ),
);
```

---

## 七、总结

### 7.1 核心知识图谱

```
Flutter UI 工程化
│
├── ScreenUtil 尺寸适配
│   ├── designSize → 设计稿基准
│   ├── .w/.h → 宽高缩放
│   ├── .sp → 字体缩放
│   └── minTextAdapt → 最小文本缩放
│
├── Material 3 主题系统
│   ├── ColorScheme.fromSeed → 自动生成配色
│   ├── ThemeData → 组件主题定制
│   ├── ThemeMode → 亮/暗模式切换
│   └── Theme.of(context) → 运行时获取主题
│
├── 加载状态设计
│   ├── Shimmer 骨架屏 → 预览布局结构
│   ├── EmptyState → 空数据占位
│   └── Loading → 简单加载指示器
│
└── 响应式布局
    ├── LayoutBuilder → 父容器尺寸感知
    ├── MediaQuery → 屏幕信息获取
    └── SafeArea → 安全区域适配
```

### 7.2 设计原则

| 原则       | 实践                                |
| ---------- | ----------------------------------- |
| 尺寸自适应 | 所有像素值使用 ScreenUtil 扩展      |
| 颜色语义化 | 使用 ColorScheme 而非硬编码颜色     |
| 状态可视化 | 加载中/空数据/错误都有明确 UI 反馈  |
| 组件复用   | 抽取通用组件（Card/Skeleton/Empty） |
| 暗色适配   | 所有颜色根据 brightness 动态调整    |

---

## 相关链接

- [GetX 模块化架构与路由守卫](/dev-knowledge/flutter/architecture/state-management/flutter-getx-modular-architecture-and-route-guards)
- [离线优先架构与分页加载](/dev-knowledge/flutter/architecture/thinking/flutter-offline-first-and-pagination)
- [全局错误处理与启动优化](/dev-knowledge/flutter/architecture/thinking/flutter-error-handling-and-launch-optimization)
