---
layout: post
title: "IPv6-only VPS 利用 WireGuard 通过双栈 VPS 来访问 IPv4"
---

最近，拿到一台 IPv6-only 的vps，流量是无限的，想着现在 IPv6 是大势所趋，所以检索了下网络，将使用方法记录下来。IPv6-only 的 vps 访问 IPv4 资源，目前大体有 2 种方法。

- dns64 + nat64
- IPv6-only VPS 到双栈 VPS 隧道

隧道的实现也有很多方法，本文介绍的是 Linux Kernel ≥ 5.6 所支持的 WireGuard。概念介绍掠过，下面是 Debian 环境的方法，其他发行版大同小异。

    apt install wireguard-tools --no-install-recommends

添加 `--no-install-recommands` 参数，是防止安装 realtime 内核，大部分人基本用不到。

进入 WireGuard 配置目录，生成公钥私钥，这一步，服务端客户端都需要操作。

    umask 077; wg genkey | tee /etc/wireguard/private.key | wg pubkey > /etc/wireguard/public.key

接下来，在服务端配置（双栈VPS），编辑 /etc/wireguard/wg0.conf

```
[Interface]
PrivateKey = 本地私钥
Address = 10.0.0.1/24
ListenPort = 51820
MTU = 1420

PostUp = nft add table inet wg_filter
PostUp = nft add chain inet wg_filter forward { type filter hook forward priority filter - 50\; }
PostUp = nft add rule inet wg_filter forward iifname "wg0" accept
PostUp = nft add chain inet wg_filter input { type filter hook input priority filter - 50\; }
PostUp = nft add rule inet wg_filter input udp dport 51820 counter accept
PostUp = nft add chain inet wg_filter postrouting { type nat hook postrouting priority srcnat\; }
PostUp = nft add rule inet wg_filter postrouting oifname "eth0" counter masquerade

PostDown = nft flush chain inet wg_filter forward
PostDown = nft flush chain inet wg_filter input
PostDown = nft flush chain inet wg_filter postrouting
PostDown = nft flush table inet wg_filter
PostDown = nft delete table inet wg_filter
# kernel >= 6.3 时，PostDown 只需要下面一条
# PostDown = nft destroy table ip wg_filter

# Client
[Peer]
PublicKey = 客户端公钥
AllowedIPs = 10.0.0.2/32
```

这里通过 nftables 创建 nat 表，这里也可以写 iptables 规则，自己转换下。端口是默认的 51820，也可以改成其他，注意服务端客户端端口一致。

MTU 的值比较重要，会直接影响到网速，这里一个简单的计算方法

- IPv4：网卡 MTU - 32 - 8 - 20
- IPv6：网卡 MTU - 32 - 8 - 40
- PPPoE：上面计算结果的 MTU - 8

即，大部分网卡 MTU 为 1500 的 vps

- IPv4 MTU = 1440
- IPv6 MTU = 1420

下面是客户端配置（IPv6-only），编辑 /etc/wireguard/wg0.conf

```
[Interface]
PrivateKey = 本地私钥
Address = 10.0.0.2/24
MTU = 1420

# 仅 IPv4 流量走 WireGuard 隧道
[Peer]
PublicKey = 服务端公钥
Endpoint = [服务端IPv6]:51820   # 服务端 ipv6:port
AllowedIPs = 0.0.0.0/0          # IPv4 的流量进隧道
PersistentKeepalive = 25
```

最后，服务端客户端都执行

    wg-quick up wg0
    systemctl enable wg-quick@wg0

最后，验证下

    curl -4 ifconfig.co
    or
    curl -Iv https://github.com
