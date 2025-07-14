---
layout: post
title: "给一些设备下发不同的网关和 DNS"
---

使用旁路网关设备的同学，应该会有这种场景需求，一些设备，无法设置另外的 DNS/网关，这个时候，一般需要主路由（提供 DHCP 服务的设备） 来做设置。

#### OpenWRT

直接编辑 /etc/config/dhcp，假设你的旁路网关设备的 IP 地址为 192.168.1.10

```
...
config tag 'wall'
    option dhcp_option '3,192.168.1.10 6,192.168.1.10'

config host
    option ip '192.168.1.100'
    option mac 'A1:B2:C2:D4:E5:F6'
    option tag 'wall'
...
```

随后重启 Dnsmasq 即可

    service dnsmasq restart

#### 梅林固件

梅林的设置与 OpenWRT 略有不同，新建文件 /jffs/configs/dnsmasq.conf.add，此文件的配置项，会覆盖默认项

    mkdir -p /jffs/configs/
    touch /jffs/configs/dnsmasq.conf.add

然后对特殊设备 MAC 下发不同的网关/DNS

    dhcp-option=tag:wall,option:router,192.168.1.10
    dhcp-option=tag:wall,option:dns-server,192.168.1.10
    dhcp-mac=set:wall,A1:B2:C3:D4:E5:F6

重启 Dnsmasq

    killall dnsmasq
    rm /var/lib/misc/dnsmasq.leases
    service restart_dnsmasq

#### IPv6

现在运营商已经大面积铺开 IPv6，所以针对 IPv6 也得做一些设置。默认情况下你的设备向网关提交解析请求的时候，网关会返回 v4 和 v6 地址

我用 host 命令来查询，譬如我向光猫查询百度域名的解析地址

```
$ host www.baidu.com 192.168.1.1
Using domain server:
Name: 192.168.1.1
Address: 192.168.1.1#53
Aliases:

www.baidu.com has address 36.152.44.93
www.baidu.com has address 36.152.44.132
www.baidu.com is an alias for www.a.shifen.com.
www.a.shifen.com has IPv6 address 2409:8c20:6:1794:0:ff:b080:87f0
www.a.shifen.com has IPv6 address 2409:8c20:6:123c:0:ff:b0f6:b2d
www.baidu.com is an alias for www.a.shifen.com.
```

将 v6 地址的 DNS 留空，或设置为旁路网关设备的地址。这样设备会按照上面的配置去分别获取对应 tag 的 DNS。

梅林的话，会默认分配运营商v6 dns，需要先留空覆盖，你也可以添加旁路网关设备的 v6 link local 地址作为 DNS，编辑 /jffs/configs/dnsmasq.conf.add

    dhcp-option=lan,option6:23              # 留空运营商默认的 v6 DNS
    dhcp-option=tag:wall,option6:23,[fe80::c810:f3a1:2d2a:eff1]    # 可选

openwrt 的话，同样，留空 ipv6 DNS

    config dhcp 'lan'
        ...
        option dns_service '0'
        ...

效果：

- 普通设备，通过主路由 192.168.1.1 解析 v4 v6 地址
- tag:wall 的设备，通过 旁路设备 IP 192.168.1.10 或者其 v6 link local 地址来解析 v4 v6 地址
