---
layout: post
title: "WSL 2 中安装 Gentoo"
category: Linux
tags: [Gentoo, WSL]
---

首先要启用 WSL 2 组件，打开 powershell

    PS C:\Users\yourname> Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
    PS C:\Users\yourname> Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform


重启后将 WSL 2 设置为默认

    PS C:\Users\yourname> wsl --set-default-version 2

<!-- more -->

你可能想限制 Gentoo 使用的内存，cpu 线程等，在 Windows 的用户目录 **%HOMEPATH%** 创建文件 `%HOMEPATH%\.wslconfig`

    [wsl2]
    memory=8GB
    processors=4
    swap=1G
    swapFile=%USERPROFILE%\Apps\Gentoo\swap.vhdx
    localhostForwarding=true
    EOF

接下来，去你喜欢的镜像源中下载最新的 stage3 压缩包，由于默认下载的是 tar.xz 压缩包，WSL 2 无法导入，用你熟悉的工具将 tar.xz 解压成 tar 包

打开 windows terminal 或其他的 powershell 终端，将下载的 tar 包导入到 WSL 2 中

    PS C:\Users\yourname> wsl --import Gentoo $HOME\Apps\Gentoo $HOME\Downloads\stage3-amd64-xxx.tar --version 2

前一个路径，用于存放虚拟磁盘的文件夹，后一个是你下载的 stage3 的 tar 包的路径，查看导入的结果

    PS C:\Users\yourname> wsl -l -v
      NAME      STATE           VERSION
    * Gentoo    Stopped         2

随后，即可进入 Gentoo 中

    PS C:\Users\yourname> wsl -d Gentoo

安全起见，给你的 root 上一个密码吧

    # passwd root

现在同步下你的 portage 树

    # emerge-webrsync

创建你的用户

    # useradd -G wheel,users yourname
    # password yourname

安装一个 sudo，并通过 `visudo` 来启用 wheel 用户组的权限

    # emerge -av sudo

之后，启动的时候，就可以使用如下命令进入 Gentoo

    PS C:\Users\yourname> wsl -d Gentoo -u yourname

打开注册表，编辑 `HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Lxss\{GUID}`，找到有 Gentoo 键值的 **GUID**，编辑里面的 **DefaultUid**，设置其十进制值为 1000 ( 十六进制为 03e8 )，以便开启 Gentoo 的时候，默认登陆用户为 uid=1000 的用户。

你可能想在进入 Gentoo 后自动挂载宿主机的盘符，Gentoo 中创建文件 `/etc/wsl.conf`

    [automount]
    enable = true
    root = /mnt/
    options = "metadata,umask=22,fmask=133"
    mountFsTab = true
    [user]
    default = yourname
    [network]
    generateHosts = true
    generateResolvConf = true
    [interop]
    enabled = false
    appendWindowsPath = false

顺便，/tmp 还是用 tmpfs 吧 `/etc/fstab`

    tmpfs /tmp tmpfs rw,nosuid,noatime,nodev,size=512M,mode=1777 0 1

最后退出 Gentoo，并在 powershell 中终止 Gentoo 以便 WSL 2 相关配置生效，再重新进入

    PS C:\Users\yourname> wsl --terminate Gentoo
    PS C:\Users\yourname> wsl -d Gentoo

配置好 Gentoo 后，你可能想导出备份

    PS C:\Users\yourname> wsl --shutdown
    PS C:\Users\yourname> wsl -v -l
      NAME      STATE           VERSION
    * Gentoo    Stopped         2
    PS C:\Users\yourname> wsl --export Gentoo $HOME\Downloads\Gentoo.tar

如果后期想压缩 vhdx

    PS C:\Users\yourname> wsl --shutdown
    PS C:\Users\yourname> diskpart
    DISKPART> select vdisk file="C:\Users\yourname\Apps\Gentoo\ext4.vhdx"
    DISKPART> attach vdisk readonly
    DISKPART> compact vdisk
    DISKPART> detach vdisk
    DISKPART> exit
    PS C:\Users\yourname>

想清理 vhdx 空间，需要 windows 专业版才行

    PS C:\Users\yourname> Optimize-VHD -Path C:\Users\yourname\Apps\Gentoo\ext4.vhdx -Mode Full

移动 vhdx 位置，需要先注销

    PS C:\User\yourname> wsl --unregister Gentoo

参考：

- <https://docs.microsoft.com/en-us/windows/wsl/use-custom-distro>
