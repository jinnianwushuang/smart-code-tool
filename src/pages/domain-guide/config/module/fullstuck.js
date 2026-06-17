export const tab_name = '全栈'
export const order = 60
export const docs = [
  {
    category: '后端框架',
    color: 'blue',
    items: [
      {
        name: 'NestJS',
        url: 'https://docs.nestjs.com',
        tag: 'Node.js',
        desc: '基于 TypeScript 的渐进式 Node.js 框架,深受 Angular 启发,内置依赖注入与模块化架构。',
      },
      {
        name: 'Express',
        url: 'https://expressjs.com',
        tag: 'Node.js',
        desc: '快速、开放、极简的 Node.js Web 框架,生态丰富且成熟。',
      },
      {
        name: 'FastAPI',
        url: 'https://fastapi.tiangolo.com/',
        tag: 'Python',
        desc: '高性能 Python Web 框架,基于类型提示,自动生成 OpenAPI 文档。',
      },
      {
        name: 'Spring Boot',
        url: 'https://spring.io/projects/spring-boot',
        tag: 'Java',
        desc: 'Java 企业级应用开发的事实标准,约定优于配置。',
      },
      {
        name: 'Gin',
        url: 'https://gin-gonic.com/',
        tag: 'Go',
        desc: 'Go 语言的高性能 Web 框架,简洁优雅且性能卓越。',
      },
    ],
  },
  {
    category: '数据库与 ORM',
    color: 'green',
    items: [
      {
        name: 'PostgreSQL',
        url: 'https://www.postgresql.org',
        tag: 'RDBMS',
        desc: '全球最先进的开源关系型数据库,全栈架构中处理复杂关联数据的首选方案。',
      },
      {
        name: 'MySQL',
        url: 'https://www.mysql.com/',
        tag: 'RDBMS',
        desc: '最流行的开源关系型数据库,广泛应用于各类 Web 应用。',
      },
      {
        name: 'MongoDB',
        url: 'https://www.mongodb.com/',
        tag: 'NoSQL',
        desc: '面向文档的 NoSQL 数据库,适合存储非结构化或半结构化数据。',
      },
      {
        name: 'Prisma',
        url: 'https://www.prisma.io',
        tag: 'ORM',
        desc: '下一代 Node.js 和 TypeScript 的 ORM 框架,支持直观的数据建模、类型安全及自动化迁移。',
      },
      {
        name: 'TypeORM',
        url: 'https://typeorm.io',
        tag: 'ORM',
        desc: '支持 Active Record 和 Data Mapper 模式的 TypeScript ORM,可与多种数据库配合使用。',
      },
      {
        name: 'Sequelize',
        url: 'https://sequelize.org',
        tag: 'ORM',
        desc: '基于 Promise 的 Node.js ORM,支持 PostgreSQL、MySQL、SQLite 等数据库。',
      },
      {
        name: 'Mongoose',
        url: 'https://mongoosejs.com',
        tag: 'ODM',
        desc: 'MongoDB 的对象文档映射库,提供 schema 验证和业务逻辑封装。',
      },
    ],
  },
  {
    category: '缓存与消息队列',
    color: 'orange',
    items: [
      {
        name: 'Redis',
        url: 'https://redis.io',
        tag: 'Cache',
        desc: '高性能内存数据存储,用于全栈开发中的 Session 共享、分布式锁及高并发缓存。',
      },
      {
        name: 'RabbitMQ',
        url: 'https://www.rabbitmq.com/',
        tag: 'Message Queue',
        desc: '开源消息代理,实现应用程序间的异步通信和解耦。',
      },
      {
        name: 'Apache Kafka',
        url: 'https://kafka.apache.org/',
        tag: 'Stream',
        desc: '分布式流处理平台,高吞吐量、低延迟的消息系统,适合大数据场景。',
      },
      {
        name: 'Bull',
        url: 'https://github.com/OptimalBits/bull',
        tag: 'Job Queue',
        desc: '基于 Redis 的 Node.js 任务队列,支持延迟任务、重复任务和优先级。',
      },
      {
        name: 'Memcached',
        url: 'https://memcached.org/',
        tag: 'Cache',
        desc: '高性能分布式内存对象缓存系统,减轻数据库负载。',
      },
    ],
  },
  {
    category: '实时通信',
    color: 'cyan',
    items: [
      {
        name: 'Socket.IO',
        url: 'https://socket.io',
        tag: 'WebSocket',
        desc: '支持低延迟、双向和基于事件的通信库,全栈架构中实现即时通讯(IM)的标准方案。',
      },
      {
        name: 'ws',
        url: 'https://github.com/websockets/ws',
        tag: 'WebSocket',
        desc: '简单易用的 Node.js WebSocket 库,轻量且高性能。',
      },
      {
        name: 'Pusher',
        url: 'https://pusher.com/',
        tag: 'Real-time',
        desc: '托管的实时消息服务,简化 WebSocket 集成,支持多平台 SDK。',
      },
      {
        name: 'MQTT',
        url: 'https://mqtt.org/',
        tag: 'IoT',
        desc: '轻量级的发布/订阅消息协议,适合 IoT 设备和低带宽环境。',
      },
    ],
  },
  {
    category: '认证与授权',
    color: 'purple',
    items: [
      {
        name: 'JWT (JSON Web Token)',
        url: 'https://jwt.io/',
        tag: 'Auth',
        desc: '开放标准(RFC 7519),用于在各方之间安全地传输信息作为 JSON 对象。',
      },
      {
        name: 'OAuth 2.0',
        url: 'https://oauth.net/2/',
        tag: 'Auth',
        desc: '授权框架标准,允许第三方应用有限访问用户资源。',
      },
      {
        name: 'Passport.js',
        url: 'https://www.passportjs.org/',
        tag: 'Middleware',
        desc: 'Node.js 的身份验证中间件,支持 500+ 种认证策略。',
      },
      {
        name: 'Auth0',
        url: 'https://auth0.com/',
        tag: 'SaaS',
        desc: '身份验证即服务平台,简化用户登录、注册和权限管理。',
      },
      {
        name: 'Keycloak',
        url: 'https://www.keycloak.org/',
        tag: 'IAM',
        desc: '开源的身份和访问管理解决方案,支持 SSO、社交登录等。',
      },
    ],
  },
  {
    category: 'API 设计与文档',
    color: 'teal',
    items: [
      {
        name: 'OpenAPI Specification',
        url: 'https://swagger.io/specification/',
        tag: 'Standard',
        desc: 'RESTful API 描述标准,支持自动生成文档和客户端代码。',
      },
      {
        name: 'Swagger UI',
        url: 'https://swagger.io/tools/swagger-ui/',
        tag: 'Docs',
        desc: '交互式 API 文档工具,可视化展示和测试 API 端点。',
      },
      {
        name: 'GraphQL',
        url: 'https://graphql.org/',
        tag: 'Query Language',
        desc: 'API 查询语言,提供更精确的数据请求方式,避免过度获取。',
      },
      {
        name: 'tRPC',
        url: 'https://trpc.io',
        tag: 'Type-Safe',
        desc: '端到端的类型安全 API,无需模式定义即可在前后端共享类型。',
      },
      {
        name: 'Postman',
        url: 'https://www.postman.com/',
        tag: 'Testing',
        desc: 'API 开发和测试平台,支持协作、自动化测试和监控。',
      },
    ],
  },
  {
    category: '云服务与 BaaS',
    color: 'magenta',
    items: [
      {
        name: '阿里云帮助中心',
        url: 'https://help.aliyun.com/zh',
        tag: 'Cloud',
        desc: '阿里云官方技术文档中心,涵盖 ECS、OSS、RDS、容器服务等全栈云产品使用指南。',
      },
      {
        name: 'Supabase',
        url: 'https://supabase.com',
        tag: 'BaaS',
        desc: '开源的 Firebase 替代方案,提供即时可用的 Postgres 数据库、身份验证和实时订阅服务。',
      },
      {
        name: 'Firebase',
        url: 'https://firebase.google.com/',
        tag: 'BaaS',
        desc: 'Google 的移动和 Web 应用开发平台,提供数据库、认证、云函数等服务。',
      },
      {
        name: 'AWS Amplify',
        url: 'https://aws.amazon.com/amplify/',
        tag: 'Cloud',
        desc: 'AWS 的全栈开发平台,简化云原生应用构建。',
      },
      {
        name: 'PocketBase',
        url: 'https://pocketbase.io/',
        tag: 'Self-hosted',
        desc: '单个文件构成的 Go 语言实时后端,集成了数据库、鉴权与文件存储。',
      },
    ],
  },
  {
    category: '桌面应用开发',
    color: 'indigo',
    items: [
      {
        name: 'Electron',
        url: 'https://www.electronjs.org',
        tag: 'Cross-platform',
        desc: '基于 Chromium 和 Node.js 的开源桌面应用框架,用于构建跨平台桌面应用。',
      },
      {
        name: 'Tauri',
        url: 'https://v2.tauri.app/',
        tag: 'Lightweight',
        desc: '基于 Rust 的开源桌面应用框架,用于构建跨平台桌面应用,体积更小性能更好。',
      },
      {
        name: 'Flutter Desktop',
        url: 'https://docs.flutter.dev/desktop',
        tag: 'Multi-platform',
        desc: 'Flutter 的桌面端支持,一套代码构建 Windows、macOS 和 Linux 应用。',
      },
    ],
  },
  {
    category: '部署与运维',
    color: 'red',
    items: [
      {
        name: 'Docker',
        url: 'https://www.docker.com/',
        tag: 'Container',
        desc: '容器化平台,实现应用的环境一致性和便捷部署。',
      },
      {
        name: 'Kubernetes',
        url: 'https://kubernetes.io/',
        tag: 'Orchestration',
        desc: '容器编排系统,自动化部署、扩展和管理容器化应用。',
      },
      {
        name: 'Coolify',
        url: 'https://coolify.io/',
        tag: 'PaaS',
        desc: '开源、自托管的 Heroku/Vercel 替代品,架构师管理服务器的利器。',
      },
      {
        name: 'PM2',
        url: 'https://pm2.keymetrics.io/',
        tag: 'Process Manager',
        desc: 'Node.js 应用的进程管理器,支持负载均衡、监控和自动重启。',
      },
      {
        name: 'Nginx',
        url: 'https://nginx.org/',
        tag: 'Web Server',
        desc: '高性能 HTTP 和反向代理服务器,常用于生产环境部署。',
      },
    ],
  },
]
