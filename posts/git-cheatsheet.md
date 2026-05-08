---
title: Git 常用命令速查
date: 2026-05-08
category: 技术
tags: [Git, 工具]
---

## 基础操作

```bash
# 初始化仓库
git init

# 克隆远程仓库
git clone <url>

# 查看状态
git status

# 添加文件到暂存区
git add <file>
git add .          # 添加所有文件

# 提交
git commit -m "commit message"

# 推送
git push origin main
```

## 分支管理

```bash
# 查看分支
git branch -a

# 创建分支
git branch <name>

# 切换分支
git checkout <name>

# 创建并切换
git checkout -b <name>

# 删除分支
git branch -d <name>

# 合并分支
git merge <name>

# 变基
git rebase main
```

## 撤销与回退

```bash
# 撤销工作区改动
git checkout -- <file>

# 撤销暂存区
git reset HEAD <file>

# 回退到某个提交（保留改动）
git reset --soft HEAD~1

# 回退并丢弃改动
git reset --hard HEAD~1
```

## 常用场景

**合并多个 commit 为一个：**

```bash
git rebase -i HEAD~3
# 将后两个 pick 改为 squash
```

**暂存当前工作：**

```bash
git stash
git stash pop
```

**拉取远程分支并变基：**

```bash
git pull --rebase origin main
```

---

保持简洁，只记最常用的。
