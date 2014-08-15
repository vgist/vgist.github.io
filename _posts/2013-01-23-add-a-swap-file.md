---
layout: post
title: "制作 swap 文件"
description: "制作 swap 文件"
keywords: swap, 文件
category: Linux
tags: [Swap]
---

在现在内存大白菜的时代，实在是没有必要单独拿个“分区”给 swap 用，如果文件交换不是太频繁的话，就创建一个 swap 文件来替代吧。

譬如我们要制作一个 512M 的 swap 文件（其实觉得 512M 也觉得大了点，具体大小自己掌握）

    dd if=/dev/zero of=/swap bs=1M count=512

![dd swap]({{ site.qiniudn }}/images/2013/01/swap-dd.png "dd swap")

<!-- more -->

神马意思呢，意思是用 0 填充 swap 文件，块大小设定为 1M，总共创建 512 块，也就是 512M。

其次使用 `mkswap` 命令把这个文件制作成 swap

    mkswap /swap

![make swap]({{ site.qiniudn }}/images/2013/01/swap-mk.png "make swap")

最后使之生效

    swapon /swap

![swapon]({{ site.qiniudn }}/images/2013/01/swap-on.png "swapon")

如果想开机即生效，那么就写入 `/etc/fstab` 内

    /swap	none	swap	sw	0 0
