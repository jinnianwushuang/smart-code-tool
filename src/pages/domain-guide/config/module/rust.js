export const tab_name = 'Rust'
export const order = 110
export const docs = [
  {
    category: 'Rust 核心与学习',
    color: 'red',
    items: [
      {
        name: 'Rust 官网',
        url: 'https://www.rust-lang.org/zh-CN',
        tag: 'Official',
        desc: 'Rust 编程语言官方网站,强调安全、并发与性能。',
      },
      {
        name: 'The Book (官方指南)',
        url: 'https://doc.rust-lang.org/book/',
        tag: 'Book',
        desc: 'Rust 官方入门圣经,系统讲解所有权、借用等核心概念。',
      },
      {
        name: 'Rust by Example',
        url: 'https://doc.rust-lang.org/stable/rust-by-example/',
        tag: 'Guide',
        desc: '通过可运行的示例学习 Rust 语法,实践驱动的学习方式。',
      },
      {
        name: 'Rustlings',
        url: 'https://github.com/rust-lang/rustlings',
        tag: 'Practice',
        desc: '官方提供的小练习项目,帮助新手熟悉 Rust 编译器错误信息。',
      },
      {
        name: 'Rust Cookbook',
        url: 'https://rust-lang-nursery.github.io/rust-cookbook/',
        tag: 'Cookbook',
        desc: '展示常见任务的 Rust 代码示例,快速查找解决方案。',
      },
    ],
  },
  {
    category: '包管理与文档',
    color: 'orange',
    items: [
      {
        name: 'Crates.io',
        url: 'https://crates.io/',
        tag: 'Registry',
        desc: 'Rust 的包注册中心,类似于 npm 或 PyPI。',
      },
      {
        name: 'Docs.rs',
        url: 'https://docs.rs/',
        tag: 'Docs',
        desc: '为 Crates.io 上的所有包自动生成的 API 文档中心。',
      },
      {
        name: 'Cargo',
        url: 'https://doc.rust-lang.org/cargo/',
        tag: 'Tool',
        desc: 'Rust 的构建系统和包管理器,处理依赖、编译和发布。',
      },
      {
        name: 'lib.rs',
        url: 'https://lib.rs/',
        tag: 'Search',
        desc: '更现代化的 crate 搜索和发现平台,界面友好。',
      },
    ],
  },
  {
    category: 'Web 框架与异步编程',
    color: 'blue',
    items: [
      {
        name: 'Axum',
        url: 'https://github.com/tokio-rs/axum',
        tag: 'Framework',
        desc: '基于 Tokio 栈构建的模块化 Web 框架,深受开发者喜爱。',
      },
      {
        name: 'Actix-web',
        url: 'https://actix.rs/',
        tag: 'Framework',
        desc: '高性能、类型安全的 Rust Web 框架,多次在性能榜单登顶。',
      },
      {
        name: 'Rocket',
        url: 'https://rocket.rs/',
        tag: 'Framework',
        desc: '注重易用性和类型安全的 Web 框架,API 设计优雅。',
      },
      {
        name: 'Tokio',
        url: 'https://tokio.rs/',
        tag: 'Runtime',
        desc: 'Rust 异步编程的事实标准运行时,提供事件驱动的非阻塞 I/O。',
      },
      {
        name: 'async-std',
        url: 'https://async.rs/',
        tag: 'Runtime',
        desc: '异步版本的 Rust 标准库,提供更自然的异步编程体验。',
      },
      {
        name: 'Warp',
        url: 'https://github.com/seanmonstar/warp',
        tag: 'Framework',
        desc: '基于 supercombining 组合器的 Web 框架,灵活且高效。',
      },
    ],
  },
  {
    category: '数据库与 ORM',
    color: 'green',
    items: [
      {
        name: 'SQLx',
        url: 'https://github.com/launchbadge/sqlx',
        tag: 'Database',
        desc: '纯 Rust 编写的异步、编译时类型检查的 SQL 查询库。',
      },
      {
        name: 'Diesel',
        url: 'https://diesel.rs/',
        tag: 'ORM',
        desc: 'Rust 的安全、可扩展 ORM 和查询构建器,支持 PostgreSQL、MySQL、SQLite。',
      },
      {
        name: 'SeaORM',
        url: 'https://www.sea-ql.org/SeaORM/',
        tag: 'ORM',
        desc: '动态异步 ORM,支持主动记录模式,易于学习和使用。',
      },
      {
        name: 'Redis-rs',
        url: 'https://github.com/redis-rs/redis-rs',
        tag: 'Cache',
        desc: 'Rust 的 Redis 客户端库,支持同步和异步操作。',
      },
    ],
  },
  {
    category: '前端与全栈框架',
    color: 'cyan',
    items: [
      {
        name: 'Leptos',
        url: 'https://leptos.dev',
        tag: 'Full-stack',
        desc: '全栈、高性能的 Rust Web 框架,具有细粒度的响应式系统。',
      },
      {
        name: 'Yew',
        url: 'https://yew.rs/',
        tag: 'Frontend',
        desc: '受 React 启发的 Rust 前端框架,编译为 WebAssembly。',
      },
      {
        name: 'Dioxus',
        url: 'https://dioxuslabs.com/',
        tag: 'Cross-platform',
        desc: '跨平台的 Rust UI 框架,支持 Web、桌面、移动端。',
      },
      {
        name: 'Sycamore',
        url: 'https://sycamore-rs.netlify.app/',
        tag: 'Frontend',
        desc: '轻量级、高性能的 Rust 前端框架,专注于简洁性。',
      },
    ],
  },
  {
    category: '桌面与移动应用',
    color: 'purple',
    items: [
      {
        name: 'Tauri',
        url: 'https://tauri.app/',
        tag: 'Desktop',
        desc: '使用 Web 前端构建极小、极快、跨平台的桌面应用框架。',
      },
      {
        name: 'Iced',
        url: 'https://iced.rs/',
        tag: 'GUI',
        desc: '受 Elm 启发的跨平台 GUI 库,类型安全且易于使用。',
      },
      {
        name: 'Slint',
        url: 'https://slint-ui.com/',
        tag: 'GUI',
        desc: '声明式 UI 工具包,适合嵌入式和桌面应用。',
      },
    ],
  },
  {
    category: 'CLI 与系统工具',
    color: 'magenta',
    items: [
      {
        name: 'Clap',
        url: 'https://clap.rs/',
        tag: 'CLI',
        desc: '功能强大的命令行参数解析器,Rust CLI 开发的标准选择。',
      },
      {
        name: 'Ripgrep',
        url: 'https://github.com/BurntSushi/ripgrep',
        tag: 'Tool',
        desc: '极速的正则表达式搜索工具,grep 的现代替代品。',
      },
      {
        name: 'Bat',
        url: 'https://github.com/sharkdp/bat',
        tag: 'Tool',
        desc: 'cat 命令的现代替代品,支持语法高亮和 Git 集成。',
      },
      {
        name: 'Eza',
        url: 'https://eza.rocks/',
        tag: 'Tool',
        desc: 'ls 命令的现代替代品,彩色输出且功能丰富。',
      },
    ],
  },
  {
    category: '优秀开源项目',
    color: 'teal',
    items: [
      {
        name: 'Meilisearch',
        url: 'https://github.com/meilisearch/meilisearch',
        tag: 'Search',
        desc: 'Rust 编写的高性能开源搜索引擎,研究 Rust 大规模工程的最佳案例。',
      },
      {
        name: 'Lemmy',
        url: 'https://github.com/LemmyNet/lemmy',
        tag: 'Social',
        desc: 'Rust 编写的去中心化社交平台,研究 Actix-web 实战的必看项目。',
      },
      {
        name: 'Zed Editor',
        url: 'https://zed.dev/',
        tag: 'Editor',
        desc: '高性能的代码编辑器,由 Atom 创始人打造,使用 Rust 和 GPU 加速。',
      },
      {
        name: 'Polars',
        url: 'https://pola.rs/',
        tag: 'Data',
        desc: '超快的 DataFrame 库,用于数据处理和分析,性能超越 Pandas。',
      },
      {
        name: 'Alacritty',
        url: 'https://alacritty.org/',
        tag: 'Terminal',
        desc: 'GPU 加速的终端模拟器,追求极致性能和简洁性。',
      },
    ],
  },
  {
    category: '社区与资源',
    color: 'gold',
    items: [
      {
        name: 'This Week in Rust',
        url: 'https://this-week-in-rust.org/',
        tag: 'Newsletter',
        desc: '每周 Rust 生态新闻汇总,了解最新发展和趋势。',
      },
      {
        name: 'Rust Users Forum',
        url: 'https://users.rust-lang.org/',
        tag: 'Community',
        desc: 'Rust 官方用户论坛,提问和交流的最佳场所。',
      },
      {
        name: 'Are we web yet?',
        url: 'https://www.arewewebyet.org/',
        tag: 'Resource',
        desc: '跟踪 Rust Web 开发生态成熟度的网站。',
      },
      {
        name: 'Rust Design Patterns',
        url: 'https://rust-unofficial.github.io/patterns/',
        tag: 'Patterns',
        desc: 'Rust 设计模式和最佳实践指南。',
      },
    ],
  },
]
