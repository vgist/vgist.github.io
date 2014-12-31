---
layout: post
title: "CentOS 7 记录"
description: "几个 vps 逐步的升级到 CentOS 7，老是忘记一些配置，于是动手纪录下。"
keywords: "centos, nginx, php-fpm, mariadb"
category: Linux
tags: [CentOS]
---

几个 vps 逐步的升级到 CentOS 7，老是忘记一些配置，于是动手纪录下。

#### 必要工具

    yum update
    yum install wget unzip bzip2 vim

#### 主机名

    hostname yourdomain

<!-- more -->
#### adduser

不喜 root ssh，于是添加一个用户，因为用得到 sudo，故再添加到 wheel 组

    useradd -m -G users,wheel -G havanna
    passwd havanna

#### ssh

调整 sshd 服务，采用 key 登陆

    vim /etc/ssh/sshd_config

    ......
    Protocol 2
    PasswordAuthentication no
    ChallengeResponseAuthentication no
    PermitRootLogin no
    Port yourport
    AllowUsers havanna

至 **/home/havanna**

    mkdir .ssh
    chown havanna:havanna -R .ssh
    chmod 700 .ssh

上传你的 **pub key** 至 **/home/havanna/.ssh** 目录，改名为 **authorized_keys** 并修改权限

    chown havanna:havanna /home/havanna/authorized_keys
    chmod 600 /home/havanna/authorized_keys

然后重启下 sshd 服务

    systemctl restart sshd

#### Timezone

    timedatectl set-timezone Asia/Shanghai

查看时区

    timedatectl

#### Nginx

    rpm -ivh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm
    yum install nginx

#### php-fpm

    yum install php-fpm php-gd php-mbstring php-xml php-mysql

如需要 **php-mcrypt**、**php-pecl-apcu** 则需要 epel 源

    rpm -ivh http://dl.fedoraproject.org/pub/epel/7/x86_64/e/epel-release-7-5.noarch.rpm
    yum install php-mcrypt php-pecl-apcu

#### MariaDB

    yum install mariadb-server
    systemctl start mariadb
    mysql_secure_installation           # 初始化

源里的版本较老，可以安装上游版本

    vim /etc/yum.repos.d/MariaDB.repo
    ......
    [Mariadb]
    name = MariaDB
    baseurl = http://yum.mariadb.org/10.1/centos7-amd64
    gpgkey = http://yum.mariadb.org/RPM-GPG-KEY-MariaDB
    gpgcheck = 1
    ......
    yum install MariaDB-server

