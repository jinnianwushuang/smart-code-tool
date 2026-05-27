export const tab_name = 'JS基础'
export const order = 10
export const docs = [
  {
    category: 'JS 底层与标准 (Core Standards)',
    icon: 'GlobalOutlined',
    tagColor: 'orange',
    items: [
      {
        name: 'ECMA-262',
        url: 'https://tc39.es',
        level: '标准',
        tag: '标准',
        desc: 'JavaScript(ECMAScript) 最新语言规范提案。',
      },
      {
        name: 'MDN Web Docs',
        url: 'https://developer.mozilla.org',
        level: '权威',
        tag: '权威',
        desc: 'Web 技术最权威的百科全书，架构师必查。',
      },
      {
        name: 'V8 引擎博客',
        url: 'https://v8.dev',
        level: '底层',
        tag: '底层',
        desc: '深入理解 JS 内存管理、JIT 编译及执行效率。',
      },
      {
        name: 'Node.js',
        url: 'https://nodejs.org/',
        level: '实践',
        tag: '实践',
        desc: 'JavaScript 运行时环境，支持构建高性能网络应用。',
      },

      {
        name: 'npm 仓库',
        url: 'https://www.npmjs.com',
        level: '实践',
        tag: '实践',
        desc: '全球最大的 JavaScript 包管理和分发平台。',
      },
    ],
  },

  {
    category: '主流 JS 库与工具',
    color: 'blue',
    items: [
      {
        name: 'Lodash / Lodash-es',
        url: 'https://lodash.com',
        tag: 'Utils',
        desc: '现代 JavaScript 实用工具库，提供高性能的数组、对象处理及函数节流防抖等功能。',
      },
      {
        name: 'Axios',
        url: 'https://axios-http.com',
        tag: 'Network',
        desc: '基于 Promise 的易用型 HTTP 客户端，支持拦截器、自动转换 JSON 及客户端防御 XSRF。',
      },
      {
        name: 'Day.js',
        url: 'https://day.js.org',
        tag: 'Date',
        desc: '极简的 JavaScript 时间日期处理库，API 与 Moment.js 兼容但体积仅有 2KB 左右。',
      },
      {
        name: 'ECharts',
        url: 'https://echarts.apache.org',
        tag: 'Data Viz',
        desc: '由 Apache 开源的强大数据可视化库，支持高度定制化的图表渲染与地理坐标系。',
      },
      {
        name: 'Zustand',
        url: 'https://docs.pmnd.rs',
        tag: 'State',
        desc: '极简、快速且可扩展的状态管理方案，架构师在处理复杂逻辑解耦时的轻量级优选。',
      },
      {
        name: 'Zod',
        url: 'https://zod.dev',
        tag: 'Schema',
        desc: '以 TypeScript 为首的模式声明和验证库，用于确保前端应用运行时的输入数据安全。',
      },
    ],
  },
  {
    category: '教程',
    color: 'purple',
    items: [
      {
        name: 'ES6 入门教程',
        url: 'https://es6.ruanyifeng.com/',
        tag: 'Format',
        desc: '阮一峰老师出品的 ES6 标准参考书',
      },
      {
        name: 'TypeScript 教程',
        url: 'https://wangdoc.com',
        tag: 'TS',
        desc: '阮一峰老师参与维护的 TypeScript 入门教程',
      },
      {
        name: '现代 JavaScript 教程',
        url: 'https://javascript.info',
        tag: 'Guide',
        desc: '从基础到高阶，内容极其详尽的开源教程',
      },
      {
        name: 'MDN Web Docs',
        url: 'https://mozilla.org',
        tag: 'Reference',
        desc: '权威、最全的 JavaScript 官方文档库',
      },
      {
        name: 'JavaScript 经典教程集合',
        url: 'https://awesome-programming-books.github.io/',
        tag: 'Deep Dive',
        desc: '深入探讨 JS 核心机制（闭包、原型、异步等）的经典书籍',
      },
      {
        name: 'JavaScript 算法与数据结构',
        url: 'https://github.com/trekhleb/javascript-algorithms',
        tag: 'CS',
        desc: '用 JS 实现的各种经典算法和数据结构示例',
      },
    ],
  },
  {
    category: '精选实战与代码美学',
    color: 'green',
    items: [
      {
        name: '30 Seconds of Code',
        url: 'https://www.30secondsofcode.org/',
        tag: 'Snippets',
        desc: '精选的高质量 JavaScript 代码片段，涵盖各种常见算法与工具函数。',
      },
      {
        name: 'Clean Code JS',
        url: 'https://github.com/ryanmcdermott/clean-code-javascript',
        tag: 'Best Practice',
        desc: '将经典的《代码整洁之道》原则应用到 JavaScript 中，大厂面试与架构必读。',
      },
    ],
  },
]
