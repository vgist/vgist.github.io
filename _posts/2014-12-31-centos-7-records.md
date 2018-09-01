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

#### ssh

调整 sshd 服务，采用 key 登陆，编辑 **/etc/ssh/sshd_config**

    ......
    Protocol 2
    UseDNS no
    AddressFamily inet
    PermitRootLogin no
    ChallengeResponseAuthentication no
    PasswordAuthentication no
    SyslogFacility AUTHPRIV
    HostKey /etc/ssh/ssh_host_ecdsa_key
    AllowUsers test
    Port port


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

    # systemctl start tmp.mount

当然，我们也可以使用传统的方式来挂载，譬如在 /etc/fstab 中指定

    tmpfs   /tmpfs  tmpfs   size=512m   0 0

如果想要调整当前 tmpfs 的大小，可以如此操作

    # mount -o remount,size=N /tmp

#### swap

小内存，是需要 swap 的，而我习惯不论 8G 以内的内存，创建 swapfile

    # fallocate -l 64M /swap
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

#### journal

是个好东西，接管日志，统一的格式，但是呢，时间长了，几个 GB 的日志还是挺占用空间的，需要配置下

手动清理日志

    # journalctl --vacuum-time=1d
    # journalctl --vacuum-size=100M

写入配置 **/etc/systemd/journald.conf**

    SystemMaxUse=100M
