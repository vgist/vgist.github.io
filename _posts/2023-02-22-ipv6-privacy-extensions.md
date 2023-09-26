---
layout: post
title: "IPv6 隐私扩展"
category: Linux
tags: [Network]
---

DHCPv6 方式管理 IPv6 不在本文讨论之列，这篇文章主要是介绍通过 SLAAC (Stateless Address Autoconfiguration) 来生成 IPv6 后，打开 IPv6 隐私扩展。

未打开 IPv6 隐私扩展前，SLAAC 生成的 v6 地址，其后缀可以通过一些方法算出 MAC 地址。默认 SLAAC 本身就是通过 IPv6 前缀 + MAC 地址来生成的。这对服务器而言是无所谓的，但是对个人用户来说，有隐私方面的问题。所以我们需要打开 IPv6 隐私扩展，来生成一个随机的临时 v6 地址，且远程连接时优先选用这个临时 v6 地址。

<!-- more -->

#### 一. 内核参数

首先将内核参数打开，尽管 systemd-networkd 默认选择不遵守内核参数。

编辑 `/etc/sysctl.conf`，加入如下参数

    # Enable Privacy Extensions
    net.ipv6.conf.all.use_tempaddr = 2
    net.ipv6.conf.default.use_tempaddr = 2

重启后即可生效，如果只想某个网口开启，则

    # Enable Privacy Extensions for eth1
    net.ipv6.conf.eth1.use_tempaddr = 2

同样重启生效。想要立即生效的话，打开终端，用root权限运行

    sysctl -w net.ipv6.conf.eth1.use_tempaddr=2

#### 二. NetworkManager

默认配置下，NetworkManager 会根据内核参数来决定是否开启隐私扩展。如果你已经做了内核参数哪一步，那么这里可以省略。如果不想动内核参数，那么你需要告诉 NetworkManager 来明确启用 IPv6 隐私扩展。

全局生效，编辑 **/etc/NetworkManager/conf.d/v6-privacy.conf**

    [connection]
    ipv6.ip6-privacy=2

单独接口生效的话，编辑对应的连接文件，在 **/etc/NetworkManager/system-connections/** 下面，譬如编辑 **'Wired connection 1.nmconnection'** 文件

    ...
    [ipv6]
    ip6-privacy=2
    ...

#### 三. systemd-networkd

前面说过，systemd-network 的 IPv6 隐私扩展，默认选项不遵守内核参数。

>IPv6PrivacyExtensions=
>
>    Configures use of stateless temporary addresses that change over time (see RFC 4941, Privacy Extensions for Stateless Address Autoconfiguration in IPv6). Takes a boolean or the special values "prefer-public" and "kernel". When true, enables the privacy extensions and prefers temporary addresses over public addresses. When "prefer-public", enables the privacy extensions, but prefers public addresses over temporary addresses. When false, the privacy extensions remain disabled. When "kernel", the kernel's default setting will be left in place. When unspecified, the value specified in the same setting in networkd.conf(5), which defaults to "no", will be used.

如果未设置，那其默认为 no，即关闭 IPv6 隐私扩展，可用选项为 `true | false | prefer-public | kernel`。

 - true:            打开 IPv6 隐私扩展，优先使用临时地址
 - false:           关闭 IPv6 隐私扩展
 - prefer-public:   打开 IPv6 隐私扩展，但优先使用 Public 地址
 - kernel:          根据内核参数来决定

如果你前面没有设置过 IPv6 隐私扩展相关的内核参数，那么这里可以选择 `true`。否则可以选择 `true | kernel`。

全局模式，编辑 **/etc/systemd/networkd.conf**。

    [network]
    ...
    IPv6PrivacyExtensions=kernel

针对单独的接口生效，编辑 **/etc/systemd/network/eth0.network**。

    [network]
    ...
    IPv6PrivacyExtensions=kernel

参考：

- [NetworkManager](https://developer-old.gnome.org/NetworkManager/stable/NetworkManager.conf.html)
- [networkd.conf](https://www.freedesktop.org/software/systemd/man/latest/networkd.conf.html#IPv6PrivacyExtensions=)
- [systemd.network](https://www.freedesktop.org/software/systemd/man/latest/systemd.network.html#IPv6PrivacyExtensions=)
