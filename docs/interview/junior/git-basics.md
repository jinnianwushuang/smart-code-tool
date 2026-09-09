---
title: "Git 基础：分支策略与协作流程 [P4-P5]"
level: "junior"
tags: ["Git", "分支", "合并", "协作"]
difficulty: "medium"
updated: "2026-09-10"
target: "P4-P5 初级工程师"
---

# Git 基础：分支策略与协作流程 [P4-P5]

> Git 是版本控制工具。掌握基本操作、分支管理和团队协作流程是开发者的必备技能。

## 核心概念（What）

### 基础操作

```bash
# 配置
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# 基本流程
git init                    # 初始化仓库
git status                  # 查看状态
git add .                   # 暂存所有修改
git add file.js             # 暂存指定文件
git commit -m "feat: 添加功能"  # 提交

# 查看历史
git log                     # 提交历史
git log --oneline           # 简洁模式
git diff                    # 未暂存的修改
git diff --staged           # 已暂存的修改

# 撤销
git checkout -- file.js     # 撤销工作区修改
git reset HEAD file.js      # 取消暂存
git reset --soft HEAD~1     # 撤销提交（保留修改）
git reset --hard HEAD~1     # 撤销提交（丢弃修改，慎用！）
```

### 分支操作

```bash
# 分支管理
git branch                  # 查看分支
git branch feature/login    # 创建分支
git checkout feature/login  # 切换分支
git checkout -b feature/login  # 创建并切换
git branch -d feature/login # 删除分支

# 现代写法（Git 2.23+）
git switch feature/login    # 切换分支
git switch -c feature/login # 创建并切换

# 合并分支
git checkout main
git merge feature/login     # 将 feature/login 合并到 main

# 变基（替代合并，保持线性历史）
git checkout feature/login
git rebase main             # 将 feature 的提交移到 main 最新之上
```

### 远程协作

```bash
# 远程操作
git remote -v               # 查看远程仓库
git clone <url>             # 克隆仓库
git pull                    # 拉取 + 合并
git push                    # 推送
git push -u origin feature/login  # 首次推送分支

# 协作流程
git fetch                   # 拉取远程更新（不合并）
git pull --rebase           # 拉取并变基（推荐）
git push origin main        # 推送到远程 main
```

### 常见分支策略

```
Git Flow（传统）：
├── main        → 生产环境代码
├── develop     → 开发主线
├── feature/*   → 功能分支
├── release/*   → 发布准备
└── hotfix/*    → 紧急修复

GitHub Flow（简化，推荐）：
├── main        → 生产环境代码
└── feature/*   → 功能分支 → PR → 合并到 main

Trunk Based（大型团队）：
├── main        → 唯一主线
└── 短生命周期分支 → 快速合并
```

---

## 常见面试题

### Q1: merge 和 rebase 的区别？

**答**：merge 保留分支历史（产生合并提交），rebase 创建线性历史（更干净）。个人分支用 rebase，公共分支用 merge。

### Q2: git pull 和 git fetch 的区别？

**答**：fetch 只下载远程更新，不合并；pull = fetch + merge。推荐 fetch 后手动 merge/rebase。

### Q3: 如何解决合并冲突？

**答**：打开冲突文件，找到 `<<<<<<<`、`=======`、`>>>>>>>` 标记，手动选择保留哪些代码，然后 `git add` + `git commit`。

---

## 延伸练习

1. 创建一个 feature 分支，开发后合并到 main
2. 模拟合并冲突并解决
3. 用 `git log --oneline --graph` 查看分支历史

---

## 参考资料

- [Git 官方文档](https://git-scm.com/doc)
- [Learn Git Branching（可视化练习）](https://learngitbranching.js.org)
