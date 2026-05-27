export const tab_name = 'Rust'
export const order = 90
export const docs = [
  {
    category: 'Rust 核心与生态',
    color: 'red',
    items: [
      {
        name: 'Rust 官网',
        url: 'https://www.rust-lang.org/zh-CN',
        tag: 'Core',
        desc: 'Rust 编程语言官方网站，强调安全、并发与性能。',
      },
      {
        name: 'Rust 程序设计语言',
        url: 'https://doc.rust-lang.org/book/',
        tag: 'Book',
        desc: 'Rust 官方入门圣经（The Book），系统讲解所有权等核心概念。',
      },
      {
        name: 'Crates.io',
        url: 'https://crates.io/',
        tag: 'Registry',
        desc: 'Rust 的包注册中心，类似于 npm 或 PyPI。',
      },
      {
        name: 'Docs.rs',
        url: 'https://docs.rs/',
        tag: 'Registry',
        desc: '为 Crates.io 上的所有包自动生成的 API 文档中心。',
      },
    ],
  },
  {
    category: 'Rust 后端与异步框架',
    color: 'orange',
    items: [
      {
        name: 'Axum',
        url: 'https://github.com/tokio-rs/axum',
        tag: 'Framework',
        desc: '基于 Tokio 栈构建的模块化 Web 框架，深受开发者喜爱。',
      },
      {
        name: 'Actix-web',
        url: 'https://actix.rs/',
        tag: 'Framework',
        desc: '高性能、类型安全的 Rust Web 框架，多次在性能榜单登顶。',
      },
      {
        name: 'Tokio',
        url: 'https://tokio.rs/',
        tag: 'Runtime',
        desc: 'Rust 异步编程的事实标准运行时。',
      },
      {
        name: 'SQLx',
        url: 'https://github.com/launchbadge/sqlx',
        tag: 'Database',
        desc: '纯 Rust 编写的异步、编译时类型检查的 SQL 查询库。',
      },
      {
        name: 'Leptos',
        url: 'https://leptos.dev',
        tag: 'Frontend',
        desc: '全栈、高性能的 Rust Web 框架，具有细粒度的响应式系统。',
      },
    ],
  },
  {
    category: 'Rust 应用与工具',
    color: 'blue',
    items: [
      {
        name: 'Tauri',
        url: 'https://tauri.app/',
        tag: 'App',
        desc: '使用 Web 前端构建极小、极快、跨平台的桌面应用后端框架。',
      },
      {
        name: 'Rust by Example',
        url: 'https://doc.rust-lang.org/stable/rust-by-example/',
        tag: 'Guide',
        desc: '通过可运行的示例学习 Rust 语法。',
      },
    ],
  },
]
