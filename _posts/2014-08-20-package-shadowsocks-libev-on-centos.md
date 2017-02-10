---
layout: post
title: "CentOS 下打包 shadowsocks-libev"
category: Linux
tags: [Packager, Shadowsocks, CentOS]
---

为什么要打 rpm 包，因为不打包就要自己去编译，特讨厌在 CentOS 上 blablabla... 的一篇又一篇自编译教程，一点都不环保，而且一点都不利于扩散嘛。

#### 一、准备

rpm 打包需要特定的目录结构，准备工作：

    $ echo "%_topdir %(echo $HOME)/rpmbuild" >> ~/.rpmmacros
    $ mkdir -p ~/rpmbuild/{BUILD,RPMS,S{OURCE,PEC,RPM}S}

你也需要特定的一些工具

    # yum install rpm-build rpmdevtools

<!-- more -->

目录结构

    $ tree ~/rpmbuild
    /home/havanna/rpmbuild
    ├── BUILD
    ├── BUILDROOT
    ├── RPMS
    ├── SOURCES
    ├── SPECS
    └── SRPMS

打包 rpm 的核心就是 spec 文件，可以通过模板操作

    $ rpmdev-newspec shadowsocks-libev

也可以通过其他工具来书写。

spec 文件中变量，可以通过 `rpmbuild --showrc` 来查看，譬如判断系统版本

    $ rpmbuild --showrc | grep centos
    -14: centos         7
    -14: centos_ver     7
    -14: dist           .el7.centos

小技巧

| |install|upgrade|uninstall|
|:---:|:---:|:---:|:---:|
|%pre|$1 == 1|$1 == 2|(N/A)|
|%post|$1 == 1|$1 == 2|(N/A)|
|%preun|(N/A)|$1 == 1|$1 == 0|
|%postun|(N/A)|$1 == 1|$1 == 0|

#### 二、打包

- **GitHub**: [https://github.com/iHavee/rpm-spec](https://github.com/iHavee/rpm-spec)

随后执行打包操作

    $ rpmbuild -bb shadowsocks-libev.spec

打源码包

    $ spectool -R -g shadowsocks-libev.spec
    $ rpmbuild -bs shadowsocks-libev.spec

具体用法可以 `rpmbuild --help` 查看。

通过 rpm 源码包制作两进制包

    $ rpmbuild --rebuild /path/shadowsocks-libev-1.6.1-1.el7.centos.src.rpm

#### 三、安装

鄙人通过 [fedora copr](https://copr.fedorainfracloud.org) 来自动打包，地址：<https://copr.fedorainfracloud.org/coprs/registe/shadowsocks/>

个别包依赖 epel-release

    # yum install epel-release
    # yum install yum-plugin-copr
    # yum copr enable giste/shadowsocks
    # yum install shadowsocks-libev simple-obfs

参考：

- [https://fedoraproject.org/wiki/Archive:BuildingPackagesGuide?rd=Docs/Drafts/BuildingPackagesGuide](https://fedoraproject.org/wiki/Archive:BuildingPackagesGuide?rd=Docs/Drafts/BuildingPackagesGuide)
