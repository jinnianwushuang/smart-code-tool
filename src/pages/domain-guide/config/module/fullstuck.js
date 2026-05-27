export const tab_name = '全栈'
export const order = 60
export const docs = [
  {
    category: '全栈开发与生态',
    color: 'orange',
    items: [
      {
        name: 'NestJS',
        url: 'https://docs.nestjs.com',
        tag: 'Node.js',
        desc: '基于 TypeScript 的渐进式 Node.js 框架，深受 Angular 启发，内置依赖注入与模块化架构。',
        priority: 5,
      },
      {
        name: 'NestJS 官方中文文档',
        url: 'https://docs.nestjs.cn',
        tag: 'Node.js',
        desc: '基于 TypeScript 的渐进式 Node.js 框架，深受 Angular 启发，内置依赖注入与模块化架构。',
        priority: 5,
      },
      {
        name: 'Prisma',
        url: 'https://www.prisma.io',
        tag: 'ORM',
        desc: '下一代 Node.js 和 TypeScript 的 ORM 框架，支持直观的数据建模、类型安全及自动化迁移。',
        priority: 5,
      },
      {
        name: 'Supabase',
        url: 'https://supabase.com',
        tag: 'BaaS',
        desc: '开源的 Firebase 替代方案，提供即时可用的 Postgres 数据库、身份验证和实时订阅服务。',
        priority: 4,
      },
      {
        name: 'Socket.IO',
        url: 'https://socket.io',
        tag: 'Real-time',
        desc: '支持低延迟、双向和基于事件的通信库，全栈架构中实现即时通讯（IM）的标准方案。',
        priority: 4,
      },

      {
        name: 'PostgreSQL',
        url: 'https://www.postgresql.org',
        tag: 'Database',
        desc: '全球最先进的开源关系型数据库，全栈架构中处理复杂关联数据的首选方案。',
        priority: 5,
      },
      {
        name: 'Redis',
        url: 'https://redis.io',
        tag: 'Cache',
        desc: '高性能内存数据存储，用于全栈开发中的 Session 共享、分布式锁及高并发缓存。',
        priority: 4,
      },
    ],
  },
  {
    category: '桌面应用',
    color: 'orange',
    items: [
      {
        name: 'Electron',
        url: 'https://www.electronjs.org',
        tag: '桌面应用',
        desc: '基于 Chromium 和 Node.js 的开源桌面应用框架，用于构建跨平台桌面应用。',
        priority: 5,
      },
      {
        name: 'tauri',
        url: 'https://v2.tauri.app/',
        tag: '桌面应用',
        desc: '基于 Rust 的开源桌面应用框架，用于构建跨平台桌面应用。',
        priority: 5,
      },
      {
        name: 'PocketBase',
        url: 'https://pocketbase.io/',
        tag: 'BaaS',
        desc: '单个文件构成的 Go 语言实时后端，集成了数据库、鉴权与文件存储。',
      },
      {
        name: 'Coolify',
        url: 'https://coolify.io/',
        tag: 'Self-hosted',
        desc: '开源、自托管的 Heroku/Vercel 替代品，架构师管理服务器的利器。',
      },
    ],
  },
]
