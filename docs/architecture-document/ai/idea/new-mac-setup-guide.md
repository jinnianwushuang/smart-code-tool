# M4 Max 128GB 资深大前端全栈工程师新电脑整备指南

## 📋 前言

恭喜获得 MacBook Pro M4 Max (128GB RAM + 8TB SSD)！这是目前移动端最强的开发机器之一。作为资深大前端全栈工程师，合理的配置将极大提升工作效率和开发体验。

本文档涵盖：系统设置、开发环境、工具链、工作流优化、性能调优等全方位建议。

---

## 🎯 核心理念

### 1. 分层隔离策略

```
Level 1: 系统原生应用（浏览器、编辑器、终端）
Level 2: Docker 容器化服务（数据库、中间件、微服务）
Level 3: PD 虚拟机（Windows/Linux 特定场景）
Level 4: 离线 AI 知识库（本地 LLM + RAG）
```

### 2. 零污染原则

- 系统级安装越少越好
- 优先使用版本管理工具（nvm、pyenv、rbenv）
- 项目依赖本地化（node_modules、venv、virtualenv）

### 3. 自动化优先

- 所有配置脚本化（dotfiles）
- 一键恢复环境能力
- 定期备份关键数据

---

## 🖥️ 第一阶段：系统基础设置（第 1 天）

### 1.1 macOS 系统优化

#### 隐私与安全性

```bash
# 系统偏好设置 → 隐私与安全性
✅ 启用 FileVault 全盘加密
✅ 启用防火墙
✅ 关闭定位服务（开发不需要）
✅ 限制广告追踪
✅ 禁用 Siri 数据分析
```

#### 触控板与鼠标

```
系统偏好设置 → 触控板：
✅ 轻点来点按
✅ 启用三指拖移（强烈推荐）
✅ 缩放时惯性滚动
✅ 辅助点按：右下角

系统偏好设置 → 鼠标：
✅ 自然滚动：关闭（与触控板保持一致）
✅ 跟踪速度：根据个人习惯调整
```

#### 显示器设置

```
系统偏好设置 → 显示器：
✅ 分辨率：默认（M4 Max 支持外接 8K）
✅ 刷新率：最高可用
✅ True Tone：根据环境光开启/关闭
✅ Night Shift：日落后自动开启
```

#### 电池优化

```
系统偏好设置 → 电池：
✅ 优化电池充电
✅ 低电量模式：仅在使用电池时
⚠️  插电使用时关闭节能模式以获得最佳性能
```

### 1.2 Finder 优化

```bash
# Finder → 偏好设置
通用：
✅ 新 Finder 窗口显示：主目录
✅ 打开新标签页显示：主目录

边栏：
✅ 显示：应用程序、桌面、文稿、下载、主目录
❌ 隐藏：AirDrop、iCloud、标签

高级：
✅ 显示所有文件扩展名
✅ 搜索时：搜索当前文件夹
✅ 执行搜索时：显示搜索条件
```

### 1.3 Dock 精简

```
Dock 只保留：
- Finder
- Terminal/iTerm2
- VS Code
- Chrome/Arc
- Docker Desktop
- Parallels Desktop
- 其他常用应用（不超过 10 个）

设置：
✅ 自动隐藏和显示 Dock
✅ 放大：关闭（保持简洁）
✅ 最小化效果：缩放
```

---

## 🔧 第二阶段：核心开发工具安装（第 1-2 天）

### 2.1 包管理器

#### Homebrew（必须）

```bash
# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 配置环境变量
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# 验证安装
brew --version
brew doctor
```

#### MacPorts（可选，与 Homebrew 二选一）

```bash
# 如果更喜欢 MacPorts
sudo port selfupdate
```

**建议**：使用 Homebrew，社区支持更好

### 2.2 终端增强

#### iTerm2（推荐替代 Terminal）

```bash
brew install --cask iterm2

# 或使用 Apple Terminal（已足够强大）
```

#### Oh My Zsh

```bash
# 安装 Oh My Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 推荐插件
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
git clone https://github.com/marlonrichert/zsh-snap ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-snap

# 编辑 ~/.zshrc
plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
  docker
  docker-compose
  npm
  node
  python
  vscode
)

# 主题推荐
ZSH_THEME="powerlevel10k/powerlevel10k"
# 或
ZSH_THEME="agnoster"
```

#### Powerlevel10k 主题（强烈推荐）

```bash
git clone --depth=1 https://github.com/romkatex/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# 运行配置向导
p10k configure
```

#### Starship（现代化提示符，备选）

```bash
brew install starship

# 添加到 ~/.zshrc
eval "$(starship init zsh)"
```

### 2.3 版本管理工具

#### nvm / fnm（Node.js 版本管理）

```bash
# 方案一：nvm（稳定）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 方案二：fnm（更快，Rust 编写，推荐 M 系列芯片）
brew install fnm

# 配置 fnm（~/.zshrc）
eval "$(fnm env --use-on-cd)"

# 安装 Node.js LTS
fnm install --lts
fnm use --lts
fnm default lts-latest

# 验证
node --version
npm --version
```

#### pyenv（Python 版本管理）

```bash
brew install pyenv

# 配置 ~/.zshrc
export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

# 安装 Python
pyenv install 3.12.0
pyenv global 3.12.0

# 验证
python --version
pip --version
```

#### rbenv（Ruby，如需）

```bash
brew install rbenv ruby-build

# 配置 ~/.zshrc
eval "$(rbenv init - zsh)"

# 安装 Ruby
rbenv install 3.3.0
rbenv global 3.3.0
```

#### sdkman（Java/Kotlin/Scala/Groovy）

```bash
curl -s "https://get.sdkman.io" | bash

# 安装 JDK
sdk install java 21.0.1-zulu
sdk install java 17.0.9-zulu

# 切换版本
sdk use java 21.0.1-zulu
sdk default java 21.0.1-zulu
```

### 2.4 代码编辑器

#### Visual Studio Code（主力）

```bash
brew install --cask visual-studio-code

# 安装必要扩展
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
code --install-extension eamodio.gitlens
code --install-extension github.copilot
code --install-extension continue.continue
code --install-extension ms-python.python
code --install-extension rust-lang.rust-analyzer
code --install-extension vue.volar
code --install-extension denoland.vscode-deno
```

#### VS Code 关键配置（settings.json）

```json
{
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', monospace",
  "editor.fontSize": 14,
  "editor.lineHeight": 1.6,
  "editor.fontLigatures": true,
  "editor.minimap.enabled": false,
  "editor.renderWhitespace": "selection",
  "editor.cursorBlinking": "smooth",
  "editor.cursorSmoothCaretAnimation": "on",
  "editor.smoothScrolling": true,

  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true
  },

  "terminal.integrated.fontFamily": "'JetBrains Mono', monospace",
  "terminal.integrated.fontSize": 13,

  "workbench.colorTheme": "GitHub Dark Default",
  "workbench.iconTheme": "material-icon-theme",

  "git.autofetch": true,
  "git.confirmSync": false,

  "prettier.requireConfig": true,
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

#### JetBrains 全家桶（按需）

```bash
# WebStorm（前端专业版）
brew install --cask webstorm

# IntelliJ IDEA（Java/全栈）
brew install --cask intellij-idea

# DataGrip（数据库）
brew install --cask datagrip

# Rider（.NET，如需）
brew install --cask rider
```

### 2.5 浏览器

#### Chrome / Chromium

```bash
brew install --cask google-chrome
```

#### Arc Browser（现代化推荐）

```bash
brew install --cask arc

# 特点：
# - 垂直标签页
# - Spaces 工作区
# - 内置 AI 功能
# - 更现代的 UI
```

#### Firefox Developer Edition（备选）

```bash
brew install --cask firefox-developer-edition
```

**建议**：Chrome/Arc 作为主力，Firefox 用于兼容性测试

### 2.6 Git 配置

```bash
brew install git git-lfs

# 全局配置
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"
git config --global pull.rebase false
git config --global push.default current

# 启用 GPG 签名（可选但推荐）
brew install gnupg
git config --global commit.gpgSign true
git config --global user.signingkey YOUR_GPG_KEY_ID

# SSH Key 生成
ssh-keygen -t ed25519 -C "your.email@example.com"
# 添加到 GitHub/GitLab
cat ~/.ssh/id_ed25519.pub | pbcopy

# Git 别名
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
```

---

## 🐳 第三阶段：Docker 环境配置（第 2-3 天）

### 3.1 Docker Desktop 安装

```bash
brew install --cask docker

# 启动 Docker Desktop
open -a Docker

# 验证
docker --version
docker compose version
```

### 3.2 Docker 优化配置（M4 Max 专属）

#### Docker Desktop 设置

```
Preferences → Resources：
- CPUs: 8-12（留一些给主机）
- Memory: 32-48 GB（128GB 内存很充裕）
- Swap: 8 GB
- Disk image size: 200 GB（根据需求调整）
- Disk image location: 默认即可

Preferences → General：
✅ Use the new Virtualization framework
✅ Use Rosetta for x86/amd64 emulation on Apple Silicon
✅ Start Docker Desktop when you log in
```

#### Docker Compose 模板库

创建 `~/docker-templates/` 目录，存放常用服务的 compose 文件：

```yaml
# ~/docker-templates/postgres/docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: postgres-dev
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev123
      POSTGRES_DB: development
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    command: ['postgres', '-c', 'max_connections=200']

volumes:
  postgres_data:
```

```yaml
# ~/docker-templates/redis/docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    container_name: redis-dev
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

```yaml
# ~/docker-templates/mongo/docker-compose.yml
version: '3.8'
services:
  mongo:
    image: mongo:7
    container_name: mongo-dev
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

```yaml
# ~/docker-templates/elk-stack/docker-compose.yml
version: '3.8'
services:
  elasticsearch:
    image: elasticsearch:8.11.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - 'ES_JAVA_OPTS=-Xms512m -Xmx512m'
      - xpack.security.enabled=false
    ports:
      - '9200:9200'
    volumes:
      - es_data:/usr/share/elasticsearch/data

  kibana:
    image: kibana:8.11.0
    container_name: kibana
    ports:
      - '5601:5601'
    depends_on:
      - elasticsearch

volumes:
  es_data:
```

#### Docker 管理脚本

创建 `~/scripts/docker-manager.sh`：

```bash
#!/bin/bash

# Docker 服务管理脚本

start_service() {
    local service=$1
    echo "Starting $service..."
    docker compose -f ~/docker-templates/$service/docker-compose.yml up -d
}

stop_service() {
    local service=$1
    echo "Stopping $service..."
    docker compose -f ~/docker-templates/$service/docker-compose.yml down
}

clean_all() {
    echo "Cleaning all unused Docker resources..."
    docker system prune -af
    docker volume prune -f
}

status() {
    echo "Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "Disk usage:"
    docker system df
}

case "$1" in
    start)
        start_service $2
        ;;
    stop)
        stop_service $2
        ;;
    clean)
        clean_all
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {start|stop|clean|status} [service]"
        exit 1
        ;;
esac
```

```bash
chmod +x ~/scripts/docker-manager.sh

# 添加到 ~/.zshrc
alias dkm='~/scripts/docker-manager.sh'
```

### 3.3 常用 Docker 命令速查

```bash
# 启动服务
dkm start postgres
dkm start redis
dkm start mongo

# 查看所有容器
docker ps -a

# 查看日志
docker logs -f postgres-dev

# 进入容器
docker exec -it postgres-dev psql -U dev

# 清理空间
dkm clean

# 查看状态
dkm status
```

---

## 💻 第四阶段：Parallels Desktop 配置（第 3-4 天）

### 4.1 PD 安装与优化

```bash
brew install --cask parallels-desktop

# 激活许可证（需要购买）
```

### 4.2 推荐的虚拟机配置

#### Windows 11 ARM（开发测试用）

```
配置建议：
- CPU: 4-6 核心
- 内存: 8-16 GB
- 磁盘: 100 GB 动态分配
- 图形: 自动
- 网络: 共享网络

用途：
✅ .NET 开发测试
✅ Windows 专用软件
✅ IE/Edge 兼容性测试
✅ 游戏开发（Unity/Unreal）
```

#### Ubuntu 24.04 LTS（Linux 环境）

```
配置建议：
- CPU: 4 核心
- 内存: 8 GB
- 磁盘: 50 GB
- 网络: 桥接模式

用途：
✅ Linux 原生开发环境
✅ 服务器模拟
✅ Bash 脚本测试
✅ 容器编排学习
```

#### Kali Linux（安全测试，可选）

```
配置建议：
- CPU: 2-4 核心
- 内存: 4-8 GB
- 磁盘: 40 GB

用途：
✅ 渗透测试学习
✅ 网络安全实验
⚠️  仅限合法用途
```

### 4.3 PD 优化技巧

```
Preferences → Optimization：
✅ Share Mac user folders with Windows
✅ Share applications between Mac and Windows
✅ Optimize Windows for better performance

Coherence Mode：
- 可将 Windows 应用无缝集成到 macOS
- 适合偶尔使用 Windows 软件
```

---

## 🤖 第五阶段：离线 AI 知识库部署（第 4-5 天）

### 5.1 Ollama 安装与配置

```bash
# 安装 Ollama
brew install ollama

# 启动服务
brew services start ollama

# 验证
ollama --version
```

### 5.2 模型选择（128GB 内存优势）

```bash
# 代码专用模型（主力）
ollama pull codellama:34b          # 34B 参数，代码理解强
ollama pull deepseek-coder:33b     # 33B 参数，中文友好

# 通用对话模型
ollama pull llama3.3:70b           # 70B 参数，最强通用模型
ollama pull qwen2.5:72b            # 72B 参数，中文优秀

# Embedding 模型
ollama pull nomic-embed-text       # 通用文本嵌入
ollama pull mxbai-embed-large      # 高质量嵌入

# 轻量级模型（快速响应）
ollama pull llama3.2:3b            # 3B 参数，日常问答
ollama pull qwen2.5:7b             # 7B 参数，平衡性能
```

**内存占用参考**：

- 3B 模型：~2 GB
- 7B 模型：~4-6 GB
- 13B 模型：~8-10 GB
- 34B 模型：~20-24 GB
- 70B 模型：~40-48 GB（量化后）

128GB 内存可以同时运行多个模型！

### 5.3 RAG 系统搭建

参考之前创建的 [kbs.md](file:///Users/jinnian/Code/web/smart-code-tool/docs/architecture-document/ai/idea/kbs.md) 文档，快速部署：

```bash
# 创建项目
mkdir ~/ai-knowledge-base
cd ~/ai-knowledge-base

# 创建虚拟环境
python -m venv venv
source venv/bin/activate

# 安装依赖
pip install \
    chromadb \
    sentence-transformers \
    langchain \
    langchain-community \
    langchain-chroma \
    unstructured \
    fastapi \
    uvicorn

# 初始化索引
python indexer.py

# 启动查询服务
python app.py
```

### 5.4 VS Code Continue 配置

```json
// ~/.continue/config.json
{
  "models": [
    {
      "title": "CodeLlama 34B",
      "provider": "ollama",
      "model": "codellama:34b",
      "apiBase": "http://localhost:11434"
    },
    {
      "title": "Qwen2.5 72B",
      "provider": "ollama",
      "model": "qwen2.5:72b",
      "apiBase": "http://localhost:11434"
    }
  ],
  "embeddingsProvider": {
    "provider": "ollama",
    "model": "nomic-embed-text",
    "apiBase": "http://localhost:11434"
  },
  "vector": {
    "provider": "chroma",
    "config": {
      "collection": "knowledge_base",
      "directory": "~/ai-knowledge-base/chroma_db"
    }
  }
}
```

---

## 🛠️ 第六阶段：开发工具链完善（第 5-7 天）

### 6.1 数据库客户端

```bash
# TablePlus（推荐，美观强大）
brew install --cask tableplus

# 或 DBeaver（免费开源）
brew install --cask dbeaver-community

# 或 DataGrip（JetBrains，付费但强大）
brew install --cask datagrip
```

### 6.2 API 测试工具

```bash
# Postman
brew install --cask postman

# 或 Insomnia（更轻量）
brew install --cask insomnia

# 或 Apifox（国产，一体化）
brew install --cask apifox
```

### 6.3 终端工具

```bash
# tmux（终端复用器）
brew install tmux

# lazygit（TUI Git 客户端）
brew install lazygit

# bat（cat 的增强版）
brew install bat

# exa/fd（ls/find 的现代替代品）
brew install exa fd

# jq（JSON 处理）
brew install jq

# httpie（HTTP 客户端）
brew install httpie

# tldr（简化的 man pages）
brew install tldr

# fzf（模糊查找）
brew install fzf
$(brew --prefix)/opt/fzf/install
```

### 6.4 监控与调试

```bash
# Wireshark（网络抓包）
brew install --cask wireshark

# Charles Proxy（HTTP 代理调试）
brew install --cask charles

# MongoDB Compass
brew install --cask mongodb-compass

# Redis Insight
brew install --cask redis-insight

# PGAdmin
brew install --cask pgadmin4
```

### 6.5 设计协作工具

```bash
# Figma
brew install --cask figma

# Sketch（macOS 专属）
brew install --cask sketch

# Adobe Creative Cloud（如需）
brew install --cask adobe-creative-cloud
```

### 6.6 通讯与协作

```bash
# Slack
brew install --cask slack

# Microsoft Teams
brew install --cask microsoft-teams

# Zoom
brew install --cask zoom

# Notion
brew install --cask notion

# Obsidian（知识管理，强烈推荐）
brew install --cask obsidian
```

---

## ⚙️ 第七阶段：系统级优化（持续进行）

### 7.1 性能监控工具

```bash
# Activity Monitor（系统自带）
# 监控 CPU、内存、磁盘、网络

# iStat Menus（菜单栏监控，付费但值得）
brew install --cask istat-menus

# Stats（免费开源替代）
brew install --cask stats

# Intel Power Gadget（功耗监控）
brew install intel-power-gadget
```

### 7.2 清洁与维护

```bash
# OnyX（系统维护工具）
brew install --cask onyx

# CleanMyMac X（付费，谨慎使用）
# 或手动清理：

# 清理缓存
rm -rf ~/Library/Caches/*
rm -rf ~/Library/Logs/*

# 清理 Xcode 缓存（如果安装）
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf ~/Library/Developer/Xcode/iOS DeviceSupport

# 清理 npm 缓存
npm cache clean --force

# 清理 Docker
docker system prune -af
```

### 7.3 备份策略

#### Time Machine（必须）

```
系统偏好设置 → Time Machine：
✅ 启用 Time Machine
✅ 选择外置硬盘作为备份盘
✅ 排除：Docker 镜像、虚拟机磁盘、node_modules
```

#### 云端同步

```bash
# iCloud Drive
✅ 桌面和文稿文件夹同步
✅ 照片库同步（可选）

# GitHub
✅ 所有代码推送到 GitHub/GitLab
✅ 使用 private repository 保护私有代码

# Dotfiles 仓库
mkdir ~/dotfiles
cd ~/dotfiles
git init

# 添加配置文件
ln -s ~/.zshrc ~/dotfiles/zshrc
ln -s ~/.gitconfig ~/dotfiles/gitconfig
ln -s ~/.vscode/settings.json ~/dotfiles/vscode-settings.json

git add .
git commit -m "Initial dotfiles"
git remote add origin git@github.com:username/dotfiles.git
git push -u origin main
```

### 7.4 电源管理优化

```bash
# 查看当前电源设置
pmset -g

# 自定义设置（插电时）
sudo pmset -c displaysleep 15
sudo pmset -c sleep 0
sudo pmset -c hibernatemode 0

# 自定义设置（电池时）
sudo pmset -b displaysleep 5
sudo pmset -b sleep 10
sudo pmset -b hibernatemode 3

# 防止休眠（编译大项目时）
caffeinate -i -d -m -u &
```

---

## 📦 第八阶段：语言运行时与框架（按需安装）

### 8.1 JavaScript/TypeScript 生态

```bash
# 全局工具
npm install -g typescript ts-node
npm install -g @vue/cli @angular/cli create-react-app
npm install -g yarn pnpm
npm install -g nodemon pm2
npm install -g eslint prettier stylelint
npm install -g http-server serve

# Vite 项目模板
npm create vite@latest my-vue-app -- --template vue-ts
npm create vite@latest my-react-app -- --template react-ts

# Next.js
npx create-next-app@latest my-next-app

# Nuxt.js
npx nuxi@latest init my-nuxt-app
```

### 8.2 Python 生态

```bash
# 数据科学
pip install numpy pandas matplotlib seaborn scikit-learn jupyter

# Web 开发
pip install flask django fastapi uvicorn

# 工具
pip install black flake8 mypy pytest httpx requests beautifulsoup4

# Jupyter Lab
pip install jupyterlab
jupyter labextension install @jupyter-widgets/jupyterlab-manager
```

### 8.3 Rust（系统编程）

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 验证
rustc --version
cargo --version

# 常用工具
cargo install cargo-watch
cargo install cargo-edit
cargo install bat
cargo install fd-find
cargo install ripgrep
```

### 8.4 Go（后端开发）

```bash
brew install go

# 配置 GOPATH
echo 'export GOPATH=$HOME/go' >> ~/.zshrc
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.zshrc
source ~/.zshrc

# 验证
go version

# 常用工具
go install golang.org/x/tools/gopls@latest
go install github.com/go-delve/delve/cmd/dlv@latest
```

### 8.5 Flutter（移动开发）

```bash
brew install --cask flutter

# 验证
flutter doctor

# iOS 开发需要
brew install cocoapods
```

---

## 🎨 第九阶段：个性化与效率提升

### 9.1 字体安装

```bash
# JetBrains Mono（编程字体，推荐）
brew install --cask font-jetbrains-mono

# Fira Code（连字支持好）
brew install --cask font-fira-code

# Cascadia Code（微软出品）
brew install --cask font-cascadia-code

# Hack Nerd Font（图标支持）
brew tap homebrew/cask-fonts
brew install --cask font-hack-nerd-font
```

### 9.2 快捷键定制

#### Karabiner-Elements（键盘映射）

```bash
brew install --cask karabiner-elements

# 常用映射：
# Caps Lock → Hyper Key (Ctrl+Shift+Cmd+Opt)
# Right Cmd → Right Option
# 自定义复杂快捷键
```

#### Raycast（Spotlight 替代品，强烈推荐）

```bash
brew install --cask raycast

# 功能：
# ✅ 快速启动应用
# ✅ 剪贴板历史
# ✅ 窗口管理
# ✅ 计算器
# ✅ 翻译
# ✅ Emoji 搜索
# ✅ 自定义脚本扩展
```

#### Rectangle（窗口管理）

```bash
brew install --cask rectangle

# 快捷键：
# Ctrl+Cmd+Left/Right：左/右半屏
# Ctrl+Cmd+Up/Down：上/下半屏
# Ctrl+Cmd+Enter：全屏
# Ctrl+Cmd+C：居中
```

### 9.3 Alfred（付费，比 Raycast 更强大）

```bash
brew install --cask alfred

# Powerpack 功能：
# ✅ 工作流自动化
# ✅ 剪贴板历史
# ✅ 文件搜索
# ✅ 系统集成
```

### 9.4 自动化脚本

创建 `~/scripts/` 目录，存放常用脚本：

```bash
#!/bin/bash
# ~/scripts/dev-env-setup.sh
# 一键启动开发环境

echo "🚀 Starting development environment..."

# 启动 Docker 服务
dkm start postgres
dkm start redis
dkm start mongo

# 启动 Ollama
brew services start ollama

# 打开常用应用
open -a "Visual Studio Code"
open -a "Arc"
open -a "TablePlus"

echo "✅ Development environment ready!"
```

```bash
#!/bin/bash
# ~/scripts/cleanup.sh
# 系统清理

echo "🧹 Cleaning up..."

# 清理 Docker
docker system prune -af

# 清理 npm
npm cache clean --force

# 清理 brew
brew cleanup

# 清理缓存
rm -rf ~/Library/Caches/*

echo "✅ Cleanup complete!"
```

---

## 🔒 第十阶段：安全与隐私

### 10.1 密码管理

```bash
# 1Password（推荐）
brew install --cask 1password

# 或 Bitwarden（免费开源）
brew install --cask bitwarden
```

### 10.2 VPN（如需）

```bash
# Clash Verge（开源）
brew install --cask clash-verge

# 或 ShadowsocksX-NG
brew install --cask shadowsocksx-ng
```

### 10.3 防火墙与安全

```bash
# 启用防火墙
sudo defaults write /Library/Preferences/com.apple.alf globalstate -int 1

# 阻止传入连接
sudo defaults write /Library/Preferences/com.apple.alf stealthenabled -int 1

# 定期检查
sudo log show --predicate 'eventMessage contains "firewall"' --last 24h
```

### 10.4 GPG 密钥管理

```bash
brew install gnupg pinentry-mac

# 生成密钥
gpg --full-generate-key

# 配置 pinentry
echo "pinentry-program $(which pinentry-mac)" >> ~/.gnupg/gpg-agent.conf

# 重启 agent
gpgconf --kill gpg-agent
gpg-agent --daemon
```

---

## 📊 性能基准测试（验证硬件）

### 11.1 跑分工具

```bash
# Geekbench 6
brew install --cask geekbench

# Cinebench（CPU/GPU）
brew install --cask cinebench

# Blackmagic Disk Speed Test（磁盘）
brew install --cask blackmagic-disk-speed-test

# 在线测试
# https://browserbench.org/MotionMark/
# https://web.basemark.com/
```

### 11.2 预期性能（M4 Max 128GB）

```
Geekbench 6：
- Single-Core: ~3800-4000
- Multi-Core: ~22000-24000

Cinebench R23：
- Single-Core: ~2300-2400
- Multi-Core: ~15000-16000

磁盘速度：
- Read: ~5000-6000 MB/s
- Write: ~4500-5500 MB/s
```

---

## 📝 检查清单

### 第 1 周完成项

- [ ] macOS 系统更新到最新版本
- [ ] 启用 FileVault 加密
- [ ] 安装 Homebrew
- [ ] 配置 Oh My Zsh + Powerlevel10k
- [ ] 安装 VS Code 及扩展
- [ ] 配置 Git（SSH Key、GPG）
- [ ] 安装 nvm/fnm 和 Node.js
- [ ] 安装 pyenv 和 Python
- [ ] 安装 Docker Desktop 并优化配置
- [ ] 创建 Docker Compose 模板库
- [ ] 安装 Ollama 和首批模型
- [ ] 搭建 RAG 知识库系统
- [ ] 配置 Continue 插件
- [ ] 安装 Parallels Desktop
- [ ] 创建 Windows 11 ARM 虚拟机
- [ ] 安装数据库客户端（TablePlus）
- [ ] 安装 API 测试工具（Postman/Insomnia）
- [ ] 配置 Raycast/Alfred
- [ ] 配置 Rectangle 窗口管理
- [ ] 安装编程字体
- [ ] 设置 Time Machine 备份
- [ ] 创建 dotfiles Git 仓库
- [ ] 运行性能基准测试

### 第 1 个月优化项

- [ ] 完善自动化脚本
- [ ] 建立知识库索引（代码、文档、笔记）
- [ ] 优化 Docker 服务管理
- [ ] 配置 CI/CD 本地测试环境
- [ ] 建立项目脚手架模板
- [ ] 整理常用命令速查表
- [ ] 优化 VS Code 配置和快捷键
- [ ] 建立代码规范（ESLint、Prettier）
- [ ] 配置监控系统（Prometheus + Grafana，可选）
- [ ] 完善备份策略（异地备份）

---

## 🎓 进阶建议

### 1. 学习资源订阅

```
YouTube Channels:
- Fireship（前端快讯）
- Theo - t3.gg（全栈开发）
- Jack Herrington（Next.js）
- Lee Robinson（Vercel）

Newsletters:
- JavaScript Weekly
- React Status
- Node Weekly
- CSS-Tricks

Podcasts:
- Syntax.fm
- JS Party
- Changelog
```

### 2. 社区参与

```
GitHub:
- Star 优质项目
- 提交 Issue/PR
- 维护个人开源项目

Twitter/X:
- 关注技术领袖
- 分享学习心得

Local Meetups:
- 参加本地技术聚会
- 参与黑客松
```

### 3. 健康与工作平衡

```
护眼：
✅ 启用 Night Shift
✅ 使用 f.lux 调节色温
✅ 每 20 分钟看 20 英尺外 20 秒

人体工学：
✅ 外接显示器（推荐 Studio Display）
✅ 机械键盘（推荐 Keychron Q1/Q2）
✅ 垂直鼠标（推荐 Logitech MX Vertical）
✅ 升降桌

休息：
✅ Pomodoro Technique（番茄工作法）
✅ 每小时起身活动
✅ 定期运动
```

---

## 🔄 定期维护计划

### 每周

```bash
# 更新软件
brew update && brew upgrade

# 清理 Docker
dkm clean

# 备份重要数据
time machine backup check
```

### 每月

```bash
# 系统清理
~/scripts/cleanup.sh

# 更新模型
ollama pull <model>:latest

# 审查 installed apps
brew list
brew uninstall <unused>
```

### 每季度

```bash
# 完整系统备份
# 审查安全设置
# 更新所有密码
# 清理 Downloads 文件夹
# 整理桌面
```

---

## 📚 参考资源

- [Homebrew 官方文档](https://brew.sh/)
- [Oh My Zsh](https://ohmyz.sh/)
- [Ollama 文档](https://ollama.com/docs)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)
- [VS Code Tips and Tricks](https://code.visualstudio.com/docs/getstarted/tips-and-tricks)
- [macOS Privacy Guide](https://github.com/drduh/macOS-Security-and-Privacy-Guide)
- [Dotfiles 示例](https://github.com/mathiasbynens/dotfiles)

---

## 💡 结语

拥有 M4 Max 128GB 是一笔巨大的投资，合理的配置将带来：

✅ **极致性能**：同时运行多个大型项目无压力  
✅ **完全离线**：AI 辅助不依赖网络  
✅ **高度隔离**：Docker + VM 保证环境纯净  
✅ **高效工作流**：自动化工具链减少重复劳动  
✅ **数据安全**：本地优先，隐私保护

记住：**工具是手段，不是目的**。花 1-2 周时间搭建完美环境是值得的，但不要陷入"配置陷阱"——最终目标是写出优秀的代码，创造有价值的产品。

祝开发愉快！🚀

---

**文档版本**: v1.0  
**最后更新**: 2026-06-23  
**适用设备**: MacBook Pro M4 Max (128GB RAM)  
**作者**: AI Assistant for Senior Full-Stack Developer
