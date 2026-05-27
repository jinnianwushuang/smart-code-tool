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
  {
    category: '精选实战与顶级开源项目',
    color: 'blue',
    items: [
      {
        name: 'AppFlowy',
        url: 'https://github.com/AppFlowy-IO/AppFlowy',
        tag: 'Architecture',
        desc: '基于 Rust 和 Flutter 构建的开源 Notion 替代品，研究大型跨端应用与高性能后端集成的顶尖案例。',
      },
      {
        name: 'Wonderous',
        url: 'https://github.com/gskinnerTeam/flutter-wonderous-app',
        tag: 'UI/UX',
        desc: '官方合作伙伴 gskinner 出品，展示了 Flutter 极高级别的动画效果、性能优化与交互设计。',
      },
      {
        name: 'Immich',
        url: 'https://github.com/immich-app/immich',
        tag: 'App',
        desc: '高性能自托管照片备份方案，其移动端是 Flutter 开发中处理大规模多媒体数据的优秀实战参考。',
      },
    ],
  },
  {
    category: '桌面端特化实战参考',
    color: 'geekblue',
    items: [
      {
        name: 'LocalSend',
        url: 'https://github.com/localsend/localsend',
        tag: 'Utility',
        desc: '极其流行的跨平台文件传输工具，研究 Flutter 桌面端网络通讯、多设备发现与自愈界面的典范。',
      },
      {
        name: 'RustDesk',
        url: 'https://github.com/rustdesk/rustdesk',
        tag: 'Tool',
        desc: '开源远程桌面工具，展示了 Flutter 在处理高性能底层 C++/Rust 绑定与复杂窗口管理中的实力。',
      },
      {
        name: 'Spotube',
        url: 'https://github.com/KRTirtho/spotube',
        tag: 'Media',
        desc: '现代化轻量级音乐播放器，研究 Flutter 桌面端多媒体 API 调用与原生视觉风格适配的最佳实践。',
      },
    ],
  },
]
