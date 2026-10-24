/**
 * ⚠️ AI / 开发者须知：
 * 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 * 新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 * id 一旦生成永不修改，即使 text / link 变更也保持原值。
 * VitePress 会忽略 id 字段，不影响解析。
 */

// ── Flutter 体系 ──
export const flutterSection = {
  text: 'Flutter 体系',
  collapsed: false,
  items: [
    {
      text: '架构设计',
      collapsed: true,
      items: [
        {
          id: 'KbBCv62gFVzrycd3XvOO_3TP',
          text: '状态管理架构选型',
          link: '/dev-knowledge/flutter/architecture/state-management/flutter-state-management-architecture',
        },
        {
          id: 'jK4lM8nO9pQrStUvWxYzAb',
          text: 'GetX 模块化架构与路由守卫',
          link: '/dev-knowledge/flutter/architecture/state-management/flutter-getx-modular-architecture-and-route-guards',
        },
        {
          id: 'uHcM_T2B52yVU-u-GjENoQI0',
          text: '路由架构设计',
          link: '/dev-knowledge/flutter/architecture/routing/flutter-routing-architecture',
        },
        {
          id: '7Uu_qlN-TJ-WqqrOlSsH2Fnc',
          text: '网络层架构设计',
          link: '/dev-knowledge/flutter/architecture/networking/flutter-network-architecture',
        },
        {
          id: 'mN3pQ7rT7vWxYzAbCdEfGh',
          text: 'Dio 拦截器链与 Token 无感刷新',
          link: '/dev-knowledge/flutter/architecture/networking/flutter-dio-interceptor-chain-and-token-refresh',
        },
        {
          id: 'isSEc6XtrCeB1vPoZaaeJx7p',
          text: '项目结构与分层规范',
          link: '/dev-knowledge/flutter/architecture/project-structure/flutter-project-structure',
        },
        {
          id: 'Bgc270M67VMEpOscZXHdzzHf',
          text: '渲染管线与 Impeller',
          link: '/dev-knowledge/flutter/architecture/rendering/flutter-rendering-pipeline',
        },
        {
          id: 'LpF1Wz_wLwzwICMW9gLR07oI',
          text: '性能优化实战',
          link: '/dev-knowledge/flutter/architecture/performance/flutter-performance-optimization',
        },
        {
          id: 'cD5eF6gH7iJ8kL9mN0oPqR',
          text: 'UI 适配·主题·加载状态设计',
          link: '/dev-knowledge/flutter/architecture/performance/flutter-ui-adaptation-theming-loading-states',
        },
        {
          id: 'HWDzZAuNvqSdv91bjRfEhf6c',
          text: '插件开发架构',
          link: '/dev-knowledge/flutter/architecture/plugin/flutter-plugin-architecture',
        },
        {
          text: '思考文档',
          collapsed: true,
          items: [
            {
              id: '-hyBAm5xogA7hMFLQXwR6Amb',
              text: '原生开发主流语言对比',
              link: '/dev-knowledge/flutter/architecture/thinking/native-languages-comparison',
            },
            {
              id: '-fW5fF51prhT6C9jqfbwVbnn',
              text: 'iOS 与 Android 必备知识',
              link: '/dev-knowledge/flutter/architecture/thinking/flutter-ios-android-knowledge',
            },
            {
              id: 'HVm3YZa2uTKGBCXNKBGbpAdD',
              text: 'APP 启动与屏幕渲染原理',
              link: '/dev-knowledge/flutter/architecture/thinking/app-launch-and-rendering-pipeline',
            },
            {
              id: 'cfzKvw7B0xKS3wTRciuLOFa6',
              text: '系统内核与平台差异适配',
              link: '/dev-knowledge/flutter/architecture/thinking/os-kernel-platform-differences',
            },
            {
              id: '8B28ShJQKM16_BXjjB6tbyU6',
              text: '网络层与弱网优化',
              link: '/dev-knowledge/flutter/architecture/thinking/mobile-network-layer',
            },
            {
              id: 'A-R-fVowDMq6YNjsd8Br2EDv',
              text: '内存管理与性能调优',
              link: '/dev-knowledge/flutter/architecture/thinking/memory-management-performance',
            },
            {
              id: 'Qhw_0pOrcA1fHAwdfWfVcj7E',
              text: '音视频与相机管线',
              link: '/dev-knowledge/flutter/architecture/thinking/audio-video-camera',
            },
            {
              id: 'K5Rl92RPC-6HiRthT3K5ZQKV',
              text: '数据·算法·显示 三者分离',
              link: '/dev-knowledge/flutter/architecture/thinking/data-algorithm-view-separation',
            },
            {
              id: 'rlIouQ8Dsr1HIVb83ZNNkrlj',
              text: '组件设计模式',
              link: '/dev-knowledge/flutter/architecture/thinking/flutter-component-design-patterns',
            },
            {
              id: 'L8HpzqpbDGjtE01xh4QNzDPg',
              text: 'setState 滥用与 Widget 重建失控',
              link: '/dev-knowledge/flutter/architecture/thinking/setstate-rebuild-chaos-root-cause',
            },
            {
              id: 'BHF7S0XNwLAHxncKTawqTW13',
              text: 'Widget × 帧调度 × 三层对象同步',
              link: '/dev-knowledge/flutter/architecture/thinking/widget-frame-sync-formula',
            },
            {
              id: 'yJkjUZ6K5zfVO5wfhnLBK3Sk',
              text: '大型深层对象的按频率分频治理',
              link: '/dev-knowledge/flutter/architecture/thinking/deep-object-frequency-governance-cn',
            },
            {
              id: 'l0gTibqpTdhNZn4yiu8FfMvr',
              text: '节点数据结构精讲：三棵树',
              link: '/dev-knowledge/flutter/architecture/thinking/element-widget-renderobject-tree',
            },
            {
              id: '93u6FYYBuUMhDs8AKUg3R0Xl',
              text: '存储与数据同步',
              link: '/dev-knowledge/flutter/architecture/thinking/storage-data-sync',
            },
            {
              id: '-wXH82X5rUl4u4GWscJU9Qtu',
              text: '安全攻防基础',
              link: '/dev-knowledge/flutter/architecture/thinking/mobile-security',
            },
            {
              id: 'khrv3JWx-4QXNKJ7g99e1dfo',
              text: '混合栈与模块化架构',
              link: '/dev-knowledge/flutter/architecture/thinking/hybrid-stack-modularization',
            },
            {
              id: 'lGYwyIS94_nINNZz1XDXcPTJ',
              text: 'CI/CD 与发布工程化',
              link: '/dev-knowledge/flutter/architecture/thinking/cicd-release-engineering',
            },
            {
              id: 'HLCXZsx12bscxu6bzHij-06z',
              text: '测试体系',
              link: '/dev-knowledge/flutter/architecture/thinking/testing-system',
            },
            {
              id: 'sT1uV2wX3yZ4aB5cD6eF7g',
              text: 'build_runner 代码生成工程化',
              link: '/dev-knowledge/flutter/architecture/thinking/flutter-build-runner-code-generation',
            },
            {
              id: 'hI8jK9lM0nO1pQ2rS3tU4v',
              text: '离线优先架构与分页加载',
              link: '/dev-knowledge/flutter/architecture/thinking/flutter-offline-first-and-pagination',
            },
            {
              id: 'wX5yZ6aB7cD8eF9gH0iJ1k',
              text: '全局错误处理与启动优化',
              link: '/dev-knowledge/flutter/architecture/thinking/flutter-error-handling-and-launch-optimization',
            },
            {
              id: 'lM2nO3pQ4rS5tU6vW7xY8z',
              text: 'slang 国际化方案',
              link: '/dev-knowledge/flutter/architecture/thinking/flutter-slang-i18n-solution',
            },
          ],
        },
        {
          text: '典型拆解',
          collapsed: true,
          items: [
            {
              id: 'aUG6KrqH31voEkF8JFWP_69a',
              text: 'GetX 框架底层设计原理',
              link: '/dev-knowledge/flutter/architecture/typical-analysis/getx-reactive-system',
            },
            {
              id: 'vut3BJhl2AtM1q9mJvEVfQmi',
              text: 'Widget 重建与 Element 更新拆解',
              link: '/dev-knowledge/flutter/architecture/typical-analysis/flutter-widget-rebuild',
            },
            {
              id: 'PIGJBdMMaqpkNVEZFcgxx_9R',
              text: 'Dart Future/Stream/Isolate 异步调度',
              link: '/dev-knowledge/flutter/architecture/typical-analysis/dart-async-scheduling',
            },
            {
              id: 'LZsPzHC1MZ1CD_qZyTB3szK0',
              text: 'StatefulWidget 底层原理',
              link: '/dev-knowledge/flutter/architecture/typical-analysis/flutter-stateful-widget-internals',
            },
            {
              id: 'kR7mNx2QwVpL9tYjHdF3sZ8a',
              text: 'WidgetsFlutterBinding 底层原理与启动全链路',
              link: '/dev-knowledge/flutter/architecture/typical-analysis/flutter-binding-init-and-engine-bootstrap',
            },
          ],
        },
      ],
    },
    {
      text: '面试知识库',
      collapsed: true,
      items: [
        {
          text: '中级 [P5-P6]',
          collapsed: true,
          items: [
            {
              id: 'in6d1Hl_mssi1o6gqqIYwsOb',
              text: 'Dart 语言基础与核心特性 [P5-P6]',
              link: '/dev-knowledge/flutter/interview/intermediate/flutter-dart-basics',
            },
            {
              id: 'QKV18LLgycWkfAjy79HUk34q',
              text: 'Widget 体系与布局系统 [P5-P6]',
              link: '/dev-knowledge/flutter/interview/intermediate/flutter-widget-and-layout',
            },
            {
              id: 'dGXGFv1spj2oc4tDEtuPEAGj',
              text: '状态管理基础 [P5-P6]',
              link: '/dev-knowledge/flutter/interview/intermediate/flutter-state-management-basics',
            },
            {
              id: 'P-Uw6FmGQpTUhjVr0e0TVxOM',
              text: '导航与路由实战 [P5-P6]',
              link: '/dev-knowledge/flutter/interview/intermediate/flutter-navigation-and-routing',
            },
          ],
        },
        {
          text: '高级 [P6-P7/P8]',
          collapsed: true,
          items: [
            {
              id: 'j7rM9VOgk1uTN12yGhx_GPu5',
              text: '渲染引擎 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/rendering-engine',
            },
            {
              id: 'w9DX0zUy_RmeeENpVzCAPS-R',
              text: 'Dart 语言深度 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/dart-advanced',
            },
            {
              id: 'NmXVJAB3u6Z73UJ1gW1vwJJA',
              text: '状态管理架构 [P8]',
              link: '/dev-knowledge/flutter/interview/advanced/architecture-patterns',
            },
            {
              id: 'G0v8zUZoxOLs-8gpgbOEtpWb',
              text: '与原生交互 [P8]',
              link: '/dev-knowledge/flutter/interview/advanced/platform-interop',
            },
            {
              id: 'f_ZJMcefLeF1NqZn0SrRlqNH',
              text: '性能优化与工程化 [P8]',
              link: '/dev-knowledge/flutter/interview/advanced/performance-engineering',
            },
            {
              id: '3GxIoUUdsywHvEyMQ-JS_Jxr',
              text: 'Riverpod 状态管理深度 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/riverpod-deep',
            },
            {
              id: 'AoOEv_P4GbqgzZX6h90LztJY',
              text: 'BLoC/Cubit 架构模式 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/bloc-cubit-architecture',
            },
            {
              id: 'SgbKK2tFJ-aPBVU6ehcJ2pBY',
              text: 'GetX 生态体系 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/getx-ecosystem',
            },
            {
              id: 'FqUBIIsc32dgdMvsC8Wru5c7',
              text: 'GoRouter 路由管理深度 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/go-router-deep',
            },
            {
              id: 'GAgHctm4HfKkb9nI-WwIP4Q-',
              text: 'Dio 网络层与 HTTP 客户端 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/dio-and-networking',
            },
            {
              id: 'DssKXepkIEINRm-hBfmzqOpI',
              text: '本地存储与持久化 [P6-P7]',
              link: '/dev-knowledge/flutter/interview/advanced/flutter-local-storage',
            },
          ],
        },
      ],
    },
    {
      text: '技术选型',
      collapsed: true,
      items: [
        {
          text: '选型总览',
          link: '/dev-knowledge/flutter/architecture/technology-selection/',
          id: 'YjGY3Nh-jm4CAFZPuAnoxf7C',
        },
        {
          text: '状态管理选型',
          link: '/dev-knowledge/flutter/architecture/technology-selection/state-management',
          id: '9l3xUTzQgPKEZkFZlg0m7T8U',
        },
        {
          text: '路由导航选型',
          link: '/dev-knowledge/flutter/architecture/technology-selection/routing',
          id: 'EvohiaDNjja04qXuxTpNeWI3',
        },
        {
          text: '网络请求选型',
          link: '/dev-knowledge/flutter/architecture/technology-selection/networking',
          id: 'c1835YlsFeNgTrJOxzIyw-YI',
        },
        {
          text: '本地存储选型',
          link: '/dev-knowledge/flutter/architecture/technology-selection/storage',
          id: 'Cb16UoRc6oA-S7a4vpFZQH7W',
        },
      ],
    },
  ],
}
