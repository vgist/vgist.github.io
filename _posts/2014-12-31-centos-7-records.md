---
layout: post
title: "CentOS 7 配置记录"
category: Linux
tags: [Nginx, PHP, PHP-FPM, SQL, Tips, CentOS]
---

几个 vps 逐步的升级到 CentOS 7，老是忘记一些配置，于是动手纪录下。首先当然是更新到最新的包


    # yum update

#### hostname

    # hostname yourdomain
    # hostnamectl set-hostname yourdomain

<!-- more -->

#### Timezone

    # timedatectl set-timezone Asia/Shanghai

查看时区

    # timedatectl

#### adduser

不喜 root ssh，于是添加一个用户，因为用得到 sudo，故添加到 wheel 组

    # useradd -m -G users,wheel test
    # passwd test

#### firewall

    # systemctl start firewalld
    # systemctl enable firewalld

具体的方法可以阅读：[CentOS 7 下使用 Firewall]({% post_url 2015-01-02-using-firewalls-on-centos-7 %})，这里只添加基本的对外服务

    # firewall-cmd --permanent --zone=public --add-service=http
    # firewall-cmd --permanent --zone=public --add-service=https
    # firewall-cmd --reload

确认下

    # firewall-cmd --permanent --zone=public --list-services

#### iptables

或者，你可能仍然习惯使用 iptables，则

    # yum install iptables-services iptables

规则文件 `/etc/sysconfig/iptables`，写入内容

    *filter
    :INPUT DROP [0:0]
    :FORWARD DROP [0:0]
    :OUTPUT ACCEPT [0:0]
    -A INPUT -p icmp -m icmp --icmp-type echo-request -j ACCEPT
    -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
    -A INPUT -i lo -j ACCEPT
    -A INPUT -p tcp -m state --state NEW -m tcp --dport 28480 -j ACCEPT
    -A INPUT -p tcp -m state --state NEW -m tcp --dport 2377 -j ACCEPT
    -A INPUT -p udp -m state --state NEW -m udp --dport 4789 -j ACCEPT
    -A INPUT -p tcp -m state --state NEW -m tcp --dport 7946 -j ACCEPT
    -A INPUT -p udp -m state --state NEW -m udp --dport 7946 -j ACCEPT
    -A INPUT -p esp -j ACCEPT
    -A INPUT -m conntrack --ctstate INVALID -j DROP
    -A INPUT -j REJECT --reject-with icmp-host-prohibited
    -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
    -A FORWARD -m conntrack --ctstate INVALID -j DROP
    -A FORWARD -j REJECT --reject-with icmp-host-prohibited
    COMMIT

随后导入规则，再启用服务

    # iptables-restore < /etc/sysconfig/iptables
    # systemctl enable iptables && systemctl start iptables

#### ssh

调整 sshd 服务，采用 key 登陆，编辑 **/etc/ssh/sshd_config**

    ......
    AcceptEnv LANG LC_*

    Subsystem	sftp	/usr/lib/openssh/sftp-server

    Protocol 2
    UsePAM yes
    UseDNS no
    HostKey /etc/ssh/ssh_host_rsa_key
    HostKey /etc/ssh/ssh_host_ecdsa_key
    HostKey /etc/ssh/ssh_host_ed25519_key
    AddressFamily inet
    PermitRootLogin no
    PasswordAuthentication no
    SyslogFacility AUTHPRIV
    PubkeyAuthentication yes
    ChallengeResponseAuthentication no
    ClientAliveInterval 60
    Port port-num
    Match User user-name
        X11Forwarding no
        PermitTTY yes

至 **/home/test**

    # mkdir .ssh
    # chown test:test -R .ssh
    # chmod 700 .ssh

上传你的 **pub key** 至 **/home/test/.ssh** 目录，改名为 **authorized_keys** 并修改权限

    # chown test:test /home/test/authorized_keys
    # chmod 600 /home/test/authorized_keys

因为更改了默认的 22 端口，安装一个 selinux 工具

    # yum install policycoreutils-python
    # semanage port -a -t ssh_port_t -p tcp yourport
    # firewall-cmd --zone=public --permanent --add-port=yourport/tcp
    # firewall-cmd --zone=public --permanent --remove-service=ssh
    # firewall-cmd --reload

然后重启下 sshd 服务

    # systemctl restart sshd

确认下 sshd 服务

    # ss -alnptu | grep sshd

#### tmpfs

内存足够的话，直接将 tmpfs 挂载至 /tmp，先检查下

    # systemctl is-enabled tmp.mount

如果没有，需要手动操作下

    # systemctl enable tmp.mount && systemctl start tmp.mount

个别主机上采用的模版镜像，可能默认 mask 了服务，你可能需要先 unmask

    # systemctl unmask tmp.mount && systemctl enable tmp.mount && systemctl start tmp.mount

当然，我们也可以使用传统的方式来挂载，譬如在 /etc/fstab 中指定

    tmpfs   /tmpfs  tmpfs   size=512m   0 0

如果想要调整当前 tmpfs 的大小，可以如此操作

    # mount -o remount,size=N /tmp

#### swap

小内存，是需要 swap 的，而我习惯不论 8G 以内的内存，创建 swapfile

    # fallocate -l 64M /swap
    or
    # dd if=/dev/zero of=/swap bs=1 coun=0 seek=64M         # seek 方式来创建稀疏文件
    # chmod 600 /swap
    # mkswap /swap
    # swapon /swap

临时卸载 swap

    # swapoff /swap
    or
    # swapoff -a

最后，写入 fstab

    /swap	none	swap	sw	0 0

性能优化方面，其实我们还是希望系统尽量使用物理内存，而不要有限使用 swap 交换文件，swappiness 参数代表内核对于交换空间的喜好，值越小代表越减少内存的交换，从而提升一些响应速度。编辑 /etc/sysctl.conf

    vm.swappiness=1
    vm.vfs_cache_pressure=50

#### zram

swap 频繁交换会极大的影响主机性能，现在一般对小内存主机，使用 zram，不过 CentOS 7 并没有提供管理脚本，自己创建一个

    # touch /etc/init.d/zramswap
    # chmod +x /etc/init.d/zramswap

写入如下内容

```
#!/bin/bash

NUM_CPUS=$(nproc)
[ "$NUM_CPUS" != 0 ] || NUM_CPUS=1
NUM_DEVS=$NUM_CPUS
FACTOR=50 # percentage
TOTALRAM=$(grep MemTotal /proc/meminfo | awk ' { print $2 } ')
DISK_SIZE=$(($TOTALRAM/$NUM_CPUS*$FACTOR/100*1024))

# show supported compression algorithms: `cat /sys/block/zram*/comp_algorithm`
# select your compression algorithm, lzo is the default
# speed: lz4 > zstd > lzo
# compression: zstd > lzo > lz4
COMP_ALGORITHMS=lzo

#Defaults for vm.overcommit_memory, vm.page-cluster, vm.swappiness
OVERCOMMIT_MEMORY=0
PAGE_CLUSTER=3
SWAPPINESS=100


start() {
  [ ! -e /sys/module/zram ] && modprobe zram num_devices=$NUM_DEVS || modprobe -r zram && modprobe zram num_devices=$NUM_DEVS
  for i in /sys/block/zram*; do
    /usr/bin/echo $COMP_ALGORITHMS > ${i}/comp_algorithm;
    /usr/bin/echo $DISK_SIZE > ${i}/disksize;
  done

  for i in /dev/zram*; do
    /usr/sbin/mkswap ${i};
    /usr/sbin/swapon -d -p100 ${i};
  done

  echo 1 > /proc/sys/vm/overcommit_memory
  echo 0 > /proc/sys/vm/page-cluster
  echo 100 > /proc/sys/vm/swappiness
}

stop() {
  [ ! -e /sys/module/zram ] && exit 0

  echo $OVERCOMMIT_MEMORY > /proc/sys/vm/overcommit_memory
  echo $PAGE_CLUSTER > /proc/sys/vm/page-cluster
  echo $SWAPPINESS > /proc/sys/vm/swappiness

  for i in /dev/zram*; do
    /usr/sbin/swapoff ${i};
  done

  for i in /sys/block/zram*; do
    /usr/bin/echo 1 > ${i}/reset;
  done
  [ -e /sys/module/zram ] && modprobe -r zram
}

case $1 in
  (start|stop) "$1" ;;
esac
```

最后

    # systemctl enable zramswap
    # systemctl start zramswap
    # free -h

#### journal

是个好东西，接管日志，统一的格式，但是呢，时间长了，几个 GB 的日志还是挺占用空间的，需要配置下

手动清理日志

    # journalctl --vacuum-time=1d
    # journalctl --vacuum-size=100M

写入配置 **/etc/systemd/journald.conf**

    SystemMaxUse=100M

#### ulimits on systemd

编辑 /etc/systemd/system.conf 或 /etc/systemd/user.conf，依据 unit 文件在哪个目录。

    DefaultLimitNOFILE=51200
    DefaultLimitNPROC=51200

#### 升级 kernel ≥ 4.9

Linux Tovalds 于 2016 年 12 月 11 日发布了 Kernel 4.9 正式版本，带来了一些令人激动的特性以及一些驱动的更新。Linux 稳定内核维护者 Greg Kroah-Hartman 也早已宣布下一个长期支持版（LTS）内核将是 Linux 4.9。来自 Google 的 BBR (Bottleneck Bandwidth and RTT) TCP 拥塞控制 （congestion control） 算法也在这个版本并入了主线。为了体验 BBR TCP，迫不及待的需要将 CentOS 7 的内核升级至该版本。具体的更新可以查阅：[Linux Kernel 4.9 release notes](https://lkml.org/lkml/2016/12/11/102)。

##### 安装

现在升级内核，没有那么复杂，也无需安装第三方源，在 CentOS-7.3.1611 之后用自带 repo 的即可，只需一行命令

    # yum --enablerepo=centos-kernel update

或者编辑文件 `/etc/yum.repos.d/CentOS-x86_64-kernel.repo `，在 `[centos-kernel]` 下

    enabled=1

再更新系统

    # yum update

更新完成后重启，通过 `uname -a` 查看内核版本，譬如我的

    $ uname -a
    Linux CentOS 4.9.13-203.el7.x86_64 #1 SMP Wed Mar 08 13:39:54 EST 2017 x86_64 x86_64 x86_64 GNU/Linux

一些 grub 操作内核的相关命令，可能用得到

    awk -F\' '$1=="menuentry " {print i++ " : " $2}' /etc/grub2.cfg     # 查看 grub 中内核版本以及顺序
    grub2-editenv list      # 当前默认的启动项
    grub2-set-default N     # 设置你需要的内核版本为默认启动内核

##### 开启 BBR TCP

    echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf

重启后，首先 `uname -a` 看下内核是否切换到 4.9，然后执行下面明亮查看内核是否开启 TCP BBR：

    sysctl net.ipv4.tcp_available_congestion_control
    sysctl net.ipv4.tcp_congestion_control

查看 tcp_bbr 模块是否加载：

    lsmod | grep tcp_bbr

##### 重新生成 rescue 镜像

这一步不是必须的。

确认下 `/usr/lib/dracut/dracut.conf.d/02-rescue.conf` 中的 `dracut_rescue_image` 是否为 `yes`，然后：

    rm -f /boot/vmlinuz-0-rescue-* /boot/initramfs-0-rescue-*.img
    /etc/kernel/postinst.d/51-dracut-rescue-postinst.sh $(uname -r) /boot/vmlinuz-$(uname -r)

