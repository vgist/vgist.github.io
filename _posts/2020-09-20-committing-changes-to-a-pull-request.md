---
layout: post
title: "在GitHub 上对他人发起的 Pull Request 做一些修改"
category: Linux
tags: [GitHub, CLI]
---


为了保持贡献者的积极性，一般而言，偏向于合并贡献者的 pr，但是，有些 pr 在合并之前，其实需要一些小修改。

我们可以直接在 github 的 pr 上，给他们提一些小建议，引导对方去做修改。我们也可以直接对他们的 pr 做修改，同时向贡献者说明情况，获得他们的谅解，尽管这其实是在贡献者发起 pr 时的默认同意选项。

这一切的前提是，你是项目主，或拥有项目的 commit 权限。

<!-- more -->

假设你已经在本地拥有项目的克隆。那么首先需要在本地将贡献者的 fork 仓库加入远程列表中。

    git remote add contributor https://github.com/contributor/repo.git

现在，你有了两个远程地址，**origin** 和 **contributor**。你可以通过 `git remote -v` 来获得已经加入成功的确认。

获取贡献者仓库，并切换到贡献者做提交的那个分支，譬如 fix-xxx 到本地的 contributor-fix-xxx 分支

    git fetch contributor
    git checkout -b contributor-fix-xxx contributor/fix-xxx

或者，获取 pr 到本地分支 contributor-fix-xxx 上，并切换

    git pull origin pull/number/head:contributor-fix-xxx
    git checkout contributor-fix-xxx

然后，在本地做出你的修改提交后，推送到贡献者仓库的对应分支中

    git commit -m 'fix xxx'
    git push contributor contributor-fix-xxx:fix-xxx

如此，你做的提交就会出现在 pr 页。

注：`:` 在 pull 和 push 时的不同用法

    git pull origin remote-branch:local-branch
    git push origin local-branch:remote-branch

参考：

- [Committing changes to a pull request branch created from a fork](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/committing-changes-to-a-pull-request-branch-created-from-a-fork)
- [How to modify someone else's Github pull request?](https://stackoverflow.com/questions/44030176/how-to-modify-someone-elses-github-pull-request)
