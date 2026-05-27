export const tab_name = 'Python'
export const order = 80
export const docs = [
  {
    category: 'Python 核心与文档',
    color: 'blue',
    items: [
      {
        name: 'Python 官网',
        url: 'https://www.python.org/',
        tag: 'Core',
        desc: 'Python 编程语言官方主页，提供下载、安装、社区支持等。',
      },
      {
        name: 'Python 官方文档',
        url: 'https://docs.python.org/zh-cn/3/',
        tag: 'Doc',
        desc: 'Python 3 官方中文参考手册，包含基础指南、库参考和语言参考。',
      },
      {
        name: 'PyPI (Python Package Index)',
        url: 'https://pypi.org/',
        tag: 'Registry',
        desc: 'Python 第三方库仓库，可以使用 pip 安装的包均托管于此。',
      },
    ],
  },
  {
    category: 'Python 现代 Web 架构',
    color: 'green',
    items: [
      {
        name: 'FastAPI',
        url: 'https://fastapi.tiangolo.com/',
        tag: 'Framework',
        desc: '高性能 Python Web 框架，基于类型提示，自动生成 OpenAPI 文档。',
      },
      {
        name: 'Django',
        url: 'https://www.djangoproject.com/',
        tag: 'Framework',
        desc: '成熟的高级 Web 框架，推崇快速开发和整洁的设计。',
      },
      {
        name: 'Flask',
        url: 'https://flask.palletsprojects.com/',
        tag: 'Framework',
        desc: '轻量级 Web 框架，灵活度高，适合微服务和中小型应用。',
      },
    ],
  },
  {
    category: 'AI 与 数据科学',
    color: 'orange',
    items: [
      {
        name: 'PyTorch',
        url: 'https://pytorch.org/',
        tag: 'AI',
        desc: '目前最流行的深度学习框架，由 Meta 维护，科研与生产首选。',
      },
      {
        name: 'NumPy / Pandas',
        url: 'https://numpy.org/',
        tag: 'Data',
        desc: 'Python 科学计算与数据分析的基础工具库。',
      },
      {
        name: 'TensorFlow',
        url: 'https://www.tensorflow.org/',
        tag: 'AI',
        desc: 'Google 开源的端到端机器学习平台。',
      },
    ],
  },
  {
    category: '顶级开源项目与实战参考',
    color: 'purple',
    items: [
      {
        name: 'Transformers',
        url: 'https://github.com/huggingface/transformers',
        tag: 'AI/ML',
        desc: '大模型时代的标准库，研究现代 Python 工程化、模型加载与 AI 能力集成的必看项目。',
      },
      {
        name: 'LocalStack',
        url: 'https://github.com/localstack/localstack',
        tag: 'Cloud Native',
        desc: '极其强大的云堆栈模拟工具，展示了如何用 Python 构建高度复杂的系统级基础设施模拟环境。',
      },
      {
        name: 'FastAPI RealWorld',
        url: 'https://github.com/nsidnev/fastapi-realworld-example-app',
        tag: 'Backend',
        desc: 'FastAPI 的工业级实战示例，涵盖了干净的项目结构、异步 ORM 和鉴权模式的最佳实践。',
      },
    ],
  },
]
