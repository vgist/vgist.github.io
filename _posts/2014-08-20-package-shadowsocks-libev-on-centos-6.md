---
layout: post
title: "CentOS 6 下打包 shadowsocks-libev"
description: "什么要打 rpm 包，因为不打包就要自己去编译，特讨厌在 CentOS 上 blablabla... 的一篇又一篇自编译教程，一点都不环保，一点都不利于扩散。"
keywords: "centos, shadowsocks, libev, rpm, 打包"
category: Linux
tags: [Packager, Shadowsocks]
---

为什么要打 rpm 包，因为不打包就要自己去编译，特讨厌在 CentOS 上 blablabla... 的一篇又一篇自编译教程，一点都不环保，而且一点都不利于扩散嘛。

rpm 打包需要特定的目录结构，准备工作：

    # echo "%_topdir %(echo $HOME)/rpmbuild" >> ~/.rpmmacros
    # mkdir -p ~/rpmbuild/{BUILD,RPMS,S{OURCE,PEC,RPM}S}
    # cd ~/rpmbuild/SPEC
    # touch shadowsocks-libev.spec

打包 rpm 的核心就是 spec 文件，可以通过模板操作，可以通过其他工具来书写。给出 `shadowsocks-libev.spec`

<!-- more -->
```spec
Name:       shadowsocks-libev
Version:	1.4.6
Release:	1%{?dist}
License:	GPL-3
Summary:	a lightweight secured scoks5 proxy for embedded devices and low end boxes.
Url:		https://github.com/madeye/shadowsocks-libev
Group:		Applications/Internet
Source0:	https://github.com/madeye/%{name}/archive/v%{version}.tar.gz#/%{name}-%{version}.tar.gz
Source1:	%{name}.json
Source2:	%{name}
Packager:	Havanna <registerdedicated(at)gmail.com>
BuildRequires:	autoconf libtool gcc openssl-devel
BuildRoot: 	%(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXX)

%description
shadowsocks-libev is a lightweight secured scoks5 proxy for embedded devices and low end boxes.

%prep
%setup -q

%build
%configure --prefix=%{_prefix}
make %{?_smp_mflags}

%install
rm -rf %{buildroot}
make DESTDIR=%{buildroot} install

install -d %{buildroot}%{_sysconfdir}
install -m 644 %{SOURCE1} %{buildroot}/%{_sysconfdir}

install -d %{buildroot}%{_initddir}
install -m 644 %{SOURCE2} %{buildroot}/%{_initddir}

%files
%defattr(-,root,root)
%doc Changes README.md COPYING LICENSE
%config %{_sysconfdir}/shadowsocks-libev.json
%config %{_initddir}/shadowsocks-libev
%{_bindir}/ss-local
%{_bindir}/ss-redir
%{_bindir}/ss-server
%{_bindir}/ss-tunnel
%{_mandir}/man8/shadowsocks.8.gz

%changelog
```

具体的可以下载下面的 rpm 源码包看

[shadowsocks-libev-1.4.6-1.e16.src.rpm]({{ site.qiniudn }}/shadowsocks-libev-1.4.6-1.el6.src.rpm)

或者重新通过 rpm 源码包来打包

    # rpmbuild --rebuild /path/shadowsocks-libev-1.4.6-1.el6.src.rpm


参考：

- [https://fedoraproject.org/wiki/Archive:BuildingPackagesGuide?rd=Docs/Drafts/BuildingPackagesGuide](https://fedoraproject.org/wiki/Archive:BuildingPackagesGuide?rd=Docs/Drafts/BuildingPackagesGuide)
