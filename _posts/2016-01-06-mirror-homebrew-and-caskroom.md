---
layout: post
title: "Homebrew 与 Caskroom 的 GitCafe 镜像"
category: Mac
tags: [Homebrew, Caskroom]
---

面对抽风的网络是多么的无奈，我等只是一个守着自己一亩三分田的小农，没办法，<s>今天抽空将 Homebrew 与 Caskroom 的一部分在 gitcafe 上做了个镜像</s> （**已转至 coding，下同** ），至少不用每次 update 时在一串命令行前输入 `all_proxy=socks5://127.0.0.1:8087` 了。

事实上，就算输了 proxy 变量也还是经常抽风，这才是促使我做这件事的原因。同时感谢 Gitcafe，让我借 Gitcafe 的地盘来做公益，希望 Gitcafe 不会因此对我反感...^_^

<!-- more -->
目前只做了几个常用的镜像，如果你们恰巧也试用这几个 tap （`brew tap` 来查看），那么一起来使用吧。完全镜像 Github 地址，并设置每 20 分钟同步一次。如果下面没有你们使用的 tap，而想让我添加的话，欢迎留言。

#### Homebrew

##### homebrew

    cd /usr/local
    git remote set-url origin https://git.coding.net/have/homebrew.git

homebrew 两进制源可以使用 ustc 的

    echo 'export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.ustc.edu.cn/homebrew-bottles' >> ~/.bashrc

##### homebrew/dupes

    cd /usr/local/Library/Taps/homebrew/homebrew-dupes
    git remote set-url origin https://git.coding.net/have/homebrew-dupes.git

##### homebrew/versions

    cd /usr/local/Library/Taps/homebrew/homebrew-versions
    git remote set-url origin https://git.coding.net/have/homebrew-versions.git

##### homebrew/nginx

    cd /usr/local/Library/Taps/homebrew/homebrew-nginx
    git remote set-url origin https://git.coding.net/have/homebrew-nginx.git

##### homebrew/php

    cd /usr/local/Library/Taps/homebrew/homebrew-php
    git remote set-url origin https://git.coding.net/have/homebrew-php.git

#### Caskroom

##### caskroom/cask

    cd /usr/local/Library/Taps/caskroom/homebrew-cask
    git remote set-url origin https://git.coding.net/have/homebrew-cask.git

##### caskroom/versions

    cd /usr/local/Library/Taps/caskroom/homebrew-versions
    git remote set-url origin https://git.coding.net/have/homebrew-cask-versions.git

##### caskroom/fonts

    cd /usr/local/Library/Taps/caskroom/homebrew-fonts
    git remote set-url origin https://git.coding.net/have/homebrew-cask-fonts.git
