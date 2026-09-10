export const tab_name = 'Flutter'
export const order = 80
export const docs = [
  {
    category: 'Flutter 核心与学习',
    color: 'cyan',
    items: [
      {
        name: 'Flutter 官网',
        url: 'https://docs.flutter.dev',
        tag: 'Official',
        desc: 'Google 出品的 UI 工具包,一份代码构建多端原生应用。',
      },
      {
        name: 'Dart 语言指南',
        url: 'https://dart.dev',
        tag: 'Language',
        desc: '深入理解强类型、混入 (Mixin) 及 AOT/JIT 编译特性。',
      },
      {
        name: 'Flutter Cookbook',
        url: 'https://docs.flutter.dev/cookbook',
        tag: 'Cookbook',
        desc: '官方提供的常见任务解决方案,快速查找实现方法。',
      },
      {
        name: 'Effective Dart',
        url: 'https://dart.dev/effective-dart',
        tag: 'Guide',
        desc: 'Dart 语言的最佳实践和编码规范指南。',
      },
    ],
  },
  {
    category: 'Flutter 中文资源',
    color: 'blue',
    items: [
      {
        name: 'Flutter 中文网',
        url: 'https://flutter.cn',
        tag: 'Community',
        desc: 'Flutter 官方中文社区,提供中文文档、资源、社区、博客、视频等。',
      },
      {
        name: 'Flutter 实战·第二版',
        url: 'https://book.flutterchina.club/',
        tag: 'Book',
        desc: '国内最流行、讲解极其透彻的入门进阶神书。',
      },
    ],
  },
  {
    category: '包管理与生态',
    color: 'orange',
    items: [
      {
        name: 'pub.dev',
        url: 'https://pub.dev',
        tag: 'Registry',
        desc: 'Flutter/Dart 官方包仓库,数以万计的优质包等待发现。',
      },
      {
        name: 'Flutter Gems',
        url: 'https://fluttergems.dev',
        tag: 'Guide',
        desc: 'Flutter 生态可视化指南,按功能场景分类查找 UI 库。',
      },
      {
        name: 'Pub Score',
        url: 'https://pub.dev/packages?sort=score',
        tag: 'Ranking',
        desc: '根据受欢迎程度排序的 Flutter 包列表,快速找到高质量组件。',
      },
    ],
  },
  {
    category: '状态管理方案',
    color: 'magenta',
    items: [
      {
        name: 'Riverpod',
        url: 'https://riverpod.dev',
        tag: 'Recommended',
        desc: 'Provider 的进阶版。不依赖 BuildContext,编译时安全,是目前大型工程化项目的首选方案。',
      },
      {
        name: 'Bloc',
        url: 'https://bloclibrary.dev',
        tag: 'Enterprise',
        desc: '基于事件流 (Stream) 的严谨架构。强制逻辑与 UI 分离,适合对测试和规范有极致要求的项目。',
      },
      {
        name: 'GetX',
        url: 'https://pub.dev/packages/get',
        tag: 'All-in-One',
        desc: '三合一框架(状态、路由、DI)。上手极快,无需 Context 即可跳转,适合中小型快速开发。',
      },
      {
        name: 'Provider',
        url: 'https://pub.dev/packages/provider',
        tag: 'Simple',
        desc: 'Flutter 官方推荐的状态管理方案,简单易用,适合初学者和小型项目。',
      },
    ],
  },
  {
    category: 'UI 组件库',
    color: 'purple',
    items: [
      {
        name: 'Material Design',
        url: 'https://m3.material.io/',
        tag: 'Design',
        desc: 'Google 的设计系统,Flutter 内置 Material 组件库。',
      },
      {
        name: 'Cupertino',
        url: 'https://docs.flutter.dev/ui/widgets/cupertino',
        tag: 'iOS',
        desc: 'Flutter 内置的 iOS 风格组件库,实现原生 iOS 体验。',
      },
      {
        name: 'FlutterFlow',
        url: 'https://flutterflow.io/',
        tag: 'No-Code',
        desc: '可视化 Flutter 应用构建平台,快速原型开发。',
      },
      {
        name: 'Rive',
        url: 'https://rive.app/',
        tag: 'Animation',
        desc: '交互式动画和图形设计工具,完美集成 Flutter。',
      },
    ],
  },
  {
    category: '测试与调试',
    color: 'red',
    items: [
      {
        name: 'Flutter Test',
        url: 'https://docs.flutter.dev/testing',
        tag: 'Testing',
        desc: 'Flutter 官方测试框架,支持单元测试、Widget 测试和集成测试。',
      },
      {
        name: 'Mockito',
        url: 'https://pub.dev/packages/mockito',
        tag: 'Mock',
        desc: 'Dart 的 Mock 框架,用于单元测试中的依赖模拟。',
      },
      {
        name: 'Integration Test',
        url: 'https://docs.flutter.dev/testing/integration-tests',
        tag: 'E2E',
        desc: '端到端测试框架,模拟真实用户操作。',
      },
      {
        name: 'Flutter DevTools',
        url: 'https://docs.flutter.dev/tools/devtools',
        tag: 'Debug',
        desc: 'Flutter 官方调试工具,提供完整的开发环境,包括 DevTools、Flutter Inspector、Flame Graph 等。',
      },
    ],
  },
  {
    category: '开发工具',
    color: 'orange',
    items: [
      {
        name: 'Flutter DevTools',
        url: 'https://docs.flutter.dev/tools/devtools',
        tag: 'Debug',
        desc: 'Flutter 官方调试工具,提供完整的开发环境,包括 DevTools、Flutter Inspector、Flame Graph 等。',
      },
      {
        name: 'Flutter Gems',
        url: 'https://fluttergems.dev',
        tag: 'Resources',
        desc: 'Flutter 生态可视化指南,按功能场景分类查找 UI 库。',
      },
      {
        name: 'DartPad',
        url: 'https://dartpad.dev',
        tag: 'Playground',
        desc: '免安装环境,在线编写并直接运行 Flutter 代码。',
      },
      {
        name: 'FlutterFire',
        url: 'https://firebase.flutter.dev',
        tag: 'Firebase',
        desc: 'Flutter 与 Firebase 的官方集成,简化后端服务接入。',
      },
    ],
  },
  {
    category: '精选开源项目',
    color: 'green',
    items: [
      {
        name: 'AppFlowy',
        url: 'https://github.com/AppFlowy-IO/AppFlowy',
        tag: 'Productivity',
        desc: '基于 Rust 和 Flutter 构建的开源 Notion 替代品,研究大型跨端应用与高性能后端集成的顶尖案例。',
      },
      {
        name: 'Wonderous',
        url: 'https://github.com/gskinnerTeam/flutter-wonderous-app',
        tag: 'UI/UX',
        desc: '官方合作伙伴 gskinner 出品,展示了 Flutter 极高级别的动画效果、性能优化与交互设计。',
      },
      {
        name: 'Immich',
        url: 'https://github.com/immich-app/immich',
        tag: 'Media',
        desc: '高性能自托管照片备份方案,其移动端是 Flutter 开发中处理大规模多媒体数据的优秀实战参考。',
      },
      {
        name: 'LocalSend',
        url: 'https://github.com/localsend/localsend',
        tag: 'Utility',
        desc: '极其流行的跨平台文件传输工具,研究 Flutter 桌面端网络通讯、多设备发现与自愈界面的典范。',
      },
      {
        name: 'RustDesk',
        url: 'https://github.com/rustdesk/rustdesk',
        tag: 'Remote Desktop',
        desc: '开源远程桌面工具,展示了 Flutter 在处理高性能底层 C++/Rust 绑定与复杂窗口管理中的实力。',
      },
    ],
  },
  {
    category: '性能优化与部署',
    color: 'teal',
    items: [
      {
        name: 'Flutter Performance',
        url: 'https://docs.flutter.dev/perf',
        tag: 'Performance',
        desc: '官方性能优化指南,涵盖渲染性能、内存管理和启动速度优化。',
      },
      {
        name: 'Flutter Web Deployment',
        url: 'https://docs.flutter.dev/deployment/web',
        tag: 'Web',
        desc: 'Flutter Web 应用的部署指南,支持多种托管平台。',
      },
      {
        name: 'Firebase Hosting',
        url: 'https://firebase.google.com/docs/hosting',
        tag: 'Hosting',
        desc: 'Google Firebase 提供的静态网站托管服务,适合 Flutter Web 应用。',
      },
      {
        name: 'Codemagic',
        url: 'https://codemagic.io/',
        tag: 'CI/CD',
        desc: '专为 Flutter 打造的 CI/CD 平台,自动化构建、测试和发布流程。',
      },
    ],
  },
]
