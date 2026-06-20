# Git 速查手册

> **版本**: 1.0  
> **最后更新**: 2026-06-21  
> **适用对象**: 所有开发人员、DevOps 工程师

---

## 📑 目录

- [一、基础配置](#一基础配置)
- [二、基本操作](#二基本操作)
- [三、分支管理](#三分支管理)
- [四、标签管理](#四标签管理)
- [五、远程仓库](#五远程仓库)
- [六、撤销与恢复](#六撤销与恢复)
- [七、日志与查看](#七日志与查看)
- [八、高级操作](#八高级操作)
- [九、批量删除操作](#九批量删除操作)
- [十、实用技巧](#十实用技巧)

---

## 一、基础配置

### 1.1 用户信息

```bash
# 设置全局用户名和邮箱
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 查看配置
git config --list
git config user.name
git config user.email

# 针对特定项目配置（去掉 --global）
git config user.name "Project Name"
```

### 1.2 编辑器配置

```bash
# 设置默认编辑器
git config --global core.editor "code --wait"      # VSCode
git config --global core.editor "vim"               # Vim
git config --global core.editor "nano"              # Nano

# 设置差异工具
git config --global merge.tool "meld"
git config --global diff.tool "meld"
```

### 1.3 别名配置

```bash
# 常用别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.mg merge
git config --global alias.rb rebase
git config --global alias.lg "log --oneline --graph --decorate"
git config --global alias.last "log -1 HEAD"

# 使用别名
git st      # git status
git co      # git checkout
git lg      # 美化日志
```

---

## 二、基本操作

### 2.1 初始化与克隆

```bash
# 初始化新仓库
git init
git init --bare                 # 创建裸仓库（服务器端）

# 克隆仓库
git clone <url>
git clone <url> <directory>     # 指定目录
git clone -b <branch> <url>     # 克隆特定分支
git clone --depth 1 <url>       # 浅克隆（只最近一次提交）
```

### 2.2 暂存与提交

```bash
# 查看状态
git status
git status -s                   # 简短格式

# 添加文件到暂存区
git add <file>
git add .                       # 添加所有修改
git add -p                      # 交互式添加（逐个确认）
git add -u                      # 添加已跟踪文件的修改

# 提交
git commit -m "commit message"
git commit -am "message"        # 添加并提交已跟踪文件
git commit --amend              # 修改最后一次提交
git commit --amend --no-edit    # 仅修改提交，不改消息

# 提交规范示例
git commit -m "feat: add user login"
git commit -m "fix: resolve null pointer exception"
git commit -m "docs: update README"
git commit -m "refactor: simplify auth logic"
git commit -m "test: add unit tests for API"
```

### 2.3 查看差异

```bash
# 查看未暂存的修改
git diff
git diff <file>

# 查看已暂存的修改
git diff --cached
git diff --staged

# 比较两个提交
git diff <commit1> <commit2>
git diff HEAD~2 HEAD

# 统计变化
git diff --stat
```

---

## 三、分支管理

### 3.1 分支基本操作

```bash
# 查看分支
git branch                      # 本地分支
git branch -r                   # 远程分支
git branch -a                   # 所有分支
git branch -v                   # 显示最后提交

# 创建分支
git branch <branch-name>
git branch <branch-name> <commit>   # 基于特定提交创建
git checkout -b <branch-name>       # 创建并切换

# 切换分支
git checkout <branch-name>
git switch <branch-name>            # Git 2.23+ 推荐

# 删除分支
git branch -d <branch-name>         # 安全删除（已合并）
git branch -D <branch-name>         # 强制删除（未合并）
git push origin --delete <branch>   # 删除远程分支
```

### 3.2 分支合并

```bash
# 合并分支
git merge <branch-name>
git merge --no-ff <branch-name>     # 禁用快进合并
git merge --squash <branch-name>    # 压缩提交

# 解决冲突后继续
git add .
git commit

# 中止合并
git merge --abort
```

### 3.3 变基（Rebase）

```bash
# 变基到主分支
git rebase main
git rebase -i HEAD~3                # 交互式变基（最近3次提交）

# 继续/跳过/中止变基
git rebase --continue
git rebase --skip
git rebase --abort

# 压缩提交（squash）
# 在交互式变基中，将 pick 改为 squash 或 s
```

### 3.4 分支保护与追踪

```bash
# 设置上游分支
git branch -u origin/main
git push -u origin <branch-name>

# 查看追踪关系
git branch -vv

# 拉取并合并
git pull
git pull --rebase                   # 拉取并变基
```

---

## 四、标签管理

### 4.1 创建标签

```bash
# 轻量标签
git tag v1.0.0
git tag v1.0.0 <commit>

# 附注标签（推荐）
git tag -a v1.0.0 -m "Release version 1.0.0"
git tag -a v1.0.0 <commit> -m "Message"

# 签名标签（需要 GPG）
git tag -s v1.0.0 -m "Signed release"
```

### 4.2 查看标签

```bash
# 列出所有标签
git tag
git tag -l "v1.*"                   # 过滤标签
git tag -l --sort=-version:refname  # 按版本排序

# 查看标签详情
git show v1.0.0
git tag -n1                         # 显示标签消息

# 查看标签指向的提交
git rev-parse v1.0.0
```

### 4.3 推送标签

```bash
# 推送单个标签
git push origin v1.0.0

# 推送所有标签
git push origin --tags

# 删除远程标签
git push origin --delete v1.0.0
git push origin :refs/tags/v1.0.0
```

### 4.4 删除标签

```bash
# 删除本地标签
git tag -d v1.0.0
git tag -d v1.0.0-beta.1

# 删除远程标签
git push origin --delete v1.0.0

# 批量删除本地标签
git tag -l "v1.0.*" | xargs git tag -d
git tag -l "*-beta.*" | xargs git tag -d
```

### 4.5 基于标签的操作

```bash
# 检出标签
git checkout v1.0.0
git checkout -b hotfix v1.0.0

# 比较标签
git diff v1.0.0 v2.0.0
git log v1.0.0..v2.0.0

# 基于标签创建分支
git branch release-1.0 v1.0.0
```

---

## 五、远程仓库

### 5.1 远程仓库管理

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin <url>
git remote add upstream <url>

# 重命名远程仓库
git remote rename origin github

# 删除远程仓库
git remote remove origin

# 修改远程 URL
git remote set-url origin <new-url>
```

### 5.2 推送与拉取

```bash
# 推送到远程
git push origin main
git push origin <branch>
git push -u origin <branch>         # 设置上游
git push --force                    # 强制推送（谨慎使用）
git push --force-with-lease         # 更安全的强制推送

# 从远程拉取
git fetch                           # 获取更新但不合并
git fetch origin
git fetch --all                     # 获取所有远程
git fetch --prune                   # 清理已删除的远程分支

git pull                            # 拉取并合并
git pull --rebase                   # 拉取并变基
```

### 5.3 同步 Fork 仓库

```bash
# 添加上游仓库
git remote add upstream <original-repo-url>

# 同步上游更新
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## 六、撤销与恢复

### 6.1 撤销工作区修改

```bash
# 撤销单个文件
git checkout -- <file>
git restore <file>                  # Git 2.23+

# 撤销所有修改
git checkout -- .
git restore .
```

### 6.2 撤销暂存区

```bash
# 从暂存区移除
git reset HEAD <file>
git restore --staged <file>         # Git 2.23+

# 清空暂存区
git reset HEAD
```

### 6.3 撤销提交

```bash
# 软重置（保留修改在暂存区）
git reset --soft HEAD~1

# 混合重置（保留修改在工作区，默认）
git reset HEAD~1
git reset --mixed HEAD~1

# 硬重置（丢弃所有修改，危险！）
git reset --hard HEAD~1
git reset --hard <commit>

# 撤销最后一次提交但保留修改
git reset --soft HEAD^
```

### 6.4 还原提交（Revert）

```bash
# 创建新的提交来撤销之前的提交
git revert <commit>
git revert HEAD~3..HEAD             # 撤销最近3次提交
git revert --no-commit <commit>     # 暂存更改但不提交
```

### 6.5 清理未跟踪文件

```bash
# 预览要删除的文件
git clean -n
git clean -nd                       # 包括目录

# 删除未跟踪文件
git clean -f
git clean -fd                       # 包括目录
git clean -fx                       # 包括忽略的文件
```

---

## 七、日志与查看

### 7.1 查看日志

```bash
# 基本日志
git log
git log --oneline                   # 单行显示
git log --graph                     # 图形化
git log --decorate                  # 显示引用

# 格式化日志
git log --pretty=format:"%h - %an, %ar : %s"
git log --pretty=format:"%C(yellow)%h%C(reset) - %C(green)%an%C(reset), %C(blue)%ar%C(reset) : %s"

# 限制数量
git log -n 10
git log --since="2 weeks ago"
git log --until="2024-01-01"
```

### 7.2 搜索日志

```bash
# 按作者搜索
git log --author="John"

# 按消息搜索
git log --grep="fix"
git log --grep="bug" -i             # 不区分大小写

# 按文件搜索
git log -- <file>
git log -p -- <file>                # 显示差异

# 按内容搜索
git log -S "function_name"
git log -G "regex_pattern"          # 正则搜索
```

### 7.3 查看提交详情

```bash
# 查看单次提交
git show <commit>
git show HEAD
git show HEAD~1

# 查看文件历史
git blame <file>
git blame -L 10,20 <file>           # 指定行范围

# 统计贡献
git shortlog -sn                    # 按提交数排序
git shortlog -sne                   # 包含邮箱
```

### 7.4 可视化日志

```bash
# 简洁图形日志
git log --oneline --graph --all --decorate

# 使用别名（如果已配置）
git lg

# 使用外部工具
gitk                                # GUI 工具
git log --graph --all --oneline | head -20
```

---

## 八、高级操作

### 8.1 储藏（Stash）

```bash
# 储藏当前修改
git stash
git stash save "work in progress"

# 查看储藏列表
git stash list

# 应用储藏
git stash apply                     # 应用但不删除
git stash pop                       # 应用并删除
git stash apply stash@{2}           # 应用特定储藏

# 删除储藏
git stash drop stash@{0}
git stash clear                     # 清空所有储藏

# 从储藏创建分支
git stash branch new-branch stash@{0}
```

### 8.2 Cherry-pick

```bash
# 挑选特定提交
git cherry-pick <commit>
git cherry-pick <commit1> <commit2>
git cherry-pick <start>..<end>      # 范围（不包含 start）
git cherry-pick <start>^..<end>     # 范围（包含 start）

# 选项
git cherry-pick --no-commit         # 暂存但不提交
git cherry-pick --edit              # 编辑提交消息
git cherry-pick --signoff           # 添加 Signed-off-by
```

### 8.3 子模块（Submodule）

```bash
# 添加子模块
git submodule add <url> <path>

# 初始化子模块
git submodule init
git submodule update

# 克隆含子模块的仓库
git clone --recursive <url>
git submodule update --init --recursive

# 更新子模块
git submodule update --remote
git submodule foreach git pull

# 删除子模块
git submodule deinit <path>
git rm <path>
rm -rf .git/modules/<path>
```

### 8.4 Git Hooks

```bash
# Hook 位置
.git/hooks/

# 常用 Hook
pre-commit                          # 提交前
commit-msg                          # 提交消息验证
pre-push                            # 推送前
post-merge                          # 合并后

# 启用 Hook
chmod +x .git/hooks/pre-commit

# 示例：pre-commit 检查
#!/bin/bash
# 运行 linter
npm run lint
if [ $? -ne 0 ]; then
  echo "Lint failed!"
  exit 1
fi
```

---

## 九、批量删除操作

### 9.1 批量删除本地分支

```bash
# 删除所有已合并到 main 的分支
git branch --merged main | grep -v "^\*\|main\|develop" | xargs git branch -d

# 删除所有已合并到当前分支的分支
git branch --merged | grep -v "^\*\|main\|develop" | xargs git branch -d

# 删除名称匹配的分支
git branch | grep "feature/" | xargs git branch -D
git branch | grep "hotfix-" | xargs git branch -D

# 删除超过 30 天未更新的分支
git branch -v | awk '{print $1, $NF}' | while read branch date; do
  if [[ $(date -d "$date" +%s) -lt $(date -d "30 days ago" +%s) ]]; then
    git branch -D "$branch"
  fi
done

# 删除所有本地分支（保留 main 和 develop）
git branch | grep -v "main\|develop\|^\*" | xargs git branch -D
```

### 9.2 批量删除远程分支

```bash
# 删除所有已合并的远程分支
git branch -r --merged origin/main | grep -v "main\|develop" | sed 's/origin\///' | xargs -I {} git push origin --delete {}

# 删除名称匹配的远程分支
git ls-remote --heads origin | grep "feature/" | awk '{print $2}' | sed 's/refs\/heads\///' | xargs -I {} git push origin --delete {}

# 删除过期的远程分支（需要手动确认）
git remote prune origin --dry-run     # 预览
git remote prune origin               # 执行

# 批量删除远程分支（谨慎使用！）
git branch -r | grep "origin/feature" | sed 's/origin\///' | xargs -I {} git push origin --delete {}
```

### 9.3 批量删除标签

```bash
# 删除所有本地标签
git tag -l | xargs git tag -d

# 删除所有远程标签
git tag -l | xargs -I {} git push origin --delete {}
git push origin --tags                # 先删除本地，再推送空标签

# 删除匹配模式的标签
git tag -l "v1.0.*" | xargs git tag -d
git tag -l "*-beta.*" | xargs git tag -d
git tag -l "*-rc.*" | xargs git tag -d

# 删除远程匹配标签
git tag -l "v1.0.*" | xargs -I {} git push origin --delete {}
git tag -l "*-alpha.*" | xargs -I {} git push origin --delete {}

# 保留最新 N 个标签，删除其他
git tag -l --sort=-version:refname | tail -n +4 | xargs git tag -d
git tag -l --sort=-version:refname | tail -n +4 | xargs -I {} git push origin --delete {}

# 删除特定年份的标签
git tag -l | grep "^2023-" | xargs git tag -d
git tag -l | grep "^2023-" | xargs -I {} git push origin --delete {}
```

### 9.4 批量清理操作

```bash
# 清理所有未跟踪文件和目录
git clean -fdx                        # 危险！会删除 .gitignore 中的文件

# 清理构建产物
git clean -fd -e node_modules -e dist

# 重置所有分支到远程状态
git fetch --all
git reset --hard origin/main

# 清理无效的远程追踪分支
git remote prune origin
git fetch --prune

# 清理大文件历史（需要 git-filter-repo 或 BFG）
# 安装 BFG
brew install bfg

# 删除大于 100MB 的文件
bfg --strip-blobs-bigger-than 100M <repo>

# 删除特定文件的所有历史
bfg --delete-files secret.key <repo>
```

### 9.5 安全删除最佳实践

```bash
# 1. 始终先预览
git branch --merged | grep -v "main"
git tag -l "v1.0.*"

# 2. 使用 dry-run 模式
git clean -n                          # 预览要删除的文件
git remote prune origin --dry-run     # 预览要清理的分支

# 3. 备份重要数据
git bundle create backup.bundle --all

# 4. 使用交互式删除
git branch | grep "feature" | while read branch; do
  read -p "Delete $branch? (y/n) " answer
  if [[ $answer == "y" ]]; then
    git branch -D "$branch"
  fi
done

# 5. 记录删除操作
git branch -D feature-old >> deleted-branches.log
```

### 9.6 实用批量删除脚本

#### Bash 版本

```bash
#!/bin/bash
# delete-old-branches.sh
# 删除 90 天未活动的分支

echo "查找 90 天未活动的分支..."
git fetch --prune

old_branches=$(git branch -v | awk '{print $1, $NF}' | while read branch date; do
  if [[ $(date -d "$date" +%s) -lt $(date -d "90 days ago" +%s) ]]; then
    echo "$branch"
  fi
done | grep -v "main\|develop\|^\*")

if [ -z "$old_branches" ]; then
  echo "没有发现旧分支"
  exit 0
fi

echo "以下分支将被删除："
echo "$old_branches"
read -p "确认删除？(y/n) " confirm

if [[ $confirm == "y" ]]; then
  echo "$old_branches" | xargs git branch -D
  echo "删除完成"
else
  echo "已取消"
fi
```

**使用方法**：

```bash
chmod +x delete-old-branches.sh
./delete-old-branches.sh
```

#### Python 版本

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
git-cleanup.py - Git 批量清理工具
功能：批量删除旧分支、标签，清理远程追踪
"""

import subprocess
import sys
import re
from datetime import datetime, timedelta
from typing import List, Tuple


class GitCleanup:
    def __init__(self, days_threshold: int = 90, dry_run: bool = False):
        self.days_threshold = days_threshold
        self.dry_run = dry_run
        self.protected_branches = {'main', 'master', 'develop', 'dev'}

    def run_command(self, cmd: str) -> Tuple[int, str, str]:
        """执行命令并返回结果"""
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                check=False
            )
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return 1, '', str(e)

    def get_old_branches(self) -> List[str]:
        """获取超过指定天数未更新的分支"""
        print(f"🔍 查找 {self.days_threshold} 天未活动的分支...")

        # 获取所有本地分支及其最后提交时间
        code, output, error = self.run_command('git branch -v')
        if code != 0:
            print(f"❌ 错误: {error}")
            return []

        old_branches = []
        cutoff_date = datetime.now() - timedelta(days=self.days_threshold)

        for line in output.strip().split('\n'):
            if not line.strip():
                continue

            # 解析分支信息
            match = re.match(r'^(?:\*?\s*)(\S+)\s+\S+\s+(.+)$', line)
            if not match:
                continue

            branch_name = match.group(1)
            commit_info = match.group(2)

            # 跳过受保护的分支
            if branch_name in self.protected_branches or branch_name.startswith('*'):
                continue

            # 提取日期（假设格式为 "Mon Jan 15 10:30:00 2024"）
            date_match = re.search(r'(\w{3} \w{3} \d{1,2} \d{2}:\d{2}:\d{2} \d{4})', commit_info)
            if date_match:
                try:
                    date_str = date_match.group(1)
                    branch_date = datetime.strptime(date_str, '%a %b %d %H:%M:%S %Y')

                    if branch_date < cutoff_date:
                        old_branches.append(branch_name)
                except ValueError:
                    continue

        return old_branches

    def get_merged_branches(self) -> List[str]:
        """获取已合并的分支"""
        print("🔍 查找已合并的分支...")

        code, output, error = self.run_command('git branch --merged main')
        if code != 0:
            # 尝试使用 master
            code, output, error = self.run_command('git branch --merged master')
            if code != 0:
                print(f"❌ 错误: {error}")
                return []

        branches = []
        for line in output.strip().split('\n'):
            branch = line.strip().lstrip('* ').strip()
            if branch and branch not in self.protected_branches:
                branches.append(branch)

        return branches

    def get_pattern_branches(self, pattern: str) -> List[str]:
        """获取匹配模式的分支"""
        print(f"🔍 查找匹配 '{pattern}' 的分支...")

        code, output, error = self.run_command('git branch')
        if code != 0:
            print(f"❌ 错误: {error}")
            return []

        branches = []
        for line in output.strip().split('\n'):
            branch = line.strip().lstrip('* ').strip()
            if branch and re.search(pattern, branch) and branch not in self.protected_branches:
                branches.append(branch)

        return branches

    def delete_local_branches(self, branches: List[str], force: bool = False) -> int:
        """删除本地分支"""
        if not branches:
            print("✅ 没有需要删除的分支")
            return 0

        print(f"\n📋 将删除 {len(branches)} 个本地分支:")
        for branch in branches:
            print(f"   - {branch}")

        if self.dry_run:
            print("\n⚠️  干运行模式，未实际删除")
            return len(branches)

        # 确认删除
        confirm = input("\n确认删除？(yes/no): ").strip().lower()
        if confirm not in ['yes', 'y']:
            print("❌ 已取消")
            return 0

        deleted_count = 0
        flag = '-D' if force else '-d'

        for branch in branches:
            print(f"🗑️  删除分支: {branch}")
            code, output, error = self.run_command(f'git branch {flag} {branch}')
            if code == 0:
                deleted_count += 1
            else:
                print(f"   ⚠️  失败: {error.strip()}")

        print(f"\n✅ 成功删除 {deleted_count}/{len(branches)} 个分支")
        return deleted_count

    def delete_remote_branches(self, branches: List[str]) -> int:
        """删除远程分支"""
        if not branches:
            print("✅ 没有需要删除的远程分支")
            return 0

        print(f"\n📋 将删除 {len(branches)} 个远程分支:")
        for branch in branches:
            print(f"   - origin/{branch}")

        if self.dry_run:
            print("\n⚠️  干运行模式，未实际删除")
            return len(branches)

        confirm = input("\n确认删除远程分支？(yes/no): ").strip().lower()
        if confirm not in ['yes', 'y']:
            print("❌ 已取消")
            return 0

        deleted_count = 0
        for branch in branches:
            print(f"🗑️  删除远程分支: origin/{branch}")
            code, output, error = self.run_command(f'git push origin --delete {branch}')
            if code == 0:
                deleted_count += 1
            else:
                print(f"   ⚠️  失败: {error.strip()}")

        print(f"\n✅ 成功删除 {deleted_count}/{len(branches)} 个远程分支")
        return deleted_count

    def cleanup_remote_tracking(self):
        """清理远程追踪分支"""
        print("\n🧹 清理远程追踪分支...")

        if self.dry_run:
            code, output, error = self.run_command('git remote prune origin --dry-run')
        else:
            code, output, error = self.run_command('git remote prune origin')

        if code == 0:
            if output.strip():
                print(output)
            else:
                print("✅ 没有需要清理的远程追踪分支")
        else:
            print(f"⚠️  清理失败: {error.strip()}")

    def show_stats(self):
        """显示统计信息"""
        print("\n" + "="*60)
        print("📊 Git 仓库统计")
        print("="*60)

        # 本地分支数
        code, output, _ = self.run_command('git branch | wc -l')
        if code == 0:
            print(f"本地分支: {output.strip()}")

        # 远程分支数
        code, output, _ = self.run_command('git branch -r | wc -l')
        if code == 0:
            print(f"远程分支: {output.strip()}")

        # 标签数
        code, output, _ = self.run_command('git tag | wc -l')
        if code == 0:
            print(f"标签数量: {output.strip()}")

        print("="*60)


def main():
    import argparse

    parser = argparse.ArgumentParser(description='Git 批量清理工具')
    parser.add_argument('--days', type=int, default=90, help='删除多少天未活动的分支 (默认: 90)')
    parser.add_argument('--pattern', type=str, help='删除匹配正则表达式的分支')
    parser.add_argument('--merged', action='store_true', help='删除已合并的分支')
    parser.add_argument('--remote', action='store_true', help='同时删除远程分支')
    parser.add_argument('--force', action='store_true', help='强制删除（未合并的分支）')
    parser.add_argument('--dry-run', action='store_true', help='干运行模式（不实际删除）')
    parser.add_argument('--stats', action='store_true', help='显示统计信息')

    args = parser.parse_args()

    cleanup = GitCleanup(days_threshold=args.days, dry_run=args.dry_run)

    if args.stats:
        cleanup.show_stats()
        return

    branches_to_delete = []

    if args.merged:
        branches_to_delete.extend(cleanup.get_merged_branches())

    if args.pattern:
        branches_to_delete.extend(cleanup.get_pattern_branches(args.pattern))

    if not args.merged and not args.pattern:
        # 默认删除旧分支
        branches_to_delete.extend(cleanup.get_old_branches())

    # 去重
    branches_to_delete = list(set(branches_to_delete))

    if not branches_to_delete:
        print("✅ 没有需要删除的分支")
        return

    # 删除本地分支
    cleanup.delete_local_branches(branches_to_delete, force=args.force)

    # 删除远程分支
    if args.remote:
        cleanup.delete_remote_branches(branches_to_delete)

    # 清理远程追踪
    cleanup.cleanup_remote_tracking()

    # 显示统计
    cleanup.show_stats()


if __name__ == '__main__':
    main()
```

**使用方法**：

```bash
# 安装依赖（无需额外依赖，使用 Python 标准库）
# Python 3.6+

# 查看帮助
python git-cleanup.py --help

# 删除 90 天未活动的分支（干运行）
python git-cleanup.py --dry-run

# 删除 30 天未活动的分支
python git-cleanup.py --days 30

# 删除已合并的分支
python git-cleanup.py --merged

# 删除匹配模式的分支
python git-cleanup.py --pattern "feature/.*"

# 删除旧分支并同时删除远程分支
python git-cleanup.py --days 60 --remote

# 强制删除未合并的分支
python git-cleanup.py --days 90 --force

# 显示统计信息
python git-cleanup.py --stats
```

**特性**：

- ✅ 支持多种删除策略（按时间、按模式、已合并）
- ✅ 干运行模式，安全预览
- ✅ 交互式确认，防止误删
- ✅ 自动跳过受保护分支
- ✅ 支持删除远程分支
- ✅ 详细的统计信息
- ✅ 跨平台支持（Windows/macOS/Linux）

#### Node.js 版本

```javascript
#!/usr/bin/env node
/**
 * git-cleanup.js - Git 批量清理工具
 * 功能：批量删除旧分支、标签，清理远程追踪
 *
 * 使用方法:
 *   node git-cleanup.js [options]
 *
 * 选项:
 *   --days <number>      删除多少天未活动的分支 (默认: 90)
 *   --pattern <regex>    删除匹配正则表达式的分支
 *   --merged             删除已合并的分支
 *   --remote             同时删除远程分支
 *   --force              强制删除（未合并的分支）
 *   --dry-run            干运行模式（不实际删除）
 *   --stats              显示统计信息
 *   --help               显示帮助
 */

const { execSync, exec } = require('child_process')
const readline = require('readline')

class GitCleanup {
  constructor(options = {}) {
    this.daysThreshold = options.days || 90
    this.dryRun = options.dryRun || false
    this.protectedBranches = new Set(['main', 'master', 'develop', 'dev'])
  }

  /**
   * 执行命令
   */
  runCommand(cmd) {
    try {
      const output = execSync(cmd, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      return { success: true, output: output.trim(), error: null }
    } catch (error) {
      return { success: false, output: null, error: error.message }
    }
  }

  /**
   * 异步执行命令（用于需要交互的场景）
   */
  runCommandAsync(cmd) {
    return new Promise((resolve) => {
      exec(cmd, (error, stdout, stderr) => {
        resolve({
          success: !error,
          output: stdout ? stdout.trim() : null,
          error: error ? error.message : null,
        })
      })
    })
  }

  /**
   * 询问用户确认
   */
  askQuestion(query) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    return new Promise((resolve) => {
      rl.question(query, (answer) => {
        rl.close()
        resolve(answer.trim().toLowerCase())
      })
    })
  }

  /**
   * 获取超过指定天数未更新的分支
   */
  async getOldBranches() {
    console.log(`🔍 查找 ${this.daysThreshold} 天未活动的分支...`)

    const result = this.runCommand('git branch -v')
    if (!result.success) {
      console.error(`❌ 错误: ${result.error}`)
      return []
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.daysThreshold)

    const lines = result.output.split('\n').filter((line) => line.trim())
    const oldBranches = []

    for (const line of lines) {
      // 解析分支信息
      const match = line.match(/^(?:\*?\s*)(\S+)\s+\S+\s+(.+)$/)
      if (!match) continue

      const branchName = match[1]
      const commitInfo = match[2]

      // 跳过受保护的分支
      if (this.protectedBranches.has(branchName) || branchName.startsWith('*')) {
        continue
      }

      // 提取日期
      const dateMatch = commitInfo.match(/(\w{3} \w{3} \d{1,2} \d{2}:\d{2}:\d{2} \d{4})/)
      if (dateMatch) {
        try {
          const branchDate = new Date(dateMatch[1])
          if (branchDate < cutoffDate) {
            oldBranches.push(branchName)
          }
        } catch (e) {
          // 忽略日期解析错误
        }
      }
    }

    return oldBranches
  }

  /**
   * 获取已合并的分支
   */
  getMergedBranches() {
    console.log('🔍 查找已合并的分支...')

    let result = this.runCommand('git branch --merged main')
    if (!result.success) {
      result = this.runCommand('git branch --merged master')
      if (!result.success) {
        console.error(`❌ 错误: ${result.error}`)
        return []
      }
    }

    const branches = result.output
      .split('\n')
      .map((line) => line.trim().replace(/^\*?\s*/, ''))
      .filter((branch) => branch && !this.protectedBranches.has(branch))

    return branches
  }

  /**
   * 获取匹配模式的分支
   */
  getPatternBranches(pattern) {
    console.log(`🔍 查找匹配 '${pattern}' 的分支...`)

    const result = this.runCommand('git branch')
    if (!result.success) {
      console.error(`❌ 错误: ${result.error}`)
      return []
    }

    const regex = new RegExp(pattern)
    const branches = result.output
      .split('\n')
      .map((line) => line.trim().replace(/^\*?\s*/, ''))
      .filter((branch) => branch && regex.test(branch) && !this.protectedBranches.has(branch))

    return branches
  }

  /**
   * 删除本地分支
   */
  async deleteLocalBranches(branches, force = false) {
    if (branches.length === 0) {
      console.log('✅ 没有需要删除的分支')
      return 0
    }

    console.log(`\n📋 将删除 ${branches.length} 个本地分支:`)
    branches.forEach((branch) => console.log(`   - ${branch}`))

    if (this.dryRun) {
      console.log('\n⚠️  干运行模式，未实际删除')
      return branches.length
    }

    // 确认删除
    const confirm = await this.askQuestion('\n确认删除？(yes/no): ')
    if (confirm !== 'yes' && confirm !== 'y') {
      console.log('❌ 已取消')
      return 0
    }

    let deletedCount = 0
    const flag = force ? '-D' : '-d'

    for (const branch of branches) {
      console.log(`🗑️  删除分支: ${branch}`)
      const result = this.runCommand(`git branch ${flag} ${branch}`)
      if (result.success) {
        deletedCount++
      } else {
        console.log(`   ⚠️  失败: ${result.error}`)
      }
    }

    console.log(`\n✅ 成功删除 ${deletedCount}/${branches.length} 个分支`)
    return deletedCount
  }

  /**
   * 删除远程分支
   */
  async deleteRemoteBranches(branches) {
    if (branches.length === 0) {
      console.log('✅ 没有需要删除的远程分支')
      return 0
    }

    console.log(`\n📋 将删除 ${branches.length} 个远程分支:`)
    branches.forEach((branch) => console.log(`   - origin/${branch}`))

    if (this.dryRun) {
      console.log('\n⚠️  干运行模式，未实际删除')
      return branches.length
    }

    const confirm = await this.askQuestion('\n确认删除远程分支？(yes/no): ')
    if (confirm !== 'yes' && confirm !== 'y') {
      console.log('❌ 已取消')
      return 0
    }

    let deletedCount = 0

    for (const branch of branches) {
      console.log(`🗑️  删除远程分支: origin/${branch}`)
      const result = await this.runCommandAsync(`git push origin --delete ${branch}`)
      if (result.success) {
        deletedCount++
      } else {
        console.log(`   ⚠️  失败: ${result.error}`)
      }
    }

    console.log(`\n✅ 成功删除 ${deletedCount}/${branches.length} 个远程分支`)
    return deletedCount
  }

  /**
   * 清理远程追踪分支
   */
  cleanupRemoteTracking() {
    console.log('\n🧹 清理远程追踪分支...')

    const cmd = this.dryRun ? 'git remote prune origin --dry-run' : 'git remote prune origin'

    const result = this.runCommand(cmd)

    if (result.success) {
      if (result.output) {
        console.log(result.output)
      } else {
        console.log('✅ 没有需要清理的远程追踪分支')
      }
    } else {
      console.log(`⚠️  清理失败: ${result.error}`)
    }
  }

  /**
   * 显示统计信息
   */
  showStats() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 Git 仓库统计')
    console.log('='.repeat(60))

    const localResult = this.runCommand('git branch | wc -l')
    if (localResult.success) {
      console.log(`本地分支: ${localResult.output}`)
    }

    const remoteResult = this.runCommand('git branch -r | wc -l')
    if (remoteResult.success) {
      console.log(`远程分支: ${remoteResult.output}`)
    }

    const tagResult = this.runCommand('git tag | wc -l')
    if (tagResult.success) {
      console.log(`标签数量: ${tagResult.output}`)
    }

    console.log('='.repeat(60))
  }
}

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    days: 90,
    pattern: null,
    merged: false,
    remote: false,
    force: false,
    dryRun: false,
    stats: false,
    help: false,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--days':
        options.days = parseInt(args[++i]) || 90
        break
      case '--pattern':
        options.pattern = args[++i]
        break
      case '--merged':
        options.merged = true
        break
      case '--remote':
        options.remote = true
        break
      case '--force':
        options.force = true
        break
      case '--dry-run':
        options.dryRun = true
        break
      case '--stats':
        options.stats = true
        break
      case '--help':
        options.help = true
        break
    }
  }

  return options
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
Git 批量清理工具

用法: node git-cleanup.js [选项]

选项:
  --days <number>      删除多少天未活动的分支 (默认: 90)
  --pattern <regex>    删除匹配正则表达式的分支
  --merged             删除已合并的分支
  --remote             同时删除远程分支
  --force              强制删除（未合并的分支）
  --dry-run            干运行模式（不实际删除）
  --stats              显示统计信息
  --help               显示此帮助信息

示例:
  node git-cleanup.js --dry-run                    # 干运行预览
  node git-cleanup.js --days 30                    # 删除 30 天未活动的分支
  node git-cleanup.js --merged                     # 删除已合并的分支
  node git-cleanup.js --pattern "feature/.*"       # 删除匹配模式的分支
  node git-cleanup.js --days 60 --remote           # 删除旧分支并删除远程分支
  node git-cleanup.js --stats                      # 显示统计信息
`)
}

/**
 * 主函数
 */
async function main() {
  const options = parseArgs()

  if (options.help) {
    showHelp()
    return
  }

  const cleanup = new GitCleanup({
    days: options.days,
    dryRun: options.dryRun,
  })

  if (options.stats) {
    cleanup.showStats()
    return
  }

  let branchesToDelete = []

  if (options.merged) {
    branchesToDelete.push(...cleanup.getMergedBranches())
  }

  if (options.pattern) {
    branchesToDelete.push(...cleanup.getPatternBranches(options.pattern))
  }

  if (!options.merged && !options.pattern) {
    // 默认删除旧分支
    branchesToDelete.push(...(await cleanup.getOldBranches()))
  }

  // 去重
  branchesToDelete = [...new Set(branchesToDelete)]

  if (branchesToDelete.length === 0) {
    console.log('✅ 没有需要删除的分支')
    return
  }

  // 删除本地分支
  await cleanup.deleteLocalBranches(branchesToDelete, options.force)

  // 删除远程分支
  if (options.remote) {
    await cleanup.deleteRemoteBranches(branchesToDelete)
  }

  // 清理远程追踪
  cleanup.cleanupRemoteTracking()

  // 显示统计
  cleanup.showStats()
}

// 运行主函数
main().catch((error) => {
  console.error('❌ 发生错误:', error)
  process.exit(1)
})
```

**使用方法**：

```bash
# 查看帮助
node git-cleanup.js --help

# 删除 90 天未活动的分支（干运行）
node git-cleanup.js --dry-run

# 删除 30 天未活动的分支
node git-cleanup.js --days 30

# 删除已合并的分支
node git-cleanup.js --merged

# 删除匹配模式的分支
node git-cleanup.js --pattern "feature/.*"

# 删除旧分支并同时删除远程分支
node git-cleanup.js --days 60 --remote

# 强制删除未合并的分支
node git-cleanup.js --days 90 --force

# 显示统计信息
node git-cleanup.js --stats
```

**特性**：

- ✅ 基于 Node.js，跨平台支持
- ✅ 支持多种删除策略
- ✅ 干运行模式，安全预览
- ✅ 交互式确认
- ✅ 异步执行，性能更好
- ✅ 详细的错误处理
- ✅ 可直接作为 CLI 工具使用
- ✅ 无需额外依赖（使用 Node.js 标准库）

**安装为全局命令（可选）**：

```bash
# 创建符号链接
ln -s $(pwd)/git-cleanup.js /usr/local/bin/git-cleanup

# 或者在 package.json 中添加 bin 字段后全局安装
npm install -g .

# 然后可以直接使用
git-cleanup --days 90 --dry-run
```

---

## 十、实用技巧

### 10.1 快速修复

```bash
# 修正最后一次提交的消息
git commit --amend -m "new message"

# 添加遗漏的文件到最后一次提交
git add forgotten-file.txt
git commit --amend --no-edit

# 拆分最后一次提交
git reset HEAD~1
git add -p
git commit -m "first part"
git add -p
git commit -m "second part"
```

### 10.2 查找问题

```bash
# 二分查找引入 bug 的提交
git bisect start
git bisect bad                      # 当前版本有问题
git bisect good v1.0.0              # v1.0.0 是好的
# Git 会自动检出中间版本，测试后标记 good/bad
git bisect reset                    # 结束查找

# 查找修改了特定文件的提交
git log --follow -- <file>

# 查找删除了某行代码的提交
git log -S "deleted_code" --source --all
```

### 10.3 工作效率

```bash
# 快速切换到上一个分支
git checkout -

# 查看即将推送的内容
git log @{u}..HEAD

# 查看两个分支的差异
git diff main..feature

# 创建临时提交保存工作
git stash push -m "WIP: working on feature"

# 快速查看某个文件的历史版本
git show HEAD~3:path/to/file.txt
```

### 10.4 协作技巧

```bash
# 基于他人分支创建新分支
git checkout -b my-feature origin/someone-else-branch

# 更新 PR/MR 分支
git fetch origin pull/123/head:pr-123
git checkout pr-123

# 重新基于最新 main
git fetch origin
git rebase origin/main

# 整理提交历史后再推送
git rebase -i origin/main
git push --force-with-lease
```

### 10.5 Git 配置优化

```bash
# .gitconfig 示例
[core]
    editor = code --wait
    autocrlf = input

[pull]
    rebase = true

[push]
    default = current
    followTags = true

[branch]
    autosetuprebase = always

[merge]
    conflictstyle = diff3

[diff]
    tool = meld

[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    mg = merge
    rb = rebase
    lg = log --oneline --graph --decorate
    last = log -1 HEAD
    unstage = reset HEAD --
    undo = reset --soft HEAD~1
```

### 10.6 常见问题解决

```bash
# 解决 detached HEAD
git checkout -b temp-branch
git checkout main
git merge temp-branch
git branch -d temp-branch

# 修复错误的合并
git reset --hard HEAD~1
# 或者
git merge --abort

# 清理大的提交历史
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 恢复删除的分支
git reflog
git branch recovered-branch <commit-hash>

# 修复权限问题
git config core.fileMode false
```

---

## 附录：Git 命令速查表

### 常用命令对照

| 操作   | 命令                       |
| ------ | -------------------------- |
| 初始化 | `git init`                 |
| 克隆   | `git clone <url>`          |
| 状态   | `git status`               |
| 添加   | `git add <file>`           |
| 提交   | `git commit -m "msg"`      |
| 推送   | `git push origin <branch>` |
| 拉取   | `git pull`                 |
| 分支   | `git branch`               |
| 切换   | `git checkout <branch>`    |
| 合并   | `git merge <branch>`       |
| 标签   | `git tag -a v1.0 -m "msg"` |
| 日志   | `git log --oneline`        |
| 差异   | `git diff`                 |
| 储藏   | `git stash`                |
| 重置   | `git reset --hard HEAD~1`  |
| 还原   | `git revert <commit>`      |

### 批量删除命令总结

```bash
# 本地分支
git branch --merged | grep -v "main" | xargs git branch -d

# 远程分支
git branch -r --merged origin/main | sed 's/origin\///' | xargs -I {} git push origin --delete {}

# 本地标签
git tag -l "pattern" | xargs git tag -d

# 远程标签
git tag -l "pattern" | xargs -I {} git push origin --delete {}

# 清理远程追踪
git remote prune origin
```

---

**提示**：批量删除操作具有破坏性，执行前务必确认并使用 `--dry-run` 或预览命令检查将要删除的内容。建议定期备份重要仓库。
