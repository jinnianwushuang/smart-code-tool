export const tab_name = 'Node.js'
export const order = 65
export const docs = [
  {
    category: '运行时与版本管理',
    color: 'green',
    items: [
      {
        name: 'Node.js 官网',
        url: 'https://nodejs.org/',
        tag: 'Runtime',
        desc: 'JavaScript 运行时环境,基于 Chrome V8 引擎,支持构建高性能网络应用。',
      },
      {
        name: 'nvm (Node Version Manager)',
        url: 'https://github.com/nvm-sh/nvm',
        tag: 'Version Manager',
        desc: 'Node.js 版本管理工具,轻松切换不同版本的 Node.js。',
      },
      {
        name: 'n (Node version management)',
        url: 'https://github.com/tj/n',
        tag: 'Version Manager',
        desc: '简单的 Node.js 版本管理工具,比 nvm 更轻量。',
      },
      {
        name: 'Deno',
        url: 'https://deno.com/',
        tag: 'Runtime',
        desc: '下一代 JavaScript 运行时,原生支持 TypeScript,注重安全性。',
      },
      {
        name: 'Bun',
        url: 'https://bun.sh/',
        tag: 'Runtime',
        desc: '极速的 JavaScript 运行时,集打包器、测试运行器和包管理器于一体。',
      },
    ],
  },
  {
    category: 'Web 框架',
    color: 'blue',
    items: [
      {
        name: 'Express',
        url: 'https://expressjs.com/',
        tag: 'Minimal',
        desc: '快速、开放、极简的 Node.js Web 框架,生态丰富且成熟。',
      },
      {
        name: 'NestJS',
        url: 'https://docs.nestjs.com/',
        tag: 'Enterprise',
        desc: '基于 TypeScript 的渐进式 Node.js 框架,内置依赖注入与模块化架构。',
      },
      {
        name: 'Fastify',
        url: 'https://fastify.dev/',
        tag: 'Performance',
        desc: '高性能低开销的 Web 框架,专注于提供最佳开发体验。',
      },
      {
        name: 'Koa',
        url: 'https://koajs.com/',
        tag: 'Modern',
        desc: '由 Express 原班人马打造,更现代、更轻量的 Web 框架。',
      },
      {
        name: 'Hono',
        url: 'https://hono.dev/',
        tag: 'Edge',
        desc: '超轻量、超快速的 Web 框架,可在任何 JavaScript 运行时上运行。',
      },
      {
        name: 'Elysia',
        url: 'https://elysiajs.com/',
        tag: 'Bun',
        desc: '为 Bun 优化的 ergonomic Web 框架,类型安全且性能卓越。',
      },
    ],
  },
  {
    category: 'API 开发与 GraphQL',
    color: 'cyan',
    items: [
      {
        name: 'Apollo Server',
        url: 'https://www.apollographql.com/docs/apollo-server/',
        tag: 'GraphQL',
        desc: '生产级 GraphQL 服务器,支持多种 Node.js 框架集成。',
      },
      {
        name: 'tRPC',
        url: 'https://trpc.io/',
        tag: 'Type-Safe',
        desc: '端到端类型安全的 API,无需代码生成即可在前后端共享类型。',
      },
      {
        name: 'Zod',
        url: 'https://zod.dev/',
        tag: 'Validation',
        desc: 'TypeScript 优先的模式声明和验证库,用于 API 请求验证。',
      },
      {
        name: 'OpenAPI Generator',
        url: 'https://openapi-generator.tech/',
        tag: 'Codegen',
        desc: '根据 OpenAPI 规范自动生成客户端 SDK 和服务端代码。',
      },
    ],
  },
  {
    category: '数据库与 ORM',
    color: 'purple',
    items: [
      {
        name: 'Prisma',
        url: 'https://www.prisma.io/',
        tag: 'ORM',
        desc: '下一代 Node.js 和 TypeScript ORM,支持直观的数据建模和类型安全。',
      },
      {
        name: 'TypeORM',
        url: 'https://typeorm.io/',
        tag: 'ORM',
        desc: '支持 Active Record 和 Data Mapper 模式的 TypeScript ORM。',
      },
      {
        name: 'Sequelize',
        url: 'https://sequelize.org/',
        tag: 'ORM',
        desc: '基于 Promise 的 Node.js ORM,支持 PostgreSQL、MySQL、SQLite 等。',
      },
      {
        name: 'Mongoose',
        url: 'https://mongoosejs.com/',
        tag: 'ODM',
        desc: 'MongoDB 的对象文档映射库,提供 schema 验证和业务逻辑封装。',
      },
      {
        name: 'Drizzle ORM',
        url: 'https://orm.drizzle.team/',
        tag: 'SQL',
        desc: 'TypeScript ORM,专注于类型安全和开发者体验,支持多种数据库。',
      },
      {
        name: 'Knex.js',
        url: 'https://knexjs.org/',
        tag: 'Query Builder',
        desc: '灵活的 SQL 查询构建器,支持 PostgreSQL、MySQL、SQLite 等。',
      },
    ],
  },
  {
    category: '认证与授权',
    color: 'orange',
    items: [
      {
        name: 'Passport.js',
        url: 'https://www.passportjs.org/',
        tag: 'Middleware',
        desc: 'Node.js 的身份验证中间件,支持 500+ 种认证策略。',
      },
      {
        name: 'jsonwebtoken',
        url: 'https://github.com/auth0/node-jsonwebtoken',
        tag: 'JWT',
        desc: 'JSON Web Token 实现,用于身份验证和信息交换。',
      },
      {
        name: 'bcrypt',
        url: 'https://github.com/kelektiv/node.bcrypt.js',
        tag: 'Hashing',
        desc: '密码哈希库,基于 bcrypt 算法,安全可靠。',
      },
      {
        name: 'CASL',
        url: 'https://casl.js.org/',
        tag: 'Authorization',
        desc: '同构权限控制库,定义和管理用户访问权限。',
      },
    ],
  },
  {
    category: '实时通信',
    color: 'magenta',
    items: [
      {
        name: 'Socket.IO',
        url: 'https://socket.io/',
        tag: 'WebSocket',
        desc: '支持低延迟、双向和基于事件的通信库,实现即时通讯的标准方案。',
      },
      {
        name: 'ws',
        url: 'https://github.com/websockets/ws',
        tag: 'WebSocket',
        desc: '简单易用的 Node.js WebSocket 库,轻量且高性能。',
      },
      {
        name: 'uWebSockets.js',
        url: 'https://github.com/uNetworking/uWebSockets.js',
        tag: 'Performance',
        desc: '极其高效的 WebSocket 库,适合高并发场景。',
      },
    ],
  },
  {
    category: '任务队列与调度',
    color: 'red',
    items: [
      {
        name: 'Bull',
        url: 'https://github.com/OptimalBits/bull',
        tag: 'Queue',
        desc: '基于 Redis 的 Node.js 任务队列,支持延迟任务、重复任务和优先级。',
      },
      {
        name: 'BullMQ',
        url: 'https://bullmq.io/',
        tag: 'Queue',
        desc: 'Bull 的升级版,性能更好,功能更强大。',
      },
      {
        name: 'Agenda',
        url: 'https://github.com/agenda/agenda',
        tag: 'Scheduler',
        desc: '轻量级作业调度库,基于 MongoDB,支持分布式调度。',
      },
      {
        name: 'node-cron',
        url: 'https://github.com/node-cron/node-cron',
        tag: 'Cron',
        desc: 'Node.js 的 cron 任务调度器,类似 Linux crontab。',
      },
    ],
  },
  {
    category: '日志与监控',
    color: 'teal',
    items: [
      {
        name: 'Winston',
        url: 'https://github.com/winstonjs/winston',
        tag: 'Logging',
        desc: '多功能日志库,支持多种传输方式和日志级别。',
      },
      {
        name: 'Pino',
        url: 'https://getpino.io/',
        tag: 'Logging',
        desc: '极速的 JSON 日志记录器,性能优于 Winston。',
      },
      {
        name: 'PM2',
        url: 'https://pm2.keymetrics.io/',
        tag: 'Process Manager',
        desc: 'Node.js 应用的进程管理器,支持负载均衡、监控和自动重启。',
      },
      {
        name: 'Clinic.js',
        url: 'https://clinicjs.org/',
        tag: 'Profiling',
        desc: 'Node.js 性能诊断工具集,包括火焰图、内存泄漏检测等。',
      },
    ],
  },
  {
    category: '测试与质量保证',
    color: 'indigo',
    items: [
      {
        name: 'Jest',
        url: 'https://jestjs.io/',
        tag: 'Testing',
        desc: 'Facebook 出品的 JavaScript 测试框架,零配置即可使用。',
      },
      {
        name: 'Vitest',
        url: 'https://vitest.dev/',
        tag: 'Testing',
        desc: '由 Vite 驱动的极速单元测试框架,兼容 Jest API。',
      },
      {
        name: 'Supertest',
        url: 'https://github.com/ladjs/supertest',
        tag: 'API Testing',
        desc: 'HTTP 断言库,专门用于测试 Node.js HTTP 服务器。',
      },
      {
        name: 'Artillery',
        url: 'https://www.artillery.io/',
        tag: 'Load Testing',
        desc: '现代化的负载测试工具,测试 API 和服务的性能。',
      },
    ],
  },
  {
    category: '微服务与架构',
    color: 'volcano',
    items: [
      {
        name: 'Seneca',
        url: 'https://senecajs.org/',
        tag: 'Microservices',
        desc: 'Node.js 微服务工具包,简化微服务开发和通信。',
      },
      {
        name: 'Moleculer',
        url: 'https://moleculer.services/',
        tag: 'Microservices',
        desc: '快速、可扩展的微服务框架,内置服务发现、负载均衡等。',
      },
      {
        name: 'gRPC',
        url: 'https://grpc.io/docs/languages/node/',
        tag: 'RPC',
        desc: '高性能 RPC 框架,支持多种语言,适合微服务间通信。',
      },
      {
        name: 'RabbitMQ',
        url: 'https://www.rabbitmq.com/',
        tag: 'Message Broker',
        desc: '开源消息代理,实现应用程序间的异步通信和解耦。',
      },
    ],
  },
  {
    category: '部署与容器化',
    color: 'geekblue',
    items: [
      {
        name: 'Docker',
        url: 'https://www.docker.com/',
        tag: 'Container',
        desc: '容器化平台,实现应用的环境一致性和便捷部署。',
      },
      {
        name: 'Docker Compose',
        url: 'https://docs.docker.com/compose/',
        tag: 'Orchestration',
        desc: '定义和运行多容器 Docker 应用的工具。',
      },
      {
        name: 'Heroku',
        url: 'https://www.heroku.com/',
        tag: 'PaaS',
        desc: '云平台即服务,简化 Node.js 应用的部署和管理。',
      },
      {
        name: 'Railway',
        url: 'https://railway.app/',
        tag: 'PaaS',
        desc: '现代化的云平台,一键部署 Node.js 应用,开发者友好。',
      },
      {
        name: 'Render',
        url: 'https://render.com/',
        tag: 'Cloud',
        desc: '统一的云平台,部署 Web 服务、后台 worker 和数据库。',
      },
    ],
  },
  {
    category: '实用工具库',
    color: 'gold',
    items: [
      {
        name: 'Axios',
        url: 'https://axios-http.com/',
        tag: 'HTTP Client',
        desc: '基于 Promise 的 HTTP 客户端,适用于浏览器和 Node.js。',
      },
      {
        name: 'dotenv',
        url: 'https://github.com/motdotnode/dotenv',
        tag: 'Config',
        desc: '从 .env 文件加载环境变量到 process.env。',
      },
      {
        name: 'commander',
        url: 'https://github.com/tj/commander.js/',
        tag: 'CLI',
        desc: 'Node.js 命令行界面的完整解决方案。',
      },
      {
        name: 'chalk',
        url: 'https://github.com/chalk/chalk',
        tag: 'Terminal',
        desc: '终端字符串样式库,让 CLI 输出更加美观。',
      },
      {
        name: 'inquirer',
        url: 'https://github.com/SBoudrias/Inquirer.js/',
        tag: 'CLI',
        desc: '常见的交互式命令行用户集合,用于创建友好的 CLI 交互。',
      },
      {
        name: 'sharp',
        url: 'https://sharp.pixelplumbing.com/',
        tag: 'Image',
        desc: '高性能 Node.js 图像处理库,支持调整大小、裁剪等操作。',
      },
    ],
  },
]
