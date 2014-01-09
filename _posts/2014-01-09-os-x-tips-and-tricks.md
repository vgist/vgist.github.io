---
layout: post
title: "OS X 的一些技巧汇总"
description: "刚上手 OS X，习惯正在慢慢培养中，下面记录一些使用过程中的小技巧"
keywords: "os x, 技巧"
category: "Mac"
tags: [Tips]
---
{% include JB/setup %}

刚上手 OS X，习惯正在慢慢培养中，下面记录一些使用过程中的小技巧，不断补充

#### 显示和隐藏

##### 显示和隐藏系统文件

    defaults write com.apple.finder AppleShowAllFiles YES/NO

##### 显示和隐藏普通文件

    chflags hidden/nohidden file or directory

#### GoAgent

[OS X 上使用 GoAgent](/mac/2013-12/use-goagent-on-os-x.html)

<!-- more -->
#### 开源软件

可以通过 [MacPorts](http://www.macports.org)、[HomeBrew](/mac/2013-12/how-to-install-and-use-homebrew.html) 等包管理工具来使用开源软件。

譬如[《OS X 上安装 Nginx + PHP-FPM + MariaDB》](/mac/2014-01/install-nginx-php-fpm-mysql-on-os-x.html)

#### 重启 Finder

    killall Finder

或者可以按下 Option 键的同事，右键 Dock 栏上的 Finder 选择重启即可。

Option 键，顾名思义，具体选项的键，譬如按住 Option 键后，点击无线图标，则可以显示具体的无线网络状况。

#### 关掉调节音量时的提示声

按住 Shift 键再调节音量，即可临时静音调节
