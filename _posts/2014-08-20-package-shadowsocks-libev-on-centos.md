---
layout: post
title: "CentOS 下打包 shadowsocks-libev"
description: "什么要打 rpm 包，因为不打包就要自己去编译，特讨厌在 CentOS 上 blablabla... 的一篇又一篇自编译教程，一点都不环保，一点都不利于扩散。"
keywords: "centos, shadowsocks, libev, rpm, 打包"
category: Linux
tags: [Packager, Shadowsocks]
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

```
$ tree ~/rpmbuild
/home/havanna/rpmbuild
├── BUILD
├── BUILDROOT
├── RPMS
├── SOURCES
├── SPECS
└── SRPMS
```

打包 rpm 的核心就是 spec 文件，可以通过模板操作

    $ rpmdev-newspec shadowsocks-libev

也可以通过其他工具来书写。给出 **shadowsocks-libev.spec** 文件

```spec
%global commit d37f8d302532a8d442233d9b752324ffff99bbd0
%global shortcommit %(c=%{commit}; echo ${c:0:7})

Name:		shadowsocks-libev
Version:	1.4.7
Release:	1%{?dist}
License:	GPL-3
Summary:	a lightweight secured scoks5 proxy for embedded devices and low end boxes.
Url:		https://github.com/madeye/%{name}
Group:		Applications/Internet
Source0:	%{url}/archive/%{commit}/%{name}-%{version}-%{shortcommit}.tar.gz
Source1:	%{name}.json
Source2:	ss-local.service
Source3:	ss-server.service
Source4:	%{name}
Packager:	Havanna <registerdedicated(at)gmail.com>
BuildRequires:	autoconf libtool gcc openssl-devel
BuildRoot: 	%(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXX)

%description
shadowsocks-libev is a lightweight secured scoks5 proxy for embedded devices and low end boxes.

%prep
%setup -qn %{name}-%{commit}

%build
export CFLAGS="-O2"
%configure --prefix=%{_prefix}
make %{?_smp_mflags}

%install
rm -rf %{buildroot}
make DESTDIR=%{buildroot} install

install -d %{buildroot}%{_sysconfdir}
install -m 0644 %{SOURCE1} %{buildroot}%{_sysconfdir}

%if 0%{?rhel} >= 7
	install -d %{buildroot}%{_unitdir}
	install -m 0644 %{SOURCE2} %{buildroot}%{_unitdir}
	install -m 0644 %{SOURCE3} %{buildroot}%{_unitdir}
%endif

%if 0%{?rhel} == 6
	install -d %{buildroot}%{_initddir}
	install -m 0755 %{SOURCE4} %{buildroot}%{_initddir}
%endif

%if 0%{?rhel} < 7
%post
/sbin/chkconfig --add %{name}
%preun
if [ $1 = 0 ]; then
	/sbin/service %{name} stop
	/sbin/chkconfig --del %{name}
fi
%endif

%files
%defattr(-,root,root)
%doc Changes README.md COPYING LICENSE
%config %{_sysconfdir}

%{_bindir}
%{_mandir}

%if 0%{?rhel} >= 7
	%config %{_unitdir}
%endif

%if 0%{?rhel} == 6
	%config %{_initddir}
%endif

%changelog
```

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

- **rpm 源码包**：[shadowsocks-libev-1.4.7-1.el7.centos.src.rpm]({{ site.qiniudn }}/images/2014/08/shadowsocks-libev-1.4.7-1.el7.centos.src.rpm)
- **GitHub**: [https://github.com/Ihavee/ihavee-rpm](https://github.com/Ihavee/ihavee-rpm)

rpm 源码包适用于 CentOS 7，如果是 6.5 版本，请通过 spec 文件打包。

##### 打包法一

具体的下载上面的 rpm 源码包，可以通过以下命令解压来查看

    $ rpm2cpio ./shadowsocks-libev-1.4.6-1.el7.centos.src.rpm | cpio -div
    shadowsocks-libev
    shadowsocks-libev-1.4.7-d37f8d3.tar.gz
    shadowsocks-libev.json
    shadowsocks-libev.spec
    ss-local.service
    ss-server.service
    1894 blocks

将下面三个文件放入文件夹 `~/rpmbuild/SOURCES`

- `ss-local.service`
- `ss-server.service`
- `shadowsocks-libev`
- `shadowsocks-libev.json`
- `shadowsocks-libev-1.4.7-d37f8d3.tar.gz`

安装一些必要的依赖

    # yum install autoconf libtool gcc openssl-devel

注意：CentOS 6.5 之前的版本，自己编译个新版本的 GCC 吧。

随后执行打包操作

    $ rpmbuild -bb shadowsocks-libev.spec

具体用法可以 `rpmbuild --help` 查看。

若版本号变更，修改 spec 文件的版本号以及 commit 后，通过 spectool 重下源码

    $ spectool -R -g shadowsocks-libev.spec

##### 打包法二

直接通过 rpm 源码包来制作两进制包

    $ rpmbuild --rebuild /path/shadowsocks-libev-1.4.7-1.el7.centos.src.rpm

#### 三、安装

然后直接安装两进制包

    # rpm -ivh /path/shadowsocks-libev-1.4.7-1.el7.centos.x86_64.rpm
    or
    # yum install /path/shadowsocks-libev-1.4.7-1.el7.centos.x86_64.rpm

参考：

- [https://fedoraproject.org/wiki/Archive:BuildingPackagesGuide?rd=Docs/Drafts/BuildingPackagesGuide](https://fedoraproject.org/wiki/Archive:BuildingPackagesGuide?rd=Docs/Drafts/BuildingPackagesGuide)
