# 国内开发镜像设置与还原

## 概述

国内开发者在使用各类包管理器和开发工具时，常常因为网络原因导致下载速度极慢甚至超时。本文整理了主流开发工具的国内镜像源配置方法，以及如何还原为官方默认源。

---

## npm / pnpm / yarn

### 设置镜像

```bash
# npm
npm config set registry https://registry.npmmirror.com

# pnpm
pnpm config set registry https://registry.npmmirror.com

# yarn
yarn config set registry https://registry.npmmirror.com
```

### 验证

```bash
npm config get registry
pnpm config get registry
yarn config get registry
```

### 还原

```bash
# npm
npm config set registry https://registry.npmjs.org

# pnpm
pnpm config set registry https://registry.npmjs.org

# yarn
yarn config set registry https://registry.npmjs.org
```

---

## pip（Python）

### 临时使用

```bash
pip install <package> -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 永久设置

```bash
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

### 常用镜像源

| 镜像源 | 地址 |
| --- | --- |
| 清华大学 | `https://pypi.tuna.tsinghua.edu.cn/simple` |
| 阿里云 | `https://mirrors.aliyun.com/pypi/simple` |
| 中科大 | `https://pypi.mirrors.ustc.edu.cn/simple` |
| 腾讯云 | `https://mirrors.cloud.tencent.com/pypi/simple` |

### 还原

```bash
pip config unset global.index-url
```

---

## Homebrew（macOS）

### 设置镜像（中科大源）

```bash
export HOMEBREW_API_DOMAIN="https://mirrors.ustc.edu.cn/homebrew-bottles/api"
export HOMEBREW_BOTTLE_DOMAIN="https://mirrors.ustc.edu.cn/homebrew-bottles"
export HOMEBREW_BREW_GIT_REMOTE="https://mirrors.ustc.edu.cn/brew.git"
export HOMEBREW_CORE_GIT_REMOTE="https://mirrors.ustc.edu.cn/homebrew-core.git"
export HOMEBREW_PIP_INDEX_URL="https://pypi.tuna.tsinghua.edu.cn/simple"
```

将以上内容写入 `~/.zshrc` 或 `~/.bash_profile` 使其永久生效。

### 还原

```bash
unset HOMEBREW_API_DOMAIN
unset HOMEBREW_BOTTLE_DOMAIN
unset HOMEBREW_BREW_GIT_REMOTE
unset HOMEBREW_CORE_GIT_REMOTE
unset HOMEBREW_PIP_INDEX_URL
```

同时删除 `~/.zshrc` 中对应的 export 行。

---

## Docker

### 设置镜像加速器

编辑或创建 `~/.docker/daemon.json`（macOS/Linux）：

```json
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ]
}
```

> [!WARNING]
> 国内 Docker 镜像源变动频繁，如失效请搜索最新可用源。

### 还原

删除 `registry-mirrors` 配置或清空文件：

```json
{}
```

修改后重启 Docker 服务：

```bash
# Linux
sudo systemctl daemon-reload
sudo systemctl restart docker

# macOS
# 在 Docker Desktop 中点击 Restart
```

---

## Maven / Gradle（Java）

### Maven — 设置阿里云镜像

编辑 `~/.m2/settings.xml`：

```xml
<settings>
  <mirrors>
    <mirror>
      <id>aliyunmaven</id>
      <mirrorOf>*</mirrorOf>
      <name>阿里云公共仓库</name>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
  </mirrors>
</settings>
```

### 还原

删除 `<mirrors>` 节点或整个 `settings.xml` 文件。

---

## Go Module

### 设置代理

```bash
go env -w GOPROXY=https://goproxy.cn,direct
```

### 还原

```bash
go env -w GOPROXY=https://proxy.golang.org,direct
```

---

## Rust（crates.io）

### 设置镜像

编辑 `~/.cargo/config.toml`：

```toml
[source.crates-io]
replace-with = 'ustc'

[source.ustc]
registry = "sparse+https://mirrors.ustc.edu.cn/crates.io-index/"
```

### 还原

删除或注释掉 `~/.cargo/config.toml` 中的上述内容。

---

## Composer（PHP）

### 设置镜像

```bash
composer config -g repo.packagist composer https://mirrors.aliyun.com/composer/
```

### 还原

```bash
composer config -g --unset repos.packagist
```

---

## Ruby（Bundler / gem）

### 设置镜像

```bash
gem sources --add https://mirrors.tuna.tsinghua.edu.cn/rubygems/ --remove https://rubygems.org/
```

### 还原

```bash
gem sources --add https://rubygems.org/ --remove https://mirrors.tuna.tsinghua.edu.cn/rubygems/
```

---

## 通用技巧

### 一键检测当前源

```bash
# npm/pnpm
npm config get registry

# pip
pip config get global.index-url

# go
go env GOPROXY

# gem
gem sources -l
```

### 项目级 .npmrc / .yarnrc

如果不想修改全局配置，可以在项目根目录创建 `.npmrc`：

```ini
registry=https://registry.npmmirror.com
```

删除该文件即还原。

### 环境变量方式（临时）

```bash
# 仅当前终端会话生效
export npm_config_registry=https://registry.npmmirror.com
```

关闭终端后自动还原。

---

## 注意事项

- 镜像源可能存在同步延迟（通常 5~15 分钟），发布新包后如需立即使用请临时切回官方源
- 企业内网通常有私有 Registry（如 Verdaccio、Nexus），优先级高于公共镜像
- Docker 镜像源变动频繁，建议收藏 2~3 个备用源
- 修改全局配置后记得验证（`config get`），避免拼写错误导致所有安装失败
