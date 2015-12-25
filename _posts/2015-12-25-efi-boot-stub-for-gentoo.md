---
layout: post
title: "Gentoo 不使用引导程序来启动 EFI kernel"
category: Linux
tags: [EFI]
---

前几天，将所有的系统硬盘全部换成 GPT，于是研究了下 (U)EFI 相关的知识点，从而获知，原来在 (U)EFI 下，完全可以扔掉 Grub、Syslinux 等引导程序了。

实际上就是将引导参数编入内核，通过主板 (U)EFI 固件来直接启动内核，而开机启动项则可以通过 efibootmgr 命令来设置。为了让主板 (U)EFI 直接启动内核，需要一些内核参数。

#### Kernel Config

｀｀｀
Processor type and features  --->
    [*] EFI runtime service support
    [*]   EFI stub support
    [*]   EFI mixed-mode support
    [*] Built-in kernel command line
    (root=PARTUUID=B91236D2-25B4-4763-875B-A9C52A67957C ro init=/usr/lib/systemd/systemd quiet)
    [*] Built-in command line overrides boot loader arguments
｀｀｀

<!-- more -->
```
Firmware Drivers  --->
    <*> EFI Variable Support via sysfs
```

```
Device Drivers --->
    Graphics support --->
        <*> Support for frame buffer devices --->
        [*] EFI-based Framebuffer Support
```

```
File systems --->
    Pseudo filesystems --->
        -*- /proc file system support
        [*] /proc/kcore support
        [*] Tmpfs virtual memory file system support (former shm fs)
        [*] Tmpfs POSIX Access Control Lists
        -*- Tmpfs extended attributes
        [*] HugeTLB file system support
        <*> Userspace-driven configuration filesystem
```

注意 `root=PARTUUID=?` ，可以在 `/dev/disk/by-partuuid` 获取你根分区所在：

```
ls -l /dev/disk/by-partuuid
```

此外，如下也检查下：

```
CONFIG_BLK_DEV_INITRD=y
CONFIG_INITRAMFS_SOURCE=""
CONFIG_RD_GZIP=y
CONFIG_RD_BZIP2=y
CONFIG_RD_LZMA=y
CONFIG_RD_XZ=y
CONFIG_RD_LZO=y
CONFIG_RD_LZ4=y
```

随后，`make && make modules_install` 出一个新的内核。

#### EFI edit

接下来，将你硬盘 EFI 分区挂载到 `/boot` 上，因为我的是双系统，直接就使用了 Windows 10 的 EFI 分区。

```
mount /dev/sda2 /boot
ls /boot/EFI
BOOT Microsoft
```

我们给 Gentoo 也建个文件夹，并将内核拷贝入其中（现在没人还在 32 位系统下了吧？）

```
mkdir /boot/EFI/gentoo
cp /usr/src/linux/arch/x86_64/arch/boot/bzImage /boot/EFI/gentoo/gentoo.efi
```

##### efibootmgr

最后通过 efibootmgr 来调整下主板 (U)EFI 固件，添加 Gentoo 的启动项，efibootmgr 并非是一个引导器，只是一个调整主板 (U)EFI 固件的工具，类似的工具很多，譬如 Windows 下的 EasyUEFI。

```
efibootmgr -c -d /dev/sda -p 2 -L "Gentoo Linux" -l "\EFI\gentoo\gentoo.efi"
```

通过 `efibootmgr -v` 来确认下，是否添加进去了，详细的用法可以通过 `efibootmgr --help` 来查看。

##### efi shell

当然，你也可以直接在 efi shell 下添加，在你进入 efi shell 后：

Shell> bcfg boot dump -v
Shell> bcfg boot add 3 fs0:\EFI\gentoo\gentoo.efi "Gentoo Linux"

参考：
- <https://wiki.gentoo.org/wiki/EFI_stub_kernel>
- <https://wiki.archlinux.org/index.php/Unified_Extensible_Firmware_Interface>