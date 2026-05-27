export const tab_name = 'flutter'
export const order = 70
export const docs = [
  {
    category: 'Flutter 跨平台核心',
    color: 'cyan',
    brandColor: '#02569B',

    items: [
      {
        name: 'Flutter 官网',
        url: 'https://docs.flutter.dev',
        tag: 'Framework',
        desc: 'Google 出品的 UI 工具包，一份代码构建多端原生应用。',
        priority: 5,
      },

      {
        name: 'Dart 语言指南',
        url: 'https://dart.dev',
        tag: 'Language',
        desc: '深入理解强类型、混入 (Mixin) 及 AOT/JIT 编译特性。',
        priority: 5,
      },
      {
        name: 'pub 仓库',
        url: 'https://pub.dev',
        tag: 'packages',
        desc: '仓库中数以万计的 Flutter 包，涵盖状态管理、UI 组件、工具库等各个方面。',
        priority: 4,
      },
    ],
  },

  {
    category: 'Flutter 中文',
    color: 'cyan',
    brandColor: '#02569B',

    items: [
      {
        name: 'Flutter 中文网',
        url: 'https://flutter.cn',
        tag: 'Framework',
        desc: 'Flutter 官方中文社区，提供中文文档、资源、社区、博客、视频等。',
        priority: 5,
      },

      {
        name: 'Flutter 实战·第二版',
        url: 'https://book.flutterchina.club/',
        tag: '教程',
        desc: '国内最流行、讲解极其透彻的入门进阶神书',
        priority: 5,
      },
    ],
  },

  {
    category: 'Flutter 状态管理选型',
    color: 'magenta',
    brandColor: '#02569B',

    items: [
      {
        name: 'GetX',
        url: 'https://pub.dev',
        tag: 'All-in-One',
        desc: '三合一框架（状态、路由、DI）。上手极快，无需 Context 即可跳转，适合中小型快速开发。',
        priority: 4,
      },
      {
        name: 'Riverpod',
        url: 'https://riverpod.dev',
        tag: 'Compile-safe',
        desc: 'Provider 的进阶版。不依赖 BuildContext，编译时安全，是目前大型工程化项目的首选方案。',
        priority: 5,
      },
      {
        name: 'Bloc',
        url: 'https://bloclibrary.dev',
        tag: 'Enterprise',
        desc: '基于事件流 (Stream) 的严谨架构。强制逻辑与 UI 分离，适合对测试和规范有极致要求的项目。',
        priority: 5,
      },
    ],
  },

  {
    category: 'Flutter 进阶与图形',
    color: 'geekblue',
    brandColor: '#0175C2',

    items: [
      {
        name: 'Flutter Rendering',
        url: 'https://docs.flutter.devresources/architectural-overview',
        tag: 'Engine',
        desc: '解析三棵树渲染机制（Widget/Element/RenderObject）。',
        priority: 5,
      },
      {
        name: 'Flutter Samples',
        url: 'https://flutter.github.io',
        tag: 'Showcase',
        desc: '官方精品项目实战代码库，架构师参考其组件封装模式。',
        priority: 4,
      },
      {
        name: 'Skia Graphics',
        url: 'https://skia.org',
        tag: 'Graphics',
        desc: '底层二维图形库文档，了解 Flutter 每一像素如何被绘制。',
        priority: 3,
      },
    ],
  },
  {
    category: 'Flutter 工具',
    color: 'gold',
    brandColor: '#FFB800',

    items: [
      {
        name: 'Flutter DevTools',
        url: 'https://flutter.dev/docs/development/tools/devtools/overview',
        tag: 'Debug',
        desc: 'Flutter 官方调试工具，提供完整的开发环境，包括 DevTools、Flutter Inspector、Flame Graph 等。',
        priority: 5,
      },
      {
        name: 'Flutter Gems',
        url: 'https://fluttergems.dev',
        tag: '资源导航',
        desc: 'Flutter 生态可视化指南，按功能场景分类查找 UI 库',
        priority: 4,
      },
      {
        name: 'DartPad',
        url: 'https://dartpad.dev',
        tag: '工具/沙盒',
        desc: '免安装环境，在线编写并直接运行 Flutter 代码',
        priority: 3,
      },
    ],
  },
]
