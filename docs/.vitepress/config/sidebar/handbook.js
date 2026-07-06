// 开发手册侧边栏配置
export const handbookSidebar = {
  // text: '📚 开发手册',
  collapsed: false,
  items: [
    {
      text: 'AI 开发',
      items: [
        { text: 'LangChain 手册', link: '/handbook/ai/langchain-handbook' },
        { text: 'Ollama 手册', link: '/handbook/ai/ollama-handbook' },
      ],
    },
    {
      text: '前端开发',
      items: [
        { text: 'Vue 3 手册', link: '/handbook/frontend/vue3-handbook' },
        { text: 'Vue 3 核心原理', link: '/handbook/frontend/vue3-core-principles' },
        { text: 'React 19 手册', link: '/handbook/frontend/react19-handbook' },
        { text: 'React 19 核心原理', link: '/handbook/frontend/react19-core-principles' },
        { text: 'Next.js 手册', link: '/handbook/frontend/nextjs-handbook' },
        { text: 'TypeScript 手册', link: '/handbook/frontend/typescript-handbook' },
        { text: 'JavaScript 手册', link: '/handbook/frontend/javascript-handbook' },
        { text: 'CSS 手册', link: '/handbook/frontend/css-handbook' },
        { text: 'Tailwind CSS 手册', link: '/handbook/frontend/tailwind-css-handbook' },
      ],
    },
    {
      text: '后端开发',
      items: [
        { text: 'NestJS 手册', link: '/handbook/backend/nestjs-handbook' },
        { text: 'FastAPI 手册', link: '/handbook/backend/fastapi-handbook' },
        { text: 'Django 手册', link: '/handbook/backend/django-handbook' },
      ],
    },
    {
      text: '数据库',
      items: [
        { text: 'MySQL 手册', link: '/handbook/database/mysql-handbook' },
        { text: 'PostgreSQL 速查', link: '/handbook/database/postgresql-handbook' },
        { text: 'MongoDB 手册', link: '/handbook/database/mongodb-handbook' },
        { text: 'Prisma 手册', link: '/handbook/database/prisma-handbook' },
      ],
    },
    {
      text: '移动开发',
      items: [
        { text: 'Flutter 手册', link: '/handbook/mobile/flutter-handbook' },
        { text: 'Dart 手册', link: '/handbook/mobile/dart-handbook' },
      ],
    },
    {
      text: '系统运维',
      items: [
        { text: 'Docker 手册', link: '/handbook/tools/docker-handbook' },
        { text: 'Linux 命令速查', link: '/handbook/devops/linux-handbook' },
        { text: 'Git 速查', link: '/handbook/devops/git-handbook' },
        { text: 'Shell 手册', link: '/handbook/devops/shell-handbook' },
        { text: 'Nginx 速查', link: '/handbook/devops/nginx-handbook' },
        { text: 'Jenkins 手册', link: '/handbook/devops/jenkins-handbook' },
        { text: 'Google zx 手册', link: '/handbook/devops/google-zx-handbook' },
      ],
    },
    {
      text: '开发工具',
      items: [
        { text: 'Python 手册', link: '/handbook/tools/python-handbook' },
        { text: 'VBA 手册', link: '/handbook/tools/vba-handbook' },
        { text: 'Excel 公式手册', link: '/handbook/tools/excel-formulas-handbook' },
        { text: 'Vim 手册', link: '/handbook/tools/vim-handbook' },
      ],
    },
  ],
}
