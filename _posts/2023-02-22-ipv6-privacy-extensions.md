---
layout: post
title: "IPv6 隐私扩展"
---

DHCPv6 方式管理 IPv6 不在本文讨论之列，这篇文章主要是介绍通过 SLAAC (Stateless Address Autoconfiguration) 来生成 IPv6 后，打开 IPv6 隐私扩展。以及如何生成稳定的隐私地址。

- 隐私扩展 [RFC 4941][^1] 通过 “隐私地址” 允许出站连接使用临时的、随机生成的地址（每隔几个小时/几天刷新一次地址）。
- 稳定私有地址 [RFC 7217][^2] 允许从不透明哈希值来生成私有静态地址。

未打开 IPv6 隐私扩展前，IPv6 地址是通过设备 MAC 地址来作为 EUI64 来生成的。 方法是 IPv6 前缀 + MAC 地址(中间插入FFFE)。

譬如 IPv6 前缀 2409:11:22:33，mac地址是 44:55:66:77:88:99，那么生成的 IPv6 为 2409:11:22:33:4455:66ff:fe77:8899


这对服务器而言是无所谓的，但是对个人用户来说，有隐私方面的问题。所以我们需要打开 IPv6 隐私扩展，来生成一个随机的临时 v6 地址，且远程连接时优先选用这个临时 v6 地址。

### 一. 隐私扩展 (RFC 4941)

#### 1. 内核参数

首先将内核参数打开，尽管 systemd-networkd 默认选择不遵守内核参数。

编辑 /etc/sysctl.conf，加入如下参数

    # Enable Privacy Extensions
    net.ipv6.conf.all.use_tempaddr = 2
    net.ipv6.conf.default.use_tempaddr = 2

重启后即可生效，如果只想某个网口开启，则

    # Enable Privacy Extensions for eth1
    net.ipv6.conf.eth1.use_tempaddr = 2

同样重启生效。想要立即生效的话，打开终端，用root权限运行

    sysctl -w net.ipv6.conf.eth1.use_tempaddr=2

#### 2. NetworkManager

默认配置下，NetworkManager 会根据内核参数来决定是否开启隐私扩展。如果你已经做了内核参数哪一步，那么这里可以省略。如果不想动内核参数，那么你需要告诉 NetworkManager 来明确启用 IPv6 隐私扩展。

全局生效，编辑 /etc/NetworkManager/conf.d/v6-privacy.conf

    [connection]
    ipv6.ip6-privacy=2

单独接口生效的话，编辑对应的连接文件，在 /etc/NetworkManager/system-connections/ 下面，譬如编辑 'Wired connection 1.nmconnection' 文件

    ...
    [ipv6]
    ip6-privacy=2
    ...

#### 3. systemd-networkd

前面说过，systemd-network 的 IPv6 隐私扩展，默认选项不遵守内核参数。

>IPv6PrivacyExtensions=
>
>    Configures use of stateless temporary addresses that change over time (see RFC 4941, Privacy Extensions for Stateless Address Autoconfiguration in IPv6). Takes a boolean or the special values "prefer-public" and "kernel". When true, enables the privacy extensions and prefers temporary addresses over public addresses. When "prefer-public", enables the privacy extensions, but prefers public addresses over temporary addresses. When false, the privacy extensions remain disabled. When "kernel", the kernel's default setting will be left in place. When unspecified, the value specified in the same setting in networkd.conf(5), which defaults to "no", will be used.

如果未设置，那其默认为 no，即关闭 IPv6 隐私扩展，可用选项为 true / false / prefer-public / kernel。

 - true:            打开 IPv6 隐私扩展，优先使用临时地址
 - false:           关闭 IPv6 隐私扩展
 - prefer-public:   打开 IPv6 隐私扩展，但优先使用 Public 地址
 - kernel:          根据内核参数来决定

如果你前面没有设置过 IPv6 隐私扩展相关的内核参数，那么这里可以选择 true。否则可以选择 true / kernel。

全局模式，编辑 /etc/systemd/networkd.conf

    [network]
    ...
    IPv6PrivacyExtensions=kernel

针对单独的接口生效，编辑 /etc/systemd/network/eth0.network

    [network]
    ...
    IPv6PrivacyExtensions=kernel

### 二. 稳定的私有地址 (RFC 7217)

#### 1. 内核参数

让内核生成一个密钥

    sysctl net.ipv6.conf.wlan0.addr_gen_mode=3

内核会生成 128 位密钥，通过如下命令输出

    sysctl net.ipv6.conf.wlan0.stable_secret
    net.ipv6.conf.wlan0.stable_secret = 2f2e:bfe6:8abc:dec1:fff5:fed0:eecd:6ee3

持久化密钥，写入 /etc/sysctl.d/40-ipv6.conf

    # Enable IPv6 stable privacy mode
    net.ipv6.conf.wlan0.stable_secret = 2f2e:bfe6:8abc:dec1:fff5:fed0:eecd:6ee3
    net.ipv6.conf.wlan0.addr_gen_mode = 2

#### 2. NetworkManager

NetworkManager 无视内核参数，不过 NetworkManager 默认使用稳定的私有地址，你当然可以修改

    nmcli con modify "ProfileName" ipv6.addr-gen-mode eui64
    nmcli con modify "ProfileName" ipv6.addr-gen-mode stable-privacy

“ProfileName” 为目录 /etc/NetworkManager/system-connections/ 下面去掉后缀的文件名

#### 3. systemd-networkd

比较简单，编辑 /etc/systemd/network/wlan0.network

    [IPv6AcceptRA]
    Token=prefixstable

你也可以让你网卡的链接地址使用稳定的私有地址

    [Network]
    ...
    IPv6LinkLocalAddressGenerationMode=stable-privacy

### 三. IPv6 RA 报文

![IPv6 RA](/cdn/images/2023/02/ipv6-ra.jpg)


- M 字段：管理地址配置标识（Managed Adress Configuration）
  - M = 0，标识无状态地址分配，通过无状态协议(如ND)取得IPv6地址
  - M = 1，标识有状态地址分配，通过有状态协议(如DHCPv6)获得IPv6地址
- O 字段：其他有状态配置标识（Other Configuration）
  - O = 0，通过无状态协议(如ND)获取除地址外的其他配置信息
  - O = 1，通过有状态协议(如DHCPv6)获取除地址外的其他配置信息，如dns sip

协议规定，若 M = 1，则 O = 1，否则无意义。

M O 不同组合对应的意义

|:---:|:---|:---|
|11|Sateful DHCPv6|地址和 DNS 都从 DHCPv6 服务器取得|
|01|Stateless DHCPv6|地址使用 RA 广播的 prefix+EUI-64 计算出的接口地址，DNS 从 DHCPv6 取得|
|00|Stateless Autoconfiguration|完全的 stateless，仅地址使用 RA 广播的 prefix+EUI-64 计算出的接口地址|

参考：

- <https://developer-old.gnome.org/NetworkManager/stable/NetworkManager.conf.html>
- <https://www.freedesktop.org/software/systemd/man/latest/networkd.conf.html>
- <https://www.freedesktop.org/software/systemd/man/latest/systemd.network.html>

[^1]: [https://www.rfc-editor.org/rfc/rfc4941](https://www.rfc-editor.org/rfc/rfc4941)
[^2]: [https://www.rfc-editor.org/rfc/rfc7217](https://www.rfc-editor.org/rfc/rfc7217)
