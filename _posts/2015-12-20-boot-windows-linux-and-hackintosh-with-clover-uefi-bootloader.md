---
layout: post
title: "Clover 启动黑苹果、Windows、Linux"
category: Linux
tags: [Clover, EFI]
---

这两天花了点时间，将 windows 10 & Gentoo 所在的硬盘全部换成 gpt，然后全部由 Clover 来引导。我本机的情况是，windows 10 & Gentoo 共用一块 SSD，黑苹果单独一块 SSD。

![Clover UEFI](http://cdn.09hd.com/images/2015/12/clover.jpg)

<!-- more -->
黑苹果不动，因为本身就是 Clover 引导的，Windows 10 则用 gpt 分区并重装了系统。而 Gentoo 的引导，有些复杂，因为 Clover 貌似不能同时扫出另一块硬盘的两个系统，Clover 中只出现 Windows 10 的菜单，而不出现 Linux 菜单（不安装 Grub UEFI 的情况下）。幸好，ArchLinux wiki 上有一遍可以自定义 Clover 来出现一个 Linux 启动项。

之前安装 windows 10 的时候是自动分区的，然后磁盘压缩一个空间给 Gentoo 使用，所以，那块 SSD 上的分区是这样的：

```
/dev/sda1 			Windows Recovery
/dev/sda2 			EFI
/dev/sda3 			Nucrisift Reserved
/dev/sda4 			Windows 10
/dev/sda5 			Gentoo
```

通过 LiveUSB 启动后：

```
$ sudo su -
$ mkdir /mnt/gentoo
$ mount /dev/sda5 /mnt/gentoo
$ mkdir /mnt/gentoo/boot/efi
$ mount /dev/sda2 /mnt/gentoo/boot/efi
$ mount -t proc proc /mnt/gentoo
$ mount --rbind /sys /mnt/gentoo/sys
$ mount --rbind /dev /mnt/gentoo/dev
$ chroot /mnt/gentoo /bin/bash
$ env-update && . /etc/profile
```

成功 chroot 进 Gentoo 环境后，按照文章 [EFI 直接启动 Gentoo Stub kernel]({% post_url 2015-12-25-efi-boot-stub-for-gentoo %}) 进行生成一个 EFISTUB kernel，并拷贝到 EFI 所在分区的 `\EFI\Gentoo\gentoo.efi` 下，最后就是编辑下 Clover，适当位置添加如下：

```
<key>Theme</key>
<string>bootcamp</string>
<key>Custom</key>           # GUI 的子项，与 Theme 并列
<dict>
    <key>Entries</key>
    <array>
        <dict>
            <key>Disabled</key>
            <false/>
            <key>FullTitle</key>
            <string>Gentoo Linux</string>
            <key>Hidden</key>
            <false/>
            <key>Ignore</key>
            <false/>
            <key>Path</key>
            <string>\EFI\Gentoo\gentoo.efi</string>
            <key>Type</key>
            <string>Linux</string>
            <key>Volume</key>
            <string>EFI</string>
            <key>VolumeType</key>
            <string>Internal</string>
        </dict>
    </array>
</dict>
```

OK，基本差不多了，主板开机项多出一个 Gentoo 启动项，Clover UEFI 也能顺利识别。

参考：<https://wiki.archlinux.org/index.php/Clover>
