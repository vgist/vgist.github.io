---
layout: post
title: "Docker 中运行 OpenWrt"
---

在尝试过各种 x86/arm 路由，各种开发版，各种盒子。一圈下来，最后还是回到 OneCloud (玩客云)刷 Armbian，其内安装 Docker 跑 OpenWrt 作旁路网关为最终方案（已弃用该方案，转而使用 armbian + nftables + xxx）。

作为家用，性能足够，价格也足够便宜，到写这篇文章时，海鲜市场的价格大概 30 块左右包邮。

如何短接触点刷机，如何刷 Armbian， 略过不表。这篇文章只是用来记录，在 Armbian (Debian) 下将 OpenWrt 运行起来的流水账。


### 安装 Docker

完全照着 Docker 官方文档来，只不过在最后镜像这一块替换成国内的源。

卸载掉 Debian 社区版 Docker

    for pkg in docker.io docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove $pkg; done

添加 Docker 的官方 GPG key:

    sudo apt-get update
    sudo apt-get install ca-certificates curl
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

添加 apt 源，这里我换成了国内上交大的源

    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
    https://mirror.sjtu.edu.cn/docker-ce/linux/debian \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update

接下来安装 Docker

    sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo docker info

我需要打开 Docker IPv6，以及替换 Docker 镜像源为国内上交大源。编辑文件 /etc/docker/daemon.json，没有的话创建它。

    {
        "experimental": true,
        "ip6tables": true,
        "registry-mirrors": [
            "https://docker.mirrors.sjtug.sjtu.edu.cn"
        ]
    }

重启下服务

    sudo systemctl daemon-reload && sudo systemctl restart docker.service

至此，Docker 准备工作完成。

#### IPv6 转发

内核参数也需要打开 IPv6 的转发

临时生效

    for nic in default eth0 all; do sudo sysctl -w net.ipv6.conf.$nic.forwarding=1; sudo sysctl -w net.ipv6.conf.$nic.accept_ra=2; done

持久生效，编辑 /etc/sysctl.conf

    ...
    net.ipv6.conf.default.forwarding = 1
    net.ipv6.conf.all.forwarding = 1
    # Setting accept_ra to 2 allows RAs to be accepted even when forwarding = 1.
    net.ipv6.conf.default.accept_ra = 2
    net.ipv6.conf.all.accept_ra = 2
    ...


### NIC promiscuous 模式

临时打开的方式

    sudo ip link set dev eth0 promisc on

永久打开的方式，如果你的网络管理器为 NetworkManager 的话，编辑 /etc/NetworkManager/dispatcher.d/50-promisc

    #!/usr/bin/env bash
    #
    case "$2" in
        up)
            if [[ "$1" = "eth0" ]] || [[ "$1" = "eth1" ]]; then
            ip link set dev $1 promisc on
            fi
            ;;
    esac

加上可执行权限

    sudo chmod +x /etc/NetworkManager/dispatcher.d/50-promisc

systemd 管理网络的可以看这里：[打开网卡的 promiscuous 模式]({% post_url 2023-02-18-enable-promiscuous-mode-on-nics %})

至此，环境配置工作完成。

### 制作镜像

直接去 github 上以 **onecloud openwrt** 为关键词去搜索，总是会找到你心仪的固件，如果没有，那就自己编译一个吧，这里略过不表。这里默认你已经下载到固件，名为 openwrt-meson-meson8b-thunder-onecloud-ext4-sdcard.img.gz

#### 挂载 img

    gzip -d openwrt-meson-meson8b-thunder-onecloud-ext4-sdcard.img.gz
    sudo losetup -fP openwrt-meson-meson8b-thunder-onecloud-ext4-sdcard.img
    # 确认下是哪个 loop 设备
    sudo losetup -a
    # 譬如是loop0，准备挂载吧
    sudo mkdir -p /mnt/img; sudo mount /dev/loop0p2 /mnt/img

#### 复制，打包 rootfs

    sudo mkdir -p /mnt/openwrt; sudo cp -rpf /mnt/img/* /mnt/openwrt/
    sudo tar cvf /mnt/rootfs.tar -C /mnt/openwrt .

#### 导入 Docker 镜像

    sudo docker import /mnt/rootfs.tar openwrt:onecloud
    sudo docker images -a

#### 收尾

最后终归要分离挂载与loop

    sudo umount /mnt/img
    sudo losetup -d /dev/loop0

至此，镜像已经准备好。

### 容器测试

#### 容器网络

下面终于开始进入最终环节了，让我们先创建个 macvlan 网络，这里我打开 ipv6 支持

    sudo docker network create -d macvlan --subnet=192.168.1.0/24 --gateway=192.168.1.1 --ipv6 --subnet=fd00::/80 -o parent=eth0 openwrt_macvlan

可以查看是否创建正确

    sudo docker network inspect openwrt_macvlan

#### 创建容器

    sudo docker run -d --restart=on-failure:3 --name openwrt --network openwrt_macvlan --cap-add=NET_ADMIN --device=/dev/net/tun openwrt:onecloud /sbin/init

有些固件，带某功能的，可能需要 privileged 模式

    sudo docker run -d --restart=on-failure:3 --name openwrt --network openwrt_macvlan --privileged --device=/dev/net/tun openwrt:onecloud /sbin/init

#### 容器设置

根据固件获取 ip 方式的不同，需要进容器做一些设置，譬如 IPv4 IPv6。

先 attach 容器

    sudo docker exec -it openwrt sh

然后编辑容器内的 /etc/config/network

    ...
    config interface 'lan'
    	option device 'eth0'
    	option proto 'static'
    	option ipaddr '192.168.1.200'
    	option netmask '255.255.255.0'
    	option gateway '192.168.1.1'
    	list dns '119.29.29.29'
    	list dns '223.5.5.5'
    	option delegate '0'
    ...
    config interface 'wan6'
    	option proto 'dhcpv6'
    	option device 'eth0'
    	option reqaddress 'try'
    	option reqprefix 'no'

随后可以打开网页控制台，做进一步设置。

#### docker compose

你也可以用 docker compose 方式，创建 docker-compose.yml，这样前面可以不用手动创建网络，与运行容器了。

    services:
        openwrt:
            image: openwrt:onecloud
            container_name: openwrt
            hostname: openwrt
            networks:
                openwrt_macvlan:
    networks:
        openwrt_macvlan:
            driver: macvlan
            driver_opts:
                parent: eth0
            enable_ipv6: true
            ipam:
                driver: default
                config:
                    - subnet: 192.168.1.0/24
                      gateway: 192.168.1.1
                    - subnet: fd00::/80

如果想使用前面手动创建的网络，那么可以这样

    services:
        openwrt:
            image: openwrt:onecloud
            container_name: openwrt
            hostname: openwrt
            networks:
                external:
    networks:
        external:
            name: openwrt_macvlan
            external: true

运行一下看看

    sudo docker compose up -d

#### 保存容器

稳定几天后，为了下一次不再重复设置，将当前的容器存储为镜像

    sudo docker ps -a
    sudo docker commit xxxxxxxxxxxx openwrt:onecloud

#### 备份镜像

    sudo docker save openwrt:onecloud -o rootfs-onecloud.tar

参考：

- <https://docs.docker.com/engine/install/debian/>
- <https://docs.docker.com/config/daemon/ipv6/>
- <https://openwrt.org/docs/guide-user/virtualization/docker_openwrt_image>
