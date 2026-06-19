# Linux 日常最常用命令速查表

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: Linux 用户、系统管理员、开发者

---

## 📑 目录

- [一、文件和目录](#一文件和目录)
- [二、文件查看和编辑](#二文件查看和编辑)
- [三、文件搜索](#三文件搜索)
- [四、权限管理](#四权限管理)
- [五、进程管理](#五进程管理)
- [六、系统信息](#六系统信息)
- [七、网络操作](#七网络操作)
- [八、压缩解压](#八压缩解压)
- [九、软件包管理](#九软件包管理)
- [十、文本处理](#十文本处理)
- [十一、磁盘管理](#十一磁盘管理)
- [十二、用户管理](#十二用户管理)
- [十三、SSH 远程](#十三ssh-远程)
- [十四、常用技巧](#十四常用技巧)

---

## 一、文件和目录

### 1.1 基本操作

```bash
# 列出文件
ls                    # 当前目录
ls -l                 # 详细信息
ls -la                # 包括隐藏文件
ls -lh                # 人类可读大小
ls -lt                # 按时间排序
ls -R                 # 递归列出

# 切换目录
cd /path/to/dir       # 切换到指定目录
cd ..                 # 上一级目录
cd ~                  # 家目录
cd -                  # 上一个目录
pwd                   # 显示当前目录

# 创建目录
mkdir dirname         # 创建目录
mkdir -p a/b/c        # 递归创建
mkdir -m 755 dirname  # 指定权限

# 删除
rm file.txt           # 删除文件
rm -r dirname         # 递归删除目录
rm -rf dirname        # 强制递归删除（谨慎使用！）
rmdir dirname         # 删除空目录

# 复制
cp file.txt backup.txt              # 复制文件
cp -r dir1 dir2                     # 递归复制目录
cp -i file.txt dest                 # 覆盖前确认
cp -v file.txt dest                 # 显示过程

# 移动/重命名
mv old.txt new.txt                  # 重命名
mv file.txt /path/to/dest          # 移动文件
mv dir1 dir2                        # 移动目录
```

### 1.2 文件属性

```bash
# 查看文件类型
file filename

# 查看文件大小
du -sh dirname          # 目录总大小
du -h *                 # 每个文件大小
df -h                   # 磁盘使用情况

# 查看文件统计
wc file.txt             # 行数、单词数、字符数
wc -l file.txt          # 只统计行数
wc -w file.txt          # 只统计单词数
```

---

## 二、文件查看和编辑

### 2.1 查看文件

```bash
# 查看整个文件
cat file.txt            # 显示文件内容
cat -n file.txt         # 显示行号

# 分页查看
less file.txt           # 可上下翻页（推荐）
more file.txt           # 只能向下翻页

# 查看头部/尾部
head file.txt           # 前10行
head -n 20 file.txt     # 前20行
tail file.txt           # 后10行
tail -n 20 file.txt     # 后20行
tail -f logfile.log     # 实时跟踪日志

# 查看文件中间部分
sed -n '10,20p' file.txt    # 第10-20行
```

### 2.2 文本编辑器

```bash
# Vim
vim file.txt            # 打开文件
vim +10 file.txt        # 从第10行开始

# Nano（简单易用）
nano file.txt

# Emacs
emacs file.txt

# 快速编辑
echo "content" > file.txt       # 覆盖写入
echo "content" >> file.txt      # 追加写入
```

### 2.3 文件比较

```bash
diff file1.txt file2.txt        # 比较文件
diff -u file1.txt file2.txt     # 统一格式
sdiff file1.txt file2.txt       # 并排比较
cmp file1.bin file2.bin         # 二进制比较
```

---

## 三、文件搜索

### 3.1 find 命令

```bash
# 按名称查找
find /path -name "filename.txt"
find /path -iname "filename.txt"    # 不区分大小写
find /path -name "*.txt"            # 通配符

# 按类型查找
find /path -type f                  # 文件
find /path -type d                  # 目录
find /path -type l                  # 符号链接

# 按时间查找
find /path -mtime -7                # 7天内修改
find /path -mtime +30               # 30天前修改
find /path -newer file.txt          # 比file.txt新

# 按大小查找
find /path -size +1M                # 大于1MB
find /path -size -10k               # 小于10KB

# 按权限查找
find /path -perm 755

# 执行操作
find /path -name "*.tmp" -delete    # 删除
find /path -name "*.log" -exec rm {} \;
find /path -type f -print0 | xargs -0 grep "pattern"
```

### 3.2 locate 命令

```bash
# 快速查找（需要更新数据库）
locate filename
sudo updatedb                       # 更新数据库
locate -i filename                  # 不区分大小写
locate "*.txt"                      # 通配符
```

### 3.3 which/whereis

```bash
which command           # 查找命令路径
whereis command         # 查找命令、源码、手册
type command            # 显示命令类型
```

---

## 四、权限管理

### 4.1 查看权限

```bash
ls -l file.txt
# -rw-r--r-- 1 user group 1234 Jan 1 12:00 file.txt
# ^^^^^^^^^^ ^^^^ ^^^^^ ^^^^ ^^^^^^^^^ ^^^^^^^^^^
# 权限      链接 所有者 组   大小      时间      文件名
```

### 4.2 修改权限

```bash
# 数字方式
chmod 755 file.txt      # rwxr-xr-x
chmod 644 file.txt      # rw-r--r--
chmod 600 file.txt      # rw-------

# 符号方式
chmod u+x file.txt      # 所有者添加执行权限
chmod g-w file.txt      # 组移除写权限
chmod o=r file.txt      # 其他用户只读
chmod a+x file.txt      # 所有人添加执行权限

# 递归修改
chmod -R 755 directory/
```

### 4.3 修改所有者

```bash
chown user file.txt                 # 修改所有者
chown user:group file.txt           # 修改所有者和组
chgrp group file.txt                # 修改组
chown -R user:group directory/      # 递归修改
```

### 4.4 特殊权限

```bash
chmod +s file.txt       # SUID/SGID
chmod +t directory/     # Sticky bit
ls -ld /tmp             # 查看 sticky bit
```

---

## 五、进程管理

### 5.1 查看进程

```bash
ps                      # 当前终端进程
ps aux                  # 所有进程详细信息
ps -ef                  # 完整格式
ps -u username          # 指定用户进程
top                     # 动态监控（类似任务管理器）
htop                    # 增强版 top（需安装）
pgrep process_name      # 按名称查找进程
pidof process_name      # 获取进程PID
```

### 5.2 进程控制

```bash
# 终止进程
kill PID                # 正常终止
kill -9 PID             # 强制终止
kill -15 PID            # 优雅终止（默认）
killall process_name    # 按名称终止所有

# 后台运行
command &               # 后台运行
jobs                    # 查看后台任务
fg %1                   # 调到前台
bg %1                   # 后台继续运行

# 优先级
nice -n 10 command      # 以低优先级运行
renice -n 5 -p PID      # 调整运行中进程优先级
```

### 5.3 系统负载

```bash
uptime                  # 系统运行时间和负载
w                       # 登录用户和负载
top                     # 实时监控
vmstat                  # 虚拟内存统计
iostat                  # IO 统计
```

---

## 六、系统信息

### 6.1 系统基本信息

```bash
uname -a                # 系统信息
hostname                # 主机名
whoami                  # 当前用户
id                      # 用户ID和组ID
date                    # 当前日期时间
cal                     # 日历
uptime                  # 运行时间
```

### 6.2 硬件信息

```bash
lscpu                   # CPU 信息
free -h                 # 内存使用
df -h                   # 磁盘使用
du -sh /*               # 目录大小
lsblk                   # 块设备
lspci                   # PCI 设备
lsusb                   # USB 设备
```

### 6.3 系统日志

```bash
dmesg                   # 内核消息
journalctl              # 系统日志（systemd）
journalctl -f           # 实时日志
journalctl -u service   # 服务日志
/var/log/syslog         # 系统日志文件
/var/log/auth.log       # 认证日志
```

---

## 七、网络操作

### 7.1 网络配置

```bash
ifconfig                # 网络接口（旧）
ip addr                 # IP 地址（新）
ip route                # 路由表
route -n                # 路由表
netstat -tuln           # 监听端口
ss -tuln                # 监听端口（新）
```

### 7.2 网络测试

```bash
ping host               # 测试连接
ping -c 4 host          # 发送4个包
traceroute host         # 路由追踪
tracepath host          # 路由追踪（新）
mtr host                # 增强版 traceroute
nslookup domain         # DNS 查询
dig domain              # DNS 查询（详细）
host domain             # DNS 查询
```

### 7.3 网络工具

```bash
curl URL                # HTTP 请求
curl -O URL             # 下载文件
wget URL                # 下载文件
wget -r URL             # 递归下载
scp file user@host:path # 安全复制
rsync -avz src/ dest/   # 同步文件
ssh user@host           # SSH 连接
```

### 7.4 防火墙

```bash
# iptables
iptables -L             # 查看规则
iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# firewalld (CentOS)
firewall-cmd --list-all
firewall-cmd --add-port=80/tcp --permanent
firewall-cmd --reload

# ufw (Ubuntu)
ufw status
ufw allow 80/tcp
ufw enable
```

---

## 八、压缩解压

### 8.1 tar

```bash
# 压缩
tar -czf archive.tar.gz directory/    # gzip
tar -cjf archive.tar.bz2 directory/   # bzip2
tar -cJf archive.tar.xz directory/    # xz

# 解压
tar -xzf archive.tar.gz               # gzip
tar -xjf archive.tar.bz2              # bzip2
tar -xJf archive.tar.xz               # xz

# 查看
tar -tzf archive.tar.gz               # 列出内容

# 选项说明
-c  创建
-x  解压
-z  gzip
-j  bzip2
-J  xz
-f  文件名
-v  详细
-t  列表
```

### 8.2 zip/unzip

```bash
# 压缩
zip -r archive.zip directory/
zip -9 archive.zip file.txt           # 最高压缩

# 解压
unzip archive.zip
unzip -l archive.zip                  # 查看内容

# 加密
zip -e secure.zip file.txt
```

### 8.3 gzip/gunzip

```bash
gzip file.txt                         # 压缩为 file.txt.gz
gunzip file.txt.gz                    # 解压
gzip -d file.txt.gz                   # 解压
zcat file.txt.gz                      # 查看压缩文件
```

---

## 九、软件包管理

### 9.1 APT (Debian/Ubuntu)

```bash
sudo apt update                       # 更新软件源
sudo apt upgrade                      # 升级软件
sudo apt install package              # 安装
sudo apt remove package               # 卸载
sudo apt purge package                # 完全卸载
sudo apt search keyword               # 搜索
sudo apt show package                 # 显示信息
sudo apt autoremove                   # 清理依赖
dpkg -l                               # 已安装列表
```

### 9.2 YUM/DNF (CentOS/RHEL)

```bash
sudo yum install package              # 安装（旧）
sudo dnf install package              # 安装（新）
sudo yum remove package               # 卸载
sudo yum search keyword               # 搜索
sudo yum info package                 # 信息
sudo yum update                       # 更新
rpm -qa                               # 已安装列表
```

### 9.3 Pacman (Arch Linux)

```bash
sudo pacman -Sy                       # 更新软件源
sudo pacman -Su                       # 升级
sudo pacman -S package                # 安装
sudo pacman -R package                # 卸载
sudo pacman -Ss keyword               # 搜索
pacman -Q                             # 已安装列表
```

### 9.4 Snap/Flatpak

```bash
# Snap
sudo snap install package
sudo snap remove package
snap list

# Flatpak
flatpak install package
flatpak uninstall package
flatpak list
```

---

## 十、文本处理

### 10.1 grep

```bash
# 基本搜索
grep "pattern" file.txt
grep -i "pattern" file.txt            # 忽略大小写
grep -n "pattern" file.txt            # 显示行号
grep -v "pattern" file.txt            # 反向匹配
grep -c "pattern" file.txt            # 计数
grep -r "pattern" /path               # 递归搜索
grep -l "pattern" *.txt               # 只显示文件名

# 正则表达式
grep -E "pattern" file.txt            # 扩展正则
grep -P "pattern" file.txt            # Perl 正则

# 上下文
grep -A 3 "pattern" file.txt          # 后3行
grep -B 3 "pattern" file.txt          # 前3行
grep -C 3 "pattern" file.txt          # 前后3行
```

### 10.2 sed

```bash
# 替换
sed 's/old/new/g' file.txt            # 全局替换
sed 's/old/new/' file.txt             # 每行第一个

# 删除
sed '5d' file.txt                     # 删除第5行
sed '1,5d' file.txt                   # 删除1-5行
sed '/pattern/d' file.txt             # 删除匹配行

# 插入
sed '5i\New line' file.txt            # 第5行前插入
sed '5a\New line' file.txt            # 第5行后插入

# 打印
sed -n '5p' file.txt                  # 打印第5行
sed -n '1,5p' file.txt                # 打印1-5行

# 原地编辑
sed -i 's/old/new/g' file.txt
```

### 10.3 awk

```bash
# 基本用法
awk '{print $1}' file.txt             # 打印第一列
awk '{print $1, $3}' file.txt         # 打印多列

# 分隔符
awk -F',' '{print $1}' file.csv       # CSV 文件

# 条件
awk '$1 > 10 {print $0}' file.txt

# 内置变量
awk '{print NR, $0}' file.txt         # 行号
awk '{print NF, $0}' file.txt         # 字段数

# BEGIN/END
awk 'BEGIN {sum=0} {sum+=$1} END {print sum}' file.txt

# 格式化
awk '{printf "%-10s %d\n", $1, $2}' file.txt
```

### 10.4 cut/sort/uniq

```bash
# cut
cut -d',' -f1 file.csv                # 按逗号分割取第1列
cut -c1-5 file.txt                    # 取字符1-5

# sort
sort file.txt                         # 排序
sort -r file.txt                      # 逆序
sort -n file.txt                      # 数值排序
sort -t',' -k2 file.csv               # 按第2列排序
sort -u file.txt                      # 去重排序

# uniq
sort file.txt | uniq                  # 去重
sort file.txt | uniq -c               # 计数
sort file.txt | uniq -d               # 只显示重复
```

---

## 十一、磁盘管理

### 10.1 查看磁盘

```bash
df -h                                 # 磁盘使用情况
df -i                                 # inode 使用
du -sh directory/                     # 目录大小
du -h *                               # 各文件大小
ncdu                                  # 交互式磁盘使用（需安装）
```

### 10.2 挂载

```bash
mount                                 # 查看所有挂载
mount /dev/sdb1 /mnt                  # 挂载
umount /mnt                           # 卸载
mount -o loop image.iso /mnt          # 挂载 ISO
```

### 10.3 分区

```bash
fdisk -l                              # 查看分区
fdisk /dev/sda                        # 分区工具
parted /dev/sda                       # 分区工具（新）
mkfs.ext4 /dev/sda1                   # 格式化
```

---

## 十二、用户管理

### 12.1 用户操作

```bash
# 添加用户
sudo adduser username                 # Debian/Ubuntu
sudo useradd username                 # 通用
sudo useradd -m username              # 创建家目录

# 删除用户
sudo deluser username                 # Debian/Ubuntu
sudo userdel username                 # 通用
sudo userdel -r username              # 删除家目录

# 修改用户
sudo usermod -aG group username       # 添加到组
sudo passwd username                  # 修改密码
sudo chsh -s /bin/bash username       # 修改 shell
```

### 12.2 组管理

```bash
groups                                # 查看当前用户组
groups username                       # 查看用户组
sudo groupadd groupname               # 创建组
sudo groupdel groupname               # 删除组
sudo gpasswd -a username group        # 添加到组
sudo gpasswd -d username group        # 从组移除
```

### 12.3 权限提升

```bash
su                                    # 切换用户
su -                                  # 切换到 root
sudo command                          # 以 root 执行
sudo -i                               # root shell
sudo -u username command              # 以指定用户执行
```

---

## 十三、SSH 远程

### 13.1 基本连接

```bash
ssh user@host                         # 基本连接
ssh user@host -p 2222                 # 指定端口
ssh -i key.pem user@host              # 使用密钥
ssh -L 8080:localhost:80 user@host    # 端口转发
ssh -R 8080:localhost:80 user@host    # 反向转发
```

### 13.2 SCP 传输

```bash
scp file.txt user@host:/path          # 上传
scp user@host:/path/file.txt .        # 下载
scp -r dir/ user@host:/path           # 递归传输
scp -P 2222 file.txt user@host:/path  # 指定端口
```

### 13.3 Rsync 同步

```bash
rsync -avz src/ user@host:dest/       # 同步到远程
rsync -avz user@host:src/ dest/       # 从远程同步
rsync -avz --delete src/ dest/        # 删除目标多余文件
rsync -avz -e ssh src/ user@host:dest/ # 通过 SSH
```

### 13.4 SSH 密钥

```bash
ssh-keygen                            # 生成密钥对
ssh-copy-id user@host                 # 复制公钥
ssh-agent bash                        # 启动 agent
ssh-add ~/.ssh/id_rsa                 # 添加密钥
```

---

## 十四、常用技巧

### 14.1 命令历史

```bash
history                               # 查看历史
!!                                    # 执行上一条命令
!n                                    # 执行第n条历史
!string                               # 执行最近以string开头的命令
Ctrl+R                                # 搜索历史
Ctrl+C                                # 中断当前命令
Ctrl+Z                                # 挂起当前命令
Ctrl+D                                # 退出/EOF
```

### 14.2 别名

```bash
# 临时别名
alias ll='ls -la'
alias gs='git status'

# 永久别名（~/.bashrc 或 ~/.zshrc）
echo "alias ll='ls -la'" >> ~/.bashrc
source ~/.bashrc

# 取消别名
unalias ll
```

### 14.3 管道和重定向

```bash
# 管道
command1 | command2                   # 输出作为输入

# 重定向
command > file.txt                    # 覆盖输出
command >> file.txt                   # 追加输出
command < file.txt                    # 输入重定向
command 2> error.log                  # 错误输出
command > output.log 2>&1             # 标准和错误都输出

# Here Document
cat <<EOF > file.txt
Line 1
Line 2
EOF
```

### 14.4 环境变量

```bash
# 查看
env                                   # 所有环境变量
echo $PATH                            # 特定变量
printenv                              # 打印环境变量

# 设置
export VAR=value                      # 当前会话
echo "export VAR=value" >> ~/.bashrc  # 永久

# 删除
unset VAR
```

### 14.5 快捷键

```bash
Tab           # 自动补全
Ctrl+A        # 移到行首
Ctrl+E        # 移到行尾
Ctrl+U        # 删除到行首
Ctrl+K        # 删除到行尾
Ctrl+W        # 删除一个单词
Ctrl+L        # 清屏
Ctrl+R        # 搜索历史
Ctrl+C        # 中断
Ctrl+Z        # 挂起
Ctrl+D        # 退出
```

### 14.6 后台和计划任务

```bash
# 后台运行
nohup command > output.log 2>&1 &
disown                          # 脱离终端

# Cron 定时任务
crontab -e                      # 编辑
crontab -l                      # 查看
crontab -r                      # 删除

# Cron 格式
# ┌───────────── 分钟 (0-59)
# │ ┌───────────── 小时 (0-23)
# │ │ ┌───────────── 日 (1-31)
# │ │ │ ┌───────────── 月 (1-12)
# │ │ │ │ ┌───────────── 星期 (0-7)
# │ │ │ │ │
# * * * * * command

# 示例
*/5 * * * * /path/to/script.sh    # 每5分钟
0 2 * * * /path/to/backup.sh      # 每天凌晨2点
0 0 * * 0 /path/to/weekly.sh      # 每周日
```

---

## 附录

### A. 有用的资源

- **Linux Command Library**: https://linuxcommandlibrary.com/
- **Explain Shell**: https://explainshell.com/
- **TLDR**: https://tldr.sh/ (简化版手册)
- **Arch Wiki**: https://wiki.archlinux.org/

### B. 学习路线

```
基础命令 → 文件操作 → 文本处理 → 权限管理 → 进程管理 → 网络 → 系统管理

1. 基础导航和文件操作
2. 文本查看和编辑
3. 文件搜索和过滤
4. 权限和所有权
5. 进程管理
6. 网络配置和调试
7. 软件包管理
8. 系统监控
9. Shell 脚本编程
10. 系统管理
```

---

**祝您 Linux 使用愉快！** 🐧
