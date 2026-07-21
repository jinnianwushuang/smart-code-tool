# Linux 目录结构全解

## 概述

Linux 采用统一的树形目录结构，一切皆文件。理解目录布局是掌握 Linux 系统管理、服务部署和问题排查的基础。

---

## 顶层目录总览

```
/
├── bin/        → 基本用户命令（ls, cp, mv...）
├── boot/       → 启动引导文件（内核、GRUB）
├── dev/        → 设备文件（磁盘、终端、随机数）
├── etc/        → 系统配置文件
├── home/       → 普通用户主目录
├── lib/        → 基本共享库
├── lib64/      → 64 位共享库
├── media/      → 可移动设备挂载点
├── mnt/        → 临时手动挂载点
├── opt/        → 第三方软件安装目录
├── proc/       → 进程与内核信息（虚拟文件系统）
├── root/       → root 用户主目录
├── run/        → 运行时数据（PID、Socket）
├── sbin/       → 系统管理命令（reboot, shutdown）
├── srv/        → 服务数据（FTP、Web）
├── sys/        → 内核与设备信息（虚拟文件系统）
├── tmp/        → 临时文件（重启可能清空）
├── usr/        → 用户程序与数据（只读）
└── var/        → 可变数据（日志、缓存、队列）
```

---

## 核心目录详解

### /etc — 系统配置中心

```
/etc/
├── hostname          → 主机名
├── hosts             → 本地 DNS 映射
├── passwd            → 用户账户信息
├── shadow            → 加密密码
├── group             → 用户组
├── fstab             → 磁盘挂载配置
├── ssh/              → SSH 服务配置
│   ├── sshd_config   → SSH 服务端配置
│   └── ssh_config    → SSH 客户端配置
├── nginx/            → Nginx 配置
├── systemd/          → systemd 服务单元
├── profile           → 全局环境变量（登录 shell）
├── bashrc            → 全局 Bash 配置（非登录 shell）
└── crontab           → 系统级定时任务
```

> **开发常用**：修改环境变量、配置 SSH 密钥、调整 Nginx/Docker 服务都在这。

### /home — 用户空间

```
/home/
└── username/
    ├── .bashrc / .zshrc    → Shell 配置
    ├── .ssh/               → SSH 密钥对
    │   ├── id_rsa          → 私钥（绝不外泄）
    │   └── id_rsa.pub      → 公钥
    ├── .config/            → 用户级应用配置
    ├── .local/             → 用户级数据与可执行文件
    └── projects/           → 开发项目（自定义）
```

### /var — 可变数据

```
/var/
├── log/            → 系统与服务日志
│   ├── syslog      → 系统综合日志
│   ├── auth.log    → 认证日志（登录记录）
│   ├── nginx/      → Nginx 访问/错误日志
│   └── docker/     → Docker 日志
├── lib/            → 服务运行数据
│   └── docker/     → Docker 镜像/容器/卷存储
├── cache/          → 应用缓存
├── spool/          → 队列数据（邮件、打印）
└── tmp/            → 重启不清理的临时文件
```

> **排查问题**：服务异常先看 `/var/log/`，磁盘爆满常因 `/var/lib/docker/`。

### /proc — 进程与内核信息

```bash
/proc/
├── cpuinfo         → CPU 信息（型号、核心数）
├── meminfo         → 内存使用情况
├── version         → 内核版本
├── mounts          → 当前挂载信息
├── 1/              → PID=1 进程（init/systemd）信息
│   ├── cmdline     → 启动命令
│   ├── status      → 进程状态
│   └── fd/         → 打开的文件描述符
└── net/            → 网络信息
```

```bash
# 实用命令
cat /proc/cpuinfo | grep "model name"   # CPU 型号
cat /proc/meminfo | head -5             # 内存概况
cat /proc/version                       # 内核版本
ls /proc/1/fd | wc -l                   # init 进程打开文件数
```

### /usr — 用户程序

```
/usr/
├── bin/            → 用户命令（git, node, python）
├── sbin/           → 系统管理命令
├── lib/            → 程序依赖库
├── local/          → 手动编译安装的软件
│   ├── bin/        → /usr/local/bin（常在 PATH 中）
│   └── lib/
├── share/          → 共享数据（文档、图标）
└── include/        → C/C++ 头文件
```

> **注意**：`/usr/local/bin` 优先级通常高于 `/usr/bin`，手动安装的工具放这里。

### /dev — 设备文件

```
/dev/
├── sda, sdb        → SCSI/SATA 磁盘
├── nvme0n1         → NVMe SSD
├── null            → 空设备（丢弃输出）
├── zero            → 零填充
├── random          → 真随机数
├── urandom         → 伪随机数（更快）
├── tty*            → 终端设备
└── loop*           → 回环设备（挂载镜像）
```

```bash
# 常用操作
echo "test" > /dev/null       # 丢弃输出
dd if=/dev/zero of=test bs=1M count=100   # 生成 100MB 文件
ls /dev/nvme*                 # 查看 NVMe 磁盘
```

---

## 文件系统层次标准（FHS）

Linux 目录结构遵循 **FHS（Filesystem Hierarchy Standard）** 规范：

| 分类 | 目录 | 特点 |
|------|------|------|
| 静态 + 共享 | `/usr` | 只读，可多机共享 |
| 静态 + 本地 | `/etc`, `/boot` | 只读，本机专属 |
| 可变 + 共享 | `/var/mail`, `/var/spool` | 可写，可共享 |
| 可变 + 本地 | `/var/run`, `/var/lock` | 可写，本机专属 |

---

## 开发者高频操作

### 查找文件位置

```bash
which node          # 查找可执行文件路径
whereis nginx       # 查找二进制 + 配置 + 手册
find /etc -name "*.conf" -type f    # 递归搜索配置文件
locate docker-compose.yml           # 快速定位（需 updatedb）
```

### 查看磁盘使用

```bash
df -h               # 各分区使用率
du -sh /var/lib/docker   # 指定目录大小
du -sh /* 2>/dev/null | sort -rh | head -10   # 根目录 Top10
```

### 服务与日志排查

```bash
# systemd 服务管理
systemctl status nginx
systemctl restart docker
journalctl -u nginx --since "1 hour ago"

# 直接看日志
tail -f /var/log/nginx/error.log
tail -f /var/log/auth.log
```

### 环境变量与 PATH

```bash
echo $PATH
# 典型输出：/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

# 查看某命令实际来源
type -a python3
# python3 is /usr/local/bin/python3
# python3 is /usr/bin/python3
```

---

## macOS 与 Linux 目录差异

| 路径 | Linux | macOS |
|------|-------|-------|
| 用户主目录 | `/home/user` | `/Users/user` |
| 系统配置 | `/etc` | `/etc`（符号链接到 `/private/etc`） |
| 临时文件 | `/tmp` | `/tmp`（符号链接到 `/private/tmp`） |
| 包管理 | `/usr` | `/usr/local`（Homebrew）或 `/opt/homebrew`（ARM） |
| 系统卷 | `/` | `/System`（只读系统卷 + 数据卷分离） |

```bash
# macOS Homebrew 路径
# Intel Mac: /usr/local/
# Apple Silicon: /opt/homebrew/
brew --prefix   # 查看当前 Homebrew 前缀
```

---

## Docker 容器内目录

容器基于 Linux 内核，目录结构与标准 Linux 一致：

```bash
# 进入容器查看
docker exec -it mycontainer sh
ls /

# 常见挂载策略
docker run \
  -v /host/config:/etc/app     \  # 配置文件
  -v /host/data:/var/lib/app   \  # 持久数据
  -v /host/logs:/var/log/app   \  # 日志
  myapp
```

> **最佳实践**：容器内 `/app` 放代码，配置和数据通过 Volume 挂载到宿主机，避免数据丢失。

---

## 总结速查表

| 场景 | 去哪里找 |
|------|---------|
| 修改系统/服务配置 | `/etc/` |
| 查看运行日志 | `/var/log/` |
| 安装第三方软件 | `/opt/` 或 `/usr/local/` |
| 用户项目与密钥 | `/home/user/` |
| 查看进程/硬件信息 | `/proc/` |
| 查看内核/设备参数 | `/sys/` |
| 磁盘/设备操作 | `/dev/` |
| 临时文件 | `/tmp/` |
| 启动与内核文件 | `/boot/` |
