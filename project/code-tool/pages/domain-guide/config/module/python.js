export const tab_name = 'Python'
export const order = 100
export const docs = [
  {
    category: 'Python 核心与学习',
    color: 'blue',
    items: [
      {
        name: 'Python 官网',
        url: 'https://www.python.org/',
        tag: 'Official',
        desc: 'Python 编程语言官方主页,提供下载、安装、社区支持等。',
      },
      {
        name: 'Python 官方文档',
        url: 'https://docs.python.org/zh-cn/3/',
        tag: 'Docs',
        desc: 'Python 3 官方中文参考手册,包含基础指南、库参考和语言参考。',
      },
      {
        name: 'Real Python',
        url: 'https://realpython.com',
        tag: 'Tutorial',
        desc: '高质量的 Python 教程网站,涵盖从入门到进阶的各类主题。',
      },
      {
        name: 'Python Tutorial',
        url: 'https://docs.python.org/3/tutorial/',
        tag: 'Guide',
        desc: 'Python 官方教程,适合初学者的系统性学习路径。',
      },
      {
        name: 'PEP Index',
        url: 'https://peps.python.org/',
        tag: 'Standard',
        desc: 'Python 增强提案索引,了解语言演进和设计决策。',
      },
    ],
  },
  {
    category: 'Web 框架',
    color: 'green',
    items: [
      {
        name: 'FastAPI',
        url: 'https://fastapi.tiangolo.com/',
        tag: 'Modern',
        desc: '高性能 Python Web 框架,基于类型提示,自动生成 OpenAPI 文档。',
      },
      {
        name: 'Django',
        url: 'https://www.djangoproject.com/',
        tag: 'Full-Stack',
        desc: '成熟的高级 Web 框架,推崇快速开发和整洁的设计,内置 Admin 后台。',
      },
      {
        name: 'Flask',
        url: 'https://flask.palletsprojects.com/',
        tag: 'Micro',
        desc: '轻量级 Web 框架,灵活度高,适合微服务和中小型应用。',
      },
      {
        name: 'Tornado',
        url: 'https://www.tornadoweb.org/',
        tag: 'Async',
        desc: '异步网络库和 Web 框架,适合高并发长连接场景。',
      },
      {
        name: 'Sanic',
        url: 'https://sanic.dev/',
        tag: 'Async',
        desc: '异步 Python 3.7+ Web 服务器,速度极快。',
      },
    ],
  },
  {
    category: '包管理与工具',
    color: 'cyan',
    items: [
      {
        name: 'PyPI',
        url: 'https://pypi.org/',
        tag: 'Registry',
        desc: 'Python 第三方库仓库,可以使用 pip 安装的包均托管于此。',
      },
      {
        name: 'pip',
        url: 'https://pip.pypa.io/',
        tag: 'Tool',
        desc: 'Python 的包安装器,管理依赖的标准工具。',
      },
      {
        name: 'Poetry',
        url: 'https://python-poetry.org/',
        tag: 'Dependency',
        desc: '现代化的 Python 依赖管理和打包工具。',
      },
      {
        name: 'conda',
        url: 'https://docs.conda.io/',
        tag: 'Environment',
        desc: '跨平台的包管理和环境管理工具,特别适合数据科学。',
      },
    ],
  },
  {
    category: 'AI 与数据科学',
    color: 'orange',
    items: [
      {
        name: 'PyTorch',
        url: 'https://pytorch.org/',
        tag: 'Deep Learning',
        desc: '目前最流行的深度学习框架,由 Meta 维护,科研与生产首选。',
      },
      {
        name: 'TensorFlow',
        url: 'https://www.tensorflow.org/',
        tag: 'ML Platform',
        desc: 'Google 开源的端到端机器学习平台,支持大规模分布式训练。',
      },
      {
        name: 'NumPy / Pandas',
        url: 'https://numpy.org/',
        tag: 'Data Science',
        desc: 'Python 科学计算与数据分析的基础工具库。',
      },
      {
        name: 'Scikit-learn',
        url: 'https://scikit-learn.org/',
        tag: 'Machine Learning',
        desc: '简单易用的机器学习库,提供分类、回归、聚类等常用算法。',
      },
      {
        name: 'Hugging Face Transformers',
        url: 'https://huggingface.co/docs/transformers',
        tag: 'NLP',
        desc: '强大的 NLP 库,提供数千个预训练模型用于文本、图像和音频处理。',
      },
      {
        name: 'Jupyter',
        url: 'https://jupyter.org/',
        tag: 'Notebook',
        desc: '交互式计算环境,数据科学和机器学习的事实标准。',
      },
    ],
  },
  {
    category: '测试与质量',
    color: 'magenta',
    items: [
      {
        name: 'pytest',
        url: 'https://docs.pytest.org/',
        tag: 'Testing',
        desc: 'Python 最流行的测试框架,简洁强大且插件丰富。',
      },
      {
        name: 'unittest',
        url: 'https://docs.python.org/3/library/unittest.html',
        tag: 'Testing',
        desc: 'Python 内置的单元测试框架,xUnit 风格。',
      },
      {
        name: 'black',
        url: 'https://black.readthedocs.io/',
        tag: 'Formatter',
        desc: '不妥协的代码格式化工具,自动格式化 Python 代码。',
      },
      {
        name: 'flake8',
        url: 'https://flake8.pycqa.org/',
        tag: 'Linter',
        desc: '代码风格检查工具,确保代码符合 PEP 8 规范。',
      },
      {
        name: 'mypy',
        url: 'https://mypy.readthedocs.io/',
        tag: 'Type Check',
        desc: '静态类型检查器,为 Python 添加类型安全。',
      },
    ],
  },
  {
    category: '自动化与脚本',
    color: 'teal',
    items: [
      {
        name: 'Ansible',
        url: 'https://www.ansible.com/',
        tag: 'DevOps',
        desc: '自动化配置管理、应用部署和任务执行工具。',
      },
      {
        name: 'Celery',
        url: 'https://docs.celeryq.dev/',
        tag: 'Task Queue',
        desc: '分布式任务队列,处理异步任务和定时任务。',
      },
      {
        name: 'Airflow',
        url: 'https://airflow.apache.org/',
        tag: 'Workflow',
        desc: ' programmatically author, schedule and monitor workflows.',
      },
    ],
  },
  {
    category: '数据库与 ORM',
    color: 'cyan',
    items: [
      {
        name: 'SQLAlchemy',
        url: 'https://www.sqlalchemy.org/',
        tag: 'ORM',
        desc: 'Python 最强大的 SQL 工具包和 ORM 框架。',
      },
      {
        name: 'Peewee',
        url: 'http://docs.peewee-orm.com/',
        tag: 'Lightweight ORM',
        desc: '轻量级 ORM,简单易用,适合小型项目。',
      },
      {
        name: 'Tortoise ORM',
        url: 'https://tortoise.github.io/',
        tag: 'Async ORM',
        desc: '异步 ORM 框架,专为 asyncio 设计。',
      },
      {
        name: 'MongoEngine',
        url: 'http://mongoengine.org/',
        tag: 'NoSQL',
        desc: 'MongoDB 的 ODM (对象文档映射器)。',
      },
    ],
  },
  {
    category: '网络爬虫与自动化',
    color: 'orange',
    items: [
      {
        name: 'Scrapy',
        url: 'https://scrapy.org/',
        tag: 'Crawler',
        desc: '强大的 Python 爬虫框架,支持分布式爬取和数据提取。',
      },
      {
        name: 'Beautiful Soup',
        url: 'https://www.crummy.com/software/BeautifulSoup/',
        tag: 'Parser',
        desc: 'HTML/XML 解析库,快速提取网页数据。',
      },
      {
        name: 'Selenium',
        url: 'https://www.selenium.dev/',
        tag: 'Browser Automation',
        desc: '浏览器自动化工具,支持动态页面爬取和 Web 测试。',
      },
      {
        name: 'Playwright',
        url: 'https://playwright.dev/python/',
        tag: 'Modern Automation',
        desc: '微软出品的现代浏览器自动化库,支持多浏览器。',
      },
    ],
  },
  {
    category: '顶级开源项目',
    color: 'purple',
    items: [
      {
        name: 'Transformers',
        url: 'https://github.com/huggingface/transformers',
        tag: 'AI/ML',
        desc: '大模型时代的标准库,研究现代 Python 工程化、模型加载与 AI 能力集成的必看项目。',
      },
      {
        name: 'LocalStack',
        url: 'https://github.com/localstack/localstack',
        tag: 'Cloud Native',
        desc: '极其强大的云堆栈模拟工具,展示了如何用 Python 构建高度复杂的系统级基础设施模拟环境。',
      },
      {
        name: 'FastAPI RealWorld',
        url: 'https://github.com/nsidnev/fastapi-realworld-example-app',
        tag: 'Backend',
        desc: 'FastAPI 的工业级实战示例,涵盖了干净的项目结构、异步 ORM 和鉴权模式的最佳实践。',
      },
      {
        name: 'Awesome Python',
        url: 'https://github.com/vinta/awesome-python',
        tag: 'Resources',
        desc: '极其权威的 Python 框架、库、软件和资源精选列表。',
      },
    ],
  },
]
