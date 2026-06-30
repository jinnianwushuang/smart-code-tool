# Shell 脚本开发速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-20  
> **适用对象**: Linux/Unix 系统管理员、DevOps 工程师、开发人员

---

## 📑 目录

- [一、基础语法](#一基础语法)
- [二、变量](#二变量)
- [三、条件判断](#三条件判断)
- [四、循环](#四循环)
- [五、函数](#五函数)
- [六、数组](#六数组)
- [七、字符串操作](#七字符串操作)
- [八、文件操作](#八文件操作)
- [九、进程管理](#九进程管理)
- [十、文本处理](#十文本处理)
- [十一、正则表达式](#十一正则表达式)
- [十二、错误处理](#十二错误处理)
- [十三、调试技巧](#十三调试技巧)
- [十四、常用命令](#十四常用命令)
- [十五、最佳实践](#十五最佳实践)

---

## 一、基础语法

### 1.1 Shebang

```bash
#!/bin/bash          # Bash
#!/bin/sh            # POSIX shell
#!/usr/bin/env bash  # 使用 env 查找 bash
```

### 1.2 注释

```bash
# 单行注释

: '
多行注释
多行注释
'

<<COMMENT
多行注释
多行注释
COMMENT
```

### 1.3 执行权限

```bash
chmod +x script.sh
./script.sh
```

### 1.4 基本结构

```bash
#!/bin/bash

# 脚本说明
echo "Hello, World!"

exit 0
```

---

## 二、变量

### 2.1 变量定义

```bash
# 定义变量
name="John"
age=25

# 使用变量
echo "Name: $name"
echo "Name: ${name}"

# 只读变量
readonly PI=3.14
# PI=3.14  # Error!
```

### 2.2 特殊变量

```bash
$0      # 脚本名称
$1-$9   # 位置参数
${10}   # 第10个参数
$#      # 参数个数
$@      # 所有参数
$*      # 所有参数
$?      # 上一个命令的退出状态
$$      # 当前进程ID
$!      # 最后一个后台进程ID
$_      # 上一个命令的最后一个参数
```

### 2.3 环境变量

```bash
# 查看环境变量
env
printenv

# 设置环境变量
export PATH=$PATH:/new/path
export VAR=value

# 删除环境变量
unset VAR
```

### 2.4 默认值

```bash
# 如果变量未设置，使用默认值
name=${NAME:-"Guest"}

# 如果变量为空，使用默认值
name=${NAME:-"Guest"}

# 如果变量未设置，报错
name=${NAME:?"Name is required"}

# 如果变量未设置，赋值
name=${NAME:="Default"}
```

### 2.5 命令替换

```bash
# 现代语法（推荐）
current_date=$(date)
files=$(ls -la)

# 旧语法
current_date=`date`
```

### 2.6 算术运算

```bash
# 使用 $(( ))
result=$(( 2 + 3 ))
result=$(( 10 / 2 ))
result=$(( 2 ** 3 ))  # 幂运算

# 使用 let
let "result = 2 + 3"
let result++

# 使用 expr
result=$(expr 2 + 3)
```

---

## 三、条件判断

### 3.1 if 语句

```bash
# 基本 if
if [ condition ]; then
    echo "true"
fi

# if-else
if [ condition ]; then
    echo "true"
else
    echo "false"
fi

# if-elif-else
if [ condition1 ]; then
    echo "condition1"
elif [ condition2 ]; then
    echo "condition2"
else
    echo "other"
fi
```

### 3.2 数值比较

```bash
[ $a -eq $b ]    # 等于
[ $a -ne $b ]    # 不等于
[ $a -gt $b ]    # 大于
[ $a -ge $b ]    # 大于等于
[ $a -lt $b ]    # 小于
[ $a -le $b ]    # 小于等于

# 使用 (( ))
(( a == b ))
(( a > b ))
```

### 3.3 字符串比较

```bash
[ "$str1" = "$str2" ]     # 等于
[ "$str1" != "$str2" ]    # 不等于
[ -z "$str" ]             # 空字符串
[ -n "$str" ]             # 非空字符串
[[ "$str" =~ pattern ]]   # 正则匹配
```

### 3.4 文件测试

```bash
[ -e file ]    # 文件存在
[ -f file ]    # 普通文件
[ -d dir ]     # 目录
[ -L link ]    # 符号链接
[ -r file ]    # 可读
[ -w file ]    # 可写
[ -x file ]    # 可执行
[ -s file ]    # 文件大小大于0
[ -O file ]    # 文件所有者是当前用户
[ -G file ]    # 文件所属组是当前用户组
[ file1 -nt file2 ]  # file1 比 file2 新
[ file1 -ot file2 ]  # file1 比 file2 旧
```

### 3.5 逻辑运算符

```bash
# AND
[ condition1 ] && [ condition2 ]
[[ condition1 && condition2 ]]

# OR
[ condition1 ] || [ condition2 ]
[[ condition1 || condition2 ]]

# NOT
! [ condition ]
[[ ! condition ]]
```

### 3.6 case 语句

```bash
case $variable in
    pattern1)
        command1
        ;;
    pattern2|pattern3)
        command2
        ;;
    *)
        default_command
        ;;
esac

# 示例
case $1 in
    start)
        echo "Starting..."
        ;;
    stop)
        echo "Stopping..."
        ;;
    restart)
        echo "Restarting..."
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
        ;;
esac
```

---

## 四、循环

### 4.1 for 循环

```bash
# 基本 for
for i in 1 2 3 4 5; do
    echo $i
done

# C 风格 for
for (( i=0; i<10; i++ )); do
    echo $i
done

# 遍历文件
for file in *.txt; do
    echo $file
done

# 遍历数组
for item in "${array[@]}"; do
    echo $item
done

# seq 生成序列
for i in $(seq 1 10); do
    echo $i
done
```

### 4.2 while 循环

```bash
# 基本 while
count=1
while [ $count -le 10 ]; do
    echo $count
    ((count++))
done

# 读取文件
while IFS= read -r line; do
    echo "$line"
done < file.txt

# 无限循环
while true; do
    echo "Running..."
    sleep 1
done
```

### 4.3 until 循环

```bash
count=1
until [ $count -gt 10 ]; do
    echo $count
    ((count++))
done
```

### 4.4 循环控制

```bash
# break - 跳出循环
for i in {1..10}; do
    if [ $i -eq 5 ]; then
        break
    fi
    echo $i
done

# continue - 跳过本次循环
for i in {1..10}; do
    if [ $i -eq 5 ]; then
        continue
    fi
    echo $i
done
```

### 4.5 select 菜单

```bash
select option in "Option 1" "Option 2" "Option 3"; do
    case $option in
        "Option 1")
            echo "You selected Option 1"
            ;;
        "Option 2")
            echo "You selected Option 2"
            ;;
        "Option 3")
            echo "You selected Option 3"
            break
            ;;
        *)
            echo "Invalid option"
            ;;
    esac
done
```

---

## 五、函数

### 5.1 函数定义

```bash
# 方式1
function_name() {
    echo "Hello"
}

# 方式2
function function_name {
    echo "Hello"
}

# 调用函数
function_name
```

### 5.2 参数传递

```bash
greet() {
    echo "Hello, $1"
    echo "Argument count: $#"
    echo "All arguments: $@"
}

greet "John" "Doe"
```

### 5.3 返回值

```bash
# 返回状态码（0-255）
check_file() {
    if [ -f "$1" ]; then
        return 0
    else
        return 1
    fi
}

check_file "test.txt"
if [ $? -eq 0 ]; then
    echo "File exists"
fi

# 通过 echo 返回值
get_name() {
    echo "John"
}

name=$(get_name)
```

### 5.4 局部变量

```bash
my_function() {
    local var="local value"
    echo $var
}

my_function
echo $var  # 空
```

### 5.5 递归函数

```bash
factorial() {
    local n=$1
    if [ $n -le 1 ]; then
        echo 1
    else
        local prev=$(factorial $((n - 1)))
        echo $((n * prev))
    fi
}

result=$(factorial 5)
echo $result  # 120
```

---

## 六、数组

### 6.1 数组定义

```bash
# 索引数组
array=(value1 value2 value3)
array[0]="first"
array[1]="second"

# 关联数组（Bash 4+）
declare -A assoc_array
assoc_array[key1]="value1"
assoc_array[key2]="value2"
```

### 6.2 访问数组

```bash
# 单个元素
echo ${array[0]}

# 所有元素
echo ${array[@]}
echo ${array[*]}

# 数组长度
echo ${#array[@]}

# 索引
echo ${!array[@]}

# 切片
echo ${array[@]:1:2}  # 从索引1开始，取2个元素
```

### 6.3 数组操作

```bash
# 添加元素
array+=("new_value")

# 删除元素
unset array[1]

# 清空数组
array=()

# 遍历数组
for item in "${array[@]}"; do
    echo $item
done

# 遍历关联数组
for key in "${!assoc_array[@]}"; do
    echo "$key: ${assoc_array[$key]}"
done
```

---

## 七、字符串操作

### 7.1 字符串长度

```bash
str="Hello, World!"
echo ${#str}  # 13
```

### 7.2 子字符串

```bash
str="Hello, World!"

# 提取子串
echo ${str:7:5}    # World
echo ${str:7}      # World!

# 从末尾提取
echo ${str: -6}    # World!
```

### 7.3 字符串替换

```bash
str="Hello, World!"

# 替换第一个匹配
echo ${str/World/Universe}  # Hello, Universe!

# 替换所有匹配
echo ${str//l/L}  # HeLLo, WorLd!

# 删除前缀
echo ${str#Hello}  # , World!

# 删除后缀
echo ${str%World!}  # Hello,
```

### 7.4 大小写转换

```bash
str="Hello, World!"

# 转大写
echo ${str^^}  # HELLO, WORLD!

# 转小写
echo ${str,,}  # hello, world!

# 首字母大写
echo ${str^}  # Hello, World!
```

### 7.5 字符串连接

```bash
str1="Hello"
str2="World"
result="${str1}, ${str2}!"
echo $result  # Hello, World!
```

### 7.6 字符串分割

```bash
str="apple,banana,cherry"

# 使用 IFS 分割
IFS=',' read -ra array <<< "$str"
for item in "${array[@]}"; do
    echo $item
done
```

---

## 八、文件操作

### 8.1 读取文件

```bash
# 逐行读取
while IFS= read -r line; do
    echo "$line"
done < file.txt

# 读取到变量
content=$(cat file.txt)

# 读取到数组
mapfile -t lines < file.txt
```

### 8.2 写入文件

```bash
# 覆盖写入
echo "Hello" > file.txt

# 追加写入
echo "World" >> file.txt

# 多行写入
cat > file.txt <<EOF
Line 1
Line 2
Line 3
EOF
```

### 8.3 文件测试

```bash
# 见第三章 3.4 节
```

### 8.4 文件查找

```bash
# find 命令
find /path -name "*.txt"
find /path -type f -mtime -7  # 7天内修改的文件
find /path -size +1M          # 大于1MB的文件
find /path -exec rm {} \;     # 删除找到的文件
```

### 8.5 文件权限

```bash
# 查看权限
ls -la file.txt

# 修改权限
chmod 755 file.txt
chmod u+x file.txt
chmod go-w file.txt

# 修改所有者
chown user:group file.txt
```

---

## 九、进程管理

### 9.1 后台运行

```bash
# 后台运行命令
command &

# 查看后台任务
jobs

# 切换到前台
fg %1

# 切换到后台
bg %1
```

### 9.2 进程控制

```bash
# 查看进程
ps aux
ps -ef

# 查找进程
ps aux | grep process_name

# 终止进程
kill PID
kill -9 PID      # 强制终止
killall name     # 按名称终止

# 进程优先级
nice -n 10 command
renice -n 5 -p PID
```

### 9.3 nohup

```bash
# 忽略挂断信号
nohup command > output.log 2>&1 &

# 查看 nohup 输出
tail -f nohup.out
```

### 9.4 定时任务

```bash
# crontab 编辑
crontab -e

# crontab 格式
# ┌───────────── 分钟 (0 - 59)
# │ ┌───────────── 小时 (0 - 23)
# │ │ ┌───────────── 日 (1 - 31)
# │ │ │ ┌───────────── 月 (1 - 12)
# │ │ │ │ ┌───────────── 星期 (0 - 7)
# │ │ │ │ │
# * * * * * command

# 示例
*/5 * * * * /path/to/script.sh    # 每5分钟
0 2 * * * /path/to/backup.sh      # 每天凌晨2点
0 0 * * 0 /path/to/weekly.sh      # 每周日午夜
```

---

## 十、文本处理

### 10.1 grep

```bash
# 基本搜索
grep "pattern" file.txt

# 忽略大小写
grep -i "pattern" file.txt

# 显示行号
grep -n "pattern" file.txt

# 递归搜索
grep -r "pattern" /path

# 显示匹配行数
grep -c "pattern" file.txt

# 反向匹配
grep -v "pattern" file.txt

# 正则表达式
grep -E "pattern" file.txt
grep -P "pattern" file.txt  # Perl 正则
```

### 10.2 sed

```bash
# 替换
sed 's/old/new/g' file.txt

# 删除行
sed '5d' file.txt           # 删除第5行
sed '1,5d' file.txt         # 删除1-5行
sed '/pattern/d' file.txt   # 删除匹配行

# 插入行
sed '5i\New line' file.txt  # 在第5行前插入
sed '5a\New line' file.txt  # 在第5行后插入

# 打印特定行
sed -n '5p' file.txt        # 打印第5行
sed -n '1,5p' file.txt      # 打印1-5行
```

### 10.3 awk

```bash
# 基本用法
awk '{print $1}' file.txt          # 打印第一列
awk '{print $1, $3}' file.txt      # 打印第1和第3列

# 指定分隔符
awk -F',' '{print $1}' file.csv

# 条件过滤
awk '$1 > 10 {print $0}' file.txt

# 内置变量
awk '{print NR, $0}' file.txt      # 行号
awk '{print NF, $0}' file.txt      # 字段数

# BEGIN 和 END
awk 'BEGIN {sum=0} {sum+=$1} END {print sum}' file.txt
```

### 10.4 cut

```bash
# 按字符切割
cut -c1-5 file.txt

# 按字段切割
cut -d',' -f1 file.csv
cut -d',' -f1,3 file.csv
```

### 10.5 sort

```bash
# 排序
sort file.txt

# 逆序
sort -r file.txt

# 数值排序
sort -n file.txt

# 去重
sort -u file.txt

# 按字段排序
sort -t',' -k2 file.csv
```

### 10.6 uniq

```bash
# 去重（需要先排序）
sort file.txt | uniq

# 统计出现次数
sort file.txt | uniq -c

# 只显示重复行
sort file.txt | uniq -d

# 只显示唯一行
sort file.txt | uniq -u
```

---

## 十一、正则表达式

### 11.1 基本正则

```bash
.       # 任意字符
*       # 0或多个
+       # 1或多个（扩展正则）
?       # 0或1个（扩展正则）
^       # 行首
$       # 行尾
[]      # 字符类
[^]     # 否定字符类
()      # 分组
|       # 或
{n}     # 恰好n次
{n,}    # 至少n次
{n,m}   # n到m次
```

### 11.2 字符类

```bash
[abc]     # a, b, 或 c
[a-z]     # 小写字母
[A-Z]     # 大写字母
[0-9]     # 数字
[[:alpha:]]  # 字母
[[:digit:]]  # 数字
[[:alnum:]]  # 字母和数字
[[:space:]]  # 空白字符
```

### 11.3 示例

```bash
# 邮箱验证
grep -E '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' file.txt

# IP 地址
grep -E '^([0-9]{1,3}\.){3}[0-9]{1,3}$' file.txt

# URL
grep -E '^https?://[^\s]+$' file.txt

# 日期格式 YYYY-MM-DD
grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' file.txt
```

---

## 十二、错误处理

### 12.1 退出状态

```bash
# 检查命令是否成功
command
if [ $? -eq 0 ]; then
    echo "Success"
else
    echo "Failed"
fi

# 简写
command && echo "Success" || echo "Failed"
```

### 12.2 set 选项

```bash
# 遇到错误立即退出
set -e

# 未定义变量报错
set -u

# 管道中任一命令失败则退出
set -o pipefail

# 显示执行的命令
set -x

# 组合使用
set -euo pipefail
```

### 12.3 trap

```bash
# 捕获信号
trap 'echo "Interrupted"; exit 1' INT
trap 'echo "Terminated"; exit 1' TERM
trap 'rm -f tempfile' EXIT

# 清理函数
cleanup() {
    echo "Cleaning up..."
    rm -f tempfile
}
trap cleanup EXIT
```

### 12.4 错误处理函数

```bash
error_handler() {
    echo "Error on line $1"
    exit 1
}

trap 'error_handler $LINENO' ERR

# 自定义错误消息
die() {
    echo "Error: $1" >&2
    exit ${2:-1}
}

die "File not found" 1
```

---

## 十三、调试技巧

### 13.1 调试模式

```bash
# 启用调试
bash -x script.sh

# 脚本中启用
set -x

# 禁用调试
set +x
```

### 13.2 日志记录

```bash
# 日志级别
LOG_LEVEL="INFO"

log_debug() {
    [ "$LOG_LEVEL" = "DEBUG" ] && echo "[DEBUG] $1" >&2
}

log_info() {
    echo "[INFO] $1" >&2
}

log_error() {
    echo "[ERROR] $1" >&2
}
```

### 13.3 性能分析

```bash
# 计时
start_time=$(date +%s)
# ... commands ...
end_time=$(date +%s)
echo "Elapsed: $((end_time - start_time)) seconds"

# 使用 time 命令
time command
```

---

## 十四、常用命令

### 14.1 系统信息

```bash
uname -a           # 系统信息
hostname           # 主机名
whoami             # 当前用户
pwd                # 当前目录
df -h              # 磁盘使用
free -h            # 内存使用
top                # 进程监控
htop               # 增强版 top
```

### 14.2 网络

```bash
ping host          # 测试连接
curl URL           # HTTP 请求
wget URL           # 下载文件
ssh user@host      # SSH 连接
scp file user@host:path  # 安全复制
netstat -tuln      # 监听端口
ss -tuln           # 替代 netstat
dig domain         # DNS 查询
nslookup domain    # DNS 查询
```

### 14.3 压缩解压

```bash
tar -czf archive.tar.gz directory   # 压缩
tar -xzf archive.tar.gz             # 解压
zip -r archive.zip directory        # zip 压缩
unzip archive.zip                   # zip 解压
gzip file                           # gzip 压缩
gunzip file.gz                      # gzip 解压
```

### 14.4 包管理

```bash
# Debian/Ubuntu
apt update
apt install package
apt remove package

# CentOS/RHEL
yum install package
dnf install package

# macOS
brew install package
```

---

## 十五、最佳实践

### 15.1 代码规范

```bash
#!/bin/bash

# 始终使用 shebang
# 使用有意义的变量名
# 添加注释
# 使用函数组织代码
# 检查返回值
# 处理错误情况

set -euo pipefail

# 常量使用大写
readonly SCRIPT_NAME=$(basename "$0")
readonly VERSION="1.0"

# 函数命名
main() {
    local config_file="$1"

    if [[ ! -f "$config_file" ]]; then
        log_error "Config file not found: $config_file"
        exit 1
    }

    process_config "$config_file"
}

process_config() {
    local file="$1"
    # 处理逻辑
}

main "$@"
```

### 15.2 安全性

```bash
# 验证输入
validate_input() {
    if [[ ! "$1" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        echo "Invalid input" >&2
        exit 1
    fi
}

# 使用引号保护变量
echo "$variable"

# 避免 eval
# 使用临时文件时设置权限
temp_file=$(mktemp)
chmod 600 "$temp_file"

# 清理临时文件
trap 'rm -f "$temp_file"' EXIT
```

### 15.3 可移植性

```bash
# 使用 POSIX 兼容语法
# 避免 Bash 特有功能（如果需要跨平台）
# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

if ! command_exists curl; then
    echo "curl is required" >&2
    exit 1
fi
```

### 15.4 文档

```bash
#!/bin/bash

usage() {
    cat <<EOF
Usage: $0 [OPTIONS]

Options:
  -h, --help      Show this help message
  -v, --version   Show version
  -c, --config    Config file path
  -d, --debug     Enable debug mode

Examples:
  $0 -c config.yml
  $0 --debug -c config.yml
EOF
}

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -v|--version)
            echo "Version 1.0"
            exit 0
            ;;
        -c|--config)
            config_file="$2"
            shift 2
            ;;
        -d|--debug)
            set -x
            shift
            ;;
        *)
            echo "Unknown option: $1" >&2
            usage
            exit 1
            ;;
    esac
done
```

---

## 附录

### A. 有用的资源

- **Bash Reference Manual**: https://www.gnu.org/software/bash/manual/
- **ShellCheck**: https://www.shellcheck.net/ （静态分析工具）
- **Explain Shell**: https://explainshell.com/
- **Awesome Bash**: https://github.com/awesome-lists/awesome-bash

### B. 学习路线

```
Linux 基础 → Shell 基础 → Bash 进阶 → 脚本编写 → 系统管理 → DevOps

1. Linux 命令行基础
2. Shell 基本语法
3. 变量和控制流
4. 函数和模块化
5. 文本处理（grep/sed/awk）
6. 正则表达式
7. 进程和作业管理
8. 错误处理和调试
9. 系统管理脚本
10. 自动化和 DevOps
```

---

**祝您 Shell 编程愉快！** 🐧

如有问题，请查阅官方文档或社区论坛。
