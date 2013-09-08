---
layout: post
title: "使用 Syslinux 替换掉 Grub"
description: "自从几个前的工作机中用 Syslinux 替换掉 Grub 后，今天也将家用台式机的 Grub 用 Syslinux 替换掉了。"
keywords: "syslinux, grub"
category: Linux
tags: [Grub, Syslinux]
---
{% include JB/setup %}

自从几个月前的工作机的 Grub2 用 Syslinux 替换掉后，今天也将家用台式机也开始使用 Syslinux 了。主要是因为现在的 Grub2 配置繁琐，功能臃肿，而只是想要个功能简单的引导系统而已。

废话不多说，安装：

    emerge -av syslinux

一些说明：

- SYSLINUX - FAT 文件系统引导
- EXTLINUX - ext2/3/4 及 btrfs等文件系统引导
- PXELINUX - Network PXE bootloader
- ISOLINUX - ISO-9660 (CDROM) bootloader

<!-- more -->
对于 `/boot` 独立分区的用户，需将 `/boot` 分区设置为 **active**：

```
fdisk /dev/sda

Command (m for help): a
Partition number (1-4): 1
Command (m for help): p
 ...
   Device Boot      Start         End      Blocks   Id  System
/dev/sda1   *        2048      133119       65536   83  Linux
/dev/sda2          133120     4327423     2097152   82  Linux swap / Solaris
/dev/sda3         4327424  1953525167   974598872   83  Linux

Command (m for help): w
 ...
```

写 MBR：

    dd bs=440 conv=notrunc count=1 if=/usr/share/syslinux/mbr.bin of=/dev/sda

如果是 GPT，则：

    dd bs=440 conv=notrunc count=1 if=/usr/share/syslinux/gptmbr.bin of=/dev/sda

接下来就是引导文件安装，由于我的 **/boot** 是独立分区，且是 ext2 文件系统，所以我使用的是 extlinux。

    mount /boot
    mkdir /boot/extlinux
    extlinux --install /boot/extlinux
    ln -snf . /boot/boot

需要用到的一些模块：

    cp /usr/share/syslinux/{menu.c32,memdisk,libcom32.c32,libutil.c32} /boot/extlinux/

如果你有windows linux双系统，则再：

    cp /usr/share/syslinux/chain.c32 /boot/extlinux/

各文件系统的配置文件：

- SYSLINUX: syslinux.cfg
- EXTLINUX: extlinux.conf
- ISOLINUX: isolinux.cfg

```
touch /boot/extlinux/extlinux.conf

UI menu.c32
PROMPT 0

MENU TITLE Boot Menu
TIMEOUT 50
DEFAULT gentoo

LABEL gentoo
        MENU LABEL Gentoo Linux 3.11.0
        LINUX /boot/3.11.0-gentoo
        APPEND root=/dev/sda3 radeon.audio=1 radeon.dpm=1

LABEL gentoo-old
        MENU LABEL Gentoo Linux 3.10.10
        LINUX /boot/3.10.10-gentoo
        APPEND root=/dev/sda3
```

APPEND 指的是后面的命令接到上面 LINUX 行的后面，一般一些额外的 kernel 命令放入 APPEND 行。

如果有 windows 系统，则：

```
LABEL windows
        MENU LABEL Windows 7 Ultimate
        COM32 chain.c32
        APPEND hd0 2
```
这里我使用的是文本启动菜单，即 `UI menu.c32`，你也可以使用图形启动菜单 `UI vesamenu.c32`。

具体的用法，可以参考：[http://git.kernel.org/cgit/boot/syslinux/syslinux.git/tree/doc/menu.txt](http://git.kernel.org/cgit/boot/syslinux/syslinux.git/tree/doc/menu.txt)。

参考：

- [http://www.syslinux.org/wiki/index.php/The_Syslinux_Project](http://www.syslinux.org/wiki/index.php/The_Syslinux_Project)
- [https://wiki.gentoo.org/wiki/Syslinux](https://wiki.gentoo.org/wiki/Syslinux)