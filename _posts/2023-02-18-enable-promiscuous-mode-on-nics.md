---
layout: post
title: "打开网卡的 promiscuous 模式"
category: Linux
tags: [Network]
---

如果需要桥接网络设备，或者尝试 docker 的 macvlan 网络，那么势必要打开网卡的 promiscuous 模式。

首先，最近的 linux 发行版都支持用命令行临时打开。

    sudo ip link set dev eth0 promisc on

只是绝大多数时候我们需要永久打开 promiscuous 模式。那么我们可能根据自己系统选择合适的方法。

<!-- more -->

#### 一. NetworkManager

如果你的网络管理操作是 **NetworkManager**，那么可以试试 NetworkManager-dispatcher，根据你自己的发行版，自行安装 NetworkManager-dispatcher，随后，创建 `/etc/NetworkManager/dispatcher.d/60-promisc`，根据你自己的网卡名，填入如下内容：

    #! /usr/bin/env bash
    case "$2" in
        up)
            if [[ "$1" = "eth0" ]] || [[ "$1" = "eth1" ]]; then
                ip link set dev $1 promisc on
            fi
            ;;
    esac

随后，添加执行权限

    sudo chmod +x /etc/NetworkManager/dispatcher.d/60-promisc

#### 二. systemd

创建一个 systemd service 在 network-online.target 后开始运行，创建文件 `/etc/systemd/system/nics-promisc.service`

    [Unit]
    Description=enable promiscuous mode after network online
    After=network-online.target

    [Service]
    Type=oneshot
    ExecStart=/usr/sbin/ip link set dev eth0 promisc on
    ExecStart=/usr/sbin/ip link set dev eth1 promisc on
    TimeoutStartSec=0
    RemainAfterExit=yes

    [Install]
    WantedBy=default.target

#### 三. systemd-networkd

有些朋友使用 systemd-networkd 来管理网络。编辑 `/etc/systemd/network/eth0.network`，根据你自己的设备来

    [Match]
    Name=eth0

    [Link]
    Promiscuous=true

参考：

- [Persistent promiscuous mode in Debian 12](https://superuser.com/questions/1804774/persistent-promiscuous-mode-in-debian-12)
- [systemd.network](https://www.freedesktop.org/software/systemd/man/latest/systemd.network.html)
