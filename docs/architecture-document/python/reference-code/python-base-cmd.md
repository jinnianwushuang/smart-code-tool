---
title: PYTHON 基础命令
order: 124
---

# PYTHON 基础命令

## 一、 Pip 常用命令

- pip 是 Python 的官方包管理工具，用于安装、升级和卸载第三方库。 [1, 2]

## 基础管理

- 查看版本: pip --version 或 pip -V。
- 升级 pip: python -m pip install --upgrade pip。
- 获取帮助: pip help command。 [3, 4, 5, 6]

## 2. 安装与卸载

- 常规安装: pip install &lt;package_name&gt;。
- 指定版本: pip install &lt;package_name&gt;==&lt;version&gt; (例如 pip install requests==2.25.1)。
- 升级包: pip install --upgrade &lt;package_name&gt;。
- 卸载包: pip uninstall &lt;package_name&gt;。 [2, 3, 7]

## 3. 依赖管理

- 生成依赖清单: pip freeze &gt; requirements.txt。该文件记录了当前环境及其版本，常用于项目迁移。
- 批量安装依赖: pip install -r requirements.txt。 [8]

## 4. 查询与环境

- 查看已安装包: pip list。
- 显示包详情: pip show &lt;package_name&gt; (包括安装路径和依赖关系)。
- 检查兼容性: pip check。 [2, 7]

---

## 二、 Python 项目打包与分发

将 Python 代码打包成可分发的格式，通常分为两种需求：发布库到 PyPI 或 打包成独立执行文件。

## 1. 打包为库 (发布至 PyPI)

适用于希望他人通过 pip install 安装你的代码的场景。 [9]

      1. 项目结构: 确保项目包含核心代码文件夹（含 __init__.py）及必要配置文件。

```text
my_project/
├── my_package/ # 源代码目录
│ └── **init**.py
├── pyproject.toml # 现代打包标准配置文件（替代 setup.py）
├── README.md # 项目说明
└── LICENSE # 许可证
```

      2. 构建分发包:

- 安装构建工具: pip install build。
  - 运行构建: python -m build。这会生成 dist/ 目录，内含 .tar.gz (源码包) 和 .whl (二进制包)。
  3. 上传至 PyPI:

- 安装上传工具: pip install twine。
  - 上传: twine upload dist/\* (需要提前在 PyPI 注册账号)。 [9, 10]

## 2. 打包为可执行文件 (.exe)

适用于分发给没有 Python 环境的用户使用。 [11]

- 常用工具: PyInstaller。
- 打包命令:
- 安装: pip install pyinstaller。
  - 打包为单文件: pyinstaller --onefile your_script.py。
  - 无控制台打包 (GUI): pyinstaller --noconsole your_script.py。

---

## 三、 实用技巧：配置国内镜像源

由于官方源在国外，下载速度可能较慢，建议配置国内镜像源（如阿里云、清华等）： [8]

- 临时使用: pip install &lt;package&gt; -i https://tsinghua.edu.cn。
- 永久配置:

pip config set global.index-url https://tsinghua.edu.cn
