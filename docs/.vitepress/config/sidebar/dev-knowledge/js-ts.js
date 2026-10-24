/**
 * ⚠️ AI / 开发者须知：
 * 每个带 link 的叶子菜单项必须包含 id 字段（24 位 nanoid），作为文档的稳定锚点。
 * 新增菜单时请运行: node scripts/inject-sidebar-ids.mjs 自动生成 id
 * id 一旦生成永不修改，即使 text / link 变更也保持原值。
 * VitePress 会忽略 id 字段，不影响解析。
 */

// ── JS / TS 体系 ──
export const jsTsSection = {
  text: 'JS / TS 体系',
  collapsed: false,
  items: [
    {
      text: '架构设计 · 典型拆解',
      collapsed: true,
      items: [
        {
          id: 'kO6UCEdk1rha6K4KV9OUMQOA',
          text: 'TypeScript 类型拆解',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/typescript-type-analysis',
        },
        {
          id: 'rA9udWF5wwQaBV5VONkhjHje',
          text: 'Node.js 事件调度拆解',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/nodejs-event-scheduling',
        },
        {
          id: '8jpruzE08DnJORpME6b90wec',
          text: '浏览器端 JS 调度拆解',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/browser-js-scheduling',
        },
        {
          id: 'fiSVVWqF2Dxd6X7HVZBCIf-E',
          text: 'Promise/A+ 手写实现',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/promise-implementation',
        },
        {
          id: 'cMDL7J_dlxosVNwZWbw3e0-3',
          text: '原型链与继承拆解',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/prototype-chain-and-inheritance',
        },
        {
          id: 'VckFdImfXejTKmAFXzMrhW8v',
          text: '虚拟 DOM Diff 算法',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/virtual-dom-diff',
        },
        {
          id: 'oSYkTg_vQz_QEmIz4N_zuELr',
          text: '响应式系统核心原理',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/reactive-system',
        },
        {
          id: 'XC-rS--Mh3XKnZeyyoyvGsmZ',
          text: '深拷贝全场景拆解',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/deep-clone',
        },
        {
          id: 'AFw4gelpkEVB4vIUYsfdZ7JC',
          text: '前端路由系统实现',
          link: '/dev-knowledge/js-ts/architecture/typical-analysis/frontend-router',
        },
      ],
    },
    {
      text: '面试知识库',
      collapsed: true,
      items: [
        {
          text: '初级 [P4-P5]',
          collapsed: true,
          items: [
            {
              id: '-8Ksefqf4tkT7hwGUQRIj8Q6',
              text: 'JavaScript 基础：变量、类型、运算 [P4-P5]',
              link: '/dev-knowledge/js-ts/interview/junior/js-basics',
            },
            {
              id: 'UItBDrfw2U9Rtr2KOnGcWUrV',
              text: '函数与作用域基础 [P4-P5]',
              link: '/dev-knowledge/js-ts/interview/junior/functions-and-scope',
            },
            {
              id: 'YEEDCwCS-nltorVKGkBRoR3_',
              text: '对象与类基础 [P4-P5]',
              link: '/dev-knowledge/js-ts/interview/junior/objects-and-classes',
            },
            {
              id: '7uONuDNKP_gqPNQ-J-Jeohtc',
              text: 'DOM 操作与事件处理 [P4-P5]',
              link: '/dev-knowledge/js-ts/interview/junior/dom-and-events',
            },
            {
              id: 'cw_Z5xqtiTQKuYsB1tfHNj59',
              text: 'TypeScript 入门：类型注解 [P4-P5]',
              link: '/dev-knowledge/js-ts/interview/junior/typescript-basics',
            },
          ],
        },
        {
          text: '中级 [P5-P6]',
          collapsed: true,
          items: [
            {
              id: 'F4VxPMbplonlBcXGir85BSRW',
              text: '闭包、作用域链与执行上下文 [P5-P6]',
              link: '/dev-knowledge/js-ts/interview/intermediate/js-closures-context',
            },
            {
              id: 'nXuLnjEeFAwes6mQntpEkvhl',
              text: 'ES6+ 模块系统与工程化 [P5-P6]',
              link: '/dev-knowledge/js-ts/interview/intermediate/es6-modules',
            },
            {
              id: 'jGIyz_l6Y6fBN52EEMS7fTjd',
              text: 'JavaScript 常用设计模式 [P5-P6]',
              link: '/dev-knowledge/js-ts/interview/intermediate/js-design-patterns',
            },
          ],
        },
        {
          text: 'JavaScript 深度 [P6-P7]',
          collapsed: true,
          items: [
            {
              id: '7FcTxvyZBydnGCbzkm5cQoxu',
              text: 'V8 引擎与 JavaScript 运行时 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/javascript-advanced/engine-and-runtime',
            },
            {
              id: 'gnorY4RZxUOKwykn2ioHkANp',
              text: 'Node.js 运行时 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/javascript-advanced/nodejs-runtime',
            },
            {
              id: 'yFqASUX54rzj7s_cT9mVYLsZ',
              text: 'JavaScript 类型系统深层 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/javascript-advanced/type-system-deep',
            },
            {
              id: 'TgGwpjj5SXvzYLmB7Ra6JSl-',
              text: '异步编程模型演进 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/javascript-advanced/async-model',
            },
            {
              id: 'H2u9GDIVRhFh97F-lyNjerIZ',
              text: 'GC 算法与内存管理 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/javascript-advanced/gc-and-memory',
            },
            {
              id: '62rt3B2SWG3BEPh3K5eVjdax',
              text: '原型链本质与元编程 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/javascript-advanced/prototype-and-oop',
            },
            {
              id: '-NSuUpm2IdWaXYyJn0Y7UFHx',
              text: 'ES2025/2026 新特性 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/javascript-advanced/es2025-2026',
            },
          ],
        },
        {
          text: 'TypeScript 高阶',
          collapsed: true,
          items: [
            {
              id: 'lVGwkawU2L-vH4CSmKW0p0jv',
              text: '高级类型体操 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/typescript/type-challenges',
            },
            {
              id: 'RWRfyoRtAo4F7ZGdVNEu_zfs',
              text: 'TypeScript 编译器架构 [P8]',
              link: '/dev-knowledge/js-ts/interview/typescript/compiler-internals',
            },
            {
              id: 'Ub4w0Hzgi2rzNFbYqP_iBmHU',
              text: '类型系统设计哲学 [P8]',
              link: '/dev-knowledge/js-ts/interview/typescript/type-system-design',
            },
            {
              id: 'VSA0v1QWEeL1ulrWdbEpi9In',
              text: 'TypeScript 5.x 新特性 [P6-P7]',
              link: '/dev-knowledge/js-ts/interview/typescript/ts5-new-features',
            },
          ],
        },
      ],
    },
  ],
}
