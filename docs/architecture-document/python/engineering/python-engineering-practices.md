---
title: Python 项目工程化实践
order: 10
---

# Python 项目工程化实践

对于前端工程师来说，Python 的工程化体验与 Node.js 有显著差异。Node.js 有 npm/pnpm + ESLint + TypeScript 形成成熟的工具链，而 Python 的工具链更加分散但也更灵活。

本文从**前端工程师使用 Python 写脚本和工具**的实际场景出发，梳理 Python 项目的工程化最佳实践。

---

## 一、Python vs Node.js 工程化对照

| 维度           | Node.js                            | Python                                    |
| -------------- | ---------------------------------- | ----------------------------------------- |
| **包管理**     | npm / pnpm / yarn                  | pip / poetry / uv                         |
| **虚拟环境**   | node_modules（项目隔离）           | venv / conda（解释器隔离）                |
| **依赖锁定**   | package-lock.json / pnpm-lock.yaml | requirements.txt / poetry.lock / uv.lock  |
| **代码格式化** | Prettier                           | Ruff formatter / Black                    |
| **代码检查**   | ESLint                             | Ruff linter / Flake8                      |
| **类型检查**   | TypeScript                         | mypy / pyright                            |
| **测试框架**   | Vitest / Jest                      | pytest                                    |
| **任务运行**   | npm scripts / zx                   | Makefile / pyproject.toml scripts / hatch |
| **项目配置**   | package.json                       | pyproject.toml                            |

### 核心差异

Python 没有 `node_modules` 的全局安装概念。每个项目需要创建**虚拟环境**来隔离依赖，这是前端工程师最容易忽略的步骤。

---

## 二、虚拟环境管理

### 为什么需要虚拟环境

```bash
# ❌ 错误：全局安装，项目间依赖互相污染
pip install requests==2.28.0  # 项目 A 需要 2.28
pip install requests==2.31.0  # 项目 B 需要 2.31，覆盖了 A 的版本

# ✅ 正确：每个项目独立虚拟环境
cd project-a && python -m venv .venv && source .venv/bin/activate
pip install requests==2.28.0

cd project-b && python -m venv .venv && source .venv/bin/activate
pip install requests==2.31.0
```

### venv（标准库内置）

```bash
# 创建虚拟环境
python -m venv .venv

# 激活
source .venv/bin/activate       # macOS / Linux
.venv\Scripts\activate          # Windows

# 退出
deactivate

# 删除
rm -rf .venv
```

### uv（现代替代方案，强烈推荐）

[uv](https://github.com/astral-sh/uv) 是由 Ruff 团队开发的超高速 Python 包管理器，用 Rust 编写，比 pip 快 10-100 倍。

```bash
# 安装 uv
brew install uv

# 创建项目（类似 npm init）
uv init my-project
cd my-project

# 添加依赖（类似 pnpm add）
uv add requests
uv add click rich

# 添加开发依赖
uv add --dev pytest ruff mypy

# 运行脚本（自动使用项目虚拟环境）
uv run python main.py

# 锁定依赖（类似 pnpm install --frozen-lockfile）
uv lock
uv sync
```

---

## 三、pyproject.toml：现代 Python 项目配置

`pyproject.toml` 是 Python 项目的统一配置文件，类似于 `package.json`。

```toml
[project]
name = "my-tool"
version = "0.1.0"
description = "一个自动化脚本工具"
requires-python = ">=3.11"
dependencies = [
    "requests>=2.31.0",
    "click>=8.1.0",
    "rich>=13.0.0",
    "pydantic>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "ruff>=0.4.0",
    "mypy>=1.8.0",
]

[project.scripts]
my-tool = "my_tool.cli:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

# ── 工具配置 ──

[tool.ruff]
target-version = "py311"
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP"]

[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true

[tool.pytest.ini_options]
testpaths = ["tests"]
```

---

## 四、代码质量工具

### Ruff：一站式代码工具（推荐）

Ruff 是目前 Python 生态中最受欢迎的代码工具，用 Rust 编写，速度极快。它同时替代了 ESLint（检查）+ Prettier（格式化）+ isort（导入排序）。

```bash
# 安装
uv add --dev ruff

# 代码检查（类似 eslint）
uv run ruff check .

# 自动修复
uv run ruff check --fix .

# 格式化（类似 prettier）
uv run ruff format .

# 检查格式是否正确（不修改文件）
uv run ruff format --check .
```

### mypy：静态类型检查

```python
# main.py
from typing import Optional

def fetch_user(user_id: int) -> Optional[dict]:
    """获取用户信息"""
    if user_id <= 0:
        return None
    return {"id": user_id, "name": "Alice"}

# 类型安全使用
user = fetch_user(1)
if user is not None:
    print(user["name"])  # mypy 确认 user 不是 None
```

```bash
# 运行类型检查
uv run mypy .
```

### Pre-commit 钩子

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
```

---

## 五、项目结构规范

### 脚本工具项目（轻量级）

```
my-script/
├── pyproject.toml          # 项目配置
├── uv.lock                 # 依赖锁定
├── src/
│   └── my_script/
│       ├── __init__.py
│       ├── cli.py          # 命令行入口
│       ├── core.py         # 核心逻辑
│       └── utils.py        # 工具函数
├── tests/
│   └── test_core.py
├── .python-version         # Python 版本锁定
└── README.md
```

### 中型项目（带 API 服务）

```
my-api/
├── pyproject.toml
├── uv.lock
├── src/
│   └── my_api/
│       ├── __init__.py
│       ├── main.py          # 应用入口
│       ├── config.py        # 配置管理
│       ├── models/          # 数据模型
│       │   ├── __init__.py
│       │   └── user.py
│       ├── routers/         # 路由/控制器
│       │   ├── __init__.py
│       │   └── user.py
│       ├── services/        # 业务逻辑
│       │   ├── __init__.py
│       │   └── user_service.py
│       └── repositories/    # 数据访问层
│           ├── __init__.py
│           └── user_repo.py
├── tests/
├── alembic/                 # 数据库迁移
│   └── versions/
├── alembic.ini
└── .env
```

---

## 六、CLI 脚本开发最佳实践

前端工程师用 Python 最常见的场景是写命令行脚本。

### Click：命令行框架

```python
# cli.py
import click
from rich.console import Console

console = Console()

@click.group()
@click.option("--verbose", "-v", is_flag=True, help="详细输出")
def cli(verbose):
    """我的自动化工具集"""
    if verbose:
        console.print("[bold green]Verbose mode enabled[/]")

@cli.command()
@click.argument("url")
@click.option("--output", "-o", default="output.json", help="输出文件路径")
def fetch(url: str, output: str):
    """从 URL 获取数据并保存"""
    import requests
    response = requests.get(url)
    with open(output, "w") as f:
        f.write(response.text)
    console.print(f"[green]Saved to {output}[/]")

@cli.command()
@click.option("--format", "-f", type=click.Choice(["json", "csv"]), default="json")
def export(format: str):
    """导出数据"""
    console.print(f"Exporting as {format}...")

if __name__ == "__main__":
    cli()
```

### Rich：终端美化

```python
from rich.console import Console
from rich.table import Table
from rich.progress import Progress

console = Console()

# 彩色输出
console.print("[bold red]Error:[/] Something went wrong")
console.print("[green]Success:[/] Operation completed")

# 表格
table = Table(title="项目统计")
table.add_column("项目", style="cyan")
table.add_column("代码行数", justify="right", style="green")
table.add_column("文件数", justify="right", style="yellow")
table.add_row("frontend", "12,345", "89")
table.add_row("backend", "5,678", "34")
console.print(table)

# 进度条
with Progress() as progress:
    task = progress.add_task("处理中...", total=100)
    for i in range(100):
        progress.update(task, advance=1)
```

---

## 七、数据模型：Pydantic

Pydantic 是 Python 中最流行的数据验证库，类似于 TypeScript 的 `zod`。

```python
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class User(BaseModel):
    id: int = Field(gt=0, description="用户 ID")
    name: str = Field(min_length=1, max_length=50)
    email: str
    age: Optional[int] = Field(None, ge=0, le=150)
    created_at: datetime = Field(default_factory=datetime.now)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if "@" not in v:
            raise ValueError("无效的邮箱地址")
        return v.lower()

# 使用
user = User(id=1, name="Alice", email="alice@example.com")
print(user.model_dump_json(indent=2))

# 验证失败会抛出清晰错误
try:
    User(id=-1, name="", email="invalid")
except ValueError as e:
    print(e)
```

---

## 八、常用自动化脚本模板

### 文件批处理

```python
#!/usr/bin/env python3
"""批量重命名文件工具"""
import click
from pathlib import Path
from rich.console import Console

console = Console()

@click.command()
@click.argument("directory", type=click.Path(exists=True))
@click.option("--pattern", "-p", required=True, help="匹配模式")
@click.option("--replace", "-r", required=True, help="替换字符串")
@click.option("--dry-run", is_flag=True, help="仅预览不执行")
def rename(directory: str, pattern: str, replace: str, dry_run: bool):
    """批量重命名文件"""
    dir_path = Path(directory)
    files = sorted(dir_path.glob(pattern))

    for file in files:
        new_name = file.name.replace(pattern, replace)
        new_path = file.parent / new_name

        if dry_run:
            console.print(f"[dim]{file.name}[/] → [green]{new_name}[/]")
        else:
            file.rename(new_path)
            console.print(f"[green]Renamed:[/] {file.name} → {new_name}")

if __name__ == "__main__":
    rename()
```

### API 数据抓取

```python
#!/usr/bin/env python3
"""API 数据抓取并导出为 JSON"""
import httpx
import json
from pathlib import Path
from rich.console import Console
from rich.progress import Progress

console = Console()

def fetch_all_pages(base_url: str, total_pages: int) -> list[dict]:
    """分页抓取数据"""
    all_data = []
    with Progress() as progress:
        task = progress.add_task("抓取中...", total=total_pages)
        with httpx.Client(timeout=30) as client:
            for page in range(1, total_pages + 1):
                response = client.get(f"{base_url}?page={page}")
                response.raise_for_status()
                data = response.json()
                all_data.extend(data.get("results", []))
                progress.update(task, advance=1)
    return all_data

def main():
    console.print("[bold]开始抓取数据...[/]")
    data = fetch_all_pages("https://api.example.com/items", total_pages=10)
    output_path = Path("output/data.json")
    output_path.parent.mkdir(exist_ok=True)
    output_path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    console.print(f"[green]完成！共 {len(data)} 条数据保存到 {output_path}[/]")

if __name__ == "__main__":
    main()
```

---

## 九、前端工程师的 Python 速查

| 前端概念             | Python 对应                                |
| -------------------- | ------------------------------------------ |
| `const` / `let`      | 变量直接赋值（无 const，约定大写表示常量） |
| `async/await`        | `async def` + `await`（需 `asyncio`）      |
| `interface` / `type` | `Pydantic BaseModel` 或 `dataclass`        |
| `console.log`        | `print()` 或 `rich.console.print()`        |
| `process.env`        | `os.environ` 或 `python-dotenv`            |
| `fetch()`            | `httpx.get()` 或 `requests.get()`          |
| `JSON.parse()`       | `json.loads()`                             |
| `JSON.stringify()`   | `json.dumps()`                             |
| `Array.map()`        | `[f(x) for x in arr]`（列表推导式）        |
| `Array.filter()`     | `[x for x in arr if condition]`            |
| `npm scripts`        | `pyproject.toml` 中的 `[project.scripts]`  |
| `tsconfig.json`      | `pyproject.toml` 中的 `[tool.mypy]`        |
| `.eslintrc`          | `pyproject.toml` 中的 `[tool.ruff]`        |
