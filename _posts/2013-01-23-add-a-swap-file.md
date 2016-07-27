---
layout: post
title: "制作 swap 文件"
category: Linux
tags: [Swap]
---

在现在内存大白菜的时代，实在是没有必要单独拿个“分区”给 swap 用，如果文件交换不是太频繁的话，就创建一个 swap 文件来替代吧。

譬如我们要制作一个 512M 的 swap 文件（其实觉得 512M 也觉得大了点，具体大小自己掌握）

    dd if=/dev/zero of=/swap bs=1M count=512

![dd swap](//cdn.09hd.com/images/2013/01/swap-dd.png "dd swap")

<!-- more -->

神马意思呢，意思是用 0 填充 swap 文件，块大小设定为 1M，总共创建 512 块，也就是 512M。

有时我们认为此种方法创建大文件速度太慢，因此大部分使用如下方式来创建稀疏文件。

    fallocate -l 512M /swap

其次设置正确的权限，并使用 `mkswap` 命令把这个文件制作成 swap

    chmod 600 /swap
    mkswap /swap

![make swap](//cdn.09hd.com/images/2013/01/swap-mk.png "make swap")

最后使之生效

    swapon /swap

![swapon](//cdn.09hd.com/images/2013/01/swap-on.png "swapon")

如果想开机即生效，那么就写入 `/etc/fstab` 内

    /swap	none	swap	sw	0 0

如果临时卸载掉 swap，则

    swapoff /swap

或者

    swapoff -a

性能优化方面，其实我们还是希望系统尽量使用物理内存，而不要有限使用 swap 交换文件，swappiness 参数代表内核对于交换空间的喜好，值越小代表越减少内存的交换，从而提升一些响应速度。编辑 `/etc/sysctl.conf`

    vm.swappiness=1
    vm.vfs_cache_pressure=50

