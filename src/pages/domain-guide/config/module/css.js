export const tab_name = 'CSS'
export const order = 11
export const docs = [
  {
    category: '核心标准与文档',
    color: 'blue',
    items: [
      {
        name: 'MDN CSS Reference',
        url: 'https://developer.mozilla.org/zh-CN/docs/Web/CSS',
        tag: 'Doc',
        desc: 'Web 开发最权威的 CSS 参考文档，涵盖所有属性、选择器及核心概念。',
      },
      {
        name: 'CSS-Tricks',
        url: 'https://css-tricks.com/',
        tag: 'Blog',
        desc: '虽然已停止更新，但其关于 Flexbox 和 Grid 的指南仍是业界公认的金标准。',
      },
      {
        name: 'Can I Use',
        url: 'https://caniuse.com',
        tag: 'Tool',
        desc: '实时查询浏览器对 CSS 特性的支持情况，架构师做兼容性决策必备。',
      },
    ],
  },
  {
    category: '预处理器与后处理器',
    color: 'orange',
    items: [
      {
        name: 'Sass / SCSS',
        url: 'https://sass-lang.com/',
        tag: 'Preprocessor',
        desc: '成熟、稳定、强大的专业级 CSS 扩展语言，支持变量、嵌套及混入 (Mixin)。',
      },
      {
        name: 'PostCSS',
        url: 'https://postcss.org/',
        tag: 'Tool',
        desc: '使用 JavaScript 插件转换 CSS 的工具，支持 Autoprefixer 及现代 CSS 特性降级。',
      },
      {
        name: 'Less',
        url: 'https://lesscss.org/',
        tag: 'Preprocessor',
        desc: '向后兼容的 CSS 扩展语言，在许多成熟的中后台 UI 库（如 AntD）中广泛使用。',
      },
      {
        name: 'Stylus',
        url: 'https://stylus-lang.com/',
        tag: 'Preprocessor',
        desc: '富有表现力的、动态的、健壮的 CSS 预处理器，语法极其灵活。',
      },
    ],
  },
  {
    category: '现代 CSS 方案',
    color: 'green',
    items: [
      {
        name: 'Tailwind CSS',
        url: 'https://tailwindcss.com/',
        tag: 'Utility-first',
        desc: '目前全球最流行的原子化 CSS 框架，通过组合 Class 快速构建响应式 UI。',
      },
      {
        name: 'UnoCSS',
        url: 'https://unocss.dev/',
        tag: 'Engine',
        desc: '即时按需的原子化 CSS 引擎，极致的性能与灵活性，Vite 生态的首选。',
      },
      {
        name: 'CSS Modules',
        url: 'https://github.com/css-modules/css-modules',
        tag: 'Standard',
        desc: '通过自动生成唯一类名解决 CSS 全局作用域污染的工业级方案。',
      },
    ],
  },
  {
    category: 'CSS 动画与视觉交互',
    color: 'magenta',
    items: [
      {
        name: 'Animate.css',
        url: 'https://animate.style/',
        tag: 'Animation',
        desc: '经典的跨浏览器预设 CSS 动画库，开箱即用，适合快速实现进场动效。',
      },
      {
        name: 'GSAP',
        url: 'https://gsap.com/',
        tag: 'Performance',
        desc: '性能极强、交互丰富的动画库，支持对复杂 CSS 属性进行精细的补间控制。',
      },
      {
        name: 'Magic CSS',
        url: 'https://www.minimamente.com/project/magic/',
        tag: 'Visual',
        desc: '提供一系列具有视觉冲击力的 CSS3 动画效果，适合营销页面。',
      },
    ],
  },
  {
    category: 'CSS-in-JS 方案',
    color: 'cyan',
    items: [
      {
        name: 'Styled Components',
        url: 'https://styled-components.com/',
        tag: 'Runtime',
        desc: 'React 生态中最流行的 CSS-in-JS 库，使用标签模板字符串编写样式，支持动态 Props。',
      },
      {
        name: 'Emotion',
        url: 'https://emotion.sh/',
        tag: 'Flexible',
        desc: '高性能、灵活的 CSS-in-JS 库，支持字符串和对象样式，是 MUI 等大型组件库的底层依赖。',
      },
      {
        name: 'Vanilla Extract',
        url: 'https://vanilla-extract.style/',
        tag: 'Zero-runtime',
        desc: '使用 TypeScript 编写的零运行时 CSS-in-JS，提供极致的类型安全与构建时优化。',
      },
      {
        name: 'StyleX',
        url: 'https://stylexjs.com/',
        tag: 'Standard',
        desc: '由 Meta 开源的类型安全、静态编译的 CSS 系统，旨在解决超大规模项目的样式扩展挑战。',
      },
    ],
  },
]
